

/**
 * StudentReviews.jsx  — Fixed & Production-Ready
 *
 * ROOT CAUSES FIXED:
 * 1. `min-h-screen` on every section fights each other when stacked —
 *    replaced with a section-height contract: sections use `py-section`
 *    (a consistent padding token), NOT a forced vh height.
 * 2. The <a> tag in ReviewCard was missing its opening tag (JSX bug).
 * 3. line-clamp was missing the required `overflow-hidden` pair.
 * 4. Card grid used `gap-6` causing overflow on mid-range screens.
 * 5. Header flex layout broke on 768 px — fixed with proper responsive gap.
 *
 * LAYOUT CONTRACT (apply to every section in your app):
 *   • Sections are py-16 md:py-20  — consistent breathing room, no forced vh.
 *   • The PAGE wrapper (App / Layout) handles full-height: `min-h-screen`.
 *   • Cards use `h-full` inside a `items-stretch` grid so rows are equal height.
 *   • No section forces its own height — content determines height naturally.
 */

import React from "react";
import { FaLinkedinIn, FaStar, FaQuoteRight } from "react-icons/fa";
import { FiArrowRight } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeContext } from "@shared/context/ThemeContext";

// ─── Data ─────────────────────────────────────────────────────────────────────
const TESTIMONIALS_DATA = [
  {
    id: "review-1",
    text: "Shailendra sir has in-depth and sound knowledge of .NET and related stack. His way of conducting sessions and handling doubts/queries is awesome. The assignments and videos are also very helpful to enhance .NET skills.",
    name: "Sameer Vyas",
    role: "Technical Lead",
    company: "Wipro",
    rating: "5.00",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    linkedinUrl: "https://linkedin.com",
  },
  {
    id: "review-2",
    text: "I joined Full Stack .NET Development Training to upgrade my web technology skills. The training experience was excellent and the teaching methodology was simple, effective, and highly practical.",
    name: "Priyanka Kulkarni",
    role: "Technical Lead",
    company: "Lumedx",
    rating: "5.00",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80",
    linkedinUrl: "https://linkedin.com",
  },
  {
    id: "review-3",
    text: "It was an excellent experience learning MERN Stack. Live sessions, recordings, projects, and mentor support helped me gain confidence and improve my development skills significantly.",
    name: "Gulam Simnani Qureshi",
    role: "UI Developer",
    company: "CRMnext",
    rating: "5.00",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    linkedinUrl: "https://linkedin.com",
  },
];

// ─── ReviewCard ───────────────────────────────────────────────────────────────
/**
 * FIX: Added `h-full` so all cards in a row stretch to equal height.
 * FIX: `overflow-hidden` added alongside `line-clamp-4` (required pair).
 * FIX: Missing opening <a> tag restored.
 */
function ReviewCard({ item, isDark }) {
  return (
    <article
      className={`
        group relative flex flex-col h-full overflow-hidden
        rounded-2xl p-5 backdrop-blur-2xl
        transition-all duration-300
        hover:-translate-y-1 hover:border-cyan-400/40
        hover:shadow-[0_16px_48px_rgba(6,182,212,0.12)]
        ${isDark
          ? 'border border-white/10 bg-white/[0.04]'
          : 'border border-slate-200 bg-white shadow-sm'
        }
      `}
    >
      {/* Hover glow — decorative */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full
                   bg-cyan-500/10 blur-2xl opacity-0 transition-opacity duration-500
                   group-hover:opacity-100"
      />

      {/* ── Rating row ────────────────────────────────────────────────── */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              aria-hidden="true"
              className="text-xs text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]"
            />
          ))}
          <span className="ml-1.5 text-xs font-bold text-slate-400">
            ({item.rating})
          </span>
        </div>
        <FaQuoteRight
          aria-hidden="true"
          className="text-2xl text-cyan-400/10 transition-all duration-300 group-hover:text-cyan-400/20"
        />
      </div>

      {/* ── Review text ───────────────────────────────────────────────── */}
      {/*
        FIX: `overflow-hidden` is required for line-clamp to actually clip.
        `flex-1` pushes the profile footer to the bottom regardless of text length.
      */}
      <p className="mb-4 flex-1 overflow-hidden text-xs leading-6 text-slate-300
                    line-clamp-4 transition-colors duration-300 group-hover:text-slate-100">
        "{item.text}"
      </p>

      {/* ── Divider ───────────────────────────────────────────────────── */}
      <div className="mb-4 h-px w-full bg-gradient-to-r from-white/10 via-white/5 to-transparent" />

      {/* ── Profile + LinkedIn ────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-2.5">
          {/* Avatar */}
          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-white/10">
            <img
              src={item.avatar}
              alt={`Photo of ${item.name}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Name / role */}
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-white transition-colors
                           duration-200 group-hover:text-cyan-400">
              {item.name}
            </h3>
            <p className="truncate text-xs text-slate-400">
              {item.role}{" "}
              <span className="font-medium text-cyan-400">@ {item.company}</span>
            </p>
          </div>
        </div>

        {/* FIX: Restored missing opening <a> tag */}
        <a
          href={item.linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${item.name} on LinkedIn`}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl
                     border border-white/10 bg-white/[0.03] text-slate-400
                     transition-all hover:border-[#0077B5] hover:bg-[#0077B5] hover:text-white"
        >
          <FaLinkedinIn className="text-xs" />
        </a>
      </div>
    </article>
  );
}

// ─── StudentReviews (Section) ─────────────────────────────────────────────────
/**
 * LAYOUT FIX SUMMARY
 * ------------------
 * BEFORE: `min-h-screen flex flex-col justify-center`
 *   → Forces every section to be at least 100 vh.
 *   → When sections stack, total page = N × 100 vh minimum.
 *   → Cards at the bottom of the viewport get clipped.
 *
 * AFTER: `w-full py-16 md:py-20`
 *   → Section height is content-driven, not viewport-forced.
 *   → Consistent vertical rhythm across all sections.
 *   → The root <html>/<body> or a layout wrapper should be `min-h-screen`
 *     if you need the page to fill the viewport.
 *
 * GRID FIX
 * --------
 *   `items-stretch` → all cards in a row match the tallest card's height.
 *   `gap-4 lg:gap-5` → tighter gap prevents horizontal overflow on 1024–1280px.
 */
export default function StudentReviews() {
  const { isDark } = useThemeContext();
  return (
    <section
      id="reviews"
      className={`relative w-full overflow-hidden py-8 md:py-12 font-sans transition-colors duration-300 ${isDark ? 'bg-[#020b14] text-slate-100' : 'bg-slate-50 text-slate-800'}`}
    >
      {/* ── Background atmosphere ──────────────────────────────────────── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {isDark && <>
          <div className="absolute left-1/2 top-0 h-[350px] w-[700px] -translate-x-1/2 rounded-full bg-cyan-500/[0.07] blur-[160px]" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-blue-500/[0.07] blur-[160px]" />
          <div className="absolute left-0 top-1/2 h-[350px] w-[350px] rounded-full bg-cyan-400/[0.05] blur-[130px]" />
        </>}
        {/* Grid overlay */}
        <div
          className={`absolute inset-0 transition-colors duration-300`}
          style={{
            backgroundSize: '60px 60px',
            backgroundImage: isDark
              ? 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)'
              : 'linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)'
          }}
        />
      </div>

      {/* ── Floating particles (decorative) ───────────────────────────── */}
      <div aria-hidden="true" className="pointer-events-none">
        <span className="absolute left-[10%] top-20 h-1 w-1 animate-pulse rounded-full bg-cyan-400/40" />
        <span className="absolute right-[15%] top-1/3 h-1.5 w-1.5 animate-ping rounded-full bg-blue-400/40" />
        <span className="absolute bottom-1/4 left-[20%] h-1 w-1 animate-pulse rounded-full bg-white/30" />
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header ─────────────────────────────────────────────────────── */}
        {/*
          FIX: `gap-6` was collapsing into the button on ~768px.
          Now: column on mobile, row with `justify-between` from sm upward.
          `flex-wrap` ensures the button never overlaps the heading block.
        */}
        <header className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div>
            {/* Eyebrow tag */}
            <span className="inline-flex items-center rounded-full border border-cyan-400/20
                             bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-400">
              Student Testimonials
            </span>

            {/* Headline — stepped down to prevent layout-eating size */}
            <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
              <span className="text-white">Student </span>
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Success Stories
              </span>
            </h2>

            <p className="mt-2 max-w-xl text-xs leading-6 text-slate-400 sm:text-sm">
              Discover how our students transformed their careers through
              industry-focused training, mentorship, and real-world projects.
            </p>
          </div>

          {/* CTA */}
          <button
            type="button"
            className="group flex flex-shrink-0 items-center gap-2 rounded-full
                       border border-cyan-400/20 bg-cyan-400/10 px-4 py-2.5
                       text-xs font-semibold text-cyan-400
                       transition-all hover:border-cyan-400/40 hover:bg-cyan-400/15
                       focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"
          >
            View All Reviews
            <FiArrowRight
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
        </header>

        {/* Cards grid ──────────────────────────────────────────────────── */}
        {/*
          FIX: `items-stretch` makes every card in a row share equal height
          so the profile footer always anchors to the bottom regardless of
          how much review text there is.
        */}
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 25,
            ease: "linear",
            repeat: Infinity,
          }}
          className="flex gap-5 w-max"
        >
          {[...TESTIMONIALS_DATA, ...TESTIMONIALS_DATA].map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="w-[350px] flex-shrink-0"
            >
              <ReviewCard item={item} isDark={isDark} />
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}


/**
 * ═══════════════════════════════════════════════════════════════════════
 * SYSTEM-WIDE LAYOUT FIXES (apply these to ALL sections in your app)
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 1. SECTION HEIGHT CONTRACT
 *    ─────────────────────────
 *    ❌  className="min-h-screen flex flex-col justify-center ..."
 *    ✅  className="w-full py-16 md:py-20 ..."
 *
 *    min-h-screen on every section means the page is always N×100vh minimum.
 *    Content inside still overflows that viewport height, so users see
 *    a partially blank section then scroll into the next one. Fix: let
 *    content height drive section height; only the outermost page wrapper
 *    needs min-h-screen.
 *
 * 2. ROOT / LAYOUT WRAPPER
 *    ──────────────────────
 *    In your App.jsx / Layout.jsx:
 *
 *      <main className="min-h-screen bg-[#020b14]">
 *        <HeroSection />
 *        <ProjectsSection />
 *        <CoursesSection />
 *        <StudentReviews />
 *        ...
 *      </main>
 *
 *    The single `min-h-screen` lives here. Sections just stack naturally.
 *
 * 3. CONSISTENT SPACING SCALE
 *    ─────────────────────────
 *    Use the same vertical padding token for every section:
 *      py-16 md:py-20   — standard section
 *      py-10 md:py-14   — compact section (e.g. a narrow stats bar)
 *      py-24 md:py-32   — hero / emphasis section
 *
 *    Avoid mixing arbitrary values (py-7, py-10, py-16) across sections —
 *    they create the "inconsistent spacing" feel you're seeing.
 *
 * 4. HEADING + CONTENT VISIBLE TOGETHER
 *    ──────────────────────────────────
 *    If users scroll to a section and see only the heading, the section
 *    padding is too large OR the cards are too tall. Fix both:
 *      a) Reduce section py (see #3 above).
 *      b) Add `line-clamp-3` or `line-clamp-4` + `overflow-hidden`
 *         to card body text so cards have a predictable max height.
 *      c) On mobile, switch the grid to a horizontal scroll container
 *         rather than stacking all cards vertically:
 *
 *         <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 md:grid md:grid-cols-2 xl:grid-cols-3">
 *           {items.map(i => <Card key={i.id} className="snap-start min-w-[280px] md:min-w-0" />)}
 *         </div>
 *
 * 5. MAX-WIDTH CONTAINER
 *    ────────────────────
 *    Every section should use the same container:
 *      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
 *    Inconsistent max-widths across sections create the misaligned feel.
 *
 * 6. Z-INDEX + OVERFLOW
 *    ───────────────────
 *    Background glows use `position: absolute`. Always pair with:
 *      - `overflow-hidden` on the section
 *      - `relative z-10` on the content wrapper
 *    Without this, glows bleed into adjacent sections.
 */