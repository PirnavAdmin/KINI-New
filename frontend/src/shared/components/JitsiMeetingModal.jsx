import { useRef, useState } from 'react'
import { ArrowLeft, ExternalLink, Loader2, LogOut, TriangleAlert, Users } from 'lucide-react'
import JitsiMeeting from './JitsiMeeting'
import JitsiAttendanceIndicator from './JitsiAttendanceIndicator'

const pick = (...values) => values.find((value) => value != null && value !== '') ?? ''

// Full-screen overlay around <JitsiMeeting/> (used by the mentor portal).
// All join → /join → /leave → dispose logic lives in JitsiMeeting; this file
// only renders the chrome. Mount it only while a class is being joined.
export default function JitsiMeetingModal({ liveClass, onClose }) {
  const meetingRef = useRef(null)
  const [status, setStatus] = useState('connecting')
  const [detail, setDetail] = useState('')

  const title = pick(liveClass?.title, liveClass?.classTitle, liveClass?.topic, 'Live class')
  const statusLabel = pick(liveClass?.statusLabel, liveClass?.computedStatus, liveClass?.status)
  const courseName = pick(liveClass?.courseName, liveClass?.course)
  const batchName = pick(liveClass?.batchName, liveClass?.batch)
  const mentorName = pick(liveClass?.mentorName, liveClass?.mentor)
  const isError = status === 'error' || status === 'unsupported'
  const isLoading = status === 'connecting'

  const handleStatus = (next, info) => {
    setStatus(next)
    setDetail(typeof info === 'string' ? info : '')
  }

  const handleManualLeave = () => {
    if (!meetingRef.current?.hangup()) onClose?.()
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-950" role="dialog" aria-modal="true" aria-label={`${title} meeting`}>
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-slate-900 px-4 py-3 text-white sm:px-6">
        <button
          type="button"
          onClick={handleManualLeave}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-sm font-semibold">{title}</p>
        </div>
        {statusLabel && (
          <span className="shrink-0 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
            {statusLabel}
          </span>
        )}
      </header>

      <div className="relative min-h-0 flex-1">
        <JitsiMeeting ref={meetingRef} liveClass={liveClass} onStatusChange={handleStatus} onEnded={() => onClose?.()} />
        {isLoading && (
          <div className="absolute inset-0 grid place-items-center bg-slate-950 text-white">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-sm text-slate-300">Joining meeting…</p>
            </div>
          </div>
        )}
        {isError && (
          <div className="absolute inset-0 grid place-items-center bg-slate-950 p-6 text-white">
            <div className="max-w-sm text-center">
              <TriangleAlert className="mx-auto h-8 w-8 text-amber-400" />
              <p className="mt-3 text-sm font-semibold">
                {status === 'unsupported'
                  ? 'This class uses a non-Jitsi meeting link, so it cannot be embedded here.'
                  : detail || 'Unable to open this meeting.'}
              </p>
              <div className="mt-4 flex justify-center gap-2">
                {status === 'unsupported' && detail && (
                  <a href={detail} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20">
                    <ExternalLink className="h-4 w-4" /> Open link
                  </a>
                )}
                <button type="button" onClick={() => onClose?.()} className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-slate-900 px-4 py-3 text-xs text-slate-300 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {courseName && <span>{courseName}</span>}
          {batchName && <span className="text-slate-500">•</span>}
          {batchName && <span>{batchName}</span>}
          {mentorName && <span className="text-slate-500">•</span>}
          {mentorName && (
            <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{mentorName}</span>
          )}
          {!isError && !isLoading && <JitsiAttendanceIndicator status={status} tone="dark" />}
        </div>
        {!isError && !isLoading && (
          <button
            type="button"
            onClick={handleManualLeave}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
          >
            <LogOut className="h-3.5 w-3.5" />
            Leave meeting
          </button>
        )}
      </footer>
    </div>
  )
}
