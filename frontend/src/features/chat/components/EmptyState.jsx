import PropTypes from "prop-types";
import { MessageCircleMore, ShieldCheck } from "lucide-react";

export default function EmptyState({ compact = false }) {
  return (
    <div className="grid h-full min-h-0 w-full place-items-center bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.08),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.9),rgba(248,250,252,0.9))] p-8 text-center dark:bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.08),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.96))]">
      <div className={compact ? "max-w-[280px]" : "max-w-sm"}>
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-[1.8rem] bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-[0_20px_40px_-24px_rgba(37,99,235,0.95)]">
          <MessageCircleMore className="h-8 w-8" />
        </div>
        <h2 className="mt-6 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
          Choose a mentor
        </h2>
        <p className="mx-auto mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          Start your learning journey. Messages are secure, private, and ready whenever you are.
        </p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          Secure mentor conversation
        </div>
      </div>
    </div>
  );
}

EmptyState.propTypes = {
  compact: PropTypes.bool,
};

