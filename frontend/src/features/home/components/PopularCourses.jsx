import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useThemeContext } from "@shared/context/ThemeContext";
import { staggerContainer, fadeUp } from "@shared/hooks/useScrollAnimation";
import {
  FaReact, FaPython, FaCode, FaBrain, FaAws, FaShieldAlt,
  FaStar, FaUsers, FaClock, FaSignal, FaHeart, FaArrowRight,
} from "react-icons/fa";

const courses = [
  {
    title: "React Mastery",
    slug: "react-mastery",
    path: "/courses/react",
    icon: FaReact,
    gradient: "from-[#06B6D4] to-[#2563EB]",
    color: "#06B6D4",
    instructor: "Sarah Chen",
    duration: "12 weeks",
    lessons: 48,
    rating: 4.9,
    students: 3400,
    difficulty: "Intermediate",
    price: "₹24,999",
    category: "Frontend",
  },
  {
    title: "Python Full Stack",
    slug: "python-full-stack",
    path: "/courses/python",
    icon: FaPython,
    gradient: "from-[#F59E0B] to-[#D97706]",
    color: "#F59E0B",
    instructor: "Mike Roberts",
    duration: "16 weeks",
    lessons: 64,
    rating: 4.8,
    students: 5200,
    difficulty: "All Levels",
    price: "₹29,999",
    category: "Backend",
  },
  {
    title: "MERN Stack",
    slug: "mern-stack",
    path: "/courses/mern",
    icon: FaCode,
    gradient: "from-[#10B981] to-[#059669]",
    color: "#10B981",
    instructor: "Arun Kumar",
    duration: "14 weeks",
    lessons: 56,
    rating: 4.9,
    students: 4100,
    difficulty: "Advanced",
    price: "₹34,999",
    category: "Full Stack",
  },
  {
    title: "AI & Machine Learning",
    slug: "ai-machine-learning",
    path: "/courses/ai",
    icon: FaBrain,
    gradient: "from-[#7C3AED] to-[#DB2777]",
    color: "#7C3AED",
    instructor: "Dr. Priya Sharma",
    duration: "20 weeks",
    lessons: 80,
    rating: 4.9,
    students: 2800,
    difficulty: "Advanced",
    price: "₹44,999",
    category: "AI/ML",
  },
  {
    title: "DevOps & Cloud",
    slug: "devops-cloud",
    path: "/courses/devops",
    icon: FaAws,
    gradient: "from-[#F97316] to-[#EA580C]",
    color: "#F97316",
    instructor: "Raj Patel",
    duration: "10 weeks",
    lessons: 40,
    rating: 4.7,
    students: 1900,
    difficulty: "Intermediate",
    price: "₹19,999",
    category: "DevOps",
  },
  {
    title: "Cyber Security",
    slug: "cyber-security",
    path: "/courses/cyber",
    icon: FaShieldAlt,
    gradient: "from-[#6B7280] to-[#4B5563]",
    color: "#6B7280",
    instructor: "Alex Turner",
    duration: "12 weeks",
    lessons: 48,
    rating: 4.8,
    students: 2300,
    difficulty: "Intermediate",
    price: "₹29,999",
    category: "Security",
  },
];

export default function PopularCourses() {
  const navigate = useNavigate();
  const { isDark } = useThemeContext();

  return (
    <section
      className={`relative overflow-hidden py-12 md:py-16 lg:py-20 transition-colors duration-500 ${
        isDark ? "bg-[#050816]" : "bg-[#F8FAFC]"
      }`}
    >
      {/* Background glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#085FA7]/5 dark:bg-[#085FA7]/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#5CA347]/5 dark:bg-[#5CA347]/10 blur-[150px] rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <span
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${
              isDark
                ? "border-[#085FA7]/30 bg-[#085FA7]/10 text-[#4A9EE0]"
                : "border-[#085FA7]/20 bg-[#EDF4FC] text-[#085FA7]"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#085FA7] animate-pulse" />
            Start Learning Today
          </span>
          <h2
            className={`mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Popular{" "}
            <span className="bg-gradient-to-r from-[#085FA7] to-[#5CA347] bg-clip-text text-transparent">
              Courses
            </span>
          </h2>
          <p
            className={`mt-3 max-w-xl mx-auto text-sm ${
              isDark ? "text-slate-400" : "text-[#64748B]"
            }`}
          >
            Industry-aligned curriculum designed to take you from beginner to job-ready professional.
          </p>
        </motion.div>

        {/* Course Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
        >
          {courses.map((course, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              onClick={() => navigate(course.path)}
              className={`group cursor-pointer relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                isDark
                  ? "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg"
              }`}
            >
              {/* Top gradient bar */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${course.gradient}`} />

              <div className="p-5 sm:p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${course.gradient} shadow-lg`}
                    style={{ boxShadow: `${course.color}40 0 4px 12px` }}
                  >
                    <course.icon className="w-5 h-5 text-white" />
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${
                      isDark
                        ? "bg-white/5 border-white/10 text-slate-300"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    {course.category}
                  </span>
                </div>

                {/* Title & Instructor */}
                <h3
                  className={`text-base font-bold mb-1 transition-colors ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {course.title}
                </h3>
                <p className={`text-xs mb-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  by {course.instructor}
                </p>

                {/* Meta Row */}
                <div className="flex flex-wrap items-center gap-3 mb-4 text-xs">
                  <span className={`flex items-center gap-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    <FaClock className={isDark ? "text-[#06B6D4]" : "text-[#4F46E5]"} />
                    {course.duration}
                  </span>
                  <span className={`flex items-center gap-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    <FaCode className={isDark ? "text-[#06B6D4]" : "text-[#4F46E5]"} />
                    {course.lessons} lessons
                  </span>
                  <span className={`flex items-center gap-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    <FaSignal className={isDark ? "text-[#06B6D4]" : "text-[#4F46E5]"} />
                    {course.difficulty}
                  </span>
                </div>

                {/* Rating & Students */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5">
                    <div className="flex text-yellow-400 text-xs">
                      {[...Array(5)].map((_, i) => <FaStar key={i} />)}
                    </div>
                    <span className={`text-xs font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                      {course.rating}
                    </span>
                  </div>
                  <span className={`text-xs flex items-center gap-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    <FaUsers className="text-xs" />
                    {course.students.toLocaleString()}
                  </span>
                </div>

                {/* Bottom: Price & Button */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200/50 dark:border-white/5">
                  <span className="text-lg font-bold bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] bg-clip-text text-transparent">
                    {course.price}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => { e.stopPropagation(); navigate(`/course-curriculum/${course.slug}`); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all"
                  >
                    Enroll Now
                    <FaArrowRight className="text-[10px]" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <button
            onClick={() => navigate("/courses")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5"
            style={{
              borderColor: isDark ? "rgba(8,95,167,0.3)" : "rgba(8,95,167,0.2)",
              color: "#085FA7",
              backgroundColor: isDark ? "rgba(8,95,167,0.1)" : "rgba(8,95,167,0.05)",
            }}
          >
            View All Courses
            <FaArrowRight className="text-xs" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
