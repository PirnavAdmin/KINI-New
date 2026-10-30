import { memo } from "react";

const DismissOptions = memo(({ dontShowToday, onToggleDontShow, onMaybeLater }) => (
  <div className="flex flex-wrap items-center justify-between gap-3">
    {/* Don't show today */}
    <label className="group flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={dontShowToday}
        onChange={(e) => onToggleDontShow(e.target.checked)}
        className="peer w-4 h-4 rounded-md border-slate-300 text-[#2563EB] focus:ring-[#2563EB]/30 focus:ring-offset-1 cursor-pointer transition-all"
      />
      <span className="text-xs text-slate-400 group-hover:text-slate-500 transition-colors">
        Don't show again today
      </span>
    </label>

    {/* Maybe Later */}
    <button
      onClick={onMaybeLater}
      className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#2563EB]/30 focus-visible:outline-offset-2 rounded-md px-1"
    >
      Maybe Later
    </button>
  </div>
));

DismissOptions.displayName = "DismissOptions";
export default DismissOptions;
