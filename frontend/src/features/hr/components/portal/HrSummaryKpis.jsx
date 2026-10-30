import PropTypes from 'prop-types'
import {
  Award, BookOpen, Briefcase, Clock, FileText, Megaphone, Send, CalendarDays, CheckCircle2, Clock3, GraduationCap, Plane, Star, Target,
  TrendingUp, UserCheck, UserMinus, Users, UserX, XCircle,
} from 'lucide-react'
import { HrKpis } from './HrPortalKit'
import { fieldLabel } from '@features/hr/services/hrFormOptions'

// Keyword → icon/tone for API summary fields whose names vary per module.
const RULES = [
  [/publish/i, Send, 'green'], [/draft/i, FileText, 'orange'], [/expire/i, Clock, 'red'], [/announce/i, Megaphone, 'blue'],
  [/absent/i, UserX, 'red'], [/late/i, Clock3, 'orange'], [/present/i, UserCheck, 'green'],
  [/reject/i, XCircle, 'red'], [/approv/i, CheckCircle2, 'green'], [/pending|due/i, Clock3, 'orange'],
  [/leave|holiday/i, Plane, 'blue'], [/mentor|trainer/i, GraduationCap, 'purple'], [/hr/i, Briefcase, 'orange'],
  [/inactive/i, UserMinus, 'purple'], [/active/i, UserCheck, 'green'], [/class/i, BookOpen, 'green'],
  [/meeting/i, Users, 'blue'], [/event/i, CalendarDays, 'purple'], [/score|rating|average/i, Star, 'green'],
  [/completion|target/i, Target, 'orange'], [/top|best/i, Award, 'blue'], [/improve/i, TrendingUp, 'red'],
  [/total|employee|student|count/i, Users, 'blue'],
]
const LABELS = { hr: 'HR', hrs: 'HR', totalAnnouncements: 'Total Announcements' }
// Short captions under the value (design copy), keyed by field name pattern.
const SUBS = [[/^totalAnnouncements$/i, 'All announcements'], [/^published/i, 'Live announcements'], [/^drafts?$/i, 'Not yet published'], [/^expired/i, 'Past due announcements']]
const HIDDEN = /id$|^page|percentage$/i

/** Renders a module's numeric API summary as HR portal KPI tiles. */
export default function HrSummaryKpis({ value, hiddenFields = [], max = 6, trends = {}, onKpiClick }) {
  const source = value?.summary ?? value ?? {}
  const fields = Object.entries(source)
    .filter(([key, item]) => typeof item === 'number' && !HIDDEN.test(key) && !hiddenFields.some((field) => field.toLowerCase() === key.toLowerCase()))
    .slice(0, max)
  if (!fields.length) return <p className="text-sm text-slate-500">No summary data available.</p>
  return (
    <HrKpis
      columns={Math.min(fields.length, 6)}
      items={fields.map(([key, item]) => {
        const [, icon, tone] = RULES.find(([pattern]) => pattern.test(key)) ?? [null, Users, 'blue']
        const pctKey = Object.keys(source).find((other) => other.toLowerCase() === `${key.toLowerCase()}percentage`)
        return {
          key,
          label: LABELS[key] ?? fieldLabel(key),
          value: `${Number.isInteger(item) ? item : Math.round(item * 10) / 10}${/rate$/i.test(key) ? '%' : ''}`,
          sub: trends[key]?.note ?? (pctKey ? `${source[pctKey]}% of total` : SUBS.find(([pattern]) => pattern.test(key))?.[1]),
          trend: trends[key]?.label,
          trendDir: trends[key]?.dir,
          icon,
          tone,
          onClick: onKpiClick ? onKpiClick(key, LABELS[key] ?? fieldLabel(key)) : undefined,
        }
      })}
    />
  )
}

HrSummaryKpis.propTypes = { value: PropTypes.any, hiddenFields: PropTypes.array, max: PropTypes.number, trends: PropTypes.object, onKpiClick: PropTypes.func }
