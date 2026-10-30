import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  CreditCard, TrendingUp, DollarSign, BarChart3, AlertCircle,
  CheckCircle, RotateCcw, ArrowUpRight, Ban, X, Plus, Trash2, Eye
} from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { KPICard, DashboardSection } from '@shared/components/SharedComponents'
import PageHeader from '@shared/components/PageHeader'
import DataTable from '@shared/components/DataTable'
import StatusBadge from '@shared/components/StatusBadge'
import Modal from '@shared/components/Modal'
import { Button, Input, Select } from '@shared/components/FormElements'
import { REVENUE_GROWTH, PLAN_DISTRIBUTION } from '@shared/data/superAdminPageMockData'
import { getApiErrorMessage, subscriptionApi } from '@shared/services/apiServices'
 
// =================================
// TODO: API Integration
// GET /api/v1/super-admin/subscriptions
// GET /api/v1/super-admin/subscriptions/stats
// POST /api/v1/super-admin/subscriptions/:id/renew
// POST /api/v1/super-admin/subscriptions/:id/upgrade
// POST /api/v1/super-admin/subscriptions/:id/cancel
// =================================
 
const TOOLTIP_STYLE = {
  background: 'rgba(255,255,255,0.95)',
  border: 'none',
  borderRadius: '12px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  padding: '8px 12px',
  fontSize: '12px',
}
 
const PLAN_FILTERS = [
  { value: '', label: 'All Plans' },
  { value: 'Free', label: 'Free' },
  { value: 'Trial', label: 'Trial' },
  { value: 'Starter', label: 'Starter' },
  { value: 'Professional', label: 'Professional' },
  { value: 'Enterprise', label: 'Enterprise' },
  { value: 'Enterprise Plus', label: 'Enterprise Plus' },
]
 
const STATUS_FILTERS = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'trial', label: 'Trial' },
  { value: 'expired', label: 'Expired' },
  { value: 'suspended', label: 'Suspended' },
]

const normalizeSubscription = (row) => ({
  ...row,
  id: row.subscriptionId ?? row.id,
  subscriptionId: row.subscriptionId ?? row.id,
  organization: row.organizationName || 'Platform Plan',
  plan: row.planName || row.plan || '-',
  amount: Number(row.price || 0),
  seats: row.maxUsers || 0,
  durationInMonths: row.durationInMonths || 1,
  maxUsers: row.maxUsers || 0,
  isActive: Boolean(row.isActive),
  startDate: row.startDate || '-',
  expiryDate: row.expiryDate || `${row.durationInMonths || 0} month(s)`,
  status: row.isActive ? 'active' : 'inactive',
})
 
export default function SuperAdminSubscriptions() {
  const navigate = useNavigate()
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [planFilter, setPlanFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [confirmModal, setConfirmModal] = useState({ open: false, row: null, action: '' })
  const [formOpen, setFormOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ planName: '', price: '', durationInMonths: 12, maxUsers: '', isActive: true })

  const fetchSubscriptions = async () => {
      setLoading(true)
      try {
        const rows = await subscriptionApi.list()
        setSubscriptions((Array.isArray(rows) ? rows : []).map(normalizeSubscription))
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Unable to load subscriptions'))
      } finally {
        setLoading(false)
      }
  }

  useEffect(() => {
    const timer = window.setTimeout(fetchSubscriptions, 0)
    return () => window.clearTimeout(timer)
  }, [])

  const createSubscription = async (event) => {
    event.preventDefault()
    if (!form.planName.trim() || Number(form.price) < 0 || Number(form.durationInMonths) <= 0 || Number(form.maxUsers) <= 0) {
      toast.error('Enter valid plan details')
      return
    }
    setSaving(true)
    try {
      await subscriptionApi.create(form)
      toast.success('Subscription plan added')
      setFormOpen(false)
      setForm({ planName: '', price: '', durationInMonths: 12, maxUsers: '', isActive: true })
      await fetchSubscriptions()
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
 
  const columns = [
    {
      header: 'Organization',
      accessor: 'organization',
      render: (row) => (
        <span className="text-sm font-semibold text-slate-900 dark:text-white">{row.organization}</span>
      ),
    },
    { header: 'Plan', accessor: 'plan' },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (row) => (
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          ${row.amount.toLocaleString()}{row.amount > 0 ? '/yr' : ''}
        </span>
      ),
    },
    { header: 'Seats', accessor: 'seats' },
    { header: 'Start Date', accessor: 'startDate' },
    { header: 'Expiry Date', accessor: 'expiryDate' },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      accessor: 'actions',
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => navigate(`/super-admin/subscriptions/${row.id}`)} className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors" aria-label="View subscription" title="View details"><Eye className="w-3.5 h-3.5 text-slate-400 hover:text-blue-600" /></button>
          {row.status === 'active' && (
            <>
              <button onClick={() => handleRenew(row)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label="Renew plan"
                title="Renew Plan">
                <RotateCcw className="w-3.5 h-3.5 text-slate-400 hover:text-brand" />
              </button>
              <button onClick={() => handleUpgrade(row)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label="Upgrade plan"
                title="Upgrade Plan">
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 hover:text-teal" />
              </button>
              <button onClick={() => handleCancel(row)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label="Cancel plan"
                title="Cancel Plan">
                <Ban className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
              </button>
            </>
          )}
          {row.status === 'expired' && (
            <button onClick={() => handleRenew(row)} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-brand/10 text-brand hover:bg-brand/20 transition-colors">
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
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KPICard dense icon={DollarSign} label="Monthly Revenue" prefix="$" value={Math.round(subscriptions.filter((item) => item.isActive).reduce((sum, item) => sum + item.amount / Math.max(item.durationInMonths, 1), 0))} color="#0f55f7" delay={0} />
        <KPICard dense icon={TrendingUp} label="Plan Revenue" prefix="$" value={subscriptions.reduce((sum, item) => sum + item.amount, 0)} color="#06b6a8" delay={1} />
        <KPICard dense icon={CheckCircle} label="Active Plans" value={subscriptions.filter((item) => item.isActive).length} color="#0f55f7" delay={2} />
        <KPICard dense icon={AlertCircle} label="Inactive Plans" value={subscriptions.filter((item) => !item.isActive).length} color="#06b6a8" delay={3} />
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
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [`$${value.toLocaleString()}`, 'MRR']} />
                <Area type="monotone" dataKey="mrr" stroke="#06b6a8" strokeWidth={2} fill="url(#revGrowthGrad)" name="MRR" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </DashboardSection>
 
        <DashboardSection title="Plan Distribution" subtitle="By revenue" icon={BarChart3} className="lg:col-span-2">
          <div className="h-44 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={PLAN_DISTRIBUTION} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                  paddingAngle={3} dataKey="revenue" animationBegin={200} animationDuration={1000}>
                  {PLAN_DISTRIBUTION.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2">
              {PLAN_DISTRIBUTION.map((d) => (
                <span key={d.name} className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name}
                </span>
              ))}
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
          <div className="flex gap-2"><Button variant="outline" icon={BarChart3}>Subscription Analytics</Button><Button icon={Plus} onClick={() => setFormOpen(true)}>Add Plan</Button></div>
        }
      />
 
      {/* Table */}
      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        pageSize={8}
        searchPlaceholder="Search by organization or plan..."
        emptyTitle="No subscriptions found"
        emptyDescription="Try adjusting your filters."
        emptyIcon={CreditCard}
        filters={
          <div className="flex gap-2 flex-wrap">
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-3 py-2.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/30"
            >
              {PLAN_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/30"
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
        }
      />
 
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
                      <RotateCcw className="w-5 h-5 text-brand" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-teal" />
                    )}
                  </div>
                  <button onClick={() => setConfirmModal({ open: false, row: null, action: '' })} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
 
                <h3 className="text-lg font-bold text-teal dark:text-teal-300 mb-2">
                  {confirmModal.action === 'renew' && 'Renew Subscription'}
                  {confirmModal.action === 'upgrade' && 'Upgrade Plan'}
                  {confirmModal.action === 'cancel' && 'Cancel Subscription'}
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                  {confirmModal.action === 'renew' && `Renew ${confirmModal.row.organization}'s subscription for another year at $${confirmModal.row.amount.toLocaleString()}/yr?`}
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
                        : 'bg-gradient-to-r from-brand to-teal'
                    }`}>
                    {confirmModal.action === 'cancel' ? 'Yes, Cancel' : 'Confirm'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Add Subscription Plan"
        description="Create a plan using the subscriptions API"
        footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button><Button loading={saving} onClick={createSubscription}>Add Plan</Button></div>}
      >
        <form onSubmit={createSubscription} className="space-y-4">
          <Input label="Plan Name" required value={form.planName} onChange={(e) => setForm({ ...form, planName: e.target.value })} />
          <Input label="Price" type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <Input label="Duration (months)" type="number" required value={form.durationInMonths} onChange={(e) => setForm({ ...form, durationInMonths: e.target.value })} />
          <Input label="Maximum Users" type="number" required value={form.maxUsers} onChange={(e) => setForm({ ...form, maxUsers: e.target.value })} />
          <Select label="Status" value={String(form.isActive)} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })} placeholder="" options={[{ value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }]} />
          <button type="submit" className="hidden" aria-hidden="true" />
        </form>
      </Modal>
    </div>
  )
}
 
