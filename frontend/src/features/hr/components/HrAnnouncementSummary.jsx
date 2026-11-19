import { CalendarClock, Clock, FileText, Megaphone, Send } from 'lucide-react'
import { HrKpis } from './portal/HrPortalKit'
import { announcementSummaryFields } from '../services/hrAnnouncementData'
import { fieldLabel } from '../services/hrFormOptions'

const icons = [Megaphone, Send, CalendarClock, FileText, Clock, Send]
const tones = ['blue', 'green', 'purple', 'orange', 'red', 'green']
// Short labels so six cards fit one row without wrapping.
const LABELS = { totalAnnouncements: 'Total', recentlyPublished: 'Last 30 Days' } // published in the last 30 days

export default function HrAnnouncementSummary({ value }) {
  // 6 cards: one row on wide screens; hr-portal.css drops to 3 (≤1280px) and 2 (≤760px) per row.
  return <HrKpis columns={6} items={announcementSummaryFields.map((key, index) => ({
    key, label: LABELS[key] ?? fieldLabel(key), value: value?.[key] ?? '—',
    icon: icons[index], tone: tones[index], sub: value?.[key] == null ? 'Unavailable' : undefined,
  }))} />
}
