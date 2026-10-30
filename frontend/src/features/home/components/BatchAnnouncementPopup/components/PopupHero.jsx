import { memo } from "react";
import { motion } from "framer-motion";
import { FaFire, FaGraduationCap, FaTimes } from "react-icons/fa";
import { ribbonVariants } from "../constants/popupData";

const PopupHero = memo(({ onClose }) => (
  <div className="relative bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#0EA5E9] px-6 sm:px-10 pt-6 sm:pt-10 pb-12 sm:pb-14 flex-[0_0_auto] min-h-[clamp(140px,22vh,180px)] flex flex-col justify-center">
    {/* Decorative orbs */}
    <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/[0.04] blur-3xl pointer-events-none" />
    <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-white/[0.04] blur-2xl pointer-events-none" />
    <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full bg-white/[0.03] blur-xl pointer-events-none" />

    {/* Close button */}
    <button
      onClick={onClose}
      className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 text-white/70 hover:bg-white/20 hover:text-white backdrop-blur-sm transition-all duration-200 cursor-pointer z-10 focus-visible:outline-2 focus-visible:outline-white/50 focus-visible:outline-offset-2"
      aria-label="Close announcement"
    >
      <FaTimes className="text-sm" />
    </button>

    {/* Ribbon badge */}
    <motion.div
      variants={ribbonVariants}
      initial="hidden"
      animate="visible"
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-300/25 text-rose-200 text-xs font-semibold tracking-wide mb-4 select-none"
    >
      <FaFire className="text-[10px]" />
      Early Bird Offer Ends Soon
    </motion.div>

    {/* Headline */}
    <h2 className="text-[clamp(1.5rem,2.8vw,2.25rem)] font-extrabold text-white leading-[1.15] tracking-tight">
      🎓 New Batch Started!
    </h2>
    <p className="mt-2 text-[clamp(0.875rem,1.2vw,1.125rem)] text-blue-100/90 font-medium max-w-[75%]">
      Admissions are now open for our latest batch.
    </p>

    {/* Floating graduation icon — intentionally overlaps hero/body boundary */}
    <div className="absolute right-6 sm:right-10 bottom-[-28px] sm:bottom-[-32px] w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white shadow-[0_8px_32px_rgba(37,99,235,0.25)] flex items-center justify-center z-10 ring-1 ring-black/5">
      <FaGraduationCap className="text-2xl sm:text-3xl text-[#2563EB]" />
    </div>
  </div>
));

PopupHero.displayName = "PopupHero";
export default PopupHero;
