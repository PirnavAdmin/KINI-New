import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, TrendingUp, BarChart3, BookOpen, Code2 } from 'lucide-react'
import { BATCH_STUDENTS, STUDENT_SKILLS } from '@shared/data/orgBatchesMockData'
import EmptyState from '@shared/components/EmptyState'

function CircularProgress({ value, size = 70, strokeWidth = 6, label, color = '#0f55f7' }) {
  const r = (size - strokeWidth) / 2, c = 2 * Math.PI * r, offset = c - (value / 100) * c
  return (
    <div className="relative inline-flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-slate-200 dark:text-slate-700" />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} className="transition-all duration-1000" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center"><span className="text-[11px] font-black text-slate-900 dark:text-white">{Math.round(value)}%</span></div>
      </div>
      {label && <span className="mt-1 text-[9px] font-medium text-slate-500 dark:text-slate-400">{label}</span>}
    </div>
  )
}

export default function StudentPerformance() {
  const { batchId, studentId } = useParams()
  const navigate = useNavigate()
  const student = useMemo(() => (BATCH_STUDENTS[Number(batchId)] || []).find((s) => s.studentId === studentId), [batchId, studentId])
  if (!student) return <div className="px-4 py-12"><EmptyState icon={BarChart3} title="Student not found" /></div>
  const skills = STUDENT_SKILLS[studentId] || []

  return (
    <div className="w-full px-4 py-3 sm:px-5 lg:px-6 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(`/organization/batches/${batchId}/students/${studentId}`)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-[#0f55f7]/30 hover:text-[#0f55f7] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"><ArrowLeft className="h-4 w-4" /></button>
        <div><h1 className="text-lg font-bold text-slate-950 dark:text-white">Performance</h1><p className="text-xs text-slate-400">{student.name} · {student.studentId}</p></div>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Course Completion', value: student.courseProgress, color: '#0f55f7' },
          { label: 'Assignment Score', value: student.assignmentPerformance, color: '#06b6a8' },
          { label: 'Attendance', value: student.attendancePercentage, color: '#8B5CF6' },
          { label: 'Overall Rating', value: student.overallPerformanceScore, color: '#F59E0B' },
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex flex-col items-center rounded-[16px] border border-slate-200/70 bg-white/95 p-3.5 dark:border-slate-700/60 dark:bg-slate-900/80">
            <CircularProgress value={item.value} size={70} strokeWidth={6} label={item.label} color={item.color} />
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-[16px] border border-slate-200/70 bg-white/95 p-4 dark:border-slate-700/60 dark:bg-slate-900/80">
          <div className="flex items-center gap-2 mb-4"><TrendingUp className="w-4 h-4 text-[#0f55f7]" /><h3 className="text-xs font-bold text-slate-900 dark:text-white">Performance Trend</h3></div>
          <div className="h-36 flex items-end justify-between gap-2 px-1">
            {[{ month: 'Jan', score: 65 }, { month: 'Feb', score: 72 }, { month: 'Mar', score: 78 }, { month: 'Apr', score: 81 }, { month: 'May', score: 85 }, { month: 'Jun', score: student.overallPerformanceScore }].map((item) => (
              <div key={item.month} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">{item.score}%</span>
                <div className="relative w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden" style={{ height: '80px' }}>
                  <div className="absolute bottom-0 w-full rounded-full transition-all duration-700" style={{ height: `${item.score}%`, backgroundColor: item.score >= 80 ? '#06b6a8' : item.score >= 70 ? '#0f55f7' : '#F59E0B' }} />
                </div>
                <span className="text-[9px] font-medium text-slate-400">{item.month}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-[16px] border border-slate-200/70 bg-white/95 p-4 dark:border-slate-700/60 dark:bg-slate-900/80">
          <div className="flex items-center gap-2 mb-4"><BookOpen className="w-4 h-4 text-[#0f55f7]" /><h3 className="text-xs font-bold text-slate-900 dark:text-white">Course Progress</h3></div>
          <div className="flex items-center justify-center h-36"><CircularProgress value={student.courseProgress} size={110} strokeWidth={8} color="#0f55f7" /></div>
        </motion.div>
      </div>

      {skills.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-[16px] border border-slate-200/70 bg-white/95 p-4 dark:border-slate-700/60 dark:bg-slate-900/80">
          <div className="flex items-center gap-2 mb-4"><Code2 className="w-4 h-4 text-[#0f55f7]" /><h3 className="text-xs font-bold text-slate-900 dark:text-white">Skills Progress</h3></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {skills.map((skill, i) => (
              <motion.div key={skill.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="space-y-1">
                <div className="flex justify-between text-[11px]"><span className="font-semibold text-slate-600 dark:text-slate-300">{skill.name}</span><span className="font-bold text-slate-900 dark:text-white">{skill.percentage}%</span></div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${skill.percentage}%`, backgroundColor: skill.percentage >= 80 ? '#06b6a8' : skill.percentage >= 60 ? '#0f55f7' : skill.percentage >= 40 ? '#F59E0B' : '#EF4444' }} /></div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
