import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Building2, BriefcaseBusiness, GraduationCap, Users, Layers3, BookOpen,
  CreditCard, Activity, Mail, Phone, Globe2, MapPin, CalendarDays, CheckCircle2, XCircle,
  Search, Loader2, Edit3, Check, BadgeIndianRupee, Banknote, TrendingUp, Clock3, ShieldCheck
} from 'lucide-react'
import PageHeader from '@shared/components/PageHeader'
import StatusBadge from '@shared/components/StatusBadge'
import Modal from '@shared/components/Modal'
import { Button, Input, Select } from '@shared/components/FormElements'
import { getApiErrorMessage, normalizeOrganization, organizationApi, superAdminOrganizationApi } from '@shared/services/apiServices'
import { ROUTES } from '@shared/constants/routeConstants'

const TABS = ['Overview', 'Students', 'Employees', 'Branches', 'Batches', 'Courses', 'Subscription', 'Activity']

const emptyText = '—'

const firstArray = (...values) => values.find(Array.isArray) ?? []

const formatDateTime = (value) => {
  if (!value) return emptyText
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  const hasTime = /[T\s]\d{1,2}[:.]/.test(String(value))
  return date.toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    ...(hasTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  })
}

const StatCard = ({ label, value, icon: Icon }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">{value ?? emptyText}</p>
      </div>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-50 text-slate-600">
        <Icon className="h-4 w-4" />
      </span>
    </div>
  </div>
)

const SectionCard = ({ title, description, children, action }) => (
  <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-base font-semibold text-slate-950">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      {action}
    </div>
    {children}
  </section>
)

const EmptyState = ({ title, description }) => (
  <div className="grid min-h-[220px] place-items-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
    <div>
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  </div>
)

const SkeletonBlock = ({ className = '' }) => <div className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`} />

const DetailRow = ({ label, value }) => (
  <div className="rounded-2xl bg-slate-50 px-4 py-3">
    <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">{label}</p>
    <p className="mt-1 text-sm font-medium text-slate-900">{value ?? emptyText}</p>
  </div>
)

export default function SuperAdminOrganizationDetails() {
  const { organizationId } = useParams()
  const navigate = useNavigate()
  const [organization, setOrganization] = useState(null)
  const [activeTab, setActiveTab] = useState('Overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tabLoading, setTabLoading] = useState({ Overview: false, Students: false, Employees: false, Branches: false, Batches: false, Courses: false, Subscription: false, Activity: false })
  const [tabErrors, setTabErrors] = useState({})
  const [data, setData] = useState({ students: [], employees: [], branches: [], batches: [], courses: [], subscriptions: [], activity: [] })
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [approveBusy, setApproveBusy] = useState(false)
  const [form, setForm] = useState({ organizationName: '', email: '', phone: '', industry: '', country: '', website: '', status: '' })
  const [confirmApprove, setConfirmApprove] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const [profile, dashboardDetails] = await Promise.all([
          organizationApi.getById(organizationId),
          superAdminOrganizationApi.getById(organizationId).catch(() => null),
        ])
        if (!mounted) return
        const row = { ...(profile || {}), ...(dashboardDetails || {}) }
        const normalized = normalizeOrganization(row)
        setOrganization(normalized)
        setData((current) => ({
          ...current,
          students: firstArray(row.studentRecords, row.studentsList, row.students?.items, row.students?.records),
          employees: firstArray(row.employeeRecords, row.employeesList, row.employees?.items, row.employees?.records),
          branches: firstArray(row.branchRecords, row.branchesList, row.branches?.items, row.branches?.records),
          batches: firstArray(row.batchRecords, row.batchesList, row.batches?.items, row.batches?.records),
          courses: firstArray(row.courseRecords, row.coursesList, row.courses?.items, row.courses?.records),
          activity: firstArray(row.activity, row.activities, row.recentActivity),
        }))
        setForm({
          organizationName: normalized.organizationName || normalized.name || '',
          email: normalized.email || '',
          phone: normalized.phone || '',
          industry: normalized.industry || '',
          country: normalized.country || '',
          website: normalized.website || '',
          status: normalized.status || '',
        })
      } catch (loadError) {
        if (!mounted) return
        setError(getApiErrorMessage(loadError, 'Unable to load organization details.'))
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [organizationId])

  useEffect(() => {
    if (!organizationId) return
    const loadTab = async () => {
      setTabLoading((current) => ({ ...current, [activeTab]: true }))
      setTabErrors((current) => ({ ...current, [activeTab]: '' }))
      try {
        if (activeTab === 'Students') {
          if (!data.students.length) setTabErrors((current) => ({ ...current, Students: 'Detailed student records are not included in the available Super Admin organization APIs.' }))
        } else if (activeTab === 'Employees') {
          if (!data.employees.length) setTabErrors((current) => ({ ...current, Employees: 'Detailed employee records require a Super Admin organization-employee endpoint.' }))
        } else if (activeTab === 'Branches') {
          if (!data.branches.length) setTabErrors((current) => ({ ...current, Branches: 'Detailed branch records are not included in the available Super Admin organization APIs.' }))
        } else if (activeTab === 'Courses') {
          if (!data.courses.length) setTabErrors((current) => ({ ...current, Courses: 'Detailed course records are not included in the available Super Admin organization APIs.' }))
        } else if (activeTab === 'Subscription') {
          const subscription = await superAdminOrganizationApi.getSubscription(organizationId)
          const rows = Array.isArray(subscription) ? subscription : subscription ? [subscription] : []
          setData((current) => ({ ...current, subscriptions: rows }))
        } else if (activeTab === 'Batches') {
          if (!data.batches.length) setTabErrors((current) => ({ ...current, Batches: 'Detailed batch records are not included in the available Super Admin organization APIs.' }))
        } else if (activeTab === 'Activity') {
          if (!data.activity.length) setTabErrors((current) => ({ ...current, Activity: 'Organization activity is not included in the available Super Admin organization APIs.' }))
        }
      } catch (tabError) {
        setTabErrors((current) => ({ ...current, [activeTab]: getApiErrorMessage(tabError, `Unable to load ${activeTab.toLowerCase()}.`) }))
      } finally {
        setTabLoading((current) => ({ ...current, [activeTab]: false }))
      }
    }
    loadTab()
  }, [activeTab, organizationId, data.students.length, data.employees.length, data.branches.length, data.batches.length, data.courses.length, data.activity.length])

  const stats = useMemo(() => {
    const students = data.students.length || organization?.students
    const employees = data.employees.length || organization?.employees
    const batches = organization?.batches ?? null
    const courses = data.courses.length || organization?.courses
    const branches = data.branches.length || organization?.branches || organization?.branchCount || null
    const subscription = organization?.plan || organization?.subscription || null
    const monthlyRevenue = organization?.amount ? `₹${Number(organization.amount).toLocaleString()}` : null
    return { students, employees, batches, courses, branches, subscription, monthlyRevenue }
  }, [data, organization])

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    try {
      await organizationApi.update(organizationId, form)
      const updated = normalizeOrganization({ ...organization, ...form })
      setOrganization(updated)
      setEditOpen(false)
      toast.success('Organization updated')
    } catch (saveError) {
      toast.error(getApiErrorMessage(saveError, 'Unable to update organization.'))
    } finally {
      setSaving(false)
    }
  }

  const handleApprove = async () => {
    if (!organization || approveBusy) return
    setApproveBusy(true)
    try {
      await organizationApi.update(organizationId, { ...organization, status: 'active', approvalStatus: 'approved' })
      setOrganization((current) => ({ ...current, status: 'active', approvalStatus: 'approved' }))
      toast.success('Organization approved')
      setConfirmApprove(false)
    } catch (approveError) {
      toast.error(getApiErrorMessage(approveError, 'Unable to approve organization.'))
    } finally {
      setApproveBusy(false)
    }
  }

  const statusLabel = organization?.status || organization?.approvalStatus || 'pending'

  if (loading) {
    return (
      <div className="space-y-5 p-4 sm:p-6 lg:p-7">
        <SkeletonBlock className="h-24 w-full" />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
          {Array.from({ length: 7 }).map((_, index) => <SkeletonBlock key={index} className="h-24" />)}
        </div>
        <SkeletonBlock className="h-[560px] w-full" />
      </div>
    )
  }

  if (error || !organization) {
    return (
      <div className="p-4 sm:p-6 lg:p-7">
        <SectionCard title="Organization details" description="We could not load this record.">
          <div className="flex flex-col gap-4">
            <p className="text-sm text-rose-600">{error || 'Organization not found.'}</p>
            <div>
              <Button onClick={() => navigate(ROUTES.SUPER_ADMIN.ORGANIZATIONS)}>Back to organizations</Button>
            </div>
          </div>
        </SectionCard>
      </div>
    )
  }

  return (
    <div className="space-y-5 px-4 py-3 sm:px-6 lg:px-7">
      <PageHeader
        showBreadcrumb={false}
        compact
        title={organization.organizationName || organization.name}
        subtitle={organization.industry || 'Organization details'}
        actions={
          <>
            <Button variant="outline" icon={ArrowLeft} onClick={() => navigate(ROUTES.SUPER_ADMIN.ORGANIZATIONS)}>Organizations</Button>
            <Button variant="outline" icon={Edit3} onClick={() => setEditOpen(true)}>Edit Organization</Button>
            <Button icon={CheckCircle2} onClick={() => setConfirmApprove(true)} disabled={approveBusy || String(statusLabel).toLowerCase() === 'active'}>
              {approveBusy ? 'Approving...' : 'Approve Organization'}
            </Button>
          </>
        }
      />

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">{organization.organizationName || organization.name}</h1>
                <StatusBadge status={statusLabel} />
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5"><BriefcaseBusiness className="h-4 w-4" />{organization.industry || emptyText}</span>
                <span className="inline-flex items-center gap-1.5"><Mail className="h-4 w-4" />{organization.email || emptyText}</span>
                <span className="inline-flex items-center gap-1.5"><Phone className="h-4 w-4" />{organization.phone || emptyText}</span>
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{organization.country || emptyText}</span>
              </div>
              <p className="mt-2 text-sm text-slate-500">Organization ID: {organization.organizationId ?? organization.id ?? emptyText}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
        <StatCard label="Students" value={stats.students ?? emptyText} icon={GraduationCap} />
        <StatCard label="Employees" value={stats.employees ?? emptyText} icon={Users} />
        <StatCard label="Batches" value={stats.batches ?? emptyText} icon={Layers3} />
        <StatCard label="Courses" value={stats.courses ?? emptyText} icon={BookOpen} />
        <StatCard label="Branches" value={stats.branches ?? emptyText} icon={Building2} />
        <StatCard label="Subscription" value={stats.subscription ?? emptyText} icon={CreditCard} />
        <StatCard label="Monthly Revenue" value={stats.monthlyRevenue ?? emptyText} icon={BadgeIndianRupee} />
      </div>

      <div className="sticky top-3 z-10 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-sm backdrop-blur">
        <div className="flex gap-2 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition ${
                activeTab === tab ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'Overview' && (
        <SectionCard title="Organization Information" description="Core profile and contact details">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <DetailRow label="Organization name" value={organization.organizationName || organization.name} />
            <DetailRow label="Email" value={organization.email} />
            <DetailRow label="Phone" value={organization.phone} />
            <DetailRow label="Industry" value={organization.industry} />
            <DetailRow label="Country" value={organization.country} />
            <DetailRow label="Website" value={organization.website} />
            <DetailRow label="Company size" value={organization.size || organization.organizationSize} />
            <DetailRow label="Created date" value={formatDateTime(organization.createdDate ?? organization.createdAt)} />
            <DetailRow label="Status" value={statusLabel} />
          </div>
        </SectionCard>
      )}

      {activeTab === 'Students' && (
        <SectionCard title="Students" description="Students belonging to this organization">
          {tabLoading.Students ? <SkeletonBlock className="h-64 w-full" /> : tabErrors.Students ? <EmptyState title="Unable to load students." description={tabErrors.Students} /> : data.students.length ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="grid grid-cols-7 gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <span>Student</span><span>Email</span><span>Course</span><span>Batch</span><span>Attendance</span><span>Status</span><span>Actions</span>
              </div>
              {data.students.map((student, index) => (
                <div key={student.id ?? index} className="grid grid-cols-7 gap-3 border-b border-slate-100 px-4 py-3 text-sm last:border-b-0">
                  <span className="font-medium text-slate-900">{student.name || student.firstName || emptyText}</span>
                  <span className="text-slate-600">{student.email || emptyText}</span>
                  <span className="text-slate-600">{student.course || student.courseName || emptyText}</span>
                  <span className="text-slate-600">{student.batch || student.batchName || emptyText}</span>
                  <span className="text-slate-600">{student.attendance || student.progress ? `${student.attendance ?? student.progress}%` : emptyText}</span>
                  <span className="text-slate-600">{student.status || emptyText}</span>
                  <button className="text-left font-medium text-slate-950">View</button>
                </div>
              ))}
            </div>
          ) : <EmptyState title="No students found" description="This organization does not currently have any students." />}
        </SectionCard>
      )}

      {activeTab === 'Employees' && (
        <SectionCard title="Employees" description="Workforce, mentors, trainers, and staff">
          {tabLoading.Employees ? <SkeletonBlock className="h-64 w-full" /> : tabErrors.Employees ? <EmptyState title="Unable to load employees." description={tabErrors.Employees} /> : data.employees.length ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="grid grid-cols-5 gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <span>Employee</span><span>Role</span><span>Email</span><span>Department</span><span>Status</span>
              </div>
              {data.employees.map((employee, index) => (
                <div key={employee.id ?? index} className="grid grid-cols-5 gap-3 border-b border-slate-100 px-4 py-3 text-sm last:border-b-0">
                  <span className="font-medium text-slate-900">{employee.name || employee.firstName || emptyText}</span>
                  <span className="text-slate-600">{employee.designation || employee.role || emptyText}</span>
                  <span className="text-slate-600">{employee.email || emptyText}</span>
                  <span className="text-slate-600">{employee.department || emptyText}</span>
                  <span className="text-slate-600">{employee.status || emptyText}</span>
                </div>
              ))}
            </div>
          ) : <EmptyState title="No employees found" description="This organization does not currently have any employees." />}
        </SectionCard>
      )}

      {activeTab === 'Branches' && (
        <SectionCard title="Branches" description="Organization locations and branch operations">
          {tabLoading.Branches ? <SkeletonBlock className="h-64 w-full" /> : tabErrors.Branches ? <EmptyState title="Branch details unavailable" description={tabErrors.Branches} /> : data.branches.length ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {data.branches.map((branch, index) => (
                <article key={branch.branchId ?? branch.id ?? index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0"><p className="truncate font-semibold text-slate-950">{branch.branchName ?? branch.name ?? emptyText}</p><p className="mt-1 font-mono text-xs text-blue-600">{branch.branchCode ?? branch.code ?? emptyText}</p></div>
                    <StatusBadge status={branch.status ?? 'active'} />
                  </div>
                  <p className="mt-3 text-sm leading-5 text-slate-500">{branch.address ?? branch.location ?? branch.city ?? 'Address not provided'}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-200 pt-3 text-xs text-slate-500"><span>Manager: <b className="text-slate-700">{branch.managerName ?? branch.branchManager ?? 'Unassigned'}</b></span><span>Employees: <b className="text-slate-700">{branch.employeeCount ?? branch.employees ?? emptyText}</b></span></div>
                </article>
              ))}
            </div>
          ) : <EmptyState title="No branches found" description="No branch records were returned for this organization." />}
        </SectionCard>
      )}

      {activeTab === 'Batches' && (
        <SectionCard title="Batches" description="Batch operations for this organization">
          {tabLoading.Batches ? <SkeletonBlock className="h-64 w-full" /> : tabErrors.Batches ? <EmptyState title="Batch details unavailable" description={tabErrors.Batches} /> : data.batches.length ? (
            <div className="space-y-2">{data.batches.map((batch, index) => <div key={batch.id ?? batch.batchId ?? index} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><p className="font-medium text-slate-900">{batch.batchName ?? batch.name ?? emptyText}</p><p className="mt-1 text-sm text-slate-500">{batch.courseName ?? batch.course ?? 'Course not provided'} · {batch.status ?? 'Status not provided'}</p></div>)}</div>
          ) : <EmptyState title="No batches created yet" description="No batch records were returned for this organization." />}
        </SectionCard>
      )}

      {activeTab === 'Courses' && (
        <SectionCard title="Courses" description="Courses used by this organization">
          {tabLoading.Courses ? <SkeletonBlock className="h-64 w-full" /> : tabErrors.Courses ? <EmptyState title="Unable to load courses." description={tabErrors.Courses} /> : data.courses.length ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="grid grid-cols-6 gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <span>Course</span><span>Category</span><span>Batches</span><span>Students</span><span>Duration</span><span>Status</span>
              </div>
              {data.courses.map((course, index) => (
                <div key={course.id ?? index} className="grid grid-cols-6 gap-3 border-b border-slate-100 px-4 py-3 text-sm last:border-b-0">
                  <span className="font-medium text-slate-900">{course.title || course.courseName || emptyText}</span>
                  <span className="text-slate-600">{course.category || emptyText}</span>
                  <span className="text-slate-600">{course.batchCount ?? emptyText}</span>
                  <span className="text-slate-600">{course.studentCount ?? emptyText}</span>
                  <span className="text-slate-600">{course.duration || emptyText}</span>
                  <span className="text-slate-600">{course.status || emptyText}</span>
                </div>
              ))}
            </div>
          ) : <EmptyState title="No courses found" description="No course data is currently returned for this organization." />}
        </SectionCard>
      )}

      {activeTab === 'Subscription' && (
        <SectionCard title="Subscription" description="Billing and plan details">
          {tabLoading.Subscription ? <SkeletonBlock className="h-64 w-full" /> : tabErrors.Subscription ? <EmptyState title="Unable to load subscription." description={tabErrors.Subscription} /> : data.subscriptions.length ? (
            <div className="space-y-3">
              {data.subscriptions.map((subscription, index) => (
                <div key={subscription.id ?? index} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2 xl:grid-cols-4">
                  <DetailRow label="Current plan" value={subscription.planName || subscription.plan} />
                  <DetailRow label="Billing cycle" value={subscription.billingCycle || emptyText} />
                  <DetailRow label="Price" value={subscription.price ? `₹${Number(subscription.price).toLocaleString()}` : emptyText} />
                  <DetailRow label="Payment status" value={subscription.paymentStatus || subscription.status || emptyText} />
                </div>
              ))}
            </div>
          ) : <EmptyState title="No active subscription" description="Subscription data is not available for this organization." />}
        </SectionCard>
      )}

      {activeTab === 'Activity' && (
        <SectionCard title="Activity" description="Recent organization activity">
          {tabLoading.Activity ? <SkeletonBlock className="h-64 w-full" /> : tabErrors.Activity ? <EmptyState title="Activity unavailable" description={tabErrors.Activity} /> : data.activity.length ? (
            <div className="space-y-2">{data.activity.map((item, index) => <div key={item.id ?? index} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><p className="font-medium text-slate-900">{item.title ?? item.action ?? item.description ?? emptyText}</p><p className="mt-1 text-sm text-slate-500">{formatDateTime(item.createdDate ?? item.createdAt ?? item.date)}</p></div>)}</div>
          ) : <EmptyState title="No activity available" description="No activity records were returned for this organization." />}
        </SectionCard>
      )}

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Organization" size="lg">
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Organization name" value={form.organizationName} onChange={(e) => setForm((current) => ({ ...current, organizationName: e.target.value }))} />
          <Input label="Email" value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))} />
          <Input label="Website" value={form.website} onChange={(e) => setForm((current) => ({ ...current, website: e.target.value }))} />
          <Input label="Industry" value={form.industry} onChange={(e) => setForm((current) => ({ ...current, industry: e.target.value }))} />
          <Input label="Country" value={form.country} onChange={(e) => setForm((current) => ({ ...current, country: e.target.value }))} />
          <Select label="Status" value={form.status} onChange={(e) => setForm((current) => ({ ...current, status: e.target.value }))}>
            <option value="">Select status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="rejected">Rejected</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</Button>
        </div>
      </Modal>

      <Modal isOpen={confirmApprove} onClose={() => setConfirmApprove(false)} title="Approve Organization" size="md">
        <p className="text-sm text-slate-600">Are you sure you want to approve "{organization.organizationName || organization.name}"? This will allow the organization to access the platform.</p>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setConfirmApprove(false)}>Cancel</Button>
          <Button onClick={handleApprove} disabled={approveBusy}>{approveBusy ? 'Approving...' : 'Approve'}</Button>
        </div>
      </Modal>
    </div>
  )
}
