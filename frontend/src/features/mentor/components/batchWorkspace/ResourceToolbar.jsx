import { Search, UploadCloud } from 'lucide-react'

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'pdf', label: 'PDF' },
  { value: 'video', label: 'Video' },
  { value: 'link', label: 'Links' },
]

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'downloads', label: 'Most Downloaded' },
  { value: 'name', label: 'Name (A-Z)' },
]

export default function ResourceToolbar({ count, search, onSearchChange, sort, onSortChange, filterType, onFilterChange, onUpload }) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-2.5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Resources</h3>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">{count} file{count !== 1 ? 's' : ''}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search resources..."
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-800/70 dark:text-white sm:w-56"
          />
        </div>
        <select value={filterType} onChange={(e) => onFilterChange(e.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          {FILTER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={sort} onChange={(e) => onSortChange(e.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button
          onClick={onUpload}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40"
        >
          <UploadCloud className="h-3.5 w-3.5" /> Upload Resource
        </button>
      </div>
    </div>
  )
}
