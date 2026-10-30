import { memo } from "react";
import { BADGE_COLORS } from "./constants";

const Badge = memo(function Badge({ label }) {
  if (!label) return null;
  const cls = BADGE_COLORS[label] || "bg-slate-500/20 text-slate-300";
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${cls}`}>
      {label}
    </span>
  );
});

export default Badge;
