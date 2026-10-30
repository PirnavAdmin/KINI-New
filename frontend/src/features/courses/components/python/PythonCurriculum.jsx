import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Code2,
  Database,
  Brain,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const curriculum = [
  {
    week: "Week 1-2",
    topic: "Python Fundamentals",
    icon: BookOpen,
    color: "from-cyan-500 to-blue-500",
    skills: ["Python Basics", "OOP", "Functions"],
    projects: "3 Mini Projects",
  },
  {
    week: "Week 3-5",
    topic: "Data Structures & Algorithms",
    icon: Code2,
    color: "from-purple-500 to-pink-500",
    skills: ["Arrays", "Linked Lists", "Problem Solving"],
    projects: "5 Coding Challenges",
  },
  {
    week: "Week 6-8",
    topic: "Backend Development",
    icon: Database,
    color: "from-emerald-500 to-green-500",
    skills: ["Django", "REST APIs", "SQL"],
    projects: "2 Industry Projects",
  },
  {
    week: "Week 9-12",
    topic: "AI & Machine Learning",
    icon: Brain,
    color: "from-orange-500 to-red-500",
    skills: ["ML Models", "Data Analysis", "AI Apps"],
    projects: "Capstone Project",
  },
];

export default function CurriculumSection() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-[#030712] py-24">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[140px]" />

        <div
          className="
            absolute inset-0
            bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),
            linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)]
            bg-[size:60px_60px]
          "
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <span
            className="
              inline-flex items-center gap-2
              px-5 py-2 rounded-full
              border border-cyan-500/20
              bg-white/5 backdrop-blur-xl
              text-cyan-300 text-sm font-medium
            "
          >
            🚀 Career-Focused Learning Path
          </span>

          <h2 className="mt-6 text-4xl md:text-6xl font-bold text-white">
            Curriculum
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Roadmap
            </span>
          </h2>

          <p className="max-w-2xl mx-auto mt-5 text-slate-400 text-lg">
            A structured journey from Python fundamentals to AI and
            Machine Learning with real-world projects and industry
            mentorship.
          </p>
        </div>

        {/* Curriculum Cards */}
        <div className="max-w-4xl mx-auto space-y-8">
          {curriculum.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                {index !== curriculum.length - 1 && (
                  <div
                    className="
                      absolute left-8 top-20
                      h-[100px] w-[2px]
                      bg-gradient-to-b
                      from-cyan-500
                      via-blue-500
                      to-purple-500
                    "
                  />
                )}

                <div
                  className="
                    group relative overflow-hidden
                    rounded-[30px]
                    border border-white/10
                    bg-white/[0.04]
                    backdrop-blur-2xl
                    p-6
                    hover:border-cyan-400/30
                    hover:-translate-y-1
                    transition-all duration-500
                    shadow-[0_20px_60px_rgba(0,0,0,0.25)]
                  "
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500">
                    <div className="absolute -top-20 -right-20 w-52 h-52 bg-cyan-500/10 rounded-full blur-3xl" />
                  </div>

                  <div className="relative flex flex-col md:flex-row gap-6">
                    <div
                      className={`
                        flex-shrink-0
                        w-16 h-16
                        rounded-2xl
                        bg-gradient-to-r ${item.color}
                        flex items-center justify-center
                        shadow-xl
                      `}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-semibold">
                          {item.week}
                        </span>

                        <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-slate-300 text-xs">
                          {item.projects}
                        </span>
                      </div>

                      <h3 className="mt-4 text-2xl font-bold text-white">
                        {item.topic}
                      </h3>

                      <p className="mt-3 text-slate-400 leading-relaxed">
                        Learn through guided projects, coding exercises,
                        assignments and practical implementation focused on
                        industry requirements.
                      </p>

                      <div className="flex flex-wrap gap-3 mt-5">
                        {item.skills.map((skill, skillIndex) => (
                          <div
                            key={skillIndex}
                            className="
                              flex items-center gap-2
                              px-3 py-2
                              rounded-xl
                              bg-white/5
                              border border-white/10
                              text-slate-300 text-sm
                            "
                          >
                            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                            {skill}
                          </div>
                        ))}
                      </div>

                      <div className="mt-6">
                        <div className="flex justify-between text-xs text-slate-500 mb-2">
                          <span>Course Progress</span>
                          <span>{25 * (index + 1)}%</span>
                        </div>

                        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${item.color}`}
                            style={{
                              width: `${25 * (index + 1)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="hidden lg:flex items-center justify-center text-6xl font-black text-white/5">
                      0{index + 1}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-20">
          <button
            onClick={() => navigate("/syllabus")}
            className="
              group
              inline-flex
              items-center
              gap-3
              px-8
              py-4
              rounded-2xl
              font-semibold
              text-white
              bg-gradient-to-r
              from-cyan-500
              via-blue-500
              to-purple-600
              shadow-[0_20px_60px_rgba(59,130,246,0.35)]
              hover:scale-105
              transition-all
              duration-300
            "
          >
            Download Full Syllabus

            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}