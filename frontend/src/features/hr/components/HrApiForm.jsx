import { Fragment, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { BriefcaseBusiness, CalendarDays, CalendarPlus, Eye, EyeOff, FileText, GraduationCap, IdCard, Layers3, Link2, Mail, MapPin, Megaphone, NotebookPen, Palette, Pencil, Phone, Save, Tag, UserRoundCheck, Users, X } from 'lucide-react'
import './portal/hr-announcement-form.css'
import './portal/hr-event-form.css'
import './portal/hr-edit-employee.css'
import Modal from '@shared/components/Modal'
import Button from '@shared/components/Button'
import { HR_API_CONTRACT } from '../services/hrApiContract'
import { calendarDate } from '../services/hrCalendarData'
import getApiErrorMessage from '@/utils/getApiErrorMessage'
import { hrError, hrField } from '../services/hrApi'
import { announcementOptions, formatAnnouncementDate, parseAnnouncementDate } from '../services/hrAnnouncementData'
import { employeeRoleOptions, fieldLabel, optionsFor } from '../services/hrFormOptions'
import AddEmployeeModal from './AddEmployeeModal'
import { EMPLOYEE_STATUS_OPTIONS } from '../constants/employeeStatuses'
import { STUDENT_STATUS_OPTIONS } from '../constants/studentStatuses'
import AddLeaveModal from './AddLeaveModal'
import ModalHero from '@shared/components/ModalHero'
import { ORG_BANNERS } from '@features/organization/constants/orgBanners'
const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white'
const employeeFieldLimits = { firstName: 50, lastName: 50, email: 254, phone: 10, designation: 100, employmentType: 50 }
const employeePlaceholders = { firstName: 'Enter first name', lastName: 'Enter last name', email: 'Enter email address', phone: 'Enter 10-digit mobile number', departmentId: 'Enter department ID', designation: 'Enter designation', employmentType: 'Enter employment type' }
// Event types the calendar API accepts (used when the options endpoint sends none).
const EVENT_TYPES = ['CLASS', 'MEETING', 'HOLIDAY', 'LEAVE', 'TRAINING', 'INTERVIEW', 'OTHER']
const EVENT_COLORS = [
  { value: '#2f6fe4', label: 'Blue' }, { value: '#16a34a', label: 'Green' }, { value: '#f39924', label: 'Orange' },
  { value: '#7c3aed', label: 'Purple' }, { value: '#e5484d', label: 'Red' }, { value: '#0d9488', label: 'Teal' },
]
const EVENT_DESCRIPTION_LIMIT = 500
const mobileDigits = value => String(value).trim().replace(/^\+\s*91[\s()-]*/, '').replace(/\D/g, '')

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
  const attendanceForm = /^(POST|PUT) \/api\/hr\/attendance(?:\/|$)/.test(operation ?? '')
  const submitLock = useRef(false)
  const employeeForm = /^\w+ \/api\/hr\/employees(?:\/|$)/.test(operation ?? '')
  const employeeEdit = operation === 'PUT /api/hr/employees/{employeeId}'
  const formId = useId()
  const formRef = useRef(null)
  const employeeStatusForm = operation === 'PATCH /api/hr/employees/{employeeId}/status'
  const studentStatusForm = operation === 'PATCH /api/students/{studentId}/status'
  const statusForm = employeeStatusForm || studentStatusForm
  const spacedForm = statusForm || attendanceForm
  const performanceForm = /^\w+ \/api\/hr\/performance(?:\/|$)/.test(operation ?? '')
  const fields = Object.entries(schema?.properties ?? {}).filter(([key]) =>
    operation !== 'POST /api/hr/employees' || !['departmentId', 'designation', 'joiningDate'].includes(key)
  )
  const [draft, setDraft] = useState(() => Object.fromEntries(fields.map(([key, spec]) => {
    let value = hrField(values, key) ?? (spec.type === 'boolean' ? false : '')
    if (employeeEdit && key === 'phone' && value && mobileDigits(value).length === 10) value = mobileDigits(value)
    if (announcementForm && key === 'status' && String(value).trim().toLowerCase() === 'expired') value = ''
    if (spec.format === 'date-time' && value) {
      const date = calendarForm ? calendarDate(value) : announcementForm ? new Date(parseAnnouncementDate(value)) : new Date(value)
      if (!Number.isNaN(date.getTime())) value = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, announcementForm ? 23 : 16)
    }
    return [key, value]
  })))
  const [busy, setBusy] = useState(false)
  const initialDraft = useRef(draft)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const focusError = useRef(false)
  useEffect(() => {
    if (!employeeEdit || busy || !focusError.current) return
    focusError.current = false
    const first = Object.keys(fieldErrors).find(key => fieldErrors[key])
    if (first) formRef.current?.elements.namedItem(first)?.focus()
  }, [fieldErrors, busy, employeeEdit])
  const showFieldErrors = errors => {
    focusError.current = true
    setFieldErrors(errors)
  }
  const [visiblePasswords, setVisiblePasswords] = useState({})
  const updateField = (key, value) => {
    if (employeeEdit && key === 'phone') value = mobileDigits(value).slice(0, 10)
    if (employeeEdit && employeeFieldLimits[key]) value = String(value).slice(0, employeeFieldLimits[key])
    if (employeeEdit && key === 'departmentId') value = String(value).replace(/\D/g, '').slice(0, 10)
    if (profileForm && ['firstName', 'lastName'].includes(key)) value = value.replace(/[^\p{L}\p{M} '-]/gu, '')
    if (profileForm && key === 'phone') value = value.replace(/\D/g, '').slice(0, 10)
    setDraft(current => ({ ...current, [key]: value }))
    if (employeeEdit) {
      setFieldErrors(current => ({ ...current, [key]: undefined }))
      setError('')
    }
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
    if (attendanceForm && String(draft.status ?? '').trim().toLowerCase() === 'present' && !String(draft.checkOut ?? '').trim()) {
      setError('Check Out: enter a check-out time before saving attendance as Present.')
      return
    }
    if (attendanceForm && fields.some(([key]) => key === 'employeeId') && !optionsFor('employeeId', options).some(option => String(option.value) === String(draft.employeeId))) {
      setError('Employee ID: select an available employee.')
      return
    }
    if (employeeEdit) {
      const errors = {}
      for (const key of ['firstName', 'lastName']) {
        const value = String(draft[key] ?? '').trim()
        if (!value) errors[key] = `Enter ${fieldLabel(key).toLowerCase()}.`
        else if (!/^\p{L}[\p{L}\p{M} '\u2019-]*$/u.test(value)) errors[key] = 'Use letters, spaces, hyphens or apostrophes only.'
      }
      if (draft.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(draft.email).trim())) errors.email = 'Enter a valid email address.'
      const phone = String(draft.phone ?? '').trim().replace(/[\s()-]/g, '').replace(/^\+91/, '')
      if (phone && !/^[6-9]\d{9}$/.test(phone)) errors.phone = 'Enter a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9.'
      for (const [key, spec] of fields) {
        if (['integer', 'number'].includes(spec.type) && draft[key] !== '' && draft[key] != null && (!Number.isFinite(Number(draft[key])) || spec.type === 'integer' && !Number.isInteger(Number(draft[key])))) errors[key] = 'Enter a valid number.'
        if (spec.format === 'date-time' && draft[key] && Number.isNaN(new Date(draft[key]).getTime())) errors[key] = 'Enter a valid date and time.'
      }
      if (draft.departmentId !== '' && draft.departmentId != null && (Number(draft.departmentId) < 1 || Number(draft.departmentId) > 2147483647)) errors.departmentId = 'Enter a valid positive department ID.'
      showFieldErrors(errors)
      if (Object.keys(errors).length) return
    }
    if (announcementForm) {
      const errors = {}
      if (!String(draft.title ?? '').trim()) errors.title = 'Enter a title.'
      if (!String(draft.content ?? '').trim()) errors.content = 'Enter the announcement content.'
      if (!String(draft.audience ?? '').trim()) errors.audience = 'Select who should see this announcement.'
      const publishAt = draft.publishDate ? new Date(draft.publishDate).getTime() : Date.now()
      if (draft.publishDate && Number.isNaN(publishAt)) errors.publishDate = 'Enter a valid publish date and time.'
      if (draft.expiryDate) {
        const expiryAt = new Date(draft.expiryDate).getTime()
        if (Number.isNaN(expiryAt)) errors.expiryDate = 'Enter a valid expiry date and time.'
        else if (!errors.publishDate && expiryAt <= publishAt) errors.expiryDate = 'Expiry must be later than the publish date and time.'
      }
      setFieldErrors(errors)
      if (Object.keys(errors).length) return
    }
    if (announcementForm && operation.startsWith('PUT') && !announcementOptions('status', options).filter(option => option.value.trim().toLowerCase() !== 'expired').some(option => option.value === draft.status)) {
      setError('Status: select an available status. Expired is calculated from the expiry date and cannot be saved as a status.')
      return
    }
    const data = {}
    if (employeeStatusForm && !EMPLOYEE_STATUS_OPTIONS.some(option => option.value === draft.status)) { setError('Select Active, On Leave or Resigned.'); return }
    if (studentStatusForm && !STUDENT_STATUS_OPTIONS.some(option => option.value === draft.status)) { setError('Select Active, Pending, Inactive or Rejected.'); return }
    if (calendarForm) {
      const errors = {}
      if (!String(draft.eventType ?? '').trim()) errors.eventType = 'Select an event type.'
      if (!String(draft.title ?? '').trim()) errors.title = 'Enter an event title.'
      if (String(draft.description ?? '').length > EVENT_DESCRIPTION_LIMIT) errors.description = `Keep the description under ${EVENT_DESCRIPTION_LIMIT} characters.`
      const startAt = draft.startDateTime ? new Date(draft.startDateTime).getTime() : NaN
      const endAt = draft.endDateTime ? new Date(draft.endDateTime).getTime() : NaN
      if (!Number.isFinite(startAt)) errors.startDateTime = 'Choose when the event starts.'
      if (!Number.isFinite(endAt)) errors.endDateTime = 'Choose when the event ends.'
      else if (Number.isFinite(startAt) && endAt < startAt) errors.endDateTime = 'End must be on or after the start.'
      if (draft.meetingLink && !/^https?:\/\/\S+$/i.test(String(draft.meetingLink).trim())) errors.meetingLink = 'Enter a full link starting with https://'
      for (const key of ['courseId', 'batchId', 'employeeId', 'studentId']) {
        const value = draft[key]
        if (value !== '' && value != null && !(Number.isInteger(Number(value)) && Number(value) > 0)) errors[key] = 'Enter a positive whole number.'
      }
      setFieldErrors(errors)
      if (Object.keys(errors).length) return
    }
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
    if (employeeEdit) {
      for (const key of ['firstName', 'lastName', 'email']) if (typeof data[key] === 'string') data[key] = data[key].trim()
      if (data.phone) data.phone = String(data.phone).trim().replace(/[\s()-]/g, '').replace(/^\+91/, '')
    }
    if (profileForm && !String(draft.firstName ?? '').trim()) { setError('First Name: enter your first name.'); return }
    if (profileForm && data.firstName && !/^[\p{L}][\p{L}\p{M} '-]*$/u.test(data.firstName.trim())) { setError('First Name: use letters, spaces, apostrophes, or hyphens only.'); return }
    if (profileForm && data.lastName && !/^[\p{L}][\p{L}\p{M} '-]*$/u.test(data.lastName.trim())) { setError('Last Name: use letters, spaces, apostrophes, or hyphens only.'); return }
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
    catch (failure) {
      if (employeeEdit) {
        const body = failure?.response?.data
        const errors = body?.errors ?? body?.data?.errors ?? {}
        const mapped = {}
        for (const [key] of fields) {
          const actual = Object.keys(errors).find(name => name.split('.').at(-1).toLowerCase() === key.toLowerCase())
          const messages = errors[actual]
          const message = (Array.isArray(messages) ? messages : [messages]).filter(value => typeof value === 'string').join(' ')
          if (message) mapped[key] = message
        }
        showFieldErrors(mapped)
      }
      setError(calendarForm || profileForm || passwordForm || employeeForm || employeeStatusForm || studentStatusForm || performanceForm ? getApiErrorMessage(failure) : hrError(failure, announcementForm ? 'announcements' : undefined))
    }
    finally { submitLock.current = false; setBusy(false) }
  }
  // Calendar events: two-panel dialog (brand panel + form), fixed footer.
  if (calendarForm && fields.some(([key]) => key === 'eventType')) {
    const isEdit = operation.startsWith('PUT')
    const typeChoices = optionsFor('eventType', options).length
      ? optionsFor('eventType', options)
      : EVENT_TYPES.map(value => ({ value, label: value[0] + value.slice(1).toLowerCase() }))
    const errorId = key => `${formId}-${key}-error`
    const clearError = key => { if (fieldErrors[key]) setFieldErrors(current => ({ ...current, [key]: undefined })) }
    const setValue = (key, value) => { setDraft(d => ({ ...d, [key]: value })); clearError(key) }
    const has = key => fields.some(([name]) => name === key)
    const props = key => ({ id: `${formId}-${key}`, name: key, disabled: busy, 'aria-invalid': Boolean(fieldErrors[key]), 'aria-describedby': fieldErrors[key] ? errorId(key) : undefined, 'aria-required': ['eventType', 'title', 'startDateTime', 'endDateTime'].includes(key) || undefined })
    const field = (key, Icon, label, control, { required = false, wide = false, trail } = {}) => has(key) && (
      <div key={key} className={`hev-field ${wide ? 'is-wide' : ''}`}>
        <label className={`hev-label ${required ? 'is-required' : ''}`} htmlFor={`${formId}-${key}`}>{label}</label>
        <span className={`hev-control ${key === 'description' ? 'is-area' : ''} ${fieldErrors[key] ? 'is-invalid' : ''}`}>
          <span className="hev-icon" aria-hidden="true"><Icon /></span>{control}{trail}
        </span>
        {fieldErrors[key] && <span id={errorId(key)} className="hev-error" role="alert">{fieldErrors[key]}</span>}
      </div>
    )
    const allDay = Boolean(draft.allDay)
    const dayOf = value => String(value ?? '').slice(0, 10)
    const setAllDay = on => {
      setDraft(d => {
        const start = dayOf(d.startDateTime) || dayOf(d.endDateTime)
        const end = dayOf(d.endDateTime) || start
        return on && start ? { ...d, allDay: true, startDateTime: `${start}T00:00`, endDateTime: `${end}T23:59` } : { ...d, allDay: on }
      })
      clearError('startDateTime'); clearError('endDateTime')
    }
    const picker = label => <button type="button" tabIndex={-1} className="hev-trail" aria-label={`Open ${label} picker`} disabled={busy} onClick={event => { const input = event.currentTarget.parentElement?.querySelector('input'); try { input?.showPicker?.() } catch { input?.focus() } }}><CalendarDays aria-hidden="true" /></button>
    const dateInput = key => allDay
      ? <input {...props(key)} type="date" value={dayOf(draft[key])} onChange={e => setValue(key, e.target.value ? `${e.target.value}T${key === 'startDateTime' ? '00:00' : '23:59'}` : '')} />
      : <input {...props(key)} type="datetime-local" value={String(draft[key] ?? '').slice(0, 16)} min={key === 'endDateTime' ? String(draft.startDateTime ?? '').slice(0, 16) || undefined : undefined} onChange={e => setValue(key, e.target.value)} />
    const colorValue = String(draft.color ?? '')
    const colorChoice = EVENT_COLORS.find(item => item.value.toLowerCase() === colorValue.toLowerCase())
    const idInput = (key, placeholder) => <input {...props(key)} type="text" inputMode="numeric" pattern="[0-9]*" value={draft[key] ?? ''} placeholder={placeholder} onChange={e => setValue(key, e.target.value.replace(/[^0-9]/g, '').slice(0, 9))} />
    const descriptionLength = String(draft.description ?? '').length
    return createPortal(<div className="hev-overlay" role="presentation" onKeyDown={event => { if (event.key === 'Escape' && !busy) onClose() }} onMouseDown={event => { if (event.target === event.currentTarget && !busy) onClose() }}>
      <form onSubmit={submit} noValidate className="hev-dialog" role="dialog" aria-modal="true" aria-labelledby={`${formId}-heading`}>
        <aside className="hev-side" aria-hidden="true">
          <img className="hev-side__logo" src="/assets/kini-logo-transparent-cropped.png" alt="" />
          <p className="hev-side__title">{isEdit ? 'Edit' : 'Add'} <em>Event</em></p>
          <p className="hev-side__sub">{isEdit ? 'Update the details of this event for your organization.' : 'Create and schedule a new event for your organization.'}</p>
          <div className="hev-side__art"><img src="/assets/kini-designs/hr-calendar.webp" alt="" /></div>
        </aside>
        <div className="hev-main">
          <header className="hev-head">
            <span className="hev-head__icon" aria-hidden="true"><CalendarDays /></span>
            <div className="hev-head__copy">
              <h2 id={`${formId}-heading`}>{isEdit ? 'Edit Event' : 'Add Event'}</h2>
              <p>{isEdit ? 'Update this event for your organization.' : 'Create a new event for your organization.'}</p>
            </div>
            <button type="button" className="hev-close" aria-label="Close" disabled={busy} onClick={onClose}><X /></button>
          </header>
          <div className="hev-body">
            {field('eventType', Tag, 'Event Type', <select {...props('eventType')} value={draft.eventType ?? ''} onChange={e => setValue('eventType', e.target.value)}><option value="">Select event type</option>{draft.eventType && !typeChoices.some(choice => String(choice.value) === String(draft.eventType)) && <option value={draft.eventType}>{draft.eventType}</option>}{typeChoices.map(choice => <option key={choice.value} value={choice.value}>{choice.label ?? choice.value}</option>)}</select>, { required: true })}
            {field('title', FileText, 'Title', <input {...props('title')} value={draft.title ?? ''} maxLength={200} placeholder="Enter event title" onChange={e => setValue('title', e.target.value)} />, { required: true })}
            {field('description', NotebookPen, 'Description', <><textarea {...props('description')} rows={3} value={draft.description ?? ''} maxLength={EVENT_DESCRIPTION_LIMIT} placeholder="Enter event description..." onChange={e => setValue('description', e.target.value)} /><span className="hev-count" aria-live="polite">{descriptionLength} / {EVENT_DESCRIPTION_LIMIT}</span></>, { wide: true })}
            {field('startDateTime', CalendarDays, allDay ? 'Start Date' : 'Start Date & Time', dateInput('startDateTime'), { required: true, trail: picker('start date') })}
            {field('endDateTime', CalendarDays, allDay ? 'End Date' : 'End Date & Time', dateInput('endDateTime'), { required: true, trail: picker('end date') })}
            {field('location', MapPin, 'Location', <input {...props('location')} value={draft.location ?? ''} maxLength={200} placeholder="Enter location" onChange={e => setValue('location', e.target.value)} />)}
            {field('meetingLink', Link2, 'Meeting Link', <input {...props('meetingLink')} type="url" value={draft.meetingLink ?? ''} placeholder="Enter meeting link (e.g., Teams/Meet)" onChange={e => setValue('meetingLink', e.target.value)} />)}
            {has('allDay') && <div className="hev-field">
              <span className="hev-label" id={`${formId}-allDay-label`}>All Day</span>
              <label className="hev-switch">
                <input type="checkbox" role="switch" checked={allDay} disabled={busy} aria-labelledby={`${formId}-allDay-label`} onChange={e => setAllDay(e.target.checked)} />
                <span className="hev-switch__track" aria-hidden="true"><span /></span>
                <span>Yes, this is a full day event</span>
              </label>
            </div>}
            {field('color', Palette, 'Color', <select {...props('color')} value={colorValue} onChange={e => setValue('color', e.target.value)}><option value="">Select event color</option>{colorValue && !colorChoice && <option value={colorValue}>{colorValue}</option>}{EVENT_COLORS.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select>, { trail: <span className="hev-swatch" aria-hidden="true" style={{ background: colorValue || '#2f6fe4' }} /> })}
            {field('courseId', Layers3, 'Course ID', idInput('courseId', 'Enter course ID'))}
            {field('batchId', Users, 'Batch ID', idInput('batchId', 'Enter batch ID'))}
            {field('employeeId', IdCard, 'Employee ID', idInput('employeeId', 'Enter employee ID'))}
            {field('studentId', GraduationCap, 'Student ID', idInput('studentId', 'Enter student ID'))}
            {error && <p role="alert" className="hev-form-error is-wide">{error}</p>}
          </div>
          <footer className="hev-foot">
            <button type="button" className="hev-btn hev-btn--ghost" disabled={busy} onClick={onClose}>Cancel</button>
            <button type="submit" className="hev-btn hev-btn--primary" disabled={busy}><CalendarPlus aria-hidden="true" />{busy ? 'Saving\u2026' : isEdit ? 'Save Changes' : 'Add Event'}</button>
          </footer>
        </div>
      </form>
    </div>, document.body)
  }
  // Announcements: compact dialog (header, scrollable fields, fixed footer).
  if (announcementForm) {
    const audienceChoices = announcementOptions('audience', options)
    const statusChoices = announcementOptions('status', options).filter(option => option.value.trim().toLowerCase() !== 'expired')
    const isEdit = operation.startsWith('PUT')
    const errorId = key => `${formId}-${key}-error`
    const clearError = key => { if (fieldErrors[key]) setFieldErrors(current => ({ ...current, [key]: undefined })) }
    const setValue = (key, value) => { setDraft(d => ({ ...d, [key]: value })); clearError(key) }
    const field = (key, Icon, label, control, { required = false, hint, wide = false } = {}) => (
      <div key={key} className={`hra-field ${wide ? 'is-wide' : ''}`}>
        <label className={`hra-label ${required ? 'is-required' : ''}`} htmlFor={`${formId}-${key}`}>{label}</label>
        <span className={`hra-control ${key === 'content' ? 'is-area' : ''} ${fieldErrors[key] ? 'is-invalid' : ''}`}><span className="hra-icon" aria-hidden="true"><Icon /></span>{control}{/Date$/.test(key) && <button type="button" tabIndex={-1} className="hra-trail" aria-label={`Open ${label} picker`} onClick={event => { try { event.currentTarget.previousElementSibling?.showPicker?.() } catch { event.currentTarget.previousElementSibling?.focus() } }}><CalendarDays aria-hidden="true" /></button>}</span>
        {fieldErrors[key] ? <span id={errorId(key)} className="hra-field-error" role="alert">{fieldErrors[key]}</span> : hint ? <span className="hra-hint">{hint}</span> : null}
      </div>
    )
    const controlProps = key => ({ id: `${formId}-${key}`, 'aria-required': ['title', 'content', 'audience', 'status'].includes(key) || undefined, 'aria-invalid': Boolean(fieldErrors[key]), 'aria-describedby': fieldErrors[key] ? errorId(key) : undefined, disabled: busy })
    const select = (key, choices, label) => <select {...controlProps(key)} value={draft[key] ?? ''} disabled={busy || !choices.length} onChange={e => { updateField(key, e.target.value); clearError(key) }}><option value="">Select {label}</option>{draft[key] && !choices.some(choice => choice.value === draft[key]) && <option value={draft[key]}>{draft[key]}</option>}{choices.map(choice => <option key={choice.value} value={choice.value}>{choice.label}</option>)}</select>
    const publishAt = draft.publishDate ? new Date(draft.publishDate).getTime() : NaN
    const scheduled = Number.isFinite(publishAt) && publishAt > Date.now()
    const publishHint = !draft.publishDate ? 'Leave empty to publish immediately.' : scheduled ? `Scheduled: visible from ${formatAnnouncementDate(new Date(publishAt).toISOString())}.` : 'Visible immediately after saving.'
    return createPortal(<div className="hra-overlay" role="presentation" onKeyDown={event => { if (event.key === 'Escape' && !busy) onClose() }} onMouseDown={event => { if (event.target === event.currentTarget && !busy) onClose() }}>
      <form onSubmit={submit} noValidate className="hra-dialog" role="dialog" aria-modal="true" aria-labelledby="hra-title">
        <header className="hra-head">
          <span className="hra-head__icon" aria-hidden="true"><Megaphone /></span>
          <div className="hra-head__copy">
            <h2 id="hra-title">{isEdit ? 'Edit' : 'Add'} Announcement</h2>
            <p>Share important updates, news, and messages with your audience.</p>
          </div>
          <button type="button" className="hra-close" aria-label="Close" disabled={busy} onClick={onClose}><X /></button>
        </header>
        <div className="hra-body">
          {field('title', FileText, 'Title', <input {...controlProps('title')} value={draft.title ?? ''} maxLength={200} placeholder="Enter announcement title" onChange={e => setValue('title', e.target.value)} />, { required: true, wide: true })}
          {field('content', NotebookPen, 'Content', <textarea {...controlProps('content')} rows={5} value={draft.content ?? ''} placeholder="Enter announcement content" onChange={e => setValue('content', e.target.value)} />, { required: true, wide: true })}
          {field('audience', Users, 'Audience', select('audience', audienceChoices, 'audience'), { required: true, wide: !isEdit })}
          {isEdit && field('status', Megaphone, 'Status', select('status', statusChoices, 'status'), { required: true })}
          {!audienceChoices.length && <p role="alert" className="hra-error is-wide">Audience options are unavailable. Close this form and refresh to retry.</p>}
          {isEdit && String(hrField(values, 'status') ?? '').trim().toLowerCase() === 'expired' && <p className="hra-note is-wide">This announcement has expired. Choose a status before saving; its expiry date determines whether it remains expired.</p>}
          {field('publishDate', CalendarDays, 'Publish Date', <input {...controlProps('publishDate')} type="datetime-local" step="any" value={draft.publishDate ?? ''} onChange={e => setValue('publishDate', e.target.value)} />, { hint: publishHint })}
          {field('expiryDate', CalendarDays, 'Expiry Date', <input {...controlProps('expiryDate')} type="datetime-local" step="any" value={draft.expiryDate ?? ''} min={draft.publishDate || undefined} onChange={e => setValue('expiryDate', e.target.value)} />, { hint: 'Optional. Must be later than the publish date.' })}
          {error && <p role="alert" className="hra-error is-wide">{error}</p>}
        </div>
        <footer className="hra-foot">
          <button type="button" className="hra-btn hra-btn--ghost" disabled={busy} onClick={onClose}>Cancel</button>
          <button type="submit" className="hra-btn hra-btn--primary" disabled={busy}><Save aria-hidden="true" />{busy ? 'Saving…' : 'Save Announcement'}</button>
        </footer>
      </form>
    </div>, document.body)
  }
  // Marking attendance uses the illustrated "Add Attendance" header.
  const attendanceCreate = /^POST \/api\/hr\/attendance(\/mark)?$/.test(operation ?? '')
  const hero = employeeEdit
    ? <ModalHero icon={Pencil} title="Edit" accent="Employee" titleId={`${formId}-title`} subtitle="Update personal information and employment details." onClose={onClose} closeDisabled={busy} />
    : attendanceCreate
    ? <ModalHero icon={UserRoundCheck} title="Add" accent="Attendance" subtitle="Record employee attendance details for the selected date." art={ORG_BANNERS.addAttendance.src} onClose={onClose} closeDisabled={busy} />
    : undefined
  return <Modal open title={studentStatusForm ? <span id="student-status-title">{title}</span> : title} ariaLabelledBy={employeeEdit ? `${formId}-title` : studentStatusForm ? 'student-status-title' : undefined} trapFocus={employeeForm || statusForm || attendanceForm} onClose={() => { if (!busy) onClose() }} size={statusForm ? 'sm' : attendanceForm ? 'md' : 'lg'} hero={hero} className={employeeEdit ? 'hee-dialog' : ''} bodyClassName={employeeEdit ? 'hee-body' : ''}>
    <form ref={formRef} noValidate={employeeEdit} onSubmit={submit} className={employeeEdit ? 'hee-form' : spacedForm ? 'flex flex-col gap-5' : 'space-y-4 lg:space-y-3'}>
      {attendanceForm && fields.some(([key]) => key === 'employeeId') && !optionsFor('employeeId', options).length && <p role="alert">No employees are available for selection. Refresh the page or check employee access.</p>}
      {performanceForm && fields.some(([key]) => key === "employeeId") && !optionsFor("employeeId", options).length && <p role="alert">No employee options are available. Close this form and refresh, or ask your administrator for employee access.</p>}
      <div className={employeeEdit ? 'hee-fields' : spacedForm ? 'grid gap-4' : 'contents'}>
      {employeeEdit && <div className="hee-section"><span className="hee-section-icon"><Users aria-hidden="true" /></span><div><h3>Personal Information</h3><p>Employee identity and contact details</p></div><span className="hee-section-note">Employee profile</span></div>}
      {fields.map(([key, spec]) => {
        const restrictedRole = employeeForm && key === 'role'
        const label = employeeEdit && key === 'phone' ? 'Mobile Number' : fieldLabel(key)
        const choices = studentStatusForm && key === 'status' ? STUDENT_STATUS_OPTIONS : employeeStatusForm && key === 'status' ? EMPLOYEE_STATUS_OPTIONS : performanceForm && key === 'employeeId' ? optionsFor(key, options).map(option => ({ ...option, label: String(option.value) })) : attendanceForm && key === 'employeeId' ? optionsFor(key, options).map(option => ({ ...option, label: option.label && String(option.label) !== String(option.value) ? String(option.value) + ' - ' + option.label : String(option.value) })) : restrictedRole ? employeeRoleOptions(options) : optionsFor(key, options)
        const isPassword = /password/i.test(key)
        const type = spec.format === 'binary' ? 'file' : isPassword ? (visiblePasswords[key] ? 'text' : 'password') : (profileForm || employeeEdit) && key === 'phone' ? 'tel' : spec.format === 'date-time' ? 'datetime-local' : spec.format === 'date' ? 'date' : ['integer', 'number'].includes(spec.type) ? 'number' : /email/i.test(key) ? 'email' : 'text'
        const validationProps = employeeEdit ? { name: key, 'aria-label': label, placeholder: employeePlaceholders[key], 'aria-invalid': Boolean(fieldErrors[key]), 'aria-describedby': fieldErrors[key] ? `${formId}-${key}-error` : undefined, style: fieldErrors[key] ? { borderColor: '#dc2626' } : undefined } : {}
        const required = (calendarForm && ['title', 'eventType'].includes(key)) || (performanceForm && ['employeeId', 'period'].includes(key)) || schema.required?.includes(key) || (!spec.nullable && (['integer', 'number'].includes(spec.type) || ['date', 'date-time', 'binary'].includes(spec.format)))
        return <Fragment key={key}>
          {employeeEdit && key === 'role' && <div className="hee-section hee-section--employment"><span className="hee-section-icon"><BriefcaseBusiness aria-hidden="true" /></span><div><h3>Employment Details</h3><p>Role, department and joining information</p></div></div>}
          <label data-field={key} className={employeeEdit ? 'hee-field' : spacedForm ? 'flex flex-col gap-2 text-sm font-medium text-slate-600 dark:text-slate-300' : 'block text-sm font-medium text-slate-600 dark:text-slate-300'}><span className={employeeEdit ? 'hee-label' : undefined}>{label}{required ? ' *' : ''}</span>
          {spec.type === 'boolean' ? <input className="ml-3" type="checkbox" checked={Boolean(draft[key])} disabled={busy} onChange={e => setDraft(d => ({ ...d, [key]: e.target.checked }))} /> : (choices.length || ((performanceForm || attendanceForm) && key === "employeeId")) ?
            <select {...validationProps} className={inputClass} value={draft[key] ?? ''} required={required} disabled={busy || ((performanceForm || attendanceForm) && key === "employeeId" && !choices.length)} onChange={e => updateField(key, e.target.value)}><option value="">Select {fieldLabel(key)}</option>{draft[key] !== '' && draft[key] != null && !choices.some(c => String(c.value) === String(draft[key])) && <option value={draft[key]} hidden={restrictedRole} disabled={restrictedRole}>{restrictedRole ? 'Select Role' : draft[key]}</option>}{choices.map(choice => <option key={choice.value} value={choice.value}>{choice.label ?? choice.value}</option>)}</select> :
            /description|content|notes|reason/i.test(key) ? <textarea {...validationProps} className={inputClass} rows={4} value={draft[key] ?? ''} disabled={busy} onChange={e => updateField(key, e.target.value)} /> :
              <span className="relative block">{employeeEdit && key === 'email' && <Mail className="hee-field-icon" aria-hidden="true" />}{employeeEdit && key === 'phone' && <Phone className="hee-field-icon" aria-hidden="true" />}<input {...validationProps} className={`${inputClass} ${isPassword ? 'pr-10' : ''}`} type={type} maxLength={employeeEdit ? spec.maxLength ?? employeeFieldLimits[key] : profileForm && key === 'phone' ? 10 : undefined} inputMode={(profileForm || employeeEdit) && key === 'phone' ? 'numeric' : undefined} {...(type !== 'file' ? { value: draft[key] ?? '' } : {})} required={required} step={spec.type === 'number' ? 'any' : undefined} autoComplete={isPassword ? 'new-password' : employeeEdit && key === 'phone' ? 'tel-national' : undefined} onPaste={employeeEdit && key === 'phone' ? event => { event.preventDefault(); const input = event.currentTarget; updateField(key, input.value.slice(0, input.selectionStart ?? 0) + event.clipboardData.getData('text') + input.value.slice(input.selectionEnd ?? input.value.length)) } : undefined} disabled={busy} onChange={e => updateField(key, type === 'file' ? e.target.files?.[0] : e.target.value)} />{isPassword && <button type="button" aria-label={visiblePasswords[key] ? `Hide ${fieldLabel(key)}` : `Show ${fieldLabel(key)}`} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700" onClick={() => setVisiblePasswords(current => ({ ...current, [key]: !current[key] }))}>{visiblePasswords[key] ? <EyeOff size={16} /> : <Eye size={16} />}</button>}</span>}
          {employeeEdit && fieldErrors[key] && <span id={`${formId}-${key}-error`} role="alert" className="mt-1 block text-sm font-normal text-red-700 dark:text-red-300">{fieldErrors[key]}</span>}
        </label></Fragment>
      })}
      </div>
      {fields.some(([key]) => key === 'newPassword') && <label className="block text-sm text-slate-700 dark:text-slate-200">Confirm Password<span className="relative block"><input className={`${inputClass} pr-10`} type={visiblePasswords.confirmPassword ? 'text' : 'password'} required autoComplete="new-password" value={draft.confirmPassword ?? ''} onChange={e => setDraft(d => ({ ...d, confirmPassword: e.target.value }))} /><button type="button" aria-label={visiblePasswords.confirmPassword ? 'Hide Confirm Password' : 'Show Confirm Password'} aria-pressed={Boolean(visiblePasswords.confirmPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 dark:text-slate-300" onClick={() => setVisiblePasswords(current => ({ ...current, confirmPassword: !current.confirmPassword }))}>{visiblePasswords.confirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></span></label>}
      {error && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p>}
      <div className={employeeEdit ? 'hee-footer' : attendanceForm ? 'flex justify-end gap-3 border-t border-border-subtle pt-4' : 'flex justify-end gap-2'}>{employeeEdit && <p>Review the details before saving.</p>}<Button type="button" variant="secondary" disabled={busy} onClick={onClose}>Cancel</Button><Button type="submit" icon={employeeEdit ? Save : undefined} disabled={busy}>{busy ? 'Saving...' : employeeEdit ? 'Save Changes' : 'Save'}</Button></div>
    </form>
  </Modal>
}
