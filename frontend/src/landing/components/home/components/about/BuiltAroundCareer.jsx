import { motion } from 'framer-motion'
import { Video, Layers, Code2, MessageCircle, Briefcase, Award } from 'lucide-react'
import { useThemeContext } from '@landing-shared/context/ThemeContext'
import { Link } from 'react-router-dom'

const features = [
  {
    icon: Video,
    title: 'Live Mentor-led Learning',
    desc: 'Learn from industry experts in real time and get your doubts solved instantly.',
    accent: 'bg-[#133B5D]',
    shadow: 'shadow-[#133B5D]/20',
  },
  {
    icon: Layers,
    title: 'Career-focused Curriculum',
    desc: 'Industry-aligned curriculum designed to build in-demand skills.',
    accent: 'bg-[#F39924]',
    shadow: 'shadow-[#F39924]/20',
  },
  {
    icon: Code2,
    title: 'Hands-on Real Projects',
    desc: 'Work on real-world projects that strengthen your portfolio.',
    accent: 'bg-[#7DD3B2]',
    shadow: 'shadow-[#7DD3B2]/20',
  },
  {
    icon: MessageCircle,
    title: 'Personalized Mentor Guidance',
    desc: '1:1 mentorship to help you improve, stay motivated, and achieve your goals.',
    accent: 'bg-[#F0765B]',
    shadow: 'shadow-[#F0765B]/20',
  },
  {
    icon: Briefcase,
    title: 'Career Preparation',
    desc: 'Mock interviews, resume building, and soft skills training.',
    accent: 'bg-[#7DD3B2]',
    shadow: 'shadow-[#7DD3B2]/20',
  },
  {
    icon: Award,
    title: 'Portfolio & Skill Validation',
    desc: 'Build a strong portfolio and earn certifications to showcase your expertise.',
    accent: 'bg-[#133B5D]',
    shadow: 'shadow-[#133B5D]/20',
  },
]

const EASE = [0.22, 1, 0.36, 1]

export default function BuiltAroundCareer() {
  const { isDark } = useThemeContext()

  return (
    <section
      className="relative overflow-hidden py-10 sm:py-12"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #0F172A 0%, #111827 50%, #0B1120 100%)'
          : 'linear-gradient(135deg, #EAF6FF 0%, #DDF3FF 40%, #E8FBF8 100%)',
      }}
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[700px] -translate-x-1/2 rounded-full bg-brand-blue/10 blur-[140px]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="eyebrow text-brand-blue dark:text-primary-300">WHY KINI</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-ink-900 dark:text-white sm:text-4xl">
            Built Around Your Career
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-ink-500 dark:text-slate-400 sm:text-[15px]">
            Learn in a way that prepares you for real opportunities and long-term success.
          </p>
        </motion.div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.45, delay: index * 0.08, ease: EASE }}
                whileHover={{ y: -4 }}
                className={`group rounded-2xl border p-5 backdrop-blur-xl transition-all duration-300 hover:shadow-xl ${
                  isDark
                    ? 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                    : 'border-white/60 bg-white/80 hover:bg-white/90'
                } ${feature.shadow}`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${feature.accent} text-white shadow-md`}
                >
                  <Icon size={20} />
                </div>
                <h3 className="mt-3 text-base font-bold text-ink-900 dark:text-white">{feature.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-500 dark:text-slate-400">
                  {feature.desc}
                </p>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 text-center"
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
