import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight, PlayCircle, TrendingUp, Radio,
  Star, Plus, BarChart3, Code2, Languages, Megaphone, DollarSign, Palette,
  PiggyBank, Users, Video, Gamepad2, Clock, BookOpen, ShieldCheck,
  Briefcase, Rocket, CheckCircle2, MessageCircle, ChevronDown, ChevronUp,
  Award
} from 'lucide-react';
import Navbar from '@landing-shared/components/navbar';
import Seo from '@landing-shared/components/Seo';
import Footer from '@landing-shared/components/Footer';
import CareerRoadmapGenerator from '../components/Careerroadmapgenerator';
import RegisterModal from '../../../shared/components/RegisterModal';
import { useThemeContext } from '@landing-shared/context/ThemeContext';

// ─── Import real course data ──────────────────────────────────────────────
import { featuredCourses } from "../data/homeData";

// ---------------------------------------------------------------
// Reveal-on-scroll helpers
// ---------------------------------------------------------------
function useReveal(threshold = 0.2) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const [ref, visible] = useReveal();
  return (
    <Tag
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// ---------------------------------------------------------------
// Hero slide content — cycles automatically, background stays constant
// ---------------------------------------------------------------
const HERO_SLIDES = [
  {
    eyebrow: "Limited Seats Available",
    headlineLead: "Learn skills that",
    headlineAccent: "actually compound.",
    paragraph:
      "Structured tracks, live expert sessions, and guaranteed internship placement — designed to help you build real-world capabilities and land your first role.",
  },
  {
    eyebrow: "Hands-On From Day One",
    headlineLead: "Build real projects,",
    headlineAccent: "not busywork.",
    paragraph:
      "Every track pairs you with a mentor and ships something you can point to — a portfolio built while you learn, not after.",
  },
  {
    eyebrow: "Guaranteed Internship",
    headlineLead: "Launch your career,",
    headlineAccent: "with real support.",
    paragraph:
      "100% placement assistance, mock interviews, and a dedicated team behind you from day one to your first offer.",
  },
  {
    eyebrow: "Every Skill Level Welcome",
    headlineLead: "Whether you're starting fresh",
    headlineAccent: "or leveling up.",
    paragraph:
      "Students, career switchers, and working professionals all find a structured path here — built around finishing, not just starting.",
  },
  {
    eyebrow: "Six Learning Paths",
    headlineLead: "Business. Development. Design.",
    headlineAccent: "One platform.",
    paragraph:
      "Six tracks built by working practitioners — pick your domain and go deep with live sessions and real projects.",
  },
  {
    eyebrow: "Learners Who Finish",
    headlineLead: "Not just another course",
    headlineAccent: "you never complete.",
    paragraph:
      "A platform built around actually finishing what you start — with live sessions, mentor check-ins, and a track record to prove it.",
  },
];

// ---------------------------------------------------------------
// Hero Section (dark image banner + overlapping trust-points card)
// ---------------------------------------------------------------
function Hero({ onOpenModal }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);

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
    <section
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Dark generated-background hero (gradient + dot-grid + glow + network motif, no photo needed) */}
      <div
        className="relative min-h-[400px] w-full overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #133B5D 0%, #123F60 35%, #0B3554 65%, #0F2E49 100%)",
        }}
      >
        {/* Dot-grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          aria-hidden="true"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            maskImage: "radial-gradient(ellipse 70% 60% at 65% 40%, black 40%, transparent 90%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 65% 40%, black 40%, transparent 90%)",
          }}
        />

        {/* Glow accents */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -top-24 right-1/4 h-80 w-80 rounded-full bg-secondary-400 opacity-30 blur-[110px]" />
          <div className="absolute -bottom-24 right-10 h-80 w-80 rounded-full bg-white/10 blur-[120px]" />
        </div>

        {/* Faint network / node motif, right side */}
        <svg
          className="pointer-events-none absolute right-[6%] top-1/2 hidden h-56 w-56 -translate-y-1/2 opacity-[0.16] sm:block lg:h-72 lg:w-72"
          viewBox="0 0 100 100"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="50" cy="50" r="4" fill="white" />
          <circle cx="22" cy="30" r="2.5" fill="white" />
          <circle cx="78" cy="28" r="2.5" fill="white" />
          <circle cx="20" cy="72" r="2.5" fill="white" />
          <circle cx="80" cy="74" r="2.5" fill="white" />
          <circle cx="50" cy="14" r="2.5" fill="white" />
          <circle cx="50" cy="86" r="2.5" fill="white" />
          <line x1="50" y1="50" x2="22" y2="30" stroke="white" strokeWidth="1" />
          <line x1="50" y1="50" x2="78" y2="28" stroke="white" strokeWidth="1" />
          <line x1="50" y1="50" x2="20" y2="72" stroke="white" strokeWidth="1" />
          <line x1="50" y1="50" x2="80" y2="74" stroke="white" strokeWidth="1" />
          <line x1="50" y1="50" x2="50" y2="14" stroke="white" strokeWidth="1" />
          <line x1="50" y1="50" x2="50" y2="86" stroke="white" strokeWidth="1" />
          <line x1="22" y1="30" x2="50" y2="14" stroke="white" strokeWidth="0.6" strokeDasharray="2 3" />
          <line x1="78" y1="28" x2="50" y2="14" stroke="white" strokeWidth="0.6" strokeDasharray="2 3" />
          <line x1="20" y1="72" x2="50" y2="86" stroke="white" strokeWidth="0.6" strokeDasharray="2 3" />
          <line x1="80" y1="74" x2="50" y2="86" stroke="white" strokeWidth="0.6" strokeDasharray="2 3" />
        </svg>

        <div className="relative mx-auto flex max-w-7xl flex-col justify-start px-6 pt-4 pb-24 sm:pt-6 lg:pt-8">
          <Reveal
            key={`eyebrow-${activeSlide}`}
            className="inline-flex w-fit items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-xl"
          >
            <span className="flex h-2 w-2 rounded-full bg-secondary-400 animate-pulse" />
            <span className="usk-mono text-xs uppercase tracking-wider font-medium text-white">
              {slide.eyebrow}
            </span>
          </Reveal>

          <Reveal
            key={`headline-${activeSlide}`}
            delay={100}
            className="mt-3 max-w-4xl text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl lg:leading-[1.15]"
          >
            {slide.headlineLead}{" "}
            <span className="bg-gradient-to-r from-secondary-300 to-secondary-500 bg-clip-text text-transparent">
              {slide.headlineAccent}
            </span>
          </Reveal>

          <Reveal
            key={`paragraph-${activeSlide}`}
            delay={200}
            className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base"
          >
            {slide.paragraph}
          </Reveal>

          <Reveal delay={300} className="mt-5 flex flex-col gap-3.5 sm:flex-row">
            <button
              type="button"
              onClick={() => onOpenModal(null)}
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-secondary-500 text-primary-700 border border-secondary-500 px-7 py-3 text-sm font-semibold shadow-xl shadow-slate-900/15 transition-all duration-300 hover:bg-secondary-600 hover:scale-[1.02]"
            >
              Apply for New Batch
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
            <a
              href="#courses"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3 text-sm font-semibold text-white backdrop-blur-xl transition-all duration-300 hover:bg-white/20"
            >
              <PlayCircle size={16} className="text-secondary-400" />
              Browse Courses
            </a>
          </Reveal>
        </div>

        {/* Slide indicators — pinned above the overlap card's reach, not in the centered flow */}
        <div
          className="absolute bottom-16 left-6 z-10 flex items-center gap-2 sm:bottom-20 lg:bottom-24"
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
                i === activeSlide ? "w-8 bg-secondary-400" : "w-1.5 bg-white/30 hover:bg-white/50"
              }`}
              />
            ))}
          </div>
      </div>

      {/* Overlapping trust-points card */}
      <div className="relative z-10 mx-auto -mt-14 max-w-7xl px-6 sm:-mt-16 lg:-mt-20">
        <Reveal
          delay={400}
          className="grid gap-4 rounded-3xl border border-[#CFE1EF] bg-white p-5 shadow-xl dark:border-white/10 dark:bg-ink-900 sm:grid-cols-3 sm:p-6 lg:p-7"
        >
          {[
            { icon: Award, title: 'Corporate Level Training', desc: 'Industry-relevant curriculum' },
            { icon: Briefcase, title: 'Guaranteed Internship', desc: 'Real-world experience' },
            { icon: ShieldCheck, title: '100% Placement Assistance', desc: 'Dedicated career support' },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3 rounded-2xl p-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-300">
                <item.icon size={18} />
              </span>
              <div className="min-w-0">
                <p className="usk-display text-sm font-bold text-slate-900 dark:text-white">{item.title}</p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </Reveal>
      </div>

      <div className="h-8 sm:h-10 lg:h-12" aria-hidden="true" />
    </section>
  );
}

// ---------------------------------------------------------------
// Who This Is For
// ---------------------------------------------------------------
const AUDIENCES = [
  {
    icon: BookOpen,
    title: 'Students & Freshers',
    desc: 'No experience? Perfect starting point. Build portfolio projects and land your first role with our guaranteed internship placement.',
    tint: 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400',
    border: 'hover:border-primary-200 dark:hover:border-primary-500/30',
  },
  {
    icon: Briefcase,
    title: 'Career Switchers',
    desc: 'Transitioning from another field? Our structured tracks get you job-ready in your new domain within months, not years.',
    tint: 'bg-secondary-50 text-secondary-600 dark:bg-secondary-500/10 dark:text-secondary-400',
    border: 'hover:border-secondary-200 dark:hover:border-secondary-500/30',
  },
  {
    icon: TrendingUp,
    title: 'Working Professionals',
    desc: 'Upskill on the side with live weekend sessions and self-paced content that fits around your current job.',
    tint: 'bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand-light',
    border: 'hover:border-brand/30 dark:hover:border-brand/30',
  },
];

function WhoThisIsFor() {
  return (
    // FIX: Consistent vertical padding matching other sections
    <section className="bg-[#EEF5FB] py-10 dark:bg-app-dark-gradient sm:py-12">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="text-center">
          <p className="usk-mono text-xs uppercase tracking-widest text-primary-600 font-semibold dark:text-primary-400">
            Who this is for
          </p>
          <h2 className="mt-2 usk-display text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">
            Built for your next move
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Whether you're starting fresh or levelling up, there's a path here for you.
          </p>
        </Reveal>

        {/* FIX: gap-6 for better card breathing room */}
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {AUDIENCES.map((a, i) => (
            <Reveal
              key={a.title}
              delay={i * 80}
              className={`rounded-2xl border border-[#CFE1EF] bg-white p-6 shadow-[0_2px_8px_rgba(19,59,93,0.06)] transition-all duration-300 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03] ${a.border}`}
            >
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${a.tint}`}>
                <a.icon size={20} />
              </span>
              {/* FIX: mt-4 consistent heading spacing */}
              <h3 className="mt-4 usk-display text-sm font-semibold text-slate-900 dark:text-white">{a.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{a.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------
// Categories
// ---------------------------------------------------------------
const CATEGORIES = [
  { icon: BarChart3, label: 'Business', count: '12 courses', tint: 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400' },
  { icon: Code2, label: 'Development', count: '18 courses', tint: 'bg-secondary-50 text-secondary-600 dark:bg-secondary-500/10 dark:text-secondary-400' },
  { icon: Languages, label: 'Language', count: '8 courses', tint: 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400' },
  { icon: Megaphone, label: 'Marketing', count: '10 courses', tint: 'bg-secondary-50 text-secondary-600 dark:bg-secondary-500/10 dark:text-secondary-400' },
  { icon: DollarSign, label: 'Finance', count: '9 courses', tint: 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400' },
  { icon: Palette, label: 'Design', count: '14 courses', tint: 'bg-secondary-50 text-secondary-600 dark:bg-secondary-500/10 dark:text-secondary-400' },
];

function CategoriesSection() {
  return (
    <section id="categories" className="bg-slate-50/50 py-10 dark:bg-app-dark-gradient sm:py-12">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="usk-mono text-xs uppercase tracking-widest text-primary-600 font-semibold dark:text-primary-400">
              Browse by category
            </p>
            <h2 className="mt-2 usk-display text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">
              Explore Categories
            </h2>
          </div>
          <p className="max-w-xs text-xs text-slate-500 dark:text-slate-400">
            Six paths, one platform — every track built by working practitioners.
          </p>
        </Reveal>

        {/* FIX: gap-5 for consistent card grid spacing */}
        <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((c, i) => (
            <Reveal
              as="a"
              href="#courses"
              key={c.label}
              delay={i * 50}
              className="group flex flex-col items-start rounded-2xl border border-[#CFE1EF] bg-white p-5 shadow-[0_2px_8px_rgba(19,59,93,0.06)] transition-all duration-300 hover:border-primary-200 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-primary-500/30"
            >
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${c.tint}`}>
                <c.icon size={18} />
              </span>
              <p className="mt-3 usk-display text-xs font-semibold text-slate-900 dark:text-white">{c.label}</p>
              <p className="mt-0.5 usk-mono text-[11px] text-slate-400 dark:text-slate-500">{c.count}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------
// Featured Courses
// ---------------------------------------------------------------
const BADGE_COLOR_MAP = {
  Hot: 'bg-brand',
  New: 'bg-primary-600',
  Popular: 'bg-primary-600',
  'In Demand': 'bg-emerald-500',
  Trending: 'bg-brand',
};
const DEFAULT_BADGE_COLOR = 'bg-slate-600';

function CourseCard({ title, lessons, duration, rating, reviews, badge, badgeClass, image, index, onOpenModal }) {
  return (
    <Reveal
      delay={index * 80}
      className="group overflow-hidden rounded-2xl border border-[#CFE1EF] bg-white shadow-[0_2px_8px_rgba(19,59,93,0.06)] transition-all duration-300 hover:shadow-md flex flex-col justify-between dark:border-white/10 dark:bg-white/[0.03]"
    >
      <div className="relative h-40 w-full overflow-hidden bg-slate-100">
        {image ? (
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary-200 to-secondary-200" />
        )}
        {badge && (
          <span className={`absolute left-2.5 top-2.5 rounded-full ${badgeClass} px-2.5 py-0.5 usk-mono text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm`}>
            {badge}
          </span>
        )}
      </div>

      {/* FIX: consistent p-5 padding on card body */}
      <div className="p-5">
        <div className="flex items-center gap-1 text-xs">
          {/* FIX: star color uses theme-aware brand variable */}
          <Star size={12} className="fill-current text-amber-400" />
          <span className="font-semibold text-slate-900 dark:text-white">{rating}</span>
          {/* FIX: hide "N/A reviews" — show dash when not available */}
          <span className="text-slate-400 dark:text-slate-500 text-[11px]">
            {reviews && reviews !== 'N/A' ? `(${reviews} reviews)` : ''}
          </span>
        </div>
        <h3 className="mt-2 usk-display text-sm font-semibold leading-snug text-slate-900 dark:text-white">{title}</h3>
        <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <BookOpen size={13} className="text-primary-600 dark:text-primary-400" />
            {lessons}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={13} className="text-secondary-600 dark:text-secondary-400" />
            {duration}
          </span>
        </div>
      </div>

      {/* FIX: px-5 pb-5 for consistent bottom padding */}
      <div className="px-5 pb-5">
        <button
          type="button"
          onClick={() => onOpenModal({ title, lessons, duration })}
          className="w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-secondary-500 text-primary-700 border border-secondary-500 px-4 py-2.5 text-xs font-semibold transition-all duration-300 hover:bg-secondary-600 hover:scale-[1.02]"
        >
          Enroll Now
          <Plus size={13} />
        </button>
      </div>
    </Reveal>
  );
}
// ─── Course image map by title keyword ───────────────────────────────────────
const COURSE_IMAGE_MAP = [
  { key: "python",    url: "https://i.pinimg.com/736x/f9/0a/cb/f90acb224dfbb653ad778cee91217b78.jpg" },
  { key: "react",     url: "https://i.pinimg.com/1200x/9f/4f/cf/9f4fcf5aa7766a03f042b1e15489b39f.jpg" },
  { key: "node",      url: "https://i.pinimg.com/1200x/9f/4f/cf/9f4fcf5aa7766a03f042b1e15489b39f.jpg" },
  { key: "laravel",   url: "https://i.pinimg.com/1200x/9f/4f/cf/9f4fcf5aa7766a03f042b1e15489b39f.jpg" },
  { key: "web dev",   url: "https://i.pinimg.com/1200x/9f/4f/cf/9f4fcf5aa7766a03f042b1e15489b39f.jpg" },
  { key: "cloud",     url: "https://i.pinimg.com/736x/6d/3b/2d/6d3b2d761f653056f9866cc1fa518f6e.jpg" },
  { key: "aws",       url: "https://i.pinimg.com/736x/6d/3b/2d/6d3b2d761f653056f9866cc1fa518f6e.jpg" },
  { key: "cyber",     url: "https://i.pinimg.com/1200x/e6/ec/86/e6ec86d140147e8dc72514dbd2af546f.jpg" },
  { key: "security",  url: "https://i.pinimg.com/1200x/e6/ec/86/e6ec86d140147e8dc72514dbd2af546f.jpg" },
];
function getCourseImage(title = "") {
  const t = title.toLowerCase();
  const match = COURSE_IMAGE_MAP.find((m) => t.includes(m.key));
  return match ? match.url : "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600&h=400";
}


function FeaturedCourses({ onOpenModal }) {
  const displayedCourses = featuredCourses.slice(0, 4);

  return (
    <section id="courses" className="bg-white py-10 dark:bg-app-dark-gradient sm:py-12">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="usk-mono text-xs uppercase tracking-widest text-primary-600 font-semibold dark:text-primary-400">
              Handpicked for you
            </p>
            <h2 className="mt-2 usk-display text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">
              Featured Courses
            </h2>
          </div>
        </Reveal>

        {/* FIX: gap-6 for more breathing room between course cards */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displayedCourses.map((course, i) => (
            <CourseCard
              key={course.slug}
              title={course.title}
              lessons={course.sessions}
              duration={course.duration}
              rating={4.8}
              reviews={null}
              badge={course.badge}
              badgeClass={BADGE_COLOR_MAP[course.badge] || DEFAULT_BADGE_COLOR}
              image={getCourseImage(course.title)}
              index={i}
              onOpenModal={onOpenModal}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------
// Internship Section
// ---------------------------------------------------------------
function InternshipSection({ onOpenModal }) {
  const { isDark } = useThemeContext();

  return (
    <section
      className={`relative py-10 sm:py-12 ${
        isDark
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
          : 'bg-gradient-to-br from-primary-600 to-secondary-600'
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-0 overflow-hidden ${
          isDark ? 'opacity-10' : 'opacity-20'
        }`}
      >
        <div className="absolute -top-20 right-1/4 h-80 w-80 rounded-full bg-white blur-[80px]" />
        <div
          className={`absolute bottom-0 left-10 h-64 w-64 rounded-full blur-[70px] ${
            isDark ? 'bg-primary-500' : 'bg-secondary-300'
          }`}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-widest border ${
                isDark
                  ? 'border-white/10 bg-white/5 text-white/80'
                  : 'border-white/20 bg-white/15 text-white'
              }`}
            >
              <ShieldCheck size={13} /> Our Core Promise
            </span>
            <h2
              className={`mt-4 font-display text-3xl font-bold sm:text-4xl leading-tight ${
                isDark ? 'text-white' : 'text-white'
              }`}
            >
              Every learner gets a real internship. Guaranteed.
            </h2>
            <p
              className={`mt-4 text-sm leading-relaxed max-w-md ${
                isDark ? 'text-slate-300' : 'text-white/80'
              }`}
            >
              We don't just hand you a certificate. Before you graduate, we place you in a paid internship with one of our hiring partners — hands-on experience that shows on your resume.
            </p>
            <button
              type="button"
              onClick={() => onOpenModal(null)}
              className={`mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                isDark
                  ? 'bg-brand text-white hover:bg-brand/90'
                  : 'bg-white text-primary-700 hover:bg-primary-50'
              }`}
            >
              Claim Your Seat
              <ArrowRight size={15} />
            </button>
          </Reveal>

          {/* FIX: gap-4 consistent card spacing */}
          <Reveal delay={150} className="grid grid-cols-1 gap-4">
            {[
              {
                icon: Award,
                title: 'Corporate Level Training',
                desc: 'Get guaranteed internship and 100% placement assistance with our industry-aligned training programs.'
              },
              {
                icon: Briefcase,
                title: 'Real companies, real work',
                desc: 'Partner companies give you actual projects, not busy work.'
              },
              {
                icon: Rocket,
                title: 'Starts before you graduate',
                desc: 'Begin your internship while still completing your track.'
              },
              {
                icon: Users,
                title: 'Dedicated placement team',
                desc: 'Our placement team prepares your resume, mock interviews, and referrals.'
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className={`flex items-start gap-4 rounded-2xl border p-4 backdrop-blur-sm ${
                  isDark
                    ? 'border-white/10 bg-white/5'
                    : 'border-white/20 bg-white/10'
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    isDark ? 'bg-white/10 text-white' : 'bg-white/20 text-white'
                  }`}
                >
                  <item.icon size={17} />
                </span>
                <div>
                  <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-white'}`}>
                    {item.title}
                  </p>
                  <p className={`mt-0.5 text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-white/70'}`}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------
// Why Choose Us
// ---------------------------------------------------------------
const FEATURES = [
  {
    icon: Code2,
    title: 'Hands-On Learning',
    desc: 'Learn by building, practicing, and applying skills to real scenarios.',
  },
  {
    icon: Users,
    title: 'Expert Mentors',
    desc: 'Learn directly from industry leaders with real-world experience.',
  },
  {
    icon: Video,
    title: 'Live Classes',
    desc: 'Interactive sessions with instructors in real-time to clear your doubts instantly.',
  },
  {
    icon: Gamepad2,
    title: 'Fun & Interactive',
    desc: 'Gamified learning paths keep you motivated and engaged every step.',
  },
];

function WhyChooseUs() {
  return (
    <section
      id="why"
      className="relative bg-gradient-to-br from-secondary-50/40 via-primary-50/30 to-slate-50 py-10 dark:bg-app-dark-gradient sm:py-12"
    >
      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal className="text-center">
          <p className="usk-mono text-xs uppercase tracking-widest font-semibold text-brand dark:text-brand-light">
            Why choose Kini Edx Hub
          </p>
          <h2 className="mt-2 usk-display text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">
            More than a course library
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            We make learning joyful, accessible, and effective — with a platform built around actually finishing what you start.
          </p>
        </Reveal>

        {/* FIX: gap-6 for better card spacing; icon tint corrected to use brand color */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <Reveal
              key={f.title}
              delay={i * 80}
              className="rounded-2xl border border-[#CFE1EF] bg-white/95 p-6 shadow-[0_2px_8px_rgba(19,59,93,0.06)] transition-all duration-300 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03]"
            >
              {/* FIX: Icon background uses brand color consistently in both light and dark */}
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand-light">
                <f.icon size={20} />
              </span>
              <h3 className="mt-4 usk-display text-sm font-semibold text-slate-900 dark:text-white">{f.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{f.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------
// Instructor Section
// ---------------------------------------------------------------
const INSTRUCTORS = [
  {
    name: 'Srinivas',
    role: 'Lead Mentor',
    bio: '10+ years in product and tech. Previously at major startups. Teaches practical skills, not theory.',
    initials: 'SS',
    color: 'bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300',
  },
  {
    name: 'Sneha Reddy',
    role: 'Design & UX Lead',
    bio: 'Ex-senior designer with work at top product companies. Mentors students on building real portfolios.',
    initials: 'SR',
    color: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-500/20 dark:text-secondary-300',
  },
  {
    name: 'Poorna Sai',
    role: 'Full-Stack Engineering',
    bio: 'Built and shipped products used by thousands. Passionate about teaching clean, production-ready code.',
    initials: 'PS',
    color: 'bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300',
  },
];

function InstructorsSection() {
  return (
    <section className="bg-[#EFFBF7] py-10 dark:bg-app-dark-gradient sm:py-12">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="text-center">
          <p className="usk-mono text-xs uppercase tracking-widest text-primary-600 font-semibold dark:text-primary-400">
            Your mentors
          </p>
          <h2 className="mt-2 usk-display text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">
            Learn from people who've done it
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Not just educators — practitioners who are active in their fields right now.
          </p>
        </Reveal>

        {/* FIX: gap-6 for consistent card spacing */}
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {INSTRUCTORS.map((ins, i) => (
            <Reveal
              key={ins.name}
              delay={i * 80}
              className="rounded-2xl border border-[#CFE1EF] bg-white p-6 shadow-[0_2px_8px_rgba(19,59,93,0.06)] transition-all duration-300 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03]"
            >
              <span className={`flex h-14 w-14 items-center justify-center rounded-2xl usk-mono text-lg font-bold ${ins.color}`}>
                {ins.initials}
              </span>
              <h3 className="mt-4 usk-display text-sm font-semibold text-slate-900 dark:text-white">{ins.name}</h3>
              <p className="usk-mono text-[11px] text-primary-600 dark:text-primary-400 mt-1">{ins.role}</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{ins.bio}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------
const QUOTES = [
  {
    name: 'Priya',
    role: 'UX Designer — Batch 1 preview student',
    text: 'The mentor feedback loop is what made it stick. I shipped a real portfolio piece in week 3, not week 12.',
    initials: 'PN',
  },
  {
    name: 'Lahari Lakshmi',
    role: 'Full-Stack Developer — Beta cohort',
    text: 'I compared four platforms before this one. This was the only one that felt built for finishing, not just starting.',
    initials: 'LL',
  },
  {
    name: 'M. Narayana',
    role: 'Marketing Lead — Early access',
    text: 'The live sessions mean you actually stay on track. I finished the whole track in 6 weeks.',
    initials: 'MN',
  },
];

function Testimonials() {
  return (
    <section id="reviews" className="bg-[#FFF9F1] py-10 dark:bg-app-dark-gradient sm:py-12">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="text-center">
          <p className="usk-mono text-xs uppercase tracking-widest text-primary-600 font-semibold dark:text-primary-400">
            From early learners
          </p>
          <h2 className="mt-2 usk-display text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">
            Learners who finished, not just started
          </h2>
        </Reveal>

        {/* FIX: gap-6 for consistent spacing */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {QUOTES.map((q, i) => (
            <Reveal
              key={q.name}
              delay={i * 80}
              className="rounded-2xl border border-[#FFF4E5] bg-white p-6 shadow-[0_2px_8px_rgba(19,59,93,0.06)] dark:border-white/10 dark:bg-white/[0.03]"
            >
              {/* FIX: Stars now render as amber/yellow, matching brand star in CourseCard */}
              <div className="flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} size={13} className="fill-current" />
                ))}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">"{q.text}"</p>
              <div className="mt-5 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 usk-mono text-[11px] font-medium text-primary-600 dark:bg-primary-500/10 dark:text-primary-300 shrink-0">
                  {q.initials}
                </span>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">{q.name}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{q.role}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------
const FAQS = [
  {
    q: 'Is this suitable for complete beginners?',
    a: 'Absolutely. Our tracks start from the ground up. No prior experience needed — just a willingness to put in the work.',
  },
  {
    q: 'Are classes live or pre-recorded?',
    a: 'Both. You get live weekly sessions with your mentor, plus recorded modules you can revisit anytime at your own pace.',
  },
  {
    q: 'How does the guaranteed internship work?',
    a: 'Once you complete 80% of your track, our placement team connects you with hiring partners. We help you apply, prep for interviews, and land a paid internship — before you graduate.',
  },
  {
    q: 'Can I study while working full-time?',
    a: 'Yes. Live sessions are scheduled on weekends, and all content is available on-demand. Most working students invest 8–10 hours per week.',
  },
  {
    q: 'What if I fall behind?',
    a: "No worries. You keep lifetime access to all content and can join the next cohort's live sessions for free if you need more time.",
  },
];

function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <section className="bg-[#F2FBF8] py-10 dark:bg-app-dark-gradient sm:py-12">
      <div className="mx-auto max-w-2xl px-6">
        <Reveal className="text-center">
          <p className="usk-mono text-xs uppercase tracking-widest text-primary-600 font-semibold dark:text-primary-400">
            Questions
          </p>
          <h2 className="mt-2 usk-display text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">
            Frequently asked
          </h2>
        </Reveal>

        {/* FIX: Reveal only wraps the question button, not the whole item + answer, preventing phantom height */}
        <div className="mt-8 divide-y divide-slate-200/80 dark:divide-white/10">
          {FAQS.map((faq, i) => (
            <div key={faq.q}>
              <Reveal delay={i * 50}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{faq.q}</span>
                  {open === i
                    ? <ChevronUp size={16} className="shrink-0 text-primary-600 dark:text-primary-400" />
                    : <ChevronDown size={16} className="shrink-0 text-slate-400 dark:text-slate-500" />
                  }
                </button>
              </Reveal>
              {open === i && (
                <p className="pb-5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------
// Final CTA
// ---------------------------------------------------------------
function FinalCTA({ onOpenModal }) {
  return (
    <section className="relative bg-gradient-to-t from-primary-50/30 to-white py-10 dark:bg-app-dark-gradient sm:py-12">
      {/* FIX: section is always full-height; only inner content elements reveal individually */}
      <div className="relative mx-auto max-w-lg px-6 text-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full bg-brand/10 border border-brand/20 px-4 py-1.5 usk-mono text-[11px] font-semibold text-brand dark:bg-brand/20 dark:border-brand/30 dark:text-brand-light">
            <span className="h-2 w-2 rounded-full bg-brand animate-pulse" />
            New Batch starts soon — seats are limited
          </span>
        </Reveal>

        <Reveal delay={80}>
          <h2 className="mt-6 usk-display text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">
            Your next skill is{' '}
            <span className="bg-gradient-to-r from-primary-600 to-secondary-700 bg-clip-text text-transparent dark:from-primary-400 dark:to-secondary-300">
              one course away.
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-sm text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            Join our founding batch and build something real from day one. Guaranteed internship placement included.
          </p>
        </Reveal>

        <Reveal delay={160}>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => onOpenModal(null)}
              className="group inline-flex items-center gap-2 rounded-full bg-secondary-500 text-primary-700 border border-secondary-500 px-6 py-3 text-xs font-semibold shadow-lg transition-all duration-300 hover:bg-secondary-600 hover:scale-105"
            >
              Apply for New Batch
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </button>
            <a
              href="#courses"
              className="inline-flex items-center gap-2 rounded-full bg-primary-700 text-secondary-500 border border-secondary-500 px-6 py-3 text-xs font-semibold transition-all duration-300 hover:bg-primary-600"
            >
              Browse Courses
            </a>
          </div>

          <p className="mt-6 text-xs text-slate-500 dark:text-slate-400">
            Have questions?{' '}
            <a
              href="https://wa.me/919000198239" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <MessageCircle size={13} />
              Chat with us on WhatsApp
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------
// Root Component
// ---------------------------------------------------------------
export default function UpskillCourseProgram() {
  const [modalCourse, setModalCourse] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = (course) => {
    setModalCourse(course);
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setModalCourse(null);
  };

  return (
    <div className="usk-body bg-white text-slate-900 dark:bg-ink-950 dark:text-white">
      <Seo
        title="Upskill Programs & Admissions"
        description="Explore Kini Edx Hub's upskilling programs, admissions process and career tracks in web development, AI/ML and cloud."
        path="/upskill-program"
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');

        .usk-body { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
        .usk-display { font-family: 'Sora', ui-sans-serif, system-ui, sans-serif; }
        .usk-mono { font-family: 'IBM Plex Mono', ui-monospace, monospace; }

        /* ─── Brand colour variables ─── */
        :root {
          --color-brand: #133B5D;
          --color-brand-light: #F39924;
        }
        .dark {
          --color-brand: #F39924;
          --color-brand-light: #133B5D;
        }
        .bg-brand { background-color: var(--color-brand); }
        .text-brand { color: var(--color-brand); }
        .border-brand { border-color: var(--color-brand); }
        .bg-brand\\/10 { background-color: color-mix(in srgb, var(--color-brand) 10%, transparent); }
        .bg-brand\\/20 { background-color: color-mix(in srgb, var(--color-brand) 20%, transparent); }
        .text-brand-light { color: var(--color-brand-light); }
        .dark\\:text-brand-light { color: var(--color-brand-light); }
        .dark\\:bg-brand\\/20 { background-color: color-mix(in srgb, var(--color-brand) 20%, transparent); }
        .dark\\:border-brand\\/30 { border-color: color-mix(in srgb, var(--color-brand) 30%, transparent); }

        /* Enroll Now button uses solid orange (see component classes) */

        @keyframes usk-float-kf {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        .usk-float { animation: usk-float-kf 6s ease-in-out infinite; }

        @keyframes usk-float-kf-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-9px); }
        }
        .usk-float-slow { animation: usk-float-kf-slow 8s ease-in-out infinite 1s; }

        .sticky-nav-wrapper {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid rgba(226, 232, 240, 0.5);
        }
        .sticky-nav-wrapper nav {
          background: transparent !important;
        }
        .dark .sticky-nav-wrapper {
          background: rgba(15, 23, 42, 0.92);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        @media (prefers-reduced-motion: reduce) {
          .usk-float, .usk-float-slow { animation: none; }
          * { transition-duration: 0.001ms !important; animation-duration: 0.001ms !important; }
        }
      `}</style>

      <div className="sticky-nav-wrapper">
        <Navbar />
      </div>

      <main className="overflow-x-hidden">
        <Hero onOpenModal={handleOpenModal} />
        <CareerRoadmapGenerator />
        <FeaturedCourses onOpenModal={handleOpenModal} />
        <InternshipSection onOpenModal={handleOpenModal} />
        <WhyChooseUs />
        <InstructorsSection />
        <Testimonials />
        <FAQ />
        <FinalCTA onOpenModal={handleOpenModal} />
      </main>
      <Footer compact />
      <RegisterModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        course={modalCourse}
      />
    </div>
  );
}