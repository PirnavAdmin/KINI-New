import HrLiveBoundary from '@features/hr/components/HrLiveBoundary'
import { useState } from 'react'
import { Plus, Edit3, Trash2, ChevronLeft, ChevronRight, Save, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Modal from '@shared/components/Modal'
import { calendarService } from '../services/employeeCrudService'

const MOCK_EVENTS = [
  { id: 1, title: 'Live: React Hooks Deep Dive', type: 'class', date: 'Today', time: '3:00 PM - 4:30 PM' },
  { id: 2, title: 'Assignment Due: REST API', type: 'task', date: 'Today', time: '11:59 PM' },
  { id: 3, title: 'Office Hours - Q&A Session', type: 'office', date: 'Tomorrow', time: '10:00 AM - 11:00 AM' },
  { id: 4, title: 'Python Data Science Quiz', type: 'assessment', date: 'Wed, 15 Jan', time: '2:00 PM - 3:00 PM' },
  { id: 5, title: 'Performance Review Meeting', type: 'meeting', date: 'Thu, 16 Jan', time: '11:00 AM - 12:00 PM' },
  { id: 6, title: 'Team Standup', type: 'meeting', date: 'Fri, 17 Jan', time: '9:00 AM - 9:30 AM' },
]

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function LegacyEmployeeCalendar() {
  const [events, setEvents] = useState(MOCK_EVENTS)
  const [currentMonth, setCurrentMonth] = useState('January 2025')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [editingEvent, setEditingEvent] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'class', date: '', time: '' })

  const goToPrevMonth = () => {
    const [name, yearStr] = currentMonth.split(' ')
    const year = parseInt(yearStr)
    const idx = months.indexOf(name)
    if (idx === 0) setCurrentMonth(`${months[11]} ${year - 1}`)
    else setCurrentMonth(`${months[idx - 1]} ${year}`)
    toast.success('Previous month')
  }

  const goToNextMonth = () => {
    const [name, yearStr] = currentMonth.split(' ')
    const year = parseInt(yearStr)
    const idx = months.indexOf(name)
    if (idx === 11) setCurrentMonth(`${months[0]} ${year + 1}`)
    else setCurrentMonth(`${months[idx + 1]} ${year}`)
    toast.success('Next month')
  }

  const goToToday = () => {
    const now = new Date()
    setCurrentMonth(`${months[now.getMonth()]} ${now.getFullYear()}`)
    toast.success('Showing today')
  }

  const openAddModal = () => {
    setEditingEvent(null)
    setForm({ title: '', type: 'class', date: '', time: '' })
    setModalOpen(true)
  }

  const openEditModal = (event) => {
    setEditingEvent(event)
    setForm({ title: event.title, type: event.type, date: event.date, time: event.time })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.date.trim()) { toast.error('Title and date are required'); return }
    setSaving(true)
    try {
      if (editingEvent) {
        await calendarService.update(editingEvent.id, form)
        setEvents(prev => prev.map(e => e.id === editingEvent.id ? { ...e, ...form } : e))
        toast.success('Event updated')
      } else {
        const created = await calendarService.create(form)
        setEvents(prev => [...prev, { id: created.id, title: form.title, type: form.type, date: form.date, time: form.time || 'TBD' }])
        toast.success('Event added')
      }
      setModalOpen(false)
    } catch { toast.error('Unable to save') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      await calendarService.remove(deleteConfirm.id)
      setEvents(prev => prev.filter(e => e.id !== deleteConfirm.id))
      toast.success('Event deleted')
      setDeleteConfirm(null)
    } catch { toast.error('Unable to delete') }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-5 py-4 sm:py-5 lg:py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Calendar</h1>
          <p className="text-sm text-slate-500">Your schedule and events</p>
        </div>
        <button onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all self-start">
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <button onClick={goToPrevMonth}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white min-w-[160px] text-center">{currentMonth}</h2>
          <button onClick={goToNextMonth}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <button onClick={goToToday}
          className="px-3 py-2 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all">
          Today
        </button>
      </div>

      <div className="space-y-3">
        {events.map((e, i) => (
          <motion.div key={e.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i }}
            className="flex items-center gap-4 rounded-xl border border-slate-100 dark:border-slate-700/30 bg-white dark:bg-slate-900/40 p-4 hover:border-blue-500/25 transition-all group">
            <div className="w-0.5 h-12 rounded-full bg-blue-500 shrink-0" />
            <div className="min-w-0 flex-1"><h3 className="text-sm font-semibold text-slate-900 dark:text-white">{e.title}</h3><p className="text-xs text-slate-400 mt-0.5">{e.date} · {e.time}</p></div>
            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full shrink-0 ${e.type === 'class' ? 'bg-purple-100 text-purple-700' : e.type === 'task' ? 'bg-amber-100 text-amber-700' : e.type === 'assessment' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{e.type}</span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
              <button onClick={() => openEditModal(e)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-500 transition-colors" title="Edit">
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setDeleteConfirm(e)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingEvent ? 'Edit Event' : 'Add Event'}
        description={editingEvent ? 'Update event details' : 'Add a new event to your calendar'} size="md"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm font-semibold hover:shadow-lg disabled:opacity-60 transition-all">
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        }>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Title *</label>
            <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Event title"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Type</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all">
                <option value="class">Class</option><option value="task">Task</option><option value="office">Office Hours</option><option value="assessment">Assessment</option><option value="meeting">Meeting</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Date *</label>
              <input type="text" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} placeholder="e.g. Today, Tomorrow"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Time</label>
            <input type="text" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} placeholder="e.g. 3:00 PM - 4:30 PM"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" />
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Event" description="This action cannot be undone" size="sm"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
            <button onClick={handleDelete}
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
    </div>
  )
}

export default function EmployeeCalendar() {
  return <HrLiveBoundary module="calendar" legacy={<LegacyEmployeeCalendar />} />
}
