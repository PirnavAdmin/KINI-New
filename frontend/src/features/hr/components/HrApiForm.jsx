import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CalendarDays, Eye, EyeOff, FileText, Megaphone, NotebookPen, Save, UserRoundCheck, Users, X } from 'lucide-react'
import './portal/hr-announcement-form.css'
import Modal from '@shared/components/Modal'
import Button from '@shared/components/Button'
import { HR_API_CONTRACT } from '../services/hrApiContract'
import { calendarDate } from '../services/hrCalendarData'
import getApiErrorMessage from '@/utils/getApiErrorMessage'
import { hrError, hrField } from '../services/hrApi'
import { announcementOptions } from '../services/hrAnnouncementData'
import { employeeRoleOptions, fieldLabel, optionsFor } from '../services/hrFormOptions'
import AddEmployeeModal from './AddEmployeeModal'
import { EMPLOYEE_STATUS_OPTIONS } from '../constants/employeeStatuses'
import { STUDENT_STATUS_OPTIONS } from '../constants/studentStatuses'
import AddLeaveModal from './AddLeaveModal'
import ModalHero from '@shared/components/ModalHero'
import { ORG_BANNERS } from '@features/organization/constants/orgBanners'
const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white'

export default function HrApiForm(props) {
  if (props.operation === 'POST /api/hr/employees') return <AddEmployeeModal options={props.options} onSave={props.onSave} onClose={props.onClose} />
  if (props.operation === 'POST /api/hr/leave') return <AddLeaveModal options={props.options} initialValues={props.values} onSave={props.onSave} onClose={props.onClose} />
  return <HrSchemaForm {...props} />
}

function HrSchemaForm({ operation, title, values = {}, options = {}, onSave, onClose, schema: suppliedSchema }) {
  const definition = HR_API_CONTRACT[operation]
  const schema = suppliedSchema ?? definition?.schema
  const calendarForm = /^(POST|PUT) \/api\/hr\/calendar\/events(?:\/|$)/.test(operation ?? '')
  const announcementForm = /^(POST|PUT) \/api\/hr\/announcements(\/\{announcementId\})?$/.test(operation ?? '')
  const profileForm = operation === 'PUT /api/hr/settings/profile'
  const passwordForm = operation === 'PUT /api/hr/settings/security/password'
  const submitLock = useRef(false)
  const employeeForm = /^\w+ \/api\/hr\/employees(?:\/|$)/.test(operation ?? '')
  const employeeStatusForm = operation === 'PATCH /api/hr/employees/{employeeId}/status'
  const studentStatusForm = operation === 'PATCH /api/students/{studentId}/status'
  const performanceForm = /^\w+ \/api\/hr\/performance(?:\/|$)/.test(operation ?? '')
  const fields = Object.entries(schema?.properties ?? {}).filter(([key]) =>
    operation !== 'POST /api/hr/employees' || !['departmentId', 'designation', 'joiningDate'].includes(key)
  )
  const [draft, setDraft] = useState(() => Object.fromEntries(fields.map(([key, spec]) => {
    let value = hrField(values, key) ?? (spec.type === 'boolean' ? false : '')
    if (announcementForm && key === 'status' && String(value).trim().toLowerCase() === 'expired') value = ''
    if (spec.format === 'date-time' && value) {
      const date = calendarForm ? calendarDate(value) : new Date(value)
      if (!Number.isNaN(date.getTime())) value = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, announcementForm ? 23 : 16)
    }
    return [key, value]
  })))
  const [busy, setBusy] = useState(false)
  const initialDraft = useRef(draft)
  const [error, setError] = useState('')
  const [visiblePasswords, setVisiblePasswords] = useState({})
  const updateField = (key, value) => {
    if (profileForm && ['firstName', 'lastName'].includes(key)) value = value.replace(/[^\p{L}\p{M} '\-]/gu, '')
    if (profileForm && key === 'phone') value = value.replace(/\D/g, '').slice(0, 10)
    setDraft(current => ({ ...current, [key]: value }))
  }
  const submit = async event => {
    event.preventDefault()
    if (busy || submitLock.current) return
    if (operation === 'PUT /api/students/{studentId}' && fields.every(([key, spec]) => {
      const normalize = value => value === '' || value == null ? '' : ['integer', 'number'].includes(spec.type) ? Number(value) : String(value).trim()
      return normalize(draft[key]) === normalize(initialDraft.current[key])
    })) {
      onClose()
      return
    }
    setError('')
    if (announcementForm && operation.startsWith('PUT') && !announcementOptions('status', options).filter(option => option.value.trim().toLowerCase() !== 'expired').some(option => option.value === draft.status)) {
      setError('Status: select an available status. Expired is calculated from the expiry date and cannot be saved as a status.')
      return
    }
    const data = {}
    if (employeeStatusForm && !EMPLOYEE_STATUS_OPTIONS.some(option => option.value === draft.status)) { setError('Select Active, On Leave or Resigned.'); return }
    if (studentStatusForm && !STUDENT_STATUS_OPTIONS.some(option => option.value === draft.status)) { setError('Select Active, Pending, Inactive or Rejected.'); return }
    if (calendarForm && (!draft.title?.trim() || !draft.eventType?.trim())) { setError('Enter an event title and type.'); return }
    if (performanceForm && !draft.period?.trim()) { setError('Review Period: enter the review period.'); return }
    if (performanceForm && fields.some(([key]) => key === 'employeeId') && !draft.employeeId) { setError('Employee ID: select an employee.'); return }
    if (performanceForm && fields.some(([key]) => key === 'employeeId') && !optionsFor('employeeId', options).some(option => String(option.value) === String(draft.employeeId))) { setError('Employee ID: select an available employee ID.'); return }
    for (const [key, spec] of fields) {
      const value = draft[key]
      if (value === '' || value == null) {
        if (!spec.nullable && (schema.required?.includes(key) || ['integer', 'number'].includes(spec.type) || spec.format === 'date' || spec.format === 'date-time' || spec.format === 'binary')) {
          setError(`${fieldLabel(key)}: this field is required.`); return
        }
        if (spec.nullable) data[key] = null
        continue
      }
      if (spec.format === 'date-time' && Number.isNaN(new Date(value).getTime())) { setError(`Please enter a valid ${fieldLabel(key)}.`); return }
      if (['integer', 'number'].includes(spec.type) && (!Number.isFinite(Number(value)) || (spec.type === 'integer' && !Number.isInteger(Number(value))))) { setError(`${fieldLabel(key)}: enter a valid ${spec.type === 'integer' ? 'whole number' : 'number'}.`); return }
      if (performanceForm && ['performanceScore', 'targetCompletion'].includes(key) && (Number(value) < 0 || Number(value) > 100)) { setError(`${fieldLabel(key)}: enter a value from 0 to 100.`); return }
      data[key] = ['integer', 'number'].includes(spec.type) ? Number(value) : spec.format === 'date-time' ? new Date(value).toISOString() : value
    }
    if (performanceForm && data.period) data.period = data.period.trim()
    if (profileForm && !String(draft.firstName ?? '').trim()) { setError('First Name: enter your first name.'); return }
    if (profileForm && data.firstName && !/^[\p{L}][\p{L}\p{M} '\-]*$/u.test(data.firstName.trim())) { setError('First Name: use letters, spaces, apostrophes, or hyphens only.'); return }
    if (profileForm && data.lastName && !/^[\p{L}][\p{L}\p{M} '\-]*$/u.test(data.lastName.trim())) { setError('Last Name: use letters, spaces, apostrophes, or hyphens only.'); return }
    if (profileForm && data.phone && !/^[6-9]\d{9}$/.test(String(data.phone).replace(/\s+/g, ''))) { setError('Phone: enter a valid 10-digit Indian mobile number.'); return }
    if (passwordForm && !data.currentPassword) { setError('Current Password: enter your current password.'); return }
    if (passwordForm && !data.newPassword) { setError('New Password: enter a new password.'); return }
    if (passwordForm && data.newPassword === data.currentPassword) { setError('New Password: choose a password different from your current password.'); return }
    if (passwordForm && !draft.confirmPassword) { setError('Confirm Password: enter your new password again.'); return }
    // Expired is a derived display state (the expiry date has passed), not a
    // writable announcement status on the API. Do not send it back on edit.
    if (announcementForm && String(data.status ?? '').trim().toLowerCase() === 'expired') delete data.status
    const start = data.fromDate ?? data.startDateTime ?? data.publishDate
    const end = data.toDate ?? data.endDateTime ?? data.expiryDate
    if (start && end && new Date(end) < new Date(start)) { setError('The end date must be on or after the start date.'); return }
    if (data.newPassword && draft.confirmPassword !== undefined && data.newPassword !== draft.confirmPassword) { setError('Confirm Password: does not match New Password.'); return }
    let payload = data
    if (definition?.mime === 'multipart/form-data') {
      payload = new FormData()
      Object.entries(data).forEach(([key, value]) => { if (value != null) payload.append(key, value) })
    }
    submitLock.current = true
    setBusy(true)
    try { await onSave(payload); onClose() }
    catch (failure) { setError(calendarForm || profileForm || passwordForm || employeeStatusForm || studentStatusForm || performanceForm ? getApiErrorMessage(failure) : hrError(failure, announcementForm ? 'announcements' : undefined)) }
    finally { submitLock.current = false; setBusy(false) }
  }
  // Announcements retain the existing illustrated dialog.
  if (announcementForm) {
    const audienceChoices = announcementOptions('audience', options)
    const statusChoices = announcementOptions('status', options).filter(option => option.value.trim().toLowerCase() !== 'expired')
    const isEdit = operation.startsWith('PUT')
    const field = (key, Icon, label, control) => (
      <label key={key} className="hra-field">
        <span className="hra-label">{label}</span>
        <span className={`hra-control ${key === 'content' ? 'is-area' : ''}`}><span className="hra-icon" aria-hidden="true"><Icon /></span>{control}{/Date$/.test(key) && <button type="button" tabIndex={-1} className="hra-trail" aria-label={`Open ${label} picker`} onClick={event => { try { event.currentTarget.previousElementSibling?.showPicker?.() } catch { event.currentTarget.previousElementSibling?.focus() } }}><CalendarDays aria-hidden="true" /></button>}</span>
      </label>
    )
    const select = (key, choices, label) => <select value={draft[key] ?? ''} disabled={busy || !choices.length} onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}><option value="">Select {label}</option>{draft[key] && !choices.some(choice => choice.value === draft[key]) && <option value={draft[key]}>{draft[key]}</option>}{choices.map(choice => <option key={choice.value} value={choice.value}>{choice.label}</option>)}</select>
    return createPortal(<div className="hra-overlay" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget && !busy) onClose() }}>
      <form onSubmit={submit} className="hra-dialog" role="dialog" aria-modal="true" aria-labelledby="hra-title">
        <aside className="hra-side" aria-hidden="true">
          <img className="hra-side__logo" src="/assets/kini-logo-transparent-cropped.png" alt="" />
          <p className="hra-side__title">{isEdit ? 'Edit' : 'Add'}<em>Announcement</em></p>
          <p className="hra-side__sub">Share important updates, news, and messages with your audience.</p>
          <img className="hra-side__art" src="/assets/kini-designs/ann-panel.webp" alt="" />
        </aside>
        <div className="hra-main">
        <header className="hra-head">
          <span className="hra-head__icon" aria-hidden="true"><Megaphone /></span>
          <div className="min-w-0 flex-1">
            <h2 id="hra-title">{isEdit ? 'Edit' : 'Add'} <em>Announcement</em></h2>
            <p>Share important updates, news, and messages with your audience.</p>
          </div>
          <img className="hra-head__art" src="/assets/kini-designs/ann-banner.webp" alt="" aria-hidden="true" />
          <button type="button" className="hra-close" aria-label="Close" disabled={busy} onClick={onClose}><X /></button>
        </header>
        <div className="hra-body">
          {field('title', FileText, 'Title', <input value={draft.title ?? ''} disabled={busy} placeholder="Enter announcement title" onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} />)}
          {field('content', NotebookPen, 'Content', <textarea rows={4} value={draft.content ?? ''} disabled={busy} placeholder="Enter announcement content" onChange={e => setDraft(d => ({ ...d, content: e.target.value }))} />)}
          {field('audience', Users, 'Audience', select('audience', audienceChoices, 'audience'))}
          {!audienceChoices.length && <p role="alert" className="hra-error">Audience options are unavailable. Close this form and refresh to retry.</p>}
          {isEdit && field('status', Megaphone, 'Status', select('status', statusChoices, 'status'))}
          {isEdit && String(hrField(values, 'status') ?? '').trim().toLowerCase() === 'expired' && <p className="text-sm text-slate-600">This announcement has expired. Choose a status before saving; its expiry date determines whether it remains expired.</p>}
          {field('publishDate', CalendarDays, 'Publish Date', <input type="datetime-local" step="any" value={draft.publishDate ?? ''} disabled={busy} onChange={e => setDraft(d => ({ ...d, publishDate: e.target.value }))} />)}
          {field('expiryDate', CalendarDays, 'Expiry Date', <input type="datetime-local" step="any" value={draft.expiryDate ?? ''} min={draft.publishDate || undefined} disabled={busy} onChange={e => setDraft(d => ({ ...d, expiryDate: e.target.value }))} />)}
          {error && <p role="alert" className="hra-error">{error}</p>}
        </div>
        <footer className="hra-foot">
          <button type="button" className="hra-btn hra-btn--ghost" disabled={busy} onClick={onClose}>Cancel</button>
          <button type="submit" className="hra-btn hra-btn--primary" disabled={busy}><Save aria-hidden="true" />{busy ? 'Saving...' : 'Save'}</button>
        </footer>
        </div>
      </form>
    </div>, document.body)
  }
  // Marking attendance uses the illustrated "Add Attendance" header.
  const attendanceCreate = /^POST \/api\/hr\/attendance(\/mark)?$/.test(operation ?? '')
  const hero = attendanceCreate
    ? <ModalHero icon={UserRoundCheck} title="Add" accent="Attendance" subtitle="Record employee attendance details for the selected date." art={ORG_BANNERS.addAttendance.src} onClose={onClose} closeDisabled={busy} />
    : undefined
  return <Modal open title={studentStatusForm ? <span id="student-status-title">{title}</span> : title} ariaLabelledBy={studentStatusForm ? 'student-status-title' : undefined} trapFocus={employeeStatusForm || studentStatusForm} onClose={() => { if (!busy) onClose() }} size={employeeStatusForm || studentStatusForm ? 'sm' : 'lg'} hero={hero}>
    <form onSubmit={submit} className="space-y-4 lg:space-y-3">
      {performanceForm && fields.some(([key]) => key === "employeeId") && !optionsFor("employeeId", options).length && <p role="alert">No employee options are available. Close this form and refresh, or ask your administrator for employee access.</p>}
      {fields.map(([key, spec]) => {
        const restrictedRole = employeeForm && key === 'role'
        const choices = studentStatusForm && key === 'status' ? STUDENT_STATUS_OPTIONS : employeeStatusForm && key === 'status' ? EMPLOYEE_STATUS_OPTIONS : performanceForm && key === 'employeeId' ? optionsFor(key, options).map(option => ({ ...option, label: String(option.value) })) : restrictedRole ? employeeRoleOptions(options) : optionsFor(key, options)
        const isPassword = /password/i.test(key)
        const type = spec.format === 'binary' ? 'file' : isPassword ? (visiblePasswords[key] ? 'text' : 'password') : profileForm && key === 'phone' ? 'tel' : spec.format === 'date-time' ? 'datetime-local' : spec.format === 'date' ? 'date' : ['integer', 'number'].includes(spec.type) ? 'number' : /email/i.test(key) ? 'email' : 'text'
        const required = (calendarForm && ['title', 'eventType'].includes(key)) || (performanceForm && ['employeeId', 'period'].includes(key)) || schema.required?.includes(key) || (!spec.nullable && (['integer', 'number'].includes(spec.type) || ['date', 'date-time', 'binary'].includes(spec.format)))
        return <label key={key} className="block text-sm font-medium text-slate-600 dark:text-slate-300">{fieldLabel(key)}{required ? ' *' : ''}
          {spec.type === 'boolean' ? <input className="ml-3" type="checkbox" checked={Boolean(draft[key])} disabled={busy} onChange={e => setDraft(d => ({ ...d, [key]: e.target.checked }))} /> : (choices.length || (performanceForm && key === "employeeId")) ?
            <select className={inputClass} value={draft[key] ?? ''} required={required} disabled={busy || (performanceForm && key === "employeeId" && !choices.length)} onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}><option value="">Select {fieldLabel(key)}</option>{draft[key] !== '' && draft[key] != null && !choices.some(c => String(c.value) === String(draft[key])) && <option value={draft[key]} hidden={restrictedRole} disabled={restrictedRole}>{restrictedRole ? 'Select Role' : draft[key]}</option>}{choices.map(choice => <option key={choice.value} value={choice.value}>{choice.label ?? choice.value}</option>)}</select> :
            /description|content|notes|reason/i.test(key) ? <textarea className={inputClass} rows={4} value={draft[key] ?? ''} disabled={busy} onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))} /> :
              <span className="relative block"><input className={`${inputClass} ${isPassword ? 'pr-10' : ''}`} type={type} maxLength={profileForm && key === 'phone' ? 10 : undefined} inputMode={profileForm && key === 'phone' ? 'numeric' : undefined} {...(type !== 'file' ? { value: draft[key] ?? '' } : {})} required={required} step={spec.type === 'number' ? 'any' : undefined} autoComplete={isPassword ? 'new-password' : undefined} disabled={busy} onChange={e => updateField(key, type === 'file' ? e.target.files?.[0] : e.target.value)} />{isPassword && <button type="button" aria-label={visiblePasswords[key] ? `Hide ${fieldLabel(key)}` : `Show ${fieldLabel(key)}`} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700" onClick={() => setVisiblePasswords(current => ({ ...current, [key]: !current[key] }))}>{visiblePasswords[key] ? <EyeOff size={16} /> : <Eye size={16} />}</button>}</span>}
        </label>
      })}
      {fields.some(([key]) => key === 'newPassword') && <label className="block text-sm text-slate-700 dark:text-slate-200">Confirm Password<span className="relative block"><input className={`${inputClass} pr-10`} type={visiblePasswords.confirmPassword ? 'text' : 'password'} required autoComplete="new-password" value={draft.confirmPassword ?? ''} onChange={e => setDraft(d => ({ ...d, confirmPassword: e.target.value }))} /><button type="button" aria-label={visiblePasswords.confirmPassword ? 'Hide Confirm Password' : 'Show Confirm Password'} aria-pressed={Boolean(visiblePasswords.confirmPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 dark:text-slate-300" onClick={() => setVisiblePasswords(current => ({ ...current, confirmPassword: !current.confirmPassword }))}>{visiblePasswords.confirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></span></label>}
      {error && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p>}
      <div className="flex justify-end gap-2"><Button type="button" variant="secondary" disabled={busy} onClick={onClose}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? 'Saving...' : 'Save'}</Button></div>
    </form>
  </Modal>
}
