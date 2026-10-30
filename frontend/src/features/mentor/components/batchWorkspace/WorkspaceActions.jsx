import { useEffect, useRef, useState } from 'react'
import { MoreHorizontal } from 'lucide-react'

// First action renders as the primary CTA; the rest are secondary. On screens
// narrower than lg, only the primary + first two secondary actions stay
// inline — the remainder collapse into a "More Actions" menu so the bar never
// wraps or crowds out the tabs below it.
export default function WorkspaceActions({ actions }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return undefined
    const handleClick = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  const [primary, ...secondary] = actions
  const alwaysInline = secondary.slice(0, 2)
  const collapsible = secondary.slice(2)

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/70 p-3 dark:border-slate-700/60 dark:bg-slate-900/50">
      <button
        onClick={primary.onClick}
        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-500/20 transition-all hover:shadow-lg hover:shadow-purple-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40"
      >
        <primary.icon className="h-4 w-4" /> {primary.label}
      </button>

      {alwaysInline.map((action) => (
        <button
          key={action.label}
          onClick={action.onClick}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 transition-all hover:border-purple-300 hover:text-purple-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-purple-500/40 dark:hover:text-purple-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40"
        >
          <action.icon className="h-3.5 w-3.5" /> {action.label}
        </button>
      ))}

      {collapsible.map((action) => (
        <button
          key={action.label}
          onClick={action.onClick}
          className="hidden lg:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 transition-all hover:border-purple-300 hover:text-purple-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-purple-500/40 dark:hover:text-purple-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40"
        >
          <action.icon className="h-3.5 w-3.5" /> {action.label}
        </button>
      ))}

      {collapsible.length > 0 && (
        <div className="relative lg:hidden" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="More actions"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 transition-all hover:border-purple-300 hover:text-purple-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40"
          >
            <MoreHorizontal className="h-3.5 w-3.5" /> More Actions
          </button>
          {menuOpen && (
            <div role="menu" className="absolute right-0 z-30 mt-1.5 w-48 overflow-hidden rounded-xl border border-slate-200/70 bg-white py-1.5 shadow-lg dark:border-slate-700/60 dark:bg-slate-900">
              {collapsible.map((action) => (
                <button
                  key={action.label}
                  role="menuitem"
                  onClick={() => { action.onClick(); setMenuOpen(false) }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <action.icon className="h-3.5 w-3.5" /> {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
