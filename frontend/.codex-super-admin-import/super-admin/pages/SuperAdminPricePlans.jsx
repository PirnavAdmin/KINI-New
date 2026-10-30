import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  BadgeDollarSign, Building2, Calendar, Check, CheckCircle2, Copy, CreditCard, DollarSign,
  Edit3, Eye, HardDrive, Info, Layers, MoreVertical, Plus, Power, Scale, Search,
  Sparkles, Star, Trash2, TrendingUp, Users, X
} from 'lucide-react'
import { PremiumKpiCard } from '@shared/components/SharedComponents'
import PageHeader from '@shared/components/PageHeader'
import StatusBadge from '@shared/components/StatusBadge'
import { Button, Input, Select } from '@shared/components/FormElements'
import Modal from '@shared/components/Modal'
import EmptyState from '@shared/components/EmptyState'
import {
  PRICING_PLANS, CURRENCIES, SUPPORT_LEVELS, FEATURE_CATALOGUE,
  PLAN_STATUSES,
} from '@shared/data/pricingPlanMockData'
import { SUBSCRIPTION_RECORDS } from '@shared/data/subscriptionMockData'

// =================================
// TODO: API Integration
// GET /api/v1/super-admin/plans
// POST /api/v1/super-admin/plans
// PUT /api/v1/super-admin/plans/:id
// DELETE /api/v1/super-admin/plans/:id
// POST /api/v1/super-admin/plans/:id/duplicate
//
// Until the API ships, the page is populated from the static
// PRICING_PLANS dataset and every action mutates frontend mock state.
// =================================

const formatINR = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`

const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const todayISO = () => new Date().toISOString().slice(0, 10)

const PLAN_COLOR_PALETTE = ['#0f55f7', '#06b6a8', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981']

const BILLING_OPTIONS = [
  { value: 'both', label: 'Monthly & Annual' },
  { value: 'monthly', label: 'Monthly only' },
  { value: 'annual', label: 'Annual only' },
]

// Billing cycles offered by the segmented control. Each maps to a per-cycle
// price on the plan model (monthlyPrice / quarterlyPrice / halfYearlyPrice /
// annualPrice) so switching cycles always shows the real period price.
// Exported for the cycle-pricing tests.
export const BILLING_CYCLES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'halfYearly', label: 'Half-Yearly' },
  { value: 'annual', label: 'Annual' },
]

// Exported for the cycle-pricing tests.
export const CYCLE_LABELS = {
  monthly: '/month',
  quarterly: '/quarter',
  halfYearly: '/6 mo',
  annual: '/year',
}

const CYCLE_PRICE_KEYS = {
  monthly: 'monthlyPrice',
  quarterly: 'quarterlyPrice',
  halfYearly: 'halfYearlyPrice',
  annual: 'annualPrice',
}

// Fallback used only when a plan has no explicit price for the cycle.
const CYCLE_MONTHLY_MULTIPLIERS = { monthly: 1, quarterly: 3, halfYearly: 6, annual: 12 }

// Resolves the price for a billing cycle: the plan's explicit per-cycle price
// wins; otherwise it is derived from the monthly price so every cycle shows a
// real, distinct amount (never the monthly price mislabeled as a quarter).
// Exported for the cycle-pricing tests.
export const cyclePrice = (plan, cycle) => {
  const explicit = plan?.[CYCLE_PRICE_KEYS[cycle]]
  if (explicit !== undefined && explicit !== null && explicit !== '') {
    const parsed = Number(explicit)
    if (Number.isFinite(parsed)) return parsed
  }
  const monthly = Number(plan?.monthlyPrice)
  return Number.isFinite(monthly) ? monthly * CYCLE_MONTHLY_MULTIPLIERS[cycle] : 0
}

// Map a feature key to the label shown on the plan card / details.
const featureLabel = (key) =>
  FEATURE_CATALOGUE.find((item) => item.key === key)?.label || key.replace(/-/g, ' ')

const emptyForm = () => ({
  name: '',
  description: '',
  monthlyPrice: '',
  quarterlyPrice: '',
  halfYearlyPrice: '',
  annualPrice: '',
  currency: 'INR',
  billingCycle: 'both',
  maxUsers: '25',
  unlimitedUsers: false,
  storage: '25 GB',
  trialDays: '14',
  status: 'active',
  supportLevel: 'Email Support',
  selectedFeatures: ['live-classes', 'assessments', 'certificates', 'reports'],
  customFeatures: '',
})

const formFromPlan = (plan) => {
  const advancedKeys = FEATURE_CATALOGUE
    .filter((item) => plan.advanced?.[item.key])
    .map((item) => item.key)
  return {
    name: plan.name,
    description: plan.description,
    monthlyPrice: String(plan.monthlyPrice ?? ''),
    quarterlyPrice: String(plan.quarterlyPrice ?? ''),
    halfYearlyPrice: String(plan.halfYearlyPrice ?? ''),
    annualPrice: String(plan.annualPrice ?? ''),
    currency: plan.currency || 'INR',
    billingCycle: plan.billingCycle || 'both',
    maxUsers: plan.maxUsers === 'Unlimited' ? '25' : String(plan.maxUsers ?? ''),
    unlimitedUsers: plan.maxUsers === 'Unlimited',
    storage: plan.storage || '',
    trialDays: String(plan.trialDays ?? ''),
    status: plan.status || 'active',
    supportLevel: plan.supportLevel || 'Email Support',
    selectedFeatures: advancedKeys,
    customFeatures: '',
  }
}

// ─── Action menu (kebab) used on every plan card ───────────────────────────
function PlanActionMenu({ plan, onAction }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const closeOnOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick)
  }, [open])

  const items = [
    { key: 'view', label: 'View Details', icon: Eye },
    { key: 'edit', label: 'Edit Plan', icon: Edit3 },
    { key: 'duplicate', label: 'Duplicate Plan', icon: Copy },
    {
      key: 'toggle',
      label: plan.status === 'active' ? 'Deactivate Plan' : 'Activate Plan',
      icon: Power,
    },
    { key: 'delete', label: 'Delete Plan', icon: Trash2, danger: true },
  ]

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
        aria-label={`Actions for ${plan.name} plan`}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ duration: 0.15 }}
            role="menu"
            className="absolute right-0 top-10 z-30 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-800"
          >
            {items.map((item) => (
              <button
                key={item.key}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false)
                  onAction(item.key, plan)
                }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                  item.danger
                    ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Pricing plan card ─────────────────────────────────────────────────────
function PlanCard({ plan, billingCycle, compareMode, compareSelected, onToggleCompare, onAction, index }) {
  const mainPrice = cyclePrice(plan, billingCycle)
  const periodLabel = CYCLE_LABELS[billingCycle]
  const isFree = cyclePrice(plan, 'monthly') === 0
  const annualSavings = Math.max(0, Number(plan.monthlyPrice) * 12 - Number(plan.annualPrice))
  const showSavings = billingCycle === 'annual' && annualSavings > 0
  // Secondary line mirrors the existing card pattern: the annual rate under the
  // monthly price, and the monthly rate under every longer cycle.
  const secondaryLabel = billingCycle === 'monthly'
    ? (cyclePrice(plan, 'annual') > 0 ? `${formatINR(cyclePrice(plan, 'annual'))}/year` : 'Free forever')
    : (Number(plan.monthlyPrice) > 0 ? `${formatINR(plan.monthlyPrice)}/month` : 'Free forever')
  const accent = plan.color || PLAN_COLOR_PALETTE[index % PLAN_COLOR_PALETTE.length]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className={`relative flex flex-col overflow-hidden rounded-[16px] border bg-white/95 backdrop-blur-2xl transition-all duration-300 dark:bg-slate-900/75 ${
        plan.popular
          ? 'border-[#0f55f7]/40 shadow-[0_12px_40px_-12px_rgba(15,85,247,0.35)] ring-1 ring-[#0f55f7]/30'
          : 'border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.05)] hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-16px_rgba(15,23,42,0.2)] dark:border-slate-700/80'
      }`}
    >
      {/* Top accent bar */}
      <div className="h-1 w-full shrink-0" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}55)` }} />

      {/* Compare checkbox (only in compare mode) */}
      {compareMode && (
        <button
          type="button"
          onClick={() => onToggleCompare(plan.id)}
          aria-pressed={compareSelected}
          className={`absolute right-3 top-3 z-10 flex h-8 items-center gap-2 rounded-lg border px-2.5 text-xs font-semibold transition-colors ${
            compareSelected
              ? 'border-[#0f55f7] bg-[#0f55f7] text-white'
              : 'border-slate-300 bg-white text-slate-500 hover:border-[#0f55f7] hover:text-[#0f55f7] dark:border-slate-600 dark:bg-slate-800'
          }`}
        >
          <span className={`grid h-4 w-4 place-items-center rounded border ${compareSelected ? 'border-white bg-white/20' : 'border-slate-300 dark:border-slate-500'}`}>
            {compareSelected && <Check className="h-3 w-3" strokeWidth={3} />}
          </span>
          {compareSelected ? 'Selected' : 'Select'}
        </button>
      )}

      <div className="flex flex-1 flex-col p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-slate-900/5"
              style={{ background: `${accent}14` }}
            >
              <BadgeDollarSign className="h-5 w-5" style={{ color: accent }} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-base font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                {plan.popular && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#0f55f7]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#0f55f7]">
                    <Star className="h-3 w-3" /> Popular
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-slate-400">{plan.description}</p>
            </div>
          </div>
          <PlanActionMenu plan={plan} onAction={onAction} />
        </div>

        {/* Pricing */}
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{formatINR(mainPrice)}</span>
              <span className="text-sm font-medium text-slate-400">{periodLabel}</span>
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">{secondaryLabel}</p>
          </div>
          {showSavings && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              Save {formatINR(annualSavings)}
            </span>
          )}
          {isFree && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-500 dark:bg-slate-700/50 dark:text-slate-300">
              <Sparkles className="h-3 w-3" /> Free
            </span>
          )}
        </div>

        {/* Limits */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 dark:border-slate-700/60 dark:bg-slate-800/40">
            <Users className="h-4 w-4 shrink-0 text-[#0f55f7]" />
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">{plan.maxUsers === 'Unlimited' ? 'Unlimited' : `${plan.maxUsers} users`}</p>
              <p className="text-[10px] text-slate-400">Max users</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 dark:border-slate-700/60 dark:bg-slate-800/40">
            <HardDrive className="h-4 w-4 shrink-0 text-[#06b6a8]" />
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">{plan.storage}</p>
              <p className="text-[10px] text-slate-400">Storage</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <ul className="mt-4 space-y-1.5">
          {(plan.features || []).slice(0, 5).map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" strokeWidth={3} />
              <span className="truncate">{feature}</span>
            </li>
          ))}
        </ul>

        {/* Footer meta */}
        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-700/60">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Users className="h-3.5 w-3.5" />
              <span className="font-semibold text-slate-600 dark:text-slate-300">{plan.subscribers.toLocaleString()}</span>
              subscribers
            </div>
            <StatusBadge status={plan.status} />
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Created {formatDate(plan.createdDate)}</span>
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Updated {formatDate(plan.updatedDate)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Add / Edit Plan modal ─────────────────────────────────────────────────
function PlanFormModal({ open, onClose, plan, onSave, saving }) {
  // The parent passes a changing `key`, so this component remounts with a
  // fresh form for every open (add vs edit) — no effect needed to seed state.
  const [form, setForm] = useState(() => (plan ? formFromPlan(plan) : emptyForm()))
  const [errors, setErrors] = useState({})
  const isEdit = Boolean(plan)

  const toggleFeature = (key) => {
    setForm((current) => ({
      ...current,
      selectedFeatures: current.selectedFeatures.includes(key)
        ? current.selectedFeatures.filter((item) => item !== key)
        : [...current.selectedFeatures, key],
    }))
  }

  const validate = () => {
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Plan name is required.'
    if (!form.description.trim()) nextErrors.description = 'Plan description is required.'
    const monthly = Number(form.monthlyPrice)
    if (form.monthlyPrice === '' || Number.isNaN(monthly) || monthly < 0) nextErrors.monthlyPrice = 'Enter a valid monthly price.'
    const annual = Number(form.annualPrice)
    if (form.annualPrice === '' || Number.isNaN(annual) || annual < 0) nextErrors.annualPrice = 'Enter a valid annual price.'
    if (!form.unlimitedUsers) {
      const users = Number(form.maxUsers)
      if (form.maxUsers === '' || Number.isNaN(users) || users < 1) nextErrors.maxUsers = 'Enter at least 1 user (or enable Unlimited).'
    }
    if (!form.storage.trim()) nextErrors.storage = 'Storage limit is required.'
    if (!form.supportLevel) nextErrors.supportLevel = 'Select a support level.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSave = () => {
    if (!validate()) {
      toast.error('Please fix the highlighted fields')
      return
    }
    const customLines = form.customFeatures
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
    const features = [
      ...(form.unlimitedUsers ? ['Unlimited users'] : [`Up to ${form.maxUsers} users`]),
      ...(form.storage.trim() ? [`${form.storage.trim()} storage`] : []),
      ...form.selectedFeatures.map(featureLabel),
      ...customLines,
    ]
    const advanced = {}
    FEATURE_CATALOGUE.forEach((item) => { advanced[item.key] = form.selectedFeatures.includes(item.key) })
    const monthly = Number(form.monthlyPrice)
    // Blank quarterly / half-yearly fields default to the monthly equivalent so
    // every plan always supports all four billing cycles.
    onSave({
      name: form.name.trim(),
      description: form.description.trim(),
      monthlyPrice: monthly,
      quarterlyPrice: form.quarterlyPrice === '' ? monthly * 3 : Number(form.quarterlyPrice),
      halfYearlyPrice: form.halfYearlyPrice === '' ? monthly * 6 : Number(form.halfYearlyPrice),
      annualPrice: Number(form.annualPrice),
      currency: form.currency,
      billingCycle: form.billingCycle,
      maxUsers: form.unlimitedUsers ? 'Unlimited' : Number(form.maxUsers),
      storage: form.storage.trim(),
      trialDays: Number(form.trialDays || 0),
      status: form.status,
      supportLevel: form.supportLevel,
      features,
      advanced,
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Plan' : 'Add New Plan'}
      description={isEdit ? `Update pricing, features and limits for ${plan?.name}.` : 'Create a new subscription plan for organizations.'}
      size="lg"
      bodyClassName="pb-6"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} loading={saving} icon={isEdit ? Check : Plus}>
            {isEdit ? 'Save Changes' : 'Create Plan'}
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input label="Plan Name" required icon={BadgeDollarSign} error={errors.name} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Growth Plan" />
        </div>
        <div className="sm:col-span-2">
          <Input label="Plan Description" required icon={Info} error={errors.description} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description shown on the plan card" />
        </div>
        <Input label="Monthly Price" type="number" required icon={DollarSign} error={errors.monthlyPrice} value={form.monthlyPrice} onChange={(e) => setForm({ ...form, monthlyPrice: e.target.value })} placeholder="0" />
        <Input label="Quarterly Price" type="number" icon={DollarSign} value={form.quarterlyPrice} onChange={(e) => setForm({ ...form, quarterlyPrice: e.target.value })} placeholder="Monthly × 3" />
        <Input label="Half-Yearly Price" type="number" icon={DollarSign} value={form.halfYearlyPrice} onChange={(e) => setForm({ ...form, halfYearlyPrice: e.target.value })} placeholder="Monthly × 6" />
        <Input label="Annual Price" type="number" required icon={DollarSign} error={errors.annualPrice} value={form.annualPrice} onChange={(e) => setForm({ ...form, annualPrice: e.target.value })} placeholder="0" />
        <Select label="Currency" icon={CreditCard} options={CURRENCIES.map((c) => ({ value: c, label: c }))} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
        <Select label="Billing Cycle" icon={Layers} options={BILLING_OPTIONS} value={form.billingCycle} onChange={(e) => setForm({ ...form, billingCycle: e.target.value })} />
        <div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input label="Maximum Users" type="number" required icon={Users} error={errors.maxUsers} disabled={form.unlimitedUsers} value={form.unlimitedUsers ? '' : form.maxUsers} onChange={(e) => setForm({ ...form, maxUsers: e.target.value })} placeholder="25" />
            </div>
            <label className="flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={form.unlimitedUsers}
                onChange={(e) => setForm({ ...form, unlimitedUsers: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 accent-[#0f55f7]"
              />
              Unlimited
            </label>
          </div>
          {errors.maxUsers && <p className="mt-1 text-xs text-[#EF4444]">{errors.maxUsers}</p>}
        </div>
        <Input label="Storage Limit" required icon={HardDrive} error={errors.storage} value={form.storage} onChange={(e) => setForm({ ...form, storage: e.target.value })} placeholder="e.g. 100 GB" />
        <Input label="Trial Period (days)" type="number" icon={Calendar} value={form.trialDays} onChange={(e) => setForm({ ...form, trialDays: e.target.value })} placeholder="14" />
        <Select label="Plan Status" icon={Power} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} />

        {/* Feature selection */}
        <div className="sm:col-span-2">
          <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Feature Selection</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {FEATURE_CATALOGUE.map((item) => {
              const selected = form.selectedFeatures.includes(item.key)
              return (
                <label
                  key={item.key}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                    selected
                      ? 'border-[#0f55f7]/40 bg-[#0f55f7]/5 text-slate-800 dark:text-slate-100'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleFeature(item.key)}
                    className="h-4 w-4 rounded border-slate-300 accent-[#0f55f7]"
                  />
                  <span className="flex-1 truncate">{item.label}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{item.group}</span>
                </label>
              )
            })}
          </div>
        </div>

        <div className="sm:col-span-2">
          <Input label="Custom Features" icon={Sparkles} value={form.customFeatures} onChange={(e) => setForm({ ...form, customFeatures: e.target.value })} placeholder="One feature per line, e.g. SLA-backed uptime" />
          <p className="mt-1 text-xs text-slate-400">Each line becomes a feature listed on the plan.</p>
        </div>

        <div className="sm:col-span-2">
          <Select label="Support Level" required icon={Layers} options={SUPPORT_LEVELS.map((level) => ({ value: level, label: level }))} value={form.supportLevel} onChange={(e) => setForm({ ...form, supportLevel: e.target.value })} />
          {errors.supportLevel && <p className="mt-1 text-xs text-[#EF4444]">{errors.supportLevel}</p>}
        </div>
      </div>
    </Modal>
  )
}

// ─── View Plan Details modal ───────────────────────────────────────────────
const DetailSection = ({ title, children }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700/60 dark:bg-slate-800/40">
    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{title}</p>
    {children}
  </div>
)

const DetailInfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-2 text-sm last:border-0 dark:border-slate-700/50">
    <span className="text-slate-500 dark:text-slate-400">{label}</span>
    <span className="text-right font-semibold text-slate-800 dark:text-slate-100">{value}</span>
  </div>
)

function PlanDetailsModal({ open, onClose, plan, organizationsByPlan, onEdit }) {
  if (!plan) return null
  const orgs = organizationsByPlan[plan.name] || []
  const annualSavings = Math.max(0, Number(plan.monthlyPrice) * 12 - Number(plan.annualPrice))

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={plan.name}
      description={plan.description}
      size="lg"
      bodyClassName="pb-6"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button icon={Edit3} onClick={() => { onClose(); onEdit(plan) }}>Edit Plan</Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Status strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${plan.color || '#0f55f7'}14` }}>
              <BadgeDollarSign className="h-5 w-5" style={{ color: plan.color || '#0f55f7' }} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{plan.name}</p>
              <p className="text-xs text-slate-400">{plan.currency} · {BILLING_OPTIONS.find((b) => b.value === plan.billingCycle)?.label || plan.billingCycle}</p>
            </div>
          </div>
          <StatusBadge status={plan.status} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Pricing */}
          <DetailSection title="Pricing">
            <DetailInfoRow label="Monthly" value={formatINR(cyclePrice(plan, 'monthly'))} />
            <DetailInfoRow label="Quarterly" value={formatINR(cyclePrice(plan, 'quarterly'))} />
            <DetailInfoRow label="Half-Yearly" value={formatINR(cyclePrice(plan, 'halfYearly'))} />
            <DetailInfoRow label="Annual" value={formatINR(cyclePrice(plan, 'annual'))} />
            {annualSavings > 0 && (
              <DetailInfoRow label="Annual savings" value={<span className="text-emerald-600 dark:text-emerald-400">Save {formatINR(annualSavings)}</span>} />
            )}
            <DetailInfoRow label="Currency" value={plan.currency} />
            <DetailInfoRow label="Trial period" value={plan.trialDays ? `${plan.trialDays} days` : 'None'} />
          </DetailSection>

          {/* Usage limits */}
          <DetailSection title="Usage Limits">
            <DetailInfoRow label="Maximum users" value={plan.maxUsers === 'Unlimited' ? 'Unlimited' : `${plan.maxUsers} users`} />
            <DetailInfoRow label="Storage" value={plan.storage} />
            <DetailInfoRow label="Support level" value={plan.supportLevel} />
            <DetailInfoRow label="Subscribers" value={plan.subscribers.toLocaleString()} />
            <DetailInfoRow label="Organizations" value={orgs.length} />
          </DetailSection>
        </div>

        {/* Features */}
        <DetailSection title="Features">
          <ul className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            {(plan.features || []).map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" strokeWidth={3} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </DetailSection>

        {/* Organizations using the plan */}
        <DetailSection title={`Organizations on this plan (${orgs.length})`}>
          {orgs.length ? (
            <div className="flex flex-wrap gap-2">
              {orgs.map((org) => (
                <span key={org} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  {org}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No organizations are currently on this plan.</p>
          )}
        </DetailSection>

        {/* Timestamps */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400">
            <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
            <span><span className="font-semibold text-slate-700 dark:text-slate-200">Created:</span> {formatDate(plan.createdDate)}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400">
            <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
            <span><span className="font-semibold text-slate-700 dark:text-slate-200">Updated:</span> {formatDate(plan.updatedDate)}</span>
          </div>
        </div>
      </div>
    </Modal>
  )
}

// ─── Compare Plans modal ───────────────────────────────────────────────────
function ComparePlansModal({ open, onClose, plans }) {
  if (!plans.length) return null
  const featureRows = [
    { label: 'Maximum users', get: (p) => (p.maxUsers === 'Unlimited' ? 'Unlimited' : `${p.maxUsers} users`) },
    { label: 'Storage', get: (p) => p.storage },
    { label: 'Trial period', get: (p) => (p.trialDays ? `${p.trialDays} days` : 'None') },
    { label: 'Support', get: (p) => p.supportLevel },
    { label: 'Monthly price', get: (p) => formatINR(cyclePrice(p, 'monthly')) },
    { label: 'Quarterly price', get: (p) => formatINR(cyclePrice(p, 'quarterly')) },
    { label: 'Half-Yearly price', get: (p) => formatINR(cyclePrice(p, 'halfYearly')) },
    { label: 'Annual price', get: (p) => formatINR(cyclePrice(p, 'annual')) },
  ]
  const featureKeys = FEATURE_CATALOGUE.map((item) => item.key)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Compare Plans"
      description={`Comparing ${plans.length} plans side by side`}
      size="xl"
      bodyClassName="pb-6"
      footer={
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      }
    >
      <div className="overflow-x-auto -mx-1 px-1">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="sticky left-0 bg-white px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400 dark:bg-slate-800" style={{ minWidth: 170 }}>Capability</th>
              {plans.map((plan) => (
                <th key={plan.id} className="px-4 py-3 text-left">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: plan.color || '#0f55f7' }} />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{plan.name}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {featureRows.map((row) => (
              <tr key={row.label} className="border-b border-slate-100 last:border-0 dark:border-slate-700/50">
                <td className="sticky left-0 bg-white px-4 py-2.5 font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{row.label}</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="px-4 py-2.5 font-semibold text-slate-800 dark:text-slate-100">{row.get(plan)}</td>
                ))}
              </tr>
            ))}
            {featureKeys.map((key) => (
              <tr key={key} className="border-b border-slate-100 last:border-0 dark:border-slate-700/50">
                <td className="sticky left-0 bg-white px-4 py-2.5 font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{featureLabel(key)}</td>
                {plans.map((plan) => {
                  const included = plan.advanced?.[key]
                  return (
                    <td key={plan.id} className="px-4 py-2.5">
                      {included ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <Check className="h-3.5 w-3.5" strokeWidth={3} /> Included
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-slate-400">—</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  )
}

// ─── Confirmation dialog (delete / deactivate) ─────────────────────────────
function ConfirmActionModal({ open, onClose, title, description, confirmLabel, tone = 'danger', loading, onConfirm }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant={tone === 'danger' ? 'danger' : 'success'} loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone === 'danger' ? 'bg-red-50 text-red-500 dark:bg-red-500/10' : 'bg-amber-50 text-amber-500 dark:bg-amber-500/10'}`}>
          {tone === 'danger' ? <Trash2 className="h-5 w-5" /> : <Power className="h-5 w-5" />}
        </div>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
      </div>
    </Modal>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────
export default function SuperAdminPricePlans() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [billingCycle, setBillingCycle] = useState('monthly')

  const [formOpen, setFormOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [detailPlan, setDetailPlan] = useState(null)
  const [confirm, setConfirm] = useState(null) // { action: 'delete' | 'toggle', plan }

  const [compareMode, setCompareMode] = useState(false)
  const [compareSelected, setCompareSelected] = useState([])
  const [compareOpen, setCompareOpen] = useState(false)

  // Organizations per plan — derived from the subscriptions dataset so the
  // detail view shows which orgs actually use each plan.
  const organizationsByPlan = useMemo(() => {
    const map = {}
    SUBSCRIPTION_RECORDS.forEach((record) => {
      const planName = record.planName || record.plan
      if (!planName) return
      if (!map[planName]) map[planName] = []
      if (!map[planName].includes(record.organizationName || record.organization)) {
        map[planName].push(record.organizationName || record.organization)
      }
    })
    return map
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPlans(PRICING_PLANS)
      setLoading(false)
    }, 250)
    return () => window.clearTimeout(timer)
  }, [])

  // Lock page scroll while any modal is open.
  useEffect(() => {
    const anyOpen = formOpen || detailPlan || confirm || compareOpen
    if (!anyOpen) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [formOpen, detailPlan, confirm, compareOpen])

  // ── Derived KPIs (always reflect the current mock plan state) ──
  const kpis = useMemo(() => {
    const active = plans.filter((plan) => plan.status === 'active')
    const totalSubscribers = plans.reduce((sum, plan) => sum + Number(plan.subscribers || 0), 0)
    const paidPlans = plans.filter((plan) => Number(plan.monthlyPrice) > 0)
    const avgPrice = paidPlans.length
      ? Math.round(paidPlans.reduce((sum, plan) => sum + Number(plan.monthlyPrice), 0) / paidPlans.length)
      : 0
    return {
      total: plans.length,
      active: active.length,
      subscribers: totalSubscribers,
      avgPrice,
    }
  }, [plans])

  // ── Filtering (search + status; billing-cycle is a display choice, not a filter) ──
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const matchSearch = !search || `${plan.name} ${plan.description}`.toLowerCase().includes(search.toLowerCase())
      const matchStatus = !statusFilter || plan.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [plans, search, statusFilter])

  // ── Actions ──
  const openAdd = () => { setEditingPlan(null); setFormOpen(true) }
  const openEdit = (plan) => { setEditingPlan(plan); setFormOpen(true) }

  const savePlan = (payload) => {
    setSaving(true)
    window.setTimeout(() => {
      setPlans((current) => {
        if (editingPlan) {
          return current.map((plan) =>
            plan.id === editingPlan.id
              ? { ...plan, ...payload, updatedDate: todayISO() }
              : plan,
          )
        }
        const slug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'plan'
        const newPlan = {
          id: `plan-${slug}-${Date.now()}`,
          ...payload,
          subscribers: 0,
          color: PLAN_COLOR_PALETTE[current.length % PLAN_COLOR_PALETTE.length],
          popular: false,
          createdDate: todayISO(),
          updatedDate: todayISO(),
        }
        return [newPlan, ...current]
      })
      toast.success(editingPlan ? 'Plan updated successfully' : 'Plan created successfully')
      setFormOpen(false)
      setSaving(false)
    }, 350)
  }

  const duplicatePlan = (plan) => {
    setPlans((current) => {
      const copy = {
        ...plan,
        id: `${plan.id}-copy-${Date.now()}`,
        name: `${plan.name} (Copy)`,
        status: 'inactive',
        subscribers: 0,
        popular: false,
        createdDate: todayISO(),
        updatedDate: todayISO(),
      }
      const index = current.findIndex((item) => item.id === plan.id)
      const next = [...current]
      next.splice(index + 1, 0, copy)
      return next
    })
    toast.success(`${plan.name} duplicated`)
  }

  const confirmToggleStatus = (plan) => setConfirm({ action: 'toggle', plan })
  const confirmDelete = (plan) => setConfirm({ action: 'delete', plan })

  const executeConfirm = () => {
    if (!confirm) return
    const { action, plan } = confirm
    if (action === 'toggle') {
      const nextStatus = plan.status === 'active' ? 'inactive' : 'active'
      setPlans((current) => current.map((item) => item.id === plan.id ? { ...item, status: nextStatus, updatedDate: todayISO() } : item))
      toast.success(nextStatus === 'active' ? `${plan.name} plan activated` : `${plan.name} plan deactivated`)
    } else if (action === 'delete') {
      setPlans((current) => current.filter((item) => item.id !== plan.id))
      toast.success(`${plan.name} plan deleted`)
    }
    setConfirm(null)
  }

  const handleAction = (key, plan) => {
    if (key === 'view') setDetailPlan(plan)
    if (key === 'edit') openEdit(plan)
    if (key === 'duplicate') duplicatePlan(plan)
    if (key === 'toggle') confirmToggleStatus(plan)
    if (key === 'delete') confirmDelete(plan)
  }

  const toggleCompare = (id) => {
    setCompareSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  const exitCompareMode = () => {
    setCompareMode(false)
    setCompareSelected([])
  }

  const selectedPlans = plans.filter((plan) => compareSelected.includes(plan.id))

  // Segmented billing-cycle control. Defaults to Monthly; the selected cycle
  // re-prices every plan card. Wraps on small screens instead of overflowing.
  const billingCycleToggle = (
    <div
      className="flex flex-wrap items-center rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800/60"
      role="tablist"
      aria-label="Billing cycle"
    >
      {BILLING_CYCLES.map((cycle) => (
        <button
          key={cycle.value}
          type="button"
          role="tab"
          aria-selected={billingCycle === cycle.value}
          onClick={() => setBillingCycle(cycle.value)}
          className={`rounded-lg px-3 py-2 text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f55f7]/40 sm:px-4 ${
            billingCycle === cycle.value
              ? 'bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          {cycle.label}
        </button>
      ))}
    </div>
  )

  return (
    <div className="w-full px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
      {/* KPIs */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <PremiumKpiCard icon={Layers} label="Total Plans" value={kpis.total} color="#0f55f7" delay={0} />
        <PremiumKpiCard icon={CheckCircle2} label="Active Plans" value={kpis.active} color="#06b6a8" delay={1} />
        <PremiumKpiCard icon={Users} label="Total Subscribers" value={kpis.subscribers} color="#8B5CF6" delay={2} />
        <PremiumKpiCard icon={DollarSign} label="Average Plan Price" prefix="₹" value={kpis.avgPrice} color="#10B981" delay={3} />
      </div>

      {/* Header */}
      <div className="mb-4 rounded-[20px] border border-slate-200 bg-white px-5 pt-5 shadow-[0_12px_38px_-28px_rgba(15,23,42,0.35)] dark:border-slate-700/80 dark:bg-slate-900/60 sm:px-6">
        <PageHeader
          showBreadcrumb={false}
          titleClassName="!text-2xl !leading-8"
          containerClassName="!mb-4"
          title="Price & Plans"
          subtitle="Create, manage, and configure subscription plans for organizations."
          icon={BadgeDollarSign}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={compareMode ? 'outline' : 'secondary'}
                icon={Scale}
                onClick={() => { if (compareMode) exitCompareMode(); else setCompareMode(true) }}
              >
                {compareMode ? 'Cancel Compare' : 'Compare Plans'}
              </Button>
              <Button icon={Plus} onClick={openAdd}>Add New Plan</Button>
            </div>
          }
        />

        {/* Toolbar: search + filters + billing toggle */}
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] flex-1 lg:max-w-xs">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search plans..."
                aria-label="Search plans"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0f55f7] focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label="Clear search">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300"
              aria-label="Filter by status"
            >
              {PLAN_STATUSES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          {billingCycleToggle}
        </div>
      </div>

      {/* Compare selection bar */}
      <AnimatePresence>
        {compareMode && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#0f55f7]/25 bg-[#0f55f7]/5 px-4 py-3 dark:border-[#0f55f7]/40 dark:bg-[#0f55f7]/10"
          >
            <div className="flex items-center gap-3">
              <Scale className="h-5 w-5 text-[#0f55f7]" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Select at least 2 plans to compare
              </p>
              <span className="rounded-full bg-[#0f55f7]/10 px-2.5 py-0.5 text-xs font-bold text-[#0f55f7]">
                {compareSelected.length} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setCompareSelected([])} disabled={!compareSelected.length}>
                Clear
              </Button>
              <Button
                size="sm"
                icon={Scale}
                disabled={compareSelected.length < 2}
                onClick={() => setCompareOpen(true)}
              >
                Compare
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plan cards */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="animate-pulse rounded-[16px] border border-slate-200 bg-white p-5 dark:border-slate-700/80 dark:bg-slate-900/75">
              <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="mt-4 h-9 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="mt-4 space-y-2">
                <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-800" />
                <div className="h-3 w-4/5 rounded bg-slate-100 dark:bg-slate-800" />
                <div className="h-3 w-3/5 rounded bg-slate-100 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredPlans.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredPlans.map((plan, index) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              index={index}
              billingCycle={billingCycle}
              compareMode={compareMode}
              compareSelected={compareSelected.includes(plan.id)}
              onToggleCompare={toggleCompare}
              onAction={handleAction}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[16px] border border-slate-200 bg-white dark:border-slate-700/80 dark:bg-slate-900/60">
          <EmptyState
            icon={search || statusFilter ? Search : Layers}
            title={search || statusFilter ? 'No plans match your filters' : 'No plans found'}
            description={search || statusFilter
              ? 'Try adjusting the search or clearing the active filters.'
              : 'Create your first pricing plan to get started.'}
            action={
              search || statusFilter ? (
                <Button variant="outline" icon={X} onClick={() => { setSearch(''); setStatusFilter('') }}>
                  Clear filters
                </Button>
              ) : (
                <Button icon={Plus} onClick={openAdd}>Add New Plan</Button>
              )
            }
          />
        </div>
      )}

      {/* Add / Edit modal — keyed so the form remounts fresh for each open */}
      <PlanFormModal
        key={formOpen ? (editingPlan?.id || 'new-plan') : 'closed'}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        plan={editingPlan}
        onSave={savePlan}
        saving={saving}
      />

      {/* View details modal */}
      <PlanDetailsModal
        open={Boolean(detailPlan)}
        onClose={() => setDetailPlan(null)}
        plan={detailPlan}
        organizationsByPlan={organizationsByPlan}
        onEdit={openEdit}
      />

      {/* Confirm delete / deactivate */}
      <ConfirmActionModal
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        title={confirm?.action === 'delete' ? 'Delete plan?' : confirm?.plan?.status === 'active' ? 'Deactivate plan?' : 'Activate plan?'}
        description={
          confirm?.action === 'delete'
            ? <>Are you sure you want to delete <b>{confirm?.plan?.name}</b>? This action cannot be undone and will remove the plan permanently.</>
            : confirm?.plan?.status === 'active'
              ? <>Deactivating <b>{confirm?.plan?.name}</b> will hide it from new signups. Existing subscribers are unaffected.</>
              : <>Activate <b>{confirm?.plan?.name}</b> so it becomes available to organizations again.</>
        }
        confirmLabel={
          confirm?.action === 'delete'
            ? 'Delete Plan'
            : confirm?.plan?.status === 'active' ? 'Deactivate Plan' : 'Activate Plan'
        }
        tone={confirm?.action === 'delete' || confirm?.plan?.status === 'active' ? 'danger' : 'success'}
        onConfirm={executeConfirm}
      />

      {/* Compare modal */}
      <ComparePlansModal
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        plans={selectedPlans}
      />
    </div>
  )
}
