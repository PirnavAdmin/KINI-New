import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Play, Terminal } from "lucide-react";

const TestCases = ({ testCases, results }) => {
  const [activeCase, setActiveCase] = useState(0);
  const [showCustom, setShowCustom] = useState(false);
  const [customInput, setCustomInput] = useState("");

  const tc = testCases || [];
  const current = tc[activeCase];
  const currentResult = results?.[activeCase];

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#085FA7]" />
          <span className="text-xs font-semibold text-[#0F172A]">Test Cases</span>
        </div>
        <button
          onClick={() => setShowCustom(!showCustom)}
          className={`text-[10px] font-medium px-2 py-1 rounded-lg transition-all ${
            showCustom
              ? "bg-[#F0765B]/10 text-[#C85A3E] border border-[#F0765B]/30"
              : "text-slate-500 hover:text-[#085FA7]"
          }`}
        >
          {showCustom ? "Predefined" : "Custom"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {showCustom ? (
          <motion.div
            key="custom"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col p-3"
          >
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Custom Input</label>
            <textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Enter your test input here..."
              className="flex-1 w-full bg-white border border-[#E5E7EB] rounded-xl p-3 text-xs font-mono text-slate-700 placeholder-slate-400 outline-none focus:border-[#085FA7] focus:shadow-[0_0_0_2px_rgba(8,95,167,0.1)] transition-all resize-none"
            />
            <button className="mt-2 flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#085FA7] to-[#3D8B2E] rounded-xl hover:shadow-lg transition-all w-fit shadow-sm">
              <Play className="w-3 h-3" />
              Run
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="predefined"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            <div className="flex border-b border-[#E5E7EB] px-3">
              {tc.map((_, i) => {
                const result = results?.[i];
                return (
                  <button
                    key={i}
                    onClick={() => setActiveCase(i)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium border-b-2 transition-all ${
                      activeCase === i
                        ? "border-[#085FA7] text-[#085FA7]"
                        : "border-transparent text-slate-500 hover:text-[#085FA7]"
                    }`}
                  >
                    {result?.passed === true && <CheckCircle className="w-3 h-3 text-[#5CA347]" />}
                    {result?.passed === false && <XCircle className="w-3 h-3 text-red-500" />}
                    Case {i + 1}
                    {result?.runtime && (
                      <span className={`text-[9px] font-mono ${result.passed ? "text-[#3D8B2E]" : "text-red-500"}`}>
                        {result.runtime}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {current && (
              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Input</p>
                  <code className="block text-xs font-mono text-slate-700 bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg p-2.5">
                    {current.input}
                  </code>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Expected Output</p>
                  <code className="block text-xs font-mono text-[#3D8B2E] bg-[#F8FAFC] border border-[#5CA347]/20 rounded-lg p-2.5">
                    {current.expected}
                  </code>
                </div>
                {currentResult && (
                  <>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Your Output</p>
                      <code className={`block text-xs font-mono rounded-lg p-2.5 border ${
                        currentResult.passed
                          ? "text-[#3D8B2E] bg-[#5CA347]/5 border-[#5CA347]/20"
                          : "text-red-500 bg-red-50 border-red-200"
                      }`}>
                        {currentResult.output || "—"}
                      </code>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500">
                      <span>Runtime: {currentResult.runtime || current.runtime}</span>
                      <span>Memory: {currentResult.memory || current.memory}</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TestCases;
