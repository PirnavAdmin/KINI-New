import { useEffect, useRef, useState } from "react";
import { MousePointer2, Info, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Anti-gravity particle field (21st.dev "particle-effect-for-hero"), ported to
// JSX. Particles spring back to their origin and scatter away from the cursor.
// `AntiGravityCanvas` is the reusable background; the default export is the
// original full-screen demo.

const PARTICLE_DENSITY = 0.00015; // particles per CSS pixel squared
const BG_PARTICLE_DENSITY = 0.00005;
const MOUSE_RADIUS = 180;
const RETURN_SPEED = 0.08; // spring constant back to origin
const DAMPING = 0.9;
const REPULSION_STRENGTH = 1.2;

const randomRange = (min, max) => Math.random() * (max - min) + min;

const hexToRgb = (hex) => {
  const value = parseInt(hex.replace("#", ""), 16);
  return `${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}`;
};

function createParticles(width, height) {
  const count = Math.floor(width * height * PARTICLE_DENSITY);
  const particles = [];
  for (let i = 0; i < count; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    particles.push({
      x, y, originX: x, originY: y, vx: 0, vy: 0,
      size: randomRange(1, 2.5),
      accent: Math.random() > 0.9,
    });
  }

  const bgCount = Math.floor(width * height * BG_PARTICLE_DENSITY);
  const background = [];
  for (let i = 0; i < bgCount; i++) {
    background.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      size: randomRange(0.5, 1.5),
      alpha: randomRange(0.1, 0.4),
      phase: Math.random() * Math.PI * 2,
    });
  }

  return { particles, background };
}

function step(ctx, state, width, height, mouse, time, colors) {
  ctx.clearRect(0, 0, width, height);

  // Pulsating radial glow
  const pulseOpacity = Math.sin(time * 0.0008) * 0.035 + 0.085;
  const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) * 0.7);
  gradient.addColorStop(0, `rgba(${colors.glow}, ${pulseOpacity})`);
  gradient.addColorStop(1, `rgba(${colors.glow}, 0)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Drifting, twinkling background dust
  ctx.fillStyle = `rgb(${colors.particle})`;
  for (const p of state.background) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0) p.x = width;
    if (p.x > width) p.x = 0;
    if (p.y < 0) p.y = height;
    if (p.y > height) p.y = 0;
    const twinkle = Math.sin(time * 0.002 + p.phase) * 0.5 + 0.5;
    ctx.globalAlpha = p.alpha * (0.3 + 0.7 * twinkle);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const particles = state.particles;

  // Forces: mouse repulsion and spring back to origin
  for (const p of particles) {
    const dx = mouse.x - p.x;
    const dy = mouse.y - p.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (mouse.isActive && distance < MOUSE_RADIUS && distance > 0) {
      const repulsion = ((MOUSE_RADIUS - distance) / MOUSE_RADIUS) * REPULSION_STRENGTH;
      p.vx -= (dx / distance) * repulsion * 5;
      p.vy -= (dy / distance) * repulsion * 5;
    }
    p.vx += (p.originX - p.x) * RETURN_SPEED;
    p.vy += (p.originY - p.y) * RETURN_SPEED;
  }

  // Collisions: separate overlapping particles and bounce them elastically
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const p1 = particles[i];
      const p2 = particles[j];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const distSq = dx * dx + dy * dy;
      const minDist = p1.size + p2.size;
      if (distSq >= minDist * minDist) continue;
      const dist = Math.sqrt(distSq);
      if (dist <= 0.01) continue;

      const nx = dx / dist;
      const ny = dy / dist;
      const overlap = (minDist - dist) * 0.5;
      p1.x -= nx * overlap;
      p1.y -= ny * overlap;
      p2.x += nx * overlap;
      p2.y += ny * overlap;

      const velocityAlongNormal = (p1.vx - p2.vx) * nx + (p1.vy - p2.vy) * ny;
      if (velocityAlongNormal > 0) {
        const m1 = p1.size;
        const m2 = p2.size;
        const impulse = (-(1 + 0.85) * velocityAlongNormal) / (1 / m1 + 1 / m2);
        p1.vx += (impulse * nx) / m1;
        p1.vy += (impulse * ny) / m1;
        p2.vx -= (impulse * nx) / m2;
        p2.vy -= (impulse * ny) / m2;
      }
    }
  }

  // Integrate and draw; faster particles glow brighter
  for (const p of particles) {
    p.vx *= DAMPING;
    p.vy *= DAMPING;
    p.x += p.vx;
    p.y += p.vy;
    const velocity = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    const opacity = Math.min(0.3 + velocity * 0.1, 1);
    ctx.fillStyle = p.accent ? `rgb(${colors.accent})` : `rgba(${colors.particle}, ${opacity})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Interactive particle background. Fills its positioned parent.
 * The cursor is tracked on the parent element, so content layered on top
 * (text, buttons) does not block the effect.
 */
export function AntiGravityCanvas({
  className,
  particleColor = "#ffffff",
  accentColor = "#4285F4",
  glowColor = "#4285F4",
  showStats = false,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [stats, setStats] = useState({ count: 0, fps: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const host = container?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !container || !host || !ctx) return undefined;

    const colors = { particle: hexToRgb(particleColor), accent: hexToRgb(accentColor), glow: hexToRgb(glowColor) };
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouse = { x: -1000, y: -1000, isActive: false };
    let size = { width: 0, height: 0 };
    let state = { particles: [], background: [] };
    let frameId = 0;
    let lastTime = 0;
    let lastStats = 0;
    let visible = true;

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      size = { width, height };
      state = createParticles(width, height);
      if (showStats) setStats((s) => ({ ...s, count: state.particles.length + state.background.length }));
      if (reduceMotion) step(ctx, state, width, height, mouse, 0, colors);
    };

    const loop = (time) => {
      step(ctx, state, size.width, size.height, mouse, time, colors);
      if (showStats && time - lastStats > 500) {
        lastStats = time;
        const delta = time - lastTime;
        if (delta > 0) setStats((s) => ({ ...s, fps: Math.round(1000 / delta) }));
      }
      lastTime = time;
      frameId = visible ? requestAnimationFrame(loop) : 0;
    };

    const start = () => {
      if (!reduceMotion && !frameId) frameId = requestAnimationFrame(loop);
    };

    const onMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.isActive = true;
    };
    const onLeave = () => {
      mouse.isActive = false;
    };

    // Pause the loop while the hero is scrolled out of view.
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    observer.observe(container);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    resize();
    start();

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      observer.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, [particleColor, accentColor, glowColor, showStats]);

  return (
    <div ref={containerRef} aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <canvas ref={canvasRef} className="block h-full w-full" />
      {showStats && (
        <div className="absolute bottom-4 right-4 text-right font-mono text-xs text-white/20">
          <p>{stats.count} entities</p>
          <p>{stats.fps} FPS</p>
        </div>
      )}
    </div>
  );
}

function Navigation() {
  return (
    <nav className="absolute left-0 top-0 z-20 flex w-full items-center justify-between p-6 md:p-8">
      <div className="flex items-center space-x-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
          <span className="text-lg font-bold text-black">G</span>
        </div>
        <span className="text-lg font-medium tracking-wide text-white">Antigravity</span>
      </div>
      <div className="hidden space-x-8 text-sm font-medium text-white/70 md:flex">
        <a href="#" className="transition-colors hover:text-white">Experiments</a>
        <a href="#" className="transition-colors hover:text-white">Case Studies</a>
        <a href="#" className="transition-colors hover:text-white">About</a>
      </div>
      <button type="button" aria-label="About" className="text-white/80 transition-colors hover:text-white">
        <Info size={24} />
      </button>
    </nav>
  );
}

function HeroContent() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-4xl space-y-8 text-center">
        <span className="inline-block rounded-full border border-white/20 bg-white/5 px-3 py-1 font-mono text-xs uppercase tracking-widest text-white/60 backdrop-blur-sm">
          Experimental Interaction
        </span>
        <h1 className="bg-gradient-to-b from-white to-white/40 bg-clip-text text-6xl font-bold tracking-tighter text-transparent md:text-8xl lg:text-9xl">
          Zero<br />Gravity
        </h1>
        <p className="mx-auto max-w-2xl text-lg font-light leading-relaxed text-white/60 md:text-xl">
          Experience the fluidity of data. A WebGL-inspired particle simulation running entirely on 2D Canvas for maximum
          compatibility and performance.
        </p>
        <div className="pointer-events-auto pt-8">
          <button type="button" className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-white px-8 py-4 font-bold tracking-wide text-black transition-transform hover:scale-105 active:scale-95">
            <span className="relative z-10">Start Experience</span>
            <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Original full-screen demo.
export default function ParticleEffectHero() {
  return (
    <div className="relative h-screen w-full cursor-crosshair overflow-hidden bg-black selection:bg-blue-500 selection:text-white">
      <AntiGravityCanvas showStats />
      <Navigation />
      <HeroContent />
      <div className="pointer-events-none absolute bottom-8 left-1/2 flex -translate-x-1/2 animate-pulse flex-col items-center gap-2 text-white/30">
        <span className="text-[10px] uppercase tracking-[0.2em]">Interact</span>
        <MousePointer2 size={16} />
      </div>
    </div>
  );
}
