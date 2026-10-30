import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, ChevronsLeft, ChevronsRight, ChevronsUpDown, ChevronLeft, ChevronRight, CalendarDays, Clock3, Edit3, Eye, ExternalLink, Inbox, Video } from 'lucide-react'
import Checkbox from '@shared/ui/Checkbox'
import EmptyState from '@shared/components/EmptyState'
import { TableSkeleton } from '@shared/ui/Skeleton'
import {
  TABLE_CELL_TEXT_CLASS,
  TABLE_HEADER_CLASS,
  TABLE_PRIMARY_TEXT_CLASS,
  TABLE_ROW_CLASS,
  TABLE_SECONDARY_TEXT_CLASS,
} from '@shared/constants/tableStyles'
import StatusBadge from '@shared/components/StatusBadge'
import LiveClassNotice from './LiveClassNotice'
import { getInitials } from '../utils/liveClassUi'

const DENSITY_ROW_CLASS = {
  comfortable: 'h-[72px]',
  compact: 'h-[52px]',
}

const SortIcon = ({ active, dir }) => {
  if (!active) return <ChevronsUpDown className="h-3.5 w-3.5 text-slate-400" />
  return dir === 'asc' ? <ChevronUp className="h-3.5 w-3.5 text-[#0f55f7]" /> : <ChevronDown className="h-3.5 w-3.5 text-[#0f55f7]" />
}

const isActiveMeetingUrl = (value) => {
  try {
    const url = new URL(String(value || ''))
    return ['http:', 'https:'].includes(url.protocol)
  } catch {
    return false
  }
}

export default function LiveClassTable({
  rows,
  loading,
  loaded,
  error,
  errorStatus,
  onRetry,
  density,
  visibleColumns,
  pageSize,
  selectedIds,
  onToggleRow,
  onToggleAllOnPage,
  onRowClick,
  onView,
  onEdit,
}) {
  const [sortField, setSortField] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const rowHeightClass = DENSITY_ROW_CLASS[density] || DENSITY_ROW_CLASS.comfortable

  const sorted = useMemo(() => {
    if (!sortField) return rows
    const copy = [...rows]
    copy.sort((a, b) => {
      const aVal = a[sortField] ?? ''
      const bVal = b[sortField] ?? ''
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return copy
  }, [rows, sortDir, sortField])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageRows = sorted.slice((safePage - 1) * pageSize, safePage * pageSize)

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
    setPage(1)
  }

  const allOnPageSelected = pageRows.length > 0 && pageRows.every((row) => selectedIds.has(row.id))


  if (error) {
    return (
      <div className="p-4">
        <LiveClassNotice isAuthError={[401, 403].includes(errorStatus)} onRetry={onRetry} />
      </div>
    )
  }

  if (loading && !loaded) {
    return (
      <div className="p-4">
        <TableSkeleton rows={6} columns={6} />
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        compact
        title="No live classes found"
        description="Adjust your search or filters to find a class."
        icon={Inbox}
      />
    )
  }

  return (
    <div className="min-w-0">
      <div className="w-full max-w-full overflow-x-auto">
        {/* Text columns take 87%; the 44px checkbox and 96px Actions columns use the rest. */}
        <table className="w-full min-w-[1000px] table-fixed border-collapse" role="table" aria-label="Live classes">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800/60">
              <th className={`sticky top-0 z-20 w-11 bg-white/95 backdrop-blur dark:bg-slate-900/95 ${TABLE_HEADER_CLASS}`}>
                <Checkbox checked={allOnPageSelected} onChange={() => onToggleAllOnPage(pageRows)} aria-label="Select all rows on this page" />
              </th>
              <th
                className={`sticky top-0 z-20 cursor-pointer select-none bg-white/95 backdrop-blur hover:text-slate-600 dark:bg-slate-900/95 dark:hover:text-slate-300 ${TABLE_HEADER_CLASS}`}
                style={{ width: '23%' }}
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center gap-1.5"><span>Class</span><SortIcon active={sortField === 'title'} dir={sortDir} /></div>
              </th>
              {visibleColumns.batch && (
                <th
                  className={`sticky top-0 z-20 cursor-pointer select-none bg-white/95 backdrop-blur hover:text-slate-600 dark:bg-slate-900/95 dark:hover:text-slate-300 ${TABLE_HEADER_CLASS}`}
                  style={{ width: '17%' }}
                  onClick={() => handleSort('batchName')}
                >
                  <div className="flex items-center gap-1.5"><span>Batch</span><SortIcon active={sortField === 'batchName'} dir={sortDir} /></div>
                </th>
              )}
              {visibleColumns.mentor && (
                <th
                  className={`sticky top-0 z-20 cursor-pointer select-none bg-white/95 backdrop-blur hover:text-slate-600 dark:bg-slate-900/95 dark:hover:text-slate-300 ${TABLE_HEADER_CLASS}`}
                  style={{ width: '14%' }}
                  onClick={() => handleSort('mentorName')}
                >
                  <div className="flex items-center gap-1.5"><span>Mentor</span><SortIcon active={sortField === 'mentorName'} dir={sortDir} /></div>
                </th>
              )}
              {visibleColumns.datetime && (
                <th
                  className={`sticky top-0 z-20 cursor-pointer select-none bg-white/95 backdrop-blur hover:text-slate-600 dark:bg-slate-900/95 dark:hover:text-slate-300 ${TABLE_HEADER_CLASS}`}
                  style={{ width: '13%' }}
                  onClick={() => handleSort('startAt')}
                >
                  <div className="flex items-center gap-1.5"><span>Date & Time</span><SortIcon active={sortField === 'startAt'} dir={sortDir} /></div>
                </th>
              )}
              <th className={`sticky top-0 z-20 bg-white/95 backdrop-blur dark:bg-slate-900/95 ${TABLE_HEADER_CLASS}`} style={{ width: '10%' }}>
                Meeting
              </th>
              {visibleColumns.status && (
                <th
                  className={`sticky top-0 z-20 cursor-pointer select-none bg-white/95 backdrop-blur hover:text-slate-600 dark:bg-slate-900/95 dark:hover:text-slate-300 ${TABLE_HEADER_CLASS}`}
                  style={{ width: '10%' }}
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1.5"><span>Status</span><SortIcon active={sortField === 'status'} dir={sortDir} /></div>
                </th>
              )}
              <th className={`sticky top-0 z-20 bg-white/95 text-right backdrop-blur dark:bg-slate-900/95 ${TABLE_HEADER_CLASS}`} style={{ width: '96px' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick(row)}
                className={`${TABLE_ROW_CLASS} ${rowHeightClass} cursor-pointer`}
              >
                <td className="px-3 align-middle" onClick={(event) => event.stopPropagation()}>
                  <Checkbox checked={selectedIds.has(row.id)} onChange={() => onToggleRow(row.id)} aria-label={`Select ${row.title}`} />
                </td>
                <td className={`px-3 align-middle ${TABLE_CELL_TEXT_CLASS}`}>
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0f55f7]/10 text-[#0f55f7]">
                      <Video className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className={`line-clamp-1 ${TABLE_PRIMARY_TEXT_CLASS}`}>{row.title}</p>
                      <p className={`line-clamp-1 ${TABLE_SECONDARY_TEXT_CLASS}`}>{row.description || 'No description provided'}</p>
                    </div>
                  </div>
                </td>
                {visibleColumns.batch && (
                  <td className={`px-3 align-middle ${TABLE_CELL_TEXT_CLASS}`}>
                    <span className="block truncate">{row.batchName || 'Not Available'}</span>
                  </td>
                )}
                {visibleColumns.mentor && (
                  <td className={`px-3 align-middle ${TABLE_CELL_TEXT_CLASS}`}>
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0f55f7]/10">
                        {row.mentorAvatar ? (
                          <img src={row.mentorAvatar} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-[11px] font-bold text-[#0f55f7]">{getInitials(row.mentorName)}</span>
                        )}
                      </div>
                      <p className={`line-clamp-1 ${TABLE_PRIMARY_TEXT_CLASS}`}>{row.mentorName || 'Not Assigned'}</p>
                    </div>
                  </td>
                )}
                {visibleColumns.datetime && (
                  <td className={`px-3 align-middle ${TABLE_CELL_TEXT_CLASS}`}>
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className={`truncate ${TABLE_PRIMARY_TEXT_CLASS}`}>{row.dateLabel || 'Not Available'}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <Clock3 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className={`truncate ${TABLE_SECONDARY_TEXT_CLASS}`}>{row.timeLabel || 'Not Available'}</span>
                    </div>
                  </td>
                )}
                <td className="px-3 align-middle">
                  {isActiveMeetingUrl(row.meetingUrl) ? (
                    <a href={row.meetingUrl} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100 hover:shadow-sm" title="Open active meeting link">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,.14)]" />
                      <span className="truncate">Active</span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-400" title="No valid meeting URL configured">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-slate-300" /> Inactive
                    </span>
                  )}
                </td>
                {visibleColumns.status && (
                  <td className="px-3 align-middle">
                    <StatusBadge status={row.statusTone} label={row.statusLabel} pulse={row.status === 'live'} />
                  </td>
                )}
                <td className="px-3 align-middle" onClick={(event) => event.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onView(row)}
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-[#0f55f7]/30 hover:text-[#0f55f7] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                      aria-label={`View ${row.title}`}
                      title="View"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={row.status === 'live'}
                      onClick={() => onEdit(row)}
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-[#0f55f7]/30 hover:text-[#0f55f7] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                      aria-label={`Edit ${row.title}`}
                      title="Edit"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sorted.length > pageSize && (
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 dark:border-slate-800">
          <p className="text-xs text-slate-400">
            Showing {(safePage - 1) * pageSize + 1}&ndash;{Math.min(safePage * pageSize, sorted.length)} of {sorted.length}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(1)} disabled={safePage === 1} className="rounded-lg p-1.5 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-slate-800" aria-label="First page">
              <ChevronsLeft className="h-4 w-4 text-slate-500" />
            </button>
            <button onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={safePage === 1} className="rounded-lg p-1.5 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-slate-800" aria-label="Previous page">
              <ChevronLeft className="h-4 w-4 text-slate-500" />
            </button>
            <span className="mx-2 text-xs font-medium text-slate-500">Page {safePage} of {totalPages}</span>
            <button onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={safePage === totalPages} className="rounded-lg p-1.5 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-slate-800" aria-label="Next page">
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </button>
            <button onClick={() => setPage(totalPages)} disabled={safePage === totalPages} className="rounded-lg p-1.5 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-slate-800" aria-label="Last page">
              <ChevronsRight className="h-4 w-4 text-slate-500" />
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
