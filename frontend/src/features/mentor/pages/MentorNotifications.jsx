import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle, ArrowUpDown, BarChart3, Bell, BookOpen, CalendarClock, CalendarDays, Check, CheckCheck,
  ChevronLeft, ChevronRight, Clock3, ClipboardCheck, FileText, Filter, Layers, Megaphone, MessageSquare, MoreVertical,
  Paperclip, PieChart as PieIcon, RefreshCw, Search, Settings, Trash2, TrendingUp, User, UserPlus, Users, Video, X,
} from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import NotificationSettings from '../components/NotificationSettings'
import MentorPageHeader from '../components/MentorPageHeader'
import { NotificationArt } from '../components/MentorHeroArt'
import { MENTOR_NOTIFICATION_CATEGORIES, timeAgo } from '../data/notificationMockData'
import { notificationService } from '@shared/services/notificationService'
import { useAuth } from '@shared/hooks/useAuth'
import toast from 'react-hot-toast'
import { classScheduleNotification } from '@shared/utils/classScheduleNotification'

const PAGE_SIZE = 12
// Backend notifications carry a PascalCase `notificationType` enum (e.g. "LeaveRequestCreated")
// rather than a free-text category — humanize it for display.
const humanizeNotificationType = (value) => value ? String(value).replace(/([a-z])([A-Z])/g, '$1 $2').trim() : null
const colors = ['#0f55f7', '#8b5cf6', '#06b6a8', '#f59e0b', '#ec4899', '#ef4444', '#14b8a6', '#64748b']
const icons = { Students: UserPlus, Assignments: ClipboardCheck, Courses: BookOpen, Batches: Layers, Attendance: Users, Webinars: Video, Meetings: CalendarClock, Schedule: CalendarClock, Messages: MessageSquare, System: Settings }

const AVATAR_TONES = ['bg-violet-100 text-violet-600', 'bg-blue-100 text-blue-600', 'bg-rose-100 text-rose-500', 'bg-emerald-100 text-emerald-600', 'bg-orange-100 text-orange-600']
const CATEGORY_TONES = {
  Assignments: 'bg-emerald-50 text-emerald-600', Meetings: 'bg-blue-50 text-blue-600', Schedule: 'bg-blue-50 text-blue-600', Webinars: 'bg-sky-50 text-sky-600',
  Courses: 'bg-violet-50 text-violet-600', Batches: 'bg-indigo-50 text-indigo-600', Attendance: 'bg-teal-50 text-teal-600', System: 'bg-orange-50 text-orange-500',
  Messages: 'bg-rose-50 text-rose-500', Students: 'bg-blue-50 text-blue-600',
}
const actionIcon = (item) => {
  const text = `${item.category} ${item.title}`.toLowerCase()
  if (text.includes('message') || text.includes('chat') || text.includes('announcement')) return MessageSquare
  if (text.includes('assignment')) return FileText
  if (text.includes('meeting') || text.includes('schedule') || text.includes('webinar')) return CalendarDays
  if (text.includes('course') || text.includes('material')) return BookOpen
  return Bell
}
const leadIcon = (item) => {
  const text = `${item.category} ${item.title} ${item.description}`.toLowerCase()
  if (text.includes('attachment')) return Paperclip
  if (text.includes('announcement') || text.includes('holiday')) return Megaphone
  return icons[item.category] || Bell
}
const statusChip = (item, now) => {
  if (item.priority === 'Critical' || item.priority === 'High') return ['Important', 'bg-rose-50 text-rose-600']
  if (!item.unread) return ['Read', 'bg-emerald-50 text-emerald-600']
  if (now - new Date(item.timestamp) < 86400000 * 2) return ['New', 'bg-blue-50 text-blue-600']
  return ['Unread', 'bg-orange-50 text-orange-600']
}
// "NARAYANA MOHAN: hii" style messages come from a person — show their initials.
const senderOf = (item) => {
  const match = String(item.description || '').match(/^([^:]{2,40}):\s/)
  return match ? match[1].trim() : ''
}

function NoticeCard({ item, index, now, onRead, onDelete, menuOpen, onMenu }) {
  const sender = senderOf(item)
  const LeadIcon = leadIcon(item)
  const ActionIcon = actionIcon(item)
  const [chip, chipTone] = statusChip(item, now)
  const initials = sender.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
  return (
    <motion.div layout initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className={`group relative flex items-center gap-4 border-b border-[#eef2f7] px-4 py-3 transition last:border-b-0 dark:border-slate-800 ${index === 0 && item.unread ? 'rounded-2xl bg-[#eef4fd] dark:bg-slate-800/60' : 'hover:bg-[#f8fafd] dark:hover:bg-slate-800/40'}`}>
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.unread ? 'bg-[#2f6fe4]' : 'bg-[#2f6fe4]/35'}`} aria-label={item.unread ? 'Unread' : 'Read'} />
      {sender && !String(item.description).toLowerCase().includes('attachment')
        ? <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full text-sm font-bold ${AVATAR_TONES[index % AVATAR_TONES.length]}`}>{initials}</span>
        : <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${CATEGORY_TONES[item.category] || 'bg-slate-100 text-slate-500'}`}><LeadIcon className="h-6 w-6" /></span>}
      <button type="button" onClick={() => onRead(item.id)} className="min-w-0 flex-1 text-left">
        <span className={`block truncate text-[15px] text-[#0f2a4a] dark:text-white ${item.unread ? 'font-bold' : 'font-semibold'}`}>{item.title}</span>
        <span className="mt-0.5 block truncate text-sm text-[#4b5f78] dark:text-slate-400">{item.description}</span>
        {item.scheduleLabel && <span className="mt-0.5 block truncate text-sm text-[#4b5f78]">{item.scheduleLabel}</span>}
        <span className="mt-1 flex items-center gap-2 text-xs text-[#5b6f88]"><User className="h-3.5 w-3.5" />{timeAgo(item.timestamp)}<span>•</span>{item.category}</span>
      </button>
      <span className={`hidden shrink-0 rounded-full px-4 py-1.5 text-xs font-bold sm:inline ${chipTone}`}>{chip}</span>
      <button type="button" onClick={() => onRead(item.id)} aria-label={item.unread ? 'Mark as read' : 'Open notification'} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#dfe7f1] bg-white text-[#133b5d] hover:bg-[#f6f9fd] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"><ActionIcon className="h-4 w-4" /></button>
      <div className="relative">
        <button type="button" aria-label="More actions" aria-haspopup="menu" aria-expanded={menuOpen} onClick={(event) => { event.stopPropagation(); onMenu(menuOpen ? null : item.id) }} className="grid h-10 w-10 place-items-center rounded-xl border border-[#dfe7f1] bg-white text-[#133b5d] hover:bg-[#f6f9fd] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"><MoreVertical className="h-4 w-4" /></button>
        {menuOpen && <div role="menu" onClick={(event) => event.stopPropagation()} className="absolute right-0 top-11 z-20 w-44 rounded-xl border border-[#e6edf6] bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <button type="button" role="menuitem" disabled={!item.unread} onClick={() => { onRead(item.id); onMenu(null) }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50 disabled:text-slate-400 dark:hover:bg-slate-800"><Check className="h-4 w-4" />Mark as read</button>
          <button type="button" role="menuitem" onClick={() => { onDelete(item.id); onMenu(null) }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" />Delete</button>
        </div>}
      </div>
    </motion.div>
  )
}

export function NotificationCenter({
  notificationCategories = MENTOR_NOTIFICATION_CATEGORIES,
  subtitle = 'Stay updated with important mentoring activities and alerts.',
  SettingsComponent = NotificationSettings,
  compact = false,
  hideAnalytics = false,
  hideSecondaryPanels = false,
  hideSettings = false,
  recipientType,
  recipientId,
}) {
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [quick, setQuick] = useState('All')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [serverUnreadCount, setServerUnreadCount] = useState(null)
  const [menuFor, setMenuFor] = useState(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [now] = useState(() => Date.now())
  const searchRef = useRef(null)
  const loadNotifications = useCallback(async () => {
    if (!recipientType || !recipientId) { setItems([]); setServerUnreadCount(null); setLoading(false); return }
    setLoading(true)
    try {
      const fetchPair = recipientType === 'student'
        ? [notificationService.getStudentNotifications(recipientId), notificationService.getStudentUnreadCount(recipientId)]
        : recipientType === 'organization'
          ? [notificationService.getOrganizationNotifications(recipientId), notificationService.getOrganizationUnreadCount(recipientId)]
          : [notificationService.getMentorNotifications(recipientId), notificationService.getMentorUnreadCount(recipientId)]
      const [rows, unreadPayload] = await Promise.all(fetchPair)

      const serverItems = rows.map((item) => {
        const schedule = recipientType === 'student' ? classScheduleNotification(item) : null
        return {
          ...item,
          id: item.notificationId ?? item.id,
          title: item.title ?? item.subject ?? 'Notification',
          description: schedule?.classTitle ?? item.description ?? item.message ?? '',
          scheduleLabel: schedule?.scheduleLabel ?? '',
          category: item.category ?? item.type ?? humanizeNotificationType(item.notificationType) ?? 'System',
          priority: item.priority ?? 'Medium',
          timestamp: item.createdAt ?? item.timestamp ?? new Date().toISOString(),
          unread: !(item.isRead ?? item.read ?? false),
        }
      })
      setItems(serverItems)
      const unreadValue = unreadPayload?.unreadCount ?? unreadPayload?.count ?? unreadPayload?.totalUnread ?? unreadPayload
      setServerUnreadCount(Number.isFinite(Number(unreadValue)) ? Number(unreadValue) : null)
    } catch (error) { toast.error(error?.response?.data?.message || 'Unable to load notifications.') }
    finally { setLoading(false) }
  }, [recipientType, recipientId])
  useEffect(() => { queueMicrotask(loadNotifications) }, [loadNotifications])
  useEffect(() => {
    if (menuFor == null && !filterOpen) return undefined
    const close = () => { setMenuFor(null); setFilterOpen(false) }
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [menuFor, filterOpen])

  useEffect(() => { const fn = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); searchRef.current?.focus() } }; addEventListener('keydown', fn); return () => removeEventListener('keydown', fn) }, [])

  const unread = serverUnreadCount ?? 0
  const critical = items.filter((n) => n.priority === 'Critical').length
  const counts = useMemo(() => Object.fromEntries(notificationCategories.map((c) => [c, c === 'All' ? items.length : c === 'Unread' ? unread : items.filter((n) => n.category === c).length])), [items, notificationCategories, unread])
  const distribution = useMemo(() => Object.entries(counts).filter(([k, v]) => !['All', 'Unread'].includes(k) && v).map(([name, value]) => ({ name, value })), [counts])
  const filtered = useMemo(() => {
    let result = items.filter((n) => `${n.title} ${n.description} ${n.category}`.toLowerCase().includes(query.toLowerCase()))
    if (category === 'Unread') result = result.filter((n) => n.unread)
    else if (category !== 'All') result = result.filter((n) => n.category === category)
    if (quick === 'Unread') result = result.filter((n) => n.unread)
    if (quick === 'Critical') result = result.filter((n) => n.priority === 'Critical')
    if (quick === 'Today') result = result.filter((n) => now - new Date(n.timestamp) < 86400000)
    if (quick === 'This Week') result = result.filter((n) => now - new Date(n.timestamp) < 604800000)
    return [...result].sort((a, b) => sort === 'oldest' ? new Date(a.timestamp) - new Date(b.timestamp) : sort === 'priority' ? ['Critical','High','Medium','Low'].indexOf(a.priority) - ['Critical','High','Medium','Low'].indexOf(b.priority) : new Date(b.timestamp) - new Date(a.timestamp))
  }, [items, query, category, quick, sort, now])
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const chooseCategory = (value) => { setCategory(value); setQuick('All'); setPage(1) }
  const showSidePanel = !hideAnalytics || !hideSecondaryPanels || !hideSettings
  const markAllRead = async () => {
    try {
      if (recipientType === 'student') await notificationService.markAllStudentRead(recipientId)
      else if (recipientType === 'organization') await notificationService.markAllOrganizationRead(recipientId)
      else await notificationService.markAllMentorRead(recipientId)
      setItems((old) => old.map((item) => ({ ...item, unread: false })))
      await loadNotifications()
    } catch (error) { toast.error(error?.response?.data?.message || 'Unable to mark notifications as read.') }
  }
  const markRead = async (notificationId) => {
    const item = items.find((notice) => notice.id === notificationId)
    if (!item?.unread) return
    try { await notificationService.markRead(notificationId); setItems((old) => old.map((notice) => notice.id === notificationId ? { ...notice, unread: false } : notice)); await loadNotifications() }
    catch (error) { toast.error(error?.response?.data?.message || 'Unable to update notification.') }
  }
  const deleteNotification = async (notificationId) => {
    try { await notificationService.remove(notificationId); setItems((old) => old.filter((notice) => notice.id !== notificationId)); await loadNotifications(); toast.success('Notification deleted.') }
    catch (error) { toast.error(error?.response?.data?.message || 'Unable to delete notification.') }
  }

  const readCount = Math.max(0, items.length - items.filter((n) => n.unread).length)
  const todayCount = items.filter((n) => now - new Date(n.timestamp) < 86400000).length
  const weekCount = items.filter((n) => now - new Date(n.timestamp) < 604800000).length
  const quickFilters = [['All', 'All Notifications', FileText, items.length, 'bg-blue-100 text-blue-700'], ['Unread', 'Unread', FileText, unread, 'bg-rose-100 text-rose-600'], ['Today', 'Today', Clock3, todayCount, 'bg-blue-50 text-blue-700'], ['This Week', 'This Week', CalendarDays, weekCount, 'bg-slate-100 text-slate-600']]
  const summary = [['Total', items.length, TrendingUp, 'bg-[#eef4fd] text-[#1f6fe5]', 'text-[#1f6fe5]'], ['Unread', unread, Bell, 'bg-[#fff5ea] text-[#ea8a0b]', 'text-[#ea8a0b]'], ['Read', readCount, Check, 'bg-[#eaf8f1] text-[#13a36b]', 'text-[#13a36b]'], ['Critical', critical, AlertTriangle, 'bg-[#fff0f1] text-[#e5484d]', 'text-[#e5484d]']]

  return (
    <div className="w-full space-y-3.5">
      <MentorPageHeader
        icon={Bell}
        title="Notifications"
        subtitle={subtitle}
        tagline={['Never Miss', { text: 'What Matters', accent: true }]}
        art={<NotificationArt />}
      />
      <div className={`grid grid-cols-1 gap-3.5 ${!compact && showSidePanel ? 'xl:grid-cols-[minmax(0,1fr)_300px]' : ''}`}>
        <main className="min-w-0 space-y-3">
          <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-[#e6edf6] bg-white p-1.5 shadow-[0_4px_16px_rgba(15,42,74,.05)] dark:border-slate-700 dark:bg-slate-900" aria-label="Notification categories">
            {notificationCategories.map((name) => {
              const selected = category === name
              return (
                <button key={name} type="button" onClick={() => chooseCategory(name)} aria-pressed={selected} className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border px-3.5 py-2 text-sm font-semibold transition ${selected ? 'border-[#2f6fe4] bg-[#eef4fd] text-[#1f6fe5]' : 'border-transparent text-[#133b5d] hover:bg-[#f6f9fd] dark:text-slate-300'}`}>
                  {name}
                  <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-bold ${selected ? 'bg-[#1f6fe5] text-white' : name === 'Unread' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>{counts[name] ?? 0}</span>
                </button>
              )
            })}
          </nav>
          <div className="flex flex-wrap items-center gap-2.5" role="search">
            <label className="relative flex h-11 min-w-[240px] flex-1 items-center rounded-xl border border-[#dfe7f1] bg-white dark:border-slate-700 dark:bg-slate-900">
              <Search className="pointer-events-none absolute left-3.5 h-5 w-5 text-slate-400" />
              <span className="sr-only">Search notifications</span>
              <input ref={searchRef} value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} placeholder="Search by title, student, batch, assignment, webinar, meeting or course..." className="h-full w-full !rounded-xl !border-0 !bg-transparent pl-11 pr-10 text-[15px] text-slate-900 !shadow-none !outline-none !ring-0 dark:text-white" />
              {query && <button type="button" aria-label="Clear search" onClick={() => setQuery('')} className="absolute right-3 text-slate-400"><X className="h-4 w-4" /></button>}
            </label>
            <div className="relative">
              <button type="button" onClick={(event) => { event.stopPropagation(); setFilterOpen((open) => !open) }} aria-expanded={filterOpen} className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#dfe7f1] bg-white px-4 text-[15px] font-semibold text-[#133b5d] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"><Filter className="h-4 w-4" />Filter{quick !== 'All' ? ' (1)' : ''}</button>
              {filterOpen && <div onClick={(event) => event.stopPropagation()} className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-[#e6edf6] bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                {['All', 'Unread', 'Critical', 'Today', 'This Week'].map((name) => <button key={name} type="button" onClick={() => { setQuick(name); setPage(1); setFilterOpen(false) }} className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${quick === name ? 'bg-[#fff4e6] font-bold text-[#133b5d]' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>{name === 'All' ? 'All notifications' : name}</button>)}
              </div>}
            </div>
            <label className="relative flex h-11 items-center rounded-xl border border-[#dfe7f1] bg-white pl-3.5 dark:border-slate-700 dark:bg-slate-900">
              <ArrowUpDown className="pointer-events-none h-4 w-4 text-[#133b5d] dark:text-slate-300" />
              <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort notifications" className="h-full !border-0 !bg-transparent pl-2 pr-4 text-[15px] font-semibold text-[#133b5d] !shadow-none !outline-none !ring-0 dark:text-slate-200"><option value="newest">Newest First</option><option value="oldest">Oldest First</option><option value="priority">Priority</option></select>
            </label>
            <button type="button" onClick={markAllRead} disabled={!unread} className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#dfe7f1] bg-white px-4 text-sm font-semibold text-[#133b5d] disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"><CheckCheck className="h-4 w-4" />Mark all read</button>
            <button type="button" onClick={loadNotifications} aria-label="Refresh notifications" className="grid h-11 w-11 place-items-center rounded-xl border border-[#dfe7f1] bg-white text-[#133b5d] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></button>
          </div>
          <section className="rounded-2xl border border-[#e6edf6] bg-white p-1.5 shadow-[0_4px_16px_rgba(15,42,74,.05)] dark:border-slate-700 dark:bg-slate-900">
            {loading ? <div className="space-y-1 p-1">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-[72px] animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />)}</div>
              : visible.length ? <AnimatePresence>{visible.map((item, index) => <NoticeCard key={item.id} item={item} index={index} now={now} onRead={markRead} onDelete={deleteNotification} menuOpen={menuFor === item.id} onMenu={setMenuFor} />)}</AnimatePresence>
                : <div className="py-14 text-center text-sm text-slate-500"><Bell className="mx-auto mb-2 h-8 w-8 text-slate-300" />No notifications match your filters.</div>}
          </section>
          {pages > 1 && <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-[#4b5f78]">Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</p>
            <div className="flex items-center gap-2">
              <button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="grid h-10 w-10 place-items-center rounded-xl border border-[#dfe7f1] bg-white disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900"><ChevronLeft className="h-4 w-4" /></button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => <button key={n} type="button" aria-current={n === page ? 'page' : undefined} onClick={() => setPage(n)} className={`grid h-10 min-w-10 place-items-center rounded-xl px-3 text-sm font-bold ${n === page ? 'bg-[#1f6fe5] text-white' : 'border border-[#dfe7f1] bg-white text-[#133b5d] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'}`}>{n}</button>)}
              <button type="button" aria-label="Next page" disabled={page === pages} onClick={() => setPage((p) => p + 1)} className="grid h-10 w-10 place-items-center rounded-xl border border-[#dfe7f1] bg-white disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>}
        </main>
        {!compact && showSidePanel && <aside className="space-y-3.5">
          {!hideAnalytics && <>
            <section className="rounded-2xl border border-[#e6edf6] bg-white p-4 shadow-[0_4px_16px_rgba(15,42,74,.05)] dark:border-slate-700 dark:bg-slate-900">
              <h2 className="mb-3 flex items-center gap-2.5 text-[15px] font-bold text-[#0f2a4a] dark:text-white"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#e8f1ff] text-[#2f6fe4]"><BarChart3 className="h-5 w-5" /></span>Notification Summary</h2>
              <div className="grid grid-cols-2 gap-2.5">{summary.map(([label, value, Icon, tone, text]) => <div key={label} className={`flex items-center justify-between rounded-xl px-3.5 py-3 ${tone.split(' ')[0]} dark:bg-slate-800`}><div><p className={`text-2xl font-extrabold ${text}`}>{value}</p><p className="mt-0.5 text-sm text-[#133b5d] dark:text-slate-300">{label}</p></div><Icon className={`h-5 w-5 ${text}`} /></div>)}</div>
            </section>
            <section className="rounded-2xl border border-[#e6edf6] bg-white p-4 shadow-[0_4px_16px_rgba(15,42,74,.05)] dark:border-slate-700 dark:bg-slate-900">
              <h2 className="flex items-center gap-2.5 text-[15px] font-bold text-[#0f2a4a] dark:text-white"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#e8f1ff] text-[#2f6fe4]"><PieIcon className="h-5 w-5" /></span>Category Distribution</h2>
              <div className="mt-2 flex items-center gap-3">
                <div className="relative h-32 w-32 shrink-0">
                  <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={distribution.length ? distribution : [{ name: 'None', value: 1 }]} dataKey="value" innerRadius={38} outerRadius={60} paddingAngle={distribution.length > 1 ? 2 : 0} stroke="none">{(distribution.length ? distribution : [{ name: 'None' }]).map((entry, index) => <Cell key={entry.name} fill={distribution.length ? colors[index % colors.length] : '#e5ecf4'} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 grid place-items-center text-center"><div><p className="text-xl font-extrabold text-[#0f2a4a] dark:text-white">{items.length}</p><p className="text-xs text-[#4b5f78]">Total</p></div></div>
                </div>
                <ul className="min-w-0 flex-1 space-y-1.5 text-sm">{distribution.slice(0, 6).map((entry, index) => <li key={entry.name} className="flex items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} /><span className="min-w-0 flex-1 truncate text-[#133b5d] dark:text-slate-300">{entry.name}</span><b className="text-[#0f2a4a] dark:text-white">{entry.value}</b></li>)}{!distribution.length && <li className="text-slate-400">No data yet</li>}</ul>
              </div>
            </section>
          </>}
          {!hideSecondaryPanels && <section className="rounded-2xl border border-[#e6edf6] bg-white p-4 shadow-[0_4px_16px_rgba(15,42,74,.05)] dark:border-slate-700 dark:bg-slate-900">
            <h2 className="mb-2 flex items-center gap-2.5 text-[15px] font-bold text-[#0f2a4a] dark:text-white"><Filter className="h-5 w-5 text-[#2f6fe4]" />Quick Filters</h2>
            <div className="space-y-1">{quickFilters.map(([value, label, Icon, count, tone]) => <button key={value} type="button" onClick={() => { setQuick(value); setCategory('All'); setPage(1) }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] transition ${quick === value ? 'bg-[#eef4fd] font-bold text-[#1f6fe5]' : 'text-[#133b5d] hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'}`}><Icon className="h-5 w-5" /><span className="flex-1">{label}</span><span className={`rounded-lg px-2 py-0.5 text-xs font-bold ${tone}`}>{count}</span></button>)}</div>
          </section>}
          {!hideSettings && <SettingsComponent />}
        </aside>}
      </div>
    </div>
  )
}

export default function MentorNotifications() {
  const { user } = useAuth()
  const mentorId = user?.mentorId
    ?? localStorage.getItem('mentorId')

  return <NotificationCenter recipientType="mentor" recipientId={mentorId} />
}
