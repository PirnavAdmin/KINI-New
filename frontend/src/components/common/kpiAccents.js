// Global KPI accent tokens — the single palette every KPI card uses.
// accent → left bar + wave, soft → icon tile background, icon → icon stroke,
// wave → opacity of the decorative bottom-right wave.
export const KPI_ACCENTS = {
  blue: { accent: "#0877F9", soft: "#EAF3FF", icon: "#0877F9", wave: 0.1 },
  green: { accent: "#16B889", soft: "#E5FAF4", icon: "#10B981", wave: 0.1 },
  orange: { accent: "#F39924", soft: "#FFF3DD", icon: "#F39924", wave: 0.11 },
  purple: { accent: "#7C3AED", soft: "#F0EAFE", icon: "#7C3AED", wave: 0.1 },
  red: { accent: "#F0445F", soft: "#FFE9ED", icon: "#F0445F", wave: 0.1 },
  teal: { accent: "#0D9488", soft: "#E3F6F4", icon: "#0D9488", wave: 0.1 },
  cyan: { accent: "#0EA5E9", soft: "#E6F6FE", icon: "#0EA5E9", wave: 0.1 },
  navy: { accent: "#133B5D", soft: "#EAF1F8", icon: "#133B5D", wave: 0.08 },
};

// Brand / Tailwind hex colours older cards were given, snapped to the nearest
// palette token so every KPI card draws from the same eight accents.
const LEGACY_HEX = {
  "#0f55f7": "blue", "#1268f3": "blue", "#2563eb": "blue", "#1d63d8": "blue", "#3b82f6": "blue", "#0877f9": "blue", "#2164df": "blue",
  "#06b6a8": "teal", "#14b8a6": "teal", "#0d9488": "teal", "#278f8d": "teal",
  "#10b981": "green", "#16a34a": "green", "#22c55e": "green", "#15803d": "green", "#16b889": "green",
  "#f59e0b": "orange", "#f97316": "orange", "#f58a0b": "orange", "#f39924": "orange", "#d97706": "orange",
  "#8b5cf6": "purple", "#7c3aed": "purple", "#6366f1": "purple", "#a855f7": "purple",
  "#ef4444": "red", "#e11d48": "red", "#dc2626": "red", "#ec4899": "red", "#f43f5e": "red", "#b42318": "red",
  "#0ea5e9": "cyan", "#06b6d4": "cyan",
  "#0b1f3f": "navy", "#0f2a4a": "navy", "#133b5d": "navy", "#64748b": "navy", "#475569": "navy", "#94a3b8": "navy",
};

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const expand = (hex) =>
  hex.length === 4 ? `#${[...hex.slice(1)].map((c) => c + c).join("")}` : hex;

// Accepts a token name ("blue"), a hex colour ("#F59E0B") or a full tone object.
export function resolveKpiAccent(accent = "blue") {
  if (accent && typeof accent === "object") return { ...KPI_ACCENTS.blue, ...accent };
  if (KPI_ACCENTS[accent]) return KPI_ACCENTS[accent];
  const legacy = LEGACY_HEX[String(accent).toLowerCase()];
  if (legacy) return KPI_ACCENTS[legacy];
  if (HEX.test(String(accent))) {
    const hex = expand(accent);
    return { accent: hex, soft: `${hex}1A`, icon: hex, wave: 0.1 };
  }
  return KPI_ACCENTS.blue;
}
