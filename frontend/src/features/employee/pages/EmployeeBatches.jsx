import { useLocation, useNavigate } from 'react-router-dom'
import { batchIdOf } from '@features/hr/services/hrBatchDetails'
import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import {
  Users, BookOpen, Calendar, Clock, MapPin, Search,
  RefreshCw, ChevronLeft, ChevronRight, Play, UserCheck,
  GraduationCap, Layers, SortAsc, SortDesc, X, Plus, MoreVertical, ArrowRight,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import Modal from '@shared/components/Modal'
import { batchService } from '@shared/services/batchService'
import useEmployeeTotal from '../hooks/useEmployeeTotal'
import usePermission from '@shared/hooks/usePermission'
import BatchManagement from '@features/organization/pages/BatchManagement'
import { HrBreadcrumb, HrHero, HrKpis } from '@features/hr/components/portal/HrPortalKit'
import { heroProps } from '@features/hr/components/portal/hrHeroes'
import '@features/hr/components/portal/hr-batches.css'

// ─── NORMALIZE API BATCH → COMPONENT BATCH SHAPE ────────────────────────────

const normalizedMentorName = batch => {
  const mentors = Array.isArray(batch.mentors) ? batch.mentors : [batch.mentor]
  const names = mentors.map(mentor => typeof mentor === 'string' ? mentor : [mentor?.mentorName, mentor?.fullName, [mentor?.firstName, mentor?.lastName].filter(Boolean).join(' '), mentor?.name].find(Boolean)).filter(Boolean)
  return batch.mentorName || names.join(', ') || '-'
}

const normalizeApiBatch = (batch) => ({
  raw: batch,
  id: batchIdOf(batch),
  name: batch.batchName ?? batch.name ?? '-',
  course: batch.courseName ?? batch.course?.courseName ?? batch.course ?? '-',
  code: batch.batchCode ?? batch.code ?? (batch.batchId ? `B-${batch.batchId}` : '-'),
  mentor: normalizedMentorName(batch),
  department: batch.department ?? '-',
  startDate: batch.startDate ?? null,
  endDate: batch.endDate ?? null,
  timing: batch.timing ?? batch.batchTiming ?? batch.time ?? '-',
  mode: batch.batchType ?? batch.mode ?? 'Online',
  status: batch.status ?? 'Upcoming',
  sessions: Number(batch.sessions ?? batch.totalSessions ?? 0),
  attendance: Number(batch.attendance ?? batch.attendancePercentage ?? 0),
  progress: Number(batch.progress ?? batch.completionPercentage ?? 0),
  employees: Number(batch.employees ?? batch.studentsCount ?? batch.enrolledStudents ?? 0),
  description: batch.description ?? '',
})

const ITEMS_PER_PAGE = 6

const normalizedSearchValue = value => String(value ?? '').trim().replace(/\s+/g, ' ').toLocaleLowerCase()
const mentorNamesOf = batch => {
  const mentors = Array.isArray(batch?.mentors) ? batch.mentors : [batch?.mentor]
  return [batch?.mentorName, ...mentors.map(mentor => typeof mentor === 'string' ? mentor : [mentor?.mentorName, mentor?.fullName, [mentor?.firstName, mentor?.lastName].filter(Boolean).join(' '), mentor?.name].find(Boolean))]
    .filter(Boolean).map(normalizedSearchValue)
}

async function findBatchesByMentorFullName(search) {
  const query = normalizedSearchValue(search)
  const terms = query.split(' ').filter(Boolean)
  if (terms.length < 2) return []
  // Search the scoped collection locally when the API cannot match mentors.
  const rows = new Map()
  let pageNumber = 1
  let lastPage = 1
  do {
    const response = await batchService.getAll({ pageNumber, pageSize: 100 })
    for (const batch of response?.data ?? []) {
      const id = batchIdOf(batch)
      if (id != null) rows.set(String(id), batch)
    }
    lastPage = Math.max(1, Number(response?.totalPages ?? 1))
    pageNumber += 1
  } while (pageNumber <= lastPage)
  return [...rows.values()].filter(batch => mentorNamesOf(batch).some(name => name.includes(query)))
}

// ─── BATCH CARD ─────────────────────────────────────────────────────────────

const CARD_TONES = ['blue', 'purple', 'green', 'orange', 'red', 'blue']
const STATUS_TONE = { Active: 'green', Upcoming: 'orange', Completed: 'blue', Cancelled: 'red' }

function BatchCard({ batch, onView, onManage, onEdit, onDelete, index }) {
  const tone = STATUS_TONE[batch.status] === 'red' ? 'red' : CARD_TONES[index % CARD_TONES.length]
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 * index }}
      className={`hrb-card is-${tone}`}
    >
      <header className="hrb-card__head">
        <span className="hrb-card__icon" aria-hidden="true"><Layers /></span>
        <div className="min-w-0 flex-1">
          <h3>{batch.name}</h3>
          <p>{batch.course}</p>
        </div>
        <span className={`hrb-status is-${STATUS_TONE[batch.status] ?? 'blue'}`}>{batch.status}</span>
        <div className="relative">
          <button type="button" className="hrb-more" aria-label={`More actions for ${batch.name}`} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><MoreVertical /></button>
          {menuOpen && (
            <div className="hrb-menu" role="menu" onMouseLeave={() => setMenuOpen(false)}>
              <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); onView(batch) }}>View details</button>
              {onEdit && <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); onEdit(batch) }}>Edit batch</button>}
              {onDelete && <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); onDelete(batch) }}>Delete batch</button>}
            </div>
          )}
        </div>
      </header>
      <ul className="hrb-meta">
        <li><Users aria-hidden="true" />{batch.employees} Employees</li>
        <li><UserCheck aria-hidden="true" />{batch.mentor}</li>
        <li><BookOpen aria-hidden="true" />{batch.sessions} Sessions</li>
        <li><Calendar aria-hidden="true" />{new Date(batch.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</li>
        <li className="hrb-mode"><MapPin aria-hidden="true" />{batch.mode}</li>
      </ul>
      <div className="hrb-progress">
        <div><span>Progress</span><b>{batch.progress}%</b></div>
        <span className="hrb-bar"><i style={{ width: `${Math.max(batch.progress, 0)}%` }} /></span>
      </div>
      <div className="hrb-att"><UserCheck aria-hidden="true" />Attendance <b>{batch.attendance}%</b></div>
      <footer className="hrb-actions">
        <button type="button" className="hrb-btn hrb-btn--outline" onClick={() => onView(batch)}>View Details</button>
        <button type="button" className="hrb-btn hrb-btn--fill" onClick={() => onManage(batch)}>Manage Batch <ArrowRight aria-hidden="true" /></button>
        {onEdit && <button type="button" className="hrb-btn hrb-btn--outline" onClick={() => onEdit(batch)}>Edit Batch</button>}
        {onDelete && <button type="button" className="hrb-btn hrb-btn--outline" onClick={() => onDelete(batch)}>Delete Batch</button>}
      </footer>
    </motion.article>
  )
}

// ─── EMPLOYEE BATCHES PAGE ──────────────────────────────────────────────────

export default function EmployeeBatches() {
  const navigate = useNavigate()
  const location = useLocation()
  const permissions = usePermission()
  const canAdd = permissions.hasPermission('batches') && permissions.can('batches', 'add')
  const canEditBatch = permissions.hasPermission('batches') && permissions.can('batches', 'edit')
  const canDeleteBatch = permissions.hasPermission('batches') && permissions.can('batches', 'delete')
  const [addingBatch, setAddingBatch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [courseFilter, setCourseFilter] = useState('all')
  const [modeFilter, setModeFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [sortBy, setSortBy] = useState('startDate')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [allBatches, setAllBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [totalApiPages, setTotalApiPages] = useState(1)
  const [totalApiRecords, setTotalApiRecords] = useState(0)
  const [editingBatch, setEditingBatch] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [employeeRevision, setEmployeeRevision] = useState(0)
  const [summary, setSummary] = useState(null)
  const employeeTotal = useEmployeeTotal(employeeRevision)
  const fallbackToastShown = useRef(false)

  useEffect(() => {
    let active = true
    batchService.getSummary().then(result => {
      if (active) setSummary(result)
    }).catch(() => {
      if (active) setSummary(null)
    })
    return () => { active = false }
  }, [employeeRevision])

  // Load organization-scoped batches from the API.
  const loadBatches = useCallback(async (search) => {
    setLoading(true)
    setError('')
    try {
      let response = await batchService.getAll({
        search: search?.trim().replace(/\s+/g, ' ') || undefined,
        pageNumber: currentPage,
        pageSize: ITEMS_PER_PAGE,
      })
      if (!(response?.data ?? []).length && normalizedSearchValue(search).includes(' ')) {
        const matchingMentorBatches = await findBatchesByMentorFullName(search)
        if (matchingMentorBatches.length) response = {
          data: matchingMentorBatches.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
          totalRecords: matchingMentorBatches.length,
          totalPages: Math.max(1, Math.ceil(matchingMentorBatches.length / ITEMS_PER_PAGE)),
        }
      }
      const rawData = response?.data ?? []
      const normalized = rawData.map(normalizeApiBatch)
      setAllBatches(normalized)
      setTotalApiPages(Math.max(1, Number(response?.totalPages ?? 1)))
      setTotalApiRecords(Number(response?.totalRecords ?? rawData.length))
    } catch (err) {
      setAllBatches([])
      setTotalApiPages(1)
      setTotalApiRecords(0)
      setError(err?.response?.data?.message || 'Could not load batches from the organization service.')
      if (!fallbackToastShown.current) {
        fallbackToastShown.current = true
        toast.error('Could not reach the organization service.')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [currentPage])

  // Load on mount and when search/page changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadBatches(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [loadBatches, searchQuery])

  // Client-side filter/sort on top of API data (for course/mode/date which API may not support)
  const filtered = useMemo(() => {
    let result = [...allBatches]

    // Status filter (client-side)
    if (statusFilter !== 'all') {
      result = result.filter(b => b.status.toLowerCase() === statusFilter.toLowerCase())
    }

    // Course filter (client-side)
    if (courseFilter !== 'all') {
      result = result.filter(b => b.course === courseFilter)
    }

    // Mode filter (client-side)
    if (modeFilter !== 'all') {
      result = result.filter(b => b.mode.toLowerCase() === modeFilter.toLowerCase())
    }

    // Date filter (client-side)
    if (dateFilter === 'this-month') {
      const now = new Date()
      result = result.filter(b => {
        const d = new Date(b.startDate)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
    } else if (dateFilter === 'this-quarter') {
      const now = new Date()
      const q = Math.floor(now.getMonth() / 3)
      result = result.filter(b => {
        const d = new Date(b.startDate)
        return Math.floor(d.getMonth() / 3) === q && d.getFullYear() === now.getFullYear()
      })
    } else if (dateFilter === 'this-year') {
      const year = new Date().getFullYear()
      result = result.filter(b => new Date(b.startDate).getFullYear() === year)
    }

    // Sort (client-side)
    result.sort((a, b) => {
      let cmp
      if (sortBy === 'name') {
        cmp = a.name.localeCompare(b.name)
      } else {
        cmp = new Date(a.startDate) - new Date(b.startDate)
      }
      return sortOrder === 'asc' ? cmp : -cmp
    })

    return result
  }, [allBatches, statusFilter, courseFilter, modeFilter, dateFilter, sortBy, sortOrder])

  // API data (including mentor-search fallback data) is already paginated.
  const displayTotalPages = totalApiPages
  const displayPage = Math.min(currentPage, displayTotalPages)
  const paginated = filtered

  // Derived unique courses for filter dropdown
  const uniqueCourses = useMemo(() => [...new Set(allBatches.map(b => b.course))].sort(), [allBatches])

  // Summary stats
  const stats = useMemo(() => {
    const total = summary?.totalBatches ?? totalApiRecords
    const active = summary?.activeBatches ?? allBatches.filter(b => b.status === 'Active').length
    const completed = summary?.completedBatches ?? allBatches.filter(b => b.status === 'Completed').length
    const upcoming = summary?.upcomingBatches ?? allBatches.filter(b => b.status === 'Upcoming').length
    return { total, active, completed, upcoming }
  }, [allBatches, summary, totalApiRecords])

  const handleRefresh = () => {
    setRefreshing(true)
    setEmployeeRevision(value => value + 1)
    loadBatches(searchQuery)
  }

  const handleDelete = async () => {
    if (!deleteTarget || deleting || !canDeleteBatch) return
    setDeleting(true)
    try {
      await batchService.remove(deleteTarget.id)
      toast.success('Batch deleted successfully.')
      setDeleteTarget(null)
      setEmployeeRevision(value => value + 1)
      await loadBatches(searchQuery)
    } catch (failure) {
      toast.error(failure?.response?.data?.message || 'Unable to delete this batch.')
    } finally {
      setDeleting(false)
    }
  }

  // Redirect older history entries to the selected batch instead of a preview.
  useEffect(() => {
    const id = location.state?.manageBatch?.id ?? location.state?.manageBatch?.batchId
    if (id == null) return
    navigate(`/employee/batches/${encodeURIComponent(id)}?tab=students`, { replace: true, state: null })
  }, [location.state, navigate])
  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(o => o === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  return (
    <div className="hrp-page hrb-page mx-auto max-w-[1500px] px-4 py-4 sm:px-5">
      <HrBreadcrumb items={[{ label: 'Home', to: '/employee/hr-dashboard' }, { label: 'Employee', to: '/employee/hr-employees' }, { label: 'Batches' }]} />
      <HrHero
        {...heroProps('batches')}
        actions={(
          <>
            <button type="button" onClick={handleRefresh} disabled={refreshing} className="hrp-btn hrp-btn--white"><RefreshCw className={refreshing ? 'animate-spin' : ''} />{refreshing ? 'Refreshing...' : 'Refresh'}</button>
            {canAdd && <button type="button" onClick={() => setAddingBatch(true)} className="hrp-btn hrp-btn--orange"><Plus />Add Batch</button>}
          </>
        )}
      />

      {addingBatch && canAdd && <BatchManagement createOnly onClose={() => setAddingBatch(false)} onCreated={async () => { setAddingBatch(false); setEmployeeRevision(value => value + 1); await loadBatches(searchQuery) }} />}
      <HrKpis
        items={[
          { label: 'Total Batches', value: stats.total, sub: 'All training batches', icon: Layers, tone: 'blue', onClick: () => { setStatusFilter('all'); setCurrentPage(1) } },
          { label: 'Active Batches', value: stats.active, sub: 'Currently running', icon: Play, tone: 'green', onClick: () => { setStatusFilter('active'); setCurrentPage(1) } },
          { label: 'Completed Batches', value: stats.completed, sub: 'Successfully finished', icon: GraduationCap, tone: 'purple', onClick: () => { setStatusFilter('completed'); setCurrentPage(1) } },
          { label: 'Upcoming Batches', value: stats.upcoming, sub: 'Scheduled to start', icon: Clock, tone: 'orange', onClick: () => { setStatusFilter('upcoming'); setCurrentPage(1) } },
          { label: 'Total Employees', value: employeeTotal.loading ? '…' : employeeTotal.count ?? '—', sub: employeeTotal.count == null && !employeeTotal.loading ? 'Employee total unavailable' : 'Enrolled across batches', icon: Users, tone: 'red' },
        ]}
      />
      <div className="mb-3" />

      {/* Filters & Search */}
      <div className="hrb-filters">
        <label className="hrb-search">
          <Search aria-hidden="true" />
          <input type="text" placeholder="Search by batch name, course, or mentor..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }} aria-label="Search batches" />
          {searchQuery && <button type="button" onClick={() => setSearchQuery('')} aria-label="Clear search"><X /></button>}
        </label>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }} aria-label="Status">
          <option value="all">All Status</option><option value="active">Active</option><option value="upcoming">Upcoming</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
        </select>
        <select value={courseFilter} onChange={(e) => { setCourseFilter(e.target.value); setCurrentPage(1) }} aria-label="Course">
          <option value="all">All Courses</option>
          {uniqueCourses.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={modeFilter} onChange={(e) => { setModeFilter(e.target.value); setCurrentPage(1) }} aria-label="Mode">
          <option value="all">All Modes</option><option value="online">Online</option><option value="offline">Offline</option><option value="hybrid">Hybrid</option>
        </select>
        <label className="hrb-date">
          <Calendar aria-hidden="true" />
          <select value={dateFilter} onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1) }} aria-label="Date range">
            <option value="all">Select Date Range</option><option value="this-month">This Month</option><option value="this-quarter">This Quarter</option><option value="this-year">This Year</option>
          </select>
        </label>
        <button type="button" className="hrb-sort" onClick={() => toggleSort(sortBy === 'name' ? 'startDate' : 'name')} title={`Sorted by ${sortBy === 'name' ? 'name' : 'start date'} (${sortOrder})`}>
          {sortOrder === 'asc' ? <SortAsc /> : <SortDesc />}{sortBy === 'name' ? 'Name' : 'Date'}
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-100 dark:border-slate-700/30 bg-white dark:bg-slate-900/40 p-4 animate-pulse">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
                  <div className="space-y-2">
                    <div className="h-4 w-44 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
                  </div>
                </div>
                <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
              </div>
              <div className="flex gap-3 mb-3">
                <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full mb-3" />
              <div className="flex justify-between">
                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"><span>{error}</span><button onClick={() => { setRefreshing(true); loadBatches(searchQuery) }} className="shrink-0 rounded-lg bg-red-600 px-3 py-1.5 text-white">Retry</button></div>}

      {/* Batch Cards Grid */}
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
              <Layers className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-base font-semibold">No batches found</p>
              <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
            </motion.div>
          ) : (
            <motion.div key="batches" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="hrb-grid grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {paginated.map((batch, i) => (
                  <BatchCard key={batch.id} batch={batch} index={i} onView={batch => batch.id != null ? navigate(`/employee/batches/${encodeURIComponent(batch.id)}`) : toast.error('This batch has no backend ID.')} onManage={batch => batch.id != null ? navigate(`/employee/batches/${encodeURIComponent(batch.id)}?tab=students`) : toast.error('This batch has no backend ID.')} onEdit={canEditBatch ? setEditingBatch : undefined} onDelete={canDeleteBatch ? setDeleteTarget : undefined} />
                ))}
              </div>

              <div className="hrb-foot">
                <p>Showing {((displayPage - 1) * ITEMS_PER_PAGE) + 1}-{((displayPage - 1) * ITEMS_PER_PAGE) + filtered.length} of {totalApiRecords} batches</p>
                <div className="hrb-pager">
                  <button type="button" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={displayPage === 1} aria-label="Previous page"><ChevronLeft /></button>
                  {Array.from({ length: displayTotalPages }, (_, i) => i + 1).map(page => (
                    <button key={page} type="button" onClick={() => setCurrentPage(page)} aria-current={displayPage === page ? 'page' : undefined}>{page}</button>
                  ))}
                  <button type="button" onClick={() => setCurrentPage(p => Math.min(displayTotalPages, p + 1))} disabled={displayPage === displayTotalPages} aria-label="Next page"><ChevronRight /></button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {editingBatch && <BatchManagement createOnly initialBatch={editingBatch.raw} onClose={() => setEditingBatch(null)} onCreated={async () => { setEditingBatch(null); setEmployeeRevision(value => value + 1); await loadBatches(searchQuery) }} />}
      <Modal trapFocus open={Boolean(deleteTarget)} title="Delete Batch" description="This action cannot be undone." onClose={() => !deleting && setDeleteTarget(null)} footer={<div className="flex justify-end gap-3"><button type="button" disabled={deleting} onClick={() => setDeleteTarget(null)} className="rounded-lg border px-4 py-2">Cancel</button><button type="button" disabled={deleting} onClick={handleDelete} className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white">{deleting ? 'Deleting...' : 'Delete Batch'}</button></div>}><p>Delete <strong>{deleteTarget?.name}</strong>?</p></Modal>
    </div>
  )
}
