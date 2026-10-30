import { useMemo, useState } from 'react'
import useHrPermissions from '@features/hr/hooks/useHrPermissions'
import useAddIntent from '@features/hr/hooks/useAddIntent'
import usePageSearch from '@features/hr/hooks/usePageSearch'
import {
  Banknote, Download, Printer, Mail, Eye, FileText, Users2, CalendarDays, Send, CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'
import StatsCard from '@shared/components/StatsCard'
import Button from '@shared/components/Button'
import HRPage from '@features/hr/components/HRPage'
import HRDrawer from '@features/hr/components/HRDrawer'
import HRQuickActions from '@features/hr/components/HRQuickActions'
import HREntityForm from '@features/hr/components/HREntityForm'
import { exportCSV, exportPDF, printPDF } from '@features/hr/components/hrExport'
import HRDataTable from '@features/hr/components/HRDataTable'
import { HRSection, HRStatusBadge } from '@features/hr/components/hrPrimitives'
import { HR_PAYSLIPS, HR_PAYSLIP_BREAKDOWN, HR_PAYSLIP_PREVIEW } from '@features/hr/data/hrPay'

const PAYSLIP_BADGE = { generated: 'success', sent: 'active', draft: 'pending' }

const inr = (amount) => `₹${amount.toLocaleString('en-IN')}`

export default function PayslipManagement() {
  // KINI HRMS RBAC — generate, preview, download, print and email follow the payslips module permissions.
  const { can } = useHrPermissions()
  const [selected, setSelected] = useState(null)
  const [payslips, setPayslips] = useState(HR_PAYSLIPS)
  const [generateOpen, setGenerateOpen] = useState(false)
  useAddIntent(() => setGenerateOpen(true))
  const pageSearch = usePageSearch()
  const filteredPayslips = useMemo(() => payslips.filter(pageSearch.matches), [payslips, pageSearch.matches])

  const downloadPayslip = (row) => {
    exportPDF({
      filename: `${row.employee.replace(/\s+/g, '-').toLowerCase()}-payslip-${row.period.replace(/\s+/g, '-')}`,
      title: `Payslip — ${row.employee}`,
      headers: ['Employee', 'Period', 'Gross', 'Net Pay', 'Status'],
      rows: [[row.employee, row.period, inr(row.gross), inr(row.net), row.status]],
      subtitle: `${row.period} · Kini HRMS`,
    })
    toast.success(`${row.employee} — ${row.period} payslip downloaded`)
  }
  const printPayslip = (row) => {
    printPDF({
      title: `Payslip — ${row.employee}`,
      headers: ['Employee', 'Period', 'Gross', 'Net Pay'],
      rows: [[row.employee, row.period, inr(row.gross), inr(row.net)]],
      subtitle: `${row.period} · Kini HRMS`,
    })
  }
  const emailPayslip = (row) => {
    const subject = encodeURIComponent(`Payslip ${row.period} — ${row.employee}`)
    const body = encodeURIComponent(`Hi ${row.employee},\n\nYour payslip for ${row.period} is ready.\nNet pay: ${inr(row.net)}\n\n— HR Team`)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
    toast.success(`Email draft opened for ${row.employee}`)
  }

  const columns = [
    { accessor: 'employee', header: 'Employee', sortable: true, minWidth: 180, render: (row) => (
      <span className="text-sm font-semibold text-slate-900 dark:text-white">{row.employee}</span>
    )},
    { accessor: 'period', header: 'Period', sortable: true, render: (row) => <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{row.period}</span> },
    { accessor: 'gross', header: 'Gross', sortable: true, render: (row) => <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{inr(row.gross)}</span> },
    { accessor: 'net', header: 'Net Pay', sortable: true, render: (row) => <span className="text-xs font-bold text-emerald-600">{inr(row.net)}</span> },
    { accessor: 'status', header: 'Status', sortable: true, render: (row) => <HRStatusBadge status={PAYSLIP_BADGE[row.status]} label={row.status} /> },
    { accessor: 'id', header: 'Actions', sortable: false, sticky: 'right', width: 140, render: (row) => (
      <div className="flex items-center gap-1">
        {can('payslips', 'view') && (
          <button className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#0f55f7] dark:hover:bg-slate-800" onClick={() => setSelected(row)} aria-label="Preview payslip">
            <Eye className="h-4 w-4" />
          </button>
        )}
        {can('payslips', 'export') && (
          <button className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#0f55f7] dark:hover:bg-slate-800" onClick={() => downloadPayslip(row)} aria-label="Download payslip">
            <Download className="h-4 w-4" />
          </button>
        )}
        {can('payslips', 'export') && (
          <button className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#0f55f7] dark:hover:bg-slate-800" onClick={() => printPayslip(row)} aria-label="Print payslip">
            <Printer className="h-4 w-4" />
          </button>
        )}
        {can('payslips', 'export') && (
          <button className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#0f55f7] dark:hover:bg-slate-800" onClick={() => emailPayslip(row)} aria-label="Email payslip">
            <Mail className="h-4 w-4" />
          </button>
        )}
      </div>
    )},
  ]

  const earnings = HR_PAYSLIP_BREAKDOWN.filter((item) => item.type === 'earning')
  const deductions = HR_PAYSLIP_BREAKDOWN.filter((item) => item.type === 'deduction')
  const totalEarnings = earnings.reduce((s, i) => s + i.amount, 0)
  const totalDeductions = deductions.reduce((s, i) => s + Math.abs(i.amount), 0)

  return (
    <HRPage
      moduleId="payslips"
      title="Payslips"
      subtitle="Generate, preview, download, print and email employee payslips."
      icon={Banknote}
      lastUpdated="Aug 4, 2026"
      search={{ value: pageSearch.search, onChange: pageSearch.setSearch, placeholder: 'Search payslips…' }}
      actions={
        <HRQuickActions
          can={can}
          actions={[
            { key: 'export', label: 'Export Register', icon: Download, permission: ['payslips', 'export'], onClick: () => {
              exportCSV({
                filename: 'payslip-register',
                headers: ['Employee', 'Period', 'Gross', 'Net Pay', 'Status'],
                rows: filteredPayslips.map((row) => [row.employee, row.period, inr(row.gross), inr(row.net), row.status]),
              })
              toast.success('Payslip register exported')
            } },
            { key: 'generate', label: 'Generate Payslips', icon: Send, variant: 'primary', permission: ['payslips', 'generate'], onClick: () => setGenerateOpen(true) },
          ]}
        />
      }
    >
      <div className="mb-2.5 grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <StatsCard compact className="rounded-xl" icon={FileText} value={HR_PAYSLIPS.length} label="Payslips (Jul)" accentColor="#0f55f7" />
        <StatsCard compact className="rounded-xl" icon={Users2} value={HR_PAYSLIPS.filter((p) => p.status === 'sent').length} label="Distributed" accentColor="#06b6a8" />
        <StatsCard compact className="rounded-xl" icon={CheckCircle2} value={HR_PAYSLIPS.filter((p) => p.status === 'generated').length} label="Generated" accentColor="#8b5cf6" />
        <StatsCard compact className="rounded-xl" icon={CalendarDays} value="Jul 2026" label="Current Period" accentColor="#F59E0B" />
      </div>

      <HRSection title="Payslip Register" subtitle="All generated and distributed payslips" icon={Banknote} padding="p-2.5 sm:p-3">
        <HRDataTable
          columns={columns}
          data={filteredPayslips}
          searchable={false}
          pageSize={8}
          exportFileName="payslips"
          exportTitle="Payslip Register"
          exportable={false}
        />
      </HRSection>

      {/* Preview drawer */}
      <HRDrawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="Payslip Preview"
        subtitle={selected ? `${selected.employee} · ${selected.period}` : undefined}
        icon={Banknote}
        accent="#10b981"
        width="max-w-[520px]"
        footer={
          <div className="flex justify-end gap-2">
            {can('payslips', 'export') && (
              <Button variant="secondary" size="sm" icon={Printer} onClick={() => { if (selected) printPayslip(selected); setSelected(null) }}>Print</Button>
            )}
            {can('payslips', 'export') && (
              <Button variant="secondary" size="sm" icon={Download} onClick={() => { if (selected) downloadPayslip(selected); setSelected(null) }}>Download PDF</Button>
            )}
            {can('payslips', 'export') && (
              <Button variant="primary" size="sm" icon={Mail} onClick={() => { if (selected) emailPayslip(selected); setSelected(null) }}>Email</Button>
            )}
          </div>
        }
      >
        <div className="space-y-4">
          {/* Payslip hero — compact document header */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f55f7] to-[#06b6a8] p-4 text-white shadow-lg">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/70">
                  {HR_PAYSLIP_PREVIEW.company} · {HR_PAYSLIP_PREVIEW.companyAddr}
                </p>
                <p className="mt-1.5 truncate text-base font-extrabold">{selected?.employee || HR_PAYSLIP_PREVIEW.employee}</p>
                <p className="mt-0.5 text-[11px] text-white/80">
                  {selected?.period || HR_PAYSLIP_PREVIEW.period} · {HR_PAYSLIP_PREVIEW.empId} · {HR_PAYSLIP_PREVIEW.designation}
                </p>
              </div>
              <span className="shrink-0 rounded-xl bg-white/15 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-white/85 backdrop-blur">
                Sample · mock
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5 text-[9px] font-semibold text-white/80">
              <span className="rounded-full bg-white/15 px-2 py-0.5">PAN {HR_PAYSLIP_PREVIEW.pan}</span>
              <span className="rounded-full bg-white/15 px-2 py-0.5">TAN {HR_PAYSLIP_PREVIEW.tan}</span>
              <span className="rounded-full bg-white/15 px-2 py-0.5">CIN {HR_PAYSLIP_PREVIEW.cin}</span>
              <span className="rounded-full bg-white/15 px-2 py-0.5">{HR_PAYSLIP_PREVIEW.daysPaid} days · paid {HR_PAYSLIP_PREVIEW.payDate}</span>
            </div>
          </div>

          {/* Bank + UAN */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-100 px-3 py-2.5 dark:border-slate-800">
              <p className="text-[10px] font-bold uppercase text-slate-400">Bank</p>
              <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">{HR_PAYSLIP_PREVIEW.bank}</p>
            </div>
            <div className="rounded-xl border border-slate-100 px-3 py-2.5 dark:border-slate-800">
              <p className="text-[10px] font-bold uppercase text-slate-400">UAN / DOJ</p>
              <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">{HR_PAYSLIP_PREVIEW.uan}</p>
              <p className="text-[11px] text-slate-400">Joined {HR_PAYSLIP_PREVIEW.doj}</p>
            </div>
          </div>

          {/* Earnings */}
          <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800">
            <p className="border-b border-slate-100 bg-slate-50/70 px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
              Earnings
            </p>
            {earnings.map((item) => (
              <div key={item.label} className="flex items-center justify-between border-b border-slate-50 px-4 py-2.5 last:border-0 dark:border-slate-800/60">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{item.label}</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{inr(item.amount)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between bg-emerald-50/60 px-4 py-2.5 dark:bg-emerald-500/10">
              <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">Gross Earnings</span>
              <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">{inr(totalEarnings)}</span>
            </div>
          </div>

          {/* Deductions */}
          <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800">
            <p className="border-b border-slate-100 bg-slate-50/70 px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
              Deductions
            </p>
            {deductions.map((item) => (
              <div key={item.label} className="flex items-center justify-between border-b border-slate-50 px-4 py-2.5 last:border-0 dark:border-slate-800/60">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{item.label}</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">- {inr(Math.abs(item.amount))}</span>
              </div>
            ))}
            <div className="flex items-center justify-between bg-red-50/60 px-4 py-2.5 dark:bg-red-500/10">
              <span className="text-xs font-extrabold text-red-600">Total Deductions</span>
              <span className="text-sm font-extrabold text-red-600">{inr(totalDeductions)}</span>
            </div>
          </div>

          {/* Net pay */}
          <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] px-5 py-4 text-white shadow-lg">
            <span className="text-sm font-bold">Net Pay</span>
            <span className="text-xl font-extrabold">{inr(selected?.net || totalEarnings - totalDeductions)}</span>
          </div>
        </div>
      </HRDrawer>

      {/* Generate payslips form */}
      <HREntityForm
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        title="Generate Payslips"
        subtitle="Roll all draft payslips into generated status"
        icon={Banknote}
        accent="#10b981"
        saveLabel="Generate"
        fields={[
          { key: 'period', label: 'Pay Period', type: 'select', required: true, options: ['August 2026', 'July 2026', 'June 2026'].map((p) => ({ value: p, label: p })) },
          { key: 'note', label: 'Note to Employees', type: 'textarea', placeholder: 'Optional message shown on the payslip' },
        ]}
        onSave={(values) => {
          const drafts = payslips.filter((p) => p.status === 'draft').length
          setPayslips((prev) => prev.map((p) => (p.status === 'draft' ? { ...p, status: 'generated' } : p)))
          toast.success(`Payslips generated for ${values.period}${drafts ? ` · ${drafts} drafts finalized` : ''}`)
        }}
      />
    </HRPage>
  )
}
