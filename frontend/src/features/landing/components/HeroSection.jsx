import { useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'
import FloatingGlobe from './ThreeD/FloatingGlobe'
import ParticleField from './Background/ParticleField'
import useScrollAnimation from '../hooks/useScrollAnimation'

const stats = [
  { value: '20K+', label: 'Students Trained' },
  { value: '2.2K+', label: 'Placed' },
  { value: '95%', label: 'Success Rate' },
  { value: '50+', label: 'Expert Mentors' },
]

export default function HeroSection({ onOpenEnquiry }) {
  const sectionRef = useScrollAnimation({ animation: 'fadeIn', duration: 1 })
  const titleRef = useScrollAnimation({ animation: 'fadeUp', delay: 0.1 })
  const descRef = useScrollAnimation({ animation: 'fadeUp', delay: 0.2 })
  const ctaRef = useScrollAnimation({ animation: 'fadeUp', delay: 0.3 })
  const statsRef = useScrollAnimation({ animation: 'fadeUp', delay: 0.4 })

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center overflow-hidden bg-[#020617]"
    >
      {/* Background layers */}
      <ParticleField />
      <div className="absolute inset-0 bg-gradient-to-b from-[#2563EB]/5 via-transparent to-[#7C3AED]/5 pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#2563EB]/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#7C3AED]/10 blur-[150px] pointer-events-none" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(37,99,235,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#2563EB]/30 bg-[#2563EB]/10 text-sm font-medium text-[#38BDF8] mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-pulse" />
              India's #1 Career-First Tech Platform
            </motion.div>

            <motion.h1
              ref={titleRef}
              className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-[-0.03em] text-white"
            >
              Go from Coder to{' '}
              <span className="bg-gradient-to-r from-[#2563EB] via-[#38BDF8] to-[#06B6D4] bg-clip-text text-transparent">
                Employed Engineer
              </span>{' '}
              in 6 Months.
            </motion.h1>

            <motion.p
              ref={descRef}
              className="mt-5 text-lg leading-relaxed text-slate-400 max-w-[540px]"
            >
              Live training, 1:1 mentorship from industry experts, and placement support
              that doesn't stop until you're hired.
            </motion.p>

            <motion.div ref={ctaRef} className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={onOpenEnquiry}
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white font-bold text-sm overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(37,99,235,0.4)]"
              >
                <span className="absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.15)_50%,transparent_70%)] bg-[length:200%_100%] group-hover:animate-[shine_0.8s_ease-out]" />
                <span className="relative z-10 flex items-center gap-2">
                  Book Free Consultation
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              <a
                href="#stories"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-slate-700 bg-white/5 text-white font-semibold text-sm backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-[#2563EB]/30"
              >
                <Play className="w-4 h-4 text-[#38BDF8]" />
                Watch Free Class
              </a>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-4 text-sm text-slate-500"
            >
              No commitment required · 24hr response · Free consultation
            </motion.p>

            {/* Stats */}
            <motion.div ref={statsRef} className="mt-10 grid grid-cols-4 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-xl sm:text-2xl font-black bg-gradient-to-r from-[#2563EB] to-[#38BDF8] bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-500 mt-1 leading-tight">
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: 3D Globe */}
          <div className="hidden lg:block relative h-[500px]">
            <div className="absolute inset-0 bg-gradient-to-r from-[#2563EB]/5 to-[#7C3AED]/5 rounded-full blur-3xl" />
            <FloatingGlobe className="relative z-10 h-full" />
          </div>
        </div>
      </div>
    </section>
  )
}
