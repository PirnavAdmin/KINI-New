import { useEffect, useState } from 'react'
import { BarChart3, Users, Building2, DollarSign, GraduationCap, MapPin, CreditCard } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from 'recharts'
import PageHeader from '@shared/components/PageHeader'
import Card from '@shared/components/Card'
import { dashboardApi, getApiErrorMessage, superAdminOrganizationApi, subscriptionApi } from '@shared/services/apiServices'
import toast from 'react-hot-toast'
import { useAuth } from '@shared/hooks/useAuth'
import { ORGANIZATIONS, ORG_GROWTH_CHART, STUDENT_STATS, EMPLOYEE_STATS, SUBSCRIPTION_STATS, SUBSCRIPTIONS } from '@shared/data/superAdminPageMockData'
import { SUPER_ADMIN_STATS } from '@shared/data/superAdminMockData'
 
const TOOLTIP_STYLE = { background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: '8px 12px', fontSize: '12px' }
 
const MONTHLY_ACTIVE = [
  { month: 'Jan', users: 1200, orgs: 45 }, { month: 'Feb', users: 1400, orgs: 48 }, { month: 'Mar', users: 1800, orgs: 52 },
  { month: 'Apr', users: 2100, orgs: 58 }, { month: 'May', users: 2400, orgs: 62 }, { month: 'Jun', users: 2800, orgs: 68 },
  { month: 'Jul', users: 3100, orgs: 72 }, { month: 'Aug', users: 3500, orgs: 78 }, { month: 'Sep', users: 4000, orgs: 85 },
]
 
const REVENUE_BY_MONTH = [
  { month: 'Jan', revenue: 45000 }, { month: 'Feb', revenue: 52000 }, { month: 'Mar', revenue: 58000 },
  { month: 'Apr', revenue: 63000 }, { month: 'May', revenue: 71000 }, { month: 'Jun', revenue: 78000 },
  { month: 'Jul', revenue: 84000 }, { month: 'Aug', revenue: 92000 }, { month: 'Sep', revenue: 98000 },
]
 
const PLATFORM_GROWTH = [
  { month: 'Jan', growth: 5.2 }, { month: 'Feb', growth: 6.8 }, { month: 'Mar', growth: 8.1 },
  { month: 'Apr', growth: 7.5 }, { month: 'May', growth: 9.3 }, { month: 'Jun', growth: 11.2 },
  { month: 'Jul', growth: 10.8 }, { month: 'Aug', growth: 12.5 }, { month: 'Sep', growth: 14.1 },
]
 
export default function SuperAdminAnalytics() {
  const { user } = useAuth()
  const [stats, setStats] = useState({})
  const [organizations, setOrganizations] = useState([])
  const [subscriptions, setSubscriptions] = useState([])

  useEffect(() => {
    const useDemoData = () => {
      setStats({ ...SUPER_ADMIN_STATS, totalUsers: SUPER_ADMIN_STATS.activeUsers, totalStudents: STUDENT_STATS.total, totalEmployees: EMPLOYEE_STATS.total, activeOrganizations: ORGANIZATIONS.filter((item) => item.status === 'active').length })
      setOrganizations(ORGANIZATIONS)
      setSubscriptions(SUBSCRIPTIONS)
    }
    if (String(user?.email || '').includes('demo')) {
      useDemoData()
      return
    }
    Promise.all([dashboardApi.superAdminStats(), superAdminOrganizationApi.list(), subscriptionApi.list()])
      .then(([nextStats, nextOrganizations, nextSubscriptions]) => {
        setStats(nextStats || {})
        setOrganizations(nextOrganizations || [])
        setSubscriptions(nextSubscriptions || [])
      })
      .catch((error) => {
        useDemoData()
        toast.error(getApiErrorMessage(error, 'Live analytics unavailable. Showing demo data.'))
      })
  }, [user?.email])

  const activeRevenue = subscriptions.filter((item) => item.isActive).reduce((sum, item) => sum + Number(item.price || 0), 0)
  const countries = new Set(organizations.map((item) => item.country).filter(Boolean)).size
  const branches = organizations.reduce((sum, item) => sum + Number(item.branches ?? item.branchCount ?? Math.max(1, Math.ceil(Number(item.employees || 0) / 650))), 0)
  const monthlyRevenue = activeRevenue || SUBSCRIPTION_STATS.monthlyRevenue
  const activePlans = subscriptions.filter((item) => item.isActive || String(item.status).toLowerCase() === 'active').length || SUBSCRIPTION_STATS.activePlans
  const METRICS = [
    { label: 'Organizations', value: stats.totalOrganizations || organizations.length, icon: Building2, color: '#0f55f7' },
    { label: 'Branches', value: branches, icon: MapPin, color: '#8b5cf6' },
    { label: 'Students', value: stats.totalStudents || STUDENT_STATS.total, icon: GraduationCap, color: '#06b6a8' },
    { label: 'Employees', value: stats.totalEmployees || EMPLOYEE_STATS.total, icon: Users, color: '#f59e0b' },
    { label: 'Monthly Revenue', value: `$${Number(monthlyRevenue).toLocaleString()}`, icon: DollarSign, color: '#0f55f7' },
    { label: 'Active Plans', value: activePlans, icon: CreditCard, color: '#06b6a8' },
  ]

  return (
    <div className="w-full px-4 py-3 sm:px-6 lg:px-7">
      <PageHeader title="Platform Analytics" subtitle={`Performance across ${stats.activeOrganizations || 0} active organizations${countries ? ` in ${countries} countries` : ''}`} icon={BarChart3} showBreadcrumb={false} titleClassName="!text-xl !leading-7" subtitleClassName="!mt-0 !text-sm !leading-5" containerClassName="!mb-4" />
 
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-4">
        {METRICS.map((m, i) => (
          <Card key={m.label} delay={i * 0.03} padding="p-3" className="h-[88px]">
            <div className="flex h-full items-center gap-3">
              <div className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${m.color}15` }}>
                <m.icon className="w-[17px] h-[17px]" style={{ color: m.color }} />
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold leading-5 text-slate-900 dark:text-white">{m.value}</p>
                <p className="mt-1 truncate text-[10px] font-medium text-slate-400">{m.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
 
      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <Card padding="p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold text-teal dark:text-teal-300">Platform Engagement</h3>
              <p className="text-xs text-slate-400">Monthly active users</p>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_ACTIVE} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs><linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0f55f7" stopOpacity={0.2}/><stop offset="95%" stopColor="#0f55f7" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="users" stroke="#0f55f7" strokeWidth={2} fill="url(#usersGrad)" name="Active Users" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
 
        <Card padding="p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold text-teal dark:text-teal-300">Revenue Performance</h3>
              <p className="text-xs text-slate-400">Monthly recurring revenue</p>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_BY_MONTH} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs><linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6a8" stopOpacity={0.2}/><stop offset="95%" stopColor="#06b6a8" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="revenue" stroke="#06b6a8" strokeWidth={2} fill="url(#revGrad)" name="Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
 
      <div className="grid lg:grid-cols-2 gap-4">
        <Card padding="p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold text-teal dark:text-teal-300">Organization Growth</h3>
              <p className="text-xs text-slate-400">New organizations onboarded each month</p>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ORG_GROWTH_CHART.slice(0, 9)} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="newOrgs" fill="#0f55f7" radius={[6,6,0,0]} name="New Organizations" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
 
        <Card padding="p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold text-teal dark:text-teal-300">Platform Growth Rate</h3>
              <p className="text-xs text-slate-400">Month-over-month user and organization growth</p>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={PLATFORM_GROWTH} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Line type="monotone" dataKey="growth" stroke="#06b6a8" strokeWidth={2} dot={{ r: 3, fill: '#06b6a8' }} name="Growth" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}
 
