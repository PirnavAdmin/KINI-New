import { useEffect } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  Award, BarChart3, Brain, Briefcase, Building2, CheckCircle2,
  Cloud, Code2, Flag, FlaskConical, Globe2, GraduationCap,
  Headphones, Layers, PlayCircle, Rocket, ShieldAlert,
  Sparkles, Target, Users,
} from "lucide-react";
import { ROUTES } from "@landing-shared/constants/routeConstants";
import Navbar from "../../../shared/components/navbar/index";
import Footer from "../../../shared/components/Footer/index";

const NAVY = "#133B5D";
const TEAL = "#F39924";

/* ─── Scroll-fade CSS injected once ─── */
const SCROLL_FADE_STYLE = `
  .sf {
    opacity: 0;
    transform: translateY(28px);
    transition: opacity 0.55s cubic-bezier(0.4,0,0.2,1),
                transform 0.55s cubic-bezier(0.4,0,0.2,1);
    will-change: opacity, transform;
  }
  .sf.sf-up   { transform: translateY(-28px); }
  .sf.sf-left { transform: translateX(-36px); }
  .sf.sf-right{ transform: translateX(36px);  }
  .sf.sf-zoom { transform: scale(0.92);       }
  .sf.visible {
    opacity: 1 !important;
    transform: none !important;
  }
  /* fade OUT when leaving viewport (both directions) */
  .sf.leaving-top    { opacity: 0; transform: translateY(-22px); }
  .sf.leaving-bottom { opacity: 0; transform: translateY(22px);  }
`;

/* ─── Data ─── */
const floatingCards = [
  { icon: CheckCircle2, iconBg: "bg-emerald-500", title: "Live & Hands-on",    sub: "Real-time learning with practical application" },
  { icon: Target,       iconBg: "bg-primary-500",  title: "Industry Aligned",   sub: "Curriculum mapped to your tech stack" },
  { icon: Rocket,       iconBg: "bg-secondary-500",  title: "Project Delivered",  sub: "A project your team owns at the end" },
];
const technologyDomains = [
  { icon: Code2,        tint: "bg-primary-50 text-primary-600",       label: "Full-Stack Web Development" },
  { icon: Cloud,        tint: "bg-emerald-50 text-emerald-600", label: "Cloud & DevOps" },
  { icon: BarChart3,    tint: "bg-primary-50 text-primary-600",   label: "Data Science & Analytics" },
  { icon: Brain,        tint: "bg-secondary-50 text-secondary-600",   label: "Artificial Intelligence & ML" },
  { icon: ShieldAlert,  tint: "bg-primary-50 text-primary-600",       label: "Cybersecurity Fundamentals" },
  { icon: CheckCircle2, tint: "bg-secondary-50 text-secondary-600",       label: "QA & Test Automation" },
];
const curriculumModules = [
  { icon: Layers, color: "#133B5D", title: "Foundations",        detail: "Core programming, tooling setup, and the shared vocabulary every track builds on." },
  { icon: Target, color: "#16A34A", title: "Domain Deep-Dive",   detail: "Hands-on modules in the chosen technology domain, sequenced from fundamentals to applied patterns." },
  { icon: Code2,  color: "#F39924", title: "Applied Systems",    detail: "Real project structures, version control workflows, and code review practice." },
  { icon: Flag,   color: "#F39924", title: "Capstone & Handover",detail: "A supervised project mirroring the client's actual stack, presented to stakeholders at close." },
];
const methodology = [
  { color: "#F39924", text: "Instructor-led sessions paired with guided hands-on labs" },
  { color: "#133B5D", text: "Daily checkpoints so gaps get caught before they compound" },
  { color: "#16A34A", text: "Curriculum mapped directly to the client's tech stack and tooling" },
  { color: "#F39924", text: "Recorded sessions and reference material for post-training review" },
];
const modeOptions = [
  { icon: Globe2,    tint: "bg-primary-50 text-primary-600",       title: "Online",  detail: "Live virtual classrooms with shared lab environments and screen-share debugging." },
  { icon: Building2, tint: "bg-emerald-50 text-emerald-600", title: "Offline", detail: "On-site delivery at the client's facility with in-person lab support." },
  { icon: Users,     tint: "bg-secondary-50 text-secondary-600",   title: "Hybrid",  detail: "Live instruction online, paired with scheduled on-site lab and review days." },
];
const labRequirements = [
  "Per-participant development environment with domain-specific tooling pre-installed",
  "Shared version control workspace for collaborative exercises",
  "Sandboxed cloud environments for infrastructure and deployment modules",
];
const assessment = [
  "Module-end checkpoints to confirm concepts before moving forward",
  "A graded capstone project reviewed against role-relevant criteria",
  "A completion report shared with the client's L&D or engineering lead",
];
const whyKits = [
  { icon: GraduationCap, text: "Practitioner-led training" },
  { icon: Briefcase,     text: "Industry-grade projects" },
  { icon: Layers,        text: "Flexible engagement models" },
  { icon: BarChart3,     text: "Measurable outcomes & reports" },
  { icon: Users,         text: "Scalable for teams of any size" },
];
const trustBar = [
  { icon: Code2,      label: "Customized for your stack" },
  { icon: Users,      label: "Expert trainers from industry" },
  { icon: Rocket,     label: "Hands-on from day one" },
  { icon: Briefcase,  label: "Project you can showcase" },
  { icon: Headphones, label: "Support beyond the program" },
];

export default function CorporateTraining() {
  useEffect(() => {
    /* ── inject scroll-fade styles once ── */
    if (!document.getElementById("sf-styles")) {
      const tag = document.createElement("style");
      tag.id = "sf-styles";
      tag.textContent = SCROLL_FADE_STYLE;
      document.head.appendChild(tag);
    }

    /* ── bidirectional IntersectionObserver ── */
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      document.querySelectorAll(".sf").forEach((el) => el.classList.add("visible"));
      return;
    }

    // Track previous bounding rect to detect scroll direction
    const prevY = new WeakMap();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          const currentY = entry.boundingClientRect.top;
          const lastY = prevY.get(el) ?? currentY;
          const scrollingDown = currentY < lastY;
          prevY.set(el, currentY);

          el.classList.remove("leaving-top", "leaving-bottom");

          if (entry.isIntersecting) {
            // Delay from data attribute
            const delay = parseInt(el.dataset.sfDelay || "0", 10);
            setTimeout(() => el.classList.add("visible"), delay);
          } else {
            el.classList.remove("visible");
            // Apply directional fade-out class
            el.classList.add(scrollingDown ? "leaving-top" : "leaving-bottom");
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll(".sf").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-white font-sans text-slate-900">
      <Navbar />

      {/* ══ HERO (dark image banner + two-column overlap card) ══ */}
      <section className="relative">
        {/* Dark image hero — headline + paragraph only */}
        <div className="relative h-[380px] w-full overflow-hidden sm:h-[420px] lg:h-[460px]">
          <img
            src="https://i.pinimg.com/1200x/72/3b/a8/723ba8902fc3039446033fa4996ed89b.jpg"
            alt="Team collaborating in a training workshop"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(100deg, ${NAVY}E6 0%, ${NAVY}B3 45%, ${NAVY}4D 100%)`,
            }}
          />

          <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-center px-4 sm:px-6 lg:px-8">
            <div className="sf sf-left" data-sf-delay="0">
              <h1 className="max-w-xl text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl">
                The KINI<br />
                <span style={{ color: TEAL }}>Training Program</span>
              </h1>
              <p className="mt-4 max-w-lg text-[15px] leading-7 text-white/80">
                A structured upskilling program built for teams, not individuals. Every cohort is
                scoped to a client's stack, delivered by working practitioners, and closed out with
                a project the team keeps.
              </p>
            </div>
          </div>
        </div>

        {/* Overlapping two-column card */}
        <div className="relative z-10 mx-auto -mt-16 max-w-6xl px-4 sm:-mt-20 sm:px-6 lg:-mt-24 lg:px-8">
          <div className="grid gap-6 rounded-3xl bg-white p-6 shadow-xl sm:p-8 lg:grid-cols-[1.2fr_1fr] lg:gap-10 lg:p-10">

            {/* Left: badge + intro + CTAs */}
            <div className="sf sf-left" data-sf-delay="0">
              <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide"
                style={{ backgroundColor: "#EEF3F8", color: NAVY }}>
                Corporate Training
              </span>

              <h2 className="mt-4 text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">
                Built for teams, not individuals.
              </h2>
              <p className="mt-3 max-w-md text-[15px] leading-7 text-slate-500">
                Every cohort is scoped to your stack and closed out with a real project
                your team keeps — not a generic course.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link to={ROUTES.PUBLIC.CONTACT}
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-primary-700 bg-secondary-500 shadow-sm transition-transform duration-300 hover:bg-secondary-600 hover:scale-[1.02]">
                  Talk to our training team <span aria-hidden="true">→</span>
                </Link>
                <button type="button" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border-[1.5px]" style={{ borderColor: NAVY, color: NAVY }}>
                    <PlayCircle className="h-4 w-4" />
                  </span>
                  <span className="leading-tight">
                    Watch Overview
                    <span className="block text-[11px] font-normal text-slate-400">2 min video</span>
                  </span>
                </button>
              </div>
            </div>

            {/* Right: highlights stacked vertically */}
            <div className="flex flex-col justify-center gap-3">
              {floatingCards.map(({ icon: Icon, iconBg, title, sub }, index) => (
                <div
                  key={title}
                  className="sf sf-zoom flex items-start gap-3 rounded-2xl bg-[#F8F9FA] p-4"
                  data-sf-delay={index * 90}
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white ${iconBg}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[13px] font-bold leading-none">{title}</p>
                    <p className="mt-1 text-[12px] leading-snug text-slate-500">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="h-6 sm:h-8 lg:h-10" aria-hidden="true" />
      </section>

      {/* ══ TECHNOLOGY DOMAINS ══ */}
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-100 bg-[#F8F9FA] p-5 sm:p-6">
          <div className="sf" data-sf-delay="0">
            <h2 className="text-lg font-bold sm:text-xl">Technology Domains</h2>
            <p className="mt-1 text-sm text-slate-500">Pick one domain or combine tracks for a mixed cohort.</p>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {technologyDomains.map(({ icon: Icon, tint, label }, index) => (
              <div key={label} className="sf sf-zoom flex flex-col items-center gap-2.5 rounded-xl bg-white p-4 text-center shadow-sm"
                data-sf-delay={index * 55}>
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tint}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <p className="text-[11px] font-bold leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CURRICULUM + METHODOLOGY ══ */}
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">

          {/* Curriculum — each module fades from right */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="sf sf-right" data-sf-delay="0">
              <h2 className="text-base font-bold">Module-Wise Curriculum</h2>
              <p className="mt-1 text-[13px] text-slate-500">Sequenced learning from fundamentals to impact.</p>
            </div>
            <div className="relative mt-5 space-y-4">
              <div className="absolute left-[15px] top-2 bottom-2 hidden w-px border-l-2 border-dotted border-slate-200 sm:block" />
              {curriculumModules.map(({ icon: Icon, color, title, detail }, index) => (
                <div key={title} className="sf sf-right relative flex gap-4 pl-0 sm:pl-10" data-sf-delay={index * 85}>
                  <span className="absolute left-0 top-0 z-10 hidden h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white sm:flex"
                    style={{ backgroundColor: color }}>{index + 1}</span>
                  <div className="flex w-full items-start gap-3 rounded-xl bg-[#F8F9FA] p-3.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                      <Icon className="h-5 w-5" style={{ color }} />
                    </span>
                    <div>
                      <h3 className="text-[13px] font-bold">{title}</h3>
                      <p className="mt-0.5 text-[12px] leading-5 text-slate-500">{detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {/* Methodology — fades from left */}
            <div className="sf sf-left rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6" data-sf-delay="80">
              <h2 className="text-base font-bold">Our Training Methodology</h2>
              <p className="mt-1 text-[13px] text-slate-500">A blended approach focused on outcomes.</p>
              <ul className="mt-4 space-y-3">
                {methodology.map(({ color, text }, i) => (
                  <li key={text} className="sf sf-left flex items-start gap-2.5" data-sf-delay={i * 75}>
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${color}1A` }}>
                      <CheckCircle2 className="h-3 w-3" style={{ color }} />
                    </span>
                    <span className="text-[13px] leading-6 text-slate-600">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Modes — fade up */}
            <div>
              <h3 className="sf text-sm font-bold" data-sf-delay="0">Modes of Delivery</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {modeOptions.map(({ icon: Icon, tint, title, detail }, index) => (
                  <div key={title} className="sf rounded-xl border border-slate-100 bg-white p-4 shadow-sm" data-sf-delay={index * 95}>
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tint}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <h4 className="mt-2.5 text-[13px] font-bold">{title}</h4>
                    <p className="mt-1 text-[12px] leading-5 text-slate-500">{detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ LAB + ASSESSMENT + WHY KITS ══ */}
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-3">

          {/* Lab — fades up */}
          <div className="sf rounded-2xl border border-slate-100 bg-white p-5 shadow-sm" data-sf-delay="0">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <FlaskConical className="h-3.5 w-3.5" />
            </span>
            <h3 className="mt-3 text-sm font-bold">Lab Requirements</h3>
            <ul className="mt-3 space-y-2">
              {labRequirements.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[13px] leading-6 text-slate-600">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />{item}
                </li>
              ))}
            </ul>
          </div>

          {/* Assessment — fades up, slight delay */}
          <div className="sf rounded-2xl border border-slate-100 bg-white p-5 shadow-sm" data-sf-delay="100">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <BarChart3 className="h-3.5 w-3.5" />
            </span>
            <h3 className="mt-3 text-sm font-bold">Assessment & Evaluation</h3>
            <ul className="mt-3 space-y-2">
              {assessment.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[13px] leading-6 text-slate-600">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />{item}
                </li>
              ))}
            </ul>
          </div>

          {/* Why KITS — slides from right, items stagger */}
          <div className="sf sf-right rounded-2xl border border-slate-100 bg-white p-5 shadow-sm" data-sf-delay="180">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-50 text-secondary-600">
              <Award className="h-3.5 w-3.5" />
            </span>
            <h3 className="mt-3 text-sm font-bold">Why KITS?</h3>
            <ul className="mt-3 space-y-1.5">
              {whyKits.map(({ icon: Icon, text }, i) => (
                <li key={text} className="sf sf-right flex items-center gap-2.5 rounded-lg bg-[#F8F9FA] px-3 py-2 text-[13px] font-medium text-slate-700"
                  data-sf-delay={280 + i * 65}>
                  <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: NAVY }} />{text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER — zooms in ══ */}
      <section className="mx-auto max-w-6xl px-4 py-6 pb-10 sm:px-6 lg:px-8">
        <div
          className="sf sf-zoom relative flex flex-col items-start justify-between gap-5 overflow-hidden rounded-2xl px-6 py-7 text-white sm:flex-row sm:items-center sm:px-8 sm:py-8"
          style={{ background: `linear-gradient(120deg, ${NAVY} 0%, ${TEAL} 100%)` }}
          data-sf-delay="0"
        >
          <div className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
          <div className="relative">
            <h2 className="text-lg font-bold sm:text-xl">Upskill your team. Deliver real impact.</h2>
            <p className="mt-1 max-w-md text-[13px] text-white/80">Let's design a program that fits your goals and timeline.</p>
            <div className="mt-4">
              <Link to={ROUTES.PUBLIC.CONTACT}
                className="inline-flex items-center gap-2 rounded-full bg-secondary-500 px-5 py-2.5 text-sm font-semibold text-primary-700 border border-secondary-500 transition-all duration-300 hover:bg-secondary-600 hover:scale-[1.02]">
                Talk to our training team <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          <div className="relative hidden h-32 w-32 shrink-0 items-center justify-center rounded-2xl bg-white/10 sm:flex">
            <Sparkles className="h-12 w-12 text-white/70" />
          </div>
        </div>
      </section>

      {/* ══ TRUST BAR — alternating up/down wave ══ */}
      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="grid gap-5 border-t border-slate-100 pt-6 sm:grid-cols-3 lg:grid-cols-5">
          {trustBar.map(({ icon: Icon, label }, index) => (
            <div
              key={label}
              className={`sf ${index % 2 === 0 ? "" : "sf-up"} flex flex-col items-center gap-1.5 text-center sm:flex-row sm:text-left`}
              data-sf-delay={index * 65}
            >
              <Icon className="h-4 w-4 shrink-0" style={{ color: TEAL }} />
              <span className="text-[13px] font-semibold text-slate-700">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <Footer compact />
    </main>
  );
}