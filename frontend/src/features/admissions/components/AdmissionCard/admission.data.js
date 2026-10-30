// ═══════════════════════════════════════════════════════════════════
// Admission Card — Data & Constants
// ═══════════════════════════════════════════════════════════════════

export const ADMISSION_DATA = {
  badge: "Admissions Open 2026",
  headline: "Build Your Future With",
  headlineAccent: "Industry-Led Certification Programs",
  description:
    "Learn from elite experts, build production-grade projects, earn globally recognized certifications, and accelerate your career trajectory.",
  primaryCTA: "Apply Now",
  secondaryCTA: "Book Free Consultation",

  benefits: [
    {
      icon: "GraduationCap",
      title: "Live Interactive Classes",
      description: "Real-time sessions with dynamic Q&A and direct engagement from industry experts.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: "Users",
      title: "Industry Expert Mentors",
      description: "Learn methodologies curated and taught by working professionals from top tech companies.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: "Briefcase",
      title: "Real-World Projects",
      description: "Build comprehensive portfolios mapped to enterprise-scale production workflows.",
      gradient: "from-cyan-500 to-teal-500",
    },
    {
      icon: "Target",
      title: "Career Mentorship",
      description: "1:1 continuous career strategy alignment mapping milestones to your desired roles.",
      gradient: "from-orange-500 to-amber-500",
    },
    {
      icon: "Award",
      title: "Industry Certifications",
      description: "Earn globally recognized certifications that validate your expertise to employers.",
      gradient: "from-emerald-500 to-green-500",
    },
    {
      icon: "TrendingUp",
      title: "Placement Assistance",
      description: "End-to-end placement support with direct referral access to 500+ hiring partners.",
      gradient: "from-rose-500 to-red-500",
    },
  ],

  stats: [
    { value: "50,000+", label: "Students Trained" },
    { value: "500+", label: "Hiring Partners" },
    { value: "95%", label: "Placement Rate" },
    { value: "4.9/5", label: "Student Rating" },
  ],

  urgency: {
    deadlineDays: 14,
    totalSeats: 500,
    filledSeats: 412,
    label: "Early Bird Offer Ends Soon",
  },

  socialProof: {
    avatars: [
      "https://i.pravatar.cc/40?img=1",
      "https://i.pravatar.cc/40?img=2",
      "https://i.pravatar.cc/40?img=3",
      "https://i.pravatar.cc/40?img=4",
      "https://i.pravatar.cc/40?img=5",
    ],
    enrolledCount: "2,400+",
    rating: 4.9,
    reviewCount: "1,200+",
    placementPercentage: 95,
    partnerLogos: [
      "Microsoft",
      "Google",
      "Amazon",
      "Flipkart",
      "Razorpay",
    ],
  },
};

export const COUNTDOWN_STORAGE_KEY = "admission-offer-expiry";
