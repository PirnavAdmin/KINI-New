import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Award, BookOpen, GraduationCap, Mail, Phone } from 'lucide-react'
import { studentApi, getApiErrorMessage } from '@shared/services/apiServices'

export default function SuperAdminStudentDetails() {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { studentApi.getById(studentId).then(setStudent).catch((e) => setError(getApiErrorMessage(e, 'Student could not be loaded'))) }, [studentId])
  if (error) return <StatePage message={error} onBack={() => navigate(-1)} />
  if (!student) return <StatePage message="Loading student details…" onBack={() => navigate(-1)} />
  const name = [student.firstName, student.lastName].filter(Boolean).join(' ') || student.name || `Student ${studentId}`
  return <div className="space-y-4 p-4 lg:p-6">
    <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-bold text-slate-600"><ArrowLeft className="h-4 w-4" /> Back to students</button>
    <section className="rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white shadow-xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-blue-100">Student profile</p><h1 className="mt-2 text-3xl font-black">{name}</h1><p className="mt-2 text-blue-50">Platform-wide learner record and enrollment overview</p></section>
    <div className="grid gap-4 lg:grid-cols-3"><InfoCard icon={GraduationCap} title="Identity" rows={[['Student ID', student.studentId ?? student.id], ['Status', student.status ?? 'Active']]} /><InfoCard icon={Mail} title="Contact" rows={[['Email', student.email], ['Phone', student.phone]]} /><InfoCard icon={BookOpen} title="Learning" rows={[['Course', student.courseName ?? student.course ?? 'Not assigned'], ['Batch', student.batchName ?? student.batch ?? 'Not assigned']]} /></div>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><Award className="h-5 w-5 text-violet-600" /><h2 className="font-extrabold">Academic progress</h2></div><div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-500" style={{ width: `${Number(student.progress || 0)}%` }} /></div><p className="mt-2 text-sm font-bold text-slate-600">{Number(student.progress || 0)}% completed</p></section>
  </div>
}

function InfoCard({ icon: Icon, title, rows }) { return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><span className="rounded-xl bg-blue-50 p-2 text-blue-600"><Icon className="h-5 w-5" /></span><h2 className="font-extrabold">{title}</h2></div>{rows.map(([label, value]) => <div key={label} className="flex justify-between gap-4 border-t border-slate-100 py-3 text-sm"><span className="text-slate-500">{label}</span><span className="text-right font-bold text-slate-800">{value || '—'}</span></div>)}</section> }
function StatePage({ message, onBack }) { return <div className="grid min-h-[70vh] place-items-center"><div className="text-center"><GraduationCap className="mx-auto h-12 w-12 text-slate-300" /><p className="mt-3 font-bold text-slate-600">{message}</p><button onClick={onBack} className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">Go back</button></div></div> }
