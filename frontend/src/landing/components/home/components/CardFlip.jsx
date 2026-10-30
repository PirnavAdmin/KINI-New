import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaCheck, FaArrowRight } from "react-icons/fa";

export default function CardFlip({
  title = "",
  subtitle = "",
  description = "",
  features = [],
  icon: Icon,

}) {
  const [flipped, setFlipped] = useState(false);
  const navigate = useNavigate();

  const featureList = Array.isArray(features) ? features : [];

  const handleEnroll = (e) => {
    e.stopPropagation();
    // Navigate or handle enrollment
    
  };

  return (
    <div
      className="relative w-full h-[300px]"
      style={{ perspective: "1200px" }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
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
          className="absolute inset-0 rounded-2xl overflow-hidden bg-gradient-to-br from-[#133B5D] to-[#F39924] dark:from-[#1E293B] dark:to-[#0F172A] flex flex-col items-center justify-center p-6 text-center"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        >
          {/* Glow blobs */}
          <div className="absolute -top-10 -right-10 w-32 h-32 blur-[40px] rounded-full pointer-events-none bg-[#133B5D]/30 dark:bg-[#35608A]/30" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 blur-[40px] rounded-full pointer-events-none bg-[#F39924]/30 dark:bg-[#F7A62E]/30" />

          <div className="relative z-10 w-12 h-12 rounded-full border flex items-center justify-center mb-4 flex-shrink-0 bg-white/15 border-white/25 text-white dark:bg-white/10 dark:border-white/15">
            {Icon ? <Icon className="w-6 h-6" /> : null}
          </div>

          <h3 className="relative z-10 text-[15px] font-semibold mb-1 leading-snug text-white dark:text-slate-100">
            {title}
          </h3>
          {subtitle && (
            <p className="relative z-10 text-[11px] mb-2 text-white/70 dark:text-slate-400">
              {subtitle}
            </p>
          )}
          {description && (
            <p className="relative z-10 text-[10px] leading-relaxed max-w-[200px] text-white/55 dark:text-slate-500">
              {description}
            </p>
          )}

          <div className="absolute bottom-3.5 left-0 right-0 flex justify-center">
            <span className="text-[9px] tracking-widest uppercase text-white/35 dark:text-slate-600">
              hover to explore →
            </span>
          </div>
        </div>

        {/* ── BACK ── */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden flex flex-col p-5 bg-[#0f172a] border border-[#133B5D]/20 dark:border-[#35608A]/30"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            WebkitTransform: "rotateY(180deg)",
          }}
        >
          {/* Glow blobs */}
          <div className="absolute -top-8 -right-8 w-24 h-24 blur-[30px] rounded-full pointer-events-none bg-[#133B5D]/15 dark:bg-[#35608A]/20" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 blur-[30px] rounded-full pointer-events-none bg-[#F39924]/15 dark:bg-[#F7A62E]/20" />

          <div className="relative z-10 h-[3px] w-full rounded-full mb-3.5 bg-gradient-to-r from-[#133B5D] to-[#F39924] dark:from-[#35608A] dark:to-[#F7A62E]" />

          <h3 className="relative z-10 text-[13px] font-semibold mb-3 text-slate-100">
            {title}
          </h3>

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
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-secondary-500 flex items-center justify-center">
                    <FaCheck className="text-white text-[6px]" />
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-300">
                    {feat}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center flex-1">
                <p className="text-[11px] italic text-slate-500">No features listed</p>
              </div>
            )}
          </div>

          <div className="relative z-10 mt-2 flex justify-end">
         
          </div>
        </div>
      </div>
    </div>
  );
}