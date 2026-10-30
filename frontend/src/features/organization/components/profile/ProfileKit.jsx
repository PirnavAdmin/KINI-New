import PropTypes from "prop-types";
import { Mail, MapPin, Phone } from "lucide-react";
import { AvatarPhoto } from "@/components/common/ProfileImage";
import "./profile-kit.css";
import KPI from "@/components/common/KPI";

/* ──────────────────────────────────────────────────────────────────────
   Organization profile kit (v19) — Employee profile, Mentor profile and
   Batch details share this hero, tab bar, section header and KPI tiles.
   ────────────────────────────────────────────────────────────────────── */

/** Decorative right-hand art: city skyline, graduation cap, books, leaves. */
export function ProfileHeroArt({ variant = "person" }) {
  return (
    <svg className="pk-art-svg" viewBox="0 0 640 220" preserveAspectRatio="xMaxYMax meet" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`pk-sky-${variant}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#dbe9fb" stopOpacity="0" />
          <stop offset=".45" stopColor="#cfe1fa" stopOpacity=".7" />
          <stop offset="1" stopColor="#b9d3f5" />
        </linearGradient>
        <linearGradient id={`pk-swoosh-${variant}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffd49c" stopOpacity=".2" />
          <stop offset="1" stopColor="#f7a23c" stopOpacity=".85" />
        </linearGradient>
      </defs>
      <path d="M120 0 H640 V220 H0 C120 160 60 40 120 0 Z" fill={`url(#pk-sky-${variant})`} />
      <path d="M300 0 C360 70 380 120 330 220 H390 C440 120 420 60 360 0 Z" fill={`url(#pk-swoosh-${variant})`} opacity=".55" />
      {/* skyline */}
      <g fill="#a9c6ee" opacity=".75">
        <rect x="380" y="70" width="26" height="150" rx="3" />
        <rect x="410" y="40" width="30" height="180" rx="3" />
        <rect x="444" y="90" width="22" height="130" rx="3" />
        <rect x="470" y="60" width="34" height="160" rx="3" />
        <path d="M512 220 V100 L530 80 L548 100 V220 Z" />
      </g>
      <g fill="#ffffff" opacity=".55">
        {[0, 1, 2, 3, 4, 5].map((row) => [0, 1].map((col) => <rect key={`${row}-${col}`} x={415 + col * 12} y={52 + row * 20} width="6" height="9" rx="1" />))}
      </g>
      {variant === "batch" ? (
        <g>
          {/* open book + cubes */}
          <path d="M380 200 C420 176 470 176 500 196 C530 176 580 176 620 200 V214 H380 Z" fill="#6f9fe4" />
          <path d="M392 196 C430 170 470 170 500 190 V206 C470 188 430 188 392 206 Z" fill="#ffffff" />
          <path d="M608 196 C570 170 530 170 500 190 V206 C530 188 570 188 608 206 Z" fill="#eef4fd" />
          {[[420, 150], [450, 120], [560, 110], [590, 140]].map(([x, y]) => (
            <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
              <path d="M0 8 L12 0 L24 8 L12 16 Z" fill="#9dc0f2" />
              <path d="M0 8 V22 L12 30 V16 Z" fill="#6f9fe4" />
              <path d="M24 8 V22 L12 30 V16 Z" fill="#4f84d6" />
            </g>
          ))}
        </g>
      ) : (
        <g>
          {/* books + graduation cap */}
          <rect x="470" y="180" width="130" height="16" rx="4" fill="#5b8fdc" />
          <rect x="480" y="164" width="116" height="16" rx="4" fill="#8db3ea" />
          <rect x="474" y="148" width="122" height="16" rx="4" fill="#3e74c9" />
          <path d="M470 110 L540 86 L610 110 L540 134 Z" fill="#244f96" />
          <path d="M500 122 V142 C520 154 560 154 580 142 V122 L540 134 Z" fill="#2f63b3" />
          <path d="M606 112 V136" stroke="#f39924" strokeWidth="3" strokeLinecap="round" />
          <circle cx="606" cy="140" r="4" fill="#f39924" />
        </g>
      )}
      {/* leaves */}
      <g fill="#7aa7e8" opacity=".85">
        <path d="M600 220 C590 170 600 130 630 100 C640 140 630 190 600 220 Z" />
        <path d="M590 220 C570 190 560 160 568 130 C595 150 600 190 590 220 Z" opacity=".7" />
      </g>
    </svg>
  );
}

function Initials({ name = "" }) {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  const text = parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : (parts[0]?.[0] ?? "?");
  return text.toUpperCase();
}

/** Person hero (Employee profile, Mentor profile). */
export function ProfileHero({
  name,
  status,
  statusTone = "green",
  avatarText,
  avatarTone = "orange",
  photo,
  online = false,
  subline,
  email,
  phone,
  location,
  tiles = [],
  action,
  image,
}) {
  return (
    <section className="pk-hero" aria-label={`${name} profile`}>
      <div className="pk-hero__art" aria-hidden="true">
        {image ? <img src={image} alt="" /> : <ProfileHeroArt />}
      </div>
      <div className={`pk-avatar pk-avatar--${avatarTone}`}>
        <AvatarPhoto src={photo} fallback={avatarText ?? <Initials name={name} />} />
        {online && <span className="pk-avatar__dot" aria-label="Online" />}
      </div>
      <div className="pk-hero__copy">
        <div className="pk-hero__titlerow">
          <h1>{name}</h1>
          {status && <span className={`pk-status pk-status--${statusTone}`}><i />{status}</span>}
        </div>
        {subline && <p className="pk-hero__subline">{subline}</p>}
        <ul className="pk-hero__contacts">
          <li><span><Mail /></span>{email || "-"}</li>
          <li><span><Phone /></span>{phone || "-"}</li>
          <li><span><MapPin /></span>{location || "-"}</li>
        </ul>
      </div>
      {tiles.length > 0 && (
        <div className="pk-hero__tiles">
          {tiles.map(({ icon: Icon, label, value }) => (
            <div key={label} className="pk-hero__tile">
              <span aria-hidden="true"><Icon /></span>
              <div><small>{label}</small><b>{value || "-"}</b></div>
            </div>
          ))}
        </div>
      )}
      {action && <div className="pk-hero__action">{action}</div>}
    </section>
  );
}

/** Batch hero (Batch details). */
export function EntityHero({ icon: Icon, title, status, statusTone = "green", lines = [], meta = [], action, image, compact = false, aside }) {
  return (
    <section className={`pk-hero pk-hero--entity ${compact ? "is-compact" : ""}`} aria-label={String(title)}>
      <div className="pk-hero__art" aria-hidden="true">
        {image ? <img src={image} alt="" /> : <ProfileHeroArt variant="batch" />}
      </div>
      <span className="pk-entity-icon" aria-hidden="true"><Icon /></span>
      <div className="pk-hero__copy">
        <div className="pk-hero__titlerow">
          <h1>{title}</h1>
          {status && <span className={`pk-status pk-status--${statusTone}`}><i />{status}</span>}
        </div>
        {lines.length > 0 && (
          <p className="pk-hero__lines">
            {lines.map(([label, value], index) => (
              <span key={label}>{index > 0 && <em aria-hidden="true">|</em>}{label}: <b>{value || "-"}</b></span>
            ))}
          </p>
        )}
        {meta.length > 0 && (
          <ul className="pk-hero__meta">
            {meta.map(({ icon: MetaIcon, text }) => <li key={text}><MetaIcon aria-hidden="true" />{text}</li>)}
          </ul>
        )}
      </div>
      {aside && <div className="pk-hero__aside">{aside}</div>}
      {action && <div className="pk-hero__action">{action}</div>}
    </section>
  );
}

/** White tab bar; active tab is an orange pill. items: [{ id, label, icon }] */
export function ProfileTabs({ items, active, onChange, label = "Sections" }) {
  return (
    <nav className="pk-tabs" aria-label={label}>
      {items.map(({ id, label: text, icon: Icon }) => (
        <button key={id} type="button" aria-current={active === id ? "page" : undefined} onClick={() => onChange(id)}>
          {Icon && <Icon aria-hidden="true" />}
          {text}
        </button>
      ))}
    </nav>
  );
}

/** Section title with a soft icon tile and an optional right-hand slot. */
export function SectionHead({ icon: Icon, title, subtitle, children, tone = "blue" }) {
  return (
    <div className="pk-section-head">
      {Icon && <span className={`pk-section-head__icon is-${tone}`} aria-hidden="true"><Icon /></span>}
      <div className="min-w-0 flex-1">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children && <div className="pk-section-head__tools">{children}</div>}
    </div>
  );
}

/**
 * KPI tile — rendered with the global KPI card so profile and detail pages
 * match every other portal. `sub`, else `badge`, else `link` becomes the
 * description line; clickable tiles get the KPI arrow.
 * tone: blue | green | purple | orange | red | pink
 * (`bars`, `labelFirst` and `size` are accepted for compatibility.)
 */
// eslint-disable-next-line no-unused-vars
export function StatTile({ icon, tone = "blue", label, value, sub, link, onClick, badge, bars, labelFirst, size }) {
  return (
    <KPI
      label={label}
      value={value}
      description={sub ?? (badge != null ? String(badge) : link)}
      icon={icon}
      accent={tone === "pink" ? "red" : tone}
      onClick={onClick}
    />
  );
}

/** Card with a header (icon + title) and optional action. */
export function PanelCard({ icon: Icon, title, action, children, className = "", tone = "navy" }) {
  return (
    <section className={`pk-panel ${className}`}>
      <header className="pk-panel__head">
        {Icon && <span className={`pk-panel__icon is-${tone}`} aria-hidden="true"><Icon /></span>}
        <h3>{title}</h3>
        {action && <div className="ml-auto">{action}</div>}
      </header>
      <div className="pk-panel__body">{children}</div>
    </section>
  );
}

/** Status pill used across the kit. */
export function StatusPill({ status }) {
  const value = String(status ?? "").toLowerCase();
  const tone = /inactive|cancel|absent|reject/.test(value) ? "red"
    : /incomplete|late|half|pending|leave/.test(value) ? "orange"
      : /active|present|live|ongoing|complete/.test(value) ? "green"
        : /upcoming|scheduled/.test(value) ? "blue" : "gray";
  return <span className={`pk-status pk-status--${tone}`}><i />{status || "-"}</span>;
}

ProfileHero.propTypes = { name: PropTypes.node, tiles: PropTypes.array };
EntityHero.propTypes = { icon: PropTypes.elementType, title: PropTypes.node };
ProfileTabs.propTypes = { items: PropTypes.array.isRequired, active: PropTypes.string, onChange: PropTypes.func.isRequired };
StatTile.propTypes = { icon: PropTypes.elementType.isRequired };
