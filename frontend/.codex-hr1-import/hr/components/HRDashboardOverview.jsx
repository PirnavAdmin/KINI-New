import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import useHrPermissions from '@features/hr/hooks/useHrPermissions'
import usePermission from '@shared/hooks/usePermission'
import { HR_DASHBOARD_NAVIGATION } from '@features/hr/constants/hrDashboardNavigation'
import { HR_LEAVE_REQUESTS } from '@features/hr/data/hrTime'
import { HR_PERFORMANCE_TREND } from '@features/hr/data/hrTalent'
import { ROUTES } from '@shared/constants/routeConstants'

const focus = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
function Panel({ title, to, sample, children }) {
  return <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3"><h2 className="text-sm font-bold text-[#133b5d]">{title}</h2><div className="flex items-center gap-3">{sample && <span className="rounded bg-amber-50 px-2 py-1 text-xs text-amber-800">Sample data</span>}<Link to={to} className={`rounded text-xs font-semibold text-blue-700 hover:underline ${focus}`}>View all ↗</Link></div></header>{children}</section>
}
export default function HRDashboardOverview({ employees, attendanceTrend = [] }) {
  const { canModule } = useHrPermissions()
  const { hasPermission } = usePermission()
  const groups = HR_DASHBOARD_NAVIGATION.map((group) => ({ ...group, items: group.items.filter((item) => item.label !== 'Dashboard' && (item.moduleId ? canModule(item.moduleId) : hasPermission(item.permissionKey))) })).filter((group) => group.items.length)
  const departments = Object.entries(employees.reduce((acc, employee) => {
    const department = employee.departmentName || employee.department
    const name = typeof department === 'object' ? department?.name || 'Unassigned' : department || 'Unassigned'
    acc[name] = (acc[name] || 0) + 1
    return acc
  }, {})).map(([name, count]) => ({ name, count }))
  return <div className="space-y-4">
    <div className="grid gap-3 lg:grid-cols-2">
      {canModule('attendance') && <div className="lg:col-span-2"><Panel title="Attendance trend - latest reporting days" to={ROUTES.EMPLOYEE.HR_ATTENDANCE}>{attendanceTrend.length ? <div className="h-64 p-4"><ResponsiveContainer width="100%" height="100%"><LineChart data={attendanceTrend} margin={{ right: 20, left: -20 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} /><Tooltip /><Legend />{[['present', '#10b981'], ['absent', '#ef4444'], ['onLeave', '#f59e0b']].map(([key, color]) => <Line key={key} type="monotone" dataKey={key} name={key === 'onLeave' ? 'On leave' : key === 'present' ? 'Present' : 'Absent'} stroke={color} strokeWidth={2} />)}</LineChart></ResponsiveContainer></div> : <p className="p-8 text-center text-sm text-slate-500">No dated attendance records available.</p>}</Panel></div>}
      {canModule('employees') && <Panel title="Employees by department" to={ROUTES.EMPLOYEE.HR_DEPARTMENTS}>{departments.length ? <div className="p-4" style={{ height: Math.max(250, departments.length * 36) }} role="img" aria-label={departments.map((item) => `${item.name}: ${item.count} employees`).join(', ')}><ResponsiveContainer width="100%" height="100%"><BarChart data={departments} layout="vertical" margin={{ right: 20 }}><CartesianGrid horizontal={false} strokeDasharray="3 3" /><XAxis type="number" allowDecimals={false} /><YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="count" name="Employees" fill="#008db0" radius={[0, 4, 4, 0]} maxBarSize={24} /></BarChart></ResponsiveContainer></div> : <p className="p-8 text-center text-sm text-slate-500">No department records available.</p>}</Panel>}
      {canModule('performance') && <Panel title="Performance overview" to={ROUTES.EMPLOYEE.HR_PERFORMANCE} sample><div className="h-64 p-4"><ResponsiveContainer width="100%" height="100%"><LineChart data={HR_PERFORMANCE_TREND} margin={{ right: 20, left: -20 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="quarter" tick={{ fontSize: 11 }} /><YAxis domain={[0, 5]} /><Tooltip /><Line type="monotone" dataKey="rating" name="Average rating / 5" stroke="#008db0" strokeWidth={3} /></LineChart></ResponsiveContainer></div></Panel>}
      {canModule('leave') && <div className="lg:col-span-2"><Panel title="Pending leave requests" to={ROUTES.EMPLOYEE.HR_LEAVE} sample><div className="overflow-x-auto"><table className="w-full min-w-[500px] text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr>{['Employee', 'Leave type', 'Dates', 'Status', 'Action'].map((label) => <th key={label} className="px-4 py-3">{label}</th>)}</tr></thead><tbody>{HR_LEAVE_REQUESTS.filter((item) => item.status === 'pending').slice(0, 5).map((item) => <tr key={item.id} className="border-t border-slate-100"><td className="px-4 py-3 font-medium text-[#133b5d]">{item.employee}</td><td className="px-4 py-3">{item.type}</td><td className="px-4 py-3">{item.dates}</td><td className="px-4 py-3"><span className="rounded-full bg-amber-50 px-2 py-1 text-xs text-amber-800">Pending</span></td><td className="px-4 py-3"><Link to={ROUTES.EMPLOYEE.HR_LEAVE} aria-label={`Review leave for ${item.employee}`} className={`rounded text-xs font-semibold text-blue-700 ${focus}`}>Review</Link></td></tr>)}</tbody></table></div></Panel></div>}
    </div>
    {groups.map((group) => <section key={group.title}><h2 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#51718b]">{group.title}</h2><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{group.items.map((item) => <Link key={item.path} to={item.path} className={`rounded-xl border border-slate-200 bg-white p-4 transition hover:border-[#008db0] ${focus}`}><div className="flex items-center justify-between gap-2"><h3 className="text-sm font-semibold text-[#133b5d]">{item.label}</h3><ArrowUpRight className="h-4 w-4 shrink-0 text-[#008db0]" /></div><p className="mt-2 text-xs leading-relaxed text-slate-500">{item.description}</p></Link>)}</div></section>)}
  </div>
}
