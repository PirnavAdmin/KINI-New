import { BrainCircuit, BookOpen, GraduationCap, MessageSquareQuote, Sparkles, Target, Trophy, UserRound, Workflow } from "lucide-react";

const ICONS = {
  courses: BookOpen,
  assessments: GraduationCap,
  progress: Workflow,
  recommendation: Target,
  mentor: UserRound,
  placement: Trophy,
  certificate: Sparkles,
  schedule: MessageSquareQuote,
  default: BrainCircuit,
};

const getIcon = (icon) => ICONS[icon] || ICONS.default;

export default function SuggestionCards({ suggestions = [], onPick, compact = false }) {
  if (!suggestions.length) return null;

  return (
    <div className={`grid gap-2 ${compact ? "grid-cols-1 sm:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-4"}`}>
      {suggestions.map((item) => {
        const Icon = getIcon(item.icon);

        return (
          <button
            key={item.label}
            type="button"
            onClick={() => onPick?.(item.prompt || item.label)}
            className="group flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 text-left shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-[#085FA7]/20 hover:shadow-[0_14px_32px_rgba(8,95,167,0.08)] dark:border-slate-800 dark:bg-slate-950/80"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#085FA7]/10 to-[#5CA347]/10 text-[#085FA7] ring-1 ring-[#085FA7]/10 transition group-hover:scale-105 dark:text-cyan-300">
              <Icon className="h-4.5 w-4.5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-slate-900 dark:text-white">{item.label}</span>
              {item.description ? (
                <span className="mt-0.5 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                  {item.description}
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
