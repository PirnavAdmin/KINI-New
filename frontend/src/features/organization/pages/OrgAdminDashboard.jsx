import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, Building2, Layers, RefreshCw, Sparkles, Users } from 'lucide-react'
import { KPICard, DashboardSection } from '@shared/components/SharedComponents'
import { dashboardApi, studentApi, readStoredOrganizationId } from '@shared/services/apiServices'
import StudentPerformanceChart from '@shared/components/dashboard/StudentPerformanceChart'
import getApiErrorMessage from '@/utils/getApiErrorMessage'
import OrganizationDashboardSkeleton from '@features/organization/components/OrganizationDashboardSkeleton'

const EMPTY_COUNTS = {
  totalDepartments: 0,
  totalTeams: 0,
  totalEmployees: 0,
  activeEmployees: 0,
}

const isDataObject = (value) => (
  value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length > 0
)

function ApiResultPanel({ title, endpoint, data, error }) {
  const values = { ...EMPTY_COUNTS, ...(isDataObject(data) ? data : {}) }

  return (
    <DashboardSection title={title} subtitle={endpoint} icon={Building2} className="h-full !rounded-xl !border-[#E5EAF0] !bg-white !shadow-sm dark:!border-slate-700 dark:!bg-slate-900/90">
      {error && (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">{error}</p>
      )}
      <div className="grid grid-cols-2 gap-2.5">
        {[
          ['Total Departments', values.totalDepartments],
          ['Total Teams', values.totalTeams],
          ['Total Employees', values.totalEmployees],
          ['Active Employees', values.activeEmployees],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-[#E5EAF0] bg-[#FBFBFB] p-3 dark:border-slate-700 dark:bg-slate-800/60">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-1 text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">{value}</p>
          </div>
        ))}
      </div>
    </DashboardSection>
  )
}

export default function OrgAdminDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [stats, setStats] = useState(null)
  const [students, setStudents] = useState([])
  const [errors, setErrors] = useState({ dashboard: '', stats: '', students: '' })
  const [loading, setLoading] = useState(true)
  const [requestId, setRequestId] = useState(0)

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setErrors({ dashboard: '', stats: '', students: '' })

    const organizationId = readStoredOrganizationId()
    const [dashboardResult, statsResult, studentsResult] = await Promise.allSettled([
      dashboardApi.organizationDashboard(),
      dashboardApi.organizationStats(),
      organizationId ? studentApi.list({ organizationId }) : Promise.resolve([]),
    ])

    if (dashboardResult.status === 'fulfilled') {
      setDashboard(dashboardResult.value)
    } else {
      setDashboard(null)
    }

    if (statsResult.status === 'fulfilled') {
      setStats(statsResult.value)
    } else {
      setStats(null)
    }

    if (studentsResult.status === 'fulfilled') {
      setStudents(Array.isArray(studentsResult.value) ? studentsResult.value : [])
    } else {
      setStudents([])
    }

    setErrors({
      dashboard: dashboardResult.status === 'rejected'
        ? getApiErrorMessage(dashboardResult.reason, 'Unable to load the organization dashboard.')
        : '',
      stats: statsResult.status === 'rejected'
        ? getApiErrorMessage(statsResult.reason, 'Unable to load the organization statistics.')
        : '',
      students: studentsResult.status === 'rejected'
        ? getApiErrorMessage(studentsResult.reason, 'Unable to load student performance data.')
        : '',
    })
    setLoading(false)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 })
  }, [])

  useEffect(() => {
    let active = true
    queueMicrotask(() => {
      if (active) loadDashboard()
    })
    return () => {
      active = false
    }
  }, [loadDashboard, requestId])

  const counts = useMemo(() => ({
    ...EMPTY_COUNTS,
    ...(isDataObject(dashboard) ? dashboard : {}),
    ...(isDataObject(stats) ? stats : {}),
  }), [dashboard, stats])

  const hasAnyData = isDataObject(dashboard) || isDataObject(stats)
  const hasAnyError = Boolean(errors.dashboard || errors.stats || errors.students)

  return (
    <div className="min-h-full w-full bg-[var(--app-background)] px-2 py-3 sm:px-4 sm:py-4">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#E5EAF0] px-1 py-1 dark:border-slate-700"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFF3E2] text-[#F59A23] dark:bg-amber-500/10">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#123B5D] dark:text-white sm:text-2xl">Organization Dashboard</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <p className="text-xs text-slate-400">Live workforce data from the Organization API</p>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live API
              </span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setRequestId((value) => value + 1)}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-[#CFD8E0] bg-white px-3.5 py-2 text-sm font-semibold text-[#123B5D] transition hover:border-[#F59A23] hover:text-[#B96808] disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </motion.div>

      {loading ? (
        <OrganizationDashboardSkeleton />
      ) : (
        <>
          {!hasAnyData && hasAnyError && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">Organization data could not be loaded.</p>
                <p className="mt-1 text-sm">Use Refresh to try both API requests again.</p>
              </div>
            </div>
          )}

          {hasAnyData && (
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 [&>div]:!rounded-xl [&>div]:!border-[#E5EAF0] [&>div]:!bg-white [&>div]:!shadow-sm dark:[&>div]:!border-slate-700 dark:[&>div]:!bg-slate-900/90">
              <KPICard icon={Users} label="Employees" value={counts.totalEmployees} color="#0f55f7" delay={0} accent compact />
              <KPICard icon={Layers} label="Departments" value={counts.totalDepartments} color="#06b6a8" delay={1} accent compact />
              <KPICard icon={Building2} label="Teams" value={counts.totalTeams} color="#8b5cf6" delay={2} accent compact />
              <KPICard icon={Users} label="Active Employees" value={counts.activeEmployees} color="#10b981" delay={3} accent compact />
            </div>
          )}

          <div className="mb-4">
            <StudentPerformanceChart
              dashboardData={dashboard}
              statsData={stats}
              students={students}
              loading={loading}
              error={errors.students}
              onRetry={() => setRequestId((value) => value + 1)}
            />
          </div>

          <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
            <ApiResultPanel title="Dashboard Summary" endpoint="GET /api/v1/organization/dashboard" data={dashboard} error={errors.dashboard} />
            <ApiResultPanel title="Organization Statistics" endpoint="GET /api/v1/organization/stats" data={stats} error={errors.stats} />
          </div>
        </>
      )}
    </div>
  )
}
