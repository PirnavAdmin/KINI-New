import KPI from "@/components/common/KPI";

// One workforce KPI, rendered with the global KPI component. `stat` comes from
// EmployeeManagement's real API-derived `stats` list:
// { key, label, description, value, icon, color, error }.
// A `null` value with an `error` means the source endpoint failed; the card
// then offers a retry instead of showing a made-up number.
export default function EmployeeKpiCard({ stat, loading, onRetry, onClick }) {
  const failed = !loading && stat.value === null;
  return (
    <KPI
      value={stat.value}
      label={stat.label}
      description={stat.description}
      icon={stat.icon}
      accent={stat.color}
      loading={loading}
      error={failed ? stat.error || "Unable to load this metric." : undefined}
      onRetry={failed && stat.error ? onRetry : undefined}
      onClick={!failed ? onClick : undefined}
      showArrow={!failed}
      size="compact"
      decoration="bars"
    />
  );
}
