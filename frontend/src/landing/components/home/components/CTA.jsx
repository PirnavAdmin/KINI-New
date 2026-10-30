import { memo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { Check } from "lucide-react";

// Toggle this to show/hide the whole CTA section without touching the JSX below.
const CTA_ENABLED = false;

const TRUST_POINTS = ["7-day refund policy", "EMI from ₹2,499/month", "Zero-cost financing"];

// Intentionally theme-independent (like the Footer): this is a single
// bold, high-contrast brand-gradient band, not a neutral content
// surface, so it doesn't need a dark-mode variant.
const CTA = memo(function CTA({ onOpenEnquiry }) {
  if (!CTA_ENABLED) return null;

  return (
    <section className="relative overflow-hidden py-16 text-center md:py-20">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-primary-400 to-secondary-500" />
      <div className="absolute inset-0 bg-black/10" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 h-full w-full">
          <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(125,211,178,0.12),transparent_70%)]" />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }}>
          <div className="inline-flex items-center gap-2 rounded-pill border border-white/30 bg-white/15 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            Enrolling now for the next cohort
          </div>

          <h2 className="mt-6 font-display text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            Your next role is <span className="text-secondary-200">closer than you think.</span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-base text-white/80 sm:text-lg">
            20,000+ engineers made the decision. Most wish they&apos;d done it sooner.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <motion.button
              type="button"
              onClick={onOpenEnquiry}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex cursor-pointer items-center gap-2 rounded-pill bg-white px-6 py-3 text-sm font-semibold text-primary-600 shadow-xl transition-all duration-300 hover:bg-white/90 hover:shadow-2xl"
            >
              Book Free Consultation
              <FaArrowRight className="text-xs" />
            </motion.button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-pill border-2 border-white/60 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:border-white hover:bg-white/10"
              >
                Talk to an Advisor
              </Link>
            </motion.div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-white/70">
            {TRUST_POINTS.map((point) => (
              <span key={point} className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-secondary-200" aria-hidden="true" />
                {point}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
});

export default CTA;