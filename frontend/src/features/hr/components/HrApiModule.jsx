import { employeeStatusIdOf } from '../services/hrEmployeeDetails'
import { EMPLOYEE_STATUS_OPTIONS, normalizeEmployeeStatus } from '../constants/employeeStatuses'
import { STUDENT_STATUS_OPTIONS } from '../constants/studentStatuses'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { employeeDetailsPath, employeeIdOf } from '../services/hrEmployeeDetails'
import { employeeLeavePath, loadEmployeeLeaveRecords, loadEmployeeLeaveProfile } from '../services/hrEmployeeLeaveData'
import { employeeAttendancePath } from '../services/hrEmployeeAttendanceData'
import { Users, RefreshCw, Plus, Download, GraduationCap, Clock3, UserMinus, CheckCircle2, UserCog, Eye, Pencil, History, Wallet, Trash2, BarChart3, Filter } from 'lucide-react'
import { toast } from 'sonner'
import usePermission from '@shared/hooks/usePermission'
import Button from '@shared/components/Button'
import Modal from '@shared/components/Modal'
import HRPage from './HRPage'
import { HrBreadcrumb, HrHero, HrKpis } from './portal/HrPortalKit'
import HrSummaryKpis from './portal/HrSummaryKpis'
import { heroProps } from './portal/hrHeroes'
import HrCalendarWorkspace from './portal/HrCalendarWorkspace'
import { calendarWindow } from '../services/hrCalendarView'
import HrModuleInsights from './portal/HrModuleInsights'
import { ActionButton, Avatar, EmptyState, FilterCard, FilterField, LiveTable, Pager, PersonCell, RolePill, RowMenu, StatusPill, StatusTabs, TagPill } from './portal/HrLiveKit'
import { formatDay, isoDay } from './portal/hrLiveUtils'
import { exportCSV } from './hrExport'

const MODULE_HEROES = { students: 'Students', employees: 'Employees', attendance: 'Attendance', leave: 'Leave Management', performance: 'Performance', calendar: 'Calendar', announcements: 'Announcements', resources: 'Resources' }
import HRDataTable from './HRDataTable'
import HrApiForm from './HrApiForm'
import useAddIntent from '../hooks/useAddIntent'
import { employeeRoleOptions, fieldLabel, optionsFor } from '../services/hrFormOptions'
import { HrRecord, HrSummary } from './HrApiData'
import { HR_API_MODULES } from '../constants/hrApiModules'
import { HR_API_CONTRACT } from '../services/hrApiContract'
import { hrRequest, hrModuleApi, hrList, hrField, hrText, hrError, downloadHrFile } from '../services/hrApi'
import { loadHrStudentRoster, summarizeHrStudents } from '../services/hrStudentRoster'
import { enrichLeaveEmployeeEmails } from '../services/hrLeaveEmployeeEmails'
import { studentIdOf } from '../services/hrStudentDetails'
import { mentorPhotoLookup, PROFILE_TYPE, toProfileId } from '@shared/services/profilePhotoService'
import { useProfilePhotoLookup } from '@shared/hooks/useProfilePhoto'
import { normalizeCalendar, mergeCalendar, loadCalendarEvents, calendarDate, calendarMappingError, calendarStats as normalizeCalendarStats } from '../services/hrCalendarData'
import { announcementChangedEvent, announcementOptions } from '../services/hrAnnouncementData'
import HrAnnouncementSummary from './HrAnnouncementSummary'
import StudentForm from '@/pages/students/StudentForm'
import { studentsApi } from '@/api/students'
import { loadDashboardList } from '../services/hrDashboardData'

// v23 — table columns, headers and filter copy matching the HR design screens.
const LIVE_COLUMNS = {
  employees: ['fullName', 'email', 'role', 'employmentType', 'status', 'joiningDate'],
  students: ['fullName', 'email', 'courseName', 'batchName', 'mentorName', 'status'],
  attendance: ['employeeName', 'date', 'checkIn', 'checkOut', 'status', 'workingHours'],
  leave: ['employeeName', 'employeeId', 'email', 'leaveType', 'fromDate', 'toDate', 'days', 'reason', 'status'],
  performance: ['employeeName', 'role', 'period', 'performanceScore', 'targetCompletion', 'status'],
  announcements: ['title', 'audience', 'status', 'publishDate', 'expiryDate', 'createdBy'],
}
const COLUMN_HEADERS = { fullName: 'Full Name', employeeName: 'Employee Name', mentorName: 'Mentor', enrollmentDate: 'Enrollment Date', joiningDate: 'Joining Date', workingHours: 'Working Hours', checkIn: 'Check In', checkOut: 'Check Out', fromDate: 'From Date', toDate: 'To Date' }
const STATUS_FALLBACK = { employees: ['ACTIVE', 'ON_LEAVE', 'RESIGNED'], students: ['Active', 'Pending', 'Inactive', 'Completed', 'Rejected'], attendance: ['Present', 'Absent', 'Late', 'On Leave', 'Pending'] }
const FILTER_LABELS = { CourseId: 'Course', BatchId: 'Batch', MentorId: 'Mentor', StartDate: 'Start Date', EndDate: 'End Date', LeaveType: 'Leave Type', PerformanceFilter: 'Performance Filter', FileType: 'Type', UploadedBy: 'Uploaded By' }
const SEARCH_PLACEHOLDERS = { employees: 'Search by name, email or role...', students: 'Search by name, email, or course...', attendance: 'Search by name, email, or employee ID...', leave: 'Search by employee name, email, or employee ID...', performance: 'Search by employee name, email, or ID...', announcements: 'Search announcements by title, content, or keyword...', resources: 'Search resources...' }
const PAGER_LABELS = { employees: 'employees', students: 'students', attendance: 'records', leave: 'requests', performance: 'reviews', announcements: 'announcements' }
const STUDENT_LOOKUPS = { CourseId: ['courseId', 'courseName'], BatchId: ['batchId', 'batchName'], MentorId: ['mentorId', 'mentorName'] }
const DAY_MS = 86400000
// Row History reads the full record (the design has no separate history date range).
const HISTORY_DATES = {}
/** New records in the last 30 days vs the 30 before, from a date field. Null when no dates. */
function growthTrend(rows, ...keys) {
  const now = Date.now()
  let recent = 0, previous = 0, dated = 0
  rows.forEach(row => {
    const time = Date.parse(hrField(row, ...keys) ?? '')
    if (Number.isNaN(time)) return
    dated++
    if (time > now - 30 * DAY_MS) recent++
    else if (time > now - 60 * DAY_MS) previous++
  })
  if (!dated || !rows.length) return null
  const base = rows.length - recent
  const pct = base > 0 ? Math.round((recent / base) * 100) : 0
  return { label: `${pct}%`, dir: pct > 0 ? 'up' : 'flat', note: 'vs last month', previous }
}

const aliases = { email: ['employeeEmail'], fullName: ['employeeName', 'studentName', 'name'], employeeName: ['fullName', 'name', 'employee'], departmentName: ['department'], date: ['attendanceDate'], checkIn: ['checkInTime'], checkOut: ['checkOutTime'] }
const filterOptions = { DepartmentId: 'departmentId', Role: 'role', Status: 'status', LeaveType: 'leaveType', Audience: 'audience', Category: 'category', FileType: 'fileTypes', UploadedBy: 'uploaders', PerformanceFilter: 'performanceFilters' }

export default function HrApiModule({ module }) {
  const navigate = useNavigate()
  const config = HR_API_MODULES[module]
  const api = useMemo(() => hrModuleApi(module), [module])
  const permissions = usePermission()
  // Departments uses the existing Employees permission, matching its route guard.
  const permissionModule = module === 'departments' ? 'employees' : module
  const allowed = permissions.hasPermission(permissionModule) && (!['announcements', 'calendar'].includes(module) || permissions.can(permissionModule, 'view'))
  const canReadEmployees = permissions.hasPermission('employees')
  const calendarIdentity = module === 'calendar' ? permissions.employeeId : null
  const can = action => allowed && permissions.can(permissionModule, action)
  const canReviewLeave = can('approve') || can('edit')
  const [query, setQuery] = useState({})
  const [leaveSearch, setLeaveSearch] = useState('')
  const [page, setPage] = useState(1)
  const [revision, setRevision] = useState(0)
  const [state, setState] = useState({ loading: true, rows: [], extras: {}, options: {} })
  const [dialog, setDialog] = useState(null)
  const [selected, setSelected] = useState(() => new Set())
  const [reviewTab, setReviewTab] = useState('')
  const [studentLookups, setStudentLookups] = useState({ choices: {}, trend: null })
  useAddIntent(() => {
    const operation = `POST ${api.path}${module === 'attendance' ? '/mark' : ''}`
    if (can('add') && (module === 'students' || HR_API_CONTRACT[operation])) setDialog({ kind: 'create' })
  }, { enabled: !permissions.isLoading })
  const [busy, setBusy] = useState(false)
  const [employeeId, setEmployeeId] = useState('')
  const historyDates = HISTORY_DATES
  const actionLock = useRef(false)
  const detailController = useRef(null)
  const detailRequestKey = useRef(null)
  useEffect(() => { if (!dialog) detailRequestKey.current = null }, [dialog])
  const unavailableLeaveBalances = useRef(new Set())
  const resolvedLeaveBalanceIds = useRef(new Map())
  const announcementAuxiliary = useRef(null)
  const calendarGenerated = useRef(null)
  const calendarStatistics = useRef(null)
  const [calendarSourceRevision, setCalendarSourceRevision] = useState(0)
  useEffect(() => () => detailController.current?.abort(), [])
  const definition = HR_API_CONTRACT[`GET ${api.path}`]
  const pageKey = definition.params.some(p => p.name === 'PageNumber') ? 'PageNumber' : 'Page'
  const sizeKey = pageKey === 'PageNumber' ? 'PageSize' : 'Limit'
  // Calendar loads the visible month grid (up to 200 events), so any week of
  // the month is complete, including days that spill into the next month.
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const params = useMemo(() => {
    const requestQuery = module === 'employees'
      ? Object.fromEntries(Object.entries(query).filter(([key]) => key !== 'Role'))
      : query
    if (module === 'announcements') {
      const dates = Object.fromEntries(['StartDate', 'EndDate'].filter(key => requestQuery[key]).map(key => [key, new Date(`${requestQuery[key]}T${key === 'EndDate' ? '23:59:59.999' : '00:00:00'}`).toISOString()]))
      return { ...requestQuery, ...dates, [pageKey]: page, [sizeKey]: 10 }
    }
    if (module !== 'calendar') return { ...requestQuery, [pageKey]: page, [sizeKey]: 10 }
    const { start: from, end: to } = calendarWindow(calendarMonth)
    return { FromDate: from.toISOString(), ToDate: to.toISOString(), ...requestQuery, [pageKey]: 1, [sizeKey]: 200 }
  }, [query, page, pageKey, sizeKey, module, calendarMonth])
  const paramsKey = JSON.stringify(params)
  useEffect(() => {
    if (!allowed || permissions.isLoading) return
    const controller = new AbortController()
    const signal = controller.signal
    const currentParams = JSON.parse(paramsKey)
    const load = async () => {
      setState(current => ({ ...current, loading: true, error: null, ...(module === 'calendar' ? { calendarSources: Object.fromEntries(['events', 'upcoming', 'holidays', 'leaves', 'classes', 'stats'].map(source => [source, 'loading'])) } : {}) }))
      const auxiliaryKey = JSON.stringify([revision, allowed, permissions.isLoading])
      const cached = module === 'announcements' && announcementAuxiliary.current?.key === auxiliaryKey ? announcementAuxiliary.current.value : null
      const generatedKey = JSON.stringify([currentParams.FromDate, currentParams.ToDate, calendarSourceRevision, calendarIdentity])
      const generated = module === 'calendar' && calendarGenerated.current?.key === generatedKey ? calendarGenerated.current.extras : null
      const statsKey = JSON.stringify([revision, calendarIdentity])
      const calendarStats = module === 'calendar' && calendarStatistics.current?.key === statsKey ? calendarStatistics.current.value : null
      const jobs = [
        ['list', () => module === 'students' ? loadHrStudentRoster(api, currentParams, signal) : module === 'calendar' ? loadCalendarEvents(api, currentParams, signal) : api.list(currentParams, signal)],
        ...(!cached && !calendarStats && !['departments', 'students'].includes(module) ? [['summary', () => api.summary(signal)]] : []),
        ...Object.entries(config.extras ?? {}).filter(([name]) => (!generated || name === 'Upcoming events') && (!calendarStats || name !== 'Upcoming events')).map(([name, suffix]) => [name, () => hrRequest('GET', suffix.startsWith('/') ? suffix : `${api.path}/${suffix}`, { signal, params: { ...currentParams, fromDate: currentParams.FromDate, toDate: currentParams.ToDate, date: currentParams.Date } })]),
        ...Object.entries(cached ? {} : config.options ?? {}).map(([name, path]) => [`option:${name}`, () => hrRequest('GET', path, { signal })]),
        // v23 — one wider read (first 200 rows, Status ignored) feeds the tab counts, charts and growth chip.
        ...(['employees', 'leave', 'performance'].includes(module) ? [['analytics', () => module === 'employees' ? loadDashboardList(api, definition, signal) : (() => { const { Status, ...rest } = currentParams; void Status; return api.list({ ...rest, [pageKey]: 1, [sizeKey]: 200 }, signal) })()]] : []),
        ...(['performance', 'leave'].includes(module) && canReadEmployees ? [['employeeLookup', () => loadDashboardList(hrModuleApi('employees'), HR_API_CONTRACT['GET /api/hr/employees'], signal)]] : []),
      ]
      const results = await Promise.allSettled(jobs.map(([, request]) => request()))
      if (signal.aborted) return
      const next = { loading: false, loaded: true, rows: [], extras: {}, options: {}, summary: null, ...cached }
      if (calendarStats) Object.assign(next, calendarStats)
      if (generated) next.extras = Object.fromEntries(Object.entries(generated).map(([label, extra]) => [label, { ...extra }]))
      if (calendarStats) next.extras['Upcoming events'] = { ...calendarStatistics.current.upcoming }
      results.forEach((result, index) => {
        const key = jobs[index][0]
        const error = result.status === 'rejected' ? hrError(result.reason, module) : null
        if (key === 'list') {
          next.rows = hrList(result.value); next.raw = result.value; next.error = error
          if (module === 'calendar') {
            next.raw = { items: result.value ?? [] }
            next.eventsStatus = error ? result.reason?.name === 'CalendarMappingError' ? 'mapping-error' : 'API-error' : null
          }
          if (module === 'students') {
            if (error) {
              next.summaryError = 'Unable to verify student totals. Refresh to try again.'
            } else {
              const roster = next.rows
              // Course / Batch / Mentor filter choices come from the unfiltered roster.
              if (!['CourseId', 'BatchId', 'MentorId', 'Status', 'Search'].some(name => currentParams[name])) {
                const choices = Object.fromEntries(Object.entries(STUDENT_LOOKUPS).map(([param, [idKey, nameKey]]) => {
                  const map = new Map()
                  roster.forEach(row => { const id = hrField(row, idKey); if (id != null && !map.has(String(id))) map.set(String(id), hrText(hrField(row, nameKey) ?? id)) })
                  return [param, [...map].map(([value, label]) => ({ value, label }))]
                }))
                setStudentLookups({ choices, trend: growthTrend(roster, 'enrollmentDate', 'enrolledOn', 'enrolledAt', 'createdAt') })
              }
              next.summary = summarizeHrStudents(roster)
              const totalPages = Math.max(1, Math.ceil(roster.length / 10))
              const currentPage = Math.min(currentParams.PageNumber, totalPages)
              next.raw = { totalCount: roster.length, totalPages }
              next.rows = roster.slice((currentPage - 1) * 10, currentPage * 10)
              if (currentPage !== currentParams.PageNumber) setPage(currentPage)
            }
          }
        }
        else if (key === 'summary') { next.summary = result.value; next.summaryError = error }
        else if (key === 'analytics') { next.analytics = error ? null : hrList(result.value); next.analyticsError = error }
        else if (key === 'employeeLookup') { next.employeeLookup = result.value; next.employeeLookupError = error }
        else if (key.startsWith('option:')) {
          if (error) next.extras[key] = { error }
          else if (key === 'option:options' || key === 'option:filters') Object.assign(next.options, result.value)
          else next.options[key.slice(7)] = result.value
        } else next.extras[key] = { value: result.value, error }
      })
      if (module === 'leave') {
        next.rows = enrichLeaveEmployeeEmails(next.rows, hrList(next.employeeLookup))
      }
      if (module === 'performance') {
        if (next.employeeLookup) next.options.employees = hrList(next.employeeLookup).map(row => ({
          value: employeeStatusIdOf(row) ?? employeeIdOf(row),
          label: hrField(row, 'fullName', 'employeeName', 'name') || [hrField(row, 'firstName'), hrField(row, 'lastName')].filter(Boolean).join(' ') || `Employee ${hrField(row, 'employeeId', 'id')}`,
        })).filter(option => option.value != null)
        if (!optionsFor('role', next.options).length) {
          next.options.roles = [...new Set(hrList(next.employeeLookup).map(row => hrField(row, 'role', 'roleName')).filter(value => typeof value === 'string' && value.trim()))]
        }
      }
      if (module === 'calendar') {
        const sources = []
        next.calendarSources = { events: next.eventsStatus, stats: next.statsStatus ?? (next.summaryError ? 'API-error' : 'success-with-data') }
        try { if (!next.summaryError) next.summary = normalizeCalendarStats(next.summary) } catch (error) { next.summary = null; next.summaryError = calendarMappingError(error, 'Stats'); next.calendarSources.stats = 'mapping-error' }
        next.unavailableTypes = next.error ? ['classes', 'meetings', 'holidays', 'leaves', 'performance'] : []
        try {
          if (!next.error) {
            const events = normalizeCalendar(next.raw)
            sources.push(events)
            next.calendarSources.events = events.length ? 'success-with-data' : 'success-empty'
          }
        } catch (error) { next.error = calendarMappingError(error, 'Events'); next.calendarSources.events = 'mapping-error'; next.unavailableTypes = ['classes', 'meetings', 'holidays', 'leaves', 'performance'] }
        for (const [label, source] of [['Holidays', 'holidays'], ['Employee leaves', 'leaves'], ['Classes', 'classes']]) {
          const extra = next.extras[label]
          next.calendarSources[source] = extra?.status ?? 'API-error'
          if (extra && !extra.error) {
            try {
              const records = normalizeCalendar(extra.value, source)
              sources.push(records)
              next.calendarSources[source] = records.length ? 'success-with-data' : 'success-empty'
            } catch (error) { extra.error = calendarMappingError(error, label); next.calendarSources[source] = 'mapping-error' }
          }
          if (extra) extra.status = next.calendarSources[source]
          if (!extra || extra.error) next.unavailableTypes.push(source)
        }
        next.calendarEvents = mergeCalendar(sources)
        const upcoming = next.extras['Upcoming events']
        next.calendarSources.upcoming = upcoming?.status ?? 'API-error'
        try {
          next.upcoming = upcoming && !upcoming.error ? normalizeCalendar(upcoming.value) : []
          if (upcoming && !upcoming.error) next.calendarSources.upcoming = next.upcoming.length ? 'success-with-data' : 'success-empty'
        } catch (error) { upcoming.error = calendarMappingError(error, 'Upcoming events'); next.upcoming = []; next.calendarSources.upcoming = 'mapping-error' }
        if (upcoming) upcoming.status = next.calendarSources.upcoming
        calendarGenerated.current = { key: generatedKey, extras: Object.fromEntries(Object.entries(next.extras).filter(([label]) => label !== 'Upcoming events').map(([label, extra]) => [label, { ...extra }])) }
        calendarStatistics.current = { key: statsKey, value: { summary: next.summary, summaryError: next.summaryError, statsStatus: next.calendarSources.stats }, upcoming: { ...upcoming } }
      }
      if (module === 'announcements') {
        announcementAuxiliary.current = { key: auxiliaryKey, value: { summary: next.summary, summaryError: next.summaryError, options: next.options, extras: next.extras } }
        if (!next.error && next.raw.page !== currentParams.Page) setPage(next.raw.page)
      }
      setState(next)
    }
    // Debounce backend search and cancel obsolete pages/filters.
    const timer = setTimeout(load, 250)
    return () => { clearTimeout(timer); controller.abort() }
  }, [allowed, permissions.isLoading, calendarIdentity, module, api, config, definition, paramsKey, revision, calendarSourceRevision, canReadEmployees, pageKey, sizeKey])
  const refresh = (includeGenerated = true) => {
    if (module === 'calendar' && includeGenerated) setCalendarSourceRevision(value => value + 1)
    setRevision(value => value + 1)
  }
  const action = async (request, success) => {
    if (actionLock.current) return
    actionLock.current = true
    setBusy(true)
    try { await request(); if (success) toast.success(success) }
    catch (error) { toast.error(hrError(error, module)) }
    finally { actionLock.current = false; setBusy(false) }
  }
  const recordId = row => module === 'employees' ? employeeIdOf(row) : module === 'students' ? studentIdOf(row) : hrField(row, api.idKey, 'id')
  const closeDetail = () => {
    detailController.current?.abort()
    detailRequestKey.current = null
    setDialog(null)
  }
  const showDetail = async (row, edit = false) => {
    const requestKey = `${recordId(row)}:${edit}`
    if (detailRequestKey.current === requestKey && !dialog?.error) return
    detailRequestKey.current = requestKey
    if (dialog?.loading && dialog.id === recordId(row) && dialog.edit === edit) return
    if (module === 'employees' && !edit) {
      const id = employeeIdOf(row)
      if (id == null) { toast.error('This employee has no backend identifier. Refresh the list and try again.'); return }
      navigate(employeeDetailsPath(id))
      return
    }
    if (module === 'students' && !edit) {
      const id = studentIdOf(row)
      if (id == null || id === '') { toast.error('This student has no backend identifier. Refresh the list and try again.'); return }
      navigate(`/employee/students/${encodeURIComponent(id)}`)
      return
    }
    if (module === 'calendar' && row.source && row.source !== 'events') {
      setDialog({ kind: 'view', value: row.raw, generated: true })
      return
    }
    if (module === 'calendar') row = row.raw ?? row
    const id = recordId(row)
    detailController.current?.abort()
    const controller = new AbortController()
    detailController.current = controller
    const pending = { kind: 'detail', edit, value: row, id, loading: true }
    setDialog(pending)
    if (id == null || id === '') {
      setDialog({ ...pending, loading: false, error: 'This record has no employee or record ID. Refresh the list and try again.' })
      return
    }
    try {
      const value = await api.get(id, controller.signal)
      if (controller.signal.aborted) return
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        setDialog({ ...pending, loading: false, error: 'The server returned no record details. Please try again.' })
        return
      }
      setDialog({ kind: edit ? 'edit' : 'view', value, id })
    } catch (error) {
      if (!controller.signal.aborted) setDialog({ ...pending, loading: false, error: hrError(error, module) })
    }
  }
  const mutate = async (request, values) => {
    await request()
    if (['employees', 'leave'].includes(module) && dialog?.kind === 'create') {
      setPage(1)
      setQuery({})
    }
    if (module === 'calendar' && dialog?.kind === 'create' && values?.startDateTime) {
      const date = calendarDate(values.startDateTime)
      setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1))
    }
    if (module === 'announcements') {
      setPage(1); setSelected(new Set())
      if (dialog?.kind === 'create') setQuery({})
      window.dispatchEvent(new Event(announcementChangedEvent))
    }
    setDialog(null); refresh(module !== 'calendar'); toast.success('Changes saved.')
  }
  const history = (id, kind = module) => action(async () => {
    if (kind === 'leave') {
      const result = await loadEmployeeLeaveRecords(id, { readEmployee: canReadEmployees })
      setDialog({ kind: 'view', title: 'Leave history', value: { employeeId: id, items: result.rows } })
      return
    }
    if (kind === 'balance') {
      const controller = new AbortController()
      detailController.current?.abort()
      detailController.current = controller
      const result = await loadEmployeeLeaveProfile(id, { readEmployee: canReadEmployees, signal: controller.signal, unavailableBalances: unavailableLeaveBalances.current, resolvedBalanceIds: resolvedLeaveBalanceIds.current })
      if (!result || controller.signal.aborted) return
      setDialog({ kind: 'view', title: 'Leave balance', value: result.balance ?? { message: result.balanceUnavailable ? 'Leave balance is not available for this employee.' : result.balanceError ?? result.employeeError ?? result.historyError ?? 'Leave balance is not available for this employee.' } })
      return
    }
    const path = kind === 'balance' ? '/api/hr/leave/balance/{employeeId}' : kind === 'enrollments' ? '/api/students/{studentId}/enrollments' : `/api/hr/${kind}/employee/{employeeId}`
    let value
    try { value = await hrRequest('GET', path, { id, params: historyDates }) } catch (error) {
      if (kind === 'balance' && error.response?.status === 404) { setDialog({ kind: 'view', title: 'Leave balance', value: { message: 'Leave balance is not available for this employee.' } }); return }
      throw error
    }
    setDialog({ kind: 'view', title: kind === 'balance' ? 'Leave balance' : `${fieldLabel(kind)} history`, value })
  })
  // v23 — design table: avatars, pills, coloured actions and a ⋮ menu per module.
  const nameOf = row => {
    const value = hrField(row, 'fullName', 'employeeName', 'studentName', 'name')
    return value == null ? [hrField(row, 'firstName'), hrField(row, 'lastName')].filter(Boolean).join(' ') || 'Not supplied' : hrText(value)
  }
  // Profile photos: one batch request for the rows on screen, held in state so
  // the table re-renders when it resolves; each Full Name cell gets its URL as src.
  // The id is the person's numeric profile id — never userId or a code like P10.
  // Leave/attendance rows carry the employee in employeeId (their own id is the
  // leave/attendance record), so only employees/students fall back to id.
  // employeeProfileId: the numeric Employee id requested from the backend for /api/hr/employees (its id is the display code "EMP-009").
  const photoIdFields = module === 'students' ? ['studentId', 'id'] : module === 'employees' ? ['employeeProfileId', 'employeeId', 'id'] : ['employeeProfileId', 'employeeId']
  const photoIdOf = row => photoIdFields.map(field => toProfileId(hrField(row, field))).find(Boolean) ?? null
  // Mentor rows may also carry a mentorId; the batch endpoint takes both id kinds.
  const mentorIdOf = row => (module === 'employees' ? toProfileId(hrField(row, 'mentorId')) : null)
  const photoType = module === 'students' ? PROFILE_TYPE.STUDENT : PROFILE_TYPE.EMPLOYEE
  const { photos: rowPhotos } = useProfilePhotoLookup({
    [photoType === PROFILE_TYPE.STUDENT ? 'studentIds' : 'employeeIds']: state.rows.map(photoIdOf),
    mentorIds: state.rows.map(mentorIdOf),
  })
  const personPhoto = row => ({ avatarSize: module === 'employees' ? 24 : undefined, photoUrl: rowPhotos[`${photoType}-${photoIdOf(row)}`] || rowPhotos[`mentor-${mentorIdOf(row)}`] || '' })
  const plain = (row, key) => { const value = hrField(row, key, ...(aliases[key] ?? [])); return value == null || value === '' ? <span className="hrl-muted">Not supplied</span> : hrText(value) }
  const renderers = {
    fullName: row => <PersonCell name={nameOf(row)} {...personPhoto(row)} profileClickable={module === 'students'} onClick={module === 'employees' || module === 'students' ? () => showDetail(row) : undefined} />,
    employeeName: row => ['leave', 'attendance'].includes(module) ? <PersonCell name={nameOf(row)} {...personPhoto(row)} sub={module === 'leave' ? hrField(row, 'email', 'employeeEmail') : undefined} profileClickable={module === 'attendance'} onClick={hrField(row, 'employeeId') != null && hrField(row, 'employeeId') !== '' ? () => navigate((module === 'attendance' ? employeeAttendancePath : employeeLeavePath)(hrField(row, 'employeeId'))) : undefined} /> : <PersonCell name={nameOf(row)} {...personPhoto(row)} />,
    role: row => <RolePill value={hrField(row, 'role', 'roleName')} />,
    status: row => <StatusPill value={hrField(row, 'status')} variant={module === 'employees' ? 'caps' : module === 'attendance' ? 'box' : 'icon'} />,
    employmentType: row => <TagPill value={hrField(row, 'employmentType', 'employeeType', 'type')} tone="lavender" />,
    courseName: row => <TagPill value={hrField(row, 'courseName', 'course')} tone="blue" />,
    batchName: row => <TagPill value={hrField(row, 'batchName', 'batch')} tone="lavender" />,
    mentorName: row => { const name = hrField(row, 'mentorName', 'mentor', 'trainerName'); return name ? <span className="hrl-person"><Avatar name={hrText(name)} size={26} {...mentorPhotoLookup({ mentorId: hrField(row, 'mentorId', 'trainerId') })} /><span>{hrText(name)}</span></span> : <span className="hrl-muted">Not assigned</span> },
    joiningDate: row => formatDay(hrField(row, 'joiningDate', 'dateOfJoining', 'joinDate', 'hireDate', 'createdAt')) ?? <span className="hrl-muted">Not supplied</span>,
    enrollmentDate: row => formatDay(hrField(row, 'enrollmentDate', 'enrolledOn', 'enrolledAt', 'createdAt', 'registeredOn')) ?? <span className="hrl-muted">—</span>,
    date: row => isoDay(hrField(row, 'date', 'attendanceDate')) ?? '—',
    fromDate: row => isoDay(hrField(row, 'fromDate', 'startDate')) ?? '—',
    toDate: row => isoDay(hrField(row, 'toDate', 'endDate')) ?? '—',
    publishDate: row => formatDay(hrField(row, 'publishDate')) ?? '—',
    expiryDate: row => formatDay(hrField(row, 'expiryDate')) ?? '—',
    audience: row => <TagPill value={hrField(row, 'audience')} tone="purple" />,
    checkOut: row => hrField(row, 'checkOut', 'checkOutTime') ?? <span className="hrl-muted">Not supplied</span>,
    workingHours: row => hrField(row, 'workingHours', 'totalHours', 'hoursWorked') ?? '—',
    days: row => hrField(row, 'days', 'totalDays', 'numberOfDays') ?? '—',
  }
  const tableKeys = LIVE_COLUMNS[module] ?? config.columns
  const columns = tableKeys.map(key => ({ key, header: COLUMN_HEADERS[key] ?? fieldLabel(key), render: renderers[key] ?? (row => plain(row, key)) }))
  if (module === 'leave' && !columns.some(column => column.key === 'email')) {
    columns.splice(1, 0, { key: 'email', header: 'Email', render: row => plain(row, 'email') })
  }
  // v24 — numbered rows on Employees / Students, continuing across pages.
  if (['employees', 'students'].includes(module)) {
    columns.unshift({ key: '__index', header: '#', width: 48, tone: 'lavender', render: row => <span className="hrl-index">{(page - 1) * 10 + state.rows.indexOf(row) + 1}</span> })
  }
  const statusOf = row => String(hrField(row, 'status') ?? '').toLowerCase().trim()
  const rowActions = row => {
    const id = recordId(row)
    if (id == null) return <span className="text-xs text-slate-500">Record ID unavailable</span>
    const canEdit = can('edit') && HR_API_CONTRACT[`PUT ${api.detail}`]
    const canDelete = can('delete') && HR_API_CONTRACT[`DELETE ${api.detail}`]
    const pendingLeave = module === 'leave' && canReviewLeave && ['pending', 'pending approval', 'submitted', 'awaiting approval'].includes(statusOf(row))
    const employee = hrText(hrField(row, 'employeeName', 'fullName', 'name'))
    const menu = []
    const buttons = []
    const loadingLeaveDetails = module === 'leave' && dialog?.kind === 'detail' && dialog.loading && dialog.id === id
    const details = <ActionButton key="details" icon={module === 'attendance' ? Eye : undefined} disabled={busy || loadingLeaveDetails} onClick={() => showDetail(row)}>{loadingLeaveDetails ? 'Loading...' : module === 'leave' ? 'View' : 'Details'}</ActionButton>
    const edit = canEdit && <ActionButton key="edit" tone="blue" icon={['attendance', 'students'].includes(module) ? Pencil : undefined} aria-label={module === 'students' ? 'Edit student' : undefined} title={module === 'students' ? 'Edit student' : undefined} disabled={busy} onClick={() => showDetail(row, true)}>{module === 'students' ? null : 'Edit'}</ActionButton>
    const remove = canDelete && <ActionButton key="delete" tone="red" icon={module === 'students' ? Trash2 : undefined} aria-label={module === 'students' ? 'Delete student' : undefined} title={module === 'students' ? 'Delete student' : undefined} disabled={busy} onClick={() => setDialog({ kind: 'delete', id })}>{module === 'students' ? null : 'Delete'}</ActionButton>
    const historyButton = row.employeeId != null && <ActionButton key="history" icon={module === 'attendance' ? History : undefined} disabled={busy} onClick={() => history(row.employeeId)}>History</ActionButton>
    if (module === 'leave') {
      buttons.push(details)
      if (pendingLeave) {
        buttons.push(<ActionButton key="approve" disabled={busy} onClick={() => setDialog({ kind: 'approve', id, employee })}>Approve</ActionButton>)
        buttons.push(<ActionButton key="reject" tone="red" disabled={busy} onClick={() => setDialog({ kind: 'reject', id, employee })}>Reject</ActionButton>)
        if (row.employeeId != null) menu.push({ label: 'History', icon: History, onClick: () => history(row.employeeId) }, { label: 'Leave balance', icon: Wallet, onClick: () => history(row.employeeId, 'balance') })
      } else {
        if (historyButton) buttons.push(historyButton)
        if (row.employeeId != null) buttons.push(<ActionButton key="balance" disabled={busy} onClick={() => history(row.employeeId, 'balance')}>Balance</ActionButton>)
      }
      if (canEdit) menu.push({ label: 'Edit', icon: Pencil, onClick: () => showDetail(row, true) })
      if (canDelete) menu.push({ label: 'Delete', icon: Trash2, danger: true, onClick: () => setDialog({ kind: 'delete', id }) })
    } else if (module === 'attendance' || module === 'performance') {
      buttons.push(details, edit, historyButton)
      if (canDelete) menu.push({ label: 'Delete', icon: Trash2, danger: true, onClick: () => setDialog({ kind: 'delete', id }) })
    } else {
      buttons.push(...(module === 'students' ? [edit, remove] : [details, edit, remove]))
      if (can('edit') && ['employees', 'students'].includes(module)) {
        const currentStatus = statusOf(row)

        menu.push(module === 'employees'
          ? { label: 'Change Status', icon: UserCog, onClick: () => setDialog({ kind: 'status', id: employeeStatusIdOf(row), value: { status: EMPLOYEE_STATUS_OPTIONS.find(option => option.value === normalizeEmployeeStatus(hrField(row, 'status')))?.value ?? '' } }) }
          : { label: 'Change Status', icon: UserCog, onClick: () => setDialog({ kind: 'status', id, value: { status: STUDENT_STATUS_OPTIONS.find(option => option.value.toLowerCase() === currentStatus)?.value ?? '' } }) })
      }
      if (module === 'resources') {
        menu.push({ label: 'Preview', icon: Eye, onClick: () => action(async () => {
          const response = await hrRequest('GET', `${api.detail}/preview`, { id, binary: true })
          const type = response.data.type?.split(';')[0]
          if (!['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'text/plain'].includes(type)) { downloadHrFile(response, row.name); return }
          setDialog({ kind: 'preview', blob: response.data })
        }) })
        menu.push({ label: 'Download', icon: Download, onClick: () => action(async () => downloadHrFile(await hrRequest('GET', `${api.detail}/download`, { id, binary: true }), row.name)) })
      }
    }
    return <>{buttons.filter(Boolean)}<RowMenu items={menu.map(item => ({ ...item, disabled: busy }))} /></>
  }
  if (permissions.isLoading) return <p role="status">Loading permissions...</p>
  if (!allowed) return <p role="alert">{permissions.error ? hrError(permissions.error) : 'You do not have permission to access this module.'}</p>
  const createOperation = `POST ${api.path}${module === 'attendance' ? '/mark' : ''}`
  const totalCount = hrField(state.raw, 'totalCount', 'totalRecords')
  const totalPages = hrField(state.raw, 'totalPages') ?? (totalCount != null ? Math.ceil(totalCount / 10) : null)
  const moduleActions = <>
    <Button variant="secondary" icon={RefreshCw} disabled={state.loading || busy} onClick={() => { refresh(); toast.success(`${config.title} refreshed.`) }}>Refresh</Button>
    {HR_API_CONTRACT[`GET ${api.path}/export`] && (module !== 'announcements' || can('export')) && <Button variant="secondary" icon={Download} disabled={state.loading || busy} onClick={() => action(async () => { await downloadHrFile(await api.export(params), `${module}.csv`); toast.success(`${config.title} exported successfully.`) })}>Export</Button>}
    {can('add') && (module === 'students' || HR_API_CONTRACT[createOperation]) && <Button icon={Plus} disabled={busy} onClick={() => setDialog({ kind: 'create' })}>{module === 'attendance' ? 'Mark Attendance' : `Add ${config.singular}`}</Button>}
  </>
  // v21 — HR portal hero for every live HR module (art/script per module).
  const heroCrumb = MODULE_HEROES[module]
  const studentHero = heroCrumb ? <>
    <HrBreadcrumb items={[...(['announcements', 'resources'].includes(module) ? [{ label: 'Employee' }] : []), { label: heroCrumb, to: module === 'employees' ? '/employee/hr-employees' : undefined }]} />
    {/* v24 — Employees (image 11) keeps its actions on the table toolbar instead of the hero */}
    <HrHero {...heroProps(module)} actions={module === 'employees' ? undefined : moduleActions} />
  </> : null
  const studentSummary = state.summary?.summary ?? state.summary ?? {}
  const studentTrend = module === 'students' ? studentLookups.trend : null
  const employeeTrend = module === 'employees' && state.analytics ? growthTrend(state.analytics, 'joiningDate', 'dateOfJoining', 'joinDate', 'hireDate', 'createdAt') : null

  // v23 — filter card (search + labelled selects + Reset / Search).
  const setFilter = (name, value) => { setPage(1); setQuery(q => ({ ...q, [name]: value })) }
  const filterParams = definition.params.filter(p => !['Search', 'Page', 'Limit', 'PageNumber', 'PageSize', 'SortBy', 'SortOrder', 'Descending', 'DepartmentId'].includes(p.name) && !(module === 'leave' && p.name === 'Status') && !(module === 'employees' && p.name === 'Role'))
  const hasSearch = definition.params.some(p => p.name === 'Search')
  const filterField = param => {
    const key = filterOptions[param.name]
    let choices = (module === 'employees' && key === 'status' ? EMPLOYEE_STATUS_OPTIONS : module === 'employees' && key === 'role' ? employeeRoleOptions(state.options) : key ? module === 'announcements' ? announcementOptions(key, state.options) : optionsFor(key, state.options) : []).filter(item => key !== 'audience' || item.label !== 'All')
    if (module === 'students' && STUDENT_LOOKUPS[param.name]) choices = studentLookups.choices[param.name] ?? []
    if (module !== 'announcements' && !choices.length && param.name === 'Status' && STATUS_FALLBACK[module]) choices = STATUS_FALLBACK[module].map(value => ({ value, label: value }))
    if (module === 'students' && param.name === 'Status') choices = STUDENT_STATUS_OPTIONS
    const label = FILTER_LABELS[param.name] ?? fieldLabel(param.name)
    const disabled = (module === 'performance' && ['role', 'performanceFilters'].includes(key) || module === 'announcements' && ['audience', 'status'].includes(key)) && !choices.length
    if (choices.length || disabled) return <FilterField key={param.name} label={label}><select aria-label={label} disabled={disabled} value={query[param.name] ?? ''} onChange={e => setFilter(param.name, e.target.value)}><option value="">{module === 'students' && label !== 'Status' ? `All ${label}${label.endsWith('s') ? '' : 'es'.slice(label.endsWith('h') ? 0 : 1)}` : 'All'}</option>{choices.filter(item => String(item.label ?? item.value).trim().toLowerCase() !== 'all').map(item => <option key={item.value} value={item.value}>{item.label ?? item.value}</option>)}</select></FilterField>
    return <FilterField key={param.name} label={label}><input aria-label={label} type={param.format?.startsWith('date') ? 'date' : param.type === 'integer' ? 'number' : 'text'} value={query[param.name] ?? ''} onChange={e => setFilter(param.name, e.target.value)} /></FilterField>
  }
  const resetFilters = () => { setPage(1); setQuery({}); setLeaveSearch(''); setSelected(new Set()) }
  const employeeKpiClick = module === 'employees' ? (key, label = '') => {
    const normalized = `${key} ${label}`.toLowerCase().replace(/[^a-z]/g, '')
    if (normalized.includes('total')) return resetFilters
    if (normalized.includes('mentor')) return () => { setFilter('Role', 'Mentor'); document.querySelector('.hrp-table, .hrl-table, [role="table"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
    if (normalized === 'hr' || normalized.includes('hr') || normalized.includes('humanresource')) return () => { setFilter('Role', 'HR Executive'); document.querySelector('.hrp-table, .hrl-table, [role="table"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
    if (normalized.includes('leave')) return () => navigate('/employee/hr-dashboard')
    return () => {}
  } : undefined
  const performanceExtra = module === 'performance' && <>
    <FilterField label="Employee"><select aria-label="Employee history" value={employeeId} disabled={state.loading || !optionsFor('employeeId', state.options).length} onChange={e => setEmployeeId(e.target.value)}><option value="">Select employee</option>{optionsFor('employeeId', state.options).map(item => <option key={item.value} value={item.value}>{item.label || item.value}</option>)}</select></FilterField>
    <button type="button" className="hrl-btn is-soft" disabled={!employeeId || busy} onClick={() => history(employeeId)}><History aria-hidden="true" />Employee history</button>
    <button type="button" className="hrl-btn is-soft" disabled={!state.summary} onClick={() => setDialog({ kind: 'view', title: 'Performance summary', value: state.summary })}><BarChart3 aria-hidden="true" />Performance summary</button>
  </>

  // v23 — status tabs (Leave: server filter; Performance: counts from the review list).
  const countStatus = (rows, status) => rows.filter(row => statusOf(row) === status).length
  const analyticsRows = state.analytics ?? null
  const tabs = module === 'leave' ? [
    { value: '', label: 'All Requests', count: analyticsRows?.length },
    { value: 'Pending', label: 'Pending', count: analyticsRows && countStatus(analyticsRows, 'pending') },
    { value: 'Approved', label: 'Approved', count: analyticsRows && countStatus(analyticsRows, 'approved') },
    { value: 'Rejected', label: 'Rejected', count: analyticsRows && countStatus(analyticsRows, 'rejected') },
  ] : module === 'performance' ? [
    { value: '', label: 'All Reviews' },
    { value: 'pending', label: 'Pending', count: countStatus(analyticsRows ?? state.rows, 'pending') },
    { value: 'approved', label: 'Approved', count: countStatus(analyticsRows ?? state.rows, 'approved') },
    { value: 'rejected', label: 'Rejected', count: countStatus(analyticsRows ?? state.rows, 'rejected') },
  ] : null
  const tabValue = module === 'leave' ? (query.Status ?? '') : reviewTab
  const onTab = value => { if (module === 'leave') setFilter('Status', value); else setReviewTab(value) }
  const normalizedRole = value => String(value ?? '').trim().toLowerCase().replace(/[\s_-]+/g, '')
  const visibleRows = module === 'employees'
    ? state.rows.filter(row => {
      const selectedRole = query.Role ?? ''
      if (!selectedRole) return true
      const actualRole = normalizedRole(hrField(row, 'role', 'roleName', 'designation'))
      const requestedRole = normalizedRole(selectedRole)
      return requestedRole === 'hr'
        ? actualRole === 'hr' || actualRole === 'hrexecutive'
        : actualRole === requestedRole
    })
    : module === 'performance' && reviewTab ? state.rows.filter(row => statusOf(row) === reviewTab) : state.rows
  const selectedRows = visibleRows.filter(row => selected.has(recordId(row)))
  const exportSelected = () => {
    if (module === 'announcements' && !can('export')) return
    exportCSV({ filename: `${module}-selected`, headers: columns.map(column => column.header), rows: selectedRows.map(row => tableKeys.map(key => { const value = hrField(row, key, ...(aliases[key] ?? [])); return value == null ? '' : hrText(value) })) })
    toast.success(`${config.title} exported successfully.`)
    toast.success(`Exported ${selectedRows.length} ${selectedRows.length === 1 ? 'record' : 'records'}.`)
  }
  const emptyTitle = module === 'performance' ? 'No performance reviews found' : module === 'announcements' ? 'No announcements found' : `No ${config.title.toLowerCase()} records found`
  const emptyText = module === 'announcements' ? 'Try adjusting your search or filters, or create a new announcement to get started.' : module === 'performance' ? (Object.values(query).some(Boolean) ? 'No reviews match these filters. Clear the filters to see all reviews.' : 'Employee totals come from the directory. Performance scores appear after reviews are added.') : 'Try adjusting your search or filters.'
  const emptyAction = ['performance', 'announcements'].includes(module) && can('add') ? <button type="button" className="hrl-btn is-orange" onClick={() => setDialog({ kind: 'create' })}><Plus aria-hidden="true" />{module === 'announcements' ? 'Add Your First Announcement' : 'Add first review'}</button> : undefined
  // Keep previous employee results visible during background searches.
  const visualLoading = state.loading && !(['employees', 'leave'].includes(module) && state.loaded)
  const paged = definition.params.some(p => p.name === pageKey)

  const dialogs = <>
    {['detail', 'view'].includes(dialog?.kind) && !(module === 'leave' && dialog.kind === 'detail' && dialog.loading && !dialog.edit) && <Modal open size="lg" motionPreset={module === 'leave' ? 'rise' : 'default'} title={dialog.title ?? (dialog.edit ? `Edit ${config.singular}` : `${config.singular} details`)} onClose={closeDetail}>
      {dialog.kind === 'view' ? <HrRecord value={dialog.value} /> : <>
        {dialog.loading ? <p role="status">Loading {config.singular.toLowerCase()} details...</p> : <div className="space-y-3"><p role="alert" className="text-red-700">{dialog.error}</p><Button variant="secondary" onClick={() => showDetail(dialog.value, dialog.edit)}>Retry</Button></div>}
        {!dialog.edit && <div className="mt-4"><p className="mb-2 text-sm text-slate-500">Information from the list</p><HrRecord value={dialog.value} /></div>}
      </>}
      {dialog.kind === 'view' && module === 'calendar' && !dialog.generated && dialog.id != null && <div className="mt-4 flex gap-2">{can('edit') && <Button onClick={() => setDialog({ ...dialog, kind: 'edit' })}>Edit</Button>}{can('delete') && <Button variant="secondary" onClick={() => setDialog({ kind: 'delete', id: dialog.id })}>Delete</Button>}</div>}
    </Modal>}
    {dialog?.kind === 'preview' && <HrPreview blob={dialog.blob} onClose={() => setDialog(null)} />}
    {module === 'students' && dialog?.kind === 'create' && can('add') && <StudentForm open onClose={() => setDialog(null)} onSave={async values => { await studentsApi.create(values); setQuery({}); setPage(1); refresh(); toast.success('Student added successfully.') }} />}
    {['create', 'edit', 'status', 'reject'].includes(dialog?.kind) && !(module === 'students' && dialog.kind === 'create') && <HrApiForm key={`${dialog.kind}-${dialog.id ?? 'new'}`} title={dialog.kind === 'status' && ['employees', 'students'].includes(module) ? 'Change Status' : dialog.kind === 'create' ? `Add ${config.singular}` : `${fieldLabel(dialog.kind)} ${config.singular}`} values={dialog.value} options={state.options} operation={dialog.kind === 'create' ? createOperation : dialog.kind === 'edit' ? `PUT ${api.detail}` : dialog.kind === 'status' ? `PATCH ${api.detail}/status` : `PUT ${api.detail}/reject`} onClose={() => setDialog(null)} onSave={data => mutate(() => dialog.kind === 'create' ? api.create(data) : dialog.kind === 'edit' ? api.update(dialog.id, data) : dialog.kind === 'status' ? api.status(dialog.id, data.status) : hrRequest('PUT', `${api.detail}/reject`, { id: dialog.id, data }), data)} />}
    {['delete', 'approve'].includes(dialog?.kind) && <Modal open trapFocus title={`${fieldLabel(dialog.kind)} ${config.singular}`} onClose={() => { if (!busy) setDialog(null) }}><p className="mb-4">{dialog.kind === 'delete' ? (module === 'calendar' ? 'Are you sure you want to delete this event?' : 'Delete this record? This action cannot be undone.') : `Approve leave request #${dialog.id} for ${dialog.employee}?`}</p><div className="hrl-confirm-actions" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: module === 'announcements' ? 24 : 16, paddingTop: 12 }}><Button className="min-w-24" variant="secondary" disabled={busy} onClick={() => setDialog(null)}>Cancel</Button><Button className="min-w-24" variant={dialog.kind === 'delete' ? 'danger' : 'primary'} disabled={busy} onClick={() => action(() => mutate(() => dialog.kind === 'delete' ? api.remove(dialog.id) : hrRequest('PUT', `${api.detail}/approve`, { id: dialog.id })))}>{busy ? 'Saving...' : 'Confirm'}</Button></div></Modal>}
  </>
  if (module === 'calendar') {
    const calendarEventId = row => hrField(row.raw ?? row, 'eventId', 'id')
    const sourceErrors = [
      ...(state.error ? [{ label: 'Events', message: state.error }] : []),
      ...Object.entries(state.extras ?? {}).filter(([label, extra]) => label !== 'Upcoming events' && extra?.error).map(([label, extra]) => ({ label, message: extra.error })),
      ...(state.summaryError ? [{ label: 'Monthly totals', message: state.summaryError }] : []),
    ]
    return <>
      <HrCalendarWorkspace
        events={state.calendarEvents ?? []}
        loading={state.loading}
        sourceErrors={sourceErrors}
        unavailableTypes={state.unavailableTypes ?? []}
        upcoming={state.upcoming ?? []}
        monthTotal={state.summaryError ? null : state.summary?.eventsThisMonth ?? null}
        month={calendarMonth}
        onMonthChange={setCalendarMonth}
        canAdd={Boolean(can('add') && HR_API_CONTRACT[createOperation])}
        canEdit={Boolean(can('edit') && HR_API_CONTRACT[`PUT ${api.detail}`])}
        canDelete={Boolean(can('delete') && HR_API_CONTRACT[`DELETE ${api.detail}`])}
        // A clicked or dragged slot pre-fills the existing Add Event form.
        onCreate={({ start, end, allDay }) => setDialog({ kind: 'create', value: allDay
          ? { startDateTime: start.toISOString(), endDateTime: new Date(start.getFullYear(), start.getMonth(), start.getDate(), 23, 59).toISOString(), allDay: true }
          : { startDateTime: start.toISOString(), endDateTime: end.toISOString(), allDay: false } })}
        onEdit={row => showDetail(row, true)}
        onDelete={row => setDialog({ kind: 'delete', id: calendarEventId(row) })}
        onRefresh={() => refresh()}
        onExport={HR_API_CONTRACT[`GET ${api.path}/export`] ? () => action(async () => downloadHrFile(await api.export(params), 'calendar.csv')) : undefined}
      />
      {dialogs}
    </>
  }
  return <HRPage className={`hrl-module hrl-module--${module}`} moduleId={permissionModule} title={config.title} icon={Users} hero={studentHero} actions={moduleActions}>
    <div className="space-y-4 lg:space-y-3" aria-busy={state.loading}>
      {module === 'calendar' ? state.summaryError && <p role="alert">{state.summaryError}</p> : state.summaryError ? <p role="alert">{state.summaryError}</p> : module === 'announcements' ? !state.loading && <HrAnnouncementSummary value={state.summary} /> : module === 'students' ? <HrKpis columns={6} layout="label-first" items={[
        { label: 'Total Students', value: state.loading ? '…' : studentSummary.totalStudents, sub: 'All enrolled students', icon: Users, tone: 'blue', trend: studentTrend?.label, trendDir: studentTrend?.dir, onClick: () => setFilter('Status', '') },
        { label: 'Active Students', value: state.loading ? '…' : studentSummary.activeStudents, sub: 'Currently learning', icon: GraduationCap, tone: 'green', onClick: () => setFilter('Status', 'Active') },
        { label: 'Pending Students', value: state.loading ? '…' : studentSummary.pendingStudents, sub: 'Awaiting approval', icon: Clock3, tone: 'orange', onClick: () => setFilter('Status', 'Pending') },
        { label: 'Inactive Students', value: state.loading ? '…' : studentSummary.inactiveStudents, sub: 'Not enrolled/On hold', icon: UserMinus, tone: 'purple', onClick: () => setFilter('Status', 'Inactive') },
        { label: 'Completed Students', value: state.loading ? '…' : studentSummary.completedStudents, sub: 'Finished courses', icon: CheckCircle2, tone: 'red', onClick: () => setFilter('Status', 'Completed') },
        { label: 'Other Students', value: state.loading ? '…' : studentSummary.otherStudents, sub: 'Transferred/Other', icon: UserCog, tone: 'blue' },
      ]} /> : (!visualLoading || module === 'calendar' && state.summary) && module !== 'departments' && (MODULE_HEROES[module] ? <HrSummaryKpis value={state.summary} hiddenFields={module === 'employees' ? ['academicStaff'] : []} trends={module === 'employees' ? { totalEmployees: employeeTrend } : undefined} onKpiClick={employeeKpiClick} /> : <HrSummary value={state.summary} hiddenFields={module === 'employees' ? ['academicStaff'] : []} />)}
      {module === 'performance' && state.employeeLookupError && <p role="alert" className="text-sm text-red-700">Employee names could not be loaded. Refresh to retry.</p>}
      {module === 'leave' && state.employeeLookupError && <p role="alert" className="text-sm text-red-700">Employee emails could not be loaded. Refresh to retry.</p>}
      {module !== 'calendar' && module !== 'departments' && <FilterCard
        title={module === 'performance' ? 'Search & Filter' : undefined}
        icon={module === 'performance' ? Filter : undefined}
        search={hasSearch ? { placeholder: SEARCH_PLACEHOLDERS[module] ?? 'Search…', value: module === 'leave' ? leaveSearch : query.Search ?? '', onChange: value => module === 'leave' ? setLeaveSearch(value) : setFilter('Search', value) } : null}
        onReset={resetFilters}
        onSearch={() => { if (module === 'leave') setFilter('Search', leaveSearch.trim()); refresh() }}
        extra={performanceExtra}
      >{filterParams.map(filterField)}</FilterCard>}
      {module === 'leave' && !canReviewLeave && <p className="text-sm text-slate-500">You have view access. An account with leave approval permission must approve or reject requests.</p>}
      {tabs && <StatusTabs tabs={tabs} value={tabValue} onChange={onTab} />}
      {module === 'departments' && <HRDataTable columns={config.columns.map(key => ({ accessor: key, header: fieldLabel(key), render: row => hrText(hrField(row, key)) }))} data={state.rows} pageSize={10} searchable={false} exportable={false} loading={state.loading} />}
      {module === 'announcements' && state.extras['option:options']?.error && <p role="alert">Announcement options: {state.extras['option:options'].error}</p>}
      {module !== 'departments' && (state.error ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">{state.error}</p> : <>
        {selectedRows.length > 0 && <div className="hrl-selection" role="status">{selectedRows.length} selected{(module !== 'announcements' || can('export')) && <button type="button" className="hrl-act is-blue" disabled={module === 'announcements' && !can('export')} onClick={exportSelected}><Download aria-hidden="true" />Export selected</button>}<button type="button" className="hrl-act" onClick={() => setSelected(new Set())}>Clear</button></div>}
        {module === 'employees' && <div className="hrl-toolbar">
          {HR_API_CONTRACT[`GET ${api.path}/export`] && <button type="button" className="hrp-btn hrp-btn--white" disabled={state.loading || busy} onClick={() => action(async () => downloadHrFile(await api.export(params), 'employees.csv'))}><Download aria-hidden="true" />Export</button>}
          {can('add') && HR_API_CONTRACT[createOperation] && <button type="button" className="hrp-btn hrp-btn--blue" disabled={busy} onClick={() => setDialog({ kind: 'create' })}><Plus aria-hidden="true" />Add Employee</button>}
        </div>}
        <LiveTable
          columns={columns}
          rows={visibleRows}
          rowKey={row => recordId(row)}
          loading={visualLoading}
          actions={rowActions}
          selected={selected}
          onSelect={setSelected}
          empty={<EmptyState title={emptyTitle} description={emptyText} action={emptyAction} icon={module === 'announcements' ? 'megaphone' : 'box'} />}
          footer={paged && (state.rows.length > 0 || page > 1) ? <Pager page={page} pageSize={module === 'announcements' ? state.raw?.limit : 10} totalPages={totalPages} totalCount={totalCount} shown={state.rows.length} label={PAGER_LABELS[module] ?? 'records'} disabled={state.loading} onPage={value => { setSelected(new Set()); setPage(value) }} /> : null}
        />
      </>)}
      {['employees', 'attendance', 'leave', 'performance'].includes(module) && !visualLoading && <HrModuleInsights module={module} extras={state.extras} rows={state.rows} analyticsRows={state.analytics} analyticsError={state.analyticsError} summary={state.summary} />}
    </div>
    {dialogs}
  </HRPage>
}

function HrPreview({ blob, onClose }) {
  const frame = useRef(null)
  useEffect(() => { const objectUrl = URL.createObjectURL(blob); if (frame.current) frame.current.src = objectUrl; return () => URL.revokeObjectURL(objectUrl) }, [blob])
  return <Modal open title="Resource preview" size="xl" onClose={onClose}><iframe ref={frame} sandbox="" title="Resource preview" className="h-[65vh] w-full" /></Modal>
}
