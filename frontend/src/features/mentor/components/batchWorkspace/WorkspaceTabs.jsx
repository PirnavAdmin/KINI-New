import { forwardRef } from 'react'

const WorkspaceTabs = forwardRef(function WorkspaceTabs({ tabs, activeTab, onChange, stickyTop }, ref) {
  return (
    <div ref={ref} className="sticky z-30 w-full max-w-full" style={{ top: stickyTop }}>
      <nav
        className="mv17-wtabs flex gap-1 overflow-x-auto rounded-2xl border border-[#e6edf6] bg-white p-1.5 shadow-[0_4px_16px_rgba(15,42,74,.06)] scrollbar-hide dark:border-slate-700 dark:bg-slate-900"
        aria-label="Batch workspace sections"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-xl px-5 py-3 text-[15px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f6fe4]/40 ${
                isActive ? 'bg-[#0f2a4a] text-white shadow-sm' : 'text-[#133b5d] hover:bg-[#f3f7fc] dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="h-5 w-5" /> {tab.label}
            </button>
          )
        })}
      </nav>
    </div>
  )
})

export default WorkspaceTabs
