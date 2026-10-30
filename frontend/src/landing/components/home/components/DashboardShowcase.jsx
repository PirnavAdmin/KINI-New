import { motion } from "framer-motion";
import {
  Award,
  CheckCircle2,
  Circle,
  Clock,
  Lock,
  MessageCircle,
  PlayCircle,
} from "lucide-react";
import { useThemeContext } from "@landing-shared/context/ThemeContext";
import { fadeUp, EASE_PREMIUM } from "@landing-shared/hooks/useScrollAnimation";
import Section from "@landing-shared/components/ui/Section";
import SectionHeader from "@landing-shared/components/ui/SectionHeader";
import Button from "@landing-shared/components/ui/Button";

const modules = [
  { title: "React Fundamentals", duration: "Week 1–3", status: "done" },
  { title: "State Management & APIs", duration: "Week 4–6", status: "done" },
  { title: "Authentication & Deployment", duration: "Week 7–9", status: "active" },
  { title: "Capstone Project", duration: "Week 10–12", status: "locked" },
];

const features = [
  {
    icon: PlayCircle,
    title: "Join live sessions in one click",
    desc: "No external meeting tools — every session opens straight from your dashboard.",
  },
  {
    icon: CheckCircle2,
    title: "Track progress module by module",
    desc: "See exactly where you stand in the curriculum, updated in real time.",
  },
  {
    icon: MessageCircle,
    title: "Message mentors directly",
    desc: "Ask questions between sessions and get a reply within one working day.",
  },
  {
    icon: Award,
    title: "Earn verifiable certificates",
    desc: "Unlock a shareable certificate as you complete each track.",
  },
];

function ModuleRow({ module, isDark }) {
  const isDone = module.status === "done";
  const isActive = module.status === "active";
  const isLocked = module.status === "locked";

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
        isActive
          ? "border-primary-500/30 bg-primary-500/5"
          : isDark
            ? "border-white/5 bg-white/[0.02]"
            : "border-slate-100 bg-slate-50"
      }`}
    >
      {isDone ? (
        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-secondary-500" aria-hidden="true" />
      ) : isLocked ? (
        <Lock className={`h-4 w-4 flex-shrink-0 ${isDark ? "text-slate-600" : "text-slate-300"}`} aria-hidden="true" />
      ) : (
        <Circle className="h-4 w-4 flex-shrink-0 animate-pulse text-primary-500" aria-hidden="true" />
      )}
      <span
        className={`flex-1 text-sm font-semibold ${
          isLocked ? (isDark ? "text-slate-600" : "text-slate-400") : isDark ? "text-slate-200" : "text-slate-800"
        }`}
      >
        {module.title}
      </span>
      <span className={`text-[11px] font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}>{module.duration}</span>
    </div>
  );
}

function DashboardMockup({ isDark }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 0.8, ease: EASE_PREMIUM }}
      className={`rounded-3xl border p-5 shadow-elevated sm:p-6 ${
        isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-white"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-sm font-bold text-white">
            A
          </div>
          <div>
            <p className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Welcome back, Aditi</p>
            <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>Full Stack Engineering · Cohort #24</p>
          </div>
        </div>
        <span className={`hidden rounded-pill px-3 py-1 text-[11px] font-bold sm:block ${isDark ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
          3 sessions this week
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Modules */}
        <div className="lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <p className={`text-xs font-bold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Continue Learning
            </p>
            <p className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-900"}`}>68%</p>
          </div>
          <div className={`mb-3 h-1.5 w-full overflow-hidden rounded-pill ${isDark ? "bg-white/10" : "bg-slate-100"}`}>
            <motion.div
              className="h-full rounded-pill bg-gradient-to-r from-primary-500 to-secondary-500"
              initial={{ width: 0 }}
              whileInView={{ width: "68%" }}
              viewport={{ once: false }}
              transition={{ duration: 1.1, ease: EASE_PREMIUM, delay: 0.3 }}
            />
          </div>
          <div className="space-y-2">
            {modules.map((module) => (
              <ModuleRow key={module.title} module={module} isDark={isDark} />
            ))}
          </div>
        </div>

        {/* Side cards */}
        <div className="space-y-4 lg:col-span-2">
          <div className={`rounded-xl border p-4 ${isDark ? "border-white/5 bg-white/[0.02]" : "border-slate-100 bg-slate-50"}`}>
            <p className={`text-[11px] font-bold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Next Live Session
            </p>
            <p className={`mt-1.5 text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              Deployment &amp; CI/CD
            </p>
            <p className={`mt-0.5 flex items-center gap-1.5 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              <Clock className="h-3 w-3" aria-hidden="true" />
              Today, 7:00 PM · with Arun Kumar
            </p>
          </div>

          <div className={`rounded-xl border p-4 ${isDark ? "border-white/5 bg-white/[0.02]" : "border-slate-100 bg-slate-50"}`}>
            <div className="flex items-center justify-between">
              <p className={`text-[11px] font-bold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Certificates
              </p>
              <Award className="h-4 w-4 text-secondary-500" aria-hidden="true" />
            </div>
            <p className={`mt-1.5 text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>3 of 6 earned</p>
            <div className={`mt-2 h-1.5 w-full overflow-hidden rounded-pill ${isDark ? "bg-white/10" : "bg-slate-200"}`}>
              <div className="h-full w-1/2 rounded-pill bg-secondary-500" />
            </div>
          </div>

          <div className={`rounded-xl border p-4 ${isDark ? "border-white/5 bg-white/[0.02]" : "border-slate-100 bg-slate-50"}`}>
            <div className="flex items-start gap-2.5">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-[11px] font-bold text-white">
                R
              </div>
              <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                <span className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Raj (mentor): </span>
                Great work on the auth module — let&apos;s review deployment next session.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function DashboardShowcase() {
  const { isDark } = useThemeContext();

  return (
    <Section
      className={isDark ? "bg-app-dark-gradient" : "bg-white"}
      decoration={
        <div className="absolute right-0 top-1/4 h-[450px] w-[450px] rounded-full bg-primary-500/[0.06] blur-[150px]" />
      }
    >
      <SectionHeader
        eyebrow="Your Learning Dashboard"
        heading={
          <>
            Everything You Need,{" "}
            <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              One Dashboard Away
            </span>
          </>
        }
        subheading="From your first live class to your final certificate, track every step in a dashboard built for momentum, not clutter."
      />

      <div className="mt-12 grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12">
        <div className="order-2 lg:order-1">
          <DashboardMockup isDark={isDark} />
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="order-1 lg:order-2"
        >
          <div className="space-y-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div key={feature.title} variants={fadeUp} className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-500/10">
                    <Icon className="h-5 w-5 text-primary-500" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{feature.title}</h3>
                    <p className={`mt-1 text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      {feature.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div variants={fadeUp} className="mt-8">
            <Button to="/upskill-program" size="lg">
              Start Learning Today
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </Section>
  );
}
