import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";

const faqs = [
  {
    q: "What is the admissions deadline for 2026 cohorts?",
    a: "Cohorts fill on a rolling basis. Early applications are reviewed first and benefit from priority counseling slots. We recommend applying at least 3 weeks before your preferred start date. Check the program page for specific cohort start dates.",
  },
  {
    q: "What are the eligibility criteria?",
    a: "Most programs are open to graduates and working professionals across disciplines. You don't need a technical background for most tracks — a counselor will assess your profile and recommend the best-fit program and learning path during the eligibility review.",
  },
  {
    q: "How much do the programs cost and are there EMI options?",
    a: "Program fees range from ₹60,000 to ₹1,80,000 depending on the track and duration. We offer 0% interest EMI up to 18 months through partner NBFCs. Scholarships can reduce total fees by 20–50%. Your counselor will walk you through all options.",
  },
  {
    q: "What scholarships are available?",
    a: "We offer Merit Scholarships (top applicants), Women in Tech Scholarships, Early Bird discounts (apply 6+ weeks in advance), and Veteran Professional awards. Scholarship eligibility is assessed during the counseling session — no separate application needed.",
  },
  {
    q: "How does placement support work?",
    a: "Placement support begins in Month 2 and runs through 6 months post-graduation. It includes resume reviews, mock interviews with hiring managers, referrals to our 500+ hiring partners, and a dedicated placement manager for your batch. 95% of job-seeking graduates receive at least one offer.",
  },
  {
    q: "What is the refund and cancellation policy?",
    a: "If you withdraw within 7 days of enrollment and before attending any live sessions, you receive a full refund. After that, a prorated refund applies for the first 30 days. No refunds are issued after 30 days from enrollment. Detailed terms are shared during the enrollment step.",
  },
];

function FAQItem({ item, index, isOpen, onToggle }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: index * 0.07 }}
      className="rounded-2xl border border-white/10 overflow-hidden bg-white/5 backdrop-blur-sm hover:border-indigo-500/25 transition-all duration-200"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left group"
        aria-expanded={isOpen}
      >
        <span className="text-white font-semibold text-sm md:text-base leading-snug group-hover:text-indigo-300 transition-colors duration-200">
          {item.q}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0 w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center"
        >
          <FiChevronDown className="text-indigo-400 text-base" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 pt-0 border-t border-white/5">
              <p className="text-slate-400 text-sm leading-relaxed pt-4">{item.a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);
  const headRef = useRef(null);
  const headInView = useInView(headRef, { once: true });

  return (
    <section className="relative py-12 md:py-16 lg:py-20 px-4 overflow-hidden">
      <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-purple-700/10 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-3xl mx-auto">
        <motion.div
          ref={headRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-semibold uppercase tracking-widest mb-4">
            FAQ
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
            Questions We Hear Often
          </h2>
          <p className="text-slate-400 text-base md:text-lg max-w-lg mx-auto">
            Can't find your answer? Your counselor is one message away.
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem
              key={faq.q}
              item={faq}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}