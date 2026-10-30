import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  Bot,
  Cpu,
  Database,
  ArrowRight,
  Sparkles,
} from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";

const courses = [
  {
    title: "Artificial Intelligence",
    description: "AI concepts & intelligent systems.",
    icon: Brain,
    color: "from-cyan-500 to-blue-600",
  },
  {
    title: "Machine Learning",
    description: "Regression, Classification & Deployment.",
    icon: Cpu,
    color: "from-purple-500 to-pink-600",
  },
  {
    title: "Deep Learning",
    description: "CNNs, RNNs & Neural Networks.",
    icon: Bot,
    color: "from-orange-500 to-red-600",
  },
  {
    title: "Data Science",
    description: "Python, Pandas & Analytics.",
    icon: Database,
    color: "from-emerald-500 to-green-600",
  },
];

const AiCourse = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-16 bg-[#020617] overflow-hidden">

      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-500/10 blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-500/10 blur-[120px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-10">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/20 bg-white/5 backdrop-blur-xl text-cyan-300 text-xs">
            <Sparkles size={14} />
            AI Learning Path
          </div>

          <h2 className="mt-4 text-4xl md:text-5xl font-bold text-white">
            Become an  AI Engineer
            </h2>

          <p className="max-w-xl mx-auto mt-3 text-slate-400 text-sm">
            Learn AI, ML, Deep Learning & Data Science with industry projects.
          </p>
        </div>

        {/* Slider */}
        <Swiper
          modules={[Autoplay]}
          loop
          speed={5000}
          autoplay={{
            delay: 1,
            disableOnInteraction: false,
          }}
          spaceBetween={20}
          slidesPerView={1.2}
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
            1280: {
              slidesPerView: 4,
            },
          }}
        >
          {courses.map((course, index) => {
            const Icon = course.icon;

            return (
              <SwiperSlide key={index}>
                <motion.div
                  whileHover={{
                    y: -6,
                    scale: 1.02,
                  }}
                  className="
                    group
                    relative
                    h-[260px]
                    rounded-2xl
                    border border-white/10
                    bg-white/[0.04]
                    backdrop-blur-2xl
                    p-5
                    overflow-hidden
                  "
                >
                  {/* Hover Glow */}
                  <div
                    className={`
                      absolute inset-0 opacity-0
                      group-hover:opacity-100
                      transition duration-500
                      bg-gradient-to-br ${course.color}/10
                    `}
                  />

                  <div className="relative z-10">

                    <div
                      className={`
                        w-12 h-12 rounded-xl
                        bg-gradient-to-r ${course.color}
                        flex items-center justify-center
                      `}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    <h3 className="mt-4 text-lg font-semibold text-white">
                      {course.title}
                    </h3>

                    <p className="mt-2 text-sm text-slate-400">
                      {course.description}
                    </p>

                    <button
                      onClick={() => navigate("/ai-curriculum")}
                      className="
                        mt-5
                        flex items-center gap-2
                        text-cyan-400
                        text-sm
                        font-medium
                        hover:text-cyan-300
                      "
                    >
                      View
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </motion.div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* CTA */}
        <div className="text-center mt-10">

          <button
            onClick={() => navigate("/enrollment")}
            className="
              px-6 py-3
              rounded-xl
              text-sm
              font-semibold
              text-white
              bg-gradient-to-r
              from-cyan-500
              via-blue-500
              to-purple-600
              hover:scale-105
              transition-all
            "
          >
            Enroll Now →
          </button>

        </div>

      </div>
    </section>
  );
};

export default AiCourse;