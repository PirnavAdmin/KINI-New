import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, Layers, Pencil, Plane, TrendingUp, UserCheck, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { embeddedPhotoUrl } from '@shared/services/profilePhotoService'
import usePermission from '@shared/hooks/usePermission'
import HrApiForm from '../components/HrApiForm'
import { HrBreadcrumb, HrKpis } from '../components/portal/HrPortalKit'
import { ActionButton, Avatar, LiveTable, RolePill, StatusPill } from '../components/portal/HrLiveKit'
import { formatDay } from '../components/portal/hrLiveUtils'
import { hrError, hrField as field, hrModuleApi } from '../services/hrApi'
import { employeeIdOf, employeeName, loadEmployeeTab, loadHrEmployeeDetails } from '../services/hrEmployeeDetails'
import { attendanceStatus, attendanceSummary } from '../services/hrEmployeeAttendanceData'
import { employeeLeaveSummary, leaveStatus } from '../services/hrEmployeeLeaveData'
import './batch-details.css'
import './employee-details.css'

const dash = String.fromCharCode(8212)
const tabs = ['Overview', 'Attendance', 'Leaves', 'Performance', 'Batches']
const tabModule = { Attendance: 'attendance', Leaves: 'leave', Performance: 'performance', Batches: 'batches' }
const display = value => value == null || value === '' || typeof value === 'object' ? 'Not provided' : String(value)
const numberValue = value => (typeof value === 'number' || typeof value === 'string') && String(value).trim() !== '' && Number.isFinite(Number(value)) ? Number(value) : null
const percent = value => numberValue(value) == null ? dash : numberValue(value) + '%'
const columnsFor = tab => ({
  Attendance: [['date','Date','attendanceDate'],['checkIn','Check In','checkInTime'],['checkOut','Check Out','checkOutTime'],['workingHours','Working Hours','totalHours'],['status','Status']],
  Leaves: [['leaveType','Leave Type'],['fromDate','From Date','startDate'],['toDate','To Date','endDate'],['days','Days','totalDays','numberOfDays'],['reason','Reason'],['status','Status']],
  Performance: [['period','Period'],['performanceScore','Performance','averagePerformance'],['goals','Goals','totalGoals'],['completedGoals','Completed Goals'],['reviews','Reviews'],['latestReview','Latest Review','reviewDate'],['status','Status']],
  Batches: [['batchName','Batch','name'],['courseName','Course'],['role','Role'],['status','Status'],['startDate','Start Date']],
}[tab] ?? []).map(([key, header, ...aliases]) => ({ key, header, render: row => key === 'status' ? <StatusPill value={field(row,key)} /> : display(['date','fromDate','toDate','startDate'].includes(key) ? formatDay(field(row,key,...aliases)) : field(row,key,...aliases)) }))

export default function EmployeeDetails() {
  const { employeeId } = useParams()
  return <EmployeeContent key={employeeId} employeeId={employeeId} />
}
function EmployeeContent({ employeeId }) {
  const permission = usePermission()
  const allowed = permission.hasPermission('employees')
  const [state, setState] = useState({ loading: true })
  const [revision, setRevision] = useState(0)
  const [tab, setTab] = useState('Overview')
  const [related, setRelated] = useState({})
  const [editing, setEditing] = useState(false)
  useEffect(() => {
    if (permission.isLoading || !allowed) return undefined
    const controller = new AbortController()
    loadHrEmployeeDetails(employeeId, controller.signal).then(result => {
      if (!controller.signal.aborted) setState(result)
    }).catch(error => {
      if (!controller.signal.aborted) setState({ error: error.response ? hrError(error, 'employees') : error.message })
    })
    return () => controller.abort()
  }, [employeeId, allowed, permission.isLoading, revision])
  const canReadTab = tab === 'Overview' || permission.hasPermission(tabModule[tab])
  const ready = Boolean(state.employee)
  useEffect(() => {
    if (!ready || tab === 'Overview' || !canReadTab) return undefined
    const controller = new AbortController()
    loadEmployeeTab(tab, employeeId, controller.signal, state.employee).then(rows => {
      if (!controller.signal.aborted) setRelated(value => ({ ...value, [tab]: { rows } }))
    }).catch(error => {
      if (!controller.signal.aborted) setRelated(value => ({ ...value, [tab]: { error: tab === 'Leaves' && error.response?.status === 403 ? "You do not have permission to view this employee's leave records." : error.response ? hrError(error, tabModule[tab]) : error.message } }))
    })
    return () => controller.abort()
  }, [employeeId, tab, canReadTab, ready, revision, state.employee])
  const retry = () => { setState({ loading: true }); setRelated({}); setRevision(value => value + 1) }
  const employee = state.employee ?? {}
  const name = employeeName(employee)
  const attendance = related.Attendance?.rows
  const leaves = related.Leaves?.rows
  const batches = related.Batches?.rows
  const attendanceRate = attendance?.length && attendance.every(row => ['present','absent','late','onleave','wfh','workfromhome'].includes(attendanceStatus(row))) ? attendanceSummary(attendance).rate : null
  const leaveDays = leaves ? employeeLeaveSummary(leaves.filter(row => leaveStatus(row) === 'approved')).days : null
  const metrics = [
    { label:'Attendance', value:percent(field(employee,'attendancePercentage','attendanceRate') ?? attendanceRate),icon:UserCheck,tone:'blue' },
    { label:'Leave Taken', value:numberValue(field(employee,'leaveTaken','leaveDaysTaken')) ?? leaveDays ?? dash,icon:CalendarDays,tone:'purple' },
    { label:'Active Batches',value:numberValue(field(employee,'activeBatches','activeBatchCount')) ?? (batches && batches.every(row => field(row,'status') != null) ? batches.filter(row => String(field(row,'status')).toLowerCase() === 'active').length : dash),icon:Layers,tone:'green' },
    { label:'Performance',value:percent(field(employee,'averagePerformance','performanceScore')),icon:TrendingUp,tone:'orange' },
  ]
  const data = related[tab]
  if (permission.isLoading) return <p role="status">Checking employee access...</p>
  if (!allowed) return <p role="alert">You do not have permission to view employee details.</p>
  return <div className="hrp-page hrbd mx-auto max-w-[1500px] px-4 py-4 sm:px-5">
    <HrBreadcrumb items={[{ label:'Employees',to:'/employee/hr-employees' },{ label:state.loading ? 'Loading employee...' : state.employee ? name : 'Employee Details' }]} />
    <Link className="hrbd-back" to="/employee/hr-employees"><ArrowLeft size={16} />Back to Employees</Link>
    {state.loading ? <div className="hrbd-loading" role="status" aria-label="Loading employee details"><div className="h-36" /><div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[0,1,2,3].map(i => <div className="h-28" key={i} />)}</div><div className="h-64" /></div> : state.notFound ? <section className="hrbd-panel" role="status"><h1>Employee not found</h1><p>The requested employee could not be found.</p></section> : state.error ? <section className="hrbd-panel" role="alert"><h1>Unable to load employee details.</h1><p>{state.error}</p><ActionButton onClick={retry}>Retry</ActionButton></section> : <>
      <header className="hrbd-panel hrbd-header"><EmployeeAvatar key={embeddedPhotoUrl(employee)} employee={employee} name={name} /><div className="min-w-0 flex-1"><h1>{name}</h1><RolePill value={field(employee,'role','roleName')} /><p className="break-all">{display(field(employee,'email'))}</p><p className="hrbd-meta">Employee ID: {display(employeeIdOf(employee))}{field(employee,'employeeCode','employeeNumber') && <> &middot; Employee Code: {display(field(employee,'employeeCode','employeeNumber'))}</>}</p></div><StatusPill value={field(employee,'status')} />{permission.can('employees','edit') && <ActionButton icon={Pencil} onClick={() => setEditing(true)}>Edit Employee</ActionButton>}</header>
      {state.warning && <p role="status" className="mb-4 text-sm text-slate-500">{state.warning}</p>}
      <HrKpis columns={4} items={metrics} />
      <div className="hrbd-tabs hred-tabs" role="tablist" aria-label="Employee details">{tabs.map(label => <button type="button" key={label} role="tab" aria-selected={tab===label} aria-controls="employee-panel" id={'employee-tab-'+label} onClick={() => setTab(label)}>{label}</button>)}</div>
      <div role="tabpanel" id="employee-panel" aria-labelledby={'employee-tab-'+tab}>
        {tab==='Overview' ? <div className="grid gap-4 lg:grid-cols-2"><Information title="Personal Information" items={[
          ['Full Name',name],['Email',field(employee,'email')],['Phone',field(employee,'phone','phoneNumber')],['Employee ID',employeeIdOf(employee)],['Role',field(employee,'role','roleName')],['Employment Type',field(employee,'employmentType','employeeType')],['Status',field(employee,'status')],['Joining Date',formatDay(field(employee,'joiningDate','dateOfJoining','joinDate'))],
        ]} /><Information title="Employment Information" items={[
          ['Department',field(employee,'departmentName') ?? (typeof employee.department === 'string' ? employee.department : field(employee.department,'name','departmentName'))],['Designation',field(employee,'designation')],['Reporting Manager',field(employee,'reportingManagerName') ?? (typeof employee.reportingManager === 'string' ? employee.reportingManager : field(employee.reportingManager,'fullName','name'))],['Employment Type',field(employee,'employmentType','employeeType')],['Joining Date',formatDay(field(employee,'joiningDate','dateOfJoining','joinDate'))],
        ]} /></div> : !canReadTab ? <p role="alert">{tab === 'Leaves' ? "You do not have permission to view this employee's leave records." : "You do not have permission to view this employee's " + tab.toLowerCase() + '.'}</p> : data?.error ? <section className="hrbd-panel" role="alert"><p>{tab === 'Leaves' ? 'Unable to load leave records.' : 'Unable to load ' + tab.toLowerCase() + '.'} {data.error}</p><ActionButton onClick={retry}>Retry</ActionButton></section> : <section className="space-y-4">
          {!data && tab === 'Leaves' && <p role="status">Loading leave records...</p>}
          {data?.rows && tab==='Attendance' && <Summary values={attendanceSummary(data.rows)} labels={{ total:'Total Recorded Days',present:'Present',absent:'Absent',onLeave:'On Leave',late:'Late' }} />}
          {data?.rows && tab==='Leaves' && <Summary values={employeeLeaveSummary(data.rows)} labels={{ total:'Total Requests',approved:'Approved',pending:'Pending',rejected:'Rejected',days:'Total Leave Days' }} />}
          <LiveTable columns={columnsFor(tab)} rows={data?.rows ?? []} loading={!data} rowKey={row => field(row,'attendanceId','leaveId','performanceId','batchId','id')} empty={<p className="p-5">{tab==='Leaves' ? <><b>No leave records found</b><br />This employee has not submitted any leave requests.</> : tab==='Performance' ? 'No performance records available for this employee.' : 'No '+tab.toLowerCase()+' records available for this employee.'}</p>} actions={tab==='Batches' ? row => {
            const id=field(row,'batchId','id')
            return id==null ? null : <Link className="text-blue-600" to={'/employee/batches/'+encodeURIComponent(id)}>View Batch</Link>
          } : undefined} />
        </section>}
      </div>
      {editing && <HrApiForm title="Edit Employee" operation="PUT /api/hr/employees/{employeeId}" values={employee} onClose={() => setEditing(false)} onSave={async values => {
        if (!permission.can('employees','edit')) throw new Error('You do not have permission to edit employees.')
        await hrModuleApi('employees').update(employeeIdOf(employee),values)
        setEditing(false); retry(); toast.success('Changes saved.')
      }} />}
    </>}
  </div>
}
function Information({ title, items }) {
  return <section className="hrbd-panel"><h2>{title}</h2><dl className="grid gap-6 sm:grid-cols-2">{items.map(([label,value]) => <div key={label}><dt className="text-sm text-slate-500">{label}</dt><dd className="mt-1 break-words text-sm font-semibold">{display(value)}</dd></div>)}</dl></section>
}
// Tab summaries reuse HrKpis, i.e. the global KPI card.
const SUMMARY_KPI = { total: [CalendarDays, "blue"], present: [UserCheck, "green"], absent: [XCircle, "red"], onLeave: [Plane, "purple"], late: [Clock3, "orange"], approved: [CheckCircle2, "green"], pending: [Clock3, "orange"], rejected: [XCircle, "red"], days: [CalendarDays, "teal"] }
function Summary({ values, labels }) {
  return <HrKpis columns={5} items={Object.entries(labels).map(([key, label]) => ({ key, label, value: values[key] ?? dash, icon: SUMMARY_KPI[key]?.[0] ?? CalendarDays, tone: SUMMARY_KPI[key]?.[1] ?? "blue" }))} />
}

function EmployeeAvatar({ employee, name }) {
  const [failed, setFailed] = useState(false)
  const photo = embeddedPhotoUrl(employee)
  return photo && !failed ? <img src={photo} alt={name} width={60} height={60} className="h-15 w-15 rounded-full object-cover" onError={() => setFailed(true)} /> : <Avatar name={name} size={60} profileType="employee" profileId={employeeIdOf(employee)} />
}
