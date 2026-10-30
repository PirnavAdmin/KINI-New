import { useState, useMemo } from 'react'
import { ClipboardCheck, Clock, TrendingUp, Users, BarChart3, Search, Filter, Play, RefreshCw, ChevronLeft, ChevronRight, FileCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Modal from '@shared/components/Modal'

const MOCK_ASSESSMENTS = [
  { id: 1, title: 'MERN Stack Mid-Term', date: 'Jan 15, 2025', score: 85, highest: 98, status: 'completed', duration: '60 min' },
  { id: 2, title: 'Python Data Analysis Quiz', date: 'Jan 12, 2025', score: 78, highest: 95, status: 'completed', duration: '30 min' },
  { id: 3, title: 'React Component Quiz', date: 'Jan 20, 2025', score: null, highest: null, status: 'scheduled', duration: '45 min' },
  { id: 4, title: 'Node.js Unit Test', date: 'Jan 22, 2025', score: null, highest: null, status: 'scheduled', duration: '60 min' },
  { id: 5, title: 'TypeScript Fundamentals', date: 'Jan 5, 2025', score: 92, highest: 96, status: 'completed', duration: '45 min' },
]

const ITEMS_PER_PAGE = 5

export default function EmployeeAssessments() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [viewingAssessment, setViewingAssessment] = useState(null)
  const [resultsModal, setResultsModal] = useState(null)

  const filtered = useMemo(() => {
    let result = MOCK_ASSESSMENTS
    if (searchQuery) result = result.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
    if (filterStatus !== 'all') result = result.filter(a => a.status === filterStatus)
    return result
  }, [searchQuery, filterStatus])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleStart = (a) => {
    toast.success(`Starting "${a.title}"...`)
  }

  const handleResume = (a) => {
    toast.success(`Resuming "${a.title}"...`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-5 py-4 sm:py-5 lg:py-6">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">Assessments</h1>
      <p className="text-sm text-slate-500 mb-6">View your assessment results</p>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search assessments..." value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          {['all', 'completed', 'scheduled'].map(tab => (
            <button key={tab} onClick={() => { setFilterStatus(tab); setCurrentPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${filterStatus === tab ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{tab}</button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <ClipboardCheck className="w-12 h-12 mb-3 opacity-40" />
            <p className="text-sm font-medium">No assessments found</p>
          </div>
        ) : (
          paginated.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}
              className="rounded-xl border border-slate-100 dark:border-slate-700/30 bg-white dark:bg-slate-900/40 p-4 hover:border-blue-500/25 transition-all cursor-pointer"
              onClick={() => setViewingAssessment(a)}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-teal-500/10 flex items-center justify-center shrink-0"><ClipboardCheck className="w-5 h-5 text-blue-600" /></div>
                  <div><h3 className="text-sm font-semibold text-slate-900 dark:text-white">{a.title}</h3><p className="text-xs text-slate-400 mt-0.5">{a.date} · {a.duration}</p></div>
                </div>
                <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                  {a.score ? (
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{a.score}%</p>
                      <button onClick={() => { setViewingAssessment(null); setResultsModal(a) }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-500 transition-colors" title="View Results">
                        <FileCheck className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-blue-100 text-blue-700">Scheduled</span>
                      <button onClick={() => handleStart(a)} className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-500/15 text-blue-600 hover:bg-blue-200 transition-colors" title="Start Assessment">
                        <Play className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              {a.score && <div className="mt-3 flex items-center gap-4 text-xs text-slate-400"><span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-emerald-500" /> Score: {a.score}%</span><span className="flex items-center gap-1"><BarChart3 className="w-3 h-3 text-blue-500" /> Highest: {a.highest}%</span></div>}
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

      {/* View Modal */}
      <Modal open={!!viewingAssessment} onClose={() => setViewingAssessment(null)} title={viewingAssessment?.title} description="Assessment details" size="md"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button onClick={() => setViewingAssessment(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Close</button>
            {viewingAssessment?.status === 'scheduled' && (
              <>
                <button onClick={() => { handleResume(viewingAssessment); setViewingAssessment(null) }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                  <RefreshCw className="w-4 h-4" /> Resume
                </button>
                <button onClick={() => { handleStart(viewingAssessment); setViewingAssessment(null) }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm font-semibold hover:shadow-lg transition-all">
                  <Play className="w-4 h-4" /> Start Assessment
                </button>
              </>
            )}
            {viewingAssessment?.status === 'completed' && (
              <button onClick={() => { const a = viewingAssessment; setViewingAssessment(null); setResultsModal(a) }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm font-semibold hover:shadow-lg transition-all">
                <FileCheck className="w-4 h-4" /> View Results
              </button>
            )}
          </div>
        }>
        {viewingAssessment && (
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-100 dark:border-slate-700/30 p-3">
              <p className="text-xs text-slate-400">Date</p>
              <p className="text-sm font-medium text-slate-900 dark:text-white">{viewingAssessment.date}</p>
            </div>
            <div className="rounded-lg border border-slate-100 dark:border-slate-700/30 p-3">
              <p className="text-xs text-slate-400">Duration</p>
              <p className="text-sm font-medium text-slate-900 dark:text-white">{viewingAssessment.duration}</p>
            </div>
            <div className="rounded-lg border border-slate-100 dark:border-slate-700/30 p-3">
              <p className="text-xs text-slate-400">Status</p>
              <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${viewingAssessment.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{viewingAssessment.status}</span>
            </div>
            {viewingAssessment.score && (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-500/10 p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{viewingAssessment.score}%</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">Score</p>
                </div>
                <div className="rounded-lg bg-blue-50 dark:bg-blue-500/10 p-3 text-center">
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{viewingAssessment.highest}%</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">Highest</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Results Modal */}
      <Modal open={!!resultsModal} onClose={() => setResultsModal(null)} title={`Results: ${resultsModal?.title}`} description="Your performance" size="md"
        footer={<button onClick={() => setResultsModal(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Close</button>}>
        {resultsModal && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-500/10 p-4 text-center">
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{resultsModal.score}%</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-1">Your Score</p>
              </div>
              <div className="rounded-lg bg-blue-50 dark:bg-blue-500/10 p-4 text-center">
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{resultsModal.highest}%</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-1">Highest</p>
              </div>
              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-4 text-center">
                <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">{resultsModal.duration}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-1">Duration</p>
              </div>
            </div>
            <div className="rounded-lg bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-500/5 dark:to-blue-500/5 p-4 text-center">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {resultsModal.score >= 80 ? 'Excellent performance! Keep it up!' : resultsModal.score >= 60 ? 'Good job! There is room for improvement.' : 'Keep practicing, you will improve!'}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
