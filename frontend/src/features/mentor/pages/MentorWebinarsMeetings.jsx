import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, ExternalLink, Filter, MonitorPlay, RefreshCw, Search, Users, Video, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { WEBINAR_MEETINGS } from '../data/webinarMeetingMockData'
import MentorPageHeader from '../components/MentorPageHeader'
import WebinarMeetingStatusBadge from '../components/webinars/WebinarMeetingStatusBadge'

const PAGE_SIZE = 6
const formatDate = (value) => new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
const formatTime = (value) => new Date(`2000-01-01T${value}`).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })

const statCards = (events) => [
  { label: 'Total Webinars', value: events.filter((e) => e.type === 'Webinar').length, icon: MonitorPlay, tone: 'violet' },
  { label: 'Total Meetings', value: events.filter((e) => e.type === 'Meeting').length, icon: Users, tone: 'blue' },
  { label: 'Upcoming Sessions', value: events.filter((e) => e.status === 'Scheduled').length, icon: CalendarDays, tone: 'amber' },
  { label: 'Live Sessions', value: events.filter((e) => e.status === 'Live').length, icon: Video, tone: 'emerald' },
  { label: 'Completed Sessions', value: events.filter((e) => e.status === 'Completed').length, icon: CheckCircle2, tone: 'slate' },
]
const tones = {
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10', blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10', emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10', slate: 'bg-slate-100 text-slate-600 dark:bg-slate-700',
}
const accents = {
  violet: 'border-t-violet-500', blue: 'border-t-blue-500', amber: 'border-t-amber-500',
  emerald: 'border-t-emerald-500', slate: 'border-t-slate-500',
}

export default function MentorWebinarsMeetings() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [type, setType] = useState('all')
  const [platform, setPlatform] = useState('all')
  const [date, setDate] = useState('')
  const [sort, setSort] = useState('date-asc')
  const [page, setPage] = useState(1)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return WEBINAR_MEETINGS.filter((event) => (!q || `${event.title} ${event.description} ${event.host.name} ${event.createdBy}`.toLowerCase().includes(q)))
      .filter((event) => status === 'all' || event.status === status)
      .filter((event) => type === 'all' || event.type === type)
      .filter((event) => platform === 'all' || event.platform === platform)
      .filter((event) => !date || event.date === date)
      .sort((a, b) => sort === 'title' ? a.title.localeCompare(b.title) : sort === 'date-desc' ? `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`) : `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))
  }, [query, status, type, platform, date, sort])
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const events = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const reset = () => { setQuery(''); setStatus('all'); setType('all'); setPlatform('all'); setDate(''); setSort('date-asc'); setPage(1); setError('') }
  const openEvent = (id) => navigate(`/mentor/webinars-meetings/${id}`)
  const refresh = () => { setRefreshing(true); setError(''); setTimeout(() => { setRefreshing(false); toast.success('Webinars and meetings refreshed') }, 500) }

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-5 sm:py-5 lg:py-6">
      <MentorPageHeader
        title="Webinars & Meetings"
        subtitle="Manage, track and join every mentor session from one place."
        actions={
          <button onClick={refresh} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#cfd8e0] bg-white px-3.5 text-xs font-bold text-[#5f7180] shadow-sm transition hover:border-[#f39924] hover:text-[#133b5d] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"><RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />Refresh</button>
        }
      />

      <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
        {statCards(WEBINAR_MEETINGS).map(({ label, value, icon: Icon, tone }, index) => <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .04 }} className={`flex min-h-[82px] items-center gap-2.5 rounded-xl border border-t-[3px] border-slate-200/80 bg-white px-3 py-2.5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700/50 dark:bg-slate-900/70 ${accents[tone]}`}><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}><Icon className="h-3.5 w-3.5" /></span><div className="min-w-0"><p className="text-lg font-bold leading-none text-slate-900 dark:text-white">{value}</p><p className="mt-1.5 truncate text-[10px] font-bold leading-tight text-slate-500" title={label}>{label}</p></div></motion.div>)}
      </div>

      <div className="mb-3 rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/70">
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_repeat(5,auto)]">
          <label className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} placeholder="Search title, host or creator..." className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-violet-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white" /></label>
          <Select value={status} onChange={(v) => { setStatus(v); setPage(1) }} options={['all','Scheduled','Live','Completed','Cancelled']} label="All status" />
          <Select value={type} onChange={(v) => { setType(v); setPage(1) }} options={['all','Webinar','Meeting']} label="All types" />
          <Select value={platform} onChange={(v) => { setPlatform(v); setPage(1) }} options={['all','Zoom','Google Meet','Microsoft Teams']} label="All platforms" />
          <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setPage(1) }} aria-label="Filter by date" className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300" />
          <Select value={sort} onChange={setSort} options={['date-asc','date-desc','title']} labels={{'date-asc':'Date: earliest','date-desc':'Date: latest',title:'Title A-Z'}} />
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-xs dark:border-slate-700/60"><span className="font-semibold text-slate-500"><Filter className="mr-1 inline h-3.5 w-3.5" />{filtered.length} results</span><button onClick={reset} className="inline-flex items-center gap-1 font-bold text-violet-600 hover:text-violet-700"><X className="h-3.5 w-3.5" />Clear filters</button></div>
      </div>

      {error ? <State icon={X} title="Unable to load sessions" message={error} action={refresh} actionLabel="Try again" /> : events.length === 0 ? <State icon={CalendarDays} title="No sessions found" message="Try changing or clearing your current filters." action={reset} actionLabel="Clear filters" /> : <>
        <div className="hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/50 dark:bg-slate-900/70 lg:block"><div className="overflow-x-auto"><table className="w-full min-w-[1120px] text-left"><thead className="border-b border-slate-200 bg-slate-50/80 text-[10px] uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:bg-slate-800/70"><tr>{['Meeting title','Type','Host','Date & time','Duration','Platform','Participants','Status','Created by','Actions'].map((h) => <th key={h} className="px-4 py-3 font-bold">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">{events.map((event) => <EventRow key={event.id} event={event} open={openEvent} />)}</tbody></table></div></div>
        <div className="grid gap-3 lg:hidden">{events.map((event) => <EventCard key={event.id} event={event} open={openEvent} />)}</div>
        <div className="mt-4 flex items-center justify-between"><p className="text-xs text-slate-500">Page {page} of {pages}</p><div className="flex gap-2"><button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-slate-200 p-2 text-slate-500 disabled:opacity-40 dark:border-slate-700"><ChevronLeft className="h-4 w-4" /></button><button disabled={page === pages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-slate-200 p-2 text-slate-500 disabled:opacity-40 dark:border-slate-700"><ChevronRight className="h-4 w-4" /></button></div></div>
      </>}
    </div>
  )
}

function Select({ value, onChange, options, label, labels = {} }) { return <select value={value} onChange={(e) => onChange(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">{options.map((o) => <option key={o} value={o}>{labels[o] || (o === 'all' ? label : o)}</option>)}</select> }
function EventRow({ event, open }) { const go = () => open(event.id); return <tr tabIndex={0} onClick={go} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go() } }} className="cursor-pointer text-xs text-slate-600 outline-none transition-colors hover:bg-violet-50/60 focus-visible:bg-violet-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500 dark:text-slate-300 dark:hover:bg-violet-500/5"><td className="max-w-[240px] px-4 py-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10"><Video className="h-4 w-4" /></span><div className="min-w-0"><p className="truncate font-bold text-slate-900 dark:text-white">{event.title}</p><p className="mt-1 truncate text-[10px] text-slate-400">{event.description}</p></div></div></td><td className="px-4 py-4 font-semibold">{event.type}</td><td className="px-4 py-4"><p className="font-semibold text-slate-800 dark:text-slate-200">{event.host.name}</p><p className="text-[10px] text-slate-400">{event.host.role}</p></td><td className="whitespace-nowrap px-4 py-4"><p className="font-semibold">{formatDate(event.date)}</p><p className="text-[10px] text-slate-400">{formatTime(event.startTime)} - {formatTime(event.endTime)}</p></td><td className="whitespace-nowrap px-4 py-4">{event.duration}</td><td className="whitespace-nowrap px-4 py-4">{event.platform}</td><td className="px-4 py-4 font-bold">{event.participantCount}</td><td className="px-4 py-4"><WebinarMeetingStatusBadge status={event.status} /></td><td className="whitespace-nowrap px-4 py-4">{event.createdBy}</td><td className="px-4 py-4"><button onClick={(e) => { e.stopPropagation(); go() }} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 font-bold text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-500/10">View<ExternalLink className="h-3 w-3" /></button></td></tr> }
function EventCard({ event, open }) { return <button onClick={() => open(event.id)} className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-violet-300 dark:border-slate-700 dark:bg-slate-900/70"><div className="mb-3 flex items-start justify-between gap-3"><div><p className="font-bold text-slate-900 dark:text-white">{event.title}</p><p className="mt-1 text-xs text-slate-400">{event.host.name} · {event.type}</p></div><WebinarMeetingStatusBadge status={event.status} /></div><div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-xs dark:border-slate-700"><span><b className="block text-slate-400">Schedule</b>{formatDate(event.date)}, {formatTime(event.startTime)}</span><span><b className="block text-slate-400">Platform</b>{event.platform}</span><span><b className="block text-slate-400">Duration</b>{event.duration}</span><span><b className="block text-slate-400">Participants</b>{event.participantCount}</span></div></button> }
function State({ icon: Icon, title, message, action, actionLabel }) { return <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center dark:border-slate-700 dark:bg-slate-900/60"><Icon className="mx-auto h-10 w-10 text-slate-300" /><h2 className="mt-3 font-bold text-slate-900 dark:text-white">{title}</h2><p className="mt-1 text-xs text-slate-500">{message}</p><button onClick={action} className="mt-4 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white">{actionLabel}</button></div> }
