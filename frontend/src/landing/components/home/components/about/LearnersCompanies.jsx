import { motion } from 'framer-motion'
import { Target, Eye } from 'lucide-react'
import { useThemeContext } from '@landing-shared/context/ThemeContext'

// Files in /public are served from the site root, so these are plain
// absolute paths rather than imports (Vite does not bundle /public assets).
const MISSION_IMAGE_URL = '/our-mission.webp'
const VISION_IMAGE_URL = '/our-vision.webp'

const cards = [
  {
    key: 'mission',
    icon: Target,
    label: 'Our Mission',
    accent: 'text-brand-blue',
    chip: 'bg-brand-blue/10',
    bar: 'bg-gradient-to-r from-brand-blue to-primary-400',
    glow: 'hover:shadow-[0_24px_48px_-12px_rgba(37,99,235,0.28)]',
    heading: 'Turn Potential into Job-Ready Skills.',
    copy: 'At Kini Edx Hub, we provide practical, industry-focused technology training through real-world projects, expert mentorship, and hands-on learning. We help students gain the skills and internship experience needed to become job-ready technology professionals.',
    tagline: 'Learn. Build. Intern. Get Job-Ready.',
    image: MISSION_IMAGE_URL,
    alt: 'Students collaborating and learning together',
  },
  {
    key: 'vision',
    icon: Eye,
    label: 'Our Vision',
    accent: 'text-brand-green',
    chip: 'bg-brand-green/10',
    bar: 'bg-gradient-to-r from-brand-green to-secondary-400',
    glow: 'hover:shadow-[0_24px_48px_-12px_rgba(5,150,105,0.24)]',
    heading: 'Build the Next Generation of Tech Talent.',
    copy: 'Our vision is to bridge the gap between education and industry by providing practical training, internships, career guidance, and placement assistance. We empower students to build strong technology skills and pursue successful careers in the IT industry.',
    tagline: 'Learn Skills. Gain Experience. Build Your Career.',
    image: VISION_IMAGE_URL,
    alt: 'Future technology and innovation',
  },
]

export default function MissionVision() {
  const { isDark } = useThemeContext()

  return (
    <section
      className="relative overflow-hidden py-12 sm:py-16"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #0F172A 0%, #111827 50%, #0B1120 100%)'
          : 'linear-gradient(135deg, #EAF5FF 0%, #DFF5F0 45%, #F6FFF9 100%)',
      }}
    >
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-brand-blue/15 blur-[130px] dark:bg-brand-blue/10" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-brand-green/10 blur-[130px]" />

      <div className="relative mx-auto max-w-5xl px-6">
        {/* ─── NEW MAIN HEADING ─── */}
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-3xl font-extrabold tracking-tight text-ink-900 dark:text-white sm:text-4xl md:text-5xl"
          >
            Our Mission &amp; Vision
          </motion.h1>

          <div className="mt-2">
            <p className="eyebrow text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Guiding Principles
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold text-ink-900 dark:text-white sm:text-3xl">
              Where ambition becomes a career
            </h2>
            <p className="mt-2 text-[15px] text-slate-600 dark:text-slate-400">
              Two commitments that shape everything we build at Kini Edx Hub.
            </p>
          </div>
        </div>

        <div className="relative mt-14 grid grid-cols-1 gap-7 md:grid-cols-2 md:gap-9">
          <div className="pointer-events-none absolute inset-y-2 left-1/2 z-10 hidden w-px -translate-x-1/2 bg-ink-900/10 dark:bg-white/10 md:block" />

          {cards.map((c, i) => (
            <motion.article
              key={c.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.4 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
              className={`relative flex min-w-0 flex-col overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-slate-200 transition-transform duration-300 hover:-translate-y-1.5 dark:bg-ink-900 dark:ring-white/10 ${c.glow}`}
            >
              <div className={`h-[3px] w-full ${c.bar}`} />

              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <img
                  src={c.image}
                  alt={c.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/80 via-white/0 to-transparent dark:from-ink-900/80 dark:via-ink-900/0" />
                <span className="absolute left-3.5 top-3.5 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 pl-1.5 shadow-sm backdrop-blur-sm dark:bg-ink-900/80">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${c.chip} ${c.accent}`}>
                    <c.icon size={13} />
                  </span>
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${c.accent}`}>
                    {c.label}
                  </span>
                </span>
              </div>

              <div className="relative -mt-7 flex flex-1 flex-col gap-3 px-6 pb-7 pt-0 sm:px-7">
                <h3 className="font-display text-xl font-bold leading-snug text-ink-900 dark:text-white sm:text-[22px]">
                  {c.heading}
                </h3>
                <p className="text-[14.5px] leading-relaxed text-slate-600 dark:text-slate-400">
                  {c.copy}
                </p>
                {/* Tagline pill */}
                <div className="mt-1">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider ${c.chip} ${c.accent}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${c.key === 'mission' ? 'bg-brand-blue' : 'bg-brand-green'}`} />
                    {c.tagline}
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}