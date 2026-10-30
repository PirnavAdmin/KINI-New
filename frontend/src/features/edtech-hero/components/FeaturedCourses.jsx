import { motion } from "framer-motion";
import { Clock, Users, Briefcase, ArrowRight, Sparkles } from "lucide-react";

const COURSES = [
  {
    title: "MERN & Next.js Engineering",
    desc: "Build production-grade web applications — from React to Node.js APIs and AWS deployment.",
    badge: "Hot",
    duration: "22 weeks",
    sessions: "3 sessions/week",
    salary: "₹8–22 LPA",
    gradient: "from-[#e56926] to-[#108299]",
    color: "#e56926",
    outcomes: ["3 live deployed projects", "Median 45 days to placement", "Portfolio ready"],
  },
  {
    title: "Full Stack .NET — C# to Enterprise",
    desc: "The definitive program for the Microsoft stack. Taught by a working .NET architect with 15+ years.",
    badge: "Hot",
    duration: "20 weeks",
    sessions: "4 sessions/week",
    salary: "₹10–28 LPA",
    gradient: "from-[#7C3AED] to-[#4F46E5]",
    color: "#7C3AED",
    outcomes: ["Azure-deployed capstone", "Median 35 days to placement", "Enterprise patterns"],
  },
  {
    title: "AI & Generative AI Engineering",
    desc: "Build production-grade AI systems using LangChain, RAG pipelines, and vector databases.",
    badge: "New",
    duration: "24 weeks",
    sessions: "3 sessions/week",
    salary: "₹18–40 LPA",
    gradient: "from-[#DB2777] to-[#7C3AED]",
    color: "#DB2777",
    outcomes: ["RAG chatbot project", "Fine-tuned LLM deployment", "Median 30 days to placement"],
  },
  {
    title: "AWS, Azure, Docker & Kubernetes",
    desc: "Cloud engineers are the second-highest paid roles. Build from Linux to full EKS clusters.",
    badge: "In Demand",
    duration: "18 weeks",
    sessions: "3 sessions/week",
    salary: "₹12–30 LPA",
    gradient: "from-[#F97316] to-[#EA580C]",
    color: "#F97316",
    outcomes: ["Production AWS infra project", "GitOps pipelines", "Median 40 days to placement"],
  },
  {
    title: "Data Science & Machine Learning",
    desc: "From Python and statistics through to building and deploying ML models on real business problems.",
    badge: "In Demand",
    duration: "20 weeks",
    sessions: "3 sessions/week",
    salary: "₹8–24 LPA",
    gradient: "from-[#10B981] to-[#059669]",
    color: "#10B981",
    outcomes: ["3 end-to-end ML pipelines", "Real business datasets", "Median 50 days to placement"],
  },
  {
    title: "Engineering Leadership",
    desc: "For engineers with 3+ years targeting Tech Lead, Staff Engineer, or EM roles.",
    badge: "In Demand",
    duration: "12 weeks",
    sessions: "2 sessions/week",
    salary: "₹18–50+ LPA",
    gradient: "from-[#6B7280] to-[#4B5563]",
    color: "#6B7280",
    outcomes: ["System design capstone", "Panel review", "Promotion in 3–6 months"],
  },
];

export default function FeaturedCourses() {
  return (
    <section
      className="relative py-20 sm:py-24 lg:py-28 overflow-hidden"
      style={{ background: "#071226" }}
    >
      {/* Top border glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(99,102,241,.3), transparent)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          data-aos="fade-up"
          data-aos-duration="800"
          className="text-center mb-14"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-4"
            style={{
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.08)",
              color: "rgba(255,255,255,.55)",
            }}
          >
            <Sparkles size={14} />
            Explore Programs
          </div>
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-bold"
            style={{ color: "rgba(255,255,255,.9)" }}
          >
            Career-First{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(135deg, #60A5FA, #A855F7)",
              }}
            >
              Learning Programs
            </span>
          </h2>
          <p
            className="text-sm mt-3 max-w-xl mx-auto"
            style={{ color: "rgba(255,255,255,.45)" }}
          >
            Six career tracks designed to match your goals, experience, and ambitions.
          </p>
        </motion.div>

        {/* Courses grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {COURSES.map((course, i) => (
            <motion.div
              key={course.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              data-aos="fade-up"
              data-aos-delay={i * 100}
              data-aos-duration="700"
              className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1"
              style={{
                background: "rgba(255,255,255,.03)",
                border: "1px solid rgba(255,255,255,.06)",
                backdropFilter: "blur(20px)",
              }}
            >
              {/* Badge */}
              <div className="absolute top-4 right-4 z-10" data-aos="flip-left" data-aos-delay={i * 100 + 100} data-aos-duration="500">
                <span
                  className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                  style={{
                    background: "rgba(255,255,255,.08)",
                    color: "rgba(255,255,255,.7)",
                    border: "1px solid rgba(255,255,255,.1)",
                  }}
                >
                  {course.badge}
                </span>
              </div>

              {/* Color accent bar */}
              <div
                className="absolute top-0 left-0 right-0 h-0.5"
                style={{ background: `linear-gradient(90deg, ${course.color}, transparent)` }}
              />

              <div className="p-6">
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${course.color}15` }}
                >
                  <Briefcase size={18} style={{ color: course.color }} />
                </div>

                {/* Title */}
                <h3
                  className="text-base font-bold mb-2"
                  style={{ color: "rgba(255,255,255,.9)" }}
                >
                  {course.title}
                </h3>

                {/* Description */}
                <p
                  className="text-xs leading-relaxed mb-4"
                  style={{ color: "rgba(255,255,255,.5)" }}
                >
                  {course.desc}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-3 mb-4 text-[11px]" style={{ color: "rgba(255,255,255,.45)" }}>
                  <span className="flex items-center gap-1"><Clock size={12} /> {course.duration}</span>
                  <span className="w-1 h-1 rounded-full" style={{ background: "rgba(255,255,255,.15)" }} />
                  <span className="flex items-center gap-1"><Users size={12} /> {course.sessions}</span>
                </div>

                {/* Salary */}
                <div
                  className="text-sm font-bold mb-4"
                  style={{ color: course.color }}
                >
                  {course.salary}
                </div>

                {/* Outcomes */}
                <div className="space-y-1.5 mb-5">
                  {course.outcomes.map((o, j) => (
                    <div
                      key={j}
                      className="flex items-center gap-2 text-[11px]"
                      style={{ color: "rgba(255,255,255,.5)" }}
                    >
                      <span style={{ color: course.color }}>◆</span>
                      {o}
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  data-aos="fade-left"
                  data-aos-delay={i * 100 + 200}
                  data-aos-duration="500"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group/btn"
                  style={{
                    background: `${course.color}12`,
                    border: `1px solid ${course.color}20`,
                    color: course.color,
                  }}
                >
                  View Program
                  <ArrowRight size={14} className="transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                </button>
              </div>

              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: `radial-gradient(400px circle at center, ${course.color}08, transparent 60%)`,
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
