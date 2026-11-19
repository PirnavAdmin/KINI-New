import { useState } from 'react'
import { Loader2, RefreshCw, Search, ShieldAlert } from 'lucide-react'
import Modal from '@shared/components/Modal'
import { statusLabel } from './upiReviewFormat'

const TONES = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30',
  verified: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30',
  rejected: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
}

const toneOf = (status) => {
  const value = String(status ?? '').toLowerCase().replace(/[\s_-]/g, '')
  if (/reject|fail|declin|cancel/.test(value)) return 'rejected'
  if (/pending|under|await|submitted|review/.test(value)) return 'pending'
  if (/verif|approv|success|paid|active|enrolled/.test(value)) return 'verified'
  return 'neutral'
}

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${TONES[toneOf(status)]}`}>
      {statusLabel(status)}
    </span>
  )
}

export function SearchBox({ value, onChange, placeholder }) {
  return (
    <label className="relative block w-full sm:max-w-xs">
      <span className="sr-only">{placeholder}</span>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0f55f7] focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      />
    </label>
  )
}

export function FilterTabs({ tabs, value, onChange }) {
  return (
    <div role="tablist" className="flex shrink-0 gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          type="button"
          aria-selected={value === tab.id}
          onClick={() => onChange(tab.id)}
          className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition ${value === tab.id ? 'bg-white text-[#0f55f7] shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
        >
          {tab.label}{tab.count != null ? <span className="ml-1.5 rounded-full bg-slate-200/80 px-1.5 text-[10px] dark:bg-slate-600">{tab.count}</span> : null}
        </button>
      ))}
    </div>
  )
}

export function TableState({ loading, error, empty, onRetry, emptyIcon: Icon, emptyTitle, emptyText, colSpan }) {
  if (!loading && !error && !empty) return null
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-14 text-center">
        {loading ? (
          <span className="inline-flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</span>
        ) : error ? (
          <div className="space-y-3">
            <p className="text-sm text-rose-600">{error}</p>
            <button type="button" onClick={onRetry} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200">Try again</button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {Icon && <Icon className="h-9 w-9 text-slate-300 dark:text-slate-600" />}
            <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{emptyTitle}</p>
            {emptyText && <p className="mt-1 max-w-sm text-xs text-slate-500">{emptyText}</p>}
          </div>
        )}
      </td>
    </tr>
  )
}

/**
 * Confirm dialog that can require a reason (rejections) or take optional
 * remarks (approvals). onConfirm(text) may throw to keep the dialog open.
 */
export function ReasonDialog({ open, title, description, label, placeholder, required, confirmLabel, tone = 'primary', onConfirm, onClose, children, validate, confirmDisabled = false }) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const close = () => { if (busy) return; setText(''); setError(''); onClose() }
  const confirm = async () => {
    if (required && !text.trim()) { setError(`${label} is required.`); return }
    const invalid = validate?.()
    if (invalid) { setError(invalid); return }
    setBusy(true)
    setError('')
    try {
      await onConfirm(text.trim())
      setText('')
    } catch (failure) {
      setError(failure?.message || 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }
  const button = tone === 'danger' ? 'bg-rose-600 hover:bg-rose-700' : tone === 'success' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-[#0f55f7] hover:brightness-110'

  return (
    <Modal
      open={open}
      onClose={close}
      title={title}
      description={description}
      size="sm"
      footer={(
        <div className="flex justify-end gap-2">
          <button type="button" onClick={close} disabled={busy} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-300">Cancel</button>
          <button type="button" onClick={confirm} disabled={busy || confirmDisabled} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${button}`}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}{confirmLabel}
          </button>
        </div>
      )}
    >
      {children}
      {label ? (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}{required ? <span className="text-rose-600"> *</span> : <span className="font-normal text-slate-400"> (optional)</span>}
          <textarea
            value={text}
            onChange={(event) => { setText(event.target.value); setError('') }}
            rows={3}
            maxLength={500}
            placeholder={placeholder}
            className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#0f55f7] focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </label>
      ) : null}
      {error && <p role="alert" className="mt-2 text-xs font-medium text-rose-600">{error}</p>}
    </Modal>
  )
}

/**
 * Shown instead of a list when the server answers 403: the request reached the
 * backend with a valid token, but this account is not authorized for it.
 * Nothing reloads on its own; Retry sends one new request.
 */
export function PermissionDenied({ title, denied, retrying, onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center px-6 py-12 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
        <ShieldAlert className="h-7 w-7" />
      </span>
      <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-1.5 max-w-lg text-sm text-slate-500 dark:text-slate-400">
        The server refused this request for your account (HTTP 403). Your sign-in is valid, but this account&apos;s role
        isn&apos;t allowed to use the UPI payment APIs. Sign in with the organization admin account, or ask your administrator to grant access.
      </p>
      {denied?.serverMessage && (
        <p className="mt-3 max-w-lg rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <span className="font-semibold">Server message:</span> {denied.serverMessage}
        </p>
      )}
      {denied?.endpoint && <p className="mt-2 font-mono text-[11px] text-slate-400">{denied.endpoint}</p>}
      <button
        type="button"
        onClick={onRetry}
        disabled={retrying}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0f55f7] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
      >
        <RefreshCw className={`h-4 w-4 ${retrying ? "animate-spin" : ""}`} /> {retrying ? "Retrying…" : "Retry"}
      </button>
    </div>
  )
}
