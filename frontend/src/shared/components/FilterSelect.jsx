import { ChevronDown } from "lucide-react";

// Bordered filter dropdown. The org theme force-styles every native <select>
// (fill, border color, text), so the border and radius live on this wrapper and
// the select itself stays borderless. `options` = [{ value, label }].
export default function FilterSelect({ label, value, onChange, options }) {
  return (
    // data-active marks a filter set away from its first ("All …") option, so
    // pages can show which filters are narrowing the list.
    <div data-active={value !== options[0]?.value || undefined} className="relative min-w-0 rounded-[10px] border border-[#D8E4F1] bg-white dark:border-slate-600 dark:bg-slate-800">
      <select
        aria-label={label}
        value={value}
        onChange={onChange}
        className="h-[42px] w-full min-w-0 cursor-pointer appearance-none rounded-[10px] border-0 bg-transparent pl-4 pr-10 text-sm font-semibold outline-none dark:text-white"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#174B7A] dark:text-slate-300"
      />
    </div>
  );
}
