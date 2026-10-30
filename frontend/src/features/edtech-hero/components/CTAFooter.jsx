import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Shield, Zap } from "lucide-react";

const TRUST_FEATURES = [
  { icon: Shield, text: "7-day full refund" },
  { icon: Zap, text: "Join in 7–14 days" },
  { icon: Shield, text: "Placement until hired" },
];

export default function CTAFooter() {
  return (
    <section
      className="relative py-20 sm:py-24 lg:py-28 overflow-hidden"
      style={{ background: "#071226" }}
    >
      {/* Top border glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(99,102,241,.3), transparent)",
        }}
      />

      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,.08), transparent 60%)",
        }}
      />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-6"
            style={{
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.08)",
              color: "rgba(255,255,255,.55)",
            }}
          >
            <Sparkles size={14} />
            Start Your Journey Today
          </div>

          {/* Heading */}
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.1] mb-4"
            style={{ color: "rgba(255,255,255,.95)" }}
          >
            Ready to Launch{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(135deg, #60A5FA, #A855F7)",
              }}
            >
              Your Career?
            </span>
          </h2>

          {/* Description */}
          <p
            className="text-base sm:text-lg max-w-xl mx-auto mb-8"
            style={{ color: "rgba(255,255,255,.5)", lineHeight: 1.7 }}
          >
            Join 25,000+ learners who have transformed their careers.
            Book a free consultation with our career counsellors today.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <a
              href="/signup"
              className="group inline-flex items-center justify-center gap-2 font-semibold text-white transition-all duration-300 hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[.98]"
              style={{
                height: 56,
                paddingLeft: 36,
                paddingRight: 36,
                borderRadius: 18,
                background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                boxShadow: "0 15px 40px rgba(99,102,241,.35)",
                border: "none",
                fontSize: 15,
              }}
            >
              Book Free Consultation
              <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
            </a>

            <a
              href="/courses"
              className="inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 hover:bg-white/10 active:scale-[.98]"
              style={{
                height: 56,
                paddingLeft: 28,
                paddingRight: 28,
                borderRadius: 18,
                background: "rgba(255,255,255,.05)",
                border: "1px solid rgba(255,255,255,.1)",
                backdropFilter: "blur(24px)",
                color: "rgba(255,255,255,.75)",
                fontSize: 15,
              }}
            >
              View All Programs
            </a>
          </div>

          {/* Trust features */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {TRUST_FEATURES.map((f) => (
              <div
                key={f.text}
                className="flex items-center gap-1.5 text-xs"
                style={{ color: "rgba(255,255,255,.35)" }}
              >
                <f.icon size={14} style={{ color: "rgba(99,102,241,.5)" }} />
                {f.text}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
