import { isValidElement, useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BookOpen, Layers, Pencil, RefreshCw, TrendingUp, UserCheck, Users } from 'lucide-react'
import usePermission from '@shared/hooks/usePermission'
import BatchManagement from '@features/organization/pages/BatchManagement'
import { HrBreadcrumb, HrKpis } from '../components/portal/HrPortalKit'
import { ActionButton, StatusPill } from '../components/portal/HrLiveKit'
import { batchDate, batchIdOf, batchPercent, batchText, batchValue as field, loadHrBatchDetails } from '../services/hrBatchDetails'
import './batch-details.css'

const relationship = (batch, key) => field(batch, key + 'Name') ?? field(batch[key], key + 'Name', 'name', 'fullName') ?? (key === 'mentor' ? [batch.mentor?.firstName, batch.mentor?.lastName].filter(Boolean).join(' ') || undefined : undefined)
export default function BatchDetails() {
  const { batchId } = useParams()
  return <BatchContent key={batchId} batchId={batchId} />
}
function BatchContent({ batchId }) {
  const permission = usePermission()
  const [searchParams, setSearchParams] = useSearchParams()
  const [state, setState] = useState({ loading: true })
  const [revision, setRevision] = useState(0)
  const tabs = { overview: 'Overview', students: 'Students', sessions: 'Sessions' }
  const tab = tabs[searchParams.get('tab')] ?? 'Overview'
  const setTab = label => setSearchParams(current => {
    const next = new URLSearchParams(current)
    next.set('tab', label.toLowerCase())
    return next
  })
  const [editing, setEditing] = useState(false)
  const allowed = permission.hasPermission('batches')
  useEffect(() => {
    if (permission.isLoading || !allowed) return undefined
    const controller = new AbortController()
    loadHrBatchDetails(batchId, controller.signal).then(result => {
      if (!controller.signal.aborted) setState(result)
    }).catch(error => {
      if (!controller.signal.aborted) setState({ error: error.message || 'Please retry.' })
    })
    return () => controller.abort()
  }, [batchId, revision, allowed, permission.isLoading])
  const retry = () => { setState({ loading: true }); setRevision(value => value + 1) }
  const batch = state.batch ?? {}
  const name = field(batch, 'batchName', 'name') ?? 'Batch Details'
  const status = field(batch, 'status')
  const sessionsCount = field(batch, 'totalSessions') ?? (typeof batch.sessions === 'number' ? batch.sessions : undefined)
  if (permission.isLoading) return <p role="status">Checking batch access...</p>
  if (!allowed) return <p role="alert">You do not have permission to view batches.</p>
  return <div className="hrp-page hrbd mx-auto max-w-[1500px] px-4 py-4 sm:px-5">
    <HrBreadcrumb items={[{ label: 'Batches', to: '/employee/batches' }, { label: state.loading ? 'Loading batch...' : name }]} />
    <Link className="hrbd-back" to="/employee/batches"><ArrowLeft size={16} />Back to Batches</Link>
    {state.loading ? <div role="status" aria-label="Loading batch details" className="hrbd-loading"><div className="h-36" /><div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[0, 1, 2, 3].map(i => <div className="h-28" key={i} />)}</div><div className="h-64" /><div className="h-48" /></div> : state.notFound ? <section className="hrbd-panel" role="status"><h1>Batch Not Found</h1><p>This batch could not be found.</p></section> : state.error ? <section className="hrbd-panel" role="alert"><h1>Unable to load batch details</h1><p>{state.error}</p><ActionButton onClick={retry}>Retry</ActionButton></section> : <>
      <header className="hrbd-panel hrbd-header"><span className="hrbd-icon"><Layers size={30} /></span><div className="min-w-0 flex-1"><h1>{name}</h1><p>{batchText(relationship(batch, 'course'))}</p><p className="hrbd-meta">Batch ID: {batchText(batchIdOf(batch))} &middot; Code: {batchText(field(batch, 'batchCode', 'code'))} &middot; {batchText(field(batch, 'batchType', 'mode'))} &middot; Starts {batchDate(batch.startDate)}</p></div>{status != null && <StatusPill value={status} variant="box" />}<ActionButton icon={RefreshCw} onClick={retry}>Refresh</ActionButton>{permission.can('batches', 'edit') && <ActionButton icon={Pencil} onClick={() => setEditing(true)}>Edit Batch</ActionButton>}<ActionButton icon={ArrowRight} onClick={() => setTab('Students')}>Manage Students</ActionButton></header>
      <HrKpis columns={4} items={[
        { label: 'Total Students', value: state.students?.length ?? '\u2014', icon: Users, tone: 'blue' },
        { label: 'Sessions', value: sessionsCount ?? '\u2014', icon: BookOpen, tone: 'green' },
        { label: 'Attendance', value: batchPercent(field(batch, 'attendance', 'attendancePercentage')), icon: UserCheck, tone: 'purple' },
        { label: 'Progress', value: batchPercent(field(batch, 'progress', 'completionPercentage')), icon: TrendingUp, tone: 'orange' },
      ]} />
      <div role="tablist" aria-label="Batch details" className="hrbd-tabs">{['Overview', 'Students', 'Sessions'].map(label => <button key={label} type="button" role="tab" id={'batch-tab-' + label} aria-selected={tab === label} aria-controls="batch-panel" onClick={() => setTab(label)}>{label}</button>)}</div>
      <div role="tabpanel" id="batch-panel" aria-labelledby={'batch-tab-' + tab}>
        {tab === 'Overview' && <section className="hrbd-panel"><h2>Batch Information</h2><dl className="hrbd-info">{[
          ['Batch Name', name], ['Course', relationship(batch, 'course')], ['Status', status], ['Mode', field(batch, 'batchType', 'mode')], ['Start Date', batchDate(batch.startDate)], ['End Date', batchDate(batch.endDate)], ['Mentor', relationship(batch, 'mentor')], ['Capacity', field(batch, 'capacity')], ['Created Date', batchDate(field(batch, 'createdAt', 'createdDate'))],
        ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{batchText(value)}</dd></div>)}</dl></section>}
        {tab === 'Students' && <DetailTable title="Enrolled Students" error={state.studentsError} retry={retry} rows={state.students} empty="No students enrolled in this batch." headings={['Student Name', 'Email', 'Status', 'Attendance', 'Progress', 'Action']} renderRow={row => {
          const id = field(row, 'studentId', 'id')
          return [field(row, 'fullName', 'studentName', 'name') ?? [row.firstName, row.lastName].filter(Boolean).join(' '), field(row, 'email', 'emailAddress'), field(row, 'status'), batchPercent(field(row, 'attendance', 'attendancePercentage')), batchPercent(field(row, 'progress', 'completionPercentage')), id != null && String(id).trim() ? <Link to={'/employee/students/' + encodeURIComponent(id)} aria-label={'View ' + batchText(field(row, 'fullName', 'studentName', 'name'))}>View</Link> : '\u2014']
        }} />}
        {tab === 'Sessions' && <DetailTable title="Sessions" error={state.sessionsError} retry={retry} rows={state.sessions} empty="No sessions have been scheduled for this batch yet." headings={['Session', 'Date', 'Start Time', 'End Time', 'Status', 'Attendance']} renderRow={row => [field(row, 'title', 'classTitle', 'sessionTitle', 'name'), batchDate(field(row, 'scheduledDate', 'date', 'startAt')), field(row, 'startTime'), field(row, 'endTime'), field(row, 'status'), batchPercent(field(row, 'attendance', 'attendancePercentage'))]} />}
      </div>
      {editing && <BatchManagement createOnly initialBatch={batch} onClose={() => setEditing(false)} onCreated={() => { setEditing(false); retry() }} />}
    </>}
  </div>
}
function DetailTable({ title, rows, error, retry, empty, headings, renderRow }) {
  return <section className="hrbd-panel"><h2>{title}</h2>{error ? <div role="alert"><p>{error}</p><ActionButton onClick={retry}>Retry</ActionButton></div> : !rows?.length ? <p>{empty}</p> : <div className="hrbd-table"><table><thead><tr>{headings.map(label => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={field(row, 'studentId', 'liveClassId', 'id') ?? i}>{renderRow(row).map((value, column) => <td key={column}>{isValidElement(value) ? value : batchText(value)}</td>)}</tr>)}</tbody></table></div>}</section>
}
