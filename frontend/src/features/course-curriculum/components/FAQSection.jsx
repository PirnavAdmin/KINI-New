import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

const FAQSection = ({ faq }) => {
  const [openId, setOpenId] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", ...new Set(faq.map((f) => f.category))];
  const filtered = activeCategory === "All" ? faq : faq.filter((f) => f.category === activeCategory);

  return (
    <section className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <HelpCircle className="w-5 h-5 text-[#085FA7]" />
        <div>
          <h2 className="text-lg font-extrabold text-[#0F172A]">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-500 mt-0.5">Everything you need to know before enrolling</p>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg border transition-all ${
              activeCategory === cat
                ? "bg-[#085FA7] text-white border-[#085FA7] shadow-sm"
                : "bg-white text-slate-500 border-[#E5E7EB] hover:border-[#085FA7]/30 hover:text-[#085FA7]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((item, i) => (
          <motion.div
            key={item.q}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`border border-[#E5E7EB] rounded-xl overflow-hidden transition-all ${
              openId === i ? "shadow-sm border-[#085FA7]/20 bg-[#F8FAFC]" : "bg-white"
            }`}
          >
            <button
              onClick={() => setOpenId(openId === i ? null : i)}
              className="w-full flex items-center justify-between gap-2 px-4 py-3.5 text-left"
              aria-expanded={openId === i}
              aria-controls={`faq-answer-${i}`}
            >
              <span className="text-sm font-semibold text-[#0F172A]">{item.q}</span>
              <motion.div
                animate={{ rotate: openId === i ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="shrink-0"
              >
                <ChevronDown className={`w-4 h-4 ${openId === i ? "text-[#085FA7]" : "text-slate-400"}`} />
              </motion.div>
            </button>
            <AnimatePresence initial={false}>
              {openId === i && (
                <motion.div
                  key="answer"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden"
                  id={`faq-answer-${i}`}
                  role="region"
                >
                  <p className="px-4 pb-4 text-sm text-slate-600 leading-relaxed">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FAQSection;
