import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { AlertTriangle, Check, GraduationCap, Loader2, RefreshCw, UserCheck, X } from 'lucide-react'
import { getApiErrorMessage, readableApiMessage } from '@shared/services/apiServices'
import { upiPaymentApi, isUpiPaymentVerified } from '@shared/services/upiPaymentService'
import { FilterTabs, PermissionDenied, ReasonDialog, SearchBox, StatusBadge, TableState } from './upiReviewUi'
import { dateTime, describeForbidden, isForbidden, money } from './upiReviewFormat'
import { ENROLLMENT_APPROVAL_EVENT } from '@shared/services/enrollmentApprovalStore'

const batchLabel = (batch) => [
  batch.name,
  batch.status,
  batch.startDate ? `starts ${dateTime(batch.startDate)}` : '',
  batch.seatsAvailable != null ? `${batch.seatsAvailable} seat${batch.seatsAvailable === 1 ? '' : 's'} left` : '',
].filter(Boolean).join(' · ')

/** Selected course (read-only) and the required batch, inside the approve dialog. */
function ApprovalBatchFields({ courseName, state, value, onChange, onRetry }) {
  const field = 'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Selected Course</p>
        <p className={`${field} bg-slate-50 font-semibold dark:bg-slate-800/60`}>{courseName || '—'}</p>
      </div>
      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
        <label htmlFor="approval-batch">Select Batch<span className="text-rose-600"> *</span></label>
        {state.loading ? (
          <span className={`${field} flex items-center gap-2 text-slate-500`}><Loader2 className="h-4 w-4 animate-spin" /> Loading {courseName || 'course'} batches…</span>
        ) : state.error ? (
          <span role="alert" className="mt-1.5 flex items-start gap-2 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{state.error} <button type="button" onClick={onRetry} className="font-semibold underline">Retry</button></span>
          </span>
        ) : !state.batches.length ? (
          <span role="alert" className="mt-1.5 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            No active batches are available for this course. Please create a batch before approving.
          </span>
        ) : (
          <select id="approval-batch" value={value} onChange={(event) => onChange(event.target.value)} required className={`${field} focus:border-[#0f55f7] focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/20`}>
            <option value="">Choose {courseName || 'a'} batch</option>
            {state.batches.map((batch) => (
              <option key={batch.id} value={String(batch.id)}>{batchLabel(batch)}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  )
}

const matches = (row, query) => {
  const q = query.trim().toLowerCase()
  return !q || [row.studentName, row.email, row.courseName, row.mobile].some((value) => String(value ?? '').toLowerCase().includes(q))
}

/**
 * Organization → course enrollment approvals for UPI checkouts (APIs 16–19).
 * An enrollment reaches this list once its payment is verified; approving it
 * gives the student course access.
 */
export default function UpiEnrollmentApprovals() {
  const [tab, setTab] = useState('pending')
  const [query, setQuery] = useState('')
  const [lists, setLists] = useState({
    pending: { rows: [], loading: true, error: '' },
    approved: { rows: [], loading: true, error: '' },
  })
  const [action, setAction] = useState(null) // { kind: 'approve' | 'reject', row }
  const [batchId, setBatchId] = useState('')
  const [batchState, setBatchState] = useState({ loading: false, error: '', batches: [], courseName: '' })
  const batchRequest = useRef(0)

  // After a 403 nothing else is requested until Retry (see UpiPaymentVerification).
  const [denied, setDenied] = useState(null)
  const [retrying, setRetrying] = useState(false)
  const deniedRef = useRef(null)

  const load = useCallback(async (which) => {
    if (deniedRef.current) return false
    setLists((value) => ({ ...value, [which]: { ...value[which], loading: true, error: '' } }))
    try {
      const rows = which === 'pending' ? await upiPaymentApi.orgPendingApprovals() : await upiPaymentApi.orgApprovedEnrollments()
      setLists((value) => ({ ...value, [which]: { rows, loading: false, error: '' } }))
      return true
    } catch (error) {
      if (isForbidden(error)) {
        const info = describeForbidden(error, readableApiMessage)
        if (import.meta.env.DEV) console.warn('[UPI approvals] 403 Forbidden', { ...info, body: error?.response?.data })
        deniedRef.current = info
        setDenied(info)
      }
      setLists((value) => ({ ...value, [which]: { rows: [], loading: false, error: isForbidden(error) ? '' : getApiErrorMessage(error, 'Unable to load enrollments.') } }))
      return false
    }
  }, [])

  // The approved list is requested only once the pending list was allowed.
  const refresh = useCallback(async () => {
    if (await load('pending')) await load('approved')
  }, [load])
  useEffect(() => { refresh() }, [refresh])

  const retry = async () => {
    deniedRef.current = null
    setRetrying(true)
    try {
      await refresh()
      if (!deniedRef.current) setDenied(null)
    } finally {
      setRetrying(false)
    }
  }

  const current = lists[tab]
  const rows = useMemo(() => current.rows.filter((row) => matches(row, query)), [current.rows, query])

  if (denied) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <PermissionDenied title="You don't have access to course enrollment approvals" denied={denied} retrying={retrying} onRetry={retry} />
      </section>
    )
  }

  // Batches of the enrollment's own course, loaded when the dialog opens.
  const loadBatches = async (row) => {
    const request = ++batchRequest.current
    setBatchState({ loading: true, error: '', batches: [], courseName: row.courseName })
    try {
      const options = await upiPaymentApi.approvalBatches(row.id)
      if (request !== batchRequest.current) return
      setBatchState({ loading: false, error: '', batches: options.batches, courseName: options.courseName || row.courseName })
      const chosen = options.batches.find((batch) => String(batch.id) === String(options.studentChosenBatchId))
      setBatchId(chosen ? String(chosen.id) : options.batches.length === 1 ? String(options.batches[0].id) : '')
    } catch (error) {
      if (request !== batchRequest.current) return
      // A failed request never means "no batches": say so and offer a retry.
      if (import.meta.env.DEV) console.warn('[UPI approvals] batch list failed', error?.response?.status, error?.response?.data)
      setBatchState({ loading: false, error: 'Unable to load batches. Please try again.', batches: [], courseName: row.courseName })
    }
  }

  const openApprove = (row) => {
    setBatchId('')
    setAction({ kind: 'approve', row })
    loadBatches(row)
  }

  const confirm = async (reason) => {
    const { kind, row } = action
    try {
      if (kind === 'approve') {
        if (!isUpiPaymentVerified(row.paymentStatus)) throw new Error('Payment must be verified before approving the student.');
        if (!batchId) throw new Error('Select a batch before approving.')
        await upiPaymentApi.approveEnrollment(row.id, batchId)
      }
      else await upiPaymentApi.rejectEnrollment(row.id, reason)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, `Unable to ${kind} this enrollment.`), { cause: error })
    }
    const batchName = batchState.batches.find((batch) => String(batch.id) === String(batchId))?.name
    toast.success(kind === 'approve'
      ? `${row.studentName} approved for ${row.courseName || 'the course'}${batchName ? ` · ${batchName}` : ''}`
      : `Enrollment rejected for ${row.studentName}`)
    setAction(null)
    refresh()
    // Students page / dashboard pending counts reload immediately.
    window.dispatchEvent(new Event(ENROLLMENT_APPROVAL_EVENT))
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <header className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-700 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"><GraduationCap className="h-5 w-5" /></span>
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">Course enrollment approvals</h2>
            <p className="mt-0.5 text-xs text-slate-500">UPI payments already verified. Approve to give the student course access.</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <FilterTabs
            tabs={[
              { id: 'pending', label: 'Pending approval', count: lists.pending.loading ? undefined : lists.pending.rows.length },
              { id: 'approved', label: 'Approved', count: lists.approved.loading ? undefined : lists.approved.rows.length },
            ]}
            value={tab}
            onChange={setTab}
          />
          <SearchBox value={query} onChange={setQuery} placeholder="Search student or course" />
          <button type="button" onClick={refresh} aria-label="Refresh" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:text-[#0f55f7] dark:border-slate-700">
            <RefreshCw className={`h-4 w-4 ${current.loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800/60">
            <tr>
              <th scope="col" className="px-4 py-3">Student</th>
              <th scope="col" className="px-4 py-3">Course</th>
              <th scope="col" className="px-4 py-3 text-right">Fee</th>
              <th scope="col" className="px-4 py-3">Payment</th>
              <th scope="col" className="px-4 py-3">{tab === 'pending' ? 'Enrolled' : 'Approved'}</th>
              <th scope="col" className="px-4 py-3 text-right">{tab === 'pending' ? <span className="sr-only">Actions</span> : 'Status'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            <TableState
              colSpan={6}
              loading={current.loading && !current.rows.length}
              error={current.error}
              empty={!rows.length}
              onRetry={() => load(tab)}
              emptyIcon={UserCheck}
              emptyTitle={tab === 'pending' ? 'No enrollments waiting for approval' : 'No approved enrollments yet'}
              emptyText={tab === 'pending' ? 'Enrollments appear here once their UPI payment is verified.' : undefined}
            />
            {!current.error && rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900 dark:text-white">{row.studentName}</p>
                  <p className="text-xs text-slate-500">{[row.email, row.mobile].filter(Boolean).join(' · ') || '—'}</p>
                </td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.courseName || '—'}</td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums text-slate-900 dark:text-white">{money(row.amount)}</td>
                <td className="px-4 py-3"><StatusBadge status={row.paymentStatus || 'Unverified'} /></td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{dateTime(tab === 'pending' ? row.createdAt : row.approvedAt || row.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  {tab === 'pending' ? (
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setAction({ kind: 'reject', row })} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-500/40 dark:hover:bg-rose-500/10">
                        <X className="h-3.5 w-3.5" /> Reject
                      </button>
                      <button type="button" disabled={!isUpiPaymentVerified(row.paymentStatus)} title={!isUpiPaymentVerified(row.paymentStatus) ? 'Verify payment before approving the student' : undefined} onClick={() => openApprove(row)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
                        <Check className="h-3.5 w-3.5" /> Approve Student
                      </button>
                    </div>
                  ) : (
                    <StatusBadge status={row.enrollmentStatus || 'Approved'} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ReasonDialog
        open={action?.kind === 'approve'}
        title="Approve this enrollment?"
        description={action ? `${action.row.studentName} gets access to ${batchState.courseName || action.row.courseName || 'the course'} after approval.` : ''}
        confirmLabel="Approve enrollment"
        tone="success"
        validate={() => (batchState.loading ? 'Batches are still loading.' : !batchId ? 'Select a batch before approving.' : '')}
        confirmDisabled={batchState.loading || Boolean(batchState.error) || !batchId}
        onConfirm={confirm}
        onClose={() => { batchRequest.current += 1; setAction(null) }}
      >
        {action?.kind === 'approve' && (
          <ApprovalBatchFields
            courseName={batchState.courseName || action.row.courseName}
            state={batchState}
            value={batchId}
            onChange={setBatchId}
            onRetry={() => loadBatches(action.row)}
          />
        )}
      </ReasonDialog>
      <ReasonDialog
        open={action?.kind === 'reject'}
        title="Reject this enrollment?"
        description="The student sees this reason on their enrollment status."
        label="Reason"
        placeholder="e.g. Course batch is full"
        required
        confirmLabel="Reject enrollment"
        tone="danger"
        onConfirm={confirm}
        onClose={() => setAction(null)}
      />
    </section>
  )
}
