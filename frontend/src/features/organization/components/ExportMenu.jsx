import { useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, FileSpreadsheet, FileDown } from 'lucide-react'
import toast from 'react-hot-toast'

const EXPORT_OPTIONS = [
  {
    id: 'pdf',
    label: 'Export PDF',
    description: 'Export batch report as PDF document',
    icon: FileText,
  },
  {
    id: 'excel',
    label: 'Export Excel',
    description: 'Export batch report as Excel spreadsheet',
    icon: FileSpreadsheet,
  },
  {
    id: 'csv',
    label: 'Export CSV',
    description: 'Export batch report as CSV file',
    icon: FileDown,
  },
]

/**
 * ExportMenu — Dropdown menu with PDF / Excel / CSV export options.
 *
 * @param {{ isOpen: boolean, onClose: () => void, anchorRef: React.RefObject<HTMLElement> }} props
 *
 * TODO: Integrate Export Report API
 * - Replace toast messages in `handleExport` with actual API calls
 * - Add loading states per export type as needed
 */
export default function ExportMenu({ isOpen, onClose, anchorRef }) {
  const menuRef = useRef(null)

  const handleClickOutside = useCallback(
    (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target)
      ) {
        onClose()
      }
    },
    [onClose, anchorRef]
  )

  const handleEscape = useCallback(
    (event) => {
      if (event.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (!isOpen) return
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, handleClickOutside, handleEscape])

  /**
   * Placeholder export handler — replace with real API calls.
   *
   * TODO: Integrate Export Report API
   * - For PDF:  call generatePdfReport(batchId) or similar
   * - For Excel: call generateExcelReport(batchId)
   * - For CSV:   call generateCsvReport(batchId)
   */
  const handleExport = (type) => {
    switch (type) {
      case 'pdf':
        toast.success('Export PDF functionality will be integrated with API.')
        break
      case 'excel':
        toast.success('Export Excel functionality will be integrated with API.')
        break
      case 'csv':
        toast.success('Export CSV functionality will be integrated with API.')
        break
      default:
        break
    }
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: -6, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.95 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          role="menu"
          aria-label="Export options"
          className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900"
        >
          {/* Header */}
          <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
              Export Report
            </p>
            <p className="mt-0.5 text-[10px] text-slate-400">
              Choose a format to export batch data
            </p>
          </div>

          {/* Options */}
          <div className="p-1.5">
            {EXPORT_OPTIONS.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.id}
                  type="button"
                  role="menuitem"
                  onClick={() => handleExport(option.id)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-slate-50 focus:bg-slate-50 focus:outline-none dark:hover:bg-slate-800/60 dark:focus:bg-slate-800/60"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#0f55f7]/10 to-[#06b6a8]/10">
                    <Icon className="h-4 w-4 text-[#0f55f7]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {option.label}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {option.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 px-4 py-2.5 dark:border-slate-800">
            <p className="text-[9px] text-slate-400 text-center">
              {/* TODO: Integrate Export Report API — replace placeholder messages */}
              API integration pending
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
