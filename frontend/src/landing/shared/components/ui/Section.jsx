import { useThemeContext } from "@landing-shared/context/ThemeContext";

/**
 * Standard section wrapper: consistent max-width, horizontal gutters and
 * vertical rhythm (8px-multiple padding) so sections stop hand-rolling
 * their own container/spacing values. Background is left to the caller
 * via `className` — only layout is opinionated here.
 *
 * `md` is the site-wide default rhythm — nearly every section should use
 * it, for the same reason Stripe/Linear-style pages read as "tight": one
 * repeated vertical interval, not a different padding per section. `sm`
 * exists only for genuinely dense content (a logo strip). `lg` is kept
 * available but intentionally unused on the homepage — reach for it only
 * when a section needs to visually stand apart, not as a default.
 */
const PADDING = {
  sm: "py-12 md:py-16",
  md: "py-16 md:py-20",
  lg: "py-20 md:py-24",
};

export default function Section({
  as: Tag = "section",
  id,
  padding = "md",
  className = "",
  containerClassName = "",
  style,
  decoration,
  children,
}) {
  const { isDark } = useThemeContext();

  return (
    <Tag
      id={id}
      data-theme={isDark ? "dark" : "light"}
      className={`relative overflow-hidden ${PADDING[padding]} ${className}`}
      style={style}
    >
      {decoration && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          {decoration}
        </div>
      )}
      <div className={`relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${containerClassName}`}>
        {children}
      </div>
    </Tag>
  );
}
