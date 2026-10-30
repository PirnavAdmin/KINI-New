import PropTypes from "prop-types";
import { CalendarDays, ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";
import "./hr-portal.css";
import "./hr-density-tokens.css";
import KPI from '@/components/common/KPI';

/* ──────────────────────────────────────────────────────────────────────
   HR portal kit (v21): breadcrumb, illustrated hero and KPI tiles shared
   by Dashboard, Employees, Batches, Syllabus, Students, Attendance, Leave,
   Performance and Calendar.
   ────────────────────────────────────────────────────────────────────── */

function AccentArt({ kind }) {
  if (kind === "clock") {
    return (
      <svg className="hrp-accent hrp-accent--clock" viewBox="0 0 80 80" aria-hidden="true">
        <circle cx="40" cy="42" r="30" fill="#2f6fe4" /><circle cx="40" cy="42" r="23" fill="#fff" />
        <path d="M40 28 V42 L50 48" stroke="#0f2a4a" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M16 18 L24 10 M64 18 L56 10" stroke="#2f6fe4" strokeWidth="6" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === "chart") {
    return (
      <svg className="hrp-accent hrp-accent--chart" viewBox="0 0 90 80" aria-hidden="true">
        <rect x="2" y="2" width="86" height="70" rx="12" fill="#fff" stroke="#d6e4f7" strokeWidth="2" />
        {[0, 1, 2, 3].map((index) => <rect key={index} x={16 + index * 17} y={56 - (index + 1) * 10} width="11" height={(index + 1) * 10} rx="3" fill={["#93c5fd", "#60a5fa", "#f39924", "#2f6fe4"][index]} />)}
      </svg>
    );
  }
  if (kind === "target") {
    return (
      <svg className="hrp-accent hrp-accent--target" viewBox="0 0 80 80" aria-hidden="true">
        <circle cx="38" cy="42" r="30" fill="#2f6fe4" /><circle cx="38" cy="42" r="21" fill="#fff" /><circle cx="38" cy="42" r="12" fill="#2f6fe4" /><circle cx="38" cy="42" r="5" fill="#fff" />
        <path d="M38 42 L70 12" stroke="#f39924" strokeWidth="4" strokeLinecap="round" /><path d="M64 8 L74 6 L72 16 Z" fill="#f39924" />
      </svg>
    );
  }
  return null;
}

/** Drawn hero art for screens without a character image. */
function DrawnArt({ kind }) {
  if (kind === "calendar") {
    return (
      <svg className="hrp-drawn" viewBox="0 0 360 200" aria-hidden="true">
        <ellipse cx="190" cy="190" rx="160" ry="10" fill="#d6e4f7" />
        <path d="M40 190 C20 140 30 96 70 76 C80 120 72 160 40 190 Z" fill="#4fb07f" /><path d="M54 190 C58 146 84 120 112 114 C104 152 84 176 54 190 Z" fill="#2f9e6a" />
        <g transform="rotate(-8 190 110)">
          <rect x="120" y="40" width="150" height="130" rx="16" fill="#fff" stroke="#c9d9f2" strokeWidth="3" />
          <path d="M120 58 a16 16 0 0 1 16 -16 H254 a16 16 0 0 1 16 16 V74 H120 Z" fill="#2f6fe4" />
          {[150, 180, 210, 240].map((x) => <rect key={x} x={x - 4} y="28" width="8" height="24" rx="4" fill="#f39924" />)}
          {[0, 1, 2, 3].map((row) => [0, 1, 2, 3, 4].map((col) => <rect key={`${row}-${col}`} x={132 + col * 26} y={84 + row * 20} width="18" height="13" rx="3" fill={row === 1 && col === 2 ? "#f39924" : row === 2 && col === 3 ? "#2f6fe4" : "#e4ecf8"} />))}
        </g>
        <g transform="translate(272 132)"><circle r="34" fill="#1d4f91" /><circle r="27" fill="#fff" /><path d="M0 -16 V0 L12 8" stroke="#0f2a4a" strokeWidth="4" strokeLinecap="round" fill="none" /></g>
        <g transform="translate(300 40)"><path d="M0 28 C0 8 10 0 22 0 C34 0 44 8 44 28 L50 38 H-6 Z" fill="#f7b731" /><circle cx="22" cy="44" r="6" fill="#f39924" /></g>
        <path d="M300 100 C330 110 340 150 330 190" stroke="#2f9e6a" strokeWidth="0" fill="none" />
        <path d="M316 190 C300 150 310 118 344 104 C352 140 344 170 316 190 Z" fill="#4fb07f" />
      </svg>
    );
  }
  return (
    <svg className="hrp-drawn" viewBox="0 0 360 200" aria-hidden="true">
      <ellipse cx="190" cy="190" rx="160" ry="10" fill="#d6e4f7" />
      <path d="M40 190 C20 140 30 96 70 76 C80 120 72 160 40 190 Z" fill="#4fb07f" />
      <rect x="70" y="160" width="120" height="18" rx="4" fill="#f39924" /><rect x="78" y="142" width="108" height="18" rx="4" fill="#e5484d" /><rect x="72" y="124" width="114" height="18" rx="4" fill="#2f6fe4" />
      <rect x="150" y="40" width="150" height="110" rx="10" fill="#1c3f78" /><rect x="158" y="48" width="134" height="92" rx="5" fill="#eef4fd" />
      <circle cx="225" cy="94" r="22" fill="#2f6fe4" /><path d="M218 82 L236 94 L218 106 Z" fill="#fff" />
      <path d="M140 150 H310 L322 166 H128 Z" fill="#9db6d8" />
      <path d="M190 22 L240 4 L290 22 L240 40 Z" fill="#1c3f78" /><path d="M210 30 V44 C226 54 254 54 270 44 V30 L240 40 Z" fill="#244f96" />
      <g transform="translate(300 60)"><rect width="46" height="56" rx="6" fill="#fff6dc" stroke="#f7d79a" strokeWidth="2" />{[14, 26, 38].map((y) => <g key={y}><path d={`M8 ${y} l4 4 l7 -8`} stroke="#16a34a" strokeWidth="3" fill="none" /><rect x="22" y={y - 3} width="18" height="4" rx="2" fill="#f7c873" /></g>)}</g>
      <g transform="translate(316 6)"><circle cx="14" cy="14" r="13" fill="#fff4d6" /><path d="M14 4 C8 4 5 9 5 13 C5 17 8 18 9 21 H19 C20 18 23 17 23 13 C23 9 20 4 14 4 Z" fill="#f7b731" /></g>
    </svg>
  );
}

export function HrBreadcrumb({ items }) {
  return (
    <nav className="hrp-crumbs" aria-label="Breadcrumb">
      <Link to="/employee/hr-dashboard" aria-label="Home" className="hrp-crumbs__home"><Home aria-hidden="true" /></Link>
      {items.map((item, index) => (
        <span key={item.label} className="contents">
          <ChevronRight aria-hidden="true" />
          {item.to && index < items.length - 1 ? <Link to={item.to}>{item.label}</Link> : <b>{item.label}</b>}
        </span>
      ))}
    </nav>
  );
}

/**
 * HR hero. title: string | [dark, accent]; accentTone: "orange" | "blue".
 * art: { src, accent } from HR_BANNERS. script: string[] (last line orange).
 */
export function HrHero({ title, accentTone = "blue", subtitle, art, script = [], actions, dateLabel, className = "", eyebrow = "HR Portal", eyebrowIcon: EyebrowIcon, tight = false, features = [], scriptStyle = "plain" }) {
  const [dark, accent] = Array.isArray(title) ? title : [title, null];
  return (
    <section className={`hrp-hero ${script.length ? "" : "hrp-hero--noscript "}${art?.v24 ? "hrp-hero--v24 " : ""}${eyebrow ? "" : "hrp-hero--plain "}${className}`} aria-label={Array.isArray(title) ? title.join(" ") : String(title)}>
      <svg className="hrp-hero__bg" viewBox="0 0 1600 260" preserveAspectRatio="none" aria-hidden="true">
        <ellipse cx="1150" cy="40" rx="520" ry="200" fill="#ffffff" fillOpacity=".45" />
        <path d="M0 220 C300 180 600 250 900 214 C1150 186 1350 236 1600 204 V260 H0 Z" fill="#ffffff" fillOpacity=".55" />
        <g fill="#9bb9e6" fillOpacity=".5">{Array.from({ length: 16 }, (_, index) => <circle key={index} cx={760 + (index % 4) * 16} cy={50 + Math.floor(index / 4) * 16} r="2" />)}</g>
        <g fill="#9bb9e6" fillOpacity=".5">{Array.from({ length: 16 }, (_, index) => <circle key={index} cx={1240 + (index % 4) * 16} cy={120 + Math.floor(index / 4) * 16} r="2" />)}</g>
      </svg>
      <div className="hrp-hero__copy">
        {eyebrow && <p className="hrp-hero__eyebrow">{EyebrowIcon && <EyebrowIcon aria-hidden="true" />}{eyebrow}</p>}
        <h1>{dark}{accent && <>{tight ? '' : ' '}<em className={`is-${accentTone}`}>{accent}</em></>}</h1>
        {subtitle && <p className="hrp-hero__sub">{subtitle}</p>}
        {features.length > 0 && (
          <ul className="hrp-hero__features">
            {features.map(({ icon: Icon, label, tone = 'blue' }) => (
              <li key={label}><span className={`is-${tone}`} aria-hidden="true"><Icon /></span>{label}</li>
            ))}
          </ul>
        )}
      </div>
      {art && (
        <div className={`hrp-hero__art${art.v24 ? " hrp-hero__art--v24" : ""}${art.wide ? " hrp-hero__art--wide" : ""}${art.src?.includes("kini-designs") ? " hrp-hero__art--design" : ""}`} aria-hidden="true">
          {art.src ? <img src={art.src} alt="" draggable={false} decoding="async" /> : <DrawnArt kind={art.accent} />}
          {art.src && art.accent && <AccentArt kind={art.accent} />}
        </div>
      )}
      {script.length > 0 && (
        <p className={`hrp-hero__script${scriptStyle === "note" ? " hrp-hero__script--note" : ""}`} aria-hidden="true">
          {script.map((line, index) => <span key={`${line}-${index}`}>{line}</span>)}
          <svg viewBox="0 0 120 40"><path d="M4 34 C40 34 80 26 108 6" stroke="#f39924" strokeWidth="3" fill="none" strokeLinecap="round" /><path d="M96 6 L110 4 L106 18" stroke="#f39924" strokeWidth="3" fill="none" strokeLinecap="round" /></svg>
        </p>
      )}
      {(actions || dateLabel) && (
        <div className="hrp-hero__actions">
          {dateLabel && <span className="hrp-date"><CalendarDays aria-hidden="true" />{dateLabel}</span>}
          {actions}
        </div>
      )}
    </section>
  );
}

// HR tone names → global KPI accents.
const KPI_TONE = { danger: "red", pink: "red", warning: "orange", info: "cyan", lavender: "purple", plain: "navy" };
const KPI_TREND = { up: "positive", down: "negative", flat: "neutral" };

/**
 * KPI tiles, rendered with the global KPI card (src/components/common/KPI.jsx).
 * items: [{ key, label, value, sub, icon, tone, trend, trendDir, onClick }]
 * trend: "0%" | "12%" — shown only when provided. `layout` is accepted for
 * compatibility; every card uses the same label → value → description order.
 */
// eslint-disable-next-line no-unused-vars
export function HrKpis({ items, layout = "value-first", columns }) {
  return (
    <section className="hrp-kpis" style={columns ? { "--hrp-cols": columns } : undefined} aria-label="Summary">
      {items.map(({ key, label, value, sub, icon, tone = "blue", trend, trendDir = "up", onClick }) => (
        <KPI
          key={key ?? label}
          label={label}
          value={value}
          description={sub}
          icon={icon}
          accent={KPI_TONE[tone] ?? tone}
          trend={trend ?? undefined}
          trendType={KPI_TREND[trendDir] ?? "neutral"}
          onClick={onClick}
        />
      ))}
    </section>
  );
}

HrBreadcrumb.propTypes = { items: PropTypes.array.isRequired };
HrHero.propTypes = { title: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired };
HrKpis.propTypes = { items: PropTypes.array.isRequired, layout: PropTypes.string, columns: PropTypes.number };
