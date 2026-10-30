import { motion, AnimatePresence } from "framer-motion";
import { Terminal, CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";

const STATUS_CONFIG = {
  idle: { label: "Ready", color: "text-slate-400", icon: Terminal, bg: "" },
  running: { label: "Running...", color: "text-[#085FA7]", icon: Loader2, bg: "bg-[#F0F7FF]" },
  accepted: { label: "Accepted", color: "text-[#3D8B2E]", icon: CheckCircle, bg: "bg-[#5CA347]/5" },
  wrong: { label: "Wrong Answer", color: "text-red-500", icon: XCircle, bg: "bg-red-50" },
  error: { label: "Compilation Error", color: "text-[#C85A3E]", icon: AlertTriangle, bg: "bg-[#F0765B]/5" },
  timeout: { label: "Time Limit Exceeded", color: "text-red-500", icon: XCircle, bg: "bg-red-50" },
};

const OutputConsole = ({ status = "idle", output = "", runtime, memory }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.idle;
  const Icon = config.icon;

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-[#0F172A]">Output</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={status}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className={`flex items-center gap-1.5 text-[11px] font-semibold ${config.color} ${config.bg} px-2 py-0.5 rounded-lg`}
          >
            {status === "running" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Icon className="w-3.5 h-3.5" />
            )}
            {config.label}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex-1 overflow-y-auto p-3 bg-[#F8FAFC]">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 min-h-[80px] shadow-sm">
          {output ? (
            <pre className="text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed">
              {output}
            </pre>
          ) : (
            <p className="text-xs font-mono text-slate-400">
              {status === "idle"
                ? "Run your code to see output here..."
                : status === "running"
                ? "Executing..."
                : ""}
            </p>
          )}
        </div>

        {(runtime || memory) && (
          <div className="flex items-center gap-4 mt-3 text-[10px] font-mono text-slate-500">
            {runtime && (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#085FA7]/50" />
                Runtime: {runtime}
              </span>
            )}
            {memory && (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5CA347]/50" />
                Memory: {memory}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputConsole;
