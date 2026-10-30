import { motion } from 'framer-motion'
import { CalendarDays, Clock3, Users, FileDown, FileText, PlayCircle, CheckCheck, Video } from 'lucide-react'
import StatusBadge from './StatusBadge'
import CountdownTimer from './CountdownTimer'
import MentorInfo from './MentorInfo'
import MeetingPlatform from './MeetingPlatform'
import AttendanceChip from './AttendanceChip'

export default function ClassCard({
  item,
  onSelect,
  onJoin,
  joining,
}) {
  const isLive = item.status === 'live'
  const isCompleted = item.status === 'completed'
  const thumbnail = item.thumbnailUrl || item.thumbnail || item.imageUrl

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -2, scale: 1.002 }}
      onClick={() => onSelect?.(item)}
      className="group cursor-pointer overflow-hidden rounded-[20px] border border-white/75 bg-white/90 shadow-[0_6px_16px_rgba(15,23,42,0.035)] ring-1 ring-slate-900/[0.03] transition-all hover:border-[#0f55f7]/20 hover:shadow-[0_10px_22px_rgba(15,23,42,0.06)] dark:border-slate-700/60 dark:bg-slate-900/80"
    >
      <div className="grid gap-3 p-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.95fr)_minmax(0,0.78fr)] lg:items-stretch">
        <div className="flex min-w-0 gap-3">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f55f7] via-[#7c3aed] to-[#06b6a8] p-[1px] shadow-[0_5px_14px_rgba(15,85,247,0.12)]">
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[23px] bg-slate-950/10">
              {thumbnail ? (
                <img src={thumbnail} alt={item.title} className="h-full w-full object-cover" />
              ) : (
                <div className={`flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.32),transparent_55%)] bg-gradient-to-br ${item.thumbnailTone || 'from-[#0f55f7] via-[#7c3aed] to-[#06b6a8]'}`}>
                  <span className="text-sm font-black text-white">{item.courseCode}</span>
                </div>
              )}
            </div>
            {isLive && <span className="absolute inset-x-1.5 top-1.5 rounded-full bg-emerald-500/90 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.18em] text-white shadow-lg shadow-emerald-500/20">Live</span>}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <StatusBadge status={item.status} label={item.statusLabel} pulse={isLive} />
              {item.batch ? (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {item.batch}
                </span>
              ) : null}
            </div>

            <h3 className="mt-1.5 text-[15px] font-bold leading-5 tracking-tight text-slate-900 transition-colors group-hover:text-[#0f55f7] dark:text-white">
              {item.title}
            </h3>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{item.courseName}</p>
            <p className="mt-0.5 text-[11px] font-medium text-slate-400">{item.category}</p>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <MentorInfo name={item.mentorName} avatar={item.mentorAvatar} />
              <AttendanceChip status={item.attendanceStatus} />
            </div>
          </div>
        </div>

        <div className="flex h-full flex-col justify-between gap-2 rounded-[18px] bg-slate-50/75 p-3 dark:bg-slate-800/35">
          <div className="grid gap-1 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5 text-[#0f55f7]" />
              <span className="font-medium">{item.dateLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock3 className="h-3.5 w-3.5 text-[#06b6a8]" />
              <span className="font-medium">{item.timeLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <Video className="h-3.5 w-3.5 text-[#7c3aed]" />
              <span className="font-medium">{item.platform}</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 rounded-xl bg-white/70 px-2.5 py-1.5 dark:bg-slate-900/45">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Duration</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{item.durationLabel}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <CountdownTimer targetDate={item.startAt} className="text-[10px]" />
            <MeetingPlatform platform={item.platform} className="!px-2.5 !py-1" />
          </div>
        </div>

        <div className="flex h-full flex-col justify-between gap-2 rounded-[18px] border border-slate-200/70 bg-white p-3 dark:border-slate-700/50 dark:bg-slate-900/70">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Students</p>
              <p className="mt-0.5 text-[1.6rem] font-black leading-none text-slate-900 dark:text-white">
                {Number(item.studentsCount || 0)}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f55f7]/10 to-[#06b6a8]/10 text-[#0f55f7]">
              <Users className="h-[18px] w-[18px]" />
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Resources</p>
            <div className="space-y-1">
              {(item.resources || []).slice(0, 3).map((resource) => (
                <div key={resource} className="flex items-center gap-2 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#0f55f7]/10 text-[10px] text-[#0f55f7]">
                    <CheckCheck className="h-2.5 w-2.5" />
                  </span>
                  <span>{resource.replace(' Available', '')}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onSelect?.(item)
              }}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-[#0f55f7]/25 hover:bg-[#0f55f7]/5 hover:text-[#0f55f7] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              View Details
            </button>

            {!isCompleted && !isLive && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onSelect?.(item)
                }}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] px-3 text-xs font-semibold text-white shadow-[0_8px_18px_rgba(15,85,247,0.16)] transition-all hover:-translate-y-0.5 hover:scale-[1.01] hover:brightness-105"
              >
                <FileDown className="h-3.5 w-3.5" />
                Download PDF
              </button>
            )}

            {isLive && (
              <button
                type="button"
                disabled={joining}
                onClick={(event) => {
                  event.stopPropagation()
                  onJoin?.(item)
                }}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 text-xs font-semibold text-white shadow-[0_8px_18px_rgba(16,185,129,0.18)] transition-all hover:-translate-y-0.5 hover:scale-[1.01] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {joining ? 'Joining...' : (
                  <>
                    <PlayCircle className="h-3.5 w-3.5" />
                    Join Live Class
                  </>
                )}
              </button>
            )}

            {isCompleted && (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    onSelect?.(item)
                  }}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-[#0f55f7]/25 hover:bg-[#0f55f7]/5 hover:text-[#0f55f7] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Watch Recording
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    onSelect?.(item)
                  }}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-[#06b6a8]/25 hover:bg-[#06b6a8]/5 hover:text-[#06b6a8] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <FileDown className="h-3.5 w-3.5" />
                  Download Notes
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  )
}
