import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { YELLOW_BG, DARK_TEXT, MUTED_TEXT, SUCCESS_COLOR } from "./trainingData";
import IllustrationWrapper from "./IllustrationWrapper";

// ─────────────────────────────────────────────────────────────
// Manga-inspired speed lines burst effect
// ─────────────────────────────────────────────────────────────
function SpeedLines({ active, color }) {
  if (!active) return null;
  return (
    <span className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <span
          key={i}
          className="absolute left-1/2 top-1/2 block h-[2px] origin-center opacity-30"
          style={{
            width: 40 + i * 8,
            backgroundColor: color,
            transform: `translate(-50%, -50%) rotate(${angle}deg)`,
            borderRadius: 1,
          }}
        />
      ))}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Timeline Node Component
// ─────────────────────────────────────────────────────────────
export default function TimelineNode({
  step,
  isActive,
  isCompleted,
  align,
  index,
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const nodeRef = useRef(null);
  const nodeInView = useInView(nodeRef, { once: true, amount: 0.4 });

  const isLeft = align === "left";
  const accentColor = step.accent;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.6,
        delay: 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="flex w-full items-center gap-4 md:gap-6"
      style={{
        flexDirection: isLeft ? "row" : "row-reverse",
      }}
    >
      {/* ═══ Content Card ═══ */}
      <motion.div
        className="relative z-10 flex-1 rounded-3xl border p-5 backdrop-blur-xl sm:p-6"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          borderColor: isActive
            ? `${accentColor}40`
            : "rgba(0,0,0,0.06)",
          boxShadow: isActive
            ? `0 8px 32px ${accentColor}20, 0 0 0 1px ${accentColor}15`
            : "0 4px 20px rgba(0,0,0,0.04)",
        }}
        whileHover={{ y: -4, boxShadow: `0 12px 40px ${accentColor}25` }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Step badge */}
        <div className="mb-3 flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
            style={{
              backgroundColor: `${accentColor}12`,
              color: accentColor,
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            {step.badge}
          </span>

          {/* Manga-style star for active step */}
          {isActive && (
            <motion.span
              initial={{ rotate: 0, scale: 0 }}
              animate={{ rotate: 360, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-sm"
              aria-hidden="true"
            >
              ⚡
            </motion.span>
          )}
        </div>

        {/* Title & subtitle */}
        <h3
          className="text-lg font-extrabold sm:text-xl"
          style={{ color: DARK_TEXT }}
        >
          {step.title}
        </h3>
        <p
          className="mt-0.5 text-xs font-semibold uppercase tracking-wide sm:text-sm"
          style={{ color: accentColor }}
        >
          {step.subtitle}
        </p>
        <p
          className="mt-2 text-sm leading-relaxed"
          style={{ color: MUTED_TEXT }}
        >
          {step.description}
        </p>

        {/* Illustration */}
        <div className="relative z-10 mt-4 h-28 w-28 sm:h-32 sm:w-32">
          <IllustrationWrapper
            src={step.lottieUrl}
            label={step.title}
          />
        </div>
      </motion.div>

      {/* ═══ Node Marker ═══ */}
      <div ref={nodeRef} className="relative z-20 flex-shrink-0">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={
            nodeInView
              ? { scale: 1, opacity: 1 }
              : { scale: 0, opacity: 0 }
          }
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 14,
            delay: 0.15,
          }}
          className="relative flex h-14 w-14 items-center justify-center rounded-full sm:h-16 sm:w-16"
          style={{
            backgroundColor: isActive
              ? YELLOW_BG
              : isCompleted
                ? "rgba(255,255,255,0.9)"
                : "rgba(255,255,255,0.5)",
            border: `2.5px solid ${
              isActive ? accentColor : "rgba(0,0,0,0.1)"
            }`,
            boxShadow: isActive
              ? `0 0 0 4px ${accentColor}20, 0 0 30px ${accentColor}30`
              : "0 2px 10px rgba(0,0,0,0.06)",
          }}
          whileHover={{
            scale: 1.1,
            rotate: isActive ? 0 : 2,
          }}
        >
          {/* Step number */}
          <span
            className="text-base font-black sm:text-lg"
            style={{
              color: isActive || isCompleted ? DARK_TEXT : MUTED_TEXT,
            }}
          >
            {String(step.step).padStart(2, "0")}
          </span>

          {/* Completion check */}
          {isCompleted && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
              style={{ backgroundColor: SUCCESS_COLOR }}
            >
              ✓
            </motion.span>
          )}

          {/* Glow ring for active */}
          {isActive && (
            <motion.span
              className="absolute inset-0 rounded-full"
              animate={{
                boxShadow: [
                  `0 0 0 0 ${accentColor}40`,
                  `0 0 0 8px ${accentColor}00`,
                  `0 0 0 0 ${accentColor}40`,
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </motion.div>

        {/* Manga speed lines */}
        <SpeedLines active={isActive} color={accentColor} />
      </div>
    </motion.div>
  );
}
