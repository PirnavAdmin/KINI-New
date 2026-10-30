import { memo } from "react";
import { motion } from "framer-motion";
import { FaUsers, FaCalendarAlt, FaUserGraduate, FaArrowRight } from "react-icons/fa";

const CTASection = memo(function CTASection() {
  return (
    <section className="relative overflow-hidden py-12 md:py-16 lg:py-20 text-center">
      <div className="absolute inset-0 bg-gradient-to-br from-[#085FA7] via-[#1A7ACA] to-[#5CA347]" />
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle_at_center,rgba(125,211,178,0.12),transparent_70%)]" />
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Reconnect.{" "}
            <span className="text-[#7DD3B2]">Collaborate.</span>{" "}
            Grow Together.
          </h2>

          <p className="mt-4 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
            Your network is your net worth. Join 50,000+ alumni who are already
            mentoring, hiring, and building the future together.
          </p>

          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <button className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-[#085FA7] text-sm font-semibold shadow-xl hover:shadow-2xl hover:bg-white/90 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
              <FaUsers className="w-4 h-4" /> Join Community
            </button>
            <button className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border-2 border-white/50 text-white text-sm font-semibold hover:bg-white/10 hover:border-white transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
              <FaCalendarAlt className="w-4 h-4" /> Explore Events
            </button>
            <button className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border-2 border-white/50 text-white text-sm font-semibold hover:bg-white/10 hover:border-white transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
              <FaUserGraduate className="w-4 h-4" /> Become Mentor
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

export default CTASection;
