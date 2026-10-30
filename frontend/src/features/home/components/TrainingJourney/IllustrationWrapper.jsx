import { useRef, memo } from "react";
import { motion, useInView } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

// ─────────────────────────────────────────────────────────────
// Fallback SVG illustrations when Lottie is not loaded
// ─────────────────────────────────────────────────────────────
function FallbackIcon({ label }) {
  const icons = {
    Enroll: (
      <svg viewBox="0 0 80 80" fill="none" className="h-full w-full p-3">
        <circle cx="40" cy="40" r="32" stroke="#085FA7" strokeWidth="2" opacity="0.3" />
        <path d="M30 45l10 10 16-20" stroke="#085FA7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    Classes: (
      <svg viewBox="0 0 80 80" fill="none" className="h-full w-full p-3">
        <rect x="15" y="20" width="50" height="38" rx="4" stroke="#2563EB" strokeWidth="2" opacity="0.3" />
        <path d="M28 32h24M28 40h24M28 48h16" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
    Assignments: (
      <svg viewBox="0 0 80 80" fill="none" className="h-full w-full p-3">
        <rect x="18" y="14" width="44" height="52" rx="4" stroke="#7C3AED" strokeWidth="2" opacity="0.3" />
        <rect x="24" y="22" width="14" height="14" rx="2" stroke="#7C3AED" strokeWidth="1.5" opacity="0.4" />
        <path d="M46 28h6M46 34h6" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
        <path d="M26 44h22M26 50h22" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      </svg>
    ),
    Projects: (
      <svg viewBox="0 0 80 80" fill="none" className="h-full w-full p-3">
        <rect x="14" y="24" width="24" height="34" rx="3" stroke="#0891B2" strokeWidth="2" opacity="0.3" />
        <rect x="42" y="18" width="24" height="28" rx="3" stroke="#0891B2" strokeWidth="2" opacity="0.3" />
        <path d="M40 58v-8M40 50l-6 6M40 50l6 6" stroke="#0891B2" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
  };

  const match = Object.keys(icons).find((k) => label?.toLowerCase().includes(k.toLowerCase()));
  return match ? icons[match] : null;
}

// ─────────────────────────────────────────────────────────────
// Illustration Wrapper Component
// ─────────────────────────────────────────────────────────────
const IllustrationWrapper = memo(function IllustrationWrapper({
  src,
  label = "illustration",
  size = "100%",
  className = "",
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "100px" });

  return (
    <motion.div
      ref={ref}
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      animate={{
        y: [0, -8, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {inView ? (
        <div className="flex h-full w-full items-center justify-center">
          <DotLottieReact
            src={src}
            autoplay
            loop
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center opacity-30">
          <FallbackIcon label={label} />
        </div>
      )}
    </motion.div>
  );
});

export default IllustrationWrapper;
