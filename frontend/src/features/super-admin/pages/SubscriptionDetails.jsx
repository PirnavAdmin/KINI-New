import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  FileClock,
  Hash,
  Layers,
  RotateCcw,
  ShieldCheck,
  Users,
  Wallet,
} from 'lucide-react'
import StatusBadge from '@shared/components/StatusBadge'
import { ROUTES } from '@shared/constants/routeConstants'
import { SUBSCRIPTION_RECORDS } from '@shared/data/subscriptionMockData'
import { getApiErrorMessage, subscriptionApi } from '@shared/services/apiServices'
import { deriveSubscriptionStatus, isActiveSubscription } from '@shared/utils/subscriptionStatus'
import { navigateBackOrFallback } from '@features/super-admin/utils/navigation'
import { useAuth } from '@shared/hooks/useAuth'

// =================================
// TODO: API Integration
// GET /api/v1/super-admin/subscriptions/:id
//
// Until the API ships, the page resolves the selected subscription from the
// same SUBSCRIPTION_RECORDS dataset used by the Subscriptions table so the
// numbers always agree with the list.
// =================================

// Plan → color mapping, kept in line with the Subscriptions module so the plan
// chips and dots share the same vocabulary as the Plan Distribution chart.
const PLAN_COLORS = {
  Enterprise: '#2563EB',
  Professional: '#8B5CF6',
  'Enterprise Plus': '#6D28D9',
  Starter: '#10B981',
  Trial: '#06B6D4',
  Free: '#94A3B8',
}
const getPlanColor = (plan) => PLAN_COLORS[plan] || '#64748b'

const formatINR = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`

const formatDate = (value) => {
  if (!value || value === '-' || value === '—') return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatBillingPeriod = (months) => {
  const n = Number(months)
  if (n === 1) return 'Monthly (1 month)'
  if (n === 12) return 'Annual (12 months)'
  return `${n} months`
}

// Mirrors the normalization used by the Subscriptions table so a record always
// exposes the same field names whether it comes from the list click, the API
// or the static dataset. Status is derived from the stored state + end date so
// "Expiring Soon" / "Expired" reflect today's date (same logic as the list).
const normalizeSubscription = (row = {}) => {
  const status = deriveSubscriptionStatus(row)
  return {
    ...row,
    id: row.subscriptionId ?? row.id,
    subscriptionId: row.subscriptionId ?? row.id,
    organization: row.organizationName ?? row.organization ?? 'Platform Plan',
    organizationId: row.organizationId ?? row.organization?.organizationId ?? row.id,
    plan: row.planName ?? row.plan ?? '-',
    amount: Number(row.price ?? row.amount ?? 0),
    currency: row.currency ?? 'INR',
    durationInMonths: Number(row.durationInMonths ?? 1),
    seats: row.maxUsers ?? row.seats ?? 0,
    maxUsers: row.maxUsers ?? row.seats ?? 0,
    activeUsers: Number(row.activeUsers ?? row.usedSeats ?? 0),
    autoRenew: Boolean(row.autoRenew),
    isActive: isActiveSubscription(status),
    status,
    startDate: row.startDate ?? row.start_date ?? '-',
    expiryDate: row.endDate ?? row.expiryDate ?? row.end_date ?? '-',
    createdAt: row.createdAt ?? row.createdDate ?? '',
    description: row.description ?? '',
    features: Array.isArray(row.features) ? row.features : [],
  }
}

const findMockSubscription = (subscriptionId) =>
  SUBSCRIPTION_RECORDS.find(
    (item) =>
      String(item.id) === String(subscriptionId) ||
      String(item.organizationId) === String(subscriptionId),
  )

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1], delay },
})

// ─── Section card header ─────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, color, title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ background: `${color}14` }}>
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-bold tracking-tight text-slate-900 dark:text-white">{title}</h3>
          {subtitle ? <p className="truncate text-xs text-slate-400">{subtitle}</p> : null}
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
      <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</dt>
      <dd
        className={`mt-1 truncate text-sm font-semibold text-slate-800 dark:text-slate-100 ${mono ? 'font-mono text-[#0f55f7] dark:text-[#3b82f6]' : ''}`}
        title={value}
      >
        {value}
      </dd>
    </div>
  )
}

// ─── Overview tile ──────────────────────────────────────────────────────────
function OverviewTile({ icon: Icon, color, label, children }) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        <Icon className="h-3.5 w-3.5 shrink-0" style={{ color }} />
        {label}
      </dt>
      <dd className="mt-1.5 min-w-0">{children}</dd>
    </div>
  )
}

const CARD_CLASS =
  'rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-5'

export default function SubscriptionDetails() {
  const { subscriptionId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const isDemo = Boolean(user?.isDemo || String(user?.email || '').includes('demo'))

  const passedSubscription = location.state?.subscription
  const [subscription, setSubscription] = useState(() =>
    passedSubscription ? normalizeSubscription(passedSubscription) : null,
  )
  const [loading, setLoading] = useState(!passedSubscription)
  const [notFound, setNotFound] = useState(false)
  const [loadError, setLoadError] = useState('')

  // Reset derived state whenever the route id changes so a previous subscription
  // never flashes on screen while the next one loads.
  useEffect(() => {
    const passed = location.state?.subscription
    // Reset is a deliberate one-time sync with the route param, not derived state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSubscription(passed ? normalizeSubscription(passed) : null)
    setLoading(!passed)
    setNotFound(false)
    setLoadError('')
    // location.state is intentionally not a dependency: state is read once per id change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscriptionId])

  useEffect(() => {
    let active = true

    const load = async () => {
      if (!subscriptionId) return

      // When the record was passed via navigation state (table click) it is
      // already normalized in the reset effect above.
      if (location.state?.subscription) return

      // Demo sessions never hit the API (a demo token would 401 → login redirect).
      if (isDemo) {
        const mock = findMockSubscription(subscriptionId)
        if (!mock) {
          setNotFound(true)
          setLoading(false)
          return
        }
        setSubscription(normalizeSubscription(mock))
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const details = await subscriptionApi.getById(subscriptionId)
        if (active) {
          setSubscription(normalizeSubscription(details))
          setLoading(false)
        }
      } catch (error) {
        // API not ready yet — resolve from the static dataset so direct visits
        // and refreshes stay usable, mirroring the Subscriptions page behavior.
        if (!active) return
        const mock = findMockSubscription(subscriptionId)
        if (mock) {
          setSubscription(normalizeSubscription(mock))
          setLoadError(getApiErrorMessage(error, 'Live details unavailable. Showing demo data.'))
        } else {
          setNotFound(true)
        }
        setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
    // location.state is read once per id change and is intentionally excluded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscriptionId, isDemo])

  const returnTab = location.state?.returnTab
  const backToSubscriptions = () => navigate(
    returnTab
      ? `${ROUTES.SUPER_ADMIN.SUBSCRIPTIONS}?tab=${returnTab}`
      : ROUTES.SUPER_ADMIN.SUBSCRIPTIONS,
  )
  const goBack = () => navigateBackOrFallback(navigate, ROUTES.SUPER_ADMIN.SUBSCRIPTIONS)

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="w-full px-4 py-3 sm:px-6 lg:px-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="h-9 w-44 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700/50" />
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
  if (notFound || !subscription) {
    return (
      <div className="flex w-full items-center justify-center px-4 py-16">
        <motion.div
          {...fadeUp()}
          className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-500/10">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">Subscription Not Found</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            The subscription you&apos;re looking for could not be found.
            {loadError ? ` ${loadError}` : ''}
          </p>
          <button
            type="button"
            onClick={goBack}
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-[#0f55f7] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0b46d6]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </motion.div>
      </div>
    )
  }

  const {
    organization,
    organizationId,
    plan,
    status,
    amount,
    currency,
    durationInMonths,
    maxUsers,
    activeUsers,
    autoRenew,
    startDate,
    expiryDate,
    createdAt,
    description,
    features,
  } = subscription

  const numericLimit = Number(maxUsers)
  const hasNumericLimit = Number.isFinite(numericLimit) && numericLimit > 0
  const utilization = hasNumericLimit
    ? Math.min(Math.round((Number(activeUsers) / numericLimit) * 100), 100)
    : 0
  const isFree = amount <= 0

  return (
    <div className="w-full px-4 py-3 sm:px-6 lg:px-6">
      {/* ── Breadcrumb + back navigation ──────────────────────────────────── */}
      <motion.div
        {...fadeUp(0)}
        className="mb-4 flex flex-wrap items-center gap-3"
      >
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
          <button
            type="button"
            onClick={() => navigate(ROUTES.SUPER_ADMIN.DASHBOARD)}
            className="shrink-0 font-medium text-slate-500 transition hover:text-[#0f55f7] dark:text-slate-400 dark:hover:text-[#6aa0ff]"
          >
            Super Admin
          </button>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
          <button
            type="button"
            onClick={backToSubscriptions}
            className="shrink-0 font-medium text-slate-500 transition hover:text-[#0f55f7] dark:text-slate-400 dark:hover:text-[#6aa0ff]"
          >
            Subscriptions
          </button>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
          <span className="truncate font-semibold text-slate-800 dark:text-slate-200">Subscription Details</span>
        </nav>
      </motion.div>

      {/* ── Subscription summary card ─────────────────────────────────────── */}
      <motion.section
        {...fadeUp(0.05)}
        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="h-1 w-full bg-gradient-to-r from-[#0f55f7] via-[#0b9de8] to-[#06b6a8]" />
        <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          {/* Identity block */}
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#0f55f7] to-[#06b6a8] text-white shadow-md shadow-blue-500/20">
              <CreditCard className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-bold tracking-tight text-slate-900 dark:text-white">{organization}</h1>
                <StatusBadge status={status} label={status === 'expiring' ? 'Expiring Soon' : undefined} />
              </div>
              <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">{plan}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                  Organization ID: {organizationId}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Hash className="h-3.5 w-3.5 text-slate-400" />
                  {subscriptionId}
                </span>
              </div>
            </div>
          </div>

          {/* Amount block */}
          <div className="flex shrink-0 flex-col gap-1 lg:items-end">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Subscription Amount</p>
            <p className="text-2xl font-extrabold tracking-tight text-slate-900 tabular-nums dark:text-white">
              {isFree ? 'Free' : formatINR(amount)}
              {!isFree && durationInMonths > 1 ? (
                <span className="text-sm font-semibold text-slate-400"> / {durationInMonths} mo</span>
              ) : null}
            </p>
            <p className="text-[11px] font-medium text-slate-400">{formatBillingPeriod(durationInMonths)}</p>
          </div>
        </div>
      </motion.section>

      {/* ── Subscription Overview ─────────────────────────────────────────── */}
      <motion.section
        {...fadeUp(0.1)}
        className={`${CARD_CLASS} mt-4`}
      >
        <SectionHeader
          icon={Layers}
          color="#0f55f7"
          title="Subscription Overview"
          subtitle="Plan, usage and billing at a glance"
        />
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
          <OverviewTile icon={Layers} color={getPlanColor(plan)} label="Plan">
            <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-600 dark:text-slate-300" style={{ backgroundColor: `${getPlanColor(plan)}14` }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: getPlanColor(plan) }} />
              {plan}
            </span>
          </OverviewTile>
          <OverviewTile icon={CheckCircle2} color="#06b6a8" label="Status">
            <StatusBadge status={status} label={status === 'expiring' ? 'Expiring Soon' : undefined} />
          </OverviewTile>
          <OverviewTile icon={Users} color="#8b5cf6" label="Users">
            <p className="text-base font-bold text-slate-900 tabular-nums dark:text-white">
              {Number(activeUsers).toLocaleString()}
              <span className="text-sm font-semibold text-slate-400"> / {maxUsers}</span>
            </p>
          </OverviewTile>
          <OverviewTile icon={RotateCcw} color="#f59e0b" label="Usage">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full rounded-full bg-gradient-to-r from-[#0f55f7] to-[#06b6a8]" style={{ width: `${utilization}%` }} />
              </div>
              <span className="text-xs font-semibold text-slate-500 tabular-nums dark:text-slate-400">{utilization}%</span>
            </div>
          </OverviewTile>
          <OverviewTile icon={Calendar} color="#0f55f7" label="Start Date">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{formatDate(startDate)}</p>
          </OverviewTile>
          <OverviewTile icon={FileClock} color="#0f55f7" label="End Date">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{formatDate(expiryDate)}</p>
          </OverviewTile>
          <OverviewTile icon={Wallet} color="#10b981" label="Amount">
            <p className="text-sm font-bold text-slate-800 tabular-nums dark:text-slate-100">
              {isFree ? 'Free' : formatINR(amount)}
              {!isFree && durationInMonths > 1 ? <span className="font-semibold text-slate-400"> / {durationInMonths} mo</span> : null}
            </p>
          </OverviewTile>
          <OverviewTile icon={Clock} color="#64748b" label="Billing Period">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{formatBillingPeriod(durationInMonths)}</p>
          </OverviewTile>
        </dl>
      </motion.section>

      {/* ── Subscription Information + User Usage ─────────────────────────── */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Subscription Information */}
        <motion.section
          {...fadeUp(0.14)}
          className={`${CARD_CLASS} xl:col-span-2`}
        >
          <SectionHeader
            icon={CreditCard}
            color="#f59e0b"
            title="Subscription Information"
            subtitle="Plan and billing details"
          />
          <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <Field label="Subscription ID" value={subscriptionId} mono />
            <Field label="Organization ID" value={organizationId} mono />
            <Field label="Organization Name" value={organization} />
            <Field label="Current Plan" value={plan} />
            <Field label="Subscription Status" value={status === 'expiring' ? 'Expiring Soon' : status.charAt(0).toUpperCase() + status.slice(1)} />
            <Field label="Start Date" value={formatDate(startDate)} />
            <Field label="End Date" value={formatDate(expiryDate)} />
            <Field label="Billing Period" value={formatBillingPeriod(durationInMonths)} />
            <Field label="Auto-Renewal" value={autoRenew ? 'Enabled' : 'Disabled'} />
            <Field label="Currency" value={currency} />
            <Field label="Subscription Amount" value={isFree ? 'Free' : formatINR(amount)} />
            <Field label="Created Date" value={formatDate(createdAt)} />
          </dl>
        </motion.section>

        {/* User Usage */}
        <motion.section
          {...fadeUp(0.18)}
          className={`${CARD_CLASS} flex flex-col`}
        >
          <SectionHeader
            icon={Users}
            color="#06b6a8"
            title="User Usage"
            subtitle="Seat consumption on this plan"
          />
          <div className="mt-4">
            <div className="flex items-baseline gap-1.5">
              <p className="text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums dark:text-white">
                {Number(activeUsers).toLocaleString()}
              </p>
              <span className="text-sm font-semibold text-slate-400">/ {maxUsers} users</span>
              <span className="ml-auto rounded-full px-2.5 py-1 text-[11px] font-bold tabular-nums text-[#0f55f7]" style={{ backgroundColor: '#0f55f714' }}>
                {utilization}%
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] transition-all duration-500"
                style={{ width: `${utilization}%` }}
              />
            </div>
            <dl className="mt-5 space-y-4 border-t border-slate-100 pt-4 dark:border-slate-800">
              <Field label="Active Users" value={String(Number(activeUsers).toLocaleString())} />
              <Field label="User Limit" value={String(maxUsers)} />
              <Field label="Usage Percentage" value={`${utilization}%`} />
            </dl>
            {!hasNumericLimit && Number(activeUsers) > 0 ? (
              <p className="mt-4 flex items-start gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-[11px] font-medium text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                This plan offers an unlimited user limit.
              </p>
            ) : null}
          </div>
        </motion.section>
      </div>

      {/* ── Plan Details (description + features) ─────────────────────────── */}
      {(description || features.length > 0) ? (
        <motion.section
          {...fadeUp(0.22)}
          className={`${CARD_CLASS} mt-4`}
        >
          <SectionHeader
            icon={Layers}
            color="#8b5cf6"
            title="Plan Details"
            subtitle="What this plan includes"
          />
          {description ? (
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
          ) : null}
          {features.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {features.map((feature) => (
                <li
                  key={feature}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800/60 dark:text-slate-300"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  {feature}
                </li>
              ))}
            </ul>
          ) : null}
        </motion.section>
      ) : null}

      {loadError ? (
        <motion.p
          {...fadeUp(0.22)}
          role="status"
          className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300"
        >
          {loadError}
        </motion.p>
      ) : null}
    </div>
  )
}
