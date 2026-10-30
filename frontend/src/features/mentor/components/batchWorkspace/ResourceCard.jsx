import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { FileIcon, Film, Link2, Download, MoreVertical, Eye, Pencil, Share2, Trash2 } from 'lucide-react'

const TYPE_LABEL = { pdf: 'PDF', video: 'Video', link: 'Link' }

export default function ResourceCard({ resource, index, onPreview, onDownload, onEdit, onShare, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const Icon = resource.type === 'video' ? Film : resource.type === 'link' ? Link2 : FileIcon

  useEffect(() => {
    if (!menuOpen) return undefined
    const handleClick = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * index }}
      whileHover={{ y: -2 }}
      className="group relative flex items-start gap-3 rounded-[14px] border border-slate-200/70 bg-white/95 p-4 transition-all duration-150 hover:border-purple-300/60 hover:shadow-lg dark:border-slate-700/60 dark:bg-slate-900/80 dark:hover:border-purple-500/30"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10">
        <Icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-snug text-slate-900 dark:text-white">{resource.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-400">
          <span className="rounded-full bg-slate-100 px-1.5 py-0.5 font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">{TYPE_LABEL[resource.type] || resource.type}</span>
          <span>·</span>
          <span>{resource.uploadDate}</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1"><Download className="h-3 w-3" /> {resource.downloads}</span>
        </div>
      </div>
      <div className="relative shrink-0" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label={`Actions for ${resource.title}`}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40 dark:hover:bg-slate-800"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
        {menuOpen && (
          <div role="menu" className="absolute right-0 z-20 mt-1.5 w-40 overflow-hidden rounded-xl border border-slate-200/70 bg-white py-1.5 shadow-lg dark:border-slate-700/60 dark:bg-slate-900">
            {[
              { label: 'Preview', icon: Eye, onClick: onPreview },
              { label: 'Download', icon: Download, onClick: onDownload },
              { label: 'Edit', icon: Pencil, onClick: onEdit },
              { label: 'Share', icon: Share2, onClick: onShare },
              { label: 'Delete', icon: Trash2, onClick: onDelete, danger: true },
            ].map((item) => (
              <button
                key={item.label}
                role="menuitem"
                onClick={() => { item.onClick(); setMenuOpen(false) }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 ${item.danger ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-300'}`}
              >
                <item.icon className="h-3.5 w-3.5" /> {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
