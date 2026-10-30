import { useEffect, useState } from 'react'
import { BookOpen, CheckCircle2, Circle, LockKeyhole } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@shared/hooks/useAuth'
import courseService from '@/services/courseService'
import syllabusAssignmentService from '@features/syllabus/services/syllabusAssignmentService'

const unwrapModules = (payload, assignment) => {
  const root = payload?.data ?? payload?.syllabus ?? payload ?? {}
  const rows = root.modules ?? root.sections ?? root.items ?? (Array.isArray(root) ? root : [])
  if (rows.length) return rows.map((module, index) => ({ id: module.moduleId ?? module.id ?? `module-${index + 1}`, name: module.moduleName ?? module.title ?? module.name ?? `Module ${index + 1}` }))
  return Array.from({ length: Number(assignment?.totalModules) || 0 }, (_, index) => ({ id: `module-${index + 1}`, name: `Module ${index + 1}` }))
}

const identityOf = (user) => user?.employeeId ?? user?.mentorId ?? user?.userId ?? user?.id ?? user?.email

export default function AssignedSyllabus({ recipientType = 'employee' }) {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState([])
  const [selected, setSelected] = useState(null)
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    syllabusAssignmentService.list({ recipientType, recipientId: identityOf(user) }, recipientType).then((rows) => {
      if (!active) return
      setAssignments(rows)
      setSelected(rows[0] || null)
      setLoading(false)
    })
    return () => { active = false }
  }, [recipientType, user])

  useEffect(() => {
    let active = true
    if (!selected) return () => { active = false }
    courseService.getOrganizationSyllabus(selected.courseId)
      .then((payload) => active && setModules(unwrapModules(payload, selected)))
      .catch(() => active && setModules(unwrapModules(null, selected)))
    return () => { active = false }
  }, [selected])

  const complete = async (moduleId) => {
    if (!selected || selected.completedModuleIds?.includes(moduleId)) return
    let updated
    try {
      updated = await syllabusAssignmentService.completeModule(selected.id, moduleId, recipientType)
    } catch (error) {
      toast.error(error?.response?.status === 403 ? 'You do not have permission to update this syllabus.' : 'Unable to record completion.')
      return
    }
    if (!updated) return
    setSelected(updated)
    setAssignments((current) => current.map((assignment) => assignment.id === updated.id ? updated : assignment))
    toast.success('Module completion recorded.')
  }

  const completed = new Set(selected?.completedModuleIds || [])
  const progress = selected ? Number(selected.progress || 0) : 0

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1200px] space-y-4 px-3 py-3 sm:px-4">
      <header><p className="text-[10px] font-bold uppercase tracking-[.18em] text-blue-600">Assigned learning</p><h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{recipientType === 'mentor' ? 'Mentor Syllabus' : 'My Syllabus'}</h1><p className="mt-1 text-sm text-slate-500">Only syllabi assigned to your account are shown.</p></header>
      {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Loading assignments...</div> : !assignments.length ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900"><BookOpen className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">No syllabus assigned yet</p><p className="mt-1 text-xs text-slate-500">Your HR or Organization Admin will publish assignments here.</p></div> : <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]"><aside className="space-y-2">{assignments.map((assignment) => <button key={assignment.id} type="button" onClick={() => setSelected(assignment)} className={`w-full rounded-xl border p-3 text-left transition ${selected?.id === assignment.id ? 'border-blue-500 bg-blue-50/60' : 'border-slate-200 bg-white hover:border-blue-200'} dark:border-slate-700 dark:bg-slate-900`}><p className="text-xs font-bold text-slate-900 dark:text-white">{assignment.courseName}</p><p className="mt-1 text-[11px] text-slate-500">{assignment.progress}% complete · Due {assignment.dueDate || 'not scheduled'}</p><div className="mt-2 h-1.5 rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.min(100, assignment.progress)}%` }} /></div></button>)}</aside><main className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-blue-600" /><h2 className="text-lg font-bold text-slate-900 dark:text-white">{selected.courseName}</h2></div><p className="mt-1 text-xs text-slate-500">{selected.syllabusName} · Due {selected.dueDate || 'not scheduled'}</p></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold capitalize text-blue-700">{selected.status}</span></div><div className="mt-5 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60"><div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300"><span>Progress</span><span>{progress}%</span></div><div className="mt-2 h-2 rounded-full bg-slate-200"><div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-teal-500" style={{ width: `${Math.min(100, progress)}%` }} /></div></div><div className="mt-5 space-y-2">{modules.map((module, index) => { const isComplete = completed.has(module.id); const unlocked = index === 0 || completed.has(modules[index - 1]?.id); return <div key={module.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800"><span className={isComplete ? 'text-emerald-500' : unlocked ? 'text-blue-600' : 'text-slate-300'}>{isComplete ? <CheckCircle2 className="h-5 w-5" /> : unlocked ? <Circle className="h-5 w-5" /> : <LockKeyhole className="h-4 w-4" />}</span><span className="min-w-0 flex-1"><p className="text-sm font-bold text-slate-800 dark:text-slate-100">{module.name}</p><p className="text-[11px] text-slate-500">{isComplete ? 'Completed' : unlocked ? 'Ready to study' : 'Complete the previous module first'}</p></span>{unlocked && !isComplete && <button type="button" onClick={() => complete(module.id)} className="rounded-lg bg-blue-600 px-3 py-2 text-[11px] font-bold text-white hover:bg-blue-700">Mark complete</button>}</div>})}</div></main></div>}
    </div>
  )
}
