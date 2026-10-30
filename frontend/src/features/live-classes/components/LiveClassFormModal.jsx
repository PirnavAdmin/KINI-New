import { BadgeInfo, CalendarDays, GraduationCap, Loader2, MonitorPlay, Send, X } from 'lucide-react'
import Modal from '@shared/components/Modal'
import { Section, TinyButton } from './LiveClassPrimitives'
import { SCHEDULE_DATE_MAX, SCHEDULE_DATE_MIN } from '../utils/dateUtils'

const inputClass = 'h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#0f55f7] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100'
const labelClass = 'block space-y-1.5 text-sm font-medium text-slate-700 dark:text-slate-300'
const fieldErrorClass = 'text-[13px] font-medium text-danger'
const hintClass = 'text-[13px] text-slate-400'

export default function LiveClassFormModal({
  open,
  onClose,
  mode,
  values,
  onChange,
  saving,
  error,
  getFieldError,
  courseOptions,
  batchOptions,
  mentorOptions,
  platformOptions,
  statusOptions,
  selectedCourseId,
  selectedBatchId,
  mentorHelperText,
  dropdownLoading,
  moduleOptions = [],
  moduleStatus = 'idle',
  moduleLoadError = '',
  onCourseChange,
  onModuleChange,
  onBatchChange,
  onMentorChange,
  onSubmit,
}) {
  const set = (patch) => onChange((current) => ({ ...current, ...patch }))
  const moduleReady = moduleStatus === 'ready'
  const modulePlaceholder = !selectedCourseId
    ? 'Select a course first'
    : moduleStatus === 'loading'
      ? 'Loading syllabus modules...'
      : moduleStatus === 'error'
        ? 'Syllabus modules unavailable'
        : moduleOptions.length ? 'Select module' : 'No syllabus modules available'

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'edit' ? 'Edit Live Class' : 'Schedule Live Class'}
      description={mode === 'edit' ? 'Update class details and resync the schedule.' : 'Create a new live session and assign the academic team.'}
      size="lg"
      className="!rounded-3xl !border-white/70 shadow-[0_28px_80px_rgba(15,23,42,0.28)]"
      headerClassName="!border-0 bg-gradient-to-r from-[#1746a2] via-[#1769e8] to-[#08a9c5] !px-6 !py-5 sm:!px-7 [&_h2]:!text-white [&_p]:!mt-1 [&_p]:!text-blue-50 [&_button]:!bg-white/15 [&_button]:!p-2.5 [&_button]:hover:!bg-white/25 [&_button_svg]:!h-5 [&_button_svg]:!w-5 [&_button_svg]:!text-white"
      bodyClassName="!bg-slate-50/90 !p-4 sm:!p-5"
      footerClassName="!bg-white !px-5 !py-4 sm:!px-6"
      footer={(
        <div className="flex items-center justify-end gap-3">
          <TinyButton variant="secondary" icon={X} onClick={onClose}>Cancel</TinyButton>
          <TinyButton variant="primary" icon={saving ? Loader2 : Send} disabled={saving} onClick={onSubmit}>{saving ? 'Saving...' : 'Save Live Class'}</TinyButton>
        </div>
      )}
    >
      <div className="grid items-start gap-3.5 lg:grid-cols-2">
        {error ? (
          <div className="rounded-xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger-dark dark:text-danger-light lg:col-span-2">
            <p className="font-semibold">Could not save live class</p>
            <p className="mt-1 leading-6">{error}</p>
          </div>
        ) : null}

        <Section title="Basic Information" icon={BadgeInfo}>
          <div className="space-y-3">
            <label className={labelClass}>
              <span>Title *</span>
              <input value={values.title} onChange={(event) => set({ title: event.target.value })} className={inputClass} placeholder="Enter class title" />
              {getFieldError('ClassTitle', 'classTitle', 'title') ? <p className={fieldErrorClass}>{getFieldError('ClassTitle', 'classTitle', 'title')}</p> : null}
            </label>
            <label className={labelClass}>
              <span>Description</span>
              <textarea rows={2} value={values.description} onChange={(event) => set({ description: event.target.value })} className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#0f55f7] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" placeholder="Short session description" />
            </label>
          </div>
        </Section>

        <Section title="Academic Information" icon={GraduationCap}>
          <div className="space-y-3">
            <label className={labelClass}>
              <span>Course *</span>
              <select value={values.courseId} onChange={(event) => onCourseChange(event.target.value)} className={inputClass}>
                <option value="">Select course</option>
                {courseOptions.map((course) => <option key={course.value} value={course.value}>{course.label}</option>)}
              </select>
              {getFieldError('CourseId', 'courseId') ? <p className={fieldErrorClass}>{getFieldError('CourseId', 'courseId')}</p> : null}
            </label>
            <label className={labelClass}>
              <span>Module *</span>
              <select
                value={values.moduleId ?? ''}
                onChange={(event) => onModuleChange(event.target.value)}
                disabled={!selectedCourseId || !moduleReady || !moduleOptions.length}
                className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800/60`}
              >
                <option value="">{modulePlaceholder}</option>
                {moduleOptions.map((module) => <option key={module.value} value={module.value}>{module.label}</option>)}
              </select>
              {selectedCourseId && moduleReady && !moduleOptions.length ? <p className={hintClass}>No syllabus modules are available for this course.</p> : null}
              {moduleStatus === 'error' ? <p className={fieldErrorClass}>{moduleLoadError}</p> : null}
              {getFieldError('ModuleId', 'moduleId') ? <p className={fieldErrorClass}>{getFieldError('ModuleId', 'moduleId')}</p> : null}
            </label>
            <label className={labelClass}>
              <span>Batch *</span>
              <select
                value={values.batchId}
                onChange={(event) => onBatchChange(event.target.value)}
                disabled={!selectedCourseId || dropdownLoading}
                className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800/60`}
              >
                <option value="">Select batch</option>
                {batchOptions.map((batch) => <option key={batch.value} value={batch.value}>{batch.label}</option>)}
              </select>
              {!selectedCourseId && !dropdownLoading ? <p className={hintClass}>Select a course to load batches.</p> : null}
              {getFieldError('BatchId', 'batchId') ? <p className={fieldErrorClass}>{getFieldError('BatchId', 'batchId')}</p> : null}
            </label>
            <label className={labelClass}>
              <span>Mentor *</span>
              <select
                value={values.mentorId}
                onChange={(event) => onMentorChange(event.target.value)}
                disabled={!selectedCourseId || !selectedBatchId || dropdownLoading}
                className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800/60`}
              >
                <option value="">Select mentor</option>
                {mentorOptions.map((mentor) => <option key={mentor.value} value={mentor.value}>{mentor.label}</option>)}
              </select>
              <p className={hintClass}>{mentorHelperText}</p>
              {getFieldError('MentorId', 'mentorId') ? <p className={fieldErrorClass}>{getFieldError('MentorId', 'mentorId')}</p> : null}
            </label>
          </div>
        </Section>

        <Section title="Meeting Information" icon={MonitorPlay}>
          <div className="space-y-3">
            <label className={labelClass}>
              <span>Meeting Platform</span>
              <select value={values.meetingPlatformId} onChange={(event) => set({ meetingPlatformId: event.target.value })} className={inputClass}>
                <option value="">Select platform</option>
                {platformOptions.map((platform) => <option key={platform.value} value={platform.value}>{platform.label}</option>)}
              </select>
              {getFieldError('MeetingPlatform', 'meetingPlatform', 'MeetingPlatformId', 'meetingPlatformId') ? <p className={fieldErrorClass}>{getFieldError('MeetingPlatform', 'meetingPlatform', 'MeetingPlatformId', 'meetingPlatformId')}</p> : null}
            </label>
            <label className={labelClass}>
              <span>Meeting URL</span>
              <input value={values.meetingUrl} onChange={(event) => set({ meetingUrl: event.target.value })} className={inputClass} placeholder="https://meet.google.com/..." />
              {getFieldError('MeetingLink', 'meetingLink', 'MeetingUrl', 'meetingUrl') ? <p className={fieldErrorClass}>{getFieldError('MeetingLink', 'meetingLink', 'MeetingUrl', 'meetingUrl')}</p> : null}
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className={labelClass}>
                <span>Meeting ID</span>
                <input value={values.meetingId} onChange={(event) => set({ meetingId: event.target.value })} className={inputClass} placeholder="Optional" />
              </label>
              <label className={labelClass}>
                <span>Password</span>
                <input value={values.password} onChange={(event) => set({ password: event.target.value })} className={inputClass} placeholder="Optional" />
              </label>
            </div>
          </div>
        </Section>

        <Section title="Schedule" icon={CalendarDays}>
          <div className="grid gap-3 md:grid-cols-3">
            <label className={`${labelClass} md:col-span-3`}>
              <span>Date</span>
              <input
                type="date"
                value={values.date}
                min={SCHEDULE_DATE_MIN}
                max={SCHEDULE_DATE_MAX}
                required
                aria-invalid={Boolean(getFieldError('Date', 'date'))}
                onChange={(event) => set({ date: event.target.value })}
                className={inputClass}
              />
              {getFieldError('Date', 'date') ? <p className={fieldErrorClass}>{getFieldError('Date', 'date')}</p> : null}
            </label>
            <label className={labelClass}>
              <span>Start Time</span>
              <input type="time" value={values.startTime} onChange={(event) => set({ startTime: event.target.value })} className={inputClass} />
              {getFieldError('StartTime', 'startTime') ? <p className={fieldErrorClass}>{getFieldError('StartTime', 'startTime')}</p> : null}
            </label>
            <label className={labelClass}>
              <span>End Time</span>
              <input type="time" value={values.endTime} onChange={(event) => set({ endTime: event.target.value })} className={inputClass} />
              {getFieldError('EndTime', 'endTime') ? <p className={fieldErrorClass}>{getFieldError('EndTime', 'endTime')}</p> : null}
            </label>
            <label className={`${labelClass} md:col-span-3`}>
              <span>Status</span>
              <select value={values.status} onChange={(event) => set({ status: event.target.value })} className={inputClass}>
                {(statusOptions.length ? statusOptions : ['scheduled', 'live', 'completed', 'cancelled']).map((status) => {
                  const value = status.label || status
                  return <option key={value} value={String(value).toLowerCase()}>{value}</option>
                })}
              </select>
            </label>
          </div>
        </Section>
      </div>
    </Modal>
  )
}
