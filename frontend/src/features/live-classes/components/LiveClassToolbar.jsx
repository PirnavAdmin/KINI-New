import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Columns3, Download } from 'lucide-react'
import SearchInput from '@shared/components/SearchInput'
import Checkbox from '@shared/ui/Checkbox'
import { TinyButton } from './LiveClassPrimitives'

const ROW_SIZE_OPTIONS = [8, 12, 24, 48]

function ColumnChooser({ columns, onToggle, density, onDensityChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const handlePointerDown = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <TinyButton variant="secondary" icon={Columns3} onClick={() => setOpen((value) => !value)} className="h-11 px-3.5">
        <span className="hidden sm:inline">Columns</span>
      </TinyButton>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            className="absolute right-0 top-full z-30 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-900"
            role="menu"
            aria-label="Choose visible columns"
          >
            <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">Visible Columns</p>
            <div className="space-y-1.5">
              {columns.map((column) => (
                <Checkbox
                  key={column.key}
                  label={column.label}
                  checked={column.visible}
                  disabled={column.locked}
                  onChange={() => onToggle(column.key)}
                  className="px-1 py-0.5"
                />
              ))}
            </div>
            <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">
              <label className="block px-1 text-xs font-semibold text-slate-500 dark:text-slate-400" htmlFor="live-class-density">
                Row density
              </label>
              <select
                id="live-class-density"
                value={density}
                onChange={(event) => onDensityChange(event.target.value)}
                className="mt-1.5 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#0f55f7] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              >
                <option value="comfortable">Comfortable</option>
                <option value="compact">Compact</option>
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function LiveClassToolbar({
  search,
  onSearchChange,
  onSearchClear,
  pageSize,
  onPageSizeChange,
  onExport,
  density,
  onDensityChange,
  columns,
  onToggleColumn,
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200/70 px-4 py-3 dark:border-slate-700/60 xl:flex-row xl:items-center xl:justify-between">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        onClear={onSearchClear}
        placeholder="Search classes, mentors, batches, or platforms..."
        className="w-full xl:max-w-[420px]"
      />

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          aria-label="Rows per page"
        >
          {ROW_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size} rows</option>)}
        </select>

        <TinyButton variant="secondary" icon={Download} onClick={onExport} className="h-11 px-3.5">
          <span className="hidden sm:inline">Export</span>
        </TinyButton>

        <ColumnChooser columns={columns} onToggle={onToggleColumn} density={density} onDensityChange={onDensityChange} />
      </div>
    </div>
  )
}
