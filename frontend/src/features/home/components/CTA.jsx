import { memo } from "react";
import { motion } from "framer-motion";
import { FaArrowRight, FaPlay } from "react-icons/fa";

const CTA = memo(function CTA({ onOpenEnquiry }) {
  return (
    <section className="relative overflow-hidden py-8 md:py-10 lg:py-12 text-center">
      <div className="absolute inset-0 bg-gradient-to-br from-[#085FA7] via-[#1A7ACA] to-[#5CA347]" />
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle_at_center,rgba(125,211,178,0.12),transparent_70%)]" />
        </div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/30 text-white text-xs font-semibold backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Next cohort starts in 11 days · Only 14 seats remaining
          </div>

          <h2 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Your next role is{" "}
            <span className="text-[#7DD3B2]">closer than you think.</span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-white/80 max-w-xl mx-auto">
            20,000+ engineers made the decision. Most wish they'd done it sooner.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <motion.button
              onClick={onOpenEnquiry}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#085FA7] text-sm font-semibold shadow-xl hover:shadow-2xl hover:bg-white/90 transition-all duration-300 cursor-pointer"
            >
              Book Free Consultation
              <FaArrowRight className="text-xs" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-white/60 text-white text-sm font-semibold hover:bg-white/10 hover:border-white transition-all duration-300"
            >
              <FaPlay className="text-xs" />
              Watch Free Class
            </motion.button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-white/60">
            <span>✓ 7-day refund policy</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span>✓ EMI from ₹2,499/month</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span>✓ Zero-cost financing</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

export default CTA;
