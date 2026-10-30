import PropTypes from "prop-types";
import { ArrowRight } from "lucide-react";

/* ──────────────────────────────────────────────────────────────────────
   Organization dashboard building blocks. Every widget on the dashboard is
   a Panel: one header (tinted icon chip, title, optional subtitle, one
   link) and a body. Styling lives in org-dashboard.css (`kd-` classes).
   ────────────────────────────────────────────────────────────────────── */

export function PanelLink({ children, onClick, tone }) {
  return (
    <button type="button" className={`kd-link${tone ? ` is-${tone}` : ""}`} onClick={onClick}>
      {children}
      <ArrowRight aria-hidden="true" />
    </button>
  );
}

/** action: { label, onClick, tone? } — tone "orange" for finance/analytics links. */
export function Panel({ icon: Icon, tone = "blue", title, subtitle, action, className = "", bodyClassName = "", children, ...rest }) {
  return (
    <section className={`kd-panel ${className}`.trim()} {...rest}>
      <header className="kd-panel__head">
        {Icon && <span className={`kd-chip is-${tone}`} aria-hidden="true"><Icon /></span>}
        <div className="kd-panel__titles">
          <h2 className="kd-panel__title">{title}</h2>
          {subtitle && <p className="kd-panel__subtitle">{subtitle}</p>}
        </div>
        {action && <PanelLink onClick={action.onClick} tone={action.tone}>{action.label}</PanelLink>}
      </header>
      <div className={`kd-panel__body ${bodyClassName}`.trim()}>{children}</div>
    </section>
  );
}

/** Empty states point at the next step: a short line and, when useful, one action. */
export function EmptyState({ icon: Icon, art, text, action, boxed = false }) {
  return (
    <div className={`kd-empty${boxed ? " is-boxed" : ""}`}>
      {art ? (
        <img src={art} width="120" height="120" alt="" aria-hidden="true" loading="lazy" decoding="async" className="kd-empty__art" />
      ) : Icon && <span className="kd-empty__icon" aria-hidden="true"><Icon /></span>}
      <p>{text}</p>
      {action && (
        <button type="button" className={`kd-soft-btn is-${action.tone ?? "blue"}`} onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}

/** Percentage bar; width animates in once (disabled for reduced motion). */
export function ProgressBar({ value, tone = "blue", label }) {
  const width = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <span className={`kd-bar is-${tone}`} role="img" aria-label={label ?? `${width}%`}>
      <i style={{ width: `${width}%` }} />
    </span>
  );
}

PanelLink.propTypes = { children: PropTypes.node, onClick: PropTypes.func, tone: PropTypes.string };
Panel.propTypes = {
  icon: PropTypes.elementType,
  tone: PropTypes.string,
  title: PropTypes.node.isRequired,
  subtitle: PropTypes.node,
  action: PropTypes.shape({ label: PropTypes.node, onClick: PropTypes.func, tone: PropTypes.string }),
  className: PropTypes.string,
  bodyClassName: PropTypes.string,
  children: PropTypes.node,
};
EmptyState.propTypes = {
  icon: PropTypes.elementType,
  art: PropTypes.string,
  text: PropTypes.node.isRequired,
  action: PropTypes.shape({ label: PropTypes.node, onClick: PropTypes.func, tone: PropTypes.string }),
  boxed: PropTypes.bool,
};
ProgressBar.propTypes = { value: PropTypes.number, tone: PropTypes.string, label: PropTypes.string };
