import { useState, useMemo } from 'react'
import { FileText, Clock, CheckCircle, AlertCircle, Search, Filter, Upload, Save, Trash2, Eye, Send, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Modal from '@shared/components/Modal'
import { assignmentService } from '../services/employeeCrudService'

const MOCK_ASSIGNMENTS = [
  { id: 1, title: 'Build a REST API', course: 'Full Stack MERN', due: '2 days left', status: 'pending', grade: null },
  { id: 2, title: 'Data Cleaning Project', course: 'Python Data Science', due: 'Submitted', status: 'submitted', grade: 'A' },
  { id: 3, title: 'React Component Library', course: 'React Development', due: '5 days left', status: 'pending', grade: null },
  { id: 4, title: 'Neural Network Lab', course: 'AI & ML', due: 'Graded', status: 'graded', grade: '92%' },
  { id: 5, title: 'Express Middleware', course: 'Full Stack MERN', due: '1 week left', status: 'pending', grade: null },
]

const ITEMS_PER_PAGE = 5

export default function EmployeeAssignments() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [assignments, setAssignments] = useState(MOCK_ASSIGNMENTS)
  const [viewingAssignment, setViewingAssignment] = useState(null)
  const [submitModal, setSubmitModal] = useState(null)
  const [saving, setSaving] = useState(false)

  const filtered = useMemo(() => {
    let result = assignments
    if (searchQuery) result = result.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.course.toLowerCase().includes(searchQuery.toLowerCase()))
    if (filterStatus !== 'all') result = result.filter(a => a.status === filterStatus)
    return result
  }, [assignments, searchQuery, filterStatus])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleSubmit = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 500))
    setAssignments(prev => prev.map(a => a.id === submitModal?.id ? { ...a, status: 'submitted', due: 'Submitted' } : a))
    toast.success('Assignment submitted!')
    setSubmitModal(null)
    setSaving(false)
  }

  const handleSaveDraft = () => {
    toast.success('Draft saved!')
  }

  const handleUploadFile = () => {
    toast.success('File upload dialog opened (demo)')
  }

  const handleDelete = (id) => {
    setAssignments(prev => prev.filter(a => a.id !== id))
    toast.success('Submission deleted')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-5 py-4 sm:py-5 lg:py-6">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">Assignments</h1>
      <p className="text-sm text-slate-500 mb-6">View and submit your assignments</p>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search assignments..." value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          {['all', 'pending', 'submitted', 'graded'].map(tab => (
            <button key={tab} onClick={() => { setFilterStatus(tab); setCurrentPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${filterStatus === tab ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{tab}</button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <FileText className="w-12 h-12 mb-3 opacity-40" />
            <p className="text-sm font-medium">No assignments found</p>
          </div>
        ) : (
          paginated.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}
              className="rounded-xl border border-slate-100 dark:border-slate-700/30 bg-white dark:bg-slate-900/40 p-4 hover:border-blue-500/25 transition-all cursor-pointer"
              onClick={() => setViewingAssignment(a)}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-teal-500/10 flex items-center justify-center shrink-0"><FileText className="w-5 h-5 text-blue-600" /></div>
                  <div><h3 className="text-sm font-semibold text-slate-900 dark:text-white">{a.title}</h3><p className="text-xs text-slate-400 mt-0.5">{a.course}</p></div>
                </div>
                <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                  {a.grade && <p className="text-sm font-bold text-emerald-600">{a.grade}</p>}
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${a.status === 'pending' ? 'bg-amber-100 text-amber-700' : a.status === 'submitted' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>{a.status}</span>
                  {a.status === 'pending' && (
                    <button onClick={() => setSubmitModal(a)} className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-500/15 text-blue-600 hover:bg-blue-200 transition-colors" title="Submit">
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {(a.status === 'submitted' || a.status === 'graded') && (
                    <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {a.due}</span>
              </div>
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
      <Modal open={!!viewingAssignment} onClose={() => setViewingAssignment(null)} title={viewingAssignment?.title} description="Assignment details" size="md"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button onClick={() => setViewingAssignment(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Close</button>
            {viewingAssignment?.status === 'pending' && (
              <button onClick={() => { const a = viewingAssignment; setViewingAssignment(null); setSubmitModal(a) }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm font-semibold hover:shadow-lg transition-all">
                <Send className="w-4 h-4" /> Submit Assignment
              </button>
            )}
          </div>
        }>
        {viewingAssignment && (
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-100 dark:border-slate-700/30 p-3">
              <p className="text-xs text-slate-400">Course</p>
              <p className="text-sm font-medium text-slate-900 dark:text-white">{viewingAssignment.course}</p>
            </div>
            <div className="rounded-lg border border-slate-100 dark:border-slate-700/30 p-3">
              <p className="text-xs text-slate-400">Due</p>
              <p className="text-sm font-medium text-slate-900 dark:text-white">{viewingAssignment.due}</p>
            </div>
            <div className="rounded-lg border border-slate-100 dark:border-slate-700/30 p-3">
              <p className="text-xs text-slate-400">Status</p>
              <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded-full ${viewingAssignment.status === 'pending' ? 'bg-amber-100 text-amber-700' : viewingAssignment.status === 'submitted' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>{viewingAssignment.status}</span>
            </div>
            {viewingAssignment.grade && (
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-500/10 p-3 text-center">
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{viewingAssignment.grade}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">Grade</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Submit Modal */}
      <Modal open={!!submitModal} onClose={() => setSubmitModal(null)} title={`Submit: ${submitModal?.title}`} description="Upload your work" size="md"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button onClick={() => setSubmitModal(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
            <button onClick={handleSaveDraft}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              <Save className="w-4 h-4" /> Save Draft
            </button>
            <button onClick={handleSubmit} disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm font-semibold hover:shadow-lg disabled:opacity-60 transition-all">
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
              {saving ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        }>
        <div className="space-y-4">
          <div className="rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 p-6 text-center hover:border-blue-500/50 transition-colors cursor-pointer"
            onClick={handleUploadFile}>
            <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p className="text-sm font-medium text-slate-500">Click to upload your work</p>
            <p className="text-xs text-slate-400 mt-1">PDF, ZIP, or DOC · Max 50MB</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Notes (optional)</label>
            <textarea rows={3} placeholder="Add any notes about your submission..."
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-none" />
          </div>
        </div>
      </Modal>
    </div>
  )
}
