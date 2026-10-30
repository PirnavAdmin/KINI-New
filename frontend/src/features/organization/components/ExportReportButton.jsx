import { useState, useRef } from 'react'
import { Download } from 'lucide-react'
import ExportMenu from './ExportMenu'

/**
 * ExportReportButton — A gradient button that opens an ExportMenu dropdown.
 *
 * Responsive:
 * - Desktop:  "Export Report" with icon
 * - Tablet:   Medium-sized with icon
 * - Mobile:   Compact icon + "Export"
 *
 * Usage:
 *   <ExportReportButton />
 *
 * TODO: Integrate Export Report API
 * - Pass any required batch/context data as props when integrating
 * - The actual export logic lives inside ExportMenu
 */
export default function ExportReportButton() {
  const [menuOpen, setMenuOpen] = useState(false)
  const buttonRef = useRef(null)

  const toggleMenu = () => setMenuOpen((prev) => !prev)
  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        aria-expanded={menuOpen}
        aria-haspopup="true"
        aria-label="Export Report"
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] px-4 text-sm font-semibold text-white shadow-lg shadow-[#0f55f7]/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#0f55f7]/30 focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/40 active:translate-y-0 active:shadow-md sm:px-5"
      >
        <Download className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline">Export Report</span>
        <span className="inline sm:hidden">Export</span>
      </button>

      <ExportMenu isOpen={menuOpen} onClose={closeMenu} anchorRef={buttonRef} />
    </div>
  )
}
