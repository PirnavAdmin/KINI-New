import { useRef, useMemo, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Award, BookOpen, Code, Users } from "lucide-react";

/* ──────────────────────────────────────────────────────────────
   STICKY IMAGE SCROLL — Split layout (text sticky / images scroll)
   ──────────────────────────────────────────────────────────────
   Left side:  sticky text that pins while scrolling
   Right side: images that scroll vertically with alternating skew
   ────────────────────────────────────────────────────────────── */

const IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80",
    alt: "Team collaboration",
    skew: "skew-x-6",
    caption: "Collaborative Learning",
  },
  {
    src: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&q=80",
    alt: "Mentorship session",
    skew: "-skew-x-6",
    caption: "Expert Mentorship",
  },
  {
    src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80",
    alt: "Workshop",
    skew: "skew-x-3",
    caption: "Hands-on Workshops",
  },
  {
    src: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80",
    alt: "Strategy session",
    skew: "-skew-x-3",
    caption: "Career Strategy",
  },
];

const BENEFITS = [
  { icon: Code, label: "Live Projects" },
  { icon: Users, label: "1:1 Mentorship" },
  { icon: BookOpen, label: "Structured Curriculum" },
  { icon: Award, label: "Certification" },
];

export default function StickyImageScroll() {
  const containerRef = useRef(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Tall container on desktop for sticky scroll; normal height on mobile
  const containerHeight = isDesktop ? `${IMAGES.length * 120}vh` : "auto";

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const textOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [1, 1, 0.3, 0]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -80]);

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
        }}
      />

      <div className="relative h-full max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 h-full">
          {/* ── Left: Sticky Text ────────────────────────── */}
          <div className="relative lg:sticky lg:top-0 lg:h-screen flex items-center">
            <motion.div
              style={{ opacity: textOpacity, y: textY }}
              data-aos="fade-up"
              data-aos-duration="800"
              className="w-full py-20 lg:py-0"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6 border border-white/10 bg-white/5 text-white/50">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                Why Choose Us
              </div>

              {/* Headline */}
              <h2
                className="text-[clamp(2rem,4.5vw,3.5rem)] font-extrabold leading-[1.1] tracking-[-0.03em] mb-6"
                style={{ color: "rgba(255,255,255,0.95)" }}
              >
                Your Journey to{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#60A5FA] via-[#818CF8] to-[#A855F7]">
                  Career Success
                </span>
              </h2>

              <p
                className="text-base leading-relaxed max-w-md mb-10"
                style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.8 }}
              >
                Every element of our program is crafted to bridge the gap between
                where you are and where you want to be — faster.
              </p>

              {/* Benefit pills */}
              <div className="flex flex-wrap gap-3">
                {BENEFITS.map((b, i) => {
                  const Icon = b.icon;
                  return (
                    <div
                      key={i}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-white/10 bg-white/5 text-white/60 transition-all duration-300 hover:bg-white/10 hover:text-white/80 hover:border-white/20"
                    >
                      <Icon className="w-4 h-4" />
                      {b.label}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* ── Right: Scrolling Images ──────────────────── */}
          <div className="relative flex flex-col gap-8 py-12 lg:py-32">
            <div className="space-y-12 lg:space-y-24">
              {IMAGES.map((img, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{
                    duration: 0.7,
                    delay: i * 0.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  data-aos="fade-up"
                  data-aos-delay={i * 100}
                  data-aos-duration="700"
                  className={`group ${img.skew} transition-all duration-500 hover:scale-[1.02]`}
                >
                  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                    <div className="aspect-[4/3] relative">
                      <img
                        src={img.src}
                        alt={img.alt}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>
                    {/* Caption */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <p className="text-white font-semibold text-sm">
                        {img.caption}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
