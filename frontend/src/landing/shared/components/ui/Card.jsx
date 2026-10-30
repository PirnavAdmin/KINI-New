import { motion } from "framer-motion";

/**
 * Shared glass-morphism card surface. One spec for border/blur/shadow so
 * sections stop each inventing their own opacity + border values.
 */
export default function Card({ hover = true, className = "", children, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { y: -6 } : undefined}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-card border border-border bg-surface backdrop-blur-xl shadow-card transition-colors duration-300 hover:border-primary-500/20 dark:shadow-card-dark dark:hover:border-white/20 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
