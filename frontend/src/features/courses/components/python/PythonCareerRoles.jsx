import React from "react";
import { motion } from "framer-motion";
import {
  FaLinkedin,
  FaMicrosoft,
  FaAmazon,
  FaGoogle,
} from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";

const mentors = [
  {
    name: "Rahul Sharma",
    role: "Senior Python Architect",
    company: "Microsoft",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43d?w=800",
    icon: <FaMicrosoft />,
  },
  {
    name: "Priya Reddy",
    role: "Lead Backend Engineer",
    company: "Amazon",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800",
    icon: <FaAmazon />,
  },
  {
    name: "Arjun Kumar",
    role: "AI Engineer",
    company: "Google",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800",
    icon: <FaGoogle />,
  },
  {
    name: "Sneha Patel",
    role: "Data Scientist",
    company: "Microsoft",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800",
    icon: <FaMicrosoft />,
  },
  {
    name: "Vikram Singh",
    role: "Python Tech Lead",
    company: "Amazon",
    image:
      "https://images.unsplash.com/photo-1504593811423-6dd665756598?w=800",
    icon: <FaAmazon />,
  },
  {
    name: "Neha Gupta",
    role: "ML Engineer",
    company: "Google",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800",
    icon: <FaGoogle />,
  },
];

function MentorCard({ mentor }) {
  return (
    <motion.div
      whileHover={{
        y: -10,
      }}
      transition={{ duration: 0.3 }}
      className="
        group
        relative
        h-[420px]
        overflow-hidden
        rounded-[32px]
        border
        border-white/10
        bg-white/[0.04]
        backdrop-blur-2xl
        shadow-[0_25px_80px_rgba(0,0,0,0.45)]
      "
    >
      {/* Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500">
        <div className="absolute -top-24 -right-24 w-56 h-56 bg-cyan-500/20 rounded-full blur-3xl" />
      </div>

      {/* Cover Image */}
      <div className="relative h-[240px] overflow-hidden">
        <img
          src={mentor.image}
          alt={mentor.name}
          className="
            w-full
            h-full
            object-cover
            transition-transform
            duration-700
            group-hover:scale-110
          "
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative px-6 pb-6">

        {/* Avatar */}
        <div className="-mt-12 relative z-10">
          <img
            src={mentor.image}
            alt={mentor.name}
            className="
              w-24
              h-24
              rounded-full
              object-cover
              border-4
              border-slate-900
              shadow-xl
            "
          />
        </div>

        {/* Company Badge */}
        <div
          className="
            inline-flex
            items-center
            gap-2
            px-4
            py-2
            rounded-full
            bg-white/5
            border
            border-white/10
            text-cyan-300
            text-sm
            mt-4
          "
        >
          {mentor.icon}
          {mentor.company}
        </div>

        <h3 className="text-2xl font-bold text-white mt-4">
          {mentor.name}
        </h3>

        <p className="text-slate-400 mt-2">
          {mentor.role}
        </p>

        <div className="flex items-center justify-between mt-6">
          <span className="text-sm text-cyan-400">
            Industry Mentor
          </span>

          <button
            className="
              w-11
              h-11
              rounded-xl
              bg-gradient-to-r
              from-cyan-500
              to-blue-500
              flex
              items-center
              justify-center
              text-white
              hover:scale-110
              transition
            "
          >
            <FaLinkedin />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function PythonMentors() {
  return (
    <section className="relative py-32 overflow-hidden bg-[#030712]">

      {/* Grid Background */}
      <div
        className="
          absolute inset-0
          bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),
          linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)]
          bg-[size:60px_60px]
        "
      />

      {/* Glow Effects */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[180px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[180px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-20">

          <div
            className="
              inline-flex
              items-center
              gap-2
              px-5
              py-2
              rounded-full
              border
              border-cyan-500/20
              bg-white/5
              backdrop-blur-xl
              text-cyan-300
              text-sm
              font-medium
            "
          >
            🚀 Learn From Industry Leaders
          </div>

          <h2 className="mt-6 text-5xl md:text-7xl font-bold text-white">
            Meet Your
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Expert Mentors
            </span>
          </h2>

          <p className="max-w-3xl mx-auto mt-6 text-lg text-slate-400">
            Learn directly from engineers and architects working at
            top global technology companies.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">

          {[
            { value: "50+", label: "Mentors" },
            { value: "10+", label: "Top Companies" },
            { value: "15+", label: "Years Experience" },
            { value: "2200+", label: "Students Guided" },
          ].map((item, i) => (
            <div
              key={i}
              className="
                rounded-3xl
                border
                border-white/10
                bg-white/[0.04]
                backdrop-blur-xl
                p-6
                text-center
              "
            >
              <h3 className="text-4xl font-bold text-white">
                {item.value}
              </h3>

              <p className="text-slate-400 mt-2">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        {/* Slider */}
        <Swiper
          modules={[Autoplay]}
          loop={true}
          speed={5000}
          autoplay={{
            delay: 1,
            disableOnInteraction: false,
          }}
          spaceBetween={24}
          breakpoints={{
            320: {
              slidesPerView: 1.1,
            },
            640: {
              slidesPerView: 1.5,
            },
            768: {
              slidesPerView: 2.2,
            },
            1024: {
              slidesPerView: 3,
            },
            1400: {
              slidesPerView: 4,
            },
          }}
        >
          {mentors.map((mentor, index) => (
            <SwiperSlide key={index}>
              <MentorCard mentor={mentor} />
            </SwiperSlide>
          ))}
        </Swiper>

      </div>
    </section>
  );
}