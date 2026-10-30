import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Copy,
  Edit3,
  Eye,
  FileText,
  GraduationCap,
  History,
  Loader2,
  Mic,
  MonitorPlay,
  Play,
  Settings2,
  ShieldCheck,
  StopCircle,
  Trash2,
  Upload,
  Users,
  Video,
  X,
} from 'lucide-react'
import StatusBadge from '@shared/components/StatusBadge'
import { Field, Section, TinyButton } from './LiveClassPrimitives'
import { formatDateTime, pickFirst } from '../utils/dateUtils'
import { isLiveClassClosed } from '../utils/liveClassMappers'

export default function LiveClassDrawer({
  record,
  open,
  onClose,
  onJoin,
  onEdit,
  onStart,
  onEnd,
  onCancel,
  onAttendance,
  onNotes,
  onRecording,
  onCopy,
  mediaLoading,
  selectedPdf,
  selectedRecording,
  pendingAction,
}) {
  useEffect(() => {
    if (!open) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, open])

  if (!record) return null

  const pdfUrl = pickFirst(selectedPdf || {}, ['url', 'fileUrl', 'pdfUrl', 'documentUrl']);
  const pdfTitle = pickFirst(selectedPdf || {}, ['title', 'fileName', 'name']) || 'Study material';
  const recordingUrl = pickFirst(selectedRecording || {}, ['url', 'recordingUrl', 'link']) || record.recordingUrl;
  const recordingTitle = pickFirst(selectedRecording || {}, ['title', 'name']) || record.title;
  const recordingSource = pickFirst(selectedRecording || {}, ['source', 'platform']) || record.platform;

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-slate-950/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: 460 }}
            animate={{ x: 0 }}
            exit={{ x: 460 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            role="dialog"
            aria-modal="true"
            aria-label="Live Class Details"
            className="fixed bottom-0 right-0 top-[88px] z-[100] flex max-h-[calc(100dvh-88px)] w-full max-w-[760px] flex-col overflow-hidden border-l border-slate-200/70 bg-white shadow-2xl dark:border-slate-700/60 dark:bg-slate-950 xl:max-w-[820px]"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200/70 bg-white px-4 py-3 dark:border-slate-700/60 dark:bg-slate-950 sm:px-5">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">Live Class Details</p>
                <h2 className="mt-1 truncate text-[17px] font-bold text-slate-900 dark:text-white">{record.title}</h2>
              </div>
              <button type="button" onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-[#0f55f7]/30 hover:text-[#0f55f7] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-5">
              <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-700/60 dark:bg-slate-900/60">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={record.statusTone} label={record.statusLabel} pulse={record.status === 'live'} />
                  <StatusBadge status={record.attendancePercentage >= 90 ? 'success' : 'default'} label={`${record.attendancePercentage || 0}% Attendance`} />
                  <button type="button" onClick={() => onCopy(record.meetingUrl)} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white px-2.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-100 dark:bg-slate-950/70 dark:text-slate-300">
                    <Copy className="h-3.5 w-3.5" /> Copy link
                  </button>
                </div>
              </div>

              <Section title="Overview" icon={BookOpen}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Description" value={record.description || 'No description provided'} icon={FileText} />
                  <Field label="Course" value={record.courseName} icon={GraduationCap} />
                  <Field label="Batch" value={record.batchName} icon={GraduationCap} />
                  <Field label="Mentor" value={record.mentorName} icon={Users} />
                </div>
              </Section>

              <Section title="Meeting" icon={MonitorPlay}>
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Platform" value={record.platform} icon={MonitorPlay} />
                    <Field label="Date & Time" value={`${record.dateLabel || 'Not Available'} • ${record.timeLabel || 'Not Available'}`} icon={CalendarDays} />
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-900/[0.035] dark:bg-slate-800/70 dark:ring-white/[0.05]">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">Meeting Link</p>
                    {record.meetingUrl ? (
                      <a
                        href={record.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 block break-words text-sm font-semibold leading-6 text-[#0f55f7] underline decoration-[#0f55f7]/25 underline-offset-4 hover:decoration-[#0f55f7]/60"
                      >
                        {record.meetingUrl}
                      </a>
                    ) : (
                      <p className="mt-1 break-words text-sm font-semibold leading-6 text-slate-900 dark:text-white">Not Available</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {record.meetingUrl && !isLiveClassClosed(record) && <TinyButton variant="primary" icon={Video} onClick={() => onJoin(record)} className="h-9 px-3 text-xs">Join Meeting</TinyButton>}
                    {record.status === 'live' ? (
                      <TinyButton
                        variant="secondary"
                        icon={StopCircle}
                        onClick={() => onEnd(record)}
                        disabled={pendingAction?.id === record.id}
                        className="h-9 px-3 text-xs"
                      >
                        {pendingAction?.id === record.id && pendingAction.type === 'end' ? 'Ending…' : 'End Class'}
                      </TinyButton>
                    ) : !['completed', 'cancelled', 'canceled', 'ended'].includes(String(record.status || '').toLowerCase()) ? (
                      <TinyButton
                        variant="secondary"
                        icon={Play}
                        onClick={() => onStart(record)}
                        disabled={pendingAction?.id === record.id}
                        className="h-9 px-3 text-xs"
                      >
                        {pendingAction?.id === record.id && pendingAction.type === 'start' ? 'Starting…' : 'Start Class'}
                      </TinyButton>
                    ) : null}
                  </div>
                </div>
              </Section>

              <Section title="Attendance" icon={ClipboardList}>
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Students" value={String(record.studentsCount || 0)} icon={Users} />
                    <Field label="Attendance Rate" value={`${record.attendancePercentage || 0}%`} icon={ShieldCheck} />
                  </div>
                  <TinyButton variant="secondary" icon={Eye} onClick={() => onAttendance(record)} className="h-9 px-3 text-xs">View / Edit Attendance</TinyButton>
                </div>
              </Section>

              <Section title="Recording" icon={Video}>
                {mediaLoading ? (
                  <p className="flex items-center gap-2 text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin" /> Loading recording…</p>
                ) : recordingUrl ? (
                  <div className="space-y-2">
                    <Field label="Title" value={recordingTitle} icon={Video} />
                    <Field label="Source" value={recordingSource} icon={MonitorPlay} />
                    <div className="flex flex-wrap gap-2">
                      <a href={recordingUrl} target="_blank" rel="noreferrer">
                        <TinyButton variant="secondary" icon={Play} className="h-9 px-3 text-xs">Open Recording</TinyButton>
                      </a>
                      <TinyButton variant="secondary" icon={Settings2} onClick={() => onRecording(record)} className="h-9 px-3 text-xs">Replace</TinyButton>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-start gap-2">
                    <p className="text-sm text-slate-400">No recording has been uploaded for this class yet.</p>
                    <TinyButton variant="secondary" icon={Mic} onClick={() => onRecording(record)} className="h-9 px-3 text-xs">Upload Recording</TinyButton>
                  </div>
                )}
              </Section>

              <Section title="Documents" icon={FileText}>
                {mediaLoading ? (
                  <p className="flex items-center gap-2 text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin" /> Loading documents…</p>
                ) : pdfUrl ? (
                  <div className="space-y-2">
                    <Field label="Study Material" value={pdfTitle} icon={FileText} />
                    <a href={pdfUrl} target="_blank" rel="noreferrer">
                      <TinyButton variant="secondary" icon={FileText} className="h-9 px-3 text-xs">Open Document</TinyButton>
                    </a>
                  </div>
                ) : (
                  <div className="flex flex-col items-start gap-2">
                    <p className="text-sm text-slate-400">No study material has been uploaded for this class yet.</p>
                    <TinyButton variant="secondary" icon={Upload} onClick={() => onNotes(record)} className="h-9 px-3 text-xs">Upload Document</TinyButton>
                  </div>
                )}
                {record.resources?.length ? (
                  <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                    {record.resources.slice(0, 3).map((resource) => (
                      <div key={resource} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:bg-slate-800/70 dark:text-slate-200">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span>{resource}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </Section>

              <Section title="Notes" icon={FileText}>
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{record.notesText || 'No notes available for this class.'}</p>
              </Section>

              <Section title="Audit Trail" icon={History}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Created By" value={record.createdBy || 'Not Available'} icon={Users} />
                  <Field label="Updated By" value={record.updatedBy || 'Not Available'} icon={Users} />
                  <Field label="Created Date" value={record.createdDateLabel || formatDateTime(record.createdAt)} icon={CalendarDays} />
                  <Field label="Last Updated" value={record.updatedDateLabel || formatDateTime(record.updatedAt)} icon={CalendarDays} />
                </div>
              </Section>
            </div>

            <div className="border-t border-slate-200/70 bg-white px-4 py-3 dark:border-slate-700/60 dark:bg-slate-950 sm:px-5">
              <div className="grid gap-2 sm:grid-cols-2">
                <TinyButton variant="secondary" icon={Edit3} onClick={() => onEdit(record)} className="h-10 text-sm">Edit</TinyButton>
                {record.status === 'live' ? (
                  <TinyButton
                    variant="primary"
                    icon={StopCircle}
                    onClick={() => onEnd(record)}
                    disabled={pendingAction?.id === record.id}
                    className="h-10 text-sm"
                  >
                    {pendingAction?.id === record.id && pendingAction.type === 'end' ? 'Ending…' : 'End Class'}
                  </TinyButton>
                ) : !['completed', 'cancelled', 'canceled', 'ended'].includes(String(record.status || '').toLowerCase()) ? (
                  <TinyButton
                    variant="primary"
                    icon={Play}
                    onClick={() => onStart(record)}
                    disabled={pendingAction?.id === record.id}
                    className="h-10 text-sm"
                  >
                    {pendingAction?.id === record.id && pendingAction.type === 'start' ? 'Starting…' : 'Start Class'}
                  </TinyButton>
                ) : null}
                {/* Cancellation only makes sense before a class has started or
                    concluded — matches the status/action table (Scheduled:
                    Start/Edit/Cancel; Live: End/Attendance; Completed/Cancelled:
                    view-only). */}
                {!['live', 'completed', 'cancelled', 'canceled', 'ended'].includes(String(record.status || '').toLowerCase()) && (
                  <TinyButton variant="ghost" icon={Trash2} onClick={() => onCancel(record)} className="h-10 text-sm">Cancel</TinyButton>
                )}
                <TinyButton variant="secondary" icon={Eye} onClick={() => onAttendance(record)} className="h-10 text-sm">View Attendance</TinyButton>
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  )
}
