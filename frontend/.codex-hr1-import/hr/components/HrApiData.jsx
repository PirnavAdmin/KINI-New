import StatsCard from '@shared/components/StatsCard'
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
export function HrSummary({ value }) {
  const fields = Object.entries(value?.summary ?? value ?? {}).filter(([key, item]) => visible(key) && typeof item === 'number' && !/id$/i.test(key))
  return fields.length ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{fields.map(([key, item]) => <StatsCard key={key} label={fieldLabel(key)} value={item} accentColor="#133b5d" />)}</div> : <p className="text-sm text-slate-500">No summary data available.</p>
}
export function HrAnalytics({ value }) {
  const rows = hrList(value)
  const chart = rows.map(row => ({ label: hrField(row, 'label', 'name', 'month', 'date', 'department', 'departmentName', 'role', 'status', 'type'), value: hrField(row, 'count', 'value', 'total', 'score', 'averageScore', 'performanceScore', 'percentage') }))
  return chart.length && chart.every(row => row.label != null && typeof row.value === 'number') ? <HRMiniBars data={chart} color="#008b94" /> : <HrRecord value={value} />
}
