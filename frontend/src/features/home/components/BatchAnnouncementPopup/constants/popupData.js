import {
  FaChalkboardTeacher,
  FaUsers,
  FaLaptopCode,
  FaCertificate,
  FaBriefcase,
  FaGraduationCap,
} from "react-icons/fa";

// ── Storage Keys ──────────────────────────────────────────────
export const STORAGE_SESSION_KEY = "batch-popup-shown";
export const STORAGE_DAILY_KEY = "batch-popup-daily-dismiss";
export const POPUP_DELAY = 2500; // 2.5s timeout fallback
export const SCROLL_TRIGGER_DEPTH = 0.35; // Show after scrolling 35% of page (whichever comes first)
export const ADMISSIONS_CLOSE_DAYS = 7;

// ── Feature Data ──────────────────────────────────────────────
export const features = [
  {
    icon: FaChalkboardTeacher,
    title: "Live Online Classes",
    description: "Interactive sessions with industry experts in real-time",
    gradient: "from-blue-500 to-cyan-500",
    ringColor: "ring-blue-500/20",
  },
  {
    icon: FaUsers,
    title: "Expert Mentorship",
    description: "Dedicated 1:1 guidance from top professionals",
    gradient: "from-purple-500 to-pink-500",
    ringColor: "ring-purple-500/20",
  },
  {
    icon: FaLaptopCode,
    title: "Real-World Projects",
    description: "Build production-grade applications for your portfolio",
    gradient: "from-emerald-500 to-teal-500",
    ringColor: "ring-emerald-500/20",
  },
  {
    icon: FaCertificate,
    title: "Certifications",
    description: "Industry-recognized credentials upon completion",
    gradient: "from-amber-500 to-orange-500",
    ringColor: "ring-amber-500/20",
  },
  {
    icon: FaBriefcase,
    title: "Placement Assistance",
    description: "Resume reviews, mock interviews & job referrals",
    gradient: "from-rose-500 to-red-500",
    ringColor: "ring-rose-500/20",
  },
  {
    icon: FaGraduationCap,
    title: "Flexible Learning",
    description: "Self-paced curriculum with lifetime access",
    gradient: "from-cyan-500 to-blue-500",
    ringColor: "ring-cyan-500/20",
  },
];

// ── Countdown Helpers ─────────────────────────────────────────
export function getTimeRemaining() {
  const target = new Date();
  target.setDate(target.getDate() + ADMISSIONS_CLOSE_DAYS);
  target.setHours(23, 59, 59, 0);

  const now = new Date();
  const diff = target - now;

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, total: 0 };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    total: diff,
  };
}

// ── Motion Variants ───────────────────────────────────────────
// Standard animated variants (for users without reduced motion preference)
export const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const modalVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 40 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 20,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

export const ribbonVariants = {
  hidden: { x: 60, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { delay: 0.4, duration: 0.5, ease: "easeOut" },
  },
};

export const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: 0.25 + i * 0.07,
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

export const countdownVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.6, duration: 0.35, ease: "easeOut" },
  },
};

export const ctaVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.7, duration: 0.35, ease: "easeOut" },
  },
};

// Static (instant) variants for users with prefers-reduced-motion: reduce
// These skip all animation and show content immediately
export const reducedMotionVariants = {
  backdropVariants: {
    hidden: { opacity: 1 },
    visible: { opacity: 1 },
  },
  modalVariants: {
    hidden: { opacity: 1, scale: 1, y: 0 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 1, y: 0, transition: { duration: 0.1 } },
  },
  ribbonVariants: {
    hidden: { opacity: 1, x: 0 },
    visible: { opacity: 1, x: 0 },
  },
  cardVariants: {
    hidden: { opacity: 1, y: 0, scale: 1 },
    visible: { opacity: 1, y: 0, scale: 1 },
  },
  countdownVariants: {
    hidden: { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0 },
  },
  ctaVariants: {
    hidden: { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0 },
  },
};
