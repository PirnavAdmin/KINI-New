import { useRef, useEffect, useState, useCallback } from "react";

/**
 * InteractiveGlow — Cursor-reactive radial gradient overlay.
 *
 * Renders a subtle radial highlight that follows the cursor
 * within the card/section. Creates a polished, premium feel
 * similar to Stripe/Linear card interactions.
 *
 * Props:
 *   color     — hex color for the glow (default "#5227FF")
 *   size      — diameter of the glow in px (default 300)
 *   opacity   — max opacity of the glow (default 0.06)
 *   className — additional wrapper classes
 *   children  — rendered below the glow overlay
 */

export default function InteractiveGlow({
  color = "#5227FF",
  size = 300,
  opacity = 0.06,
  className = "",
  children,
}) {
  const containerRef = useRef(null);
  const glowRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const frameRef = useRef(null);
  const posRef = useRef({ x: -9999, y: -9999 });

  const handleMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    posRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const animateGlow = useCallback(() => {
    if (!glowRef.current) return;
    const { x, y } = posRef.current;

    if (isHovered && x >= 0 && y >= 0) {
      glowRef.current.style.opacity = "1";
      glowRef.current.style.transform = `translate(${x - size / 2}px, ${y - size / 2}px)`;
    } else {
      glowRef.current.style.opacity = "0";
    }

    frameRef.current = requestAnimationFrame(animateGlow);
  }, [isHovered, size]);

  useEffect(() => {
    frameRef.current = requestAnimationFrame(animateGlow);
    return () => cancelAnimationFrame(frameRef.current);
  }, [animateGlow]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMove}
      onMouseLeave={() => {
        setIsHovered(false);
        posRef.current = { x: -9999, y: -9999 };
      }}
    >
      {/* Glow overlay */}
      <div
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-150"
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)`,
          opacity: 0,
          willChange: "transform, opacity",
          transform: "translate(-9999px, -9999px)",
          transition: "opacity 0.3s ease",
          filter: "blur(40px)",
          zIndex: 0,
        }}
      />
      {/* Content */}
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
