import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { UserX, GraduationCap, FolderGit2, Briefcase, MessagesSquare, Trophy } from 'lucide-react'

const stages = [
  { icon: UserX, label: 'Unemployed', note: 'Day 0, no plan', x: 4, y: 86 },
  { icon: GraduationCap, label: 'Learning', note: 'Fundamentals + DSA', x: 22, y: 70 },
  { icon: FolderGit2, label: 'Projects', note: '6+ shipped builds', x: 40, y: 52 },
  { icon: Briefcase, label: 'Internship', note: 'Real client work', x: 59, y: 34 },
  { icon: MessagesSquare, label: 'Interviews', note: 'Mocks + real rounds', x: 78, y: 16 },
  { icon: Trophy, label: 'Hired', note: '\u20b95\u201312 LPA offer', x: 96, y: 6 },
]

// Precompute SVG coordinates from percentages (viewBox 1000x280)
const points = stages.map(s => ({
  x: (s.x / 100) * 1000,
  y: (s.y / 100) * 280,
}))

// Build smooth path through all points using cubic Beziers
const buildPath = (pts) => {
  if (pts.length < 2) return ''
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i]
    const p1 = pts[i + 1]
    // Control points: halfway between current and next, with slight offset to smooth
    const cp1x = (p0.x + p1.x) / 2
    const cp1y = p0.y - (p0.y - p1.y) * 0.3 // pull upward
    const cp2x = (p0.x + p1.x) / 2
    const cp2y = p1.y + (p0.y - p1.y) * 0.3
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`
  }
  return d
}

const pathD = buildPath(points)

export default function JourneySection() {
  const wrapRef = useRef(null)
  const inView = useInView(wrapRef, { once: false, amount: 0.3 })

  return (
    <section className="relative overflow-hidden bg-white py-12 sm:py-16 dark:bg-app-dark-gradient">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="eyebrow text-brand-blue dark:text-primary-300">The full arc</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">
            Student Journey to Placement
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
            One continuous trajectory — every learner climbs the same verified
            line, from their first login to their first offer.
          </p>
        </motion.div>

        {/* Desktop curved diagram */}
        <div ref={wrapRef} className="relative mt-14 hidden aspect-[10/3.2] w-full lg:block">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 280" fill="none" preserveAspectRatio="none">
            <path d="M 20 258 L 980 258" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 6" className="dark:opacity-10" />
            <motion.path
              d={pathD}
              stroke="url(#journeyAscent)"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 2, ease: 'easeOut' }}
            />
            <defs>
              <linearGradient id="journeyAscent" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#133B5D" />
                <stop offset="60%" stopColor="#1F4A70" />
                <stop offset="100%" stopColor="#F39924" />
              </linearGradient>
            </defs>
          </svg>

          {stages.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.3 }}
              className="absolute flex -translate-x-1/2 flex-col items-center"
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-full border-2 shadow-card ${
                  i === stages.length - 1
                    ? 'border-brand-gold bg-brand-gold/10 text-brand-gold'
                    : 'border-brand-blue/30 bg-white text-brand-blue dark:bg-ink-900'
                }`}
              >
                <s.icon size={20} />
              </span>
              <div className="mt-2 whitespace-nowrap text-center">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">{s.label}</p>
                <p className="font-mono text-[10px] text-slate-400">{s.note}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile vertical timeline */}
        <div className="mt-12 space-y-0 lg:hidden">
          {stages.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="relative flex items-start gap-4"
            >
              {/* Left connector */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                    i === stages.length - 1
                      ? 'border-brand-gold bg-brand-gold/10 text-brand-gold'
                      : 'border-brand-blue/30 bg-white text-brand-blue dark:bg-ink-900'
                  }`}
                >
                  <s.icon size={18} />
                </div>
                {i < stages.length - 1 && (
                  <div className="h-10 w-0.5 bg-slate-300/70 dark:bg-white/10" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 rounded-2xl border border-slate-200 p-4 dark:border-white/10">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{s.label}</p>
                <p className="font-mono text-xs text-slate-400">{s.note}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}