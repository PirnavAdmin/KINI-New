import PropTypes from "prop-types";
import "./org-showcase-hero.css";
import "./org-hero-v14.css";

/**
 * OrgShowcaseHero — v18 illustrated banner for Organization pages
 * (Batches, Mentors, Employees, Students, Course Materials, Assessments,
 * Attendance, Student profile).
 *
 * title       string | [navy, blue]  — two-tone title; `stackTitle` puts the
 *             blue part on its own line.
 * badge       { icon, label }        — rounded chip above the title.
 * eyebrow     small uppercase orange text above the title.
 * icon        component              — soft icon tile left of the title.
 * leading     node                   — replaces the icon tile (e.g. avatar).
 * features    [{ icon, label:[a,b], tone }] — icon + 2-line label row.
 * art         { src, fallbackSrc }   — artwork anchored bottom-right.
 * script      string[]               — handwritten lines (last one orange).
 * actions     node                   — top-right buttons.
 * cornerAction node                  — bottom-right button (above the art).
 * footer      node                   — rendered inside the banner at the
 *             bottom (KPI cards that overlap the artwork).
 * variant     layout key (CSS): batches | mentors | employees | students |
 *             materials | assessments | attendance | profile
 */
export default function OrgShowcaseHero({
  variant = "batches",
  title,
  stackTitle = false,
  titleAside,
  badge,
  eyebrow,
  icon: Icon,
  iconTone = "blue",
  leading,
  subtitle,
  meta,
  features = [],
  art,
  script = [],
  actions,
  cornerAction,
  footer,
  aside,
  className = "",
}) {
  const [dark, blue] = Array.isArray(title) ? title : [title, null];
  const BadgeIcon = badge?.icon;
  return (
    <section className={`osh osh--${variant} ${footer ? "osh--with-footer" : ""} ${className}`.trim()} aria-label={Array.isArray(title) ? title.join(" ") : undefined}>
      <svg className="osh__bg" viewBox="0 0 1600 420" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={`osh-g-${variant}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f6f9ff" />
            <stop offset=".55" stopColor="#eaf2fe" />
            <stop offset="1" stopColor="#dbe9fc" />
          </linearGradient>
        </defs>
        <rect width="1600" height="420" fill={`url(#osh-g-${variant})`} />
        <ellipse cx="1180" cy="120" rx="520" ry="260" fill="#ffffff" fillOpacity=".45" />
        <ellipse cx="260" cy="-40" rx="420" ry="160" fill="#ffffff" fillOpacity=".55" />
        <path d="M0 330 C260 290 520 360 820 330 C1080 306 1320 350 1600 318 V420 H0 Z" fill="#ffffff" fillOpacity=".55" />
        <path d="M760 420 C900 330 1180 300 1600 300 V420 Z" fill="#cfe0fa" fillOpacity=".55" />
        <circle cx="1370" cy="70" r="46" fill="#fde7c3" fillOpacity=".55" />
        <g fill="#9bb9e6" fillOpacity=".55">
          {Array.from({ length: 12 }, (_, index) => <circle key={index} cx={640 + (index % 4) * 16} cy={60 + Math.floor(index / 4) * 16} r="2" />)}
        </g>
      </svg>

      {art && (
        <div className="osh__art" aria-hidden="true">
          <img
            src={art.src}
            alt=""
            draggable={false}
            loading="eager"
            decoding="async"
            onError={(event) => {
              if (art.fallbackSrc && !event.currentTarget.dataset.fallback) {
                event.currentTarget.dataset.fallback = "1";
                event.currentTarget.src = art.fallbackSrc;
              }
            }}
          />
        </div>
      )}

      {script.length > 0 && (
        <p className="osh__script" aria-hidden="true">
          {script.map((line, index) => <span key={`${line}-${index}`} className={index === script.length - 1 ? "is-accent" : undefined}>{line}</span>)}
        </p>
      )}

      {aside}
      {actions && <div className="osh__actions">{actions}</div>}

      <div className="osh__main">
        {(leading || Icon) && (
          <div className="osh__lead">
            {leading || <span className={`osh__icon is-${iconTone}`} aria-hidden="true"><Icon /></span>}
          </div>
        )}
        <div className="osh__copy">
          {badge && (
            <span className="osh__badge">
              {BadgeIcon && <span aria-hidden="true"><BadgeIcon /></span>}
              {badge.label}
            </span>
          )}
          {eyebrow && <p className="osh__eyebrow">{eyebrow}</p>}
          <div className="osh__titlerow">
            <h1 className="osh__title">
              {dark}
              {blue && <>{stackTitle ? <br /> : " "}<em>{blue}</em></>}
            </h1>
            {titleAside}
          </div>
          {subtitle && <p className="osh__subtitle">{subtitle}</p>}
          {meta && <div className="osh__meta">{meta}</div>}
          {features.length > 0 && (
            <ul className="osh__features">
              {features.map(({ icon: FeatureIcon, label, tone = "blue" }) => (
                <li key={label.join(" ")}>
                  <span className={`osh__ficon is-${tone}`} aria-hidden="true"><FeatureIcon /></span>
                  <span>{label[0]}{" "}<br /><span className="osh__fsub">{label[1]}</span></span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {cornerAction && <div className="osh__corner">{cornerAction}</div>}
      {footer && <div className="osh__footer">{footer}</div>}
    </section>
  );
}

OrgShowcaseHero.propTypes = {
  variant: PropTypes.string,
  title: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]),
  stackTitle: PropTypes.bool,
  titleAside: PropTypes.node,
  badge: PropTypes.shape({ icon: PropTypes.elementType, label: PropTypes.node }),
  eyebrow: PropTypes.node,
  icon: PropTypes.elementType,
  iconTone: PropTypes.string,
  leading: PropTypes.node,
  subtitle: PropTypes.node,
  meta: PropTypes.node,
  features: PropTypes.array,
  art: PropTypes.shape({ src: PropTypes.string, fallbackSrc: PropTypes.string }),
  script: PropTypes.arrayOf(PropTypes.string),
  actions: PropTypes.node,
  cornerAction: PropTypes.node,
  footer: PropTypes.node,
  aside: PropTypes.node,
  className: PropTypes.string,
};
