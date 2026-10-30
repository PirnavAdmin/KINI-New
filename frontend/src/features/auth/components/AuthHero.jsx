import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, Globe2, GraduationCap, Pencil, Sparkles } from "lucide-react";
import hoodieKid from "@/assets/auth/kini-hoodie-kid.png";
const KiniLogo = "/assets/new-logo-f.jpg.jpeg";

const orbitItems = [
  { Icon: BookOpen, className: "left-[4%] top-[12%] text-violet-200", delay: 0 },
  { Icon: GraduationCap, className: "right-[9%] top-[13%] text-cyan-300", delay: 0.5 },
  { Icon: Globe2, className: "right-[8%] top-[45%] text-indigo-300", delay: 1 },
  { Icon: Pencil, className: "right-[13%] bottom-[24%] text-amber-300", delay: 1.5 },
];

export default function AuthHero() {
  const reduceMotion = useReducedMotion();
  const [videoReady, setVideoReady] = useState(false);

  return (
    <section className="relative h-full min-h-0 overflow-hidden bg-[radial-gradient(circle_at_52%_35%,#18277c_0%,#0b1553_43%,#070b35_100%)] text-white">
      <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_center,rgba(82,209,255,.8)_1px,transparent_1.5px)] [background-size:68px_68px]" />
      <div className="absolute -left-20 bottom-8 h-72 w-72 rounded-full bg-violet-600/25 blur-[80px]" />
      <div className="absolute right-4 top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-[70px]" />

      <motion.div
        className="absolute left-[3%] top-[40%] h-[28%] w-[84%] rounded-[50%] border-[3px] border-blue-500/70 shadow-[0_0_18px_#2563eb,0_0_45px_rgba(37,99,235,.55)]"
        style={{ rotate: -11 }}
        animate={reduceMotion ? undefined : { rotate: [-11, -7, -11], scale: [1, 1.03, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      {orbitItems.map(({ Icon, className, delay }) => (
        <motion.div
          key={className}
          className={`absolute z-10 grid h-14 w-14 place-items-center rounded-2xl border border-blue-300/20 bg-indigo-500/15 shadow-[0_0_25px_rgba(56,189,248,.25)] backdrop-blur-sm ${className}`}
          animate={reduceMotion ? undefined : { y: [0, -10, 0], rotate: [-4, 5, -4] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay }}
        >
          <Icon size={29} strokeWidth={1.8} aria-hidden="true" />
        </motion.div>
      ))}

      {["left-[10%] top-[29%]", "right-[17%] top-[31%]", "left-[4%] top-[48%]"].map((position, i) => (
        <motion.span key={position} className={`absolute z-10 text-cyan-300 ${position}`} animate={reduceMotion ? undefined : { scale: [0.7, 1.25, 0.7], opacity: [0.45, 1, 0.45] }} transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.45 }}>
          <Sparkles size={16} fill="currentColor" />
        </motion.span>
      ))}

      <motion.div
        className="absolute bottom-[4%] right-[10%] z-20 h-[84%] max-w-[82%]"
        initial={reduceMotion ? false : { x: -90, opacity: 0, scale: 0.92 }}
        animate={reduceMotion ? undefined : { x: 0, y: [0, -5, 0], opacity: 1, scale: 1 }}
        transition={{ x: { duration: 0.75, ease: "easeOut" }, opacity: { duration: 0.75 }, scale: { duration: 0.75 }, y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
      >
        <img
          src={hoodieKid}
          alt="A cheerful young learner waving hello"
          className={`h-full w-auto object-contain object-bottom drop-shadow-[0_24px_30px_rgba(0,0,0,.42)] transition-opacity duration-200 ${videoReady ? "opacity-0" : "opacity-100"}`}
        />
        {!reduceMotion && (
          <video
            autoPlay
            muted
            loop
            playsInline
            disablePictureInPicture
            disableRemotePlayback
            controlsList="nodownload noplaybackrate noremoteplayback"
            preload="auto"
            aria-label="Young learner waving hello"
            onCanPlay={() => setVideoReady(true)}
            onError={() => setVideoReady(false)}
            className={`pointer-events-none absolute inset-0 h-full w-auto select-none object-contain object-bottom drop-shadow-[0_24px_30px_rgba(0,0,0,.42)] transition-opacity duration-200 ${videoReady ? "opacity-100" : "opacity-0"}`}
          >
            <source src="/assets/login-welcome.webm" type="video/webm" />
          </video>
        )}
      </motion.div>

      <motion.div
        className="absolute right-[4%] top-[32%] z-30 hidden rounded-xl border border-cyan-200/25 bg-indigo-400/15 px-3 py-2 text-right shadow-[0_0_18px_rgba(34,211,238,.16)] backdrop-blur-md xl:block"
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8 }}
      >
        <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-cyan-300">Hello!</p>
        <p className="mt-0.5 text-xs font-bold text-white">Welcome back 👋</p>
      </motion.div>

      <motion.div
        className="absolute bottom-[12%] left-[4%] z-30 max-w-[50%]"
        initial={reduceMotion ? false : { opacity: 0, x: -18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <div className="pointer-events-none absolute -inset-x-8 -inset-y-5 -z-10 rounded-full bg-blue-500/15 blur-3xl" />
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-blue-200/75 sm:text-[10px]">
          Welcome to
        </p>
        <div className="mt-2 flex items-center gap-3">
          <div className="brand-logo-viewport flex h-12 w-[150px] shrink-0 items-center justify-center sm:h-14 sm:w-[180px]" role="img" aria-label="Kini logo">
            <img
              src={KiniLogo}
              alt=""
              aria-hidden="true"
              className="brand-logo-image"
            />
          </div>
        </div>
        <p className="mt-2.5 text-xs font-semibold tracking-wide text-blue-100/90 sm:text-sm">
          Enterprise Learning Platform
        </p>
        <div className="mt-2.5 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.13em] text-cyan-100/60 sm:text-[10px]">
          <span>Learn</span><span className="h-1 w-1 rounded-full bg-cyan-300/60" />
          <span>Practice</span><span className="h-1 w-1 rounded-full bg-cyan-300/60" />
          <span>Get Certified</span>
        </div>
      </motion.div>

      <div className="absolute bottom-[3%] left-[4%] z-30 hidden items-center gap-3 rounded-full border border-indigo-300/25 bg-indigo-500/20 px-4 py-2 shadow-lg backdrop-blur-md sm:flex">
        <div className="flex -space-x-2">
          {["K", "E", "H"].map((letter, i) => <span key={letter} className={`grid h-7 w-7 place-items-center rounded-full border-2 border-[#16206a] text-[9px] font-bold ${["bg-cyan-300 text-blue-950", "bg-amber-300 text-amber-950", "bg-violet-300 text-violet-950"][i]}`}>{letter}</span>)}
        </div>
        <div><p className="text-[10px] font-bold">Join 50,000+ learners</p><p className="text-[9px] text-amber-300">★★★★★ <span className="ml-1 text-blue-100">4.9/5</span></p></div>
      </div>
    </section>
  );
}
