import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Building2, Users, DollarSign, TrendingUp,
  BarChart3, Search, Eye,
  ArrowUpRight, Globe, Shield, AlertTriangle,
  CheckCircle2, CreditCard, ShieldAlert, Activity, GraduationCap,
  BriefcaseBusiness, UserCog, Settings2, FileClock, X, Layers3, MonitorCheck
} from 'lucide-react'
import { ROUTES } from '@shared/constants/routeConstants'
import {
  ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { KPICard, DashboardSection, StatusBadge } from '@shared/components/SharedComponents'
import { getApiErrorMessage, normalizeOrganization, superAdminOrganizationApi } from '@shared/services/apiServices'
 
const TOOLTIP_STYLE = {
  background: 'rgba(255,255,255,0.95)',
  border: 'none',
  borderRadius: '12px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  padding: '8px 12px',
  fontSize: '12px',
}
 
const CONTAINER = `
  relative
  before:absolute before:inset-0
  before:bg-gradient-to-b before:from-brand/[0.02] before:to-transparent before:dark:from-brand/[0.04]
  before:pointer-events-none
`
 
const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
}

const DASHBOARD_LOADED_AT = Date.now()

const formatRevenueTick = (value) => {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '₹0'
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1).replace('.0', '')}Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1).replace('.0', '')}L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1).replace('.0', '')}K`
  return `₹${amount}`
}

const formatDashboardDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
 
export default function SuperAdminDashboard() {
  const navigate = useNavigate()
  const [orgFilter, setOrgFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({ totalOrganizations: 0, totalUsers: 0, totalEmployees: 0, activeOrganizations: 0 })
  const [recentOrganizations, setRecentOrganizations] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [platformHealth, setPlatformHealth] = useState('checking')
  const [selectedOrganization, setSelectedOrganization] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let mounted = true
    const loadDashboard = async () => {
      setLoading(true)
      setLoadError('')
      try {
        const [summary = {}, organizationRows = []] = await Promise.all([
          superAdminOrganizationApi.summary(),
          superAdminOrganizationApi.list(),
        ])
        if (!mounted) return
        const organizations = organizationRows.map((row) => {
          const normalized = normalizeOrganization(row)
          return {
            ...normalized,
            ...row,
            id: normalized.organizationId,
            name: normalized.name,
            employees: Number(row.employeeCount ?? row.totalEmployees ?? row.employees ?? 0),
            status: String(row.status ?? row.organizationStatus ?? row.approvalStatus ?? 'pending').toLowerCase(),
            plan: row.planName ?? row.plan ?? row.subscriptionName ?? row.subscription ?? '',
          }
        })
        const subscriptionResults = await Promise.allSettled(
          organizations.map((organization) => superAdminOrganizationApi.getSubscription(organization.organizationId))
        )
        if (!mounted) return
        const subscriptionRows = subscriptionResults.flatMap((result, index) => {
          if (result.status !== 'fulfilled' || !result.value) return []
          const values = Array.isArray(result.value) ? result.value : [result.value]
          return values.map((subscription) => ({
            ...subscription,
            organizationId: organizations[index].organizationId,
            organizationName: organizations[index].name,
          }))
        })
        setStats({
          ...summary,
          totalOrganizations: Number(summary.totalOrganizations ?? summary.organizationCount ?? organizations.length),
          activeOrganizations: Number(summary.activeOrganizations ?? summary.activeOrganizationCount ?? organizations.filter((item) => item.status === 'active').length),
          totalUsers: Number(summary.activeUsers ?? summary.totalUsers ?? summary.userCount ?? 0),
          totalEmployees: Number(summary.totalEmployees ?? summary.employeeCount ?? 0),
          totalStudents: Number(summary.totalStudents ?? summary.studentCount ?? 0),
          totalMentors: Number(summary.totalTutors ?? summary.totalMentors ?? summary.tutorCount ?? summary.mentorCount ?? 0),
          totalCourses: Number(summary.totalCourses ?? summary.courseCount ?? 0),
          monthlyRevenue: Number(summary.monthlyRevenue ?? summary.revenueThisMonth ?? 0),
        })
        setRecentOrganizations(organizations)
        setSubscriptions(subscriptionRows)
        setPlatformHealth('operational')
      } catch (error) {
        if (!mounted) return
        setStats({ totalOrganizations: 0, totalUsers: 0, totalEmployees: 0, activeOrganizations: 0 })
        setRecentOrganizations([])
        setSubscriptions([])
        setPlatformHealth('degraded')
        setLoadError(getApiErrorMessage(error, 'Unable to load the Super Admin dashboard.'))
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadDashboard()
    return () => { mounted = false }
  }, [])
 
  const handleViewOrg = async (organization) => {
    const organizationId = organization.organizationId ?? organization.id
    setSelectedOrganization(organization)
    try {
      const [details, subscription] = await Promise.all([
        superAdminOrganizationApi.getById(organizationId),
        superAdminOrganizationApi.getSubscription(organizationId).catch(() => null),
      ])
      const normalized = normalizeOrganization(details)
      setSelectedOrganization({ ...organization, ...normalized, ...details, subscription: subscription ?? organization.subscription })
    } catch (error) {
      setLoadError(getApiErrorMessage(error, 'Unable to load organization details.'))
    }
  }

  useEffect(() => {
    if (!selectedOrganization) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [selectedOrganization])
  const filteredOrgs = recentOrganizations.filter(o =>
    (!orgFilter || String(o.status).toLowerCase() === orgFilter.toLowerCase()) &&
    (!searchQuery || o.name.toLowerCase().includes(searchQuery.toLowerCase()))
  )
 
  const statusFilters = ['Active', 'Pending', 'Suspended', 'Trial']
  const pendingOrganizations = recentOrganizations.filter((item) => item.status === 'pending').length
  const suspendedOrganizations = recentOrganizations.filter((item) => item.status === 'suspended').length
  const trialOrganizations = recentOrganizations.filter((item) => item.status === 'trial').length
  const activeSubscriptions = subscriptions.filter((item) => item.isActive)
  const monthlyRecurringRevenue = Math.round(activeSubscriptions.reduce((sum, item) => (
    sum + Number(item.price || item.amount || 0) / Math.max(Number(item.durationInMonths || 1), 1)
  ), 0))
  const attentionSubscriptions = subscriptions.filter((item) => {
    if (!item.isActive) return true
    const expiry = Date.parse(item.expiryDate)
    return Number.isFinite(expiry) && expiry - DASHBOARD_LOADED_AT <= 30 * 24 * 60 * 60 * 1000
  }).length
  const securityAlerts = suspendedOrganizations + attentionSubscriptions
  const revenueSeriesSource = Array.isArray(stats.revenueTrend)
    ? stats.revenueTrend
    : Array.isArray(stats.monthlyRevenueTrend) ? stats.monthlyRevenueTrend : []
  const revenueSeries = revenueSeriesSource.map((item, index) => ({
    period: item.month ?? item.period ?? item.label ?? `Period ${index + 1}`,
    revenue: Number(item.revenue ?? item.amount ?? item.value ?? 0),
  }))
  const upcomingSubscriptions = subscriptions
    .filter((item) => {
      const expiry = Date.parse(item.expiryDate ?? item.endDate ?? item.renewalDate)
      if (!Number.isFinite(expiry)) return false
      const days = Math.ceil((expiry - DASHBOARD_LOADED_AT) / 86400000)
      return days >= 0 && days <= 30
    })
    .sort((a, b) => Date.parse(a.expiryDate ?? a.endDate ?? a.renewalDate) - Date.parse(b.expiryDate ?? b.endDate ?? b.renewalDate))
 
  return (
    <div className={`super-admin-command-center w-full p-2 sm:p-3 lg:p-3 ${CONTAINER}`}>
      {loadError ? <div role="alert" className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{loadError}</div> : null}
      {/* ── Page Header ── */}
      <motion.div variants={fadeUp} initial={false} animate="animate" transition={{ duration: 0.35 }} className="mb-3 flex items-end justify-between gap-4 px-1 py-1">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[.2em] text-blue-600">Platform overview</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white">Super Admin Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Live organization, subscription and platform performance.</p>
        </div>
        <button type="button" onClick={() => navigate(ROUTES.SUPER_ADMIN.ORGANIZATIONS)} className="hidden rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 sm:inline-flex">Manage organizations</button>
      </motion.div>
 
      {/* ── KPI Cards ── */}
      <motion.div
        variants={fadeUp}
        initial={false}
        animate="animate"
        transition={{ duration: 0.4, delay: 0.05 }}
        className="super-admin-primary-kpis mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        <KPICard dense accent onClick={() => navigate(ROUTES.SUPER_ADMIN.ORGANIZATIONS)} icon={Building2} label="Total Organizations" value={loading ? '—' : stats.totalOrganizations || 0} color="#0f55f7" delay={0} />
        <KPICard dense accent onClick={() => navigate(ROUTES.SUPER_ADMIN.ORGANIZATIONS)} icon={CheckCircle2} label="Active Organizations" value={stats.activeOrganizations || 0} color="#06b6a8" delay={1} />
        <KPICard dense accent onClick={() => navigate(ROUTES.SUPER_ADMIN.SUBSCRIPTIONS)} icon={CreditCard} label="Total Subscriptions" value={subscriptions.length} color="#8b5cf6" delay={2} />
        <KPICard dense accent onClick={() => navigate(`${ROUTES.SUPER_ADMIN.SUBSCRIPTIONS}?status=active`)} icon={CheckCircle2} label="Active Subscriptions" value={activeSubscriptions.length} color="#10b981" delay={3} />
        <KPICard dense accent onClick={() => navigate(`${ROUTES.SUPER_ADMIN.SUBSCRIPTIONS}?status=expiring`)} icon={FileClock} label="Upcoming Renewals" value={upcomingSubscriptions.length} color="#f59e0b" delay={4} />
        <KPICard dense accent icon={Users} label="Total Students" value={stats.totalStudents || 0} color="#F0765B" delay={5} />
        <KPICard dense accent icon={UserCog} label="Total Tutors" value={stats.totalMentors || 0} color="#7c3aed" delay={6} />
        <KPICard dense accent onClick={() => navigate(ROUTES.SUPER_ADMIN.REVENUE)} icon={DollarSign} label="Platform Revenue" value={Number(stats.totalRevenue || monthlyRecurringRevenue || stats.monthlyRevenue || 0).toLocaleString('en-IN')} prefix="₹" color="#2563eb" delay={7} />
      </motion.div>
 
      {/* ── Charts Row ── */}
      <motion.div
        variants={fadeUp}
        initial={false}
        animate="animate"
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-3 space-y-3"
      >
        <DashboardSection
          title="Revenue Overview"
          subtitle="Monthly platform revenue"
          icon={TrendingUp}
          className="w-full"
        >
          <div className="flex h-64 items-center justify-center p-1">
            {revenueSeries.length ? <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries}>
                <defs>
                  <linearGradient id="orgGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0f55f7" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#0f55f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis width={54} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={formatRevenueTick} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Area
                  dataKey="revenue"
                  stroke="#0f55f7"
                  strokeWidth={2}
                  fill="url(#orgGradient)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#0f55f7', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer> : <div className="text-center"><DollarSign className="mx-auto h-9 w-9 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-600">No revenue trend available</p><p className="mt-1 text-xs text-slate-400">Revenue will appear when monthly data is available.</p></div>}
          </div>
        </DashboardSection>
 
        <DashboardSection
          title="Upcoming Subscriptions"
          subtitle="Renewals due in the next 30 days"
          icon={FileClock}
          className="w-full"
        >
          <div className="max-h-64 overflow-y-auto">
            {upcomingSubscriptions.length ? <div className="space-y-2">{upcomingSubscriptions.slice(0, 5).map((item) => <button key={item.id ?? item.subscriptionId} type="button" onClick={() => navigate(`${ROUTES.SUPER_ADMIN.SUBSCRIPTIONS}?status=expiring`)} className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-3 text-left hover:border-blue-200 hover:bg-blue-50/40"><span className="min-w-0"><span className="block truncate text-xs font-bold text-slate-900">{item.organizationName ?? item.organization?.name ?? 'Organization'}</span><span className="mt-1 block truncate text-[10px] text-slate-400">{item.planName ?? item.plan ?? 'Plan'} · {formatDashboardDate(item.expiryDate ?? item.endDate ?? item.renewalDate)}</span></span><ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400" /></button>)}</div> : <div className="grid h-full place-items-center text-center"><div><FileClock className="mx-auto h-9 w-9 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-600">No upcoming subscriptions</p><p className="mt-1 text-xs text-slate-400">No renewals are due in the next 30 days.</p></div></div>}
          </div>
        </DashboardSection>
      </motion.div>

      <div className="hidden">
        <DashboardSection title="Operational Attention" subtitle="Queues requiring Super Admin action" icon={AlertTriangle}>
          <div className="grid grid-cols-2 gap-2">
            {[
              ['Pending approvals', pendingOrganizations, ROUTES.SUPER_ADMIN.ORGANIZATIONS, '#f59e0b'],
              ['Suspended', suspendedOrganizations, ROUTES.SUPER_ADMIN.ORGANIZATIONS, '#ef4444'],
              ['Trial institutes', trialOrganizations, ROUTES.SUPER_ADMIN.ORGANIZATIONS, '#8b5cf6'],
              ['Failed / expiring', attentionSubscriptions, ROUTES.SUPER_ADMIN.SUBSCRIPTIONS, '#0f55f7'],
            ].map(([label, value, path, color]) => (
              <button key={label} type="button" onClick={() => navigate(path)} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-left transition hover:border-blue-200 hover:bg-white hover:shadow-sm dark:border-slate-700 dark:bg-slate-800/40">
                <span className="block text-xl font-extrabold" style={{ color }}>{value}</span>
                <span className="mt-1 block text-[11px] font-semibold text-slate-500 dark:text-slate-400">{label}</span>
              </button>
            ))}
          </div>
        </DashboardSection>

        <DashboardSection title="Platform Health" subtitle="Core services and API availability" icon={Activity}>
          <div className="space-y-2">
            {[
              ['Application', platformHealth === 'operational' ? 'Operational' : platformHealth === 'checking' ? 'Checking' : 'Degraded'],
              ['Organization API', platformHealth === 'operational' ? 'Operational' : 'Attention'],
              ['Subscription API', platformHealth === 'operational' ? 'Operational' : 'Attention'],
              ['Authentication', 'Operational'],
            ].map(([service, state]) => {
              const healthy = state === 'Operational'
              return <div key={service} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 dark:border-slate-800"><span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{service}</span><span className={`inline-flex items-center gap-1.5 text-[10px] font-bold ${healthy ? 'text-emerald-600' : 'text-amber-600'}`}><span className={`h-1.5 w-1.5 rounded-full ${healthy ? 'bg-emerald-500' : 'bg-amber-500'}`} />{state}</span></div>
            })}
          </div>
        </DashboardSection>

        <DashboardSection title="Access & Governance" subtitle="Security posture and audit controls" icon={ShieldAlert}>
          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 p-3 dark:from-blue-500/10 dark:to-cyan-500/10">
            <div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-800 dark:text-white">Security alerts</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${securityAlerts ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>{securityAlerts}</span></div>
            <p className="mt-1 text-[11px] leading-5 text-slate-500">Suspended tenants and subscription risks requiring governance review.</p>
          </div>
          <button type="button" onClick={() => navigate(ROUTES.SUPER_ADMIN.GOVERNANCE)} className="mt-2 flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-50 dark:border-slate-700 dark:hover:bg-blue-500/10">Review roles, access and audit controls <ArrowUpRight className="h-4 w-4" /></button>
        </DashboardSection>
      </div>

      <DashboardSection title="Platform Workforce" subtitle="Students, employees, mentors and HR users across all institutes" icon={Users} className="hidden">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['Students', stats.totalStudents || 0, GraduationCap, ROUTES.SUPER_ADMIN.STUDENTS, '#0f55f7'],
            ['Employees', stats.totalEmployees || 0, BriefcaseBusiness, ROUTES.SUPER_ADMIN.EMPLOYEES, '#06b6a8'],
            ['Mentors', stats.totalMentors || 0, UserCog, ROUTES.SUPER_ADMIN.EMPLOYEES, '#8b5cf6'],
            ['HR / Admin users', stats.totalHrUsers || stats.totalAdmins || 0, Shield, ROUTES.SUPER_ADMIN.EMPLOYEES, '#f59e0b'],
          ].map(([label, value, Icon, path, color]) => (
            <button key={label} type="button" onClick={() => navigate(path)} className="group relative flex min-h-[104px] items-center gap-4 overflow-hidden rounded-2xl border border-slate-200/90 bg-white px-4 py-4 text-left shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_14px_32px_rgba(15,85,247,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900/70">
              <span className="absolute inset-y-4 left-0 w-1 rounded-r-full" style={{ backgroundColor: color }} />
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ring-inset ring-white/60" style={{ backgroundColor: `${color}12`, color }}><Icon className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1"><span className="block text-2xl font-black tracking-tight text-slate-950 dark:text-white">{Number(value).toLocaleString()}</span><span className="mt-0.5 block truncate text-xs font-semibold text-slate-500">{label}</span></span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-600" />
            </button>
          ))}
        </div>
      </DashboardSection>

      <motion.div variants={fadeUp} initial={false} animate="animate" transition={{ duration: 0.4, delay: 0.14 }} className="mb-3">
        <DashboardSection title="Recent Platform Activity" subtitle="Latest organization events from the live platform data" icon={Activity}>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            {recentOrganizations.slice(0, 4).map((organization) => (
              <button key={organization.id} type="button" onClick={() => handleViewOrg(organization)} className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2 text-left transition hover:border-blue-200 hover:bg-blue-50/40 dark:border-slate-800 dark:hover:bg-blue-500/10">
                <span className="min-w-0"><span className="block truncate text-xs font-bold text-slate-800 dark:text-white">{organization.name}</span><span className="text-[10px] text-slate-400">Organization {organization.status} · {organization.createdDate}</span></span><ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              </button>
            ))}
            {!recentOrganizations.length && <div className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400 dark:border-slate-700 md:col-span-2 xl:col-span-4">No platform activity recorded yet.</div>}
          </div>
        </DashboardSection>
      </motion.div>
 
      {/* ── Recent Organizations Table ── */}
      <motion.div
        variants={fadeUp}
        initial={false}
        animate="animate"
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <DashboardSection
          title="Recent Organizations"
          subtitle="Latest registered organizations"
          icon={Building2}
          className="recent-organizations-panel"
          action={
            <div className="flex flex-wrap items-center justify-end gap-2">
              {/* Search */}
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search organizations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 w-56 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800/70 dark:text-white"
                />
              </div>
              {/* Status filter */}
              <div className="recent-organizations-filters flex h-10 items-center gap-1 rounded-xl border border-slate-200 bg-slate-100/80 p-1 dark:border-slate-700 dark:bg-slate-800/60">
                {statusFilters.map((s) => (
                  <button
                    key={s}
                    onClick={() => setOrgFilter(orgFilter === s ? '' : s)}
                    className={`rounded-lg px-3 py-1.5 text-[10px] font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      orgFilter === s
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-500 hover:bg-white hover:text-slate-800 dark:hover:bg-slate-700 dark:hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          }
        >
          <div className="recent-organizations-table-wrap custom-scrollbar max-h-[390px] w-full overflow-auto rounded-xl border border-slate-200/90 dark:border-slate-700/80">
            <table className="recent-organizations-table w-full min-w-[760px] text-left">
              <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm dark:bg-slate-800/95">
                <tr>
                  <th className="px-6 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Organization</th>
                  <th className="px-6 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Industry</th>
                  <th className="px-6 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Employees</th>
                  <th className="px-6 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredOrgs.length > 0 ? filteredOrgs.map((org, idx) => (
                  <motion.tr
                    key={org.id}
                    initial={false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                    className="recent-organization-row group transition-all duration-150"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-100 bg-teal-50 dark:border-teal-500/20 dark:bg-teal-500/10">
                          <Building2 className="h-4 w-4 text-teal-700 dark:text-teal-300" />
                        </div>
                        <div><span className="block text-sm font-bold text-slate-900 transition-colors group-hover:text-teal-800 dark:text-white dark:group-hover:text-teal-300">{org.name}</span><span className="mt-0.5 block text-[11px] text-slate-400">Added {org.createdDate || 'recently'}</span></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                        <span className="text-sm text-slate-500 dark:text-slate-400">{org.industry}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                        {org.employees.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={org.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <button
                          onClick={() => handleViewOrg(org)}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 text-xs font-bold text-teal-700 transition-all hover:border-teal-600 hover:bg-teal-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/30 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-300"
                          title="View organization details"
                        >
                          <Eye size={15} />
                          <span>View details</span>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Building2 className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                      <p className="text-sm text-slate-400">{orgFilter || searchQuery ? 'No organizations match your filter' : 'No organizations registered yet'}</p>
                      <button
                        onClick={() => { setOrgFilter(''); setSearchQuery('') }}
                        className="mt-2 text-xs text-brand hover:underline"
                      >
                        Clear filters
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </DashboardSection>
      </motion.div>

      <section className="super-admin-access-overview mb-3 rounded-[14px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div><h2 className="text-base font-bold text-slate-950 dark:text-white">Access Management</h2><p className="mt-0.5 text-xs text-slate-500">Control existing organization module and screen permissions.</p></div>
          <button type="button" onClick={() => navigate(ROUTES.SUPER_ADMIN.GOVERNANCE)} className="text-xs font-bold text-blue-600 hover:text-blue-700">Open access management</button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { title: 'Module-Based Access', description: 'Manage which existing platform modules each organization can use.', icon: Layers3 },
            { title: 'Screen-Based Access', description: 'Review granular screen permissions within enabled modules.', icon: MonitorCheck },
          ].map((item) => <button key={item.title} type="button" onClick={() => navigate(ROUTES.SUPER_ADMIN.GOVERNANCE)} className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-left transition hover:border-blue-200 hover:bg-white hover:shadow-sm dark:border-slate-700 dark:bg-slate-800/40"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10"><item.icon className="h-5 w-5" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-bold text-slate-900 dark:text-white">{item.title}</span><span className="mt-0.5 block text-xs leading-5 text-slate-500">{item.description}</span></span><ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-blue-600" /></button>)}
        </div>
      </section>

      <AnimatePresence>
        {selectedOrganization && (
          <>
            <motion.button
              type="button"
              aria-label="Close organization details"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrganization(null)}
              className="fixed inset-0 z-[1000] cursor-default bg-slate-950/45 backdrop-blur-[3px]"
            />
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="dashboard-organization-modal-title"
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 12 }}
              transition={{ type: 'spring', stiffness: 340, damping: 30 }}
              className="fixed inset-4 z-[1001] m-auto h-fit max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_28px_80px_-24px_rgba(15,23,42,.5)] dark:border-slate-700 dark:bg-slate-900"
            >
              <header className="flex items-start justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700 sm:px-6">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[.14em] text-teal-600">Organization profile</p>
                  <h2 id="dashboard-organization-modal-title" className="mt-1 text-xl font-bold text-slate-950 dark:text-white">{selectedOrganization.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{selectedOrganization.industry}</p>
                </div>
                <button type="button" onClick={() => setSelectedOrganization(null)} className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 transition hover:bg-teal-50 hover:text-teal-800 dark:hover:bg-slate-800" aria-label="Close organization details">
                  <X className="h-4 w-4" />
                </button>
              </header>

              <div className="max-h-[calc(100dvh-11rem)] overflow-y-auto bg-slate-50/70 p-5 sm:p-6">
                <div className="mb-5 flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-teal-100 bg-teal-50 text-teal-700"><Building2 className="h-7 w-7" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-lg font-bold text-slate-950 dark:text-white">{selectedOrganization.name}</p>
                    <p className="mt-0.5 text-sm text-slate-500">Registered {selectedOrganization.createdDate || 'date unavailable'}</p>
                  </div>
                  <StatusBadge status={selectedOrganization.status} />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { label: 'Industry', value: selectedOrganization.industry || 'Not provided', icon: Globe },
                    { label: 'Employees', value: Number(selectedOrganization.employees || 0).toLocaleString(), icon: Users },
                    { label: 'Subscription plan', value: selectedOrganization.plan || selectedOrganization.subscription?.planName || selectedOrganization.subscription?.name || 'Not assigned', icon: CreditCard },
                    { label: 'Registered', value: selectedOrganization.createdDate || 'Not available', icon: FileClock },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/60">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-50 text-teal-700"><item.icon className="h-4 w-4" /></span>
                        <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</p><p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{item.value}</p></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <footer className="flex justify-end border-t border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-900 sm:px-6">
                <button type="button" onClick={() => setSelectedOrganization(null)} className="h-10 rounded-xl bg-teal-600 px-5 text-sm font-bold text-white shadow-sm shadow-teal-600/20 transition hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/30">Close</button>
              </footer>
            </motion.section>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
