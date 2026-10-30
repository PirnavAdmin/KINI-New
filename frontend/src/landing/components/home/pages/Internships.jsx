import { useEffect, useState, memo } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  Award,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  Code2,
  Database,
  FileSearch,
  Mail,
  MessageCircle,
  Percent,
  PlayCircle,
  Rocket,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";
import { ROUTES } from "@landing-shared/constants/routeConstants";
import Navbar from "../../../shared/components/navbar/index";
import Seo from "../../../shared/components/Seo";
import Footer from "../../../shared/components/Footer/index";

/* ─── Tokens ─── */
const NAVY   = "#133B5D";
const TEAL   = "#F39924";
const TEAL_LIGHT = "#FFF4E5";
const NAVY_LIGHT = "#EEF3F8";

/* ─── Hero slide fade-in, injected once (matches the .sf pattern used on Corporate Training) ─── */
const SLIDE_FADE_STYLE = `
  @keyframes internships-slide-fade {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .internships-slide-fade { animation: internships-slide-fade 0.5s ease-out; }
`;

/* ─── Hero slides — cycle automatically, background stays constant ─── */
const HERO_SLIDES = [
  {
    lines: ["Real projects,", "a real mentor,"],
    accent: "a real outcome.",
    paragraph:
      "Built around live project work — not shadowing. Interns ship something they can point to, with a mentor checking in all the way.",
  },
  {
    lines: ["Real companies,", "real stakeholders,"],
    accent: "real experience.",
    paragraph:
      "Projects are scoped directly with partner companies — feature work, data projects, and internal tooling. Not busywork.",
  },
  {
    lines: ["A mentor who's", "actually there,"],
    accent: "the whole way.",
    paragraph:
      "Every intern is paired with a dedicated mentor for the full duration — scheduled check-ins, and open access for ad-hoc questions.",
  },
  {
    lines: ["Finish with proof,", "not just"],
    accent: "a certificate.",
    paragraph:
      "A verifiable certificate documenting your track, duration, and project scope — ready to share on LinkedIn and your résumé.",
  },
];

/* ─── Data ─── */
const stats = [
  { Icon: CalendarClock, tint: "bg-primary-50 text-primary-600",    title: "Duration",                  detail: "8–24 weeks, agreed before onboarding." },
  { Icon: Briefcase,     tint: "bg-emerald-50 text-emerald-600", title: "Stipend",               detail: "Confirmed at offer stage, varies by track." },
  { Icon: Percent,       tint: "bg-secondary-50 text-secondary-600", title: "Conversion Rate",          detail: "Eligible completers are offered further opportunities." },
];

const eligibility = [
  "Enrolled in or a recent graduate of a relevant technical program",
  "Foundations module completed for the chosen track",
  "Available for the full duration without overlapping commitments",
];

const steps = [
  { Icon: FileSearch,    title: "Application",   detail: "Background and track preference reviewed." },
  { Icon: Code2,         title: "Screening",     detail: "Short technical assessment for the domain." },
  { Icon: MessageCircle, title: "Interview",      detail: "Conversation with a mentor to confirm fit." },
  { Icon: Mail,          title: "Onboarding",    detail: "Start date, mentor, and project brief issued." },
];

const projects = [
  { Icon: Code2,     tint: "bg-primary-50 text-primary-600",    text: "Feature work on live internal or partner-facing products" },
  { Icon: Database,  tint: "bg-emerald-50 text-emerald-600", text: "Applied data projects on real, anonymised datasets" },
  { Icon: Wrench,    tint: "bg-secondary-50 text-secondary-600", text: "Internal tooling and automation builds" },
];

const evalPoints = ["Milestone-based evaluations", "Regular feedback and check-ins", "Final review and outcome discussion"];
const certPoints = ["Verifiable certificate of completion", "Includes project scope and duration", "Share on LinkedIn and résumés"];

/* ─── Micro-components ─── */
const CTAButton = memo(({ to, children }) => (
  <Link
    to={to}
    className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-primary-700 bg-secondary-500 shadow-sm transition-all duration-200 hover:bg-secondary-600 hover:scale-[1.02] hover:shadow-md"
  >
    {children}
    <span aria-hidden="true">→</span>
  </Link>
));

const SectionIcon = memo(({ Icon, bg = NAVY }) => (
  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white" style={{ backgroundColor: bg }}>
    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
  </span>
));

export default function Internships() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => AOS.refresh());
    if (!document.getElementById("internships-slide-fade-styles")) {
      const tag = document.createElement("style");
      tag.id = "internships-slide-fade-styles";
      tag.textContent = SLIDE_FADE_STYLE;
      document.head.appendChild(tag);
    }
    return () => { cancelAnimationFrame(raf); };
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
    <main className="min-h-screen bg-white font-sans text-slate-900 antialiased">
      <Seo
        title="Internships"
        description="Gain real-world experience with Kini Edx Hub's internship program, bridging training and full-time placement opportunities."
        path="/internships"
      />
      <Navbar />

      {/* ── HERO (dark image banner + two-column overlap card) ── */}
      <section className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        {/* Dark generated-background hero (gradient + dot-grid + glow, no photo needed) */}
        <div
          className="relative min-h-[260px] w-full overflow-hidden sm:min-h-[280px] lg:min-h-[300px]"
          style={{
            background: `linear-gradient(160deg, ${NAVY} 0%, #123F60 35%, #0B3554 65%, #0F2E49 100%)`,
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
            <div className="absolute -top-24 right-1/4 h-72 w-72 rounded-full opacity-30 blur-[100px]" style={{ backgroundColor: TEAL }} />
            <div className="absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-white/10 blur-[110px]" />
          </div>

          {/* Faint lightbulb / innovation motif, right side */}
          <svg
            className="pointer-events-none absolute right-[8%] top-1/2 hidden h-40 w-40 -translate-y-1/2 opacity-[0.18] sm:block lg:h-52 lg:w-52"
            viewBox="0 0 100 100"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="50" cy="42" r="22" stroke="white" strokeWidth="1.5" />
            <path d="M42 62 L42 72 Q42 76 46 76 L54 76 Q58 76 58 72 L58 62" stroke="white" strokeWidth="1.5" />
            <line x1="45" y1="80" x2="55" y2="80" stroke="white" strokeWidth="1.5" />
            <line x1="50" y1="10" x2="50" y2="18" stroke="white" strokeWidth="1.5" />
            <line x1="18" y1="42" x2="26" y2="42" stroke="white" strokeWidth="1.5" />
            <line x1="74" y1="42" x2="82" y2="42" stroke="white" strokeWidth="1.5" />
            <line x1="26" y1="18" x2="31" y2="23" stroke="white" strokeWidth="1.5" />
            <line x1="74" y1="18" x2="69" y2="23" stroke="white" strokeWidth="1.5" />
            <circle cx="50" cy="42" r="3" fill="white" />
          </svg>

          <div className="relative mx-auto flex max-w-6xl flex-col items-center justify-start px-4 pt-8 pb-20 text-center sm:px-6 sm:pt-10 sm:pb-24 lg:px-8 lg:pt-12 lg:pb-28">
            <div key={activeSlide} className="internships-slide-fade">
              <h1 className="mx-auto max-w-3xl text-2xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-3xl lg:text-4xl">
                {slide.lines.join(" ")}
                <br />
                <span style={{ color: TEAL }}>{slide.accent}</span>
              </h1>
              <p className="mx-auto mt-4 max-w-lg text-[15px] leading-7 text-white/80">
                {slide.paragraph}
              </p>
            </div>
          </div>

          {/* Slide indicators — pinned above the overlap card's reach, not in the centered flow */}
          <div
            className="absolute bottom-20 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 sm:bottom-24 lg:bottom-28"
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

        {/* Overlapping two-column card */}
        <div className="relative z-10 mx-auto -mt-16 max-w-6xl px-4 sm:-mt-20 sm:px-6 lg:-mt-24 lg:px-8">
          <div className="grid gap-6 rounded-3xl bg-white p-6 shadow-xl sm:p-8 lg:grid-cols-[1.2fr_1fr] lg:gap-10 lg:p-10">

            {/* Left: badge + intro + CTAs */}
            <div className="text-center lg:text-left">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest"
                style={{ backgroundColor: NAVY_LIGHT, color: NAVY }}
              >
                <Rocket className="h-2.5 w-2.5" />
                Internships
              </span>

              <h2 className="mt-4 text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">
                A real project, from day one.
              </h2>
              <p className="mx-auto mt-3 max-w-md text-[15px] leading-7 text-slate-500 lg:mx-0">
                Every intern is paired with a mentor and scoped work that goes onto a resume —
                not busywork, not shadowing.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <CTAButton to={ROUTES.PUBLIC.CONTACT}>Ask about the next cohort</CTAButton>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
                >
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full border-[1.5px]"
                    style={{ borderColor: NAVY, color: NAVY }}
                  >
                    <PlayCircle className="h-3.5 w-3.5" />
                  </span>
                  <span className="leading-tight">
                    How it works
                    <span className="block text-[11px] font-normal text-slate-400">2 min overview</span>
                  </span>
                </button>
              </div>
            </div>

            {/* Right: stats stacked vertically */}
            <div className="flex flex-col justify-center gap-3">
              {stats.map(({ Icon, tint, title, detail }) => (
                <div key={title} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${tint}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-800">{title}</h3>
                    <p className="mt-0.5 text-xs leading-5 text-slate-500">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="h-6 sm:h-8 lg:h-10" aria-hidden="true" />
      </section>

      {/* ── ELIGIBILITY + SELECTION ── */}
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[0.78fr_1.22fr] lg:items-stretch">

          {/* Eligibility */}
          <div data-aos="fade-right" className="flex flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <SectionIcon Icon={ShieldCheck} />
              <h2 className="text-base font-bold">Eligibility</h2>
            </div>
            <ul className="mt-4 flex-1 space-y-3">
              {eligibility.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  <span className="text-[13px] leading-6 text-slate-600">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Selection */}
          <div data-aos="fade-left" className="flex flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <SectionIcon Icon={FileSearch} bg={TEAL} />
              <h2 className="text-base font-bold">Selection Process</h2>
            </div>
            <div className="relative mt-6 flex-1">
              {/* Dashed connector */}
              <div className="absolute left-[12%] right-[12%] top-3.5 hidden border-t-2 border-dashed border-slate-200 sm:block" />
              <div className="grid gap-4 sm:grid-cols-4">
                {steps.map(({ Icon, title, detail }, i) => (
                  <div key={title} data-aos="fade-up" data-aos-delay={i * 80} className="relative flex min-w-0 flex-col items-center text-center">
                    <span
                      className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-sm"
                      style={{ backgroundColor: i % 2 === 0 ? NAVY : TEAL }}
                    >
                      {i + 1}
                    </span>
                    <div className="mx-auto mt-2.5 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50">
                      <Icon className="h-5 w-5" style={{ color: NAVY }} />
                    </div>
                    <h3 className="mt-2 text-[12px] font-bold text-slate-800">{title}</h3>
                    <p className="mt-1 text-[11px] leading-4 text-slate-500">{detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROJECTS ── */}
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2" data-aos="fade-up">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: NAVY_LIGHT, color: NAVY }}>
            <Code2 className="h-3.5 w-3.5" />
          </span>
          <h2 className="text-base font-bold">Nature of Projects</h2>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {projects.map(({ Icon, tint, text }, i) => (
            <div
              key={text}
              data-aos="zoom-in"
              data-aos-delay={i * 80}
              className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tint}`}>
                <Icon className="h-4 w-4" />
              </span>
              <p className="min-w-0 text-[13px] leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── INDUSTRY + MENTOR ── */}
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-2" style={{ alignItems: "stretch" }}>

          {/* Industry */}
          <div
            data-aos="fade-right"
            className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 shadow-sm"
            style={{ backgroundColor: TEAL_LIGHT }}
          >
            <div className="shrink-0 p-5">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white" style={{ color: NAVY }}>
                  <Users className="h-3.5 w-3.5" />
                </span>
                <h3 className="text-base font-bold">Industry & Company Involvement</h3>
              </div>
              <p className="mt-3 text-[13px] leading-6 text-slate-600">
                Select projects are scoped directly with partner companies, giving interns
                exposure to real stakeholder requirements and review cycles.
              </p>
              <a href="#" className="mt-3 inline-block text-[13px] font-semibold transition-opacity hover:opacity-75" style={{ color: TEAL }}>
                Learn more about partners →
              </a>
            </div>
            <div className="min-h-0 flex-1 px-5 pb-5">
              <div className="h-full min-h-[160px] overflow-hidden rounded-xl border border-slate-100 shadow-sm">
                <img
                  src="https://i.pinimg.com/1200x/cf/5f/a3/cf5fa3b951afc0ba27e6a56601007fa2.jpg"
                  alt="Partner companies collaborating"
                  className="h-full w-full object-cover object-center transition-transform duration-500 hover:scale-[1.03]"
                />
              </div>
            </div>
          </div>

          {/* Mentor */}
          <div
            data-aos="fade-left"
            className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
          >
            <div className="shrink-0 p-5">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Users className="h-3.5 w-3.5" />
                </span>
                <h3 className="text-base font-bold">Mentor Support</h3>
              </div>
              <p className="mt-3 text-[13px] leading-6 text-slate-600">
                Each intern is paired with a dedicated mentor for the full duration, with
                scheduled check-ins and open access for ad-hoc questions.
              </p>
              {/* Invisible spacer matches partner link height */}
              <span className="mt-3 inline-block text-[13px] font-semibold opacity-0 select-none" aria-hidden="true">placeholder</span>
            </div>
            <div className="min-h-0 flex-1 px-5 pb-5">
              <div className="h-full min-h-[160px] overflow-hidden rounded-xl border border-slate-100 shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&auto=format&fit=crop&q=80"
                  alt="Mentor and intern working together"
                  className="h-full w-full object-cover object-center transition-transform duration-500 hover:scale-[1.03]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EVALUATION + CERTIFICATE ── */}
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">

          {/* Evaluation */}
          <div data-aos="fade-right" className="flex flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <ShieldCheck className="h-3.5 w-3.5" />
              </span>
              <h3 className="text-base font-bold">Evaluation Process</h3>
            </div>
            <p className="mt-3 text-[13px] leading-6 text-slate-500">
              Mentors evaluate against milestones set at onboarding, with a final review at project close.
            </p>
            <div className="mt-4 flex flex-1 items-center gap-5">
              <ul className="min-w-0 flex-1 space-y-2.5">
                {evalPoints.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-[13px] font-medium text-slate-700">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    <span className="min-w-0">{p}</span>
                  </li>
                ))}
              </ul>
              <div className="w-24 shrink-0 overflow-hidden rounded-xl border border-slate-100 shadow-sm sm:w-28" style={{ aspectRatio: "1/1" }}>
                <img
                  src="https://i.pinimg.com/1200x/48/c2/fe/48c2fe271afb07c6ceca3b08e29c49d4.jpg"
                  alt="Evaluation checklist"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Certificate */}
          <div data-aos="fade-left" className="flex flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-50 text-secondary-600">
                <Award className="h-3.5 w-3.5" />
              </span>
              <h3 className="text-base font-bold">Internship Certificate</h3>
            </div>
            <p className="mt-3 text-[13px] leading-6 text-slate-500">
              Completers receive a certificate documenting the track, duration, and project scope.
            </p>
            <div className="mt-4 flex flex-1 items-center gap-5">
              <ul className="min-w-0 flex-1 space-y-2.5">
                {certPoints.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-[13px] font-medium text-slate-700">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    <span className="min-w-0">{p}</span>
                  </li>
                ))}
              </ul>
              {/* Certificate mockup */}
              <div
                className="w-24 shrink-0 rounded-xl p-3 text-center shadow-md sm:w-28"
                style={{ background: "linear-gradient(145deg,#FFFDF5,#FFF8E7)", border: "2px solid #C9A24B" }}
              >
                <p className="text-[7px] font-bold uppercase tracking-[0.12em] text-slate-400">Certificate</p>
                <Award className="mx-auto mt-1.5 h-5 w-5" style={{ color: "#C9A24B" }} />
                <div className="mx-auto mt-2 h-px w-12 bg-slate-200" />
                <p className="mt-1.5 font-serif text-[11px] italic text-slate-700">John Doe</p>
                <div className="mx-auto mt-1.5 h-px w-10 bg-slate-200" />
                <p className="mt-1 text-[7px] uppercase tracking-widest text-slate-400">Director</p>
                <div
                  className="mx-auto mt-2 flex h-6 w-6 items-center justify-center rounded-full shadow-sm"
                  style={{ background: "radial-gradient(circle,#D4AC3A,#B8901E)" }}
                >
                  <span className="text-[9px] font-bold text-white">✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="mx-auto max-w-6xl px-4 py-6 pb-14 sm:px-6 lg:px-8">
        <div
          data-aos="zoom-in"
          className="relative overflow-hidden flex flex-col items-start justify-between gap-5 rounded-2xl px-6 py-7 text-white sm:flex-row sm:items-center sm:px-8 sm:py-8"
          style={{ backgroundColor: NAVY }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "22px 22px" }}
          />
          <div className="relative flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
              <Rocket className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-bold sm:text-xl">Ready to build your future?</h2>
              <p className="mt-1 max-w-md text-[13px] text-white/70">
                Intern with real projects, real mentors, and real impact.
              </p>
            </div>
          </div>
          <Link
            to={ROUTES.PUBLIC.CONTACT}
            className="relative inline-flex shrink-0 items-center gap-2 rounded-full border border-secondary-500 px-5 py-2.5 text-sm font-semibold text-secondary-500 transition-all hover:bg-secondary-500/10"
          >
            Ask About the Next Cohort
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <Footer compact />
    </main>
  );
}