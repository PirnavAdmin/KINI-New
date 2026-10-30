import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const SIZES = {
  md: "px-6 py-2.5 text-sm gap-2",
  lg: "px-7 py-3 text-sm gap-2",
};

const VARIANTS = {
  // Style A — Orange primary button: orange bg, navy text
  primary:
    "bg-secondary-500 text-primary-700 font-semibold border border-secondary-500 hover:bg-secondary-600 dark:bg-secondary-500 dark:text-primary-950 dark:border-secondary-500 dark:hover:bg-secondary-600",
  // Style B — Navy secondary button: navy bg, orange text, orange border
  secondary:
    "bg-primary-700 text-secondary-500 font-semibold border border-secondary-500 hover:bg-primary-600 dark:bg-primary-700 dark:text-secondary-500 dark:border-secondary-500 dark:hover:bg-primary-600",
  // Style C — Outline button: transparent bg, orange border
  outline:
    "bg-transparent text-primary-700 font-semibold border border-secondary-500 hover:bg-secondary-500/8 dark:text-secondary-400 dark:hover:bg-secondary-500/10",
  // Ghost — text only (no border/background)
  ghost:
    "text-primary-700 font-semibold hover:bg-primary-50 dark:text-secondary-300 dark:hover:bg-white/5",
  // Destructive — danger actions remain visually distinct
  danger:
    "bg-error text-white font-semibold border border-error hover:bg-red-700 dark:bg-error dark:text-white dark:border-error dark:hover:bg-red-700",
};

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-ink-950";

/**
 * Polymorphic CTA button: renders a react-router <Link> when given `to`,
 * a plain <a> when given `href`, otherwise a <button>. Centralizes the
 * gradient/outline/ghost styles that were previously hand-copied per
 * section.
 */
const Button = forwardRef(function Button(
  { to, href, variant = "primary", size = "md", icon: Icon, className = "", children, ...props },
  ref,
) {
  const classes = `inline-flex items-center justify-center rounded-pill transition-all duration-300 disabled:pointer-events-none disabled:opacity-40 ${FOCUS_RING} ${SIZES[size]} ${VARIANTS[variant]} ${className}`;
  const content = (
    <>
      {children}
      {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
    </>
  );
  const motionProps = props.disabled
    ? {}
    : { whileHover: { y: -2, scale: 1.02 }, whileTap: { scale: 0.97 } };

  if (to) {
    return (
      <motion.div {...motionProps} className="inline-block">
        <Link ref={ref} to={to} className={classes} {...props}>
          {content}
        </Link>
      </motion.div>
    );
  }

  if (href) {
    return (
      <motion.a ref={ref} href={href} className={classes} {...motionProps} {...props}>
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button ref={ref} type="button" className={classes} {...motionProps} {...props}>
      {content}
    </motion.button>
  );
});

export default Button;
