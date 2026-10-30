import HrLiveBoundary from '@features/hr/components/HrLiveBoundary'
import { useState } from 'react'
import { Megaphone, Calendar, Pin, Search, Eye } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Modal from '@shared/components/Modal'

const MOCK_ANNOUNCEMENTS = [
  { id: 1, title: 'Q1 Performance Reviews Starting', body: 'All employees are required to submit their self-assessment by January 20th.', date: 'Jan 10, 2025', author: 'HR Team', pinned: true, read: false },
  { id: 2, title: 'New Course: Advanced TypeScript', body: 'Enrollments are now open for the Advanced TypeScript course starting next month.', date: 'Jan 8, 2025', author: 'Learning Team', pinned: false, read: false },
  { id: 3, title: 'Holiday Schedule Update', body: 'The office will remain closed on January 26th for Republic Day.', date: 'Jan 5, 2025', author: 'Admin', pinned: false, read: true },
  { id: 4, title: 'Platform Maintenance', body: 'The learning platform will be down for maintenance on Saturday from 2-4 AM.', date: 'Jan 3, 2025', author: 'IT Team', pinned: false, read: true },
]

function LegacyEmployeeAnnouncements() {
  const [announcements, setAnnouncements] = useState(MOCK_ANNOUNCEMENTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewingAnnouncement, setViewingAnnouncement] = useState(null)

  const filtered = announcements.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.body.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleMarkAsRead = (id) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, read: true } : a))
    toast.success('Marked as read')
  }

  const handleView = (announcement) => {
    setViewingAnnouncement(announcement)
    if (!announcement.read) handleMarkAsRead(announcement.id)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-5 py-4 sm:py-5 lg:py-6">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">Announcements</h1>
      <p className="text-sm text-slate-500 mb-6">Important updates and announcements</p>

      {/* Search */}
      <div className="relative mb-5 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Search announcements..." value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Megaphone className="w-12 h-12 mb-3 opacity-40" />
            <p className="text-sm font-medium">No announcements found</p>
          </div>
        ) : (
          filtered.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}
              className="rounded-xl border border-slate-100 dark:border-slate-700/30 bg-white dark:bg-slate-900/40 p-4 hover:border-blue-500/25 transition-all cursor-pointer"
              onClick={() => handleView(a)}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-teal-500/10 flex items-center justify-center shrink-0"><Megaphone className="w-5 h-5 text-blue-600" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{a.title}</h3>
                    {a.pinned && <Pin className="w-3.5 h-3.5 text-blue-600" />}
                    {!a.read && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{a.body}</p>
                  <div className="flex items-center gap-3 mt-3 text-[10px] text-slate-400">
                    <span>{a.author}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {a.date}</span>
                    {!a.read && (
                      <button onClick={(e) => { e.stopPropagation(); handleMarkAsRead(a.id) }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">
                        <Eye className="w-3 h-3" /> Mark Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* View Modal */}
      <Modal open={!!viewingAnnouncement} onClose={() => setViewingAnnouncement(null)} title={viewingAnnouncement?.title} description="Announcement details" size="md"
        footer={
          <button onClick={() => setViewingAnnouncement(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Close</button>
        }>
        {viewingAnnouncement && (
          <div className="space-y-4">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{viewingAnnouncement.body}</p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-700/30">
              <span>{viewingAnnouncement.author}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {viewingAnnouncement.date}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default function EmployeeAnnouncements() {
  return <HrLiveBoundary module="announcements" legacy={<LegacyEmployeeAnnouncements />} />
}
