import { motion } from "framer-motion";
import { Briefcase, Code2, GraduationCap, Infinity as InfinityIcon, Radio, Users } from "lucide-react";
import { useThemeContext } from "@landing-shared/context/ThemeContext";
import { fadeUp, staggerContainer } from "@landing-shared/hooks/useScrollAnimation";
import Section from "@landing-shared/components/ui/Section";
import SectionHeader from "@landing-shared/components/ui/SectionHeader";
import { whyChooseUsFeatures } from "../data/homeData";
import Navbar from "@landing-shared/components/navbar";
import Footer from "@landing-shared/components/Footer";
import Seo from "@landing-shared/components/Seo";

const ICONS = [Radio, GraduationCap, Briefcase, Code2, Users, InfinityIcon];

// Define static border colors and their corresponding hover/bg classes
const BORDER_CONFIG = {
  featured: {
    light: [
      { border: "border-primary-500/40", hover: "hover:border-primary-500/60", bg: "bg-primary-500" },
      { border: "border-secondary-500/40", hover: "hover:border-secondary-500/60", bg: "bg-secondary-500" },
    ],
    dark: [
      { border: "border-primary-400/40", hover: "hover:border-primary-400/60", bg: "bg-primary-400" },
      { border: "border-secondary-400/40", hover: "hover:border-secondary-400/60", bg: "bg-secondary-400" },
    ]
  },
  regular: {
    light: [
      { border: "border-primary-500/30", hover: "hover:border-primary-500/50", bg: "bg-primary-500" },
      { border: "border-secondary-500/30", hover: "hover:border-secondary-500/50", bg: "bg-secondary-500" },
      { border: "border-primary-700/30", hover: "hover:border-primary-700/50", bg: "bg-primary-700" },
      { border: "border-secondary-700/30", hover: "hover:border-secondary-700/50", bg: "bg-secondary-700" },
    ],
    dark: [
      { border: "border-primary-400/30", hover: "hover:border-primary-400/50", bg: "bg-primary-400" },
      { border: "border-secondary-400/30", hover: "hover:border-secondary-400/50", bg: "bg-secondary-400" },
      { border: "border-primary-300/30", hover: "hover:border-primary-300/50", bg: "bg-primary-300" },
      { border: "border-secondary-300/30", hover: "hover:border-secondary-300/50", bg: "bg-secondary-300" },
    ]
  }
};

function FeatureCard({ feature, Icon, isDark, featured = false, className = "", borderIndex = 0 }) {
  // Get config object based on card type and index
  const getConfig = () => {
    if (featured) {
      return isDark 
        ? BORDER_CONFIG.featured.dark[borderIndex] 
        : BORDER_CONFIG.featured.light[borderIndex];
    }
    return isDark 
      ? BORDER_CONFIG.regular.dark[borderIndex] 
      : BORDER_CONFIG.regular.light[borderIndex];
  };

  const config = getConfig();

  return (
    <motion.div
      variants={fadeUp}
      className={`relative overflow-hidden rounded-3xl border-2 p-6 transition-all duration-300 hover:shadow-xl ${
        featured
          ? isDark
            ? "bg-gradient-to-br from-primary-500/10 via-white/[0.02] to-secondary-500/10 shadow-glow"
            : "bg-gradient-to-br from-primary-50 via-white to-secondary-50 shadow-card-lg"
          : isDark
            ? "bg-white/[0.03] hover:shadow-glow"
            : "bg-white shadow-card hover:shadow-card-lg"
      } ${config.border} ${config.hover} ${className}`}
    >
      {/* Colored accent bar at top */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${config.bg}`} />
      
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white ${
          featured ? "shadow-glow" : ""
        }`}
      >
        <Icon className={featured ? "h-6 w-6" : "h-5 w-5"} aria-hidden="true" />
      </span>

      <h3
        className={`mt-4 font-display font-bold ${featured ? "text-xl" : "text-base"} ${
          isDark ? "text-white" : "text-ink-900"
        }`}
      >
        {feature.title}
      </h3>
      <p className={`mt-2 leading-relaxed ${featured ? "text-sm" : "text-xs"} ${isDark ? "text-white/50" : "text-ink-900/50"}`}>
        {feature.desc}
      </p>
    </motion.div>
  );
}

export default function WhyChooseUs() {
  const { isDark } = useThemeContext();
  const [first, second, ...rest] = whyChooseUsFeatures;

  return (
    <>
      <Seo
        title="Why Choose Us"
        description="Live training, real projects, industry mentorship and placement assistance — see why students choose Kini Edx Hub for career-focused tech education."
        path="/why-choose-us"
      />
      <Navbar />
      <Section className={isDark ? "bg-app-dark-gradient" : "bg-porcelain"}>
      <SectionHeader
        eyebrow="Why Choose Us"
        heading={
          <>
            Built Different from{" "}
            <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              Every Other Bootcamp
            </span>
          </>
        }
        subheading="No recorded courses, no crowded cohorts, no guesswork. Just outcomes."
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.15 }}
        className="mt-10"
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <FeatureCard 
            feature={first} 
            Icon={ICONS[0]} 
            isDark={isDark} 
            featured 
            borderIndex={0}
            className="lg:col-span-2" 
          />
          <FeatureCard 
            feature={second} 
            Icon={ICONS[1]} 
            isDark={isDark} 
            featured 
            borderIndex={1}
          />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {rest.map((feature, i) => (
            <FeatureCard 
              key={feature.title} 
              feature={feature} 
              Icon={ICONS[i + 2]} 
              isDark={isDark} 
              borderIndex={i}
            />
          ))}
        </div>
      </motion.div>
      </Section>
      <Footer />
    </>
  );
}