import { motion } from "framer-motion";
import { FaUsers, FaUserGraduate, FaBriefcase } from "react-icons/fa";

export default function AlumniHero() {
  return (
    <section className="relative overflow-hidden bg-[#F8FAFC] pt-24 sm:pt-28 pb-20">
      {/* Ambient brand glow layers */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#085FA7]/[0.06] blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#5CA347]/[0.05] blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle_at_center,rgba(8,95,167,0.03),transparent_70%)]" />
      </div>

      {/* Subtle grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(8,95,167,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(8,95,167,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />

      {/* Floating shapes */}
      <motion.div
        animate={{ y: [0, -12, 0], rotate: [-2, 1, -2] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute left-8 top-40 hidden rounded-2xl border border-[#085FA7]/10 bg-white/80 px-5 py-4 shadow-[0_18px_45px_rgba(8,95,167,0.08)] backdrop-blur lg:block"
      >
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Global Network</p>
        <p className="mt-1 text-lg font-black text-[#0F172A]">120+ Countries</p>
      </motion.div>
      <motion.div
        animate={{ y: [0, 14, 0], rotate: [2, -1, 2] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute right-8 top-52 hidden rounded-2xl border border-[#5CA347]/10 bg-white/80 px-5 py-4 shadow-[0_18px_45px_rgba(92,163,71,0.10)] backdrop-blur lg:block"
      >
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Mentorship</p>
        <p className="mt-1 text-lg font-black text-[#0F172A]">3,500+ Mentors</p>
      </motion.div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mx-auto max-w-[820px] text-center"
        >
          {/* Badge */}
          <span className="inline-flex items-center gap-2 rounded-full border border-[#085FA7]/20 bg-[#EDF4FC] px-4 py-2 text-xs font-bold text-[#085FA7] shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#085FA7] animate-pulse" />
            Alumni Network
          </span>

          <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-[-0.04em] text-[#0F172A] sm:text-5xl lg:text-6xl">
            Stay Connected{" "}
            <span className="bg-gradient-to-r from-[#085FA7] via-[#1A7ACA] to-[#5CA347] bg-clip-text text-transparent">
              Beyond Graduation
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-[620px] text-base leading-7 text-[#64748B] sm:text-lg">
            Join a thriving network of professionals, mentors, founders and innovators.
            Your journey doesn't end at graduation — it evolves.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <button className="inline-flex min-w-[190px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#085FA7] to-[#5CA347] px-6 py-3.5 text-sm font-bold text-white shadow-[0_18px_35px_rgba(8,95,167,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_40px_rgba(8,95,167,0.35)] cursor-pointer">
              <FaUsers className="w-4 h-4" /> Join Alumni Network
            </button>
            <button className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-xl border-2 border-[#085FA7]/30 bg-white px-6 py-3.5 text-sm font-bold text-[#085FA7] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#EDF4FC] hover:border-[#085FA7]/50 cursor-pointer">
              <FaUserGraduate className="w-4 h-4" /> Become a Mentor
            </button>
            <a href="#opportunities" className="inline-flex min-w-[190px] items-center justify-center gap-2 rounded-xl border-2 border-[#5CA347]/30 bg-white px-6 py-3.5 text-sm font-bold text-[#5CA347] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#EFF8ED] hover:border-[#5CA347]/50">
              <FaBriefcase className="w-4 h-4" /> Explore Opportunities
            </a>
          </div>

          <p className="mt-4 text-sm font-medium text-[#94A3B8]">
            Free for all KiniEduHub graduates | 50,000+ members and growing
          </p>
        </motion.div>
      </div>
    </section>
  );
}
