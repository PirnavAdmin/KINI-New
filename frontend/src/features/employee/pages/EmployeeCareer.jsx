import { motion } from 'framer-motion'
import { TrendingUp, CheckCircle, CircleDot } from 'lucide-react'

export default function EmployeeCareer() {
  const steps = [
    { title: 'Associate Engineer', period: '2021 - 2022', completed: true, desc: 'Built foundational skills in web development' },
    { title: 'Software Engineer', period: '2022 - 2024', completed: true, desc: 'Led frontend development for 3 major projects' },
    { title: 'Senior Engineer', period: '2024 - Present', completed: false, current: true, desc: 'Architecting scalable solutions and mentoring juniors' },
    { title: 'Tech Lead', period: 'Next milestone', completed: false, desc: 'Leading technical strategy and team growth' },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-5 py-4 sm:py-5 lg:py-6">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">Career Path</h1>
      <p className="text-sm text-slate-500 mb-6">Your professional journey</p>
      <div className="relative">
        <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-blue-500 via-teal-500 to-slate-200 dark:to-slate-700" />
        <div className="space-y-0">
          {steps.map((step, i) => (
            <motion.div key={step.title} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 * i }}
              className="relative flex items-start gap-4 pb-8 last:pb-0">
              <div className={`relative z-10 w-[38px] h-[38px] rounded-full flex items-center justify-center shrink-0 ${step.current ? 'bg-gradient-to-br from-blue-500 to-teal-500 shadow-lg shadow-blue-500/20 ring-2 ring-white dark:ring-slate-900' : step.completed ? 'bg-teal-500' : 'bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600'}`}>
                {step.completed ? <CheckCircle className="w-[18px] h-[18px] text-white" /> : step.current ? <CircleDot className="w-[18px] h-[18px] text-white" /> : <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />}
              </div>
              <div className="pt-1.5">
                <p className={`text-sm font-semibold ${step.current ? 'text-blue-600 dark:text-blue-400' : step.completed ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}`}>{step.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{step.period}</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{step.desc}</p>
              </div>
              {step.current && <span className="absolute -right-1 top-2 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">Current</span>}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
