import { motion } from "framer-motion";
import { GraduationCap, Trophy, BarChart2, BookOpen, Star } from "lucide-react";

export default function LoginHero() {
  const heroVariants = {
    hidden: { x: -80, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 45, damping: 15 },
    },
  };

  const floatEffect = (delay = 0) => ({
    animate: {
      y: [0, -12, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay,
      },
    },
  });

  return (
    <motion.div
      variants={heroVariants}
      initial="hidden"
      animate="visible"
      className="relative flex h-full min-h-[600px] w-full select-none flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0D0B2B] to-[#24175F] p-8 text-white md:min-h-screen md:p-12"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(15,85,247,0.24),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(6,182,168,0.16),transparent_50%)]" />

      <div className="z-10 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-secondary shadow-lg shadow-primary/30">
          <GraduationCap className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Kini Edu Tech</h1>
          <p className="text-xs tracking-wider text-blue-100/60">
            Learn Today, Lead Tomorrow
          </p>
        </div>
      </div>

      <div className="z-10 my-auto py-6">
        <h2 className="max-w-md text-3xl font-extrabold leading-tight tracking-tight md:text-4xl lg:text-5xl">
          Your Path to <br />
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Knowledge
          </span>{" "}
          &{" "}
          <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-200 bg-clip-text text-transparent">
            Success
          </span>
        </h2>
        <p className="mt-4 max-w-sm text-sm font-light leading-relaxed text-blue-100/70 md:text-base">
          Premium learning experiences designed to help you achieve your goals and unlock your true potential.
        </p>

        <div className="relative mt-10 flex h-72 w-full items-center justify-center md:h-88">
          <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-40" xmlns="http://www.w3.org/2000/svg">
            <motion.path
              d="M 40 160 Q 130 50 240 90 T 360 200"
              fill="none"
              stroke="url(#svg-gradient)"
              strokeWidth="2"
              strokeDasharray="4 6"
              initial={{ strokeDashoffset: 0 }}
              animate={{ strokeDashoffset: -40 }}
              transition={{ repeat: Infinity, ease: "linear", duration: 5 }}
            />
            <defs>
              <linearGradient id="svg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0f55f7" />
                <stop offset="100%" stopColor="#06b6a8" />
              </linearGradient>
            </defs>
          </svg>

          <motion.div {...floatEffect(0)} className="absolute left-8 top-2 rounded-2xl border border-white/20 bg-white/10 p-3 text-blue-200 shadow-xl backdrop-blur-md">
            <Trophy className="h-5 w-5" />
          </motion.div>
          <motion.div {...floatEffect(0.6)} className="absolute right-10 top-10 rounded-2xl border border-white/20 bg-white/10 p-3 text-secondary-200 shadow-xl backdrop-blur-md">
            <BarChart2 className="h-5 w-5" />
          </motion.div>
          <motion.div {...floatEffect(1.2)} className="absolute bottom-6 right-16 rounded-2xl border border-white/20 bg-white/10 p-3 text-amber-300 shadow-xl backdrop-blur-md">
            <BookOpen className="h-5 w-5" />
          </motion.div>

          <div className="pointer-events-none absolute h-52 w-52 rounded-full bg-gradient-to-tr from-primary/20 to-secondary/20 blur-2xl md:h-60 md:w-60" />
          <img
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=600"
            alt="Kini Edu Tech students"
            className="relative h-48 w-48 rounded-3xl border border-white/10 object-cover shadow-2xl transition-transform duration-500 hover:scale-[1.03] md:h-56 md:w-56"
          />
        </div>
      </div>

      <motion.div
        whileHover={{ y: -4 }}
        className="z-10 mt-auto flex max-w-sm items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur-lg"
      >
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-blue-100/80">
            Join 50,000+ students already learning with us
          </span>
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
            ))}
            <span className="ml-1.5 text-xs font-bold text-white/90">
              5.0 rating
            </span>
          </div>
        </div>
        <div className="flex -space-x-2.5 overflow-hidden">
          <img className="inline-block h-8 w-8 rounded-full object-cover ring-2 ring-[#0D0B2B]" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" alt="User avatar" />
          <img className="inline-block h-8 w-8 rounded-full object-cover ring-2 ring-[#0D0B2B]" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" alt="User avatar" />
          <img className="inline-block h-8 w-8 rounded-full object-cover ring-2 ring-[#0D0B2B]" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100" alt="User avatar" />
        </div>
      </motion.div>
    </motion.div>
  );
}
