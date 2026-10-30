import { memo } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

const LessonSearch = memo(function LessonSearch({
  value,
  onChange,
  placeholder = "Search lessons...",
}) {
  return (
    <div className="relative">
      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] text-xs" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-8 pr-8 py-1.5 bg-[#111827] border border-[#1F2937] rounded-xl text-xs text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#0f55f7]/50 focus:ring-1 focus:ring-[#0f55f7]/20 transition-all"
        aria-label="Search lessons"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-white transition-colors cursor-pointer"
          aria-label="Clear search"
        >
          <FaTimes className="text-[10px]" />
        </button>
      )}
    </div>
  );
});

export default LessonSearch;

