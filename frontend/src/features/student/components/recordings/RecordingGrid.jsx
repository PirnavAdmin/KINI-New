import PropTypes from 'prop-types'
import RecordingCard from './RecordingCard'
import { recordingShape } from '@features/student/utils/recordings'

export default function RecordingGrid({ recordings, savedIds, onToggleSave, onWatch }) {
  return <div className="ksx-rec-grid">
    {recordings.map((recording) => (
      <RecordingCard key={recording.id} recording={recording} saved={savedIds.has(recording.id)} onToggleSave={onToggleSave} onWatch={onWatch} />
    ))}
  </div>
}

RecordingGrid.propTypes = {
  recordings: PropTypes.arrayOf(recordingShape).isRequired,
  savedIds: PropTypes.instanceOf(Set).isRequired,
  onToggleSave: PropTypes.func.isRequired,
  onWatch: PropTypes.func.isRequired,
}

export function RecordingGridSkeleton({ count = 4 }) {
  return <div className="ksx-rec-grid" aria-busy="true" aria-label="Loading recordings">
    {Array.from({ length: count }, (_, index) => (
      <div key={index} className="ksl-card ksx-rec-card">
        <div className="ksx-rec-thumb animate-pulse" style={{ background: '#e8eef5' }} />
        <div className="ksx-rec-card__body">
          <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-3 w-3/5 animate-pulse rounded bg-slate-100" />
          <div className="mt-3 h-9 w-full animate-pulse rounded-xl bg-slate-100" />
        </div>
      </div>
    ))}
  </div>
}

RecordingGridSkeleton.propTypes = { count: PropTypes.number }
