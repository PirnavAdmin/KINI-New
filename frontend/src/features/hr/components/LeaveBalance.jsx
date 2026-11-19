import { useEffect, useState } from 'react'
import { hrError, hrField, hrList } from '../services/hrApi'
import { employeeIdOf } from '../services/hrEmployeeIdentity'
import { loadEmployeeLeaveBalance } from '../services/hrEmployeeLeaveData'

export default function LeaveBalance({ identifier, employees = [] }) {
  const choices = employees.filter(row => employeeIdOf(row) != null)
  const initial = choices.find(row => ['employeeRecordId', 'employeeId', 'id', 'employeeCode', 'code'].some(key => String(hrField(row, key)) === String(identifier)))
  const [selected, setSelected] = useState(() => String(initial ? employeeIdOf(initial) : /^\d+$/.test(String(identifier)) ? identifier : ''))
  const [revision, setRevision] = useState(0)
  const [state, setState] = useState({})
  const requestKey = `${selected}:${revision}`
  const loading = Boolean(selected) && state.key !== requestKey
  useEffect(() => {
    if (!selected) return
    const controller = new AbortController()
    loadEmployeeLeaveBalance(selected, { signal: controller.signal, readEmployee: false }).then(value => {
      if (!controller.signal.aborted) setState({ key: requestKey, value })
    }).catch(error => {
      if (!controller.signal.aborted) setState({ key: requestKey, error: error.response ? hrError(error, 'leave') : error.message })
    })
    return () => controller.abort()
  }, [selected, revision, requestKey])
  const rows = hrList(state.value)
  const total = key => rows.reduce((sum, row) => sum + (Number(hrField(row, key)) || 0), 0)
  const employee = choices.find(row => String(employeeIdOf(row)) === selected)
  return <div className="space-y-4">
    <div className="flex flex-wrap items-end gap-3">
      <label className="min-w-0 flex-1 text-sm font-medium">Employee<select aria-label="Balance employee" value={selected} onChange={event => setSelected(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 bg-white p-3 text-slate-900"><option value="">Select employee</option>{choices.map(row => <option key={employeeIdOf(row)} value={employeeIdOf(row)}>{hrField(row, 'fullName', 'employeeName', 'name') || [hrField(row, 'firstName'), hrField(row, 'lastName')].filter(Boolean).join(' ')} — {hrField(row, 'employeeCode', 'employeeId') || employeeIdOf(row)}</option>)}</select></label>
      <button type="button" disabled={!selected || loading} onClick={() => setRevision(value => value + 1)} className="rounded-lg bg-orange-500 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">Refresh</button>
    </div>
    {!selected ? <p>Please select an employee.</p> : loading ? <p role="status">Loading leave balance...</p> : state.error ? <p role="alert">{state.error}</p> : !rows.length ? <p>No leave balances are available for this employee.</p> : <>
      <p className="text-sm text-slate-500">{hrField(employee, 'fullName', 'employeeName', 'name') || 'Employee'} · ID {selected}</p>
      <div className="grid grid-cols-3 gap-3">{['allotted', 'used', 'remaining'].map(key => <div key={key} className="rounded-xl bg-slate-50 p-3 text-slate-900"><p className="text-xs capitalize">Total {key}</p><strong className="text-2xl">{total(key)}</strong></div>)}</div>
      <div className="grid gap-3 sm:grid-cols-2">{rows.map((row, index) => {
        const allotted = Number(hrField(row, 'allotted')) || 0, used = Number(hrField(row, 'used')) || 0, remaining = Number(hrField(row, 'remaining')) || 0
        const percent = allotted > 0 ? Math.min(100, Math.max(0, remaining / allotted * 100)) : 0
        return <article key={index} className="rounded-xl border border-slate-200 p-4"><h3 className="font-semibold">{hrField(row, 'leaveType')}</h3><p className="my-3 text-sm">Allotted: {allotted} · Used: {used} · Remaining: {remaining}</p><div role="progressbar" aria-label={`${hrField(row, 'leaveType')} remaining`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-orange-500" style={{ width: `${percent}%` }} /></div></article>
      })}</div>
    </>}
  </div>
}
