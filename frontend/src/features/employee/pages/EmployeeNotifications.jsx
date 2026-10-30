import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, CheckCircle, AlertCircle, MessageSquare, Award, Calendar, FileText, CheckCheck, Eye, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

// NOTE: the backend does not currently expose an employee-scoped notification
// endpoint (Swagger only documents /api/v1/notifications/{student|mentor|organization}/...).
// This page stays local-only until that endpoint exists — do not wire it to the
// mentor/student endpoints, which would silently show another role's data.
export default function EmployeeNotifications() {
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New assignment posted', desc: 'Build a REST API assignment is now available', time: '10 min ago', type: 'assignment', unread: true },
    { id: 2, title: 'Live session reminder', desc: 'React Hooks Deep Dive starts in 30 minutes', time: '30 min ago', type: 'reminder', unread: true },
    { id: 3, title: 'Assignment graded', desc: 'Your Data Cleaning Project received grade A', time: '2 hours ago', type: 'grade', unread: true },
    { id: 4, title: 'New resource available', desc: 'React Testing Guide published in resources', time: '5 hours ago', type: 'resource', unread: false },
    { id: 5, title: 'Certificate issued', desc: 'Full Stack Web Development certificate is ready', time: '1 day ago', type: 'certificate', unread: false },
  ])

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
    toast.success('All notifications marked as read')
  }

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n))
    toast.success('Marked as read')
  }

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    toast.success('Notification removed')
  }

  const unreadCount = notifications.filter(n => n.unread).length

  const typeConfig = {
    assignment: { bg: 'bg-amber-100 dark:bg-amber-500/15', icon: FileText, color: 'text-amber-600' },
    reminder: { bg: 'bg-blue-100 dark:bg-blue-500/15', icon: Calendar, color: 'text-blue-600' },
    grade: { bg: 'bg-emerald-100 dark:bg-emerald-500/15', icon: CheckCircle, color: 'text-emerald-600' },
    resource: { bg: 'bg-indigo-100 dark:bg-indigo-500/15', icon: FileText, color: 'text-indigo-600' },
    certificate: { bg: 'bg-purple-100 dark:bg-purple-500/15', icon: Award, color: 'text-purple-600' },
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-5 py-4 sm:py-5 lg:py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500">{unreadCount} unread · {notifications.length} total</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">
            <CheckCheck className="w-3.5 h-3.5" />Mark all read
          </button>
        )}
      </div>
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Bell className="w-16 h-16 mb-4 opacity-30" />
          <p className="text-sm font-medium">No notifications</p>
          <p className="text-xs mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n, i) => {
            const config = typeConfig[n.type] || typeConfig.assignment
            return (
              <motion.div key={n.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * i }}
                className={`flex items-start gap-3 rounded-xl p-4 transition-all ${n.unread ? 'bg-blue-50/50 dark:bg-blue-500/[0.03] border border-blue-200/50 dark:border-blue-500/10' : 'border border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}>
                <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
                  <config.icon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm ${n.unread ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>{n.title}</p>
                    <div className="flex items-center gap-1 shrink-0">
                      {n.unread && (
                        <button onClick={() => markAsRead(n.id)} className="p-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 transition-colors" title="Mark as read">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={() => deleteNotification(n.id)} className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{n.desc}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                </div>
                {n.unread && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1" />}
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
