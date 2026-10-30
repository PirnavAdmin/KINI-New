import { useEffect, useState } from 'react'
import { Dialog } from 'radix-ui'
import { RefreshCcw, X } from 'lucide-react'
import assessmentService from '@/services/assessmentService'
import { displayValue, normalizeStudentPerformance, performanceSummaryFields, scoreDistribution } from './assessmentResultsData'

const date = value => value && !Number.isNaN(Date.parse(value)) ? new Date(value).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'
const badge = state => state === 'Pass' ? 'bg-emerald-50 text-emerald-700' : state === 'Fail' ? 'bg-rose-50 text-rose-700' : state === 'Submitted' ? 'bg-blue-50 text-blue-700' : state === 'Pending evaluation' ? 'bg-orange-50 text-orange-700' : 'bg-slate-100 text-slate-600'
export default function StudentPerformanceModal({ studentId, cache, refreshKey, onClose, onRefresh }) {
  const [state, setState] = useState({ loading: true, data: null, error: '' })
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      const cached = cache.get(String(studentId))
      if (cached) { setState({ loading: false, data: cached, error: '' }); return }
      setState({ loading: true, data: null, error: '' })
      try {
        const response = await assessmentService.getStudentPerformance(studentId, { signal: controller.signal })
        const data = normalizeStudentPerformance(response, studentId)
        if (!controller.signal.aborted) { cache.set(String(studentId), data); setState({ loading: false, data, error: '' }) }
      } catch (failure) {
        const status = failure?.response?.status
        const error = status === 401 ? 'Session expired. Please login again.' : status === 403 ? "You don't have permission to view this student's performance." : status === 404 ? 'No performance data found for this student.' : 'Unable to load student performance.'
        if (!controller.signal.aborted) setState({ loading: false, data: null, error })
      }
    }
    load()
    return () => controller.abort()
  }, [studentId, cache, refreshKey, retry])
  const { loading, data, error } = state
  const distribution = scoreDistribution(data?.results ?? [])
  const totals = ['totalQuestions', 'correctAnswers', 'wrongAnswers'].map(key => {
    const values = data?.results.map(row => row[key]) ?? []
    return values.length && values.every(value => typeof value === 'number' && Number.isFinite(value)) ? values.reduce((sum, value) => sum + value, 0) : null
  })
  return <Dialog.Root open onOpenChange={open => { if (!open) onClose() }}><Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 z-[10000] bg-[#0b1f36]/45 backdrop-blur-[3px]" />
    <Dialog.Content className="fixed left-1/2 top-1/2 z-[10001] flex max-h-[90dvh] w-[calc(100vw-24px)] max-w-[1100px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-[#e6edf6] bg-[#F5F8FC] text-[#133B5D] shadow-2xl outline-none">
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-[#e6edf6] bg-white p-5">
        <div><p className="text-xs font-bold uppercase tracking-wide text-blue-600">Assessment performance</p><Dialog.Title className="mt-1 text-xl font-extrabold">{displayValue(data?.student.name)}</Dialog.Title><Dialog.Description className="mt-1 text-sm text-slate-500">{displayValue(data?.student.email)} · {displayValue(data?.student.courseName)} · {displayValue(data?.student.batchName)}</Dialog.Description></div>
        {data?.student.profilePhotoUrl && <img src={data.student.profilePhotoUrl} alt="" className="h-12 w-12 rounded-full object-cover" />}
        <div className="flex gap-2"><button type="button" onClick={onRefresh} aria-label="Refresh student performance" className="rounded-lg border p-2"><RefreshCcw size={18} /></button><button type="button" onClick={onClose} aria-label="Close performance" className="rounded-lg p-2 hover:bg-slate-100"><X size={18} /></button></div>
      </header>
      <div className="min-h-0 overflow-y-auto p-4 sm:p-5">
        {loading ? <div role="status" aria-label="Loading student performance" className="space-y-4"><div className="h-16 animate-pulse rounded-xl bg-slate-200 motion-reduce:animate-none" /><div className="grid gap-3 sm:grid-cols-2">{Array.from({ length: 8 }, (_, index) => <div key={index} className="h-20 animate-pulse rounded-xl bg-slate-200 motion-reduce:animate-none" />)}</div><div className="h-40 animate-pulse rounded-xl bg-slate-200 motion-reduce:animate-none" /></div> : error ? <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}<button type="button" onClick={() => setRetry(value => value + 1)} className="ml-3 rounded-lg border bg-white px-3 py-1">Retry</button></div> : data && <div className="space-y-5">
          <section aria-label="Performance summary" className="grid grid-cols-1 gap-3 sm:grid-cols-2">{performanceSummaryFields.map(([key, label]) => <div key={key} className="rounded-xl border border-[#e6edf6] bg-white p-3 shadow-sm"><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-1 text-xl font-bold">{displayValue(data.summary[key])}{key === 'averagePercentage' && data.summary[key] != null ? '%' : ''}</p></div>)}</section>
          <section className="rounded-xl border border-[#e6edf6] bg-white p-4"><h3 className="font-bold">Score Distribution</h3><div className="mt-3 grid grid-cols-5 gap-2">{distribution.map(bucket => <div key={bucket.label} className="flex flex-col items-center justify-end gap-2"><b>{bucket.count}</b><div className="w-full rounded-t bg-[#F39924]" style={{ height: Math.max(3, bucket.count / Math.max(1, ...distribution.map(item => item.count)) * 80) }} /><span className="text-xs">{bucket.label}</span></div>)}</div></section>
          <section className="rounded-xl border border-[#e6edf6] bg-white p-4"><h3 className="font-bold">Performance Overview</h3><dl className="mt-3 grid grid-cols-2 gap-3">{[['Total Questions', totals[0]], ['Correct Answers', totals[1]], ['Wrong Answers', totals[2]], ['Average Percentage', data.summary.averagePercentage == null ? null : `${data.summary.averagePercentage}%`]].map(([label, value]) => <div key={label}><dt className="text-xs text-slate-500">{label}</dt><dd className="font-bold">{displayValue(value)}</dd></div>)}</dl></section>
          <section className="rounded-xl border border-[#e6edf6] bg-white p-4"><h3 className="font-bold">Assessment History</h3>{!data.results.length ? <div className="py-8 text-center"><p className="font-semibold">No assessment performance available</p><p className="mt-2 text-sm text-slate-500">This student has not completed any assessments yet.</p></div> : <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[980px] text-left text-sm"><thead><tr>{['#', 'Assessment', 'Course', 'Batch', 'Attempt', 'Started At', 'Submitted At', 'Score', 'Percentage', 'Result'].map(label => <th key={label} className="whitespace-nowrap border-b p-2 text-xs">{label}</th>)}</tr></thead><tbody>{data.results.map((row, index) => <tr key={row.studentAssessmentId ?? index}><td className="p-2">{index + 1}</td><td className="p-2">{displayValue(row.assessmentTitle)}<small className="block text-slate-500">{row.correctAnswers != null ? `${row.correctAnswers} correct` : ''}{row.wrongAnswers != null ? ` · ${row.wrongAnswers} wrong` : ''}</small></td><td className="p-2">{displayValue(row.courseName)}</td><td className="p-2">{displayValue(row.batchName)}</td><td className="p-2">{displayValue(row.attemptNumber)}</td><td className="p-2">{date(row.startedAt)}</td><td className="p-2">{date(row.submittedAt)}</td><td className="p-2">{displayValue(row.score)} / {displayValue(row.totalMarks)}</td><td className="p-2">{row.percentage == null ? '—' : `${row.percentage}%`}</td><td className="p-2"><span className={`rounded-full px-2 py-1 text-xs font-bold ${badge(row.state)}`}>{row.state.toUpperCase()}</span>{row.result && row.status === 'Submitted' && <small className="mt-1 block text-blue-700">SUBMITTED</small>}</td></tr>)}</tbody></table></div>}</section>
        </div>}
      </div>
    </Dialog.Content>
  </Dialog.Portal></Dialog.Root>
}
