import { useState, useMemo, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, ChevronsUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import SearchInput from './SearchInput'
import EmptyState from './EmptyState'
import PageToolbar from './PageToolbar'
import { TABLE_CELL_TEXT_CLASS, TABLE_HEADER_CLASS, TABLE_ROW_CLASS, TABLE_ROW_HEIGHT_CLASS } from '@shared/constants/tableStyles'

// Memoized sort icon — defined OUTSIDE the component so memo works correctly
const SortIcon = memo(function SortIcon({ sortField, sortDir, field }) {
  if (sortField !== field) return <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
  return sortDir === 'asc'
    ? <ChevronUp className="w-3.5 h-3.5 text-[#0f55f7]" />
    : <ChevronDown className="w-3.5 h-3.5 text-[#0f55f7]" />
})

export default function DataTable({
  columns,
  data,
  pageSize = 10,
  searchable = true,
  searchPlaceholder = 'Search...',
  onRowClick,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  emptyAction,
  loading = false,
  skeletonRows = 5,
  filters,
  fitToContainer = false,
  tableClassName = '',
  tableStyle = {},
  stickyHeader = false,
  rowClassName = '',
  cellClassName = '',
  headerCellClassName = '',
  toolbarClassName = '',
  emptyStateClassName = '',
  emptyStateCompact = false,
  // Standard KiniEduHub table look shared with ListTable (straight pastel
  // header blocks, header divider, row separators, 12px cell padding so
  // labels and values line up, 14px outer card). Pass false for pages with
  // their own bespoke table styling.
  standardStyle = true,
}) {
  const cardClass = standardStyle
    ? 'w-full max-w-full min-w-0 overflow-hidden rounded-[14px] border border-[#E2E8F0] bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900'
    : 'w-full min-w-0 max-w-full overflow-hidden rounded-[20px] border border-slate-200/50 bg-white/70 backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/70'
  const cellPaddingClass = standardStyle ? 'px-[12px] py-2.5' : 'px-4 py-2.5'
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [requestedPage, setPage] = useState(1)

  // Filter data
  const filtered = useMemo(() => {
    let result = [...data]

    // Search filter
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((row) =>
        columns.some((col) => {
          const val = col.accessor ? row[col.accessor] : ''
          return String(val).toLowerCase().includes(q)
        })
      )
    }

    // Sort
    if (sortField) {
      result.sort((a, b) => {
        const aVal = a[sortField]
        const bVal = b[sortField]
        if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
        if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [columns, data, search, sortField, sortDir])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const page = Math.min(requestedPage, totalPages)
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className={cardClass}>
        {searchable && (
          <div className="p-4 border-b border-slate-200/80 dark:border-slate-700/70">
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
          </div>
        )}
        <div className="p-4">
          {Array.from({ length: skeletonRows }).map((_, i) => (
            <div key={i} className="flex gap-4 py-3 border-b border-slate-200/70 dark:border-slate-700/60 last:border-0">
              {columns.map((col, j) => (
                <div
                  key={j}
                  className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"
                  style={{ width: col.width || '100%', flex: col.flex || 1 }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cardClass}>
      {/* Search & Filters */}
      {(searchable || filters) && (
          <PageToolbar className={toolbarClassName}>
          {searchable && (
            <SearchInput
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder={searchPlaceholder}
              onClear={() => { setSearch(''); setPage(1) }}
              className="min-w-[220px] flex-[1_1_280px]"
            />
          )}
          {filters && (
            <div className="flex min-w-0 flex-[0_1_auto] flex-wrap gap-2">
              {filters}
            </div>
          )}
          </PageToolbar>
      )}

      {/* Table */}
      {paginated.length === 0 ? (
        <div className={emptyStateClassName}>
          <EmptyState
            title={emptyTitle || 'No results found'}
            description={emptyDescription || 'Try adjusting your search or filters.'}
            icon={emptyIcon}
            action={emptyAction}
            compact={emptyStateCompact}
          />
        </div>
      ) : (
        <div className="w-full max-w-full overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
          <table
            className={`w-full border-collapse ${fitToContainer ? 'min-w-0' : 'min-w-max'} ${tableClassName}`.trim()}
            role="table"
            aria-label="Data table"
            style={tableStyle}
          >
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-700/70">
                {columns.map((col, columnIndex) => (
                  <th
                    key={col.accessor || col.header}
                    aria-sort={
                      col.sortable !== false && col.accessor && sortField === col.accessor
                        ? (sortDir === 'asc' ? 'ascending' : 'descending')
                        : undefined
                    }
                    tabIndex={col.sortable !== false && col.accessor ? 0 : undefined}
                    onKeyDown={(event) => {
                      if (col.sortable !== false && col.accessor && (event.key === 'Enter' || event.key === ' ')) {
                        event.preventDefault()
                        handleSort(col.accessor)
                      }
                    }}
                    className={`
                      ${stickyHeader ? 'sticky top-0 z-20 bg-white/95 backdrop-blur dark:bg-slate-900/95' : ''}
                      ${TABLE_HEADER_CLASS}
                      ${col.sortable !== false ? 'cursor-pointer select-none hover:text-slate-600 dark:hover:text-slate-300' : ''}
                      ${col.sticky === 'left' ? 'sticky left-0 z-20 border-r border-slate-100 bg-white dark:border-slate-700/50 dark:bg-slate-900' : ''}
                      ${col.sticky === 'right' ? 'sticky right-0 z-20 border-l border-slate-100 bg-white dark:border-slate-700/50 dark:bg-slate-900' : ''}
                      ${headerCellClassName}
                    `}
                    style={{ width: col.width, minWidth: col.minWidth, ...(tableClassName.includes('student-list-table') ? { background: ['#eef4ff', '#e9efff', '#eee9ff', '#e7f6ef', '#fff1dc', '#f2eaff', '#e5f7f5', '#ffe9ee', '#eef0f5'][columnIndex] } : {}) }}
                    onClick={() => col.sortable !== false && col.accessor && handleSort(col.accessor)}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable !== false && col.accessor && (
                        <SortIcon sortField={sortField} sortDir={sortDir} field={col.accessor} />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {paginated.map((row, i) => (
                    <motion.tr
                      key={row.id || i}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ delay: i * 0.02 }}
                      onClick={() => onRowClick?.(row)}
                      className={`
                      ${TABLE_ROW_CLASS} ${TABLE_ROW_HEIGHT_CLASS} ${rowClassName}
                      transition-colors duration-150
                      ${onRowClick ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30' : ''}
                    `}
                    >
                      {columns.map((col) => (
                        <td
                          key={col.accessor || col.header}
                        className={`${cellPaddingClass} ${TABLE_CELL_TEXT_CLASS} ${cellClassName} ${col.sticky === 'left' ? 'sticky left-0 z-10 border-r border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900' : ''} ${col.sticky === 'right' ? 'sticky right-0 z-10 border-l border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900' : ''}`}
                          style={{ width: col.width, minWidth: col.minWidth }}
                        >
                        {col.render
                          ? col.render(row)
                          : col.accessor
                            ? row[col.accessor]
                            : null}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {filtered.length > pageSize && (
        <div className="px-4 py-3 border-t border-slate-200/80 dark:border-slate-700/70 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="First page"
            >
              <ChevronsLeft className="w-4 h-4 text-slate-500" />
            </button>
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4 text-slate-500" />
            </button>

            <div className="flex items-center gap-1 mx-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (page <= 3) {
                  pageNum = i + 1
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = page - 2 + i
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                  aria-label={`Page ${pageNum}`}
                    aria-current={page === pageNum ? 'page' : undefined}
                    className={`
                      w-8 h-8 rounded-lg text-xs font-medium transition-all
                      ${page === pageNum
                        ? 'bg-[#0f55f7] text-white shadow-sm'
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }
                    `}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Last page"
            >
              <ChevronsRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

