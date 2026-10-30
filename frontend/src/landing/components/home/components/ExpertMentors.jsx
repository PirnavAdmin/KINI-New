import { motion } from "framer-motion";
import { FaStar, FaUsers } from "react-icons/fa";
import { useThemeContext } from "@landing-shared/context/ThemeContext";
import { staggerContainer, fadeUp } from "@landing-shared/hooks/useScrollAnimation";
import Section from "@landing-shared/components/ui/Section";
import SectionHeader from "@landing-shared/components/ui/SectionHeader";
import Button from "@landing-shared/components/ui/Button";
import mentorsData from "@landing-shared/data/mentorsData";

function MentorCard({ mentor, isDark }) {
  return (
    <motion.div
      variants={fadeUp}
      className={`group overflow-hidden rounded-card border transition-all duration-300 ${
        isDark ? "border-white/10 bg-white/[0.02] hover:border-white/20" : "border-ink-900/[0.06] bg-white hover:shadow-card"
      }`}
    >
      <div className="relative overflow-hidden">
        <img
          src={mentor.image}
          alt={mentor.name}
          loading="lazy"
          className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" aria-hidden="true" />
        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-pill bg-white/95 px-2.5 py-1 text-xs font-bold text-ink-900 shadow-sm">
          <FaStar className="h-3 w-3 text-amber-400" aria-hidden="true" />
          {mentor.rating}
        </span>
      </div>

      <div className="p-4">
        <h3 className={`font-display text-sm font-bold ${isDark ? "text-white" : "text-ink-900"}`}>{mentor.name}</h3>
        <p className={`mt-0.5 text-xs ${isDark ? "text-white/50" : "text-ink-900/50"}`}>
          {mentor.title} · <span className="font-medium text-primary-500">{mentor.company}</span>
        </p>
        <p className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${isDark ? "text-white/40" : "text-ink-900/40"}`}>
          <FaUsers className="h-3 w-3" aria-hidden="true" />
          {mentor.students}+ students mentored
        </p>
      </div>
    </motion.div>
  );
}

export default function ExpertMentors() {
  const { isDark } = useThemeContext();

  return (
    <Section
      className={isDark ? "bg-app-dark-gradient" : "bg-porcelain"}
      decoration={
        <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-secondary-500/[0.06] blur-[150px]" />
      }
    >
      <SectionHeader
        eyebrow="Learn From the Best"
        heading={
          <>
            Mentors Who&apos;ve{" "}
            <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              Shipped at Scale
            </span>
          </>
        }
        subheading="Every mentor is a working engineer at a top product company — not a full-time instructor reading slides."
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
        className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        {mentorsData.map((mentor) => (
          <MentorCard key={mentor.id} mentor={mentor} isDark={isDark} />
        ))}
      </motion.div>

      <div className="mt-10 text-center">
        <Button to="/mentors" variant="secondary">
          Meet All Mentors
        </Button>
      </div>
    </Section>
  );
}
