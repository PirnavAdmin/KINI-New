import { useEffect, useState } from 'react'
import { BookOpen, RefreshCw } from 'lucide-react'
import useHrPermissions from '@features/hr/hooks/useHrPermissions'
import usePermission from '@shared/hooks/usePermission'
import { courseService } from '@shared/services/courseService'
import { batchService } from '@shared/services/batchService'
import SyllabusBuilder from '@/pages/courses/SyllabusBuilder'
import AssignedSyllabus from './AssignedSyllabus'
import { HrBreadcrumb, HrHero } from '@features/hr/components/portal/HrPortalKit'
import { heroProps } from '@features/hr/components/portal/hrHeroes'
import '@features/hr/components/portal/hr-syllabus.css'

async function allPages(request) {
  const rows = []
  let page = 1
  let totalPages
  do {
    const result = await request(page)
    rows.push(...(result.data ?? []))
    totalPages = Number(result.totalPages ?? 1)
    page += 1
  } while (page <= totalPages)
  return rows
}

export default function EmployeeSyllabus() {
  const { isHrUser, isLoading } = useHrPermissions()
  if (isLoading) return <p role="status">Loading permissions...</p>
  return isHrUser ? <HRSyllabusWorkspace /> : <AssignedSyllabus recipientType="employee" />
}

export function HRSyllabusWorkspace() {
  const { can } = usePermission()
  const canCreate = can('courses', 'add') || can('syllabus', 'add')
  const [revision, setRevision] = useState(0)
  const [catalog, setCatalog] = useState(null)
  const [mode, setMode] = useState('course')
  const [courseId, setCourseId] = useState('')
  const [batchId, setBatchId] = useState('')
  const [batchCourse, setBatchCourse] = useState(null)
  const [editorBusy, setEditorBusy] = useState(false)
  useEffect(() => {
    let active = true
    Promise.allSettled([
      allPages(page => courseService.getCourses({ page, pageSize: 100 })),
      allPages(pageNumber => batchService.getAll({ pageNumber, pageSize: 100 })),
    ]).then(([courses, batches]) => {
      if (active) setCatalog({ revision, courses: courses.status === 'fulfilled' ? courses.value : [], batches: batches.status === 'fulfilled' ? batches.value : [], courseError: courses.status === 'rejected', batchError: batches.status === 'rejected' })
    })
    return () => { active = false }
  }, [revision])
  const loading = catalog?.revision !== revision
  const selectedBatch = catalog?.batches.find(batch => String(batch.batchId ?? batch.id) === batchId)
  const linkedCourseId = selectedBatch?.courseId ?? selectedBatch?.course?.courseId ?? selectedBatch?.course?.id
  useEffect(() => {
    if (!batchId || linkedCourseId != null) return
    let active = true
    batchService.getById(batchId).then(batch => {
      const id = batch.courseId ?? batch.course?.courseId ?? batch.course?.id
      if (active) setBatchCourse({ batchId, id, error: id == null ? 'This batch has no linked course. Link a course to the batch before adding its syllabus.' : '' })
    }).catch(() => {
      if (active) setBatchCourse({ batchId, error: 'Unable to load the batch’s course. Select the course directly or refresh and try again.' })
    })
    return () => { active = false }
  }, [batchId, linkedCourseId, revision])
  const batchDetail = batchCourse?.batchId === batchId ? batchCourse : null
  const selectedCourseId = mode === 'course' ? courseId : linkedCourseId ?? batchDetail?.id
  const selectedCourse = catalog?.courses.find(course => String(course.courseId ?? course.id) === String(selectedCourseId))
  const courseName = selectedCourse?.courseName ?? selectedCourse?.title ?? selectedCourse?.name ?? selectedBatch?.courseName
  const selectClass = 'mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 disabled:opacity-60'
  return <div className="hrp-page hrs-page space-y-4">
    <div>
      <HrBreadcrumb items={[{ label: 'HR Portal', to: '/employee/hr-dashboard' }, { label: 'Syllabus' }]} />
      <HrHero {...heroProps('syllabus')} />
    </div>
    <div className="hrs-toolbar">
      <div className="hrs-tabs" role="group" aria-label="Choose syllabus by">
        <button type="button" aria-pressed={mode === 'course'} disabled={editorBusy} onClick={() => setMode('course')}>By Course</button>
        <button type="button" aria-pressed={mode === 'batch'} disabled={editorBusy} onClick={() => setMode('batch')}>By Batch</button>
      </div>
      <button type="button" className="hrp-btn hrp-btn--white" disabled={loading || editorBusy} onClick={() => { setCatalog(null); setBatchCourse(null); setRevision(value => value + 1) }}><RefreshCw className={loading ? 'animate-spin' : ''} />Refresh</button>
    </div>
    <section className="hrs-select">
      {loading ? <p role="status">Loading courses and batches...</p> : mode === 'course' ? <>
        {catalog.courseError ? <p role="alert">Unable to load courses. Refresh to try again.</p> : <label className="block max-w-xl text-sm font-semibold text-[#133B5D]">Select Course<select className={selectClass} value={courseId} disabled={editorBusy} onChange={event => setCourseId(event.target.value)}><option value="">Select a course</option>{catalog.courses.map(course => <option key={course.courseId ?? course.id} value={course.courseId ?? course.id}>{course.courseName ?? course.title ?? course.name}</option>)}</select></label>}
        {!catalog.courseError && !catalog.courses.length && <p className="mt-3 text-sm text-slate-500">No courses available. Create a course before adding its syllabus.</p>}
      </> : <>
        {catalog.batchError ? <p role="alert">Unable to load batches. Refresh to try again.</p> : <label className="block max-w-xl text-sm font-semibold text-[#133B5D]">Select Batch<select className={selectClass} value={batchId} disabled={editorBusy} onChange={event => { setBatchCourse(null); setBatchId(event.target.value) }}><option value="">Select a batch</option>{catalog.batches.map(batch => <option key={batch.batchId ?? batch.id} value={batch.batchId ?? batch.id}>{batch.batchName ?? batch.name}</option>)}</select></label>}
        {!catalog.batchError && !catalog.batches.length && <p className="mt-3 text-sm text-slate-500">No batches available.</p>}
        {batchId && linkedCourseId == null && !batchDetail && <p role="status" className="mt-3 text-sm">Loading the batch’s course...</p>}
        {batchDetail?.error && <p role="alert" className="mt-3 text-sm text-red-700">{batchDetail.error}</p>}
      </>}
    </section>
    {!loading && selectedCourseId ? <section className="hrs-builder">
      <h2 className="hrs-builder__title"><span aria-hidden="true"><BookOpen size={20} /></span>{courseName || 'Course syllabus'}</h2>
      <p className="mb-4 text-sm text-slate-500">This syllabus belongs to the course and is shared by batches linked to that course.</p>
      {!canCreate && <p className="mb-4 text-sm text-amber-800">You can view the syllabus. Course or syllabus Add permission is needed to create one.</p>}
      <SyllabusBuilder key={`${selectedCourseId}-${revision}`} courseId={selectedCourseId} canCreate={canCreate} onEditingChange={setEditorBusy} />
    </section> : !loading && <div className="hrs-empty"><BookOpen className="mx-auto mb-3 text-slate-400" /><p className="font-semibold text-[#133B5D]">Choose a {mode} to view or add its syllabus</p><p className="mt-2 text-sm text-slate-500">If no syllabus exists, use Add Syllabus to enter modules, topics and lessons, then Save.</p></div>}
  </div>
}
