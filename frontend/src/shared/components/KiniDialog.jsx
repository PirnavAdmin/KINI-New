import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { HeroWaves } from "@features/organization/components/org-ui/OrgIllustrations";

/**
 * KiniDialog — the Kini "hero" dialog used for detail and form popups
 * (leave request, class detail, assessment results, edit student …).
 *
 *  eyebrow   small blue uppercase label above the title (optional)
 *  icon      lucide icon rendered in the blue tile (optional)
 *  art       decorative SVG shown top-right of the header (optional)
 *  meta      node rendered under the subtitle (chips, facts)
 *  footer    node rendered in the sticky footer (buttons)
 *  width     max width in px (default 720)
 *  className extra class on the dialog root, for per-dialog styling
 */
export default function KiniDialog({
  open,
  onClose,
  eyebrow,
  title,
  subtitle,
  meta,
  icon: Icon,
  art,
  children,
  footer,
  width = 720,
  bodyClassName = "",
  artClassName = "",
  headerClassName = "",
  className = "",
  closeLabel = "Close dialog",
}) {
  const titleId = useId();
  const panelRef = useRef(null);
  const lastFocus = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;
    lastFocus.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => panelRef.current?.focus());
    const onKey = (event) => {
      if (event.key === "Escape") onCloseRef.current?.();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKey);
      lastFocus.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className={`kini-dialog fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-5 ${className}`}>
      <button
        type="button"
        aria-label={closeLabel}
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-[#0b1f36]/45 backdrop-blur-[3px]"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        style={{ maxWidth: width }}
        className="relative flex max-h-[calc(100dvh-1.5rem)] w-full flex-col overflow-hidden rounded-[22px] border border-white/70 bg-white shadow-[0_30px_80px_-20px_rgba(11,31,54,.45)] outline-none dark:border-slate-700 dark:bg-slate-900"
      >
        <header className={`relative isolate flex shrink-0 items-start gap-4 overflow-hidden border-b border-[#e8eef6] bg-gradient-to-r from-[#f7faff] via-[#eff5fd] to-[#e3edfb] px-5 py-5 sm:px-7 dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 ${headerClassName}`}>
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-90 dark:opacity-20">
            <HeroWaves tone="blue" />
          </div>
          {Icon && (
            <span className="grid h-[68px] w-[68px] shrink-0 place-items-center rounded-[18px] bg-gradient-to-br from-[#dcebff] to-[#c9defb] text-[#2f6fe4] shadow-[inset_0_1px_0_rgba(255,255,255,.8),0_8px_18px_rgba(47,111,228,.14)] dark:from-slate-700 dark:to-slate-800">
              <Icon className="h-8 w-8" strokeWidth={1.8} aria-hidden="true" />
            </span>
          )}
          <div className="min-w-0 flex-1 pr-2 sm:pr-40">
            {eyebrow && <p className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-[#2f6fe4]">{eyebrow}</p>}
            <h2 id={titleId} className="mt-0.5 text-[26px] font-extrabold leading-tight tracking-tight !text-[#0f2a4a] dark:!text-white">
              {title}
            </h2>
            {subtitle && <p className="mt-1 text-sm leading-5 text-[#5b6f88] dark:text-slate-400">{subtitle}</p>}
            {meta && <div className="mt-2.5">{meta}</div>}
          </div>
          {art && (
            <div aria-hidden="true" className={artClassName || "pointer-events-none absolute bottom-0 right-14 hidden h-[118px] w-[190px] sm:block"}>
              {art}
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white text-[#133b5d] shadow-[0_4px_14px_rgba(15,42,74,.12)] transition hover:bg-[#f6f9fd] dark:bg-slate-800 dark:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className={`min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 ${bodyClassName}`}>{children}</div>
        {footer && (
          <footer className="relative isolate flex shrink-0 flex-wrap items-center justify-end gap-3 overflow-hidden border-t border-[#eef2f7] px-5 py-4 sm:px-7 dark:border-slate-700">
            <svg aria-hidden="true" viewBox="0 0 400 60" preserveAspectRatio="none" className="pointer-events-none absolute bottom-0 left-0 -z-10 h-full w-[45%] opacity-70 dark:opacity-10">
              <path d="M0 60 C60 20 140 18 220 40 C280 56 330 50 400 60 Z" fill="#dbe8fa" />
              <path d="M0 60 C80 38 150 44 230 56 L240 60 Z" fill="#fde7c7" />
            </svg>
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}

/** Label/value row with a soft icon tile (used inside KiniDialog bodies). */
export function KiniDetailRow({ icon: Icon, label, children, aside, tone = "purple" }) {
  const tones = {
    purple: "bg-[#f1ebfe] text-[#7c4ddb]",
    blue: "bg-[#e8f1ff] text-[#2f6fe4]",
    green: "bg-[#e3f7ef] text-[#13a36b]",
    orange: "bg-[#fff1df] text-[#ea8a0b]",
  };
  return (
    <div className="flex min-h-[64px] items-center gap-4 rounded-2xl border border-[#edf1f7] bg-white px-3.5 py-2.5 dark:border-slate-700 dark:bg-slate-900">
      {Icon && (
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tones[tone] || tones.purple}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      )}
      <span className="w-28 shrink-0 text-[15px] text-[#4b5f78] dark:text-slate-400">{label}</span>
      <div className="min-w-0 flex-1 text-[15px] font-semibold text-[#0f2a4a] dark:text-white">{children}</div>
      {aside && <div className="shrink-0">{aside}</div>}
    </div>
  );
}
