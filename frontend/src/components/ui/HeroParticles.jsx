import { useMemo } from "react";
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

/* ──────────────────────────────────────────────────────────────
   HERO PARTICLES — tsParticles-powered
   ────────────────────────────────────────────────────────────── */
export default function HeroParticles({ className = "" }) {
  const options = useMemo(() => {
    const baseCount = typeof window !== "undefined"
      ? window.innerWidth < 640 ? 25
        : window.innerWidth < 1024 ? 50
        : 80
      : 80;

    return {
      fpsLimit: 60,
      fullScreen: false,
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: "repulse",
          },
          resize: { enable: true },
        },
        modes: {
          repulse: {
            distance: 100,
            duration: 0.4,
            speed: 1,
          },
        },
      },
      particles: {
        number: {
          value: baseCount,
          density: { enable: false },
        },
        color: { value: "#085FA7" },
        opacity: {
          value: 0.10,
          animation: {
            enable: true,
            speed: 0.2,
            sync: false,
            startValue: "random",
          },
        },
        size: {
          value: { min: 1, max: 3 },
          animation: {
            enable: true,
            speed: 0.3,
            sync: false,
            startValue: "random",
          },
        },
        links: {
          enable: true,
          color: "#085FA7",
          opacity: 0.08,
          distance: 140,
          width: 0.5,
        },
        move: {
          enable: true,
          speed: { min: 0.25, max: 0.55 },
          direction: "none",
          random: true,
          straight: false,
          outModes: { default: "bounce" },
        },
      },
      detectRetina: true,
      pauseOnBlur: false,
      pauseOnOutsideViewport: true,
      smooth: true,
    };
  }, []);

  return (
    <div
      className={`pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <ParticlesProvider
        init={async (engine) => {
          await loadSlim(engine);
        }}
      >
        <Particles
          id="hero-particles"
          options={options}
          className="h-full w-full"
        />
      </ParticlesProvider>
    </div>
  );
}
