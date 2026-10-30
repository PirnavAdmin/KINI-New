import { motion } from "framer-motion";
import { Laptop, Building2, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useThemeContext } from '@landing-shared/context/ThemeContext'

const tracks = [
  {
    icon: Laptop,
    title: "Online Programs",
    desc: "Learn from anywhere with live classes, expert mentors, hands-on projects, and real-world assignments.",
    bullets: ["Live Mentorship", "Project Based Learning", "Flexible Access", "Career Support"],
    accent: "from-[#133B5D] via-[#38BDF8] to-[#7DD3B2]",
    iconBg: "bg-[#133B5D]/10",
    iconColor: "text-[#133B5D]",
    bulletDot: "bg-[#133B5D]/20",
    ctaLink: "/upskill-program",
    ctaLabel: "Explore Online Programs",
  },
  {
    icon: Building2,
    title: "Offline Training",
    desc: "Experience focused classroom training with practical labs, peer learning, and personalized guidance.",
    bullets: ["Expert Trainers", "Interactive Sessions", "Practical Labs", "Placement Support"],
    accent: "from-[#F39924] via-[#7DD3B2] to-[#133B5D]",
    iconBg: "bg-[#F39924]/10",
    iconColor: "text-[#F39924]",
    bulletDot: "bg-[#F39924]/20",
    ctaLink: "/upskill-program",
    ctaLabel: "Explore Offline Training",
  },
]

const EASE = [0.22, 1, 0.36, 1]

export default function LearningEcosystem() {
  const { isDark } = useThemeContext()

  return (
    <section className="relative overflow-hidden py-10 sm:py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-transparent dark:via-transparent dark:to-transparent dark:bg-app-dark-gradient" />

      <div className="absolute -top-48 -left-48 h-[500px] w-[500px] rounded-full bg-[#133B5D]/15 blur-[130px] dark:bg-[#35608A]/15" />
      <div className="absolute -bottom-48 -right-48 h-[500px] w-[500px] rounded-full bg-[#F39924]/15 blur-[130px] dark:bg-[#F7A62E]/10" />

      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(#133B5D 1px, transparent 1px), linear-gradient(90deg,#133B5D 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className={`inline-flex rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide uppercase ${
            isDark ? 'bg-white/10 text-primary-300' : 'bg-[#133B5D]/10 text-[#133B5D]'
          }`}>
            WHERE AMBITION BECOMES A CAREER
          </span>
          <h2 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Our Learning Ecosystem
          </h2>
          <p className="mt-3 mx-auto max-w-xl text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
            Everything you need to learn, practice, and grow — all in one place.
            Flexible, practical, and outcome-driven.
          </p>
        </motion.div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {tracks.map((track, index) => {
            const Icon = track.icon;
            return (
              <motion.div
                key={track.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.5, delay: index * 0.12, ease: EASE }}
                whileHover={{ y: -4, transition: { duration: 0.25 } }}
                className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                  isDark
                    ? 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:shadow-xl hover:shadow-black/20'
                    : 'border-slate-200/80 bg-white/70 backdrop-blur-xl hover:shadow-xl hover:shadow-slate-200/60'
                }`}
              >
                <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${track.accent}`} />

                <div className="relative p-6 sm:p-7">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${track.iconBg}`}>
                    <Icon className={track.iconColor} size={22} />
                  </div>

                  <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
                    {track.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {track.desc}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-2.5">
                    {track.bullets.map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${track.bulletDot}`} />
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Link
                    to={track.ctaLink}
                    className="mt-6 inline-flex items-center gap-2 rounded-lg bg-secondary-500 text-primary-700 border border-secondary-500 px-4 py-2.5 text-sm font-semibold transition-all duration-300 hover:bg-secondary-600 hover:shadow-lg hover:scale-[1.02]"
                  >
                    {track.ctaLabel}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    >
                      <path d="M5 12h14" />
                      <path d="M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
