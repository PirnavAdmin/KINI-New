import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import {
  CheckCircle2, ChevronLeft, ChevronRight, Clock3, Eye, ImageOff, IndianRupee, Loader2, ReceiptText, RefreshCw, XCircle,
} from 'lucide-react'
import KPI from '@/components/common/KPI'
import Modal from '@shared/components/Modal'
import { getApiErrorMessage, readableApiMessage } from '@shared/services/apiServices'
import { upiPaymentApi } from '@shared/services/upiPaymentService'
import { announceFinanceChange } from '@shared/services/financeService'
import { FilterTabs, PermissionDenied, ReasonDialog, SearchBox, StatusBadge, TableState } from './upiReviewUi'
import { dateTime, describeForbidden, isForbidden, money } from './upiReviewFormat'

const PAGE_SIZE = 10
const FILTERS = [
  { id: 'pending', label: 'Pending' },
  { id: 'all', label: 'All' },
  { id: 'verified', label: 'Verified', paymentStatus: 'Verified' },
  { id: 'rejected', label: 'Rejected', paymentStatus: 'Rejected' },
]

const matches = (row, query) => {
  const q = query.trim().toLowerCase()
  return !q || [row.studentName, row.email, row.courseName, row.utrNumber].some((value) => String(value ?? '').toLowerCase().includes(q))
}

/** The payment screenshot, fetched with the auth token (GET …/payments/{id}/screenshot). */
function ScreenshotPreview({ paymentId }) {
  const [state, setState] = useState({ url: null, loading: true, failed: false })
  useEffect(() => {
    let active = true
    let url = null
    upiPaymentApi.orgPaymentScreenshot(paymentId)
      .then((blob) => {
        if (!active) return
        url = URL.createObjectURL(blob)
        setState({ url, loading: false, failed: false })
      })
      .catch(() => active && setState({ url: null, loading: false, failed: true }))
    return () => { active = false; if (url) URL.revokeObjectURL(url) }
  }, [paymentId])

  if (state.loading) return <div className="grid h-full min-h-[260px] place-items-center text-sm text-slate-500"><Loader2 className="h-5 w-5 animate-spin" /></div>
  if (state.failed) {
    return (
      <div className="grid h-full min-h-[260px] place-items-center px-4 text-center text-sm text-slate-500">
        <span className="flex flex-col items-center gap-2"><ImageOff className="h-8 w-8 text-slate-300" />Screenshot couldn&apos;t be loaded.</span>
      </div>
    )
  }
  return (
    <a href={state.url} target="_blank" rel="noreferrer" className="block h-full" title="Open full size">
      <img src={state.url} alt="Payment screenshot submitted by the student" className="h-full max-h-[460px] w-full object-contain" />
    </a>
  )
}

function ReviewModal({ payment, onClose, onDone }) {
  const [detail, setDetail] = useState(payment)
  const [dialog, setDialog] = useState(null)

  useEffect(() => {
    let active = true
    upiPaymentApi.orgPayment(payment.id)
      .then((row) => { if (active) setDetail((current) => ({ ...current, ...Object.fromEntries(Object.entries(row).filter(([, v]) => v !== '' && v != null)) })) })
      .catch(() => {})
    return () => { active = false }
  }, [payment.id])

  const pending = !/verif|reject|approv/i.test(String(detail.status)) || /pending|under|unverif/i.test(String(detail.status))
  const rows = [
    ['Student', detail.studentName],
    ['Email', detail.email || '—'],
    ['Mobile', detail.mobile || '—'],
    ['Course', detail.courseName || '—'],
    ['Amount', money(detail.amount)],
    ['Expected amount', money(detail.expectedAmount)],
    ['UTR / Transaction ID', detail.utrNumber || '—'],
    ['Method', detail.method || 'UPI'],
    ['Submitted', dateTime(detail.submittedAt)],
  ]

  const act = (kind) => async (remarks) => {
    try {
      if (kind === 'verify') await upiPaymentApi.verifyPayment(detail.id, remarks)
      else await upiPaymentApi.rejectPayment(detail.id, remarks)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, `Unable to ${kind} this payment.`), { cause: error })
    }
    // The backend confirmed it: refresh Fees & Payments (overview, history, cards).
    announceFinanceChange()
    toast.success(kind === 'verify' ? `Payment verified for ${detail.studentName}` : `Payment rejected for ${detail.studentName}`)
    setDialog(null)
    onDone()
  }

  return (
    <>
      <Modal
        open
        onClose={onClose}
        title="Review UPI payment"
        description={`Payment #${detail.id}${detail.enrollmentId ? ` · Enrollment #${detail.enrollmentId}` : ''}`}
        size="lg"
        footer={(
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">Match the UTR and amount with your bank statement before verifying.</p>
            {pending ? (
              <div className="flex gap-2">
                <button type="button" onClick={() => setDialog('reject')} className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-500/40 dark:bg-transparent">
                  <XCircle className="h-4 w-4" /> Reject
                </button>
                <button type="button" onClick={() => setDialog('verify')} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                  <CheckCircle2 className="h-4 w-4" /> Verify payment
                </button>
              </div>
            ) : (
              <StatusBadge status={detail.status} />
            )}
          </div>
        )}
      >
        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
            <ScreenshotPreview paymentId={detail.id} />
          </div>
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-slate-900 dark:text-white">Payment details</p>
              <StatusBadge status={detail.status} />
            </div>
            <dl className="divide-y divide-slate-100 rounded-xl border border-slate-200 text-sm dark:divide-slate-700 dark:border-slate-700">
              {rows.map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-3 px-3 py-2.5">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="break-all text-right font-semibold text-slate-900 dark:text-white">{value}</dd>
                </div>
              ))}
            </dl>
            {detail.rejectionReason && (
              <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <span className="font-semibold">Remarks:</span> {detail.rejectionReason}
              </p>
            )}
          </div>
        </div>
      </Modal>

      <ReasonDialog
        open={dialog === 'verify'}
        title="Verify this payment?"
        description={`${money(detail.amount)} from ${detail.studentName}. The enrollment moves to Pending Approval.`}
        label="Remarks"
        placeholder="e.g. Matched with bank statement"
        confirmLabel="Verify payment"
        tone="success"
        onConfirm={act('verify')}
        onClose={() => setDialog(null)}
      />
      <ReasonDialog
        open={dialog === 'reject'}
        title="Reject this payment?"
        description="The student sees this reason and can resubmit the correct UTR and screenshot."
        label="Reason"
        placeholder="e.g. UTR not found in bank statement"
        required
        confirmLabel="Reject payment"
        tone="danger"
        onConfirm={act('reject')}
        onClose={() => setDialog(null)}
      />
    </>
  )
}

/**
 * Organization → UPI payment verification (APIs 11–15): pending and past
 * student payments, with the screenshot and Verify / Reject actions.
 */
export default function UpiPaymentVerification() {
  const [filter, setFilter] = useState('pending')
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [list, setList] = useState({ rows: [], total: null, totalPages: null, loading: true, error: '' })
  const [pending, setPending] = useState({ rows: [], loading: true, error: '' })
  const [reviewing, setReviewing] = useState(null)

  // Debounce the server-side search.
  useEffect(() => {
    const timer = window.setTimeout(() => { setSearch(query.trim()); setPage(1) }, 350)
    return () => window.clearTimeout(timer)
  }, [query])

  // A 403 means this account may not use these APIs. Once one call is refused,
  // no other UPI request is sent (filters, search, paging, refresh) until the
  // user presses Retry — repeating a refused call can't succeed.
  const [denied, setDenied] = useState(null)
  const [retrying, setRetrying] = useState(false)
  const deniedRef = useRef(null)
  const refuse = useCallback((error) => {
    if (!isForbidden(error)) return false
    const info = describeForbidden(error, readableApiMessage)
    if (import.meta.env.DEV) console.warn('[UPI payments] 403 Forbidden', { ...info, body: error?.response?.data })
    deniedRef.current = info
    setDenied(info)
    return true
  }, [])

  const loadPending = useCallback(async () => {
    if (deniedRef.current) return false
    setPending((value) => ({ ...value, loading: true, error: '' }))
    try {
      setPending({ rows: await upiPaymentApi.orgPendingPayments(), loading: false, error: '' })
      return true
    } catch (error) {
      setPending({ rows: [], loading: false, error: refuse(error) ? '' : getApiErrorMessage(error, 'Unable to load pending payments.') })
      return false
    }
  }, [refuse])

  const loadList = useCallback(async () => {
    if (filter === 'pending' || deniedRef.current) return
    setList((value) => ({ ...value, loading: true, error: '' }))
    const paymentStatus = FILTERS.find((item) => item.id === filter)?.paymentStatus
    try {
      const result = await upiPaymentApi.orgPayments({ page, limit: PAGE_SIZE, search: search || undefined, paymentStatus })
      setList({ ...result, loading: false, error: '' })
    } catch (error) {
      setList({ rows: [], total: null, totalPages: null, loading: false, error: refuse(error) ? '' : getApiErrorMessage(error, 'Unable to load payments.') })
    }
  }, [filter, page, search, refuse])

  // Total of every submission, for the KPI (one row is enough to read the count).
  const [allTotal, setAllTotal] = useState({ value: null, loading: true })
  const loadTotal = useCallback(async () => {
    if (deniedRef.current) { setAllTotal({ value: null, loading: false }); return }
    try {
      const result = await upiPaymentApi.orgPayments({ page: 1, limit: 1 })
      setAllTotal({ value: result.total, loading: false })
    } catch (error) {
      refuse(error)
      setAllTotal({ value: null, loading: false })
    }
  }, [refuse])

  // First the pending list; the KPI total only once that call was allowed, so
  // a refused account sends one request, not three.
  const loadOverview = useCallback(async () => {
    if (await loadPending()) await loadTotal()
    else setAllTotal({ value: null, loading: false })
  }, [loadPending, loadTotal])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadOverview() }, [loadOverview])
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadList() }, [loadList])

  const refresh = () => {
    if (deniedRef.current) return
    loadPending(); loadList(); loadTotal()
  }

  // One new attempt. The panel stays up until the server actually allows it.
  const retry = async () => {
    deniedRef.current = null
    setRetrying(true)
    try {
      await loadOverview()
      if (!deniedRef.current) {
        setDenied(null)
        await loadList()
      }
    } finally {
      setRetrying(false)
    }
  }

  const pendingRows = useMemo(() => pending.rows.filter((row) => matches(row, query)), [pending.rows, query])
  const rows = filter === 'pending' ? pendingRows : list.rows
  const state = filter === 'pending' ? pending : list
  const pendingAmount = pending.rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0)
  const totalPages = list.totalPages ?? (list.total != null ? Math.max(1, Math.ceil(list.total / PAGE_SIZE)) : null)
  const hasNext = filter !== 'pending' && (totalPages ? page < totalPages : list.rows.length === PAGE_SIZE)

  if (denied) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <PermissionDenied title="You don't have access to UPI payment verification" denied={denied} retrying={retrying} onRetry={retry} />
      </section>
    )
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-3 sm:grid-cols-3">
        <KPI label="Awaiting Verification" value={pending.rows.length} description="UPI payments to check" icon={Clock3} accent="orange" loading={pending.loading} error={Boolean(pending.error)} onClick={() => setFilter('pending')} />
        <KPI label="Amount Awaiting" value={money(pendingAmount)} description="Across pending payments" icon={IndianRupee} accent="blue" loading={pending.loading} error={Boolean(pending.error)} />
        <KPI label="Total Submissions" value={allTotal.value ?? '—'} description="All UPI payments received" icon={ReceiptText} accent="purple" loading={allTotal.loading} onClick={() => setFilter('all')} />
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <header className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3.5 dark:border-slate-700 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="font-extrabold text-slate-900 dark:text-white">UPI Payment Verification</h2>
            <p className="mt-0.5 text-xs text-slate-500">Check each UTR and screenshot against your bank statement, then verify or reject.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <FilterTabs tabs={FILTERS.map((item) => ({ ...item, count: item.id === 'pending' && !pending.loading ? pending.rows.length : undefined }))} value={filter} onChange={(id) => { setFilter(id); setPage(1) }} />
            <SearchBox value={query} onChange={setQuery} placeholder="Search student, course or UTR" />
            <button type="button" onClick={refresh} aria-label="Refresh" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:text-[#0f55f7] dark:border-slate-700">
              <RefreshCw className={`h-4 w-4 ${state.loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800/60">
              <tr>
                <th scope="col" className="px-4 py-3">Student</th>
                <th scope="col" className="px-4 py-3">Course</th>
                <th scope="col" className="px-4 py-3 text-right">Amount</th>
                <th scope="col" className="px-4 py-3">UTR</th>
                <th scope="col" className="px-4 py-3">Submitted</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3 text-right"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <TableState
                colSpan={7}
                loading={state.loading && !rows.length}
                error={state.error}
                empty={!rows.length}
                onRetry={refresh}
                emptyIcon={CheckCircle2}
                emptyTitle={filter === 'pending' ? 'No payments waiting for verification' : 'No payments found'}
                emptyText={filter === 'pending' ? 'New UPI payments appear here when students submit their UTR and screenshot.' : 'Try another filter or search.'}
              />
              {!state.error && rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900 dark:text-white">{row.studentName}</p>
                    {row.email && <p className="text-xs text-slate-500">{row.email}</p>}
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.courseName || '—'}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums text-slate-900 dark:text-white">{money(row.amount)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-300">{row.utrNumber || '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{dateTime(row.submittedAt)}</td>
                  <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" onClick={() => setReviewing(row)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#0f55f7] hover:text-[#0f55f7] dark:border-slate-700 dark:text-slate-200">
                      <Eye className="h-3.5 w-3.5" /> Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filter !== 'pending' && (page > 1 || hasNext) && (
          <footer className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500 dark:border-slate-700">
            <span>Page {page}{totalPages ? ` of ${totalPages}` : ''}</span>
            <div className="flex gap-2">
              <button type="button" disabled={page <= 1 || list.loading} onClick={() => setPage((value) => value - 1)} aria-label="Previous page" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 disabled:opacity-40 dark:border-slate-700"><ChevronLeft className="h-4 w-4" /></button>
              <button type="button" disabled={!hasNext || list.loading} onClick={() => setPage((value) => value + 1)} aria-label="Next page" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 disabled:opacity-40 dark:border-slate-700"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </footer>
        )}
      </section>

      {reviewing && (
        <ReviewModal
          payment={reviewing}
          onClose={() => setReviewing(null)}
          onDone={() => { setReviewing(null); refresh() }}
        />
      )}
    </div>
  )
}
