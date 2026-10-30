import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ClipboardList, CheckCircle2, Clock, TrendingUp, Search } from 'lucide-react'
import { BATCH_STUDENTS, STUDENT_ASSIGNMENTS } from '@shared/data/orgBatchesMockData'
import EmptyState from '@shared/components/EmptyState'

const formatDate = (v) => v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'

export default function StudentAssignments() {
  const { batchId, studentId } = useParams()
  const navigate = useNavigate()
  const [filterStatus, setFilterStatus] = useState('')
  const student = useMemo(() => (BATCH_STUDENTS[Number(batchId)] || []).find((s) => s.studentId === studentId), [batchId, studentId])
  const assignments = useMemo(() => STUDENT_ASSIGNMENTS[studentId] || [], [studentId])
  const filtered = useMemo(() => filterStatus ? assignments.filter((a) => a.status === filterStatus) : assignments, [assignments, filterStatus])
  const summary = useMemo(() => {
    const t = assignments.length
    const c = assignments.filter((a) => a.status === 'Completed').length
    const p = assignments.filter((a) => a.status === 'Pending').length
    const s = assignments.filter((a) => a.status === 'Submitted').length
    const scores = assignments.filter((a) => a.score !== null).map((a) => a.score)
    return { total: t, completed: c, pending: p, submitted: s, avgScore: scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '0.0' }
  }, [assignments])

  if (!student) return <div className="px-4 py-12"><EmptyState icon={ClipboardList} title="Student not found" /></div>

  return (
    <div className="w-full px-4 py-3 sm:px-5 lg:px-6 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(`/organization/batches/${batchId}/students/${studentId}`)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-[#0f55f7]/30 hover:text-[#0f55f7] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"><ArrowLeft className="h-4 w-4" /></button>
        <div><h1 className="text-lg font-bold text-slate-950 dark:text-white">Assignments</h1><p className="text-xs text-slate-400">{student.name} · {student.studentId}</p></div>
      </div>

      <div className="grid gap-2.5 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total', value: summary.total, icon: ClipboardList, color: 'from-[#0f55f7]/10 to-[#06b6a8]/10', iconColor: 'text-[#0f55f7]' },
          { label: 'Completed', value: summary.completed, icon: CheckCircle2, color: 'from-emerald-500/10 to-emerald-400/10', iconColor: 'text-emerald-600' },
          { label: 'Pending', value: summary.pending, icon: Clock, color: 'from-amber-500/10 to-amber-400/10', iconColor: 'text-amber-600' },
          { label: 'Avg Score', value: `${summary.avgScore}%`, icon: TrendingUp, color: 'from-violet-500/10 to-violet-400/10', iconColor: 'text-violet-600' },
        ].map((c) => {
          const Icon = c.icon
          return (
            <motion.div key={c.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-[14px] border border-slate-200/70 bg-white/95 p-3 dark:border-slate-700/60 dark:bg-slate-900/80">
              <div className="flex items-center gap-2.5">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${c.color}`}><Icon className={`h-4 w-4 ${c.iconColor}`} /></div>
                <div><p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">{c.label}</p><p className="text-sm font-bold text-slate-900 dark:text-white">{c.value}</p></div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="flex items-center gap-2.5">
        <div className="relative flex-1 max-w-xs"><Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" /><input placeholder="Filter by name..." className="w-full h-9 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none focus:border-[#0f55f7] dark:border-slate-700 dark:bg-slate-800/70 dark:text-white" /></div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs outline-none focus:border-[#0f55f7] dark:border-slate-700 dark:bg-slate-800/70 dark:text-white">
          <option value="">All</option>
          <option value="Completed">Completed</option>
          <option value="Submitted">Submitted</option>
          <option value="Pending">Pending</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-slate-200/70 bg-white dark:border-slate-700/60 dark:bg-slate-900/80">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/80 dark:border-slate-700/60 dark:bg-slate-900/60">
                <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Assignment</th>
                <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Due</th>
                <th className="px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">Score</th>
                <th className="hidden lg:table-cell px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-3 py-8"><EmptyState title="No assignments found" compact /></td></tr>
              ) : filtered.map((a, i) => (
                <tr key={a.id} className="border-b border-slate-100/80 last:border-0 hover:bg-slate-50/70 dark:border-slate-800/60 dark:hover:bg-slate-800/40">
                  <td className="px-3 py-2"><p className="text-xs font-semibold text-slate-900 dark:text-white">{a.name}</p></td>
                  <td className="px-3 py-2"><span className="text-xs text-slate-500">{formatDate(a.dueDate)}</span></td>
                  <td className="px-3 py-2 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      a.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                      : a.status === 'Submitted' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                      : a.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
                    }`}>{a.status}</span>
                  </td>
                  <td className="px-3 py-2 text-center"><span className="text-xs font-bold text-slate-700 dark:text-slate-300">{a.score !== null ? `${a.score}%` : '-'}</span></td>
                  <td className="hidden lg:table-cell px-3 py-2"><span className="text-xs text-slate-500">{a.remarks || '-'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
