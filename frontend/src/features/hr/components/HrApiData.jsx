import './hrSummary.css'
import HRMiniBars from './HRMiniBars'
import { hrList, hrField, hrText } from '../services/hrApi'
import { fieldLabel } from '../services/hrFormOptions'

// Do not render auth material returned accidentally inside detail payloads.
const visible = key => !/password|token|secret|qrcode/i.test(key)
export function HrRecord({ value, depth = 0 }) {
  if (value == null || value === '') return <p className="p-3 text-sm text-slate-500">No data available.</p>
  if (typeof value !== 'object') return <span>{hrText(value)}</span>
  if (depth > 4) return null
  if (Array.isArray(value)) return value.length ? <div className="space-y-3">{value.map((item, index) => <div key={index} className="rounded-xl border border-slate-200 p-3"><HrRecord value={item} depth={depth + 1} /></div>)}</div> : <p className="p-3 text-sm text-slate-500">No records available.</p>
  return <dl className="grid gap-3 sm:grid-cols-2">{Object.entries(value).filter(([key]) => visible(key)).map(([key, item]) => <div key={key} className="min-w-0 break-words"><dt className="text-xs font-semibold text-slate-500">{fieldLabel(key)}</dt><dd className="mt-1 text-sm"><HrRecord value={item} depth={depth + 1} /></dd></div>)}</dl>
}
export function HrSummary({ value, hiddenFields = [] }) {
  const fields = Object.entries(value?.summary ?? value ?? {}).filter(([key, item]) => visible(key) && !hiddenFields.some(field => field.toLowerCase() === key.toLowerCase()) && typeof item === 'number' && !/id$/i.test(key))
  return fields.length ? <dl className="hr-summary-cards" aria-label="Module summary">{fields.map(([key, item]) => <div key={key} className="hr-summary-card"><dt>{fieldLabel(key)}</dt><dd>{item}</dd></div>)}</dl> : <p className="text-sm text-slate-500">No summary data available.</p>
}
export function HrAnalytics({ value, employeeCategories = false }) {
  const rows = hrList(value)
  let chart = rows.map(row => ({ label: hrField(row, 'label', 'name', 'month', 'date', 'department', 'departmentName', 'role', 'status', 'type'), value: hrField(row, 'count', 'value', 'total', 'score', 'averageScore', 'performanceScore', 'percentage') }))
  if (employeeCategories) {
    const categoryKey = label => String(label ?? '').replace(/[^a-z]/gi, '').toLowerCase()
    const labels = { trainersmentors: 'Mentors', trainersandmentors: 'Mentors', trainer: 'Mentors', mentor: 'Mentors', mentors: 'Mentors', administrativestaff: 'HR', hr: 'HR', hrexecutive: 'HR' }
    chart = chart.filter(row => categoryKey(row.label) !== 'academicstaff').map(row => ({ ...row, label: labels[categoryKey(row.label)] ?? row.label }))
    if (!chart.length) return <p className="text-sm text-slate-500">No staff category data available.</p>
  }
  return chart.length && chart.every(row => row.label != null && typeof row.value === 'number') ? <HRMiniBars data={chart} color="#008b94" /> : <HrRecord value={value} />
}
