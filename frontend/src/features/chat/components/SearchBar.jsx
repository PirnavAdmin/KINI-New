import PropTypes from "prop-types";
import { Search, X } from "lucide-react";

export default function SearchBar({ value, onChange }) {
  return (
    <label className="flex h-10 items-center gap-2.5 rounded-xl border border-slate-200 bg-white/85 px-3.5 text-slate-400 shadow-[0_8px_20px_-20px_rgba(15,23,42,0.5)] transition focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10 dark:border-slate-700/60 dark:bg-slate-900/70 dark:focus-within:border-blue-500 dark:focus-within:bg-slate-900">
      <Search className="h-4.5 w-4.5 shrink-0" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search conversations..."
        className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </label>
  );
}

SearchBar.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
