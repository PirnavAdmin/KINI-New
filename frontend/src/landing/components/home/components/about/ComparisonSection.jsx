import { motion } from 'framer-motion'
import { Video, Layers, Code2, MessageCircle, Briefcase, Award } from 'lucide-react'
import { useThemeContext } from '@landing-shared/context/ThemeContext'
import { Link } from 'react-router-dom'

const features = [
  {
    icon: Video,
    title: 'Live Mentor-Led Learning',
    desc: 'Learn from industry professionals through interactive live sessions, not just pre-recorded videos.',
    accent: 'bg-[#133B5D]',
    shadow: 'shadow-[#133B5D]/20',
  },
  {
    icon: Layers,
    title: 'Career-Focused Curriculum',
    desc: 'A structured path from fundamentals to advanced job-ready skills, designed for real tech roles.',
    accent: 'bg-[#F39924]',
    shadow: 'shadow-[#F39924]/20',
  },
  {
    icon: Code2,
    title: 'Hands-On Real Projects',
    desc: 'Build portfolio-ready projects that are reviewed and refined by mentors, just like in a real job.',
    accent: 'bg-[#7DD3B2]',
    shadow: 'shadow-[#7DD3B2]/20',
  },
  {
    icon: MessageCircle,
    title: 'Personalized Mentor Guidance',
    desc: 'Regular 1:1 sessions with experienced engineers to keep you on track and answer your questions.',
    accent: 'bg-[#F0765B]',
    shadow: 'shadow-[#F0765B]/20',
  },
  {
    icon: Briefcase,
    title: 'Career Preparation',
    desc: 'Practice technical interviews, build your resume, and develop job-ready communication skills.',
    accent: 'bg-[#7DD3B2]',
    shadow: 'shadow-[#7DD3B2]/20',
  },
  {
    icon: Award,
    title: 'Portfolio & Skill Validation',
    desc: 'Finish with a strong GitHub portfolio and verified project outcomes to showcase to employers.',
    accent: 'bg-[#133B5D]',
    shadow: 'shadow-[#133B5D]/20',
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
}

export default function ComparisonSection() {
  const { isDark } = useThemeContext()

  return (
    <section
      className="relative overflow-hidden py-12 sm:py-16"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #0F172A 0%, #111827 50%, #0B1120 100%)'
          : 'linear-gradient(135deg, #EAF6FF 0%, #DDF3FF 40%, #E8FBF8 100%)',
      }}
    >
      {/* Ambient tint */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[700px] -translate-x-1/2 rounded-full bg-brand-blue/10 blur-[140px]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Heading */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: false }}
          className="text-center"
        >
          <motion.p variants={fadeUp} custom={0} className="eyebrow text-brand-blue dark:text-primary-300">
            WHY KINI EDX HUB
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="mt-3 font-display text-3xl font-bold text-ink-900 dark:text-white sm:text-4xl md:text-5xl"
          >
            Built Around Your Career
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={2}
            className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-ink-500 dark:text-slate-400 sm:text-[15px]"
          >
            Learn live, build projects, get personal mentorship, and prepare for real opportunities — all in
            one structured journey.
          </motion.p>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.1 }}
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                custom={index + 3}
                whileHover={{ y: -6 }}
                className={`group rounded-2xl border border-white/60 bg-white/80 p-6 backdrop-blur-xl transition-all duration-300 hover:shadow-xl ${
                  isDark
                    ? 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                    : 'hover:bg-white/90'
                } ${feature.shadow}`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${feature.accent} text-white shadow-md`}
                >
                  <Icon size={22} />
                </div>
                <h3 className="mt-4 text-lg font-bold text-ink-900 dark:text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-slate-400">
                  {feature.desc}
                </p>
                <div className="mt-4 flex items-center text-xs font-medium text-brand-blue dark:text-primary-300">
                  <span className="rounded-full bg-brand-blue/10 px-3 py-1 dark:bg-primary-500/10">
                    Included
                  </span>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <Link
            to="/upskill-program"
            className="inline-flex items-center gap-2 rounded-full bg-secondary-500 text-primary-700 border border-secondary-500 px-6 py-3 text-sm font-semibold shadow-lg transition-all duration-300 hover:bg-secondary-600 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-secondary-500"
          >
            Explore Programs →
          </Link>
        </motion.div>
      </div>
    </section>
  )
}