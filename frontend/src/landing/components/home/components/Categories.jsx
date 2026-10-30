import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeContext } from "@landing-shared/context/ThemeContext";
import { useEnrollment } from "@landing-shared/context/ModalProvider";
import Section from "@landing-shared/components/ui/Section";
import SectionHeader from "@landing-shared/components/ui/SectionHeader";
import { FaCheckCircle, FaArrowRight, FaClock, FaUsers } from "react-icons/fa";

// ─── Local Data ──────────────────────────────────────────────────────────────

const categories = [
  { id: "python", label: "Python" },
  { id: "webdev", label: "Web Dev" },
  { id: "java", label: "Java Full Stack" }, // replaced "cloud" with "java"
  { id: "ai", label: "AI/ML" },
];

const featuredCourses = [
  {
    id: "python",
    title: "Python Programming",
    badge: "Hot",
    desc: "Build a strong foundation in Python programming with practical exercises, problem-solving, and real-world development concepts.",
    duration: "12 Weeks",
    sessions: "3 sessions/week",
    outcomes: [
      "Python fundamentals & OOP",
      "APIs & backend basics",
      "Practical projects",
      "Git & GitHub",
    ],
    image:
      "https://i.pinimg.com/736x/f9/0a/cb/f90acb224dfbb653ad778cee91217b78.jpg",
  },
  {
    id: "webdev",
    title: "Web Development — React, Node.js & Laravel",
    badge: "Popular",
    desc: "Learn modern web development by building responsive frontend and backend applications using popular web technologies.",
    duration: "16 Weeks",
    sessions: "3 sessions/week",
    outcomes: [
      "HTML, CSS & JavaScript",
      "React & modern frontend",
      "Node.js & Express APIs",
      "Laravel fundamentals",
      "Full-stack projects",
    ],
    image:
      "https://i.pinimg.com/736x/9e/19/6a/9e196a574a247fbc15bd5564caacab97.jpg",
  },
  {
    id: "java", // New Java Full Stack course
    title: "Java Full Stack Development",
    badge: "New",
    desc: "Master Java backend development with Spring Boot and build modern frontends with Angular or React. Become a full‑stack Java developer.",
    duration: "16 Weeks",
    sessions: "3 sessions/week",
    outcomes: [
      "Core Java & OOP",
      "Spring Boot & REST APIs",
      "Frontend with Angular/React",
      "Database integration (JPA, Hibernate)",
      "Full‑stack project deployment",
    ],
    image:
      "https://i.pinimg.com/1200x/33/4d/e4/334de4f80d9e56c4c55b5dde1d80cd56.jpg",
  },
  {
    id: "ai",
    title: "AI & Machine Learning",
    badge: "Trending",
    desc: "Learn the foundations of artificial intelligence and machine learning through practical concepts and projects.",
    duration: "16 Weeks",
    sessions: "3 sessions/week",
    outcomes: [
      "Python for AI",
      "Machine learning fundamentals",
      "Data preparation & exploration",
      "Model development & evaluation",
      "Practical AI/ML projects",
    ],
    image:
      "https://i.pinimg.com/736x/ad/31/c8/ad31c8e7afc2fc9f3995ab279a9fbfb1.jpg",
  },
];

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800&h=600";

export default function Categories() {
  const [activeTab, setActiveTab] = useState(0);
  const { isDark } = useThemeContext();
  const { openEnrollment } = useEnrollment();
  const course = useMemo(() => featuredCourses[activeTab], [activeTab]);

  return (
    <Section
      className={isDark ? "bg-app-dark-gradient" : "bg-[#F3F8FC]"}
      decoration={
        <>
          <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-primary-500/5 blur-[150px] dark:bg-primary-500/10" />
          <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-secondary-500/5 blur-[150px] dark:bg-secondary-500/10" />
        </>
      }
    >
      <SectionHeader
        eyebrow="Our Programs"
        heading={
          <>
            Industry-Focused{" "}
            <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              Career Tracks
            </span>
          </>
        }
        subheading="Specialized programs designed to make you job-ready in 12-24 weeks."
      />

      {/* Tabs */}
      <div className="mt-8 mb-6 flex flex-wrap justify-center gap-2">
        {categories.map((cat, i) => (
          <motion.button
            key={cat.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveTab(i)}
            className={`rounded-pill border px-4 py-2 text-xs font-semibold transition-all duration-300 ${
              activeTab === i
                ? "border-transparent bg-secondary-500 text-primary-700 shadow-lg"
                : isDark
                ? "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white"
                : "border-ink-900/10 bg-white text-ink-900/60 hover:border-primary-500/30 hover:text-ink-900"
            }`}
          >
            {cat.label}
          </motion.button>
        ))}
      </div>

      {/* Program Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={`relative overflow-hidden rounded-3xl border ${
            isDark
              ? "border-white/10 bg-white/[0.03]"
              : "border-ink-900/15 bg-white/80 shadow-card"
          }`}
        >
          {/* Top gradient bar */}
          <div
            className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
            style={{
              background:
                "linear-gradient(90deg, #133B5D 0%, #1F4A70 35%, #B6630F 65%, #F39924 100%)",
            }}
          />

          {/* Two-column layout */}
          <div className="flex flex-col lg:flex-row">
            {/* Image – left */}
            <div className="lg:w-2/5 relative overflow-hidden lg:rounded-l-3xl bg-slate-100 dark:bg-slate-800">
              <div className="aspect-[4/3] lg:aspect-auto lg:h-[300px]">
                <motion.img
                  key={course.image}
                  src={course.image}
                  alt={`${course.title} course`}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = FALLBACK_IMAGE;
                    e.target.onerror = null;
                  }}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-transparent dark:from-black/20" />
            </div>

            {/* Content – right */}
            <div className="flex-1 p-6 sm:p-7 lg:p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                {/* Badge */}
                <span
                  className={`self-start inline-flex items-center gap-1.5 rounded-pill px-2.5 py-0.5 text-[10px] font-bold ${
                    isDark
                      ? "bg-primary-500/20 text-primary-300"
                      : "bg-primary-50 text-primary-600"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-500 animate-pulse" />
                  {course.badge}
                </span>

                {/* Title */}
                <h3
                  className={`font-display text-xl font-bold sm:text-2xl leading-tight ${
                    isDark ? "text-white" : "text-ink-900"
                  }`}
                >
                  {course.title}
                </h3>

                {/* Description */}
                <p
                  className={`text-sm leading-relaxed ${
                    isDark ? "text-white/50" : "text-ink-900/50"
                  }`}
                >
                  {course.desc}
                </p>

                {/* Duration + sessions */}
                <div className="flex flex-wrap gap-4 text-xs">
                  <span
                    className={`flex items-center gap-1.5 ${
                      isDark ? "text-white/50" : "text-ink-900/50"
                    }`}
                  >
                    <FaClock className="text-secondary-500" /> {course.duration}
                  </span>
                  <span
                    className={`flex items-center gap-1.5 ${
                      isDark ? "text-white/50" : "text-ink-900/50"
                    }`}
                  >
                    <FaUsers className="text-primary-500" /> {course.sessions}
                  </span>
                </div>

                {/* Outcomes */}
                <div className="space-y-1.5">
                  {course.outcomes.slice(0, 5).map((outcome, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <FaCheckCircle className="flex-shrink-0 text-[10px] text-secondary-500 mt-0.5" />
                      <span
                        className={`text-xs ${
                          isDark ? "text-white/70" : "text-ink-900/60"
                        }`}
                      >
                        {outcome}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <motion.button
                type="button"
                onClick={() => openEnrollment(course)}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="
                  group self-start inline-flex items-center justify-center gap-2
                  rounded-full px-5 py-2 text-xs font-semibold text-primary-700
                  bg-secondary-500 border border-secondary-500
                  transition-all duration-300
                  hover:bg-secondary-600
                  shadow-[0_6px_16px_rgba(243,153,36,0.2)]
                  hover:shadow-[0_8px_24px_rgba(243,153,36,0.3)]
                  active:shadow-[0_4px_12px_rgba(243,153,36,0.15)]
                "
              >
                <span className="flex items-center gap-2">
                  Enroll Now
                  <FaArrowRight className="text-[10px] transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </Section>
  );
}