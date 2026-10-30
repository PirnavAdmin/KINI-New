import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import WordsPullUp from "./WordsPullUp";
import Navbar from "./Navbar";

const fadeUp = (delay = 0) => ({
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: {
    delay,
    duration: 0.6,
    ease: [0.16, 1, 0.3, 1],
  },
});

export default function HeroSection({ activeSection }) {
  const descriptionRef = useRef(null);
  const descInView = useInView(descriptionRef, { once: true, amount: 0.5 });

  const ctaRef = useRef(null);
  const ctaInView = useInView(ctaRef, { once: true, amount: 0.5 });

  return (
    <section id="hero" className="relative h-screen w-full p-4 md:p-6">
      {/* Inset container with rounded corners */}
      <div className="relative h-full w-full overflow-hidden rounded-2xl md:rounded-[2rem]">
        {/* ── Background Video ─────────────────────────────────── */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4"
            type="video/mp4"
          />
        </video>

        {/* ── Noise Overlay ────────────────────────────────────── */}
        <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.7] mix-blend-overlay" />

        {/* ── Gradient Overlay ─────────────────────────────────── */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

        {/* ── Navbar ──────────────────────────────────────────── */}
        <Navbar activeSection={activeSection} />

        {/* ── Hero Content (bottom-aligned) ───────────────────── */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-8 sm:pb-10 md:pb-14 lg:pb-16 xl:pb-20">
          <div className="mx-auto grid max-w-7xl grid-cols-12 gap-4 md:gap-8">
            {/* Left column — Giant heading (8 cols) */}
            <div className="col-span-12 md:col-span-8">
              <h1
                className="relative font-medium leading-[0.85] tracking-[-0.07em]"
                style={{ color: "#E1E0CC" }}
              >
                <span className="inline-block text-[26vw] sm:text-[24vw] md:text-[22vw] lg:text-[20vw] xl:text-[19vw] 2xl:text-[20vw]">
                  <WordsPullUp text="Prisma" showAsterisk />
                </span>
              </h1>
            </div>

            {/* Right column — Description + CTA (4 cols) */}
            <div className="col-span-12 md:col-span-4 flex flex-col justify-end gap-6 md:gap-8">
              {/* Description */}
              <p
                ref={descriptionRef}
                className="text-xs sm:text-sm md:text-base leading-[1.2] max-w-xs"
                style={{ color: "rgba(225, 224, 204, 0.7)" }}
              >
                {descInView && (
                  <motion.span {...fadeUp(0.5)}>
                    Prisma is a worldwide network of visual artists, filmmakers and storytellers
                    bound not by place, status or labels but by passion and hunger to unlock
                    potential through our unique perspectives.
                  </motion.span>
                )}
              </p>

              {/* CTA Button */}
              <div ref={ctaRef}>
                {ctaInView && (
                  <motion.div {...fadeUp(0.7)}>
                    <button
                      className="group inline-flex items-center gap-2 rounded-full bg-[#DEDBC8] px-5 py-2.5 sm:px-6 sm:py-3 transition-all duration-300 hover:gap-3"
                      style={{ color: "#000" }}
                    >
                      <span className="text-sm sm:text-base font-medium">Join the lab</span>
                      <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-black transition-transform duration-300 group-hover:scale-110">
                        <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: "#DEDBC8" }} />
                      </span>
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
