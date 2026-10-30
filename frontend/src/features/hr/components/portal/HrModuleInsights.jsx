import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { BarChart3, CalendarDays, CalendarRange, ChartPie, ClipboardList, GraduationCap, LineChart as LineIcon, PieChart, Plane, Trophy, UserCheck, UserX, Users, UsersRound, Wallet } from 'lucide-react'
import { hrField, hrList, hrRequest } from '../../services/hrApi'
import { Avatar, BarList, Donut, Legend, LineChart, Panel, PanelEmpty, PanelNote } from './HrLiveKit'
import { toPairs, isoDay } from './hrLiveUtils'

/* v23 — the chart cards under each live HR table (Employees, Attendance, Leave, Performance). */

const errorOf = (extra) => extra?.error
const valueOf = (extra) => extra?.value
const lower = (value) => String(value ?? '').trim().toLowerCase()
const countBy = (rows, key) => {
  const map = new Map()
  rows.forEach((row) => { const label = hrField(row, key); if (label == null || label === '') return; map.set(String(label), (map.get(String(label)) ?? 0) + 1) })
  return [...map].map(([label, value]) => ({ label, value }))
}

/* ── Employees ───────────────────────────────────────────────────── */
const CATEGORY_LABELS = { trainersmentors: 'Mentors', trainersandmentors: 'Mentors', trainer: 'Mentors', trainers: 'Mentors', mentor: 'Mentors', mentors: 'Mentors', administrativestaff: 'HR', hr: 'HR', hrexecutive: 'HR' }
function EmployeeInsights({ extras, summary }) {
  const dept = extras['Department distribution']
  const types = extras['Employment types']
  const overview = extras['Attendance overview']
  const deptPairs = toPairs(valueOf(dept))
  const deptTotal = deptPairs.reduce((sum, item) => sum + item.value, 0)
  const categories = toPairs(valueOf(types))
    .filter((item) => lower(item.label).replace(/[^a-z]/g, '') !== 'academicstaff')
    .map((item) => ({ ...item, label: CATEGORY_LABELS[lower(item.label).replace(/[^a-z]/g, '')] ?? item.label }))
  const totalEmployees = Number(hrField(summary?.summary ?? summary ?? {}, 'totalEmployees', 'total')) || categories.reduce((sum, item) => sum + item.value, 0)
  const over = valueOf(overview) ?? {}
  const pick = (...keys) => { const value = hrField(over?.data ?? over, ...keys); return value == null ? '—' : value }
  return (
    <div className="hrl-grid">
      <Panel title="Department distribution" icon={UsersRound}>
        {errorOf(dept) ? <p role="alert">{errorOf(dept)}</p> : deptPairs.length ? (
          <div className="hrl-donut-row"><Donut data={deptPairs} centerValue={deptTotal} centerLabel="Employees" /><Legend data={deptPairs} /></div>
        ) : <PanelEmpty icon={ChartPie} text="No department distribution data available." />}
      </Panel>
      <Panel title="Staff categories" icon={GraduationCap}>
        {errorOf(types) ? <p role="alert">{errorOf(types)}</p> : categories.length ? (
          <div className="hrl-tiles">
            {categories.slice(0, 4).map((item, index) => {
              const Icon = item.label === 'Mentors' ? GraduationCap : Users
              return (
                <div key={item.label} className={`hrl-tile ${index % 2 ? 'is-blue' : 'is-purple'}`}>
                  <Users className="hrl-tile__ghost" aria-hidden="true" />
                  <span className="hrl-tile__icon" aria-hidden="true"><Icon /></span>
                  <b>{item.value}</b><span>{item.label}</span>
                  {totalEmployees > 0 && <small>{((item.value / totalEmployees) * 100).toFixed(1)}% of total</small>}
                </div>
              )
            })}
          </div>
        ) : <PanelEmpty icon={Users} text="No staff category data available." />}
      </Panel>
      <Panel title="Attendance overview" icon={CalendarDays}>
        {errorOf(overview) ? <p role="alert">{errorOf(overview)}</p> : <>
          <div className="hrl-stats">
            <Stat icon={UserCheck} tone="#16a34a" bg="#e6f7ec" value={pick('averageAttendance', 'avgAttendance', 'attendanceRate')} label="Avg Attendance" />
            <Stat icon={Users} tone="#1d63d8" bg="#e7f0ff" value={pick('present', 'presentCount', 'totalPresent')} label="Present" />
            <Stat icon={Plane} tone="#ea7a0c" bg="#fff3e2" value={pick('onLeave', 'onLeaveCount', 'leave')} label="On Leave" />
            <Stat icon={UserX} tone="#dc2626" bg="#fde8e8" value={pick('absent', 'absentCount', 'totalAbsent')} label="Absent" />
          </div>
          <PanelNote title={Object.keys(over).length ? undefined : 'No records available.'}>The reporting period and whether these totals count unique employees are not provided. These totals cannot be compared directly with Total Employees.</PanelNote>
        </>}
      </Panel>
    </div>
  )
}
function Stat({ icon: Icon, tone, bg, value, label }) {
  return <div className="hrl-stat"><span style={{ color: tone, background: bg }} aria-hidden="true"><Icon /></span><div><b>{value}</b><small>{label}</small></div></div>
}

/* ── Attendance ──────────────────────────────────────────────────── */
const ATT_SERIES = [['present', 'Present', '#22c55e'], ['absent', 'Absent', '#ef4444'], ['late', 'Late', '#f59e0b'], ['onLeave', 'On Leave', '#3b82f6']]
const DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function AttendanceInsights({ extras }) {
  const overview = extras.Overview
  const distribution = extras.Distribution
  const days = hrList(valueOf(overview)).map((row) => ({
    date: isoDay(hrField(row, 'date', 'attendanceDate', 'day')),
    present: Number(hrField(row, 'present', 'presentCount')) || 0,
    absent: Number(hrField(row, 'absent', 'absentCount')) || 0,
    late: Number(hrField(row, 'late', 'lateCount')) || 0,
    onLeave: Number(hrField(row, 'onLeave', 'leave', 'onLeaveCount')) || 0,
    total: hrField(row, 'total', 'totalEmployees'),
  })).filter((row) => row.date).sort((a, b) => String(a.date).localeCompare(String(b.date)))
  const dist = toPairs(valueOf(distribution)).map((item) => ({ ...item, label: item.label.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim() }))
  const distTotal = dist.reduce((sum, item) => sum + item.value, 0)
  const colors = dist.map((item) => ({ present: '#22c55e', absent: '#ef4444', 'on leave': '#3b82f6', late: '#f59e0b', pending: '#8b5cf6' }[lower(item.label)] ?? '#64748b'))
  const last7 = days.slice(-7)
  const label = (date) => { const match = String(date).match(/^\d{4}-(\d{2})-(\d{2})/); return match ? `${MON[Number(match[1]) - 1]} ${match[2]}` : date }
  const weekday = (date) => { const parsed = new Date(`${date}T00:00:00`); return Number.isNaN(parsed.getTime()) ? '—' : DAY[parsed.getDay()] }
  return (
    <div className="hrl-grid hrl-grid--2">
      <Panel title="Attendance Overview" icon={CalendarDays}>
        {errorOf(distribution) ? <p role="alert">{errorOf(distribution)}</p> : dist.length ? (
          <div className="hrl-donut-row"><Donut data={dist} colors={colors} centerValue={distTotal} centerLabel="Total Records" size={170} /><Legend data={dist} colors={colors} /></div>
        ) : <PanelEmpty icon={PieChart} text="No attendance distribution for this period." />}
      </Panel>
      <Panel title="Daily Attendance Trend" icon={BarChart3} action={<span className="hrl-period">Last 7 Days</span>}>
        {errorOf(overview) ? <p role="alert">{errorOf(overview)}</p> : last7.length ? (
          <LineChart labels={last7.map((row) => label(row.date))} series={ATT_SERIES.map(([key, name, color]) => ({ label: name, color, values: last7.map((row) => row[key]) }))} />
        ) : <PanelEmpty icon={LineIcon} text="Daily totals appear here once attendance is recorded." />}
      </Panel>
      <Panel title="Date-wise Summary" icon={CalendarRange}>
        {days.length ? (
          <div className="hrl-table-wrap">
            <table className="hrl-mini-table" data-table-header="plain">
              <thead><tr><th>Date</th><th>Day</th><th>Present</th><th>Absent</th><th>On Leave</th><th>Late</th><th>Total</th></tr></thead>
              <tbody>{[...days].reverse().slice(0, 5).map((row) => (
                <tr key={row.date}><td>{row.date}</td><td>{weekday(row.date)}</td><td className="is-green">{row.present}</td><td className="is-red">{row.absent}</td><td className="is-blue">{row.onLeave}</td><td className="is-orange">{row.late}</td><td>{row.total ?? row.present + row.absent + row.onLeave + row.late}</td></tr>
              ))}</tbody>
            </table>
          </div>
        ) : <PanelEmpty icon={CalendarRange} text="No daily summary available." />}
      </Panel>
      <Panel title="Attendance Distribution" icon={ChartPie}>
        {dist.length ? <BarList data={dist} colors={colors} /> : <PanelEmpty icon={ChartPie} text="No attendance distribution for this period." />}
        <PanelNote title="Note">The attendance statistics are based on the applied filters and selected date range.</PanelNote>
      </Panel>
    </div>
  )
}

/* ── Leave ───────────────────────────────────────────────────────── */
function LeaveInsights({ rows, summary, analyticsError }) {
  const types = countBy(rows, 'leaveType')
  const typeTotal = types.reduce((sum, item) => sum + item.value, 0)
  const statuses = ['Pending', 'Approved', 'Rejected'].map((label) => ({ label, value: rows.filter((row) => lower(hrField(row, 'status')) === lower(label)).length }))
  const onLeave = Number(hrField(summary?.summary ?? summary ?? {}, 'onLeaveToday', 'onLeave'))
  const statusData = [...statuses, ...(Number.isFinite(onLeave) ? [{ label: 'On Leave Today', value: onLeave }] : [])]
  const employees = []
  const seen = new Set()
  rows.forEach((row) => { const id = hrField(row, 'employeeId'); if (id == null || seen.has(String(id)) || employees.length >= 5) return; seen.add(String(id)); employees.push({ id, name: hrField(row, 'employeeName', 'fullName', 'name') ?? `Employee ${id}` }) })
  const balanceKey = employees.map((employee) => employee.id).join(',')
  const [balances, setBalances] = useState({})
  useEffect(() => {
    if (!balanceKey) return undefined
    const controller = new AbortController()
    Promise.allSettled(balanceKey.split(',').map((id) => hrRequest('GET', '/api/hr/leave/balance/{employeeId}', { id, signal: controller.signal })))
      .then((results) => {
        if (controller.signal.aborted) return
        const next = {}
        results.forEach((result, index) => {
          const id = balanceKey.split(',')[index]
          if (result.status !== 'fulfilled') { next[id] = null; return }
          const value = result.value
          const list = hrList(value)
          const direct = hrField(value ?? {}, 'remainingDays', 'balance', 'remaining', 'availableDays', 'available', 'totalBalance', 'remainingLeaves')
          next[id] = direct ?? (list.length ? list.reduce((sum, row) => sum + (Number(hrField(row, 'remainingDays', 'balance', 'remaining', 'available')) || 0), 0) : null)
        })
        setBalances(next)
      })
    return () => controller.abort()
  }, [balanceKey])
  return (
    <div className="hrl-grid">
      <Panel title="Leave Type Distribution" icon={ChartPie}>
        {analyticsError ? <p role="alert">{analyticsError}</p> : types.length ? (
          <div className="hrl-donut-row"><Donut data={types} centerValue={typeTotal} centerLabel="Total Requests" /><Legend data={types} /></div>
        ) : <PanelEmpty icon={ChartPie} text="No leave requests yet." />}
      </Panel>
      <Panel title="Request Status Overview" icon={ClipboardList}>
        <BarList data={statusData} total={rows.length || undefined} colors={['#f59e0b', '#22c55e', '#ef4444', '#3b82f6']} />
      </Panel>
      <Panel title="Leave Balance (Top 5)" icon={Wallet}>
        {employees.length ? <>
          <div className="hrl-balance-head"><span>Employee</span><span>Balance</span></div>
          <ul className="hrl-balance">{employees.map((employee) => (
            <li key={employee.id}><Avatar name={employee.name} size={26} /><span>{employee.name}</span><b>{employee.id in balances ? (balances[employee.id] ?? '—') : '…'}</b></li>
          ))}</ul>
        </> : <PanelEmpty icon={Wallet} text="Balances appear once employees request leave." />}
      </Panel>
    </div>
  )
}

/* ── Performance ─────────────────────────────────────────────────── */
function PerformanceInsights({ extras, rows }) {
  const trend = toPairs(valueOf(extras.Trend))
  const byRole = toPairs(valueOf(extras['By role']))
  const top = [...rows].map((row) => ({ name: hrField(row, 'employeeName', 'fullName', 'name'), score: Number(hrField(row, 'performanceScore', 'score', 'rating')) }))
    .filter((row) => row.name && Number.isFinite(row.score)).sort((a, b) => b.score - a.score).slice(0, 5)
  return (
    <div className="hrl-grid">
      <Panel title="Performance Trend" icon={LineIcon}>
        {errorOf(extras.Trend) ? <p role="alert">{errorOf(extras.Trend)}</p> : trend.length ? <LineChart labels={trend.map((item) => String(item.label))} series={[{ label: 'Score', color: '#2f6fe4', values: trend.map((item) => item.value) }]} height={180} /> : <PanelEmpty icon={BarChart3} text="Performance trend will be shown here once reviews are added." />}
      </Panel>
      <Panel title="Performance by Role" icon={Users}>
        {errorOf(extras['By role']) ? <p role="alert">{errorOf(extras['By role'])}</p> : byRole.length ? <BarList data={byRole} /> : <PanelEmpty icon={Users} text="Role-wise performance distribution will be shown here." />}
      </Panel>
      <Panel title="Top Performers" icon={Trophy}>
        {top.length ? (
          <ul className="hrl-balance">{top.map((item) => <li key={item.name}><Avatar name={item.name} size={26} /><span>{item.name}</span><b>{item.score}</b></li>)}</ul>
        ) : <PanelEmpty icon={Trophy} text="Top performers will be shown here once reviews are added." />}
      </Panel>
    </div>
  )
}

export default function HrModuleInsights({ module, extras, rows, analyticsRows, analyticsError, summary }) {
  if (module === 'employees') return <EmployeeInsights extras={extras} summary={summary} />
  if (module === 'attendance') return <AttendanceInsights extras={extras} />
  if (module === 'leave') return <LeaveInsights rows={analyticsRows ?? rows} summary={summary} analyticsError={analyticsError} />
  if (module === 'performance') return <PerformanceInsights extras={extras} rows={analyticsRows ?? rows} />
  return null
}

HrModuleInsights.propTypes = { module: PropTypes.string.isRequired, extras: PropTypes.object, rows: PropTypes.array, analyticsRows: PropTypes.array, analyticsError: PropTypes.string, summary: PropTypes.any }
