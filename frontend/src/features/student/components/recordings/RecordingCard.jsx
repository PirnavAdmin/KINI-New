import PropTypes from 'prop-types'
import { ArrowRight, Bookmark, CalendarDays, Clock3, Play, UserRound } from 'lucide-react'
import { recordingShape } from '@features/student/utils/recordings'

export function RecordingThumb({ recording, onPlay }) {
  return <button type="button" className="ksx-rec-thumb" onClick={onPlay} aria-label={`Play ${recording.title}`}>
    {recording.thumbnailUrl
      ? <img src={recording.thumbnailUrl} alt="" loading="lazy" />
      : <span className="ksx-rec-thumb__placeholder" aria-hidden="true">{recording.courseName || 'Recording'}</span>}
    <span className="ksx-rec-thumb__play" aria-hidden="true"><Play /></span>
    {recording.durationLabel && <span className="ksx-rec-thumb__time">{recording.durationLabel}</span>}
  </button>
}

RecordingThumb.propTypes = { recording: recordingShape.isRequired, onPlay: PropTypes.func.isRequired }

export default function RecordingCard({ recording, saved, onToggleSave, onWatch }) {
  return <article className="ksl-card ksx-rec-card">
    <RecordingThumb recording={recording} onPlay={() => onWatch(recording)} />
    <div className="ksx-rec-card__body">
      <div className="ksx-rec-card__top">
        {recording.courseName ? <span className="ksl-pill ksl-pill--sm ksl-pill--navy ksx-rec-card__course">{recording.courseName}</span> : <span />}
        <button type="button" className={`ksx-icon-btn ksx-rec-save ${saved ? 'is-saved' : ''}`} aria-pressed={saved} aria-label={saved ? `Remove ${recording.title} from saved` : `Save ${recording.title}`} onClick={() => onToggleSave(recording.id)}>
          <Bookmark />
        </button>
      </div>
      <h3 className="ksx-rec-card__title" title={recording.title}>{recording.title}</h3>
      <ul className="ksx-rec-meta">
        {recording.mentorName && <li><UserRound aria-hidden="true" />{recording.mentorName}</li>}
        {recording.dateLabel && <li><CalendarDays aria-hidden="true" />{recording.dateLabel}</li>}
        {recording.durationLabel && <li><Clock3 aria-hidden="true" />{recording.durationLabel}</li>}
      </ul>
      <button type="button" className="ksl-btn ksl-btn--orange ksl-btn--block" onClick={() => onWatch(recording)} disabled={!recording.url}>
        Watch Recording<ArrowRight />
      </button>
    </div>
  </article>
}

RecordingCard.propTypes = {
  recording: recordingShape.isRequired,
  saved: PropTypes.bool,
  onToggleSave: PropTypes.func.isRequired,
  onWatch: PropTypes.func.isRequired,
}
