import { useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * LightCard — Glassmorphism card wrapper with ambient lighting.
 *
 * Inspired by Stripe/Linear premium card design:
 *   - Glassmorphism background with backdrop blur
 *   - Subtle gradient border that lights up on hover
 *   - Cursor-following radial highlight inside the card
 *   - Soft shadow that deepens on hover
 *   - Framer-motion fade-up entrance
 *
 * Props:
 *   children     — card content
 *   glowColor    — hex color for cursor glow (default "#5227FF")
 *   className    — additional wrapper classes
 *   delay        — stagger delay for entrance animation (default 0)
 *   hoverScale   — scale on hover (default 1.02, set to 0 to disable)
 *   as           — wrapper element (default "div")
 *   style        — additional styles
 */

export default function LightCard({
  children,
  glowColor = "#5227FF",
  className = "",
  delay = 0,
  hoverScale = 1.02,
  as: Wrapper = motion.div,
  style = {},
  ...rest
}) {
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: -9999, y: -9999 });
  const [isHovered, setIsHovered] = useState(false);

  const isMotion = Wrapper === motion.div;

  const sharedClasses = `
    relative
    rounded-2xl
    border border-white/[0.08]
    bg-white/[0.72]
    backdrop-blur-xl
    shadow-[0_10px_40px_rgba(82,39,255,0.08)]
    transition-all duration-500 ease-out
    hover:shadow-[0_20px_80px_rgba(82,39,255,0.12)]
    ${className}
  `.trim();

  const content = (
    <>
      {/* Cursor reactive radial highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
      >
        {/* Subtle border gradient on hover */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, ${glowColor}15 0%, transparent 60%)`,
            willChange: "opacity, background",
          }}
        />

        {/* Soft inner highlight */}
        <div
          className="absolute -inset-[1px] rounded-2xl opacity-0 transition-opacity duration-500"
          style={{
            opacity: isHovered ? 0.6 : 0,
            background: `radial-gradient(
              ellipse 80% 50% at 50% -20%,
              ${glowColor}22 0%,
              transparent 70%
            )`,
            willChange: "opacity",
          }}
        />
      </div>

      {/* Card content */}
      <div className="relative z-[2] h-full">{children}</div>
    </>
  );

  if (isMotion) {
    return (
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
        whileHover={hoverScale ? { scale: hoverScale, transition: { duration: 0.3 } } : undefined}
        className={sharedClasses}
        style={{ transformStyle: "preserve-3d", willChange: "transform", ...style }}
        onMouseMove={(e) => {
          setMousePos({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
          setIsHovered(true);
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setMousePos({ x: -9999, y: -9999 });
        }}
        {...rest}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <Wrapper
      ref={cardRef}
      className={sharedClasses}
      style={style}
      onMouseMove={(e) => {
        const rect = cardRef.current?.getBoundingClientRect();
        if (rect) {
          setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }
        setIsHovered(true);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: -9999, y: -9999 });
      }}
      {...rest}
    >
      {content}
    </Wrapper>
  );
}
