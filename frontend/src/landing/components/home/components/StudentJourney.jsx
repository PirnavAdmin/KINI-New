import { motion } from "framer-motion";
import { BookOpen, Briefcase, ClipboardCheck, Code2, Handshake, Sparkles, Trophy } from "lucide-react";
import { useThemeContext } from "@landing-shared/context/ThemeContext";
import { fadeUp, staggerContainer } from "@landing-shared/hooks/useScrollAnimation";
import Section from "@landing-shared/components/ui/Section";
import SectionHeader from "@landing-shared/components/ui/SectionHeader";
import { learningProcessSteps } from "../data/homeData";

// Icon is resolved from the step's title/keywords instead of a fixed array
// position, so it stays correct no matter how many steps homeData.js defines
// or what order they're in (e.g. adding an "Internship" step later just works).
function getStepIcon(title = "") {
  const t = title.toLowerCase();
  if (t.includes("enroll") || t.includes("onboard")) return ClipboardCheck;
  if (t.includes("learn")) return BookOpen;
  if (t.includes("project") || t.includes("build")) return Code2;
  if (t.includes("intern")) return Handshake;
  if (t.includes("career") || t.includes("prep") || t.includes("interview")) return Briefcase;
  if (t.includes("hire") || t.includes("offer") || t.includes("placement")) return Trophy;
  return Sparkles;
}

// Tailwind needs static class names, so map step count to a fixed set of
// column classes rather than interpolating an arbitrary number.
const GRID_COLS_BY_COUNT = {
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
  6: "md:grid-cols-6",
  7: "md:grid-cols-7",
};

// homeData.js doesn't have an Internship step yet, so it's inserted here
// locally rather than requiring a separate data-file edit. It's placed right
// before whatever step reads as "career prep / interview", and any
// week-numbered durations after that point are shifted forward so labels
// stay sequential (e.g. "Weeks 17–20" → "Weeks 21–24") instead of colliding.
const INTERNSHIP_DURATION_WEEKS = 4;

function shiftWeeksBy(durationStr = "", weeksToAdd) {
  const match = durationStr.match(/^Weeks\s+(\d+)[–-](\d+)$/i);
  if (!match) return durationStr; // "Day 1", "Until Hired", etc. pass through unchanged
  const start = Number(match[1]) + weeksToAdd;
  const end = Number(match[2]) + weeksToAdd;
  return `Weeks ${start}–${end}`;
}

function withInternship(steps) {
  if (steps.some((s) => /intern/i.test(s.title))) return steps; // already present, no-op

  const insertIndex = steps.findIndex((s) => /career|prep|interview/i.test(s.title));
  const idx = insertIndex === -1 ? Math.max(steps.length - 1, 0) : insertIndex;

  const before = steps.slice(0, idx);
  const after = steps.slice(idx).map((s) => ({
    ...s,
    duration: shiftWeeksBy(s.duration, INTERNSHIP_DURATION_WEEKS),
  }));

  const internshipStep = {
    title: "Internship",
    desc: "Apply everything you've learned in a real, guaranteed internship — live tickets, real stand-ups, and feedback from working teams before you interview for placement.",
    duration: "Weeks 17–20",
  };

  return [...before, internshipStep, ...after].map((s, i) => ({ ...s, step: i + 1 }));
}

function StepNode({ step, Icon, isDark }) {
  return (
    <motion.div
      variants={fadeUp}
      className="relative z-10 flex flex-row items-start gap-4 text-left md:flex-col md:items-center md:text-center"
    >
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-secondary-500 text-white shadow-elevated">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="md:mt-3">
        <span className="text-[11px] font-bold uppercase tracking-wide text-primary-500">
          Step {step.step}
        </span>
        <h3 className={`mt-1 text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{step.title}</h3>
        <p className={`mt-1.5 text-xs leading-relaxed md:max-w-[180px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          {step.desc}
        </p>
        <span
          className={`mt-3 inline-block rounded-pill px-2.5 py-1 text-[10px] font-bold ${
            isDark ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-600"
          }`}
        >
          {step.duration}
        </span>
      </div>
    </motion.div>
  );
}

export default function StudentJourney() {
  const { isDark } = useThemeContext();
  const steps = withInternship(learningProcessSteps);

  return (
    <Section
      className=""
      style={{
        background: isDark
          ? "#0B2237"
          : "radial-gradient(circle at 50% 50%, rgba(243,153,36,0.07), transparent 45%), #FFFCF8",
      }}
      decoration={
        <div className="absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-secondary-500/[0.05] blur-[160px]" />
      }
    >
      <SectionHeader
        eyebrow="The Journey"
        heading={
          <>
            From Day 1 to Your{" "}
            <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              Job Offer
            </span>
          </>
        }
        subheading="Every student follows the same proven path — live learning, real projects, a guaranteed internship, and dedicated placement assistance until you're hired."
      />

      <div className="relative mt-12">
        {/* Connector line — desktop only, sits behind the step nodes */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[10%] right-[10%] top-6 hidden h-px bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 opacity-30 md:block"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          className={`grid grid-cols-1 gap-8 md:gap-4 ${GRID_COLS_BY_COUNT[steps.length] || "md:grid-cols-5"}`}
        >
          {steps.map((step) => (
            <StepNode key={step.step} step={step} Icon={getStepIcon(step.title)} isDark={isDark} />
          ))}
        </motion.div>
      </div>
    </Section>
  );
}