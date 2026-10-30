import { useEffect } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  ArrowRight,
  Award,
  Briefcase,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  FileText,
  Handshake,
  MessagesSquare,
  MonitorPlay,
  PlayCircle,
  Rocket,
  Target,
  Users,
} from "lucide-react";
import { ROUTES } from "@landing-shared/constants/routeConstants";
import { useThemeContext } from "@landing-shared/context/ThemeContext";
import Navbar from "@landing-shared/components/navbar";
import Footer from "@landing-shared/components/Footer";
import Seo from "@landing-shared/components/Seo";

const NAVY = "#133B5D";
const TEAL = "#F39924";

const heroBadges = [
  { icon: FileText, label: "95%+", sub: "Placement Assistance" },
  { icon: Briefcase, label: "50+", sub: "Hiring Partners" },
  { icon: Users, label: "2200+", sub: "Students Placed" },
];

const services = [
  {
    icon: Target,
    title: "Career Guidance",
    detail: "One-on-one guidance to map your strengths, interests and training outcomes to the right career path.",
    light: "bg-primary-50 text-primary-600",
    dark: "bg-primary-500/10 text-primary-300",
    cardLight: "bg-[#EEF5FB] border-[#D7E6F2]",
    cardDark: "bg-[#133B5D]/5 border-[#133B5D]/15",
  },
  {
    icon: FileText,
    title: "Resume Building",
    detail: "Structured resume reviews focused on clarity, role relevance, measurable impact and recruiter readability.",
    light: "bg-emerald-50 text-emerald-600",
    dark: "bg-emerald-400/10 text-emerald-300",
    cardLight: "bg-[#EFFBF7] border-[#CDEBDD]",
    cardDark: "bg-emerald-500/5 border-emerald-500/15",
  },
  {
    icon: MonitorPlay,
    title: "Mock Interviews",
    detail: "Practice interviews with structured feedback on technical answers, communication and confidence.",
    light: "bg-primary-50 text-primary-600",
    dark: "bg-primary-500/10 text-primary-300",
    cardLight: "bg-[#F4F8FC] border-[#CFE1EF]",
    cardDark: "bg-[#133B5D]/5 border-[#133B5D]/15",
  },
  {
    icon: BriefcaseBusiness,
    title: "Technical Interview Preparation",
    detail: "Role-focused preparation covering technical concepts, problem solving, projects and interview scenarios.",
    light: "bg-secondary-50 text-secondary-600",
    dark: "bg-secondary-500/10 text-secondary-300",
    cardLight: "bg-[#FFF8EE] border-[#F8D9AF]",
    cardDark: "bg-secondary-500/5 border-secondary-500/15",
  },
  {
    icon: MessagesSquare,
    title: "Communication & Soft Skills",
    detail: "Practical preparation for group discussions, presentations, stakeholder communication and interviews.",
    light: "bg-primary-50 text-primary-600",
    dark: "bg-primary-500/10 text-primary-300",
    cardLight: "bg-[#EEF5FB] border-[#D7E6F2]",
    cardDark: "bg-[#133B5D]/5 border-[#133B5D]/15",
  },
  {
    icon: Handshake,
    title: "Industry Connect",
    detail: "Industry interactions, hiring opportunities and employer connections through our corporate network.",
    light: "bg-secondary-50 text-secondary-600",
    dark: "bg-secondary-500/10 text-secondary-300",
    cardLight: "bg-[#FFF5E7] border-[#F4C98D]",
    cardDark: "bg-secondary-500/5 border-secondary-500/15",
  },
];

const processSteps = [
  { icon: ClipboardList, title: "Career Readiness", detail: "Review skills, resume, portfolio, projects and overall readiness.", color: "#133B5D" },
  { icon: Users, title: "Profile & Role Matching", detail: "Identify suitable opportunities based on skills, specialization and career direction.", color: "#2AA65C" },
  { icon: Target, title: "Interview Preparation", detail: "Prepare through mocks, technical practice, aptitude support and communication.", color: "#133B5D" },
  { icon: Briefcase, title: "Interview & Opportunity Support", detail: "Support through relevant hiring drives, interviews and employer interactions.", color: "#F39924" },
  { icon: Award, title: "Offer & Career Follow-up", detail: "Guidance on offer discussions, onboarding and early-career questions.", color: "#133B5D" },
];

const jobOpportunityPoints = [
  "Campus Hiring Drives",
  "Partner Company Openings",
  "Internship to Full-time",
  "Multi-domain Opportunities",
];

const careerSupportPoints = [
  "Resume & Portfolio Guidance",
  "Technical & Aptitude Preparation",
  "Mock Interview Practice",
  "Communication & Soft Skills",
  "Career Guidance & Role Mapping",
];

export default function Placementspage() {
  const { isDark } = useThemeContext();

  useEffect(() => {
    const raf = window.requestAnimationFrame(() => AOS.refresh());
    return () => window.cancelAnimationFrame(raf);
  }, []);

  const cardClass = isDark
    ? "rounded-2xl border border-white/10 bg-white/5 p-6"
    : "rounded-2xl border border-[#CFE1EF] bg-white p-6 shadow-[0_2px_8px_rgba(19,59,93,0.06)]";
  const mutedText = isDark ? "text-white/70" : "text-ink-900/70";

  return (
    <>
      <Seo
        title="Placements"
        description="End-to-end placement support at Kini Edx Hub: career guidance, resume building, mock interviews and hiring partner connections."
        path="/placements"
      />
      <Navbar />
      <main className={isDark ? "bg-ink-950 text-white" : "bg-white text-ink-900"}>
        {/* Hero */}
        <section className="relative">
          <div className="relative min-h-[240px] w-full overflow-hidden sm:min-h-[280px] lg:min-h-[320px]">
            <img
              src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600&auto=format&fit=crop&q=80"
              alt="Students celebrating placement success"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(100deg, ${NAVY}E6 0%, ${NAVY}B3 45%, ${NAVY}4D 100%)` }}
            />
            <div className="relative mx-auto flex max-w-7xl flex-col justify-start px-4 pt-8 pb-16 sm:px-6 sm:pt-10 sm:pb-20 lg:px-8 lg:pt-12 lg:pb-24">
              <div data-aos="fade-right">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur-xl">
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  Placements
                </span>
                <h1 className="mt-4 max-w-xl text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl">
                  Your Skills.
                  <br />
                  <span style={{ color: TEAL }}>Your Opportunity.</span>
                </h1>
                <p className="mt-5 max-w-lg text-base leading-7 text-white/80">
                  End-to-end placement support that helps you get career-ready, crack interviews, and land the right
                  opportunities.
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 mx-auto -mt-14 max-w-7xl px-4 sm:-mt-16 sm:px-6 lg:-mt-20 lg:px-8">
            <div
              className={`rounded-2xl border p-5 shadow-xl sm:p-6 ${isDark ? "border-white/10 bg-ink-950" : "border-[#CFE1EF] bg-white"}`}
              data-aos="fade-up"
            >
              <div className="grid gap-3 sm:grid-cols-3">
                {heroBadges.map(({ icon: Icon, label, sub }, idx) => (
                  <div key={sub} data-aos="fade-up" data-aos-delay={idx * 80} className="flex items-center gap-3 rounded-xl p-2">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isDark ? "bg-primary-500/15 text-primary-300" : "bg-primary-50 text-primary-700"}`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-bold leading-none">{label}</p>
                      <p className={`mt-1 text-xs leading-none ${mutedText}`}>{sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className={`mt-5 flex flex-wrap gap-3 border-t pt-5 ${isDark ? "border-white/10" : "border-slate-100"}`}>
                <Link
                  to={ROUTES.PUBLIC.CONTACT}
                  className="group inline-flex items-center gap-2 rounded-full bg-secondary-500 text-primary-700 border border-secondary-500 px-6 py-3 text-sm font-semibold shadow-sm transition-all duration-300 hover:bg-secondary-600 hover:scale-[1.02]"
                >
                  Talk to Placement Support
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
                <a
                  href="#placement-process"
                  className={`inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition-colors ${isDark ? "border-white/15 text-white hover:bg-white/10" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}
                >
                  <PlayCircle className="h-4 w-4" aria-hidden="true" />
                  Explore Placement Process
                </a>
              </div>
            </div>
          </div>

          <div className="h-6 sm:h-8 lg:h-10" aria-hidden="true" />
        </section>

        {/* What Placement Support Covers */}
        <section
          className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 "
          style={isDark ? undefined : { background: "linear-gradient(135deg, #EEF3F8 0%, #F7F5F1 55%, #FFF4E5 100%)" }}
        >
          <div className="rounded-3xl py-10 sm:py-12">
            <h2 className="text-center text-2xl font-bold sm:text-3xl" data-aos="fade-up">
              What Placement Support Covers
            </h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map(({ icon: Icon, title, detail, light, dark, cardLight, cardDark }, idx) => (
                <div
                  key={title}
                  data-aos="fade-up"
                  data-aos-delay={(idx % 3) * 100}
                  className={`group rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${isDark ? `${cardDark} hover:border-white/20` : `${cardLight} hover:shadow-slate-200/60`}`}
                >
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${isDark ? dark : light}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-semibold">{title}</h3>
                  <p className={`mt-1.5 text-sm leading-6 ${mutedText}`}>{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Placement Process */}
        <section id="placement-process" className={`px-4 py-12 sm:px-6 lg:px-8 lg:py-16 ${isDark ? "bg-white/[0.03]" : "bg-primary-50/40"}`}>
          <div className="mx-auto max-w-7xl">
            <h2 className="text-center text-2xl font-bold sm:text-3xl" data-aos="fade-up">
              Our Placement Process
            </h2>
            <div className="relative mt-10">
              <div
                className={`absolute left-[10%] right-[10%] top-6 hidden border-t-2 border-dashed lg:block ${isDark ? "border-white/15" : "border-ink-900/15"}`}
              />
              <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
                {processSteps.map(({ icon: Icon, title, detail, color }, idx) => (
                  <div key={title} data-aos="fade-up" data-aos-delay={idx * 120} className="relative text-center">
                    <div className="relative z-10 mx-auto flex flex-col items-center gap-3">
                      <span
                        className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white shadow-md"
                        style={{ backgroundColor: color }}
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-full border ${isDark ? "border-white/10 bg-ink-950" : "border-[#CFE1EF] bg-white shadow-[0_1px_4px_rgba(19,59,93,0.04)]"}`}
                      >
                        <Icon className="h-4 w-4" style={{ color }} aria-hidden="true" />
                      </span>
                    </div>
                    <h3 className="mt-4 text-sm font-bold">{title}</h3>
                    <p className={`mt-1.5 text-xs leading-5 ${mutedText}`}>{detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Job Opportunities + Career Support */}
        <section className="bg-[#EFFBF7] dark:bg-app-dark-gradient mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-5 lg:grid-cols-2 lg:items-stretch">
            <div className={`${cardClass} flex flex-col`} data-aos="fade-up">
              <h3 className="text-lg font-bold">Job Opportunities</h3>
              <p className={`mt-1.5 text-sm leading-6 ${mutedText}`}>
                Opportunities through our corporate partners, internship hosts, and direct hiring initiatives for
                eligible students.
              </p>
              <div className="mt-5 flex-1 min-h-0 overflow-hidden rounded-xl" style={{ minHeight: 200 }}>
                <img
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&auto=format&fit=crop&q=80"
                  alt="Office hiring scene"
                  className="h-full w-full object-cover object-center"
                  style={{ minHeight: 200 }}
                />
              </div>
              <ul className="mt-5 space-y-2.5">
                {jobOpportunityPoints.map((point) => (
                  <li key={point} className="flex items-center gap-2.5 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
              <Link
                to={ROUTES.PUBLIC.CONTACT}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-secondary-500 text-primary-700 border border-secondary-500 px-5 py-2.5 text-sm font-semibold transition-all duration-300 hover:bg-secondary-600 hover:scale-[1.02] self-start"
              >
                View Open Opportunities
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className={`${cardClass} flex flex-col`} data-aos="fade-up" data-aos-delay="150">
              <h3 className="text-lg font-bold">Career Support Beyond Training</h3>
              <p className={`mt-1.5 text-sm leading-6 ${mutedText}`}>
                We support you beyond the classroom to help you become industry-ready and confident.
              </p>
              <div className="mt-5 flex-1 min-h-0 overflow-hidden rounded-xl" style={{ minHeight: 200 }}>
                <img
                  src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80"
                  alt="Graduate professional career support"
                  className="h-full w-full object-cover object-top"
                  style={{ minHeight: 200 }}
                />
              </div>
              <ul className="mt-5 space-y-2.5">
                {careerSupportPoints.map((point) => (
                  <li key={point} className="flex items-center gap-2.5 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
          <div
            data-aos="zoom-in"
            className="flex flex-col items-start justify-between gap-6 rounded-2xl px-6 py-8 text-white sm:flex-row sm:items-center sm:px-10 sm:py-10"
            style={{ background: "linear-gradient(90deg, #133B5D 0%, #1f4a70 35%, #b6630f 65%, #F39924 100%)" }}
          >
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15">
                <Rocket className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-xl font-bold sm:text-2xl">Ready to Start Your Career Journey?</h2>
                <p className="mt-1.5 max-w-lg text-sm text-white/90">
                  Connect with our placement team and take the next step towards your dream career.
                </p>
              </div>
            </div>
            <Link
              to={ROUTES.PUBLIC.CONTACT}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-secondary-500 px-6 py-3 text-sm font-semibold text-primary-700 border border-secondary-500 transition-all duration-300 hover:bg-secondary-600 hover:scale-[1.02]"
            >
              Talk to Placement Support
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
      <Footer compact />
    </>
  );
}
