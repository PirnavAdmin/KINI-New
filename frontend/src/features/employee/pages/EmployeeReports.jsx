import { FileText, Download, Eye } from 'lucide-react'
import { motion } from 'framer-motion'

export default function EmployeeReports() {
  const reports = [
    { id: 1, title: 'Q4 Performance Review', type: 'Performance', date: 'Jan 5, 2025', size: '245 KB' },
    { id: 2, title: 'Skills Assessment Report', type: 'Skills', date: 'Dec 20, 2024', size: '180 KB' },
    { id: 3, title: 'Learning Progress Report', type: 'Learning', date: 'Dec 15, 2024', size: '320 KB' },
    { id: 4, title: 'Attendance Summary', type: 'Attendance', date: 'Dec 1, 2024', size: '120 KB' },
  ]

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">Reports</h1>
      <p className="mb-3 text-sm text-slate-500">Access your reports and analytics</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {reports.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}
            className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3.5 py-2.5 shadow-sm transition-all hover:border-blue-500/25 dark:border-slate-700/30 dark:bg-slate-900/40">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/10 to-teal-500/10"><FileText className="h-4 w-4 text-blue-600" /></div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{r.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{r.type} · {r.date} · {r.size}</p>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><Eye className="w-4 h-4" /></button>
              <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><Download className="w-4 h-4" /></button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
