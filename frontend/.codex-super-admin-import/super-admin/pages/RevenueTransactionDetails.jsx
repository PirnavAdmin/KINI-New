import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertCircle, ArrowLeft, ArrowUpRight, Building2,
  ChevronRight, CreditCard, Hash, ReceiptText, Wallet,
} from 'lucide-react'
import { ROUTES } from '@shared/constants/routeConstants'
import { REVENUE_TRANSACTIONS } from '@shared/data/revenueMockData'

// =================================
// TODO: API Integration
// GET /api/v1/super-admin/revenue/transactions/:id
//
// Until the API ships, the page resolves the selected transaction from the
// same REVENUE_TRANSACTIONS dataset used by the Revenue Overview table so the
// numbers always agree with the record that opened it.
// =================================

const formatINR = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`

const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(`${String(value)}T00:00:00`)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

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

const STATUS_CONFIG = {
  Paid: { label: 'Paid', chip: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' },
  Pending: { label: 'Pending', chip: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' },
  Failed: { label: 'Failed', chip: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' },
  Refunded: { label: 'Refunded', chip: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/25' },
}
const statusConfig = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.Failed

const findTransaction = (transactionId) =>
  REVENUE_TRANSACTIONS.find((item) => String(item.id) === String(transactionId))

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
        className={`mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100 ${mono ? 'font-mono text-[#0f55f7] dark:text-[#3b82f6]' : 'break-words'}`}
        title={value}
      >
        {value || '—'}
      </dd>
    </div>
  )
}

const CARD_CLASS =
  'rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-5'

export default function RevenueTransactionDetails() {
  const { transactionId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  // The dataset is pure mock data (resolved synchronously), so the record is
  // derived on every render — direct visits, refreshes and navigation-state
  // clicks all resolve without effects or API round-trips.
  const transaction = location.state?.transaction || findTransaction(transactionId) || null

  const backToRevenue = () => navigate(ROUTES.SUPER_ADMIN.REVENUE)
  const backToDashboard = () => navigate(ROUTES.SUPER_ADMIN.DASHBOARD)

  if (!transaction) {
    return (
      <div className="flex w-full items-center justify-center px-4 py-16">
        <motion.div
          {...fadeUp()}
          className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-500/10">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">Transaction Not Found</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Unable to find a revenue transaction with ID {transactionId}.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={backToDashboard}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0f55f7] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0b46d6]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
            <button
              type="button"
              onClick={backToRevenue}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Back to Revenue
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  const active = transaction
  const {
    id,
    organization,
    organizationId,
    subscriptionId,
    plan,
    amount,
    status,
    paymentDate,
    billingCycle,
    invoiceId,
    paymentMethod,
    revenueType,
    createdAt,
  } = active
  const config = statusConfig(status)

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
            onClick={backToDashboard}
            className="shrink-0 font-medium text-slate-500 transition hover:text-[#0f55f7] dark:text-slate-400 dark:hover:text-[#6aa0ff]"
          >
            Dashboard
          </button>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
          <button
            type="button"
            onClick={backToRevenue}
            className="shrink-0 font-medium text-slate-500 transition hover:text-[#0f55f7] dark:text-slate-400 dark:hover:text-[#6aa0ff]"
          >
            Revenue
          </button>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
          <span className="truncate font-semibold text-slate-800 dark:text-slate-200">Transaction Details</span>
        </nav>
        <button
          type="button"
          onClick={backToRevenue}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-[#0f55f7] dark:text-slate-400 dark:hover:text-[#6aa0ff]"
          aria-label="Back to revenue overview"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Revenue
        </button>
      </motion.div>

      {/* ── Transaction summary card ─────────────────────────────────────── */}
      <motion.section
        {...fadeUp(0.05)}
        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
      >
        <div className={`h-1 w-full ${status === 'Failed' ? 'bg-gradient-to-r from-red-500 via-orange-400 to-amber-400' : status === 'Pending' ? 'bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-400' : status === 'Refunded' ? 'bg-gradient-to-r from-slate-400 via-slate-300 to-slate-200' : 'bg-gradient-to-r from-[#0f55f7] via-[#0b9de8] to-[#06b6a8]'}`} />
        <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          {/* Identity block */}
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#0f55f7] to-[#06b6a8] text-white shadow-md shadow-blue-500/20">
              <Wallet className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-bold tracking-tight text-slate-900 dark:text-white">{organization}</h1>
                <span className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold ${config.chip}`}>
                  {config.label}
                </span>
              </div>
              <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">{plan} plan · {revenueType}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Hash className="h-3.5 w-3.5 text-slate-400" />
                  {id}
                </span>
                <span className="inline-flex items-center gap-1">
                  <ReceiptText className="h-3.5 w-3.5 text-slate-400" />
                  {invoiceId}
                </span>
              </div>
            </div>
          </div>

          {/* Amount block */}
          <div className="flex shrink-0 flex-col gap-1 lg:items-end">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Transaction Amount</p>
            <p className="text-2xl font-extrabold tracking-tight text-slate-900 tabular-nums dark:text-white">
              {formatINR(amount)}
              <span className="ml-1 text-sm font-semibold text-slate-400">INR</span>
            </p>
            <p className="text-[11px] font-medium text-slate-400">{formatDate(paymentDate)}</p>
          </div>
        </div>
      </motion.section>

      {/* ── Transaction information ──────────────────────────────────────── */}
      <motion.section
        {...fadeUp(0.1)}
        className={`${CARD_CLASS} mt-4`}
      >
        <SectionHeader
          icon={Wallet}
          color={status === 'Failed' ? '#ef4444' : status === 'Pending' ? '#f59e0b' : status === 'Refunded' ? '#64748b' : '#10b981'}
          title="Transaction Information"
          subtitle="Billing, payment and subscription details"
        />
        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Transaction ID" value={id} mono />
          <Field label="Organization" value={organization} />
          <Field label="Subscription" value={subscriptionId || '—'} mono />
          <Field label="Plan" value={plan} />
          <Field label="Amount" value={`${formatINR(amount)} INR`} />
          <Field label="Payment Status" value={config.label} />
          <Field label="Payment Date" value={formatDate(paymentDate)} />
          <Field label="Billing Cycle" value={billingCycle || '—'} />
          <Field label="Invoice ID" value={invoiceId || '—'} mono />
          <Field label="Payment Method" value={paymentMethod || '—'} />
          <Field label="Revenue Type" value={revenueType || '—'} />
          <Field label="Created Date" value={formatDateTime(createdAt)} />
        </dl>
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
            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 text-left transition hover:border-teal-200 hover:bg-white hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/30 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-slate-800"
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

    </div>
  )
}
