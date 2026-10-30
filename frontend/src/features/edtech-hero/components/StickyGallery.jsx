import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/* ──────────────────────────────────────────────────────────────
   STICKY GALLERY — Stacked sticky images + sticky text
   ──────────────────────────────────────────────────────────────
   Left column: 3 images stacked, each sticky within its viewport
   Right column: sticky text that fades through stages
   ────────────────────────────────────────────────────────────── */

const GALLERY_ITEMS = [
  {
    src: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&q=80",
    alt: "Digital workspace",
    label: "Modern Learning Environment",
    description: "Access cutting-edge tools and platforms used by top tech companies worldwide.",
  },
  {
    src: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80",
    alt: "Team meeting",
    label: "Peer Collaboration",
    description: "Work alongside motivated peers in a supportive, high-accountability community.",
  },
  {
    src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80",
    alt: "Graduation",
    label: "Career Launchpad",
    description: "Graduate with a portfolio of real projects and direct employer connections.",
  },
];

export default function StickyGallery() {
  const containerRef = useRef(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Tall container on desktop for sticky effect; auto on mobile
  const containerHeight = isDesktop ? `${GALLERY_ITEMS.length * 120}vh` : "auto";

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const textOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [1, 1, 0, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.5, 1], [0, -40, -80]);

  return (
    <section
      ref={containerRef}
      className="relative bg-[#071226] overflow-x-hidden"
      style={{ height: containerHeight }}
    >
      {/* Grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 50%, black 20%, transparent 60%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 50%, black 20%, transparent 60%)",
        }}
      />

      <div className="relative h-full max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 h-full">
          {/* ── Left: Stacked Sticky Images ────────────── */}
          <div className="relative py-12 lg:py-0">
            {GALLERY_ITEMS.map((item, i) => (
              <div
                key={i}
                className="lg:sticky lg:top-[15vh] lg:h-[70vh] flex items-center mb-8 lg:mb-0"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-15%" }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.15,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  data-aos="fade-up"
                  data-aos-delay={i * 100}
                  data-aos-duration="700"
                  className="w-full"
                >
                  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 group">
                    <div className="aspect-[4/3] relative">
                      <img
                        src={item.src}
                        alt={item.alt}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>
                    {/* Image label */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-white/10 backdrop-blur-sm text-white/80 border border-white/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        {item.label}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>

          {/* ── Right: Sticky Text ─────────────────────── */}
          <div className="relative lg:sticky lg:top-0 lg:h-screen flex items-center">
            <motion.div
              style={{ opacity: textOpacity, y: textY }}
              data-aos="fade-left"
              data-aos-duration="800"
              className="w-full py-20 lg:py-0"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6 border border-white/10 bg-white/5 text-white/50">
                The Experience
              </div>

              {/* Headline */}
              <h2
                className="text-[clamp(2rem,4.5vw,3.5rem)] font-extrabold leading-[1.1] tracking-[-0.03em] mb-6"
                style={{ color: "rgba(255,255,255,0.95)" }}
              >
                A Learning Experience{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#A855F7] via-[#EC4899] to-[#F43F5E]">
                  Like No Other
                </span>
              </h2>

              {/* Stage descriptions */}
              <div className="space-y-8 mt-12">
                {GALLERY_ITEMS.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-20%" }}
                    transition={{
                      duration: 0.6,
                      delay: i * 0.2,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    data-aos="fade-right"
                    data-aos-delay={i * 100}
                    data-aos-duration="700"
                    className="group cursor-default"
                  >
                    <div className="flex items-start gap-4">
                      {/* Number indicator */}
                      <div className="flex-shrink-0 w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-xs font-bold text-white/40 group-hover:text-white/70 group-hover:border-white/20 transition-all duration-300">
                        0{i + 1}
                      </div>
                      <div>
                        <h3
                          className="text-base font-semibold mb-1"
                          style={{ color: "rgba(255,255,255,0.85)" }}
                        >
                          {item.label}
                        </h3>
                        <p
                          className="text-sm leading-relaxed"
                          style={{ color: "rgba(255,255,255,0.45)" }}
                        >
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
