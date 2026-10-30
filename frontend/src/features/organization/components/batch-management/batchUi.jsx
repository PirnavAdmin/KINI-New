import { Edit3, Trash2 } from "lucide-react";
import { AvatarPhoto } from "@/components/common/ProfileImage";
import { hashText } from "./batchHelpers";

// Presentation components for the organization Batches table. Everything
// here is derived from the batch record; nothing is fabricated or stored
// separately.

const AVATAR_COLORS = ["#7C3AED", "#10B981", "#F59E0B", "#EF4444", "#0877F9", "#EC4899", "#0EA5E9"];

// A short glyph derived from the real batch name: its first letter plus the
// trailing number most batch names carry (".Net 1" -> "N1", "Devops 1" -> "D1").
// Falls back to two-letter initials when the name has no digit in it.
const batchGlyph = (name) => {
  const text = String(name ?? "").trim();
  const letter = text.match(/[A-Za-z]/)?.[0]?.toUpperCase();
  const digits = text.match(/\d+/)?.[0];
  if (letter && digits) return `${letter}${digits.slice(-1)}`;
  const parts = text.split(/\s+/).filter(Boolean);
  if (!parts.length) return "B";
  return parts.slice(0, 2).map((part) => part[0]).join("").toUpperCase();
};

export function BatchAvatar({ name, className = "h-10 w-10" }) {
  const color = AVATAR_COLORS[hashText(name) % AVATAR_COLORS.length];
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-xl text-[11px] font-extrabold text-white shadow-[0_4px_10px_rgba(16,45,80,.14)] ${className}`}
      style={{ backgroundColor: color }}
    >
      {batchGlyph(name)}
    </span>
  );
}

const AVATAR_TONES = [
  { bg: "#E8F1FF", fg: "#16558A" },
  { bg: "#FFECEF", fg: "#C7304A" },
  { bg: "#EEE8FF", fg: "#5B3FC4" },
  { bg: "#FFF0E1", fg: "#B85F0B" },
  { bg: "#E7FAF2", fg: "#0A8A58" },
];
const getInitials = (name) => {
  const parts = String(name ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (parts[0][0] + last).toUpperCase();
};

export function MentorAvatar({ name, photoUrl, className = "h-8 w-8 text-[11px]" }) {
  const tone = AVATAR_TONES[hashText(name) % AVATAR_TONES.length];
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center overflow-hidden rounded-full font-bold ${className}`}
      style={{ backgroundColor: tone.bg, color: tone.fg }}
    >
      <AvatarPhoto src={photoUrl} fallback={getInitials(name)} />
    </span>
  );
}

const COURSE_BADGE_TONES = [
  { bg: "#EAF3FF", fg: "#0877F9" },
  { bg: "#E5FAF4", fg: "#0B9B61" },
  { bg: "#F0EAFE", fg: "#7C3AED" },
  { bg: "#FFF3DD", fg: "#C97700" },
  { bg: "#FFE9ED", fg: "#D92D45" },
];

// The course name has no stored color, so the badge tone is derived
// deterministically from the name (stable across reloads, sorts and pages).
// `className` lets a dense table cap or resize the tag.
export function CourseTag({ name, className = "" }) {
  const tone = COURSE_BADGE_TONES[hashText(name) % COURSE_BADGE_TONES.length];
  return (
    <span
      className={`inline-block max-w-full truncate rounded-[9px] px-3 py-1.5 align-middle text-[13px] font-semibold ${className}`}
      style={{ backgroundColor: tone.bg, color: tone.fg }}
      title={name}
    >
      {name || "—"}
    </span>
  );
}

const BATCH_STATUS_TONES = {
  upcoming: { bg: "#FFF3DD", fg: "#C97700", dot: "#F59E0B" },
  active: { bg: "#E4F8EF", fg: "#079A61", dot: "#10B981" },
  completed: { bg: "#EAF3FF", fg: "#0877F9", dot: "#0877F9" },
  cancelled: { bg: "#FFE9ED", fg: "#D92D45", dot: "#EF4444" },
  draft: { bg: "#EEF2F7", fg: "#5B78A0", dot: "#94A3B8" },
  archived: { bg: "#EEF2F7", fg: "#5B78A0", dot: "#94A3B8" },
};
const FALLBACK_BATCH_STATUS_TONE = { bg: "#EEF2F7", fg: "#5B78A0", dot: "#94A3B8" };

// `normalized` is the app's own status bucket (see normalizeBatchStatus in
// BatchManagement.jsx); `label` is the text already computed for display.
export function BatchStatusPill({ normalized, label }) {
  const tone = BATCH_STATUS_TONES[normalized] ?? FALLBACK_BATCH_STATUS_TONE;
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-semibold"
      style={{ backgroundColor: tone.bg, color: tone.fg }}
    >
      <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: tone.dot }} />
      {label}
    </span>
  );
}

export function BatchActionButtons({ name, onEdit, onDelete }) {
  const base = "grid h-9 w-9 shrink-0 place-items-center rounded-[9px] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
  return (
    <div className="flex items-center gap-2">
      {onEdit && <button type="button" onClick={onEdit} title="Edit batch" aria-label={`Edit ${name}`}
        className={`${base} border-[#D8E4F1] bg-white text-[#133B5D] hover:bg-[#F3F8FE] focus-visible:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200`}>
        <Edit3 aria-hidden="true" className="h-4 w-4" />
      </button>}
      {onDelete && <button type="button" onClick={onDelete} title="Delete batch" aria-label={`Delete ${name}`}
        className={`${base} border-[#FFDCE2] bg-[#FFF3F5] text-[#D92D45] hover:bg-[#FFE5EB] focus-visible:ring-rose-500 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300`}>
        <Trash2 aria-hidden="true" className="h-4 w-4" />
      </button>}
    </div>
  );
}
