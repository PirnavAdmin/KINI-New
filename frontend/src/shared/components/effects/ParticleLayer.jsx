import { useEffect, useRef, useMemo } from "react";

/**
 * ParticleLayer — GPU-accelerated canvas particle system.
 *
 * Renders drifting ambient particles behind content.
 * Particles gently float upward, twinkle, and respond
 * to cursor proximity (repel effect).
 *
 * Props:
 *   count      — number of particles (default 60)
 *   colors     — array of hex/rgba color strings
 *   speed      — base drift speed (0.1–2, default 0.4)
 *   sizeRange  — [min, max] particle size in px (default [1, 3])
 *   opacityRange — [min, max] particle opacity (default [0.15, 0.5])
 *   mouseRadius — px radius for repel effect (default 180)
 *   mouseStrength — repel strength (default 0.4)
 */

export default function ParticleLayer({
  count = 60,
  colors = ["#e56926", "#108299", "#A6C8FF", "#5227FF"],
  speed = 0.4,
  sizeRange = [1, 3],
  opacityRange = [0.15, 0.5],
  mouseRadius = 180,
  mouseStrength = 0.4,
}) {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const particlesRef = useRef([]);

  const palette = useMemo(() => colors, [colors]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    class Particle {
      constructor(w, h) {
        this.reset(w, h, true);
      }

      reset(w, h, initial = false) {
        this.x = Math.random() * w;
        this.y = initial ? Math.random() * h : h + 10;
        this.size = sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]);
        this.speedY = -(0.2 + Math.random() * speed * 0.6);
        this.speedX = (Math.random() - 0.5) * 0.2;
        this.opacity = opacityRange[0] + Math.random() * (opacityRange[1] - opacityRange[0]);
        this.color = palette[Math.floor(Math.random() * palette.length)];
        this.twinklePhase = Math.random() * Math.PI * 2;
        this.twinkleSpeed = 0.005 + Math.random() * 0.015;
        this.originX = this.x;
        this.originY = this.y;
      }

      update(w, h, mx, my) {
        // Mouse repel
        const dx = this.x - mx;
        const dy = this.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouseRadius && dist > 0) {
          const force = (1 - dist / mouseRadius) * mouseStrength * 2;
          this.x += (dx / dist) * force;
          this.y += (dy / dist) * force;
        } else {
          // Drift back toward origin
          this.x += (this.originX - this.x) * 0.01;
        }

        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.twinklePhase) * 0.1;
        this.twinklePhase += this.twinkleSpeed;

        if (this.y < -20) {
          this.originX = Math.random() * w;
          this.originY = h + 10;
          this.reset(w, h);
        }
      }

      draw(ctx) {
        const twinkle = 0.6 + 0.4 * Math.sin(this.twinklePhase);
        const alpha = this.opacity * twinkle;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color.replace(")", `,${alpha})`).replace("rgb", "rgba");
        // If color is hex, convert with alpha
        if (this.color.startsWith("#")) {
          const r = parseInt(this.color.slice(1, 3), 16);
          const g = parseInt(this.color.slice(3, 5), 16);
          const b = parseInt(this.color.slice(5, 7), 16);
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        }
        ctx.fill();
      }
    }

    function resize() {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width = w;
      canvas.height = h;
      initParticles(w, h);
    }

    function initParticles(w, h) {
      particlesRef.current = Array.from({ length: count }, () => new Particle(w, h));
    }

    function animate() {
      frameRef.current = requestAnimationFrame(animate);
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      particlesRef.current.forEach((p) => {
        p.update(w, h, mouseRef.current.x, mouseRef.current.y);
        p.draw(ctx);
      });
    }

    function handleMouse(e) {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    function handleLeave() {
      mouseRef.current = { x: -9999, y: -9999 };
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    animate();

    window.addEventListener("mousemove", handleMouse, { passive: true });
    canvas.addEventListener("mouseleave", handleLeave);

    return () => {
      cancelAnimationFrame(frameRef.current);
      ro.disconnect();
      window.removeEventListener("mousemove", handleMouse);
      canvas.removeEventListener("mouseleave", handleLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, speed, mouseRadius, mouseStrength, palette.join(",")]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
