import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MessageCircle, ArrowRight, BadgeCheck } from "lucide-react";

const mentorsData = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    role: "AI Research Scientist",
    company: "Google",
    experience: "10+ Years",
    desc: "Expert in Machine Learning & Deep Learning systems with a focus on production-scale AI pipelines.",
  },
  {
    id: 2,
    name: "Rahul Sharma",
    role: "Senior React Engineer",
    company: "Microsoft",
    experience: "8+ Years",
    desc: "Specialist in React, Next.js & scalable UI systems serving millions of users globally.",
  },
  {
    id: 3,
    name: "Priya Verma",
    role: "Data Scientist",
    company: "Amazon",
    experience: "7+ Years",
    desc: "Works on AI models, analytics & prediction systems that power Amazon's recommendation engine.",
  },
  {
    id: 4,
    name: "Amit Kumar",
    role: "Full Stack Engineer",
    company: "Netflix",
    experience: "9+ Years",
    desc: "Builds high-performance web applications at scale, handling 200M+ concurrent streaming users.",
  },
];

const ReactMentors = () => {
  const [active, setActive] = useState(1);
  const navigate = useNavigate();

  const selectedMentor = mentorsData.find((m) => m.id === active);

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#020617] flex flex-col justify-center py-12 md:py-16">

      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-500/10 blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-500/10 blur-[120px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 w-full">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center px-5 py-2 rounded-full border border-cyan-500/20 bg-white/5 backdrop-blur-xl text-cyan-300 text-sm font-medium">
            👨‍🏫 Expert Instructors
          </div>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold text-white">
            Meet Our{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Mentors
            </span>
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">
            Learn from industry experts working at top companies worldwide
          </p>
        </div>

        {/* Layout */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* LEFT LIST */}
          <div className="space-y-3">
            {mentorsData.map((mentor) => (
              <motion.div
                key={mentor.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setActive(mentor.id)}
                className={`cursor-pointer p-4 rounded-xl border transition-all backdrop-blur-xl ${
                  active === mentor.id
                    ? "bg-white/10 border-cyan-400"
                    : "bg-white/5 border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-2">
                  <BadgeCheck
                    className={`w-4 h-4 flex-shrink-0 ${
                      active === mentor.id ? "text-cyan-400" : "text-slate-500"
                    }`}
                  />
                  <p className="text-white text-sm font-semibold leading-tight">
                    {mentor.name}
                  </p>
                </div>
                <p className="text-xs text-slate-400 ml-6 mt-0.5">{mentor.role}</p>
                <p className="text-xs text-slate-500 ml-6">@ {mentor.company}</p>
              </motion.div>
            ))}
          </div>

          {/* RIGHT DETAILS CARD */}
          <motion.div
            key={selectedMentor.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="md:col-span-2 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl relative overflow-hidden"
          >
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  {/* Avatar + Name */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {selectedMentor.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white leading-tight">
                        {selectedMentor.name}
                      </h3>
                      <p className="text-cyan-400 text-sm">
                        {selectedMentor.role} @ {selectedMentor.company}
                      </p>
                    </div>
                  </div>

                  <p className="text-slate-400 text-sm leading-relaxed">
                    {selectedMentor.desc}
                  </p>

                  {/* Experience Badge */}
                  <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                    <span className="text-xs text-slate-400">Experience:</span>
                    <span className="text-xs font-semibold text-cyan-400">
                      {selectedMentor.experience}
                    </span>
                  </div>
                </div>

                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="text-white w-4 h-4" />
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-white/10 my-5" />

              {/* Skills pills */}
              <div className="flex flex-wrap gap-2 mb-5">
                {["React", "Node.js", "System Design", "DSA", "Career Mentorship"].map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-slate-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/contact")}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold hover:scale-105 transition"
                >
                  Book Mentorship
                </button>
                <button
                  onClick={() => navigate("/ai-curriculum")}
                  className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm hover:bg-white/10 transition flex items-center gap-2"
                >
                  View Curriculum
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default ReactMentors;