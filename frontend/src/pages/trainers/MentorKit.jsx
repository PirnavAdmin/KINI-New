import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Briefcase, MoreVertical } from "lucide-react";
import { AvatarPhoto } from "@/components/common/ProfileImage";
import { initialsOf, statusKey } from "./mentorDirectory";

// Small pieces shared by the mentor directory and the selected-mentor panel.

const AVATAR_TONES = ["is-peach", "is-violet", "is-sky", "is-mint"];

/** Round avatar: the uploaded photo, else initials; optional status dot. */
export function MentorAvatar({ name, photo, status, size = "md" }) {
  const tone = AVATAR_TONES[(name.charCodeAt(0) || 0) % AVATAR_TONES.length];
  return (
    <span className={`mw-avatar is-${size} ${tone}`}>
      <span className="mw-avatar__img"><AvatarPhoto src={photo} fallback={initialsOf(name)} /></span>
      {status && <span className={`mw-avatar__dot is-${statusKey(status)}`} aria-hidden="true" />}
    </span>
  );
}

export function StatusBadge({ status }) {
  return <span className={`mw-badge is-${statusKey(status)}`}><span className="mw-badge__dot" aria-hidden="true" />{status}</span>;
}

export function TypeBadge({ type, icon = false }) {
  if (!type) return null;
  return <span className="mw-badge is-type">{icon && <Briefcase aria-hidden="true" />}{type}</span>;
}

// Additional actions, handled by TrainersPage.handleAction.
const MENTOR_MENU = ["Assign Batch", "Manage Schedule", "Performance", "Message", "Export Profile"];

/** The ⋮ menu: existing mentor actions plus the status change. */
export function MentorActionsMenu({ trainer, onAction, onDeactivate }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const ref = useRef(null);
  const menuRef = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    menuRef.current?.querySelector("[role=menuitem]")?.focus();
    const close = (event) => { if (!ref.current?.contains(event.target) && !event.target.closest("[data-mentor-menu]")) setOpen(false); };
    const key = (event) => {
      if (event.key === "Escape") { setOpen(false); ref.current?.querySelector("button")?.focus(); return; }
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      const items = [...(menuRef.current?.querySelectorAll("[role=menuitem]") ?? [])];
      const index = items.indexOf(document.activeElement);
      event.preventDefault();
      items[(index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus();
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", key); };
  }, [open]);
  if (!onAction && !onDeactivate) return null;
  const run = (fn) => { setOpen(false); fn(); };
  const nextStatus = trainer.status === "Active" ? "Inactive" : "Active";
  const item = "rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 focus:bg-slate-50 focus:outline-none dark:text-slate-200 dark:hover:bg-slate-800";
  return (
    <span className="relative" ref={ref}>
      <button type="button" className="mw-icon-btn" aria-label={`More actions for ${trainer.name}`} aria-haspopup="menu" aria-expanded={open} onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const width = 200;
        const height = 300;
        setPosition({
          left: Math.min(Math.max(8, rect.right - width), window.innerWidth - width - 8),
          top: rect.bottom + height + 8 <= window.innerHeight ? rect.bottom + 6 : Math.max(8, rect.top - height - 6),
        });
        setOpen((value) => !value);
      }}>
        <MoreVertical aria-hidden="true" />
      </button>
      {open && createPortal(
        <span ref={menuRef} data-mentor-menu role="menu" aria-label={`Actions for ${trainer.name}`} className="fixed z-[2200] flex max-h-[min(70vh,24rem)] w-[200px] flex-col overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-900" style={{ top: position.top, left: position.left }}>
          {onAction && MENTOR_MENU.map((label) => (
            <button key={label} type="button" role="menuitem" onClick={() => run(() => onAction(label, trainer))} className={item}>{label}</button>
          ))}
          {onDeactivate && (
            <button type="button" role="menuitem" onClick={() => run(() => onDeactivate(trainer, nextStatus))} className={`${item} font-semibold !text-[#133B5D]`}>
              Mark as {nextStatus.toLowerCase()}
            </button>
          )}
        </span>, document.body,
      )}
    </span>
  );
}
