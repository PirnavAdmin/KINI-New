import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, BookOpen, Award, Clock, CheckCircle2, Lock, ChevronRight, Zap, PlayCircle } from 'lucide-react'
import PageHeader from '@shared/components/PageHeader'
import Card from '@shared/components/Card'

const PATHS = [
  {
    title: 'Frontend Development Mastery',
    description: 'Complete path from HTML/CSS fundamentals to modern React frameworks',
    progress: 65, totalModules: 12, completedModules: 8, totalHours: '120h', difficulty: 'Intermediate', icon: BookOpen,
    modules: [
      { name: 'HTML & CSS Fundamentals', status: 'completed', lessons: 8, duration: '12h' },
      { name: 'JavaScript Core Concepts', status: 'completed', lessons: 12, duration: '20h' },
      { name: 'React.js Basics', status: 'completed', lessons: 10, duration: '18h' },
      { name: 'State Management', status: 'completed', lessons: 6, duration: '10h' },
      { name: 'React Hooks Deep Dive', status: 'in-progress', lessons: 8, duration: '14h' },
      { name: 'Advanced Patterns', status: 'locked', lessons: 10, duration: '16h' },
      { name: 'Testing & Quality', status: 'locked', lessons: 6, duration: '10h' },
      { name: 'Performance Optimization', status: 'locked', lessons: 8, duration: '12h' },
    ],
  },
  {
    title: 'Backend Engineering Path',
    description: 'Build scalable server-side applications with Node.js and databases',
    progress: 35, totalModules: 10, completedModules: 3, totalHours: '100h', difficulty: 'Advanced', icon: TrendingUp,
    modules: [
      { name: 'Node.js Fundamentals', status: 'completed', lessons: 10, duration: '15h' },
      { name: 'Express.js & REST APIs', status: 'completed', lessons: 8, duration: '12h' },
      { name: 'Database Design & SQL', status: 'completed', lessons: 10, duration: '14h' },
      { name: 'Authentication & Security', status: 'in-progress', lessons: 6, duration: '10h' },
      { name: 'Microservices Architecture', status: 'locked', lessons: 10, duration: '16h' },
      { name: 'Message Queues & Events', status: 'locked', lessons: 6, duration: '10h' },
    ],
  },
  {
    title: 'Data Science & AI',
    description: 'Master machine learning, data analysis, and AI applications',
    progress: 15, totalModules: 14, completedModules: 2, totalHours: '160h', difficulty: 'Expert', icon: Zap,
    modules: [
      { name: 'Python for Data Science', status: 'completed', lessons: 10, duration: '15h' },
      { name: 'Statistics & Probability', status: 'completed', lessons: 8, duration: '12h' },
      { name: 'Machine Learning Basics', status: 'in-progress', lessons: 12, duration: '20h' },
      { name: 'Deep Learning', status: 'locked', lessons: 14, duration: '24h' },
      { name: 'NLP & LLMs', status: 'locked', lessons: 10, duration: '18h' },
    ],
  },
]

export default function StudentLearningPaths() {
  const [expandedPath, setExpandedPath] = useState(null)

  return (
    <div className="w-full max-w-none px-0 py-0">
      <PageHeader compact title="Learning Paths" subtitle="Guided learning journeys to achieve your career goals" icon={TrendingUp} />

      <div className="mb-3 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {[
          { label: 'Enrolled Paths', value: PATHS.length, icon: BookOpen, color: '#0f55f7' },
          { label: 'Modules Completed', value: PATHS.reduce((a, p) => a + p.completedModules, 0), icon: CheckCircle2, color: '#06b6a8' },
          { label: 'Learning Hours', value: PATHS.reduce((a, p) => a + parseInt(p.totalHours), 0) + 'h', icon: Clock, color: '#F59E0B' },
          { label: 'Certifications', value: '2', icon: Award, color: '#06b6a8' },
        ].map((stat, i) => (
          <Card key={stat.label} delay={i * 0.05} padding="p-3" className="border-transparent bg-white/95 shadow-[0_8px_24px_rgba(15,23,42,0.055)] ring-1 ring-slate-900/[0.05] dark:ring-white/[0.07]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${stat.color}15` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-2.5">
        {PATHS.map((path, i) => (
          <motion.div key={path.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card padding="p-3" hover className="border-transparent bg-white/95 shadow-[0_10px_28px_rgba(15,23,42,0.055)] ring-1 ring-slate-900/[0.05] dark:ring-white/[0.07]" onClick={() => setExpandedPath(expandedPath === path.title ? null : path.title)}>
              <div className={`flex items-center justify-between gap-4 ${expandedPath === path.title ? 'mb-4' : ''}`}>
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#0f55f7]/10 to-[#06b6a8]/10">
                    <path.icon className="h-5 w-5 text-[#0f55f7]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{path.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        path.difficulty === 'Beginner' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600' :
                        path.difficulty === 'Intermediate' ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600' :
                        'bg-rose-100 dark:bg-rose-500/10 text-rose-600'
                      }`}>{path.difficulty}</span>
                    </div>
                    <p className="text-xs text-slate-400">{path.description}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                      <span>{path.totalModules} modules</span>
                      <span>{path.totalHours} total</span>
                      <span>{path.completedModules}/{path.totalModules} completed</span>
                    </div>
                  </div>
                </div>
                <div className="w-28 shrink-0 text-right">
                  <p className="text-lg font-bold text-[#0f55f7]">{path.progress}%</p>
                  <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#0f55f7] to-[#06b6a8]" style={{ width: `${path.progress}%` }} />
                  </div>
                  <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-[#0f55f7]">
                    {expandedPath === path.title ? 'Hide modules' : 'View modules'}
                    <ChevronRight className={`h-3.5 w-3.5 transition-transform ${expandedPath === path.title ? 'rotate-90' : ''}`} />
                  </span>
                </div>
              </div>

              {expandedPath === path.title && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                  <div className="space-y-1">
                    {path.modules.map((mod) => (
                      <div key={mod.name} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                        mod.status === 'locked' ? 'opacity-50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer'
                      }`}>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          mod.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-500/10' :
                          mod.status === 'in-progress' ? 'bg-[#0f55f7]/10' :
                          'bg-slate-100 dark:bg-slate-800'
                        }`}>
                          {mod.status === 'completed' ? <CheckCircle2 className="w-3.5 h-3.5 text-[#06b6a8]" /> :
                           mod.status === 'in-progress' ? <PlayCircle className="w-3.5 h-3.5 text-[#0f55f7]" /> :
                           <Lock className="w-3.5 h-3.5 text-slate-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium ${mod.status === 'locked' ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>{mod.name}</p>
                          <p className="text-[10px] text-slate-400">{mod.lessons} lessons · {mod.duration}</p>
                        </div>
                        {mod.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-[#06b6a8]" />}
                        {mod.status === 'in-progress' && <ChevronRight className="w-4 h-4 text-[#0f55f7]" />}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}



