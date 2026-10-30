import { forwardRef } from 'react'
import { CalendarDays, Copy, Download, FileBarChart, Layers3, User } from 'lucide-react'
import MentorPageHero from '../MentorPageHero'
import { MENTOR_BANNERS } from '../../constants/mentorBanners'

const STATUS_CONFIG = {
  active: { label: 'Active', tone: 'green' },
  upcoming: { label: 'Upcoming', tone: 'blue' },
  completed: { label: 'Completed', tone: 'gray' },
}

const shortDate = (value) => {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(parsed)
}

function MetaItem({ icon: Icon, label, value }) {
  return (
    <div className="mph-meta-item">
      <span className="mph-meta-item__icon" aria-hidden="true"><Icon /></span>
      <span><small>{label}</small><b>{value}</b></span>
    </div>
  )
}

const WorkspaceHeader = forwardRef(function WorkspaceHeader({ batch, onExport, onShare, onGenerateReport }, ref) {
  const statusCfg = STATUS_CONFIG[batch.status] || { label: batch.status || 'Completed', tone: 'gray' }
  const start = shortDate(batch.startDate)
  const end = shortDate(batch.endDate)
  return (
    <div ref={ref}>
      <MentorPageHero
        className="mph--workspace"
        icon={Layers3}
        title={batch.batchName}
        titleAside={<span className={`mph-status mph-status--${statusCfg.tone}`}><i />{statusCfg.label}</span>}
        subtitle={[batch.courseName, batch.batchType].filter(Boolean).join(' · ')}
        meta={(
          <>
            <MetaItem icon={User} label="Mentor" value={batch.mentorName || 'Assigned mentor'} />
            <MetaItem icon={CalendarDays} label="Duration" value={start && end ? `${start} - ${end}` : start || end || 'Not scheduled'} />
            <MetaItem icon={Layers3} label="Batch Type" value={batch.batchType || 'Online'} />
          </>
        )}
        script={['Learn', 'Build', { text: 'Grow', accent: true }]}
        image={MENTOR_BANNERS.attendance.src}
        artWidth="300px"
        actions={
          <>
            <button type="button" onClick={onShare} title="Copy batch link" aria-label="Copy batch link" className="mph-btn mph-btn--round"><Copy /></button>
            <button type="button" onClick={onGenerateReport} title="Batch reports" aria-label="Open batch reports" className="mph-btn mph-btn--round"><FileBarChart /></button>
            <button type="button" onClick={onExport} className="mph-btn mph-btn--navy"><Download /> Export</button>
          </>
        }
      />
    </div>
  )
})

export default WorkspaceHeader
