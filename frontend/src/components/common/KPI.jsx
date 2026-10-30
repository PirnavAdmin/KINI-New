import { isValidElement } from "react";
import { Link } from "react-router-dom";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { resolveKpiAccent } from "./kpiAccents";
import "./KPI.css";

const TREND = {
  positive: ArrowUpRight,
  negative: ArrowDownRight,
  neutral: ArrowRight,
};

const formatValue = (value) =>
  typeof value === "number" && Number.isFinite(value)
    ? value.toLocaleString("en-IN")
    : value ?? "—";

/**
 * KPI — the one Kini EduHub KPI card, used by every portal. Presentation
 * only: every value, label and description comes from the caller's real data.
 *
 *   <KPI label="Total Batches" value={totalBatches} description="Assigned to you"
 *        icon={Layers3} accent="blue" onClick={() => showStatus("all")} />
 *
 * Design (KPI.css): 3px accent bar, circular icon, label → value →
 * description, soft accent wave bottom-right, and a round arrow top-right
 * only when the card actually navigates (onClick or `to`).
 *
 * label / title  card heading (`title` is accepted as an alias when no label)
 * value          the figure; numbers are formatted for en-IN
 * description    small line under the value
 * icon           lucide icon component, or a ready-made element (e.g. a progress ring)
 * accent / accentColor  "blue" | "green" | "orange" | "purple" | "red" | "teal" |
 *                "cyan" | "navy", a hex colour, or a { accent, soft, icon, wave } object
 * onClick / to   makes the card a button / router link (adds the arrow)
 * loading        skeleton lines, never a placeholder number
 * error          value failed to load → "—" + "Unavailable"; with onRetry the card retries
 * trend          optional short text ("+12%"); trendType "positive" | "negative" | "neutral"
 *
 * Older layout props (variant, decoration, iconShape, size, showArrow) are
 * still accepted so existing callers keep working, but no longer change the
 * design — every card looks the same. showArrow={false} hides the arrow.
 */
export default function KPI({
  value,
  label,
  title,
  description,
  descriptionColor,
  icon: Icon,
  accent,
  accentColor,
  trend,
  trendType = "neutral",
  clickable,
  onClick,
  to,
  loading = false,
  error,
  onRetry,
  suffix,
  ariaLabel,
  showArrow,
  className = "",
  // Accepted for compatibility; the design is fixed.
  // eslint-disable-next-line no-unused-vars
  variant, size, iconShape, decoration,
}) {
  const heading = label ?? title;
  const tone = resolveKpiAccent(accentColor ?? accent ?? "blue");
  const isError = !loading && Boolean(error);
  const handleClick = isError && onRetry ? onRetry : onClick;
  const isLink = Boolean(to) && !isError;
  const interactive = isLink || Boolean(handleClick) || (clickable && Boolean(onClick));
  // The arrow means "this card goes somewhere"; a retry or a static card has none.
  const arrow = interactive && !isError && showArrow !== false;
  const shownValue = isError ? "—" : formatValue(value);
  const TrendIcon = TREND[trendType] || TREND.neutral;

  const label_ = isError ? "unavailable, retry" : `${shownValue}${suffix ? ` ${suffix}` : ""}`;
  const accessibleName = ariaLabel ?? (interactive
    ? `${heading}: ${label_}${description && !isError ? `. ${description}` : ""}`
    : undefined);

  const classes = `kini-kpi ${interactive ? "is-interactive" : ""} ${arrow ? "has-arrow" : ""} ${className}`.replace(/\s+/g, " ").trim();
  const style = { "--kpi-accent": tone.accent, "--kpi-soft": tone.soft, "--kpi-icon": tone.icon };

  const content = (
    <>
      <span aria-hidden="true" className="kini-kpi__bar" />
      <svg aria-hidden="true" viewBox="0 0 200 70" preserveAspectRatio="none" className="kini-kpi__wave">
        <path d="M0 70 C40 68 70 40 120 30 C150 24 180 22 200 18 V70 Z" fill={tone.accent} fillOpacity={tone.wave} />
        <path d="M60 70 C95 66 120 48 150 42 C175 37 190 34 200 32 V70 Z" fill={tone.accent} fillOpacity={tone.wave * 1.25} />
      </svg>
      {arrow && (
        <span aria-hidden="true" className="kini-kpi__arrow">
          <ArrowRight strokeWidth={2.4} />
        </span>
      )}
      {Icon && (
        <span aria-hidden="true" className="kini-kpi__icon">
          {isValidElement(Icon) ? Icon : <Icon strokeWidth={2} />}
        </span>
      )}
      <span className="kini-kpi__body">
        {loading ? (
          <>
            <span aria-hidden="true" className="kini-kpi__skeleton" style={{ width: "62%", height: 14 }} />
            <span aria-hidden="true" className="kini-kpi__skeleton" style={{ width: 52, height: 24, marginTop: 6 }} />
            <span aria-hidden="true" className="kini-kpi__skeleton" style={{ width: "48%", height: 11, marginTop: 6 }} />
            <span className="sr-only">Loading {heading}</span>
          </>
        ) : (
          <>
            <span className="kini-kpi__label" title={typeof heading === "string" ? heading : undefined} style={{ display: "block" }}>{heading}</span>
            <span className="kini-kpi__valuerow">
              <span className={`kini-kpi__value ${isError ? "is-muted" : ""}`}>
                {shownValue}
                {suffix && !isError && <span className="kini-kpi__suffix">{suffix}</span>}
              </span>
              {trend && !isError && (
                <span className={`kini-kpi__trend is-${TREND[trendType] ? trendType : "neutral"}`}>
                  <TrendIcon aria-hidden="true" />
                  {trend}
                </span>
              )}
            </span>
            {isError ? (
              <span className="kini-kpi__desc is-error" style={{ display: "block" }} title={typeof error === "string" ? error : undefined}>
                {onRetry ? "Unavailable — retry" : "Unavailable"}
              </span>
            ) : (
              description && (
                <span
                  className="kini-kpi__desc"
                  title={typeof description === "string" ? description : undefined}
                  style={{ display: "block", ...(descriptionColor ? { color: descriptionColor } : {}) }}
                >
                  {description}
                </span>
              )
            )}
          </>
        )}
      </span>
    </>
  );

  if (isLink) {
    return (
      <Link to={to} data-ui="kpi-card" className={classes} style={style} aria-label={accessibleName}>
        {content}
      </Link>
    );
  }
  const Tag = interactive ? "button" : "div";
  return (
    <Tag
      {...(interactive ? { type: "button", onClick: handleClick } : {})}
      data-ui="kpi-card"
      className={classes}
      style={style}
      aria-label={accessibleName}
    >
      {content}
    </Tag>
  );
}
