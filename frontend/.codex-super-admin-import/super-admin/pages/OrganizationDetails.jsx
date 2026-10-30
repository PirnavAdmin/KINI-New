import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  Ban,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  CreditCard,
  Edit3,
  FileClock,
  Globe,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  ShieldCheck,
  Users,
} from 'lucide-react'
import StatusBadge from '@shared/components/StatusBadge'
import { Button, Input } from '@shared/components/FormElements'
import Modal from '@shared/components/Modal'
import { ROUTES } from '@shared/constants/routeConstants'
import {
  ORGANIZATIONS,
  GLOBAL_EMPLOYEES,
  SUBSCRIPTIONS,
} from '@shared/data/superAdminPageMockData'
import {
  employeeApi,
  getApiErrorMessage,
  normalizeOrganization,
  organizationApi,
  subscriptionApi,
} from '@shared/services/apiServices'
import { useAuth } from '@shared/hooks/useAuth'
import {
  findStoredMockOrganization,
  isStoredMockOrganization,
  updateStoredMockOrganization,
  getOrganizationStatusOverride,
  setOrganizationStatusOverride,
} from '@shared/services/mockOrganizationService'

// ─── Status treatment (kept in line with the existing status vocabulary) ────
const ORG_STATUS_STYLES = {
  active: {
    label: 'Active',
    classes:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20',
    dot: 'bg-emerald-500',
  },
  pending: {
    label: 'Pending',
    classes:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20',
    dot: 'bg-amber-500',
  },
  suspended: {
    label: 'Suspended',
    classes:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20',
    dot: 'bg-red-500',
  },
  trial: {
    label: 'Trial',
    classes:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20',
    dot: 'bg-blue-500',
  },
  expired: {
    label: 'Expired',
    classes:
      'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700/40 dark:text-slate-300 dark:border-slate-600',
    dot: 'bg-slate-400',
  },
}

function OrgStatusBadge({ status = 'pending' }) {
  const config = ORG_STATUS_STYLES[status] || ORG_STATUS_STYLES.pending
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.classes}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}

const BRAND_GRADIENT =
  'bg-gradient-to-br from-[#0877B9] via-[#278F8D] to-[#58A94B]'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1], delay },
})

// Reuses the same normalization + enrichment vocabulary as the organization
// directory so a record always exposes the same field names.
const enrichOrganization = (row = {}, index = 0) => {
  const normalized = normalizeOrganization(row)
  const name = normalized.name || row.name || 'Unnamed organization'
  // Mirror the directory's enrichment so every metric stays synchronized with
  // the Organizations table (mock-created orgs → 3 employees, 24 students, 1 branch).
  const matchedEmployees = GLOBAL_EMPLOYEES.filter((item) => item.organization === name)
  const employeeRecords = (matchedEmployees.length
    ? matchedEmployees
    : Array.from({ length: 3 }, (_, offset) => GLOBAL_EMPLOYEES[(index * 2 + offset) % GLOBAL_EMPLOYEES.length])
  ).map((item) => ({ ...item, id: `${row.id || index}-${item.id}`, organization: name }))
  const employees = Number(row.employees ?? row.employeeCount ?? employeeRecords.length ?? 0)
  const students = Number(row.students ?? row.studentCount ?? Math.max(24, Math.round(employees * 0.68)))
  const branches = Number(row.branches ?? row.branchCount ?? Math.max(1, Math.ceil(employees / 650)))
  const activeStudents = Number(row.activeStudents ?? Math.round(students * 0.86))
  const activeEmployees = Number(row.activeEmployees ?? row.activeEmployeeCount ?? Math.round(employees * 0.91))
  return {
    ...normalized,
    name,
    industry: normalized.industry || '',
    country: normalized.country || '',
    email: normalized.email || '',
    phone: normalized.phone || '',
    website: normalized.website || '',
    size: row.size ?? row.organizationSize ?? '',
    employees,
    students,
    branches,
    activeStudents,
    inactiveStudents: Number(row.inactiveStudents ?? Math.max(0, students - activeStudents)),
    activeEmployees,
    inactiveEmployees: Number(row.inactiveEmployees ?? Math.max(0, employees - activeEmployees)),
    plan: row.subscriptionPlan ?? row.plan ?? row.planName ?? row.subscription ?? '',
    amount: Number(row.amount ?? row.subscriptionAmount ?? 0),
    expiryDate: row.expiryDate ?? row.subscriptionEndDate ?? '',
    seats: Number(row.seats ?? row.maxUsers ?? row.userLimit ?? 0) || null,
    billingCycle: row.billingCycle ?? '',
    status: String(
      row.status ?? row.organizationStatus ?? row.approvalStatus ?? 'pending',
    ).toLowerCase(),
  }
}

const formatCreatedDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

// Renders a date, and includes the time when the source value carries one.
const formatDateTime = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  const hasTime = /[T\s]\d{1,2}[:.]/.test(String(value))
  const options = { day: 'numeric', month: 'short', year: 'numeric' }
  if (hasTime) {
    options.hour = 'numeric'
    options.minute = '2-digit'
  }
  return date.toLocaleString('en-IN', options)
}

// ─── Compact KPI metric card ────────────────────────────────────────────────
function MetricCard({ icon: Icon, color, label, value, sub }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
      <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: color }} />
      <div className="flex items-center gap-3">
        <div
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
          style={{ background: `${color}14` }}
        >
          <Icon className="h-[18px] w-[18px]" style={{ color }} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xl font-bold leading-none tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>
        </div>
      </div>
      {sub ? (
        <p className="mt-2 truncate border-t border-slate-100 pt-2 text-[11px] font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400">
          {sub}
        </p>
      ) : null}
    </div>
  )
}

// ─── Section card header ────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, color, title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <div
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
          style={{ background: `${color}14` }}
        >
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-bold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h3>
          {subtitle ? (
            <p className="truncate text-xs text-slate-400">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {action}
    </div>
  )
}

// ─── Field label/value pair ─────────────────────────────────────────────────
function Field({ label, value, mono = false }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </dt>
      <dd
        className={`mt-1 truncate text-sm font-semibold text-slate-800 dark:text-slate-100 ${
          mono ? 'font-mono text-[#0f55f7] dark:text-[#3b82f6]' : ''
        }`}
        title={value}
      >
        {value}
      </dd>
    </div>
  )
}

const CARD_CLASS =
  'rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-5'

const NAV_TABS = [
  { key: 'overview', label: 'Overview', target: 'org-overview' },
  { key: 'users', label: 'Users', target: 'org-users' },
  { key: 'students', label: 'Students', route: ROUTES.SUPER_ADMIN.STUDENTS },
  { key: 'employees', label: 'Employees', route: ROUTES.SUPER_ADMIN.EMPLOYEES },
  { key: 'branches', label: 'Branches', target: 'org-branches' },
  { key: 'subscription', label: 'Subscription', target: 'org-subscription' },
  { key: 'activity', label: 'Activity', target: 'org-activity' },
]

export default function OrganizationDetails() {
  const { organizationId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const isDemo = Boolean(
    user?.isDemo || String(user?.email || '').includes('demo'),
  )

  const passedOrg = location.state?.organization
  const [org, setOrg] = useState(() => (passedOrg ? enrichOrganization(passedOrg) : null))
  const [loading, setLoading] = useState(!passedOrg)
  const [notFound, setNotFound] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [users, setUsers] = useState([])
  const [subscription, setSubscription] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ organizationName: '', email: '', phone: '', industry: '', country: '', website: '' })
  const [formErrors, setFormErrors] = useState({})

  // Confirmation dialog state for suspend/activate
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false)
  const [pendingStatusAction, setPendingStatusAction] = useState(null)
  const [statusReason, setStatusReason] = useState('')

  const usersRef = useRef(null)

  // Reset derived state whenever the route id changes so a previous
  // organization never flashes on screen while the next one loads.
  useEffect(() => {
    const passed = location.state?.organization
    // Reset is a deliberate one-time sync with the route param, not derived state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrg(passed ? enrichOrganization(passed) : null)
    setLoading(!passed)
    setNotFound(false)
    setLoadError('')
    setUsers([])
    setSubscription(null)
    setEditOpen(false)
    setActiveTab('overview')
    // location.state is intentionally not a dependency: state is read once per id change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId])

  useEffect(() => {
    let active = true

    const load = async () => {
      if (!organizationId) return

      // Demo sessions never hit the API (a demo token would 401 → login redirect).
      if (isDemo) {
        const mock = ORGANIZATIONS.find(
          (item) => String(item.id) === String(organizationId),
        )
        // Mock-created organizations (Create Organization flow) aren't in the
        // seed list — resolve them from the localStorage store first, then fall
        // back to the record passed via navigation state. This keeps the
        // details page working after a hard refresh / direct URL visit.
        const storedMock = findStoredMockOrganization(organizationId)
        const source = mock || storedMock || passedOrg
        if (!source) {
          setNotFound(true)
          setLoading(false)
          return
        }
        const enriched = enrichOrganization(source)
        // Apply persisted status override so the status survives refreshes
        // for ALL organizations (both seed and mock-created).
        const statusOverride = getOrganizationStatusOverride(organizationId)
        if (statusOverride) enriched.status = statusOverride
        setOrg(enriched)
        setUsers(
          GLOBAL_EMPLOYEES.filter((item) => item.organization === source.name),
        )
        setSubscription(
          SUBSCRIPTIONS.find((item) => item.organization === source.name) || null,
        )
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const details = await organizationApi.getById(organizationId)
        const enriched = enrichOrganization(details)
        if (!active) return
        setOrg(enriched)
        setLoading(false)

        // Best-effort workforce + subscription enrichment.
        try {
          const rows = await employeeApi.list({
            organizationId: Number(organizationId),
          })
          if (active) setUsers(Array.isArray(rows) ? rows : [])
        } catch {
          if (active) setUsers([])
        }
        try {
          const subs = await subscriptionApi.list()
          if (active) {
            const list = Array.isArray(subs) ? subs : []
            const match = list.find(
              (item) =>
                String(
                  item.organizationId ?? item.organization?.organizationId,
                ) === String(organizationId) ||
                String(item.organization ?? '') === String(enriched.name ?? ''),
            )
            setSubscription(match || null)
          }
        } catch {
          if (active) setSubscription(null)
        }
      } catch (error) {
        if (!active) return
        const passed = location.state?.organization
        if (passed) {
          setOrg(enrichOrganization(passed))
          setLoadError(getApiErrorMessage(error, 'Live details unavailable.'))
          setLoading(false)
        } else {
          setLoadError(
            getApiErrorMessage(error, 'Unable to load organization details.'),
          )
          setNotFound(true)
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      active = false
    }
    // location.state is read once per id change and is intentionally excluded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, isDemo])

  // Scroll-spy: keep the navigation tab in sync with the section in view.
  // The KPI row (org-branches) sits at the top of the page, so it is excluded
  // from the observer — it remains a valid click target, but it must never win
  // the scroll-spy or "Branches" would appear active on page load.
  useEffect(() => {
    const targets = NAV_TABS.filter((tab) => tab.target && tab.key !== 'branches')
      .map((tab) => ({ key: tab.key, el: document.getElementById(tab.target) }))
      .filter((item) => item.el)
    if (!targets.length) return undefined
    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter((entry) => entry.isIntersecting)
        if (!intersecting.length) return
        const nearest = intersecting.reduce((a, b) =>
          a.boundingClientRect.top <= b.boundingClientRect.top ? a : b,
        )
        const match = targets.find((item) => item.el === nearest.target)
        if (match) setActiveTab(match.key)
      },
      { rootMargin: '-15% 0px -60% 0px', threshold: 0 },
    )
    targets.forEach((item) => observer.observe(item.el))
    return () => observer.disconnect()
  }, [org?.id])

  const openEdit = () => {
    setForm({
      organizationName: org?.name || org?.organizationName || '',
      email: org?.email || '',
      phone: org?.phone || '',
      industry: org?.industry || '',
      country: org?.country || '',
      website: org?.website || '',
    })
    setFormErrors({})
    setEditOpen(true)
  }

  const saveEdit = async () => {
    const errors = {}
    if (!form.organizationName.trim()) errors.organizationName = 'Organization name is required.'
    if (!form.email.trim()) errors.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email address.'
    if (form.phone && !/^[+\d][\d\s()-]{6,19}$/.test(form.phone)) errors.phone = 'Enter a valid phone number.'
    if (form.website) {
      try { new URL(form.website) } catch { errors.website = 'Enter a complete URL, for example https://example.com.' }
    }
    setFormErrors(errors)
    if (Object.keys(errors).length) return

    const nextOrg = {
      ...org,
      name: form.organizationName.trim(),
      organizationName: form.organizationName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      industry: form.industry.trim(),
      country: form.country.trim(),
      website: form.website.trim(),
    }
    setSaving(true)
    const orgIdValue = org.organizationId ?? org.id
    const updatePayload = {
      organizationName: nextOrg.name,
      name: nextOrg.name,
      email: nextOrg.email,
      adminEmail: nextOrg.email,
      phone: nextOrg.phone,
      industry: nextOrg.industry,
      country: nextOrg.country,
      website: nextOrg.website,
    }
    try {
      if (isDemo) {
        setOrg(nextOrg)
        // Keep mock-created organizations in sync with the localStorage store so
        // edits made on this page survive refreshes and table refetches.
        if (isStoredMockOrganization(orgIdValue)) {
          updateStoredMockOrganization(orgIdValue, updatePayload)
        }
        toast.success('Organization updated')
      } else {
        await organizationApi.update(orgIdValue, {
          organizationName: nextOrg.name,
          email: nextOrg.email,
          phone: nextOrg.phone,
          industry: nextOrg.industry,
          country: nextOrg.country,
          website: nextOrg.website,
        })
        setOrg(nextOrg)
        toast.success('Organization updated')
      }
      setEditOpen(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to save organization'))
    } finally {
      setSaving(false)
    }
  }

  // Opens the confirmation dialog for suspend/activate.
  const requestStatusChange = (nextStatus) => {
    setPendingStatusAction(nextStatus)
    setStatusReason('')
    setStatusConfirmOpen(true)
  }

  const changeOrganizationStatus = async (nextStatus) => {
    const actionLabel = nextStatus === 'active' ? 'activate' : 'suspend'

    try {
      if (isDemo) {
        const orgIdValue = org.organizationId ?? org.id
        // Persist the status override for ALL organizations (both seed and
        // mock-created) so it survives refreshes, navigation, and table refetches.
        setOrganizationStatusOverride(orgIdValue, nextStatus)
        // Also sync the mock-created org store if applicable.
        if (isStoredMockOrganization(orgIdValue)) {
          const timestamp = new Date().toISOString()
          updateStoredMockOrganization(orgIdValue, {
            status: nextStatus,
            approvalStatus: nextStatus === 'active' ? 'approved' : 'suspended',
            approvalReason: statusReason.trim() || 'Status changed by Super Admin',
            approvedAt: nextStatus === 'active' ? timestamp : undefined,
            suspendedAt: nextStatus === 'suspended' ? timestamp : undefined,
            updatedAt: timestamp,
          })
        }
        setOrg((current) => ({ ...current, status: nextStatus }))
        toast.success(
          nextStatus === 'active'
            ? 'Organization activated successfully'
            : 'Organization suspended successfully',
        )
        return
      }
      const organizationIdValue = org.organizationId ?? org.id
      const responsibleUserId = user?.userId ?? user?.id ?? localStorage.getItem('userId')
      const timestamp = new Date().toISOString()
      await organizationApi.update(organizationIdValue, {
        ...org,
        organizationName: org.organizationName ?? org.name,
        status: nextStatus,
        approvalStatus: nextStatus === 'active' ? 'approved' : 'suspended',
        approvalReason: statusReason.trim() || 'Status changed by Super Admin',
        responsibleUserId,
        approvedBy: nextStatus === 'active' ? responsibleUserId : undefined,
        approvedAt: nextStatus === 'active' ? timestamp : undefined,
        suspendedBy: nextStatus === 'suspended' ? responsibleUserId : undefined,
        suspendedAt: nextStatus === 'suspended' ? timestamp : undefined,
        updatedAt: timestamp,
        auditAction: nextStatus === 'active' ? 'ORGANIZATION_APPROVED' : 'ORGANIZATION_SUSPENDED',
      })
      setOrg((current) => ({ ...current, status: nextStatus }))
      toast.success(
        nextStatus === 'active'
          ? 'Organization activated successfully'
          : 'Organization suspended successfully',
      )
    } catch (error) {
      toast.error(getApiErrorMessage(error, `Unable to ${actionLabel} organization`))
    }
  }

  const confirmStatusChange = () => {
    if (!statusReason.trim()) {
      toast.error('A reason is required for audit compliance')
      return
    }
    setStatusConfirmOpen(false)
    changeOrganizationStatus(pendingStatusAction)
  }

  // Derive a timeline only from fields that actually exist on the record.
  const actorName = user?.fullName || user?.name || 'Super Admin'
  const activity = useMemo(() => {
    const supplied =
      org?.activities || org?.recentActivity || org?.activityLogs || []
    if (Array.isArray(supplied) && supplied.length) {
      return supplied.map((item, index) => ({
        ...item,
        id: item.id ?? `activity-${index}`,
        title: item.title ?? item.action ?? item.message ?? 'Event',
        time: item.time ?? item.timestamp ?? item.date ?? '',
        by: item.by ?? item.actor ?? item.performedBy ?? '',
      }))
    }
    const events = []
    if (org?.createdDate || org?.createdAt) {
      events.push({
        id: 'created',
        title: 'Organization created',
        time: org.createdDate || org.createdAt,
        tone: 'brand',
        by: actorName,
      })
    }
    if (org?.approvedAt) {
      events.push({ id: 'approved', title: 'Organization approved', time: org.approvedAt, tone: 'success', by: actorName })
    }
    if (org?.suspendedAt) {
      events.push({ id: 'suspended', title: 'Organization suspended', time: org.suspendedAt, tone: 'danger', by: actorName })
    }
    if (org?.updatedAt && String(org?.updatedAt) !== String(org?.createdAt ?? '')) {
      events.push({ id: 'updated', title: 'Organization updated', time: org.updatedAt, tone: 'muted', by: actorName })
    }
    return events
  }, [org, actorName])

  const scrollToSection = (target) => {
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleTabClick = (tab) => {
    if (tab.route) {
      navigate(tab.route)
      return
    }
    setActiveTab(tab.key)
    if (tab.key === 'users') {
      usersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      scrollToSection(tab.target)
    }
  }

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="w-full px-4 py-3 sm:px-6 lg:px-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="h-9 w-36 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700/50" />
        </div>
        <div className="flex h-28 animate-pulse items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="h-12 w-12 rounded-xl bg-slate-200 dark:bg-slate-700/50" />
          <div className="flex-1 space-y-3">
            <div className="h-5 w-48 rounded-lg bg-slate-200 dark:bg-slate-700/50" />
            <div className="h-3 w-64 rounded-lg bg-slate-200 dark:bg-slate-700/50" />
            <div className="h-3 w-40 rounded-lg bg-slate-200 dark:bg-slate-700/50" />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-[92px] animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700/50" />
          ))}
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="h-72 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 lg:col-span-2" />
          <div className="h-72 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900" />
        </div>
      </div>
    )
  }

  // ── Not found ────────────────────────────────────────────────────────────
  if (notFound || !org) {
    return (
      <div className="flex w-full items-center justify-center px-4 py-16">
        <motion.div
          {...fadeUp()}
          className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-500/10">
            <Building2 className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
            Organization Not Found
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            The organization you&apos;re looking for could not be found.
            {loadError ? ` ${loadError}` : ''}
          </p>
          <button
            type="button"
            onClick={() => navigate(ROUTES.SUPER_ADMIN.ORGANIZATIONS)}
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-[#0f55f7] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0b46d6]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Organizations
          </button>
        </motion.div>
      </div>
    )
  }

  const status = org.status
  const isActive = status === 'active'
  const orgIdValue = String(org.organizationId ?? org.id ?? organizationId)
  const hasSubscriptionData = Boolean(
    subscription || org.plan || org.expiryDate || org.amount,
  )
  const subscriptionStatus = subscription?.status ?? status

  return (
    <div className="w-full px-4 py-3 sm:px-6 lg:px-6">
      {/* ── Back to Organizations ─────────────────────────────────────────── */}
      <motion.button
        {...fadeUp(0)}
        type="button"
        onClick={() => navigate(ROUTES.SUPER_ADMIN.ORGANIZATIONS)}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-[#0f55f7] dark:text-slate-400"
        aria-label="Back to organizations"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Organizations
      </motion.button>

      {/* ── Organization summary card ─────────────────────────────────────── */}
      <motion.section
        {...fadeUp(0.05)}
        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="h-1 w-full bg-gradient-to-r from-[#0877B9] via-[#278F8D] to-[#58A94B]" />
        <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          {/* Identity block */}
          <div className="flex min-w-0 items-center gap-3.5">
            <div
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${BRAND_GRADIENT} text-white shadow-md shadow-[#278F8D]/20`}
            >
              <Building2 className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {org.name}
                </h1>
                <OrgStatusBadge status={status} />
              </div>
              <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">
                {[org.industry, org.country].filter(Boolean).join(' • ') ||
                  'Industry not provided'}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                  {orgIdValue}
                </span>
                <span className="inline-flex items-center gap-1">
                  <FileClock className="h-3.5 w-3.5 text-slate-400" />
                  Created {formatCreatedDate(org.createdDate) || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Contact + actions block */}
          <div className="flex shrink-0 flex-col gap-3 lg:items-end">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
              {org.email ? (
                <a
                  href={`mailto:${org.email}`}
                  className="inline-flex max-w-full items-center gap-1.5 truncate font-semibold text-[#0f55f7] hover:underline"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{org.email}</span>
                </a>
              ) : null}
              {org.phone ? (
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  {org.phone}
                </span>
              ) : null}
              {org.website ? (
                <a
                  href={org.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex max-w-full items-center gap-1.5 truncate font-medium text-[#0f55f7] hover:underline"
                >
                  <Globe className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{org.website}</span>
                </a>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" icon={Edit3} onClick={openEdit}>
                Edit Organization
              </Button>
              {isActive ? (
                <Button
                  variant="danger"
                  size="sm"
                  icon={Ban}
                  onClick={() => requestStatusChange('suspended')}
                >
                  Suspend Organization
                </Button>
              ) : (
                <Button
                  size="sm"
                  className={BRAND_GRADIENT}
                  icon={status === 'suspended' ? RotateCcw : CheckCircle2}
                  onClick={() => requestStatusChange('active')}
                >
                  {status === 'suspended'
                    ? 'Activate Organization'
                    : 'Approve Organization'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── KPI summary cards ─────────────────────────────────────────────── */}
      <motion.div
        {...fadeUp(0.1)}
        id="org-branches"
        className="mt-4 grid scroll-mt-20 grid-cols-2 gap-3 lg:grid-cols-4"
      >
        <MetricCard
          icon={GraduationCap}
          color="#0f55f7"
          label="Students"
          value={org.students.toLocaleString()}
          sub={`${org.activeStudents.toLocaleString()} Active · ${org.inactiveStudents.toLocaleString()} Inactive`}
        />
        <MetricCard
          icon={BriefcaseBusiness}
          color="#06b6a8"
          label="Employees"
          value={org.employees.toLocaleString()}
          sub={`${org.activeEmployees.toLocaleString()} Active · ${org.inactiveEmployees.toLocaleString()} Inactive`}
        />
        <MetricCard
          icon={MapPin}
          color="#8b5cf6"
          label="Branches"
          value={org.branches.toLocaleString()}
          sub={`${org.branches.toLocaleString()} Total`}
        />
        <MetricCard
          icon={CreditCard}
          color="#f59e0b"
          label="Plan"
          value={org.plan || 'Not assigned'}
          sub={(ORG_STATUS_STYLES[subscriptionStatus] || ORG_STATUS_STYLES.active).label}
        />
      </motion.div>

      {/* ── Navigation tabs ───────────────────────────────────────────────── */}
      <motion.nav
        {...fadeUp(0.12)}
        aria-label="Organization sections"
        className="mt-5 border-b border-slate-200 dark:border-slate-700"
      >
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {NAV_TABS.map((tab) => {
            const isActiveTab = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                aria-current={isActiveTab ? 'page' : undefined}
                onClick={() => handleTabClick(tab)}
                className={`shrink-0 whitespace-nowrap border-b-2 px-3.5 py-2.5 text-[13px] font-semibold transition-colors ${
                  isActiveTab
                    ? 'border-[#0f55f7] text-[#0f55f7] dark:text-[#6aa0ff]'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </motion.nav>

      {/* ── Overview: Organization Information + Subscription ─────────────── */}
      <div
        id="org-overview"
        className="mt-4 grid scroll-mt-20 grid-cols-1 gap-4 lg:grid-cols-3"
      >
        {/* Organization Information */}
        <motion.section
          {...fadeUp(0.14)}
          className={`${CARD_CLASS} lg:col-span-2`}
        >
          <SectionHeader
            icon={Building2}
            color="#1268F3"
            title="Organization Information"
            subtitle="Profile and contact details"
          />
          <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <Field label="Organization Name" value={org.name} />
            <Field label="Organization ID" value={orgIdValue} mono />
            <Field label="Organization Email" value={org.email || '—'} />
            <Field label="Website" value={org.website || '—'} />
            <Field label="Phone" value={org.phone || '—'} />
            <Field label="Created Date" value={formatCreatedDate(org.createdDate) || '—'} />
            <Field label="Industry" value={org.industry || '—'} />
            <Field label="Country" value={org.country || '—'} />
            <Field
              label="Status"
              value={(ORG_STATUS_STYLES[status] || ORG_STATUS_STYLES.pending).label}
            />
            {org.size ? <Field label="Company Size" value={org.size} /> : null}
          </dl>
        </motion.section>

        {/* Subscription */}
        <motion.section
          {...fadeUp(0.18)}
          id="org-subscription"
          className={`${CARD_CLASS} flex scroll-mt-20 flex-col`}
        >
          <SectionHeader
            icon={CreditCard}
            color="#f59e0b"
            title="Subscription"
            subtitle="Plan and billing details"
          />
          {hasSubscriptionData ? (
            <>
              <dl className="mt-4 flex-1 space-y-0">
                {[
                  { label: 'Plan', value: subscription?.plan ?? org.plan },
                  {
                    label: 'Status',
                    value: (ORG_STATUS_STYLES[subscriptionStatus] || ORG_STATUS_STYLES.pending).label,
                  },
                  subscription?.startDate || org.createdDate
                    ? {
                        label: 'Start Date',
                        value: formatCreatedDate(subscription?.startDate || org.createdDate),
                      }
                    : null,
                  org.expiryDate || subscription?.expiryDate || subscription?.renewalDate
                    ? {
                        label: 'Renewal Date',
                        value: formatCreatedDate(
                          org.expiryDate || subscription?.expiryDate || subscription?.renewalDate,
                        ),
                      }
                    : null,
                  org.seats || subscription?.seats
                    ? { label: 'Number of Seats', value: org.seats || subscription?.seats }
                    : null,
                  subscription?.billingCycle
                    ? { label: 'Billing Cycle', value: subscription?.billingCycle }
                    : null,
                  org.amount || subscription?.amount
                    ? {
                        label: 'Amount',
                        value: `$${Number(org.amount || subscription?.amount || 0).toLocaleString()}`,
                      }
                    : null,
                ]
                  .filter(Boolean)
                  .map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between gap-3 border-b border-slate-100 py-2 last:border-b-0 dark:border-slate-800"
                    >
                      <dt className="text-xs font-semibold text-slate-400">
                        {label}
                      </dt>
                      <dd className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                        {value}
                      </dd>
                    </div>
                  ))}
              </dl>
              <button
                type="button"
                onClick={() => navigate(ROUTES.SUPER_ADMIN.SUBSCRIPTIONS)}
                className="group mt-3 inline-flex items-center gap-1.5 self-start text-xs font-semibold text-[#0f55f7] transition hover:underline"
              >
                Manage Subscriptions
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </>
          ) : (
            <div className="mt-4 flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/70 px-4 py-6 text-center dark:border-slate-700 dark:bg-slate-800/40">
              <CreditCard className="h-6 w-6 text-slate-300" />
              <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                No subscription information available.
              </p>
            </div>
          )}
        </motion.section>
      </div>

      {/* ── Organization Users + Recent Activity ──────────────────────────── */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* Organization Users */}
        <motion.section
          {...fadeUp(0.22)}
          ref={usersRef}
          id="org-users"
          className={`${CARD_CLASS} scroll-mt-20`}
        >
          <SectionHeader
            icon={Users}
            color="#06b6a8"
            title="Organization Users"
            subtitle="Workforce roster"
            action={
              users.length > 0 ? (
                <button
                  type="button"
                  onClick={() => usersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#0f55f7] transition hover:underline"
                >
                  View All Users
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              ) : null
            }
          />

          {users.length > 0 ? (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="px-2 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      User
                    </th>
                    <th className="px-2 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Role
                    </th>
                    <th className="px-2 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Email
                    </th>
                    <th className="px-2 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Status
                    </th>
                    <th className="px-2 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Last Active
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {users.map((employee) => {
                    const rawStatus = String(
                      employee.status ?? employee.userStatus ?? 'active',
                    ).toLowerCase()
                    const userStatus = [
                      'active',
                      'inactive',
                      'pending',
                      'suspended',
                      'trial',
                    ].includes(rawStatus)
                      ? rawStatus
                      : 'active'
                    const userName =
                      employee.name ||
                      [employee.firstName, employee.lastName]
                        .filter(Boolean)
                        .join(' ') ||
                      'Unnamed user'
                    return (
                      <tr
                        key={employee.id ?? employee.employeeId}
                        className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      >
                        <td className="px-2 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#0877B9]/10 to-[#58A94B]/10 text-[11px] font-extrabold text-[#0877B9] dark:text-[#5db3e8]">
                              {String(userName)
                                .split(' ')
                                .map((part) => part[0])
                                .filter(Boolean)
                                .slice(0, 2)
                                .join('')
                                .toUpperCase()}
                            </span>
                            <span className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                              {userName}
                            </span>
                          </div>
                        </td>
                        <td className="px-2 py-3">
                          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {employee.designation || employee.role || 'Member'}
                          </span>
                        </td>
                        <td className="max-w-[180px] truncate px-2 py-3 text-sm text-slate-500 dark:text-slate-400">
                          {employee.email || '—'}
                        </td>
                        <td className="px-2 py-3">
                          <StatusBadge
                            status={
                              userStatus === 'trial'
                                ? 'pending'
                                : userStatus
                            }
                            label={userStatus === 'trial' ? 'Trial' : undefined}
                          />
                        </td>
                        <td className="px-2 py-3 text-sm text-slate-500 dark:text-slate-400">
                          {formatDateTime(
                            employee.lastActive ??
                              employee.lastSeen ??
                              employee.joiningDate ??
                              employee.createdAt ??
                              '',
                          ) || '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-3 rounded-lg border border-dashed border-slate-200 bg-slate-50/70 px-4 py-8 text-center dark:border-slate-700 dark:bg-slate-800/40">
              <Users className="mx-auto h-7 w-7 text-slate-300" />
              <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                No user records available
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Workforce roster will appear when user data is synced for this
                organization.
              </p>
            </div>
          )}
        </motion.section>

        {/* Recent Activity */}
        <motion.section
          {...fadeUp(0.26)}
          id="org-activity"
          className={`${CARD_CLASS} scroll-mt-20`}
        >
          <SectionHeader
            icon={Activity}
            color="#8b5cf6"
            title="Recent Activity"
            subtitle="Latest organization events"
            action={
              activity.length > 0 ? (
                <button
                  type="button"
                  onClick={() => scrollToSection('org-activity')}
                  className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#0f55f7] transition hover:underline"
                >
                  View All Activity
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              ) : null
            }
          />
          {activity.length > 0 ? (
            <ol className="mt-3 space-y-0">
              {activity.map((event) => {
                const isDanger = event.tone === 'danger'
                const isSuccess = event.tone === 'success'
                const isMuted = event.tone === 'muted'
                return (
                  <li
                    key={event.id}
                    className="flex items-start gap-3 border-b border-slate-100 py-3 last:border-b-0 dark:border-slate-800"
                  >
                    <span
                      className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                        isDanger
                          ? 'bg-red-50 text-red-500 dark:bg-red-500/10'
                          : isSuccess
                            ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10'
                            : isMuted
                              ? 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                              : 'bg-blue-50 text-[#0f55f7] dark:bg-blue-500/10'
                      }`}
                    >
                      {isDanger ? (
                        <Ban className="h-3.5 w-3.5" />
                      ) : isSuccess ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <Building2 className="h-3.5 w-3.5" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {event.title}
                      </p>
                      {event.by ? (
                        <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                          by {event.by}
                        </p>
                      ) : null}
                    </div>
                    {event.time ? (
                      <time className="shrink-0 text-[11px] font-medium text-slate-400">
                        {formatDateTime(event.time) || event.time}
                      </time>
                    ) : null}
                  </li>
                )
              })}
            </ol>
          ) : (
            <div className="mt-3 rounded-lg border border-dashed border-slate-200 bg-slate-50/70 px-4 py-6 text-center dark:border-slate-700 dark:bg-slate-800/40">
              <Activity className="mx-auto h-6 w-6 text-slate-300" />
              <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                No recent activity available.
              </p>
            </div>
          )}
        </motion.section>
      </div>

      {/* ── Edit organization modal ───────────────────────────────────────── */}
      <Modal
        open={editOpen}
        onClose={() => !saving && setEditOpen(false)}
        title="Edit Organization"
        description="Update the organization profile and contact details."
        size="lg"
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => setEditOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              className={BRAND_GRADIENT}
              onClick={saveEdit}
              loading={saving}
            >
              Save Changes
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <Input
            label="Organization Name"
            required
            error={formErrors.organizationName}
            value={form.organizationName}
            onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            required
            error={formErrors.email}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Phone"
            error={formErrors.phone}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <Input
            label="Industry"
            value={form.industry}
            onChange={(e) => setForm({ ...form, industry: e.target.value })}
          />
          <Input
            label="Country"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
          />
          <Input
            label="Website"
            error={formErrors.website}
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
          />
        </div>
      </Modal>

      {/* ── Status change confirmation dialog ──────────────────────────────── */}
      <Modal
        open={statusConfirmOpen}
        onClose={() => !saving && setStatusConfirmOpen(false)}
        title={pendingStatusAction === 'suspended' ? 'Suspend Organization' : 'Activate Organization'}
        description={
          pendingStatusAction === 'suspended'
            ? `Are you sure you want to suspend ${org?.name}? This action will deactivate the organization.`
            : `Are you sure you want to activate ${org?.name}? This will restore full access.`
        }
        size="md"
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => setStatusConfirmOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant={pendingStatusAction === 'suspended' ? 'danger' : undefined}
              className={pendingStatusAction !== 'suspended' ? BRAND_GRADIENT : ''}
              onClick={confirmStatusChange}
              loading={saving}
            >
              {pendingStatusAction === 'suspended' ? 'Yes, Suspend' : 'Yes, Activate'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
            <div
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
                pendingStatusAction === 'suspended'
                  ? 'bg-red-100 dark:bg-red-500/10'
                  : 'bg-emerald-100 dark:bg-emerald-500/10'
              }`}
            >
              {pendingStatusAction === 'suspended' ? (
                <Ban className="h-5 w-5 text-red-500" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {pendingStatusAction === 'suspended' ? 'Suspend' : 'Activate'}: {org?.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Current status: <OrgStatusBadge status={status} />
              </p>
            </div>
          </div>
          <Input
            label="Reason"
            required
            placeholder="Enter a reason for audit compliance"
            value={statusReason}
            onChange={(e) => setStatusReason(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  )
}
