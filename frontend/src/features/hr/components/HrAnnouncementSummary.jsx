import { Clock, FileText, Megaphone, Send } from 'lucide-react'
import { HrKpis } from './portal/HrPortalKit'
import { announcementSummaryFields } from '../services/hrAnnouncementData'
import { fieldLabel } from '../services/hrFormOptions'

const icons = [Megaphone, Send, FileText, Clock, Send]
const tones = ['blue', 'green', 'orange', 'red', 'green']

export default function HrAnnouncementSummary({ value }) {
  return <HrKpis columns={5} items={announcementSummaryFields.map((key, index) => ({
    key, label: fieldLabel(key), value: value?.[key] ?? '—',
    icon: icons[index], tone: tones[index], sub: value?.[key] == null ? 'Unavailable' : undefined,
  }))} />
}
