import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import {
  Brain,
  ArrowRight,
  Sparkles,
  Building,
} from "lucide-react";

import { FaLinkedin } from "react-icons/fa";

const mentors = [
  {
    name: "Dr. Sarah Johnson",
    role: "AI Research Scientist",
    company: "OpenAI",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800",
    expertise: "LLMs & GenAI",
    linkedin: "https://linkedin.com",
  },
 
  {
    name: "Priya Sharma",
    role: "Data Science Manager",
    company: "Microsoft",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800",
    expertise: "AI Products",
    linkedin: "https://linkedin.com",
  },
  {
    name: "David Wilson",
    role: "AI Architect",
    company: "Amazon",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800",
    expertise: "Cloud AI",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Ananya Reddy",
    role: "CV Engineer",
    company: "Meta",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800",
    expertise: "Computer Vision",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Rahul Kumar",
    role: "NLP Specialist",
    company: "NVIDIA",
    image:
      "https://images.unsplash.com/photo-1504593811423-6dd665756598?w=800",
    expertise: "Natural Language",
    linkedin: "https://linkedin.com",
  },
];

const AiMentores = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-16 bg-[#030712] overflow-hidden">

      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-cyan-500/10 blur-[140px]" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-purple-500/10 blur-[140px]" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div
            className="
              inline-flex
              items-center
              gap-2
              px-4
              py-2
              rounded-full
              border
              border-cyan-500/20
              bg-cyan-500/10
              text-cyan-300
              text-xs
              backdrop-blur-xl
            "
          >
            <Sparkles size={14} />
            Learn From Industry Experts
          </div>

          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-white">
            Guided by AI Experts from Top Tech Companies
            
          </h2>

          <p className="max-w-2xl mx-auto mt-3 text-slate-400 text-sm md:text-base">
           Meta,Google,Microsoft
          </p>
        </motion.div>

        {/* Small Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            ["50+", "Mentors"],
            ["15+", "Companies"],
            ["12+", "Years Exp"],
            ["100%", "Industry Ready"],
          ].map((item, index) => (
            <div
              key={index}
              className="
                p-4
                rounded-2xl
                border
                border-white/10
                bg-white/[0.04]
                backdrop-blur-xl
                text-center
              "
            >
              <h3 className="text-xl font-bold text-cyan-400">
                {item[0]}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {item[1]}
              </p>
            </div>
          ))}
        </div>

        {/* Scrollable Cards */}
        <div className="overflow-x-auto scrollbar-hide pb-4">
          <div className="flex gap-4 w-max">

            {mentors.map((mentor, index) => (
              <motion.div
                key={index}
                whileHover={{
                  y: -6,
                  scale: 1.02,
                }}
                className="
                  group
                  w-[260px]
                  flex-shrink-0
                  rounded-3xl
                  border
                  border-white/10
                  bg-white/[0.04]
                  backdrop-blur-2xl
                  overflow-hidden
                  hover:border-cyan-400/30
                  transition-all
                "
              >
                {/* Image */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={mentor.image}
                    alt={mentor.name}
                    className="
                      w-full
                      h-full
                      object-cover
                      group-hover:scale-110
                      transition
                      duration-700
                    "
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#030712] to-transparent" />

                  <div
                    className="
                      absolute
                      top-3
                      right-3
                      w-10
                      h-10
                      rounded-xl
                      bg-cyan-500/20
                      backdrop-blur-xl
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <Brain size={18} className="text-cyan-400" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">

                  <div
                    className="
                      inline-flex
                      items-center
                      gap-1
                      px-2
                      py-1
                      rounded-full
                      text-[10px]
                      bg-cyan-500/10
                      border
                      border-cyan-500/20
                      text-cyan-300
                    "
                  >
                    <Building size={10} />
                    {mentor.company}
                  </div>

                  <h3 className="mt-3 text-lg font-bold text-white">
                    {mentor.name}
                  </h3>

                  <p className="text-sm text-slate-300">
                    {mentor.role}
                  </p>

                  <p className="text-xs text-cyan-400 mt-2">
                    {mentor.expertise}
                  </p>

                  {/* Buttons */}
                  <div className="flex gap-2 mt-4">

                    <button
                      onClick={() =>
                        window.open(
                          mentor.linkedin,
                          "_blank"
                        )
                      }
                      className="
                        flex-1
                        py-2
                        rounded-xl
                        border
                        border-white/10
                        bg-white/5
                        flex
                        items-center
                        justify-center
                        hover:bg-white/10
                        transition
                      "
                    >
                      <FaLinkedin size={14} />
                    </button>

                    <button
                      onClick={() => navigate("/contact")}
                      className="
                        flex-1
                        py-2
                        rounded-xl
                        bg-gradient-to-r
                        from-cyan-500
                        to-blue-600
                        text-white
                        text-sm
                        font-medium
                        flex
                        items-center
                        justify-center
                        gap-1
                        hover:scale-105
                        transition
                      "
                    >
                      Connect
                      <ArrowRight size={14} />
                    </button>

                  </div>

                </div>
              </motion.div>
            ))}

          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <button
            onClick={() => navigate("/contact")}
            className="
              px-6
              py-3
              rounded-2xl
              bg-gradient-to-r
              from-cyan-500
              via-blue-500
              to-purple-600
              text-white
              font-semibold
              shadow-[0_10px_40px_rgba(59,130,246,0.35)]
              hover:scale-105
              transition-all
            "
          >
            Book Mentor Session →
          </button>
        </div>

      </div>
    </section>
  );
};

export default AiMentores;