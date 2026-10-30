import KPI from "@/components/common/KPI";

// Compatibility adapter — renders the global KPI component in the compact
// Organization size (every caller is an Organization page).
// `stat` = { label, value, caption, icon, tone, display?, captionColor? }
// tone may be an accent name, hex, or { accent, soft, icon, wave } object.
export default function KpiWaveCard({ stat, onClick, decoration }) {
  return (
    <KPI
      value={stat.display ?? stat.value}
      label={stat.label}
      description={stat.caption}
      descriptionColor={stat.captionColor}
      icon={stat.icon}
      accent={stat.tone}
      trend={stat.trend}
      trendType={stat.trendType}
      onClick={onClick}
      size="compact"
      decoration={decoration}
      className="h-full"
    />
  );
}
