import { useState, useMemo, useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import KPI from "@/components/common/KPI";
import toast from 'react-hot-toast'
import {
  Video,
  Calendar,
  Users,
  BookOpen,
  Search,
  X,
  RefreshCw,
  Download,
  Eye,
  MoreHorizontal,
  BarChart3,
  Copy,
  FileDown,
  FileSpreadsheet,
  Share2,
  Trash2,
  Clock,
  User,
  Plus,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CalendarRange,
  Monitor,
  Wrench,
  GraduationCap,
  Compass,
  Microscope,
  ClipboardCheck,
  Globe,
  Save,
  Upload,
} from 'lucide-react'
import { ROUTES } from '@shared/constants/routeConstants'
import Modal from '@shared/components/Modal'
import { Button, Input, Select } from '@shared/components/FormElements'
import TableFrame from '@shared/components/TableFrame'
import WebinarDetailsDrawer from '../components/WebinarDetailsDrawer'
import {
  WEBINARS,
  DEPARTMENTS,
  WEBINAR_TYPES,
  getWebinarStatusStyle,
  getWebinarTypeIcon,
  filterWebinars,
} from '../data/webinarMockData'
import { createWebinar, sortWebinarsBySchedule } from '../utils/webinarHelpers'
import {
  TABLE_ACTION_ICON_BUTTON_CLASS,
  TABLE_CELL_TEXT_CLASS,
  TABLE_HEADER_CLASS,
  TABLE_PRIMARY_TEXT_CLASS,
  TABLE_SECONDARY_TEXT_CLASS,
  TABLE_ROW_CLASS,
  TABLE_ROW_HEIGHT_CLASS,
} from '@shared/constants/tableStyles'

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100]
const STATUS_TABS = ['All Events', 'Upcoming', 'Live Now', 'Completed', 'Cancelled']

// ─── SKELETON ─────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 rounded-xl border border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-900/50 p-4">
          <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-200 dark:bg-slate-700" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-700/50" />
          </div>
          <div className="hidden sm:flex gap-4">
            <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-6 w-20 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      ))}
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="mb-3 grid animate-pulse grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-[88px] rounded-xl border border-slate-100 bg-white p-3 dark:border-slate-700/50 dark:bg-slate-900/50">
          <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="mt-2 h-8 w-12 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      ))}
    </div>
  )
}

// ─── EVENT TYPE ICON ─────────────────────────────────────────────────────────

function EventTypeIcon({ type, className = 'w-5 h-5' }) {
  const iconMap = {
    Video: <Video className={className} />,
    Users: <Users className={className} />,
    Wrench: <Wrench className={className} />,
    BookOpen: <BookOpen className={className} />,
    GraduationCap: <GraduationCap className={className} />,
    Microscope: <Microscope className={className} />,
    Compass: <Compass className={className} />,
    ClipboardCheck: <ClipboardCheck className={className} />,
  }
  return iconMap[type] || <Video className={className} />
}

// ─── SUMMARY CARD ─────────────────────────────────────────────────────────────

const KPI_ACCENT_BY_BG = { "bg-blue-500": "blue", "bg-purple-500": "purple", "bg-green-500": "green", "bg-slate-500": "navy", "bg-amber-500": "orange" }
function SummaryCard({ icon, label, value, color }) {
  return <KPI value={value} label={label} icon={icon} accent={KPI_ACCENT_BY_BG[color] ?? "blue"} size="compact" className="h-full" />
}

// ─── STATUS TAB ───────────────────────────────────────────────────────────────

function StatusTabs({ tabs, counts, activeTab, onTabChange }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-2" role="tablist" aria-label="Event status filters">
      {tabs.map((tab) => (
        <button
          key={tab}
          role="tab"
          aria-selected={activeTab === tab}
          onClick={() => onTabChange(tab)}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all shrink-0 ${
            activeTab === tab
              ? 'bg-[#0f55f7] text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          {tab}
          <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full px-1 text-[10px] font-bold ${
            activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
          }`}>
            {(counts && counts[tab]) || 0}
          </span>
        </button>
      ))}
    </div>
  )
}

// ─── EVENT ROW ────────────────────────────────────────────────────────────────

const EVENT_ACTIONS = [
  { id: 'view', label: 'View Details', icon: Eye },
  { id: 'analytics', label: 'View Analytics', icon: BarChart3, completedOnly: true },
  { id: 'participants', label: 'View Participants', icon: Users, completedOnly: true },
  { id: 'attendance', label: 'Download Attendance', icon: FileDown, completedOnly: true },
  { id: 'export', label: 'Export Report', icon: FileSpreadsheet, completedOnly: true },
  { id: 'duplicate', label: 'Duplicate Event', icon: Copy, completedOnly: true },
  { id: 'share', label: 'Share Event', icon: Share2, completedOnly: true },
  { id: 'delete', label: 'Delete Event', icon: Trash2, destructive: true },
]

function EventActionMenu({ event, triggerRef, onClose, onAction }) {
  const menuRef = useRef(null)
  const [position, setPosition] = useState(null)
  const isMobile = window.innerWidth < 640
  const actions = EVENT_ACTIONS.filter((action) => !action.completedOnly || event.status === 'Completed')

  useLayoutEffect(() => {
    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return

      const width = 240
      const height = Math.min(420, menuRef.current?.offsetHeight || 360)
      const opensAbove = window.innerHeight - rect.bottom < height + 12
      setPosition({
        top: opensAbove ? Math.max(8, rect.top - height - 8) : rect.bottom + 8,
        left: Math.max(12, Math.min(rect.right - width, window.innerWidth - width - 12)),
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    return () => window.removeEventListener('resize', updatePosition)
  }, [triggerRef])

  useEffect(() => {
    const handlePointerDown = (clickedEvent) => {
      if (!menuRef.current?.contains(clickedEvent.target) && !triggerRef.current?.contains(clickedEvent.target)) onClose()
    }
    const handleScroll = () => onClose()
    const handleEscape = (keyboardEvent) => {
      if (keyboardEvent.key !== 'Escape') return
      keyboardEvent.preventDefault()
      onClose()
      triggerRef.current?.focus()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)
    window.addEventListener('scroll', handleScroll, true)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [onClose, triggerRef])

  useEffect(() => {
    requestAnimationFrame(() => menuRef.current?.focus())
  }, [])

  const handleKeyDown = (keyboardEvent) => {
    const items = Array.from(menuRef.current?.querySelectorAll('[role="menuitem"]') || [])
    const currentIndex = items.indexOf(document.activeElement)
    if (keyboardEvent.key === 'ArrowDown' || keyboardEvent.key === 'ArrowUp') {
      keyboardEvent.preventDefault()
      const nextIndex = keyboardEvent.key === 'ArrowDown'
        ? (currentIndex + 1 + items.length) % items.length
        : (currentIndex - 1 + items.length) % items.length
      items[nextIndex]?.focus()
    }
    if (keyboardEvent.key === 'Home') {
      keyboardEvent.preventDefault()
      items[0]?.focus()
    }
    if (keyboardEvent.key === 'End') {
      keyboardEvent.preventDefault()
      items[items.length - 1]?.focus()
    }
  }

  return createPortal(
    <motion.div
      ref={menuRef}
      role="menu"
      aria-label={`Actions for ${event.title}`}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className={`fixed z-[120] rounded-[14px] border border-slate-200/90 bg-white p-2 shadow-xl shadow-slate-900/15 outline-none dark:border-slate-700 dark:bg-slate-900 ${isMobile ? 'inset-x-3 bottom-3 w-auto origin-bottom' : 'w-[240px] origin-top-right'}`}
      style={isMobile ? undefined : position ? { top: position.top, left: position.left } : { visibility: 'hidden' }}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
    >
      {isMobile && <div className="mb-1 truncate px-3 py-1.5 text-xs font-semibold text-slate-400">{event.title}</div>}
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <div key={action.id}>
            {action.id === 'delete' && <div className="my-1.5 border-t border-slate-100 dark:border-slate-800" />}
            <button
              type="button"
              role="menuitem"
              onClick={() => { onAction(action.id, event); onClose() }}
              className={`flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#0f55f7]/45 ${action.destructive ? 'text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'}`}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{action.label}</span>
            </button>
          </div>
        )
      })}
    </motion.div>,
    document.body
  )
}

function EventRow({ event, onRowClick, activeMenuId, onMenuToggle, onMenuClose, onMenuAction }) {
  const statusStyle = getWebinarStatusStyle(event.status)
  const hostInitials = event.hostName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const menuTriggerRef = useRef(null)
  const isMenuOpen = activeMenuId === event.id

  return (
    <motion.tr
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => onRowClick(event.id)}
      className={`${TABLE_ROW_CLASS} ${TABLE_ROW_HEIGHT_CLASS}`}
      role="row"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onRowClick(event.id) }}
      aria-label={`${event.title} - ${event.status}`}
    >
      {/* Event Info */}
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0f55f7]/10 dark:bg-[#0f55f7]/20">
            <EventTypeIcon type={getWebinarTypeIcon(event.type)} className="w-5 h-5 text-[#0f55f7]" />
          </div>
          <div className="min-w-0">
            <p title={event.title} className={`truncate transition-colors group-hover:text-[#0f55f7] ${TABLE_PRIMARY_TEXT_CLASS}`}>
              {event.title}
            </p>
            <p className={`mt-0.5 truncate ${TABLE_SECONDARY_TEXT_CLASS}`}>
              {event.description}
            </p>
          </div>
        </div>
      </td>

      {/* Host */}
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#0f55f7] to-[#06b6a8] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
            {hostInitials}
          </div>
          <div className="min-w-0">
            <p className={`truncate ${TABLE_CELL_TEXT_CLASS}`}>{event.hostName}</p>
            <p className={`truncate ${TABLE_SECONDARY_TEXT_CLASS}`}>{event.hostDesignation}</p>
          </div>
        </div>
      </td>

      {/* Date & Time */}
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <div>
            <p className="font-medium text-slate-700 dark:text-slate-300">{event.date}</p>
            <p className="text-[11px] text-slate-400">{event.startTime} - {event.endTime}</p>
          </div>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-2.5">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyle.badge}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
          {event.status === 'Live Now' ? 'Live' : event.status}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onRowClick(event.id)}
            className={TABLE_ACTION_ICON_BUTTON_CLASS}
            aria-label={`View ${event.title}`}
          >
            <Eye className="w-4 h-4" />
          </button>
          <div className="relative">
            <button
              ref={menuTriggerRef}
              type="button"
              onClick={() => onMenuToggle(event.id)}
              onKeyDown={(keyboardEvent) => keyboardEvent.stopPropagation()}
              className={TABLE_ACTION_ICON_BUTTON_CLASS}
              aria-label={`More actions for ${event.title}`}
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {isMenuOpen && (
              <EventActionMenu
                event={event}
                triggerRef={menuTriggerRef}
                onClose={onMenuClose}
                onAction={onMenuAction}
              />
            )}
          </div>
        </div>
      </td>
    </motion.tr>
  )
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────

function EmptyState({ hasFilters }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4">
        <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Events Found</h3>
      <p className="mt-1 text-sm text-slate-400">
        {hasFilters ? 'Try adjusting your search or filters.' : 'Create your first webinar or meeting.'}
      </p>
    </motion.div>
  )
}

// ─── ERROR STATE ──────────────────────────────────────────────────────────────

function ErrorState({ onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-500/10 mb-4">
        <AlertTriangle className="w-10 h-10 text-amber-500" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Backend Unavailable</h3>
      <p className="mt-1 text-sm text-slate-400 text-center max-w-md">
        We could not connect to the webinars service. Displaying demo data for preview purposes.
      </p>
      <button
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0f55f7] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0f55f7]/90 transition-colors"
      >
        Retry Connection
      </button>
    </motion.div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function Webinars() {
  const navigate = useNavigate()
  const [webinars, setWebinars] = useState(WEBINARS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('All Events')
  const [typeFilter, setTypeFilter] = useState('All')
  const [departmentFilter, setDepartmentFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [selectedWebinar, setSelectedWebinar] = useState(null)
  const [activeMenuId, setActiveMenuId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    meetingType: 'Webinar',
    department: 'Engineering',
    host: '',
    date: '',
    startTime: '',
    endTime: '',
    timezone: 'IST (UTC+5:30)',
    meetingPlatform: 'Google Meet',
    meetingLink: '',
    maxAttendees: '',
    description: '',
    status: 'Draft',
    thumbnail: null,
  })
  const [formErrors, setFormErrors] = useState({})
  const searchInputRef = useRef(null)

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  // Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Derived data
  const liveCount = useMemo(() => webinars.filter((webinar) => webinar.status === 'Live Now').length, [webinars])
  const stats = useMemo(() => ({
    total: webinars.length,
    upcoming: webinars.filter((webinar) => webinar.status === 'Upcoming').length,
    liveNow: liveCount,
    completed: webinars.filter((webinar) => webinar.status === 'Completed').length,
    totalAttendees: webinars.reduce((sum, webinar) => sum + (webinar.attendees || 0), 0),
  }), [webinars, liveCount])
  const tabCounts = useMemo(() => {
    const counts = {}
    STATUS_TABS.forEach(tab => {
      if (tab === 'All Events') counts[tab] = webinars.length
      else if (tab === 'Live Now') counts[tab] = liveCount
      else counts[tab] = webinars.filter(w => w.status === tab).length
    })
    return counts
  }, [webinars, liveCount])

  const filteredWebinars = useMemo(() => {
    const filtered = filterWebinars(webinars, {
      search: searchQuery,
      status: activeTab === 'All Events' ? 'All' : activeTab,
      type: typeFilter,
      department: departmentFilter,
    })
    return sortWebinarsBySchedule(filtered)
  }, [webinars, searchQuery, activeTab, typeFilter, departmentFilter])

  const totalPages = Math.max(1, Math.ceil(filteredWebinars.length / itemsPerPage))
  const paginatedWebinars = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredWebinars.slice(start, start + itemsPerPage)
  }, [filteredWebinars, currentPage, itemsPerPage])

  // Handlers
  const handleRowClick = useCallback((eventId) => {
    setSelectedWebinar(webinars.find((event) => event.id === eventId) || null)
  }, [webinars])

  const handleMenuToggle = useCallback((eventId) => {
    setActiveMenuId((currentId) => currentId === eventId ? null : eventId)
  }, [])

  const handleMenuClose = useCallback(() => setActiveMenuId(null), [])

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab)
    setCurrentPage(1)
  }, [])

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }, [])

  const handleRefresh = useCallback(() => {
    setLoading(true)
    setError(false)
    setTimeout(() => {
      setWebinars(WEBINARS)
      setLoading(false)
    }, 500)
  }, [])

  const validateForm = useCallback(() => {
    const errors = {}
    if (!form.title.trim()) errors.title = 'Webinar title is required'
    if (form.title.length > 200) errors.title = 'Title must be under 200 characters'
    if (!form.host.trim()) errors.host = 'Host name is required'
    if (!form.date) errors.date = 'Date is required'
    if (!form.startTime) errors.startTime = 'Start time is required'
    if (!form.endTime) errors.endTime = 'End time is required'
    if (form.startTime && form.endTime && form.startTime >= form.endTime) {
      errors.endTime = 'End time must be after start time'
    }
    if (form.meetingLink && !/^https?:\/\//.test(form.meetingLink.trim())) {
      errors.meetingLink = 'Enter a valid URL starting with http:// or https://'
    }
    if (form.maxAttendees && (!/^\d+$/.test(form.maxAttendees) || Number(form.maxAttendees) <= 0)) {
      errors.maxAttendees = 'Enter a valid number'
    }
    if (form.description.length > 1000) errors.description = 'Description must be under 1000 characters'
    setFormErrors(errors)
    return errors
  }, [form])

  const resetForm = useCallback(() => {
    setForm({
      title: '',
      meetingType: 'Webinar',
      department: 'Engineering',
      host: '',
      date: '',
      startTime: '',
      endTime: '',
      timezone: 'IST (UTC+5:30)',
      meetingPlatform: 'Google Meet',
      meetingLink: '',
      maxAttendees: '',
      description: '',
      status: 'Draft',
      thumbnail: null,
    })
    setFormErrors({})
  }, [])

  const handleScheduleAction = useCallback(
    (actionType) => {
      const errors = validateForm()
      if (Object.keys(errors).length > 0) return

      setSaving(true)
      try {
        const newWebinar = createWebinar({
          ...form,
          status: actionType,
        })
        setWebinars((prev) => [...prev, newWebinar])
        toast.success(
          actionType === 'Publish'
            ? `"${form.title}" published successfully!`
            : `"${form.title}" saved as draft.`
        )
        setScheduleOpen(false)
        resetForm()
      } catch {
        toast.error('Unable to create webinar.')
      } finally {
        setSaving(false)
      }
    },
    [form, resetForm, validateForm]
  )

  const handleExportCSV = useCallback(() => {
    const headers = ['Title', 'Type', 'Host', 'Date', 'Time', 'Duration', 'Attendees', 'Status', 'Department', 'Category']
    const rows = filteredWebinars.map(w => [
      `"${w.title}"`, `"${w.type}"`, `"${w.hostName}"`, w.date,
      `${w.startTime}-${w.endTime}`, w.duration, w.attendees,
      w.status, `"${w.department}"`, `"${w.category}"`
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `webinars_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [filteredWebinars])

  const handleMenuAction = useCallback(async (action, event) => {
    if (action === 'view') {
      handleRowClick(event.id)
      return
    }

    if (action === 'export') {
      handleExportCSV()
      toast.success('Event report exported.')
      return
    }

    if (action === 'share') {
      const shareUrl = `${window.location.origin}${ROUTES.ORG_ADMIN.WEBINARS}#${event.id}`
      try {
        if (!navigator.clipboard) throw new Error('Clipboard is unavailable')
        await navigator.clipboard.writeText(shareUrl)
        toast.success('Event link copied to clipboard.')
      } catch {
        toast.error('Unable to copy the event link.')
      }
      return
    }

    toast('This action is available when webinar service actions are connected.')
  }, [handleExportCSV, handleRowClick])

  return (
    <div className="w-full px-4 py-4 pb-24 sm:px-5 sm:pb-28 lg:px-6 lg:pb-32">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-cyan-50 shadow-inner dark:from-blue-500/20 dark:to-cyan-500/10">
            <Video className="h-5 w-5 text-[#0f55f7]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-2xl">
              Webinars & Meetings
            </h1>
            <p className="text-sm text-slate-400">
              Create, manage and track webinars and meetings for employees.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(ROUTES.ORG_ADMIN.WEBINAR_CALENDAR)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <CalendarRange className="w-4 h-4" />
            <span className="hidden sm:inline">Calendar View</span>
          </button>
          <button
            onClick={() => setScheduleOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#0f55f7]/20 hover:shadow-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Schedule New</span>
          </button>
        </div>

        {/* Schedule New Modal */}
        <Modal
          open={scheduleOpen}
          onClose={() => {
            if (!saving) {
              setScheduleOpen(false)
              resetForm()
            }
          }}
          title="Schedule New Webinar"
          description="Fill in the details to create a new webinar or meeting."
          size="lg"
          footer={
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <Button variant="outline" onClick={() => { setScheduleOpen(false); resetForm() }} disabled={saving}>
                Cancel
              </Button>
              <Button variant="outline" onClick={() => handleScheduleAction('Draft')} disabled={saving}>
                <Save className="w-4 h-4 mr-1.5" />
                Save Draft
              </Button>
              <Button onClick={() => handleScheduleAction('Publish')} disabled={saving}>
                {saving ? (
                  <span className="flex items-center gap-2"><span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" /> Publishing...</span>
                ) : (
                  'Publish'
                )}
              </Button>
            </div>
          }
        >
          <div className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Webinar Title *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Enter webinar title"
                error={formErrors.title}
                icon={Video}
                required
                disabled={saving}
              />

              <Select
                label="Meeting Type *"
                value={form.meetingType}
                onChange={(e) => setForm({ ...form, meetingType: e.target.value })}
                options={[
                  { value: '', label: 'Select type' },
                  ...WEBINAR_TYPES.map((t) => ({ value: t, label: t })),
                ]}
                error={formErrors.meetingType}                    icon={Calendar}
                required
                disabled={saving}
              />

              <Select
                label="Department *"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                options={[
                  { value: '', label: 'Select department' },
                  ...DEPARTMENTS.map((d) => ({ value: d, label: d })),
                ]}
                error={formErrors.department}
                icon={Users}
                required
                disabled={saving}
              />

              <Input
                label="Host *"
                value={form.host}
                onChange={(e) => setForm({ ...form, host: e.target.value })}
                placeholder="Enter host name"
                error={formErrors.host}
                icon={User}
                required
                disabled={saving}
              />

              <Input
                label="Date *"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                error={formErrors.date}
                icon={Calendar}
                required
                disabled={saving}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Start Time *"
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  error={formErrors.startTime}
                  required
                  disabled={saving}
                />
                <Input
                  label="End Time *"
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  error={formErrors.endTime}
                  required
                  disabled={saving}
                />
              </div>

              <Input
                label="Meeting Link"
                value={form.meetingLink}
                onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
                placeholder="https://meet.google.com/..."
                error={formErrors.meetingLink}
                icon={Globe}
                disabled={saving}
              />

              <Select
                label="Meeting Platform"
                value={form.meetingPlatform}
                onChange={(e) => setForm({ ...form, meetingPlatform: e.target.value })}
                options={[
                  { value: 'Google Meet', label: 'Google Meet' },
                  { value: 'Zoom', label: 'Zoom' },
                  { value: 'Microsoft Teams', label: 'Microsoft Teams' },
                  { value: 'Webex', label: 'Webex' },
                  { value: 'Other', label: 'Other' },
                ]}
                disabled={saving}
              />

              <Select
                label="Time Zone"
                value={form.timezone}
                onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                options={[
                  { value: 'IST (UTC+5:30)', label: 'IST (UTC+5:30)' },
                  { value: 'EST (UTC-5:00)', label: 'EST (UTC-5:00)' },
                  { value: 'PST (UTC-8:00)', label: 'PST (UTC-8:00)' },
                  { value: 'GMT (UTC+0:00)', label: 'GMT (UTC+0:00)' },
                  { value: 'CET (UTC+1:00)', label: 'CET (UTC+1:00)' },
                ]}
                disabled={saving}
              />

              <Input
                label="Maximum Attendees"
                type="number"
                min="1"
                value={form.maxAttendees}
                onChange={(e) => setForm({ ...form, maxAttendees: e.target.value })}
                placeholder="e.g. 100"
                error={formErrors.maxAttendees}
                icon={Users}
                disabled={saving}
              />

              <Select
                label="Status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                options={[
                  { value: 'Draft', label: 'Draft' },
                  { value: 'Upcoming', label: 'Upcoming' },
                  { value: 'Live Now', label: 'Live Now' },
                ]}
                disabled={saving}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Enter webinar description..."
                disabled={saving}
                rows={3}
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[#0f55f7] focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white ${
                  formErrors.description ? 'border-red-400' : 'border-slate-200'
                }`}
              />
              {formErrors.description && (
                <p className="text-xs text-red-500">{formErrors.description}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Thumbnail Image
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-4 dark:border-slate-600 dark:bg-slate-800/30">
                <Upload className="h-5 w-5 text-slate-400" />
                <span className="text-xs text-slate-500">
                  Upload an image (JPEG, PNG). Feature coming soon.
                </span>
              </div>
            </div>
          </div>
        </Modal>
      </motion.div>

      {/* Summary Cards */}
      {loading ? <CardSkeleton /> : (
        <div className="mb-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          <SummaryCard icon={Calendar} label="Total Events" value={stats.total} color="bg-blue-500" />
          <SummaryCard icon={Clock} label="Upcoming" value={stats.upcoming} color="bg-purple-500" />
          <SummaryCard icon={Video} label="Live Now" value={stats.liveNow} color="bg-green-500" />
          <SummaryCard icon={ClipboardCheck} label="Completed" value={stats.completed} color="bg-slate-500" />
          <SummaryCard icon={Users} label="Total Attendees" value={stats.totalAttendees} color="bg-amber-500" />
        </div>
      )}

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-2 space-y-2 rounded-xl border border-slate-200/80 bg-white/80 p-2 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/50"
      >
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by title, host, type or topic..."
            className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-[#0f55f7]/30 focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/20 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
            aria-label="Search webinars"
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); setCurrentPage(1) }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors" aria-label="Clear search">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="absolute right-3.5 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-400">⌘K</kbd>
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1) }}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/20"
            aria-label="Filter by type"
          >
            <option value="All">All Types</option>
            {WEBINAR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={departmentFilter}
            onChange={(e) => { setDepartmentFilter(e.target.value); setCurrentPage(1) }}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/20"
            aria-label="Filter by department"
          >
            <option value="All">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <div className="flex-1" />
          <button onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            aria-label="Refresh data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <button onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            aria-label="Export as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </motion.div>

      {/* Status Tabs */}
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="mb-2"
      >
        <StatusTabs
          tabs={STATUS_TABS}
          counts={tabCounts}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </motion.div>

      {/* Main Content */}
      <div className="space-y-2.5">
        {/* Status Bar */}
        {!loading && !error && (
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Showing <span className="font-semibold text-slate-600 dark:text-slate-300">{filteredWebinars.length}</span> event{filteredWebinars.length !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1">
              <Monitor className="w-3 h-3" />
              {liveCount} live now
            </span>
          </div>
        )}

        {/* Loading */}
        {loading && <TableSkeleton />}

        {/* Error */}
        {!loading && error && <ErrorState onRetry={handleRefresh} />}

        {/* Empty */}
        {!loading && !error && paginatedWebinars.length === 0 && (
          <EmptyState hasFilters={searchQuery.length > 0 || activeTab !== 'All Events' || typeFilter !== 'All' || departmentFilter !== 'All'} />
        )}

        {/* Table - Desktop */}
        {!loading && !error && paginatedWebinars.length > 0 && (
          <>
            <TableFrame className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
              <table className="w-full table-fixed text-left" role="table" aria-label="Webinars and meetings">
                <colgroup>
                  <col className="w-[35%]" />
                  <col className="w-[20%]" />
                  <col className="w-[20%]" />
                  <col className="w-[10%]" />
                  <col className="w-[15%]" />
                </colgroup>
                <thead className="border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50">
                  <tr>
                    <th className={TABLE_HEADER_CLASS}>Event</th>
                    <th className={TABLE_HEADER_CLASS}>Host</th>
                    <th className={TABLE_HEADER_CLASS}>Date & Time</th>
                    <th className={TABLE_HEADER_CLASS}>Status</th>
                    <th className={TABLE_HEADER_CLASS}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {paginatedWebinars.map((event) => (
                      <EventRow
                        key={event.id}
                        event={event}
                        onRowClick={handleRowClick}
                        activeMenuId={activeMenuId}
                        onMenuToggle={handleMenuToggle}
                        onMenuClose={handleMenuClose}
                        onMenuAction={handleMenuAction}
                      />
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </TableFrame>
          </>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Rows per page</span>
              <select
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1) }}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs text-slate-600 dark:text-slate-300 focus:outline-none"
                aria-label="Items per page"
              >
                {ITEMS_PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <span>· {filteredWebinars.length} total</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
                let pn; const tp = totalPages, cp = currentPage
                if (tp <= 5) pn = idx + 1
                else if (cp <= 3) pn = idx + 1
                else if (cp >= tp - 2) pn = tp - 4 + idx
                else pn = cp - 2 + idx
                return (
                  <button key={pn} onClick={() => setCurrentPage(pn)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                      currentPage === pn ? 'bg-[#0f55f7] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    aria-label={`Page ${pn}`}
                    aria-current={currentPage === pn ? 'page' : undefined}
                  >{pn}</button>
                )
              })}
              <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
      <WebinarDetailsDrawer event={selectedWebinar} onClose={() => setSelectedWebinar(null)} />
    </div>
  )
}
