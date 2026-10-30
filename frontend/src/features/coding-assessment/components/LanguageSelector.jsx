import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { LANGUAGES } from "../data/codingQuestions";

const LanguageSelector = ({ selected, onSelect }) => {
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find((l) => l.id === selected) || LANGUAGES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F0F7FF] border border-[#085FA7]/20 hover:bg-[#085FA7]/10 transition-all text-xs font-medium text-[#085FA7]"
      >
        <span className="w-5 h-5 rounded bg-gradient-to-br from-[#085FA7] to-[#5CA347] flex items-center justify-center text-[9px] font-bold text-white">
          {current.icon}
        </span>
        {current.label}
        <ChevronDown className={`w-3 h-3 text-[#085FA7] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            className="absolute top-full left-0 mt-1 w-40 rounded-xl border border-[#E5E7EB] bg-white shadow-xl z-50 overflow-hidden"
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                onClick={() => { onSelect(lang.id); setOpen(false); }}
                className={`flex items-center gap-2.5 w-full px-3 py-2.5 text-xs text-left hover:bg-[#F0F7FF] transition-colors ${
                  selected === lang.id ? "text-[#085FA7] font-semibold" : "text-slate-600"
                }`}
              >
                <span className="w-5 h-5 rounded bg-gradient-to-br from-[#085FA7] to-[#5CA347] flex items-center justify-center text-[9px] font-bold text-white">
                  {lang.icon}
                </span>
                {lang.label}
                {selected === lang.id && <Check className="w-3 h-3 text-[#085FA7] ml-auto" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSelector;
