import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, List, AlertTriangle, Lightbulb, Code2 } from "lucide-react";

const TABS = [
  { id: "description", label: "Description", icon: FileText },
  { id: "examples", label: "Examples", icon: List },
  { id: "constraints", label: "Constraints", icon: AlertTriangle },
  { id: "hints", label: "Hints", icon: Lightbulb },
];

const DIFFICULTY_CONFIG = {
  Easy: { color: "text-[#5CA347]", bg: "bg-[#5CA347]/10", border: "border-[#5CA347]/20" },
  Medium: { color: "text-[#C85A3E]", bg: "bg-[#F0765B]/10", border: "border-[#F0765B]/20" },
  Hard: { color: "text-red-500", bg: "bg-red-50", border: "border-red-200" },
};

const QuestionPanel = ({ question, activeTab, onTabChange }) => {
  const [localTab, setLocalTab] = useState("description");
  const tab = activeTab || localTab;
  const setTab = onTabChange || setLocalTab;
  const diffConfig = DIFFICULTY_CONFIG[question?.difficulty] || DIFFICULTY_CONFIG.Easy;

  if (!question) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 text-sm bg-white">
        Select a question to begin
      </div>
    );
  }

  const renderContent = () => {
    switch (tab) {
      case "description":
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {question.description}
            </p>
            <div className="rounded-xl bg-[#F0F7FF] border border-[#085FA7]/10 p-4">
              <p className="text-[11px] font-semibold text-[#085FA7] uppercase tracking-wider mb-2">Input Format</p>
              <p className="text-sm text-slate-600">{question.inputFormat}</p>
            </div>
            <div className="rounded-xl bg-[#F0F7FF] border border-[#085FA7]/10 p-4">
              <p className="text-[11px] font-semibold text-[#085FA7] uppercase tracking-wider mb-2">Output Format</p>
              <p className="text-sm text-slate-600">{question.outputFormat}</p>
            </div>
          </div>
        );
      case "examples":
        return (
          <div className="space-y-4">
            {question.examples.map((ex, i) => (
              <div key={i} className="rounded-xl bg-white border border-[#E5E7EB] overflow-hidden shadow-sm">
                <div className="flex items-center gap-2 px-4 py-2 bg-[#F0F7FF] border-b border-[#E5E7EB]">
                  <Code2 className="w-3.5 h-3.5 text-[#085FA7]" />
                  <span className="text-xs font-semibold text-[#085FA7]">Example {i + 1}</span>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500">Input: </span>
                    <code className="text-[#085FA7] font-mono text-xs bg-[#F0F7FF] px-2 py-0.5 rounded">{ex.input}</code>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500">Output: </span>
                    <code className="text-[#3D8B2E] font-mono text-xs bg-[#5CA347]/10 px-2 py-0.5 rounded">{ex.output}</code>
                  </div>
                  {ex.explanation && (
                    <div className="pt-2 border-t border-[#E5E7EB]">
                      <span className="text-[11px] font-semibold text-slate-500">Explanation: </span>
                      <span className="text-slate-600 text-xs">{ex.explanation}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      case "constraints":
        return (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 mb-2">Problem constraints to consider:</p>
            {question.constraints.map((c, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#085FA7] mt-1.5 shrink-0" />
                <code className="text-sm text-slate-700 font-mono">{c}</code>
              </div>
            ))}
          </div>
        );
      case "hints":
        return (
          <div className="space-y-3">
            <p className="text-xs text-[#C85A3E] mb-2 flex items-center gap-1.5 font-medium">
              <Lightbulb className="w-3.5 h-3.5" />
              Need a hint? Try to solve it yourself first!
            </p>
            {question.hints.map((h, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl bg-[#F0F7FF] border border-[#085FA7]/10 p-3"
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-xs font-bold text-[#085FA7] shrink-0 mt-0.5">Hint {i + 1}</span>
                  <p className="text-sm text-slate-700">{h}</p>
                </div>
              </motion.div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-[#E5E7EB]">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-[#0F172A]">{question.title}</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg ${diffConfig.bg} ${diffConfig.color} ${diffConfig.border} border`}>
                {question.difficulty}
              </span>
              <span className="text-[10px] text-slate-500">{question.acceptance}% acceptance</span>
              <span className="text-[10px] font-medium text-[#085FA7]">{question.points} pts</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {question.tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 text-[10px] font-medium bg-[#085FA7]/5 text-[#085FA7] border border-[#085FA7]/20 rounded-md">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E5E7EB] px-4 bg-white">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-semibold border-b-2 transition-all ${
              tab === id
                ? "border-[#085FA7] text-[#085FA7]"
                : "border-transparent text-slate-500 hover:text-[#085FA7]"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#F8FAFC]">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuestionPanel;
