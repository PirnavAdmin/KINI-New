import PropTypes from "prop-types";
import "./mentor-page-hero.css";

/**
 * MentorPageHero — v17 page banner (My Courses, Batch workspace, Assessments,
 * Class Schedule). Soft blue card with an optional icon tile, title +
 * subtitle, optional meta row, artwork (image or SVG node), a handwritten
 * script and a right-hand column for actions / tabs.
 *
 * script   Array<string | { text, accent }> — accent lines are orange.
 * aside    node rendered in the right column above `actions`.
 * artWidth CSS width of the art slot (default 300px).
 */
export default function MentorPageHero({
  icon: Icon,
  leading,
  title,
  titleAside,
  subtitle,
  meta,
  image,
  art,
  script = [],
  scriptTone = "navy",
  aside,
  actions,
  artWidth,
  className = "",
  ...rest
}) {
  const lines = script.map((line) => (typeof line === "string" ? { text: line } : line));
  return (
    <section {...rest} data-ui="mentor-page-hero" className={`mph ${className}`} style={artWidth ? { "--mph-art-w": artWidth } : undefined}>
      <svg className="mph__bg" viewBox="0 0 1600 240" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <ellipse cx="1180" cy="30" rx="440" ry="140" fill="#ffffff" fillOpacity=".55" />
        <ellipse cx="300" cy="-20" rx="380" ry="110" fill="#ffffff" fillOpacity=".5" />
        <path d="M0 200 C260 168 520 232 820 206 C1080 184 1300 226 1600 196 V240 H0 Z" fill="#ffffff" fillOpacity=".5" />
        <path d="M900 240 C1040 170 1240 150 1600 160 V240 Z" fill="#dce9fb" fillOpacity=".6" />
      </svg>
      {leading}
      {Icon && (
        <span className="mph__icon" aria-hidden="true"><Icon /></span>
      )}
      <div className="mph__copy">
        <div className="mph__titlerow">
          <h1 className="mph__title">{title}</h1>
          {titleAside}
        </div>
        {subtitle && <p className="mph__subtitle">{subtitle}</p>}
        {meta && <div className="mph__meta">{meta}</div>}
      </div>
      {(image || art) && (
        <div className="mph__art" aria-hidden="true">
          {image ? <img src={image} alt="" draggable={false} decoding="async" /> : art}
        </div>
      )}
      {lines.length > 0 && (
        <div className={`mph__script mph__script--${scriptTone}`} aria-hidden="true">
          {lines.map((line, index) => (
            <em key={`${line.text}-${index}`} className={line.accent ? "is-accent" : undefined}>{line.text}</em>
          ))}
        </div>
      )}
      {(aside || actions) && (
        <div className="mph__side">
          {aside}
          {actions && <div className="mph__actions">{actions}</div>}
        </div>
      )}
    </section>
  );
}

MentorPageHero.propTypes = {
  icon: PropTypes.elementType,
  leading: PropTypes.node,
  title: PropTypes.node,
  titleAside: PropTypes.node,
  subtitle: PropTypes.node,
  meta: PropTypes.node,
  image: PropTypes.string,
  art: PropTypes.node,
  script: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.shape({ text: PropTypes.string, accent: PropTypes.bool })])),
  scriptTone: PropTypes.oneOf(["navy", "orange"]),
  aside: PropTypes.node,
  actions: PropTypes.node,
  artWidth: PropTypes.string,
  className: PropTypes.string,
};
