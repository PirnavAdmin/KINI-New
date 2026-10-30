import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CalendarDays, RefreshCw, UserCheck, UserMinus, Users, Video } from 'lucide-react'
import usePermission from '@shared/hooks/usePermission'
import useHrPermissions from '@features/hr/hooks/useHrPermissions'
import { ROUTES } from '@shared/constants/routeConstants'
import { employeeApi } from '@shared/services/apiServices'
import { mentorService } from '@shared/services/mentorService'
import { liveClassService } from '@features/live-classes/services/liveClassService'
import { normalizeLiveClassList } from '@features/live-classes/utils/liveClassMappers'
import { employeeAttendanceEvent } from '@shared/services/employeeWorkAttendance'
import { employeeAttendanceService } from '@shared/services/employeeAttendanceService'
import HRDashboardOverview from '@features/hr/components/HRDashboardOverview'
import { HR_DASHBOARD } from '@features/hr/data/hrWorkforce'

const field = (record, key) => {
  const match = record && Object.keys(record).find((candidate) => candidate.toLowerCase() === key.toLowerCase())
  return match ? record[match] : undefined
}
const rows = (response) => {
  if (Array.isArray(response)) return response
  const nested = response?.data ?? response?.items ?? response?.results
  return nested && nested !== response ? rows(nested) : []
}
const dateKey = (value) => {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-CA')
}
const pct = (value, total) => total ? Math.round((value / total) * 100) : 0

function Panel({ title, icon: Icon, children, className = '' }) {
  return <section className={`min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}><header className="flex items-center gap-2 border-b border-slate-100 px-4 py-3"><Icon className="h-4 w-4 text-[#0f55f7]" /><h2 className="text-sm font-bold text-[#102b54]">{title}</h2></header>{children}</section>
}
function Kpi({ icon: Icon, label, value, helper, tone, onClick }) {
  return <button type="button" onClick={onClick} className="group rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#0f55f7]/30 hover:shadow-md"><div className="flex items-center gap-2.5"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${tone}`}><Icon className="h-4 w-4" /></span><div className="min-w-0"><p className="truncate text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-xl font-bold leading-none text-[#102b54]">{value}</p></div></div><p className="mt-2 text-[10px] font-semibold text-[#0b4f9c] group-hover:underline">{helper}</p></button>
}

export default function HRDashboardView() {
  const navigate = useNavigate()
  const { can, canModule, permissionSource, roleLabel } = useHrPermissions()
  const [data, setData] = useState({ employees: [], mentors: [], students: [], liveClasses: [], attendance: { total: 0, present: 0, absent: 0, onLeave: 0, updatedAt: '-' }, source: 'api' })
  const [refreshing, setRefreshing] = useState(false)
  const [errors, setErrors] = useState([])
  const [attendanceTrend, setAttendanceTrend] = useState([])
  const { hasPermission } = usePermission()
  const employeesAllowed = canModule('employees')
  const attendanceAllowed = canModule('attendance')
  const scheduleAllowed = hasPermission('schedule')
  const dashboardAllowed = permissionSource !== 'custom' || can('dashboard', 'view')
  const load = useCallback(async () => {
    if (!dashboardAllowed) return
    const results = await Promise.allSettled([
      employeesAllowed ? employeeApi.list({ pageNumber: 1, pageSize: 1000 }) : Promise.resolve([]),
      employeesAllowed ? mentorService.getMentors({ PageNumber: 1, PageSize: 1000 }) : Promise.resolve([]),
      Promise.resolve([]),
      scheduleAllowed ? liveClassService.list({ page: 1, pageSize: 1000 }) : Promise.resolve([]),
      attendanceAllowed ? employeeAttendanceService.report({ pageNumber: 1, pageSize: 1000 }) : Promise.resolve([]),
    ])
    const employees = results[0].status === 'fulfilled' ? rows(results[0].value) : []
    const mentors = results[1].status === 'fulfilled' ? rows(results[1].value) : []
    const students = results[2].status === 'fulfilled' ? rows(results[2].value) : []
    const liveClasses = results[3].status === 'fulfilled' ? normalizeLiveClassList(results[3].value) : []
    const history = results[4].status === 'fulfilled' ? rows(results[4].value) : []
    const days = {}
    history.forEach((record) => {
      const date = dateKey(field(record, 'date') || field(record, 'attendanceDate') || field(record, 'checkInTime') || field(record, 'checkIn'))
      if (!date) return
      days[date] ||= { date, present: 0, absent: 0, onLeave: 0 }
      const status = String(field(record, 'status') || '').toLowerCase().replace(/[ _-]/g, '')
      if (['present', 'working', 'late', 'wfh'].includes(status)) days[date].present++
      else if (status === 'absent') days[date].absent++
      else if (status === 'onleave') days[date].onLeave++
    })
    setAttendanceTrend(Object.values(days).sort((a, b) => a.date.localeCompare(b.date)).slice(-7))
    const records = results[4].status === 'fulfilled' ? rows(results[4].value).filter((record) => dateKey(field(record, 'date') || field(record, 'attendanceDate') || field(record, 'checkInTime') || field(record, 'checkIn')) === dateKey(new Date())) : []
    setErrors(results.flatMap((result, index) => result.status === 'rejected' ? [['Employees', 'Mentors', 'Students', 'Class schedule', 'Attendance'][index]] : []))
    const present = records.filter((record) => ['present', 'working'].includes(String(field(record, 'status') || '').toLowerCase())).length
    const onLeave = records.filter((record) => String(field(record, 'status') || '').toLowerCase().replace(/\s+/g, '-') === 'on-leave').length
    setData({ employees, mentors, students, liveClasses, attendance: { total: employees.length, present, absent: records.filter((record) => String(field(record, 'status')).toLowerCase() === 'absent').length, onLeave, updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, source: 'api' })
  }, [employeesAllowed, attendanceAllowed, scheduleAllowed, dashboardAllowed])
  const refresh = async () => { if (refreshing) return; setRefreshing(true); try { await load() } finally { setRefreshing(false) } }
  useEffect(() => { const timer = window.setTimeout(load, 0); window.addEventListener(employeeAttendanceEvent, load); return () => { window.clearTimeout(timer); window.removeEventListener(employeeAttendanceEvent, load) } }, [load])
  if (permissionSource === 'custom' && !can('dashboard', 'view')) return <div className="grid min-h-[60vh] place-items-center rounded-xl border border-slate-200 bg-white p-8 text-center"><div><h1 className="text-xl font-bold text-[#102b54]">Dashboard access restricted</h1><p className="mt-2 text-sm text-slate-500">Ask the Organization Admin to grant Dashboard access.</p></div></div>
  const { employees, mentors, liveClasses, attendance } = data
  const mentorCount = mentors.length || employees.filter((employee) => String(employee.role ?? employee.designation ?? '').toLowerCase().includes('mentor')).length
  const todayClasses = liveClasses.filter((item) => dateKey(item.startAt) === dateKey(new Date()))
  const schedule = todayClasses.slice(0, 5)
  const eventRows = [...HR_DASHBOARD.birthdays.slice(0, 2).map((item) => ({ ...item, kind: 'Birthday' })), ...HR_DASHBOARD.anniversaries.slice(0, 2).map((item) => ({ ...item, kind: 'Anniversary' }))]
  return <div className="mx-auto max-w-[1440px] space-y-3 bg-[var(--app-background)] pb-6 text-slate-700">
    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm"><div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-[#0f55f7]/[0.06] to-transparent" /><div className="relative flex flex-wrap items-center justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#0b4f9c]">People · performance · progress</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-[#102b54]">HR team builds a stronger workplace</h1><p className="mt-1 text-sm text-slate-500">Welcome back, {roleLabel}. Here is your organization overview for today.</p></div><button type="button" onClick={refresh} disabled={refreshing} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#0b4f9c] shadow-sm hover:bg-slate-50 disabled:opacity-60"><RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh</button></div></section>
    {errors.length > 0 && <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Could not load {errors.join(", ")}. Refresh to retry.</div>}
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">{canModule('employees') && <Kpi icon={Users} label="Total employees" value={errors.includes("Employees") ? "--" : employees.length} helper="View workforce" tone="bg-blue-50 text-[#0b5db7]" onClick={() => navigate(ROUTES.EMPLOYEE.HR_EMPLOYEES)} />}{canModule('employees') && <Kpi icon={UserCheck} label="Active employees" value={errors.includes("Employees") ? "--" : employees.filter((item) => String(item.status).toLowerCase() === 'active').length} helper="Active headcount" tone="bg-emerald-50 text-emerald-600" onClick={() => navigate(ROUTES.EMPLOYEE.HR_EMPLOYEES)} />}{canModule('employees') && <Kpi icon={Users} label="Trainers & mentors" value={errors.includes("Mentors") ? "--" : mentorCount} helper="View mentors" tone="bg-violet-50 text-violet-600" onClick={() => navigate(`${ROUTES.EMPLOYEE.HR_EMPLOYEES}?role=Mentor`)} />}{canModule('attendance') && <Kpi icon={UserCheck} label="Present today" value={errors.includes("Attendance") ? "--" : attendance.present} helper={`${pct(attendance.present, attendance.total)}% attendance`} tone="bg-sky-50 text-sky-700" onClick={() => navigate(ROUTES.EMPLOYEE.HR_ATTENDANCE)} />}{canModule('leave') && attendanceAllowed && <Kpi icon={UserMinus} label="On leave today" value={errors.includes("Attendance") ? "--" : attendance.onLeave} helper="View leave" tone="bg-amber-50 text-amber-600" onClick={() => navigate(ROUTES.EMPLOYEE.HR_LEAVE)} />}{scheduleAllowed && <Kpi icon={Video} label="Classes today" value={errors.includes("Class schedule") ? "--" : todayClasses.length} helper="View schedule" tone="bg-rose-50 text-rose-600" onClick={() => navigate(ROUTES.EMPLOYEE.TODAY_SCHEDULE)} />}</div>
    <div className="grid grid-cols-1 gap-3">{scheduleAllowed && <Panel title="Today's classes" icon={CalendarDays}><div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-xs"><thead className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400"><tr><th className="px-4 py-2.5">Time</th><th className="px-3 py-2.5">Batch / session</th><th className="px-3 py-2.5">Course</th><th className="px-3 py-2.5">Mode</th><th className="px-3 py-2.5">Status</th></tr></thead><tbody>{schedule.map((item, index) => <tr key={item.id ?? index} className="border-b border-slate-50 last:border-0"><td className="px-4 py-2.5 font-semibold text-[#102b54]">{field(item, 'time') || field(item, 'startTime') || '--:--'}</td><td className="px-3 py-2.5 font-medium">{field(item, 'batchName') || field(item, 'title') || 'Live session'}</td><td className="px-3 py-2.5 text-slate-500">{field(item, 'courseName') || field(item, 'course') || '—'}</td><td className="px-3 py-2.5 text-slate-500">{field(item, 'mode') || 'Online'}</td><td className="px-3 py-2.5"><span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-[#0b4f9c]">{field(item, 'status') || 'Upcoming'}</span></td></tr>)}{!schedule.length && <tr><td colSpan="5" className="px-4 py-8 text-center text-sm text-slate-400">No classes scheduled today.</td></tr>}</tbody></table></div></Panel>}</div>
    <HRDashboardOverview employees={employees} attendanceTrend={attendanceTrend} />
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">{hasPermission('announcements') && <Panel title="Announcements and alerts - Sample data" icon={Bell}><div className="divide-y divide-slate-100">{HR_DASHBOARD.notifications.slice(0, 4).map((item) => <div key={item.id} className="flex gap-3 px-4 py-3"><Bell className={`mt-0.5 h-4 w-4 shrink-0 ${item.tone === 'danger' ? 'text-rose-500' : item.tone === 'warning' ? 'text-amber-500' : 'text-[#0b5db7]'}`} /><div><p className="text-xs font-medium text-[#102b54]">{item.title}</p><p className="mt-0.5 text-[10px] text-slate-400">{item.at}</p></div></div>)}</div></Panel>}{hasPermission('calendar') && <Panel title="Calendar - Sample data" icon={CalendarDays}><div className="grid grid-cols-2 gap-2 p-3">{eventRows.map((item) => <div key={`${item.kind}-${item.id}`} className="rounded-xl border border-slate-100 bg-slate-50 p-3"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-[#0b4f9c]"><CalendarDays className="h-3.5 w-3.5" />{item.date}</div><p className="mt-2 truncate text-xs font-semibold text-[#102b54]">{item.name}</p><p className="mt-0.5 text-[10px] text-slate-500">{item.kind} · {item.dept}</p></div>)}</div></Panel>}</div>
  </div>
}
