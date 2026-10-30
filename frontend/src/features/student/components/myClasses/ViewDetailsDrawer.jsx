import { AnimatePresence, motion } from 'framer-motion'
import { X, CalendarDays, Clock3, Link2, Users, FileText, BookOpen, CheckCircle2, ShieldCheck, FileDown, Video } from 'lucide-react'
import { getStudentJoinState } from '@features/live-classes/utils/liveClassMappers'
import StatusBadge from './StatusBadge'
import AttendanceChip from './AttendanceChip'
import MentorInfo from './MentorInfo'
import MeetingPlatform from './MeetingPlatform'
import CountdownTimer from './CountdownTimer'

const List = ({ items = [] }) => (
  <div className="space-y-1.5">
    {items.length > 0 ? items.map((item) => (
      <div key={item} className="flex items-start gap-2 rounded-xl bg-slate-50 px-2.5 py-1.5 text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#06b6a8]" />
        <span>{item}</span>
      </div>
    )) : <p className="text-sm text-slate-400">No details provided.</p>}
  </div>
)

export default function ViewDetailsDrawer({
  classItem,
  open,
  onClose,
  onJoin,
  onOpenResource,
  joining,
}) {
  return (
    <AnimatePresence>
      {open && classItem && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: 420 }}
            animate={{ x: 0 }}
            exit={{ x: 420 }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[460px] flex-col border-l border-slate-200/70 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.16)] dark:border-slate-700/60 dark:bg-slate-950"
          >
            <div className="flex items-center justify-between border-b border-slate-200/70 px-4 py-3 dark:border-slate-700/60">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Class Details</p>
                <h2 className="mt-1 text-[14px] font-bold text-slate-900 dark:text-white">{classItem.title}</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-[#0f55f7]/25 hover:text-[#0f55f7] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="rounded-[20px] bg-[linear-gradient(135deg,rgba(15,85,247,0.08),rgba(124,58,237,0.08),rgba(6,182,168,0.08))] p-3 ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06]">
                <div className="flex flex-wrap items-center gap-1.5">
                  <StatusBadge status={classItem.status} pulse={classItem.status === 'live'} />
                  <AttendanceChip status={classItem.attendanceStatus} />
                </div>

                <div className="mt-3 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-300">{classItem.courseName}</p>
                      <p className="mt-1 text-[18px] font-black tracking-tight text-slate-900 dark:text-white">{classItem.title}</p>
                      <p className="mt-1 text-[13px] leading-5 text-slate-600 dark:text-slate-300">{classItem.description}</p>
                    </div>
                    <MentorInfo name={classItem.mentorName} avatar={classItem.mentorAvatar} />
                  </div>

                  <div className="grid gap-2.5 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white/85 p-2.5 shadow-sm dark:bg-slate-950/70">
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <CalendarDays className="h-4 w-4 text-[#0f55f7]" />
                        Schedule
                      </div>
                      <p className="mt-1.5 text-sm font-semibold text-slate-900 dark:text-white">{classItem.dateLabel}</p>
                      <p className="mt-1 text-xs text-slate-500">{classItem.timeLabel}</p>
                    </div>
                    <div className="rounded-2xl bg-white/85 p-2.5 shadow-sm dark:bg-slate-950/70">
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Clock3 className="h-4 w-4 text-[#06b6a8]" />
                        Countdown
                      </div>
                      <div className="mt-1.5">
                        <CountdownTimer targetDate={classItem.startAt} />
                      </div>
                      <p className="mt-1 text-xs text-slate-500">Duration: {classItem.durationLabel}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3.5">
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200/70 bg-white p-3 dark:border-slate-700/60 dark:bg-slate-900/60">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                      <BookOpen className="h-4 w-4 text-[#0f55f7]" />
                      Topics Covered
                    </div>
                    <div className="mt-2.5">
                      <List items={classItem.topicsCovered} />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200/70 bg-white p-3 dark:border-slate-700/60 dark:bg-slate-900/60">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                      <ShieldCheck className="h-4 w-4 text-[#06b6a8]" />
                      Learning Objectives
                    </div>
                    <div className="mt-2.5">
                      <List items={classItem.learningObjectives} />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white p-3 dark:border-slate-700/60 dark:bg-slate-900/60">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                    <Link2 className="h-4 w-4 text-[#7c3aed]" />
                    Meeting Platform
                  </div>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <MeetingPlatform platform={classItem.platform} className="!px-2.5 !py-1" />
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      Students: {Number(classItem.studentsCount || 0)}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white p-3 dark:border-slate-700/60 dark:bg-slate-900/60">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                    <FileText className="h-4 w-4 text-[#f59e0b]" />
                    Resources
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {(classItem.resources || []).length > 0 ? classItem.resources.map((resource) => (
                      <span key={resource} className="inline-flex items-center gap-1 rounded-full bg-[#0f55f7]/8 px-2.5 py-1 text-[11px] font-semibold text-[#0f55f7]">
                        <FileDown className="h-3 w-3" />
                        {resource.replace(' Available', '')}
                      </span>
                    )) : (
                      <p className="text-sm text-slate-400">Resources will appear here once available.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 border-t border-slate-200/70 bg-white/95 px-4 py-3 backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-950/95">
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => onOpenResource?.(classItem, classItem.recordingUrl ? 'recording' : 'pdf')}
                  className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-[#0f55f7]/25 hover:text-[#0f55f7] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <FileDown className="h-4 w-4" />
                  {classItem.status === 'completed' ? 'Watch Recording' : 'Download PDF'}
                </button>
                {/* Completed classes never show Join; upcoming/cancelled show a
                    disabled state driven by the backend status. */}
                {getStudentJoinState(classItem).state !== 'completed' && (
                  <button
                    type="button"
                    disabled={joining || !getStudentJoinState(classItem).canJoin}
                    onClick={() => onJoin?.(classItem)}
                    className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] px-3 text-xs font-semibold text-white shadow-[0_8px_18px_rgba(15,85,247,0.16)] transition-all hover:-translate-y-0.5 hover:scale-[1.01] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Video className="h-4 w-4" />
                    {joining ? 'Joining...' : getStudentJoinState(classItem).label}
                  </button>
                )}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
