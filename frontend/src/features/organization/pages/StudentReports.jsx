import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, FileText, Download, Printer, FileBarChart, FileSpreadsheet, FileCheck } from 'lucide-react'
import { BATCH_STUDENTS } from '@shared/data/orgBatchesMockData'
import EmptyState from '@shared/components/EmptyState'

const reportsList = [
  { id: 'batch-report', title: 'Batch Report', desc: 'Complete batch performance overview.', icon: FileBarChart, color: 'from-[#0f55f7]/10 to-[#06b6a8]/10', iconColor: 'text-[#0f55f7]' },
  { id: 'student-report', title: 'Student Report', desc: 'Detailed student-wise performance.', icon: FileSpreadsheet, color: 'from-emerald-500/10 to-emerald-400/10', iconColor: 'text-emerald-600' },
  { id: 'assignment-report', title: 'Assignment Report', desc: 'Submission and scoring analysis.', icon: FileCheck, color: 'from-violet-500/10 to-violet-400/10', iconColor: 'text-violet-600' },
  { id: 'performance-report', title: 'Performance Report', desc: 'Comprehensive analytics.', icon: FileText, color: 'from-amber-500/10 to-amber-400/10', iconColor: 'text-amber-600' },
  { id: 'attendance-report', title: 'Attendance Report', desc: 'Attendance analytics and logs.', icon: FileText, color: 'from-rose-500/10 to-rose-400/10', iconColor: 'text-rose-600' },
]

export default function StudentReports() {
  const { batchId, studentId } = useParams()
  const navigate = useNavigate()
  const student = useMemo(() => (BATCH_STUDENTS[Number(batchId)] || []).find((s) => s.studentId === studentId), [batchId, studentId])
  if (!student) return <div className="px-4 py-12"><EmptyState icon={FileText} title="Student not found" /></div>

  return (
    <div className="w-full px-4 py-3 sm:px-5 lg:px-6 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(`/organization/batches/${batchId}/students/${studentId}`)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-[#0f55f7]/30 hover:text-[#0f55f7] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"><ArrowLeft className="h-4 w-4" /></button>
        <div><h1 className="text-lg font-bold text-slate-950 dark:text-white">Reports</h1><p className="text-xs text-slate-400">{student.name} · {student.studentId}</p></div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {reportsList.map((report, i) => {
          const Icon = report.icon
          return (
            <motion.div key={report.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-[16px] border border-slate-200/70 bg-white/95 p-4 dark:border-slate-700/60 dark:bg-slate-900/80 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${report.color}`}><Icon className={`h-5 w-5 ${report.iconColor}`} /></div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">{report.title}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">{report.desc}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg text-[10px] font-semibold text-white bg-[#0f55f7] hover:bg-[#0f55f7]/90 transition-colors"><Download className="w-3 h-3" /> PDF</button>
                <button className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg text-[10px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700"><Printer className="w-3 h-3" /> Print</button>
              </div>
              <div className="mt-2 text-center">
                <button className="inline-flex items-center gap-1 text-[10px] text-[#0f55f7] font-medium hover:underline"><Download className="w-3 h-3" /> Download Report</button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
