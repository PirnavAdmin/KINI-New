import React from "react";
import { FaPlay, FaStar, FaFlask, FaMicrophone } from "react-icons/fa";

const CourseCard = ({
  title,
  category,
  icon,
  sessions,
  videos,
  labs,
  rating,
  color,
}) => {
  return (
    <div className="group relative rounded-[28px] border border-white/10 bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-6 shadow-xl transition-all duration-500 hover:scale-[1.05] hover:shadow-blue-500/20">

      {/* Category Badge */}
      <div className="absolute top-5 right-5">
        <span className="px-4 py-1 text-xs font-semibold rounded-full bg-[#0f55f7] text-white">
          {category}
        </span>
      </div>

      {/* Icon */}
      <div
        className={`w-14 h-14 flex items-center justify-center rounded-xl text-white text-2xl bg-gradient-to-br ${color}`}
      >
        {icon}
      </div>

      {/* Title */}
      <h3 className="mt-6 text-lg font-bold text-white leading-snug">
        {title}
      </h3>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mt-6 text-slate-300 text-sm">

        <div className="flex items-center gap-2">
          <FaMicrophone />
          {sessions} Sessions
        </div>

        <div className="flex items-center gap-2">
          <FaPlay />
          {videos} Videos
        </div>

        <div className="flex items-center gap-2">
          <FaFlask />
          {labs} Labs
        </div>

        <div className="flex items-center gap-2 text-yellow-400">
          <FaStar />
          {rating}
        </div>
      </div>

      {/* CTA */}
      <button className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] text-white font-semibold hover:scale-105 transition">
        <FaPlay />
        Explore Now
      </button>
    </div>
  );
};

export default CourseCard;

