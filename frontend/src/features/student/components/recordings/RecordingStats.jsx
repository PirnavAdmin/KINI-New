import PropTypes from 'prop-types'
import { Bookmark, CheckCircle2, Clock3, PlayCircle } from 'lucide-react'
import StudentStatCard from '@features/student/components/StudentStatCard'

export default function RecordingStats({ total, watched, inProgress, saved, loading }) {
  const show = (value) => (loading ? '—' : value)
  return <div className="ksx-stats" aria-label="Recording summary">
    <StudentStatCard valueFirst tone="violet" Icon={PlayCircle} label="Total Recordings" value={show(total)} />
    <StudentStatCard valueFirst tone="green" Icon={CheckCircle2} label="Watched" value={show(watched)} />
    <StudentStatCard valueFirst tone="orange" Icon={Clock3} label="In Progress" value={show(inProgress)} />
    <StudentStatCard valueFirst tone="red" Icon={Bookmark} label="Saved" value={show(saved)} />
  </div>
}

RecordingStats.propTypes = {
  total: PropTypes.number.isRequired,
  watched: PropTypes.number.isRequired,
  inProgress: PropTypes.number.isRequired,
  saved: PropTypes.number.isRequired,
  loading: PropTypes.bool,
}
