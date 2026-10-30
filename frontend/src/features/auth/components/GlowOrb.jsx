/**
 * GlowOrb — Decorative blurred radial gradient circle for background ambiance.
 */
export default function GlowOrb({ className, size, color1, color2 }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color1} 0%, ${color2} 70%, transparent 100%)`,
      }}
      aria-hidden="true"
    />
  );
}
