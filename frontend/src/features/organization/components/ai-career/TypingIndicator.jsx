import { motion } from "framer-motion";

export default function TypingIndicator({ label = "Career Coach is thinking" }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400" role="status" aria-live="polite">
      <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        {[0, 1, 2].map((dot) => (
          <motion.span
            key={dot}
            className="h-2 w-2 rounded-full bg-blue-500"
            animate={{ y: [0, -5, 0], opacity: [0.45, 1, 0.45] }}
            transition={{ duration: 0.75, repeat: Infinity, delay: dot * 0.14 }}
          />
        ))}
      </div>
      <span className="hidden sm:inline">{label}</span>
    </div>
  );
}
