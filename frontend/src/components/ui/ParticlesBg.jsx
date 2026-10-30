import { useMemo, useCallback } from "react";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import useTheme from "@shared/hooks/useTheme";

const COLORS = [
  "#085FA7",
  "#5CA347",
  "#7DD3B2",
  "#F0765B",
];

function GridOverlay({ isDark }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(
            rgba(8,95,167,${isDark ? 0.06 : 0.04}) 1px,
            transparent 1px
          ),
          linear-gradient(
            90deg,
            rgba(8,95,167,${isDark ? 0.06 : 0.04}) 1px,
            transparent 1px
          )
        `,
        backgroundSize: "80px 80px",
      }}
    />
  );
}

function GradientMesh() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `
          radial-gradient(
            circle at 20% 20%,
            rgba(8,95,167,.05),
            transparent 40%
          ),

          radial-gradient(
            circle at 80% 30%,
            rgba(92,163,71,.04),
            transparent 40%
          ),

          radial-gradient(
            circle at 50% 90%,
            rgba(125,211,178,.04),
            transparent 45%
          )
        `,
      }}
    />
  );
}

function NoiseTexture() {
  return (
    <div
      className="
      absolute inset-0
      opacity-[0.015]
      pointer-events-none
      "
      style={{
        backgroundImage:
          'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
        backgroundSize: "256px 256px",
      }}
    />
  );
}

export default function ParticlesBg({
  className = "",
  children,
  showParticles = true,
  showGradient = true,
  showGrid = false,
  showNoise = true,
}) {
  const { isDark } = useTheme();

  const init = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const options = useMemo(
    () => ({
      fullScreen: false,

      fpsLimit: 60,

      detectRetina: true,

      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: "repulse",
          },
        },

        modes: {
          repulse: {
            distance: 120,
            duration: 0.4,
          },
        },
      },

      particles: {
        number: {
          value: 90,

          density: {
            enable: true,
          },
        },

        color: {
          value: COLORS,
        },

        opacity: {
          value: {
            min: 0.12,
            max: 0.28,
          },
        },

        size: {
          value: {
            min: 1,
            max: 3,
          },
        },

        links: {
          enable: true,

          distance: 140,

          color: "#085FA7",

          opacity: isDark ? 0.08 : 0.06,

          width: 1,
        },

        move: {
          enable: true,

          speed: 0.45,

          random: true,

          outModes: {
            default: "bounce",
          },
        },
      },
    }),
    [isDark]
  );

  return (
    <div
      className={`absolute inset-0 overflow-hidden ${className}`}
    >

      {showParticles && (

        <Particles
          id="particles"
          init={init}
          options={options}
          className="absolute inset-0"
        />

      )}

      {showGradient && <GradientMesh />}

      {showGrid && (
        <GridOverlay isDark={isDark} />
      )}

      {showNoise && <NoiseTexture />}

      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}

    </div>
  );
}