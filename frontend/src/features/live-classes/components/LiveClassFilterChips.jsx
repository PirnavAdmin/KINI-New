import { Download, Trash2, X } from 'lucide-react'
import { TinyButton } from './LiveClassPrimitives'

const TABS = [
  ['all', 'All'],
  ['today', "Today's"],
  ['upcoming', 'Upcoming'],
  ['live', 'Live'],
  ['completed', 'Completed'],
  ['cancelled', 'Cancelled'],
]

export default function LiveClassFilterChips({
  activeTab,
  onTabChange,
  selectedCount,
  onClearSelection,
  onBulkExport,
  onBulkDelete,
}) {
  const showBulkBar = selectedCount > 0

  return (
    <div className="border-b border-slate-200/70 px-4 py-2.5 dark:border-slate-700/60">
      {showBulkBar ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex h-8 items-center rounded-lg bg-[#0f55f7]/10 px-3 text-xs font-semibold text-[#0f55f7]">
            {selectedCount} selected
          </span>
          <TinyButton variant="secondary" icon={Download} onClick={onBulkExport} className="h-8 px-3 text-xs">
            Export selected
          </TinyButton>
          <TinyButton variant="danger" icon={Trash2} onClick={onBulkDelete} className="h-8 px-3 text-xs">
            Delete selected
          </TinyButton>
          <button
            type="button"
            onClick={onClearSelection}
            className="ml-auto inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-1.5">
          {TABS.map(([tab, label]) => (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              aria-pressed={activeTab === tab}
              className={`inline-flex h-8 items-center rounded-lg px-3 text-xs font-semibold transition-colors ${
                activeTab === tab
                  ? 'bg-[#0f55f7]/10 text-[#0f55f7]'
                  : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
