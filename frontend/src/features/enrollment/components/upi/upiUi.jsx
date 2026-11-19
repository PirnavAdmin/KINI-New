import { useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";
import toast from "react-hot-toast";

/** Outer card used by every UPI checkout panel. */
export function UpiCard({ theme, className = "", style, children, ...rest }) {
  return (
    <section
      className={`rounded-2xl ${className}`}
      style={{ border: `1px solid ${theme.border}`, backgroundColor: theme.card, boxShadow: theme.shadow, ...style }}
      {...rest}
    >
      {children}
    </section>
  );
}

export function CopyButton({ value, label, theme }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(true);
      toast.success(`${label} copied`);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Couldn't copy — select the text instead.");
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      disabled={!value}
      aria-label={`Copy ${label}`}
      className="grid h-7 w-7 shrink-0 place-items-center rounded-md transition-colors hover:bg-black/5 disabled:opacity-40"
      style={{ color: theme.link }}
    >
      {copied ? <FiCheck className="h-3.5 w-3.5" /> : <FiCopy className="h-3.5 w-3.5" />}
    </button>
  );
}

export { default as ApiImage } from "@shared/components/ApiImage";
