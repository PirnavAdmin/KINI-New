import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, TrendingUp, Clock, CheckCircle2, BookOpen, Code2, Database, Cloud } from 'lucide-react'
import { BATCH_STUDENTS, STUDENT_SKILLS } from '@shared/data/orgBatchesMockData'
import EmptyState from '@shared/components/EmptyState'
import StatusBadge from '@shared/components/StatusBadge'

function CircularProgress({ value, size = 80, strokeWidth = 6, label, color = '#0f55f7' }) {
  const r = (size - strokeWidth) / 2
  const c = 2 * Math.PI * r
  const offset = c - (value / 100) * c
  return (
    <div className="relative inline-flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-slate-200 dark:text-slate-700" />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} className="transition-all duration-1000" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center"><span className="text-sm font-black text-slate-900 dark:text-white">{Math.round(value)}%</span></div>
      </div>
      {label && <span className="mt-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">{label}</span>}
    </div>
  )
}

export default function StudentOverview() {
  const { batchId, studentId } = useParams()
  const navigate = useNavigate()
  const student = useMemo(() => (BATCH_STUDENTS[Number(batchId)] || []).find((s) => s.studentId === studentId), [batchId, studentId])
  if (!student) return <div className="px-4 py-12"><EmptyState icon={TrendingUp} title="Student not found" /></div>
  const skills = STUDENT_SKILLS[studentId] || []

  return (
    <div className="w-full px-4 py-3 sm:px-5 lg:px-6 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(`/organization/batches/${batchId}/students/${studentId}`)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-[#0f55f7]/30 hover:text-[#0f55f7] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"><ArrowLeft className="h-4 w-4" /></button>
        <div><h1 className="text-lg font-bold text-slate-950 dark:text-white">Student Overview</h1><p className="text-xs text-slate-400">{student.name} · {student.studentId}</p></div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Course Progress', value: student.courseProgress, color: '#0f55f7' },
          { label: 'In Progress', value: Math.min(100, student.courseProgress + 5), color: '#06b6a8' },
          { label: 'Pending', value: 100 - student.courseProgress, color: '#F59E0B' },
          { label: 'Attendance', value: student.attendancePercentage, color: '#8B5CF6' },
        ].map((item) => (
          <motion.div key={item.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center rounded-[16px] border border-slate-200/70 bg-white/95 p-4 dark:border-slate-700/60 dark:bg-slate-900/80">
            <CircularProgress value={item.value} size={80} strokeWidth={6} label={item.label} color={item.color} />
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-[16px] border border-slate-200/70 bg-white/95 p-4 dark:border-slate-700/60 dark:bg-slate-900/80">
          <div className="flex items-center gap-2 mb-4"><BookOpen className="w-4 h-4 text-[#0f55f7]" /><h3 className="text-xs font-bold text-slate-900 dark:text-white">Learning Track Progress</h3></div>
          <div className="space-y-3">
            {[
              { label: 'Frontend', pct: student.learningTrack.frontend, icon: Code2, color: '#0f55f7' },
              { label: 'Backend', pct: student.learningTrack.backend, icon: Database, color: '#06b6a8' },
              { label: 'Database', pct: student.learningTrack.database, icon: Database, color: '#F59E0B' },
              { label: 'DevOps', pct: student.learningTrack.devops, icon: Cloud, color: '#EF4444' },
            ].map((i) => (
              <div key={i.label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5"><i.icon className="w-3.5 h-3.5 text-slate-400" /><span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{i.label}</span></div>
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white">{i.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${i.pct}%`, backgroundColor: i.color }} /></div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-[16px] border border-slate-200/70 bg-white/95 p-4 dark:border-slate-700/60 dark:bg-slate-900/80">
          <div className="flex items-center gap-2 mb-4"><TrendingUp className="w-4 h-4 text-[#0f55f7]" /><h3 className="text-xs font-bold text-slate-900 dark:text-white">Overall Performance</h3></div>
          <div className="flex items-center justify-center mb-4"><CircularProgress value={student.overallPerformanceScore} size={100} strokeWidth={8} color="#0f55f7" /></div>
          <div className="text-center mb-4"><StatusBadge status={student.overallPerformanceScore >= 85 ? 'success' : student.overallPerformanceScore >= 70 ? 'pending' : 'danger'} label={student.performanceRating} size="sm" /></div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Total', value: student.totalAssignments, icon: CheckCircle2, color: 'from-[#0f55f7]/10 to-[#06b6a8]/10', iconColor: 'text-[#0f55f7]' },
              { label: 'Completed', value: student.completedAssignments, icon: CheckCircle2, color: 'from-emerald-500/10 to-emerald-400/10', iconColor: 'text-emerald-600' },
              { label: 'Pending', value: student.pendingAssignments, icon: Clock, color: 'from-amber-500/10 to-amber-400/10', iconColor: 'text-amber-600' },
              { label: 'Avg Score', value: `${student.averageScore}%`, icon: TrendingUp, color: 'from-violet-500/10 to-violet-400/10', iconColor: 'text-violet-600' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2.5">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${item.color}`}><Icon className={`w-3.5 h-3.5 ${item.iconColor}`} /></div>
                    <div><p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">{item.label}</p><p className="text-xs font-bold text-slate-900 dark:text-white">{item.value}</p></div>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {skills.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-[16px] border border-slate-200/70 bg-white/95 p-4 dark:border-slate-700/60 dark:bg-slate-900/80">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3">Skills Progress</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {skills.map((skill) => (
              <div key={skill.name} className="space-y-1">
                <div className="flex justify-between text-[11px]"><span className="font-medium text-slate-600 dark:text-slate-300">{skill.name}</span><span className="font-bold text-slate-900 dark:text-white">{skill.percentage}%</span></div>
                <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${skill.percentage}%`, backgroundColor: skill.percentage >= 80 ? '#06b6a8' : skill.percentage >= 60 ? '#0f55f7' : skill.percentage >= 40 ? '#F59E0B' : '#EF4444' }} /></div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
