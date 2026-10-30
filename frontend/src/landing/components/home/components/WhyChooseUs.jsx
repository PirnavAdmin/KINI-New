import { motion } from "framer-motion";
import {
  Radio,
  GraduationCap,
  Code2,
  UsersRound,
  BriefcaseBusiness,
  BadgeCheck,
} from "lucide-react";
import { useThemeContext } from "@landing-shared/context/ThemeContext";
import { fadeUp, staggerContainer } from "@landing-shared/hooks/useScrollAnimation";
import Section from "@landing-shared/components/ui/Section";
import SectionHeader from "@landing-shared/components/ui/SectionHeader";

const benefits = [
  {
    icon: Radio,
    title: "100% Live Training",
    desc: "Instructor-led, interactive sessions with real-time feedback and active participation.",
  },
  {
    icon: GraduationCap,
    title: "Industry-Expert Mentors",
    desc: "Learn from experienced professionals who bring practical, real-world industry knowledge.",
  },
  {
    icon: Code2,
    title: "Real-World Projects",
    desc: "Build practical applications that strengthen your portfolio and showcase your skills.",
  },
  {
    icon: UsersRound,
    title: "Small Cohort Sizes",
    desc: "Smaller batches ensure more personalized attention and meaningful mentor interaction.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Placement Assistance",
    desc: "Resume guidance, interview preparation, LinkedIn optimization, and dedicated career support.",
  },
  {
    icon: BadgeCheck,
    title: "Guaranteed Internships",
    desc: "Gain practical industry experience through a structured internship opportunity as part of your journey.",
  },
];

export default function WhyChooseUs() {
  const { isDark } = useThemeContext();

  return (
    <Section style={{ background: isDark ? "#0B2237" : "#FFFFFF" }}>
      <SectionHeader
        eyebrow="WHY KINI EDX HUB"
        heading={
          <>
            Built for Skills.{" "}
            <span className="bg-gradient-to-r from-primary-700 via-primary-400 to-secondary-500 bg-clip-text text-transparent">
              Designed for Careers.
            </span>
          </>
        }
        subheading="Learn through live instruction, practical projects, expert mentorship, and focused career support."
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.15 }}
        className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <motion.div
              key={benefit.title}
              variants={fadeUp}
              custom={index}
              className="group relative rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-white/[0.04] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:bg-white/[0.08]"
            >
              {/* Permanent top gradient border */}
              <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-primary-700 via-primary-400 to-secondary-500 opacity-100" />

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-primary-700 via-primary-400 to-secondary-500 text-white shadow-md">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>

              <h3
                className={`mt-4 font-display text-base font-semibold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {benefit.title}
              </h3>

              <p
                className={`mt-2 text-sm leading-relaxed ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                {benefit.desc}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </Section>
  );
}