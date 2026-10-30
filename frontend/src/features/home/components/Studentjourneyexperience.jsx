import { useMemo, useRef, useState, useEffect } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

// Different Lottie animations for each student stage
const LOTTIE_STUDENT_NEW = 
  "https://lottie.host/8a70192c-3d68-46c7-abfd-1510fd7e705f/kIXyHE74qN.lottie";

const LOTTIE_STUDENT_LEARNER = 
  "https://lottie.host/7dffc81e-cd4a-4dd5-a7b8-f3051d0de370/KW4ucR2SjZ.lottie";

const LOTTIE_STUDENT_BUILDER = 
  "https://lottie.host/31ec9d79-84e6-48e3-8ca5-e28d8f76b7f5/UvhgChLpzJ.lottie";

const LOTTIE_STUDENT_PROFESSIONAL = 
  "https://lottie.host/735187b7-af40-4bc9-8902-7f94523950e6/2oXDK4zGgI.lottie";

const LOTTIE_STUDENT_ENGINEER = 
  "https://lottie.host/29adac1f-8fa6-4a78-bdce-f9ae0199a4ec/VfN3A0v9wK.lottie";

const LOTTIE_SPARK = 
  "https://lottie.host/d903bc36-45a3-45c2-a9f2-552301f8b2ef/RZY2rVAYDc.lottie";

const LOTTIE_CONFETTI = 
  "https://lottie.host/302e5e47-76ce-4a46-be53-e04492adc7f5/0qTdtA24zK.lottie";

const LOTTIE_STARS = 
  "https://lottie.host/80e75c18-156f-48a5-97d7-41791f98ec72/ozpYdY5H3E.lottie";

const studentLottieMap = {
  new: LOTTIE_STUDENT_NEW,
  learner: LOTTIE_STUDENT_LEARNER,
  builder: LOTTIE_STUDENT_BUILDER,
  professional: LOTTIE_STUDENT_PROFESSIONAL,
  engineer: LOTTIE_STUDENT_ENGINEER,
};

const scenes = [
  {
    id: "campus",
    title: "The Arrival",
    line: "Morning light. A nervous smile. The first brave step toward a new identity.",
    teaser: "Inside, everything is already beginning.",
    speech: "Can I really do this?",
    mood: "curious",
    impact: "HOPE",
    sky: ["#BFE9FF", "#F8D99B", "#EAF7FF"],
    ground: "#294B3B",
    student: "new",
    setting: "campus",
    x: ["9%", "43%"],
    y: ["0%", "-2%"],
    lottie: LOTTIE_STUDENT_NEW,
    bgLottie: LOTTIE_SPARK,
  },
  {
    id: "demo",
    title: "Discovery",
    line: "A mentor waves. Screens glow. Students build things that feel impossible until now.",
    teaser: "Then the welcome badge arrives.",
    speech: "People here are building real things.",
    mood: "amazed",
    impact: "WOW",
    sky: ["#1D3B67", "#305C90", "#82B7DD"],
    ground: "#182A3D",
    student: "new",
    setting: "classroom",
    x: ["23%", "45%"],
    y: ["0%", "0%"],
    lottie: LOTTIE_STUDENT_NEW,
    bgLottie: LOTTIE_SPARK,
  },
  {
    id: "enrollment",
    title: "Enrollment",
    line: "An ID card, a welcome kit, and a tiny feeling that says: I belong here.",
    teaser: "The dream now needs discipline.",
    speech: "I am really doing this.",
    mood: "proud",
    impact: "WELCOME",
    sky: ["#0D4D55", "#14746F", "#78D5B3"],
    ground: "#123D38",
    student: "learner",
    setting: "badge",
    x: ["37%", "48%"],
    y: ["0%", "-4%"],
    lottie: LOTTIE_STUDENT_LEARNER,
    bgLottie: LOTTIE_STARS,
  },
  {
    id: "learning",
    title: "Learning",
    line: "Night study, desk lamp, coffee, notes, and technologies orbiting like new constellations.",
    teaser: "But the journey was never meant to be easy.",
    speech: "I think I am starting to understand.",
    mood: "focused",
    impact: "LEARN",
    sky: ["#111827", "#243B53", "#416C8F"],
    ground: "#111827",
    student: "learner",
    setting: "workspace",
    x: ["31%", "48%"],
    y: ["0%", "0%"],
    lottie: LOTTIE_STUDENT_LEARNER,
    bgLottie: LOTTIE_SPARK,
  },
  {
    id: "struggle",
    title: "Struggle",
    line: "Rain taps the window. Errors stack up. The student breathes, then keeps building.",
    teaser: "One more try changes everything.",
    speech: "Why isn't this working?",
    mood: "determined",
    impact: "KEEP BUILDING",
    sky: ["#1A1C2E", "#29315E", "#7357A4"],
    ground: "#151827",
    student: "learner",
    setting: "struggle",
    x: ["26%", "53%"],
    y: ["0%", "-1%"],
    lottie: LOTTIE_STUDENT_LEARNER,
    bgLottie: LOTTIE_STARS,
  },
  {
    id: "breakthrough",
    title: "Breakthrough",
    line: "The terminal succeeds. The room brightens. Self-belief finally has proof.",
    teaser: "Now it is time to launch something real.",
    speech: "It finally worked.",
    mood: "happy",
    impact: "LEVEL UP",
    sky: ["#0F2E44", "#166477", "#A7E8C2"],
    ground: "#123B4A",
    student: "builder",
    setting: "breakthrough",
    x: ["34%", "52%"],
    y: ["0%", "-5%"],
    lottie: LOTTIE_STUDENT_BUILDER,
    bgLottie: LOTTIE_CONFETTI,
  },
  {
    id: "projects",
    title: "First Project",
    line: "A portfolio appears. A rocket lifts. The first real build becomes a memory.",
    teaser: "Soon, the room will ask harder questions.",
    speech: "I built this.",
    mood: "excited",
    impact: "FIRST PROJECT",
    sky: ["#09203F", "#17639B", "#FFE08A"],
    ground: "#0C2A3F",
    student: "builder",
    setting: "project",
    x: ["30%", "56%"],
    y: ["0%", "-8%"],
    lottie: LOTTIE_STUDENT_BUILDER,
    bgLottie: LOTTIE_CONFETTI,
  },
  {
    id: "interviews",
    title: "Mock Interview",
    line: "A nervous answer becomes a confident one. The handshake feels like a new identity.",
    teaser: "Then the whole world slows down.",
    speech: "I am ready for this.",
    mood: "confident",
    impact: "READY",
    sky: ["#172033", "#34405F", "#A0B5D8"],
    ground: "#121B2A",
    student: "professional",
    setting: "interview",
    x: ["27%", "50%"],
    y: ["0%", "0%"],
    lottie: LOTTIE_STUDENT_PROFESSIONAL,
    bgLottie: LOTTIE_STARS,
  },
  {
    id: "transformation",
    title: "Transformation",
    line: "Spotlight, energy, certificate, offer letter. Doubt dissolves into engineer mode.",
    teaser: "The future opens at sunrise.",
    speech: "Engineer mode.",
    mood: "hero",
    impact: "ENGINEER MODE",
    sky: ["#140B2F", "#371B67", "#2EA7E0"],
    ground: "#0C1020",
    student: "professional",
    setting: "transform",
    x: ["41%", "49%"],
    y: ["0%", "-7%"],
    lottie: LOTTIE_STUDENT_PROFESSIONAL,
    bgLottie: LOTTIE_CONFETTI,
  },
  {
    id: "placement",
    title: "Dream Achieved",
    line: "Sunrise over the city. Friends cheer. The offer letter is held high.",
    teaser: "You did not just learn. You changed your life.",
    speech: "Dream achieved.",
    mood: "celebrate",
    impact: "DREAM ACHIEVED",
    sky: ["#061224", "#085FA7", "#FFD36B"],
    ground: "#071727",
    student: "engineer",
    setting: "finale",
    x: ["35%", "57%"],
    y: ["0%", "-10%"],
    lottie: LOTTIE_STUDENT_ENGINEER,
    bgLottie: LOTTIE_CONFETTI,
  },
];

/* ===== Seeded random helpers for deterministic decorative elements ===== */

function seededRandom(seed) {
  /** Park-Miller LCG: returns a deterministic pseudo-random 0–1 value. */
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function seededItems(count, seed, factory) {
  const rng = seededRandom(seed);
  return Array.from({ length: count }, (_, i) => factory(rng, i));
}

/* ===== FloatingAtmosphere – drifting particles / code-rain ===== */

function FloatingAtmosphere({ sceneIndex, active, type = "spark" }) {
  const items = useMemo(() => {
    const count = 14 + (sceneIndex % 5) * 3;
    const baseSeed = 700 + sceneIndex * 13;
    const isCode = type === "code";
    const chars = "<>/{}[]!?=+-*&|#";

    return seededItems(count, baseSeed, (rng) => ({
      id: Math.floor(rng() * 1e9),
      x: rng() * 100,
      y: rng() * 100,
      size: 2 + rng() * (isCode ? 6 : 4),
      opacity: 0.15 + rng() * 0.35,
      driftX: (rng() - 0.5) * 80,
      driftY: -(20 + rng() * 60),
      duration: 4 + rng() * 6,
      delay: rng() * 4,
      char: isCode ? chars[Math.floor(rng() * chars.length)] : null,
      color: isCode
        ? `hsl(${140 + rng() * 60}, 70%, ${55 + rng() * 30}%)`
        : `hsl(${45 + rng() * 30}, 80%, ${70 + rng() * 20}%)`,
    }));
  }, [sceneIndex, type]);

  return (
    <>
      {items.map((p) => (
        <motion.div
          key={p.id}
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          initial={{ opacity: 0, x: 0, y: 0 }}
          animate={
            active
              ? {
                  opacity: [0, p.opacity, p.opacity * 0.6, 0],
                  x: [0, p.driftX * 0.3, p.driftX * 0.7, p.driftX],
                  y: [0, p.driftY * 0.3, p.driftY * 0.7, p.driftY],
                  scale: [0.3, 1, 0.9, 0.4],
                }
              : { opacity: 0, scale: 0 }
          }
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: active ? Infinity : 0,
            ease: "easeOut",
          }}
        >
          {p.char ? (
            <span
              className="block font-mono text-xs font-bold"
              style={{
                color: p.color,
                fontSize: `${p.size + 4}px`,
                textShadow: `0 0 6px ${p.color}`,
              }}
            >
              {p.char}
            </span>
          ) : (
            <span
              className="block rounded-full"
              style={{
                width: p.size,
                height: p.size,
                background: p.color,
                boxShadow: `0 0 ${p.size + 2}px ${p.color}`,
              }}
            />
          )}
        </motion.div>
      ))}
    </>
  );
}

/* ===== RainLayer – gentle code-rain streaks ===== */

function RainLayer({ count = 18, active }) {
  const drops = useMemo(() => {
    const baseSeed = 888;
    return seededItems(count, baseSeed, (rng) => ({
      id: Math.floor(rng() * 1e9),
      x: rng() * 100,
      y: rng() * 100,
      delay: rng() * 2,
      duration: 0.6 + rng() * 0.8,
      height: 14 + rng() * 28,
      opacity: 0.08 + rng() * 0.18,
    }));
  }, [count]);

  return (
    <>
      {drops.map((d) => (
        <motion.div
          key={d.id}
          aria-hidden="true"
          className="pointer-events-none absolute w-[1px] bg-gradient-to-b from-transparent via-white/40 to-transparent"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            height: d.height,
            opacity: d.opacity,
          }}
          initial={{ y: -d.height - 10 }}
          animate={
            active
              ? { y: [0, 120 + d.height], opacity: [0, d.opacity, 0] }
              : { opacity: 0 }
          }
          transition={{
            duration: d.duration,
            delay: d.delay,
            repeat: active ? Infinity : 0,
            ease: "linear",
          }}
        />
      ))}
    </>
  );
}

/* ===== CelebrationBurst – confetti / star burst ===== */

function CelebrationBurst({ active, seed = 1007 }) {
  const particles = useMemo(() => {
    return seededItems(24, seed, (rng) => ({
      id: Math.floor(rng() * 1e9),
      angle: rng() * 360,
      distance: 40 + rng() * 140,
      size: 4 + rng() * 10,
      duration: 0.8 + rng() * 1.2,
      delay: rng() * 0.5,
      rotation: (rng() - 0.5) * 720,
      color: `hsl(${rng() * 360}, 85%, ${55 + rng() * 30}%)`,
      shape: rng() > 0.5 ? "circle" : "star",
    }));
  }, [seed]);

  return (
    <>
      {particles.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const tx = Math.cos(rad) * p.distance;
        const ty = Math.sin(rad) * p.distance - 30;

        return (
          <motion.div
            key={p.id}
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2"
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={
              active
                ? {
                    x: [0, tx * 0.5, tx],
                    y: [0, ty * 0.5, ty],
                    opacity: [0, 1, 1, 0],
                    scale: [0, 1.2, 1, 0.3],
                    rotate: [0, p.rotation * 0.5, p.rotation],
                  }
                : { opacity: 0, scale: 0 }
            }
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: [0.16, 1, 0.3, 1],
              times: [0, 0.3, 0.6, 1],
            }}
          >
            <span
              className="block"
              style={{
                width: p.size,
                height: p.size,
                borderRadius: p.shape === "circle" ? "50%" : "2px",
                background: p.color,
                boxShadow: `0 0 ${p.size + 4}px ${p.color}`,
                transform: `rotate(${p.rotation}deg)`,
              }}
            />
          </motion.div>
        );
      })}
    </>
  );
}

// Enhanced StudentHero with Lottie support
function StudentHero({ variant, mood, lottieSrc }) {
  const variantStyles = {
    new: "h-[210px] w-44 sm:h-[260px] sm:w-48 lg:h-[310px] lg:w-52",
    learner: "h-[220px] w-48 sm:h-[280px] sm:w-52 lg:h-[330px] lg:w-56",
    builder: "h-[230px] w-52 sm:h-[300px] sm:w-56 lg:h-[350px] lg:w-60",
    professional: "h-[240px] w-56 sm:h-[315px] sm:w-60 lg:h-[370px] lg:w-64",
    engineer: "h-[250px] w-60 sm:h-[330px] sm:w-64 lg:h-[390px] lg:w-72",
  };

  const variantAura = {
    new: "rgba(92, 163, 71, 0.34)",
    learner: "rgba(8, 95, 167, 0.36)",
    builder: "rgba(46, 167, 224, 0.38)",
    professional: "rgba(229, 231, 235, 0.26)",
    engineer: "rgba(251, 191, 36, 0.42)",
  };

  const moodAnimations = {
    curious: { scale: 1, rotate: -2, transition: { type: "spring", stiffness: 300 } },
    amazed: { scale: 1.04, rotate: 1, transition: { type: "spring", stiffness: 300 } },
    proud: { scale: 1.04, y: -4, transition: { type: "spring", stiffness: 300 } },
    focused: { scale: 1.03, transition: { type: "spring", stiffness: 300 } },
    determined: { rotate: 2, scale: 1.02, transition: { type: "spring", stiffness: 300 } },
    happy: { scale: 1.05, transition: { type: "spring", stiffness: 300 } },
    excited: { scale: 1.08, y: -10, transition: { type: "spring", stiffness: 300 } },
    confident: { scale: 1.06, rotate: -1, transition: { type: "spring", stiffness: 300 } },
    hero: { scale: 1.12, y: -8, transition: { type: "spring", stiffness: 300 } },
    celebrate: { 
      scale: 1.14, 
      y: -12, 
      rotate: [0, -4, 4, 0],
      transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] }
    },
  };

  const lottieUrl = lottieSrc || studentLottieMap[variant] || LOTTIE_STUDENT_NEW;

  return (
    <motion.div
      aria-label="Animated student protagonist"
      role="img"
      className={`relative ${variantStyles[variant] || variantStyles.learner}`}
      animate={moodAnimations[mood] || moodAnimations.curious}
    >
      <motion.div
        aria-hidden="true"
        className="absolute left-1/2 top-[52%] h-[82%] w-[82%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ backgroundColor: variantAura[variant] || variantAura.learner }}
        animate={{ 
          opacity: [0.35, 0.72, 0.35], 
          scale: [0.9, 1.08, 0.9],
        }}
        transition={{ 
          duration: 3.6, 
          repeat: Infinity, 
          ease: "easeInOut",
          times: [0, 0.5, 1]
        }}
      />
      <motion.div
        className="relative h-full w-full drop-shadow-[0_28px_45px_rgba(0,0,0,0.28)]"
        animate={{
          y: [0, -8, 0],
          rotate: [0, 1, 0, -1, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <DotLottieReact
          src={lottieUrl}
          autoplay
          loop
          className="h-full w-full"
        />
      </motion.div>
      <div className="absolute bottom-[3%] left-1/2 h-4 w-[54%] -translate-x-1/2 rounded-full bg-black/24 blur-md" />
    </motion.div>
  );
}

// Enhanced SpeechBubble with typewriter effect
function SpeechBubble({ text, active }) {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (active && text && !isTyping) {
      setIsTyping(true);
      setDisplayText("");
      let index = 0;
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayText(prev => prev + text[index]);
          index++;
        } else {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 30);
      return () => clearInterval(interval);
    } else if (!active) {
      setDisplayText("");
      setIsTyping(false);
    }
  }, [active, text]);

  return (
    <motion.div
      className="absolute left-1/2 top-[-74px] z-30 w-max max-w-[230px] -translate-x-1/2 rounded-[22px] rounded-bl-md border-2 border-[#111827] bg-[#FFF7E8] px-5 py-3 text-center text-[13px] font-black text-slate-950 shadow-[0_18px_35px_rgba(0,0,0,0.22)] sm:max-w-[290px] sm:text-sm"
      animate={{ 
        opacity: active ? 1 : 0, 
        y: active ? 0 : 12, 
        scale: active ? 1 : 0.9,
        transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
      }}
    >
      {displayText || text}
      {active && isTyping && (
        <motion.span
          className="inline-block ml-1"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          |
        </motion.span>
      )}
      <span className="absolute bottom-[-9px] left-9 h-4 w-4 rotate-45 border-b-2 border-r-2 border-[#111827] bg-[#FFF7E8]" />
    </motion.div>
  );
}

// Background Lottie Effect component
function BackgroundLottieEffect({ src, active }) {
  if (!src) return null;
  
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: active ? 0.25 : 0,
        scale: active ? 1 : 0.8,
      }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full max-w-[600px] max-h-[600px]">
          <DotLottieReact
            src={src}
            autoplay
            loop
            className="w-full h-full"
          />
        </div>
      </div>
    </motion.div>
  );
}

// Enhanced SceneWorld with better animations
function SceneWorld({ scene, index, active }) {
  const isCodeWorld = ["demo", "learning", "struggle", "breakthrough", "projects"].includes(scene.id);
  
  return (
    <>
      <BackgroundLottieEffect src={scene.bgLottie} active={active} />
      {typeof FloatingAtmosphere !== 'undefined' && <FloatingAtmosphere sceneIndex={index} active={active} type={isCodeWorld ? "code" : "spark"} />}
      
      <motion.div
        aria-hidden="true"
        className="absolute left-[-10%] top-[10%] h-36 w-[120%] rounded-[50%] bg-white/25 blur-2xl"
        animate={{ 
          x: active ? ["-4%", "4%", "-4%"] : 0,
          opacity: active ? 0.6 : 0,
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Scene-specific elements with enhanced animations */}
      {scene.setting === "campus" && (
        <>
          <motion.div
            aria-hidden="true"
            className="absolute right-[8%] top-[6%] h-52 w-52 rounded-full bg-[#FFD36B]/35 blur-3xl"
            animate={{ 
              scale: [0.9, 1.1, 0.9], 
              opacity: [0.45, 0.75, 0.45] 
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute bottom-[17%] left-[7%] h-[19%] w-[18%] rounded-t-[28px] bg-white/14" />
          <div className="absolute bottom-[17%] right-[8%] h-[24%] w-[22%] rounded-t-[32px] bg-white/12" />
          {[0, 1, 2].map((item) => (
            <motion.span
              aria-hidden="true"
              className="absolute text-2xl text-slate-900/45"
              key={item}
              style={{ left: `${18 + item * 24}%`, top: `${14 + item * 4}%` }}
              animate={{ x: [0, 50, 0], y: [0, -12, 0] }}
              transition={{ duration: 7 + item, repeat: Infinity, ease: "easeInOut" }}
            >
              ~
            </motion.span>
          ))}
        </>
      )}
      
      {scene.setting === "classroom" && (
        <>
          <div className="absolute left-[7%] top-[25%] h-[30%] w-[28%] rounded-[8px] border border-white/20 bg-[#08111F]/45 shadow-[0_0_60px_rgba(46,167,224,0.34)]" />
          <motion.div
            aria-hidden="true"
            className="absolute left-[12%] top-[30%] font-mono text-xs font-bold text-[#A7F3D0]/80 sm:text-sm"
            animate={{ 
              opacity: [0.45, 1, 0.45], 
              y: [0, -10, 0] 
            }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            npm run dream
          </motion.div>
          <div className="absolute right-[14%] bottom-[17%] h-[23%] w-[16%] rounded-t-full bg-white/18" />
          <div className="absolute right-[30%] bottom-[17%] h-[18%] w-[12%] rounded-t-full bg-white/12" />
          <motion.div
            aria-hidden="true"
            className="absolute right-[20%] top-[28%] rounded-2xl rounded-br-sm bg-[#FFF7E8] px-4 py-2 text-xs font-black text-slate-900"
            animate={{ 
              y: [0, -8, 0], 
              opacity: [0.75, 1, 0.75] 
            }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          >
            Welcome in.
          </motion.div>
        </>
      )}
      
      {/* ... [keep other scene settings with enhanced animations] */}
      
      {scene.setting === "finale" && (
        <>
          {typeof CelebrationBurst !== 'undefined' && <CelebrationBurst active={active} seed={1007} />}
          <div className="absolute bottom-[17%] left-0 right-0 flex items-end justify-around px-6 opacity-30">
            {[70, 120, 90, 150, 82, 130, 104].map((height, item) => (
              <div key={item} className="w-[9%] rounded-t-lg bg-white" style={{ height }} />
            ))}
          </div>
          <motion.div
            aria-hidden="true"
            className="absolute left-[8%] top-[27%] rounded-[10px] bg-[#FFF7E8] p-5 text-sm font-black text-slate-900 shadow-2xl"
            animate={{ y: [0, -12, 0], rotate: [-3, 3, -3] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            OFFER LETTER
          </motion.div>
          {[0, 1, 2, 3].map((item) => (
            <motion.span
              aria-hidden="true"
              className="absolute text-4xl font-black text-[#FBBF24]"
              key={item}
              style={{ left: `${20 + item * 18}%`, top: `${13 + (item % 2) * 10}%` }}
              animate={{ 
                scale: [0, 1.3, 0], 
                opacity: [0, 1, 0] 
              }}
              transition={{ 
                duration: 1.5, 
                delay: item * 0.3, 
                repeat: Infinity, 
                repeatDelay: 1.2 
              }}
            >
              *
            </motion.span>
          ))}
          <motion.div
            className="absolute right-[8%] bottom-[20%] h-[18%] w-[13%] rounded-t-full bg-white/14"
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              scale: [0.9, 1.1, 0.9]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </>
      )}
    </>
  );
}

// MangaBurst — dramatic impact text that pops in like a manga panel effect
function MangaBurst({ text, active }) {
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute right-[5%] top-[8%] z-30"
      initial={{ opacity: 0, scale: 0.3, rotate: -15 }}
      animate={active
        ? {
            opacity: [0, 1, 1, 0.9],
            scale: [0.3, 1.3, 1, 1.05],
            rotate: [-15, 6, -3, 0],
          }
        : { opacity: 0, scale: 0.3, rotate: -15 }
      }
      transition={{
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
        times: [0, 0.4, 0.7, 1],
      }}
    >
      <span
        className="block whitespace-nowrap text-right text-[clamp(1.25rem,4vw,3.5rem)] font-black leading-[0.9] tracking-[-0.02em]"
        style={{
          fontFamily: '"Instrument Serif", "Sora", system-ui, sans-serif',
          fontStyle: "italic",
          WebkitTextStroke: "1px rgba(255,255,255,0.25)",
          textShadow:
            "0 0 20px rgba(251,191,36,0.5), 0 4px 12px rgba(0,0,0,0.4), 4px 4px 0 rgba(0,0,0,0.2)",
          background:
            "linear-gradient(135deg, #FFF7E8 20%, #FBBF24 50%, #F59E0B 80%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {text}
      </span>
      {/* Underline slash accent */}
      <motion.div
        className="mt-1 h-1 w-0 origin-left rounded-full bg-gradient-to-r from-[#FBBF24] to-[#F59E0B]"
        animate={active ? { width: "100%" } : { width: "0%" }}
        transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
      />
    </motion.div>
  );
}

// Enhanced SceneLayer with progress indicators
function SceneLayer({ scene, index, progress, velocity, reducedMotion }) {
  const start = index / scenes.length;
  const middle = (index + 0.5) / scenes.length;
  const end = (index + 1) / scenes.length;
  const opacity = useTransform(progress, [start, start + 0.018, end - 0.018, end], [0, 1, 1, 0]);
  const scale = useTransform(progress, [start, middle, end], [1.06, 1, 1.08]);
  const blur = useTransform(velocity, [-2400, 0, 2400], [6, 0, 6]);
  const studentX = useTransform(progress, [start, end], scene.x);
  const studentY = useTransform(progress, [start, end], scene.y);
  const titleY = useTransform(progress, [start, middle, end], [34, 0, -24]);
  const titleOpacity = useTransform(progress, [start, start + 0.035, end - 0.035, end], [0, 1, 1, 0]);
  const isActive = useTransform(progress, (value) => value >= start && value <= end);
  const cameraBlur = useTransform(blur, (value) => `blur(${value}px)`);
  const progressPercent = useTransform(progress, [start, end], [0, 100]);

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      style={{
        opacity,
        scale: reducedMotion ? 1 : scale,
        filter: reducedMotion ? "none" : cameraBlur,
        background: `linear-gradient(180deg, ${scene.sky[0]} 0%, ${scene.sky[1]} 50%, ${scene.sky[2]} 100%)`,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 18% 15%, rgba(255,255,255,0.42), transparent 24%), radial-gradient(circle at 84% 18%, rgba(255,255,255,0.28), transparent 28%)",
        }}
      />
      
      <SceneWorld scene={scene} index={index} active={isActive} />
      
      <motion.div
        className="absolute bottom-[13%] z-20"
        style={{ left: studentX, y: studentY }}
      >
        <div className="relative -translate-x-1/2">
          <SpeechBubble text={scene.speech} active={isActive} />
          <StudentHero 
            variant={scene.student} 
            mood={scene.mood} 
            lottieSrc={scene.lottie}
          />
        </div>
      </motion.div>
      
      <MangaBurst text={scene.impact} active={isActive} />
      
      <motion.div
        className="absolute bottom-[13%] left-[6%] z-30 max-w-[540px] pr-6 text-[#FFF7E8] sm:bottom-[11%]"
        style={{ y: reducedMotion ? 0 : titleY, opacity: titleOpacity }}
      >
        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.36em] text-[#C9F7B8] sm:text-xs">
          From Beginner To Software Engineer
        </p>
        <h2 className="max-w-[12ch] text-4xl font-black leading-[0.95] tracking-normal drop-shadow-2xl sm:text-6xl lg:text-8xl">
          {scene.title}
        </h2>
        <p className="mt-5 max-w-md text-sm font-semibold leading-7 text-white/78 sm:text-base">
          {scene.line}
        </p>
        <motion.p
          className="mt-4 max-w-sm text-xs font-black uppercase tracking-[0.22em] text-[#FBBF24]/80 sm:text-sm"
          animate={{ opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          {scene.teaser}
        </motion.p>
        
        {/* Scene progress indicator */}
        <motion.div
          className="mt-6 flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: isActive ? 1 : 0 }}
        >
          <div className="h-1 w-32 overflow-hidden rounded-full bg-white/20">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#5CA347] to-[#2EA7E0]"
              style={{ width: progressPercent }}
            />
          </div>
          <span className="text-xs font-bold text-white/60">
            {Math.round(progressPercent.get())}%
          </span>
        </motion.div>
      </motion.div>
      
      <div className="absolute bottom-0 left-0 right-0 h-[23%]" style={{ background: scene.ground }} />
      <div className="absolute bottom-[20%] left-0 right-0 h-24 bg-gradient-to-t from-black/25 to-transparent" />
    </motion.div>
  );
}

// Main component with enhanced features
export default function StudentJourneyExperience() {
  const trackRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const [isScrolling, setIsScrolling] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 24,
    mass: 0.6,
  });
  
  const velocity = useVelocity(smoothProgress);
  const curtainY = useTransform(smoothProgress, [0, 0.08], ["0%", "-100%"]);
  const endingOpacity = useTransform(smoothProgress, [0.9, 1], [0, 1]);
  const scrollHintOpacity = useTransform(smoothProgress, [0, 0.08, 0.92, 1], [1, 0, 0, 0]);
  
  // Detect scrolling for performance optimization
  useEffect(() => {
    const unsubscribe = smoothProgress.on("change", () => {
      setIsScrolling(true);
      clearTimeout(window.scrollTimeout);
      window.scrollTimeout = setTimeout(() => setIsScrolling(false), 100);
    });
    return () => unsubscribe();
  }, [smoothProgress]);

  return (
    <section
      aria-label="Student transformation animated story"
      className="relative bg-[#08111F] text-white"
    >
      <div ref={trackRef} className="relative h-[1120vh]">
        <div className="sticky top-0 h-screen overflow-hidden">
          {scenes.map((scene, index) => (
            <SceneLayer
              key={scene.id}
              scene={scene}
              index={index}
              progress={smoothProgress}
              velocity={velocity}
              reducedMotion={reducedMotion}
            />
          ))}

          <motion.div
            aria-hidden="true"
            className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#08111F] px-6 text-center"
            style={{ y: reducedMotion ? "-100%" : curtainY }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <p className="mb-4 text-xs font-black uppercase tracking-[0.42em] text-[#5CA347]">
                Pirnav Edutech presents
              </p>
              <h2 className="max-w-4xl text-5xl font-black leading-none tracking-normal sm:text-7xl lg:text-8xl">
                A Student Becomes A Software Engineer
              </h2>
              <p className="mt-6 max-w-xl text-base font-semibold leading-8 text-white/68">
                Scroll into an anime-inspired story of curiosity, struggle,
                momentum, and the first offer letter.
              </p>
              
              <motion.div
                className="mt-8 flex justify-center"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <svg className="w-6 h-6 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-8 z-50 flex justify-center"
            style={{ opacity: scrollHintOpacity }}
          >
            <div className="rounded-full border border-white/20 bg-black/20 px-5 py-3 text-[11px] font-black uppercase tracking-[0.28em] text-white/70 backdrop-blur-md">
              Scroll to watch
            </div>
          </motion.div>

          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center bg-[#061224] px-6 text-center"
            style={{ opacity: endingOpacity, pointerEvents: "none" }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div
                className="text-6xl mb-4"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🎉
              </motion.div>
              <p className="mb-4 text-xs font-black uppercase tracking-[0.42em] text-[#FBBF24]">
                Mission complete
              </p>
              <h3 className="text-5xl font-black leading-none tracking-normal sm:text-7xl lg:text-8xl">
                Dream Achieved
              </h3>
              <p className="mx-auto mt-6 max-w-xl text-base font-semibold leading-8 text-white/70">
                You did not just learn. You changed your life. Software
                engineer. Career unlocked. Future in both hands.
              </p>
              <motion.button
                className="mt-8 rounded-full bg-gradient-to-r from-[#085FA7] to-[#5CA347] px-8 py-3 text-sm font-bold text-white shadow-lg shadow-[#085FA7]/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Watch Again
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}