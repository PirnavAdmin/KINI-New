import HrLiveBoundary from '@features/hr/components/HrLiveBoundary'
import { useMemo, useRef, useState } from 'react'
import useAddIntent from '@features/hr/hooks/useAddIntent'
import {
  ClipboardCheck, CalendarDays, Clock, CheckCircle2, XCircle, Check, X, Plus, TrendingUp, FileText, Eye,
} from 'lucide-react'
import { toast } from 'sonner'
import useHrPermissions from '@features/hr/hooks/useHrPermissions'
import Button from '@shared/components/Button'
import HRPage from '@features/hr/components/HRPage'
import { HrBreadcrumb, HrHero, HrKpis } from '@features/hr/components/portal/HrPortalKit'
import { heroProps } from '@features/hr/components/portal/hrHeroes'
import { ROUTES } from '@shared/constants/routeConstants'
import HRQuickActions from '@features/hr/components/HRQuickActions'
import HREntityForm from '@features/hr/components/HREntityForm'
import HRDrawer from '@features/hr/components/HRDrawer'
import usePageSearch from '@features/hr/hooks/usePageSearch'
import HRMiniBars from '@features/hr/components/HRMiniBars'
import HRDataTable from '@features/hr/components/HRDataTable'
import { HRSection, HRAvatar, HRStatusBadge, HRProgressBar } from '@features/hr/components/hrPrimitives'
import {
  HR_LEAVE_TYPES, HR_LEAVE_REQUESTS, HR_LEAVE_CALENDAR_EVENTS, HR_LEAVE_STATS,
  HR_LEAVE_DEPT_LOAD, HR_LEAVE_TREND,
} from '@features/hr/data/hrTime'

const REQUEST_BADGE = { pending: 'pending', approved: 'success', rejected: 'danger' }
const DEMO_EMPLOYEE = { name: 'Ananya Rao', role: 'Employee', department: 'Engineering' }
const DEMO_EMPLOYEE_LEAVE_TYPES = HR_LEAVE_TYPES.filter((type) => type.code !== 'PAT')

function LegacyLeaveManagement() {
  // KINI HRMS RBAC — approvals, requests and exports follow the HR level.
  // ENTERPRISE RBAC — Approve and Reject are independent permissions. Level
  // profiles don't distinguish reject, so a level user may reject whenever they
  // can approve (preserves the existing UX); custom profiles are exact.
  const { can, permissionSource } = useHrPermissions()
  const canApprove = can('leave', 'approve')
  const canReject = can('leave', 'reject') || (permissionSource === 'level' && canApprove)
  const [requests, setRequests] = useState(HR_LEAVE_REQUESTS)
  const [formOpen, setFormOpen] = useState(false)
  const [policyOpen, setPolicyOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const requestsRef = useRef(null)
  useAddIntent(() => setFormOpen(true))
  const pageSearch = usePageSearch()
  const filteredRequests = useMemo(() => requests.filter(pageSearch.matches), [requests, pageSearch.matches])
  const focusRequests = (search = '') => {
    pageSearch.setSearch(search)
    window.requestAnimationFrame(() => requestsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  const updateStatus = (id, status, label) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
    toast.success(`Leave ${label.toLowerCase()} for ${requests.find((r) => r.id === id)?.employee || 'employee'}`)
  }

  const requestColumns = [
    {
      accessor: 'employee', header: 'Employee', sortable: true, minWidth: 180,
      render: (row) => (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setSelectedRequest(row) }}
          className="flex items-center gap-3 text-left transition-opacity hover:opacity-80"
          aria-label={`View leave request of ${row.employee}`}
        >
          <HRAvatar name={row.employee} size="sm" />
          <span className="text-sm font-semibold text-slate-900 transition-colors hover:text-[#0f55f7] dark:text-white dark:hover:text-blue-300">{row.employee}</span>
        </button>
      ),
    },
    { accessor: 'type', header: 'Type', sortable: true, render: (row) => <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{row.type}</span> },
    { accessor: 'dates', header: 'Dates', sortable: true, render: (row) => <span className="text-xs text-slate-500">{row.dates}</span> },
    { accessor: 'days', header: 'Days', sortable: true, render: (row) => (
      <span className="rounded-full bg-[#0f55f7]/10 px-2.5 py-0.5 text-xs font-bold text-[#0f55f7]">{row.days}</span>
    )},
    { accessor: 'reason', header: 'Reason', sortable: true, minWidth: 160, render: (row) => <span className="truncate text-xs text-slate-500">{row.reason}</span> },
    { accessor: 'status', header: 'Status', sortable: true, render: (row) => <HRStatusBadge status={REQUEST_BADGE[row.status]} label={row.status} /> },
    { accessor: 'id', header: 'Actions', sortable: false, sticky: 'right', width: 120, render: (row) => (
      can('leave', 'view') ? (
        <div className="flex items-center gap-1">
          <Button
            variant={row.status === 'pending' ? 'primary' : 'secondary'}
            size="xs"
            icon={Eye}
            onClick={(event) => {
              event.stopPropagation()
              setSelectedRequest(row)
            }}
          >
            {row.status === 'pending' ? 'Review' : 'View'}
          </Button>
          {canApprove && (
            <button
              className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600 transition-colors hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20"
              aria-label="Approve"
              onClick={() => updateStatus(row.id, 'approved', 'approved')}
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          )}
          {canReject && (
            <button
              className="rounded-lg bg-red-50 p-1.5 text-red-500 transition-colors hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20"
              aria-label="Reject"
              onClick={() => updateStatus(row.id, 'rejected', 'rejected')}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ) : <span className="text-[11px] text-slate-400">—</span>
    )},
  ]

  const monthDays = 31

  return (
    <HRPage
      moduleId="leave"
      title="Leave Management"
      subtitle="Requests, balances, calendars and the approval workflow."
      icon={ClipboardCheck}
      lastUpdated="Aug 4, 2026"
      search={{ value: pageSearch.search, onChange: pageSearch.setSearch, placeholder: 'Search leave requests…' }}
      actions={
        <HRQuickActions
          can={can}
          actions={[
            { key: 'add', label: 'New Leave Request', icon: Plus, variant: 'primary', permission: ['leave', 'add'], onClick: () => setFormOpen(true) },
            { key: 'policy', label: 'Leave Policy', icon: FileText, permission: ['leave', 'view'], onClick: () => setPolicyOpen(true) },
          ]}
        />
      }
      hero={
        <>
          <HrBreadcrumb items={[{ label: 'Home', to: ROUTES.EMPLOYEE.HR_DASHBOARD }, { label: 'Leave Management' }]} />
          <HrHero
            {...heroProps('leave')}
            actions={<HRQuickActions
          can={can}
          actions={[
            { key: 'add', label: 'New Leave Request', icon: Plus, variant: 'primary', permission: ['leave', 'add'], onClick: () => setFormOpen(true) },
            { key: 'policy', label: 'Leave Policy', icon: FileText, permission: ['leave', 'view'], onClick: () => setPolicyOpen(true) },
          ]}
        />}
          />
        </>
      }
    >
      <HrKpis columns={6}
        items={[
          { label: 'Total Requests', value: HR_LEAVE_STATS.totalRequests, icon: ClipboardCheck, tone: 'blue', onClick: () => focusRequests() },
          { label: 'Pending', value: HR_LEAVE_STATS.pending, icon: Clock, tone: 'orange', onClick: () => focusRequests('pending') },
          { label: 'Approved (Month)', value: HR_LEAVE_STATS.approvedThisMonth, icon: CheckCircle2, tone: 'green', onClick: () => focusRequests('approved') },
          { label: 'WFH Share', value: `${HR_LEAVE_STATS.wfhShare}%`, icon: XCircle, tone: 'purple', onClick: () => focusRequests('work from home') },
          { label: 'Avg Duration', value: HR_LEAVE_STATS.avgDuration, icon: CalendarDays, tone: 'pink', onClick: () => focusRequests() },
          { label: 'Used in Aug', value: HR_LEAVE_TREND[HR_LEAVE_TREND.length - 1].used, icon: TrendingUp, tone: 'teal', onClick: () => focusRequests() },
        ]}
      />
      <div className="mb-3" />

      <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
        {/* Balances */}
        <HRSection
          title={`${DEMO_EMPLOYEE.name}'s Leave Balances`}
          subtitle={`${DEMO_EMPLOYEE.role} · ${DEMO_EMPLOYEE.department} · 2026 entitlement`}
          icon={CalendarDays}
          padding="p-3.5"
        >
          <div className="space-y-3">
            {DEMO_EMPLOYEE_LEAVE_TYPES.map((type) => (
              <div key={type.id}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <span className="flex h-5 w-8 items-center justify-center rounded-md text-[9px] font-extrabold text-white" style={{ backgroundColor: type.color }}>{type.code}</span>
                    {type.name}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    <span className="font-extrabold text-slate-800 dark:text-white">{type.remaining}</span>/{type.days} left
                  </span>
                </div>
                <HRProgressBar value={(type.used / type.days) * 100} color={type.color} />
              </div>
            ))}
          </div>
        </HRSection>

        {/* Requests */}
        <div ref={requestsRef} className="scroll-mt-4 lg:col-span-2">
          <HRSection title="Leave Requests" subtitle="Approval workflow queue" icon={ClipboardCheck} className="h-full" padding="p-3.5">
          <HRDataTable
            columns={requestColumns}
            data={filteredRequests}
            searchable={false}
            pageSize={7}
            exportFileName="leave-requests"
            exportTitle="Leave Requests"
            onRowClick={(row) => setSelectedRequest(row)}
            exportable={can('leave', 'export')}
          />
          </HRSection>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-1 gap-2 lg:grid-cols-3">
        {/* Calendar */}
        <HRSection title="Leave Calendar" subtitle="August 2026" icon={CalendarDays} padding="p-4">
          <div className="mb-2 grid grid-cols-7 gap-1 text-center">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <span key={i} className="text-[10px] font-bold text-slate-400">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: monthDays }, (_, i) => i + 1).map((date) => {
              const events = HR_LEAVE_CALENDAR_EVENTS.filter((e) => e.date === date)
              return (
                <div
                  key={date}
                  className={`flex min-h-[46px] flex-col items-center gap-0.5 rounded-lg border py-1 ${
                    events.length
                      ? 'border-[#0f55f7]/30 bg-[#0f55f7]/5'
                      : 'border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-800/30'
                  }`}
                >
                  <span className={`text-[10px] font-bold ${events.length ? 'text-[#0f55f7]' : 'text-slate-500'}`}>{date}</span>
                  {events.slice(0, 2).map((event, e) => (
                    <span
                      key={e}
                      className="w-full truncate rounded px-0.5 py-px text-center text-[8px] font-bold text-white"
                      style={{ backgroundColor: HR_LEAVE_TYPES.find((t) => t.code === event.type)?.color || '#0f55f7' }}
                      title={event.employee}
                    >
                      {event.type}
                    </span>
                  ))}
                </div>
              )
            })}
          </div>
        </HRSection>

        {/* Dept load + trend */}
        <HRSection title="Department Leave Load" subtitle="Share of leave days by team" icon={TrendingUp} padding="p-4">
          <div className="space-y-3">
            {HR_LEAVE_DEPT_LOAD.map((item) => (
              <div key={item.dept}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{item.dept}</span>
                  <span className="font-bold text-slate-500">{item.load}%</span>
                </div>
                <HRProgressBar value={item.load} color="#0f55f7" />
              </div>
            ))}
          </div>
        </HRSection>

        <HRSection title="Leave Trend" subtitle="Days used per month" icon={CalendarDays} padding="p-4">
          <HRMiniBars
            data={HR_LEAVE_TREND.map((d) => ({ label: d.month, value: d.used }))}
            color="#06b6a8"
            barHeight="h-40"
            valueFormatter={(v) => v}
          />
        </HRSection>
      </div>

      {/* Leave request detail drawer */}
      <HRDrawer
        open={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
        title={selectedRequest?.employee || 'Leave Request'}
        subtitle={selectedRequest ? `${selectedRequest.type} · ${selectedRequest.id}` : undefined}
        icon={ClipboardCheck}
        accent="#0f55f7"
        footer={
          <div className="flex items-center justify-between gap-2">
            <Button variant="secondary" size="sm" onClick={() => setSelectedRequest(null)}>Close</Button>
            {selectedRequest?.status === 'pending' && (canApprove || canReject) && (
              <div className="flex gap-2">
                {canReject && (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={X}
                    onClick={() => { updateStatus(selectedRequest.id, 'rejected', 'Rejected'); setSelectedRequest(null) }}
                  >
                    Reject
                  </Button>
                )}
                {canApprove && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Check}
                    onClick={() => { updateStatus(selectedRequest.id, 'approved', 'Approved'); setSelectedRequest(null) }}
                  >
                    Approve
                  </Button>
                )}
              </div>
            )}
          </div>
        }
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-[#0f55f7]/10 to-[#06b6a8]/10 p-4">
              <HRAvatar name={selectedRequest.employee} size="xl" />
              <div className="min-w-0">
                <p className="truncate text-lg font-extrabold text-slate-900 dark:text-white">{selectedRequest.employee}</p>
                <p className="text-xs text-slate-500">{selectedRequest.id}</p>
                <HRStatusBadge status={REQUEST_BADGE[selectedRequest.status]} label={selectedRequest.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                ['Leave Type', selectedRequest.type],
                ['Dates', selectedRequest.dates],
                ['Days', `${selectedRequest.days} day${selectedRequest.days > 1 ? 's' : ''}`],
                ['Status', selectedRequest.status],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-slate-100 px-3 py-2.5 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase text-slate-400">{label}</p>
                  <p className="mt-0.5 truncate text-xs font-bold text-slate-800 dark:text-slate-200">{value}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">Reason</p>
              <div className="rounded-xl bg-slate-50 p-3.5 text-xs leading-5 text-slate-600 dark:bg-slate-800/40 dark:text-slate-300">
                {selectedRequest.reason}
              </div>
            </div>

            <div className="rounded-xl bg-gradient-to-br from-[#0f55f7]/8 to-[#06b6a8]/8 p-3.5 text-xs leading-5 text-slate-600 dark:text-slate-300">
              {selectedRequest.type} balance: {' '}
              {HR_LEAVE_TYPES.find((t) => t.name === selectedRequest.type)?.remaining ?? '—'} of {' '}
              {HR_LEAVE_TYPES.find((t) => t.name === selectedRequest.type)?.days ?? '—'} days remaining.
            </div>
          </div>
        )}
      </HRDrawer>

      {/* New leave request form */}
      <HREntityForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="New Leave Request"
        subtitle="Submit a request for the approval workflow"
        icon={ClipboardCheck}
        accent="#0f55f7"
        saveLabel="Submit Request"
        fields={[
          { key: 'employee', label: 'Employee', type: 'text', required: true, placeholder: 'Employee name' },
          { key: 'type', label: 'Leave Type', type: 'select', required: true, options: HR_LEAVE_TYPES.map((t) => ({ value: t.name, label: `${t.name} (${t.code})` })) },
          { key: 'dates', label: 'Dates', type: 'text', required: true, placeholder: 'e.g. Aug 12 – Aug 14' },
          { key: 'days', label: 'Days', type: 'number', required: true, defaultValue: 1, placeholder: '1' },
          { key: 'reason', label: 'Reason', type: 'textarea', required: true, placeholder: 'Brief reason for the leave' },
        ]}
        onSave={(values) => {
          const id = `LV-${String(requests.length + 1).padStart(2, '0')}`
          setRequests((prev) => [{
            id,
            employee: values.employee,
            type: values.type,
            dates: values.dates,
            days: Number(values.days) || 1,
            reason: values.reason,
            status: 'pending',
          }, ...prev])
          toast.success('Leave request submitted for approval')
        }}
      />

      {/* Leave policy drawer */}
      <HRDrawer
        open={policyOpen}
        onClose={() => setPolicyOpen(false)}
        title="Leave Policy"
        subtitle="Entitlements, carry-over and approval rules"
        icon={FileText}
        accent="#0f55f7"
      >
        <div className="space-y-4">
          <div className="rounded-2xl bg-gradient-to-br from-[#0f55f7]/8 to-[#06b6a8]/8 p-4">
            <p className="text-sm font-bold text-slate-900 dark:text-white">Annual Entitlements</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Employees accrue leave on a monthly basis. Requests of 3+ days need manager approval and a 5-day
              notice. Unused sick leave does not carry over; unused casual leave carries over up to 3 days.
            </p>
          </div>
          <ul className="space-y-2.5">
            {HR_LEAVE_TYPES.map((type) => (
              <li key={type.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3.5 py-3 dark:border-slate-800">
                <span className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span className="flex h-5 w-8 items-center justify-center rounded-md text-[9px] font-extrabold text-white" style={{ backgroundColor: type.color }}>{type.code}</span>
                  {type.name}
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  <span className="font-extrabold text-slate-800 dark:text-white">{type.days}</span> days · {type.remaining} left
                </span>
              </li>
            ))}
          </ul>
          <div className="rounded-xl border border-slate-100 p-3.5 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-900 dark:text-white">Approval Rules</p>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              <li>• Approvals happen in the Leave module — Approve / Reject actions update the queue instantly.</li>
              <li>• WFH share counts toward the 30% monthly cap.</li>
              <li>• Public holidays are excluded from leave days automatically.</li>
            </ul>
          </div>
        </div>
      </HRDrawer>
    </HRPage>
  )
}

export default function LeaveManagement(props) {
  return <HrLiveBoundary module="leave" legacy={<LegacyLeaveManagement {...props} />} />
}
