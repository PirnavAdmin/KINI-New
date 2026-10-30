import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarCheck, CalendarDays, Clock3, Home, RefreshCw, UserCheck, UserX } from 'lucide-react'
import { toast } from 'sonner'
import usePermission from '@shared/hooks/usePermission'
import Modal from '@shared/components/Modal'
import HRPage from '../components/HRPage'
import HrApiForm from '../components/HrApiForm'
import { HrRecord } from '../components/HrApiData'
import { HrBreadcrumb, HrKpis } from '../components/portal/HrPortalKit'
import { ActionButton, Avatar, EmptyState, FilterCard, FilterField, LiveTable, Pager, StatusPill } from '../components/portal/HrLiveKit'
import { isoDay } from '../components/portal/hrLiveUtils'
import { hrError, hrField, hrModuleApi } from '../services/hrApi'
import { attendanceId, attendanceStatus, attendanceStatusLabel, attendanceSummary, filterAttendance, loadEmployeeAttendance } from '../services/hrEmployeeAttendanceData'

const blank = { from: '', to: '', status: '' }
const initial = { loading: true, rows: [], employee: null }
const text = value => value == null || value === '' ? '—' : String(value)
export default function EmployeeAttendanceDetails() {
  const { employeeId } = useParams()
  return <AttendanceContent key={employeeId} employeeId={employeeId} />
}
function AttendanceContent({ employeeId }) {
  const permissions = usePermission()
  const allowed = permissions.hasPermission('attendance')
  const readEmployee = permissions.hasPermission('employees')
  const canEdit = allowed && permissions.can('attendance', 'edit')
  const [state, setState] = useState(initial)
  const [revision, setRevision] = useState(0)
  const [draft, setDraft] = useState(blank)
  const [applied, setApplied] = useState(blank)
  const [page, setPage] = useState(1)
  const [dialog, setDialog] = useState(null)
  const controller = useRef(null)
  const mounted = useRef(true)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; controller.current?.abort() } }, [])
  useEffect(() => {
    if (permissions.isLoading || !allowed) return undefined
    const request = new AbortController()
    const load = async () => {
      setState(initial)
      const next = await loadEmployeeAttendance(employeeId, { readEmployee, signal: request.signal })
      if (!request.signal.aborted && next) setState(next)
    }
    load()
    return () => request.abort()
  }, [employeeId, readEmployee, allowed, permissions.isLoading, revision])
  const employee = state.employee ?? state.rows[0] ?? {}
  const name = hrField(employee, 'fullName', 'employeeName', 'name') ?? ([hrField(employee, 'firstName'), hrField(employee, 'lastName')].filter(Boolean).join(' ') || hrField(state.rows[0], 'employeeName') || `Employee ${employeeId}`)
  const summary = attendanceSummary(state.rows)
  const visible = filterAttendance(state.rows, applied)
  const pages = Math.max(1, Math.ceil(visible.length / 10))
  const currentPage = Math.min(page, pages)
  const rows = visible.slice((currentPage - 1) * 10, currentPage * 10)
  const refresh = () => setRevision(value => value + 1)
  const apply = value => {
    if (value.from && value.to && value.to < value.from) { toast.error('To Date cannot be earlier than From Date.'); return }
    setDraft(value); setApplied(value); setPage(1)
  }
  const close = () => { controller.current?.abort(); setDialog(null) }
  const details = async (row, edit = false) => {
    controller.current?.abort()
    const request = new AbortController()
    controller.current = request
    setDialog({ row, edit, loading: true })
    try {
      const value = await hrModuleApi('attendance').get(attendanceId(row), request.signal)
      if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Attendance details are unavailable.')
      const id = hrField(value, 'employeeId')
      if (id != null && !state.identifiers?.has(String(id))) throw new Error('This attendance record belongs to another employee.')
      if (!request.signal.aborted) setDialog({ row, edit, value })
    } catch (error) { if (!request.signal.aborted) setDialog({ row, edit, error: error.response ? hrError(error, 'attendance') : error.message }) }
  }
  const save = async values => {
    if (!canEdit) throw new Error('You do not have permission to edit attendance.')
    await hrModuleApi('attendance').update(attendanceId(dialog.row), values)
    if (mounted.current) { setDialog(null); refresh(); toast.success('Attendance updated.') }
  }
  const columns = [
    { key: 'date', header: 'Date', render: row => text(isoDay(hrField(row, 'date', 'attendanceDate'))) },
    { key: 'checkIn', header: 'Check In', render: row => text(hrField(row, 'checkIn', 'checkInTime')) },
    { key: 'checkOut', header: 'Check Out', render: row => text(hrField(row, 'checkOut', 'checkOutTime')) },
    { key: 'status', header: 'Status', render: row => <StatusPill value={attendanceStatusLabel(attendanceStatus(row))} variant="box" /> },
    { key: 'workingHours', header: 'Working Hours', render: row => text(hrField(row, 'workingHours', 'totalHours', 'hoursWorked')) },
  ]
  if (permissions.isLoading) return <p role="status">Checking attendance access...</p>
  if (!allowed) return <p role="alert">You do not have permission to view employee attendance.</p>
  return <HRPage className="hr-attendance-details-page pl-2 sm:pl-4" moduleId="attendance" title="Employee Attendance Details" icon={CalendarCheck} hero={<HrBreadcrumb items={[{ label: 'Attendance', to: '/employee/hr-attendance' }, { label: name }, { label: 'Attendance Details' }]} />}>
    <div className="space-y-4">
      <Link to="/employee/hr-attendance" className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-[#133B5D] focus-visible:outline-2 focus-visible:outline-blue-600"><ArrowLeft size={16} />Back to Attendance</Link>
      <section className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#dfe7f1] bg-white p-5 text-[#133B5D] shadow-sm">
        <Avatar name={name} size={52} profileType="employee" profileId={state.backendEmployeeId ?? employeeId} /><div className="min-w-0 flex-1"><h2 className="break-words text-xl font-bold">{state.loading ? 'Loading employee profile...' : name}</h2><p className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500"><span>Employee ID: {state.backendEmployeeId ?? employeeId}</span>{state.displayCode != null && <span>Employee Code: {state.displayCode}</span>}<span>Role: {text(hrField(employee, 'role', 'roleName'))}</span><span className="break-all">Email: {text(hrField(employee, 'email', 'employeeEmail'))}</span><span>Employment Type: {text(hrField(employee, 'employmentType', 'employeeType'))}</span></p></div>
        <ActionButton icon={RefreshCw} disabled={state.loading} onClick={refresh}>Refresh</ActionButton>
      </section>
      {state.employeeError && <p className="text-sm text-slate-500">Employee profile: {state.employeeError}</p>}
      <HrKpis columns={6} items={[
        ['total', 'Total Working Days', CalendarDays, 'blue'], ['present', 'Present', UserCheck, 'green'], ['absent', 'Absent', UserX, 'red'], ['late', 'Late', Clock3, 'orange'], ['onLeave', 'On Leave', Home, 'blue'], ['rate', 'Attendance Rate', CalendarCheck, 'purple'],
      ].map(([key, label, icon, tone]) => ({ key, label, icon, tone, value: state.loading || state.historyError ? '—' : key === 'rate' ? `${summary.rate}%` : summary[key] }))} />
      <p className="text-xs text-slate-500">Based on recorded attendance days. Attendance rate counts Present, Late and Work From Home records out of all records.</p>
      <FilterCard onReset={() => apply(blank)} onSearch={() => apply(draft)}>
        <FilterField label="From Date"><input type="date" value={draft.from} onChange={event => setDraft(value => ({ ...value, from: event.target.value }))} /></FilterField>
        <FilterField label="To Date"><input type="date" min={draft.from || undefined} value={draft.to} onChange={event => setDraft(value => ({ ...value, to: event.target.value }))} /></FilterField>
        <FilterField label="Status"><select value={draft.status} onChange={event => setDraft(value => ({ ...value, status: event.target.value }))}><option value="">All</option>{[...new Set(state.rows.map(attendanceStatus).filter(Boolean))].map(status => <option key={status} value={status}>{attendanceStatusLabel(status)}</option>)}</select></FilterField>
      </FilterCard>
      <h2 className="font-bold text-[#133B5D]">Attendance History</h2>
      {state.historyError ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"><p>Unable to load attendance records.</p><p className="text-sm">{state.historyError}</p><ActionButton onClick={refresh}>Retry</ActionButton></div> : <LiveTable columns={columns} rows={rows} rowKey={attendanceId} loading={state.loading} actions={row => <><ActionButton disabled={attendanceId(row) == null} onClick={() => details(row)}>Details</ActionButton>{canEdit && <ActionButton tone="blue" disabled={attendanceId(row) == null} onClick={() => details(row, true)}>Edit</ActionButton>}<ActionButton onClick={() => apply(blank)}>History</ActionButton></>} empty={<EmptyState title="No attendance records" description={state.rows.length ? 'No records match these filters.' : 'No attendance records found for this employee.'} />} footer={!state.loading && <Pager page={currentPage} totalPages={pages} totalCount={visible.length} shown={rows.length} onPage={setPage} />} />}
    </div>
    {dialog && (dialog.edit && dialog.value ? <HrApiForm title="Edit Attendance" operation="PUT /api/hr/attendance/{attendanceId}" values={dialog.value} onClose={close} onSave={save} /> : <Modal open title="Attendance details" onClose={close}>{dialog.loading ? <p role="status">Loading attendance details...</p> : dialog.error ? <div role="alert">{dialog.error}<ActionButton onClick={() => details(dialog.row, dialog.edit)}>Retry</ActionButton></div> : <HrRecord value={dialog.value} />}</Modal>)}
  </HRPage>
}
