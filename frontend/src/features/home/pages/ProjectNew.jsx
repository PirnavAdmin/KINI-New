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

const leftFeatures = [
  { id: "lessons",       title: "Interactive Lessons",  icon: LOTTIE_1 },
  { id: "mentorship",    title: "AI Mentorship",         icon: LOTTIE_2 },
];

const rightFeatures = [
  { id: "career",        title: "Career Growth",         icon: LOTTIE_3 },
  { id: "certifications",title: "Certifications",        icon: LOTTIE_4 },
];

const decorativeElements = [
  { 
    id: "deco1", 
    src: LOTTIE_1, 
    className: "absolute top-4 left-4 w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 opacity-30",
    animation: "float-slow"
  },
  { 
    id: "deco2", 
    src: LOTTIE_2, 
    className: "absolute top-4 right-4 w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 opacity-30",
    animation: "float-medium"
  },
  { 
    id: "deco3", 
    src: LOTTIE_3, 
    className: "absolute bottom-4 left-4 w-16 h-16 sm:w-24 sm:h-24 lg:w-28 lg:h-28 opacity-30",
    animation: "float-slow"
  },
  { 
    id: "deco4", 
    src: LOTTIE_4, 
    className: "absolute bottom-4 right-4 w-16 h-16 sm:w-24 sm:h-24 lg:w-28 lg:h-28 opacity-30",
    animation: "float-medium"
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
  
  const animations = {
    "float-slow": {
      y: [0, -12, 0],
      transition: {
        duration: 4.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    "float-medium": {
      y: [0, -18, 0],
      transition: {
        duration: 3.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={inView ? { 
        opacity: 0.3, 
        scale: 1,
        ...animations[animation]
      } : { 
        opacity: 0, 
        scale: 0.5 
      }}
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
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`flex flex-col items-center gap-3 ${
        isRight ? "items-end" : "items-start"
      }`}
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#085FA7]/20 to-[#5CA347]/20 p-3 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:from-[#085FA7]/30 hover:to-[#5CA347]/30 hover:shadow-lg hover:shadow-[#085FA7]/20">
        <CardLottie src={icon} />
        {/* Glow ring on hover */}
        <div className="absolute inset-0 rounded-2xl border border-[#085FA7]/10 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      <h3 className={`text-sm font-bold text-white/90 sm:text-base lg:text-lg ${
        isRight ? "text-right" : "text-left"
      }`}>
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
      
      {/* Pulsing rings around core */}
      <div className="absolute inset-[-20%] rounded-full border border-[#085FA7]/10 animate-ping-slow"></div>
      <div className="absolute inset-[-40%] rounded-full border border-[#5CA347]/5 animate-ping-slower"></div>
      
      <div className="relative h-72 w-72 sm:h-80 sm:w-80 lg:h-96 lg:w-96">
        <DotLottieReact
          src={LOTTIE_CORE}
          loop
          autoplay
        />
      </div>
    </div>
  );
}

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
        
        const featureRect = el.querySelector('div[class*="h-32"]')?.getBoundingClientRect() || r;
        
        const sx = side === "left" 
          ? featureRect.right - cRect.left 
          : featureRect.left - cRect.left;
        const sy = featureRect.top + featureRect.height / 2 - cRect.top;
        
        const dx = cx - sx;
        const dy = cy - sy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        
        const startX = sx;
        const startY = sy;
        
        const endX = cx - (dx / dist) * (cr + 20);
        const endY = cy - (dy / dist) * (cr + 20);
        
        const mx = (startX + endX) / 2;
        const my = (startY + endY) / 2 - 20;

        return { 
          d: `M ${startX} ${startY} C ${(startX + mx) / 2} ${my - 30} ${(endX + mx) / 2} ${my - 30} ${endX} ${endY}`,
          start: { x: startX, y: startY },
          end: { x: endX, y: endY }
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

function ConnectorLines({ paths, reduceMotion }) {
  if (!paths.length) return null;

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="wg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#085FA7" />
          <stop offset="30%"  stopColor="#2EA7E0" />
          <stop offset="70%"  stopColor="#5CA347" />
          <stop offset="100%" stopColor="#5CA347" />
        </linearGradient>
        
        <linearGradient id="wgReverse" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%"   stopColor="#5CA347" />
          <stop offset="30%"  stopColor="#2EA7E0" />
          <stop offset="70%"  stopColor="#085FA7" />
          <stop offset="100%" stopColor="#085FA7" />
        </linearGradient>
        
        <radialGradient id="bubbleGrad">
          <stop offset="0%" stopColor="#2EA7E0" stopOpacity="1"/>
          <stop offset="50%" stopColor="#085FA7" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#5CA347" stopOpacity="0.4"/>
        </radialGradient>

        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        <filter id="glowStrong">
          <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        <radialGradient id="pulseGrad">
          <stop offset="0%" stopColor="#2EA7E0" stopOpacity="0.9"/>
          <stop offset="50%" stopColor="#085FA7" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="#5CA347" stopOpacity="0"/>
        </radialGradient>
      </defs>

      {paths.map((pathData, i) => {
        const isLeft = i < 2;
        const gradient = isLeft ? "url(#wg)" : "url(#wgReverse)";
        
        return (
          <g key={i}>
            {/* Main path with glow */}
            <motion.path
              d={pathData.d}
              stroke={gradient}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeOpacity="0.7"
              initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: i * 0.15, ease: "easeInOut" }}
            />

            {/* Glow path behind */}
            <motion.path
              d={pathData.d}
              stroke={gradient}
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeOpacity="0.08"
              filter="url(#glowStrong)"
              initial={reduceMotion ? false : { pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.8, delay: i * 0.15, ease: "easeInOut" }}
            />

            {/* Bubbles flowing from center to edges */}
            {!reduceMotion && (
              <>
                {/* Large bubble */}
                <motion.circle
                  r="7"
                  fill="url(#bubbleGrad)"
                  filter="url(#glow)"
                  initial={{ offsetDistance: "0%" }}
                  animate={{ offsetDistance: "100%" }}
                  transition={{
                    duration: 2.5 + i * 0.2,
                    delay: i * 0.3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{ offsetPath: `path("${pathData.d}")` }}
                />
                
                {/* Medium bubble */}
                <motion.circle
                  r="5"
                  fill="url(#bubbleGrad)"
                  filter="url(#glow)"
                  initial={{ offsetDistance: "0%" }}
                  animate={{ offsetDistance: "100%" }}
                  transition={{
                    duration: 3 + i * 0.2,
                    delay: i * 0.3 + 0.5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{ offsetPath: `path("${pathData.d}")` }}
                />

                {/* Small fast bubble */}
                <motion.circle
                  r="3.5"
                  fill="#2EA7E0"
                  opacity="0.9"
                  filter="url(#glow)"
                  initial={{ offsetDistance: "0%" }}
                  animate={{ offsetDistance: "100%" }}
                  transition={{
                    duration: 2 + i * 0.15,
                    delay: i * 0.3 + 1,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{ offsetPath: `path("${pathData.d}")` }}
                />

                {/* Tiny sparkle bubble */}
                <motion.circle
                  r="2"
                  fill="#5CA347"
                  opacity="0.8"
                  initial={{ offsetDistance: "0%" }}
                  animate={{ offsetDistance: "100%" }}
                  transition={{
                    duration: 1.8 + i * 0.15,
                    delay: i * 0.3 + 1.5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{ offsetPath: `path("${pathData.d}")` }}
                />
              </>
            )}

            {/* Pulse at start (center) */}
            <motion.circle
              cx={pathData.start.x}
              cy={pathData.start.y}
              r="8"
              fill="url(#pulseGrad)"
              initial={{ scale: 0.6, opacity: 0.5 }}
              animate={{
                scale: [0.6, 1.6, 0.6],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2.5,
                delay: i * 0.2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Pulse at end (feature card) */}
            <motion.circle
              cx={pathData.end.x}
              cy={pathData.end.y}
              r="8"
              fill="url(#pulseGrad)"
              initial={{ scale: 0.6, opacity: 0.5 }}
              animate={{
                scale: [0.6, 1.6, 0.6],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2.5,
                delay: i * 0.2 + 0.6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Energy dots along the path */}
            {!reduceMotion && [0.2, 0.4, 0.6, 0.8].map((offset, idx) => (
              <motion.circle
                key={`dot-${i}-${idx}`}
                r="2"
                fill={idx % 2 === 0 ? "#2EA7E0" : "#5CA347"}
                opacity="0.4"
                initial={{ offsetDistance: "0%" }}
                animate={{ offsetDistance: "100%" }}
                transition={{
                  duration: 3 + i * 0.1,
                  delay: i * 0.2 + offset * 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{ offsetPath: `path("${pathData.d}")` }}
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

export default function PremiumELearning() {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef(null);
  const coreRef = useRef(null);
  const leftRef1 = useRef(null);
  const leftRef2 = useRef(null);
  const rightRef1 = useRef(null);
  const rightRef2 = useRef(null);
  const leftRefs = useMemo(() => [leftRef1, leftRef2], []);
  const rightRefs = useMemo(() => [rightRef1, rightRef2], []);

  const paths = useConnectorPaths({ containerRef, coreRef, leftRefs, rightRefs });

  return (
    <section
      className="relative flex flex-col justify-center overflow-hidden"
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

      <div className="relative mx-auto w-full max-w-6xl px-6 py-12 sm:py-14 lg:py-16">
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
          className="mx-auto mb-10 max-w-2xl text-center sm:mb-12"
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
              <FeatureCard
                key={card.id}
                {...card}
                align="left"
                cardRef={leftRefs[i]}
              />
            ))}
          </div>

          <div className="order-1 flex justify-center md:col-span-2 lg:order-2 lg:col-span-1">
            <AiCore coreRef={coreRef} />
          </div>

          <div className="order-3 flex flex-col gap-10">
            {rightFeatures.map((card, i) => (
              <FeatureCard
                key={card.id}
                {...card}
                align="right"
                cardRef={rightRefs[i]}
              />
            ))}
          </div>

          <ConnectorLines paths={paths} reduceMotion={reduceMotion} />
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }

        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.1; }
          100% { transform: scale(1); opacity: 0.3; }
        }
        .animate-ping-slow {
          animation: ping-slow 3s ease-in-out infinite;
        }

        @keyframes ping-slower {
          0% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.15); opacity: 0.05; }
          100% { transform: scale(1); opacity: 0.2; }
        }
        .animate-ping-slower {
          animation: ping-slower 4s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
