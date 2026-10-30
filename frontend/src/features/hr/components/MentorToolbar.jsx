import { useEffect, useRef, useState } from 'react'
import { RotateCcw, Upload, RefreshCw, FileSpreadsheet, Columns3, Sliders, ChevronDown } from 'lucide-react'
import Button from '@shared/components/Button'
import SearchInput from '@shared/components/SearchInput'

/**
 * MentorToolbar — Section 1 of the Mentors page. One professional toolbar with
 * global search, sort-by, quick filters (collapsible), reset/export/import/
 * refresh and a column-visibility dropdown. All controls are wired by the page.
 */

const AVAILABILITY_OPTIONS = [
  { value: 'all', label: 'All Availability' },
  { value: 'available', label: 'Available' },
  { value: 'busy', label: 'Busy' },
  { value: 'on-leave', label: 'On Leave' },
]

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'on-leave', label: 'On Leave' },
  { value: 'probation', label: 'Probation' },
  { value: 'inactive', label: 'Inactive' },
]

const EXPERIENCE_OPTIONS = [
  { value: 'all', label: 'All Experience' },
  { value: 'lt3', label: 'Less than 3 years' },
  { value: '3to5', label: '3 – 5 years' },
  { value: 'gt5', label: 'More than 5 years' },
]

const RATING_OPTIONS = [
  { value: 'all', label: 'All Ratings' },
  { value: 'high', label: '4.5 and above' },
  { value: 'mid', label: '4.0 – 4.5' },
  { value: 'low', label: 'Below 4.0' },
]

const WORK_MODE_OPTIONS = [
  { value: 'all', label: 'All Work Modes' },
  { value: 'On-site', label: 'On-site' },
  { value: 'Remote', label: 'Remote' },
  { value: 'Hybrid', label: 'Hybrid' },
]

const SORT_OPTIONS = [
  { value: 'default', label: 'Sort: Default' },
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Highest Rating' },
  { value: 'students', label: 'Most Students' },
  { value: 'courses', label: 'Most Courses' },
  { value: 'active', label: 'Most Active' },
]

const selectClass =
  'h-9 min-w-0 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 outline-none transition-colors focus:border-[#0f55f7] focus:ring-2 focus:ring-[#0f55f7]/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={`${selectClass} w-full`}>
        {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </label>
  )
}

export default function MentorToolbar({
  search,
  onSearchChange,
  // UI cleanup — when the page header shows the global search bar, the
  // toolbar's redundant search input can be hidden while staying wired to the
  // same search state (all other toolbar controls are unaffected).
  hideSearch = false,
  filters,
  onFilterChange,
  onReset,
  sortBy,
  onSortByChange,
  onExport,
  onImport,
  onRefresh,
  loading = false,
  columns = [],
  visibleColumns,
  onToggleColumn,
  onShowAllColumns,
  departmentOptions = [],
  specializationOptions = [],
  activeFilterCount = 0,
}) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [columnsOpen, setColumnsOpen] = useState(false)
  const columnsRef = useRef(null)

  useEffect(() => {
    if (!columnsOpen) return undefined
    const close = (event) => {
      if (!columnsRef.current?.contains(event.target)) setColumnsOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [columnsOpen])

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-3 shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
      {/* Row 1 — search + actions */}
      <div className="flex flex-wrap items-center gap-2">
        {!hideSearch && (
          <SearchInput
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onClear={() => onSearchChange('')}
            placeholder="Search mentor, employee ID, email, specialization…"
            className="min-w-[220px] flex-[1_1_320px]"
            aria-label="Search mentors"
          />
        )}

        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          aria-label="Sort mentors"
          className={`${selectClass} min-w-[150px]`}
        >
          {SORT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>

        <Button variant="ghost" size="sm" icon={RotateCcw} onClick={onReset}>Reset</Button>
        <Button variant="secondary" size="sm" icon={FileSpreadsheet} onClick={onExport}>Export</Button>
        <Button variant="secondary" size="sm" icon={Upload} onClick={onImport}>Import</Button>
        <Button variant="secondary" size="sm" icon={RefreshCw} onClick={onRefresh} loading={loading}>Refresh</Button>

        <div ref={columnsRef} className="relative">
          <Button variant="secondary" size="sm" icon={Columns3} onClick={() => setColumnsOpen((o) => !o)}>
            Columns
            <ChevronDown className="h-3 w-3 opacity-60" />
          </Button>
          {columnsOpen && (
            <div
              role="menu"
              aria-label="Column visibility"
              className="absolute right-0 z-50 mt-1 max-h-80 w-52 overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-800"
            >
              <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Visible Columns</p>
              {columns.map((col) => (
                <label
                  key={col.key}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50"
                >
                  <input
                    type="checkbox"
                    checked={visibleColumns.has(col.key)}
                    onChange={() => onToggleColumn(col.key)}
                    className="h-3.5 w-3.5 cursor-pointer accent-[#0f55f7]"
                  />
                  {col.label}
                </label>
              ))}
              <button
                type="button"
                onClick={onShowAllColumns}
                className="mt-1.5 w-full rounded-lg bg-slate-100 px-2 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              >
                Show all columns
              </button>
            </div>
          )}
        </div>

        <Button
          variant={activeFilterCount ? 'primary' : 'secondary'}
          size="sm"
          icon={Sliders}
          onClick={() => setFiltersOpen((o) => !o)}
        >
          Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}
          <ChevronDown className={`h-3 w-3 opacity-60 transition-transform duration-200 ${filtersOpen ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Row 2 — collapsible quick filters */}
      {filtersOpen && (
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 dark:border-slate-800 sm:grid-cols-3 lg:grid-cols-7">
          <FilterSelect label="Department" value={filters.department} onChange={(v) => onFilterChange('department', v)} options={departmentOptions} />
          <FilterSelect label="Specialization" value={filters.specialization} onChange={(v) => onFilterChange('specialization', v)} options={specializationOptions} />
          <FilterSelect label="Availability" value={filters.availability} onChange={(v) => onFilterChange('availability', v)} options={AVAILABILITY_OPTIONS} />
          <FilterSelect label="Status" value={filters.status} onChange={(v) => onFilterChange('status', v)} options={STATUS_OPTIONS} />
          <FilterSelect label="Experience" value={filters.experience} onChange={(v) => onFilterChange('experience', v)} options={EXPERIENCE_OPTIONS} />
          <FilterSelect label="Rating" value={filters.rating} onChange={(v) => onFilterChange('rating', v)} options={RATING_OPTIONS} />
          <FilterSelect label="Work Mode" value={filters.workMode} onChange={(v) => onFilterChange('workMode', v)} options={WORK_MODE_OPTIONS} />
        </div>
      )}
    </div>
  )
}
