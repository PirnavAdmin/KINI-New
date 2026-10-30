import { motion } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useThemeContext } from "@shared/context/ThemeContext";

const FEATURES = [
  { title: "Live Classes",          academy: true, others: false,     othersNote: "Mostly Recorded"  },
  { title: "Structured Curriculum", academy: true, others: false,     othersNote: "Scattered Content" },
  { title: "1:1 Mentorship",        academy: true, others: false                                       },
  { title: "Placement Support",     academy: true, others: false                                       },
  { title: "Real Projects",         academy: true, others: "limited", othersNote: "Limited scope"     },
  { title: "Mock Interviews",       academy: true, others: false                                       },
];

const STATS = [
  { value: "500+", label: "Students Trained" },
  { value: "95%",  label: "Placement Rate"   },
  { value: "50+",  label: "Industry Mentors" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } },
};

function OthersCell({ others, othersNote }) {
  if (others === false) {
    return (
      <div className="flex flex-col items-center gap-1">
        <XCircle className="text-[#F0765B]" size={18} aria-label="Not available" />
        {othersNote && (
          <span className="text-[10px] text-slate-500 leading-tight text-center">
            {othersNote}
          </span>
        )}
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-1">
      <AlertTriangle className="text-[#F0765B]" size={18} aria-label="Limited" />
      {othersNote && (
        <span className="text-[10px] text-slate-500 leading-tight text-center">
          {othersNote}
        </span>
      )}
    </div>
  );
}

export default function WhyChooseUs() {
  const { isDark } = useThemeContext();
  return (
    <section
      id="why-us"
      className={`relative overflow-hidden py-16 sm:py-20 lg:py-24 transition-colors duration-300 ${isDark ? 'bg-[#020617] text-white' : 'bg-[#F8FAFC] text-[#0F172A]'}`}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {isDark && <>
          <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-[#085FA7]/10 blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#5CA347]/10 blur-[120px]" />
        </>}
        <div className={`absolute inset-0 bg-[size:50px_50px] ${isDark ? 'bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]' : 'bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)]'}`} />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mb-8 text-center"
        >
          <span className="inline-block rounded-full border border-[#085FA7]/20 bg-[#EDF4FC] px-4 py-1 text-xs font-semibold text-[#085FA7]">
            Why Choose Us
          </span>

          <h2 className="mt-4 text-3xl font-bold md:text-4xl">
            Why{" "}
            <span className="bg-gradient-to-r from-[#085FA7] to-[#5CA347] bg-clip-text text-transparent">
              KiniEduHub
            </span>
          </h2>

          <p className={`mx-auto mt-3 max-w-xl text-sm ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
            Structured curriculum, real projects, and mentorship — side by side
            with what the rest of the market offers.
          </p>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="overflow-hidden rounded-2xl border backdrop-blur-xl"
          style={{
            borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E5E7EB",
            backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.8)",
          }}
          role="table"
          aria-label="Feature comparison between Our Academy and others"
        >
          {/* Column headers */}
          <div
            role="row"
            className="grid grid-cols-3 bg-gradient-to-r from-[#085FA7] to-[#5CA347] px-5 py-3 text-sm font-semibold text-white"
          >
            <div role="columnheader">Features</div>
            <div role="columnheader" className="text-center">Our Academy</div>
            <div role="columnheader" className="text-center">Others</div>
          </div>

          {/* Data rows */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            role="rowgroup"
          >
            {FEATURES.map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                role="row"
                className="grid grid-cols-3 items-center px-5 py-4 transition-colors hover:bg-white/[0.04] last:border-b-0"
                style={{
                  borderBottom: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid #E5E7EB",
                }}
              >
                <div role="cell">
                  <p className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-[#0F172A]'}`}>{item.title}</p>
                </div>
                <div role="cell" className="flex justify-center">
                  <CheckCircle className="text-[#5CA347]" size={18} aria-label="Available" />
                </div>
                <div role="cell" className="flex justify-center">
                  <OthersCell others={item.others} othersNote={item.othersNote} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          {STATS.map((stat) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-xl border p-5 text-center backdrop-blur-xl transition-shadow"
              style={{
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E5E7EB",
                backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.8)",
              }}
            >
              <p className="text-3xl font-bold text-[#085FA7]" aria-label={`${stat.value} ${stat.label}`}>
                {stat.value}
              </p>
              <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
