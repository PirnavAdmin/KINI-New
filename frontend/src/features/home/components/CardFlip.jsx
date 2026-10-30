import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaCheck, FaArrowRight } from "react-icons/fa";

export default function CardFlip({
  title = "",
  subtitle = "",
  description = "",
  features = [],
  icon: Icon,
  navigateTo = "/ai-engineering-immersive",
}) {
  const [flipped, setFlipped] = useState(false);
  const navigate = useNavigate();

  // Defensive: ensure features is always an array
  const featureList = Array.isArray(features) ? features : [];

  const handleEnroll = (e) => {
    e.stopPropagation();
    navigate(navigateTo);
  };

  return (
    <div
      className="relative w-full h-[300px]"
      style={{ perspective: "1200px" }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      {/* Flip container */}
      <div
        className="relative w-full h-full"
        style={{
          transformStyle: "preserve-3d",
          WebkitTransformStyle: "preserve-3d",
          transition: "transform 0.55s cubic-bezier(0.77,0,0.175,1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ── FRONT ── */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden
                     bg-gradient-to-br from-[#085FA7] to-[#5CA347]
                     flex flex-col items-center justify-center p-6 text-center"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        >
          {/* Glow blobs */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#085FA7]/30 blur-[40px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#5CA347]/30 blur-[40px] rounded-full pointer-events-none" />

          {/* Icon with fallback */}
          <div className="relative z-10 w-12 h-12 rounded-full bg-white/15 border border-white/25 flex items-center justify-center mb-4 flex-shrink-0">
            {Icon ? (
              <Icon className="w-6 h-6 text-white" />
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
              </svg>
            )}
          </div>

          <h3 className="relative z-10 text-[15px] font-semibold text-white mb-1 leading-snug">{title}</h3>
          {subtitle && (
            <p className="relative z-10 text-[11px] text-white/70 mb-2">{subtitle}</p>
          )}
          {description && (
            <p className="relative z-10 text-[10px] text-white/55 leading-relaxed max-w-[200px]">{description}</p>
          )}

          <div className="absolute bottom-3.5 left-0 right-0 flex justify-center">
            <span className="text-[9px] text-white/35 tracking-widest uppercase">hover to explore →</span>
          </div>
        </div>

        {/* ── BACK ── */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden
                     bg-[#0f172a] border border-[#085FA7]/20
                     flex flex-col p-5"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            WebkitTransform: "rotateY(180deg)",
          }}
        >
          {/* Glow blobs */}
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-[#085FA7]/15 blur-[30px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-[#5CA347]/15 blur-[30px] rounded-full pointer-events-none" />

          {/* Top accent bar */}
          <div className="relative z-10 h-[3px] w-full rounded-full bg-gradient-to-r from-[#085FA7] to-[#5CA347] mb-3.5" />

          <h3 className="relative z-10 text-[13px] font-semibold text-slate-100 mb-3">{title}</h3>

          {/* Features with safe fallback */}
          <div className="relative z-10 flex-1 flex flex-col gap-2">
            {featureList.length > 0 ? (
              featureList.map((feat, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 transition-all duration-300"
                  style={{
                    opacity: flipped ? 1 : 0,
                    transform: flipped ? "translateX(0)" : "translateX(-10px)",
                    transitionDelay: `${i * 60 + 80}ms`,
                  }}
                >
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-gradient-to-br from-[#085FA7] to-[#5CA347] flex items-center justify-center">
                    <FaCheck className="text-white text-[6px]" />
                  </span>
                  <span className="text-[11px] text-slate-400">{feat}</span>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center flex-1">
                <p className="text-[11px] text-slate-500 italic">No features listed</p>
              </div>
            )}
          </div>

          {/* CTA */}
          <button
            onClick={handleEnroll}
            className="relative z-10 mt-3.5 w-full py-2.5 rounded-xl
                       bg-gradient-to-r from-[#085FA7] to-[#5CA347]
                       text-white text-[11px] font-bold
                       flex items-center justify-center gap-2
                       hover:brightness-110 active:scale-95 transition-all duration-200"
            style={{
              opacity: flipped ? 1 : 0,
              transform: flipped ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 0.3s ease, transform 0.3s ease",
              transitionDelay: flipped ? "320ms" : "0ms",
            }}
          >
            Enroll Now <FaArrowRight className="text-[9px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
