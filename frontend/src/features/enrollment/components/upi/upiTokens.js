import { BRAND } from "../../theme";

/** Shared tokens for the UPI checkout screens (light / dark). */
export const upiTheme = (dark) => ({
  card: dark ? "rgba(11,17,32,0.85)" : "#FFFFFF",
  panel: dark ? "rgba(255,255,255,0.03)" : "#F3F8FD",
  panelStrong: dark ? "rgba(45,106,159,0.12)" : "#EAF3FC",
  border: dark ? "rgba(255,255,255,0.1)" : "rgba(19,59,93,0.12)",
  divider: dark ? "rgba(255,255,255,0.08)" : "rgba(19,59,93,0.1)",
  heading: dark ? "#F8FAFC" : BRAND.primary,
  text: dark ? "#F8FAFC" : "#0F172A",
  textSecondary: dark ? "#CBD5E1" : "#475569",
  textMuted: dark ? "#94A3B8" : "#64748B",
  input: dark ? "rgba(11,17,32,0.6)" : "#FFFFFF",
  link: dark ? "#93C5FD" : BRAND.secondary,
  shadow: dark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 18px 40px -24px rgba(19,59,93,0.4)",
});

export const SUCCESS = "#16A34A";
export const DANGER = "#DC2626";

export const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const day = date.toLocaleDateString("en-IN", { month: "short", day: "2-digit", year: "numeric" });
  const time = date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  return `${day}, ${time}`;
};
