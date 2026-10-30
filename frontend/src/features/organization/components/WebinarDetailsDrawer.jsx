import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink, FileText, Link2, X } from 'lucide-react'
import StatusBadge from '@shared/components/StatusBadge'

const Field = ({ label, value }) => (
  <div className="rounded-lg bg-slate-50 px-3 py-2.5 dark:bg-slate-800/70">
    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">{label}</p>
    <p className="mt-1 break-words text-sm font-medium text-slate-700 dark:text-slate-200">{value || 'Not available'}</p>
  </div>
)

const Section = ({ title, children }) => (
  <section className="space-y-2.5">
    <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">{title}</h3>
    {children}
  </section>
)

export default function WebinarDetailsDrawer({ event, onClose }) {
  return (
    <AnimatePresence>
      {event ? (
        <>
          <motion.button type="button" aria-label="Close event details" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-50 cursor-default bg-slate-950/30 backdrop-blur-[1px]" />
          <motion.aside initial={{ x: 480 }} animate={{ x: 0 }} exit={{ x: 480 }} transition={{ type: 'spring', stiffness: 280, damping: 30 }} className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[480px] flex-col border-l border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.16)] dark:border-slate-700 dark:bg-slate-950" aria-label="Webinar details">
            <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
              <div className="min-w-0 pr-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">Event details</p>
                <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{event.title}</h2>
              </div>
              <button type="button" onClick={onClose} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-[#0f55f7]/30 hover:text-[#0f55f7] dark:border-slate-700" aria-label="Close webinar details"><X className="h-4 w-4" /></button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-5">
              <div className="flex flex-wrap gap-2"><StatusBadge status={event.status === 'Live Now' ? 'success' : event.status === 'Cancelled' ? 'danger' : 'default'} label={event.status === 'Live Now' ? 'Live' : event.status} /></div>
              <Section title="Event"><div className="grid gap-2 sm:grid-cols-2"><Field label="Type" value={event.type} /><Field label="Duration" value={event.duration} /><Field label="Department" value={event.department} /><Field label="Host" value={`${event.hostName || ''}${event.hostDesignation ? ` - ${event.hostDesignation}` : ''}`} /></div></Section>
              <Section title="Schedule"><div className="grid gap-2 sm:grid-cols-2"><Field label="Date" value={event.date} /><Field label="Time" value={`${event.startTime || ''} - ${event.endTime || ''}`} /><Field label="Registered attendees" value={`${event.attendees || 0} / ${event.capacity || 0}`} /><Field label="Attendance summary" value={event.attendanceSummary || `${event.attendees || 0} registered`} /></div></Section>
              <Section title="Meeting"><div className="grid gap-2"><Field label="Platform" value={event.meetingPlatform} />{event.meetingLink ? <a href={event.meetingLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 break-all text-sm font-semibold text-[#0f55f7] hover:underline"><Link2 className="h-4 w-4 shrink-0" />{event.meetingLink}<ExternalLink className="h-3.5 w-3.5 shrink-0" /></a> : <Field label="Meeting link" value="Not available" />}{event.recordingLink ? <a href={event.recordingLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 break-all text-sm font-semibold text-[#0f55f7] hover:underline"><FileText className="h-4 w-4 shrink-0" />Recording link<ExternalLink className="h-3.5 w-3.5 shrink-0" /></a> : <Field label="Recording" value={event.recordingAvailable ? 'Available' : 'Not available'} />}</div></Section>
              <Section title="Description"><p className="rounded-lg bg-slate-50 px-3 py-2.5 text-sm leading-6 text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">{event.description || 'No description provided.'}</p></Section>
              <Section title="Agenda">{event.agenda?.length ? <ul className="space-y-2">{event.agenda.map((item, index) => {
                const agendaTitle = typeof item === 'string' ? item : item?.title || item?.name || 'Agenda item'
                const agendaTime = typeof item === 'object' ? item?.time : null
                return <li key={item?.id || `${agendaTitle}-${index}`} className="flex gap-2 text-sm text-slate-600 dark:text-slate-300"><span className="text-slate-400">{index + 1}.</span><div><p>{agendaTitle}</p>{agendaTime ? <p className="mt-0.5 text-xs text-slate-400">{agendaTime}</p> : null}</div></li>
              })}</ul> : <p className="text-sm text-slate-500">No agenda provided.</p>}</Section>
              <Section title="Notes"><Field label="Notes" value={event.notes} /></Section>
              <Section title="Audit"><div className="grid gap-2 sm:grid-cols-2"><Field label="Created by" value={event.createdBy} /><Field label="Created date" value={event.createdDate} /><Field label="Last updated" value={event.updatedDate || event.lastUpdated} /></div></Section>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  )
}
