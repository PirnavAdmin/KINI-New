import { useMemo, useState } from 'react'
import useAddIntent from '@features/hr/hooks/useAddIntent'
import {
  CreditCard, Wallet, TrendingDown, Users2, CalendarClock, Play, Download, Gift, MinusCircle, Pencil,
} from 'lucide-react'
import { toast } from 'sonner'
import useHrPermissions from '@features/hr/hooks/useHrPermissions'
import usePageSearch from '@features/hr/hooks/usePageSearch'
import StatsCard from '@shared/components/StatsCard'
import Button from '@shared/components/Button'
import HRPage from '@features/hr/components/HRPage'
import HRQuickActions from '@features/hr/components/HRQuickActions'
import HREntityForm from '@features/hr/components/HREntityForm'
import HRDrawer from '@features/hr/components/HRDrawer'
import { exportCSV } from '@features/hr/components/hrExport'
import HRDataTable from '@features/hr/components/HRDataTable'
import DataTable from '@shared/components/DataTable'
import { HRSection, HRStatusBadge } from '@features/hr/components/hrPrimitives'
import {
  HR_PAYROLL_STATS, HR_PAYROLL_HISTORY, HR_SALARY_STRUCTURES, HR_PAYROLL_COMPONENTS,
  HR_PAYROLL_BONUSES, HR_PAYROLL_DEDUCTIONS, HR_PAYROLL_CALENDAR,
} from '@features/hr/data/hrPay'

const HISTORY_BADGE = { processed: 'success', scheduled: 'pending' }
const MONEY_BADGE = { approved: 'success', paid: 'success', pending: 'pending' }
const DEDUCTION_BADGE = { applied: 'success', pending: 'pending' }

export default function PayrollManagement() {
  // KINI HRMS RBAC — runs, edits, downloads and exports follow the HR level.
  const { can } = useHrPermissions()
  const [structures, setStructures] = useState(HR_SALARY_STRUCTURES)
  const [history, setHistory] = useState(HR_PAYROLL_HISTORY)
  const [runOpen, setRunOpen] = useState(false)
  const [editStructure, setEditStructure] = useState(null)
  const [viewRun, setViewRun] = useState(null)
  const [viewStructure, setViewStructure] = useState(null)
  useAddIntent(() => setRunOpen(true))
  const pageSearch = usePageSearch()
  const filteredStructures = useMemo(() => structures.filter(pageSearch.matches), [structures, pageSearch.matches])

  const historyColumns = [
    { accessor: 'period', header: 'Period', sortable: true, minWidth: 140, render: (row) => <span className="text-sm font-semibold text-slate-900 dark:text-white">{row.period}</span> },
    { accessor: 'employees', header: 'Employees', sortable: true, render: (row) => <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{row.employees}</span> },
    { accessor: 'gross', header: 'Gross', sortable: true, render: (row) => <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{row.gross}</span> },
    { accessor: 'net', header: 'Net', sortable: true, render: (row) => <span className="text-xs font-bold text-emerald-600">{row.net}</span> },
    { accessor: 'taxes', header: 'Taxes', sortable: true, render: (row) => <span className="text-xs text-slate-500">{row.taxes}</span> },
    { accessor: 'status', header: 'Status', sortable: true, render: (row) => <HRStatusBadge status={HISTORY_BADGE[row.status]} label={row.status} /> },
    { accessor: 'processedOn', header: 'Processed', sortable: true, render: (row) => <span className="text-xs text-slate-500">{row.processedOn}</span> },
    { accessor: 'id', header: 'Actions', sortable: false, sticky: 'right', width: 90, render: (row) => (
      <Button variant="secondary" size="xs" icon={Download} onClick={() => setViewRun(row)}>View</Button>
    )},
  ]

  const structureColumns = [
    { accessor: 'employee', header: 'Employee', sortable: true, minWidth: 180, render: (row) => <span className="text-sm font-semibold text-slate-900 dark:text-white">{row.employee}</span> },
    { accessor: 'band', header: 'Band', sortable: true, render: (row) => <span className="text-xs text-slate-500">{row.band}</span> },
    { accessor: 'ctc', header: 'CTC (₹L)', sortable: true, render: (row) => <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{row.ctc}</span> },
    { accessor: 'basic', header: 'Basic', sortable: true, render: (row) => <span className="text-xs text-slate-600 dark:text-slate-300">₹{row.basic}L</span> },
    { accessor: 'hra', header: 'HRA', sortable: true, render: (row) => <span className="text-xs text-slate-600 dark:text-slate-300">₹{row.hra}L</span> },
    { accessor: 'netMonthly', header: 'Net/Month', sortable: true, render: (row) => <span className="text-xs font-bold text-emerald-600">₹{row.netMonthly}L</span> },
    { accessor: 'id', header: 'Actions', sortable: false, sticky: 'right', width: 90, render: (row) => (
      can('payroll', 'edit') ? (
        <Button variant="secondary" size="xs" onClick={() => { setEditStructure(row); setRunOpen(true) }}>Edit</Button>
      ) : can('payroll', 'view') ? (
        <Button variant="secondary" size="xs" onClick={() => setViewStructure(row)}>View</Button>
      ) : null
    )},
  ]

  const totalComponents = HR_PAYROLL_COMPONENTS.reduce((s, c) => s + c.amount, 0)
  const segments = HR_PAYROLL_COMPONENTS.reduce((acc, component) => {
    const start = acc.length ? acc[acc.length - 1].end : 0
    const end = start + (component.amount / totalComponents) * 360
    return [...acc, { ...component, start, end }]
  }, [])

  return (
    <HRPage
      moduleId="payroll"
      title="Payroll"
      subtitle="Salary structures, payroll runs, bonuses, deductions and taxes."
      icon={CreditCard}
      lastUpdated="Aug 4, 2026"
      search={{ value: pageSearch.search, onChange: pageSearch.setSearch, placeholder: 'Search payroll…' }}
      actions={
        <HRQuickActions
          can={can}
          actions={[
            { key: 'run', label: 'Run Payroll', icon: Play, variant: 'primary', permission: ['payroll', 'manage'], onClick: () => { setEditStructure(null); setRunOpen(true) } },
            { key: 'download', label: 'Download Report', icon: Download, permission: ['payroll', 'export'], onClick: () => {
              exportCSV({
                filename: 'payroll-history',
                headers: ['Period', 'Employees', 'Gross', 'Net', 'Taxes', 'Status', 'Processed On'],
                rows: history.map((h) => [h.period, h.employees, h.gross, h.net, h.taxes, h.status, h.processedOn]),
              })
              toast.success('Payroll report downloaded')
            } },
          ]}
        />
      }
    >
      <div className="mb-2 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
        <StatsCard compact icon={Wallet} value={HR_PAYROLL_STATS.grossPay} label="Gross Pay (Jul)" accentColor="#0f55f7" />
        <StatsCard compact icon={CreditCard} value={HR_PAYROLL_STATS.netPay} label="Net Pay" accentColor="#06b6a8" />
        <StatsCard compact icon={TrendingDown} value={HR_PAYROLL_STATS.taxes} label="Taxes" accentColor="#F59E0B" />
        <StatsCard compact icon={Users2} value={HR_PAYROLL_STATS.processedEmployees} label="Employees Processed" accentColor="#8b5cf6" />
        <StatsCard compact icon={Wallet} value={HR_PAYROLL_STATS.ytdGross} label="YTD Gross" accentColor="#EC4899" />
        <StatsCard compact icon={CalendarClock} value={HR_PAYROLL_STATS.nextRun} label="Next Run" accentColor="#10b981" />
      </div>

      {/* Payroll calendar banner */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#0f55f7]/20 bg-white px-3.5 py-2.5 shadow-sm dark:border-[#0f55f7]/25 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0f55f7] to-[#06b6a8] text-white shadow-md">
            <CalendarClock className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">August payroll scheduled for {HR_PAYROLL_STATS.nextRun}</p>
            <p className="text-xs text-slate-400">Attendance lock on Aug 28 · Salary credit Aug 10 · TDS deposit Aug 15</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {HR_PAYROLL_CALENDAR.map((event) => (
            <span key={event.label} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {event.date} {event.label}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
        {/* Salary structure */}
        <HRSection title="Salary Structures" subtitle="Sample of employee structures" icon={Wallet} className="lg:col-span-2" padding="p-3">
          <HRDataTable
            columns={structureColumns}
            data={filteredStructures}
            searchable={false}
            pageSize={5}
            exportFileName="salary-structures"
            exportTitle="Salary Structures"
            exportable={can('payroll', 'export')}
          />
        </HRSection>

        {/* Component donut */}
        <HRSection title="Pay Components" subtitle="Share of gross pay" icon={CreditCard} padding="p-3">
          <div className="flex items-center justify-center py-2">
            <div
              className="relative h-32 w-32 rounded-full"
              style={{
                background: `conic-gradient(${segments.map((s) => `${s.color} ${s.start}deg ${s.end}deg`).join(', ')})`,
              }}
            >
              <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-white shadow-inner dark:bg-slate-900">
                <p className="text-xl font-extrabold text-slate-900 dark:text-white">{totalComponents}%</p>
                <p className="text-[10px] font-semibold uppercase text-slate-400">of Gross</p>
              </div>
            </div>
          </div>
          <ul className="mt-2 space-y-1.5">
            {HR_PAYROLL_COMPONENTS.map((component) => (
              <li key={component.label} className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-2 font-medium text-slate-600 dark:text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: component.color }} />
                  {component.label}
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{component.amount}%</span>
              </li>
            ))}
          </ul>
        </HRSection>
      </div>

      {/* Bonuses + deductions */}
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        <HRSection title="Bonuses & Incentives" subtitle="Approvals and payouts" icon={Gift} padding="p-4">
          <DataTable
            columns={[
              { accessor: 'employee', header: 'Employee', sortable: true, render: (row) => <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{row.employee}</span> },
              { accessor: 'type', header: 'Type', sortable: true, render: (row) => <span className="text-xs text-slate-500">{row.type}</span> },
              { accessor: 'amount', header: 'Amount', sortable: true, render: (row) => <span className="text-xs font-bold text-emerald-600">₹{row.amount.toLocaleString('en-IN')}</span> },
              { accessor: 'month', header: 'Month', sortable: true, render: (row) => <span className="text-xs text-slate-500">{row.month}</span> },
              { accessor: 'status', header: 'Status', sortable: true, render: (row) => <HRStatusBadge status={MONEY_BADGE[row.status]} label={row.status} /> },
            ]}
            data={HR_PAYROLL_BONUSES}
            searchable={false}
            pageSize={4}
          />
        </HRSection>

        <HRSection title="Deductions" subtitle="Taxes, PF, advances and insurance" icon={MinusCircle} padding="p-4">
          <DataTable
            columns={[
              { accessor: 'employee', header: 'Employee', sortable: true, render: (row) => <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{row.employee}</span> },
              { accessor: 'type', header: 'Type', sortable: true, render: (row) => <span className="text-xs text-slate-500">{row.type}</span> },
              { accessor: 'amount', header: 'Amount', sortable: true, render: (row) => <span className="text-xs font-bold text-red-500">₹{row.amount.toLocaleString('en-IN')}</span> },
              { accessor: 'month', header: 'Month', sortable: true, render: (row) => <span className="text-xs text-slate-500">{row.month}</span> },
              { accessor: 'status', header: 'Status', sortable: true, render: (row) => <HRStatusBadge status={DEDUCTION_BADGE[row.status]} label={row.status} /> },
            ]}
            data={HR_PAYROLL_DEDUCTIONS}
            searchable={false}
            pageSize={4}
          />
        </HRSection>
      </div>

      {/* History */}
      <HRSection title="Payroll History" subtitle="Recent payroll runs" icon={CalendarClock} padding="p-4">
        <HRDataTable
          columns={historyColumns}
          data={history}
          searchPlaceholder="Search runs…"
          pageSize={5}
          exportFileName="payroll-history"
          exportTitle="Payroll History"
          exportable={can('payroll', 'export')}
        />
      </HRSection>

      {/* Run payroll / edit structure form */}
      <HREntityForm
        open={runOpen}
        onClose={() => { setRunOpen(false); setEditStructure(null) }}
        title={editStructure ? `Edit Salary Structure — ${editStructure.employee}` : 'Run Payroll'}
        subtitle={editStructure ? 'Update the employee salary components' : 'Process the payroll run for a period'}
        icon={editStructure ? Wallet : Play}
        accent="#0f55f7"
        saveLabel={editStructure ? 'Save Changes' : 'Run Payroll'}
        values={editStructure || {}}
        fields={editStructure
          ? [
            { key: 'band', label: 'Pay Band', type: 'text', required: true, placeholder: 'e.g. L3' },
            { key: 'ctc', label: 'CTC (₹ Lakhs)', type: 'text', required: true, placeholder: 'e.g. 18.5' },
            { key: 'basic', label: 'Basic (₹L)', type: 'text', required: true, placeholder: 'e.g. 6.2' },
            { key: 'hra', label: 'HRA (₹L)', type: 'text', required: true, placeholder: 'e.g. 3.1' },
            { key: 'netMonthly', label: 'Net / Month (₹L)', type: 'text', required: true, placeholder: 'e.g. 1.42' },
          ]
          : [
            { key: 'period', label: 'Pay Period', type: 'select', required: true, options: ['August 2026', 'July 2026', 'June 2026'].map((p) => ({ value: p, label: p })) },
            { key: 'employees', label: 'Employees Processed', type: 'number', required: true, defaultValue: HR_PAYROLL_STATS.processedEmployees },
            { key: 'gross', label: 'Gross Pay (₹L)', type: 'text', required: true, defaultValue: HR_PAYROLL_STATS.grossPay },
            { key: 'net', label: 'Net Pay (₹L)', type: 'text', required: true, defaultValue: HR_PAYROLL_STATS.netPay },
          ]}
        onSave={(values) => {
          if (editStructure) {
            setStructures((prev) => prev.map((s) => (s.id === editStructure.id ? { ...s, ...values } : s)))
            toast.success(`Salary structure updated for ${editStructure.employee}`)
          } else {
            const id = `PR-${String(history.length + 1).padStart(2, '0')}`
            setHistory((prev) => [{
              id,
              period: values.period,
              employees: Number(values.employees) || 0,
              gross: values.gross,
              net: values.net,
              taxes: '—',
              status: 'processed',
              processedOn: 'Aug 4, 2026',
            }, ...prev])
            toast.success(`Payroll run completed for ${values.period}`)
          }
        }}
      />

      {/* Salary structure detail drawer — compact, unique card style */}
      <HRDrawer
        open={Boolean(viewStructure)}
        onClose={() => setViewStructure(null)}
        title={viewStructure?.employee || 'Salary Structure'}
        subtitle={`${viewStructure?.band || ''} pay band · Kini HRMS`}
        icon={Wallet}
        accent="#0f55f7"
        width="max-w-[420px]"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setViewStructure(null)}>Close</Button>
            {can('payroll', 'edit') && viewStructure && (
              <Button
                variant="primary"
                size="sm"
                icon={Pencil}
                onClick={() => { setEditStructure(viewStructure); setViewStructure(null); setRunOpen(true) }}
              >
                Edit Structure
              </Button>
            )}
          </div>
        }
      >
        {viewStructure && (
          <div className="space-y-4">
            {/* Salary hero */}
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f55f7] to-[#06b6a8] p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide">
                  {viewStructure.band}
                </span>
                <span className="text-[10px] font-semibold text-white/80">CTC / annum</span>
              </div>
              <p className="mt-2 text-2xl font-extrabold tracking-tight">₹{viewStructure.ctc}L</p>
              <p className="mt-1 text-[11px] text-white/85">Net monthly {viewStructure.netMonthly}L · paid in 12 instalments</p>
            </div>

            {/* Component split */}
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Basic', `₹${viewStructure.basic}L`, '#0f55f7'],
                ['HRA', `₹${viewStructure.hra}L`, '#06b6a8'],
                ['Net / Month', `₹${viewStructure.netMonthly}L`, '#8b5cf6'],
                ['CTC', `₹${viewStructure.ctc}L`, '#EC4899'],
              ].map(([label, value, color]) => (
                <div key={label} className="rounded-xl border border-slate-100 px-3 py-2.5 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
                  <p className="mt-0.5 text-sm font-extrabold" style={{ color }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Breakdown bar */}
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Annual Split</p>
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full bg-[#0f55f7]" style={{ width: `${(Number(viewStructure.basic) / Number(viewStructure.ctc)) * 100}%` }} />
                <div className="h-full bg-[#06b6a8]" style={{ width: `${(Number(viewStructure.hra) / Number(viewStructure.ctc)) * 100}%` }} />
              </div>
              <div className="mt-2 flex items-center gap-4 text-[10px] font-semibold text-slate-400">
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#0f55f7]" /> Basic</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#06b6a8]" /> HRA</span>
                <span className="text-slate-300">+ other allowances</span>
              </div>
            </div>
          </div>
        )}
      </HRDrawer>

      {/* Payroll run detail drawer */}
      <HRDrawer
        open={Boolean(viewRun)}
        onClose={() => setViewRun(null)}
        title={viewRun?.period || 'Payroll Run'}
        subtitle={`${viewRun?.status || ''} · ${viewRun?.processedOn || ''}`}
        icon={CalendarClock}
        accent="#0f55f7"
      >
        {viewRun && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Employees', viewRun.employees],
                ['Gross', viewRun.gross],
                ['Net', viewRun.net],
                ['Taxes', viewRun.taxes],
                ['Status', viewRun.status],
                ['Processed On', viewRun.processedOn],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-slate-100 px-3 py-2.5 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase text-slate-400">{label}</p>
                  <p className="mt-0.5 truncate text-xs font-bold text-slate-800 dark:text-slate-200">{value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5 text-xs leading-5 text-slate-500 dark:bg-slate-800/40 dark:text-slate-400">
              Detailed run breakdown (per-employee payslips, TDS deposit, bank files) is available from the
              Payslips module.
            </div>
          </div>
        )}
      </HRDrawer>
    </HRPage>
  )
}
