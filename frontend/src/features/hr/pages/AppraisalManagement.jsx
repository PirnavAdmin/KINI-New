import { useMemo, useState } from 'react'
import useAddIntent from '@features/hr/hooks/useAddIntent'
import {
  TrendingUp, RefreshCcw, ArrowUpRight, CheckCircle2, Clock3, FileCheck2, Banknote, Award,
  Users2, Star,
} from 'lucide-react'
import { toast } from 'sonner'
import useHrPermissions from '@features/hr/hooks/useHrPermissions'
import StatsCard from '@shared/components/StatsCard'
import usePageSearch from '@features/hr/hooks/usePageSearch'
import Button from '@shared/components/Button'
import DataTable from '@shared/components/DataTable'
import HRPage from '@features/hr/components/HRPage'
import HRQuickActions from '@features/hr/components/HRQuickActions'
import HREntityForm from '@features/hr/components/HREntityForm'
import HRDrawer from '@features/hr/components/HRDrawer'
import { HRSection, HRStatusBadge, HRProgressBar } from '@features/hr/components/hrPrimitives'
import {
  HR_APPRAISAL_STATS, HR_APPRAISAL_CYCLES, HR_SALARY_REVISIONS, HR_PROMOTIONS, HR_APPRAISAL_APPROVALS,
} from '@features/hr/data/hrTalent'

const CYCLE_BADGE = { active: 'success', closed: 'default' }
const REVISION_BADGE = { approved: 'success', pending: 'pending' }
const APPROVAL_BADGE = { approved: 'success', pending: 'pending' }

export default function AppraisalManagement() {
  // KINI HRMS RBAC — cycles, revisions and exports follow the appraisal module permissions.
  const { can } = useHrPermissions()
  const [cycles, setCycles] = useState(HR_APPRAISAL_CYCLES)
  const [startOpen, setStartOpen] = useState(false)
  const [viewCycle, setViewCycle] = useState(null)
  useAddIntent(() => setStartOpen(true))
  const pageSearch = usePageSearch()
  const filteredCycles = useMemo(() => cycles.filter(pageSearch.matches), [cycles, pageSearch.matches])
  const filteredRevisions = useMemo(() => HR_SALARY_REVISIONS.filter(pageSearch.matches), [pageSearch.matches])

  const cycleColumns = [
    { accessor: 'cycle', header: 'Cycle', sortable: true, minWidth: 120, render: (row) => <span className="text-sm font-bold text-slate-900 dark:text-white">{row.cycle}</span> },
    { accessor: 'period', header: 'Period', sortable: true, render: (row) => <span className="text-xs text-slate-500">{row.period}</span> },
    { accessor: 'employees', header: 'Employees', sortable: true, render: (row) => <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{row.employees}</span> },
    { accessor: 'stage', header: 'Stage', sortable: true, render: (row) => (
      <span className="text-xs font-medium capitalize text-slate-600 dark:text-slate-300">{row.stage.replace('-', ' ')}</span>
    )},
    { accessor: 'status', header: 'Status', sortable: true, render: (row) => <HRStatusBadge status={CYCLE_BADGE[row.status]} label={row.status} /> },
    { accessor: 'id', header: 'Actions', sortable: false, sticky: 'right', width: 100, render: (row) => (
      row.status === 'active'
        ? can('appraisal', 'view')
          ? <Button variant="secondary" size="xs" onClick={() => setViewCycle(row)}>Open Cycle</Button>
          : null
        : <span className="text-[11px] text-slate-400">Archived</span>
    )},
  ]

  const revisionColumns = [
    { accessor: 'employee', header: 'Employee', sortable: true, render: (row) => <span className="text-sm font-semibold text-slate-900 dark:text-white">{row.employee}</span> },
    { accessor: 'current', header: 'Current', sortable: true, render: (row) => <span className="text-xs text-slate-500">{row.current}</span> },
    { accessor: 'revised', header: 'Revised', sortable: true, render: (row) => <span className="text-xs font-bold text-emerald-600">{row.revised}</span> },
    { accessor: 'pct', header: 'Hike', sortable: true, render: (row) => (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:bg-emerald-500/10">
        <ArrowUpRight className="h-3 w-3" />{row.pct}%
      </span>
    )},
    { accessor: 'reason', header: 'Reason', sortable: true, render: (row) => <span className="text-xs text-slate-500">{row.reason}</span> },
    { accessor: 'status', header: 'Status', sortable: true, render: (row) => <HRStatusBadge status={REVISION_BADGE[row.status]} label={row.status} /> },
    { accessor: 'effective', header: 'Effective', sortable: true, render: (row) => <span className="text-xs text-slate-500">{row.effective}</span> },
  ]

  return (
    <HRPage
      moduleId="appraisal"
      title="Appraisal"
      subtitle="Cycles, salary revisions, promotions, history and approvals."
      icon={TrendingUp}
      lastUpdated="Aug 4, 2026"
      search={{ value: pageSearch.search, onChange: pageSearch.setSearch, placeholder: 'Search appraisals…' }}
      actions={
        <HRQuickActions
          can={can}
          actions={[{ key: 'cycle', label: 'Start New Cycle', icon: RefreshCcw, variant: 'primary', permission: ['appraisal', 'add'], onClick: () => setStartOpen(true) }]}
        />
      }
    >
      <div className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatsCard compact icon={FileCheck2} value={HR_APPRAISAL_STATS.currentCycle} label="Current Cycle" accentColor="#0f55f7" />
        <StatsCard compact icon={Users2} value={HR_APPRAISAL_STATS.employeesDue} label="Employees Due" accentColor="#8b5cf6" />
        <StatsCard compact icon={CheckCircle2} value={HR_APPRAISAL_STATS.completed} label="Completed" accentColor="#06b6a8" />
        <StatsCard compact icon={Clock3} value={HR_APPRAISAL_STATS.inProgress} label="In Progress" accentColor="#F59E0B" />
        <StatsCard compact icon={Banknote} value={HR_APPRAISAL_STATS.salaryRevisions} label="Salary Revisions" accentColor="#EC4899" />
        <StatsCard compact icon={Award} value={HR_APPRAISAL_STATS.promotions} label="Promotions" accentColor="#10b981" />
      </div>

      {/* Cycle progress */}
      <HRSection title="Current Cycle Progress" subtitle={`${HR_APPRAISAL_STATS.currentCycle} · H2 2026`} icon={RefreshCcw} padding="p-4 sm:p-5">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-500">Completion</span>
          <span className="font-extrabold text-[#0f55f7]">{Math.round((HR_APPRAISAL_STATS.completed / HR_APPRAISAL_STATS.employeesDue) * 100)}%</span>
        </div>
        <HRProgressBar value={(HR_APPRAISAL_STATS.completed / HR_APPRAISAL_STATS.employeesDue) * 100} color="#0f55f7" height="h-2" />
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            ['Self-review', 32], ['Manager review', 24], ['Calibration', 18], ['Approvals', 8],
          ].map(([label, pct]) => (
            <div key={label} className="rounded-xl bg-slate-50 px-3 py-2.5 text-center dark:bg-slate-800/40">
              <p className="text-base font-extrabold text-slate-800 dark:text-white">{pct}</p>
              <p className="text-[10px] font-semibold text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </HRSection>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <HRSection title="Appraisal Cycles" subtitle="Past and present cycles" icon={RefreshCcw} padding="p-4">
          <DataTable columns={cycleColumns} data={filteredCycles} searchable={false} pageSize={4} />
        </HRSection>
        <HRSection title="Salary Revisions" subtitle="Hike recommendations pending approval" icon={Banknote} padding="p-4">
          <DataTable columns={revisionColumns} data={filteredRevisions} searchable={false} pageSize={5} />
        </HRSection>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <HRSection title="Promotions" subtitle="Recommended role changes" icon={Award} padding="p-4">
          <ul className="space-y-2.5">
            {HR_PROMOTIONS.map((promotion) => (
              <li key={promotion.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-3 dark:border-slate-800">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{promotion.employee}</p>
                  <p className="mt-0.5 truncate text-[11px] text-slate-500">
                    {promotion.from} <ArrowUpRight className="inline h-3 w-3 text-emerald-500" /> {promotion.to}
                  </p>
                  <p className="mt-0.5 text-[10px] font-semibold text-slate-400">Effective {promotion.effective}</p>
                </div>
                <HRStatusBadge status={promotion.status} />
              </li>
            ))}
          </ul>
        </HRSection>
        <HRSection title="Approvals" subtitle="Manager-approved revisions queue" icon={CheckCircle2} padding="p-4">
          <DataTable
            columns={[
              { accessor: 'employee', header: 'Employee', sortable: true, render: (row) => <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{row.employee}</span> },
              { accessor: 'rating', header: 'Rating', sortable: true, render: (row) => (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500"><Star className="h-3 w-3 fill-current" />{row.rating.toFixed(1)}</span>
              )},
              { accessor: 'revision', header: 'Revision', sortable: true, render: (row) => <span className="text-xs font-bold text-emerald-600">{row.revision}</span> },
              { accessor: 'manager', header: 'Manager', sortable: true, render: (row) => <span className="text-xs text-slate-500">{row.manager}</span> },
              { accessor: 'status', header: 'Status', sortable: true, render: (row) => <HRStatusBadge status={APPROVAL_BADGE[row.status]} label={row.status} /> },
            ]}
            data={HR_APPRAISAL_APPROVALS}
            searchable={false}
            pageSize={4}
          />
        </HRSection>
      </div>

      {/* Start new cycle form */}
      <HREntityForm
        open={startOpen}
        onClose={() => setStartOpen(false)}
        title="Start New Cycle"
        subtitle="Launch an appraisal cycle"
        icon={RefreshCcw}
        accent="#0f55f7"
        saveLabel="Start Cycle"
        fields={[
          { key: 'cycle', label: 'Cycle Name', type: 'select', required: true, options: ['H2 2026', 'H1 2027', 'Q4 2026'].map((c) => ({ value: c, label: c })) },
          { key: 'period', label: 'Period', type: 'text', required: true, placeholder: 'e.g. Jul 2026 – Dec 2026' },
          { key: 'employees', label: 'Employees Due', type: 'number', required: true, defaultValue: 120 },
        ]}
        onSave={(values) => {
          const id = `CY-${String(cycles.length + 1).padStart(2, '0')}`
          setCycles((prev) => [{
            id,
            cycle: values.cycle,
            period: values.period,
            employees: Number(values.employees) || 0,
            stage: 'self-review',
            status: 'active',
          }, ...prev])
          toast.success(`${values.cycle} appraisal cycle started`)
        }}
      />

      {/* Cycle detail drawer */}
      <HRDrawer
        open={Boolean(viewCycle)}
        onClose={() => setViewCycle(null)}
        title={viewCycle?.cycle || 'Appraisal Cycle'}
        subtitle={`${viewCycle?.period} · ${viewCycle?.stage?.replace('-', ' ')}`}
        icon={RefreshCcw}
        accent="#0f55f7"
      >
        {viewCycle && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Cycle', viewCycle.cycle],
                ['Period', viewCycle.period],
                ['Employees', viewCycle.employees],
                ['Stage', viewCycle.stage.replace('-', ' ')],
                ['Status', viewCycle.status],
                ['ID', viewCycle.id],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-slate-100 px-3 py-2.5 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase text-slate-400">{label}</p>
                  <p className="mt-0.5 truncate text-xs font-bold capitalize text-slate-800 dark:text-slate-200">{value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-gradient-to-br from-[#0f55f7]/8 to-[#06b6a8]/8 p-3.5 text-xs leading-5 text-slate-600 dark:text-slate-300">
              Progress: {Math.round((HR_APPRAISAL_STATS.completed / HR_APPRAISAL_STATS.employeesDue) * 100)}% completed
              · salary revisions and promotions flow through the panels on this page.
            </div>
          </div>
        )}
      </HRDrawer>
    </HRPage>
  )
}
