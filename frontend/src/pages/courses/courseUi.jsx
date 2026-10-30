import {
  Atom,
  BookOpen,
  Brain,
  Code2,
  Database,
  Hexagon,
  Infinity as InfinityIcon,
  Megaphone,
  PenTool,
  ShieldCheck,
} from "lucide-react";

// Presentation helpers for the organization courses table. Everything here is
// derived from the course record (name / level / status); nothing is stored.

// Technology keyword -> square icon. The backend has no course icon or color,
// so the visual is derived deterministically from the course name.
const COURSE_VISUALS = [
  { test: /(^|[^a-z])\.?net(?![a-z])/i, text: ".NET", bg: "#7C3AED" },
  { test: /devops|cloud|aws|azure|kubernetes/i, Icon: InfinityIcon, bg: "#10B981" },
  { test: /java/i, Icon: Code2, bg: "#F59E0B" },
  { test: /node/i, Icon: Hexagon, bg: "#10B981" },
  { test: /react|angular|vue|front/i, Icon: Atom, bg: "#0EA5E9" },
  { test: /data science|machine|artificial|python|\bai\b|\bml\b/i, Icon: Brain, bg: "#3B82F6" },
  { test: /sql|database|mongo/i, Icon: Database, bg: "#EF4444" },
  { test: /design|\bui\b|\bux\b/i, Icon: PenTool, bg: "#EC4899" },
  { test: /market|\bseo\b/i, Icon: Megaphone, bg: "#F97316" },
  { test: /secur|cyber/i, Icon: ShieldCheck, bg: "#64748B" },
];
const FALLBACK_COLORS = ["#3B82F6", "#8B5CF6", "#14B8A6", "#F59E0B", "#EC4899", "#0EA5E9"];

const courseVisual = (name) => {
  const text = String(name ?? "");
  const match = COURSE_VISUALS.find((visual) => visual.test.test(text));
  if (match) return match;
  let hash = 0;
  for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return { Icon: BookOpen, bg: FALLBACK_COLORS[hash % FALLBACK_COLORS.length] };
};

export function CourseIcon({ name, className = "h-11 w-11" }) {
  const { Icon, text, bg } = courseVisual(name);
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-xl text-white shadow-[0_4px_10px_rgba(16,45,80,.14)] ${className}`}
      style={{ backgroundColor: bg }}
    >
      {text ? (
        <span className="text-[11px] font-extrabold leading-none tracking-tight">{text}</span>
      ) : (
        <Icon className="h-[22px] w-[22px]" strokeWidth={2} />
      )}
    </span>
  );
}

const LEVEL_TONES = {
  beginner: { bg: "#E5FAF0", fg: "#0B9B61" },
  intermediate: { bg: "#E8F2FF", fg: "#0877F9" },
  advanced: { bg: "#FFF0E2", fg: "#EA7A00" },
};
const FALLBACK_LEVEL_TONE = { bg: "#EEF2F7", fg: "#5B78A0" };

// The backend stores one "level" per course and the app calls it `category`.
export function LevelBadge({ value }) {
  const tone = LEVEL_TONES[String(value ?? "").trim().toLowerCase()] ?? FALLBACK_LEVEL_TONE;
  return (
    <span
      className="inline-flex items-center rounded-[9px] px-3 py-1.5 text-[13px] font-semibold"
      style={{ backgroundColor: tone.bg, color: tone.fg }}
    >
      {value || "—"}
    </span>
  );
}

const STATUS_TONES = {
  active: { bg: "#E4F8EF", fg: "#0A9A62", dot: "#10B981" },
  draft: { bg: "#FFF2D8", fg: "#C97800", dot: "#F59E0B" },
  archived: { bg: "#EEF2F7", fg: "#5B78A0", dot: "#94A3B8" },
};

export function CourseStatusPill({ status }) {
  const tone = STATUS_TONES[String(status ?? "").trim().toLowerCase()] ?? STATUS_TONES.archived;
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-semibold"
      style={{ backgroundColor: tone.bg, color: tone.fg }}
    >
      <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: tone.dot }} />
      {status}
    </span>
  );
}
