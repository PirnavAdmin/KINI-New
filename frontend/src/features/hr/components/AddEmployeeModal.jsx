import { useId, useRef, useState } from 'react'
import { Dialog, Select } from 'radix-ui'
import { BriefcaseBusiness, Check, ChevronDown, ChevronUp, LoaderCircle, Mail, Phone, Save, UserRound, UsersRound, X } from 'lucide-react'
import { employeeRoleOptions, optionsFor } from '../services/hrFormOptions'
import { HR_API_CONTRACT } from '../services/hrApiContract'
import getApiErrorMessage from '@/utils/getApiErrorMessage'
import './portal/hr-add-employee.css'
import '@/shared/components/employee-form.css'

const FIELDS = [
  ['firstName', 'First Name', UserRound, 'Enter first name', 'text', 'given-name'],
  ['lastName', 'Last Name', UserRound, 'Enter last name', 'text', 'family-name'],
  ['email', 'Email', Mail, 'Enter email address', 'email', 'email'],
  ['phone', 'Phone', Phone, 'Enter phone number', 'tel', 'tel'],
  ['role', 'Role', UsersRound, 'Select Role'],
  ['employmentType', 'Employment Type', BriefcaseBusiness, 'Select Employment Type'],
]
// Values already used by the HR employee forms; API-provided options take priority.
const EMPLOYMENT_TYPES = [{ value: 'Full-Time', label: 'Full Time' }, { value: 'Part-Time', label: 'Part Time' }]
const emptyDraft = () => Object.fromEntries(FIELDS.map(([key]) => [key, '']))

function limitIndianMobileInput(value) {
  const hasCountryPrefix = /^\s*\+\s*9\s*1/.test(value)
  const digits = value.replace(/\D/g, '')
  const nationalDigits = hasCountryPrefix && digits.startsWith('91') ? digits.slice(2, 12) : digits.slice(0, 10)
  return `${hasCountryPrefix ? '+91 ' : ''}${nationalDigits}`
}

const validName = value => /^\p{L}\p{M}*[\p{L}\p{M} '\u2019-]*$/u.test(value)

function validate(draft, choices) {
  const errors = {}
  for (const [key, label] of FIELDS) if (!draft[key]) errors[key] = `Enter ${label.toLowerCase()}.`
  if (draft.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) errors.email = 'Enter a valid email address.'
  for (const key of ['firstName', 'lastName']) {
    if (draft[key] && !validName(draft[key])) errors[key] = `Enter a valid ${key === 'firstName' ? 'first' : 'last'} name using letters, spaces, hyphens, or apostrophes.`
  }
  // Accept Indian mobile numbers, with an optional +91 country code.
  if (draft.phone && !/^(?:\+91\s?)?[6-9]\d{9}$/.test(draft.phone)) errors.phone = 'Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.'
  for (const key of ['role', 'employmentType']) {
    if (!choices[key].some(choice => String(choice.value) === draft[key])) errors[key] = `Select ${key === 'role' ? 'a role' : 'an employment type'}.`
  }
  return errors
}

export default function AddEmployeeModal({ options = {}, onSave, onClose }) {
  const prefix = useId()
  const [draft, setDraft] = useState(emptyDraft)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const submitLock = useRef(false)
  const formRef = useRef(null)
  const apiTypes = optionsFor('employmentType', options)
  const choices = { role: employeeRoleOptions(options), employmentType: apiTypes.length ? apiTypes : EMPLOYMENT_TYPES }
  const close = () => { if (!submitLock.current) onClose() }
  const change = (key, value) => {
    setDraft(current => ({ ...current, [key]: value }))
    setErrors(current => { const next = { ...current }; delete next[key]; return next })
    setError('')
  }
  const submit = async event => {
    event.preventDefault()
    if (submitLock.current) return
    const values = Object.fromEntries(FIELDS.map(([key]) => [key, draft[key].trim()]))
    // Store the mobile number in a consistent Indian format without a country prefix.
    values.phone = values.phone.replace(/^\+91\s?/, '')
    const invalid = validate(values, choices)
    setErrors(invalid)
    setError('')
    if (Object.keys(invalid).length) {
      formRef.current?.querySelector(`[id="${prefix}-${Object.keys(invalid)[0]}"]`)?.focus()
      return
    }
    // Whitelist the existing DTO properties; no view-only fields reach the API.
    const schema = HR_API_CONTRACT['POST /api/hr/employees'].schema
    const payload = Object.fromEntries(Object.entries(values).filter(([key]) => Object.hasOwn(schema.properties, key)))
    submitLock.current = true
    setBusy(true)
    try {
      await onSave(payload)
      setDraft(emptyDraft())
      onClose()
    } catch (failure) {
      const body = failure?.response?.data
      setError(getApiErrorMessage(failure, 'Unable to add the employee. Please try again.'))
      const fieldErrors = {}
      for (const [key] of FIELDS) {
        const actual = Object.keys(body?.errors ?? {}).find(name => name.split('.').at(-1).toLowerCase() === key.toLowerCase())
        const messages = body?.errors?.[actual]
        const message = (Array.isArray(messages) ? messages : [messages]).filter(value => typeof value === 'string').join(' ')
        if (message) fieldErrors[key] = message
      }
      setErrors(fieldErrors)
    } finally {
      submitLock.current = false
      setBusy(false)
    }
  }

  return <Dialog.Root open onOpenChange={open => { if (!open) close() }}>
    <Dialog.Portal>
      <Dialog.Overlay className="hae-backdrop" />
      <Dialog.Content className="hae-dialog employee-form" onEscapeKeyDown={event => { if (submitLock.current) event.preventDefault() }} onPointerDownOutside={event => { if (submitLock.current) event.preventDefault() }}>
        <header className="hae-header">
          <span className="hae-header__icon"><UsersRound aria-hidden="true" /></span>
          <div className="hae-header__copy">
            <Dialog.Title className="hae-title">Add <span>Employee</span></Dialog.Title>
            <Dialog.Description className="hae-subtitle">Fill in the details below to add a new employee to the organization.</Dialog.Description>
          </div>
          <button type="button" className="hae-close" aria-label="Close modal" disabled={busy} onClick={close}><X aria-hidden="true" /></button>
        </header>
        <form ref={formRef} className="hae-form" onSubmit={submit} noValidate aria-busy={busy}>
          <div className="hae-body">
            <div className="hae-grid">
              {FIELDS.map(([key, label, Icon, placeholder, type, autoComplete]) => {
                const id = `${prefix}-${key}`
                const message = errors[key]
                return <div className="hae-field" key={key}>
                  <label className="hae-label" htmlFor={id}>{label} <span aria-hidden="true">*</span></label>
                  {type ? <div data-form-control="" className={`hae-input${message ? ' is-invalid' : ''}`}>
                    <span className="hae-field-icon"><Icon aria-hidden="true" /></span>
                    <input id={id} name={key} type={type} autoComplete={autoComplete} placeholder={key === 'phone' ? '9876543210' : placeholder} inputMode={key === 'phone' ? 'tel' : undefined} maxLength={key === 'phone' ? 13 : key === 'firstName' || key === 'lastName' ? 80 : undefined} value={draft[key]} disabled={busy} required aria-invalid={Boolean(message)} aria-describedby={message ? `${id}-error` : undefined} onChange={event => change(key, key === 'phone' ? limitIndianMobileInput(event.target.value) : key === 'firstName' || key === 'lastName' ? event.target.value.replace(/[^\p{L}\p{M} '\u2019-]/gu, '') : event.target.value)} />
                  </div> : <Select.Root value={draft[key]} onValueChange={value => change(key, value)} disabled={busy || !choices[key].length} required>
                    <Select.Trigger data-form-control="" id={id} className={`hae-select${message ? ' is-invalid' : ''}`} aria-invalid={Boolean(message)} aria-describedby={message ? `${id}-error` : undefined} aria-required="true">
                      <span className="hae-field-icon"><Icon aria-hidden="true" /></span>
                      <Select.Value placeholder={placeholder} />
                      <Select.Icon className="hae-select-chevron"><ChevronDown aria-hidden="true" /></Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content className="hae-options" position="popper" sideOffset={2} collisionPadding={12}>
                        <Select.ScrollUpButton className="hae-select-scroll"><ChevronUp aria-hidden="true" /></Select.ScrollUpButton>
                        <Select.Viewport className="hae-options__list">
                          {choices[key].map(choice => <Select.Item className="hae-option" key={choice.value} value={String(choice.value)}>
                            <Select.ItemText>{choice.label ?? choice.value}</Select.ItemText>
                            <Select.ItemIndicator><Check aria-hidden="true" /></Select.ItemIndicator>
                          </Select.Item>)}
                        </Select.Viewport>
                        <Select.ScrollDownButton className="hae-select-scroll"><ChevronDown aria-hidden="true" /></Select.ScrollDownButton>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>}
                  {message && <p id={`${id}-error`} className="hae-field-error">{message}</p>}
                  {key === 'role' && !choices.role.length && <p className="hae-field-error" role="status">Role options are unavailable. Close this form and refresh to retry.</p>}
                </div>
              })}
            </div>
            {error && <p className="hae-error" role="alert">{error}</p>}
          </div>
          <footer className="hae-footer">
            <button type="button" className="hae-button hae-button--cancel" disabled={busy} onClick={close}>Cancel</button>
            <button type="submit" className="hae-button hae-button--save" disabled={busy || !choices.role.length}>{busy ? <LoaderCircle className="hae-spinner" aria-hidden="true" /> : <Save aria-hidden="true" />}{busy ? 'Saving...' : 'Save'}</button>
          </footer>
        </form>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
}
