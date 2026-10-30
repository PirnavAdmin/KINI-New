import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function SkillChip({ children, missing = false }) {
  const Icon = missing ? AlertCircle : CheckCircle2;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${missing ? "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/25 dark:bg-orange-500/10 dark:text-orange-300" : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300"}`}>
      <Icon className="h-3.5 w-3.5" />{children}
    </span>
  );
}
