import { useEffect, useMemo, useRef, useState } from 'react'
import { Users, RefreshCw, Plus, Download } from 'lucide-react'
import { toast } from 'sonner'
import usePermission from '@shared/hooks/usePermission'
import Button from '@shared/components/Button'
import Modal from '@shared/components/Modal'
import HRPage from './HRPage'
import HRDataTable from './HRDataTable'
import { HRSection } from './hrPrimitives'
import HrApiForm from './HrApiForm'
import { fieldLabel, optionsFor } from '../services/hrFormOptions'
import { HrRecord, HrSummary, HrAnalytics } from './HrApiData'
import { HR_API_MODULES } from '../constants/hrApiModules'
import { HR_API_CONTRACT } from '../services/hrApiContract'
import { hrRequest, hrModuleApi, hrList, hrField, hrText, hrError, downloadHrFile } from '../services/hrApi'

const aliases = { fullName: ['employeeName', 'studentName', 'name'], employeeName: ['fullName', 'name', 'employee'], departmentName: ['department'], date: ['attendanceDate'], checkIn: ['checkInTime'], checkOut: ['checkOutTime'] }
const filterOptions = { DepartmentId: 'departmentId', Role: 'role', Status: 'status', LeaveType: 'leaveType', Audience: 'audience', Category: 'category', FileType: 'fileTypes', UploadedBy: 'uploaders', PerformanceFilter: 'performanceFilters' }

export default function HrApiModule({ module }) {
  const config = HR_API_MODULES[module]
  const api = useMemo(() => hrModuleApi(module), [module])
  const permissions = usePermission()
  const allowed = permissions.hasPermission(module)
  const can = action => allowed && permissions.can(module, action)
  const canReviewLeave = can('approve') || can('edit')
  const [query, setQuery] = useState({})
  const [page, setPage] = useState(1)
  const [revision, setRevision] = useState(0)
  const [state, setState] = useState({ loading: true, rows: [], extras: {}, options: {} })
  const [dialog, setDialog] = useState(null)
  const [busy, setBusy] = useState(false)
  const [employeeId, setEmployeeId] = useState('')
  const [historyDates, setHistoryDates] = useState({ startDate: '', endDate: '' })
  const actionLock = useRef(false)
  const detailController = useRef(null)
  useEffect(() => () => detailController.current?.abort(), [])
  const definition = HR_API_CONTRACT[`GET ${api.path}`]
  const pageKey = definition.params.some(p => p.name === 'PageNumber') ? 'PageNumber' : 'Page'
  const sizeKey = pageKey === 'PageNumber' ? 'PageSize' : 'Limit'
  const params = useMemo(() => ({ ...query, [pageKey]: page, [sizeKey]: 10 }), [query, page, pageKey, sizeKey])
  const paramsKey = JSON.stringify(params)
  useEffect(() => {
    if (!allowed || permissions.isLoading) return
    const controller = new AbortController()
    const signal = controller.signal
    const currentParams = JSON.parse(paramsKey)
    const load = async () => {
      setState(current => ({ ...current, loading: true, error: null }))
      const jobs = [
        ['list', () => api.list(currentParams, signal)],
        ...(module !== 'departments' ? [['summary', () => api.summary(signal)]] : []),
        ...Object.entries(config.extras ?? {}).map(([name, suffix]) => [name, () => hrRequest('GET', suffix.startsWith('/') ? suffix : `${api.path}/${suffix}`, { signal, params: { ...currentParams, fromDate: currentParams.FromDate, toDate: currentParams.ToDate, date: currentParams.Date } })]),
        ...Object.entries(config.options ?? {}).map(([name, path]) => [`option:${name}`, () => hrRequest('GET', path, { signal })]),
      ]
      const results = await Promise.allSettled(jobs.map(([, request]) => request()))
      if (signal.aborted) return
      const next = { loading: false, rows: [], extras: {}, options: {}, summary: null }
      results.forEach((result, index) => {
        const key = jobs[index][0]
        const error = result.status === 'rejected' ? hrError(result.reason, module) : null
        if (key === 'list') { next.rows = hrList(result.value); next.raw = result.value; next.error = error }
        else if (key === 'summary') { next.summary = result.value; next.summaryError = error }
        else if (key.startsWith('option:')) {
          if (error) next.extras[key] = { error }
          else if (key === 'option:options' || key === 'option:filters') Object.assign(next.options, result.value)
          else next.options[key.slice(7)] = result.value
        } else next.extras[key] = { value: result.value, error }
      })
      setState(next)
    }
    // Debounce backend search and cancel obsolete pages/filters.
    const timer = setTimeout(load, 250)
    return () => { clearTimeout(timer); controller.abort() }
  }, [allowed, permissions.isLoading, module, api, config, paramsKey, revision])
  const refresh = () => setRevision(value => value + 1)
  const action = async (request, success) => {
    if (actionLock.current) return
    actionLock.current = true
    setBusy(true)
    try { await request(); if (success) toast.success(success) }
    catch (error) { toast.error(hrError(error, module)) }
    finally { actionLock.current = false; setBusy(false) }
  }
  const recordId = row => hrField(row, api.idKey, 'id')
  const showDetail = (row, edit = false) => action(async () => {
    detailController.current?.abort()
    detailController.current = new AbortController()
    const value = await api.get(recordId(row), detailController.current.signal)
    setDialog({ kind: edit ? 'edit' : 'view', value, id: recordId(row) })
  })
  const mutate = async (request) => { await request(); setDialog(null); refresh(); toast.success('Changes saved.') }
  const history = (id, kind = module) => action(async () => {
    const path = kind === 'balance' ? '/api/hr/leave/balance/{employeeId}' : kind === 'enrollments' ? '/api/students/{studentId}/enrollments' : `/api/hr/${kind}/employee/{employeeId}`
    const value = await hrRequest('GET', path, { id, params: historyDates })
    setDialog({ kind: 'view', title: kind === 'balance' ? 'Leave balance' : `${fieldLabel(kind)} history`, value })
  })
  const columns = config.columns.map(key => ({ accessor: key, header: fieldLabel(key), render: row => {
    const value = hrField(row, key, ...(aliases[key] ?? []))
    if (key === 'fullName' && value == null) return [row.firstName, row.lastName].filter(Boolean).join(' ') || 'Not supplied'
    return hrText(value)
  } }))
  if (module !== 'departments') columns.push({ accessor: '_actions', header: 'Actions', render: row => {
    const id = recordId(row)
    if (id == null) return <span className="text-xs text-slate-500">Record ID unavailable</span>
    return <div className="flex flex-wrap gap-2" onClick={event => event.stopPropagation()}>
      <Button size="xs" variant="secondary" disabled={busy} onClick={() => showDetail(row)}>Details</Button>
      {can('edit') && HR_API_CONTRACT[`PUT ${api.detail}`] && <Button size="xs" variant="secondary" disabled={busy} onClick={() => showDetail(row, true)}>Edit</Button>}
      {can('delete') && HR_API_CONTRACT[`DELETE ${api.detail}`] && <Button size="xs" variant="secondary" disabled={busy} onClick={() => setDialog({ kind: 'delete', id })}>Delete</Button>}
      {can('edit') && ['employees', 'students'].includes(module) && <Button size="xs" variant="secondary" disabled={busy} onClick={() => setDialog({ kind: 'status', id, value: row })}>Change status</Button>}
      {module === 'leave' && canReviewLeave && ['pending', 'pending approval', 'submitted', 'awaiting approval'].includes(String(hrField(row, 'status') ?? '').toLowerCase().trim()) && <><Button size="xs" disabled={busy} onClick={() => setDialog({ kind: 'approve', id, employee: hrText(hrField(row, 'employeeName', 'fullName', 'name')) })}>Approve</Button><Button size="xs" variant="secondary" disabled={busy} onClick={() => setDialog({ kind: 'reject', id, employee: hrText(hrField(row, 'employeeName', 'fullName', 'name')) })}>Reject</Button></>}
      {['attendance', 'leave', 'performance'].includes(module) && row.employeeId != null && <Button size="xs" variant="secondary" disabled={busy} onClick={() => history(row.employeeId)}>History</Button>}
      {module === 'leave' && row.employeeId != null && <Button size="xs" variant="secondary" disabled={busy} onClick={() => history(row.employeeId, 'balance')}>Balance</Button>}
      {module === 'students' && <Button size="xs" variant="secondary" disabled={busy} onClick={() => history(id, 'enrollments')}>Enrollments</Button>}
      {module === 'resources' && <><Button size="xs" variant="secondary" disabled={busy} onClick={() => action(async () => {
        const response = await hrRequest('GET', `${api.detail}/preview`, { id, binary: true })
        const type = response.data.type?.split(';')[0]
        if (!['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'text/plain'].includes(type)) { downloadHrFile(response, row.name); return }
        setDialog({ kind: 'preview', blob: response.data })
      })}>Preview</Button><Button size="xs" variant="secondary" disabled={busy} onClick={() => action(async () => downloadHrFile(await hrRequest('GET', `${api.detail}/download`, { id, binary: true }), row.name))}>Download</Button></>}
    </div>
  } })
  if (permissions.isLoading) return <p role="status">Loading permissions...</p>
  if (!allowed) return <p role="alert">{permissions.error ? hrError(permissions.error) : 'You do not have permission to access this module.'}</p>
  const createOperation = `POST ${api.path}${module === 'attendance' ? '/mark' : ''}`
  const totalPages = hrField(state.raw, 'totalPages') ?? (hrField(state.raw, 'totalCount', 'totalRecords') != null ? Math.ceil(hrField(state.raw, 'totalCount', 'totalRecords') / 10) : null)
  return <HRPage moduleId={module} title={config.title} icon={Users} actions={<>
    <Button variant="secondary" icon={RefreshCw} disabled={state.loading || busy} onClick={refresh}>Refresh</Button>
    {HR_API_CONTRACT[`GET ${api.path}/export`] && <Button variant="secondary" icon={Download} disabled={state.loading || busy} onClick={() => action(async () => downloadHrFile(await api.export(params), `${module}.csv`))}>Export</Button>}
    {can('add') && HR_API_CONTRACT[createOperation] && <Button icon={Plus} disabled={busy} onClick={() => setDialog({ kind: 'create' })}>{module === 'attendance' ? 'Mark attendance' : `Add ${config.singular}`}</Button>}
  </>}>
    <div className="space-y-4">
      {module === 'leave' && <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="font-semibold text-[#133b5d]">Employee leave requests</h2>
        <p className="mt-1 text-sm text-slate-600">Review the employee, dates and reason below. {canReviewLeave ? 'Use Approve or Reject on a pending request. The list and totals refresh after saving.' : 'You have view access. An account with leave approval permission must approve or reject requests.'}</p>
        <div className="mt-3 flex gap-2"><Button variant={query.Status === 'Pending' ? 'primary' : 'secondary'} onClick={() => { setPage(1); setQuery(q => ({ ...q, Status: 'Pending' })) }}>Pending requests</Button><Button variant={!query.Status ? 'primary' : 'secondary'} onClick={() => { setPage(1); setQuery(q => ({ ...q, Status: '' })) }}>All requests</Button></div>
      </section>}
      {state.summaryError ? <p role="alert">{state.summaryError}</p> : !state.loading && module !== 'departments' && <HrSummary value={state.summary} />}
      <div className="flex flex-wrap gap-3">{definition.params.filter(p => !['Page', 'Limit', 'PageNumber', 'PageSize', 'SortBy', 'SortOrder', 'Descending'].includes(p.name)).map(param => {
        const key = filterOptions[param.name]
        const choices = key ? optionsFor(key, state.options) : []
        return <label key={param.name} className="text-xs text-slate-500">{fieldLabel(param.name)}{choices.length ? <select aria-label={fieldLabel(param.name)} className="block rounded-lg border border-slate-200 bg-white p-2 text-sm text-slate-900" value={query[param.name] ?? ''} onChange={e => { setPage(1); setQuery(q => ({ ...q, [param.name]: e.target.value })) }}><option value="">All</option>{choices.map(item => <option key={item.value} value={item.value}>{item.label ?? item.value}</option>)}</select> : <input aria-label={fieldLabel(param.name)} className="block max-w-44 rounded-lg border border-slate-200 bg-white p-2 text-sm text-slate-900" type={param.format?.startsWith('date') ? 'date' : param.type === 'integer' ? 'number' : 'search'} value={query[param.name] ?? ''} onChange={e => { setPage(1); setQuery(q => ({ ...q, [param.name]: e.target.value })) }} />}</label>
      })}</div>
      {['attendance', 'leave', 'performance'].includes(module) && <div className="flex flex-wrap items-end gap-2"><label className="text-xs">Employee ID<input aria-label="Employee history ID" className="block rounded-lg border p-2" value={employeeId} onChange={e => setEmployeeId(e.target.value)} /></label>{module === 'attendance' && ['startDate', 'endDate'].map(key => <label key={key} className="text-xs">{fieldLabel(key)}<input type="date" className="block rounded-lg border p-2" value={historyDates[key]} onChange={e => setHistoryDates(d => ({ ...d, [key]: e.target.value }))} /></label>)}<Button variant="secondary" disabled={!employeeId || busy} onClick={() => history(employeeId)}>Employee history</Button>{module === 'leave' && <Button variant="secondary" disabled={!employeeId || busy} onClick={() => history(employeeId, 'balance')}>Leave balance</Button>}</div>}
      {state.error ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">{state.error}</p> : <HRDataTable columns={columns} data={state.rows} pageSize={10} searchable={false} exportable={false} loading={state.loading} emptyTitle={`No ${module} records available.`} />}
      {definition.params.some(p => p.name === pageKey) && <div className="flex items-center justify-end gap-3"><Button variant="secondary" disabled={page <= 1 || state.loading} onClick={() => setPage(value => value - 1)}>Previous</Button><span className="text-sm">Page {page}{totalPages != null ? ` of ${Math.max(1, totalPages)}` : ''}</span><Button variant="secondary" disabled={state.loading || Boolean(state.error) || (totalPages != null ? page >= totalPages : state.rows.length < 10)} onClick={() => setPage(value => value + 1)}>Next</Button></div>}
      <div className="grid gap-4 lg:grid-cols-2">{Object.entries(state.extras).map(([name, result]) => <HRSection key={name} title={name.replace('option:', '')}>{result.error ? <p role="alert">{result.error}</p> : <HrAnalytics value={result.value} />}</HRSection>)}</div>
    </div>
    {dialog?.kind === 'view' && <Modal open size="lg" title={dialog.title ?? `${config.singular} details`} onClose={() => setDialog(null)}><HrRecord value={dialog.value} /></Modal>}
    {dialog?.kind === 'preview' && <HrPreview blob={dialog.blob} onClose={() => setDialog(null)} />}
    {['create', 'edit', 'status', 'reject'].includes(dialog?.kind) && <HrApiForm key={`${dialog.kind}-${dialog.id ?? 'new'}`} title={dialog.kind === 'create' ? `Add ${config.singular}` : `${fieldLabel(dialog.kind)} ${config.singular}`} values={dialog.value} options={state.options} operation={dialog.kind === 'create' ? createOperation : dialog.kind === 'edit' ? `PUT ${api.detail}` : dialog.kind === 'status' ? `PATCH ${api.detail}/status` : `PUT ${api.detail}/reject`} onClose={() => setDialog(null)} onSave={data => mutate(() => dialog.kind === 'create' ? api.create(data) : dialog.kind === 'edit' ? api.update(dialog.id, data) : dialog.kind === 'status' ? api.status(dialog.id, data.status) : hrRequest('PUT', `${api.detail}/reject`, { id: dialog.id, data }))} />}
    {['delete', 'approve'].includes(dialog?.kind) && <Modal open title={`${fieldLabel(dialog.kind)} ${config.singular}`} onClose={() => { if (!busy) setDialog(null) }}><p className="mb-4">{dialog.kind === 'delete' ? 'Delete this record? This action cannot be undone.' : `Approve leave request #${dialog.id} for ${dialog.employee}?`}</p><Button variant="secondary" disabled={busy} onClick={() => setDialog(null)}>Cancel</Button><Button disabled={busy} onClick={() => action(() => mutate(() => dialog.kind === 'delete' ? api.remove(dialog.id) : hrRequest('PUT', `${api.detail}/approve`, { id: dialog.id })))}>{busy ? 'Saving...' : 'Confirm'}</Button></Modal>}
  </HRPage>
}

function HrPreview({ blob, onClose }) {
  const frame = useRef(null)
  useEffect(() => { const objectUrl = URL.createObjectURL(blob); if (frame.current) frame.current.src = objectUrl; return () => URL.revokeObjectURL(objectUrl) }, [blob])
  return <Modal open title="Resource preview" size="xl" onClose={onClose}><iframe ref={frame} sandbox="" title="Resource preview" className="h-[65vh] w-full" /></Modal>
}
