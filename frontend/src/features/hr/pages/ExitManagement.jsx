import { useMemo, useState } from 'react'
import useAddIntent from '@features/hr/hooks/useAddIntent'
import {
  DoorOpen, ClipboardList, CheckCircle2, MessageSquareQuote, Wallet, UserX, Plus, FileText, CalendarDays,
} from 'lucide-react'
import { toast } from 'sonner'
import useHrPermissions from '@features/hr/hooks/useHrPermissions'
import StatsCard from '@shared/components/StatsCard'
import usePageSearch from '@features/hr/hooks/usePageSearch'
import Button from '@shared/components/Button'
import HRPage from '@features/hr/components/HRPage'
import HRQuickActions from '@features/hr/components/HRQuickActions'
import HREntityForm from '@features/hr/components/HREntityForm'
import HRDrawer from '@features/hr/components/HRDrawer'
import HRTimeline from '@features/hr/components/HRTimeline'
import HRDataTable from '@features/hr/components/HRDataTable'
import { HRSection, HRAvatar, HRStatusBadge, HRProgressBar } from '@features/hr/components/hrPrimitives'
import {
  HR_EXIT_STATS, HR_EXITS, HR_EXIT_CHECKLIST, HR_EXIT_INTERVIEWS, HR_EXIT_TIMELINE,
} from '@features/hr/data/hrWorkforce'

const EXIT_BADGE = { 'in-process': 'pending', cleared: 'success', settled: 'success' }
const TASK_BADGE = { done: 'success', pending: 'pending' }

export default function ExitManagement() {
  // KINI HRMS RBAC — resignations, interviews and exports follow the exit module permissions.
  const { can } = useHrPermissions()
  const [exits, setExits] = useState(HR_EXITS)
  const [interviews, setInterviews] = useState(HR_EXIT_INTERVIEWS)
  const [resignationOpen, setResignationOpen] = useState(false)
  const [interviewOpen, setInterviewOpen] = useState(false)
  const [processRow, setProcessRow] = useState(null)
  useAddIntent(() => setResignationOpen(true))
  const pageSearch = usePageSearch()
  const filteredExits = useMemo(() => exits.filter(pageSearch.matches), [exits, pageSearch.matches])

  const columns = [
    {
      accessor: 'employee', header: 'Employee', sortable: true, minWidth: 180,
      render: (row) => (
        <div className="flex items-center gap-3">
          <HRAvatar name={row.employee} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{row.employee}</p>
            <p className="text-[11px] text-slate-400">{row.designation}</p>
          </div>
        </div>
      ),
    },
    { accessor: 'reason', header: 'Reason', sortable: true, render: (row) => <span className="text-xs text-slate-600 dark:text-slate-300">{row.reason}</span> },
    { accessor: 'noticeDate', header: 'Notice Date', sortable: true, render: (row) => <span className="text-xs text-slate-500">{row.noticeDate}</span> },
    { accessor: 'lastDay', header: 'Last Day', sortable: true, render: (row) => <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{row.lastDay}</span> },
    { accessor: 'status', header: 'Status', sortable: true, render: (row) => <HRStatusBadge status={EXIT_BADGE[row.status]} label={row.status} /> },
    { accessor: 'id', header: 'Actions', sortable: false, sticky: 'right', width: 116, render: (row) => (
      <Button variant="secondary" size="xs" icon={FileText} onClick={() => setProcessRow(row)}>
        {can('exit', 'edit') ? 'Process' : 'View'}
      </Button>
    )},
  ]

  const doneTasks = HR_EXIT_CHECKLIST.filter((t) => t.status === 'done').length
  const progress = Math.round((doneTasks / HR_EXIT_CHECKLIST.length) * 100)

  return (
    <HRPage
      moduleId="exit"
      title="Exit Management"
      subtitle="Resignations, clearance, exit interviews, knowledge transfer and settlement."
      icon={DoorOpen}
      lastUpdated="Aug 4, 2026"
      search={{ value: pageSearch.search, onChange: pageSearch.setSearch, placeholder: 'Search exit records…' }}
      actions={
        <HRQuickActions
          can={can}
          actions={[
            { key: 'add', label: 'Register Resignation', icon: Plus, variant: 'primary', permission: ['exit', 'add'], onClick: () => setResignationOpen(true) },
            { key: 'interview', label: 'Schedule Exit Interview', icon: MessageSquareQuote, permission: ['exit', 'schedule'], onClick: () => setInterviewOpen(true) },
          ]}
        />
      }
    >
      <div className="mb-2 grid grid-cols-2 gap-2 md:grid-cols-4">
        <StatsCard compact icon={UserX} value={HR_EXIT_STATS.inProcess} label="In Process" accentColor="#F59E0B" className="!min-h-[66px] !rounded-xl !p-2.5 shadow-sm" />
        <StatsCard compact icon={CheckCircle2} value={HR_EXIT_STATS.cleared} label="Cleared" accentColor="#06b6a8" className="!min-h-[66px] !rounded-xl !p-2.5 shadow-sm" />
        <StatsCard compact icon={Wallet} value={HR_EXIT_STATS.settlementDue} label="Settlement Due" accentColor="#EF4444" className="!min-h-[66px] !rounded-xl !p-2.5 shadow-sm" />
        <StatsCard compact icon={DoorOpen} value={HR_EXIT_STATS.resignedThisQuarter} label="Resigned (Quarter)" accentColor="#0f55f7" className="!min-h-[66px] !rounded-xl !p-2.5 shadow-sm" />
      </div>

      <div className="space-y-2">
        {/* Exits table */}
        <HRSection title="Resignations" subtitle="All active and recent exits" icon={DoorOpen} padding="p-3">
          <HRDataTable
            columns={columns}
            data={filteredExits}
            searchable={false}
            pageSize={5}
            exportable={false}
          />
        </HRSection>

        {/* Checklist + interviews */}
        <div className="grid gap-2 lg:grid-cols-2">
          <HRSection title="Exit Checklist" subtitle="Standard clearance workflow" icon={ClipboardList} padding="p-3">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Completion</span>
              <span className="text-xs font-extrabold text-[#0f55f7]">{progress}%</span>
            </div>
            <HRProgressBar value={progress} color="#0f55f7" />
            <ul className="mt-3 space-y-2">
              {HR_EXIT_CHECKLIST.map((task) => (
                <li key={task.id} className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-200">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${task.status === 'done' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                    <span className="truncate">{task.task}</span>
                  </span>
                  <HRStatusBadge status={TASK_BADGE[task.status]} label={task.status} />
                </li>
              ))}
            </ul>
          </HRSection>

          <HRSection title="Exit Interviews" subtitle="Scheduled and completed" icon={MessageSquareQuote} padding="p-3">
            <ul className="space-y-2">
              {interviews.map((interview) => (
                <li key={interview.id} className="rounded-xl border border-slate-100 px-3 py-2.5 dark:border-slate-800">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{interview.employee}</p>
                    <HRStatusBadge status={interview.status} />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">{interview.date} · {interview.reason}</p>
                  {interview.feedback !== '—' && (
                    <p className="mt-1.5 text-[11px] italic leading-4 text-slate-400">"{interview.feedback}"</p>
                  )}
                </li>
              ))}
            </ul>
          </HRSection>
        </div>
      </div>

      {/* Timeline */}
      <HRSection title="Sample Exit Timeline" subtitle="Rohit Sen · Sales" icon={CalendarDays} padding="p-3">
        <HRTimeline items={HR_EXIT_TIMELINE} />
      </HRSection>

      {/* Register resignation form */}
      <HREntityForm
        open={resignationOpen}
        onClose={() => setResignationOpen(false)}
        title="Register Resignation"
        subtitle="Start the exit workflow for an employee"
        icon={DoorOpen}
        accent="#F59E0B"
        saveLabel="Register Resignation"
        fields={[
          { key: 'employee', label: 'Employee', type: 'text', required: true, placeholder: 'Employee name' },
          { key: 'designation', label: 'Designation', type: 'text', required: true, placeholder: 'e.g. Sales Manager' },
          { key: 'reason', label: 'Reason', type: 'select', required: true, options: ['Better opportunity', 'Relocation', 'Personal reasons', 'Retirement', 'Contract end'].map((r) => ({ value: r, label: r })) },
          { key: 'noticeDate', label: 'Notice Date', type: 'date', required: true },
          { key: 'lastDay', label: 'Last Working Day', type: 'date', required: true },
        ]}
        onSave={(values) => {
          const id = `EX-${String(exits.length + 1).padStart(2, '0')}`
          setExits((prev) => [{
            id,
            employee: values.employee,
            designation: values.designation,
            reason: values.reason,
            noticeDate: values.noticeDate,
            lastDay: values.lastDay,
            stage: 'notice',
            status: 'in-process',
          }, ...prev])
          toast.success(`Resignation registered for ${values.employee}`)
        }}
      />

      {/* Schedule exit interview form */}
      <HREntityForm
        open={interviewOpen}
        onClose={() => setInterviewOpen(false)}
        title="Schedule Exit Interview"
        subtitle="Book an interview with a departing employee"
        icon={MessageSquareQuote}
        accent="#0f55f7"
        saveLabel="Schedule"
        fields={[
          { key: 'employee', label: 'Employee', type: 'text', required: true, placeholder: 'Employee name' },
          { key: 'date', label: 'Date', type: 'text', required: true, placeholder: 'e.g. Aug 14 · 3:00 PM' },
          { key: 'reason', label: 'Reason', type: 'select', required: true, defaultValue: 'Better opportunity', options: ['Better opportunity', 'Relocation', 'Personal reasons', 'Retirement', 'Contract end'].map((r) => ({ value: r, label: r })) },
        ]}
        onSave={(values) => {
          const id = `EI-${String(interviews.length + 1).padStart(2, '0')}`
          setInterviews((prev) => [{
            id,
            employee: values.employee,
            date: values.date,
            reason: values.reason,
            status: 'scheduled',
            feedback: '—',
          }, ...prev])
          toast.success(`Exit interview scheduled for ${values.employee}`)
        }}
      />

      {/* Process exit drawer */}
      <HRDrawer
        open={Boolean(processRow)}
        onClose={() => setProcessRow(null)}
        title={processRow?.employee || 'Exit Process'}
        subtitle={`${processRow?.designation} · ${processRow?.reason}`}
        icon={FileText}
        accent="#F59E0B"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setProcessRow(null)}>Close</Button>
            {can('exit', 'edit') && processRow?.status !== 'cleared' && (
              <Button variant="primary" size="sm" icon={CheckCircle2} onClick={() => {
                setExits((prev) => prev.map((e) => (e.id === processRow.id ? { ...e, status: 'cleared', stage: 'clearance' } : e)))
                toast.success(`${processRow.employee} exit cleared`)
                setProcessRow(null)
              }}>Mark Cleared</Button>
            )}
          </div>
        }
      >
        {processRow && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Employee', processRow.employee],
                ['Designation', processRow.designation],
                ['Reason', processRow.reason],
                ['Notice Date', processRow.noticeDate],
                ['Last Day', processRow.lastDay],
                ['Stage', processRow.stage],
                ['Status', processRow.status],
                ['ID', processRow.id],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-slate-100 px-3 py-2.5 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase text-slate-400">{label}</p>
                  <p className="mt-0.5 truncate text-xs font-bold capitalize text-slate-800 dark:text-slate-200">{String(value).replace('-', ' ')}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-gradient-to-br from-[#F59E0B]/10 to-[#0f55f7]/10 p-3.5 text-xs leading-5 text-slate-600 dark:text-slate-300">
              The standard clearance checklist (assets, access, handover) runs from the Exit Checklist panel.
              Mark the record cleared once every task is done.
            </div>
          </div>
        )}
      </HRDrawer>
    </HRPage>
  )
}
