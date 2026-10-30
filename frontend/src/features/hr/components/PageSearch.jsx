import { Search, X } from 'lucide-react'

/**
 * PageSearch — the global search bar rendered in the page header of every HR
 * page (except the dashboard). A controlled input (value + onChange) so each
 * page drives its own filtering with the existing page data.
 *
 * Design follows the enterprise spec:
 *  • 46px height, 16px radius, 16px inner padding
 *  • Light theme: white bg / slate-200 border / slate-400 placeholder
 *  • Dark theme: slate-900 bg / slate-700 border / slate-500 placeholder
 *  • Primary focus ring at 20% opacity + smooth hover/focus transitions
 *  • Responsive: full-width mobile → 260–300px tablet → 320–380px desktop
 */
export default function PageSearch({ value, onChange, placeholder = 'Search…', className = '' }) {
  return (
    <div className={`relative w-full shrink-0 sm:w-[280px] md:w-[320px] lg:w-[360px] ${className}`}>
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 w-full rounded-xl border border-slate-300/80 bg-white pl-10 pr-9 text-sm font-medium text-slate-800 shadow-sm transition-all duration-200 hover:border-blue-300 focus:border-[#0f55f7] focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/20 placeholder:font-normal placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:hover:border-slate-600 [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  )
}
