import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, MoreVertical } from "lucide-react";
import KPI from "@/components/common/KPI";
import { HeroWaves } from "./OrgIllustrations";
import "./org-page-kit.css";

export const TONE_COLORS = {
  blue: "#2f6fe4",
  orange: "#f08a1c",
  purple: "#7c4ddb",
  green: "#17a468",
  red: "#e5484d",
  teal: "#0f9f96",
  amber: "#f2a516",
  slate: "#64748b",
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export const formatINR = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export const toDate = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const monthKey = (date) => date.getFullYear() * 12 + date.getMonth();

/**
 * Month-over-month change for the items matching `predicate`.
 * Returns a whole-number percentage (0 when there is no history to compare).
 */
export function monthOverMonth(items, getDate, predicate = () => true, getValue = () => 1) {
  const now = new Date();
  const current = monthKey(now);
  let thisMonth = 0;
  let lastMonth = 0;
  for (const item of items) {
    if (!predicate(item)) continue;
    const date = toDate(getDate(item));
    if (!date) continue;
    const key = monthKey(date);
    if (key === current) thisMonth += Number(getValue(item) || 0);
    else if (key === current - 1) lastMonth += Number(getValue(item) || 0);
  }
  if (!lastMonth) return thisMonth ? 100 : 0;
  return Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
}

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

export function OrgPage({ className = "", children }) {
  return <div className={`kx-page ${className}`.trim()}>{children}</div>;
}

export function OrgHero({
  icon: Icon,
  iconVariant = "blue",
  title,
  subtitle,
  tagline,
  taglineStyle = "hand",
  badge,
  art,
  motto,
  quote,
  quoteStyle = "plain",
  action,
  plain = false,
}) {
  return (
    <section className={`kx-hero ${plain ? "kx-hero--plain" : ""}`.trim()} aria-labelledby="kx-hero-title">
      <HeroWaves tone={plain ? "warm" : "blue"} />
      {Icon && (
        <span className={`kx-hero__icon ${iconVariant === "orange" ? "kx-hero__icon--orange" : ""}`.trim()}>
          <Icon aria-hidden="true" />
        </span>
      )}
      <div className="kx-hero__copy">
        <div className="kx-hero__titlerow">
          <h1 id="kx-hero-title" className="kx-hero__title">{title}</h1>
          {badge}
        </div>
        {subtitle && <p className="kx-hero__subtitle">{subtitle}</p>}
        {tagline && (
          <p className={`kx-hero__tagline ${taglineStyle === "italic" ? "kx-hero__tagline--italic" : ""}`.trim()}>
            {tagline}
          </p>
        )}
      </div>
      {art && <div className="kx-hero__art">{art}</div>}
      {motto && (
        <p className="kx-hero__motto" aria-hidden="true">
          {motto.map((word) => <span key={word}>{word}</span>)}
        </p>
      )}
      {(quote || action) && (
        <div className="kx-hero__aside">
          {quote && (
            <p className={`kx-hero__quote ${quoteStyle === "card" ? "kx-hero__quote--card" : ""}`.trim()}>
              {quote.map((line, index) => (
                <span key={line} style={{ display: "block" }}>
                  {index === 0 ? "“" : ""}{line}{index === quote.length - 1 ? "”" : ""}
                </span>
              ))}
            </p>
          )}
          {action}
        </div>
      )}
    </section>
  );
}

export function OrgTabs({ tabs, active, onChange, label = "Sections" }) {
  return (
    <div className="kx-tabs" role="tablist" aria-label={label}>
      {tabs.map(([id, text]) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={active === id}
          className="kx-tab"
          onClick={() => onChange(id)}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* KPI                                                                 */
/* ------------------------------------------------------------------ */

// Organization KPI card — renders the shared compact KPI (components/common/KPI),
// the same card as the Organization dashboard. Legacy visual props
// (tinted, capsLabel, sparkline, largeIcon) are accepted but no longer change
// the look, so every Organization KPI shares one design.
const KPI_TONE_BY_KIT_TONE = { blue: "blue", orange: "orange", purple: "purple", green: "green", red: "red", teal: "teal", amber: "orange", slate: "navy" };
export function OrgKpiCard({
  icon,
  tone = "blue",
  label,
  value,
  hint,
  trend,
  trendInvert = false,
  loading = false,
  onClick,
  decoration,
}) {
  const numeric = Number(trend) || 0;
  const good = trendInvert ? numeric < 0 : numeric > 0;
  const bad = trendInvert ? numeric > 0 : numeric < 0;
  const hasTrend = trend !== undefined && trend !== null;
  return (
    <KPI
      value={value}
      label={label}
      description={hint ?? (hasTrend ? "vs last month" : undefined)}
      icon={icon}
      accent={KPI_TONE_BY_KIT_TONE[tone] ?? "blue"}
      trend={hasTrend ? `${numeric > 0 || (numeric === 0 && !trendInvert) ? "+" : ""}${numeric}%` : undefined}
      trendType={good ? "positive" : bad ? "negative" : "neutral"}
      loading={loading}
      onClick={onClick}
      clickable={Boolean(onClick)}
      showArrow={Boolean(onClick)}
      title={typeof value === "string" || typeof value === "number" ? String(value) : undefined}
      size="compact"
      decoration={decoration}
      className="h-full"
    />
  );
}

/* ------------------------------------------------------------------ */
/* Panels, inputs                                                      */
/* ------------------------------------------------------------------ */

export function OrgPanel({ icon: Icon, tone = "blue", bareIcon = false, title, subtitle, action, flush = false, className = "", children }) {
  return (
    <section className={`kx-panel ${flush ? "kx-panel--flush" : ""} ${className}`.trim()}>
      {(title || action) && (
        <header className="kx-panel__head">
          <div className={`kx-panel__title kx-tone-${tone}`}>
            {Icon && (
              <span className={`kx-panel__title-icon ${bareIcon ? "kx-panel__title-icon--bare" : ""}`.trim()}>
                <Icon aria-hidden="true" />
              </span>
            )}
            <div style={{ minWidth: 0 }}>
              {title && <h2 className="kx-panel__heading">{title}</h2>}
              {subtitle && <p className="kx-panel__sub">{subtitle}</p>}
            </div>
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function OrgSearch({ value, onChange, placeholder, icon: Icon, label }) {
  return (
    <label className="kx-search">
      {Icon && <Icon aria-hidden="true" />}
      <span className="sr-only">{label || placeholder}</span>
      <input
        className="kx-input"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

export function OrgSelect({ value, onChange, options, icon: Icon, label, compact = false, auto = false }) {
  const classes = ["kx-select", Icon ? "kx-select--lead" : "", compact ? "kx-select--compact" : "", auto ? "kx-select--auto" : ""]
    .filter(Boolean)
    .join(" ");
  return (
    <label className={classes}>
      {Icon && <Icon className="kx-select__lead" aria-hidden="true" />}
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} aria-label={label}>
        {options.map((option) => {
          const [optionValue, optionLabel] = Array.isArray(option) ? option : [option, option];
          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
      <ChevronDown className="kx-select__chev" aria-hidden="true" />
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Table helpers                                                       */
/* ------------------------------------------------------------------ */

export function OrgPagination({ page, pageCount, onChange }) {
  const pages = [];
  const total = Math.max(1, pageCount);
  const start = Math.max(1, Math.min(page - 2, total - 4));
  for (let index = start; index <= Math.min(total, start + 4); index += 1) pages.push(index);
  return (
    <nav className="kx-pager" aria-label="Pagination">
      <button type="button" onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Previous page">
        <ChevronLeft aria-hidden="true" />
      </button>
      {pages.map((number) => (
        <button
          key={number}
          type="button"
          onClick={() => onChange(number)}
          aria-current={number === page ? "page" : undefined}
        >
          {number}
        </button>
      ))}
      <button type="button" onClick={() => onChange(page + 1)} disabled={page >= total} aria-label="Next page">
        <ChevronRight aria-hidden="true" />
      </button>
    </nav>
  );
}

export function OrgTableFooter({ page, pageSize, total, noun, onPageChange }) {
  const from = total ? (page - 1) * pageSize + 1 : 0;
  const to = Math.min(total, page * pageSize);
  return (
    <div className="kx-table-foot">
      <span>
        Showing {from}–{to} of {total} {noun}
      </span>
      <OrgPagination page={page} pageCount={Math.ceil(total / pageSize)} onChange={onPageChange} />
    </div>
  );
}

export function usePaged(items, pageSize, resetKey) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const [lastKey, setLastKey] = useState(resetKey);
  if (lastKey !== resetKey) {
    setLastKey(resetKey);
    setPage(1);
  }
  const safePage = Math.min(page, pageCount);
  const rows = items.slice((safePage - 1) * pageSize, safePage * pageSize);
  const go = (next) => setPage(Math.min(Math.max(1, next), pageCount));
  return { page: safePage, rows, setPage: go, pageCount };
}

export function OrgStatus({ tone = "success", dot = false, icon: Icon, children }) {
  const toneClass = {
    success: "",
    warn: "kx-status--warn",
    info: "kx-status--info",
    purple: "kx-status--purple",
    danger: "kx-status--danger",
    muted: "kx-status--muted",
  }[tone] ?? "";
  return (
    <span className={`kx-status ${toneClass}`.trim()}>
      {dot && <span className="kx-status__dot" aria-hidden="true" />}
      {Icon && <Icon aria-hidden="true" />}
      {children}
    </span>
  );
}

export function OrgEmpty({ icon: Icon, title, text, action }) {
  return (
    <div className="kx-empty">
      {Icon && (
        <span className="kx-empty__icon">
          <Icon aria-hidden="true" />
        </span>
      )}
      <p className="kx-empty__title">{title}</p>
      {text && <p className="kx-empty__text">{text}</p>}
      {action}
    </div>
  );
}

/** Row "more" menu. Closes on outside click and Escape. */
export function OrgRowMenu({ items, label = "More actions", openUp = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const visible = items.filter(Boolean);
  if (!visible.length) return null;

  return (
    <div className="kx-menu" ref={ref}>
      <button
        type="button"
        className="kx-icon-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((value) => !value)}
      >
        <MoreVertical aria-hidden="true" />
      </button>
      {open && (
        <div className={`kx-menu__list ${openUp ? "kx-menu__list--up" : ""}`.trim()} role="menu">
          {visible.map(({ label: itemLabel, icon: ItemIcon, onClick, danger, disabled }) => (
            <button
              key={itemLabel}
              type="button"
              role="menuitem"
              disabled={disabled}
              className={`kx-menu__item ${danger ? "kx-menu__item--danger" : ""}`.trim()}
              onClick={() => {
                setOpen(false);
                onClick?.();
              }}
            >
              {ItemIcon && <ItemIcon aria-hidden="true" />}
              {itemLabel}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
