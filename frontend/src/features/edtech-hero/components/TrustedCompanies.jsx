import { memo, useMemo } from "react";
import { motion } from "framer-motion";

const COMPANIES = [
  "Google",
  "Microsoft",
  "Amazon",
  "Adobe",
  "Infosys",
  "IBM",
  "TCS",
  "Accenture",
  "Meta",
  "Netflix",
  "Flipkart",
  "Swiggy",
];

const TrustedCompanies = memo(function TrustedCompanies() {
  const doubled = useMemo(() => [...COMPANIES, ...COMPANIES], []);

  return (
    <section
      className="relative py-16 sm:py-20 overflow-hidden"
      style={{ background: "#071226" }}
    >
      {/* Section header */}
      <div className="max-w-7xl mx-auto px-6 mb-10 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          data-aos="fade-up"
          data-aos-duration="800"
          className="text-sm font-medium"
          style={{ color: "rgba(255,255,255,.35)", letterSpacing: "0.15em" }}
        >
          OUR GRADUATES WORK AT
        </motion.p>
      </div>

      {/* Scrolling bar */}
      <div className="relative overflow-hidden" data-aos="zoom-in" data-aos-duration="800">
        {/* Gradient edges */}
        <div
          className="absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r to-transparent pointer-events-none"
          style={{ background: "linear-gradient(90deg, #071226, transparent)" }}
        />
        <div
          className="absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l to-transparent pointer-events-none"
          style={{ background: "linear-gradient(270deg, #071226, transparent)" }}
        />

        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 18, ease: "linear", repeat: Infinity }}
          className="flex gap-6 w-max items-center"
        >
          {doubled.map((name, i) => (
            <div
              key={i}
              className="flex-shrink-0 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:opacity-100"
              style={{
                opacity: 0.6,
                color: "rgba(255,255,255,.7)",
                border: "1px solid rgba(255,255,255,.06)",
                background: "rgba(255,255,255,.03)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
            >
              {name}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
});

export default TrustedCompanies;
