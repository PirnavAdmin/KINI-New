import { useEffect, useMemo, useRef, useState } from 'react'
import useAddIntent from '@features/hr/hooks/useAddIntent'
import {
  CalendarCheck, UserCheck, UserX, Clock4, Home, CalendarDays, Download, PlusCircle, History, TrendingUp,
  CheckCircle2,
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
import HRMiniBars from '@features/hr/components/HRMiniBars'
import HRDataTable from '@features/hr/components/HRDataTable'
import { HRSection, HRAvatar, HRStatusBadge } from '@features/hr/components/hrPrimitives'
import { exportCSV } from '@features/hr/components/hrExport'
import employeeAttendanceService from '@shared/services/employeeAttendanceService'
import { getApiErrorMessage } from '@shared/services/apiServices'
import {
  HR_ATTENDANCE_LOG, HR_ATTENDANCE_HEATMAP, HR_ATTENDANCE_TREND,
  HR_ATTENDANCE_MONTHLY, HR_ATTENDANCE_CORRECTIONS, HR_LEAVE_REQUESTS,
} from '@features/hr/data/hrTime'

const STATUS_BADGE = {
  present: 'success', late: 'warning', absent: 'danger', 'on-leave': 'pending', wfh: 'active',
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const pick = (row, ...keys) => keys.map((key) => row?.[key]).find((value) => value !== undefined && value !== null && value !== '')
const nestedEmployee = (row) => row?.employee ?? row?.Employee ?? row?.user ?? row?.User ?? {}
const employeeName = (row) => {
  const employee = nestedEmployee(row)
  return pick(
    row,
    'employeeName', 'EmployeeName', 'fullName', 'FullName', 'name', 'Name',
  ) || pick(employee, 'fullName', 'FullName', 'name', 'Name') || [
    pick(employee, 'firstName', 'FirstName'),
    pick(employee, 'lastName', 'LastName'),
  ].filter(Boolean).join(' ')
}
const attendanceTime = (value) => {
  if (!value) return '—'
  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) return new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit' }).format(parsed)
  return String(value).slice(0, 5)
}
const liveAttendanceRow = (row, index) => {
  const employee = nestedEmployee(row)
  const checkInValue = pick(row, 'checkIn', 'checkInTime', 'CheckIn', 'CheckInTime', 'checkedInAt', 'CheckedInAt')
  const checkOutValue = pick(row, 'checkOut', 'checkOutTime', 'CheckOut', 'CheckOutTime', 'checkedOutAt', 'CheckedOutAt')
  const checkInDate = checkInValue ? new Date(checkInValue) : null
  const checkOutDate = checkOutValue ? new Date(checkOutValue) : null
  const calculatedHours = checkInDate && checkOutDate && !Number.isNaN(checkInDate.getTime()) && !Number.isNaN(checkOutDate.getTime())
    ? Math.max(0, (checkOutDate - checkInDate) / 36e5).toFixed(1)
    : '0'
  const rawStatus = String(pick(row, 'status', 'attendanceStatus', 'Status') || (checkInValue ? 'present' : 'absent')).toLowerCase()
  return {
    ...row,
    id: pick(row, 'id', 'attendanceId', 'employeeAttendanceId', 'AttendanceId') || pick(employee, 'employeeId', 'EmployeeId', 'id', 'Id') || `LIVE-${index}`,
    employee: employeeName(row) || `Team member ${index + 1}`,
    dept: pick(row, 'departmentName', 'DepartmentName', 'department', 'Department', 'dept', 'roleName', 'role')
      || pick(employee, 'departmentName', 'DepartmentName', 'department', 'Department', 'roleName', 'role')
      || 'Unassigned',
    checkIn: attendanceTime(checkInValue),
    checkOut: attendanceTime(checkOutValue),
    hours: String(pick(row, 'workingHours', 'hours', 'totalHours') ?? calculatedHours),
    shift: pick(row, 'shiftName', 'shift') || 'General',
    status: rawStatus === 'working' ? 'present' : rawStatus.replaceAll(' ', '-'),
    wfh: Boolean(pick(row, 'isWorkFromHome', 'IsWorkFromHome', 'wfh', 'WFH')),
  }
}

export default function AttendanceManagement() {
  // KINI HRMS RBAC — corrections, reviews and exports follow the HR level.
  const { can } = useHrPermissions()
  const [corrections, setCorrections] = useState(HR_ATTENDANCE_CORRECTIONS)
  const [formOpen, setFormOpen] = useState(false)
  const [reviewRow, setReviewRow] = useState(null)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [attendanceLog, setAttendanceLog] = useState(HR_ATTENDANCE_LOG)
  const [attendanceSource, setAttendanceSource] = useState('loading')
  const [attendanceError, setAttendanceError] = useState('')
  const attendanceLogRef = useRef(null)
  useAddIntent(() => setFormOpen(true))
  const pageSearch = usePageSearch()
  const filteredLog = useMemo(() => attendanceLog.filter(pageSearch.matches), [attendanceLog, pageSearch.matches])
  const liveStats = useMemo(() => attendanceLog.reduce((totals, row) => {
    const key = row.status === 'on-leave' ? 'onLeave' : row.status
    if (key in totals) totals[key] += 1
    totals.total += 1
    return totals
  }, { present: 0, late: 0, absent: 0, onLeave: 0, wfh: 0, total: 0 }), [attendanceLog])
  const focusAttendanceLog = (status = '') => {
    pageSearch.setSearch(status)
    window.requestAnimationFrame(() => attendanceLogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  useEffect(() => {
    let active = true
    const params = { date: new Date().toISOString().slice(0, 10), pageSize: 1000 }
    employeeAttendanceService.report(params)
      .catch(() => employeeAttendanceService.list(params))
      .then((rows) => {
        if (!active) return
        const liveRows = rows.map(liveAttendanceRow)
        if (liveRows.length) {
          setAttendanceLog(liveRows)
          setAttendanceSource('live')
        } else {
          setAttendanceLog([])
          setAttendanceSource('empty')
        }
      })
      .catch((error) => {
        if (!active) return
        setAttendanceError(getApiErrorMessage(error, 'Live attendance could not be loaded.'))
        setAttendanceLog([])
        setAttendanceSource('error')
      })
    return () => { active = false }
  }, [])

  const logColumns = [
    {
      accessor: 'employee', header: 'Employee', sortable: true, minWidth: 200,
      render: (row) => (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            setSelectedEmployee(row)
          }}
          className="flex items-center gap-3 text-left transition-opacity hover:opacity-80"
          aria-label={`View attendance details for ${row.employee}`}
        >
          <HRAvatar name={row.employee} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 transition-colors hover:text-[#0f55f7] dark:text-white">{row.employee}</p>
            <p className="truncate text-[11px] text-slate-400">{row.dept}</p>
          </div>
        </button>
      ),
    },
    { accessor: 'checkIn', header: 'Check In', sortable: true, render: (row) => <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{row.checkIn}</span> },
    { accessor: 'checkOut', header: 'Check Out', sortable: true, render: (row) => <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{row.checkOut}</span> },
    { accessor: 'hours', header: 'Hours', sortable: true, render: (row) => (
      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{row.hours}h</span>
    )},
    { accessor: 'shift', header: 'Shift', sortable: true, render: (row) => <span className="text-xs text-slate-500">{row.shift}</span> },
    { accessor: 'status', header: 'Status', sortable: true, render: (row) => <HRStatusBadge status={STATUS_BADGE[row.status]} label={row.status} /> },
  ]

  const correctionColumns = [
    { accessor: 'employee', header: 'Employee', sortable: true, render: (row) => <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{row.employee}</span> },
    { accessor: 'date', header: 'Date', sortable: true, render: (row) => <span className="text-xs text-slate-500">{row.date}</span> },
    { accessor: 'request', header: 'Request', sortable: true, minWidth: 200, render: (row) => <span className="text-xs text-slate-600 dark:text-slate-300">{row.request}</span> },
    { accessor: 'current', header: 'Current', sortable: true, render: (row) => <span className="text-xs font-medium text-slate-500">{row.current}</span> },
    { accessor: 'requested', header: 'Requested', sortable: true, render: (row) => <span className="text-xs font-bold text-[#0f55f7]">{row.requested}</span> },
    { accessor: 'status', header: 'Status', sortable: true, render: (row) => <HRStatusBadge status={row.status} /> },
    { accessor: 'id', header: 'Actions', sortable: false, sticky: 'right', width: 100, render: (row) => (
      row.status === 'pending' && can('attendance', 'approve') ? (
        <Button variant="secondary" size="xs" icon={History} onClick={() => setReviewRow(row)}>Review</Button>
      ) : <span className="text-[11px] text-slate-400">—</span>
    )},
  ]

  return (
    <HRPage
      moduleId="attendance"
      title="Attendance"
      subtitle="Live presence, heatmaps, monthly summaries and correction requests."
      icon={CalendarCheck}
      lastUpdated={attendanceSource === 'live' ? `Live · ${new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit' }).format(new Date())}` : 'Demo attendance data'}
      search={{ value: pageSearch.search, onChange: pageSearch.setSearch, placeholder: 'Search attendance…' }}
      actions={
        <HRQuickActions
          can={can}
          actions={[
            { key: 'export', label: 'Export Report', icon: Download, permission: ['attendance', 'export'], onClick: () => {
              exportCSV({
                filename: 'attendance-log',
                headers: ['Employee', 'Department', 'Check In', 'Check Out', 'Hours', 'Shift', 'Status'],
                rows: attendanceLog.map((r) => [r.employee, r.dept, r.checkIn, r.checkOut, r.hours, r.shift, r.status]),
              })
              toast.success('Attendance log exported to Excel')
            } },
            { key: 'correction', label: 'New Correction', icon: PlusCircle, variant: 'primary', permission: ['attendance', 'add'], onClick: () => setFormOpen(true) },
          ]}
        />
      }
    >
      <div className="mb-2 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
        <StatsCard compact icon={UserCheck} value={liveStats.present} label="Present" accentColor="#06b6a8" onClick={() => focusAttendanceLog('present')} />
        <StatsCard compact icon={Clock4} value={liveStats.late} label="Late" accentColor="#F59E0B" onClick={() => focusAttendanceLog('late')} />
        <StatsCard compact icon={UserX} value={liveStats.absent} label="Absent" accentColor="#EF4444" onClick={() => focusAttendanceLog('absent')} />
        <StatsCard compact icon={CalendarDays} value={liveStats.onLeave} label="On Leave" accentColor="#8b5cf6" onClick={() => focusAttendanceLog('on-leave')} />
        <StatsCard compact icon={Home} value={liveStats.wfh} label="WFH" accentColor="#0f55f7" onClick={() => focusAttendanceLog('wfh')} />
        <StatsCard compact icon={CalendarCheck} value={Math.round(((liveStats.present + liveStats.late + liveStats.wfh) / Math.max(liveStats.total, 1)) * 100)} suffix="%" label="Presence Rate" accentColor="#10b981" onClick={() => focusAttendanceLog()} />
      </div>

      <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
        {/* Live log */}
        <div ref={attendanceLogRef} className="scroll-mt-4 lg:col-span-2">
          <HRSection title="Today's Live Log" subtitle={attendanceSource === 'live' ? 'Synced from daily check-in / check-out' : attendanceError || 'Waiting for today’s attendance'} icon={CalendarCheck} className="h-full" padding="p-3.5">
          <HRDataTable
            columns={logColumns}
            data={filteredLog}
            searchable={false}
            pageSize={6}
            exportFileName="attendance-log"
            exportTitle="Today's Attendance Log"
            exportable={can('attendance', 'export')}
            onRowClick={(row) => setSelectedEmployee(row)}
          />
          </HRSection>
        </div>

        {/* Heatmap */}
        <HRSection title="Attendance Heatmap" subtitle={HR_ATTENDANCE_HEATMAP.month} icon={CalendarDays} padding="p-3.5">
          <div className="overflow-x-auto">
            <div className="min-w-[260px]">
              {HR_ATTENDANCE_HEATMAP.weeks.map((week, w) => (
                <div key={w} className="mb-1.5 flex items-center gap-1.5">
                  <span className="w-8 shrink-0 text-[10px] font-bold text-slate-400">{DAY_LABELS[w]}</span>
                  {week.map((value, d) => {
                    const meta = HR_ATTENDANCE_HEATMAP.legend.find((l) => l.key === value)
                    return (
                      <span
                        key={d}
                        className="flex h-8 flex-1 items-center justify-center rounded-md text-[9px] font-bold text-white shadow-sm"
                        style={{ backgroundColor: meta?.color || '#e2e8f0', opacity: value === 0 ? 0.35 : 1 }}
                        title={meta?.label || 'Off'}
                      >
                        {value === 0 ? '' : value}
                      </span>
                    )
                  })}
                </div>
              ))}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {HR_ATTENDANCE_HEATMAP.legend.map((l) => (
                  <span key={l.key} className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: l.color }} />{l.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly summary */}
          <div className="mt-4 rounded-2xl bg-slate-50/70 p-3 dark:bg-slate-800/40">
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
              <TrendingUp className="h-3 w-3" /> Monthly Summary
            </p>
            <div className="grid grid-cols-5 gap-1.5 text-center">
              {HR_ATTENDANCE_MONTHLY.map((item) => (
                <div key={item.label} className="rounded-lg bg-white px-1 py-1.5 shadow-sm dark:bg-slate-800">
                  <p className="text-sm font-extrabold text-slate-800 dark:text-white">{item.count}</p>
                  <p className="text-[9px] font-semibold text-slate-400">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </HRSection>
      </div>

      {/* Trend + corrections */}
      <div className="mt-2 grid grid-cols-1 gap-2 lg:grid-cols-3">
        <HRSection title="Attendance Trend" subtitle="Present vs late, this week" icon={TrendingUp} padding="p-4">
          <HRMiniBars
            data={HR_ATTENDANCE_TREND.map((d) => ({ label: d.day, value: d.present }))}
            color="#06b6a8"
            barHeight="h-36"
            valueFormatter={(v) => v}
          />
          <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/40">
            <span className="text-[11px] font-semibold text-slate-500">Late arrivals (avg)</span>
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
              {Math.round(HR_ATTENDANCE_TREND.reduce((s, d) => s + d.late, 0) / HR_ATTENDANCE_TREND.length)}/day
            </span>
          </div>
        </HRSection>

        <HRSection title="Correction Requests" subtitle="Pending and recent approvals" icon={History} className="lg:col-span-2" padding="p-4">
          <HRDataTable
            columns={correctionColumns}
            data={corrections}
            searchPlaceholder="Search corrections…"
            pageSize={5}
            exportFileName="attendance-corrections"
            exportTitle="Attendance Corrections"
            exportable={can('attendance', 'export')}
          />
        </HRSection>
      </div>

      {/* Employee attendance profile */}
      <HRDrawer
        open={Boolean(selectedEmployee)}
        onClose={() => setSelectedEmployee(null)}
        title={selectedEmployee?.employee || 'Attendance Details'}
        subtitle={selectedEmployee ? `${selectedEmployee.dept} · ${selectedEmployee.shift} shift` : undefined}
        icon={CalendarCheck}
        accent="#06b6a8"
        width="max-w-[520px]"
        footer={
          <div className="flex justify-end">
            <Button variant="secondary" size="sm" onClick={() => setSelectedEmployee(null)}>Close</Button>
          </div>
        }
      >
        {selectedEmployee && (() => {
          const leave = HR_LEAVE_REQUESTS.find((item) => item.employee === selectedEmployee.employee)
          const correction = corrections.find((item) => item.employee === selectedEmployee.employee)
          const monthly = {
            present: selectedEmployee.status === 'absent' ? 18 : 21,
            late: selectedEmployee.status === 'late' ? 4 : 1,
            leave: selectedEmployee.status === 'on-leave' ? Math.max(1, leave?.days || 1) : (leave?.status === 'approved' ? leave.days : 0),
            wfh: selectedEmployee.wfh ? 4 : 2,
          }
          const workingDays = monthly.present + monthly.late + monthly.leave + monthly.wfh
          const attendanceRate = Math.round(((monthly.present + monthly.late + monthly.wfh) / Math.max(workingDays, 1)) * 100)

          return (
            <div className="space-y-3.5">
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-cyan-50/60 p-4 dark:border-emerald-500/20 dark:from-emerald-500/10 dark:to-cyan-500/5">
                <HRAvatar name={selectedEmployee.employee} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-extrabold text-slate-900 dark:text-white">{selectedEmployee.employee}</p>
                  <p className="text-xs text-slate-500">{selectedEmployee.dept} · Today</p>
                  <div className="mt-1.5"><HRStatusBadge status={STATUS_BADGE[selectedEmployee.status]} label={selectedEmployee.status} /></div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-extrabold text-slate-900 dark:text-white">{selectedEmployee.hours}h</p>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Worked</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  ['Check in', selectedEmployee.checkIn],
                  ['Check out', selectedEmployee.checkOut],
                  ['Shift', selectedEmployee.shift],
                  ['Work mode', selectedEmployee.wfh ? 'Work from home' : 'Office'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-800/40">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
                    <p className="mt-0.5 text-sm font-bold text-slate-800 dark:text-slate-100">{value}</p>
                  </div>
                ))}
              </div>

              <section className="rounded-2xl border border-slate-100 p-3.5 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">August attendance</h3>
                    <p className="text-[11px] text-slate-400">Monthly attendance breakdown</p>
                  </div>
                  <span className="text-lg font-extrabold text-emerald-600">{attendanceRate}%</span>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                  {[
                    ['Present', monthly.present, '#10b981'],
                    ['Late', monthly.late, '#f59e0b'],
                    ['WFH', monthly.wfh, '#0f55f7'],
                    ['Leave', monthly.leave, '#8b5cf6'],
                  ].map(([label, value, color]) => (
                    <div key={label} className="rounded-xl bg-slate-50 px-1.5 py-2 dark:bg-slate-800/50">
                      <p className="text-base font-extrabold" style={{ color }}>{value}</p>
                      <p className="text-[9px] font-semibold text-slate-400">{label}</p>
                    </div>
                  ))}
                </div>
              </section>

              {leave && (
                <section className="rounded-2xl border border-violet-100 bg-violet-50/60 p-3.5 dark:border-violet-500/20 dark:bg-violet-500/10">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Leave information</h3>
                      <p className="mt-1 text-xs font-semibold text-violet-700 dark:text-violet-300">{leave.type} · {leave.dates} · {leave.days} day{leave.days > 1 ? 's' : ''}</p>
                    </div>
                    <HRStatusBadge status={leave.status} label={leave.status} />
                  </div>
                  <p className="mt-2 rounded-xl bg-white/70 px-3 py-2 text-xs leading-5 text-slate-600 dark:bg-slate-900/30 dark:text-slate-300">
                    <span className="font-bold">Reason:</span> {leave.reason}
                  </p>
                </section>
              )}

              {correction && (
                <section className="rounded-2xl border border-amber-100 bg-amber-50/60 p-3.5 dark:border-amber-500/20 dark:bg-amber-500/10">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Attendance correction</h3>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{correction.date} · {correction.request}</p>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-500">{correction.current} → <strong>{correction.requested}</strong></span>
                    <HRStatusBadge status={correction.status} label={correction.status} />
                  </div>
                </section>
              )}
            </div>
          )
        })()}
      </HRDrawer>

      {/* New correction form */}
      <HREntityForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="New Correction"
        subtitle="Request an attendance log correction"
        icon={History}
        accent="#0f55f7"
        saveLabel="Submit Request"
        fields={[
          { key: 'employee', label: 'Employee', type: 'text', required: true, placeholder: 'Employee name' },
          { key: 'date', label: 'Date', type: 'date', required: true },
          { key: 'request', label: 'Request', type: 'textarea', required: true, placeholder: 'What needs to be corrected?' },
          { key: 'current', label: 'Current Value', type: 'text', required: true, placeholder: 'e.g. Absent' },
          { key: 'requested', label: 'Requested Value', type: 'text', required: true, placeholder: 'e.g. Present' },
        ]}
        onSave={(values) => {
          const id = `CR-${String(corrections.length + 1).padStart(2, '0')}`
          setCorrections((prev) => [{
            id,
            employee: values.employee,
            date: values.date,
            request: values.request,
            current: values.current,
            requested: values.requested,
            status: 'pending',
          }, ...prev])
          toast.success('Correction request submitted')
        }}
      />

      {/* Review correction drawer */}
      <HRDrawer
        open={Boolean(reviewRow)}
        onClose={() => setReviewRow(null)}
        title={`Review Correction ${reviewRow?.id || ''}`}
        subtitle={reviewRow?.employee}
        icon={History}
        accent="#0f55f7"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => {
              setCorrections((prev) => prev.map((c) => (c.id === reviewRow?.id ? { ...c, status: 'rejected' } : c)))
              toast.success(`Correction ${reviewRow?.id} rejected`)
              setReviewRow(null)
            }}>Reject</Button>
            <Button variant="primary" size="sm" icon={CheckCircle2} onClick={() => {
              setCorrections((prev) => prev.map((c) => (c.id === reviewRow?.id ? { ...c, status: 'approved' } : c)))
              toast.success(`Correction ${reviewRow?.id} approved`)
              setReviewRow(null)
            }}>Approve</Button>
          </div>
        }
      >
        {reviewRow && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Employee', reviewRow.employee],
                ['Date', reviewRow.date],
                ['Current', reviewRow.current],
                ['Requested', reviewRow.requested],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-slate-100 px-3 py-2.5 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase text-slate-400">{label}</p>
                  <p className="mt-0.5 truncate text-xs font-bold text-slate-800 dark:text-slate-200">{value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5 text-xs leading-5 text-slate-600 dark:bg-slate-800/40 dark:text-slate-300">
              {reviewRow.request}
            </div>
            <p className="rounded-xl bg-amber-50 px-3 py-2.5 text-[11px] font-semibold text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
              Approving updates the daily log instantly; the employee is notified.
            </p>
          </div>
        )}
      </HRDrawer>
    </HRPage>
  )
}
