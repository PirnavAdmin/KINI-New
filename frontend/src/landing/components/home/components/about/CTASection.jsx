import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useThemeContext } from '@landing-shared/context/ThemeContext'

export default function CTASection() {
  const { isDark } = useThemeContext()

  return (
    <section
      className={`relative overflow-hidden py-10 sm:py-12 transition-colors duration-500 ${
        isDark ? 'bg-app-dark-gradient text-white' : ''
      }`}
      style={
        !isDark
          ? {
              background:
                'linear-gradient(135deg, #EEF3F8 0%, #F7F5F1 55%, #FFF4E5 100%)',
            }
          : undefined
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto max-w-2xl px-6 text-center"
      >
        <h2
          className={`font-display text-2xl font-semibold leading-tight sm:text-3xl md:text-[2.125rem] ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          Your line starts at{' '}
          <span
            className={
              isDark
                ? 'text-brand-blue'
                : 'text-[#133B5D]'
            }
          >
            zero.
          </span>
          <br />
          It doesn't have to stay{' '}
          <span
            className={
              isDark
                ? 'text-brand-gold'
                : 'text-[#F39924]'
            }
          >
            there.
          </span>
        </h2>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            to="/upskill-program"
            className="group inline-flex items-center gap-2 rounded-full bg-secondary-500 text-primary-700 border border-secondary-500 px-7 py-3 text-sm font-semibold shadow-lg transition-all duration-300 hover:bg-secondary-600 hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline focus-visible:ring-2 focus-visible:ring-secondary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          >
            Explore Programs
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-primary-700 text-secondary-500 border border-secondary-500 px-7 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-600 focus-visible:outline focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          >
            Talk to a Mentor
          </Link>
        </div>
      </motion.div>
    </section>
  )
}
