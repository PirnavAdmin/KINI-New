import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
  FiUserCheck,
  FiUsers,
  FiFolder,
  FiClipboard,
  FiTool,
  FiAward,
  FiBriefcase,
  FiArrowRight,
} from "react-icons/fi";

/**
 * TrainingProcessRoadmap — v2.2 "Step-by-Step Journey"
 * ------------------------------------------------------------------
 * The walking character moves from milestone to milestone, stopping
 * at each step. The path glows progressively as the character advances.
 * Each step triggers a subtle celebration animation.
 * ------------------------------------------------------------------
 */

// Brand palette
const BRAND_BLUE = "#085FA7";
const BRAND_GREEN = "#5CA347";
const DARK_BG = "#0F172A";
const TEXT_MUTED = "#94A3B8";
const BRAND_GRADIENT = `linear-gradient(135deg, ${BRAND_BLUE}, ${BRAND_GREEN})`;

// Walking-character Lottie
const WALK_LOTTIE =
  "https://lottie.host/8a70192c-3d68-46c7-abfd-1510fd7e705f/kIXyHE74qN.lottie";

const STOPS = [
  { icon: FiUserCheck, label: "Enroll", sub: "Try Catch Classes" },
  { icon: FiUsers, label: "Practice", sub: "Session" },
  { icon: FiFolder, label: "Projects", sub: "" },
  { icon: FiClipboard, label: "Assignment", sub: "" },
  { icon: FiTool, label: "Practical", sub: "Session" },
  { icon: FiAward, label: "Grooming", sub: "Sessions" },
  { icon: FiBriefcase, label: "Be Job", sub: "Ready" },
];

const STEP = 180; // px of vertical space per stop on desktop
const LEFT_X = 22; // percent
const RIGHT_X = 78; // percent

const points = STOPS.map((_, i) => ({
  x: i % 2 === 0 ? LEFT_X : RIGHT_X,
  y: i * 100 + 50,
}));

function buildSnakePath(pts) {
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const midY = (prev.y + curr.y) / 2;
    d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
  }
  return d;
}

const SNAKE_D = buildSnakePath(points);
const VIEWBOX_H = STOPS.length * 100;

// Point-on-path math
function cubicBezierPoint(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  const x = mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x;
  const y = mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y;
  return { x, y };
}

function getPointOnSnake(progress) {
  const segCount = points.length - 1;
  if (segCount <= 0) return points[0];

  const clamped = Math.min(Math.max(progress, 0), 1);
  const scaled = clamped * segCount;
  let segIndex = Math.floor(scaled);
  if (segIndex >= segCount) segIndex = segCount - 1;
  const localT = scaled - segIndex;

  const p0 = points[segIndex];
  const p3 = points[segIndex + 1];
  const midY = (p0.y + p3.y) / 2;
  const p1 = { x: p0.x, y: midY };
  const p2 = { x: p3.x, y: midY };

  return cubicBezierPoint(p0, p1, p2, p3, localT);
}

function pad2(n) {
  return n < 10 ? `0${n}` : `${n}`;
}

function StopNode({ stop, index, isActive, isCompleted, onReach }) {
  const Icon = stop.icon;
  const accent = index % 2 === 0 ? BRAND_GREEN : BRAND_BLUE;
  const [hasCelebrated, setHasCelebrated] = useState(false);

  // Trigger celebration when step becomes active
  useEffect(() => {
    if (isActive && !hasCelebrated) {
      setHasCelebrated(true);
      onReach?.(index);
    }
  }, [isActive, hasCelebrated, index, onReach]);

  return (
    <div className="relative flex flex-col items-center">
      {/* Ghost numeral */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-6 select-none text-[64px] font-black leading-none tracking-tighter"
        style={{
          backgroundImage: BRAND_GRADIENT,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          opacity: isCompleted ? 0.16 : 0.06,
        }}
      >
        {pad2(index + 1)}
      </span>

      {/* Icon ring with pulse animation when active */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl p-[1.5px]"
        style={{ 
          background: isCompleted ? BRAND_GRADIENT : "rgba(255,255,255,0.1)",
          opacity: isCompleted ? 1 : 0.3
        }}
      >
        <div
          className="flex h-full w-full items-center justify-center rounded-[14px] text-lg"
          style={{ 
            backgroundColor: DARK_BG, 
            color: isCompleted ? accent : "#4a5568"
          }}
        >
          <Icon />
        </div>
        {isCompleted && (
          <motion.div
            className="absolute inset-[-4px] rounded-2xl"
            style={{ border: `2px solid ${BRAND_GREEN}` }}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.6, 0, 0.6],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
        {isActive && (
          <motion.div
            className="absolute inset-[-8px] rounded-2xl"
            style={{ border: `2px solid ${BRAND_GREEN}` }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </motion.div>

      {/* Glass caption card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="relative z-10 mt-3 w-[176px] rounded-2xl border px-3.5 py-2.5 text-center backdrop-blur-md"
        style={{
          backgroundColor: isCompleted ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.02)",
          borderColor: isActive ? `rgba(92, 163, 71, 0.4)` : "rgba(255,255,255,0.06)",
          transition: "all 0.5s ease",
        }}
      >
        <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: TEXT_MUTED }}>
          Step {pad2(index + 1)}
        </p>
        <p className="mt-0.5 text-[13px] font-extrabold leading-tight text-white">
          {stop.label}
          {stop.sub && <span className="font-medium" style={{ color: TEXT_MUTED }}> — {stop.sub}</span>}
        </p>
        {isCompleted && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mt-1 text-[10px] font-bold text-[#5CA347]"
          >
            ✅ COMPLETED
          </motion.div>
        )}
        {isActive && !isCompleted && (
          <motion.div
            animate={{
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="mt-1 text-[10px] font-bold text-[#2EA7E0]"
          >
            ● ARRIVING
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default function TrainingProcessRoadmap() {
  const sectionRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [celebrating, setCelebrating] = useState(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.8", "end 0.6"],
  });

  // Smooth progress for path animation
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 20,
    mass: 0.8,
  });

  // Calculate which step we're on based on scroll progress
  const stepProgress = useTransform(smoothProgress, [0, 1], [0, STOPS.length - 1]);
  
  // Path drawing progress
  const roadProgress = useTransform(smoothProgress, [0, 1], [0, 1]);

  // Walker position based on step-by-step movement
  const walkerLeft = useTransform(stepProgress, (step) => {
    const t = step / (STOPS.length - 1);
    return `${getPointOnSnake(t).x}%`;
  });
  
  const walkerTop = useTransform(stepProgress, (step) => {
    const t = step / (STOPS.length - 1);
    return `${(getPointOnSnake(t).y / VIEWBOX_H) * 100}%`;
  });

  // Mobile walker position
  const mobileWalkerTop = useTransform(stepProgress, (step) => {
    return `${(step / (STOPS.length - 1)) * 100}%`;
  });

  // Update current step and completed steps
  useEffect(() => {
    const unsubscribe = stepProgress.on("change", (value) => {
      const step = Math.round(value);
      const newStep = Math.min(step, STOPS.length - 1);
      
      if (newStep !== currentStep) {
        setCurrentStep(newStep);
        
        // Mark steps as completed up to current
        const newCompleted = [];
        for (let i = 0; i <= newStep; i++) {
          newCompleted.push(i);
        }
        setCompletedSteps(newCompleted);
        
        // Trigger celebration
        setCelebrating(newStep);
        setTimeout(() => setCelebrating(null), 1500);
      }
    });
    
    return () => unsubscribe();
  }, [stepProgress, currentStep]);

  const handleStepReach = (index) => {
    // Additional celebration effects can be triggered here
  };

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-14 sm:py-16 lg:py-20"
      style={{ backgroundColor: DARK_BG }}
    >
      {/* Ambient radial glows */}
      <div
        className="pointer-events-none absolute -top-32 left-1/4 h-96 w-96 rounded-full blur-3xl"
        style={{ backgroundColor: BRAND_BLUE, opacity: 0.18 }}
      />
      <div
        className="pointer-events-none absolute bottom-0 right-1/4 h-96 w-96 rounded-full blur-3xl"
        style={{ backgroundColor: BRAND_GREEN, opacity: 0.14 }}
      />

      {/* Step counter */}
      <div className="relative mb-6 text-center">
        <p className="text-sm font-bold text-white/60">
          Step {currentStep + 1} of {STOPS.length}
        </p>
      </div>

      {/* Heading */}
      <div className="relative mb-10 text-center sm:mb-12">
        <p
          className="mb-2 text-[11px] font-bold uppercase tracking-[0.25em]"
          style={{ color: BRAND_GREEN }}
        >
          The Journey
        </p>
        <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
          Our Training Process
        </h2>
        <div
          className="mx-auto mt-3 h-[3px] w-14 rounded-full"
          style={{ background: BRAND_GRADIENT }}
        />
      </div>

      {/* ---------- Desktop: snake path ---------- */}
      <div
        className="relative mx-auto hidden max-w-2xl px-6 md:block"
        style={{ height: STOPS.length * STEP }}
      >
        <svg
          className="absolute inset-0 h-full w-full overflow-visible"
          viewBox={`0 0 100 ${VIEWBOX_H}`}
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={BRAND_BLUE} />
              <stop offset="100%" stopColor={BRAND_GREEN} />
            </linearGradient>
            <filter id="pathGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Faint full-length guide */}
          <path d={SNAKE_D} stroke="#ffffff" strokeOpacity="0.08" strokeWidth="1.4" />

          {/* Glowing gradient trail - draws in as you scroll */}
          <motion.path
            d={SNAKE_D}
            stroke="url(#pathGradient)"
            strokeWidth="1.4"
            strokeLinecap="round"
            filter="url(#pathGlow)"
            style={{ pathLength: roadProgress }}
          />
          
          {/* Animated glow along the path */}
          <motion.circle
            r="8"
            fill={BRAND_GREEN}
            opacity="0.15"
            style={{
              offsetDistance: useTransform(roadProgress, [0, 1], ["0%", "100%"]),
            }}
          />
        </svg>

        {STOPS.map((stop, i) => {
          const p = points[i];
          const isActive = i === currentStep;
          const isCompleted = completedSteps.includes(i);
          
          return (
            <div
              key={stop.label}
              className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
              style={{ 
                left: `${p.x}%`, 
                top: `${(p.y / VIEWBOX_H) * 100}%`,
                opacity: isCompleted ? 1 : 0.4,
              }}
            >
              <StopNode 
                stop={stop} 
                index={i} 
                isActive={isActive}
                isCompleted={isCompleted}
                onReach={handleStepReach}
              />
            </div>
          );
        })}

        {/* Walking character - moves step by step */}
        <motion.div
          className="absolute z-20 h-14 w-14 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_6px_16px_rgba(8,95,167,0.45)] sm:h-16 sm:w-16"
          style={{ left: walkerLeft, top: walkerTop }}
        >
          <DotLottieReact src={WALK_LOTTIE} loop autoplay />
          
          {/* Step reached celebration ring */}
          {celebrating !== null && (
            <motion.div
              className="absolute inset-[-16px] rounded-full"
              style={{ border: `2px solid ${BRAND_GREEN}` }}
              initial={{ scale: 0.8, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.8 }}
            />
          )}
        </motion.div>
      </div>

      {/* ---------- Mobile: vertical timeline ---------- */}
      <div className="relative mx-auto max-w-sm px-6 md:hidden">
        <div
          className="absolute left-5 top-0 h-full w-px rounded-full"
          style={{ backgroundColor: "rgba(255,255,255,0.10)" }}
        >
          <motion.div
            style={{ scaleY: roadProgress, background: BRAND_GRADIENT }}
            className="h-full w-full origin-top rounded-full"
          />
        </div>

        {/* Mobile walker */}
        <motion.div
          className="absolute z-20 h-10 w-10 -translate-x-1/2 -translate-y-1/2"
          style={{ left: 20, top: mobileWalkerTop }}
        >
          <DotLottieReact src={WALK_LOTTIE} loop autoplay />
        </motion.div>

        <div className="flex flex-col gap-5 pl-12">
          {STOPS.map((stop, i) => {
            const Icon = stop.icon;
            const accent = i % 2 === 0 ? BRAND_GREEN : BRAND_BLUE;
            const isCompleted = completedSteps.includes(i);
            const isActive = i === currentStep;
            
            return (
              <div key={stop.label} className="relative flex items-center gap-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.7 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.35 }}
                  className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl p-[1.5px]"
                  style={{ 
                    background: isCompleted ? BRAND_GRADIENT : "rgba(255,255,255,0.1)",
                    marginLeft: "-2.75rem",
                    opacity: isCompleted ? 1 : 0.3,
                  }}
                >
                  <div
                    className="flex h-full w-full items-center justify-center rounded-[10px] text-base"
                    style={{ 
                      backgroundColor: DARK_BG, 
                      color: isCompleted ? accent : "#4a5568"
                    }}
                  >
                    <Icon />
                  </div>
                  {isActive && (
                    <motion.div
                      className="absolute inset-[-4px] rounded-xl"
                      style={{ border: `2px solid ${BRAND_GREEN}` }}
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.6, 0, 0.6],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.35, delay: 0.05 }}
                  className="relative flex-1 rounded-xl border px-3.5 py-2.5 backdrop-blur-md"
                  style={{
                    backgroundColor: isCompleted ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.02)",
                    borderColor: isActive ? `rgba(92, 163, 71, 0.4)` : "rgba(255,255,255,0.06)",
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-1 -top-3 select-none text-[34px] font-black leading-none"
                    style={{
                      backgroundImage: BRAND_GRADIENT,
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                      opacity: isCompleted ? 0.18 : 0.06,
                    }}
                  >
                    {pad2(i + 1)}
                  </span>
                  <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: TEXT_MUTED }}>
                    Step {pad2(i + 1)}
                  </p>
                  <p className="text-[13px] font-extrabold leading-tight text-white">
                    {stop.label}
                    {stop.sub && <span className="font-medium" style={{ color: TEXT_MUTED }}> — {stop.sub}</span>}
                  </p>
                  {isCompleted && (
                    <div className="mt-1 text-[10px] font-bold text-[#5CA347]">✅</div>
                  )}
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.4 }}
        className="relative mt-10 text-center sm:mt-12"
      >
        <button
          className="group inline-flex items-center gap-2 rounded-full px-7 py-3 text-xs font-extrabold tracking-wide text-white transition-transform duration-300 hover:scale-105 sm:text-sm"
          style={{
            background: BRAND_GRADIENT,
            boxShadow: `0 12px 28px -8px ${BRAND_BLUE}66`,
          }}
        >
          YES, I AM INTERESTED
          <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </motion.div>
    </section>
  );
}