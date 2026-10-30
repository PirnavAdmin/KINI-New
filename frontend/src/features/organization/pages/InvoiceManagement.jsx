import { useMemo, useState, useCallback, useEffect } from 'react'
  import { useSearchParams } from 'react-router-dom'
  import {
    FileText,
    IndianRupee,
    Clock,
    AlertTriangle,
    CheckCircle2,
    Plus,
    ArrowLeft,
    Download,
    Eye,
    Receipt,
    Mail,
    Loader2,
    Trash2,
    ChevronRight,
    Headphones,
    Info,
    XCircle,
    Zap,
  ShieldCheck,
  Wallet,
  Share2,
  User,
  BookOpen,
  CalendarDays,
  Percent,
  RotateCcw,
    BarChart3,
  } from 'lucide-react'
  import { motion, AnimatePresence } from 'framer-motion'
  import toast from 'react-hot-toast'
  import DataTable from '@shared/components/DataTable'
  import EmptyState from '@shared/components/EmptyState'
  import Modal from '@shared/components/Modal'
  import InvoiceDetailsModal from '../components/InvoiceDetailsModal'
import { normalizeInvoice } from '../utils/invoicePresentation'
import StatusBadge from '@shared/components/StatusBadge'
import { invoiceService } from '@shared/services/invoiceService'
import { getApiErrorMessage } from '@shared/services/apiServices'
import { studentsApi } from '@/api/students'
import { courseService } from '@shared/services/courseService'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart as RechartsPie, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import MentorBanner from '@features/mentor/components/MentorBanner'
import KiniDialog from '@shared/components/KiniDialog'
import { ORG_BANNERS } from '../constants/orgBanners'
import { OrgKpiCard, OrgPage, OrgPanel, OrgSelect, OrgTabs, monthOverMonth, toDate } from '../components/org-ui/OrgPageKit'
import './invoice-management.css'

// ─── TAB CONFIG ──────────────────────────────────────────────────────────────

const TAB_KEYS = {
  overview: 'Overview',
  'invoice-list': 'Invoice List',
  generate: 'Generate Invoice',
}
const TABS = Object.values(TAB_KEYS)
const getTabKey = (label) =>
  Object.entries(TAB_KEYS).find(([, v]) => v === label)?.[0] || 'overview'

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const INR = (value) =>
  `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`

const STATUSES = ['Paid', 'Pending', 'Overdue', 'Cancelled']
const INVOICE_EMAIL_STATUS_KEY = 'kini:invoice-email-status'

const readInvoiceEmailStatuses = () => {
  try { return JSON.parse(localStorage.getItem(INVOICE_EMAIL_STATUS_KEY) || '{}') }
  catch { return {} }
}

const dateInputValue = (daysFromToday = 0) => {
  const date = new Date()
  date.setDate(date.getDate() + daysFromToday)
  const offset = date.getTimezoneOffset() * 60 * 1000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

async function downloadInvoicePdf(invoice) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  doc.setFillColor(15, 85, 247); doc.rect(0, 0, 210, 9, 'F')
  try {
    const blob = await fetch('/assets/new-logo-f.jpg.jpeg').then((response) => {
      if (!response.ok) throw new Error('Unable to load invoice logo')
      return response.blob()
    })
    const logo = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(blob) })
    // This asset is the complete company wordmark, so it must not be paired
    // with a second text-rendered company name.
    doc.addImage(logo, 'JPEG', 15, 15, 19.7, 19.7)
  } catch { /* Keep PDF export available if the logo request fails. */ }
  const amount = (value) => {
    const numericValue = Number(value || 0)
    const prefix = numericValue < 0 ? '- INR ' : 'INR '
    return `${prefix}${Math.abs(numericValue).toLocaleString('en-IN')}`
  }
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(100, 116, 139)
  doc.text('Learning & Professional Development', 15, 39)
  doc.text('info@kinihub.com  |  +91 98765 43210', 15, 44)
  doc.setTextColor(15, 85, 247); doc.setFont('helvetica', 'bold'); doc.setFontSize(22); doc.text('INVOICE', 195, 24, { align: 'right' }); doc.setFontSize(9); doc.setTextColor(71, 85, 105); doc.text(invoice.id, 195, 31, { align: 'right' })
  doc.setDrawColor(226, 232, 240); doc.line(15, 50, 195, 50); doc.setFont('helvetica', 'bold'); doc.setTextColor(100, 116, 139); doc.text('BILLED TO', 15, 60); doc.text('INVOICE DETAILS', 195, 60, { align: 'right' })
  doc.setTextColor(15, 23, 42); doc.setFontSize(11); doc.text(invoice.customerName, 15, 68); doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(71, 85, 105); doc.text(invoice.courseName, 15, 74); doc.text(`Invoice date: ${invoice.invoiceDate}`, 195, 68, { align: 'right' }); doc.text(`Due date: ${invoice.dueDate}`, 195, 74, { align: 'right' })
  doc.setFillColor(241, 245, 249); doc.roundedRect(15, 84, 180, 11, 2, 2, 'F'); doc.setFont('helvetica', 'bold'); doc.setTextColor(51, 65, 85); doc.text('DESCRIPTION', 20, 91); doc.text('AMOUNT', 190, 91, { align: 'right' })
  doc.setFont('helvetica', 'normal'); doc.setTextColor(15, 23, 42); doc.text(`${invoice.courseName} - Course Fee`, 20, 105); doc.text(amount(invoice.amount), 190, 105, { align: 'right' }); doc.setDrawColor(226, 232, 240); doc.line(15, 112, 195, 112)
  ;[['Subtotal', invoice.amount], ['Discount', -invoice.discount], ['Tax (18%)', invoice.tax], ['Total', invoice.total]].forEach(([label, value], index) => { const y = 124 + index * 8; doc.setFont('helvetica', index === 3 ? 'bold' : 'normal'); doc.text(label, 145, y); doc.text(amount(value), 190, y, { align: 'right' }) })
  doc.setFillColor(239, 246, 255); doc.roundedRect(15, 166, 180, 16, 2, 2, 'F'); doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 85, 247); doc.text(`Payment status: ${invoice.status}`, 20, 176)
  doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 116, 139); doc.setFontSize(8); doc.text('All fees once paid are non-refundable. Please retain this invoice for your records.', 15, 202); doc.text('Thank you for choosing Kini EduHub.', 105, 282, { align: 'center' })
  doc.save(`${invoice.id}-${invoice.customerName.replace(/[^a-z0-9]+/gi, '-')}.pdf`)
}

function buildInvoices(data) {
  const invoices = []
  let counter = 1
  const today = new Date()
  const students = Array.isArray(data?.students) ? data.students : []
  const courses = Array.isArray(data?.courses) ? data.courses : []
  const batches = Array.isArray(data?.batches) ? data.batches : []
  const payments = Array.isArray(data?.payments) ? data.payments : []
  for (const student of students) {
    const course = courses.find((c) => c.id === student.courseId)
    const batch = batches.find((b) => b.id === student.batchId)
    const payment = payments.find((p) => p.studentId === student.id)
    const total = student.fee
    const discount = Math.round(total * 0.05)
    const taxRate = 18
    const taxable = total - discount
    const tax = Math.round(taxable * taxRate / 100)
    const amount = taxable + tax
    const isPaid = student.paid >= total
    const isPartial = student.paid > 0 && student.paid < total
    const status = isPaid ? 'Paid' : isPartial ? 'Pending' : 'Pending'
    const invoiceDate = payment?.date || '2026-08-01'
    const dueDate = new Date(invoiceDate)
    dueDate.setDate(dueDate.getDate() + 30)
    invoices.push({
      id: `INV-${today.getFullYear()}-${String(counter).padStart(3, '0')}`,
      studentId: student.id,
      customerName: student.name,
      courseName: course?.name || 'N/A',
      courseFee: total,
      amount: taxable,
      discount,
      tax,
      total: amount,
      paid: Math.min(student.paid, amount),
      status,
      invoiceDate,
      dueDate: dueDate.toISOString().slice(0, 10),
      paymentMethod: payment?.method || 'N/A',
    })
    counter++
  }
  // Add a couple of overdue examples
  invoices.push({
    id: `INV-${today.getFullYear()}-${String(counter).padStart(3, '0')}`,
    studentId: 'STU-NEW-1',
    customerName: 'Vikram Patel',
    courseName: 'Full Stack Development',
    courseFee: 75000,
    amount: 71250,
    discount: 3750,
    tax: 12825,
    total: 84075,
    paid: 0,
    status: 'Overdue',
    invoiceDate: '2026-06-15',
    dueDate: '2026-07-15',
    paymentMethod: 'N/A',
  })
  counter++
  invoices.push({
    id: `INV-${today.getFullYear()}-${String(counter).padStart(3, '0')}`,
    studentId: 'STU-NEW-2',
    customerName: 'Ananya Gupta',
    courseName: 'Data Science & AI',
    courseFee: 82000,
    amount: 77900,
    discount: 4100,
    tax: 14022,
    total: 91922,
    paid: 0,
    status: 'Cancelled',
    invoiceDate: '2026-07-01',
    dueDate: '2026-07-31',
    paymentMethod: 'N/A',
  })
  return invoices
}

// ─── OVERVIEW SECTION ────────────────────────────────────────────────────────

const STATUS_COLORS = { Paid: '#17a468', Pending: '#f2a516', Overdue: '#e5484d', Cancelled: '#94a3b8' }
const STATUS_PERIODS = [['month', 'This Month'], ['quarter', 'Last 3 Months'], ['year', 'This Year'], ['all', 'All Time']]
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const compactINR = (value) => {
  const numeric = Number(value || 0)
  if (numeric >= 10000000) return `₹${(numeric / 10000000).toFixed(1).replace(/\.0$/, '')}Cr`
  if (numeric >= 100000) return `₹${(numeric / 100000).toFixed(1).replace(/\.0$/, '')}L`
  if (numeric >= 1000) return `₹${Math.round(numeric / 1000)}K`
  return `₹${numeric}`
}
const invoiceInPeriod = (invoice, period) => {
  if (period === 'all') return true
  const date = toDate(invoice.invoiceDate)
  if (!date) return false
  const now = new Date()
  const diff = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth())
  if (period === 'month') return diff === 0
  if (period === 'quarter') return diff >= 0 && diff < 3
  return date.getFullYear() === now.getFullYear()
}

function downloadInvoiceReport(invoices) {
  if (!invoices.length) {
    toast.error('There are no invoices to include in the report yet.')
    return
  }
  const header = ['Invoice #', 'Customer', 'Email', 'Course', 'Invoice Date', 'Due Date', 'Status', 'Subtotal', 'Discount', 'Tax', 'Total', 'Paid', 'Balance']
  const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`
  const lines = invoices.map((invoice) => [
    invoice.id, invoice.customerName, invoice.customerEmail, invoice.courseName, invoice.invoiceDate, invoice.dueDate, invoice.status,
    invoice.amount, invoice.discount, invoice.tax, invoice.total, invoice.paid, Math.max(0, Number(invoice.total || 0) - Number(invoice.paid || 0)),
  ].map(escape).join(','))
  const blob = new Blob([[header.map(escape).join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `invoice-report-${dateInputValue()}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 10000)
  toast.success('Invoice report downloaded.')
}

function OverviewSection({ invoices, onGenerate, onViewAll }) {
  const [statusPeriod, setStatusPeriod] = useState('month')
  const currentYear = new Date().getFullYear()
  const [revenueYear, setRevenueYear] = useState(String(currentYear))

  const stats = useMemo(() => {
    const byStatus = (status) => invoices.filter((i) => i.status === status)
    const paid = byStatus('Paid')
    const pending = byStatus('Pending')
    const overdue = byStatus('Overdue')
    const cancelled = byStatus('Cancelled')
    const open = [...pending, ...overdue]
    const dateOf = (invoice) => invoice.invoiceDate
    const is = (status) => (invoice) => invoice.status === status
    const active = (invoice) => invoice.status !== 'Cancelled'
    return {
      totalInvoices: invoices.length,
      paid: paid.length,
      pending: pending.length,
      overdue: overdue.length,
      cancelled: cancelled.length,
      totalInvoiced: invoices.filter(active).reduce((sum, i) => sum + Number(i.total || 0), 0),
      totalPaid: invoices.reduce((sum, i) => sum + (i.status === 'Paid' ? Number(i.total || 0) : Number(i.paid || 0)), 0),
      totalOutstanding: open.reduce((sum, i) => sum + Math.max(0, Number(i.total || 0) - Number(i.paid || 0)), 0),
      trends: {
        total: monthOverMonth(invoices, dateOf),
        paid: monthOverMonth(invoices, dateOf, is('Paid')),
        pending: monthOverMonth(invoices, dateOf, is('Pending')),
        overdue: monthOverMonth(invoices, dateOf, is('Overdue')),
        cancelled: monthOverMonth(invoices, dateOf, is('Cancelled')),
        invoiced: monthOverMonth(invoices, dateOf, active, (i) => i.total),
        paidAmount: monthOverMonth(invoices, dateOf, () => true, (i) => (i.status === 'Paid' ? i.total : i.paid)),
        outstanding: monthOverMonth(invoices, dateOf, (i) => i.status === 'Pending' || i.status === 'Overdue', (i) => Math.max(0, Number(i.total || 0) - Number(i.paid || 0))),
      },
    }
  }, [invoices])

  const statusBreakdown = useMemo(() => {
    const scoped = invoices.filter((invoice) => invoiceInPeriod(invoice, statusPeriod))
    const total = scoped.length
    return {
      total,
      rows: STATUSES.map((status) => {
        const count = scoped.filter((invoice) => invoice.status === status).length
        return { status, count, pct: total ? Math.round((count / total) * 1000) / 10 : 0 }
      }),
    }
  }, [invoices, statusPeriod])

  const years = useMemo(() => {
    const set = new Set([currentYear])
    invoices.forEach((invoice) => { const date = toDate(invoice.invoiceDate); if (date) set.add(date.getFullYear()) })
    return [...set].sort((a, b) => b - a).map((year) => [String(year), year === currentYear ? 'This Year' : String(year)])
  }, [invoices, currentYear])

  const monthly = useMemo(() => {
    const totals = MONTH_LABELS.map((month) => ({ month, amount: 0 }))
    invoices.forEach((invoice) => {
      if (invoice.status === 'Cancelled') return
      const date = toDate(invoice.invoiceDate)
      if (date && String(date.getFullYear()) === revenueYear) totals[date.getMonth()].amount += Number(invoice.total || 0)
    })
    return totals
  }, [invoices, revenueYear])

  const donutData = statusBreakdown.rows.filter((row) => row.count > 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {invoices.length === 0 && (
        <div className="kx-note kx-note--info" role="status">
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Receipt aria-hidden="true" />No invoices generated yet. Create one for a student and course, then send it by email from the Invoice List.</span>
          <button type="button" className="kx-btn kx-btn--primary kx-btn--sm" onClick={onGenerate}><Plus aria-hidden="true" />Generate first invoice</button>
        </div>
      )}

      <section className="kx-grid kx-grid--5" aria-label="Invoice summary">
        <OrgKpiCard tone="blue" icon={FileText} label="Total Invoices" value={stats.totalInvoices} trend={stats.trends.total} />
        <OrgKpiCard tone="green" icon={CheckCircle2} label="Paid Invoices" value={stats.paid} trend={stats.trends.paid} />
        <OrgKpiCard tone="orange" icon={Clock} label="Pending Invoices" value={stats.pending} trend={stats.trends.pending} trendInvert />
        <OrgKpiCard tone="red" icon={AlertTriangle} label="Overdue Invoices" value={stats.overdue} trend={stats.trends.overdue} trendInvert />
        <OrgKpiCard tone="purple" icon={XCircle} label="Cancelled" value={stats.cancelled} trend={stats.trends.cancelled} trendInvert />
      </section>

      <OrgPanel icon={BarChart3} bareIcon title="Financial Overview">
        <div className="kx-grid kx-grid--fin">
          <OrgKpiCard tone="orange" icon={IndianRupee} label="Total Invoiced Amount" value={INR(stats.totalInvoiced)} trend={stats.trends.invoiced} />
          <OrgKpiCard tone="green" icon={CheckCircle2} label="Total Paid Amount" value={INR(stats.totalPaid)} trend={stats.trends.paidAmount} />
          <OrgKpiCard tone="red" icon={AlertTriangle} label="Total Outstanding" value={INR(stats.totalOutstanding)} trend={stats.trends.outstanding} trendInvert />
        </div>
      </OrgPanel>

      <div className="kx-grid kx-grid--overview">
        <OrgPanel icon={IndianRupee} bareIcon title="Invoice Status" action={<OrgSelect compact auto label="Invoice status period" value={statusPeriod} onChange={setStatusPeriod} options={STATUS_PERIODS} />}>
          <div className="kx-status-breakdown" style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <div className="kx-donut">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={donutData.length ? donutData : [{ status: 'None', count: 1 }]}
                    dataKey="count"
                    nameKey="status"
                    innerRadius="62%"
                    outerRadius="98%"
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                    isAnimationActive={false}
                  >
                    {(donutData.length ? donutData : [{ status: 'None' }]).map((row) => (
                      <Cell key={row.status} fill={STATUS_COLORS[row.status] ?? '#e5ecf4'} />
                    ))}
                  </Pie>
                  {donutData.length > 0 && <Tooltip formatter={(value, name) => [`${value} invoice${value === 1 ? '' : 's'}`, name]} />}
                </RechartsPie>
              </ResponsiveContainer>
              <div className="kx-donut__center"><strong>{statusBreakdown.total}</strong><span>Invoices</span></div>
            </div>
            <div className="kx-legend">
              {statusBreakdown.rows.map((row) => (
                <div key={row.status} className="kx-legend__row">
                  <span className="kx-legend__dot" style={{ background: STATUS_COLORS[row.status] }} />
                  <span>{row.status}</span>
                  <span className="kx-legend__value">{row.count} ({row.pct}%)</span>
                </div>
              ))}
            </div>
          </div>
        </OrgPanel>

        <OrgPanel icon={TrendingUpIcon} bareIcon title="Monthly Revenue" action={<OrgSelect compact auto label="Revenue year" value={revenueYear} onChange={setRevenueYear} options={years} />}>
          <div className="kx-revenue-chart" style={{ width: '100%', height: 190 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 6, right: 6, left: -8, bottom: 0 }}>
                <CartesianGrid stroke="#e5ecf4" vertical />
                <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#d7e1ec' }} tick={{ fontSize: 12, fill: '#4b5f78' }} interval={0} />
                <YAxis tickLine={false} axisLine={{ stroke: '#d7e1ec' }} tick={{ fontSize: 12, fill: '#4b5f78' }} tickFormatter={compactINR} width={52} />
                <Tooltip cursor={{ fill: 'rgba(47,111,228,.06)' }} formatter={(value) => [INR(value), 'Invoiced']} />
                <Bar dataKey="amount" fill="#bcd4f6" radius={[3, 3, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </OrgPanel>

        <OrgPanel icon={Zap} bareIcon title="Quick Actions">
          <div className="kx-actions">
            <button type="button" className="kx-action" onClick={onGenerate}><span className="kx-action__icon"><FileText aria-hidden="true" /></span>Generate Invoice<ChevronRight aria-hidden="true" /></button>
            <button type="button" className="kx-action" onClick={onViewAll}><span className="kx-action__icon"><Eye aria-hidden="true" /></span>View All Invoices<ChevronRight aria-hidden="true" /></button>
            <button type="button" className="kx-action" onClick={() => downloadInvoiceReport(invoices)}><span className="kx-action__icon"><Download aria-hidden="true" /></span>Download Report<ChevronRight aria-hidden="true" /></button>
          </div>
        </OrgPanel>
      </div>

      <div className="kx-note kx-note--info">
        <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ display: 'grid', placeItems: 'center', width: 26, height: 26, borderRadius: 999, background: '#2f6fe4', color: '#fff' }}><Info aria-hidden="true" style={{ width: 16, height: 16 }} /></span>
          Keep track of all invoices, payments and pending dues to ensure smooth financial operations.
        </span>
        <a className="kx-link" href="mailto:info@kinihub.com?subject=Invoice%20support" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--kx-ink)', fontWeight: 500 }}>
          <Headphones aria-hidden="true" style={{ width: 18, height: 18, color: '#2f6fe4' }} />
          Need help? <span style={{ color: '#2f6fe4', fontWeight: 700 }}>Contact Finance Team</span>
        </a>
      </div>
    </div>
  )
}

function TrendingUpIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 3v18h18" />
      <path d="m7 15 4-4 3 3 6-6" />
    </svg>
  )
}

// ─── INVOICE LIST SECTION ────────────────────────────────────────────────────

const statusVariant = (status) => {
  switch (status) {
    case 'Paid': return 'success'
    case 'Pending': return 'pending'
    case 'Overdue': return 'danger'
    case 'Cancelled': return 'inactive'
    default: return 'default'
  }
}

function InvoiceListSection({ invoices, onViewInvoice, onDownloadInvoice, onSendEmail, onDeleteInvoice, emailStates }) {
  const [statusFilter, setStatusFilter] = useState('All')

  const filteredInvoices = useMemo(() => {
    if (statusFilter === 'All') return invoices
    return invoices.filter((i) => i.status === statusFilter)
  }, [invoices, statusFilter])

  const columns = useMemo(() => [
    {
      header: 'Invoice #',
      accessor: 'id',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-[#0f55f7]">{row.id}</span>
      ),
      width: '140px',
    },
    {
      header: 'Customer',
      accessor: 'customerName',
      render: (row) => (
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{row.customerName}</p>
        </div>
      ),
    },
    {
      header: 'Course',
      accessor: 'courseName',
      render: (row) => <span className="text-sm text-slate-600 dark:text-slate-300">{row.courseName}</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={statusVariant(row.status)} label={row.status} />,
    },
    {
      header: 'Email',
      accessor: 'emailSent',
      sortable: false,
      render: (row) => {
        if (row.localOnly) return <span className="text-xs text-slate-400">—</span>
        const state = emailStates[row.invoiceId]
        if (row.emailSent || state === 'sent') return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" />Email sent</span>
        return <button onClick={(event) => { event.stopPropagation(); onSendEmail(row) }} disabled={state === 'sending'} className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100 disabled:cursor-wait disabled:opacity-60" title={row.customerEmail ? `Send to ${row.customerEmail}` : 'Send invoice to customer email'}>{state === 'sending' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}{state === 'sending' ? 'Sending…' : 'Send email'}</button>
      },
    },
    {
      header: 'Due Date',
      accessor: 'dueDate',
      render: (row) => <span className="whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{row.dueDate}</span>,
    },
    {
      header: 'Total',
      accessor: 'total',
      render: (row) => <span className="whitespace-nowrap text-sm font-bold text-slate-900 dark:text-white">{INR(row.total)}</span>,
    },
    {
      header: 'Actions',
      accessor: null,
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-1"><button
          onClick={(e) => { e.stopPropagation(); onViewInvoice(row) }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
        >
          <Eye className="h-3.5 w-3.5" />
          View
        </button><button type="button" onClick={(e) => { e.stopPropagation(); onDownloadInvoice(row) }} className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600" title="Download PDF" aria-label={`Download ${row.id}`}><Download className="h-4 w-4" /></button>{!row.localOnly && <button type="button" onClick={(e) => { e.stopPropagation(); setDeleteTarget(row) }} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Delete invoice" aria-label={`Delete ${row.id}`}><Trash2 className="h-4 w-4" /></button>}</div>
      ),
      width: '100px',
    },
  ], [onViewInvoice, onDownloadInvoice, onSendEmail, onDeleteInvoice, emailStates])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {['All', ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              statusFilter === s
                ? 'bg-[#f28a1e] text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filteredInvoices}
        searchPlaceholder="Search invoices by number, customer, course..."
        pageSize={10}
        emptyTitle="No invoices found"
        emptyDescription={statusFilter !== 'All' ? `No ${statusFilter.toLowerCase()} invoices. Try a different filter.` : 'No invoices have been generated yet.'}
        emptyIcon={FileText}
        onRowClick={onViewInvoice}
      />
    </div>
  )
}

// ─── GENERATE INVOICE SECTION ────────────────────────────────────────────────

function GenerateInvoiceSection({ finance, onCreated, initialCourseId = '' }) {
  const [form, setForm] = useState({
    studentId: '',
    courseId: initialCourseId ? String(initialCourseId) : '',
    invoiceDate: dateInputValue(),
    dueDate: dateInputValue(30),
    amount: '',
    discount: '',
    taxRate: '18',
  })

  useEffect(() => {
    if (!initialCourseId) return
    setForm((current) => ({ ...current, courseId: String(initialCourseId) }))
  }, [initialCourseId])
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [previewOpen, setPreviewOpen] = useState(false)

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const eligibleStudents = useMemo(
    () => initialCourseId
      ? finance.students.filter((student) => String(student.courseId ?? student.course?.id) === String(initialCourseId))
      : finance.students,
    [finance.students, initialCourseId],
  )
  const selectedStudent = eligibleStudents.find((s) => String(s.studentId ?? s.id) === String(form.studentId))
  const selectedCourse = finance.courses.find((course) => String(course.courseId ?? course.id) === String(form.courseId))

  // Auto-fill amount from course fee
  const handleStudentChange = (studentId) => {
    const student = eligibleStudents.find((s) => String(s.studentId ?? s.id) === String(studentId))
    const course = finance.courses.find((item) => String(item.courseId ?? item.id) === String(student?.courseId))
    setForm((prev) => ({
      ...prev,
      studentId,
      courseId: student?.courseId || course?.courseId || course?.id || '',
      amount: String(student?.courseFee ?? student?.fee ?? course?.price ?? course?.courseFee ?? ''),
    }))
  }

  const calculatedAmount = useMemo(() => {
    const amount = Number(form.amount) || 0
    const discount = Number(form.discount) || 0
    const taxRate = Number(form.taxRate) || 0
    const taxable = amount - discount
    const tax = Math.round(taxable * taxRate / 100)
    return { taxable, tax, total: taxable + tax }
  }, [form.amount, form.discount, form.taxRate])

  const validate = () => {
    const errs = {}
    if (!form.studentId) errs.studentId = 'Please select a customer'
    if (!form.courseId || !selectedCourse) errs.courseId = 'The selected student is not mapped to a valid course'
    if (!form.invoiceDate) errs.invoiceDate = 'Invoice date is required'
    if (!form.dueDate) errs.dueDate = 'Due date is required'
    else if (form.dueDate <= dateInputValue()) errs.dueDate = 'Due date must be a future date'
    if (!form.amount || Number(form.amount) <= 0) errs.amount = 'Enter a valid amount'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e?.preventDefault?.()
    if (!validate()) return
    setSubmitting(true)
    try {
      const invoicePayload = {
        studentId: Number(form.studentId),
        courseId: Number(form.courseId),
        subTotal: Number(form.amount),
        discountAmount: Number(form.discount) || 0,
        taxPercentage: Number(form.taxRate) || 0,
        invoiceDate: new Date(`${form.invoiceDate}T00:00:00`).toISOString(),
        dueDate: new Date(`${form.dueDate}T00:00:00`).toISOString(),
        notes: `Invoice for ${selectedStudent?.name || 'student'} - ${selectedCourse?.courseName ?? selectedCourse?.name ?? 'course'}`,
      }
      const newInvoice = await invoiceService.create(invoicePayload)
      await onCreated(newInvoice)
      toast.success('Invoice generated successfully.')
      setForm({
        studentId: '',
        courseId: initialCourseId ? String(initialCourseId) : '',
        invoiceDate: dateInputValue(),
        dueDate: dateInputValue(30),
        amount: '',
        discount: '',
        taxRate: '18',
      })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to generate invoice.'))
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = (field) =>
    `h-11 w-full rounded-xl border px-3.5 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-[#0f55f7] focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30 dark:text-white ${
      errors[field]
        ? 'border-red-400 bg-red-50 dark:border-red-500/50 dark:bg-red-500/5'
        : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50'
    }`

  const resetForm = () => {
    setErrors({})
    setForm({
      studentId: '',
      courseId: initialCourseId ? String(initialCourseId) : '',
      invoiceDate: dateInputValue(),
      dueDate: dateInputValue(30),
      amount: '',
      discount: '',
      taxRate: '18',
    })
  }
  const discountValue = Number(form.discount) || 0
  const subtotalValue = Number(form.amount) || 0
  const displayDate = (value) => (value ? value.split('-').reverse().join('-') : '—')
  const courseName = selectedCourse?.courseName ?? selectedCourse?.name ?? selectedCourse?.title
  const summaryRows = [
    { icon: User, label: 'Student', value: selectedStudent?.name || '—' },
    { icon: BookOpen, label: 'Course', value: courseName || '—' },
    { icon: CalendarDays, label: 'Invoice Date', value: displayDate(form.invoiceDate) },
    { icon: CalendarDays, label: 'Due Date', value: displayDate(form.dueDate) },
    { icon: IndianRupee, label: 'Amount', value: INR(subtotalValue) },
    { icon: Percent, label: 'Discount', value: INR(discountValue) },
    { icon: FileText, label: `Tax (${Number(form.taxRate) || 0}%)`, value: INR(calculatedAmount.tax) },
  ]
  const field = (name, label, required, icon, control, trailing) => {
    const Icon = icon
    return (
      <div className="kgi-field">
        <label htmlFor={`kgi-${name}`}>{label}{required && <span aria-hidden="true"> *</span>}</label>
        <div className={`kgi-control ${errors[name] ? 'has-error' : ''}`}>
          <Icon aria-hidden="true" className="kgi-control__icon" />
          {control}
          {trailing}
        </div>
        {errors[name] && <p className="kgi-error">{errors[name]}</p>}
      </div>
    )
  }

  return (
    <div className="kgi-layout">
      <motion.form
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="kgi-card"
        noValidate
      >
        <div className="kgi-card__head">
          <span className="kgi-card__icon" aria-hidden="true"><FileText /></span>
          <div>
            <h3>Generate Invoice</h3>
            <p>Create a new invoice for a student/course enrollment.</p>
          </div>
        </div>

        <div className="kgi-fields">
          <div className="kgi-grid kgi-grid--2">
            {field('studentId', 'Student', true, User, (
              <select id="kgi-studentId" value={form.studentId} onChange={(e) => handleStudentChange(e.target.value)}>
                <option value="">Select a student</option>
                {eligibleStudents.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} — {s.courseName ?? (typeof s.course === 'string' ? s.course : s.course?.courseName ?? s.course?.name) ?? 'Course not assigned'}</option>
                ))}
              </select>
            ))}
            {field('courseId', 'Course', true, BookOpen, (
              <select
                id="kgi-courseId"
                value={form.courseId}
                onChange={(event) => {
                  const courseId = event.target.value
                  const course = finance.courses.find((item) => String(item.courseId ?? item.id) === String(courseId))
                  setForm((current) => ({ ...current, courseId, amount: current.amount || String(course?.price ?? course?.courseFee ?? '') }))
                }}
              >
                <option value="">Select course</option>
                {finance.courses.map((course) => <option key={course.courseId ?? course.id} value={course.courseId ?? course.id}>{course.courseName ?? course.name ?? course.title}</option>)}
              </select>
            ))}
          </div>
          {initialCourseId && eligibleStudents.length === 0 && (
            <p className="kgi-note">No enrolled customers are available for this selected course.</p>
          )}
          <div className="kgi-grid kgi-grid--2">
            {field('invoiceDate', 'Invoice Date', true, CalendarDays, (
              <input id="kgi-invoiceDate" type="date" value={form.invoiceDate} onChange={(e) => setField('invoiceDate', e.target.value)} />
            ))}
            {field('dueDate', 'Due Date', true, CalendarDays, (
              <input id="kgi-dueDate" type="date" value={form.dueDate} min={dateInputValue(1)} onChange={(e) => setField('dueDate', e.target.value)} />
            ))}
          </div>
          <div className="kgi-grid kgi-grid--3">
            {field('amount', 'Amount (₹)', true, IndianRupee, (
              <input id="kgi-amount" type="number" min="0" value={form.amount} onChange={(e) => setField('amount', e.target.value)} placeholder="Enter amount" />
            ))}
            {field('discount', 'Discount (₹)', false, Percent, (
              <input id="kgi-discount" type="number" min="0" value={form.discount} onChange={(e) => setField('discount', e.target.value)} placeholder="0" />
            ))}
            {field('taxRate', 'Tax Rate (%)', false, Percent, (
              <input id="kgi-taxRate" type="number" min="0" value={form.taxRate} onChange={(e) => setField('taxRate', e.target.value)} />
            ))}
          </div>

          <div className="kgi-totals">
            {[
              ['blue', IndianRupee, 'Subtotal', INR(subtotalValue)],
              ['green', Percent, 'Discount', INR(discountValue)],
              ['purple', FileText, `Tax (${Number(form.taxRate) || 0}%)`, INR(calculatedAmount.tax)],
              ['orange', IndianRupee, 'Total Amount', INR(calculatedAmount.total)],
            ].map(([tone, Icon, label, value]) => (
              <div key={label} className={`kgi-total kgi-total--${tone}`}>
                <Icon aria-hidden="true" />
                <span><small>{label}</small><b>{value}</b></span>
              </div>
            ))}
          </div>
        </div>

        <div className="kgi-actions">
          <button type="button" className="kgi-btn kgi-btn--ghost" onClick={resetForm} disabled={submitting}>
            <RotateCcw aria-hidden="true" />
            Reset
          </button>
          <span className="kgi-actions__spacer" />
          <button type="button" className="kgi-btn kgi-btn--ghost" onClick={() => setPreviewOpen(true)}>
            <Eye aria-hidden="true" />
            Preview Invoice
          </button>
          <button type="submit" disabled={submitting} className="kgi-btn kgi-btn--primary">
            {submitting ? <Loader2 className="animate-spin" aria-hidden="true" /> : <FileText aria-hidden="true" />}
            {submitting ? 'Generating...' : 'Generate Invoice'}
          </button>
        </div>
      </motion.form>

      <aside className="kgi-summary" aria-label="Invoice summary">
        <div className="kgi-card__head">
          <span className="kgi-card__icon kgi-card__icon--blue" aria-hidden="true"><BarChart3 /></span>
          <div>
            <h3>Invoice Summary</h3>
            <p>Summary of the invoice details.</p>
          </div>
        </div>
        <dl className="kgi-summary__rows">
          {summaryRows.map(({ icon: Icon, label, value }) => (
            <div key={label}>
              <dt><Icon aria-hidden="true" />{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <div className="kgi-summary__total">
          <span><IndianRupee aria-hidden="true" /></span>
          <b>Total Amount</b>
          <strong>{INR(calculatedAmount.total)}</strong>
        </div>
      </aside>

      <KiniDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        icon={Eye}
        eyebrow="Invoice preview"
        title={selectedStudent?.name ? `Invoice for ${selectedStudent.name}` : 'Invoice preview'}
        subtitle="Check the details before generating. Nothing is saved until you click Generate Invoice."
        width={560}
        footer={(
          <>
            <button type="button" className="kgi-btn kgi-btn--ghost" onClick={() => setPreviewOpen(false)}>Close</button>
            <button type="button" className="kgi-btn kgi-btn--primary" onClick={(event) => { setPreviewOpen(false); handleSubmit(event) }} disabled={submitting}>
              <FileText aria-hidden="true" />
              Generate Invoice
            </button>
          </>
        )}
      >
        <dl className="kgi-summary__rows kgi-summary__rows--dialog">
          {summaryRows.map(({ icon: Icon, label, value }) => (
            <div key={label}>
              <dt><Icon aria-hidden="true" />{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <div className="kgi-summary__total">
          <span><IndianRupee aria-hidden="true" /></span>
          <b>Total Amount</b>
          <strong>{INR(calculatedAmount.total)}</strong>
        </div>
      </KiniDialog>
    </div>
  )
}

// ─── INVOICE DETAILS MODAL ───────────────────────────────────────────────────

export default function InvoiceManagement() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = useMemo(
    () => TAB_KEYS[searchParams.get('tab')] || 'Overview',
    [searchParams],
  )
  const [finance, setFinance] = useState({ students: [], courses: [], batches: [], payments: [] })
  const [backendInvoices, setBackendInvoices] = useState([])
  const [emailStates, setEmailStates] = useState(readInvoiceEmailStatuses)
  const [viewingInvoice, setViewingInvoice] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const invoices = backendInvoices

  const loadInvoices = useCallback(async () => {
    try {
      const records = await invoiceService.list()
      setBackendInvoices(records.map(normalizeInvoice))
    } catch (error) {
      setBackendInvoices([])
      toast.error(getApiErrorMessage(error, 'Unable to load invoices.'))
    }
  }, [])

  useEffect(() => { loadInvoices() }, [loadInvoices])

  useEffect(() => {
    const sentOnly = Object.fromEntries(Object.entries(emailStates).filter(([, status]) => status === 'sent'))
    localStorage.setItem(INVOICE_EMAIL_STATUS_KEY, JSON.stringify(sentOnly))
  }, [emailStates])

  useEffect(() => {
    let active = true
    Promise.all([studentsApi.list(), courseService.getCourses({ page: 1, pageSize: 1000 })])
      .then(([studentsResponse, coursesResponse]) => {
        if (!active) return
        const courses = coursesResponse.data ?? []
        const students = (studentsResponse.data ?? []).map((student) => {
          const courseName = student.courseName ?? (typeof student.course === 'string' ? student.course : student.course?.courseName ?? student.course?.name)
          const matchedCourse = courses.find((course) => String(course.courseName ?? course.name ?? '').trim().toLowerCase() === String(courseName ?? '').trim().toLowerCase())
          return {
            ...student,
            courseName: courseName ?? matchedCourse?.courseName ?? matchedCourse?.name,
            courseId: student.courseId ?? student.course?.courseId ?? student.course?.id ?? matchedCourse?.courseId ?? matchedCourse?.id,
          }
        })
        setFinance({ students, courses, batches: [], payments: [] })
      })
      .catch((error) => active && toast.error(getApiErrorMessage(error, 'Unable to load students and courses.')))
    return () => { active = false }
  }, [])

  const selectTab = useCallback(
    (nextTab) => {
      const next = new URLSearchParams(searchParams)
      next.set('tab', getTabKey(nextTab))
      setSearchParams(next)
    },
    [searchParams, setSearchParams],
  )

  const handleViewInvoice = useCallback(async (invoice) => {
    setDetailsOpen(true)
    setViewingInvoice(invoice)
    try {
      const details = await invoiceService.get(invoice.invoiceId)
      setViewingInvoice((current) => String(current?.invoiceId) === String(invoice.invoiceId) ? normalizeInvoice({ ...invoice, ...details }) : current)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to load invoice details.'))
    }
  }, [])

  const handleDownloadInvoice = useCallback(async (invoice) => {
    try {
      const blob = await invoiceService.pdf(invoice.invoiceId)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${invoice.id}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to download invoice PDF.'))
    }
  }, [])

  const handleDeleteInvoice = useCallback(async (invoice) => {
    try {
      await invoiceService.cancel(invoice.invoiceId)
      await loadInvoices()
      toast.success('Invoice deleted successfully.')
      setDeleteTarget(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to delete invoice.'))
    }
  }, [loadInvoices])

  const [deleteTarget, setDeleteTarget] = useState(null)

  const handleInvoiceCreated = useCallback(async () => {
    await loadInvoices()
    const next = new URLSearchParams(searchParams)
    next.set('tab', 'invoice-list')
    setSearchParams(next)
  }, [loadInvoices, searchParams, setSearchParams])

  const handleSendEmail = useCallback(async (invoice) => {
    const invoiceId = Number(invoice.invoiceId)
    if (!Number.isInteger(invoiceId) || invoiceId <= 0) {
      toast.error('This invoice does not have a valid backend ID.')
      return
    }
    setEmailStates((current) => ({ ...current, [invoiceId]: 'sending' }))
    try {
      await invoiceService.sendEmail(invoiceId, {
        subject: `Invoice ${invoice.id}`,
        message: `Hello ${invoice.customerName}, please find your invoice attached.`,
      })
      setEmailStates((current) => ({ ...current, [invoiceId]: 'sent' }))
      setBackendInvoices((current) => current.map((item) => item.invoiceId === invoice.invoiceId ? { ...item, emailSent: true } : item))
      toast.success(invoice.customerEmail ? `Invoice sent to ${invoice.customerEmail}` : `Invoice sent to ${invoice.customerName}`)
    } catch (error) {
      setEmailStates((current) => ({ ...current, [invoiceId]: 'error' }))
      toast.error(getApiErrorMessage(error, 'Unable to send invoice email.'))
    }
  }, [])

  return (
    <OrgPage className="invoice-management-page">
      {tab === 'Generate Invoice' ? (
        <MentorBanner
          variant="invoiceGenerate"
          image={ORG_BANNERS.invoice}
          leading={<span className="mentor-banner__tile" aria-hidden="true"><FileText /></span>}
          eyebrow="Invoice Management"
          eyebrowStyle="text"
          title="Generate"
          highlight="Invoice"
          subtitle="Create, manage and track invoices for student enrollments and course fees."
          featureShape="chip"
          features={[
            { icon: Zap, title: 'Quick & Easy', tone: 'orange' },
            { icon: ShieldCheck, title: 'Accurate Billing', tone: 'blue' },
            { icon: Wallet, title: 'Track Payments', tone: 'green' },
            { icon: Download, title: 'Download PDF', tone: 'purple' },
          ]}
          script={['Simplify', 'Billing,', 'Empower', 'Education']}
        />
      ) : (
        <MentorBanner
          variant="invoice"
          image={ORG_BANNERS.invoice}
          leading={<span className="mentor-banner__tile" aria-hidden="true"><FileText /></span>}
          eyebrow="Invoice Management"
          eyebrowStyle="text"
          title={<>Manage <span className="mentor-banner__highlight">Invoices</span> with Ease</>}
          subtitle="Generate, track and manage invoices for student enrollments and course fees."
          featureShape="chip"
          features={[
            { icon: Zap, title: 'Quick Generation', tone: 'orange' },
            { icon: ShieldCheck, title: 'Accurate Billing', tone: 'blue' },
            { icon: Wallet, title: 'Track Payments', tone: 'green' },
            { icon: Share2, title: 'Download & Share', tone: 'purple' },
          ]}
          script={['Simplify', 'Billing,', 'Empower', 'Education']}
          actions={(
            <button type="button" className="mentor-hero-btn mentor-hero-btn--primary" onClick={() => selectTab('Generate Invoice')}>
              <Plus aria-hidden="true" />
              Generate Invoice
            </button>
          )}
        />
      )}

      <OrgTabs
        tabs={TABS.map((item) => [item, item])}
        active={tab}
        onChange={selectTab}
        label="Invoice sections"
      />

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {tab === 'Overview' && (
          <motion.section
            key="overview"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <OverviewSection invoices={invoices} onGenerate={() => selectTab('Generate Invoice')} onViewAll={() => selectTab('Invoice List')} />
          </motion.section>
        )}
        {tab === 'Invoice List' && (
          <motion.section
            key="invoice-list"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <div className="kx-panel"><InvoiceListSection invoices={invoices} onViewInvoice={handleViewInvoice} onDownloadInvoice={handleDownloadInvoice} onSendEmail={handleSendEmail} onDeleteInvoice={handleDeleteInvoice} emailStates={emailStates} /></div>
          </motion.section>
        )}
        {tab === 'Generate Invoice' && (
          <motion.section
            key="generate"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <GenerateInvoiceSection finance={finance} onCreated={handleInvoiceCreated} initialCourseId={searchParams.get('courseId') || ''} />
          </motion.section>
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Invoice"
        description={`Are you sure you want to delete invoice ${deleteTarget?.id || ''}? This action cannot be undone.`}
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleDeleteInvoice(deleteTarget)}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:brightness-110"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        }
      />

      {/* Invoice Details Modal */}
      <InvoiceDetailsModal
        invoice={viewingInvoice}
        open={detailsOpen}
        onClose={() => { setDetailsOpen(false); setViewingInvoice(null) }}
        onDownload={handleDownloadInvoice}
      />
    </OrgPage>
  )
}
