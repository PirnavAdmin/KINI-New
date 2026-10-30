import PropTypes from "prop-types";
import { motion } from "framer-motion";

export default function TypingIndicator({ name }) {
  return (
    <div className="flex items-center gap-2 px-2 pb-3 pt-1 text-xs text-slate-400">
      <span className="rounded-full bg-white px-3 py-2 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.45)] dark:bg-slate-900">
        {name} is typing...
      </span>
      <span className="flex items-center gap-1 rounded-full bg-white px-3 py-2 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.45)] dark:bg-slate-900">
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            className="h-1.5 w-1.5 rounded-full bg-blue-500"
            animate={{ y: [0, -3, 0], opacity: [0.65, 1, 0.65] }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              delay: index * 0.14,
              ease: "easeInOut",
            }}
          />
        ))}
      </span>
    </div>
  );
}

TypingIndicator.propTypes = {
  name: PropTypes.string.isRequired,
};

