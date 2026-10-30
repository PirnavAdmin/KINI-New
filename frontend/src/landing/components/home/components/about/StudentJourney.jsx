import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { BookOpen, Wrench, FolderGit2, ClipboardCheck, GraduationCap, Trophy } from 'lucide-react'

const stages = [
  {
    num: '01',
    icon: BookOpen,
    label: 'Learn',
    note: 'Understand concepts with expert mentors',
    color: 'bg-[#133B5D]',
    ring: 'border-[#133B5D]/30',
    text: 'text-[#133B5D]',
  },
  {
    num: '02',
    icon: Wrench,
    label: 'Practice',
    note: 'Solve problems and strengthen your skills',
    color: 'bg-[#2EA7E0]',
    ring: 'border-[#2EA7E0]/30',
    text: 'text-[#2EA7E0]',
  },
  {
    num: '03',
    icon: FolderGit2,
    label: 'Build',
    note: 'Work on real projects and gain experience',
    color: 'bg-[#7DD3B2]',
    ring: 'border-[#7DD3B2]/30',
    text: 'text-[#7DD3B2]',
  },
  {
    num: '04',
    icon: ClipboardCheck,
    label: 'Assess',
    note: 'Test your skills and track progress',
    color: 'bg-[#F39924]',
    ring: 'border-[#F39924]/30',
    text: 'text-[#F39924]',
  },
  {
    num: '05',
    icon: GraduationCap,
    label: 'Prepare',
    note: 'Get career-ready with training & guidance',
    color: 'bg-[#F0765B]',
    ring: 'border-[#F0765B]/30',
    text: 'text-[#F0765B]',
  },
  {
    num: '06',
    icon: Trophy,
    label: 'Get Placed',
    note: 'Get placed in top companies',
    color: 'bg-[#F39924]',
    ring: 'border-[#F39924]/30',
    text: 'text-[#F39924]',
  },
]

const EASE = [0.22, 1, 0.36, 1]

export default function StudentJourney() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: false, amount: 0.3 })

  return (
    <section className="relative overflow-hidden bg-white py-10 sm:py-12 dark:bg-app-dark-gradient">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="eyebrow text-brand-blue dark:text-primary-300">YOUR JOURNEY</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">
            Student Journey to Placement
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
            Our structured approach ensures you learn, practice, and grow at every step of your career journey.
          </p>
        </motion.div>

        {/* Desktop horizontal timeline */}
        <div ref={ref} className="relative mt-8 hidden lg:block">
          {/* Connecting line */}
          <div className="absolute left-0 right-0 top-[28px] h-0.5 bg-slate-200 dark:bg-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-[#133B5D] via-[#2EA7E0] to-[#F39924]"
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              style={{ transformOrigin: 'left' }}
            />
          </div>

          <div className="relative grid grid-cols-6 gap-4">
            {stages.map((stage, i) => {
              const Icon = stage.icon
              return (
                <motion.div
                  key={stage.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.12, ease: EASE }}
                  className="flex flex-col items-center text-center"
                >
                  <div className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 ${stage.ring} bg-white dark:bg-ink-900 shadow-card`}>
                    <Icon size={22} className={stage.text} />
                  </div>
                  <p className="mt-3 font-mono text-xs font-bold text-slate-400 dark:text-slate-500">{stage.num}</p>
                  <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{stage.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{stage.note}</p>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Mobile vertical timeline */}
        <div className="mt-8 space-y-0 lg:hidden">
          {stages.map((stage, i) => {
            const Icon = stage.icon
            return (
              <motion.div
                key={stage.label}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="relative flex items-start gap-4"
              >
                <div className="flex flex-col items-center">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${stage.ring} bg-white dark:bg-ink-900`}>
                    <Icon size={18} className={stage.text} />
                  </div>
                  {i < stages.length - 1 && (
                    <div className="h-10 w-0.5 bg-slate-300/70 dark:bg-white/10" />
                  )}
                </div>

                <div className="flex-1 rounded-2xl border border-slate-200 p-4 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-xs font-bold ${stage.text}`}>{stage.num}</span>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{stage.label}</p>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{stage.note}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
