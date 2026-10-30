import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, CheckCircle2, ClipboardCheck, Clock3, RefreshCw, Wallet, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import usePermission from '@shared/hooks/usePermission'
import Modal from '@shared/components/Modal'
import HRPage from '../components/HRPage'
import HrApiForm from '../components/HrApiForm'
import { HrRecord } from '../components/HrApiData'
import { HrBreadcrumb, HrKpis } from '../components/portal/HrPortalKit'
import { ActionButton, Avatar, EmptyState, FilterCard, FilterField, LiveTable, Pager, RowMenu, StatusPill, StatusTabs } from '../components/portal/HrLiveKit'
import { formatDay } from '../components/portal/hrLiveUtils'
import { hrError, hrField, hrModuleApi, hrRequest } from '../services/hrApi'
import { loadEmployeeLeaveProfile, employeeLeaveSummary, filterEmployeeLeaves, leaveId, pendingLeave } from '../services/hrEmployeeLeaveData'

const filters = { search: '', type: '', status: '', from: '', to: '' }
const text = value => value == null || value === '' ? '—' : String(value)
const initial = { loading: true, rows: [], employee: null, balance: null }
export default function EmployeeLeaveDetails() {
  const { employeeId } = useParams()
  return <EmployeeLeaveContent key={employeeId} employeeId={employeeId} />
}

function EmployeeLeaveContent({ employeeId }) {
  const permissions = usePermission()
  const allowed = permissions.hasPermission('leave')
  const readEmployee = permissions.hasPermission('employees')
  const canReview = allowed && (permissions.can('leave', 'approve') || permissions.can('leave', 'edit'))
  const [state, setState] = useState(initial)
  const [revision, setRevision] = useState(0)
  const [draft, setDraft] = useState(filters)
  const [applied, setApplied] = useState(filters)
  const [page, setPage] = useState(1)
  const [dialog, setDialog] = useState(null)
  const [busy, setBusy] = useState(false)
  const actionLock = useRef(false)
  const mounted = useRef(true)
  const detailController = useRef(null)
  const [unavailableBalances] = useState(() => new Set())
  const [resolvedBalanceIds] = useState(() => new Map())
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; detailController.current?.abort() } }, [])

  useEffect(() => {
    if (permissions.isLoading || !allowed) return undefined
    const controller = new AbortController()
    const signal = controller.signal
    const load = async () => {
      setState({ ...initial })
      const next = await loadEmployeeLeaveProfile(employeeId, { readEmployee, signal, unavailableBalances, resolvedBalanceIds, onReady: value => { if (!signal.aborted) setState(value) } })
      if (!signal.aborted && next) setState(next)
    }
    load()
    return () => controller.abort()
  }, [employeeId, revision, permissions.isLoading, allowed, readEmployee, unavailableBalances, resolvedBalanceIds])

  const summary = employeeLeaveSummary(state.rows)
  const visible = filterEmployeeLeaves(state.rows, applied)
  const totalPages = Math.max(1, Math.ceil(visible.length / 10))
  const currentPage = Math.min(page, totalPages)
  const rows = visible.slice((currentPage - 1) * 10, currentPage * 10)
  const employee = state.employee ?? state.rows[0] ?? {}
  const name = hrField(employee, 'fullName', 'employeeName', 'name') ?? ([hrField(employee, 'firstName'), hrField(employee, 'lastName')].filter(Boolean).join(' ') || `Employee ${employeeId}`)
  const refresh = () => setRevision(value => value + 1)
  const close = () => { if (!busy) { detailController.current?.abort(); setDialog(null) } }
  const readRecord = async row => {
    detailController.current?.abort()
    const controller = new AbortController()
    detailController.current = controller
    setDialog({ kind: 'view', loading: true, row })
    try {
      const value = await hrModuleApi('leave').get(leaveId(row), controller.signal)
      if (hrField(value, 'employeeId') != null && !state.identifiers?.has(String(hrField(value, 'employeeId')))) throw new Error('This leave does not belong to the selected employee.')
      if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Leave details are unavailable.')
      if (!controller.signal.aborted) setDialog({ kind: 'view', value, row })
    } catch (error) { if (!controller.signal.aborted) setDialog({ kind: 'view', row, error: error.response ? hrError(error, 'leave') : error.message }) }
  }
  const review = async (kind, row, data) => {
    if (!canReview || actionLock.current) return
    actionLock.current = true; setBusy(true)
    try {
      await hrRequest('PUT', `/api/hr/leave/{leaveId}/${kind}`, { id: leaveId(row), ...(kind === 'reject' ? { data } : {}) })
      if (mounted.current) { setDialog(null); refresh(); toast.success(kind === 'approve' ? 'Leave approved.' : 'Leave rejected.') }
    } catch (error) {
      if (mounted.current) toast.error(hrError(error, 'leave'))
      throw error
    } finally { actionLock.current = false; if (mounted.current) setBusy(false) }
  }
  const apply = value => { setDraft(value); setApplied(value); setPage(1) }
  const columns = [
    ['leaveType', 'Leave Type'], ['fromDate', 'From Date'], ['toDate', 'To Date'], ['days', 'Days'],
    ['reason', 'Reason'], ['status', 'Status'], ['requestedDate', 'Requested Date'],
  ].map(([key, header]) => ({ key, header, render: row => key === 'status' ? <StatusPill value={hrField(row, key)} variant="icon" />
    : key === 'days' ? text(hrField(row, 'days', 'totalDays', 'numberOfDays'))
    : key === 'requestedDate' ? text(formatDay(hrField(row, 'requestedDate', 'requestedAt', 'createdAt')))
    : key === 'fromDate' || key === 'toDate' ? text(formatDay(hrField(row, key))) : text(hrField(row, key)) }))
  const rowActions = row => <>
    <ActionButton disabled={busy || leaveId(row) == null} onClick={() => readRecord(row)}>View</ActionButton>
    {pendingLeave(row) && canReview ? <>
      <ActionButton disabled={busy || leaveId(row) == null} onClick={() => setDialog({ kind: 'approve', row })}>Approve</ActionButton>
      <ActionButton tone="red" disabled={busy || leaveId(row) == null} onClick={() => setDialog({ kind: 'reject', row })}>Reject</ActionButton>
      <RowMenu items={[{ label: 'Employee history', onClick: () => apply(filters), disabled: busy }, { label: 'Leave balance', onClick: () => setDialog({ kind: 'balance' }), disabled: busy }]} />
    </> : <><ActionButton onClick={() => apply(filters)}>History</ActionButton><ActionButton onClick={() => setDialog({ kind: 'balance' })}>Balance</ActionButton></>}
  </>

  if (permissions.isLoading) return <p role="status">Checking leave access...</p>
  if (!allowed) return <p role="alert">You do not have permission to view employee leave details.</p>
  return <HRPage moduleId="leave" title="Employee Leave Details" icon={ClipboardCheck} hero={<HrBreadcrumb items={[{ label: 'Leave Management', to: '/employee/hr-leave' }, { label: name }, { label: 'Leave Details' }]} />}>
    <div className="hrl-content space-y-4">
      <Link to="/employee/hr-leave" className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-[#133B5D] focus-visible:outline-2 focus-visible:outline-blue-600"><ArrowLeft size={16} />Back to Leave Management</Link>
      <section className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#dfe7f1] bg-white p-5 text-[#133B5D] shadow-sm">
        <Avatar name={name} size={52} profileType="employee" profileId={state.backendEmployeeId ?? employeeId} />
        <div className="min-w-0 flex-1"><h2 className="break-words text-xl font-bold">{state.loading ? 'Loading employee profile...' : name}</h2><p className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500"><span>Employee ID: {state.backendEmployeeId ?? employeeId}</span>{state.displayCode != null && <span>Employee Code: {state.displayCode}</span>}<span>Role: {text(hrField(employee, 'role', 'roleName'))}</span><span className="break-all">Email: {text(hrField(employee, 'email', 'employeeEmail'))}</span></p></div>
        <ActionButton disabled={state.loading || busy} icon={RefreshCw} onClick={refresh}>Refresh</ActionButton>
      </section>
      {state.employeeError && <p className="text-sm text-slate-500">Employee profile: {state.employeeError}</p>}
      <HrKpis columns={5} items={[
        ['total', 'Total Leave Requests', ClipboardCheck, 'blue'], ['approved', 'Approved', CheckCircle2, 'green'], ['pending', 'Pending', Clock3, 'orange'], ['rejected', 'Rejected', XCircle, 'red'], ['days', 'Total Leave Days', CalendarDays, 'purple'],
      ].map(([key, label, icon, tone]) => ({ key, label, icon, tone, value: state.loading || state.historyError ? '—' : summary[key] }))} />
      <FilterCard search={{ value: draft.search, onChange: search => setDraft(value => ({ ...value, search })), placeholder: 'Search leave type, reason or status...' }} onReset={() => apply(filters)} onSearch={() => apply(draft)}>
        <FilterField label="Leave Type"><select value={draft.type} onChange={event => setDraft(value => ({ ...value, type: event.target.value }))}><option value="">All</option>{[...new Set(state.rows.map(row => hrField(row, 'leaveType')).filter(Boolean))].map(type => <option key={type}>{type}</option>)}</select></FilterField>
        <FilterField label="Status"><select value={draft.status} onChange={event => setDraft(value => ({ ...value, status: event.target.value }))}><option value="">All</option>{['pending', 'approved', 'rejected'].map(status => <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>)}</select></FilterField>
        <FilterField label="From Date"><input type="date" value={draft.from} onChange={event => setDraft(value => ({ ...value, from: event.target.value }))} /></FilterField>
        <FilterField label="To Date"><input type="date" min={draft.from || undefined} value={draft.to} onChange={event => setDraft(value => ({ ...value, to: event.target.value }))} /></FilterField>
      </FilterCard>
      <StatusTabs value={applied.status} onChange={status => apply({ ...applied, status })} tabs={[
        { value: '', label: 'All', count: state.loading || state.historyError ? null : summary.total },
        ...['pending', 'approved', 'rejected'].map(status => ({ value: status, label: status.charAt(0).toUpperCase() + status.slice(1), count: state.loading || state.historyError ? null : summary[status] })),
      ]} />
      {state.historyError ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{state.historyError}<ActionButton onClick={refresh}>Retry</ActionButton></div> : <LiveTable columns={columns} rows={rows} rowKey={row => leaveId(row)} loading={state.loading} actions={rowActions} empty={<EmptyState title="No leave requests" description={state.rows.length ? 'No requests match these filters.' : 'No leave requests are available for this employee.'} />} footer={!state.loading && <Pager page={currentPage} totalPages={totalPages} totalCount={visible.length} shown={rows.length} label="requests" onPage={setPage} />} />}
      <section className="rounded-2xl border border-[#dfe7f1] bg-white p-4"><h2 className="mb-3 flex items-center gap-2 font-bold text-[#133B5D]"><Wallet size={18} />Leave Balance</h2><Balance state={state} retry={refresh} /></section>
    </div>
    {dialog?.kind === 'view' && <Modal open title="Leave details" onClose={close}>{dialog.loading ? <p role="status">Loading leave details...</p> : dialog.error ? <div role="alert">{dialog.error}<ActionButton onClick={() => readRecord(dialog.row)}>Retry</ActionButton></div> : <HrRecord value={dialog.value} />}</Modal>}
    {dialog?.kind === 'balance' && <Modal open title="Leave balance" onClose={close}><Balance state={state} retry={refresh} /></Modal>}
    {dialog?.kind === 'approve' && <Modal open title="Approve Leave" onClose={close}><p className="mb-4">Approve this leave request for {name}?</p><ActionButton disabled={busy} onClick={close}>Cancel</ActionButton><ActionButton disabled={busy} onClick={() => { review('approve', dialog.row).catch(() => {}) }}>{busy ? 'Saving...' : 'Confirm'}</ActionButton></Modal>}
    {dialog?.kind === 'reject' && <HrApiForm title="Reject Leave" operation="PUT /api/hr/leave/{leaveId}/reject" onClose={close} onSave={data => review('reject', dialog.row, data)} />}
  </HRPage>
}

function Balance({ state, retry }) {
  if (state.loading || state.balanceLoading) return <p role="status">Loading leave balance...</p>
  if (state.balanceUnavailable) return <p className="text-sm text-slate-500">Leave balance information is not available from the current API.</p>
  if (state.balanceError) return <div role="alert">{state.balanceError}<ActionButton onClick={retry}>Retry</ActionButton></div>
  if (state.balance == null || (typeof state.balance === 'object' && !Object.keys(state.balance).length)) return <p className="text-sm text-slate-500">No leave balance information is available.</p>
  return <HrRecord value={state.balance} />
}
