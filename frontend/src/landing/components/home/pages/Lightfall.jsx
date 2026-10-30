import { useEffect, useRef } from "react";

/**
 * Lightfall — Scaler-style radial light ray background.
 * Clean white/blue gradient with diagonal rays emanating
 * from the top-right, subtle grid, and slow pulse animation.
 */
export default function Lightfall({
  backgroundColor = "#eef2fb",
  speed = 1,
  opacity = 1,
  // ray source position (0–1 fractions of W/H)
  originX = 0.72,
  originY = 0.05,
  rayColor = "#96beff",
  gridColor = "rgba(160,195,240,0.12)",
  showGrid = true,
  glowColor = "rgba(180,210,255,0.55)",
}) {
  const cvRef = useRef(null);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    let W = 0, H = 0, t = 0, raf = null;

    const RAYS = [
      { a: -0.95, w: 0.8, alpha: 0.07 },
      { a: -0.80, w: 1.0, alpha: 0.09 },
      { a: -0.65, w: 0.7, alpha: 0.08 },
      { a: -0.52, w: 1.2, alpha: 0.13 },
      { a: -0.38, w: 0.8, alpha: 0.09 },
      { a: -0.28, w: 1.5, alpha: 0.17 },
      { a: -0.18, w: 0.6, alpha: 0.07 },
      { a: -0.10, w: 2.2, alpha: 0.22 },
      { a: -0.02, w: 0.9, alpha: 0.10 },
      { a:  0.06, w: 1.9, alpha: 0.19 },
      { a:  0.14, w: 0.7, alpha: 0.08 },
      { a:  0.22, w: 1.3, alpha: 0.14 },
      { a:  0.32, w: 0.5, alpha: 0.06 },
      { a:  0.42, w: 1.1, alpha: 0.12 },
      { a:  0.55, w: 0.8, alpha: 0.09 },
      { a:  0.68, w: 1.6, alpha: 0.15 },
      { a:  0.80, w: 0.6, alpha: 0.07 },
      { a:  0.95, w: 1.2, alpha: 0.10 },
      { a:  1.10, w: 0.8, alpha: 0.07 },
      { a:  1.25, w: 0.6, alpha: 0.06 },
    ];

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const parent = cv.parentElement;
      W = parent ? parent.offsetWidth : window.innerWidth;
      H = parent ? parent.offsetHeight : window.innerHeight;
      cv.width = W * dpr;
      cv.height = H * dpr;
      cv.style.width = W + "px";
      cv.style.height = H + "px";
      ctx.scale(dpr, dpr);
    }

    function drawBackground() {
      // Base gradient — white top-left to light blue bottom-right
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0,   "#f8faff");
      g.addColorStop(0.3, "#eef3ff");
      g.addColorStop(0.65,"#e2ecfb");
      g.addColorStop(1,   "#d5e5f8");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // Radial bloom from ray origin
      const ox = W * originX, oy = H * originY;
      const rg = ctx.createRadialGradient(ox, oy, 0, ox, oy, W * 0.75);
      rg.addColorStop(0,   glowColor);
      rg.addColorStop(0.25,"rgba(190,215,255,0.28)");
      rg.addColorStop(0.55,"rgba(210,228,255,0.10)");
      rg.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, W, H);
    }

    function drawGrid() {
      if (!showGrid) return;
      ctx.save();
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 0.5;
      const gs = 60;
      for (let x = 0; x < W + gs; x += gs) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H + gs; y += gs) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      ctx.restore();
    }

    function drawRays() {
      const ox = W * originX;
      const oy = H * originY;
      const rayLen = Math.sqrt(W * W + H * H) * 1.6;

      RAYS.forEach((r) => {
        const pulse = 1 + Math.sin(t * 0.006 * speed + r.a * 4) * 0.07;
        const a = r.alpha * pulse * opacity;

        const angle = r.a + Math.PI / 2;
        const x1 = Math.cos(angle) * rayLen;
        const y1 = Math.sin(angle) * rayLen;
        const perp = angle + Math.PI / 2;
        const hw = r.w * 9;
        const px = Math.cos(perp) * hw;
        const py = Math.sin(perp) * hw;

        const gr = ctx.createLinearGradient(0, 0, x1, y1);
        gr.addColorStop(0,    `rgba(150,190,255,${a * 0.2})`);
        gr.addColorStop(0.05, `rgba(150,190,255,${a})`);
        gr.addColorStop(0.35, `rgba(160,200,255,${a * 0.45})`);
        gr.addColorStop(0.7,  `rgba(160,200,255,${a * 0.15})`);
        gr.addColorStop(1,    "rgba(160,200,255,0)");

        ctx.save();
        ctx.translate(ox, oy);
        ctx.beginPath();
        ctx.moveTo(-px, -py);
        ctx.lineTo(x1 - px, y1 - py);
        ctx.lineTo(x1 + px, y1 + py);
        ctx.lineTo(px, py);
        ctx.closePath();
        ctx.fillStyle = gr;
        ctx.fill();
        ctx.restore();
      });
    }

    function drawVignette() {
      const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.28, W / 2, H / 2, H * 1.1);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(1, "rgba(205,220,245,0.32)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    function frame() {
      raf = requestAnimationFrame(frame);
      t++;
      drawBackground();
      drawGrid();
      drawRays();
      drawVignette();
    }

    const ro = new ResizeObserver(resize);
    ro.observe(cv.parentElement || cv);
    resize();
    frame();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [backgroundColor, speed, opacity, originX, originY, rayColor, gridColor, showGrid, glowColor]);

  return (
    <canvas
      ref={cvRef}
      style={{ position: "absolute", top: 0, left: 0, display: "block" }}
    />
  );
}