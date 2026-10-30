import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  Building2,
  TrendingUp,
} from "lucide-react";

const placements = [
  { name: "Rahul", role: "AI Eng", company: "Google", package: "18 LPA" },
  { name: "Priya", role: "ML Eng", company: "Microsoft", package: "16 LPA" },
  { name: "Arjun", role: "Data Sci", company: "Amazon", package: "14 LPA" },
  { name: "Sneha", role: "AI Res", company: "Adobe", package: "15 LPA" },
  { name: "Vikram", role: "Gen AI", company: "Infosys", package: "12 LPA" },
  { name: "Neha", role: "ML Eng", company: "TCS", package: "10 LPA" },
];

export default function AiPlacements() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-[#030712] py-12">

      {/* Background */}
      <div className="absolute top-0 left-0 w-60 h-60 bg-cyan-500/10 blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-60 h-60 bg-purple-500/10 blur-[120px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-4">

        {/* Header (compact) */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">
            Student Placements
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Top AI careers at leading companies
          </p>
        </div>

        {/* Stats (compact cards) */}
        <div className="grid grid-cols-3 gap-2 mb-8">

  <div className="
    p-2.5 rounded-xl
    bg-white/5
    backdrop-blur-xl
    border border-white/10
    shadow-[0_8px_30px_rgba(0,0,0,0.2)]
    text-center
    hover:bg-white/10
    transition
  ">
    <Building2 className="text-cyan-400 mx-auto w-4 h-4" />
    <p className="text-base font-bold text-white mt-1">250+</p>
    <p className="text-[10px] text-slate-400">Placed</p>
  </div>

  <div className="
    p-2.5 rounded-xl
    bg-white/5
    backdrop-blur-xl
    border border-white/10
    shadow-[0_8px_30px_rgba(0,0,0,0.2)]
    text-center
    hover:bg-white/10
    transition
  ">
    <TrendingUp className="text-green-400 mx-auto w-4 h-4" />
    <p className="text-base font-bold text-white mt-1">92%</p>
    <p className="text-[10px] text-slate-400">Rate</p>
  </div>

  <div className="
    p-2.5 rounded-xl
    bg-white/5
    backdrop-blur-xl
    border border-white/10
    shadow-[0_8px_30px_rgba(0,0,0,0.2)]
    text-center
    hover:bg-white/10
    transition
  ">
    <Briefcase className="text-purple-400 mx-auto w-4 h-4" />
    <p className="text-base font-bold text-white mt-1">18L</p>
    <p className="text-[10px] text-slate-400">Top</p>
  </div>

</div>

        {/* Horizontal Scroll (compact cards) */}
        <div className="overflow-hidden">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="flex gap-3 w-max"
          >
            {[...placements, ...placements].map((s, i) => (
              <div
                key={i}
                className="
                  w-[200px]
                  flex-shrink-0
                  p-3
                  rounded-2xl
                  bg-white/5
                  border border-white/10
                  backdrop-blur-xl
                "
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  {s.name[0]}
                </div>

                {/* Name */}
                <p className="text-white text-sm font-semibold mt-2">
                  {s.name}
                </p>

                {/* Role */}
                <p className="text-cyan-400 text-xs">
                  {s.role}
                </p>

                {/* Company */}
                <p className="text-slate-400 text-xs">
                  {s.company}
                </p>

                {/* Package */}
                <span className="inline-block mt-2 text-[10px] px-2 py-1 rounded-full bg-green-500/10 text-green-400">
                  {s.package}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* CTA (compact) */}
        <div className="text-center mt-10">
          <h3 className="text-xl font-bold text-white">
            Start Your AI Career
          </h3>

          <div className="flex justify-center gap-3 mt-4">
            <button
              onClick={() => navigate("/contact")}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium hover:scale-105 transition"
            >
              Enroll
            </button>

            <button
              onClick={() => navigate("/ai-course")}
              className="px-5 py-2 rounded-xl border border-white/10 bg-white/5 text-white text-sm flex items-center gap-1 hover:bg-white/10 transition"
            >
              Course <ArrowRight size={14} />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}