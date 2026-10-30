import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import DataTable from '@shared/components/DataTable'
import { TableSkeleton } from '@shared/ui/Skeleton'
import StatusBadge from '@shared/components/StatusBadge'

const buildPageWindow = (currentPage, totalPages) => {
  const pageNumbers = []
  const safeTotal = Math.max(1, totalPages)

  if (safeTotal <= 5) {
    for (let index = 1; index <= safeTotal; index += 1) pageNumbers.push(index)
    return pageNumbers
  }

  const start = Math.max(1, currentPage - 2)
  const end = Math.min(safeTotal, start + 4)
  const adjustedStart = Math.max(1, end - 4)

  for (let index = adjustedStart; index <= end; index += 1) {
    pageNumbers.push(index)
  }

  return pageNumbers
}

const Avatar = ({ record }) => (
  <div className="flex items-center gap-3">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f55f7]/10 to-[#06b6a8]/10 ring-1 ring-slate-900/5">
      {record.avatar ? (
        <img src={record.avatar} alt={record.name} className="h-full w-full object-cover" />
      ) : (
        <span className="text-xs font-bold text-[#0f55f7]">{record.initials}</span>
      )}
    </div>
    <div className="min-w-0">
      <p className="truncate font-semibold text-slate-900 dark:text-white">{record.name || '-'}</p>
      <p className="truncate text-xs text-slate-400">{record.entityLabel}</p>
    </div>
  </div>
)

export default function RecycleBinTable({
  records = [],
  loading = false,
  refreshing = false,
  actionsDisabled = false,
  page = 1,
  pageSize = 10,
  totalItems = 0,
  totalPages = 1,
  onPageChange,
  onPageSizeChange,
  onRestore,
  onPermanentDelete,
}) {
  const columns = useMemo(() => ([
    {
      header: 'Avatar',
      accessor: 'avatar',
      sortable: false,
      width: 160,
      render: (row) => <Avatar record={row} />,
    },
    {
      header: 'Name',
      accessor: 'name',
      sortable: false,
      width: 180,
      render: (row) => (
        <span className="font-medium text-slate-700 dark:text-slate-300">{row.name || '-'}</span>
      ),
    },
    {
      header: 'Email',
      accessor: 'email',
      sortable: false,
      width: 220,
      render: (row) => <span className="text-slate-600 dark:text-slate-300">{row.email || '-'}</span>,
    },
    {
      header: 'Role',
      accessor: 'role',
      sortable: false,
      width: 150,
      render: (row) => <span className="text-slate-600 dark:text-slate-300">{row.role || '-'}</span>,
    },
    {
      header: 'Department',
      accessor: 'department',
      sortable: false,
      width: 170,
      render: (row) => <span className="text-slate-600 dark:text-slate-300">{row.department || '-'}</span>,
    },
    {
      header: 'Deleted Date',
      accessor: 'deletedDate',
      sortable: true,
      width: 190,
      render: (row) => (
        <span className="text-slate-600 dark:text-slate-300">
          {row.deletedDate || 'Not Available'}
        </span>
      ),
    },
    {
      header: 'Deleted By',
      accessor: 'deletedBy',
      sortable: false,
      width: 160,
      render: (row) => (
        <span className="text-slate-600 dark:text-slate-300">
          {row.deletedBy || 'Not Available'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: false,
      width: 120,
      render: (row) => <StatusBadge status="danger" label={row.status || 'Deleted'} />,
    },
    {
      header: 'Actions',
      accessor: 'actions',
      sortable: false,
      width: 240,
      render: (row) => (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onRestore?.(row)
            }}
            disabled={refreshing || actionsDisabled}
            aria-label={`Restore ${row.name || 'record'}`}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 text-xs font-semibold text-emerald-700 transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-500/20 dark:bg-slate-900 dark:text-emerald-300"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restore
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onPermanentDelete?.(row)
            }}
            disabled={refreshing || actionsDisabled}
            aria-label={`Delete ${row.name || 'record'} permanently`}
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-rose-500 px-3 text-xs font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Forever
          </button>
        </div>
      ),
    },
  ]), [actionsDisabled, onPermanentDelete, onRestore, refreshing])

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200/80 bg-white/85 p-4 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-900/80">
        <TableSkeleton rows={6} columns={9} />
      </div>
    )
  }

  if (!records.length) {
    return null
  }

  const pageWindow = buildPageWindow(page, totalPages)
  const from = totalItems === 0 ? 0 : ((page - 1) * pageSize) + 1
  const to = Math.min(page * pageSize, totalItems)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-slate-200/80 bg-white/85 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-900/80"
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 px-4 py-3 dark:border-slate-700/60">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Deleted Records</p>
          <p className="text-xs text-slate-400">
            {refreshing ? 'Refreshing active tab...' : `${totalItems} records available in the active tab`}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
          <FileText className="h-3.5 w-3.5 text-[#0f55f7]" />
          Current view
        </div>
      </div>

      <div className="overflow-hidden">
        <DataTable
          columns={columns}
          data={records}
          pageSize={Math.max(1000, pageSize)}
          searchable={false}
          onRowClick={null}
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200/70 px-4 py-4 lg:flex-row lg:items-center lg:justify-between dark:border-slate-700/60">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Showing {from}-{to} of {totalItems} records
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange?.(1)}
            disabled={page === 1}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 transition hover:border-[#0f55f7]/20 hover:text-[#0f55f7] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <ChevronsLeft className="h-4 w-4" />
            First
          </button>
          <button
            type="button"
            onClick={() => onPageChange?.(Math.max(1, page - 1))}
            disabled={page === 1}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 transition hover:border-[#0f55f7]/20 hover:text-[#0f55f7] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>

          <div className="flex items-center gap-1">
            {pageWindow.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => onPageChange?.(pageNumber)}
                className={`h-9 min-w-9 rounded-xl px-3 text-sm font-semibold transition ${
                  pageNumber === page
                    ? 'bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] text-white shadow-[0_10px_20px_rgba(15,85,247,0.16)]'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-[#0f55f7]/20 hover:text-[#0f55f7] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                }`}
              >
                {pageNumber}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onPageChange?.(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 transition hover:border-[#0f55f7]/20 hover:text-[#0f55f7] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onPageChange?.(totalPages)}
            disabled={page === totalPages}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 transition hover:border-[#0f55f7]/20 hover:text-[#0f55f7] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            Last
            <ChevronsRight className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <span>Rows per page</span>
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange?.(Number(event.target.value))}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
