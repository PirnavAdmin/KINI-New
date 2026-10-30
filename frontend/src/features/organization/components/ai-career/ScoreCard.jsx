import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Gauge, ShieldCheck } from "lucide-react";

export default function ScoreCard({ label, score, type = "resume" }) {
  const isAts = type === "ats";
  const Icon = isAts ? ShieldCheck : Gauge;
  const [displayScore, setDisplayScore] = useState(0);
  const scoreLabel = score >= 85 ? "Excellent" : score >= 70 ? "Good foundation" : score >= 55 ? "Needs improvement" : "Major revision needed";

  useEffect(() => {
    let frameId;
    const startedAt = performance.now();
    const tick = (time) => {
      const progress = Math.min(1, (time - startedAt) / 900);
      setDisplayScore(Math.round(score * progress));
      if (progress < 1) frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [score]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-5 ${isAts ? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/25 dark:bg-emerald-500/10" : "border-blue-200 bg-blue-50/70 dark:border-blue-500/25 dark:bg-blue-500/10"}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
          <p className={`mt-2 text-4xl font-extrabold ${isAts ? "text-emerald-600 dark:text-emerald-400" : "text-blue-600 dark:text-blue-400"}`}>{displayScore}<span className="text-lg">/100</span></p>
          <p className="mt-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">{scoreLabel}</p>
        </div>
        <div className={`grid h-12 w-12 place-items-center rounded-2xl ${isAts ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400" : "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400"}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <progress value={displayScore} max="100" aria-label={`${label}: ${displayScore} out of 100`} className={`mt-4 h-2 w-full overflow-hidden rounded-full ${isAts ? "accent-emerald-500" : "accent-blue-600"}`} />
    </motion.div>
  );
}
