import './portal/hr-density-tokens.css'
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

/**
 * HRDrawer — right-side slide-in panel (spec: "replace large popup forms with
 * modern right-side drawers"). Portal-based, Escape + backdrop close, optional
 * pinned footer. Used for Add/Edit forms and record detail views across HRMS.
 */
export default function HRDrawer({
  open,
  onClose,
  title,
  subtitle,
  icon: Icon,
  accent = '#0f55f7',
  children,
  footer,
  width = 'max-w-[520px]',
}) {
  const panelRef = useRef(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    const previouslyFocused = document.activeElement
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus({ preventScroll: true })

    const onKey = (event) => {
      if (event.key === 'Escape') onCloseRef.current?.()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKey)
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus?.()
    }
  }, [open])

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[1100] bg-[linear-gradient(180deg,rgba(15,23,42,0.08),rgba(15,85,247,0.06))]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-900/45 backdrop-blur-md"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            ref={panelRef}
            tabIndex={-1}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`hr-drawer absolute inset-y-0 right-0 flex h-dvh max-h-dvh w-full ${width} flex-col border-l border-slate-200/80 bg-white shadow-[-24px_0_60px_rgba(15,23,42,0.18)] outline-none dark:border-slate-800 dark:bg-slate-900`}
          >
            {/* Header */}
            <div className="flex shrink-0 items-start gap-3 border-b border-slate-100 bg-[linear-gradient(180deg,rgba(15,85,247,.04),rgba(255,255,255,0))] px-5 py-4 dark:border-slate-800 dark:bg-[linear-gradient(180deg,rgba(15,85,247,.10),rgba(15,23,42,0))]">
              {Icon && (
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md"
                  style={{ background: `linear-gradient(135deg, ${accent}, ${accent}bb)` }}
                >
                  <Icon className="h-4.5 w-4.5" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-base font-extrabold text-slate-900 dark:text-white">{title}</h2>
                {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                aria-label="Close panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 pb-24 sm:p-6 sm:pb-28 lg:p-4 lg:pb-4">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="shrink-0 border-t border-slate-100 bg-slate-50/80 px-5 py-3.5 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-800/50">
                {footer}
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
