import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Hash,
  ReceiptText,
  ShieldAlert,
  Wallet,
  XCircle,
} from 'lucide-react'
import StatusBadge from '@shared/components/StatusBadge'
import { ROUTES } from '@shared/constants/routeConstants'
import { PLATFORM_PAYMENTS } from '@shared/data/platformMockData'
import { getApiErrorMessage, superAdminActivityApi } from '@shared/services/apiServices'
import { useAuth } from '@shared/hooks/useAuth'

// =================================
// TODO: API Integration
// GET /api/v1/super-admin/payments/:id
//
// Until the API ships, the page resolves the selected payment from the same
// PLATFORM_PAYMENTS dataset used by the dashboard activity feed so the
// numbers always agree with the activity that opened it.
// =================================

const formatINR = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`

const formatDateTime = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// Mirrors the normalization used by the dashboard so a record always exposes
// the same field names whether it comes from navigation state, the API or the
// static dataset.
const normalizePayment = (row = {}) => {
  const status = String(row.status ?? 'succeeded').toLowerCase()
  return {
    ...row,
    id: row.paymentId ?? row.id,
    paymentId: row.paymentId ?? row.id,
    organization: row.organizationName ?? row.organization ?? '—',
    organizationId: row.organizationId,
    subscriptionId: row.subscriptionId,
    plan: row.planName ?? row.plan ?? '-',
    amount: Number(row.amount ?? row.price ?? 0),
    currency: row.currency ?? 'INR',
    status: status === 'failed' || status === 'success' || status === 'succeeded' ? status : 'succeeded',
    isFailed: status === 'failed',
    transactionId: row.transactionId ?? row.referenceId ?? row.transactionReference ?? '—',
    invoiceId: row.invoiceId ?? '—',
    method: row.method ?? row.paymentMethod ?? '—',
    paymentDate: row.paymentDate ?? row.paidAt ?? row.createdAt ?? '',
    failureReason: row.failureReason ?? row.reason ?? '',
  }
}

const findMockPayment = (paymentId) =>
  PLATFORM_PAYMENTS.find((item) => String(item.id) === String(paymentId))

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1], delay },
})

function SectionHeader({ icon: Icon, color, title, subtitle }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ background: `${color}14` }}>
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <div>
        <h3 className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-white">{title}</h3>
        {subtitle ? <p className="text-xs text-slate-400">{subtitle}</p> : null}
      </div>
    </div>
  )
}

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

const CARD_CLASS =
  'rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-5'

export default function PaymentDetails() {
  const { paymentId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const isDemo = Boolean(user?.isDemo || String(user?.email || '').includes('demo'))

  const passedPayment = location.state?.payment
  const [payment, setPayment] = useState(() =>
    passedPayment ? normalizePayment(passedPayment) : null,
  )
  const [loading, setLoading] = useState(!passedPayment)
  const [notFound, setNotFound] = useState(false)
  const [loadError, setLoadError] = useState('')

  // Reset derived state whenever the route id changes so a previous payment
  // never flashes on screen while the next one loads.
  useEffect(() => {
    const passed = location.state?.payment
    // Reset is a deliberate one-time sync with the route param, not derived state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPayment(passed ? normalizePayment(passed) : null)
    setLoading(!passed)
    setNotFound(false)
    setLoadError('')
    // location.state is intentionally not a dependency: state is read once per id change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentId])

  useEffect(() => {
    let active = true

    const load = async () => {
      if (!paymentId) return

      // When the record was passed via navigation state (dashboard click) it
      // is already normalized in the reset effect above.
      if (location.state?.payment) return

      // Demo sessions never hit the API (a demo token would 401 → login redirect).
      if (isDemo) {
        const mock = findMockPayment(paymentId)
        if (!mock) {
          setNotFound(true)
          setLoading(false)
          return
        }
        setPayment(normalizePayment(mock))
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const details = await superAdminActivityApi.paymentDetails(paymentId)
        if (active) {
          setPayment(normalizePayment(details))
          setLoading(false)
        }
      } catch (error) {
        // API not ready yet — resolve from the static dataset so direct visits
        // and refreshes stay usable, mirroring the other detail pages.
        if (!active) return
        const mock = findMockPayment(paymentId)
        if (mock) {
          setPayment(normalizePayment(mock))
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
  }, [paymentId, isDemo])

  const goToSubscriptions = () => navigate(ROUTES.SUPER_ADMIN.SUBSCRIPTIONS)
  const goToDashboard = () => navigate(ROUTES.SUPER_ADMIN.DASHBOARD)

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
        <div className="mt-4 h-72 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900" />
      </div>
    )
  }

  // ── Not found ────────────────────────────────────────────────────────────
  if (notFound || !payment) {
    return (
      <div className="flex w-full items-center justify-center px-4 py-16">
        <motion.div
          {...fadeUp()}
          className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-500/10">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">Record Not Found</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Unable to find the record associated with this activity.
            {loadError ? ` ${loadError}` : ''}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={goToDashboard}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0f55f7] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0b46d6]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
            <button
              type="button"
              onClick={goToSubscriptions}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Back to Subscriptions
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  const {
    organization,
    organizationId,
    subscriptionId,
    plan,
    amount,
    currency,
    transactionId,
    invoiceId,
    method,
    paymentDate,
    failureReason,
    isFailed,
  } = payment

  const statusBadge = isFailed
    ? { status: 'danger', label: 'Failed' }
    : { status: 'success', label: 'Succeeded' }

  const openOrganization = () => {
    if (!organizationId) return
    navigate(
      ROUTES.SUPER_ADMIN.ORGANIZATION_DETAILS.replace(':organizationId', String(organizationId)),
      { state: { organization: { id: organizationId, name: organization } } },
    )
  }

  const openSubscription = () => {
    if (!subscriptionId) return
    navigate(
      ROUTES.SUPER_ADMIN.SUBSCRIPTION_DETAILS.replace(':subscriptionId', String(subscriptionId)),
      { state: { subscription: { subscriptionId, organizationId, organizationName: organization } } },
    )
  }

  return (
    <div className="w-full px-4 py-3 sm:px-6 lg:px-6">
      {/* ── Breadcrumb + back navigation ──────────────────────────────────── */}
      <motion.div
        {...fadeUp(0)}
        className="mb-4 flex flex-wrap items-center justify-between gap-3"
      >
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
          <button
            type="button"
            onClick={goToDashboard}
            className="shrink-0 font-medium text-slate-500 transition hover:text-[#0f55f7] dark:text-slate-400 dark:hover:text-[#6aa0ff]"
          >
            Super Admin
          </button>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
          <button
            type="button"
            onClick={goToSubscriptions}
            className="shrink-0 font-medium text-slate-500 transition hover:text-[#0f55f7] dark:text-slate-400 dark:hover:text-[#6aa0ff]"
          >
            Subscriptions
          </button>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
          <span className="truncate font-semibold text-slate-800 dark:text-slate-200">Payment Details</span>
        </nav>
        <button
          type="button"
          onClick={goToSubscriptions}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-[#0f55f7] dark:text-slate-400 dark:hover:text-[#6aa0ff]"
          aria-label="Back to subscriptions"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Subscriptions
        </button>
      </motion.div>

      {/* ── Payment summary card ─────────────────────────────────────────── */}
      <motion.section
        {...fadeUp(0.05)}
        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
      >
        <div className={`h-1 w-full ${isFailed ? 'bg-gradient-to-r from-red-500 via-orange-400 to-amber-400' : 'bg-gradient-to-r from-[#0f55f7] via-[#0b9de8] to-[#06b6a8]'}`} />
        <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          {/* Identity block */}
          <div className="flex min-w-0 items-center gap-3.5">
            <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white shadow-md ${isFailed ? 'bg-gradient-to-br from-red-500 to-orange-400 shadow-red-500/20' : 'bg-gradient-to-br from-[#0f55f7] to-[#06b6a8] shadow-blue-500/20'}`}>
              {isFailed ? <XCircle className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-bold tracking-tight text-slate-900 dark:text-white">{organization}</h1>
                <StatusBadge status={statusBadge.status} label={statusBadge.label} />
              </div>
              <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">{plan}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Hash className="h-3.5 w-3.5 text-slate-400" />
                  {paymentId}
                </span>
                <span className="inline-flex items-center gap-1">
                  <ReceiptText className="h-3.5 w-3.5 text-slate-400" />
                  {transactionId}
                </span>
              </div>
            </div>
          </div>

          {/* Amount block */}
          <div className="flex shrink-0 flex-col gap-1 lg:items-end">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Payment Amount</p>
            <p className="text-2xl font-extrabold tracking-tight text-slate-900 tabular-nums dark:text-white">
              {formatINR(amount)}
              <span className="ml-1 text-sm font-semibold text-slate-400">{currency}</span>
            </p>
            <p className="text-[11px] font-medium text-slate-400">{formatDateTime(paymentDate)}</p>
          </div>
        </div>
      </motion.section>

      {/* ── Payment Information ──────────────────────────────────────────── */}
      <motion.section
        {...fadeUp(0.1)}
        className={`${CARD_CLASS} mt-4`}
      >
        <SectionHeader
          icon={Wallet}
          color={isFailed ? '#ef4444' : '#10b981'}
          title="Payment Information"
          subtitle="Transaction and billing details"
        />
        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Payment ID" value={paymentId} mono />
          <Field label="Transaction / Reference ID" value={transactionId} mono />
          <Field label="Invoice ID" value={invoiceId} mono />
          <Field label="Organization" value={organization} />
          <Field label="Subscription" value={subscriptionId || '—'} mono />
          <Field label="Plan" value={plan} />
          <Field label="Amount" value={`${formatINR(amount)} ${currency}`} />
          <Field label="Payment Status" value={statusBadge.label} />
          <Field label="Payment Method" value={method} />
          <Field label="Payment Date" value={formatDateTime(paymentDate)} />
        </dl>

        {isFailed && (
          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 dark:border-red-500/20 dark:bg-red-500/10">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <div>
              <p className="text-xs font-bold text-red-700 dark:text-red-300">Payment failed</p>
              <p className="mt-0.5 text-xs font-medium text-red-600/90 dark:text-red-300/90">
                {failureReason || 'The payment could not be processed.'}
              </p>
            </div>
          </div>
        )}
      </motion.section>

      {/* ── Related records ──────────────────────────────────────────────── */}
      <motion.section
        {...fadeUp(0.14)}
        className={`${CARD_CLASS} mt-4`}
      >
        <SectionHeader
          icon={Building2}
          color="#0f55f7"
          title="Related Records"
          subtitle="Jump to the exact organization or subscription"
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={openOrganization}
            disabled={!organizationId}
            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 text-left transition hover:border-blue-200 hover:bg-white hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-slate-800"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10">
              <Building2 className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-slate-900 dark:text-white">{organization}</span>
              <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">View organization details</span>
            </span>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-blue-600" />
          </button>
          <button
            type="button"
            onClick={openSubscription}
            disabled={!subscriptionId}
            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 text-left transition hover:border-blue-200 hover:bg-white hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-slate-800"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-500/10">
              <CreditCard className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-slate-900 dark:text-white">{subscriptionId || 'Subscription'}</span>
              <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">{plan} plan · view subscription details</span>
            </span>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-teal-600" />
          </button>
        </div>
      </motion.section>

      {loadError ? (
        <motion.p
          {...fadeUp(0.18)}
          role="status"
          className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300"
        >
          {loadError}
        </motion.p>
      ) : null}
    </div>
  )
}
