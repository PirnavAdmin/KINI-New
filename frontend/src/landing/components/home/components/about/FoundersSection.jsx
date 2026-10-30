import { motion } from 'framer-motion'
import { FaLinkedinIn } from 'react-icons/fa'

const founders = [
  {
    name: 'Narendra Kadiveti',
    role: 'Founder & CEO',
    tag: 'Ex-Microsoft',
    story:
      'Narendra spent years interviewing engineers at Microsoft before realizing the real gap wasn\u2019t talent — it was access to structured mentorship. He started Kini Edx Hub to close that gap, one cohort at a time.',
    stats: [
      { label: 'Years Exp', value: '10+' },
      { label: 'Students', value: '5,000+' },
      { label: 'Placements', value: '100+' },
    ],
  },
  {
    name: 'Ravi Kumar',
    role: 'Co-Founder & CTO',
    tag: 'Ex-Amazon',
    story:
      'After scaling systems at Amazon, Ravi turned his focus to scaling people — designing the curriculum, review pipelines, and mock-interview systems that now power every cohort at Kini Edx Hub.',
    stats: [
      { label: 'Years Exp', value: '10+' },
      { label: 'Students', value: '5,000+' },
      { label: 'Placements', value: '100+' },
    ],
  },
]

export default function FoundersSection() {
  return (
    <section className="relative bg-slate-50 py-28 sm:py-36 dark:bg-app-dark-gradient">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="eyebrow text-brand-blue dark:text-primary-300">Leadership</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">
            Meet Our <span className="text-ascent">Founders</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
            Two engineers who've sat on both sides of the interview table —
            now building the pipeline they wish they'd had.
          </p>
        </motion.div>

        <div className="mt-20 space-y-16">
          {founders.map((f, i) => (
            <FounderRow key={f.name} {...f} reverse={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FounderRow({ name, role, tag, story, stats, reverse }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`grid items-center gap-10 lg:grid-cols-[380px_1fr] ${
        reverse ? 'lg:[direction:rtl]' : ''
      }`}
    >
      {/* Portrait with gradient border */}
      <div className={`relative mx-auto w-full max-w-xs lg:mx-0 ${reverse ? '[direction:ltr]' : ''}`}>
        <div className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-ascent-gradient p-[3px] shadow-glow transition-transform duration-500 hover:-translate-y-1">
          <div className="relative h-full w-full overflow-hidden rounded-[calc(1.5rem-3px)] bg-ink-800">
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ink-700 to-ink-900 text-slate-600">
              <span className="font-display text-6xl font-semibold text-white/10">
                {name.split(' ').map((n) => n[0]).join('')}
              </span>
            </div>
          </div>
          <a
            href="#"
            aria-label={`${name} on LinkedIn`}
            className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink-900 shadow-card transition-transform duration-300 hover:scale-110"
          >
            <FaLinkedinIn size={16} />
          </a>
        </div>
      </div>

      {/* Content */}
      <div className={reverse ? '[direction:ltr]' : ''}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brand-blue/10 px-3 py-1 font-mono text-xs text-brand-blue dark:bg-primary-500/10 dark:text-primary-300">
            {role}
          </span>
          <span className="rounded-full bg-slate-200 px-3 py-1 font-mono text-xs text-slate-600 dark:bg-white/10 dark:text-slate-300">
            {tag}
          </span>
        </div>
        <h3 className="mt-4 font-display text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">
          {name}
        </h3>
        <div className="mt-2 h-0.5 w-14 bg-ascent-gradient" />
        <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">{story}</p>

        <div className="mt-7 flex gap-8">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="font-display text-xl font-semibold text-slate-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
