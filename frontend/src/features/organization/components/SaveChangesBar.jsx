import { motion } from 'framer-motion'
 
export default function SaveChangesBar({ isVisible, onSave, onDiscard }) {
  if (!isVisible) return null
 
  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 60, opacity: 0 }}
      className="sticky bottom-0 mt-8 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4
        bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t
        border-slate-200 dark:border-slate-700 z-20"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-end gap-3">
        <button
          onClick={onDiscard}
          className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300
            hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          Discard
        </button>
        <button
          onClick={onSave}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0f55f7]
            hover:brightness-110 rounded-xl transition-all shadow-sm shadow-[#0f55f7]/20"
        >
          Save Changes
        </button>
      </div>
    </motion.div>
  )
}
 