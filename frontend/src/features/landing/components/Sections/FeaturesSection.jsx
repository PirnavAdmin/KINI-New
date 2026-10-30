import { motion } from 'framer-motion'
import useScrollAnimation from '../../hooks/useScrollAnimation'
import { Zap, Brain, Shield, Users, BarChart3, GraduationCap } from 'lucide-react'

const features = [
  { icon: Brain, title: 'AI-Powered Learning', desc: 'Personalized curriculum adapted to your skill level and learning pace using machine learning.' },
  { icon: Users, title: '1:1 Expert Mentorship', desc: 'Weekly sessions with industry professionals from FAANG and top startups.' },
  { icon: Zap, title: 'Live Projects', desc: 'Build production-grade applications that ship to real users and boost your portfolio.' },
  { icon: Shield, title: 'Placement Guarantee', desc: 'We don\'t stop until you\'re hired. Resume reviews, mock interviews, and job referrals.' },
  { icon: BarChart3, title: 'Progress Tracking', desc: 'Real-time dashboards showing your skill growth, project milestones, and hiring readiness.' },
  { icon: GraduationCap, title: 'Certifications', desc: 'Industry-recognized credentials upon completion to validate your expertise.' },
]

export default function FeaturesSection() {
  const titleRef = useScrollAnimation({ animation: 'fadeUp' })
  const gridRef = useScrollAnimation({ animation: 'fadeUp', delay: 0.2 })

  return (
    <section className="relative py-24 bg-[#020617] overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-[#2563EB]/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-[#7C3AED]/5 blur-[120px] rounded-full" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div ref={titleRef} className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#2563EB]/30 bg-[#2563EB]/10 text-xs font-semibold text-[#38BDF8]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-pulse" />
            Why Pirnav Edutech?
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-black text-white">
            Everything you need to{' '}
            <span className="bg-gradient-to-r from-[#2563EB] to-[#06B6D4] bg-clip-text text-transparent">
              land your dream job
            </span>
          </h2>
        </motion.div>

        <motion.div ref={gridRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="group relative p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm transition-all duration-300 hover:border-[#2563EB]/30 hover:bg-white/[0.04] hover:shadow-[0_0_30px_rgba(37,99,235,0.1)]"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2563EB]/20 to-[#7C3AED]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-6 h-6 text-[#38BDF8]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
