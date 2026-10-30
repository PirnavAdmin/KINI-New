import PropTypes from 'prop-types'
import { ArrowRight, CalendarDays, History, UserRound } from 'lucide-react'
import { RecordingThumb } from './RecordingCard'
import { recordingShape } from '@features/student/utils/recordings'

// Rendered only when the API reports partial watch progress for a recording.
export default function ContinueWatching({ recordings, onWatch }) {
  if (!recordings.length) return null
  return <section className="ksl-card">
    <h2 className="ksl-card__title"><History className="ksl-card__title-icon ksl-card__title-icon--orange" />Continue Watching</h2>
    <div className="ksx-rec-continue">
      {recordings.map((recording) => (
        <article key={recording.id} className="ksx-rec-continue__item">
          <RecordingThumb recording={recording} onPlay={() => onWatch(recording)} />
          <div className="ksx-rec-continue__body">
            <h3 className="ksx-rec-card__title" title={recording.title}>{recording.title}</h3>
            <ul className="ksx-rec-meta">
              {recording.courseName && <li>{recording.courseName}</li>}
              {recording.mentorName && <li><UserRound aria-hidden="true" />{recording.mentorName}</li>}
              {recording.dateLabel && <li><CalendarDays aria-hidden="true" />{recording.dateLabel}</li>}
            </ul>
            <div className="ksx-rec-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(recording.progress)} aria-label={`${recording.title} progress`}>
              <span style={{ width: `${recording.progress}%` }} />
            </div>
            <p className="ksx-rec-progress__label">{Math.round(recording.progress)}% watched</p>
            <button type="button" className="ksl-btn ksl-btn--navy" onClick={() => onWatch(recording)} disabled={!recording.url}>Continue Watching<ArrowRight /></button>
          </div>
        </article>
      ))}
    </div>
  </section>
}

ContinueWatching.propTypes = {
  recordings: PropTypes.arrayOf(recordingShape).isRequired,
  onWatch: PropTypes.func.isRequired,
}
