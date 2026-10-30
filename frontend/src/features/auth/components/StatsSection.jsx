/**
 * StatsSection — Social proof metrics with avatars and ratings.
 * Optimized per spec: h-20 gap-4
 */
export default function StatsSection({ isDark, avatars = [] }) {
  return (
    <div
      className={`flex items-center gap-4 h-20 rounded-xl px-5 border transition-colors duration-300 ${
        isDark
          ? "bg-white/[0.03] border-white/[0.06]"
          : "bg-white/60 border-slate-200 shadow-sm"
      }`}
    >
      {/* Avatar stack */}
      <div className="flex -space-x-2.5 shrink-0">
        {avatars.map((initials, i) => (
          <div
            key={initials}
            className={`relative w-7 h-7 rounded-full border-2 backdrop-blur-sm flex items-center justify-center text-[9px] font-bold ${
              isDark
                ? "bg-gradient-to-br from-blue-500/30 to-purple-500/30 border-white/[0.15] text-white/80"
                : "bg-white border-white shadow-sm text-slate-600"
            }`}
            style={{ zIndex: avatars.length - i }}
          >
            {initials}
          </div>
        ))}
        <div
          className={`relative w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 border-2 flex items-center justify-center text-[9px] font-bold text-white -ml-2.5 ${
            isDark ? "border-white/[0.15]" : "border-white shadow-sm"
          }`}
        >
          <div className="absolute inset-0 rounded-full animate-pulse ring-2 ring-blue-400/30" />
          <span className="relative">+</span>
        </div>
      </div>

      {/* Stats text */}
      <div className="flex flex-col min-w-0">
        <p className={`text-[11px] leading-tight truncate ${isDark ? "text-white/50" : "text-slate-500"}`}>
          <span className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
            10,000+
          </span>{" "}
          companies trust Kini EduHub
        </p>
        <p className={`text-[10px] leading-tight ${isDark ? "text-white/45" : "text-slate-400"}`}>
          4.9 ⭐ average rating
        </p>
      </div>
    </div>
  );
}
