import { Lightbulb } from "lucide-react";

export default function SuggestionCard({ children, index }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
        {index ?? <Lightbulb className="h-3.5 w-3.5" />}
      </span>
      <p className="text-xs font-medium leading-5 text-amber-900 dark:text-amber-100">{children}</p>
    </div>
  );
}
