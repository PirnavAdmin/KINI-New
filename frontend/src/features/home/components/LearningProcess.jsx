import { motion } from 'framer-motion'
import { FiBarChart2, FiBookOpen, FiCpu, FiGrid, FiLock } from 'react-icons/fi'

const roadmapSteps = [
  { icon: FiLock, label: 'Secure Access', text: 'Authentication & OTP', color: '#0F55F7' },
  { icon: FiGrid, label: 'Platform Setup', text: 'Organization Configuration', color: '#0F55F7' },
  { icon: FiBookOpen, label: 'Skill Development', text: 'Competency Mapping', color: '#06B6A8' },
  { icon: FiCpu, label: 'AI Guidance', text: 'Career Recommendations', color: '#06B6A8' },
  { icon: FiBarChart2, label: 'Insights', text: 'Progress Reports', color: '#06B6A8' },
]

function LearningProcess() {
  return (
    <section id="sprints" className="mx-auto max-w-[1450px] px-5 py-3 lg:px-8">
      <div className="glass-panel rounded-[22px] px-4 py-4 lg:px-6">
        <div className="mb-5 text-center">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#0F55F7]">Frontend Roadmap</p>
          <h2 className="mt-1 text-xl font-extrabold text-[#071827] sm:text-2xl">
            Structured Career Platform Roadmap
          </h2>
        </div>

        <div className="overflow-x-auto pb-1">
          <div className="relative mx-auto grid min-w-[820px] max-w-[1080px] grid-cols-5 gap-3">
            <div className="absolute left-[10%] right-[10%] top-5 h-0.5 bg-gradient-to-r from-[#0F55F7] via-[#0F55F7] to-[#06B6A8]" />

            {roadmapSteps.map((step, index) => {
              const Icon = step.icon

              return (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.42, delay: index * 0.06 }}
                  className="relative z-10 flex flex-col items-center text-center"
                >
                  <motion.span
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 3 + index * 0.12, repeat: Infinity, ease: 'easeInOut' }}
                    className="grid h-10 w-10 place-items-center rounded-full border border-[#F2E7DC] bg-white text-base soft-shadow"
                    style={{ color: step.color }}
                  >
                    <Icon />
                  </motion.span>
                  <p className="mt-3 text-xs font-extrabold text-[#34455D]">{step.label}</p>
                  <p className="mt-1 text-[10px] font-bold text-[#66758B]">{step.text}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default LearningProcess;