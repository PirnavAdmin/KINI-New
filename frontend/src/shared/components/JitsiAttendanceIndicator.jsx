import { CheckCircle2, CircleAlert, Loader2, Radio, UserCheck } from 'lucide-react'

// Attendance progress for an embedded Jitsi session (see JitsiMeeting.jsx).
export const JITSI_ATTENDANCE_STATUS = {
  connecting: { label: 'Connecting…', tone: 'neutral', icon: Loader2, spin: true },
  waiting: { label: 'Waiting to enter the meeting', tone: 'neutral', icon: Radio },
  joining: { label: 'Joining class…', tone: 'info', icon: Loader2, spin: true },
  started: { label: 'Attendance Started', tone: 'success', icon: UserCheck },
  'in-class': { label: 'In Class', tone: 'success', icon: Radio },
  leaving: { label: 'Leaving…', tone: 'info', icon: Loader2, spin: true },
  recorded: { label: 'Attendance Recorded', tone: 'success', icon: CheckCircle2 },
  'join-failed': { label: 'Attendance not started', tone: 'danger', icon: CircleAlert },
  'leave-failed': { label: 'Leave not recorded', tone: 'danger', icon: CircleAlert },
}

const TONES = {
  light: {
    neutral: 'bg-slate-100 text-slate-600',
    info: 'bg-blue-50 text-blue-700',
    success: 'bg-emerald-50 text-emerald-700',
    danger: 'bg-rose-50 text-rose-700',
  },
  dark: {
    neutral: 'bg-white/10 text-slate-200',
    info: 'bg-blue-500/15 text-blue-300',
    success: 'bg-emerald-500/15 text-emerald-300',
    danger: 'bg-rose-500/15 text-rose-300',
  },
}

export default function JitsiAttendanceIndicator({ status, tone = 'light', className = '' }) {
  const config = JITSI_ATTENDANCE_STATUS[status]
  if (!config) return null
  const Icon = config.icon
  return (
    <span
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${TONES[tone][config.tone]} ${className}`}
    >
      <Icon className={`h-3.5 w-3.5 ${config.spin ? 'animate-spin' : ''}`} aria-hidden="true" />
      {config.label}
    </span>
  )
}
