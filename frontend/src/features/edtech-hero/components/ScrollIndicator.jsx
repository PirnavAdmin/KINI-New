import { motion } from "framer-motion";

export default function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.45 }}
      transition={{ delay: 1.2 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
    >
      <span
        className="text-[10px] font-medium uppercase tracking-[0.2em]"
        style={{ color: "rgba(255,255,255,.3)" }}
      >
        Scroll
      </span>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="w-5 h-8 rounded-full flex justify-center pt-2"
        style={{
          border: "1.5px solid rgba(255,255,255,.2)",
        }}
      >
        <motion.div
          className="w-1 h-2 rounded-full"
          style={{ background: "rgba(255,255,255,.4)" }}
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </motion.div>
  );
}
