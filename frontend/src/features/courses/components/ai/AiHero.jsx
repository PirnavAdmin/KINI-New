import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  PlayCircle,
  Sparkles,
  BrainCircuit,
  Bot,
} from "lucide-react";

const AiHero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-[#020617]">

      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-500/10 blur-[140px]" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-500/10 blur-[140px]" />
      <div className="absolute left-1/2 top-1/2 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2 bg-blue-500/5 blur-[180px]" />

      <div className="max-w-7xl mx-auto px-6 py-10 relative z-10 w-full">

        <div className="grid lg:grid-cols-2 gap-10 items-center">

          {/* LEFT CONTENT */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >

            {/* Badge */}
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
                bg-white/5
                backdrop-blur-xl
                text-cyan-300
                text-sm
              "
            >
              <Sparkles size={15} />
              Future of Artificial Intelligence
            </div>

            {/* Heading */}
            <h1 className="mt-5 text-4xl md:text-5xl font-black leading-tight text-white">
              Join the Next
              <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                Generation of AI Engineers
              </span>
            </h1>

            {/* Description */}
            <p className="mt-4 text-slate-400 text-base max-w-lg leading-relaxed">
              Master LLMs, Generative AI, Machine Learning, Deep Learning,
              MLOps and build production-ready AI applications with expert
              mentorship.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3 mt-8">

              <button
                onClick={() => navigate("/enrollment")}
                className="
                  px-5
                  py-3
                  rounded-xl
                  font-semibold
                  text-white
                  bg-gradient-to-r
                  from-cyan-500
                  via-blue-500
                  to-purple-600
                  hover:scale-105
                  transition-all
                  shadow-[0_15px_40px_rgba(59,130,246,0.35)]
                "
              >
                Enroll Now
              </button>

              <button
                onClick={() => navigate("/ai-curriculum")}
                className="
                  px-5
                  py-3
                  rounded-xl
                  border
                  border-white/10
                  bg-white/5
                  backdrop-blur-xl
                  text-white
                  flex
                  items-center
                  gap-2
                  hover:border-cyan-400/30
                  hover:bg-white/10
                  transition-all
                "
              >
                <PlayCircle size={18} />
                Curriculum
              </button>

            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8 max-w-md">

              <div>
                <h3 className="text-2xl font-bold text-cyan-400">
                  5K+
                </h3>
                <p className="text-slate-500 text-sm">
                  Students
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-purple-400">
                  95%
                </h3>
                <p className="text-slate-500 text-sm">
                  Placement
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-blue-400">
                  ₹12LPA
                </h3>
                <p className="text-slate-500 text-sm">
                  Avg Package
                </p>
              </div>

            </div>

          </motion.div>

          {/* RIGHT AI CARD */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [-10, 10, -10],
            }}
            transition={{
              opacity: { duration: 0.8 },
              scale: { duration: 0.8 },
              y: {
                repeat: Infinity,
                duration: 6,
              },
            }}
            className="flex justify-center"
          >

            <div className="relative">

              {/* Rotating Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="
                  absolute
                  inset-0
                  rounded-full
                  border
                  border-cyan-500/20
                  scale-110
                "
              />

              {/* Card */}
              <div
                className="
                  relative
                  w-[280px]
                  h-[330px]
                  rounded-[28px]
                  overflow-hidden
                  border
                  border-white/10
                  bg-white/[0.04]
                  backdrop-blur-3xl
                  shadow-[0_20px_60px_rgba(0,0,0,0.45)]
                "
              >

                {/* Floating Icon */}
                <motion.div
                  animate={{
                    y: [-6, 6, -6],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                  }}
                  className="
                    absolute
                    top-5
                    right-5
                    z-20
                    w-10
                    h-10
                    rounded-xl
                    bg-gradient-to-r
                    from-cyan-500
                    to-blue-600
                    flex
                    items-center
                    justify-center
                  "
                >
                  <BrainCircuit
                    size={18}
                    className="text-white"
                  />
                </motion.div>

                {/* Image */}
                <img
                  src="https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200"
                  alt="AI"
                  className="
                    w-full
                    h-full
                    object-cover
                  "
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />

                {/* Bottom Card */}
                <div className="absolute bottom-4 left-4 right-4">

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                      p-3
                      rounded-xl
                      bg-white/10
                      backdrop-blur-xl
                      border
                      border-white/10
                    "
                  >
                    <Bot
                      size={18}
                      className="text-cyan-400"
                    />

                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        AI Assistant
                      </h4>

                      <p className="text-[11px] text-slate-400">
                        Powered by GenAI
                      </p>
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </motion.div>

        </div>

        {/* Bottom CTA */}
        <div className="mt-10 flex justify-center">

          <button
            onClick={() => navigate("/ai-projects")}
            className="
              flex
              items-center
              gap-2
              text-cyan-400
              font-medium
              hover:text-cyan-300
              transition
            "
          >
            Explore AI Projects
            <ArrowRight size={18} />
          </button>

        </div>

      </div>
    </section>
  );
};

export default AiHero;