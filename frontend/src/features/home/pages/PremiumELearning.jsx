import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

// Your 4 Lottie URLs
const LOTTIE_1 = "https://lottie.host/7dffc81e-cd4a-4dd5-a7b8-f3051d0de370/KW4ucR2SjZ.lottie";
const LOTTIE_2 = "https://lottie.host/31ec9d79-84e6-48e3-8ca5-e28d8f76b7f5/UvhgChLpzJ.lottie";
const LOTTIE_3 = "https://lottie.host/1a197c3c-87a7-4a2f-ab43-0c2d2f6e9a13/Q13OGciyjR.lottie";
const LOTTIE_4 = "https://lottie.host/29adac1f-8fa6-4a78-bdce-f9ae0199a4ec/VfN3A0v9wK.lottie";

const LOTTIE_CORE =
  "https://lottie.host/302e5e47-76ce-4a46-be53-e04492adc7f5/0qTdtA24zK.lottie";

// Assign different Lottie animations to each feature
const leftFeatures = [
  { id: "lessons", title: "Interactive Lessons", icon: LOTTIE_1 },
  { id: "mentorship", title: "AI Mentorship", icon: LOTTIE_2 },
];

const rightFeatures = [
  { id: "career", title: "Career Growth", icon: LOTTIE_3 },
  { id: "certifications", title: "Certifications", icon: LOTTIE_4 },
];

// Decorative elements with better positioning
const decorativeElements = [
  {
    id: "deco1",
    src: LOTTIE_1,
    position: "top-left",
    className:
      "absolute top-4 left-4 w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 opacity-40",
    animation: "float-slow",
  },
  {
    id: "deco2",
    src: LOTTIE_2,
    position: "top-right",
    className:
      "absolute top-4 right-4 w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 opacity-40",
    animation: "float-medium",
  },
  {
    id: "deco3",
    src: LOTTIE_3,
    position: "bottom-left",
    className:
      "absolute bottom-4 left-4 w-16 h-16 sm:w-24 sm:h-24 lg:w-28 lg:h-28 opacity-40",
    animation: "float-slow",
  },
  {
    id: "deco4",
    src: LOTTIE_4,
    position: "bottom-right",
    className:
      "absolute bottom-4 right-4 w-16 h-16 sm:w-24 sm:h-24 lg:w-28 lg:h-28 opacity-40",
    animation: "float-medium",
  },
];

function CardLottie({ src }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "80px" });

  return (
    <div
      ref={ref}
      className="h-32 w-32 shrink-0 sm:h-36 sm:w-36 lg:h-40 lg:w-40"
      aria-hidden="true"
    >
      {inView && <DotLottieReact src={src} autoplay loop />}
    </div>
  );
}

function DecorativeLottie({ src, className, animation }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "100px" });

  // Animation variants
  const animations = {
    "float-slow": {
      y: [0, -10, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    "float-medium": {
      y: [0, -15, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={
        inView
          ? {
              opacity: 0.4,
              scale: 1,
              ...animations[animation],
            }
          : {
              opacity: 0,
              scale: 0.5,
            }
      }
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {inView && <DotLottieReact src={src} autoplay loop />}
    </motion.div>
  );
}

function FeatureCard({ icon, title, align, cardRef }) {
  const isRight = align === "right";

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`flex flex-col items-center gap-3 ${
        isRight ? "items-end" : "items-start"
      }`}
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#085FA7]/20 to-[#5CA347]/20 p-3 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:from-[#085FA7]/30 hover:to-[#5CA347]/30">
        <CardLottie src={icon} />
      </div>

      <h3
        className={`text-sm font-bold text-white/90 sm:text-base lg:text-lg ${
          isRight ? "text-right" : "text-left"
        }`}
      >
        {title}
      </h3>
    </motion.div>
  );
}

function AiCore({ coreRef }) {
  return (
    <div
      ref={coreRef}
      className="relative flex h-96 w-96 items-center justify-center sm:h-[28rem] sm:w-[28rem] lg:h-[32rem] lg:w-[32rem]"
    >
      <div className="absolute inset-0 rounded-full bg-[#085FA7]/10 blur-2xl animate-pulse" />
      <div className="absolute inset-6 rounded-full border border-white/[0.07]" />
      <div className="absolute inset-12 rounded-full border border-white/[0.04]" />
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#085FA7]/5 to-[#5CA347]/5 animate-spin-slow" />
      <div className="relative h-72 w-72 sm:h-80 sm:w-80 lg:h-96 lg:w-96">
        <DotLottieReact src={LOTTIE_CORE} loop autoplay />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// FIX: leftRefs / rightRefs must be STABLE across renders.
// The caller now passes in refs that were memoized once with
// useMemo, so this dependency array only changes when the
// container/core refs themselves change (which, being refs, they
// never do as far as identity is concerned) — no more infinite loop.
// ---------------------------------------------------------------
function useConnectorPaths({ containerRef, coreRef, leftRefs, rightRefs }) {
  const [paths, setPaths] = useState([]);

  useEffect(() => {
    function calculate() {
      const container = containerRef.current;
      const core = coreRef.current;
      if (!container || !core) return;

      const cRect = container.getBoundingClientRect();
      const kRect = core.getBoundingClientRect();

      const cx = kRect.left + kRect.width / 2 - cRect.left;
      const cy = kRect.top + kRect.height / 2 - cRect.top;
      const cr = kRect.width / 2;

      const buildPath = (ref, side) => {
        const el = ref?.current;
        if (!el) return null;
        const r = el.getBoundingClientRect();

        const featureRect =
          el.querySelector('div[class*="h-32"]')?.getBoundingClientRect() || r;

        const sx =
          side === "left"
            ? featureRect.right - cRect.left
            : featureRect.left - cRect.left;
        const sy = featureRect.top + featureRect.height / 2 - cRect.top;

        const dx = cx - sx;
        const dy = cy - sy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        const startPadding = side === "left" ? 5 : -5;
        const startX = sx + (side === "left" ? startPadding : startPadding);
        const startY = sy;

        const endX = cx - (dx / dist) * (cr + 10);
        const endY = cy - (dy / dist) * (cr + 10);

        const mx = (startX + endX) / 2;
        const my = (startY + endY) / 2 - 30;

        return {
          d: `M ${startX} ${startY} Q ${mx} ${my} ${endX} ${endY}`,
          start: { x: startX, y: startY },
          end: { x: endX, y: endY },
        };
      };

      setPaths(
        [
          ...leftRefs.map((r) => buildPath(r, "left")),
          ...rightRefs.map((r) => buildPath(r, "right")),
        ].filter(Boolean)
      );
    }

    calculate();
    const ro = new ResizeObserver(calculate);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", calculate);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", calculate);
    };
  }, [containerRef, coreRef, leftRefs, rightRefs]);

  return paths;
}

function ConnectorLines({ paths, reduceMotion }) {
  if (!paths.length) return null;

  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="wg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#085FA7" />
          <stop offset="50%" stopColor="#2EA7E0" />
          <stop offset="100%" stopColor="#5CA347" />
        </linearGradient>

        <linearGradient id="bubbleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2EA7E0" />
          <stop offset="100%" stopColor="#5CA347" />
        </linearGradient>

        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <radialGradient id="pulseGrad">
          <stop offset="0%" stopColor="#2EA7E0" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#5CA347" stopOpacity="0" />
        </radialGradient>
      </defs>

      {paths.map((pathData, i) => (
        <g key={i}>
          <motion.path
            d={pathData.d}
            stroke="url(#wg)"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeOpacity="0.6"
            initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: i * 0.15, ease: "easeInOut" }}
          />

          <motion.path
            d={pathData.d}
            stroke="url(#wg)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeOpacity="0.08"
            initial={reduceMotion ? false : { pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: i * 0.15, ease: "easeInOut" }}
          />

          {!reduceMotion && (
            <>
              <motion.circle
                r="5"
                fill="url(#bubbleGrad)"
                filter="url(#glow)"
                initial={{ offsetDistance: "0%" }}
                animate={{ offsetDistance: "100%" }}
                transition={{
                  duration: 2.5,
                  delay: i * 0.3,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{ offsetPath: `path("${pathData.d}")` }}
              />

              <motion.circle
                r="3.5"
                fill="url(#bubbleGrad)"
                filter="url(#glow)"
                initial={{ offsetDistance: "0%" }}
                animate={{ offsetDistance: "100%" }}
                transition={{
                  duration: 3,
                  delay: i * 0.3 + 0.8,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{ offsetPath: `path("${pathData.d}")` }}
              />

              <motion.circle
                r="2.5"
                fill="#2EA7E0"
                opacity="0.7"
                initial={{ offsetDistance: "0%" }}
                animate={{ offsetDistance: "100%" }}
                transition={{
                  duration: 3.5,
                  delay: i * 0.3 + 1.6,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{ offsetPath: `path("${pathData.d}")` }}
              />
            </>
          )}

          <motion.circle
            cx={pathData.start.x}
            cy={pathData.start.y}
            r="6"
            fill="url(#pulseGrad)"
            initial={{ scale: 0.8, opacity: 0.6 }}
            animate={{
              scale: [0.8, 1.3, 0.8],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2,
              delay: i * 0.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.circle
            cx={pathData.end.x}
            cy={pathData.end.y}
            r="6"
            fill="url(#pulseGrad)"
            initial={{ scale: 0.8, opacity: 0.6 }}
            animate={{
              scale: [0.8, 1.3, 0.8],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2,
              delay: i * 0.2 + 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </g>
      ))}
    </svg>
  );
}

export default function PremiumELearning() {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef(null);
  const coreRef = useRef(null);

  // Individual refs, hoisted out so useMemo below doesn't call
  // useRef conditionally / inside a callback (rules of hooks).
  const leftRef1 = useRef(null);
  const leftRef2 = useRef(null);
  const rightRef1 = useRef(null);
  const rightRef2 = useRef(null);

  // FIX: memoize the arrays themselves so their identity is stable
  // across renders. Previously `[useRef(null), useRef(null)]` was a
  // brand-new array literal every render, which made the effect in
  // useConnectorPaths re-run on every render (its deps included
  // these arrays), which called setPaths, which re-rendered this
  // component, which created new arrays again — an infinite loop
  // that crashed the whole subtree ("Maximum update depth exceeded").
  const leftRefs = useMemo(() => [leftRef1, leftRef2], []);
  const rightRefs = useMemo(() => [rightRef1, rightRef2], []);

  const paths = useConnectorPaths({ containerRef, coreRef, leftRefs, rightRefs });

  return (
    <section
      className="relative flex min-h-screen flex-col justify-center overflow-hidden"
      style={{ backgroundColor: "#071226" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(8,95,167,0.16), transparent 55%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-6xl px-6 py-20 sm:py-24">
        {/* Decorative Lottie elements positioned at corners */}
        {decorativeElements.map((deco) => (
          <DecorativeLottie
            key={deco.id}
            src={deco.src}
            className={deco.className}
            animation={deco.animation}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="mx-auto mb-16 max-w-2xl text-center sm:mb-20"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#5CA347] sm:text-xs">
            Interactive learning
          </p>

          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            E learning{" "}
            <span className="bg-gradient-to-r from-[#085FA7] via-[#2EA7E0] to-[#5CA347] bg-clip-text text-transparent">
              ecosystem
            </span>
          </h2>

          <div className="mx-auto mt-4 h-px w-24 bg-gradient-to-r from-[#085FA7] to-[#5CA347] opacity-60" />
        </motion.div>

        <div
          ref={containerRef}
          className="relative grid grid-cols-1 items-center gap-10 md:grid-cols-2 lg:grid-cols-[1fr_auto_1fr] lg:gap-16"
        >
          <div className="order-2 flex flex-col gap-10 lg:order-1">
            {leftFeatures.map((card, i) => (
              <FeatureCard key={card.id} {...card} align="left" cardRef={leftRefs[i]} />
            ))}
          </div>

          <div className="order-1 flex justify-center md:col-span-2 lg:order-2 lg:col-span-1">
            <AiCore coreRef={coreRef} />
          </div>

          <div className="order-3 flex flex-col gap-10">
            {rightFeatures.map((card, i) => (
              <FeatureCard key={card.id} {...card} align="right" cardRef={rightRefs[i]} />
            ))}
          </div>

          <ConnectorLines paths={paths} reduceMotion={reduceMotion} />
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </section>
  );
}