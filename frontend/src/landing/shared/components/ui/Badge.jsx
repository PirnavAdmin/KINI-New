const TONES = {
  primary: {
    classes: "border-primary-500/20 bg-primary-50 text-primary-500 dark:border-primary-500/30 dark:bg-primary-500/10 dark:text-primary-300",
    dot: "bg-primary-500",
  },
  secondary: {
    classes: "border-secondary-500/20 bg-secondary-50 text-secondary-600 dark:border-secondary-500/30 dark:bg-secondary-500/10 dark:text-secondary-300",
    dot: "bg-secondary-500",
  },
  coral: {
    classes: "border-brand-coral/20 bg-brand-coral/5 text-brand-coral dark:border-brand-coral/30 dark:bg-brand-coral/10",
    dot: "bg-brand-coral",
  },
};

/**
 * Eyebrow pill used above section headings — replaces the ad hoc
 * "inline-flex items-center gap-2 rounded-full ..." markup that was
 * copy-pasted with slightly different values in every section.
 */
export default function Badge({ children, tone = "primary", icon: Icon, pulse = true, className = "" }) {
  const t = TONES[tone];

  return (
    <span className={`inline-flex items-center gap-2 rounded-pill border px-4 py-1.5 text-xs font-semibold ${t.classes} ${className}`}>
      {Icon ? (
        <Icon className="h-3 w-3" aria-hidden="true" />
      ) : (
        <span className={`h-1.5 w-1.5 rounded-full ${t.dot} ${pulse ? "animate-pulse" : ""}`} aria-hidden="true" />
      )}
      {children}
    </span>
  );
}
