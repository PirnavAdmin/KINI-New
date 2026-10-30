import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import {
  CalendarDays, Clock, Video, Search, Filter,
  RefreshCw, ChevronLeft, ChevronRight, Eye, Play, User,
  GraduationCap, Layers, ExternalLink, X, Loader2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import Modal from '@shared/components/Modal'
import employeeService from '@features/employee/services/employeeService'
import KPI from '@/components/common/KPI'

// ─── NORMALIZE API SCHEDULE → COMPONENT SCHEDULE SHAPE ───────────────────────

const normalizeApiSchedule = (item) => ({
  id: item.id ?? item.scheduleId ?? `S-${Date.now()}`,
  title: item.title ?? item.sessionTitle ?? item.name ?? '-',
  course: item.course ?? item.courseName ?? '-',
  batch: item.batch ?? item.batchName ?? '-',
  mentor: item.mentor ?? item.mentorName ?? '-',
  date: item.date ?? item.scheduledDate ?? item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  startTime: item.startTime ?? item.startAt ?? item.start ?? '-',
  endTime: item.endTime ?? item.endAt ?? item.end ?? '-',
  duration: item.duration ?? '-',
  platform: item.platform ?? item.meetingPlatform ?? item.meetingProvider ?? 'Zoom',
  meetingLink: item.meetingLink ?? item.joinUrl ?? item.meetingUrl ?? item.link ?? '',
  status: item.status ?? 'Upcoming',
})

// ─── FALLBACK SCHEDULE DATA (used when API is unavailable) ──────────────────

const FALLBACK_SCHEDULES = [
  { id: 1, title: 'MERN Stack: Express.js Middleware', course: 'MERN Stack Development', batch: 'FS-MERN-2025-01', mentor: 'Sarah Chen', date: new Date().toISOString().split('T')[0], startTime: '09:00 AM', endTime: '11:00 AM', duration: '2h', platform: 'Zoom', meetingLink: 'https://zoom.us/j/example1', status: 'Live' },
  { id: 2, title: 'Python Data Science: Pandas Deep Dive', course: 'Python Data Science', batch: 'PY-DS-2025-02', mentor: 'Mike Johnson', date: new Date().toISOString().split('T')[0], startTime: '02:00 PM', endTime: '04:00 PM', duration: '2h', platform: 'Google Meet', meetingLink: 'https://meet.google.com/example2', status: 'Upcoming' },
  { id: 3, title: 'React Patterns: Compound Components', course: 'React Development', batch: 'ADV-REACT-2025-03', mentor: 'Anna Lee', date: new Date().toISOString().split('T')[0], startTime: '10:00 AM', endTime: '12:00 PM', duration: '2h', platform: 'Zoom', meetingLink: 'https://zoom.us/j/example3', status: 'Completed' },
  { id: 4, title: 'AWS Cloud: EC2 & S3 Best Practices', course: 'AWS Cloud Practitioner', batch: 'AWS-ARCH-2025-04', mentor: 'David Kim', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], startTime: '08:00 AM', endTime: '11:00 AM', duration: '3h', platform: 'Microsoft Teams', meetingLink: 'https://teams.microsoft.com/example4', status: 'Completed' },
  { id: 5, title: 'TypeScript: Advanced Generics', course: 'TypeScript Fundamentals', batch: 'TS-DEEP-2025-06', mentor: 'Anna Lee', date: new Date().toISOString().split('T')[0], startTime: '01:00 PM', endTime: '03:00 PM', duration: '2h', platform: 'Zoom', meetingLink: 'https://zoom.us/j/example5', status: 'Upcoming' },
  { id: 6, title: 'Node.js Microservices: Docker Setup', course: 'Node.js Backend', batch: 'NODE-MS-2025-05', mentor: 'John Doe', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], startTime: '03:00 PM', endTime: '06:00 PM', duration: '3h', platform: 'Google Meet', meetingLink: 'https://meet.google.com/example6', status: 'Upcoming' },
  { id: 7, title: 'AI/ML: Neural Network Fundamentals', course: 'AI & ML', batch: 'AI-ML-2025-07', mentor: 'Dr. Rachel Park', date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], startTime: '09:30 AM', endTime: '12:30 PM', duration: '3h', platform: 'Zoom', meetingLink: 'https://zoom.us/j/example7', status: 'Upcoming' },
  { id: 8, title: 'DevOps: CI/CD Pipeline with Jenkins', course: 'DevOps Engineering', batch: 'DEVOPS-2025-08', mentor: 'Tom Wilson', date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], startTime: '11:00 AM', endTime: '02:00 PM', duration: '3h', platform: 'Microsoft Teams', meetingLink: 'https://teams.microsoft.com/example8', status: 'Completed' },
  { id: 9, title: 'Java Spring Boot: REST APIs', course: 'Java Enterprise', batch: 'JAVA-SB-2025-13', mentor: 'Mike Johnson', date: new Date().toISOString().split('T')[0], startTime: '11:00 AM', endTime: '01:00 PM', duration: '2h', platform: 'Zoom', meetingLink: 'https://zoom.us/j/example9', status: 'Live' },
  { id: 10, title: 'Database Administration: PostgreSQL', course: 'Database Management', batch: 'DBA-2025-11', mentor: 'James Miller', date: new Date().toISOString().split('T')[0], startTime: '08:30 AM', endTime: '10:30 AM', duration: '2h', platform: 'Google Meet', meetingLink: 'https://meet.google.com/example10', status: 'Completed' },
  { id: 11, title: 'UI/UX Design: Design Systems', course: 'UI/UX Design', batch: 'UIUX-2025-12', mentor: 'Emily Davis', date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0], startTime: '01:00 PM', endTime: '04:00 PM', duration: '3h', platform: 'Zoom', meetingLink: 'https://zoom.us/j/example11', status: 'Upcoming' },
  { id: 12, title: 'Cyber Security: Network Defense', course: 'Cyber Security', batch: 'CYBER-2025-09', mentor: 'Lisa Brown', date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0], startTime: '02:00 PM', endTime: '05:00 PM', duration: '3h', platform: 'Microsoft Teams', meetingLink: 'https://teams.microsoft.com/example12', status: 'Upcoming' },
  { id: 13, title: 'Mobile App Dev: React Navigation', course: 'React Native Development', batch: 'RN-APP-2025-10', mentor: 'Sarah Chen', date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0], startTime: '10:00 AM', endTime: '01:00 PM', duration: '3h', platform: 'Google Meet', meetingLink: 'https://meet.google.com/example13', status: 'Completed' },
  { id: 14, title: 'Agile: Sprint Retrospective', course: 'Project Management', batch: 'AGILE-2025-14', mentor: 'Robert Taylor', date: new Date().toISOString().split('T')[0], startTime: '04:00 PM', endTime: '05:00 PM', duration: '1h', platform: 'Zoom', meetingLink: 'https://zoom.us/j/example14', status: 'Upcoming' },
  { id: 15, title: 'Data Engineering: Spark Streaming', course: 'Big Data Engineering', batch: 'SPARK-DE-2025-15', mentor: 'Dr. Rachel Park', date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], startTime: '02:00 PM', endTime: '05:00 PM', duration: '3h', platform: 'Zoom', meetingLink: 'https://zoom.us/j/example15', status: 'Upcoming' },
]

const ITEMS_PER_PAGE = 6

const STATUS_COLORS = {
  Live: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  Upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  Completed: 'bg-slate-100 text-slate-500 dark:bg-slate-700/30 dark:text-slate-400',
}

const PLATFORM_COLORS = {
  Zoom: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  'Google Meet': 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400',
  'Microsoft Teams': 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400',
}

// ─── SUMMARY CARD ───────────────────────────────────────────────────────────

// Summary cards use the global KPI card (same design in every portal).
function SummaryCard({ icon, label, value, accent, subtitle }) {
  return <KPI label={label} value={value} description={subtitle} icon={icon} accent={accent} />
}

// ─── SCHEDULE CARD ──────────────────────────────────────────────────────────

function ScheduleCard({ item, onView, onJoin, index, todayDate }) {
  const isLive = item.status === 'Live'
  const isToday = item.date === todayDate

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 * (index || 0) }}
      className="group rounded-xl border border-slate-100 dark:border-slate-700/30 bg-white dark:bg-slate-900/40 p-4 hover:border-blue-500/25 hover:shadow-md transition-all duration-300 cursor-pointer"
      onClick={() => onView(item)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-teal-500/10 flex items-center justify-center shrink-0">
            <CalendarDays className="w-5 h-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.title}</h3>
            <p className="text-xs text-slate-400 mt-0.5 truncate">{item.course} · {item.mentor}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${STATUS_COLORS[item.status]}`}>
            {item.status === 'Live' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
            {item.status}
          </span>
        </div>
      </div>

      {/* Info Chips */}
      <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-slate-400 mb-3">
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.startTime} - {item.endTime}</span>
        <span className="flex items-center gap-1"><Video className="w-3 h-3" /> {item.platform}</span>
        <span className="flex items-center gap-1"><User className="w-3 h-3" /> {item.mentor}</span>
        {!isToday && (
          <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        )}
      </div>

      {/* Batch & Duration */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-0.5">
        <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> {item.batch}</span>
        <span className="font-medium text-slate-500">{item.duration}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/20" onClick={e => e.stopPropagation()}>
        <button
          onClick={(e) => { e.stopPropagation(); onView(item) }}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-500 transition-colors"
          title="View Details"
        >
          <Eye className="w-4 h-4" />
        </button>
        {(isLive || item.status === 'Upcoming') && (
          <button
            onClick={(e) => { e.stopPropagation(); onJoin(item) }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-teal-600 hover:shadow-md transition-all"
            title="Join Meeting"
          >
            <Play className="w-3.5 h-3.5" />
            {isLive ? 'Join Live' : 'Join'}
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ─── EMPLOYEE CLASS SCHEDULE PAGE ────────────────────────────────────────────

export default function EmployeeClassSchedule() {
  const today = new Date().toISOString().split('T')[0]
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [schedules, setSchedules] = useState([])
  const [viewingItem, setViewingItem] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isFallback, setIsFallback] = useState(false)
  const fallbackToastShown = useRef(false)

  // ── Load schedule from API with fallback to mock data ──────────
  const loadSchedule = useCallback(async () => {
    setLoading(true)
    try {
      const response = await employeeService.getTodaySchedule()
      const rawData = response?.data ?? response ?? []
      const normalized = Array.isArray(rawData) ? rawData.map(normalizeApiSchedule) : []
      setSchedules(normalized)
      setIsFallback(false)
    } catch (err) {
      // Fallback to mock data when API is unavailable
      const normalized = FALLBACK_SCHEDULES.map(normalizeApiSchedule)
      setSchedules(normalized)
      setIsFallback(true)
      if (!fallbackToastShown.current) {
        fallbackToastShown.current = true
        toast.error('Could not reach server. Using offline data.')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Load on mount
  useEffect(() => {
    loadSchedule()
  }, [loadSchedule])

  // Summary stats
  const stats = useMemo(() => {
    const total = schedules.length
    const todaySessions = schedules.filter(s => s.date === today).length
    const live = schedules.filter(s => s.status === 'Live').length
    const upcoming = schedules.filter(s => s.status === 'Upcoming').length
    const completed = schedules.filter(s => s.status === 'Completed').length
    return { total, todaySessions, live, upcoming, completed }
  }, [schedules, today])

  // Filtered & sorted data
  const filtered = useMemo(() => {
    let result = [...schedules]

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.course.toLowerCase().includes(q) ||
        s.mentor.toLowerCase().includes(q) ||
        s.batch.toLowerCase().includes(q)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(s => s.status.toLowerCase() === statusFilter.toLowerCase())
    }

    // Date filter
    if (dateFilter === 'today') {
      result = result.filter(s => s.date === today)
    } else if (dateFilter === 'this-week') {
      const now = new Date()
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - now.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      result = result.filter(s => {
        const d = new Date(s.date)
        return d >= weekStart && d <= weekEnd
      })
    } else if (dateFilter === 'upcoming') {
      result = result.filter(s => new Date(s.date) >= new Date(today))
    }

    // Sort by date & time
    result.sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date)
      if (dateCmp !== 0) return dateCmp
      return a.startTime.localeCompare(b.startTime)
    })

    return result
  }, [schedules, searchQuery, statusFilter, dateFilter, today])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleRefresh = () => {
    setRefreshing(true)
    loadSchedule()
  }

  const handleView = (item) => {
    setViewingItem(item)
  }

  const handleJoin = (item) => {
    if (item.meetingLink) {
      window.open(item.meetingLink, '_blank', 'noopener,noreferrer')
      toast.success(`Joining "${item.title}"...`)
    } else {
      toast.error('Meeting link not available')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-5 py-4 sm:py-5 lg:py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Class Schedule</h1>
          <p className="text-sm text-slate-500 mt-0.5">View and manage your scheduled classes.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm font-semibold hover:shadow-lg hover:from-blue-500 hover:to-teal-500 transition-all disabled:opacity-60 self-start"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <SummaryCard icon={CalendarDays} label="Total Classes" value={stats.todaySessions} accent="blue" subtitle={new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} />
        <SummaryCard icon={Play} label="Live Classes" value={stats.live} accent="green" subtitle="In progress" />
        <SummaryCard icon={Clock} label="Upcoming Classes" value={stats.upcoming} accent="orange" subtitle="Scheduled" />
        <SummaryCard icon={GraduationCap} label="Completed Classes" value={stats.completed} accent="navy" subtitle="Total done" />
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-700/40 p-4 mb-5">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by class, course, mentor, or batch..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />

          {/* Status Filter */}
          <div className="flex items-center gap-1">
            {['all', 'Live', 'Upcoming', 'Completed'].map(s => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s.toLowerCase()); setCurrentPage(1) }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                  statusFilter === s.toLowerCase()
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {s === 'all' ? 'All Status' : s}
              </button>
            ))}
          </div>

          <span className="w-px h-5 bg-slate-200 dark:bg-slate-700" />

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1) }}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="this-week">This Week</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </div>
      </div>

      {/* Fallback Badge */}
      {isFallback && !loading && (
        <div className="flex items-center gap-2 px-3 py-2 mb-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-xs font-semibold text-amber-700 dark:text-amber-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Offline mode — showing sample data. Click Refresh to retry connecting to server.
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-100 dark:border-slate-700/30 bg-white dark:bg-slate-900/40 p-4 animate-pulse">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
                  <div className="space-y-2">
                    <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                  </div>
                </div>
                <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
              </div>
              <div className="flex gap-3 mb-3">
                <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
              <div className="flex justify-between mb-3">
                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-3 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
              <div className="flex justify-end gap-2">
                <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Cards Grid */}
      {!loading && (
        <AnimatePresence mode="wait">
        {paginated.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-16 text-slate-400"
          >
            <CalendarDays className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-base font-semibold">No classes found</p>
            <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
          </motion.div>
        ) : (
          <motion.div key="schedules" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginated.map((item, i) => (
                <ScheduleCard key={item.id} item={item} index={i} todayDate={today} onView={handleView} onJoin={handleJoin} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                        currentPage === page
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400'
                          : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Results count */}
            <div className="text-center mt-3">
              <p className="text-xs text-slate-400">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} classes
              </p>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      )}

      {/* View Details Modal */}
      <Modal
        open={!!viewingItem}
        onClose={() => setViewingItem(null)}
        title={viewingItem?.title}
        description={`${viewingItem?.course} · ${viewingItem?.batch}`}
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setViewingItem(null)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
            {(viewingItem?.status === 'Live' || viewingItem?.status === 'Upcoming') && (
              <button
                onClick={() => { const item = viewingItem; setViewingItem(null); handleJoin(item) }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm font-semibold hover:shadow-lg transition-all"
              >
                <ExternalLink className="w-4 h-4" /> Join Meeting
              </button>
            )}
          </div>
        }
      >
        {viewingItem && (
          <div className="space-y-5">
            {/* Key Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-lg border border-slate-100 dark:border-slate-700/30 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Date</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 text-slate-400" />
                  {new Date(viewingItem.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="rounded-lg border border-slate-100 dark:border-slate-700/30 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Time</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {viewingItem.startTime} - {viewingItem.endTime}
                </p>
              </div>
              <div className="rounded-lg border border-slate-100 dark:border-slate-700/30 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Duration</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{viewingItem.duration}</p>
              </div>
              <div className="rounded-lg border border-slate-100 dark:border-slate-700/30 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Course</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{viewingItem.course}</p>
              </div>
              <div className="rounded-lg border border-slate-100 dark:border-slate-700/30 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Batch</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{viewingItem.batch}</p>
              </div>
              <div className="rounded-lg border border-slate-100 dark:border-slate-700/30 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Status</p>
                <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${STATUS_COLORS[viewingItem.status]}`}>
                  {viewingItem.status}
                </span>
              </div>
            </div>

            {/* Mentor & Platform */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-100 dark:border-slate-700/30 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Mentor</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-400" />
                  {viewingItem.mentor}
                </p>
              </div>
              <div className="rounded-lg border border-slate-100 dark:border-slate-700/30 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Platform</p>
                <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full ${PLATFORM_COLORS[viewingItem.platform]}`}>
                  {viewingItem.platform}
                </span>
              </div>
            </div>

            {/* Meeting Link */}
            <div className="rounded-lg border border-slate-100 dark:border-slate-700/30 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Meeting Link</p>
              <a
                href={viewingItem.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 break-all"
              >
                <ExternalLink className="w-4 h-4 shrink-0" />
                {viewingItem.meetingLink}
              </a>
            </div>

            {/* Quick Actions */}
            {(viewingItem.status === 'Live' || viewingItem.status === 'Upcoming') && (
              <div className="rounded-xl bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-500/5 dark:to-teal-500/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Ready to join?</p>
                    <p className="text-xs text-slate-500 mt-0.5">Click below to open the meeting link</p>
                  </div>
                  <button
                    onClick={() => handleJoin(viewingItem)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm font-semibold hover:shadow-lg transition-all"
                  >
                    <Play className="w-4 h-4" /> Join Now
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
