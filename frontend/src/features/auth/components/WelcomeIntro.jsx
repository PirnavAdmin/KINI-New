import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { GraduationCap, Sparkles } from "lucide-react";

export default function WelcomeIntro({ onComplete }) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return undefined;
    const fallbackTimer = window.setTimeout(onComplete, 6200);
    return () => window.clearTimeout(fallbackTimer);
  }, [onComplete, reduceMotion]);

  if (reduceMotion) {
    return (
      <div className="fixed inset-0 z-[100] overflow-hidden opacity-0 pointer-events-none">
        <div
          tabIndex={0}
          className="absolute right-5 top-5 h-10 w-24 rounded-full"
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_42%,#193c96_0%,#101c65_35%,#090d3c_72%,#050724_100%)] text-white"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.035, filter: "blur(8px)" }}
      transition={{ duration: 0.75, ease: "easeInOut" }}
      role="dialog"
      aria-label="Welcome to Kini Edx Hub"
    >
      <div className="absolute inset-0 opacity-45 [background-image:radial-gradient(circle_at_center,rgba(103,232,249,.75)_1px,transparent_1.5px)] [background-size:64px_64px]" />
      <motion.div className="absolute h-[52vmin] w-[82vmin] rounded-[50%] border-[3px] border-blue-500/65 shadow-[0_0_22px_#2563eb,0_0_65px_rgba(37,99,235,.6)]" animate={{ rotate: [0, 360] }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }} />
      <div className="absolute left-[8%] top-[12%] rounded-2xl border border-white/15 bg-white/10 p-4 text-violet-200 shadow-xl backdrop-blur-md"><GraduationCap size={34} /></div>
      <motion.div className="absolute right-[12%] top-[18%] text-cyan-300" animate={{ scale: [0.7, 1.3, 0.7], rotate: [0, 18, 0] }} transition={{ duration: 2.2, repeat: Infinity }}><Sparkles size={32} fill="currentColor" /></motion.div>

      <motion.video
        autoPlay
        muted
        playsInline
        disablePictureInPicture
        disableRemotePlayback
        controlsList="nodownload noplaybackrate noremoteplayback"
        preload="auto"
        onEnded={onComplete}
        className="pointer-events-none absolute bottom-0 left-1/2 h-[88vh] max-h-[900px] -translate-x-1/2 select-none object-contain drop-shadow-[0_28px_36px_rgba(0,0,0,.42)]"
        initial={{ x: "-62%", opacity: 0, scale: 0.93 }}
        animate={{ x: "-50%", opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <source src="/assets/login-welcome.webm" type="video/webm" />
      </motion.video>

      <motion.div
        className="absolute right-[5%] top-[16%] w-[min(440px,86vw)] rounded-[32px] border border-cyan-200/35 bg-white/12 px-7 py-6 shadow-[0_0_42px_rgba(34,211,238,.34)] backdrop-blur-xl sm:top-[31%] sm:w-[min(440px,40vw)] sm:px-9 sm:py-7"
        initial={{ opacity: 0, y: 18, scale: 0.88 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 1.35, type: "spring", stiffness: 130, damping: 16 }}
      >
        <span className="absolute -left-3 bottom-7 h-6 w-6 rotate-45 border-b border-l border-cyan-200/30 bg-[#253e89]/85" />
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-cyan-300">Hello there!</p>
        <h1 className="mt-2 text-3xl font-black leading-[1.12] sm:text-4xl lg:text-5xl">Welcome to<br /><span className="text-cyan-300">Kini Edx Hub!</span></h1>
      </motion.div>

      <motion.div className="absolute bottom-7 left-1/2 -translate-x-1/2 text-center" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 3.2, duration: 0.6 }}>
        <p className="text-2xl font-black tracking-tight">Kini <span className="text-cyan-300">Edx</span> Hub</p>
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-blue-200">Learn · Grow · Excel</p>
      </motion.div>

      <button type="button" onClick={onComplete} className="absolute right-5 top-5 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-blue-100 backdrop-blur-md transition hover:bg-white/20">Skip intro</button>
    </motion.div>
  );
}
