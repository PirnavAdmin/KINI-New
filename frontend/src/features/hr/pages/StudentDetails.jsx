import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ClipboardCheck, GraduationCap, Pencil, RefreshCw, TrendingUp, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import usePermission from '@shared/hooks/usePermission'
import { embeddedPhotoUrl } from '@shared/services/profilePhotoService'
import HrApiForm from '../components/HrApiForm'
import { HrBreadcrumb, HrKpis } from '../components/portal/HrPortalKit'
import { ActionButton, Avatar, StatusPill, TagPill } from '../components/portal/HrLiveKit'
import { hrError, hrField, hrModuleApi } from '../services/hrApi'
import { loadHrStudentDetails, studentName, studentRelationship } from '../services/hrStudentDetails'
import './batch-details.css'
import './employee-details.css'

const display = value => value == null || value === '' ? '—' : typeof value === 'object' ? Object.values(value).filter(item => typeof item === 'string').join(', ') || '—' : String(value)
function Information({ title, items }) {
  return <section className="hrbd-panel"><h2>{title}</h2><dl className="grid gap-6 sm:grid-cols-2">{items.map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-sm text-slate-500">{label}</dt><dd className="mt-1 break-words text-sm font-semibold">{display(value)}</dd></div>)}</dl></section>
}
const metric = value => ['number', 'string'].includes(typeof value) && String(value).trim() !== '' && Number.isFinite(Number(value)) ? Number(value) : null
const percent = value => metric(value) == null ? '\u2014' : `${metric(value)}%`
export default function StudentDetails() {
  const { studentId } = useParams()
  return <StudentContent key={studentId} studentId={studentId} />
}
function StudentContent({ studentId }) {
  const permission = usePermission()
  const allowed = permission.hasPermission('students')
  const [state, setState] = useState({ loading: true })
  const [revision, setRevision] = useState(0)
  const [editing, setEditing] = useState(false)
  useEffect(() => {
    if (permission.isLoading || !allowed) return undefined
    const request = new AbortController()
    loadHrStudentDetails(studentId, request.signal).then(next => {
      if (!request.signal.aborted && next) setState(next)
    }).catch(error => {
      if (!request.signal.aborted) setState({ error: error.response ? hrError(error, 'students') : error.message })
    })
    return () => request.abort()
  }, [studentId, revision, allowed, permission.isLoading])
  const refresh = () => { setState({ loading: true }); setRevision(value => value + 1) }
  const student = state.student ?? {}
  const name = studentName(student) || 'Student Details'
  const academic = [['Course', studentRelationship(student, 'course')], ['Batch', studentRelationship(student, 'batch')], ['Mentor', studentRelationship(student, 'mentor')], ['Enrollment Status', hrField(student, 'enrollmentStatus', 'status')], ['Enrollment Date', hrField(student, 'enrollmentDate', 'enrolledOn', 'enrolledAt', 'registrationDate', 'registeredOn', 'createdAt')]]
  const metrics = [
    { label: 'Attendance', value: percent(hrField(student, 'attendancePercentage', 'attendanceRate', 'attendance')), icon: UserCheck, tone: 'blue' },
    { label: 'Learning Progress', value: percent(hrField(student, 'completionPercentage', 'progressPercentage', 'progress')), icon: TrendingUp, tone: 'purple' },
    { label: 'Assessments Cleared', value: metric(hrField(student, 'assessmentsCleared', 'completedAssessments')) ?? '\u2014', icon: ClipboardCheck, tone: 'green' },
    { label: 'Enrolled Courses', value: metric(hrField(student, 'enrolledCoursesCount', 'courseCount', 'totalCourses')) ?? (Array.isArray(student.courses) ? student.courses.length : '\u2014'), icon: GraduationCap, tone: 'orange' },
  ]
  if (permission.isLoading) return <p role="status">Checking student access...</p>
  if (!allowed) return <p role="alert">You do not have permission to view students.</p>
  return <div className="hrp-page hrbd mx-auto max-w-[1500px] px-4 py-4 sm:px-5">
      <HrBreadcrumb items={[{ label: 'Students', to: '/employee/students' }, { label: state.loading ? 'Loading student...' : state.student ? name : 'Student Details' }]} />
      <Link to="/employee/students" className="hrbd-back"><ArrowLeft size={16} />Back to Students</Link>
      {state.loading ? <div role="status" aria-label="Loading student details" className="space-y-4 animate-pulse">{[0, 1, 2].map(item => <div key={item} className="h-36 rounded-2xl bg-slate-200" />)}</div> : state.error ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5"><p>Unable to load student details. {state.error}</p><ActionButton onClick={refresh}>Retry</ActionButton></div> : state.notFound ? <p role="status" className="rounded-xl border bg-white p-5">Student not found.</p> : <>
        <header className="hrbd-panel hrbd-header">
          <Avatar name={name} size={60} profileType="student" profileId={studentId} photoUrl={embeddedPhotoUrl(student)} /><div className="min-w-0 flex-1"><h1>{name}</h1><TagPill value="Student" tone="blue" /><p className="break-all">{display(hrField(student, 'email'))}</p><p className="hrbd-meta">Student ID: {studentId}{hrField(student, 'studentCode') && ` · Student Code: ${hrField(student, 'studentCode')}`}</p></div>
          {hrField(student, 'status') != null && <StatusPill value={hrField(student, 'status')} />}
          <ActionButton icon={RefreshCw} onClick={refresh}>Refresh</ActionButton>
          {permission.can('students', 'edit') && <ActionButton icon={Pencil} onClick={() => setEditing(true)}>Edit Student</ActionButton>}
        </header>
        {state.warning && <p role="alert" className="text-sm text-slate-600">{state.warning} <ActionButton onClick={refresh}>Retry</ActionButton></p>}
        <HrKpis columns={4} items={metrics} />
        <div className="hrbd-tabs hred-tabs" role="tablist" aria-label="Student details"><button type="button" role="tab" id="student-tab-overview" aria-selected="true" aria-controls="student-panel">Overview</button></div>
        <div role="tabpanel" id="student-panel" aria-labelledby="student-tab-overview"><div className="grid gap-4 lg:grid-cols-2"><Information title="Personal Information" items={[
          ['Full Name', name], ['Student ID', studentId], ['Email', hrField(student, 'email')], ['Phone', hrField(student, 'phone', 'phoneNumber', 'mobile')], ['Status', hrField(student, 'status')],
          ...['gender', 'dateOfBirth', 'address'].filter(key => hrField(student, key) != null).map(key => [key === 'dateOfBirth' ? 'Date of Birth' : key === 'gender' ? 'Gender' : 'Address', hrField(student, key)]),
        ]} /><Information title="Academic & Enrollment Details" items={academic} /></div></div>
      </>}
      {editing && <HrApiForm title="Edit Student" operation="PUT /api/students/{studentId}" values={student} onClose={() => setEditing(false)} onSave={async data => {
        if (!permission.can('students', 'edit')) throw new Error('You do not have permission to edit students.')
        await hrModuleApi('students').update(studentId, data)
        setEditing(false); refresh(); toast.success('Student updated.')
      }} />}
  </div>
}
