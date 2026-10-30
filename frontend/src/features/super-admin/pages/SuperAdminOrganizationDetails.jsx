import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Building2, BriefcaseBusiness, GraduationCap, Users, Layers3, BookOpen,
  CreditCard, Mail, Phone, MapPin, CheckCircle2, Edit3, BadgeIndianRupee
} from 'lucide-react'
import StatusBadge from '@shared/components/StatusBadge'
import Modal from '@shared/components/Modal'
import { Button, Input, Select } from '@shared/components/FormElements'
import { getApiErrorMessage, normalizeOrganization, organizationApi, superAdminOrganizationApi } from '@shared/services/apiServices'
import { studentsApi } from '@/api/students'
import { ROUTES } from '@shared/constants/routeConstants'
import KPI from '@/components/common/KPI'

const TABS = ['Overview', 'Students', 'Employees', 'Branches', 'Batches', 'Courses', 'Subscription', 'Activity']

const emptyText = '—'

const firstArray = (...values) => values.find(Array.isArray) ?? []

const firstNumber = (...values) => {
  let highest = 0
  for (const value of values) {
    if (value === undefined || value === null || value === '') continue
    const number = Number(value)
    if (Number.isFinite(number)) highest = Math.max(highest, number)
  }
  return highest
}

const getStudentOrganizationId = (student = {}) => (
  student.organizationId
  ?? student.OrganizationId
  ?? student.orgId
  ?? student.organization?.organizationId
  ?? student.organization?.id
)

const studentsForOrganization = (students, organizationId) => (
  (Array.isArray(students) ? students : []).filter((student) => (
    String(getStudentOrganizationId(student)) === String(organizationId)
  ))
)

const loadOrganizationStudents = async (organizationId) => {
  // This is the only student-list endpoint provided by the backend.
  const response = await studentsApi.list()
  const students = response.data
  const hasOrganizationId = students.some((student) => getStudentOrganizationId(student) != null)
  const scopedStudents = hasOrganizationId
    ? studentsForOrganization(students, organizationId)
    : students

  if (import.meta.env.DEV) {
    console.group('ORGANIZATION STUDENTS')
    console.log('Organization ID:', organizationId)
    console.log('Endpoint: /api/v1/organization/students')
    console.log('Response:', response.data)
    console.groupEnd()
  }

  return scopedStudents
}

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

// Stat cards use the global KPI card (same design in every portal).
const STAT_ACCENTS = {
  Students: "blue",
  Employees: "cyan",
  Batches: "purple",
  Courses: "green",
  Branches: "orange",
  Subscription: "red",
  "Monthly Revenue": "teal",
}

const StatCard = ({ label, value, icon }) => (
  <KPI label={label} value={value ?? emptyText} icon={icon} accent={STAT_ACCENTS[label] ?? "blue"} />
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
        const [profile, dashboardDetails, employeeDetails, studentDetails] = await Promise.all([
          organizationApi.getById(organizationId),
          superAdminOrganizationApi.getById(organizationId).catch(() => null),
          superAdminOrganizationApi.getEmployees(organizationId).catch(() => null),
          loadOrganizationStudents(organizationId).catch(() => null),
        ])
        if (!mounted) return
        const row = { ...(profile || {}), ...(dashboardDetails || {}) }
        const normalized = normalizeOrganization(row)
        const employeesFromApi = Array.isArray(employeeDetails) ? employeeDetails : null
        const studentsFromApi = Array.isArray(studentDetails) ? studentDetails : null
        setOrganization(normalized)
        window.dispatchEvent(new CustomEvent('organization-details-loaded', {
          detail: { name: normalized.organizationName || normalized.name || 'Organization Details' },
        }))
        setData((current) => ({
          ...current,
          students: studentsFromApi ?? firstArray(row.studentRecords, row.studentsList, row.students?.items, row.students?.records),
          employees: employeesFromApi ?? firstArray(row.employeeRecords, row.employeesList, row.employees?.items, row.employees?.records),
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
          if (!data.students.length) {
            const students = await loadOrganizationStudents(organizationId)
            setData((current) => ({
              ...current,
              students,
            }))
          }
        } else if (activeTab === 'Employees') {
          if (!data.employees.length) {
            const employees = await superAdminOrganizationApi.getEmployees(organizationId)
            const scopedEmployees = employees.filter((employee) => {
              const employeeOrganizationId = employee.organizationId
                ?? employee.OrganizationId
                ?? employee.orgId
                ?? employee.organization?.organizationId
                ?? employee.organization?.id

              return employeeOrganizationId == null
                || String(employeeOrganizationId) === String(organizationId)
            })
            setData((current) => ({ ...current, employees: scopedEmployees }))
          }
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
        const isEmployeePermissionError = activeTab === 'Employees' && tabError?.response?.status === 403
        const isStudentRequestError = activeTab === 'Students'
        setTabErrors((current) => ({
          ...current,
          [activeTab]: isStudentRequestError
            ? 'Student records could not be loaded for this organization. Please verify Super Admin access to the organization student API.'
            : isEmployeePermissionError
            ? 'Employee data exists, but the backend has not granted Super Admin access to the organization employee endpoint.'
            : getApiErrorMessage(tabError, `Unable to load ${activeTab.toLowerCase()}.`),
        }))
      } finally {
        setTabLoading((current) => ({ ...current, [activeTab]: false }))
      }
    }
    loadTab()
  }, [activeTab, organizationId, data.students.length, data.employees.length, data.branches.length, data.batches.length, data.courses.length, data.activity.length])

  const stats = useMemo(() => {
    const students = data.students.length > 0 ? data.students.length : firstNumber(organization?.students, organization?.studentCount, organization?.totalStudents, organization?.totalStudentCount)
    const employees = data.employees.length > 0 ? data.employees.length : firstNumber(organization?.employees, organization?.employeeCount, organization?.totalEmployees)
    const batches = firstNumber(organization?.batches, organization?.batchCount, organization?.totalBatches)
    const courses = data.courses.length > 0 ? data.courses.length : firstNumber(organization?.courses, organization?.courseCount, organization?.totalCourses)
    const branches = data.branches.length > 0 ? data.branches.length : firstNumber(organization?.branches, organization?.branchCount, organization?.totalBranches)
    const subscription = organization?.plan || organization?.subscription || 'Not assigned'
    const monthlyRevenue = `₹${Number(organization?.amount ?? organization?.monthlyRevenue ?? 0).toLocaleString('en-IN')}`
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
    <div className="mx-auto w-full min-w-0 max-w-[1600px] space-y-5 px-3 py-4 sm:px-6 sm:py-5 lg:px-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => navigate(ROUTES.SUPER_ADMIN.ORGANIZATIONS)} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-blue-600"><ArrowLeft className="h-4 w-4" /> Back to organizations</button>
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-slate-400">Organization workspace</p>
      </div>

      <section className="relative min-w-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#102a67] via-[#075fa5] to-[#069c9b] p-4 text-white shadow-[0_24px_55px_-30px_rgba(8,72,130,.8)] sm:rounded-[28px] sm:p-7">
        <span className="absolute -right-16 -top-24 h-64 w-64 rounded-full border-[35px] border-white/5" />
        <span className="absolute -bottom-24 right-1/3 h-48 w-48 rounded-full bg-cyan-300/10 blur-2xl" />
        <div className="relative flex min-w-0 flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-white/30 bg-white/15 !text-white shadow-xl backdrop-blur sm:h-16 sm:w-16">
              <Building2 className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <h1 className="min-w-0 break-words text-xl font-black leading-tight tracking-[-0.04em] !text-white sm:text-3xl">{organization.organizationName || organization.name}</h1>
                <StatusBadge status={statusLabel} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-blue-50/90">
                <span className="inline-flex items-center gap-1.5"><BriefcaseBusiness className="h-4 w-4" />{organization.industry || emptyText}</span>
                <span className="inline-flex min-w-0 items-center gap-1.5 break-all"><Mail className="h-4 w-4 shrink-0" />{organization.email || emptyText}</span>
                <span className="inline-flex items-center gap-1.5"><Phone className="h-4 w-4" />{organization.phone || emptyText}</span>
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{organization.country || emptyText}</span>
              </div>
              <p className="mt-3 font-mono text-xs font-semibold text-cyan-100">Organization ID: {organization.organizationId ?? organization.id ?? emptyText}</p>
            </div>
          </div>
          <div className="grid w-full gap-2 sm:flex sm:w-auto sm:flex-wrap">
            <button onClick={() => setEditOpen(true)} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"><Edit3 className="h-4 w-4" /> Edit organization</button>
            <button onClick={() => setConfirmApprove(true)} disabled={approveBusy || String(statusLabel).toLowerCase() === 'active'} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-blue-700 shadow-lg transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"><CheckCircle2 className="h-4 w-4" />{approveBusy ? 'Approving...' : 'Approve organization'}</button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <StatCard label="Students" value={stats.students ?? emptyText} icon={GraduationCap} />
        <StatCard label="Employees" value={stats.employees ?? emptyText} icon={Users} />
        <StatCard label="Batches" value={stats.batches ?? emptyText} icon={Layers3} />
        <StatCard label="Courses" value={stats.courses ?? emptyText} icon={BookOpen} />
        <StatCard label="Branches" value={stats.branches ?? emptyText} icon={Building2} />
        <StatCard label="Subscription" value={stats.subscription ?? emptyText} icon={CreditCard} />
        <StatCard label="Monthly Revenue" value={stats.monthlyRevenue ?? emptyText} icon={BadgeIndianRupee} />
      </div>

      <div className="sticky top-3 z-10 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-[0_10px_30px_-24px_rgba(15,23,42,.6)] backdrop-blur">
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
                <div key={employee.employeeId ?? employee.id ?? index} className="grid grid-cols-5 gap-3 border-b border-slate-100 px-4 py-3 text-sm last:border-b-0">
                  <span className="font-medium text-slate-900">{employee.fullName || employee.name || [employee.firstName, employee.lastName].filter(Boolean).join(' ') || emptyText}</span>
                  <span className="text-slate-600">{employee.designation || employee.role || emptyText}</span>
                  <span className="text-slate-600">{employee.email || emptyText}</span>
                  <span className="text-slate-600">{employee.departmentName || employee.department?.name || employee.department || emptyText}</span>
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
