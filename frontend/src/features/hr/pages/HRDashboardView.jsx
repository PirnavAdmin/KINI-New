import { useCallback, useEffect, useRef, useState } from 'react'
import { RefreshCw, Users, UserCheck, GraduationCap, CalendarDays } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { HrKpis } from '@features/hr/components/portal/HrPortalKit'
import { HR_BANNERS } from '@features/hr/components/portal/hrBanners'
import useHrPermissions from '@features/hr/hooks/useHrPermissions'
import usePermission from '@shared/hooks/usePermission'
import { ROUTES } from '@shared/constants/routeConstants'
import { hrModuleApi, hrList, hrField } from '@features/hr/services/hrApi'
import { employeeAttendanceEvent } from '@shared/services/employeeWorkAttendance'
import HRDashboardOverview from '@features/hr/components/HRDashboardOverview'
import '@features/hr/components/hr-dashboard.css'
import { useAuth } from '@shared/hooks/useAuth'
import { batchService } from '@shared/services/batchService'
import apiClient from '@shared/services/apiClient'
import { getListPayload } from '@shared/services/apiServices'
import { API_ENDPOINTS } from '@/api/endpoints'
import { liveClassService } from '@features/live-classes/services/liveClassService'
import { normalizeLiveClassList } from '@features/live-classes/utils/liveClassMappers'

import { HR_API_CONTRACT } from '../services/hrApiContract'
import { announcementChangedEvent, loadDashboardAnnouncements } from '../services/hrAnnouncementData'
import { dashboardError, isHrEmployee, loadDashboardList } from '../services/hrDashboardData'
import { attendanceToday } from '../services/hrDashboardInsights'

const E = ROUTES.EMPLOYEE
const greetingFor = (date) => (date.getHours() < 12 ? 'Good morning' : date.getHours() < 17 ? 'Good afternoon' : 'Good evening')
const modules = ['employees', 'attendance', 'leave', 'performance', 'announcements', 'calendar', 'students', 'resources', 'batches', 'syllabus', 'schedule', 'departments']

export default function HRDashboardView() {
  const { canModule, isLoading: permissionsLoading } = useHrPermissions()
  const { hasPermission, can: canPlatformAction } = usePermission()
  const { user } = useAuth()
  const navigate = useNavigate()
  const recipientId = user?.employeeId ?? user?.mentorId ?? user?.userId ?? user?.id ?? user?.email
  const allowedKey = modules.filter(key => key === 'announcements' ? hasPermission(key) && canPlatformAction(key, 'view') : key === 'departments' ? canModule('employees') : key === 'syllabus' ? hasPermission('resources') : ['calendar', 'resources', 'batches', 'schedule'].includes(key) ? hasPermission(key) : canModule(key)).join(',')
  const [state, setState] = useState({ data: {}, errors: [], failures: {}, pending: allowedKey.split(',').filter(Boolean), loading: true, updated: null })
  const active = useRef(null)
  const announcementRefreshPending = useRef(false)
  const denied = useRef(new Set())
  const load = useCallback(async function loadDashboard(only) {
    if (permissionsLoading) return
    if (active.current) {
      if (only === 'announcements') announcementRefreshPending.current = true
      return
    }
    const allowed = (allowedKey ? allowedKey.split(',') : []).filter(key => (!only || key === only) && !denied.current.has(key))
    if (!allowed.length) {
      setState(previous => ({ ...previous, loading: false }))
      return
    }
    const controller = new AbortController()
    active.current = controller
    const { signal } = controller
    setState(previous => ({ ...previous, loading: true, pending: allowed }))
    await Promise.allSettled(allowed.map(async key => {
      try {
        let result
        if (key === 'announcements') result = await loadDashboardAnnouncements(hrModuleApi('announcements'), signal)
        else if (key === 'batches') result = await batchService.getAll({ pageNumber: 1, pageSize: 4 })
        else if (key === 'syllabus') {
          const response = await apiClient.get(API_ENDPOINTS.syllabusAssignments.employee, { params: { recipientType: 'employee', recipientId }, signal })
          if (response.data?.success === false) throw Object.assign(new Error('Syllabus request failed'), { response })
          result = getListPayload(response)
        } else if (key === 'schedule') result = normalizeLiveClassList(await liveClassService.list({ page: 1, pageSize: 4 }))
        else {
          const api = hrModuleApi(key)
          result = await loadDashboardList(api, HR_API_CONTRACT['GET ' + api.path], signal, ['students', 'resources'].includes(key))
        }
        if (signal.aborted) return
        setState(previous => ({ ...previous, data: { ...previous.data, [key]: hrList(result) }, errors: previous.errors.filter(item => item !== key), failures: { ...previous.failures, [key]: null }, pending: previous.pending.filter(item => item !== key) }))
      } catch (error) {
        if (signal.aborted) return
        const failure = dashboardError(error, key)
        if (failure.status === 403) denied.current.add(key)
        if (import.meta.env.DEV) console.debug('[HR dashboard]', { module: key, endpoint: error.config?.url, status: failure.status ?? 'network', authorizationAttached: Boolean(error.config?.headers?.Authorization), recipientIdentityAvailable: recipientId != null })
        setState(previous => ({ ...previous, data: { ...previous.data, [key]: [] }, errors: [...previous.errors.filter(item => item !== key), key], failures: { ...previous.failures, [key]: failure }, pending: previous.pending.filter(item => item !== key) }))
      }
    }))
    if (signal.aborted) return
    active.current = null
    if (announcementRefreshPending.current) {
      announcementRefreshPending.current = false
      queueMicrotask(() => loadDashboard('announcements'))
    }
    setState(previous => ({ ...previous, loading: false, updated: new Date() }))
  }, [allowedKey, permissionsLoading, recipientId])
  useEffect(() => {
    denied.current.clear()
    let disposed = false
    const refresh = () => load()
    queueMicrotask(() => {
      if (disposed) return
      setState({ data: {}, errors: [], failures: {}, pending: allowedKey.split(',').filter(Boolean), loading: true, updated: null })
      refresh()
    })
    const refreshAnnouncements = () => load('announcements')
    window.addEventListener(announcementChangedEvent, refreshAnnouncements)
    window.addEventListener(employeeAttendanceEvent, refresh)
    return () => { disposed = true; active.current?.abort(); active.current = null; window.removeEventListener(employeeAttendanceEvent, refresh); window.removeEventListener(announcementChangedEvent, refreshAnnouncements); announcementRefreshPending.current = false }
  }, [load, allowedKey])
  const { data, errors, loading, updated } = state
  const employees = data.employees || []
  const history = data.attendance || []
  const today = attendanceToday(history)
  const count = {
    active: employees.filter(row => String(hrField(row, 'status')).toLowerCase() === 'active').length,
    mentors: employees.filter(row => /mentor|trainer/i.test(String(hrField(row, 'role', 'designation')))).length,
    hr: employees.filter(isHrEmployee).length,
  }
  // Share of the real total, shown in each card's chip (never an invented growth figure).
  const share = (part, whole) => (whole ? `${Math.round((part / whole) * 100)}%` : null)
  const metric = (module, value) => state.pending.includes(module) || permissionsLoading ? <span className="hx-skeleton hx-skeleton--kpi" aria-label="Loading value" /> : errors.includes(module) ? '—' : value
  const attendanceSub = errors.includes('attendance') ? 'Attendance unavailable' : today.recorded ? null : 'No records for today'
  const kpis = [
    { module: 'employees', label: 'Total Employees', value: employees.length, icon: Users, tone: 'blue', to: E.HR_EMPLOYEES, sub: 'Workforce directory' },
    { module: 'employees', label: 'Active Employees', value: count.active, trend: share(count.active, employees.length), icon: UserCheck, tone: 'green', to: E.HR_EMPLOYEES, sub: 'Currently active' },
    { module: 'employees', label: 'Mentors', value: count.mentors, trend: share(count.mentors, employees.length), icon: GraduationCap, tone: 'purple', to: `${E.HR_EMPLOYEES}?role=Mentor`, sub: 'Teaching team' },
    { module: 'employees', label: 'HR Employees', value: count.hr, trend: share(count.hr, employees.length), icon: Users, tone: 'orange', to: E.HR_EMPLOYEES, sub: 'Human resources team' },
    { module: 'attendance', label: 'On Leave Today', value: today.recorded ? today.onLeave : '—', trend: share(today.onLeave, today.recorded), icon: CalendarDays, tone: 'red', to: E.HR_ATTENDANCE, sub: attendanceSub ?? 'Currently on leave' },
    { module: 'attendance', label: 'Present Today', value: today.recorded ? today.present : '—', trend: share(today.present, today.recorded), icon: UserCheck, tone: 'blue', to: E.HR_ATTENDANCE, sub: attendanceSub ?? 'Today\u2019s attendance' },
  ].filter(card => canModule(card.module))
  const now = new Date()
  const fullName = String(user?.fullName || user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || '').trim()
  const [givenName, ...otherNames] = fullName.split(/\s+/).filter(Boolean)
  return <div className="hr-dashboard hrp-page hx" aria-busy={loading}>
    <section className="hx-hero" aria-labelledby="hx-greeting">
      <div className="hx-hero__copy">
        <h1 id="hx-greeting">
          <span className="hx-hero__hello">{greetingFor(now)},</span>
          <span className="hx-hero__name">{givenName ? <>{givenName}{otherNames.length > 0 && <em> {otherNames.join(' ')}</em>}!</> : 'Welcome back!'} <span className="hx-hero__wave" aria-hidden="true">👋</span></span>
        </h1>
        <p className="hx-hero__sub">Manage your team, track attendance, handle leaves, and keep your organization running smoothly.</p>
      </div>
      <div className="hx-hero__art" aria-hidden="true">
        <span className="hx-hero__dots" />
        <p className="hx-hero__script"><span>People</span><span>Build</span><span>Better</span><span>Futures</span></p>
        <img src={HR_BANNERS.dashboard.src} alt="" width="1500" height="528" decoding="async" onError={(event) => { event.currentTarget.hidden = true }} />
      </div>
      <div className="hx-hero__side">
        <div className="hx-hero__controls">
          <span className="hx-date"><CalendarDays aria-hidden="true" />{now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).replace(/^(\w+) /, '$1, ')}</span>
          <button type="button" className="hx-btn" onClick={() => load()} disabled={loading} title={updated ? `Updated ${updated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Loading overview'}>
            <RefreshCw className={loading ? 'animate-spin' : ''} aria-hidden="true" />Refresh
          </button>
        </div>
        <p className="hx-hero__quote">Empower People.<br />Enable Growth.</p>
      </div>
    </section>
    {kpis.length > 0 && (
      <HrKpis
        columns={6}
        items={kpis.map(({ module, label, value, trend, icon, tone, to, sub }) => ({ key: label, label, value: metric(module, value), trend: errors.includes(module) || state.pending.includes(module) ? undefined : trend ?? undefined, trendDir: 'flat', icon, tone, sub: errors.includes(module) ? 'Data unavailable' : sub, onClick: () => navigate(to) }))}
      />
    )}
    <HRDashboardOverview employees={employees} attendance={history} data={data} errors={errors} loading={loading} pending={state.pending} failures={state.failures} onRetry={module => load(module)} />
  </div>
}
