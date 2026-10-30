import { useEffect, useState } from "react";
import { Globe, Users } from "lucide-react";

/* ─── Tokens (matches Internships.jsx / rest of the KINI site) ─── */
const NAVY = "#133B5D";
const TEAL = "#F39924";
const TEAL_LIGHT = "#FFF4E5";
const NAVY_LIGHT = "#EEF3F8";

// Swap for a real KINI/team photo when available.
const HERO_IMAGE =
  "https://i.pinimg.com/736x/1f/05/58/1f0558b5e9044faef7c4d5de63621c00.jpg";

const infoPoints = [
  {
    icon: Globe,
    tint: NAVY_LIGHT,
    color: NAVY,
    text: "Kini team focused on practical, industry-aligned training",
  },
  {
    icon: Users,
    tint: TEAL_LIGHT,
    color: TEAL,
    text: "Mentors and career coaches for hands-on, ongoing support",
  },
];

/* ─── Hero slide fade-in, injected once ─── */
const SLIDE_FADE_STYLE = `
  @keyframes about-hero-slide-fade {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .about-hero-slide-fade { animation: about-hero-slide-fade 0.5s ease-out; }
`;

/* ─── Hero slides — cycle automatically, photo + overlay stay constant ─── */
const HERO_SLIDES = [
  {
    headline: "People-first learning, built for real outcomes.",
    paragraph:
      "Kini helps students build real skills through live projects, mentorship, and a curriculum that mirrors the industry — not just the classroom.",
  },
  {
    headline: "Practical training, not just theory.",
    paragraph:
      "Every program is built around real project work and mentorship from people who've done the job — not just taught it.",
  },
  {
    headline: "A team that stays involved the whole way.",
    paragraph:
      "From curriculum to mentorship to placement support, we're with you from day one to your first offer.",
  },
];

export default function AboutHero() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!document.getElementById("about-hero-slide-fade-styles")) {
      const tag = document.createElement("style");
      tag.id = "about-hero-slide-fade-styles";
      tag.textContent = SLIDE_FADE_STYLE;
      document.head.appendChild(tag);
    }
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || paused) return undefined;
    const timer = setInterval(() => {
      setActiveSlide((i) => (i + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [paused]);

  const slide = HERO_SLIDES[activeSlide];

  return (
    <section className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {/* ── Dark image hero ── */}
      <div className="relative min-h-[320px] w-full overflow-hidden sm:min-h-[360px] lg:min-h-[420px]">
        <img
          src={HERO_IMAGE}
          alt="The Kini team collaborating"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(100deg, rgba(11,53,84,0.90) 0%, rgba(11,53,84,0.60) 45%, rgba(11,53,84,0.30) 100%)",
          }}
        />

        <div className="relative mx-auto flex max-w-6xl flex-col justify-start px-4 pt-10 pb-20 sm:px-6 sm:pt-14 lg:px-8 lg:pt-16">
          <div key={activeSlide} className="about-hero-slide-fade">
            {/* TODO: swap in real About Us headline/copy */}
            <h1 className="max-w-2xl text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
              {slide.headline}
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-7 text-white/80">
              {slide.paragraph}
            </p>
          </div>
        </div>

        {/* Slide indicators — pinned above the overlap card's reach, not in the content flow */}
        <div
          className="absolute bottom-20 left-4 z-10 flex items-center gap-2 sm:bottom-24 sm:left-6 lg:bottom-28 lg:left-8"
          role="tablist"
          aria-label="Hero slides"
        >
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === activeSlide}
              aria-label={`Show slide ${i + 1} of ${HERO_SLIDES.length}`}
              onClick={() => setActiveSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeSlide ? "w-8" : "w-1.5 bg-white/30 hover:bg-white/50"
              }`}
              style={i === activeSlide ? { backgroundColor: TEAL } : undefined}
            />
          ))}
        </div>
      </div>

      {/* ── Overlapping intro card ── */}
      <div className="relative z-10 mx-auto -mt-16 max-w-6xl px-4 sm:-mt-20 sm:px-6 lg:-mt-24 lg:px-8">
        <div className="grid gap-8 rounded-3xl bg-white p-6 shadow-xl sm:p-8 lg:grid-cols-[1.3fr_1fr] lg:gap-10 lg:p-10">
          {/* Left: badge + heading + copy */}
          <div>
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest"
              style={{ backgroundColor: NAVY_LIGHT, color: NAVY }}
            >
              About Us
            </span>

            {/* TODO: swap in real About Us headline/copy */}
            <h2 className="mt-4 text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl lg:text-[2.25rem]">
              Simple, practical training for careers that last.
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-7 text-slate-500">
              From curriculum to mentorship to placement support, we help students
              move from learning to doing — with a team that stays involved the
              whole way.
            </p>
          </div>

          {/* Right: two stacked info cards */}
          <div className="flex flex-col justify-center gap-4">
            {infoPoints.map(({ icon: Icon, tint, color, text }) => (
              <div key={text} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: tint, color }}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <p className="text-[13px] leading-6 text-slate-700">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Spacer so the next section clears the card's shadow */}
      <div className="h-8 sm:h-10 lg:h-12" aria-hidden="true" />
    </section>
  );
}