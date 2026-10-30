import { useState, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { Video, Clock, Eye, Download, Search, Play, Edit3, Trash2, Upload, Save, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '@shared/components/Modal'
import MentorPageHeader from '../components/MentorPageHeader'
import { recordedSessionService } from '../services/mentorCrudService'

const MOCK_SESSIONS = [
  { id: 1, title: 'React Hooks - useState & useEffect', batch: 'Batch A - MERN', duration: '45:20', views: 22, date: 'Jan 10, 2025', size: '256 MB', url: '#' },
  { id: 2, title: 'Python Lists & Dicts Deep Dive', batch: 'Batch B - Python', duration: '38:15', views: 8, date: 'Jan 8, 2025', size: '189 MB', url: '#' },
  { id: 3, title: 'ML - Linear Regression Explained', batch: 'Batch C - AI/ML', duration: '52:30', views: 6, date: 'Jan 6, 2025', size: '312 MB', url: '#' },
  { id: 4, title: 'Node.js Express Routing', batch: 'Batch A - MERN', duration: '41:10', views: 18, date: 'Jan 3, 2025', size: '228 MB', url: '#' },
  { id: 5, title: 'Python Pandas Tutorial', batch: 'Batch B - Python', duration: '55:00', views: 7, date: 'Dec 30, 2024', size: '345 MB', url: '#' },
  { id: 6, title: 'React State Management', batch: 'Batch D - React', duration: '48:30', views: 14, date: 'Jan 12, 2025', size: '278 MB', url: '#' },
]

const ITEMS_PER_PAGE = 5

export default function MentorRecordedSessions() {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sessions, setSessions] = useState(MOCK_SESSIONS)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [editingSession, setEditingSession] = useState(null)
  const [viewingSession, setViewingSession] = useState(null)
  const [saving, setSaving] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [form, setForm] = useState({ title: '', batch: '', duration: '', size: '' })
  const recordingInputRef = useRef(null)
  const [recordingFile, setRecordingFile] = useState(null)

  const filtered = useMemo(() => {
    if (!searchQuery) return sessions
    return sessions.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.batch.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [sessions, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const openUploadModal = () => {
    setEditingSession(null)
    setForm({ title: '', batch: 'Batch A - MERN', duration: 'Auto-detected', size: '' })
    setRecordingFile(null)
    setModalOpen(true)
  }

  const openEditModal = (session) => {
    setEditingSession(session)
    setForm({ title: session.title, batch: session.batch, duration: session.duration, size: session.size })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return }
    if (!editingSession && !recordingFile) { toast.error('Select a recording file first'); return }
    setSaving(true)
    try {
      if (editingSession) {
        await recordedSessionService.update(editingSession.id, form)
        setSessions(prev => prev.map(s => s.id === editingSession.id ? { ...s, ...form } : s))
        toast.success('Session updated successfully')
      } else {
        const created = await recordedSessionService.create(form)
        setSessions(prev => [...prev, {
          id: created.id, title: form.title, batch: form.batch, duration: form.duration,
          views: 0, date: 'Just uploaded', size: form.size || '0 MB', url: '#'
        }])
        toast.success('Recording uploaded successfully')
      }
      setModalOpen(false)
    } catch { toast.error('Unable to save session') }
    finally { setSaving(false) }
  }

  const handleDelete = async (session) => {
    try {
      await recordedSessionService.remove(session.id)
      setSessions(prev => prev.filter(s => s.id !== session.id))
      toast.success('Session deleted successfully')
      setDeleteConfirm(null)
    } catch { toast.error('Unable to delete session') }
  }

  const handleDownload = (session) => {
    const fileUrl = session?.url || session?.recordingUrl || session?.recordingLink || session?.fileUrl || session?.videoUrl
    if (!fileUrl || fileUrl === '#') {
      toast.error(`Download unavailable: no file URL exists for "${session.title}".`)
      return
    }
    const filename = fileUrl.split('/').pop()?.split('?')[0] || `${session.title}.mp4`
    toast.loading(`Downloading ${filename}...`, { id: 'recording-download' })
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = filename
    link.rel = 'noopener'
    document.body.appendChild(link)
    link.click()
    link.remove()
    toast.success(`Download completed. File: ${filename}`, { id: 'recording-download' })
  }

  const handlePreview = (session) => {
    setPreviewUrl(session.url || '#')
    toast.success('Opening preview...')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-5 py-4 sm:py-5 lg:py-6">
      <MentorPageHeader
        title="Recorded Sessions"
        subtitle="Access and manage your recorded class sessions"
        actions={
          <button onClick={openUploadModal}
            className="inline-flex items-center gap-2 rounded-lg bg-[#f39924] px-4 py-2 text-xs font-bold text-[#133b5d] shadow-sm transition hover:bg-[#d97f0d]">
            <Upload className="h-4 w-4" /> Upload Recording
          </button>
        }
      />

      {/* Search */}
      <div className="relative mb-5 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Search sessions..." value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all" />
      </div>

      <div className="space-y-3">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Video className="w-12 h-12 mb-3 opacity-40" />
            <p className="text-sm font-medium">No sessions found</p>
          </div>
        ) : (
          paginated.map((session, i) => (
            <motion.div key={session.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}
              className="flex items-center gap-4 rounded-xl border border-slate-100 dark:border-slate-700/30 bg-white dark:bg-slate-900/40 p-4 hover:border-purple-500/25 transition-all group cursor-pointer"
              onClick={() => setViewingSession(session)}>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 flex items-center justify-center shrink-0">
                <Video className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{session.title}</h3>
                  <button onClick={(e) => { e.stopPropagation(); handlePreview(session) }}
                    className="p-1 rounded-lg bg-purple-100 dark:bg-purple-500/15 text-purple-600 opacity-0 group-hover:opacity-100 transition-all hover:bg-purple-200" title="Preview">
                    <Play className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{session.batch} · Recorded {session.date}</p>
                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {session.duration}</span>
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {session.views} views</span>
                  <span>{session.size}</span>
                </div>
              </div>
              <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                <button onClick={() => handleDownload(session)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-purple-600 transition-colors" title="Download">
                  <Download className="w-4 h-4" />
                </button>
                <button onClick={() => openEditModal(session)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-500 transition-colors" title="Edit">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteConfirm(session)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"><ChevronLeft className="w-4 h-4" /></button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button key={page} onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${currentPage === page ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{page}</button>
          ))}
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"><ChevronRight className="w-4 h-4" /></button>
        </div>
      )}

      {/* Upload/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingSession ? 'Edit Recording' : 'Upload Recording'}
        description={editingSession ? 'Update recording details' : 'Upload a new recorded session'} size="md"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold hover:shadow-lg disabled:opacity-60 transition-all">
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        }>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Title *</label>
            <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. React Hooks Deep Dive"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all" />
          </div>
          <div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Batch</label>
              <select value={form.batch} onChange={e => setForm(p => ({ ...p, batch: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all">
                <option>Batch A - MERN</option><option>Batch B - Python</option><option>Batch C - AI/ML</option><option>Batch D - React</option>
              </select>
            </div>
          </div>
          {!editingSession && (
            <div>
              <input ref={recordingInputRef} type="file" accept="video/mp4,video/webm,video/quicktime" hidden onChange={(event) => { const file = event.target.files?.[0] || null; setRecordingFile(file); if (file) setForm((value) => ({ ...value, size: `${(file.size / (1024 * 1024)).toFixed(1)} MB` })) }} />
              <button type="button" className="w-full cursor-pointer rounded-lg border-2 border-dashed border-slate-200 p-6 text-center transition-colors hover:border-purple-500/50 focus:outline-none focus:ring-4 focus:ring-purple-500/15 dark:border-slate-700"
              onClick={() => recordingInputRef.current?.click()}>
                <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                <p className="text-sm font-medium text-slate-500 dark:text-slate-300">{recordingFile ? recordingFile.name : 'Click to upload video file'}</p>
                <p className="text-xs text-slate-400 mt-1">MP4, WebM, or MOV · Max 500MB</p>
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* View Modal */}
      <Modal open={!!viewingSession} onClose={() => setViewingSession(null)} title={viewingSession?.title} description="Recording details" size="md"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button onClick={() => setViewingSession(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Close</button>
            <button onClick={() => handleDownload(viewingSession)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold hover:shadow-lg transition-all">
              <Download className="w-4 h-4" /> Download
            </button>
          </div>
        }>
        {viewingSession && (
          <div className="space-y-4">
            <div className="aspect-video rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center cursor-pointer"
              onClick={() => handlePreview(viewingSession)}>
              <Play className="w-16 h-16 text-purple-500/60 hover:text-purple-500 transition-colors" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3 text-center">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{viewingSession.duration}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">Duration</p>
              </div>
              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3 text-center">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{viewingSession.views}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">Views</p>
              </div>
              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3 text-center">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{viewingSession.size}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">Size</p>
              </div>
            </div>
            <div className="rounded-lg border border-slate-100 dark:border-slate-700/30 p-3">
              <p className="text-xs text-slate-400">Batch</p>
              <p className="text-sm font-medium text-slate-900 dark:text-white mt-0.5">{viewingSession.batch}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Recording" description="This action cannot be undone" size="sm"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
            <button onClick={() => handleDelete(deleteConfirm)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        }>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/15 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Are you sure you want to delete <strong className="text-slate-900 dark:text-white">{deleteConfirm?.title}</strong>?
          </p>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal open={!!previewUrl} onClose={() => setPreviewUrl(null)} title="Preview" description="Video preview" size="lg"
        footer={
          <button onClick={() => setPreviewUrl(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Close</button>
        }>
        <div className="aspect-video rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <div className="text-center">
            <Play className="w-20 h-20 mx-auto mb-3 text-purple-500/60" />
            <p className="text-sm text-slate-400">Video player would be rendered here</p>
          </div>
        </div>
      </Modal>
    </div>
  )
}
