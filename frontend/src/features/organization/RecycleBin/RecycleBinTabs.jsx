import { motion } from 'framer-motion'

export default function RecycleBinTabs({ tabs = [], activeTab, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="Recycle Bin tabs"
      className="flex flex-wrap gap-1.5 rounded-2xl border border-slate-200/70 bg-white/70 p-1.5 dark:border-slate-700/60 dark:bg-slate-900/60"
    >
      {tabs.map((tab) => {
        const active = tab.key === activeTab
        return (
          <motion.button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange?.(tab.key)}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-sm font-semibold transition-all ${
              active
                ? 'border-[#0f55f7]/25 bg-[#0f55f7]/8 text-[#0f55f7] shadow-[0_10px_24px_rgba(15,85,247,0.08)]'
                : 'border-slate-200/80 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:text-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              active
                ? 'bg-[#0f55f7] text-white'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'
            }`}>
              {tab.count === null || tab.count === undefined ? '-' : tab.count}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
