// Presentation helpers shared by the Students list and its mobile cards.

const AVATAR_TONES = [
  { bg: "#E8F1FF", fg: "#16558A" },
  { bg: "#FFECEF", fg: "#C7304A" },
  { bg: "#EEE8FF", fg: "#5B3FC4" },
  { bg: "#FFF0E1", fg: "#B85F0B" },
  { bg: "#E7FAF2", fg: "#0A8A58" },
  { bg: "#E6F6FB", fg: "#0B7A99" },
];

// First + last initial of the real student name (max two letters).
export const getInitials = (name) => {
  const parts = String(name ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (parts[0][0] + last).toUpperCase();
};

// Stable per-name pastel so a student keeps the same avatar color when the
// list is sorted, filtered or paged.
export const avatarTone = (name) => {
  let hash = 0;
  for (const char of String(name ?? "")) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return AVATAR_TONES[hash % AVATAR_TONES.length];
};

const STATUS_TONES = {
  active: { bg: "#E4F8EF", fg: "#0A9A62", dot: "#10B981" },
  pending: { bg: "#FFF3DD", fg: "#B86600", dot: "#F59E0B" },
  "pending approval": { bg: "#FFF3DD", fg: "#B86600", dot: "#F59E0B" },
  "at risk": { bg: "#FFEDE0", fg: "#C2410C", dot: "#F97316" },
  "at-risk": { bg: "#FFEDE0", fg: "#C2410C", dot: "#F97316" },
  "on leave": { bg: "#F0EAFE", fg: "#6D28D9", dot: "#8B5CF6" },
  inactive: { bg: "#EEF2F7", fg: "#5B78A0", dot: "#94A3B8" },
  rejected: { bg: "#FFE8EC", fg: "#D92D45", dot: "#EF4444" },
};
const FALLBACK_STATUS_TONE = { bg: "#EEF2F7", fg: "#5B78A0", dot: "#94A3B8" };

// Status filter values → the backend spellings that belong to them. Matching
// is case-insensitive and uses the same groups as the KPI counts, so a
// filter never hides students its KPI card counts.
const STATUS_ALIASES = {
  pending: ["pending", "pending approval", "awaiting approval"],
  "at risk": ["at risk", "at-risk", "high risk"],
};
export const matchesStatus = (studentStatus, filterValue) => {
  const actual = String(studentStatus ?? "").trim().toLowerCase();
  const wanted = String(filterValue ?? "").trim().toLowerCase();
  return (STATUS_ALIASES[wanted] ?? [wanted]).includes(actual);
};

export const statusTone = (status) =>
  STATUS_TONES[String(status ?? "").trim().toLowerCase()] ?? FALLBACK_STATUS_TONE;
