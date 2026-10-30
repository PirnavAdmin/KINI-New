import { useEffect, useRef, useMemo, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * AmbientLight — Premium interactive ambient lighting system.
 *
 * This replaces the old Lightfall component. It renders:
 *   - Soft drifting glow blobs that slowly orbit
 *   - Faint light streaks with mouse interaction
 *   - A reactive halo that follows the cursor
 *
 * The effect is subtle and cinematic — designed to feel like
 * Apple/Stripe/Linear quality ambient lighting, not a wallpaper.
 *
 * Props:
 *   colors        — array of hex colors for streaks & blobs
 *   intensity     — overall brightness (0–1, default 0.6)
 *   streakCount   — number of light streaks (default 12)
 *   blobCount     — number of glow blobs (default 4)
 *   mouseStrength — how much cursor affects particles (0–1, default 0.3)
 */

function hexToRgba(hex, alpha = 1) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function AmbientLight({
  colors = ["#e56926", "#108299", "#A6C8FF", "#5227FF"],
  intensity = 0.6,
  streakCount = 12,
  blobCount = 4,
  mouseStrength = 0.3,
}) {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const streaksRef = useRef([]);
  const blobsRef = useRef([]);
  const timeRef = useRef(0);

  const palette = useMemo(() => colors, [colors]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initStreaks();
      initBlobs();
    }

    // ── Streaks ──
    function createStreak(w, h) {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        len: 80 + Math.random() * 200,
        width: 0.5 + Math.random() * 1.2,
        speed: 0.2 + Math.random() * 0.5,
        color: palette[Math.floor(Math.random() * palette.length)],
        opacity: 0.06 + Math.random() * 0.1,
        angle: -0.15 + Math.random() * 0.3,
        drift: (Math.random() - 0.5) * 0.2,
      };
    }

    function initStreaks() {
      const w = canvas.width;
      const h = canvas.height;
      streaksRef.current = Array.from({ length: streakCount }, () => createStreak(w, h));
    }

    // ── Blobs ──
    function createBlob(w, h, i) {
      return {
        x: w * (0.15 + Math.random() * 0.7),
        y: h * (0.15 + Math.random() * 0.7),
        radius: 120 + Math.random() * 200,
        color: palette[i % palette.length],
        opacity: 0.03 + Math.random() * 0.04 * intensity,
        speed: 0.08 + Math.random() * 0.1,
        phase: Math.random() * Math.PI * 2,
        orbitRadius: 60 + Math.random() * 120,
        orbitSpeed: 0.02 + Math.random() * 0.03,
      };
    }

    function initBlobs() {
      const w = canvas.width;
      const h = canvas.height;
      blobsRef.current = Array.from({ length: blobCount }, (_, i) => createBlob(w, h, i));
    }

    // ── Draw ──
    function drawBlob(b, time) {
      // Gentle orbit
      const ox = Math.cos(time * b.orbitSpeed + b.phase) * b.orbitRadius;
      const oy = Math.sin(time * b.orbitSpeed + b.phase) * b.orbitRadius;
      const cx = b.x + ox;
      const cy = b.y + oy;
      const pulse = 1 + Math.sin(time * b.speed + b.phase) * 0.15;

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, b.radius * pulse);
      grad.addColorStop(0, hexToRgba(b.color, b.opacity * intensity));
      grad.addColorStop(0.4, hexToRgba(b.color, b.opacity * intensity * 0.5));
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawStreak(s, time) {
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const dx = s.x - mx;
      const dy = s.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200 && dist > 0) {
        const force = (1 - dist / 200) * mouseStrength * 2;
        s.x += (dx / dist) * force;
      }

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      const endX = s.x + Math.sin(s.angle) * s.len * 0.3;
      const endY = s.y + s.len;
      ctx.lineTo(endX, endY);

      const grad = ctx.createLinearGradient(s.x, s.y, endX, endY);
      grad.addColorStop(0, hexToRgba(s.color, 0));
      grad.addColorStop(0.3, hexToRgba(s.color, s.opacity * intensity));
      grad.addColorStop(1, hexToRgba(s.color, 0));

      ctx.strokeStyle = grad;
      ctx.lineWidth = s.width;
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.restore();

      // Move streak
      s.y -= s.speed * 0.5; // float upward slowly
      s.x += Math.sin(time * 0.05 + s.angle) * s.drift;

      // Reset when off screen
      if (s.y + s.len < -50) {
        const fresh = createStreak(canvas.width, canvas.height);
        fresh.y = canvas.height + 20;
        fresh.x = Math.random() * canvas.width;
        Object.assign(s, fresh);
      }
    }

    let animTime = 0;
    function animate() {
      frameRef.current = requestAnimationFrame(animate);
      animTime += 0.016;
      timeRef.current = animTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw ambient blobs (behind streaks)
      blobsRef.current.forEach((b) => drawBlob(b, animTime));

      // Draw streaks
      streaksRef.current.forEach((s) => drawStreak(s, animTime));
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    animate();

    function handleMouse(e) {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    function handleLeave() {
      mouseRef.current = { x: -9999, y: -9999 };
    }

    window.addEventListener("mousemove", handleMouse, { passive: true });
    canvas.addEventListener("mouseleave", handleLeave);

    return () => {
      cancelAnimationFrame(frameRef.current);
      ro.disconnect();
      window.removeEventListener("mousemove", handleMouse);
      canvas.removeEventListener("mouseleave", handleLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intensity, streakCount, blobCount, mouseStrength, palette.join(",")]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0"
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        zIndex: 0,
      }}
    />
  );
}
