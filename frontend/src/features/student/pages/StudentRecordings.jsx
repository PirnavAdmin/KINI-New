import { useCallback, useEffect, useMemo, useState } from 'react'
import { BarChart3, Download, History, PlayCircle, RefreshCw, Sprout } from 'lucide-react'
import StudentPageBanner from '@features/student/components/StudentPageBanner'
import { STUDENT_BANNERS } from '@features/student/constants/studentBanners'
import RecordingStats from '@features/student/components/recordings/RecordingStats'
import RecordingFilters from '@features/student/components/recordings/RecordingFilters'
import RecordingGrid, { RecordingGridSkeleton } from '@features/student/components/recordings/RecordingGrid'
import ContinueWatching from '@features/student/components/recordings/ContinueWatching'
import RecordingEmptyState from '@features/student/components/recordings/RecordingEmptyState'
import { useStudentClassScope } from '@features/student/hooks/useStudentClassScope'
import { liveClassService } from '@features/live-classes/services/liveClassService'
import { normalizeLiveClassList } from '@features/live-classes/utils/liveClassMappers'
import { getApiErrorMessage } from '@shared/services/apiServices'
import { useAuth } from '@shared/hooks/useAuth'
import {
  filterRecordings,
  readSavedRecordings,
  toRecordingList,
  uniqueValues,
  writeSavedRecordings,
} from '@features/student/utils/recordings'

const RECORDING_FEATURES = [
  { Icon: PlayCircle, title: 'Watch Classes', text: 'Anytime, Anywhere', tone: 'violet' },
  { Icon: History, title: 'Replay Lessons', text: 'Clarify Concepts', tone: 'orange' },
  { Icon: Download, title: 'Learn at Your Pace', text: 'Flexible Learning', tone: 'green' },
  { Icon: Sprout, title: 'Build Skills', text: 'Stronger Foundation', tone: 'blue' },
]
const DEFAULT_FILTERS = { search: '', course: 'all', topic: 'all', sort: 'latest' }
const DEMO_RECORDINGS = [{
  id: 'demo-recording-react-basics',
  title: 'React JS Introduction',
  courseName: 'React JS',
  topic: 'React Fundamentals',
  mentorName: 'Lahari Gandikota',
  endAt: '2026-09-25T17:50:00',
  recordingDurationSeconds: 1920,
  recordingUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
}]

const extractRows = (value) => {
  if (Array.isArray(value)) return value
  for (const key of ['data', 'items', 'results', 'rows', 'content']) if (Array.isArray(value?.[key])) return value[key]
  return []
}

export default function StudentRecordings() {
  const { user } = useAuth()
  const scope = useStudentClassScope()
  const studentKey = user?.studentId ?? user?.StudentId ?? user?.userId ?? user?.id
  const [recordings, setRecordings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [savedIds, setSavedIds] = useState(() => readSavedRecordings(studentKey))

  const loadRecordings = useCallback(async () => {
    if (!scope.ready) return
    if (scope.error && !(user?.isDemo || localStorage.getItem('isDemo') === 'true')) {
      setRecordings([])
      setError(scope.error)
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    const isDemo = Boolean(user?.isDemo || localStorage.getItem('isDemo') === 'true')
    if (isDemo) {
      setRecordings(toRecordingList(normalizeLiveClassList(DEMO_RECORDINGS)))
      setLoading(false)
      return
    }
    try {
      const params = {}
      if (scope.courseId) params.courseId = scope.courseId
      if (scope.batchId) params.batchId = scope.batchId
      const result = await liveClassService.list(params)
      // GET /api/v1/live-classes ignores course/batch params: keep only this student's enrollments.
      setRecordings(toRecordingList(normalizeLiveClassList(extractRows(result)).filter((item) => scope.allows(item))))
    } catch (loadError) {
      setRecordings([])
      setError(user?.isDemo ? '' : getApiErrorMessage(loadError, 'Unable to load your recordings.'))
    } finally {
      setLoading(false)
    }
  }, [scope, user?.isDemo])

  useEffect(() => { queueMicrotask(loadRecordings) }, [loadRecordings])

  const toggleSave = useCallback((id) => {
    setSavedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      writeSavedRecordings(studentKey, next)
      return next
    })
  }, [studentKey])

  // Recordings open the same way My Classes opens a completed class's recording.
  const watch = useCallback((recording) => {
    if (recording.url) window.open(recording.url, '_blank', 'noopener,noreferrer')
  }, [])

  const visible = useMemo(() => filterRecordings(recordings, filters), [recordings, filters])
  const continueWatching = useMemo(() => recordings.filter((recording) => recording.inProgress).slice(0, 2), [recordings])
  const stats = useMemo(() => ({
    total: recordings.length,
    watched: recordings.filter((recording) => recording.watched).length,
    inProgress: recordings.filter((recording) => recording.inProgress).length,
    saved: recordings.filter((recording) => savedIds.has(recording.id)).length,
  }), [recordings, savedIds])
  const courses = useMemo(() => uniqueValues(recordings, 'courseName'), [recordings])
  const topics = useMemo(() => uniqueValues(recordings, 'topic'), [recordings])
  const busy = loading || !scope.ready

  return <main className="ksl-page w-full px-2 py-2 sm:px-3">
    <StudentPageBanner
      banner={STUDENT_BANNERS.recordings}
      icon={BarChart3}
      eyebrow="Recordings Library"
      title="Learn Anytime,"
      highlight="Grow Every Day!"
      description="Access class recordings, revisit important concepts and learn at your own pace."
      features={RECORDING_FEATURES}
      className="ksl-banner--recordings"
    />

    <div className="ksx-stack">
      <RecordingStats {...stats} loading={busy} />
      <RecordingFilters filters={filters} onChange={setFilters} courses={courses} topics={topics} />

      {busy ? <RecordingGridSkeleton />
        : error ? <div className="ksx-alert ksx-alert--error"><span>{error}</span><button type="button" onClick={loadRecordings} className="ksl-btn ksl-btn--orange"><RefreshCw />Retry</button></div>
          : !recordings.length ? <RecordingEmptyState />
            : <>
              <ContinueWatching recordings={continueWatching} onWatch={watch} />
              {visible.length
                ? <RecordingGrid recordings={visible} savedIds={savedIds} onToggleSave={toggleSave} onWatch={watch} />
                : <RecordingEmptyState filtered onClearFilters={() => setFilters(DEFAULT_FILTERS)} />}
            </>}
    </div>
  </main>
}
