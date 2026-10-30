import { useMemo, useState } from 'react'
import { CheckCircle2, Filter, Plus, Search, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@shared/hooks/useAuth'

const CONFIG = {
  employees: { title: 'Employees', noun: 'employee', fields: ['Name', 'Department', 'Designation'], seed: [['Aarav Sharma', 'Engineering', 'Developer'], ['Meera Reddy', 'Training', 'Mentor']] },
  departments: { title: 'Departments', noun: 'department', fields: ['Department', 'Manager', 'Members'], seed: [['Engineering', 'Priya Nair', '18'], ['Training', 'Rahul Verma', '12']] },
  leave: { title: 'Leave Management', noun: 'leave request', fields: ['Employee', 'Leave type', 'Dates'], seed: [['Meera Reddy', 'Medical', '12–14 Aug'], ['Kiran Rao', 'Casual', '18 Aug']] },
  payroll: { title: 'Payroll', noun: 'payroll record', fields: ['Employee', 'Period', 'Net amount'], seed: [['Aarav Sharma', 'August 2026', '₹48,500'], ['Meera Reddy', 'August 2026', '₹52,000']] },
  recruitment: { title: 'Recruitment', noun: 'candidate', fields: ['Candidate', 'Position', 'Stage'], seed: [['Sana Khan', 'React Mentor', 'Interview'], ['Vikram Das', 'Operations Executive', 'Screening']] },
  admissions: { title: 'Admissions', noun: 'application', fields: ['Applicant', 'Program', 'Intake'], seed: [['Nikhil Kumar', 'MERN Stack', 'August 2026'], ['Divya S', 'Python Full Stack', 'September 2026']] },
  enrollments: { title: 'Enrollments', noun: 'enrollment', fields: ['Student', 'Course', 'Batch'], seed: [['Nikhil Kumar', 'MERN Stack', 'MERN-08'], ['Divya S', 'Python Full Stack', 'PY-09']] },
  support: { title: 'Student Support', noun: 'ticket', fields: ['Student', 'Issue', 'Priority'], seed: [['Arjun P', 'Unable to open assessment', 'High'], ['Kavya M', 'Certificate query', 'Normal']] },
  scheduling: { title: 'Course Scheduling', noun: 'schedule', fields: ['Course', 'Mentor', 'Time'], seed: [['React Mastery', 'Meera Reddy', '10:00 AM'], ['Python Full Stack', 'Rahul Verma', '2:00 PM']] },
}

Object.assign(CONFIG.payroll, { activeStatus: 'Processed', pendingStatus: 'Pending approval', activeLabel: 'Processed payroll', pendingLabel: 'Pending approval', activateAction: 'Process payroll', deactivateAction: 'Reopen' })
Object.assign(CONFIG.recruitment, { activeStatus: 'Shortlisted', pendingStatus: 'Under review', activeLabel: 'Shortlisted', pendingLabel: 'Under review', activateAction: 'Shortlist', deactivateAction: 'Move to review' })

const getWorkflow = (config) => ({ active: config.activeStatus || 'Active', pending: config.pendingStatus || 'Pending', activeLabel: config.activeLabel || 'Active', pendingLabel: config.pendingLabel || 'Pending review', activateAction: config.activateAction || 'Approve', deactivateAction: config.deactivateAction || 'Set pending' })
const makeRows = (mode) => { const config = CONFIG[mode]; const workflow = getWorkflow(config); return config.seed.map((values, index) => ({ id: `${mode}-${index + 1}`, values, status: index ? workflow.pending : workflow.active })) }

export default function HRWorkQueue({ mode = 'employees' }) {
  const { user } = useAuth()
  // Canvas tint follows the HR module only — Operations reuses this component
  // for its own routes and must keep the shared employee canvas.
  const hrCanvasClass = ['employees', 'departments', 'leave', 'payroll', 'recruitment'].includes(mode)
    ? 'bg-[var(--app-background)]'
    : ''
  const config = CONFIG[mode] || CONFIG.employees
  const workflow = getWorkflow(config)
  const storageKey = `kini:${mode}:work-queue`
  const [rows, setRows] = useState(() => {
    try { const saved = JSON.parse(localStorage.getItem(storageKey)); return (saved || makeRows(mode)).map((row) => ({ ...row, status: row.status === 'Active' ? workflow.active : row.status === 'Pending' ? workflow.pending : row.status })) } catch { return makeRows(mode) }
  })
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [values, setValues] = useState(() => config.fields.map(() => ''))

  const persist = (next) => { setRows(next); localStorage.setItem(storageKey, JSON.stringify(next)) }
  const recordAudit = (action, target, status, approvalStatus = 'Pending review') => {
    const organizationId = String(user?.organizationId || user?.orgId || 'demo-organization')
    const responsibleUserId = String(user?.userId || user?.id || user?.email || 'demo-hr')
    const key = `kini:hr-audit:${organizationId}`
    const current = (() => { try { return JSON.parse(localStorage.getItem(key)) || [] } catch { return [] } })()
    localStorage.setItem(key, JSON.stringify([{ id: crypto.randomUUID(), organizationId, responsibleUserId, action, target, status, timestamp: new Date().toISOString(), approvalStatus }, ...current].slice(0, 250)))
  }
  const visibleRows = useMemo(() => rows.filter((row) => {
    const matchesQuery = row.values.join(' ').toLowerCase().includes(query.trim().toLowerCase())
    return matchesQuery && (status === 'All' || row.status === status)
  }), [query, rows, status])

  const addRow = (event) => {
    event.preventDefault()
    if (values.some((value) => !String(value).trim())) return toast.error('Complete all fields.')
    persist([{ id: `${mode}-${crypto.randomUUID()}`, values: values.map((value) => value.trim()), status: workflow.pending }, ...rows])
    recordAudit(`${mode.toUpperCase()}_CREATED`, values[0], workflow.pending)
    setValues(config.fields.map(() => '')); setShowForm(false); toast.success(`${config.noun} added.`)
  }

  const toggleStatus = (id) => {
    const target = rows.find((row) => row.id === id)
    const nextStatus = target?.status === workflow.active ? workflow.pending : workflow.active
    persist(rows.map((row) => row.id === id ? { ...row, status: nextStatus } : row))
    recordAudit(`${mode.toUpperCase()}_STATUS_UPDATED`, target?.values?.[0] || id, nextStatus, nextStatus === workflow.active ? 'HR approved' : 'Pending review')
    toast.success('Status updated.')
  }

  return (
    <section className={`mx-auto w-full max-w-[1600px] space-y-3 ${hrCanvasClass}`}>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-blue-600">HR & Operations</p><h1 className="mt-0.5 text-2xl font-bold text-slate-900 dark:text-white">{config.title}</h1><p className="mt-0.5 text-sm text-slate-500">Manage, review and approve {config.noun} records.</p></div>
        <button onClick={() => setShowForm((open) => !open)} className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-sm hover:bg-blue-700"><Plus size={16} /> Add {config.noun}</button>
      </header>

      <div className="grid gap-2 sm:grid-cols-3">
        {[['Total records', rows.length], [workflow.activeLabel, rows.filter((r) => r.status === workflow.active).length], [workflow.pendingLabel, rows.filter((r) => r.status === workflow.pending).length]].map(([label, value]) => <div key={label} className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 px-3 py-2 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:to-slate-900/70"><div className="flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p><span className="h-1.5 w-1.5 rounded-full bg-blue-500" /></div><p className="mt-0.5 text-lg font-extrabold leading-6 text-slate-900 dark:text-white">{value}</p></div>)}
      </div>

      {showForm && <form onSubmit={addRow} className="grid gap-3 rounded-2xl border border-blue-200 bg-blue-50/50 p-4 sm:grid-cols-3 dark:border-blue-900 dark:bg-blue-950/20">{config.fields.map((field, index) => <label key={field} className="text-xs font-bold text-slate-600 dark:text-slate-300">{field}<input value={values[index]} onChange={(event) => setValues((current) => current.map((value, i) => i === index ? event.target.value : value))} className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900" /></label>)}<div className="flex gap-2 sm:col-span-3"><button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white">Save</button><button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold">Cancel</button></div></form>}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-2 border-b border-slate-200 p-2.5 sm:flex-row dark:border-slate-700"><label className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${config.title.toLowerCase()}...`} className="h-9 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800" /></label><label className="relative"><Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} /><select value={status} onChange={(event) => setStatus(event.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-sm dark:border-slate-700 dark:bg-slate-800"><option>All</option><option>{workflow.active}</option><option>{workflow.pending}</option></select></label></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500 dark:bg-slate-800/70"><tr>{config.fields.map((field) => <th key={field} className="px-4 py-2.5">{field}</th>)}<th className="px-4 py-2.5">Status</th><th className="px-4 py-2.5 text-right">Action</th></tr></thead><tbody>{visibleRows.map((row) => <tr key={row.id} className="border-t border-slate-100 transition hover:bg-slate-50/70 dark:border-slate-800 dark:hover:bg-slate-800/30">{row.values.map((value, index) => <td key={`${row.id}-${config.fields[index]}`} className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-200">{value}</td>)}<td className="px-4 py-2.5"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${row.status === workflow.active ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{row.status}</span></td><td className="px-4 py-2.5 text-right"><button onClick={() => toggleStatus(row.id)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-blue-600 hover:bg-blue-50 dark:border-slate-700"><CheckCircle2 size={13} /> {row.status === workflow.active ? workflow.deactivateAction : workflow.activateAction}</button></td></tr>)}</tbody></table></div>
        {!visibleRows.length && <div className="flex flex-col items-center gap-2 p-10 text-slate-400"><Users size={28} /><p>No matching records.</p></div>}
      </div>
      <p className="text-xs text-slate-400">Changes are saved in this browser until the configured backend API is available.</p>
    </section>
  )
}
