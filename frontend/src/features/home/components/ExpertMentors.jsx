import { motion } from "framer-motion";
import { useThemeContext } from "@shared/context/ThemeContext";
import {
  FaLinkedinIn, FaTwitter, FaGithub, FaStar, FaGraduationCap,
  FaBriefcase, FaArrowRight,
} from "react-icons/fa";
import { staggerContainer, fadeUp } from "@shared/hooks/useScrollAnimation";

const mentors = [
  {
    name: "Dr. Sarah Chen",
    role: "AI & ML Lead",
    image: "https://i.pravatar.cc/200?img=1",
    experience: "15+ years",
    skills: ["Machine Learning", "Deep Learning", "NLP"],
    courses: 4,
    rating: 4.9,
    bio: "Former Google AI researcher with expertise in production ML systems.",
  },
  {
    name: "Arun Kumar",
    role: "Full Stack Architect",
    image: "https://i.pravatar.cc/200?img=3",
    experience: "12+ years",
    skills: ["React", "Node.js", "System Design"],
    courses: 6,
    rating: 4.8,
    bio: "Built products serving 10M+ users at Amazon and Flipkart.",
  },
  {
    name: "Priya Sharma",
    role: "Data Science Lead",
    image: "https://i.pravatar.cc/200?img=5",
    experience: "10+ years",
    skills: ["Python", "SQL", "Statistics"],
    courses: 3,
    rating: 4.9,
    bio: "PhD in Data Science, published 20+ research papers in top journals.",
  },
  {
    name: "Raj Patel",
    role: "DevOps Expert",
    image: "https://i.pravatar.cc/200?img=7",
    experience: "14+ years",
    skills: ["Docker", "K8s", "AWS"],
    courses: 5,
    rating: 4.7,
    bio: "Led infrastructure teams at Microsoft and served 500K+ users.",
  },
];

export default function ExpertMentors() {
  const { isDark } = useThemeContext();

  return (
    <section
      className={`relative overflow-hidden py-12 md:py-16 lg:py-20 transition-colors duration-500 ${
        isDark ? "bg-[#0F172A]" : "bg-gradient-to-b from-slate-50 to-white"
      }`}
    >
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#7C3AED]/5 dark:bg-[#7C3AED]/10 blur-[150px] rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${
            isDark
              ? "border-[#7C3AED]/30 bg-[#7C3AED]/10 text-[#A78BFA]"
              : "border-[#7C3AED]/20 bg-[#7C3AED]/5 text-[#7C3AED]"
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-pulse" />
            Learn from the Best
          </span>
          <h2 className={`mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight ${
            isDark ? "text-white" : "text-slate-900"
          }`}>
            Expert{" "}
            <span className="bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] bg-clip-text text-transparent">
              Mentors
            </span>
          </h2>
          <p className={`mt-3 max-w-xl mx-auto text-sm ${
            isDark ? "text-slate-400" : "text-slate-500"
          }`}>
            Industry veterans with decades of experience dedicated to your growth.
          </p>
        </motion.div>

        {/* Mentors Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6"
        >
          {mentors.map((mentor, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 ${
                isDark
                  ? "bg-white/[0.02] border-white/5 hover:border-white/10"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg"
              }`}
            >
              {/* Image Container */}
              <div className="relative overflow-hidden">
                <motion.img
                  src={mentor.image}
                  alt={mentor.name}
                  className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Social links (visible on hover) */}
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                  {[FaLinkedinIn, FaTwitter, FaGithub].map((Icon, j) => (
                    <div
                      key={j}
                      className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/40 transition-all cursor-pointer"
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`text-sm font-bold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}>
                    {mentor.name}
                  </h3>
                  <span className="flex items-center gap-1 text-xs text-yellow-400">
                    <FaStar className="w-3 h-3" />
                    {mentor.rating}
                  </span>
                </div>
                <p className={`text-xs mb-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {mentor.role}
                </p>

                {/* Experience & Courses */}
                <div className="flex items-center gap-3 text-[10px] mb-2">
                  <span className={`flex items-center gap-1 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}>
                    <FaBriefcase className="w-3 h-3" /> {mentor.experience}
                  </span>
                  <span className={`flex items-center gap-1 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}>
                    <FaGraduationCap className="w-3 h-3" /> {mentor.courses} courses
                  </span>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {mentor.skills.map((skill, j) => (
                    <span
                      key={j}
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${
                        isDark
                          ? "border-white/10 text-slate-300"
                          : "border-slate-200 text-slate-600"
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Bio (visible on hover) */}
                <p className={`text-xs leading-relaxed opacity-0 group-hover:opacity-100 transition-all duration-300 ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}>
                  {mentor.bio}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
