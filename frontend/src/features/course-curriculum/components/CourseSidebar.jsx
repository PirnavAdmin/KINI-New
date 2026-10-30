import { useState } from "react";
import { motion } from "framer-motion";
import {
  Award, Infinity, Users, Code2, Briefcase, ClipboardCheck,
  Download, Heart, Share2, Shield, Star, Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const FEATURES = [
  { icon: Award, text: "Industry-recognized certificate" },
  { icon: Infinity, text: "Lifetime access" },
  { icon: Users, text: "1-on-1 mentorship sessions" },
  { icon: Code2, text: "25+ real-world projects" },
  { icon: Briefcase, text: "Placement assistance" },
  { icon: ClipboardCheck, text: "Coding challenges & assessments" },
  { icon: Download, text: "Downloadable resources" },
];

const CourseSidebar = ({ curriculum, onEnroll }) => {
  const navigate = useNavigate();
  const [wishlisted, setWishlisted] = useState(false);
  const savings = curriculum.originalPrice - curriculum.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="lg:sticky lg:top-28 space-y-4"
    >
      {/* Pricing Card */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xl shadow-[#085FA7]/5 overflow-hidden">
        {/* Preview image */}
        <div className="h-40 bg-gradient-to-br from-[#085FA7]/10 to-[#5CA347]/10 relative overflow-hidden">
          <img
            src={curriculum.image}
            alt={curriculum.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          {curriculum.rating > 0 && <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur rounded-lg px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
            <Star className="w-3 h-3 fill-[#F0765B] text-[#F0765B]" />
            {curriculum.rating > 0 && <span className="text-xs font-bold text-[#0F172A]">{curriculum.rating}</span>}
            {curriculum.totalStudents != null && <span className="text-[10px] text-slate-500">({Number(curriculum.totalStudents).toLocaleString()})</span>}
          </div>}
        </div>

        <div className="p-5">
          {/* Price */}
          <div className="flex items-end gap-2 mb-1">
            <span className="text-3xl font-extrabold text-[#0F172A]">₹{curriculum.price.toLocaleString()}</span>
            <span className="text-sm text-slate-400 line-through mb-1">₹{curriculum.originalPrice.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-gradient-to-r from-[#085FA7] to-[#5CA347] text-white text-[10px] font-bold px-2 py-0.5 rounded">
              {curriculum.discountPercent}% OFF
            </div>
            <span className="text-[11px] font-medium text-[#5CA347]">Save ₹{savings.toLocaleString()}</span>
          </div>

          {/* CTA Buttons */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={onEnroll}
            className="w-full py-3.5 bg-gradient-to-r from-[#0568B2] to-[#258A43] text-white text-sm font-bold rounded-xl shadow-lg shadow-[#085FA7]/25 hover:shadow-xl hover:shadow-[#085FA7]/35 transition-all"
          >
            Enroll Now
          </motion.button>

          {/* Features */}
          <div className="space-y-2.5 mb-4 pt-4 border-t border-[#E5E7EB]">
            {FEATURES.map((feat, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <feat.icon className="w-3.5 h-3.5 text-[#085FA7] shrink-0" />
                <span className="text-[11px] text-slate-600">{feat.text}</span>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-3 border-t border-[#E5E7EB]">
            <button
              onClick={() => setWishlisted(!wishlisted)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium rounded-xl border transition-all ${
                wishlisted
                  ? "bg-[#F0765B]/10 text-[#F0765B] border-[#F0765B]/30"
                  : "border-[#E5E7EB] text-slate-500 hover:border-[#F0765B]/30 hover:text-[#F0765B]"
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${wishlisted ? "fill-[#F0765B]" : ""}`} />
              {wishlisted ? "Saved" : "Wishlist"}
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium rounded-xl border border-[#E5E7EB] text-slate-500 hover:border-[#085FA7]/30 hover:text-[#085FA7] transition-all">
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* This course includes */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-sm">
        <h3 className="text-xs font-bold text-[#0F172A] mb-2.5">This course includes:</h3>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Duration</span>
            <span className="font-semibold text-[#0F172A]">{curriculum.duration}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Lessons</span>
            <span className="font-semibold text-[#0F172A]">{curriculum.totalLessons}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Projects</span>
            <span className="font-semibold text-[#0F172A]">{curriculum.totalProjects}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Language</span>
            <span className="font-semibold text-[#0F172A]">{curriculum.language}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Level</span>
            <span className="font-semibold text-[#0F172A]">{curriculum.level}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Certificate</span>
            <span className="font-semibold text-[#5CA347] flex items-center gap-1">
              <Shield className="w-3 h-3" /> Yes
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseSidebar;
