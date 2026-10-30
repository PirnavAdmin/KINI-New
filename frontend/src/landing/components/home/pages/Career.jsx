import { Fragment, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import {
  GraduationCap,
  Rocket,
  ArrowRight,
  Sparkles,
  Quote,
  PlayCircle,
  ExternalLink,
  UserCheck,
  Users2,
  Building2,
  Target,
  Trophy,
  IndianRupee,
  FileText,
  FileCheck,
  Code2,
  MessageCircle,
  Handshake,
  FolderGit2,
  Layers,
  BookOpen,
  ClipboardCheck,
  ChevronDown,
  TrendingUp,
} from "lucide-react";

import Navbar from "@landing-shared/components/navbar";
import Seo from "@landing-shared/components/Seo";
import Footer from "@landing-shared/components/Footer";

/* ------------------------------------------------------------------ */
/*  Motion primitives                                                  */
/* ------------------------------------------------------------------ */

const VIEWPORT = { once: false, margin: "-80px" };

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

const CHIP_TONES = [
  "from-primary-500 to-primary-700",
  "from-secondary-400 to-secondary-600",
  "from-primary-400 to-secondary-500",
  "from-secondary-500 to-primary-600",
  "from-primary-600 to-primary-800",
  "from-secondary-600 to-secondary-800",
];

function initialsOf(name) {
  const words = name
    .replace(/\b(pvt\.?|private|ltd\.?|limited|inc\.?|llc)\b/gi, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  const word = words[0] || name;
  return word.slice(0, 2).toUpperCase();
}

function toneOf(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return CHIP_TONES[hash % CHIP_TONES.length];
}

function useCountUp(target, { decimals = 0, duration = 1600 } = {}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isInView) return undefined;
    let frame;
    let start = null;
    const step = (timestamp) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(eased * target);
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [isInView, target, duration]);

  const display = decimals ? value.toFixed(decimals) : Math.round(value);
  return [ref, display];
}

/* ------------------------------------------------------------------ */
/*  Data                                                                */
/* ------------------------------------------------------------------ */

const HERO_STATS = [
  { label: "Students Placed", value: "5,000+" },
  { label: "Hiring Partners", value: "300+" },
  { label: "Avg. Package", value: "6.8 LPA" },
];

const CAREER_ROADMAP_STEPS = [
  { icon: GraduationCap, label: "Student" },
  { icon: BookOpen, label: "Foundation" },
  { icon: FolderGit2, label: "Projects" },
  { icon: Layers, label: "Portfolio" },
  { icon: Users2, label: "Mock Interviews" },
  { icon: FileText, label: "Resume" },
  { icon: Handshake, label: "Referrals" },
  { icon: Trophy, label: "Placement" },
];

const SUPPORT_SERVICES = [
  { icon: FileText, title: "Resume Review", desc: "ATS-optimized resumes reviewed by hiring-side recruiters, not templates." },
  { icon: UserCheck, title: "LinkedIn Optimization", desc: "A profile built to get you found by recruiters, not just seen by friends." },
  { icon: Users2, title: "Mock Interviews", desc: "Unlimited practice rounds with real-time, actionable feedback." },
  { icon: Code2, title: "Technical Interviews", desc: "DSA, system design, and role-specific technical preparation." },
  { icon: MessageCircle, title: "HR Interviews", desc: "Behavioral rounds, salary conversations, and offer-stage confidence." },
  { icon: Sparkles, title: "Soft Skills Training", desc: "Communication, presentation, and workplace etiquette coaching for interview and on-the-job readiness." },
  { icon: Handshake, title: "Job Referrals", desc: "Direct introductions into our hiring partner network." },
  { icon: IndianRupee, title: "Salary Negotiation", desc: "Real market benchmarks, so you never leave money on the table." },
  { icon: FileCheck, title: "Offer Support", desc: "Evaluating offers, comparing options, and closing with confidence." },
];

const MENTORS = [
  {
    name: "Rahul Menon",
    role: "Senior SDE",
    company: "Amazon",
    experience: "9 yrs experience",
    specialization: "Backend Systems · DSA",
    studentsMentored: "540+ students mentored",
  },
  {
    name: "Ananya Iyer",
    role: "Product Designer",
    company: "Google",
    experience: "7 yrs experience",
    specialization: "UX · Portfolio Reviews",
    studentsMentored: "310+ students mentored",
  },
  {
    name: "Karthik Subramaniam",
    role: "Engineering Manager",
    company: "Microsoft",
    experience: "12 yrs experience",
    specialization: "System Design · Leadership",
    studentsMentored: "420+ students mentored",
  },
  {
    name: "Sneha Reddy",
    role: "Data Scientist",
    company: "Flipkart",
    experience: "6 yrs experience",
    specialization: "Machine Learning · Interview Prep",
    studentsMentored: "260+ students mentored",
  },
];

const HIRING_PARTNERS = [
  "Google",
  "Microsoft",
  "Amazon",
  "Adobe",
  "Oracle",
  "Infosys",
  "TCS",
  "Accenture",
  "Capgemini",
  "Zoho",
];

const SUCCESS_STORIES = [
  {
    name: "Vikram Nair",
    role: "Full-Stack Developer",
    company: "TCS",
    before: "₹3.2 LPA",
    after: "₹9.5 LPA",
    quote: "I came in with zero web development experience. Six months later I had three offers to choose from.",
  },
  {
    name: "Pooja Sharma",
    role: "Frontend Developer",
    company: "Zoho",
    before: "Fresher",
    after: "₹7.8 LPA",
    quote: "The mock interviews were brutal in the best way — by the time I sat for a real one, nothing felt new.",
  },
  {
    name: "Arjun Das",
    role: "Backend Developer",
    company: "Accenture",
    before: "₹4.0 LPA",
    after: "₹11.2 LPA",
    quote: "My mentor pushed me to rebuild my resume around impact, not tasks. That alone changed my callback rate.",
  },
];

const PLACEMENT_STATS = [
  { icon: Users2, value: 5000, suffix: "+", label: "Students Placed" },
  { icon: Building2, value: 300, suffix: "+", label: "Hiring Partners" },
  { icon: Target, value: 92, suffix: "%", label: "Placement Rate" },
  { icon: Trophy, value: 18, suffix: " LPA", label: "Highest Package" },
  { icon: IndianRupee, value: 6.8, decimals: 1, suffix: " LPA", label: "Average Package" },
];

const INTERVIEW_PROCESS = [
  { icon: ClipboardCheck, title: "Assessment", desc: "A quick skills and aptitude check used to personalize your track." },
  { icon: BookOpen, title: "Technical Training", desc: "Structured, mentor-led modules that build core competency." },
  { icon: FolderGit2, title: "Projects", desc: "Ship three or more real, reviewed projects for your portfolio." },
  { icon: FileText, title: "Resume", desc: "An ATS-ready resume built around your actual project work." },
  { icon: Users2, title: "Mock Interviews", desc: "Unlimited rounds until you're consistently confident." },
  { icon: MessageCircle, title: "HR Round", desc: "Behavioral prep, salary conversations, and offer readiness." },
  { icon: Building2, title: "Company Interviews", desc: "Warm introductions into our hiring partner pipeline." },
  { icon: Trophy, title: "Offer Letter", desc: "You accept, and we keep supporting you through day one." },
];

const FAQS = [
  {
    q: "Do I need prior coding experience to join?",
    a: "No. Most learners join with zero programming background — the foundation track is designed to bring everyone to the same starting line before projects begin.",
  },
  {
    q: "What happens if I don't get placed?",
    a: "Our placement team keeps working with you — refining your resume, adding mock interview rounds, and introducing you to more hiring partners — for as long as it reasonably takes.",
  },
  {
    q: "Is the 1:1 mentorship really one-on-one?",
    a: "Yes. Every learner is paired with a dedicated mentor for regular check-ins, code reviews, and career guidance throughout the program.",
  },
  {
    q: "How long is the full program?",
    a: "Most learners complete the program, including placement assistance, in 6 to 9 months, depending on the track and how much time they can commit each week.",
  },
  {
    q: "Which companies actually hire from here?",
    a: "Our hiring partner network spans product companies, IT services majors, and fast-growing startups — from global names to strong regional employers.",
  },
  {
    q: "Can I do this alongside my current job or college?",
    a: "Yes. Live sessions run in the evenings and on weekends, and every session is recorded for later review.",
  },
];

/* ------------------------------------------------------------------ */
/*  Small presentational components                                    */
/* ------------------------------------------------------------------ */

function SupportCard({ icon: Icon, title, desc }) {
  return (
    <motion.div
      variants={fadeUp}
      className="group relative rounded-3xl bg-gradient-to-br from-primary-500/40 via-secondary-400/40 to-primary-500/40 p-[1.5px] transition-transform duration-300 hover:-translate-y-1.5"
    >
      <div className="relative flex h-full flex-col rounded-[22px] bg-white p-6 dark:bg-slate-900">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 transition-colors duration-300 group-hover:bg-primary-600 group-hover:text-white dark:bg-primary-500/10 dark:text-primary-300">
          <Icon size={22} />
        </div>
        <h3 className="mt-5 text-base font-bold text-slate-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{desc}</p>
      </div>
    </motion.div>
  );
}

function MentorCard({ mentor }) {
  return (
    <motion.div
      variants={fadeUp}
      className="group flex gap-5 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-slate-900"
    >
      <div
        className={`flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-xl font-extrabold text-white shadow-lg ${toneOf(
          mentor.name,
        )}`}
      >
        {initialsOf(mentor.name)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{mentor.name}</h3>
            <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
              {mentor.role} · {mentor.company}
            </p>
          </div>
          <span
            aria-label={`${mentor.name} on LinkedIn`}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors group-hover:bg-primary-600 group-hover:text-white dark:bg-white/10 dark:text-slate-400"
          >
            <ExternalLink size={14} />
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {mentor.experience} · {mentor.specialization}
        </p>
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-[11px] font-semibold text-primary-600 dark:bg-primary-500/10 dark:text-primary-300">
          <Users2 size={12} /> {mentor.studentsMentored}
        </p>
      </div>
    </motion.div>
  );
}

function StoryCard({ story }) {
  return (
    <motion.div
      variants={fadeUp}
      className="flex flex-col rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-slate-900"
    >
      <Quote className="h-6 w-6 text-primary-200 dark:text-primary-500/30" aria-hidden="true" />
      <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">&ldquo;{story.quote}&rdquo;</p>

      <div className="mt-5 flex items-center justify-between rounded-2xl bg-slate-50 p-3 dark:bg-white/5">
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Before</p>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{story.before}</p>
        </div>
        <ArrowRight size={14} className="text-slate-300" aria-hidden="true" />
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-500">After</p>
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{story.after}</p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white ${toneOf(
              story.name,
            )}`}
          >
            {initialsOf(story.name)}
          </span>
          <div>
            <p className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
              {story.name}
              <ExternalLink size={12} className="text-primary-500" aria-label="Verified on LinkedIn" />
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {story.role} at {story.company}
            </p>
          </div>
        </div>
        <button
          type="button"
          aria-label={`Watch ${story.name}'s story`}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary-600 transition-colors hover:bg-primary-600 hover:text-white dark:bg-white/10 dark:text-primary-300"
        >
          <PlayCircle size={16} />
        </button>
      </div>
    </motion.div>
  );
}

function StatCounter({ icon: Icon, value, decimals, suffix, label }) {
  const [ref, count] = useCountUp(value, { decimals });
  return (
    <div ref={ref} className="rounded-3xl border border-white/15 bg-white/10 p-6 text-center text-white backdrop-blur-xl">
      <Icon className="mx-auto h-6 w-6 text-secondary-200" aria-hidden="true" />
      <p className="mt-3 text-3xl font-extrabold sm:text-4xl">
        {count}
        {suffix}
      </p>
      <p className="mt-1 text-xs font-medium text-primary-100">{label}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                                */
/* ------------------------------------------------------------------ */

function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-primary-950 to-slate-900 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-0 h-96 w-96 rounded-full bg-primary-500/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-secondary-600/20 blur-[120px]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:py-16 lg:grid-cols-2 lg:gap-12 lg:py-20">
        {/* Left — copy */}
        <div>
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-secondary-300 backdrop-blur-xl"
          >
            <Sparkles size={14} /> Career Acceleration Program
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 text-5xl font-extrabold leading-[1.05] sm:text-6xl lg:text-7xl"
          >
            Launch Your Tech Career
            <span className="block bg-gradient-to-r from-secondary-300 to-secondary-500 bg-clip-text text-transparent">
              With Confidence
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 max-w-lg text-lg leading-relaxed text-slate-300"
          >
            Get live mentorship, interview preparation, resume support and placement assistance until you&apos;re
            job-ready.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 flex flex-wrap items-center gap-4"
          >
            <a
              href="#final-cta"
              className="group inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-slate-900 shadow-xl shadow-black/20 transition-transform duration-300 hover:scale-105"
            >
              Book Free Career Consultation
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#career-roadmap"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-xl transition-colors duration-300 hover:bg-white/10"
            >
              <Rocket size={16} />
              Generate Career Roadmap
            </a>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            transition={{ delayChildren: 0.4 }}
            className="mt-7 flex flex-wrap gap-x-8 gap-y-3"
          >
            {HERO_STATS.map((stat) => (
              <motion.div key={stat.label} variants={fadeUp}>
                <p className="text-2xl font-extrabold text-white">{stat.value}</p>
                <p className="text-xs font-medium text-slate-400">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Right — career journey illustration */}
        <div className="relative mx-auto w-full max-w-sm pb-4 pt-2 lg:max-w-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="relative rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-700 to-slate-600 text-white shadow-lg">
                <GraduationCap size={26} />
              </div>
              <p className="text-sm font-semibold text-slate-300">Student</p>
            </div>

            <div className="relative mx-auto my-3 h-16 w-8">
              <svg viewBox="0 0 8 100" preserveAspectRatio="none" className="h-full w-full overflow-visible">
                <motion.line
                  x1="4"
                  y1="0"
                  x2="4"
                  y2="100"
                  stroke="url(#journeyLine)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="5 7"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={VIEWPORT}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                />
                <defs>
                  <linearGradient id="journeyLine" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5E82A8" />
                    <stop offset="100%" stopColor="#F39924" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary-500 to-primary-600 text-white shadow-lg shadow-secondary-500/30">
                <Code2 size={26} />
              </div>
              <p className="text-sm font-semibold text-white">Software Engineer</p>
            </div>
          </motion.div>

          {/* Floating: salary growth */}
          <motion.div
            initial={{ opacity: 0, y: 16, x: -10 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="absolute -left-4 top-8 sm:-left-8"
          >
            <motion.div
              animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 shadow-xl backdrop-blur-xl"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                <TrendingUp size={16} />
              </span>
              <div>
                <p className="text-xs font-semibold text-white">₹3.2L &rarr; ₹9.5L</p>
                <p className="text-[10px] text-slate-400">Salary growth</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Floating: offer letter */}
          <motion.div
            initial={{ opacity: 0, y: -16, x: 10 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="absolute -right-4 bottom-20 sm:-right-8"
          >
            <motion.div
              animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 shadow-xl backdrop-blur-xl"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500/15 text-primary-400">
                <FileCheck size={16} />
              </span>
              <div>
                <p className="text-xs font-semibold text-white">Offer Accepted</p>
                <p className="text-[10px] text-slate-400">Software Engineer</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Floating: hiring at */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-2.5 shadow-xl backdrop-blur-xl"
          >
            <div className="flex -space-x-2">
              {["Google", "Amazon", "TCS"].map((name) => (
                <span
                  key={name}
                  className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-900 bg-gradient-to-br text-[9px] font-bold text-white ${toneOf(
                    name,
                  )}`}
                >
                  {initialsOf(name)}
                </span>
              ))}
            </div>
            <p className="text-[11px] font-semibold text-slate-300">Hiring now</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Career Roadmap — horizontal connected timeline                     */
/* ------------------------------------------------------------------ */

function CareerRoadmapSection() {
  return (
    <section id="career-roadmap" className="bg-white py-14 dark:bg-app-dark-gradient sm:py-16">
      <div className="mx-auto max-w-7xl px-5">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={VIEWPORT} className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">Your Path Forward</p>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">The Career Roadmap</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-slate-500 dark:text-slate-400 sm:text-base">
            One connected path from your first line of code to your first offer letter.
          </p>
        </motion.div>

        {/* Below lg: wraps into a clean grid, no connecting line, never scrolls.
            At lg+: a single non-wrapping row with a connecting line — sized to always fit max-w-7xl. */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="mt-10 flex flex-wrap items-start justify-center gap-x-6 gap-y-8 sm:gap-x-8 lg:flex-nowrap lg:justify-between lg:gap-x-0"
        >
          {CAREER_ROADMAP_STEPS.map((step, index) => (
            <Fragment key={step.label}>
              {index > 0 && (
                <div className="relative mt-7 hidden h-0.5 w-8 flex-shrink-0 overflow-hidden bg-slate-200 dark:bg-white/10 lg:block xl:w-12">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary-600 to-secondary-500"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={VIEWPORT}
                    transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
                    style={{ transformOrigin: "left" }}
                  />
                </div>
              )}
              <motion.div variants={fadeUp} className="flex w-20 flex-shrink-0 flex-col items-center text-center sm:w-24 lg:w-20 xl:w-24">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-500 text-white shadow-lg shadow-primary-500/20">
                  <step.icon size={22} />
                </div>
                <p className="mt-2.5 text-xs font-bold text-slate-900 dark:text-white sm:text-sm">{step.label}</p>
              </motion.div>
            </Fragment>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Placement Assistance                                                   */
/* ------------------------------------------------------------------ */

function SupportSection() {
  return (
    <section className="bg-slate-50 py-14 dark:bg-slate-900/40 sm:py-16">
      <div className="mx-auto max-w-7xl px-5">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={VIEWPORT} className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">Placement Assistance</p>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
            Everything You Need To Get Hired
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {SUPPORT_SERVICES.map((service) => (
            <SupportCard key={service.title} {...service} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Mentors                                                             */
/* ------------------------------------------------------------------ */

function MentorsSection() {
  return (
    <section className="bg-white py-14 dark:bg-app-dark-gradient sm:py-16">
      <div className="mx-auto max-w-6xl px-5">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={VIEWPORT} className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">Your Guides</p>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">Meet Your Career Mentors</h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          {MENTORS.map((mentor) => (
            <MentorCard key={mentor.name} mentor={mentor} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Hiring Partners — marquee                                          */
/* ------------------------------------------------------------------ */

function PartnersSection() {
  const marks = [...HIRING_PARTNERS, ...HIRING_PARTNERS];

  return (
    <section className="relative overflow-hidden bg-slate-50 py-14 dark:bg-slate-900/40 sm:py-16">
      <style>{`
        @keyframes career-partners-marquee {
          to { transform: translateX(-50%); }
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-5">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={VIEWPORT} className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">Hiring Partners</p>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
            Companies Hiring Our Graduates
          </h2>
        </motion.div>

        <div className="relative mt-9 overflow-hidden rounded-3xl border border-slate-200/80 bg-white py-8 dark:border-white/10 dark:bg-slate-950/40">
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-white to-transparent dark:from-slate-950" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-white to-transparent dark:from-slate-950" />

          <div className="flex overflow-hidden">
            <div className="flex w-max flex-shrink-0 items-center gap-5 [animation:career-partners-marquee_26s_linear_infinite] hover:[animation-play-state:paused] motion-reduce:[animation-play-state:paused]">
              {marks.map((name, index) => (
                <div
                  key={`${name}-${index}`}
                  className="flex flex-shrink-0 items-center gap-2.5 whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 py-2 dark:border-white/10 dark:bg-slate-900"
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br text-[10px] font-extrabold text-white ${toneOf(
                      name,
                    )}`}
                  >
                    {initialsOf(name)}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Success Stories                                                     */
/* ------------------------------------------------------------------ */

function StoriesSection() {
  return (
    <section className="bg-white py-14 dark:bg-app-dark-gradient sm:py-16">
      <div className="mx-auto max-w-7xl px-5">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={VIEWPORT} className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">Real Outcomes</p>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">Placement Success Stories</h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3"
        >
          {SUCCESS_STORIES.map((story) => (
            <StoryCard key={story.name} story={story} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Placement Statistics — bold band with count-up                     */
/* ------------------------------------------------------------------ */

function StatsSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-800 to-secondary-600 py-14 sm:py-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)", backgroundSize: "20px 20px" }}
      />
      <div className="relative mx-auto max-w-7xl px-5">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={VIEWPORT} className="text-center text-white">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-secondary-200">By The Numbers</p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Outcomes, Not Just Promises</h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5"
        >
          {PLACEMENT_STATS.map((stat) => (
            <motion.div key={stat.label} variants={fadeUp}>
              <StatCounter {...stat} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Interview Process — vertical zigzag timeline                       */
/* ------------------------------------------------------------------ */

function ProcessSection() {
  return (
    <section className="bg-white py-14 dark:bg-app-dark-gradient sm:py-16">
      <div className="mx-auto max-w-4xl px-5">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={VIEWPORT} className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">How It Works</p>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">The Interview Process</h2>
        </motion.div>

        <div className="relative mt-10">
          <div className="absolute left-6 top-0 h-full w-px bg-gradient-to-b from-primary-200 via-secondary-300 to-primary-200 dark:from-primary-500/20 dark:via-secondary-500/30 dark:to-primary-500/20 md:left-1/2 md:-translate-x-1/2" />

          <div className="space-y-6 md:space-y-0">
            {INTERVIEW_PROCESS.map((step, index) => {
              const isLeft = index % 2 === 0;
              return (
                <motion.div
                  key={step.title}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={VIEWPORT}
                  className="grid grid-cols-[auto_1fr] items-start gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-8 md:py-6"
                >
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-secondary-500 text-white shadow-lg md:col-start-2 md:row-start-1">
                    <step.icon size={18} />
                  </div>
                  <div
                    className={`md:row-start-1 ${
                      isLeft ? "md:col-start-1 md:text-right" : "md:col-start-3 md:text-left"
                    }`}
                  >
                    <p className="text-base font-bold text-slate-900 dark:text-white">{step.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{step.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FAQ — accordion                                                     */
/* ------------------------------------------------------------------ */

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="bg-slate-50 py-14 dark:bg-slate-900/40 sm:py-16">
      <div className="mx-auto max-w-3xl px-5">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={VIEWPORT} className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">FAQ</p>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">Questions, Answered</h2>
        </motion.div>

        <div className="mt-9 space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={faq.q}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT}
                className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-white/10 dark:bg-slate-900"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
                >
                  <span className="text-sm font-bold text-slate-900 dark:text-white sm:text-base">{faq.q}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-white/10 dark:text-primary-300"
                  >
                    <ChevronDown size={14} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed text-slate-500 dark:text-slate-400 sm:px-6">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Final CTA                                                           */
/* ------------------------------------------------------------------ */

function FinalCTASection() {
  return (
    <section
      id="final-cta"
      className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-800 to-secondary-600 py-16 text-white sm:py-20"
    >
      <div className="pointer-events-none absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-white/10 blur-[120px]" />
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
        className="relative mx-auto max-w-2xl px-5 text-center"
      >
        <h2 className="text-4xl font-extrabold sm:text-5xl">Your Dream Job Starts Here</h2>
        <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-primary-100">
          Talk to our placement team, get a personalized roadmap, and find out exactly what it takes to get you
          job-ready.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#"
            className="group inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-4 text-sm font-bold text-primary-700 shadow-xl transition-transform duration-300 hover:scale-105"
          >
            Book Free Career Consultation
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-7 py-4 text-sm font-bold text-white backdrop-blur-xl transition-colors duration-300 hover:bg-white/20"
          >
            Talk To Placement Team
          </a>
        </div>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Root                                                                */
/* ------------------------------------------------------------------ */

export default function Career() {
  return (
    <>
      <Seo
        title="Career Support & Placement Assistance"
        description="Get career-ready with mentorship, mock interviews, hiring drives and end-to-end placement assistance from Kini Edx Hub's career roadmap program."
        path="/career"
      />
      <Navbar />
      <main className="overflow-x-hidden">
        <Hero />
        <CareerRoadmapSection />
        <SupportSection />
        <MentorsSection />
        <PartnersSection />
        <StoriesSection />
        <StatsSection />
        <ProcessSection />
        <FAQSection />
        <FinalCTASection />
      </main>
      <Footer />
    </>
  );
}
