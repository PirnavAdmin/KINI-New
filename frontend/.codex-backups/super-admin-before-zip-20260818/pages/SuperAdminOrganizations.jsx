import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  Building2, Plus, Eye, Edit3, CheckCircle2, Ban, RotateCcw, X, Trash2,
  TrendingUp, BarChart3, Download, GraduationCap, Users, MapPin, BriefcaseBusiness,
  Mail, Phone, Globe2, Link2, LockKeyhole, ShieldCheck
} from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { KPICard, DashboardSection } from '@shared/components/SharedComponents'
import PageHeader from '@shared/components/PageHeader'
import DataTable from '@shared/components/DataTable'
import StatusBadge from '@shared/components/StatusBadge'
import { Button, Input, Select } from '@shared/components/FormElements'
import Modal from '@shared/components/Modal'
import AccountCreatedModal from '@shared/components/AccountCreatedModal'
import {
  ORG_GROWTH_CHART, INDUSTRY_DISTRIBUTION
} from '@shared/data/superAdminPageMockData'
import { getApiErrorMessage, normalizeOrganization, organizationApi } from '@shared/services/apiServices'
import { ROUTES } from '@shared/constants/routeConstants'
 
// =================================
// TODO: API Integration
// GET /api/v1/super-admin/organizations
// POST /api/v1/super-admin/organizations
// PUT /api/v1/super-admin/organizations/:id
// DELETE /api/v1/super-admin/organizations/:id
// GET /api/v1/super-admin/organizations/stats
// =================================
 
const TOOLTIP_STYLE = {
  background: 'rgba(255,255,255,0.95)',
  border: 'none',
  borderRadius: '12px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  padding: '8px 12px',
  fontSize: '12px',
}
 
const STATUS_FILTERS = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'trial', label: 'Trial' },
  { value: 'expired', label: 'Expired' },
  { value: 'suspended', label: 'Suspended' },
]
 
const PLAN_FILTERS = [
  { value: '', label: 'All Plans' },
  { value: 'Free', label: 'Free' },
  { value: 'Starter', label: 'Starter' },
  { value: 'Professional', label: 'Professional' },
  { value: 'Enterprise', label: 'Enterprise' },
]

const INDUSTRY_OPTIONS = [
  { value: 'Education', label: 'Education & Training' },
  { value: 'Technology', label: 'Technology' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Finance', label: 'Finance & Banking' },
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'Retail', label: 'Retail & E-commerce' },
  { value: 'Other', label: 'Other' },
]

const COUNTRY_OPTIONS = [
  { value: 'India', label: 'India' },
  { value: 'United States', label: 'United States' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'United Arab Emirates', label: 'United Arab Emirates' },
  { value: 'Singapore', label: 'Singapore' },
  { value: 'Australia', label: 'Australia' },
]
 
export default function SuperAdminOrganizations() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [deleteOrg, setDeleteOrg] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [selectedOrg, setSelectedOrg] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingOrg, setEditingOrg] = useState(null)
  const [createdAccount, setCreatedAccount] = useState(null)
  const [form, setForm] = useState({ organizationName: '', email: '', phone: '', industry: '', country: '', website: '', password: '', confirmPassword: '' })

  const enrichOrganization = (row, index = 0) => {
    const normalized = normalizeOrganization(row)
    const name = normalized.name || row.name
    const employees = Number(row.employees ?? row.employeeCount ?? row.totalEmployees ?? 0)
    const students = Number(row.students ?? row.studentCount ?? row.totalStudents ?? 0)
    const branches = Number(row.branches ?? row.branchCount ?? row.totalBranches ?? 0)
    return {
      ...normalized,
      ...row,
      name,
      size: row.size ?? row.organizationSize ?? '-',
      employees,
      students,
      branches,
      activeStudents: Number(row.activeStudents ?? row.activeStudentCount ?? 0),
      activeEmployees: Number(row.activeEmployees ?? row.activeEmployeeCount ?? 0),
      studentRecords: Array.isArray(row.studentRecords) ? row.studentRecords : [],
      employeeRecords: Array.isArray(row.employeeRecords) ? row.employeeRecords : [],
      plan: row.plan ?? row.planName ?? row.subscription ?? '-',
      amount: Number(row.amount ?? row.subscriptionAmount ?? 0),
      status: String(row.status ?? row.organizationStatus ?? row.approvalStatus ?? 'pending').toLowerCase(),
    }
  }

  const fetchOrganizations = async () => {
    setLoading(true)
    setLoadError('')
    try {
      const rows = await organizationApi.list()
      setOrganizations((Array.isArray(rows) ? rows : []).map(enrichOrganization))
    } catch (error) {
      setOrganizations([])
      setLoadError(getApiErrorMessage(error, 'Unable to load organizations.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(fetchOrganizations, 0)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const requestedId = searchParams.get('organizationId')
    if (!requestedId || !organizations.length) return
    const match = organizations.find((item) => String(item.organizationId ?? item.id) === requestedId)
    if (match) {
      const timer = window.setTimeout(() => {
        setSelectedOrg(match)
        setDrawerOpen(true)
      }, 0)
      return () => window.clearTimeout(timer)
    }
  }, [organizations, searchParams])

  useEffect(() => {
    if (!drawerOpen) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [drawerOpen])

  const closeDrawer = () => {
    setDrawerOpen(false)
    if (searchParams.has('organizationId')) {
      const next = new URLSearchParams(searchParams)
      next.delete('organizationId')
      setSearchParams(next, { replace: true })
    }
  }

  const openOrganizationDetails = async (organization) => {
    const organizationId = organization.organizationId ?? organization.id
    navigate(`${ROUTES.SUPER_ADMIN.ORGANIZATIONS}/${organizationId}`)
  }

  const openForm = (organization = null) => {
    setEditingOrg(organization)
    setForm({
      organizationName: organization?.organizationName || organization?.name || '',
      email: organization?.email || '', phone: organization?.phone || '',
      industry: organization?.industry || '', country: organization?.country || '', website: organization?.website || '',
      password: '', confirmPassword: '',
    })
    setFormOpen(true)
    setFormErrors({})
  }

  const saveOrganization = async () => {
    const errors = {}
    if (!form.organizationName.trim()) errors.organizationName = 'Organization name is required.'
    if (!form.email.trim()) errors.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email address.'
    if (form.phone && !/^\d{10}$/.test(form.phone)) errors.phone = 'Enter exactly 10 digits.'
    if (form.website) { try { new URL(form.website) } catch { errors.website = 'Enter a complete URL, for example https://example.com.' } }
    if (!editingOrg && !form.password) errors.password = 'Password is required.'
    else if (!editingOrg && form.password.length < 8) errors.password = 'Password must contain at least 8 characters.'
    if (!editingOrg && !form.confirmPassword) errors.confirmPassword = 'Confirm your password.'
    else if (!editingOrg && form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match.'
    setFormErrors(errors)
    if (Object.keys(errors).length) return
    setSaving(true)
    try {
      if (editingOrg) {
        const updatePayload = { ...form }
        delete updatePayload.password
        delete updatePayload.confirmPassword
        await organizationApi.update(editingOrg.organizationId ?? editingOrg.id, updatePayload)
      } else {
        const created = await organizationApi.create({ ...form, organizationName: form.organizationName.trim(), email: form.email.trim() })
        const record = created?.data ?? created ?? {}
        setCreatedAccount({
          entityType: 'organization',
          name: form.organizationName.trim(),
          id: record.organizationId ?? record.id ?? record.organization?.organizationId ?? 'Assigned by system',
          email: form.email.trim(),
          password: form.password,
          record: enrichOrganization({ ...record, name: form.organizationName.trim(), email: form.email.trim() }),
        })
      }
      toast.success(editingOrg ? 'Organization updated' : 'Organization created')
      setFormOpen(false)
      await fetchOrganizations()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to save organization'))
    } finally { setSaving(false) }
  }

  const confirmDeleteOrganization = async () => {
    if (!deleteOrg || deleting) return
    setDeleting(true)
    try {
      await organizationApi.remove(deleteOrg.organizationId ?? deleteOrg.id)
      setOrganizations((current) => current.filter((item) => (item.organizationId ?? item.id) !== (deleteOrg.organizationId ?? deleteOrg.id)))
      toast.success('Organization deleted successfully.')
      setDeleteOrg(null)
    } catch (error) { toast.error(getApiErrorMessage(error, 'Unable to delete organization.')) }
    finally { setDeleting(false) }
  }

  const changeOrganizationStatus = async (organization, nextStatus) => {
    const actionLabel = nextStatus === 'active' ? 'approve/activate' : 'suspend'
    const reason = window.prompt(`Reason to ${actionLabel} ${organization.name}:`)
    if (!reason?.trim()) return toast.error('A reason is required for audit compliance')
    const organizationId = organization.organizationId ?? organization.id
    const responsibleUserId = user?.userId ?? user?.id ?? localStorage.getItem('userId')
    const timestamp = new Date().toISOString()
    try {
      await organizationApi.update(organizationId, {
        ...organization,
        organizationName: organization.organizationName ?? organization.name,
        status: nextStatus,
        approvalStatus: nextStatus === 'active' ? 'approved' : 'suspended',
        approvalReason: reason.trim(),
        responsibleUserId,
        approvedBy: nextStatus === 'active' ? responsibleUserId : undefined,
        approvedAt: nextStatus === 'active' ? timestamp : undefined,
        suspendedBy: nextStatus === 'suspended' ? responsibleUserId : undefined,
        suspendedAt: nextStatus === 'suspended' ? timestamp : undefined,
        updatedAt: timestamp,
        auditAction: nextStatus === 'active' ? 'ORGANIZATION_APPROVED' : 'ORGANIZATION_SUSPENDED',
      })
      toast.success(nextStatus === 'active' ? 'Organization approved and activated' : 'Organization suspended')
      setDrawerOpen(false)
      await fetchOrganizations()
    } catch (error) { toast.error(getApiErrorMessage(error, `Unable to ${actionLabel} organization`)) }
  }
 
  const filteredOrgs = useMemo(() => {
    return organizations.filter((o) => {
      const matchStatus = !statusFilter || o.status === statusFilter
      const matchPlan = !planFilter || o.plan === planFilter
      return matchStatus && matchPlan
    })
  }, [organizations, statusFilter, planFilter])

  const orgStats = useMemo(() => ({
    total: organizations.length,
    active: organizations.filter((item) => item.status === 'active').length,
    trial: organizations.filter((item) => item.status === 'trial' || item.status === 'pending').length,
    expired: organizations.filter((item) => item.status === 'expired' || item.status === 'suspended').length,
    branches: organizations.reduce((sum, item) => sum + Number(item.branches || 0), 0),
    students: organizations.reduce((sum, item) => sum + Number(item.students || 0), 0),
    employees: organizations.reduce((sum, item) => sum + Number(item.employees || 0), 0),
  }), [organizations])
 
  const columns = [
    {
      header: 'Organization ID',
      accessor: 'organizationId',
      width: '10%',
      render: (row) => (
        <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {row.organizationId ?? row.id ?? '—'}
        </span>
      ),
    },
    {
      header: 'Organization',
      accessor: 'name',
      width: '19%',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-100 bg-teal-50">
            <Building2 className="h-4 w-4 text-teal-700" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{row.name}</p>
            <p className="truncate text-xs text-slate-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    { header: 'Industry', accessor: 'industry', width: '11%' },
    { header: 'Branches', accessor: 'branches', width: '7%', render: (row) => <span className="font-bold text-slate-700 dark:text-slate-200">{row.branches}</span> },
    { header: 'Students', accessor: 'students', width: '9%', render: (row) => <span className="font-bold text-blue-600">{row.students.toLocaleString()}</span> },
    {
      header: 'Employees',
      accessor: 'employees',
      width: '10%',
      render: (row) => (
        <span className="font-medium text-slate-700 dark:text-slate-300">{row.employees.toLocaleString()}</span>
      ),
    },
    { header: 'Plan', accessor: 'plan', width: '9%' },
    {
      header: 'Status',
      accessor: 'status',
      width: '10%',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      accessor: 'actions',
      sortable: false,
      width: '15%',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); openOrganizationDetails(row) }}
            className="group/action inline-flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 transition-colors hover:bg-blue-600 dark:border-blue-500/30 dark:bg-blue-500/10"
            aria-label="View organization"
          >
            <Eye className="w-3.5 h-3.5 text-blue-600 group-hover/action:text-white" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); openForm(row) }} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800" aria-label="Edit organization">
            <Edit3 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteOrg(row) }} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 transition-colors hover:bg-red-100" aria-label="Delete organization"><Trash2 className="h-3.5 w-3.5 text-red-600" /></button>
          {row.status === 'active' ? (
            <button onClick={(e) => { e.stopPropagation(); changeOrganizationStatus(row, 'suspended') }} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 transition-colors hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10" aria-label="Suspend organization" title="Suspend organization">
              <Ban className="w-3.5 h-3.5 text-red-500" />
            </button>
          ) : (
            <button onClick={(e) => { e.stopPropagation(); changeOrganizationStatus(row, 'active') }} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 transition-colors hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10" aria-label="Approve or reactivate organization" title="Approve or reactivate">
              {row.status === 'suspended' ? <RotateCcw className="w-3.5 h-3.5 text-emerald-600" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
            </button>
          )}
        </div>
      ),
    },
  ]
 
  return (
    <div className="w-full px-4 py-3 sm:px-6 lg:px-7">
      {/* KPIs */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard dense icon={Building2} label="Total Organizations" value={orgStats.total} color="#0f55f7" delay={0} />
        <KPICard dense icon={MapPin} label="Total Branches" value={orgStats.branches} color="#8b5cf6" delay={1} />
        <KPICard dense icon={GraduationCap} label="Total Students" value={orgStats.students} color="#06b6a8" delay={2} />
        <KPICard dense icon={BriefcaseBusiness} label="Total Employees" value={orgStats.employees} color="#f59e0b" delay={3} />
      </div>
 
      {/* Charts Row */}
      <div className="hidden grid-cols-1 gap-4 lg:grid-cols-5">
        <DashboardSection title="Organization Growth" subtitle="Monthly new registrations" icon={TrendingUp} className="lg:col-span-3">
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ORG_GROWTH_CHART} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="orgGrowthGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f55f7" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0f55f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="newOrgs" stroke="#0f55f7" strokeWidth={2} fill="url(#orgGrowthGrad2)" name="New Organizations" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </DashboardSection>
 
        <DashboardSection title="Industry Distribution" subtitle="By organization count" icon={BarChart3} className="lg:col-span-2">
          <div className="h-44 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={INDUSTRY_DISTRIBUTION} cx="50%" cy="50%" innerRadius={40} outerRadius={60}
                  paddingAngle={3} dataKey="value" animationBegin={200} animationDuration={1000}>
                  {INDUSTRY_DISTRIBUTION.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1">
              {INDUSTRY_DISTRIBUTION.map((d) => (
                <span key={d.name} className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name} <span className="font-medium text-slate-700 dark:text-slate-300">{d.value}</span>
                </span>
              ))}
            </div>
          </div>
        </DashboardSection>
      </div>
 
      <section className="organization-directory-workspace overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_12px_38px_-28px_rgba(15,23,42,.35)]">
      <div className="border-b border-slate-200 bg-white px-5 pt-5 sm:px-6">
      {/* Page Header */}
      <PageHeader
        showBreadcrumb={false}
        titleClassName="!text-2xl !leading-8"
        containerClassName="!mb-5"
        title="Organization Directory"
        subtitle={`${orgStats.active} active organizations · ${orgStats.students.toLocaleString()} students · ${orgStats.employees.toLocaleString()} employees`}
        icon={Building2}
        actions={
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800">
              <Download className="w-4 h-4" />
              Export
            </button>
            <Button icon={Plus} onClick={() => openForm()}>Create Organization</Button>
          </div>
        }
      />
      </div>
 
      {/* Table */}
      {loadError && <div className="m-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><span>{loadError}</span><Button variant="outline" onClick={fetchOrganizations}>Retry</Button></div>}
      <DataTable
        columns={columns}
        data={filteredOrgs}
        loading={loading}
        pageSize={8}
        searchPlaceholder="Search by organization ID, name, industry, or country..."
        emptyTitle="No organizations found"
        emptyDescription="Try adjusting your filters or create a new organization."
        emptyIcon={Building2}
        onRowClick={openOrganizationDetails}
        fitToContainer
        tableStyle={{ tableLayout: 'fixed' }}
        tableClassName="organization-directory-table"
        toolbarClassName="organization-directory-toolbar"
        headerCellClassName="organization-directory-header-cell"
        cellClassName="organization-directory-cell"
        rowClassName="organization-directory-row"
        filters={
          <div className="flex gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/30"
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-3 py-2.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/30"
            >
              {PLAN_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
        }
      />
      </section>
 
      {/* Organization Details Modal */}
      <AnimatePresence>
        {drawerOpen && selectedOrg && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1000] bg-slate-950/45 backdrop-blur-[3px]"
              onClick={closeDrawer}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 12 }}
              transition={{ type: 'spring', stiffness: 340, damping: 30 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="organization-details-title"
              className="fixed inset-3 z-[1001] m-auto flex h-fit max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-5xl flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_28px_80px_-24px_rgba(15,23,42,.45)] dark:border-slate-700 dark:bg-slate-900 sm:inset-6 sm:max-h-[calc(100dvh-3rem)] sm:w-[calc(100%-3rem)]"
            >
              <div className="z-10 flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-900 sm:px-6">
                <div>
                  <h2 id="organization-details-title" className="text-lg font-bold text-slate-950 dark:text-white">Organization Details</h2>
                  <p className="mt-0.5 text-xs text-slate-500">Profile, subscription, students, and workforce overview</p>
                </div>
                <button onClick={closeDrawer} className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 transition-colors hover:bg-teal-50 hover:text-teal-800 dark:hover:bg-slate-800" aria-label="Close organization details">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-slate-50/60 p-4 sm:p-5">
                {/* Header */}
                 <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
                   <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-teal-100 bg-teal-50">
                     <Building2 className="h-7 w-7 text-teal-700" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-teal dark:text-teal-300">{selectedOrg.name}</h3>
                    <p className="mt-0.5 font-mono text-xs font-semibold text-slate-500">Organization ID: {selectedOrg.organizationId ?? selectedOrg.id ?? '—'}</p>
                    <p className="text-sm text-slate-400">{selectedOrg.industry}</p>
                    <div className="mt-1"><StatusBadge status={selectedOrg.status} /></div>
                  </div>
                </div>
 
                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: 'Students', value: selectedOrg.students.toLocaleString(), icon: GraduationCap, color: 'text-blue-600 bg-blue-50' },
                    { label: 'Employees', value: selectedOrg.employees.toLocaleString(), icon: Users, color: 'text-teal-600 bg-teal-50' },
                    { label: 'Branches', value: selectedOrg.branches, icon: MapPin, color: 'text-violet-600 bg-violet-50' },
                    { label: 'Plan', value: selectedOrg.plan, icon: BarChart3, color: 'text-amber-600 bg-amber-50' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
                      <span className={`mb-3 flex h-8 w-8 items-center justify-center rounded-xl ${item.color}`}><item.icon className="h-4 w-4" /></span>
                      <p className="text-lg font-black text-slate-950 dark:text-white">{item.value}</p>
                      <p className="mt-0.5 text-[11px] font-semibold text-slate-500">{item.label}</p>
                    </div>
                  ))}
                </div>

                <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Organization information</h4>
                  <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                    {[
                      ['Email', selectedOrg.email || 'Not provided'], ['Phone', selectedOrg.phone || 'Not provided'],
                      ['Country', selectedOrg.country || 'Not provided'], ['Company size', selectedOrg.size],
                      ['Active students', selectedOrg.activeStudents.toLocaleString()], ['Active employees', selectedOrg.activeEmployees.toLocaleString()],
                      ['Subscription amount', `$${selectedOrg.amount.toLocaleString()}`], ['Registered', selectedOrg.createdDate],
                    ].map(([label, value]) => <div key={label} className="border-b border-slate-100 pb-2 dark:border-slate-800"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{value}</p></div>)}
                  </div>
                </section>

                <div className="hidden">
                  <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                    <h4 className="flex items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-white"><GraduationCap className="h-4 w-4 text-blue-600" />Student overview</h4>
                    <p className="mt-1 text-xs text-slate-500">{selectedOrg.activeStudents.toLocaleString()} active of {selectedOrg.students.toLocaleString()} students</p>
                    <div className="mt-3 space-y-2">{selectedOrg.studentRecords.slice(0, 3).map((student) => <div key={student.id} className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800"><p className="text-xs font-bold text-slate-800 dark:text-white">{student.name}</p><p className="truncate text-[10px] text-slate-400">{student.email} · {student.progress}% progress</p></div>)}{!selectedOrg.studentRecords.length && <p className="rounded-xl bg-slate-50 px-3 py-4 text-center text-xs text-slate-400 dark:bg-slate-800">Student totals available; roster sync pending.</p>}</div>
                  </section>
                  <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                    <h4 className="flex items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-white"><BriefcaseBusiness className="h-4 w-4 text-teal-600" />Employee overview</h4>
                    <p className="mt-1 text-xs text-slate-500">{selectedOrg.activeEmployees.toLocaleString()} active of {selectedOrg.employees.toLocaleString()} employees</p>
                    <div className="mt-3 space-y-2">{selectedOrg.employeeRecords.slice(0, 3).map((employee) => <div key={employee.id} className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800"><p className="text-xs font-bold text-slate-800 dark:text-white">{employee.name}</p><p className="truncate text-[10px] text-slate-400">{employee.designation} · {employee.department}</p></div>)}{!selectedOrg.employeeRecords.length && <p className="rounded-xl bg-slate-50 px-3 py-4 text-center text-xs text-slate-400 dark:bg-slate-800">Employee totals available; roster sync pending.</p>}</div>
                  </section>
                </div>
 
                <section className="overflow-hidden rounded-2xl border border-blue-200/70 dark:border-blue-500/20">
                  <div className="flex items-center justify-between bg-blue-50/70 px-4 py-3 dark:bg-blue-500/10">
                    <h4 className="flex items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-white"><GraduationCap className="h-4 w-4 text-blue-600" />Student details</h4>
                    <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-bold text-white">{selectedOrg.students.toLocaleString()} students</span>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedOrg.studentRecords.map((student) => (
                      <div key={student.id} className="grid gap-3 px-4 py-3 sm:grid-cols-[1.4fr_.9fr_.7fr] sm:items-center">
                        <div className="min-w-0"><p className="text-xs font-bold text-slate-900 dark:text-white">{student.name}</p><p className="truncate text-[10px] text-slate-400">{student.id} · {student.email}</p></div>
                        <div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Learning</p><p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{student.coursesEnrolled} courses · {student.progress}% progress</p></div>
                        <div className="flex items-center justify-between gap-2 sm:block"><div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Score</p><p className="text-xs font-bold text-blue-600">{student.avgScore}%</p></div><StatusBadge status={student.status} /></div>
                      </div>
                    ))}
                    {!selectedOrg.studentRecords.length && <p className="px-4 py-5 text-center text-xs text-slate-400">Detailed student roster sync is pending.</p>}
                  </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-teal-200/70 dark:border-teal-500/20">
                  <div className="flex items-center justify-between bg-teal-50/70 px-4 py-3 dark:bg-teal-500/10">
                    <h4 className="flex items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-white"><BriefcaseBusiness className="h-4 w-4 text-teal-600" />Employee details</h4>
                    <span className="rounded-full bg-teal-600 px-2.5 py-1 text-[10px] font-bold text-white">{selectedOrg.employees.toLocaleString()} employees</span>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedOrg.employeeRecords.map((employee) => (
                      <div key={employee.id} className="grid gap-3 px-4 py-3 sm:grid-cols-[1.3fr_1fr_.7fr] sm:items-center">
                        <div className="min-w-0"><p className="text-xs font-bold text-slate-900 dark:text-white">{employee.name}</p><p className="truncate text-[10px] text-slate-400">{employee.id} · {employee.email}</p></div>
                        <div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Role</p><p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{employee.designation}</p><p className="text-[10px] text-slate-400">{employee.department}</p></div>
                        <div className="flex items-center justify-between gap-2 sm:block"><div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Performance</p><p className="text-xs font-bold text-teal-600">{employee.performance}%</p></div><StatusBadge status={employee.status} /></div>
                      </div>
                    ))}
                    {!selectedOrg.employeeRecords.length && <p className="px-4 py-5 text-center text-xs text-slate-400">Detailed employee roster sync is pending.</p>}
                  </div>
                </section>

                {/* Actions */}
                <div className="sticky bottom-0 flex flex-col-reverse gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-[0_-8px_24px_-20px_rgba(15,23,42,.4)] backdrop-blur sm:flex-row sm:justify-end dark:border-slate-700 dark:bg-slate-900/95">
                  <Button variant="secondary" onClick={closeDrawer}>Close</Button>
                  <Button variant="outline" icon={Edit3} onClick={() => { openForm(selectedOrg); setDrawerOpen(false) }}>Edit Organization</Button>
                  {selectedOrg.status === 'active' ? (
                    <Button variant="danger" icon={Ban} onClick={() => changeOrganizationStatus(selectedOrg, 'suspended')}>Suspend Organization</Button>
                  ) : (
                    <Button icon={CheckCircle2} onClick={() => changeOrganizationStatus(selectedOrg, 'active')}>
                      {selectedOrg.status === 'suspended' ? 'Reactivate Organization' : 'Approve Organization'}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={<span className="create-organization-modal__title"><span className="create-organization-modal__mark"><Building2 /></span><span>{editingOrg ? 'Edit Organization' : 'Create Organization'}</span></span>}
        description={editingOrg ? 'Update the organization profile and contact details.' : 'Add an organization and create its administrator access.'}
        size="lg"
        className="create-organization-modal"
        headerClassName="create-organization-modal__header"
        bodyClassName="create-organization-modal__body"
        footerClassName="create-organization-modal__footer"
        footer={<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button variant="secondary" className="create-organization-modal__cancel" onClick={() => setFormOpen(false)}>Cancel</Button><Button variant="success" className="create-organization-modal__submit" onClick={saveOrganization} loading={saving}>{editingOrg ? 'Save Changes' : 'Create Organization'} <span aria-hidden="true">→</span></Button></div>}
      >
        <div className="create-organization-form">
          <section className="create-organization-section">
            <div className="create-organization-section__heading"><Building2 /><div><h3>Organization profile</h3><p>Core business and contact information</p></div></div>
            <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
              <Input icon={Building2} className="create-organization-field" label="Organization Name" placeholder="e.g. TechNova Solutions" required error={formErrors.organizationName} value={form.organizationName} onChange={(e) => setForm({ ...form, organizationName: e.target.value })} />
              <Input icon={Mail} className="create-organization-field" label="Administrator Email" placeholder="admin@company.com" type="email" required error={formErrors.email} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input
                icon={Phone}
                className="create-organization-field"
                label="Phone"
                placeholder="98765 43210"
                error={formErrors.phone}
                value={form.phone}
                inputMode="numeric"
                maxLength={10}
                autoComplete="tel"
                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              />
              <Select icon={BriefcaseBusiness} className="create-organization-field" label="Industry" placeholder="Select industry" options={INDUSTRY_OPTIONS} value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
              <Select icon={Globe2} className="create-organization-field" label="Country" placeholder="Select country" options={COUNTRY_OPTIONS} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
              <Input icon={Link2} className="create-organization-field" label="Website" placeholder="https://company.com" error={formErrors.website} value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            </div>
          </section>
          {!editingOrg && <section className="create-organization-section create-organization-section--access">
            <div className="create-organization-section__heading"><ShieldCheck /><div><h3>Administrator access</h3><p>Create the first secure sign-in for this organization</p></div></div>
            <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
              <Input icon={LockKeyhole} className="create-organization-field" label="Password" type="password" required error={formErrors.password} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Minimum 8 characters" hint="Use letters, numbers and a symbol." autoComplete="new-password" />
              <Input icon={LockKeyhole} className="create-organization-field" label="Confirm Password" type="password" required error={formErrors.confirmPassword} value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Re-enter password" autoComplete="new-password" />
            </div>
          </section>}
        </div>
      </Modal>
      <Modal open={Boolean(deleteOrg)} onClose={() => !deleting && setDeleteOrg(null)} title="Delete organization?" size="sm" footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setDeleteOrg(null)} disabled={deleting}>Cancel</Button><Button variant="danger" loading={deleting} onClick={confirmDeleteOrganization}>{deleting ? 'Deleting...' : 'Delete Organization'}</Button></div>}><p className="text-sm leading-6 text-slate-600">Are you sure you want to delete <b>{deleteOrg?.name}</b>? This action cannot be undone.</p></Modal>
      <AccountCreatedModal
        open={Boolean(createdAccount)}
        {...createdAccount}
        onClose={() => setCreatedAccount(null)}
        onView={() => { setSelectedOrg(createdAccount?.record); setDrawerOpen(true); setCreatedAccount(null) }}
        onDashboard={() => setCreatedAccount(null)}
      />
    </div>
  )
}
