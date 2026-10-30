import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  AlertCircle, ArrowLeft, ArrowUpRight, Ban, BarChart3, Calendar, CheckCircle,
  CreditCard, DollarSign, Eye, FileClock, Layers, Plus, RefreshCw, RotateCcw,
  Tag, Trash2, TrendingUp, User, Users, X
} from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { PremiumKpiCard, DashboardSection } from '@shared/components/SharedComponents'
import PageHeader from '@shared/components/PageHeader'
import DataTable from '@shared/components/DataTable'
import StatusBadge from '@shared/components/StatusBadge'
import { Button, Input, Select } from '@shared/components/FormElements'
import { REVENUE_GROWTH } from '@shared/data/superAdminPageMockData'
import { SUBSCRIPTION_RECORDS } from '@shared/data/subscriptionMockData'
import { REVENUE_TRANSACTIONS } from '@shared/data/revenueMockData'
import { getApiErrorMessage, subscriptionApi } from '@shared/services/apiServices'
import { ROUTES } from '@shared/constants/routeConstants'
import { deriveSubscriptionStatus, isActiveSubscription, utilizationInfo } from '@shared/utils/subscriptionStatus'
import { useAuth } from '@shared/hooks/useAuth'

// =================================
// TODO: API Integration
// GET /api/v1/super-admin/subscriptions
// GET /api/v1/super-admin/subscriptions/stats
// POST /api/v1/super-admin/subscriptions/:id/renew
// POST /api/v1/super-admin/subscriptions/:id/upgrade
// POST /api/v1/super-admin/subscriptions/:id/cancel
//
// Until the API ships, the page is populated from the static
// SUBSCRIPTION_RECORDS dataset (linked to the existing organizations).
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
  { value: 'expiring', label: 'Expiring Soon' },
  { value: 'expired', label: 'Expired' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'payment_failed', label: 'Payment Failed' },
]

// Status → shared StatusBadge mapping. Uses the app's existing badge styles;
// cancelled / pending fall back to the neutral treatment.
const STATUS_BADGES = {
  active: { status: 'active', label: 'Active' },
  expiring: { status: 'expiring', label: 'Expiring Soon' },
  trial: { status: 'trial', label: 'Trial' },
  expired: { status: 'expired', label: 'Expired' },
  suspended: { status: 'suspended', label: 'Suspended' },
  cancelled: { status: 'default', label: 'Cancelled' },
  payment_failed: { status: 'danger', label: 'Payment Failed' },
  pending: { status: 'pending', label: 'Pending' },
  inactive: { status: 'default', label: 'Inactive' },
  // Payment statuses (Subscription Payment History + Revenue transactions)
  paid: { status: 'active', label: 'Paid' },
  succeeded: { status: 'active', label: 'Paid' },
  failed: { status: 'danger', label: 'Failed' },
  refunded: { status: 'default', label: 'Refunded' },
}
const getStatusBadge = (status) => STATUS_BADGES[status] || STATUS_BADGES.inactive

// ────────────────────────────────────────────────────────────────
// Single source of truth for plan colors.
// Drives the donut chart segments and the legend indicators below
// the chart — the legend is the one place plan colors are explained.
// ────────────────────────────────────────────────────────────────
const PLAN_COLORS = {
  Enterprise: '#2563EB',      // Primary Blue
  Professional: '#8B5CF6',    // Purple
  Basic: '#10B981',           // Green
  Trial: '#06B6D4',           // Cyan / Sky Blue
}

const DEFAULT_PLAN_COLOR = '#64748b'
const getPlanColor = (plan) => PLAN_COLORS[plan] || DEFAULT_PLAN_COLOR

// Plans intentionally excluded from the Plan Distribution donut/legend. Trial
// remains fully in the subscription system (table, filters, KPIs) — it is only
// omitted from the distribution visualization.
const EXCLUDED_DISTRIBUTION_PLANS = ['Trial']

const formatINR = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`

// Validates the Add Plan form against the exact fields the subscriptions API
// persists (planName / price / durationInMonths / maxUsers — see
// toSubscriptionPayload in apiServices.js). Returns a map of field → error
// message; an empty map means the form is valid.
const validatePlanForm = (values) => {
  const errors = {}
  if (!String(values.planName || '').trim()) errors.planName = 'Plan name is required.'
  const price = Number(values.price)
  if (values.price === '' || values.price == null || Number.isNaN(price) || price <= 0) {
    errors.price = 'Enter a price greater than 0.'
  }
  const duration = Number(values.durationInMonths)
  if (
    values.durationInMonths === '' || values.durationInMonths == null ||
    Number.isNaN(duration) || duration <= 0 || !Number.isInteger(duration)
  ) {
    errors.durationInMonths = 'Enter a positive whole number of months.'
  }
  const maxUsers = Number(values.maxUsers)
  if (
    values.maxUsers === '' || values.maxUsers == null ||
    Number.isNaN(maxUsers) || maxUsers <= 0 || !Number.isInteger(maxUsers)
  ) {
    errors.maxUsers = 'Enter a positive whole number of users.'
  }
  return errors
}

// Fresh Add Plan form state. Description / features are captured for the demo
// dataset only — the subscriptions API payload persists exactly the core 5
// fields (see toSubscriptionPayload in apiServices.js).
const emptyPlanForm = () => ({
  planName: '',
  description: '',
  price: '',
  durationInMonths: 12,
  maxUsers: '',
  features: [],
  isActive: true,
})

// ─── Compact textarea field (Description) ──────────────────────────────────
// Mirrors the shared Input component's label/error/hint styling so the modal
// stays visually consistent without expanding the shared component's API.
function TextareaField({ label, value, onChange, placeholder, hint, error, maxLength, disabled = false }) {
  const [focused, setFocused] = useState(false)
  const text = String(value ?? '')
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
        {maxLength ? <span className="shrink-0 text-[11px] tabular-nums text-slate-400">{text.length}/{maxLength}</span> : null}
      </div>
      <textarea
        rows={2}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full resize-none rounded-xl border px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:text-white dark:placeholder:text-slate-500 ${
          error
            ? 'border-[#EF4444] ring-2 ring-[#EF4444]/20'
            : focused
              ? 'border-[#0f55f7] ring-2 ring-[#0f55f7]/30'
              : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50'
        }`}
      />
      {error ? (
        <p className="flex items-center gap-1 text-xs text-[#EF4444]">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-slate-400">{hint}</p>
      ) : null}
    </div>
  )
}

// ─── Chip-style multi-value input (Plan Features) ──────────────────────────
// Type a feature and press Enter (or comma) to add it as a chip; chips can be
// removed individually. Empty / duplicate entries are silently ignored.
function FeaturesInput({ label, value = [], onChange, placeholder = 'Type a feature and press Enter', hint, disabled = false }) {
  const [draft, setDraft] = useState('')
  const [focused, setFocused] = useState(false)

  const addFeature = () => {
    const feature = draft.trim()
    if (!feature) return
    if (value.some((item) => item.toLowerCase() === feature.toLowerCase())) {
      setDraft('')
      return
    }
    onChange([...value, feature])
    setDraft('')
  }

  const removeFeature = (feature) => onChange(value.filter((item) => item !== feature))

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addFeature()
    } else if (event.key === 'Backspace' && !draft && value.length > 0) {
      removeFeature(value[value.length - 1])
    }
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <div
        className={`flex min-h-[44px] flex-wrap items-center gap-1.5 rounded-xl border px-2.5 py-2 transition-all duration-200 ${
          focused
            ? 'border-[#0f55f7] ring-2 ring-[#0f55f7]/30'
            : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50'
        }`}
      >
        {value.map((feature) => (
          <span
            key={feature}
            className="inline-flex items-center gap-1 rounded-lg bg-[#0f55f7]/10 px-2.5 py-1 text-xs font-semibold text-[#0f55f7] dark:bg-[#0f55f7]/15 dark:text-[#6aa0ff]"
          >
            {feature}
            <button
              type="button"
              onClick={() => removeFeature(feature)}
              disabled={disabled}
              aria-label={`Remove ${feature}`}
              className="rounded p-0.5 text-[#0f55f7]/70 transition hover:bg-[#0f55f7]/15 hover:text-[#0f55f7] dark:text-[#6aa0ff]/70 dark:hover:text-[#6aa0ff]"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); if (draft.trim()) addFeature() }}
          disabled={disabled}
          placeholder={value.length > 0 ? 'Add another…' : placeholder}
          aria-label={label}
          className="min-w-[140px] flex-1 border-none bg-transparent px-1 py-0.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white dark:placeholder:text-slate-500"
        />
      </div>
      {hint ? <p className="text-xs text-slate-400">{hint}</p> : null}
    </div>
  )
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const formatDate = (value) => {
  if (!value || value === '-' || value === '—') return '—'
  if (typeof value !== 'string' || !value.includes('-')) return value
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

// Status is derived from the stored state + end date (see subscriptionStatus.js)
// so "Expiring Soon" / "Expired" always reflect today's date.
const normalizeSubscription = (row) => {
  const status = deriveSubscriptionStatus(row)
  return {
    ...row,
    id: row.subscriptionId ?? row.id,
    subscriptionId: row.subscriptionId ?? row.id,
    planId: row.planId,
    organization: row.organizationName || row.organization || 'Platform Plan',
    organizationId: row.organizationId || row.id,
    plan: row.planName || row.plan || '-',
    amount: Number(row.price ?? row.amount ?? 0),
    seats: row.maxUsers ?? row.seats ?? 0,
    durationInMonths: Number(row.durationInMonths || 1),
    maxUsers: row.maxUsers ?? row.seats ?? 0,
    activeUsers: Number(row.activeUsers ?? 0),
    isActive: isActiveSubscription(status),
    status,
    startDate: row.startDate || '-',
    expiryDate: row.endDate || row.expiryDate || '-',
  }
}

export default function SuperAdminSubscriptions() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [planFilter, setPlanFilter] = useState('')
  // Supports the dashboard's "Upcoming Subscriptions → View All" link
  // (/super-admin/subscriptions?status=expiring) by pre-selecting the status.
  const [statusFilter, setStatusFilter] = useState(() => {
    const param = searchParams.get('status')
    return param && STATUS_FILTERS.some((filter) => filter.value === param) ? param : ''
  })
  const [confirmModal, setConfirmModal] = useState({ open: false, row: null, action: '' })
  const [formOpen, setFormOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState(emptyPlanForm)

  // Opens the Add Plan modal with a fresh form and cleared validation state so
  // stale values or errors never leak between sessions.
  const openPlanForm = () => {
    setForm(emptyPlanForm())
    setErrors({})
    setFormOpen(true)
  }

  const closePlanForm = () => {
    setFormOpen(false)
    setErrors({})
  }

  // Updates one form field and clears its inline error as the user types so
  // stale messages disappear immediately after being addressed.
  const updateFormField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current))
  }

  const updateFeatures = (features) => {
    setForm((current) => ({ ...current, features }))
  }

  const fetchSubscriptions = async () => {
      setLoading(true)
      setLoadError('')
      const isDemo = Boolean(user?.isDemo || String(user?.email || '').includes('demo'))
      if (isDemo) {
        // Demo sessions never hit the API (a demo token would 401 → login redirect)
        // and render the linked demo dataset, consistent with the rest of the app.
        setSubscriptions(SUBSCRIPTION_RECORDS.map(normalizeSubscription))
        setLoading(false)
        return
      }
      try {
        const rows = await subscriptionApi.list()
        // Real backend rows only — never substitute static records for live data.
        setSubscriptions((Array.isArray(rows) ? rows : []).map(normalizeSubscription))
      } catch (error) {
        setLoadError(getApiErrorMessage(error, 'Unable to load subscriptions. Please try again.'))
        setSubscriptions([])
      } finally {
        setLoading(false)
      }
  }

  useEffect(() => {
    const timer = window.setTimeout(fetchSubscriptions, 0)
    return () => window.clearTimeout(timer)
  }, [])

  const backToDashboard = () => navigate(ROUTES.SUPER_ADMIN.DASHBOARD)

  // Lock page scroll while the Add Plan modal is open (mirrors the shared Modal behavior).
  useEffect(() => {
    if (!formOpen) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closePlanForm()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [formOpen])

  const createSubscription = async (event) => {
    event.preventDefault()
    if (saving) return
    const nextErrors = validatePlanForm(form)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      toast.error('Please fix the highlighted fields')
      return
    }
    const isDemo = Boolean(user?.isDemo || String(user?.email || '').includes('demo'))
    setSaving(true)
    try {
      if (isDemo) {
        // Demo sessions never hit the API (a demo token would 401 → login
        // redirect) and create the plan locally, mirroring the demo dataset.
        // Description / features ride along for demo consistency — the real
        // API payload below only ever sends the core 5 fields.
        const now = new Date()
        const end = new Date(now)
        end.setMonth(end.getMonth() + Number(form.durationInMonths))
        const newPlan = {
          id: `SUB-${now.getFullYear()}-${String(100000 + Math.floor(Math.random() * 900000))}`,
          organizationId: 'platform',
          organizationName: 'Platform Plan',
          planName: form.planName.trim(),
          status: form.isActive ? 'active' : 'inactive',
          price: Number(form.price),
          currency: 'INR',
          durationInMonths: Number(form.durationInMonths),
          maxUsers: Number(form.maxUsers),
          activeUsers: 0,
          startDate: now.toISOString().slice(0, 10),
          endDate: end.toISOString().slice(0, 10),
          autoRenew: true,
          description: form.description.trim(),
          features: form.features,
          createdAt: now.toISOString().slice(0, 10),
        }
        setSubscriptions((items) => [normalizeSubscription(newPlan), ...items])
        toast.success('Subscription plan added')
      } else {
        await subscriptionApi.create(form)
        toast.success('Subscription plan added')
        await fetchSubscriptions()
      }
      setFormOpen(false)
      setForm(emptyPlanForm())
      setErrors({})
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to add subscription'))
    } finally {
      setSaving(false)
    }
  }

  const deleteSubscription = async (row) => {
    if (!window.confirm(`Delete ${row.plan} subscription?`)) return
    try {
      await subscriptionApi.remove(row.subscriptionId)
      setSubscriptions((items) => items.filter((item) => item.subscriptionId !== row.subscriptionId))
      toast.success('Subscription deleted')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to delete subscription'))
    }
  }

  const handleRenew = (row) => {
    setConfirmModal({ open: true, row, action: 'renew' })
  }

  const handleUpgrade = (row) => {
    setConfirmModal({ open: true, row, action: 'upgrade' })
  }

  const handleCancel = (row) => {
    setConfirmModal({ open: true, row, action: 'cancel' })
  }

  // Opens the dedicated Subscription Details page for the exact subscription.
  const handleOpenSubscriptionDetails = (row) => {
    navigate(
      ROUTES.SUPER_ADMIN.SUBSCRIPTION_DETAILS.replace(':subscriptionId', row.subscriptionId),
      { state: { subscription: row } },
    )
  }

  // Opens the exact Organization Details page (never the generic list).
  const handleOpenOrganizationDetails = (row) => {
    if (!row.organizationId) return
    navigate(
      ROUTES.SUPER_ADMIN.ORGANIZATION_DETAILS.replace(':organizationId', String(row.organizationId)),
      { state: { organization: { id: row.organizationId, name: row.organization } } },
    )
  }

  const clearFilters = () => {
    setPlanFilter('')
    setStatusFilter('')
  }

  const executeAction = async () => {
    const { row, action } = confirmModal
    try {
      const payload = {
        planName: row.plan,
        price: row.amount,
        durationInMonths: action === 'renew' ? row.durationInMonths + 12 : row.durationInMonths,
        maxUsers: action === 'upgrade' ? Math.max(row.maxUsers * 2, row.maxUsers + 10) : row.maxUsers,
        isActive: action !== 'cancel',
      }
      await subscriptionApi.update(row.subscriptionId ?? row.id, payload)
      setSubscriptions((items) => items.map((item) => item.id === row.id ? { ...item, durationInMonths: payload.durationInMonths, maxUsers: payload.maxUsers, seats: payload.maxUsers, isActive: payload.isActive, status: payload.isActive ? 'active' : 'inactive' } : item))
      toast.success(action === 'cancel' ? 'Subscription cancelled' : action === 'renew' ? 'Subscription renewed' : 'Subscription upgraded')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to update subscription'))
    }
    setConfirmModal({ open: false, row: null, action: '' })
  }

  const filtered = useMemo(() => {
    return subscriptions.filter((s) => {
      const matchPlan = !planFilter || s.plan === planFilter
      const matchStatus = !statusFilter || s.status === statusFilter
      return matchPlan && matchStatus
    })
  }, [subscriptions, planFilter, statusFilter])

  // Plan filter options are derived from the dataset so they always match the data.
  const planFilters = useMemo(() => {
    const plans = [...new Set(subscriptions.map((s) => s.plan).filter(Boolean))]
    return [{ value: '', label: 'All Plans' }, ...plans.map((plan) => ({ value: plan, label: plan }))]
  }, [subscriptions])

  // Plan Distribution (by revenue) — derived from the same dataset as the table.
  // Free and Trial are excluded so the donut and legend only show paid plans.
  const planDistribution = useMemo(() => {
    const totals = {}
    subscriptions.forEach((s) => {
      if (EXCLUDED_DISTRIBUTION_PLANS.includes(s.plan)) return
      totals[s.plan] = totals[s.plan] || { name: s.plan, value: 0, revenue: 0, color: getPlanColor(s.plan) }
      totals[s.plan].value += 1
      totals[s.plan].revenue += s.amount
    })
    return Object.values(totals).sort((a, b) => b.revenue - a.revenue)
  }, [subscriptions])

  // Total revenue across plans — used by the donut legend shares.
  const totalPlanRevenue = useMemo(() => planDistribution.reduce((sum, d) => sum + d.revenue, 0), [planDistribution])

  const columns = [
    {
      header: 'Organization',
      accessor: 'organization',
      minWidth: 220,
      searchValue: (row) => `${row.organization} ${row.organizationId} ${row.plan} ${row.subscriptionId}`,
      render: (row) => (
        <div className="min-w-0">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleOpenOrganizationDetails(row) }}
            title={`Open organization details for ${row.organization}`}
            className="group/org -mx-1.5 inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-lg px-1.5 py-1 text-left transition-colors hover:bg-slate-100/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f55f7]/30 dark:hover:bg-slate-700/40"
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-slate-900 transition-colors group-hover/org:text-[#0f55f7] dark:text-white dark:group-hover/org:text-[#6aa0ff]">{row.organization}</span>
              <span className="block truncate text-[11px] text-slate-400 transition-colors group-hover/org:text-slate-500 dark:text-slate-500 dark:group-hover/org:text-slate-400">{row.organizationId}</span>
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-all group-hover/org:-translate-y-0.5 group-hover/org:translate-x-0.5 group-hover/org:text-[#0f55f7] dark:text-slate-600 dark:group-hover/org:text-[#6aa0ff]" />
          </button>
        </div>
      ),
    },
    {
      header: 'Plan',
      accessor: 'plan',
      width: 130,
      minWidth: 110,
      render: (row) => (
        <span className="inline-flex whitespace-nowrap items-center rounded-lg px-2.5 py-1 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50">
          {row.plan}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      width: 150,
      minWidth: 130,
      render: (row) => <StatusBadge {...getStatusBadge(row.status)} />,
    },
    {
      header: 'Users',
      accessor: 'maxUsers',
      width: 155,
      minWidth: 140,
      render: (row) => {
        const info = utilizationInfo(row.activeUsers, row.maxUsers)
        return (
          <div className="min-w-0">
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{row.activeUsers}</span>
              <span className="text-xs text-slate-400">/ {info.unlimited ? 'Unlimited' : row.maxUsers}</span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              {info.unlimited ? (
                <span className="text-[10px] font-semibold text-slate-400">No user limit</span>
              ) : (
                <>
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${Math.min(info.percent, 100)}%`, backgroundColor: info.color }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">{info.exceeded ? '100%+' : `${info.percent}%`}</span>
                </>
              )}
            </div>
          </div>
        )
      },
    },
    {
      header: 'Start Date',
      accessor: 'startDate',
      width: 120,
      minWidth: 108,
      render: (row) => <span className="whitespace-nowrap text-sm tabular-nums text-slate-600 dark:text-slate-300">{formatDate(row.startDate)}</span>,
    },
    {
      header: 'End Date',
      accessor: 'expiryDate',
      width: 120,
      minWidth: 108,
      render: (row) => <span className="whitespace-nowrap text-sm tabular-nums text-slate-600 dark:text-slate-300">{formatDate(row.expiryDate)}</span>,
    },
    {
      header: 'Amount',
      accessor: 'amount',
      width: 160,
      minWidth: 148,
      render: (row) => (
        <div className="whitespace-nowrap">
          <span className="text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-200">
            {row.amount > 0 ? formatINR(row.amount) : 'Free'}
          </span>
          {row.amount > 0 && (
            <span className="ml-1.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">
              / {row.durationInMonths}mo
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      sortable: false,
      minWidth: 130,
      render: (row) => (
        <div className="flex shrink-0 items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => handleOpenSubscriptionDetails(row)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label="View subscription details" title="View Details">
            <Eye className="w-3.5 h-3.5 text-slate-400 hover:text-[#0f55f7]" />
          </button>
          {row.status === 'active' && (
            <>
              <button onClick={() => handleRenew(row)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label="Renew plan"
                title="Renew Plan">
                <RotateCcw className="w-3.5 h-3.5 text-slate-400 hover:text-[#0f55f7]" />
              </button>
              <button onClick={() => handleUpgrade(row)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label="Upgrade plan"
                title="Upgrade Plan">
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 hover:text-[#06b6a8]" />
              </button>
              <button onClick={() => handleCancel(row)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label="Cancel plan"
                title="Cancel Plan">
                <Ban className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
              </button>
            </>
          )}
          {(row.status === 'expired' || row.status === 'expiring') && (
            <button onClick={() => handleRenew(row)} className="whitespace-nowrap inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#0f55f7]/10 text-[#0f55f7] hover:bg-[#0f55f7]/20 transition-colors">
              Renew Now
            </button>
          )}
          <button onClick={() => deleteSubscription(row)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors" aria-label="Delete subscription" title="Delete">
            <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="w-full px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
      {loadError ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50/60 px-6 py-14 text-center dark:border-red-500/20 dark:bg-red-500/5">
          <AlertCircle className="h-9 w-9 text-red-400" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{loadError}</p>
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchSubscriptions}>Retry</Button>
        </div>
      ) : (
      <>
      {/* Back to Dashboard — matches the pattern used on the sibling Revenue page */}
      <button
        type="button"
        onClick={backToDashboard}
        className="mb-4 inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/50 hover:text-[#0f55f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f55f7]/40 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </button>

      {/* KPIs — derived from the same dataset as the table (same business rules as the dashboard) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <PremiumKpiCard icon={CreditCard} label="Total Subscriptions" value={subscriptions.length} color="#0f55f7" delay={0} />
        <PremiumKpiCard icon={CheckCircle} label="Active Subscriptions" value={subscriptions.filter((item) => item.isActive).length} color="#06b6a8" delay={1} />
        <PremiumKpiCard icon={FileClock} label="Expiring Soon" value={subscriptions.filter((item) => item.status === 'expiring').length} color="#f59e0b" delay={2} />
        <PremiumKpiCard icon={DollarSign} label="Monthly Recurring Revenue" prefix="₹" value={Math.round(subscriptions.filter((item) => item.isActive).reduce((sum, item) => sum + item.amount / Math.max(item.durationInMonths, 1), 0))} color="#2563eb" delay={3} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
        <DashboardSection title="Revenue Growth" subtitle="Monthly recurring revenue (MRR)" icon={TrendingUp} className="lg:col-span-3">
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_GROWTH} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6a8" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [formatINR(value), 'MRR']} />
                <Area type="monotone" dataKey="mrr" stroke="#06b6a8" strokeWidth={2} fill="url(#revGrowthGrad)" name="MRR" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </DashboardSection>

        <DashboardSection title="Plan Distribution" subtitle="By revenue" icon={BarChart3} className="lg:col-span-2">
          <div className="flex flex-col gap-4">
            {/* Donut chart — fixed-height container, horizontally centred, balanced hole */}
            <div className="relative mx-auto h-44 w-full max-w-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius="58%"
                    outerRadius="84%"
                    paddingAngle={3}
                    cornerRadius={4}
                    stroke="transparent"
                    strokeWidth={0}
                    dataKey="revenue"
                    animationBegin={200}
                    animationDuration={1000}
                  >
                    {planDistribution.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [formatINR(value), 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend — aligned 2-column grid; dot color always matches the segment color */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {planDistribution.map((d) => {
                const share = totalPlanRevenue > 0 ? Math.round((d.revenue / totalPlanRevenue) * 100) : 0
                return (
                  <div key={d.name} className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white/70 dark:ring-slate-800"
                      style={{ backgroundColor: d.color }}
                    />
                    <span className="truncate text-xs font-medium text-slate-600 dark:text-slate-300">{d.name}</span>
                    <span className="ml-auto shrink-0 text-[11px] font-semibold tabular-nums text-slate-400 dark:text-slate-500">{share}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </DashboardSection>
      </div>

      {/* Header */}
      <PageHeader
        showBreadcrumb={false}
        titleClassName="!text-2xl !leading-8"
        containerClassName="!mb-5"
        title="Subscriptions"
        subtitle="Manage platform subscriptions and billing"
        icon={CreditCard}
        actions={
          <div className="flex gap-2"><Button variant="outline" icon={BarChart3} onClick={() => navigate(ROUTES.SUPER_ADMIN.ANALYTICS)}>Subscription Analytics</Button><Button icon={Plus} onClick={openPlanForm}>Add Plan</Button></div>
        }
      />

      {/* Table */}
      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        onRowClick={handleOpenSubscriptionDetails}
        pageSize={10}
        pageSizeOptions={[10, 25, 50]}
        searchPlaceholder="Search by organization, plan or subscription ID..."
        emptyTitle={subscriptions.length === 0 ? 'No subscriptions available' : 'No subscriptions match your current filters'}
        emptyDescription={subscriptions.length === 0 ? 'Create a plan to get started.' : 'Try adjusting your search or filters.'}
        emptyIcon={CreditCard}
        emptyAction={
          subscriptions.length === 0 ? (
            <Button size="sm" icon={Plus} onClick={openPlanForm}>Add Plan</Button>
          ) : (
            <Button variant="outline" size="sm" onClick={clearFilters}>Clear Filters</Button>
          )
        }
        filters={
          <div className="flex gap-2 flex-wrap">
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-3 py-2.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30"
            >
              {planFilters.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30"
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
        }
      />

      {/* Subscription Payment History — recent payment records for the organizations */}
      <DashboardSection
        title="Subscription Payment History"
        subtitle="Recent payments, pending and failed invoices"
        icon={CreditCard}
        className="mt-4"
      >
        <div className="custom-scrollbar overflow-x-auto rounded-xl border border-slate-200/90 dark:border-slate-700/80">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-slate-50/95 dark:bg-slate-800/95">
              <tr>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Transaction</th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Organization</th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Plan</th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Payment Date</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">Amount</th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Method</th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {REVENUE_TRANSACTIONS.map((transaction) => (
                <tr key={transaction.id} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                  <td className="px-4 py-3">
                    <span className="whitespace-nowrap font-mono text-xs font-semibold text-slate-600 dark:text-slate-300">{transaction.id}</span>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-100">{transaction.organization}</td>
                  <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{transaction.plan}</td>
                  <td className="px-4 py-3 text-sm tabular-nums text-slate-500 dark:text-slate-400">{formatDate(transaction.paymentDate)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-bold tabular-nums text-slate-800 dark:text-slate-100">{formatINR(transaction.amount)}</td>
                  <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{transaction.paymentMethod}</td>
                  <td className="px-4 py-3">
                    <StatusBadge {...getStatusBadge(transaction.status.toLowerCase())} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardSection>
      </>
      )}

      {/* Action Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.open && confirmModal.row && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setConfirmModal({ open: false, row: null, action: '' })}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-4 sm:inset-auto sm:top-[30%] sm:left-1/2 sm:-translate-x-1/2 w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-[20px] shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    confirmModal.action === 'cancel'
                      ? 'bg-red-100 dark:bg-red-500/10'
                      : confirmModal.action === 'renew'
                        ? 'bg-blue-100 dark:bg-blue-500/10'
                        : 'bg-green-100 dark:bg-green-500/10'
                  }`}>
                    {confirmModal.action === 'cancel' ? (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    ) : confirmModal.action === 'renew' ? (
                      <RotateCcw className="w-5 h-5 text-[#0f55f7]" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-[#06b6a8]" />
                    )}
                  </div>
                  <button onClick={() => setConfirmModal({ open: false, row: null, action: '' })} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-[#06b6a8] dark:text-teal-300 mb-2">
                  {confirmModal.action === 'renew' && 'Renew Subscription'}
                  {confirmModal.action === 'upgrade' && 'Upgrade Plan'}
                  {confirmModal.action === 'cancel' && 'Cancel Subscription'}
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                  {confirmModal.action === 'renew' && `Renew ${confirmModal.row.organization}'s subscription for another year at ${formatINR(confirmModal.row.amount)}/yr?`}
                  {confirmModal.action === 'upgrade' && `Open upgrade options for ${confirmModal.row.organization}? They are currently on the ${confirmModal.row.plan} plan.`}
                  {confirmModal.action === 'cancel' && `Are you sure you want to cancel ${confirmModal.row.organization}'s subscription? This action cannot be undone and the organization will lose access to premium features.`}
                </p>

                <div className="flex gap-3">
                  <button onClick={() => setConfirmModal({ open: false, row: null, action: '' })}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    Cancel
                  </button>
                  <button onClick={executeAction}
                    className={`flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-all ${
                      confirmModal.action === 'cancel'
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-gradient-to-r from-[#0f55f7] to-[#06b6a8]'
                    }`}>
                    {confirmModal.action === 'cancel' ? 'Yes, Cancel' : 'Confirm'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Add Subscription Plan modal (premium gradient variant) ──────── */}
      <AnimatePresence>
        {formOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/45 backdrop-blur-sm z-[60]"
              onClick={closePlanForm}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 18 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6"
              role="dialog"
              aria-modal="true"
              aria-label="Add Subscription Plan"
              onClick={(e) => { if (e.target === e.currentTarget) closePlanForm() }}
            >
              <div className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-[600px] flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.22)] sm:max-h-[calc(100dvh-3rem)] dark:border-slate-700 dark:bg-slate-900">
                {/* ── Gradient header ── */}
                <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[#0757D8] via-[#0C9BD1] to-[#2FB67C] px-5 py-4 sm:px-6 sm:py-5">
                  {/* Soft decorative glows */}
                  <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
                  <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                  <div className="pointer-events-none absolute right-24 top-2 h-20 w-20 rounded-full bg-cyan-200/20 blur-2xl" />

                  <div className="relative flex items-center gap-4">
                    <div className="flex min-w-0 items-center gap-3.5">
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/95 shadow-[0_10px_24px_rgba(3,60,120,0.28)]">
                        <Layers className="h-6 w-6 text-[#0C9BD1]" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-bold text-white sm:text-xl">
                          Add Subscription Plan
                        </h2>
                        <p className="mt-0.5 truncate text-[13px] font-medium text-white/85">
                          Create a plan using the subscriptions API
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={closePlanForm}
                      aria-label="Close modal"
                      className="ml-auto shrink-0 rounded-xl p-2 text-white/90 transition hover:bg-white/15 hover:text-white"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* ── Form body (two-column grid so all fields fit without scrolling) ── */}
                <form
                  onSubmit={createSubscription}
                  noValidate
                  className="min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-hide p-5 sm:px-6 sm:py-5"
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Plan information */}
                    <Input
                      label="Plan Name"
                      required
                      icon={User}
                      autoFocus
                      placeholder="Enter plan name"
                      value={form.planName}
                      error={errors.planName}
                      onChange={updateFormField('planName')}
                    />
                    <Input
                      label="Price"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      icon={DollarSign}
                      placeholder="Enter price"
                      value={form.price}
                      error={errors.price}
                      onChange={updateFormField('price')}
                    />
                    <div className="sm:col-span-2">
                      <TextareaField
                        label="Description"
                        placeholder="Enter plan description"
                        maxLength={200}
                        hint="Short description of what the plan provides"
                        value={form.description}
                        onChange={updateFormField('description')}
                      />
                    </div>

                    {/* Pricing & duration */}
                    <Input
                      label="Duration (months)"
                      type="number"
                      min="1"
                      step="1"
                      required
                      icon={Calendar}
                      placeholder="12"
                      value={form.durationInMonths}
                      error={errors.durationInMonths}
                      onChange={updateFormField('durationInMonths')}
                      hint="Billing period — 1 = monthly, 12 = annual"
                    />
                    <Input
                      label="Maximum Users"
                      type="number"
                      min="1"
                      step="1"
                      required
                      icon={Users}
                      placeholder="Enter maximum users"
                      value={form.maxUsers}
                      error={errors.maxUsers}
                      onChange={updateFormField('maxUsers')}
                      hint="Maximum number of users allowed under this plan"
                    />

                    {/* Plan benefits */}
                    <div className="sm:col-span-2">
                      <FeaturesInput
                        label="Features"
                        value={form.features}
                        onChange={updateFeatures}
                        placeholder="e.g. Advanced Reports"
                        hint="Type a feature and press Enter to add it"
                      />
                    </div>

                    {/* Availability */}
                    <div className="sm:col-span-2">
                      <Select
                        label="Status"
                        icon={Tag}
                        value={String(form.isActive)}
                        onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
                        options={[
                          { value: 'true', label: 'Active' },
                          { value: 'false', label: 'Inactive' },
                        ]}
                      />
                    </div>
                  </div>
                  <button type="submit" className="hidden" aria-hidden="true" />
                </form>

                {/* ── Footer ── */}
                <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 bg-white px-5 py-3.5 dark:border-slate-700 dark:bg-slate-900 sm:px-6">
                  <Button
                    variant="secondary"
                    onClick={closePlanForm}
                    className="w-28"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    loading={saving}
                    onClick={createSubscription}
                    className="w-36 bg-gradient-to-r from-[#0757D8] via-[#0C9BD1] to-[#2FB67C] text-white shadow-[0_10px_24px_rgba(12,155,209,0.35)] hover:brightness-110"
                  >
                    Add Plan
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
