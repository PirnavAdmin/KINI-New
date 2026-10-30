/* ──────────────────────────────────────────────────────────────
   GRID OVERLAY — subtle blue grid, desktop only
   ────────────────────────────────────────────────────────────── */
export default function GridOverlay({ className = "" }) {
  return (
    <div
      className={`pointer-events-none hidden lg:block ${className}`}
      aria-hidden="true"
      style={{
        backgroundImage: [
          "linear-gradient(to right, rgba(8,95,167,0.03) 1px, transparent 1px)",
          "linear-gradient(to bottom, rgba(8,95,167,0.03) 1px, transparent 1px)",
        ].join(","),
        backgroundSize: "48px 48px",
      }}
    />
  );
}
