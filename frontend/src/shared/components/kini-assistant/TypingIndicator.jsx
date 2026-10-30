import { motion } from "framer-motion";
import { Bot, Sparkles } from "lucide-react";

export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#085FA7]/15 to-[#5CA347]/15 text-[#085FA7] ring-1 ring-[#085FA7]/10 dark:text-cyan-300">
        <Bot className="h-4 w-4" />
      </div>
      <div className="max-w-[80%] rounded-3xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Sparkles className="h-3.5 w-3.5 text-[#5CA347]" />
          Kini is thinking...
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          {[0, 1, 2].map((index) => (
            <motion.span
              key={index}
              className="h-2.5 w-2.5 rounded-full bg-[#085FA7]/45"
              animate={{ y: [0, -4, 0], opacity: [0.45, 1, 0.45] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: index * 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
