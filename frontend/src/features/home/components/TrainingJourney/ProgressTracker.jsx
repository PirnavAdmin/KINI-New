import { motion } from "framer-motion";
import { LABELS_SHORT, ACCENT_COLOR, SUCCESS_COLOR, DARK_TEXT, MUTED_TEXT } from "./trainingData";

// ─────────────────────────────────────────────────────────────
// Progress Tracker — fixed to right side on desktop,
// horizontal bar on mobile
// ─────────────────────────────────────────────────────────────
export default function ProgressTracker({
  activeIndex,
  completedUntil,
  progressPercent,
}) {
  const total = LABELS_SHORT.length;

  return (
    <>
      {/* ── Desktop: vertical sidebar ── */}
      <div className="fixed right-4 top-1/2 z-50 hidden -translate-y-1/2 flex-col items-center gap-1 md:flex">
        {/* Progress bar */}
        <div
          className="relative mb-2 h-48 w-1.5 overflow-hidden rounded-full"
          style={{ backgroundColor: "rgba(0,0,0,0.08)" }}
        >
          <motion.div
            className="absolute bottom-0 w-full rounded-full"
            style={{
              background: `linear-gradient(to top, ${SUCCESS_COLOR}, ${ACCENT_COLOR})`,
            }}
            animate={{ height: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        {/* Percentage */}
        <motion.span
          className="text-[10px] font-black tabular-nums tracking-tight"
          style={{ color: ACCENT_COLOR }}
        >
          {Math.round(progressPercent)}%
        </motion.span>

        {/* Step labels */}
        <div className="mt-2 flex flex-col gap-1">
          {LABELS_SHORT.map((label, i) => {
            const isActive = i === activeIndex;
            const isDone = i <= completedUntil;
            return (
              <motion.span
                key={label}
                className="text-[9px] font-bold uppercase tracking-wider transition-all duration-300"
                style={{
                  color: isDone
                    ? SUCCESS_COLOR
                    : isActive
                      ? ACCENT_COLOR
                      : MUTED_TEXT,
                  opacity: isDone || isActive ? 1 : 0.4,
                  transform: isActive ? "scale(1.1)" : "scale(1)",
                }}
                animate={
                  isActive
                    ? {
                        scale: [1, 1.15, 1],
                        opacity: [1, 0.7, 1],
                      }
                    : {}
                }
                transition={
                  isActive
                    ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    : {}
                }
              >
                {label}
              </motion.span>
            );
          })}
        </div>
      </div>

      {/* ── Mobile: bottom bar ── */}
      <div className="fixed bottom-4 left-4 right-4 z-50 rounded-2xl border px-4 py-3 backdrop-blur-xl md:hidden"
        style={{
          backgroundColor: "rgba(255,255,255,0.9)",
          borderColor: "rgba(0,0,0,0.06)",
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <span
            className="text-[10px] font-bold"
            style={{ color: ACCENT_COLOR }}
          >
            {Math.round(progressPercent)}%
          </span>
          <div className="flex-1">
            <div
              className="h-1.5 w-full overflow-hidden rounded-full"
              style={{ backgroundColor: "rgba(0,0,0,0.06)" }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(to right, ${ACCENT_COLOR}, ${SUCCESS_COLOR})`,
                }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>
          <div className="flex gap-1">
            {LABELS_SHORT.slice(0, 5).map((label, i) => {
              const isActive = i === Math.min(activeIndex, 4);
              const isDone = i <= Math.min(completedUntil, 4);
              return (
                <span
                  key={label}
                  className="text-[7px] font-bold uppercase tracking-wider"
                  style={{
                    color: isDone
                      ? SUCCESS_COLOR
                      : isActive
                        ? ACCENT_COLOR
                        : MUTED_TEXT,
                    opacity: isDone || isActive ? 1 : 0.3,
                  }}
                >
                  {label.slice(0, 3)}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
