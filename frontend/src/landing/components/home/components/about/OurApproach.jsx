import { motion } from 'framer-motion'
import { useThemeContext } from '@landing-shared/context/ThemeContext'
import { BookOpen, Users2, Code2, Target } from 'lucide-react'

const steps = [
  {
    num: '01',
    icon: BookOpen,
    title: 'Build strong foundations',
    desc: 'Start with core concepts and real-world context to build lasting understanding.',
    color: 'bg-[#133B5D]',
    iconBg: 'bg-[#133B5D]/10',
    iconColor: 'text-[#133B5D]',
  },
  {
    num: '02',
    icon: Users2,
    title: 'Learn with people, not just videos',
    desc: 'Live classes, doubt sessions, and mentor support that keep you engaged.',
    color: 'bg-[#2EA7E0]',
    iconBg: 'bg-[#2EA7E0]/10',
    iconColor: 'text-[#2EA7E0]',
  },
  {
    num: '03',
    icon: Code2,
    title: 'Practice through real projects',
    desc: 'Apply your learning with hands-on projects that simulate real scenarios.',
    color: 'bg-[#7DD3B2]',
    iconBg: 'bg-[#7DD3B2]/10',
    iconColor: 'text-[#7DD3B2]',
  },
  {
    num: '04',
    icon: Target,
    title: 'Prepare with confidence for your next opportunity',
    desc: 'Assessments, mock interviews, and career guidance to help you get job-ready.',
    color: 'bg-[#F39924]',
    iconBg: 'bg-[#F39924]/10',
    iconColor: 'text-[#F39924]',
  },
]

const EASE = [0.22, 1, 0.36, 1]

export default function OurApproach() {
  const { isDark } = useThemeContext()

  return (
    <section
      className="relative py-10 sm:py-12 overflow-hidden"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #0F172A 0%, #111827 50%, #0B1120 100%)'
          : 'linear-gradient(135deg, #EEF3F8 0%, #E8F4FC 50%, #F0F8F6 100%)',
      }}
    >
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-[#133B5D]/10 blur-[120px] dark:bg-[#133B5D]/5" />

      <div className="relative mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="eyebrow text-[#133B5D] dark:text-primary-300">OUR APPROACH</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">
            From learning fundamentals to career readiness
          </h2>
        </motion.div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: EASE }}
                whileHover={{ y: -4, transition: { duration: 0.25 } }}
                className={`group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 ${
                  isDark
                    ? 'border-white/8 bg-white/[0.03] hover:bg-white/[0.06] hover:shadow-xl hover:shadow-black/20'
                    : 'border-slate-200/80 bg-white/70 backdrop-blur-sm hover:shadow-xl hover:shadow-slate-200/60'
                }`}
              >
                <div className={`absolute top-0 left-0 h-1 w-full ${step.color}`} />

                <div className="flex items-center gap-3 mb-4">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${step.iconBg}`}>
                    <Icon size={20} className={step.iconColor} />
                  </span>
                  <span className={`font-display text-2xl font-bold ${step.iconColor}`}>
                    {step.num}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {step.desc}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
