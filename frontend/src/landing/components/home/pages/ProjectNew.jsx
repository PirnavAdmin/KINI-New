import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useThemeContext } from "@landing-shared/context/ThemeContext";
import { FaRobot } from "react-icons/fa";

// ─── Lottie URLs ──────────────────────────────────────────────────────────────
const LOTTIE_1    = "https://lottie.host/7dffc81e-cd4a-4dd5-a7b8-f3051d0de370/KW4ucR2SjZ.lottie";
const LOTTIE_2    = "https://lottie.host/31ec9d79-84e6-48e3-8ca5-e28d8f76b7f5/UvhgChLpzJ.lottie";
const LOTTIE_3    = "https://lottie.host/1a197c3c-87a7-4a2f-ab43-0c2d2f6e9a13/Q13OGciyjR.lottie";
const LOTTIE_4    = "https://lottie.host/29adac1f-8fa6-4a78-bdce-f9ae0199a4ec/VfN3A0v9wK.lottie";
const LOTTIE_CORE = "https://lottie.host/302e5e47-76ce-4a46-be53-e04492adc7f5/0qTdtA24zK.lottie";

// ─── Feature data ─────────────────────────────────────────────────────────────
const ALL_FEATURES = [
  { id: "lessons",        title: "Interactive Lessons",  desc: "Learn through practical, hands-on sessions with real projects.",        icon: LOTTIE_1 },
  { id: "mentorship",     title: "AI Mentorship",         desc: "Get personalised guidance and support throughout your journey.",         icon: LOTTIE_2 },
  { id: "career",         title: "Career Growth",          desc: "Build industry-aligned skills that open doors to new opportunities.",    icon: LOTTIE_3 },
  { id: "certifications", title: "Certifications",         desc: "Earn recognised credentials to showcase your achievements.",            icon: LOTTIE_4 },
];

const leftFeatures  = ALL_FEATURES.slice(0, 2);
const rightFeatures = ALL_FEATURES.slice(2, 4);

const EASE = [0.22, 1, 0.36, 1];

// ─── Lazy lottie wrapper ──────────────────────────────────────────────────────
function CardLottie({ src, className = "h-full w-full" }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "80px" });
  return (
    <div ref={ref} className={className} aria-hidden="true">
      {inView && <DotLottieReact src={src} autoplay loop />}
    </div>
  );
}

// ─── DESKTOP feature card ─────────────────────────────────────────────────────
function DesktopFeatureCard({ icon, title, align, cardRef, isDark }) {
  const isRight = align === "right";
  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-8% 0px" }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`flex flex-col items-center gap-3 ${isRight ? "items-end" : "items-start"}`}
    >
      <div className={`relative overflow-hidden rounded-2xl p-3 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg ${
        isDark
          ? "bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 hover:from-[#334155]/90 hover:to-[#1E293B]/90 hover:shadow-[#133B5D]/30"
          : "bg-gradient-to-br from-[#EEF3F8]/80 to-[#FFF4E5]/80 hover:from-[#D9E3EE]/90 hover:to-[#FEE6C2]/90 hover:shadow-[#133B5D]/20"
      }`}>
        <div className="h-28 w-28 lg:h-32 lg:w-32">
          <CardLottie src={icon} />
        </div>
        <div className={`absolute inset-0 rounded-2xl border-2 transition-opacity duration-300 ${
          isDark ? "border-[#35608A]/20 opacity-0 hover:opacity-100" : "border-[#133B5D]/20 opacity-0 hover:opacity-100"
        }`} />
      </div>
      <h3 className={`text-sm font-bold lg:text-base ${isRight ? "text-right" : "text-left"} ${
        isDark ? "text-white" : "text-[#133B5D]"
      }`}>
        {title}
      </h3>
    </motion.div>
  );
}

// ─── MOBILE feature card — animated horizontal ───────────────────────────────
function MobileFeatureCard({ icon, title, desc, index, isDark, reduceMotion }) {
  const isEven = index % 2 === 0;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, x: isEven ? -28 : 28 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: false, margin: "-10px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: EASE }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      className={`group relative flex items-center gap-4 overflow-hidden rounded-[18px] border px-4 py-4 ${
        isDark
          ? "border-white/10 bg-white/[0.05] backdrop-blur-sm"
          : "border-slate-200/80 bg-white/90 backdrop-blur-sm shadow-sm"
      }`}
    >
      {/* Shimmer sweep on hover */}
      {!reduceMotion && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
        />
      )}

      {/* Left accent bar */}
      <motion.span
        aria-hidden="true"
        initial={reduceMotion ? false : { scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: false }}
        transition={{ duration: 0.4, delay: index * 0.1 + 0.25, ease: EASE }}
        className="absolute left-0 top-4 bottom-4 w-[3px] origin-top rounded-r-full"
        style={{ background: "linear-gradient(180deg, #133B5D, #F39924)" }}
      />

      {/* Icon with pulse ring */}
      <motion.div
        initial={reduceMotion ? false : { scale: 0.7, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: false }}
        transition={{ duration: 0.4, delay: index * 0.1 + 0.15, type: "spring", stiffness: 260, damping: 18 }}
        className="relative h-14 w-14 flex-shrink-0"
      >
        {/* Pulse ring */}
        {!reduceMotion && (
          <motion.span
            aria-hidden="true"
            animate={{ scale: [1, 1.35, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2.5, delay: index * 0.3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-xl"
            style={{ background: "linear-gradient(135deg, rgba(19,59,93,0.25), rgba(243,153,36,0.25))" }}
          />
        )}
        <div className={`relative h-full w-full overflow-hidden rounded-xl ${
          isDark ? "bg-white/5" : "bg-primary-50/80"
        }`}>
          <CardLottie src={icon} />
        </div>
      </motion.div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.35, delay: index * 0.1 + 0.2, ease: EASE }}
          className={`text-sm font-bold leading-tight ${
            isDark ? "text-white" : "text-[#133B5D]"
          }`}
        >
          {title}
        </motion.p>
        <motion.p
          initial={reduceMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.35, delay: index * 0.1 + 0.3, ease: EASE }}
          className={`mt-0.5 text-xs leading-relaxed ${
            isDark ? "text-slate-400" : "text-slate-500"
          }`}
        >
          {desc}
        </motion.p>
      </div>

      {/* Animated gradient dot */}
      <motion.div
        aria-hidden="true"
        animate={reduceMotion ? undefined : { scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2 + index * 0.4, repeat: Infinity, ease: "easeInOut" }}
        className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
        style={{ background: "linear-gradient(135deg, #133B5D, #F39924)" }}
      />
    </motion.div>
  );
}

// ─── AI Core — desktop version (full orbit rings) ────────────────────────────
function AiCoreDesktop({ coreRef, isDark }) {
  return (
    <div
      ref={coreRef}
      className="relative flex h-56 w-56 items-center justify-center sm:h-72 sm:w-72 lg:h-96 lg:w-96"
    >
      <div className={`absolute inset-0 rounded-full blur-2xl animate-pulse ${
        isDark ? "bg-[#35608A]/20" : "bg-[#133B5D]/10"
      }`} />
      <div className={`absolute inset-6 rounded-full border ${
        isDark ? "border-[#35608A]/30" : "border-[#133B5D]/20"
      }`} />
      <div className={`absolute inset-12 rounded-full border ${
        isDark ? "border-[#35608A]/20" : "border-[#133B5D]/10"
      }`} />
      <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${
        isDark ? "from-[#35608A]/20 to-[#F7A62E]/20" : "from-[#133B5D]/10 to-[#F39924]/10"
      } animate-spin-slow`} />
      <div className={`absolute inset-[-20%] rounded-full border ${
        isDark ? "border-[#35608A]/30" : "border-[#133B5D]/20"
      } animate-ping-slow`} />
      <div className={`absolute inset-[-40%] rounded-full border ${
        isDark ? "border-[#F7A62E]/20" : "border-[#F39924]/15"
      } animate-ping-slower`} />

      <div className="relative h-40 w-40 sm:h-56 sm:w-56 lg:h-72 lg:w-72">
        <DotLottieReact src={LOTTIE_CORE} loop autoplay />
      </div>

      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute bottom-2 sm:bottom-3 lg:bottom-4 flex items-center gap-1.5 rounded-full px-2.5 py-1 sm:px-3.5 sm:py-1.5 ${
          isDark
            ? "bg-[#35608A]/40 border border-[#35608A]/50 text-[#B3C7DD] backdrop-blur-sm"
            : "bg-white/60 backdrop-blur-sm border border-white/70 text-[#133B5D] shadow-lg"
        }`}
      >
        <FaRobot className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
        <span className="text-[8px] sm:text-[10px] lg:text-xs font-semibold tracking-wide whitespace-nowrap">
          AI Mentor
        </span>
      </motion.div>
    </div>
  );
}

// ─── AI Core — mobile version (animated, no orbit rings) ─────────────────────
function AiCoreMobile({ isDark, reduceMotion }) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: -16, scale: 0.88 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false }}
      transition={{ duration: 0.7, ease: EASE }}
      className="flex flex-col items-center"
    >
      <div className="relative flex h-44 w-44 items-center justify-center">
        {/* Outer slow-pulse ring */}
        {!reduceMotion && (
          <motion.span
            aria-hidden="true"
            animate={{ scale: [1, 1.18, 1], opacity: [0.15, 0.05, 0.15] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(19,59,93,0.25) 0%, transparent 70%)" }}
          />
        )}

        {/* Inner glow */}
        <motion.span
          aria-hidden="true"
          animate={reduceMotion ? undefined : { opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-4 rounded-full blur-2xl"
          style={{ background: "radial-gradient(circle, rgba(19,59,93,0.35) 0%, rgba(243,153,36,0.15) 60%, transparent 100%)" }}
        />

        {/* Floating lottie */}
        <motion.div
          animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10 h-36 w-36"
        >
          <DotLottieReact src={LOTTIE_CORE} loop autoplay />
        </motion.div>
      </div>

      {/* Animated badge */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.4, delay: 0.4, ease: EASE }}
        animate={reduceMotion ? undefined : { y: [0, -3, 0] }}
        className={`mt-1 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
          isDark
            ? "bg-[#35608A]/30 border border-[#35608A]/40 text-[#B3C7DD]"
            : "bg-white/90 border border-[#133B5D]/25 text-[#133B5D] shadow-md"
        }`}
        style={reduceMotion ? undefined : { animation: "badgeFloat 3.5s ease-in-out infinite" }}
      >
        <motion.span
          animate={reduceMotion ? undefined : { rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <FaRobot className="h-3 w-3" />
        </motion.span>
        AI Mentor
      </motion.div>
    </motion.div>
  );
}

// ─── Animated vertical connector line ────────────────────────────────────────
function VerticalConnector({ isDark, reduceMotion }) {
  return (
    <div className="relative mx-auto my-2 flex w-6 flex-col items-center" aria-hidden="true">
      {/* Static line */}
      <motion.div
        initial={reduceMotion ? false : { scaleY: 0, opacity: 0 }}
        whileInView={{ scaleY: 1, opacity: 1 }}
        viewport={{ once: false }}
        transition={{ duration: 0.6, ease: EASE }}
        className="h-8 w-px origin-top"
        style={{ background: `linear-gradient(180deg, ${isDark ? "rgba(140,169,201,0.6)" : "rgba(19,59,93,0.5)"}, ${isDark ? "rgba(247,166,46,0.3)" : "rgba(243,153,36,0.3)"})` }}
      />
      {/* Travelling dot */}
      {!reduceMotion && (
        <motion.div
          className="absolute top-0 h-1.5 w-1.5 rounded-full"
          style={{ background: "linear-gradient(135deg, #133B5D, #F39924)" }}
          animate={{ y: [0, 28, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />
      )}
    </div>
  );
}

// ─── Connector paths hook ─────────────────────────────────────────────────────
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
        const featureRect = el.querySelector("div[class*='h-28']")?.getBoundingClientRect() || el.getBoundingClientRect();
        const sx = side === "left" ? featureRect.right - cRect.left : featureRect.left - cRect.left;
        const sy = featureRect.top + featureRect.height / 2 - cRect.top;
        const dx = cx - sx; const dy = cy - sy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const endX = cx - (dx / dist) * (cr + 20);
        const endY = cy - (dy / dist) * (cr + 20);
        const mx = (sx + endX) / 2;
        const my = (sy + endY) / 2 - 20;
        return {
          d: `M ${sx} ${sy} C ${(sx + mx) / 2} ${my - 30} ${(endX + mx) / 2} ${my - 30} ${endX} ${endY}`,
          start: { x: sx, y: sy },
          end:   { x: endX, y: endY },
        };
      };

      setPaths([
        ...leftRefs.map((r) => buildPath(r, "left")),
        ...rightRefs.map((r) => buildPath(r, "right")),
      ].filter(Boolean));
    }

    calculate();
    const ro = new ResizeObserver(calculate);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", calculate);
    return () => { ro.disconnect(); window.removeEventListener("resize", calculate); };
  }, [containerRef, coreRef, leftRefs, rightRefs]);

  return paths;
}

// ─── Connector SVG — desktop only ────────────────────────────────────────────
function ConnectorLines({ paths, reduceMotion, isDark }) {
  if (!paths.length) return null;

  const c = isDark
    ? { g1: ["#35608A","#8CA9C9","#F7A62E"], g2: ["#F7A62E","#8CA9C9","#35608A"], bubble: "#8CA9C9", glow: "#35608A" }
    : { g1: ["#133B5D","#5E82A8","#F39924"], g2: ["#F39924","#5E82A8","#133B5D"], bubble: "#5E82A8", glow: "#133B5D" };

  return (
    // hidden on mobile/tablet — only visible lg+
    <svg className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block" aria-hidden="true">
      <defs>
        <linearGradient id="wg"        x1="0%"   y1="0%" x2="100%" y2="0%">
          {c.g1.map((col, i) => <stop key={i} offset={`${i * 50}%`} stopColor={col} />)}
        </linearGradient>
        <linearGradient id="wgReverse" x1="100%" y1="0%" x2="0%"   y2="0%">
          {c.g2.map((col, i) => <stop key={i} offset={`${i * 50}%`} stopColor={col} />)}
        </linearGradient>
        <radialGradient id="bubbleGrad">
          <stop offset="0%"   stopColor={c.bubble} stopOpacity="0.8" />
          <stop offset="100%" stopColor={c.g1[2]}  stopOpacity="0.3" />
        </radialGradient>
        <radialGradient id="pulseGrad">
          <stop offset="0%"   stopColor={c.glow}  stopOpacity="0.7" />
          <stop offset="100%" stopColor={c.g1[2]} stopOpacity="0"   />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="cb" />
          <feMerge><feMergeNode in="cb" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="glowStrong">
          <feGaussianBlur stdDeviation="6" result="cb" />
          <feMerge><feMergeNode in="cb" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {paths.map((p, i) => {
        const grad = i < 2 ? "url(#wg)" : "url(#wgReverse)";
        return (
          <g key={i}>
            <motion.path d={p.d} stroke={grad} strokeWidth="3" fill="none" strokeLinecap="round" strokeOpacity="0.6"
              initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: false }}
              transition={{ duration: 1.5, delay: i * 0.15, ease: "easeInOut" }}
            />
            <motion.path d={p.d} stroke={grad} strokeWidth="12" fill="none" strokeLinecap="round" strokeOpacity="0.06"
              filter="url(#glowStrong)"
              initial={reduceMotion ? false : { pathLength: 0 }}
              whileInView={{ pathLength: 1 }} viewport={{ once: false }}
              transition={{ duration: 1.8, delay: i * 0.15, ease: "easeInOut" }}
            />

            {!reduceMotion && [
              { r: 7, dur: 2.5 + i * 0.2, delay: i * 0.3 },
              { r: 5, dur: 3   + i * 0.2, delay: i * 0.3 + 0.5 },
              { r: 3, dur: 2   + i * 0.15,delay: i * 0.3 + 1 },
            ].map(({ r, dur, delay }, idx) => (
              <motion.circle key={idx} r={r} fill="url(#bubbleGrad)" filter="url(#glow)"
                initial={{ offsetDistance: "100%" }} animate={{ offsetDistance: "0%" }}
                transition={{ duration: dur, delay, repeat: Infinity, ease: "linear" }}
                style={{ offsetPath: `path("${p.d}")` }}
              />
            ))}

            {[p.start, p.end].map((pt, idx) => (
              <motion.circle key={idx} cx={pt.x} cy={pt.y} r="8" fill="url(#pulseGrad)"
                initial={{ scale: 0.6, opacity: 0.4 }}
                animate={{ scale: [0.6, 1.6, 0.6], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2.5, delay: i * 0.2 + idx * 0.6, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────
export default function PremiumELearning() {
  const { isDark }    = useThemeContext();
  const reduceMotion  = useReducedMotion();
  const containerRef  = useRef(null);
  const coreRef       = useRef(null);
  const leftRef1  = useRef(null); const leftRef2  = useRef(null);
  const rightRef1 = useRef(null); const rightRef2 = useRef(null);
  const leftRefs  = useMemo(() => [leftRef1,  leftRef2],  []);
  const rightRefs = useMemo(() => [rightRef1, rightRef2], []);
  const paths = useConnectorPaths({ containerRef, coreRef, leftRefs, rightRefs });

  // Shared heading block
  const Heading = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false }}
      transition={{ duration: 0.55 }}
      className="mx-auto max-w-2xl text-center"
    >
      <p className={`text-[10px] font-bold uppercase tracking-[0.35em] sm:text-xs ${
        isDark ? "text-[#8CA9C9]" : "text-[#133B5D]"
      }`}>
        Interactive learning
      </p>
      <h2 className={`mt-3 font-extrabold tracking-tight text-[1.75rem] sm:text-3xl lg:text-4xl xl:text-5xl ${
        isDark ? "text-white" : "text-[#133B5D]"
      }`}>
        E-learning{" "}
        <span
          className="bg-clip-text text-transparent"
          style={{ backgroundImage: "linear-gradient(90deg, #133B5D, #5E82A8, #F39924)" }}
        >
          ecosystem
        </span>
      </h2>
      <p className={`mt-3 text-sm sm:text-base ${isDark ? "text-slate-300" : "text-[#455A64]"}`}>
        Transform your learning experience with our comprehensive platform
      </p>
      <div
        className="mx-auto mt-4 h-px w-20 opacity-60"
        style={{ backgroundImage: "linear-gradient(90deg, #133B5D, #F39924)" }}
      />
    </motion.div>
  );

  return (
    <section
      className={`relative overflow-hidden transition-colors duration-500 ${
        isDark ? "bg-app-dark-gradient" : "bg-white"
      }`}
    >
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background: isDark
            ? "radial-gradient(ellipse at 20% 50%, rgba(53,96,138,0.15), transparent 50%), radial-gradient(ellipse at 80% 50%, rgba(247,166,46,0.10), transparent 50%)"
            : "radial-gradient(ellipse at 20% 50%, rgba(19,59,93,0.08), transparent 50%), radial-gradient(ellipse at 80% 50%, rgba(243,153,36,0.06), transparent 50%)",
        }}
      />
      {/* Grid pattern — reduced opacity on mobile */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015] sm:opacity-[0.03]"
        aria-hidden="true"
        style={{
          backgroundImage: `linear-gradient(${isDark ? "rgba(53,96,138,0.1)" : "rgba(19,59,93,0.1)"} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? "rgba(53,96,138,0.1)" : "rgba(19,59,93,0.1)"} 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* ════════════════════════════════════════
          MOBILE layout  (< 1024px)
          Vertical storytelling flow
      ═══════════════════════════════════════ */}
      <div className="lg:hidden">
        <div className="mx-auto max-w-lg px-4 py-12 sm:px-6 sm:py-16">
          {/* 1. Heading */}
          {Heading}

          {/* 2. AI Mentor — centered, animated */}
          <div className="mt-8 flex justify-center">
            <AiCoreMobile isDark={isDark} reduceMotion={reduceMotion} />
          </div>

          {/* Vertical connector: mentor → cards */}
          <VerticalConnector isDark={isDark} reduceMotion={reduceMotion} />

          {/* 3. Feature cards — animated vertical stack */}
          <div className="flex flex-col gap-3">
            {ALL_FEATURES.map((f, i) => (
              <MobileFeatureCard
                key={f.id}
                index={i}
                icon={f.icon}
                title={f.title}
                desc={f.desc}
                isDark={isDark}
                reduceMotion={reduceMotion}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          DESKTOP layout  (1024px+)
          Original radial / orbit composition
      ═══════════════════════════════════════ */}
      <div className="hidden lg:block">
        <div className="relative mx-auto w-full max-w-6xl px-8 py-16 xl:py-20">
          {/* Heading */}
          <div className="mb-8">{Heading}</div>

          {/* 3-column grid */}
          <div
            ref={containerRef}
            className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-8"
          >
            {/* Left features */}
            <div className="flex flex-col gap-8">
              {leftFeatures.map((f, i) => (
                <DesktopFeatureCard
                  key={f.id}
                  icon={f.icon}
                  title={f.title}
                  align="left"
                  cardRef={leftRefs[i]}
                  isDark={isDark}
                />
              ))}
            </div>

            {/* Center — AI Core */}
            <div className="flex justify-center">
              <AiCoreDesktop coreRef={coreRef} isDark={isDark} />
            </div>

            {/* Right features */}
            <div className="flex flex-col gap-8">
              {rightFeatures.map((f, i) => (
                <DesktopFeatureCard
                  key={f.id}
                  icon={f.icon}
                  title={f.title}
                  align="right"
                  cardRef={rightRefs[i]}
                  isDark={isDark}
                />
              ))}
            </div>

            {/* Connector SVG — desktop only */}
            <ConnectorLines paths={paths} reduceMotion={reduceMotion} isDark={isDark} />
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          TABLET layout  (640–1023px)
          AI Mentor top + 2×2 grid
      ═══════════════════════════════════════ */}
      {/* Already handled by the mobile block above (lg:hidden covers < 1024px).
          We add a tablet-specific card grid for sm–lg range. */}

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }

        @keyframes ping-slow {
          0%, 100% { transform: scale(1);    opacity: 0.2;  }
          50%       { transform: scale(1.1);  opacity: 0.05; }
        }
        .animate-ping-slow { animation: ping-slow 3s ease-in-out infinite; }

        @keyframes ping-slower {
          0%, 100% { transform: scale(1);    opacity: 0.15; }
          50%       { transform: scale(1.15); opacity: 0.03; }
        }
        .animate-ping-slower { animation: ping-slower 4s ease-in-out infinite; }

        @keyframes badgeFloat {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-3px); }
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-spin-slow,
          .animate-ping-slow,
          .animate-ping-slower { animation: none; }
        }
      `}</style>
    </section>
  );
}