import { useState } from 'react'
import Modal from '@shared/components/Modal'
import Button from '@shared/components/Button'
import { HR_API_CONTRACT } from '../services/hrApiContract'
import { hrError, hrField } from '../services/hrApi'

import { fieldLabel, optionsFor } from '../services/hrFormOptions'
const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white'

export default function HrApiForm({ operation, title, values = {}, options = {}, onSave, onClose, schema: suppliedSchema }) {
  const definition = HR_API_CONTRACT[operation]
  const schema = suppliedSchema ?? definition?.schema
  const fields = Object.entries(schema?.properties ?? {})
  const [draft, setDraft] = useState(() => Object.fromEntries(fields.map(([key, spec]) => {
    let value = hrField(values, key) ?? (spec.type === 'boolean' ? false : '')
    if (spec.format === 'date-time' && value) {
      const date = new Date(value)
      if (!Number.isNaN(date.getTime())) value = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    }
    return [key, value]
  })))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const submit = async event => {
    event.preventDefault()
    if (busy) return
    setError('')
    const data = {}
    for (const [key, spec] of fields) {
      const value = draft[key]
      if (value === '' || value == null) {
        if (!spec.nullable && (schema.required?.includes(key) || ['integer', 'number'].includes(spec.type) || spec.format === 'date' || spec.format === 'date-time' || spec.format === 'binary')) {
          setError(`Please complete ${fieldLabel(key)}.`); return
        }
        if (spec.nullable) data[key] = null
        continue
      }
      data[key] = ['integer', 'number'].includes(spec.type) ? Number(value) : spec.format === 'date-time' ? new Date(value).toISOString() : value
    }
    const start = data.fromDate ?? data.startDateTime ?? data.publishDate
    const end = data.toDate ?? data.endDateTime ?? data.expiryDate
    if (start && end && new Date(end) < new Date(start)) { setError('The end date must be on or after the start date.'); return }
    if (data.newPassword && draft.confirmPassword !== undefined && data.newPassword !== draft.confirmPassword) { setError('Passwords do not match.'); return }
    let payload = data
    if (definition?.mime === 'multipart/form-data') {
      payload = new FormData()
      Object.entries(data).forEach(([key, value]) => { if (value != null) payload.append(key, value) })
    }
    setBusy(true)
    try { await onSave(payload); onClose() }
    catch (failure) { setError(hrError(failure)) }
    finally { setBusy(false) }
  }
  return <Modal open title={title} onClose={() => { if (!busy) onClose() }} size="lg">
    <form onSubmit={submit} className="space-y-4">
      {fields.map(([key, spec]) => {
        const choices = optionsFor(key, options)
        const isPassword = /password/i.test(key)
        const type = spec.format === 'binary' ? 'file' : isPassword ? 'password' : spec.format === 'date-time' ? 'datetime-local' : spec.format === 'date' ? 'date' : ['integer', 'number'].includes(spec.type) ? 'number' : /email/i.test(key) ? 'email' : 'text'
        const required = schema.required?.includes(key) || (!spec.nullable && (['integer', 'number'].includes(spec.type) || ['date', 'date-time', 'binary'].includes(spec.format)))
        return <label key={key} className="block text-sm font-medium text-slate-600 dark:text-slate-300">{fieldLabel(key)}{required ? ' *' : ''}
          {spec.type === 'boolean' ? <input className="ml-3" type="checkbox" checked={Boolean(draft[key])} disabled={busy} onChange={e => setDraft(d => ({ ...d, [key]: e.target.checked }))} /> : choices.length ?
            <select className={inputClass} value={draft[key] ?? ''} required={required} disabled={busy} onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}><option value="">Select {fieldLabel(key)}</option>{draft[key] !== '' && draft[key] != null && !choices.some(c => String(c.value) === String(draft[key])) && <option value={draft[key]}>{draft[key]}</option>}{choices.map(choice => <option key={choice.value} value={choice.value}>{choice.label ?? choice.value}</option>)}</select> :
            /description|content|notes|reason/i.test(key) ? <textarea className={inputClass} rows={4} value={draft[key] ?? ''} disabled={busy} onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))} /> :
              <input className={inputClass} type={type} {...(type !== 'file' ? { value: draft[key] ?? '' } : {})} required={required} step={spec.type === 'number' ? 'any' : undefined} autoComplete={isPassword ? 'new-password' : undefined} disabled={busy} onChange={e => setDraft(d => ({ ...d, [key]: type === 'file' ? e.target.files?.[0] : e.target.value }))} />}
        </label>
      })}
      {fields.some(([key]) => key === 'newPassword') && <label className="block text-sm">Confirm new password<input className={inputClass} type="password" required autoComplete="new-password" value={draft.confirmPassword ?? ''} onChange={e => setDraft(d => ({ ...d, confirmPassword: e.target.value }))} /></label>}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <div className="flex justify-end gap-2"><Button type="button" variant="secondary" disabled={busy} onClick={onClose}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? 'Saving...' : 'Save'}</Button></div>
    </form>
  </Modal>
}
