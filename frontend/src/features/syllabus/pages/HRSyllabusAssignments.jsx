import { useEffect, useMemo, useState } from 'react'
import { BookOpen, CalendarDays, CheckCircle2, ClipboardList, Users } from 'lucide-react'
import { toast } from 'sonner'
import HRPage from '@features/hr/components/HRPage'
import useHrPermissions from '@features/hr/hooks/useHrPermissions'
import courseService from '@/services/courseService'
import { employeeApi } from '@shared/services/apiServices'
import { mentorService } from '@shared/services/mentorService'
import { useAuth } from '@shared/hooks/useAuth'
import { ROLES } from '@shared/constants/roles'
import syllabusAssignmentService from '@features/syllabus/services/syllabusAssignmentService'
import { readStoredOrganizationId } from '@shared/services/apiServices'
import { HrHero } from '@features/hr/components/portal/HrPortalKit'
import { heroProps } from '@features/hr/components/portal/hrHeroes'
import './syllabus-assignments.css'

const list = (value, key) => {
  const root = value?.data ?? value
  if (Array.isArray(root)) return root
  return root?.[key] || root?.items || root?.records || root?.results || []
}

const person = (value) => ({
  id: value.employeeId ?? value.mentorId ?? value.id ?? value.userId,
  name: value.name ?? value.fullName ?? value.mentorName ?? ([value.firstName, value.lastName].filter(Boolean).join(' ') || value.email || 'Unnamed recipient'),
})

const modulesFor = (course, syllabus) => {
  const root = syllabus?.data ?? syllabus?.syllabus ?? syllabus ?? course
  const rows = root?.modules ?? root?.sections ?? root?.classes ?? root?.items ?? (Array.isArray(root) ? root : [])
  return rows.map((module, index) => ({ id: module.moduleId ?? module.id ?? `module-${index + 1}`, name: module.moduleName ?? module.title ?? module.name ?? `Module ${index + 1}` }))
}

export default function HRSyllabusAssignments() {
  const { user, role } = useAuth()
  const organizationScope = String(user?.organizationId ?? user?.orgId ?? readStoredOrganizationId() ?? '')
  const { can, canAccessModule } = useHrPermissions()
  const canAssignSyllabus = role === ROLES.ORG_ADMIN || can('syllabus', 'assign')
  const [courses, setCourses] = useState([])
  const [assignments, setAssignments] = useState([])
  const [recipients, setRecipients] = useState([])
  const [courseId, setCourseId] = useState('')
  const [syllabus, setSyllabus] = useState(null)
  const [recipientType, setRecipientType] = useState('employee')
  const [recipientIds, setRecipientIds] = useState([])
  const [dueDate, setDueDate] = useState('')
  const [syllabi, setSyllabi] = useState([])
  const [syllabusId, setSyllabusId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    setCourses([])
    setAssignments([])
    setCourseId('')
    setSyllabus(null)
    Promise.allSettled([courseService.getCourses(), syllabusAssignmentService.list()]).then(([courseResult, assignmentResult]) => {
      if (!active) return
      const loadedCourses = courseResult.status === 'fulfilled' ? courseResult.value : []
      setCourses(loadedCourses)
      const courseIds = new Set(loadedCourses.map((course) => String(course.courseId ?? course.id)))
      const courseNames = new Set(loadedCourses.map((course) => String(course.courseName ?? course.title ?? course.name ?? '').trim().toLowerCase()))
      const ownedAssignments = assignmentResult.status === 'fulfilled' ? assignmentResult.value.filter((assignment) => {
        const owner = assignment.organizationId ?? assignment.OrganizationId ?? assignment.orgId
          ?? assignment.organization?.organizationId ?? assignment.organization?.id
        if (owner != null) return organizationScope !== '' && String(owner) === organizationScope
        const assignedCourseId = assignment.courseId ?? assignment.course?.courseId ?? assignment.course?.id
        const assignedCourseName = String(assignment.courseName ?? assignment.course?.courseName ?? assignment.course?.name ?? '').trim().toLowerCase()
        return (assignedCourseId != null && courseIds.has(String(assignedCourseId)))
          || (assignedCourseName !== '' && courseNames.has(assignedCourseName))
      }) : []
      setAssignments(ownedAssignments)
      setCourseId(String(loadedCourses[0]?.id ?? ''))
      setLoading(false)
    })
    return () => { active = false }
  }, [organizationScope])

  useEffect(() => {
    let active = true
    if (!courseId) return () => { active = false }
    courseService.getOrganizationSyllabus(courseId).then((payload) => {
      if (!active) return
      const root = payload?.data ?? payload ?? {}
      const options = Array.isArray(root) ? root : root.syllabi ?? root.syllabusList ?? (root.syllabus && Array.isArray(root.syllabus) ? root.syllabus : [root])
      const valid = options.filter((item) => item && (item.id || item.syllabusId || item.modules || item.sections))
      setSyllabi(valid)
      setSyllabusId(String(valid[0]?.syllabusId ?? valid[0]?.id ?? ''))
      setSyllabus(valid[0] ?? payload)
    }).catch(() => {
      if (!active) return
      setSyllabi([])
      setSyllabusId(`${courseId}-syllabus`)
    })
    return () => { active = false }
  }, [courseId])

  useEffect(() => {
    let active = true
    const loadRecipients = async () => {
      const result = recipientType === 'employee'
        ? await Promise.allSettled([employeeApi.list({ pageNumber: 1, pageSize: 1000 })])
        : await Promise.allSettled([mentorService.getMentors({ PageNumber: 1, PageSize: 1000 })])
      if (!active) return
      const source = result[0]?.status === 'fulfilled' ? list(result[0].value, recipientType === 'employee' ? 'employees' : 'mentors') : []
      setRecipients(source.map(person).filter((item) => item.id != null))
      setRecipientIds([])
    }
    loadRecipients()
    return () => { active = false }
  }, [recipientType])

  const selectedCourse = courses.find((course) => String(course.id) === String(courseId))
  const modules = useMemo(() => modulesFor(selectedCourse, syllabus), [selectedCourse, syllabus])
  const toggleRecipient = (id) => setRecipientIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])

  const assign = async (event) => {
    event.preventDefault()
    if (!canAssignSyllabus || !selectedCourse || !recipientIds.length || !dueDate) {
      toast.error('Select a course, recipients and due date.')
      return
    }
    setSaving(true)
    try {
      const selectedRecipients = recipients.filter((recipient) => recipientIds.includes(recipient.id))
      const created = await syllabusAssignmentService.createMany({
        courseId: selectedCourse.id, syllabusId: syllabusId || syllabus?.id || `${selectedCourse.id}-syllabus`,
        courseName: selectedCourse.title ?? selectedCourse.name, syllabusName: syllabus?.name ?? 'Course syllabus',
        recipientType, recipients: selectedRecipients, dueDate,
        assignedBy: user?.id ?? user?.userId ?? user?.email ?? 'hr-admin', totalModules: modules.length,
      })
      setAssignments((current) => [...created, ...current])
      setRecipientIds([])
      toast.success(`${created.length} syllabus assignment${created.length === 1 ? '' : 's'} created.`)
    } catch (error) {
      toast.error(error?.response?.status === 403 ? 'You do not have permission to assign syllabus.' : 'Unable to create the assignment.')
    } finally { setSaving(false) }
  }

  if (role !== ROLES.ORG_ADMIN && !canAccessModule('syllabus')) return null

  return (
    <HRPage
      moduleId="syllabus"
      title="Syllabus Assignments"
      subtitle="Assign organization-owned syllabi to employees and mentors without duplicating course content."
      icon={BookOpen}
      className="hr-syllabus-assignments"
      hero={<HrHero {...heroProps('syllabus')} title={['Syllabus', 'Assignments']} subtitle="Assign organization-owned syllabi to employees and mentors, then track completion." className="hr-syllabus-assignments__hero" />}
    >
      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        {[
          ['1', 'Choose syllabus', 'Select a published course syllabus.'],
          ['2', 'Choose people', 'Select employees or mentors.'],
          ['3', 'Set deadline', 'Assign once and track progress.'],
        ].map(([step, title, description]) => (
          <div key={step} className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-3 dark:border-blue-500/20 dark:bg-blue-500/10">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue-600 text-[11px] font-extrabold text-white">{step}</span>
            <div><p className="text-xs font-bold text-slate-800 dark:text-slate-100">{title}</p><p className="mt-0.5 text-[11px] leading-4 text-slate-500">{description}</p></div>
          </div>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,.8fr)]">
        <form onSubmit={assign} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div><h2 className="text-sm font-bold text-slate-900 dark:text-white">Create assignment</h2><p className="mt-1 text-xs text-slate-500">The syllabus source remains owned by the Organization.</p></div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Course<select value={courseId} onChange={(event) => setCourseId(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium dark:border-slate-700 dark:bg-slate-800">{courses.map((course) => <option key={course.id} value={course.id}>{course.title ?? course.name}</option>)}</select></label>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Syllabus<select value={syllabusId} onChange={(event) => { setSyllabusId(event.target.value); setSyllabus(syllabi.find((item) => String(item.syllabusId ?? item.id) === event.target.value) || syllabus) }} disabled={!syllabi.length} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium disabled:cursor-not-allowed disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-800">{syllabi.length ? syllabi.map((item) => <option key={item.syllabusId ?? item.id} value={item.syllabusId ?? item.id}>{item.name ?? item.title ?? item.syllabusName ?? 'Published syllabus'}</option>) : <option value={syllabusId}>Published course syllabus</option>}</select></label>
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3"><p className="text-[11px] font-bold uppercase tracking-wide text-blue-700">Syllabus preview</p>{modules.length ? <ul className="mt-2 space-y-1 text-xs text-slate-700">{modules.map((module) => <li key={module.id} className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />{module.name}</li>)}</ul> : <p className="mt-2 text-xs text-slate-500">No published modules found for this course yet.</p>}</div>
          <div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-bold text-slate-600 dark:text-slate-300">Recipient type<select value={recipientType} onChange={(event) => setRecipientType(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-800"><option value="employee">Employee</option><option value="mentor">Mentor</option></select></label><label className="text-xs font-bold text-slate-600 dark:text-slate-300">Due date<input type="date" required value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-800" /></label></div>
          <div><div className="mb-2 flex items-center justify-between"><p className="text-xs font-bold text-slate-600 dark:text-slate-300">Select recipients</p><button type="button" onClick={() => setRecipientIds(recipients.map((recipient) => recipient.id))} className="text-[11px] font-bold text-blue-600">Select all</button></div><div className="max-h-48 space-y-1 overflow-auto rounded-xl border border-slate-200 p-2 dark:border-slate-700">{recipients.map((recipient) => <label key={recipient.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800"><input type="checkbox" checked={recipientIds.includes(recipient.id)} onChange={() => toggleRecipient(recipient.id)} />{recipient.name}<span className="ml-auto text-[10px] text-slate-400">{recipient.id}</span></label>)}</div></div>
          <button disabled={saving || loading || !canAssignSyllabus} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"><ClipboardList className="h-4 w-4" />{saving ? 'Assigning...' : 'Assign syllabus'}</button>
        </form>
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"><header className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800"><div><h2 className="text-sm font-bold text-slate-900 dark:text-white">Assignment register</h2><p className="mt-1 text-xs text-slate-500">One record per recipient</p></div><Users className="h-4 w-4 text-blue-600" /></header><div className="divide-y divide-slate-100 dark:divide-slate-800">{assignments.map((assignment) => <article key={assignment.id} className="p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-slate-900 dark:text-white">{assignment.courseName}</p><p className="mt-1 text-[11px] text-slate-500">{assignment.recipientName} · {assignment.recipientType}</p></div><span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold capitalize text-blue-700">{assignment.status}</span></div><div className="mt-3 flex items-center justify-between text-[11px] text-slate-500"><span>{assignment.progress}% complete</span><span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" />{assignment.dueDate || 'No due date'}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.min(100, assignment.progress)}%` }} /></div></article>)}{!assignments.length && <p className="p-8 text-center text-xs text-slate-500">No syllabus assignments yet.</p>}</div></section>
      </div>
    </HRPage>
  )
}
