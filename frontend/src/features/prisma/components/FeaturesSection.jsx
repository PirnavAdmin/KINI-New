import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import WordsPullUpMultiStyle from "./WordsPullUpMultiStyle";

const headerSegments = [
  { text: "Studio-grade workflows for visionary creators.", className: "" },
  {
    text: "Built for pure vision. Powered by art.",
    className: "text-gray-500",
  },
];

const cardFeatures = [
  {
    id: 0,
    type: "video",
    videoSrc:
      "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4",
    title: "Your creative canvas.",
  },
  {
    id: 1,
    title: "Project Storyboard.",
    number: "(01)",
    icon: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171918_4a5edc79-d78f-4637-ac8b-53c43c220606.png&w=1280&q=85",
    checks: [
      "Time-blocked deep work sessions",
      "Automated project syncing",
      "Version history across edits",
      "Real-time team dashboards",
    ],
  },
  {
    id: 2,
    title: "Smart Critiques.",
    number: "(02)",
    icon: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171741_ed9845ab-f5b2-4018-8ce7-07cc01823522.png&w=1280&q=85",
    checks: [
      "AI-powered frame-by-frame analysis",
      "Contextual annotation & creative notes",
      "Seamless tool integrations",
    ],
  },
  {
    id: 3,
    title: "Immersion Capsule.",
    number: "(03)",
    icon: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171809_f56666dc-c099-4778-ad82-9ad4f209567b.png&w=1280&q=85",
    checks: [
      "Deep notification silencing",
      "Custom ambient soundscapes",
      "Cross-platform schedule syncing",
    ],
  },
];

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.15,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

function FeatureCard({ feature, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="relative flex flex-col overflow-hidden rounded-2xl bg-[#212121] min-h-[280px] sm:min-h-[320px] lg:h-full"
    >
      {/* Video card */}
      {feature.type === "video" && (
        <>
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src={feature.videoSrc} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="relative mt-auto p-4 sm:p-5">
            <h3 className="text-sm sm:text-base md:text-lg font-medium" style={{ color: "#E1E0CC" }}>
              {feature.title}
            </h3>
          </div>
        </>
      )}

      {/* Content card */}
      {!feature.type && (
        <div className="flex h-full flex-col p-4 sm:p-5">
          {/* Icon */}
          <div className="mb-3 sm:mb-4">
            <img
              src={feature.icon}
              alt=""
              className="h-10 w-10 sm:h-12 sm:w-12 rounded object-cover"
            />
          </div>

          {/* Title + number */}
          <div className="mb-3 sm:mb-4">
            <h3
              className="text-sm sm:text-base md:text-lg font-medium"
              style={{ color: "#E1E0CC" }}
            >
              {feature.title}{" "}
              <span className="text-xs sm:text-sm text-gray-500">{feature.number}</span>
            </h3>
          </div>

          {/* Checklist */}
          <ul className="space-y-2 sm:space-y-2.5 flex-1">
            {feature.checks.map((check, ci) => (
              <li key={ci} className="flex items-start gap-2">
                <Check
                  className="mt-0.5 h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0"
                  style={{ color: "#DEDBC8" }}
                />
                <span className="text-xs sm:text-sm text-gray-400 leading-snug">{check}</span>
              </li>
            ))}
          </ul>

          {/* Learn more */}
          <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-white/5">
            <button className="group inline-flex items-center gap-1.5 text-xs sm:text-sm transition-colors duration-200 hover:opacity-80"
              style={{ color: "#DEDBC8" }}
            >
              Learn more
              <ArrowRight
                className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                style={{ transform: "rotate(-45deg)" }}
              />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function FeaturesSection() {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-100px" });

  return (
    <section id="features" className="relative min-h-screen bg-black overflow-hidden">
      {/* Noise background overlay */}
      <div className="bg-noise pointer-events-none absolute inset-0 opacity-[0.15]" />

      <div className="relative z-10 px-4 py-20 sm:py-28 md:py-32 lg:py-36">
        {/* Header */}
        <div ref={headerRef} className="mx-auto mb-12 sm:mb-16 md:mb-20 max-w-4xl text-center">
          {headerInView && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal space-y-2">
                <WordsPullUpMultiStyle segments={headerSegments} />
              </div>
            </motion.div>
          )}
        </div>

        {/* 4-column card grid */}
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-2 md:gap-1 lg:h-[480px]">
            {cardFeatures.map((feature, i) => (
              <FeatureCard key={feature.id} feature={feature} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
