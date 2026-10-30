import { motion } from "framer-motion";
import { Sparkles, Target, Rocket, Trophy } from "lucide-react";
import StickySection from "./StickySection";

/* ──────────────────────────────────────────────────────────────
   STICKY SCROLL STORY — SaaS-style storytelling sections
   ──────────────────────────────────────────────────────────────
   3 full-screen sticky sections that overlap as the user scrolls,
   each with bold messaging optimized for the ed-tech brand.
   ────────────────────────────────────────────────────────────── */

const STORIES = [
  {
    id: 1,
    headline: "Learn Skills That Matter",
    subhead: "Industry-aligned curriculum designed with top employers to ensure you learn exactly what the market demands.",
    icon: Target,
    gradient: "from-[#60A5FA] via-[#818CF8] to-[#A855F7]",
    stat: "25,000+",
    statLabel: "Active Learners",
    theme: "dark",
  },
  {
    id: 2,
    headline: "Build Real Projects",
    subhead: "Apply your skills on production-grade projects that mirror real-world engineering challenges — not toy exercises.",
    icon: Rocket,
    gradient: "from-[#A855F7] via-[#EC4899] to-[#F43F5E]",
    stat: "200+",
    statLabel: "Projects Built",
    theme: "dark",
  },
  {
    id: 3,
    headline: "Get Placed Faster",
    subhead: "From resume workshops to mock interviews, our placement engine accelerates your journey to landing your dream role.",
    icon: Trophy,
    gradient: "from-[#F59E0B] via-[#F97316] to-[#EF4444]",
    stat: "92%",
    statLabel: "Placement Rate",
    theme: "dark",
  },
];

function StatBadge({ stat, label, gradient }) {
  return (
    <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
      <span
        className={`text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r ${gradient}`}
      >
        {stat}
      </span>
      <span className="text-xs text-white/50 font-medium">{label}</span>
    </div>
  );
}

export default function StickyScrollStory() {
  return (
    <>
      {/* Spacer to ensure proper scroll height before first sticky section */}
      <div className="h-8" />

      {STORIES.map((story, index) => (
        <StickySection key={story.id} theme={story.theme} animate={false}>
          <div className="max-w-6xl mx-auto px-6 lg:px-8 w-full">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[60vh]">
              {/* Left: Content */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-20%" }}
                transition={{
                  duration: 0.8,
                  delay: 0.15,
                  ease: [0.16, 1, 0.3, 1],
                }}
                data-aos="fade-right"
                data-aos-duration="800"
              >
                {/* Step number */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-white/5">
                    <story.icon className="w-5 h-5 text-white/70" />
                  </div>
                  <span className="text-xs font-medium tracking-widest uppercase text-white/30">
                    Step {index + 1}
                  </span>
                </div>

                {/* Headline */}
                <h2
                  className="text-[clamp(2.2rem,5vw,4rem)] font-extrabold leading-[1.05] tracking-[-0.03em] mb-6"
                  style={{ color: "rgba(255,255,255,0.95)" }}
                >
                  <span
                    className={`bg-clip-text text-transparent bg-gradient-to-r ${story.gradient}`}
                  >
                    {story.headline.split(" ")[0]}
                  </span>{" "}
                  {story.headline.split(" ").slice(1).join(" ")}
                </h2>

                {/* Subhead */}
                <p
                  className="text-base sm:text-lg leading-relaxed max-w-lg"
                  style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}
                >
                  {story.subhead}
                </p>

                {/* Stat */}
                <div className="mt-8">
                  <StatBadge
                    stat={story.stat}
                    label={story.statLabel}
                    gradient={story.gradient}
                  />
                </div>
              </motion.div>

              {/* Right: Visual */}
              <motion.div
                className="hidden lg:flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-20%" }}
                transition={{
                  duration: 0.8,
                  delay: 0.3,
                  ease: [0.16, 1, 0.3, 1],
                }}
                data-aos="zoom-in"
                data-aos-delay="200"
                data-aos-duration="800"
              >
                <div className="relative w-full aspect-square max-w-md">
                  {/* Animated gradient blob */}
                  <div
                    className="absolute inset-0 rounded-[2rem] opacity-20 blur-3xl"
                    style={{
                      background: `linear-gradient(135deg, ${story.gradient.replace("from-", "").replace("via-", "").replace("to-", "").replace(/\[|\]/g, "")})`,
                    }}
                  />

                  {/* Card mockup */}
                  <div className="relative w-full h-full rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br opacity-80 flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${story.gradient.replace("from-", "").replace("via-", "").replace("to-", "")})`,
                        }}
                      >
                        <story.icon className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-white/40 text-sm font-medium">
                        Interactive Demo
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </StickySection>
      ))}

      {/* Spacer after last sticky section */}
      <div className="h-8" />
    </>
  );
}
