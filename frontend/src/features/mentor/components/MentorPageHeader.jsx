import { HeroWaves } from "@features/organization/components/org-ui/OrgIllustrations";
import "./mentor-hero.css";

/**
 * MentorPageHeader — the page-level header for every Mentor module screen.
 *
 * Two modes, picked automatically:
 *  - Hero (when `icon` or `art` is passed): soft blue banner with an icon
 *    tile, title + subtitle, an optional handwritten tagline, optional SVG
 *    artwork and optional actions on the right.
 *  - Compact (no icon/art): the original transparent title row. Kept so
 *    other roles that reuse this component are not affected.
 *
 * tagline  string | Array<string | { text: string, accent?: boolean }>
 *          Each entry renders on its own line; `accent` lines turn orange.
 * art      a React node, usually one of ./MentorHeroArt
 */
export default function MentorPageHeader({
  title,
  subtitle,
  actions,
  icon: Icon,
  tagline,
  art,
  className = "",
  ...rest
}) {
  const hero = Boolean(Icon || art);
  const lines = tagline ? (Array.isArray(tagline) ? tagline : [tagline]) : [];

  if (!hero) {
    return (
      <header
        {...rest}
        data-ui="mentor-page-header"
        className={`mentor-page-header ${className}`}
      >
        <div className="mentor-page-header-copy">
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {actions ? (
          <div className="mentor-page-header-actions">{actions}</div>
        ) : null}
      </header>
    );
  }

  return (
    <header
      {...rest}
      data-ui="mentor-page-header"
      data-variant="hero"
      className={`mentor-page-header mentor-hero ${className}`}
    >
      <div className="mentor-hero__bg" aria-hidden="true">
        <HeroWaves tone="blue" />
      </div>
      {Icon ? (
        <div className="mentor-hero__icon" aria-hidden="true">
          <Icon />
        </div>
      ) : null}
      <div className="mentor-page-header-copy mentor-hero__copy">
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {lines.length ? (
        <div className="mentor-hero__tagline" aria-hidden="true">
          {lines.map((line, index) => {
            const text = typeof line === "string" ? line : line?.text;
            const accent = typeof line === "object" && line?.accent;
            return (
              <em key={`${text}-${index}`} className={accent ? "is-accent" : undefined}>
                {text}
              </em>
            );
          })}
        </div>
      ) : null}
      {art ? <div className="mentor-hero__art">{art}</div> : null}
      {actions ? (
        <div className="mentor-page-header-actions mentor-hero__actions">{actions}</div>
      ) : null}
    </header>
  );
}
