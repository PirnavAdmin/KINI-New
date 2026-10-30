import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.15 } },
}

// motionPreset="rise": a short fade with a slight upward move.
const riseBackdrop = {
  hidden: { opacity: 0, transition: { duration: 0.15 } },
  visible: { opacity: 1, transition: { duration: 0.18 } },
}
const riseModal = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: 8, transition: { duration: 0.15 } },
}
const stillBackdrop = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0 } } }
const stillModal = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0 } }, exit: { opacity: 0, transition: { duration: 0 } } }

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Modal — Reusable modal dialog component
 *
 * Props:
 *   open        → Boolean to show/hide
 *   onClose     → Close handler
 *   title       → Modal title
 *   description → Optional subtitle
 *   children    → Modal body content
 *   size        → sm, md, lg, xl, full
 *   showClose   → Show close button (default: true)
 *   footer      → Optional footer content
 *   hero        → Optional node that replaces the default header (e.g. ModalHero)
 *
 * Opt-in (defaults keep the original behaviour):
 *   trapFocus       → dialog role + aria-modal; keep Tab focus inside; restore it on close
 *   ariaLabelledBy  → id of the element that names the dialog
 *   motionPreset    → "rise" for a fade + slight upward move (reduced motion: none)
 *   backdropClassName → replaces the default backdrop colour/blur classes
 *   onExitComplete  → called after the closing animation finishes
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showClose = true,
  footer,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  hero,
  trapFocus = false,
  ariaLabelledBy,
  motionPreset = 'default',
  backdropClassName = 'bg-black/40 backdrop-blur-sm',
  onExitComplete,
}) {
  const bodyRef = useRef(null)
  const dialogRef = useRef(null)
  const reduceMotion = useReducedMotion()
  const rise = motionPreset === 'rise'
  const backdropMotion = rise ? (reduceMotion ? stillBackdrop : riseBackdrop) : backdropVariants
  const dialogMotion = rise ? (reduceMotion ? stillModal : riseModal) : modalVariants

  useEffect(() => {
    if (!open || !trapFocus) return undefined
    const previouslyFocused = document.activeElement
    const focusFrame = window.requestAnimationFrame(() => {
      const dialog = dialogRef.current
      if (!dialog || dialog.contains(document.activeElement)) return
      const first = [...dialog.querySelectorAll(FOCUSABLE)].find((element) => !element.closest('.kmh__close'))
      ;(first ?? dialog).focus({ preventScroll: true })
    })
    const handleTab = (event) => {
      if (event.key !== 'Tab' || !dialogRef.current) return
      const items = [...dialogRef.current.querySelectorAll(FOCUSABLE)].filter((element) => element.offsetParent !== null)
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && (document.activeElement === first || !dialogRef.current.contains(document.activeElement))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleTab)
    return () => {
      window.cancelAnimationFrame(focusFrame)
      document.removeEventListener('keydown', handleTab)
      if (previouslyFocused instanceof HTMLElement && document.contains(previouslyFocused)) previouslyFocused.focus({ preventScroll: true })
    }
  }, [open, trapFocus])

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const resetScrollFrame = window.requestAnimationFrame(() => {
      bodyRef.current?.scrollTo?.({ top: 0, left: 0, behavior: 'instant' })
    })

    return () => {
      document.body.style.overflow = previousOverflow
      window.cancelAnimationFrame(resetScrollFrame)
    }
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, open])

  const maxWidths = {
    sm: '24rem',
    md: '32rem',
    lg: '60rem',
    xl: '88rem',
    full: '95vw',
  }

  const modal = (
    <AnimatePresence onExitComplete={onExitComplete}>
      {open && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center overflow-hidden p-3 sm:p-4">
          {/* Backdrop */}
          <motion.div
            variants={backdropMotion}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className={`absolute inset-0 ${backdropClassName}`}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            ref={dialogRef}
            role={trapFocus ? 'dialog' : undefined}
            aria-modal={trapFocus ? 'true' : undefined}
            aria-labelledby={ariaLabelledBy}
            tabIndex={trapFocus ? -1 : undefined}
            variants={dialogMotion}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ maxWidth: maxWidths[size] || maxWidths.md }}
            className={`
              relative w-full max-w-full min-h-0 max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2rem)]
              flex flex-col
              bg-white dark:bg-slate-800
              rounded-xl shadow-floating
              border border-border
              overflow-hidden
              ${className}
            `}
          >
            {/* Header */}
            {hero}
            {!hero && (title || showClose) && (
              <div className={`flex items-start justify-between p-5 sm:p-6 pb-4 border-b border-border-subtle shrink-0 ${headerClassName}`}>
                <div className="pr-8">
                  {title && (
                    <h2 className="text-h4 text-text-primary">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="text-body-sm text-text-muted mt-0.5">
                      {description}
                    </p>
                  )}
                </div>
                {showClose && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      onClose?.()
                    }}
                    className="relative z-20 shrink-0 cursor-pointer rounded-xl p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
                    aria-label="Close modal"
                  >
                    <X className="w-4 h-4 text-text-muted" />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div ref={bodyRef} className={`min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 ${bodyClassName}`}>
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className={`shrink-0 border-t border-border-subtle bg-white p-4 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] dark:bg-slate-800 sm:p-5 ${footerClassName}`}>
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  return createPortal(modal, document.body)
}
