import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import KPI from "@/components/common/KPI";
import toast from 'react-hot-toast'
import { AlertCircle, ArrowUp, Award, BarChart3, Minus, RefreshCw, Star, TrendingUp, Users } from 'lucide-react'
import Card from '@shared/components/Card'
import SearchInput from '@shared/components/SearchInput'
import StatusBadge from '@shared/components/StatusBadge'
import { employeeApi, getApiErrorMessage, reportsApi } from '@shared/services/apiServices'

const normalizeEmployee = (employee) => ({
  id: employee.employeeId ?? employee.id,
  name: [employee.firstName, employee.lastName].filter(Boolean).join(' ') || employee.email || 'Unnamed employee',
  role: employee.designation || employee.role || '-',
  department: employee.departmentName || (employee.departmentId ? `Department ${employee.departmentId}` : 'Unassigned'),
  rating: Number(employee.rating ?? employee.performanceScore ?? 0),
  projects: Number(employee.projects ?? employee.projectCount ?? 0),
  status: employee.status || 'active',
  trend: String(employee.trend || 'stable').toLowerCase(),
  initials: ([employee.firstName, employee.lastName].filter(Boolean).map((part) => part[0]).join('') || 'E').slice(0, 2).toUpperCase(),
})

export default function OrgPerformance() {
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('All')
  const [employees, setEmployees] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadPerformance = useCallback(async () => {
    setLoading(true)
    setError('')
    const [employeeResult, analyticsResult] = await Promise.allSettled([
      employeeApi.list(),
      reportsApi.performanceAnalytics(),
    ])

    if (employeeResult.status === 'fulfilled') {
      setEmployees((Array.isArray(employeeResult.value) ? employeeResult.value : []).map(normalizeEmployee))
    } else {
      setEmployees([])
    }

    if (analyticsResult.status === 'fulfilled') setAnalytics(analyticsResult.value)
    else setAnalytics(null)

    const failures = [employeeResult, analyticsResult]
      .filter((result) => result.status === 'rejected')
      .map((result) => getApiErrorMessage(result.reason, 'Unable to load performance data'))
    if (failures.length) {
      const message = [...new Set(failures)].join(' ')
      setError(message)
      toast.error(message)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(loadPerformance, 0)
    return () => window.clearTimeout(timer)
  }, [loadPerformance])

  const departments = useMemo(() => ['All', ...new Set(employees.map((employee) => employee.department).filter(Boolean))], [employees])
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return employees.filter((employee) => {
      const matchesSearch = !query || `${employee.name} ${employee.role}`.toLowerCase().includes(query)
      return matchesSearch && (department === 'All' || employee.department === department)
    })
  }, [department, employees, search])

  const averageFromApi = analytics?.averagePerformance ?? analytics?.averageRating
  const averageRating = averageFromApi !== undefined && averageFromApi !== null
    ? Math.min(5, Number(averageFromApi) > 5 ? Number(averageFromApi) / 20 : Number(averageFromApi)).toFixed(1)
    : (employees.reduce((sum, employee) => sum + employee.rating, 0) / Math.max(employees.length, 1)).toFixed(1)

  const stats = [
    { label: 'Avg Rating', value: averageRating, suffix: '/ 5', icon: Star, color: '#F59E0B' },
    { label: 'Total Employees', value: employees.length, icon: Users, color: '#0f55f7' },
    { label: 'Top Performers', value: employees.filter((employee) => employee.rating >= 4.5).length, icon: Award, color: '#10B981' },
    { label: 'Total Projects', value: employees.reduce((sum, employee) => sum + employee.projects, 0), icon: BarChart3, color: '#06b6a8' },
  ]

  return (
    <div className="w-full min-w-0 px-1 pb-5 pt-0 sm:px-1.5">
      <header className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-cyan-50 shadow-inner dark:from-blue-500/20 dark:to-cyan-500/10">
            <TrendingUp className="h-5 w-5 text-[#0f55f7]" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-2xl">Performance</h1>
            <p className="truncate text-sm text-slate-400">Live employee performance, ratings, and project overview.</p>
          </div>
        </div>
        <button type="button" onClick={loadPerformance} disabled={loading} className="inline-flex h-10 self-start items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 sm:self-auto">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </header>

      {error && (
        <div className="mb-3 flex min-h-10 items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span>
        </div>
      )}

      <div className="mb-3 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {stats.map((stat) => (
          <KPI
            key={stat.label}
            icon={stat.icon}
            value={stat.value}
            label={stat.label}
            suffix={stat.suffix}
            accent={stat.color}
            size="compact"
            className="h-full"
          />
        ))}
      </div>

      <div className="mb-3 flex flex-col gap-2 rounded-xl border border-slate-200 bg-white/80 p-2 shadow-sm backdrop-blur-xl sm:flex-row sm:items-center dark:border-slate-700 dark:bg-slate-900/70">
        <SearchInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or role..." onClear={() => setSearch('')} className="w-full min-w-0 sm:min-w-[260px] sm:flex-1" />
        <div className="scrollbar-hide flex min-w-0 gap-2 overflow-x-auto pb-1 sm:pb-0">
          {departments.map((item) => (
            <button key={item} type="button" onClick={() => setDepartment(item)} className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${department === item ? 'bg-[#0f55f7] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'}`}>{item}</button>
          ))}
        </div>
      </div>

      <Card padding="p-0" className="overflow-hidden !border-slate-200 bg-white shadow-sm dark:!border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b border-slate-200/50 bg-slate-50/50 dark:border-slate-700/50 dark:bg-slate-800/30">
                {[
                  ['Employee', 'w-[28%]'],
                  ['Role', 'w-[18%]'],
                  ['Department', 'w-[20%]'],
                  ['Rating', 'w-[10%]'],
                  ['Projects', 'w-[10%]'],
                  ['Status', 'w-[10%]'],
                  ['Trend', 'w-[14%]'],
                ].map(([heading, width]) => <th key={heading} className={`px-3.5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 ${width}`}>{heading}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-14 text-center text-sm text-slate-400"><RefreshCw className="mx-auto mb-2 h-5 w-5 animate-spin" />Loading performance data...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-14 text-center"><Award className="mx-auto mb-3 h-8 w-8 text-slate-300 dark:text-slate-600" /><p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No performance records found</p><p className="mt-1 text-xs text-slate-400">Employee performance data returned by the API will appear here.</p></td></tr>
              ) : filtered.map((employee, index) => (
                <motion.tr key={employee.id ?? `${employee.name}-${index}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.02 }} className="border-b border-slate-50 transition hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-slate-800/30">
                  <td className="px-3.5 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-blue-600/10 to-teal-500/10 text-[10px] font-bold text-blue-600">{employee.initials}</div>
                      <span className="min-w-0 truncate text-sm font-medium text-slate-900 dark:text-white">{employee.name}</span>
                    </div>
                  </td>
                  <td className="px-3.5 py-3 text-sm text-slate-500 dark:text-slate-400"><span className="block truncate">{employee.role}</span></td>
                  <td className="px-3.5 py-3"><span className="block truncate rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">{employee.department}</span></td>
                  <td className="px-3.5 py-3"><span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-slate-900 dark:text-white"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{employee.rating.toFixed(1)}</span></td>
                  <td className="px-3.5 py-3 text-sm text-slate-500">{employee.projects}</td>
                  <td className="px-3.5 py-3"><StatusBadge status={employee.status} /></td>
                  <td className="px-3.5 py-3"><span className={`inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium ${employee.trend === 'up' ? 'text-emerald-500' : 'text-slate-400'}`}>{employee.trend === 'up' ? <ArrowUp className="h-3 w-3" /> : <Minus className="h-3 w-3" />}{employee.trend === 'up' ? 'Improving' : 'Stable'}</span></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
