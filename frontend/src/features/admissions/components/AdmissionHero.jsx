
import { motion } from "framer-motion";
import { FiArrowRight, FiPhoneCall, FiPlayCircle, FiUsers, FiAward, FiPieChart, FiStar } from "react-icons/fi";

export default function AdmissionHero() {
  const stats = [
    { icon: <FiUsers className="text-blue-400" />, count: "50,000+", label: "Students Trained" },
    { icon: <FiPieChart className="text-purple-400" />, count: "500+", label: "Hiring Partners" },
    { icon: <FiAward className="text-emerald-400" />, count: "95%", label: "Placement Rate" },
    { icon: <FiStar className="text-amber-400" />, count: "4.9", label: "Student Rating" },
  ];

  return (
    <section className="max-w-[1400px] mx-auto px-4 lg:px-8 pt-2 md:pt-6 lg:pt-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      {/* Left Column Content */}
      <div className="lg:col-span-7 flex flex-col justify-center space-y-6 text-left">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center self-start gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm font-semibold tracking-wide backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.15)]"
        >
          <span className="flex h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
          Admissions Open 2026
        </motion.div>

        <motion.h1
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.1 }}
  className="font-outfit text-3xl md:text-4xl xl:text-5xl font-black tracking-tight text-white leading-[1.15]"
>
  Build Your Future With{" "}
  <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
    Industry-Led Certification
  </span>{" "}
  Programs
</motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-slate-400 text-lg md:text-xl max-w-2xl leading-relaxed font-normal"
        >
          Learn from elite experts, build robust real-world production projects, earn globally recognized certifications, and exponentially accelerate your career trajectory.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap gap-4 pt-2"
        >
          <button className="group relative flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all duration-300 transform active:scale-95 shadow-lg shadow-purple-500/25">
            Apply Now
            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>

          <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-800/60 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700 hover:bg-slate-800 hover:text-white transition-all duration-200 active:scale-95 backdrop-blur-md">
            <FiPhoneCall className="text-blue-400 text-sm" />
            Talk To Counselor
          </button>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-slate-800/80"
        >
          {stats.map((stat, i) => (
            <div key={i} className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                {stat.icon}
                <span className="text-xs font-medium tracking-wider uppercase text-slate-500">{stat.label.split(" ")[0]}</span>
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">{stat.count}</div>
              <div className="text-xs text-slate-400 font-medium">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right Column Visuals */}
      <div className="lg:col-span-5 relative flex items-center justify-center min-h-[450px] lg:min-h-[550px] lg:-translate-y-8">
        {/* Animated Radial Rings */}
        <div className="absolute w-[350px] sm:w-[450px] h-[350px] sm:h-[450px] rounded-full border border-blue-500/20 animate-[spin_40s_linear_infinite]" />
        <div className="absolute w-[280px] sm:w-[360px] h-[280px] sm:h-[360px] rounded-full border border-dashed border-purple-500/20 animate-[spin_20s_linear_infinite_reverse]" />
        <div className="absolute w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

        {/* Hero Student Placeholder Avatar Area */}
        <div className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-full overflow-hidden border-2 border-slate-700/50 shadow-2xl bg-gradient-to-b from-slate-800 via-slate-900 to-[#030B24] flex items-center justify-center group">

          {/* Overlay Glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 opacity-60 mix-blend-overlay z-10" />

          {/* Image */}
          <img
            src="https://i.pinimg.com/736x/e9/3a/09/e93a0996a2d838b7a5dac7eada0117f5.jpg"
            alt="Student"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

        </div>

        {/* Floating Badges */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="absolute top-12 left-2 sm:-left-4 flex items-center gap-3 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/90 shadow-xl backdrop-blur-md"
        >
          <div className="p-2 bg-blue-500/20 rounded-lg"><FiPlayCircle className="text-blue-400 w-5 h-5" /></div>
          <div>
            <div className="text-xs text-slate-400">Classes</div>
            <div className="text-sm font-bold text-white">Live Interactive</div>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ repeat: Infinity, duration: 4, delay: 0.5, ease: "easeInOut" }}
          className="absolute top-1/2 -right-2 sm:-right-8 flex items-center gap-3 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/90 shadow-xl backdrop-blur-md"
        >
          <div className="p-2 bg-purple-500/20 rounded-lg"><FiUsers className="text-purple-400 w-5 h-5" /></div>
          <div>
            <div className="text-xs text-slate-400">Mentorship</div>
            <div className="text-sm font-bold text-white">Industry Experts</div>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4, delay: 1, ease: "easeInOut" }}
          className="absolute bottom-8 left-6 flex items-center gap-3 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/90 shadow-xl backdrop-blur-md"
        >
          <div className="p-2 bg-emerald-500/20 rounded-lg"><FiAward className="text-emerald-400 w-5 h-5" /></div>
          <div>
            <div className="text-xs text-slate-400">Career</div>
            <div className="text-sm font-bold text-white">Placement Support</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}