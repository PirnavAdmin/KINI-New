import { useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ClipboardList, Copy, Edit3, Eye, FileDown, MonitorPlay, Play, StopCircle, Trash2, XCircle } from 'lucide-react'

const ACTION_MENU_WIDTH = 228
const ACTION_MENU_HEIGHT = 292

export default function RowActionsMenu({
  open,
  record,
  anchorRect,
  anchorId,
  onClose,
  onView,
  onEdit,
  onStartEnd,
  onAttendance,
  onNotes,
  onRecording,
  onDuplicate,
  onDelete,
  onCancel,
}) {
  const menuRef = useRef(null)

  const position = useMemo(() => {
    if (!open || !anchorRect || typeof window === 'undefined') return null

    const gap = 8
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const fitsBelow = anchorRect.bottom + gap + ACTION_MENU_HEIGHT <= viewportHeight - 12
    const top = fitsBelow
      ? anchorRect.bottom + gap
      : Math.max(12, anchorRect.top - gap - ACTION_MENU_HEIGHT)
    const left = Math.min(
      Math.max(12, viewportWidth - ACTION_MENU_WIDTH - 12),
      Math.max(12, anchorRect.right - ACTION_MENU_WIDTH),
    )

    return { top, left }
  }, [anchorRect, open])

  useEffect(() => {
    if (!open) return undefined

    const handlePointerDown = (event) => {
      const target = event.target
      if (menuRef.current?.contains(target)) return
      const anchorElement = anchorId ? document.getElementById(anchorId) : null
      if (anchorElement?.contains(target)) return
      onClose()
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', onClose)
    window.addEventListener('scroll', onClose, true)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', onClose)
      window.removeEventListener('scroll', onClose, true)
    }
  }, [anchorId, onClose, open])

  if (!open || !record || typeof document === 'undefined' || !position) return null

  const items = [
    { label: 'View', icon: Eye, action: () => onView(record) },
    { label: 'Edit', icon: Edit3, action: () => onEdit(record), disabled: record.status === 'live' },
    {
      label: record.status === 'live' ? 'End Class' : 'Start Class',
      icon: record.status === 'live' ? StopCircle : Play,
      action: () => onStartEnd(record),
    },
    { label: 'Attendance', icon: ClipboardList, action: () => onAttendance(record) },
    { label: 'Recording', icon: MonitorPlay, action: () => onRecording(record) },
    { label: 'Notes', icon: FileDown, action: () => onNotes(record) },
    { label: 'Duplicate', icon: Copy, action: () => onDuplicate(record) },
    // Cancellation only makes sense before a class has started or concluded.
    ...(!['live', 'completed', 'cancelled', 'canceled', 'ended'].includes(String(record.status || '').toLowerCase())
      ? [{ label: 'Cancel Class', icon: XCircle, action: () => onCancel(record), destructive: true }]
      : []),
    { label: 'Delete', icon: Trash2, action: () => onDelete(record), destructive: true },
  ]

  return createPortal(
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.96, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -4 }}
        transition={{ duration: 0.14, ease: 'easeOut' }}
        className="fixed z-[90] w-56 overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-lg dark:border-slate-700/70 dark:bg-slate-900"
        style={{ top: position.top, left: position.left }}
        role="menu"
        aria-label="Row actions"
      >
        <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">More actions</p>
          <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">{record.title}</p>
        </div>

        <div className="p-1.5">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  if (item.disabled) return
                  onClose()
                  item.action()
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
                  item.destructive
                    ? 'text-danger hover:bg-danger/10'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/60'
                } disabled:cursor-not-allowed disabled:opacity-40`}
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.destructive ? 'bg-danger/10' : 'bg-slate-100 dark:bg-slate-800/70'}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1 truncate font-semibold">{item.label}</span>
              </button>
            )
          })}
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  )
}
