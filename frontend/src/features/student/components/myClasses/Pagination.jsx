import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({
  page,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)
  const visiblePages = pages.length <= 5
    ? pages
    : [
        1,
        ...(page > 3 ? ['…'] : []),
        ...pages.filter((number) => number >= Math.max(2, page - 1) && number <= Math.min(totalPages - 1, page + 1)),
        ...(page < totalPages - 2 ? ['…'] : []),
        totalPages,
      ].filter((value, index, array) => array.indexOf(value) === index || value === '…')

  return (
    <div className="flex flex-col gap-3 rounded-[20px] border border-white/70 bg-white/85 p-3 shadow-[0_8px_18px_rgba(15,23,42,0.04)] ring-1 ring-slate-900/[0.04] backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/75 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 transition-all hover:border-[#0f55f7]/20 hover:text-[#0f55f7] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        <div className="flex items-center gap-1.5">
          {visiblePages.map((value, index) => (
            <button
              type="button"
              key={`${value}-${index}`}
              onClick={() => typeof value === 'number' && onPageChange(value)}
              disabled={value === '…'}
              className={`h-9 min-w-9 rounded-xl px-3 text-sm font-semibold transition-all ${
                value === page
                  ? 'bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] text-white shadow-[0_10px_24px_rgba(15,85,247,0.18)]'
                  : value === '…'
                    ? 'cursor-default text-slate-400'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-[#0f55f7]/20 hover:text-[#0f55f7] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              {value}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 transition-all hover:border-[#0f55f7]/20 hover:text-[#0f55f7] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {totalItems} classes
        </p>
        <label className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          Rows per page
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}
