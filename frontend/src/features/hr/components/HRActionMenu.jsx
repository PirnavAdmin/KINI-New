import { useEffect, useRef, useState } from 'react'
import { LockKeyhole, MoreHorizontal } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import HrTooltip from '@features/hr/components/HrTooltip'

/**
 * HRActionMenu — the "⋯" row menu. Items: { label, icon, onClick, danger, disabled }.
 * Every item is wired to a real handler by the caller (drawer, export, toast,
 * state update, navigation). Closes on outside click, Escape, or item click.
 *
 * PERMISSION-AWARE (ENTERPRISE RBAC) — pass `can={can}` plus a `permission`
 * tuple on each item: { permission: ['module','action'] }. Items the user
 * cannot perform are HIDDEN entirely (never disabled). When every item is
 * hidden the menu trigger disappears too — "Do NOT show unauthorized actions."
 *
 * Legacy `disabled: true` items (from the older disable-with-tooltip UX) are
 * still supported — they render greyed out with a lock icon.
 */
export default function HRActionMenu({ items = [], can, accent = '#0f55f7', align = 'right' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const lockedHint = "You don't have permission to perform this action."
  const tooltipSide = align === 'left' ? 'right' : 'left'

  const visibleItems = can
    ? items.filter((item) => {
        if (!item.permission) return true
        const [module, actionKey] = item.permission
        return can(module, actionKey)
      })
    : items

  // Nothing the user may do — hide the trigger entirely (hooks run first).
  const empty = !visibleItems.length

  useEffect(() => {
    if (!open || empty) return undefined
    const close = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false)
    }
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, empty])

  if (empty) return null

  return (
    <div ref={ref} className="relative inline-block" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Row actions"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#0f55f7] dark:hover:bg-slate-800 dark:hover:text-blue-300"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 mt-1 max-h-[min(70vh,420px)] w-44 overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-800 ${align === 'right' ? 'right-0' : 'left-0'}`}
          >
            {visibleItems.map((item) => {
              if (item.disabled) {
                return (
                  <HrTooltip key={item.label} text={item.tooltip || lockedHint} side={tooltipSide}>
                    <span
                      role="menuitem"
                      aria-disabled="true"
                      title={item.tooltip || lockedHint}
                      className="flex w-full cursor-not-allowed items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-300 dark:text-slate-600"
                    >
                      <LockKeyhole className="h-3.5 w-3.5" />
                      {item.label}
                    </span>
                  </HrTooltip>
                )
              }
              return (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false)
                    item.onClick?.()
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold transition-colors ${
                    item.danger
                      ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {item.icon && <item.icon className="h-3.5 w-3.5" style={{ color: item.danger ? undefined : accent }} />}
                  {item.label}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
