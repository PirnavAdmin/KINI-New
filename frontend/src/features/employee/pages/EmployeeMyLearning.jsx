import { useState, useMemo } from 'react'
import { BookOpen, Play, Clock, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const MOCK_COURSES = [
  { id: 1, title: 'Advanced React Patterns', progress: 65, duration: '6h 30m', lessons: 12, completed: 8, provider: 'Frontend Masters' },
  { id: 2, title: 'Node.js Microservices Architecture', progress: 40, duration: '12h', lessons: 24, completed: 10, provider: 'Udemy' },
  { id: 3, title: 'Python for Data Science', progress: 80, duration: '8h', lessons: 16, completed: 13, provider: 'Coursera' },
  { id: 4, title: 'TypeScript Deep Dive', progress: 25, duration: '4h', lessons: 8, completed: 2, provider: 'Pluralsight' },
  { id: 5, title: 'AWS Solutions Architect', progress: 10, duration: '20h', lessons: 40, completed: 4, provider: 'AWS Training' },
  { id: 6, title: 'System Design Fundamentals', progress: 50, duration: '10h', lessons: 20, completed: 10, provider: 'Educative' },
]

const ITEMS_PER_PAGE = 6

export default function EmployeeMyLearning() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const filtered = useMemo(() => {
    if (!searchQuery) return MOCK_COURSES
    return MOCK_COURSES.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.provider.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [searchQuery])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleContinue = (course) => {
    navigate(`/employee/my-learning?course=${course.id}`)
    toast.success(`Continuing "${course.title}"`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-5 py-4 sm:py-5 lg:py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">My Learning</h1>
          <p className="mt-1 text-sm text-slate-500">Continue your learning journey</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Search courses..." value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginated.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400">
            <BookOpen className="w-12 h-12 mb-3 opacity-40" />
            <p className="text-sm font-medium">No courses found</p>
          </div>
        ) : (
          paginated.map((course, i) => (
            <motion.div key={course.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}
              className="rounded-2xl border border-slate-200/80 dark:border-slate-700/40 bg-white dark:bg-slate-900/60 p-5 hover:shadow-md hover:border-blue-500/25 transition-all group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/10 to-teal-500/10 flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{course.title}</h3>
              </div>
              <p className="text-xs text-slate-400 mb-3">{course.provider}</p>
              <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration}</span>
                <span>{course.completed}/{course.lessons} lessons</span>
              </div>
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1"><span>Progress</span><span>{course.progress}%</span></div>
                <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-teal-500" style={{ width: `${course.progress}%` }} />
                </div>
              </div>
              <button onClick={() => handleContinue(course)}
                className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">
                <Play className="w-3 h-3" /> Continue Learning
              </button>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-all"><ChevronLeft className="w-4 h-4" /></button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button key={page} onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${currentPage === page ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{page}</button>
          ))}
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-all"><ChevronRight className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  )
}
