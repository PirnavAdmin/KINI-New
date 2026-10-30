import React, { useRef } from "react";
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
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43d",
    icon: <FaMicrosoft />,
  },
  {
    name: "Priya Reddy",
    role: "Lead Backend Engineer",
    company: "Amazon",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    icon: <FaAmazon />,
  },
  {
    name: "Arjun Kumar",
    role: "AI Engineer",
    company: "Google",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
    icon: <FaGoogle />,
  },
  {
    name: "Sneha Patel",
    role: "Data Scientist",
    company: "Microsoft",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    icon: <FaMicrosoft />,
  },
  {
    name: "Vikram Singh",
    role: "Python Tech Lead",
    company: "Amazon",
    image:
      "https://images.unsplash.com/photo-1504593811423-6dd665756598",
    icon: <FaAmazon />,
  },
  {
    name: "Neha Gupta",
    role: "ML Engineer",
    company: "Google",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
    icon: <FaGoogle />,
  },
];

const MentorCard = ({ mentor, height }) => {
  const cardRef = useRef();

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateX = -(y / rect.height - 0.5) * 5;
    const rotateY = (x / rect.width - 0.5) * 5;

    card.style.transform = `
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale(1.02)
    `;

    card.style.setProperty("--x", `${x}px`);
    card.style.setProperty("--y", `${y}px`);
  };

  const resetTilt = () => {
    if (!cardRef.current) return;

    cardRef.current.style.transform =
      "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
      className={`
        group
        relative
        ${height}
        rounded-[24px]
        overflow-hidden
        border border-white/5
        bg-white/[0.03]
        backdrop-blur-xl
        shadow-[0_10px_30px_rgba(0,0,0,0.25)]
        transition-all duration-300
      `}
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      {/* Image */}
      <img
        src={mentor.image}
        alt={mentor.name}
        className="
          w-full
          h-full
          object-cover
          transition-all
          duration-700
          group-hover:scale-110
        "
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

      {/* Spotlight */}
      <div
        className="
          absolute
          inset-0
          opacity-0
          group-hover:opacity-100
          transition
          duration-500
        "
        style={{
          background:
            "radial-gradient(circle at var(--x) var(--y), rgba(34,211,238,.20), transparent 45%)",
        }}
      />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        <div
          className="
            inline-flex
            items-center
            gap-2
            px-3
            py-1
            rounded-full
            bg-black/30
            backdrop-blur-xl
            border border-white/10
            text-white
            text-xs
            mb-3
          "
        >
          {mentor.icon}
          {mentor.company}
        </div>

        <h3 className="text-lg font-bold text-white">
          {mentor.name}
        </h3>

        <p className="text-sm text-slate-300 mt-1">
          {mentor.role}
        </p>

        <div className="flex items-center justify-between mt-3">
          <span className="text-cyan-400 text-xs font-medium">
            Industry Expert
          </span>

          <button
            className="
              w-9 h-9
              rounded-xl
              bg-white
              text-black
              flex
              items-center
              justify-center
              hover:scale-110
              transition
            "
          >
            <FaLinkedin size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

const MentorRow = ({ height, reverse }) => {
  return (
    <Swiper
      modules={[Autoplay]}
      spaceBetween={20}
      slidesPerView={1.4}
      loop={true}
      speed={5000}
      autoplay={{
        delay: 1,
        disableOnInteraction: false,
        reverseDirection: reverse,
      }}
      breakpoints={{
        640: {
          slidesPerView: 2,
        },
        768: {
          slidesPerView: 2.5,
        },
        1024: {
          slidesPerView: 4,
        },
        1400: {
          slidesPerView: 5,
        },
      }}
    >
      {mentors.map((mentor, index) => (
        <SwiperSlide key={index}>
          <MentorCard mentor={mentor} height={height} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default function PythonMentors() {
  return (
    <section className="relative py-24 overflow-hidden bg-[#030712]">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-cyan-500/10 blur-[150px]" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/10 blur-[150px]" />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div
            className="
              inline-flex
              items-center
              gap-2
              px-5
              py-2
              rounded-full
              bg-white/5
              border
              border-cyan-500/20
              backdrop-blur-xl
              text-cyan-300
              text-sm
              font-medium
            "
          >
            🚀 Learn From Industry Leaders
          </div>

          <h2 className="mt-6 text-4xl md:text-6xl font-bold text-white">
            Meet Your
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Expert Mentors
            </span>
          </h2>

          <p className="mt-4 text-slate-400 max-w-2xl mx-auto text-base md:text-lg">
            Learn directly from engineers and tech leaders working at
            Microsoft, Amazon, Google, and other top companies.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-10 mt-10">
            <div>
              <h3 className="text-3xl font-bold text-white">50+</h3>
              <p className="text-slate-500 text-sm">Mentors</p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-white">10+</h3>
              <p className="text-slate-500 text-sm">Top Companies</p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-white">15+</h3>
              <p className="text-slate-500 text-sm">Years Experience</p>
            </div>
          </div>
        </motion.div>

        {/* Mentor Rows */}
        <div className="space-y-6">
          <MentorRow height="h-[210px]" reverse={false} />
          <MentorRow height="h-[210px]" reverse={true} />
        </div>
      </div>
    </section>
  );
}