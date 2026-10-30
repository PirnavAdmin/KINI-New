import { motion } from 'framer-motion'
import { BookOpen, Clock, BarChart3, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const RECOMMENDATIONS = [
  {
    id: 1, title: 'Advanced JavaScript Patterns', duration: '8 hours', level: 'Advanced',
    gradient: 'from-[#F59E0B] to-[#D97706]', category: 'Web Development',
  },
  {
    id: 2, title: 'React Performance Optimization', duration: '6 hours', level: 'Intermediate',
    gradient: 'from-[#2563EB] to-[#1D4ED8]', category: 'Frontend',
  },
  {
    id: 3, title: 'System Design Fundamentals', duration: '10 hours', level: 'Intermediate',
    gradient: 'from-[#8B5CF6] to-[#6D28D9]', category: 'Computer Science',
  },
]

export default function CourseRecommendations({ assessment }) {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/40 rounded-2xl sm:rounded-3xl p-5 sm:p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-[#2563EB]" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Recommended Courses</h2>
          <p className="text-[11px] text-slate-400">Continue your learning journey</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {RECOMMENDATIONS.map((course, i) => (
          <motion.button
            key={course.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 + i * 0.05 }}
            onClick={() => navigate('/courses')}
            className="group text-left relative overflow-hidden rounded-xl p-4 border border-slate-100 dark:border-slate-700/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${course.gradient} opacity-5 dark:opacity-10 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity`} />
            <div className="relative z-10">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${course.gradient} flex items-center justify-center mb-2`}>
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-1.5 line-clamp-2">{course.title}</h3>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span className="flex items-center gap-0.5">
                  <Clock className="w-3 h-3" /> {course.duration}
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">{course.level}</span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <button
        onClick={() => navigate('/courses')}
        className="w-full mt-3 flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-[#2563EB] bg-blue-50 dark:bg-blue-500/10 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all"
      >
        View All Courses <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  )
}
