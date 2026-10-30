import { useEffect, useMemo, useRef, useState } from 'react'
import useAddIntent from '@features/hr/hooks/useAddIntent'
import {
  ClipboardCheck, CalendarDays, Clock, CheckCircle2, XCircle, Check, X, Plus, TrendingUp, FileText, Eye,
} from 'lucide-react'
import { toast } from 'sonner'
import leaveRequestService from '@shared/services/leaveRequestService'
import { getApiErrorMessage } from '@shared/services/apiServices'
import useHrPermissions from '@features/hr/hooks/useHrPermissions'
import StatsCard from '@shared/components/StatsCard'
import Button from '@shared/components/Button'
import HRPage from '@features/hr/components/HRPage'
import HRQuickActions from '@features/hr/components/HRQuickActions'
import HREntityForm from '@features/hr/components/HREntityForm'
import HRDrawer from '@features/hr/components/HRDrawer'
import usePageSearch from '@features/hr/hooks/usePageSearch'
import HRMiniBars from '@features/hr/components/HRMiniBars'
import HRDataTable from '@features/hr/components/HRDataTable'
import { HRSection, HRAvatar, HRStatusBadge, HRProgressBar } from '@features/hr/components/hrPrimitives'
import {
  HR_LEAVE_TYPES, HR_LEAVE_CALENDAR_EVENTS, HR_LEAVE_STATS,
  HR_LEAVE_DEPT_LOAD, HR_LEAVE_TREND,
} from '@features/hr/data/hrTime'

const REQUEST_BADGE = { pending: 'pending', approved: 'success', rejected: 'danger' }
const DEMO_EMPLOYEE = { name: 'Ananya Rao', role: 'Employee', department: 'Engineering' }
const DEMO_EMPLOYEE_LEAVE_TYPES = HR_LEAVE_TYPES.filter((type) => type.code !== 'PAT')

export default function LeaveManagement() {
  // KINI HRMS RBAC — approvals, requests and exports follow the HR level.
  // ENTERPRISE RBAC — Approve and Reject are independent permissions. Level
  // profiles don't distinguish reject, so a level user may reject whenever they
  // can approve (preserves the existing UX); custom profiles are exact.
  const { can, permissionSource } = useHrPermissions()
  const canApprove = can('leave', 'approve')
  const canReject = can('leave', 'reject') || (permissionSource === 'level' && canApprove)
  const [requests, setRequests] = useState([])
  const [requestsLoading, setRequestsLoading] = useState(true)
  const [actioningId, setActioningId] = useState(null)
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

  const normalizeLeaveRequest = (item = {}) => {
    const startDate = item.startDate ?? item.fromDate ?? item.start
    const endDate = item.endDate ?? item.toDate ?? item.end
    const formatDate = (value) => {
      if (!value) return ''
      const date = new Date(value)
      return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    }
    return {
      id: item.leaveRequestId ?? item.id,
      employee: item.employeeName ?? item.employee?.name
        ?? ([item.employee?.firstName, item.employee?.lastName].filter(Boolean).join(' ')
          || (item.employeeId ? `Employee #${item.employeeId}` : 'Employee')),
      type: item.leaveType ?? item.type ?? 'Leave',
      dates: item.dates ?? (startDate && endDate ? `${formatDate(startDate)} – ${formatDate(endDate)}` : ''),
      days: item.totalDays ?? item.days ?? 1,
      reason: item.reason ?? '',
      status: String(item.status ?? 'pending').trim().toLowerCase(),
    }
  }

  const loadRequests = async () => {
    setRequestsLoading(true)
    try {
      const rows = await leaveRequestService.list()
      setRequests((Array.isArray(rows) ? rows : []).map(normalizeLeaveRequest))
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to load leave requests.'))
    } finally {
      setRequestsLoading(false)
    }
  }

  useEffect(() => {
    queueMicrotask(loadRequests)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateStatus = async (id, status, label) => {
    if (actioningId) return
    setActioningId(id)
    const employeeName = requests.find((r) => r.id === id)?.employee || 'employee'
    try {
      if (status === 'approved') await leaveRequestService.approve(id)
      else await leaveRequestService.reject(id)
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
      toast.success(`Leave ${label.toLowerCase()} for ${employeeName}`)
      loadRequests()
    } catch (error) {
      toast.error(getApiErrorMessage(error, `Unable to ${label.toLowerCase()} leave for ${employeeName}.`))
    } finally {
      setActioningId(null)
    }
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
          {canApprove && row.status === 'pending' && (
            <button
              disabled={actioningId === row.id}
              className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20"
              aria-label="Approve"
              onClick={() => updateStatus(row.id, 'approved', 'approved')}
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          )}
          {canReject && row.status === 'pending' && (
            <button
              disabled={actioningId === row.id}
              className="rounded-lg bg-red-50 p-1.5 text-red-500 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-500/10 dark:hover:bg-red-500/20"
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
    >
      <div className="mb-2 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
        <StatsCard compact icon={ClipboardCheck} value={HR_LEAVE_STATS.totalRequests} label="Total Requests" accentColor="#0f55f7" onClick={() => focusRequests()} />
        <StatsCard compact icon={Clock} value={HR_LEAVE_STATS.pending} label="Pending" accentColor="#F59E0B" onClick={() => focusRequests('pending')} />
        <StatsCard compact icon={CheckCircle2} value={HR_LEAVE_STATS.approvedThisMonth} label="Approved (Month)" accentColor="#06b6a8" onClick={() => focusRequests('approved')} />
        <StatsCard compact icon={XCircle} value={HR_LEAVE_STATS.wfhShare} suffix="%" label="WFH Share" accentColor="#8b5cf6" onClick={() => focusRequests('work from home')} />
        <StatsCard compact icon={CalendarDays} value={HR_LEAVE_STATS.avgDuration} label="Avg Duration" accentColor="#EC4899" onClick={() => focusRequests()} />
        <StatsCard compact icon={TrendingUp} value={HR_LEAVE_TREND[HR_LEAVE_TREND.length - 1].used} label="Used in Aug" accentColor="#10b981" onClick={() => focusRequests()} />
      </div>

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
            loading={requestsLoading}
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
