import KPI from "@/components/common/KPI";

/**
 * StatsCard — compatibility adapter over the global KPI component.
 *
 *   <StatsCard icon={Users} value={128} label="Total Employees" accentColor="#0f55f7" />
 *
 * Existing props keep working; `description` / `accent` may also be passed.
 */
export default function StatsCard({
  icon,
  value,
  label,
  suffix,
  description,
  accent,
  accentColor = "#0877F9",
  iconBackground,
  className = "",
  compact = false,
  onClick,
}) {
  const tone = accent ?? (iconBackground ? { accent: accentColor, icon: accentColor, soft: iconBackground } : accentColor);
  return (
    <KPI
      value={value}
      label={label}
      suffix={suffix}
      description={description}
      icon={icon}
      accent={tone}
      onClick={onClick}
      size={compact ? "compact" : "default"}
      className={className}
    />
  );
}
