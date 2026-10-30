import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useThemeContext } from '@landing-shared/context/ThemeContext'

const stats = [
  { value: '100%',        label: 'LIVE TRAINING',       description: 'Instructor-led'     },
  { value: '1:1',         label: '1:1 MENTORSHIP',      description: 'Industry Experts'   },
  { value: 'Hands-on',   label: 'REAL-WORLD PROJECTS',  description: 'Practical Learning' },
  { value: 'Career Ready',label: 'CAREER SUPPORT',      description: 'Practical Guidance' },
]

const skills = [
  { name: 'React',      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
  { name: 'JavaScript', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' },
  { name: 'Python',     logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
  { name: 'Node.js',    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' },
  { name: 'SQL',        logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg' },
  {
    name: 'AWS',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg',
  },
  { name: 'Git',        logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg' },
]

// ─── Shared easing ───────────────────────────────────────────────────────────
const EASE = [0.22, 1, 0.36, 1]

// ─── Stat card ────────────────────────────────────────────────────────────────
function Stat({ value, label, description, index, isDark }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, margin: '-40px' }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: EASE }}
      whileHover={{ y: -4, transition: { duration: 0.25, ease: EASE } }}
      className={`
        group relative overflow-hidden rounded-2xl border px-4 py-5 text-center
        transition-shadow duration-300 hover:shadow-xl
        ${isDark
          ? 'border-white/8 bg-white/[0.03] hover:shadow-black/40'
          : 'border-slate-200/80 bg-white/60 hover:shadow-slate-200/80'}
      `}
      style={{ backdropFilter: 'blur(12px)' }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
      />

      <motion.span
        aria-hidden="true"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: false }}
        transition={{ duration: 0.4, delay: index * 0.1 + 0.3, ease: EASE }}
        className="mx-auto mb-2 block h-1 w-5 rounded-full"
        style={{
          background: 'linear-gradient(90deg, #133B5D 0%, #1F4A70 50%, #F39924 100%)',
        }}
      />

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.45, delay: index * 0.1 + 0.18, ease: EASE }}
        className={`font-display text-2xl font-extrabold tracking-tight whitespace-nowrap sm:text-3xl ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}
        style={{
          backgroundImage: 'linear-gradient(135deg, #133B5D 0%, #1F4A70 50%, #F39924 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {value}
      </motion.p>

      <p className={`mt-1.5 text-[10px] font-bold uppercase tracking-wider ${
        isDark ? 'text-slate-400' : 'text-slate-500'
      }`}>
        {label}
      </p>

      {description && (
        <p className={`mt-1 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          {description}
        </p>
      )}
    </motion.div>
  )
}

// ─── Skill pill with error handling ──────────────────────────────────────────
function SkillPill({ skill, index, isDark }) {
  const [imgError, setImgError] = useState(false)

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: false }}
      transition={{ duration: 0.4, delay: 0.15 + index * 0.06, ease: EASE }}
      whileHover={{ scale: 1.06, y: -2, transition: { duration: 0.18 } }}
      className={`
        flex cursor-default items-center gap-2 rounded-full border px-4 py-2
        text-sm font-semibold transition-all duration-200
        ${isDark
          ? 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'
          : 'border-slate-200 bg-white/80 text-slate-700 hover:border-slate-300 hover:bg-white hover:shadow-sm'}
      `}
    >
      {!imgError && (
        <img
          src={skill.logo}
          alt={skill.name + ' logo'}
          className="h-5 w-5 flex-shrink-0 object-contain"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      )}
      {skill.name}
    </motion.span>
  )
}

// ─── Animated divider line ────────────────────────────────────────────────────
function GradientLine({ isDark }) {
  return (
    <motion.div
      initial={{ scaleX: 0, opacity: 0 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={{ once: false }}
      transition={{ duration: 0.9, ease: EASE }}
      className="my-0 h-px origin-left"
      style={{
        background: isDark
          ? 'linear-gradient(90deg, transparent 0%, rgba(31,74,112,0.4) 40%, rgba(243,153,36,0.4) 70%, transparent 100%)'
          : 'linear-gradient(90deg, transparent 0%, #1F4A7055 40%, #F3992455 70%, transparent 100%)',
      }}
    />
  )
}

// ─── Main section ─────────────────────────────────────────────────────────────
export default function TrustSection() {
  const { isDark } = useThemeContext()

  return (
    <section
      className="relative pb-12 pt-4"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #0F172A 0%, #111827 50%, #0B1120 100%)'
          : 'linear-gradient(135deg, #EEF3F8 0%, #F7F5F1 55%, #FFF4E5 100%)',
      }}
    >
      {/* Top fade seam */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-16"
        style={{
          background: isDark
            ? 'linear-gradient(to bottom, rgba(15,23,42,0.95) 0%, transparent 100%)'
            : 'linear-gradient(to bottom, white 0%, transparent 100%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6">

        {/* ── Eyebrow label ── */}
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.5, ease: EASE }}
          className={`pt-8 text-center text-[10px] font-bold uppercase tracking-[0.25em] ${
            isDark ? 'text-slate-500' : 'text-slate-400'
          }`}
        >
          Why learners choose us
        </motion.p>

        {/* ── Stat cards ── */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat, i) => (
            <Stat key={stat.label} {...stat} index={i} isDark={isDark} />
          ))}
        </div>

        {/* ── Gradient divider ── */}
        <div className="mt-14">
          <GradientLine isDark={isDark} />
        </div>

        {/* ── Skills section ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-10 text-center"
        >
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.45, ease: EASE }}
            className={`text-[10px] font-bold uppercase tracking-[0.25em] ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            Industry-Relevant Skills
          </motion.p>

          {/* Pills row */}
          <div className="mx-auto mt-6 flex max-w-3xl flex-wrap items-center justify-center gap-3">
            {skills.map((skill, idx) => (
              <SkillPill key={skill.name} skill={skill} index={idx} isDark={isDark} />
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  )
}