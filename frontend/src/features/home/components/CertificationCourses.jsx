import React, { useState, useId, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMic,
  FiPlay,
  FiDroplet,
  FiStar,
  FiArrowRight,
  FiCode,
  FiCpu,
  FiBriefcase,
  FiCloud,
  FiDatabase,
  FiLayers,
} from "react-icons/fi";
import CourseCardSkeleton from '@shared/components/CourseCardSkeleton';

// ============================================================================
// STRUCTURAL CONSTANTS & STATIC DATA CONTRACT
// ============================================================================

const CATEGORIES = [
  { id: "all", label: "All Courses (12)" },
  { id: "dotnet", label: ".NET Platform (2)" },
  { id: "aiml", label: "AI/ML & Gen AI (3)" },
  { id: "career", label: "Career & Leadership (2)" },
  { id: "cloud", label: "Cloud & DevOps (2)" },
  { id: "java", label: "Java Platform (2)" },
  { id: "frontend", label: "JS & Front-end (1)" },
];

const COURSES_DATA = [
  {
    id: "course-1",
    category: "dotnet",
    badgeLabel: ".NET Platform",
    title: ".NET Microservices Certification Training",
    icon: <FiCode />,
    badgeColors: "bg-blue-500/10 text-blue-400 border-blue-500/20 group-hover:border-blue-400/40",
    glowColor: "group-hover:shadow-[0_0_30px_rgba(59,130,246,0.25)]",
    stats: { sessions: 12, videos: 112, labs: 28, rating: "4.8" },
  },
  {
    id: "course-2",
    category: "dotnet",
    badgeLabel: ".NET Platform",
    title: "ASP.NET Core Certification Training",
    icon: <FiLayers />,
    badgeColors: "bg-blue-500/10 text-blue-400 border-blue-500/20 group-hover:border-blue-400/40",
    glowColor: "group-hover:shadow-[0_0_30px_rgba(59,130,246,0.25)]",
    stats: { sessions: 16, videos: 140, labs: 32, rating: "4.9" },
  },
  {
    id: "course-3",
    category: "aiml",
    badgeLabel: "AI/ML & Gen AI",
    title: "AWS AI & Gen AI Engineer Certification Training",
    icon: <FiCpu />,
    badgeColors: "bg-orange-500/10 text-orange-400 border-orange-500/20 group-hover:border-orange-400/40",
    glowColor: "group-hover:shadow-[0_0_30px_rgba(249,115,22,0.25)]",
    stats: { sessions: 14, videos: 124, labs: 30, rating: "4.9" },
  },
  {
    id: "course-4",
    category: "aiml",
    badgeLabel: "AI/ML & Gen AI",
    title: "Azure AI Apps & Agents Developer Associate",
    icon: <FiCpu />,
    badgeColors: "bg-orange-500/10 text-orange-400 border-orange-500/20 group-hover:border-orange-400/40",
    glowColor: "group-hover:shadow-[0_0_30px_rgba(249,115,22,0.25)]",
    stats: { sessions: 12, videos: 98, labs: 24, rating: "4.7" },
  },
  {
    id: "course-5",
    category: "aiml",
    badgeLabel: "AI/ML & Gen AI",
    title: "Generative AI Masterclass with LangChain",
    icon: <FiCpu />,
    badgeColors: "bg-orange-500/10 text-orange-400 border-orange-500/20 group-hover:border-orange-400/40",
    glowColor: "group-hover:shadow-[0_0_30px_rgba(249,115,22,0.25)]",
    stats: { sessions: 18, videos: 156, labs: 40, rating: "4.8" },
  },
  {
    id: "course-6",
    category: "career",
    badgeLabel: "Career & Leadership",
    title: "Technical Product Management Certification",
    icon: <FiBriefcase />,
    badgeColors: "bg-red-500/10 text-red-400 border-red-500/20 group-hover:border-red-400/40",
    glowColor: "group-hover:shadow-[0_0_30px_rgba(239,68,68,0.25)]",
    stats: { sessions: 10, videos: 88, labs: 12, rating: "4.6" },
  },
  {
    id: "course-7",
    category: "career",
    badgeLabel: "Career & Leadership",
    title: "Engineering Manager to Director Framework",
    icon: <FiBriefcase />,
    badgeColors: "bg-red-500/10 text-red-400 border-red-500/20 group-hover:border-red-400/40",
    glowColor: "group-hover:shadow-[0_0_30px_rgba(239,68,68,0.25)]",
    stats: { sessions: 15, videos: 110, labs: 20, rating: "4.9" },
  },
  {
    id: "course-8",
    category: "cloud",
    badgeLabel: "Cloud & DevOps",
    title: "AWS Certified Solutions Architect Professional",
    icon: <FiCloud />,
    badgeColors: "bg-green-500/10 text-green-400 border-green-500/20 group-hover:border-green-400/40",
    glowColor: "group-hover:shadow-[0_0_30px_rgba(34,197,94,0.25)]",
    stats: { sessions: 20, videos: 210, labs: 45, rating: "5.0" },
  },
  {
    id: "course-9",
    category: "cloud",
    badgeLabel: "Cloud & DevOps",
    title: "Certified Kubernetes Administrator (CKA) Path",
    icon: <FiCloud />,
    badgeColors: "bg-green-500/10 text-green-400 border-green-500/20 group-hover:border-green-400/40",
    glowColor: "group-hover:shadow-[0_0_30px_rgba(34,197,94,0.25)]",
    stats: { sessions: 14, videos: 132, labs: 35, rating: "4.8" },
  },
  {
    id: "course-10",
    category: "java",
    badgeLabel: "Java Platform",
    title: "Java Full Stack Developer Certification",
    icon: <FiDatabase />,
    badgeColors: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 group-hover:border-yellow-400/40",
    glowColor: "group-hover:shadow-[0_0_30px_rgba(234,179,8,0.25)]",
    stats: { sessions: 22, videos: 245, labs: 50, rating: "4.9" },
  },
  {
    id: "course-11",
    category: "java",
    badgeLabel: "Java Platform",
    title: "Spring Boot & Microservices Masterclass",
    icon: <FiDatabase />,
    badgeColors: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 group-hover:border-yellow-400/40",
    glowColor: "group-hover:shadow-[0_0_30px_rgba(234,179,8,0.25)]",
    stats: { sessions: 16, videos: 178, labs: 38, rating: "4.8" },
  },
  {
    id: "course-12",
    category: "frontend",
    badgeLabel: "JS & Front-end",
    title: "Advanced React Production Architecture",
    icon: <FiCode />,
    badgeColors: "bg-purple-500/10 text-purple-400 border-purple-500/20 group-hover:border-purple-400/40",
    glowColor: "group-hover:shadow-[0_0_30px_rgba(168,85,247,0.25)]",
    stats: { sessions: 12, videos: 112, labs: 28, rating: "4.8" },
  },
];

// ============================================================================
// ANIMATION DICTIONARY (PRE-OPTIMIZED MOTION OBJECTS)
// ============================================================================

const headerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 60, damping: 20 },
  },
};

const tabContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const tabItemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

const gridContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 18 },
  },
  exit: {
    opacity: 0,
    scale: 0.93,
    y: 20,
    transition: { duration: 0.25, ease: "easeInOut" },
  },
};

// ============================================================================
// MAIN COMPONENT EXPORT
// ============================================================================

export default function CertificationCourses() {
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const sectionTitleId = useId();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Exact category match: "all" returns everything, any other tab filters
  // strictly by course.category === tab id. No fuzzy logic, no keyword maps.
  const filteredCourses = useMemo(() => {
    if (activeTab === "all") return COURSES_DATA;
    return COURSES_DATA.filter((course) => course.category === activeTab);
  }, [activeTab]);

  // Synchronous tab change — no setTimeout, no race conditions.
  const handleTabChange = useCallback(
    (id) => {
      if (id === activeTab) return;
      setActiveTab(id);
    },
    [activeTab]
  );

  return (
    <section
      aria-labelledby={sectionTitleId}


      className="relative w-full bg-gradient-to-b from-[#0F172A] to-[#172554] text-slate-100 py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden antialiased select-none"

    >
      {/* Structural Decorative Background Lights */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[180px] pointer-events-none transform -translate-x-1/2" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none transform translate-x-1/2" />

      <div className="max-w-[1400px] mx-auto relative z-10 mt-2">

        {/* ─── HEADER BLOCK ─── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={headerVariants}
          className="flex flex-col items-center justify-center text-center mb-10 sm:mb-14"
        >
          <h2
            id={sectionTitleId}
            className="text-[36px] sm:text-[56px] md:text-[72px] font-extrabold text-white tracking-tight leading-none max-w-5xl mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-200"
          >
            Master In-Demand Skills. Get Certified
          </h2>
          <p className="text-slate-400 text-sm sm:text-base md:text-lg max-w-[900px] leading-relaxed font-normal px-4">
            Advance your career with hands-on, certification-ready training in
            .NET, Java, Cloud, DevOps, AI and more.
          </p>
        </motion.div>

        {/* ─── CATEGORY FILTERS MODULE ─── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={tabContainerVariants}
          role="tablist"
          aria-label="Filter course grid by subject domains"
          className="w-full flex flex-wrap items-center justify-center gap-3 mb-8 sm:mb-10 max-w-6xl mx-auto"
        >
          {CATEGORIES.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <motion.div
                key={tab.id}
                variants={tabItemVariants}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className="relative"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls="course-responsive-grid-container"
                  id={`tab-${tab.id}`}
                  onClick={() => handleTabChange(tab.id)}
                  className={`relative px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all duration-300 outline-none border focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F172A] ${
                    isSelected
                      ? "text-white border-transparent shadow-[0_8px_20px_-4px_rgba(29,78,216,0.4)]"
                      : "text-slate-400 border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeFilterPill"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 z-0"
                      transition={{ type: "spring", stiffness: 320, damping: 26 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ─── RESPONSIBLY MATRIX GRID FRAME ─── */}
        <motion.div
          id="course-responsive-grid-container"
          role="region"
          aria-live="polite"
          aria-labelledby={`tab-${activeTab}`}
          variants={gridContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 auto-rows-fr"
        >
          <AnimatePresence mode="popLayout">
            {filteredCourses.length === 0 && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="col-span-1 sm:col-span-2 lg:col-span-4 flex items-center justify-center"
              >
                <div className="text-center text-slate-300">
                  <h3 className="text-lg font-semibold text-white mb-2">No courses found in this category</h3>
                  <p className="text-sm">Try a different category or clear filters.</p>
                </div>
              </motion.div>
            )}

            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// HOVER-ELEVATED GLASSMORPHIC CARD CHILD COMPONENT
// ============================================================================

const CourseCard = React.memo(function CourseCard({ course }) {
  return (
    <motion.div
      layout
      variants={cardVariants}
      whileHover={{ y: -12 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative h-full flex flex-col justify-between p-6 sm:p-7 rounded-[24px] bg-slate-900/80 backdrop-blur-xl border border-white/[0.08] hover:border-blue-500/30 transition-all duration-500 overflow-hidden ${course.glowColor}`}
    >
      {/* Internal Interactive Backplate Light Glow Layer */}
      <div className="absolute inset-0 rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-b from-white/[0.02] to-transparent z-0" />

      <div className="relative z-10 flex flex-col flex-1">

        {/* Card Top Row Section */}
        <div className="flex items-center justify-between gap-4 mb-6">
          {/* Logo Frame mimicking an image background frame container safely */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center border border-white/10 shadow-inner text-xl text-blue-400 group-hover:text-blue-300 group-hover:scale-110 group-hover:border-blue-500/20 transition-all duration-400">
            {course.icon}
          </div>

          {/* Categorized Colored System Badges */}
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors duration-400 select-none ${course.badgeColors}`}
          >
            {course.badgeLabel}
          </span>
        </div>

        {/* Course Card Title Module with line clamping fallback constraints */}
        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug group-hover:text-blue-400 mb-6 transition-colors duration-300 min-h-[54px] sm:min-h-[64px] line-clamp-3">
          {course.title}
        </h3>

        {/* Technical Capabilities Meta Metrics Matrix System Layout */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 mb-8 mt-auto">
          <div className="flex items-center gap-2.5 text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
            <FiMic className="text-sm text-slate-500 group-hover:text-blue-400 transition-colors" />
            <span className="text-xs font-medium tracking-wide">
              {course.stats.sessions} Sessions
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
            <FiPlay className="text-sm text-slate-500 group-hover:text-blue-400 transition-colors" />
            <span className="text-xs font-medium tracking-wide">
              {course.stats.videos} Videos
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
            <FiDroplet className="text-sm text-slate-500 group-hover:text-blue-400 transition-colors" />
            <span className="text-xs font-medium tracking-wide">
              {course.stats.labs} Labs
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <FiStar className="text-sm text-amber-500 drop-shadow-[0_0_4px_rgba(245,158,11,0.4)]" />
            <span className="text-xs font-bold text-slate-300 tracking-wide">
              {course.stats.rating} Rating
            </span>
          </div>
        </div>
      </div>

      {/* Button Structural Lower Footer Anchoring Layer */}
      <div className="relative z-10 mt-auto w-full">
        <button className="w-full py-3.5 px-4 rounded-xl text-xs font-bold tracking-wider uppercase text-white bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 group-hover:from-blue-500 group-hover:via-cyan-500 group-hover:to-blue-600 flex items-center justify-center gap-2 transition-all duration-300 shadow-md group-hover:shadow-[0_10px_25px_-5px_rgba(37,99,235,0.4)] border border-white/10 active:scale-[0.98] cursor-pointer">
          <span>Explore Now</span>
          <FiArrowRight className="text-sm transform transition-transform duration-300 ease-out group-hover:translate-x-1.5" />
        </button>
      </div>
    </motion.div>
  );
});