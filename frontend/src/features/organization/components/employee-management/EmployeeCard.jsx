import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  Briefcase,
  Building2,
  CalendarDays,
  Edit3,
  Layers3,
  Mail,
  MapPin,
  MoreVertical,
  Phone,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserRound,
  UserX,
} from "lucide-react";
import { normalizeEmployeeStatus } from "@shared/utils/employeePresentation";
import { AvatarPhoto } from "@/components/common/ProfileImage";
import { avatarToneFor, employeeDisplayName, employeeInitials, formatDate, realValue } from "./employeeCardFormat";
import "./employee-cards.css";

/* ──────────────────────────────────────────────────────────────────────
   One employee as a profile card (Organization → Employees). Presentation
   only: every value comes from the page's normalized employee record, and
   optional fields that the API did not return are left out rather than
   invented (see employeeCardFormat.js). Styles: employee-cards.css.
   ────────────────────────────────────────────────────────────────────── */

function MoreMenu({ name, items }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    wrapRef.current?.querySelector("[role=menuitem]")?.focus();
    const outside = (event) => { if (!wrapRef.current?.contains(event.target)) setOpen(false); };
    const keys = (event) => {
      if (event.key === "Escape") { setOpen(false); buttonRef.current?.focus(); return; }
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      const entries = [...(wrapRef.current?.querySelectorAll("[role=menuitem]") ?? [])];
      const index = entries.indexOf(document.activeElement);
      const next = entries[(index + (event.key === "ArrowDown" ? 1 : -1) + entries.length) % entries.length];
      event.preventDefault();
      next?.focus();
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", keys);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", keys);
    };
  }, [open]);
  if (!items.length) return null;
  return (
    <div className="ec-menu" ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        className="ec-icon-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`More actions for ${name}`}
        onClick={() => setOpen((value) => !value)}
      >
        <MoreVertical aria-hidden="true" />
      </button>
      {open && (
        <div role="menu" aria-label={`Actions for ${name}`} className="ec-menu__list">
          {items.map(({ label, icon: Icon, onSelect, danger, disabled }) => (
            <button
              key={label}
              type="button"
              role="menuitem"
              disabled={disabled}
              className={`ec-menu__item${danger ? " is-danger" : ""}`}
              onClick={() => { setOpen(false); onSelect(); }}
            >
              <Icon aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * actions: { onOpen, onAccess?, onEdit?, onDelete?, onStatusChange? } — a
 * missing handler hides its control (the page passes them per permission).
 */
export default function EmployeeCard({ employee, photoUrl, selected, onToggleSelect, accessLabel, savingStatus, actions }) {
  const name = employeeDisplayName(employee);
  const tone = avatarToneFor(employee);
  const designation = realValue(employee.designation) || realValue(employee.role);
  const employmentType = realValue(employee.employmentType);
  const department = realValue(employee.department);
  const branch = realValue(employee.branch);
  const email = realValue(employee.email);
  const phone = realValue(employee.phone ?? employee.mobile);
  const joined = formatDate(employee.joiningDate ?? employee.dateOfJoining ?? employee.joinedAt);
  const leaveFrom = formatDate(employee.leaveFromDate);
  const leaveTo = formatDate(employee.leaveToDate);
  const employeeId = employee.employeeId ?? employee.id;
  const isInactive = String(employee.status ?? "").toLowerCase() === "inactive";
  const status = normalizeEmployeeStatus(employee.status);
  const statusKey = status === "active" ? "active" : status === "inactive" ? "inactive" : "other";
  const statusLabel = status.replace(/(^|[\s-])\w/g, (letter) => letter.toUpperCase());
  const typeKey = { "Full-time": "full", "Part-time": "part", Contract: "contract", Intern: "intern" }[employmentType] ?? "other";

  const menuItems = [
    { label: "View profile", icon: UserRound, onSelect: actions.onOpen },
    actions.onStatusChange && {
      label: isInactive ? "Mark as active" : "Mark as inactive",
      icon: isInactive ? UserCheck : UserX,
      onSelect: () => actions.onStatusChange(isInactive ? "active" : "inactive"),
      disabled: savingStatus,
    },
    actions.onDelete && { label: "Delete employee", icon: Trash2, onSelect: actions.onDelete, danger: true },
  ].filter(Boolean);

  return (
    <article className={`ec-card${selected ? " is-selected" : ""}`} aria-label={name}>
      {/* Decorative banner, drawn in CSS (employee-cards.css). */}
      <div className="ec-banner" aria-hidden="true"><span className="ec-banner__dots" /></div>
      <div className="ec-card__tools">
        <label className="ec-check-wrap">
          <input
            type="checkbox"
            className="ec-check"
            checked={selected}
            onChange={onToggleSelect}
            aria-label={`Select ${name}`}
          />
        </label>
        <MoreMenu name={name} items={menuItems} />
      </div>
      <header className="ec-card__head">
        <span className={`ec-avatar is-${statusKey}`} aria-hidden="true" style={{ backgroundColor: tone.bg, color: tone.fg }}>
          <AvatarPhoto src={photoUrl} fallback={employeeInitials(employee)} />
          <span className="ec-avatar__status" />
        </span>
        <div className="ec-card__identity">
          <button type="button" className="ec-card__name" onClick={actions.onOpen} title={name}>
            {name}
          </button>
          <p className="ec-card__role" title={designation || undefined}>
            {designation || "No designation"}
            {employeeId != null && <span className="ec-card__id"> · ID {employeeId}</span>}
          </p>
        </div>
      </header>

      <div className="ec-badges">
        {/* The employee's real status and employment type, each in its own colour. */}
        <span className={`ec-badge ec-status is-${statusKey}`}>
          <span className="ec-status__dot" aria-hidden="true" />
          {statusLabel}
        </span>
        {employmentType && <span className={`ec-badge is-type is-${typeKey}`}><Briefcase aria-hidden="true" />{employmentType}</span>}
      </div>
      {leaveFrom && leaveTo && (
        <p className="ec-leave"><CalendarDays aria-hidden="true" /> On leave {leaveFrom} – {leaveTo}</p>
      )}

      <dl className="ec-details">
        <div>
          <dt className="is-blue"><Mail aria-hidden="true" /><span className="sr-only">Email</span></dt>
          <dd>
            {email ? (
              // The name part truncates; the domain always stays visible.
              <a href={`mailto:${email}`} title={email} aria-label={`Email ${email}`} className="ec-email">
                <span className="ec-email__local">{email.includes("@") ? email.slice(0, email.lastIndexOf("@")) : email}</span>
                {email.includes("@") && <span className="ec-email__domain">{email.slice(email.lastIndexOf("@"))}</span>}
              </a>
            ) : <span className="ec-muted">Not provided</span>}
          </dd>
        </div>
        <div>
          <dt className="is-lavender"><Phone aria-hidden="true" /><span className="sr-only">Phone</span></dt>
          <dd>{phone ? <a href={`tel:${phone.replace(/[^\d+]/g, "")}`}>{phone}</a> : <span className="ec-muted">Not provided</span>}</dd>
        </div>
        {branch && (
          <div>
            <dt className="is-orange"><MapPin aria-hidden="true" /><span className="sr-only">Branch</span></dt>
            <dd title={branch}>{branch}</dd>
          </div>
        )}
        {!branch && department && (
          <div>
            <dt className="is-orange"><Building2 aria-hidden="true" /><span className="sr-only">Department</span></dt>
            <dd title={department}>{department}</dd>
          </div>
        )}
        {Number(employee.batchCount) > 0 && (
          <div>
            <dt className="is-orange" aria-hidden="true"><Layers3 /></dt>
            <dd>Mentoring {employee.batchCount} batch{Number(employee.batchCount) === 1 ? "" : "es"}</dd>
          </div>
        )}
        {joined && (
          <div>
            <dt className="is-slate" aria-hidden="true"><CalendarDays /></dt>
            <dd>Joined {joined}</dd>
          </div>
        )}
      </dl>

      {(actions.onAccess || actions.onEdit) && (
        <footer className="ec-card__foot">
          {actions.onAccess && (
            <button type="button" className="ec-btn is-access" onClick={actions.onAccess} title={accessLabel} aria-label={`${accessLabel} for ${name}`}>
              <ShieldCheck aria-hidden="true" /> Access
            </button>
          )}
          {actions.onEdit && (
            <button type="button" className="ec-btn is-edit" onClick={actions.onEdit} aria-label={`Edit ${name}`}>
              <Edit3 aria-hidden="true" /> Edit
            </button>
          )}
        </footer>
      )}
    </article>
  );
}

export function EmployeeCardSkeleton() {
  return (
    <div className="ec-card is-skeleton" aria-hidden="true">
      <div className="ec-banner" />
      <div className="ec-card__head">
        <span className="ec-sk ec-sk--avatar" />
        <span className="ec-sk-lines"><span className="ec-sk" style={{ width: "62%" }} /><span className="ec-sk" style={{ width: "40%" }} /></span>
      </div>
      <div className="ec-badges"><span className="ec-sk ec-sk--pill" /><span className="ec-sk ec-sk--pill" /></div>
      <div className="ec-details"><span className="ec-sk" style={{ width: "80%" }} /><span className="ec-sk" style={{ width: "50%" }} /></div>
      <div className="ec-card__foot"><span className="ec-sk ec-sk--btn" /><span className="ec-sk ec-sk--btn" /></div>
    </div>
  );
}

MoreMenu.propTypes = { name: PropTypes.string.isRequired, items: PropTypes.array.isRequired };
EmployeeCard.propTypes = {
  employee: PropTypes.object.isRequired,
  photoUrl: PropTypes.string,
  selected: PropTypes.bool,
  onToggleSelect: PropTypes.func.isRequired,
  accessLabel: PropTypes.string,
  savingStatus: PropTypes.bool,
  actions: PropTypes.shape({
    onOpen: PropTypes.func.isRequired,
    onAccess: PropTypes.func,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    onStatusChange: PropTypes.func,
  }).isRequired,
};
