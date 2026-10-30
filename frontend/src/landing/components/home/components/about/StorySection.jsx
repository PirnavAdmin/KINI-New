import { useRef, useState, useCallback, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { BookOpen, Users2, Code2, Briefcase, Rocket } from 'lucide-react'

const milestones = [
  {
    icon: BookOpen,
    tag: 'START',
    title: 'Build strong foundations from day one',
    desc: 'Start with the fundamentals and build your understanding step by step. No unnecessary complexity — just clear concepts, guided practice, and a strong foundation for your tech journey.',
    metric: 'Beginner friendly',
  },
  {
    icon: Users2,
    tag: 'LIVE LEARNING',
    title: 'Learn with people, not just videos',
    desc: 'Learn through instructor-led sessions, interactive discussions, regular doubt-clearing, and mentor guidance that keeps you moving forward.',
    metric: 'Live + mentor-led',
  },
  {
    icon: Code2,
    tag: 'PROJECTS',
    title: 'Build projects that demonstrate your skills',
    desc: 'Turn concepts into practical applications through hands-on projects designed around real development workflows, problem solving, and portfolio building.',
    metric: 'Hands-on projects',
  },
  {
    icon: Briefcase,
    tag: 'INDUSTRY READY',
    title: 'Practice the skills teams actually use',
    desc: 'Work with modern development tools, Git workflows, APIs, databases, debugging, collaboration, and practical development patterns used in real software projects.',
    metric: 'Industry-relevant skills',
  },
  {
    icon: Rocket,
    tag: 'CAREER PREPARATION',
    title: 'Prepare with confidence for your next opportunity',
    desc: 'Build a stronger resume, improve your portfolio, practice technical interviews, and develop the communication and problem-solving skills needed to approach the job market with confidence.',
    metric: 'Career-focused support',
  },
]

export default function StorySection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const onActivate = useCallback((index) => setActiveIndex(index), [])

  return (
    <section
      id="story"
      className="relative py-12 sm:py-16 bg-[linear-gradient(135deg,#A9D5F7_0%,#BCEAF2_52%,#D2F7EF_100%)] dark:bg-[linear-gradient(135deg,#0F172A_0%,#111827_50%,#0B1120_100%)]"
    >
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.02]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 50%, rgba(8,95,167,0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 50%, rgba(92,163,71,0.05) 0%, transparent 50%)
            `,
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="HOW YOU'LL LEARN"
          title="From learning fundamentals to career readiness"
          subtitle="A practical learning journey designed to help you build skills, projects, confidence, and career readiness step by step."
        />

        {/* Cards – full width, no timeline */}
        <div className="relative mt-16 flex flex-col gap-8">
          {milestones.map((m, i) => (
            <StoryStep
              key={m.tag}
              {...m}
              index={i}
              onActivate={onActivate}
              total={milestones.length}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function StoryStep({ icon: Icon, tag, title, desc, metric, index, onActivate, total }) {
  const ref = useRef(null)
  const inView = useInView(ref, { margin: '-40% 0px -40% 0px' })

  useEffect(() => {
    if (inView) onActivate(index)
  }, [inView, index, onActivate])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.4 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`relative rounded-[28px] border p-7 sm:p-8 lg:p-9 backdrop-blur-sm transition-all duration-500 ${
        inView
          ? 'border-[#133B5D]/20 dark:border-primary-500/20 bg-white/80 dark:bg-ink-900/80 shadow-card-lg'
          : 'border-white/30 dark:border-white/10 bg-white/40 dark:bg-ink-900/40 shadow-card'
      }`}
    >
      {/* Subtle left accent for active card */}
      <div
        className={`absolute left-0 top-0 w-1 h-full rounded-l-[28px] bg-gradient-to-b from-[#133B5D] via-[#2EA7E0] to-[#F39924] transition-opacity duration-500 ${
          inView ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#133B5D] to-[#F39924] text-white shadow-glow">
            <Icon size={19} />
          </span>
          <span className="eyebrow text-[#133B5D] dark:text-primary-300 lg:hidden">
            {tag}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Mobile stage indicator – stays visible on all screens now */}
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          <span className="rounded-full bg-white/70 dark:bg-ink-900/70 backdrop-blur-sm px-3 py-1 font-mono text-xs text-slate-700 dark:text-slate-300 border border-white/30 dark:border-white/10">
            {metric}
          </span>
        </div>
      </div>
      <h3 className="mt-6 font-display text-2xl font-semibold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
        {desc}
      </p>
    </motion.div>
  )
}

function SectionHeading({ eyebrow, title, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false }}
      transition={{ duration: 0.6 }}
      className="mx-auto max-w-2xl text-center"
    >
      <p className="eyebrow text-[#133B5D] dark:text-primary-300">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-[15px] leading-relaxed text-slate-700 dark:text-slate-400">
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}