import { useEffect, useId, useRef, useState } from 'react'
import { Dialog, Select } from 'radix-ui'
import { CalendarDays, Check, ChevronDown, Clock3, CloudUpload, FileText, LoaderCircle, Plus, UserRound, X } from 'lucide-react'
import usePermission from '@shared/hooks/usePermission'
import getApiErrorMessage from '@/utils/getApiErrorMessage'
import { optionsFor } from '../services/hrFormOptions'
import { hrModuleApi } from '../services/hrApi'
import { HR_API_CONTRACT } from '../services/hrApiContract'
import { loadDashboardList } from '../services/hrDashboardData'
import { initialLeaveDraft, leaveDayCount, leaveRequestPayload, leaveRequestSchema, validateLeaveDraft } from '../services/hrLeaveFormData'
import './portal/hr-add-leave.css'

function LeaveSelect({ id, label, Icon, placeholder, value, choices, disabled, error, onChange }) {
  return <div className="hal-field">
    <label className="hal-label" htmlFor={id}>{label} <span aria-hidden="true">*</span></label>
    <Select.Root value={value} onValueChange={onChange} disabled={disabled || !choices.length} required>
      <Select.Trigger id={id} className={`hal-control hal-select${error ? ' is-invalid' : ''}`} aria-required="true" aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined}>
        <span className="hal-icon"><Icon aria-hidden="true" /></span>
        <Select.Value placeholder={placeholder} />
        <Select.Icon className="hal-chevron"><ChevronDown aria-hidden="true" /></Select.Icon>
      </Select.Trigger>
      <Select.Portal><Select.Content className="hal-options" position="popper" sideOffset={3} collisionPadding={10}>
        <Select.Viewport>{choices.map(choice => <Select.Item key={choice.value} value={String(choice.value)} className="hal-option"><Select.ItemText>{choice.label ?? choice.value}</Select.ItemText><Select.ItemIndicator><Check aria-hidden="true" /></Select.ItemIndicator></Select.Item>)}</Select.Viewport>
      </Select.Content></Select.Portal>
    </Select.Root>
    {error && <p className="hal-field-error" id={`${id}-error`}>{error}</p>}
  </div>
}

export default function AddLeaveModal({ options = {}, initialValues, onSave, onClose }) {
  const prefix = useId()
  const permissions = usePermission()
  const canReadEmployees = permissions.hasPermission('employees') && permissions.can('employees', 'view')
  const suppliedEmployees = options.employees
  const [lookup, setLookup] = useState({ rows: [], loading: !suppliedEmployees, error: '' })
  const [retry, setRetry] = useState(0)
  const [draft, setDraft] = useState(() => initialLeaveDraft(initialValues))
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const lock = useRef(false)
  const form = useRef(null)
  const employees = optionsFor('employeeId', { employees: suppliedEmployees ?? lookup.rows })
  const types = optionsFor('leaveType', options)
  const limit = leaveRequestSchema.properties.reason.maxLength
  const totalDays = leaveDayCount(draft.fromDate, draft.toDate)

  useEffect(() => {
    if (suppliedEmployees != null || permissions.isLoading) return
    const controller = new AbortController()
    const load = async () => {
      if (!canReadEmployees) { setLookup({ rows: [], loading: false, error: 'Employee selection requires permission to view employees. Ask your administrator for access.' }); return }
      setLookup({ rows: [], loading: true, error: '' })
      try {
        const rows = await loadDashboardList(hrModuleApi('employees'), HR_API_CONTRACT['GET /api/hr/employees'], controller.signal)
        if (!controller.signal.aborted) setLookup({ rows, loading: false, error: '' })
      } catch (failure) {
        if (!controller.signal.aborted) setLookup({ rows: [], loading: false, error: getApiErrorMessage(failure, 'Unable to load employees. Please retry.') })
      }
    }
    load()
    return () => controller.abort()
  }, [suppliedEmployees, permissions.isLoading, canReadEmployees, retry])

  const close = () => { if (!lock.current) onClose() }
  const change = (key, value) => {
    setDraft(current => {
      const next = { ...current, [key]: value }
      if (key === 'fromDate' && current.duration === 'single' || key === 'duration' && value === 'single') next.toDate = next.fromDate
      return next
    })
    setErrors(current => { const next = { ...current }; delete next[key]; if (key === 'duration' || key === 'fromDate') delete next.toDate; return next })
    setError('')
  }
  const submit = async event => {
    event.preventDefault()
    if (lock.current) return
    const invalid = validateLeaveDraft(draft, employees, types)
    setErrors(invalid)
    setError('')
    if (Object.keys(invalid).length) {
      form.current?.querySelector(`[id="${prefix}-${Object.keys(invalid)[0]}"]`)?.focus()
      return
    }
    lock.current = true
    setBusy(true)
    try {
      await onSave(leaveRequestPayload(draft))
      setDraft(initialLeaveDraft())
      onClose()
    } catch (failure) {
      const body = failure?.response?.data
      const normalized = body?.error?.message ? { ...failure, response: { ...failure.response, data: { ...body, message: body.error.message } } } : failure
      setError(getApiErrorMessage(normalized, 'Unable to add the leave request. Please try again.'))
      const fieldErrors = {}
      for (const key of ['employeeId', 'leaveType', 'fromDate', 'toDate', 'reason']) {
        const actual = Object.keys(body?.errors ?? {}).find(name => name.split('.').at(-1).toLowerCase() === key.toLowerCase())
        const messages = body?.errors?.[actual]
        const message = (Array.isArray(messages) ? messages : [messages]).filter(item => typeof item === 'string').join(' ')
        if (message) fieldErrors[key] = message
      }
      setErrors(fieldErrors)
    } finally { lock.current = false; setBusy(false) }
  }

  const dateField = (key, label) => <div className="hal-field">
    <label className="hal-label" htmlFor={`${prefix}-${key}`}>{label} <span aria-hidden="true">*</span></label>
    <div className={`hal-control${errors[key] ? ' is-invalid' : ''}`}>
      <span className="hal-icon"><CalendarDays aria-hidden="true" /></span>
      <input id={`${prefix}-${key}`} name={key} type="date" value={draft[key]} min={key === 'toDate' ? draft.fromDate || undefined : undefined} required readOnly={key === 'toDate' && draft.duration === 'single'} disabled={busy} aria-invalid={Boolean(errors[key])} aria-describedby={errors[key] ? `${prefix}-${key}-error` : key === 'toDate' && draft.duration === 'single' ? `${prefix}-single-hint` : undefined} onChange={event => change(key, event.target.value)} />
    </div>
    {errors[key] && <p className="hal-field-error" id={`${prefix}-${key}-error`}>{errors[key]}</p>}
  </div>

  return <Dialog.Root open onOpenChange={open => { if (!open) close() }}><Dialog.Portal>
    <Dialog.Overlay className="hal-backdrop" />
    <Dialog.Content className="hal-dialog" onEscapeKeyDown={event => { if (lock.current) event.preventDefault() }} onPointerDownOutside={event => { if (lock.current) event.preventDefault() }}>
      <header className="hal-header">
        <span className="hal-header-icon"><CalendarDays aria-hidden="true" /></span>
        <div className="hal-header-copy"><Dialog.Title className="hal-title">Add <span>Leave</span></Dialog.Title><Dialog.Description className="hal-subtitle">Submit a new leave request for the selected employee.</Dialog.Description></div>
        <button type="button" className="hal-close" disabled={busy} aria-label="Close modal" onClick={close}><X aria-hidden="true" /></button>
      </header>
      <form className="hal-form" ref={form} onSubmit={submit} noValidate aria-busy={busy}>
        <div className="hal-body">
          <div className="hal-employee-panel">
            <LeaveSelect id={`${prefix}-employeeId`} label="Employee" Icon={UserRound} placeholder={lookup.loading && suppliedEmployees == null ? 'Loading employees...' : 'Select Employee'} value={draft.employeeId} choices={employees} disabled={busy || lookup.loading && suppliedEmployees == null} error={errors.employeeId} onChange={value => change('employeeId', value)} />
            {lookup.error && <p role="alert" className="hal-field-error">{lookup.error} {canReadEmployees && <button type="button" className="hal-retry" onClick={() => setRetry(value => value + 1)}>Retry</button>}</p>}
            {!lookup.loading && !lookup.error && !employees.length && <p role="status" className="hal-field-error">No employees are available to select.</p>}
          </div>
          <div className="hal-fields-panel">
            <div className="hal-grid">
              <LeaveSelect id={`${prefix}-leaveType`} label="Leave Type" Icon={CalendarDays} placeholder="Select Leave Type" value={draft.leaveType} choices={types} disabled={busy} error={errors.leaveType} onChange={value => change('leaveType', value)} />
              <fieldset className="hal-duration" aria-invalid={Boolean(errors.duration)} aria-describedby={errors.duration ? `${prefix}-duration-error` : undefined}>
                <legend className="hal-label">Leave Duration <span aria-hidden="true">*</span></legend>
                <div className="hal-duration-options">{[['single', 'Single Day'], ['multiple', 'Multiple Days']].map(([value, label]) => <label key={value} className={`hal-radio${draft.duration === value ? ' is-selected' : ''}`}><input id={value === 'single' ? `${prefix}-duration` : undefined} type="radio" name={`${prefix}-duration`} value={value} checked={draft.duration === value} disabled={busy} required onChange={() => change('duration', value)} />{label}</label>)}</div>
                {errors.duration && <p className="hal-field-error" id={`${prefix}-duration-error`}>{errors.duration}</p>}
              </fieldset>
              {dateField('fromDate', 'From Date')}
              {dateField('toDate', 'To Date')}
            </div>
            <span className="hal-sr-only" id={`${prefix}-single-hint`}>For Single Day, To Date matches From Date automatically.</span>
            {!types.length && <p role="status" className="hal-field-error">Leave types are unavailable. Close this form and refresh to retry.</p>}
            <div className="hal-details-grid">
              <div className="hal-field"><label className="hal-label" htmlFor={`${prefix}-days`}>Total Days</label><div className="hal-control hal-total"><span className="hal-icon"><Clock3 aria-hidden="true" /></span><input id={`${prefix}-days`} value={totalDays} readOnly aria-describedby={`${prefix}-days-hint`} /></div><span className="hal-sr-only" id={`${prefix}-days-hint`}>Calendar days including both dates. Policy adjustments are determined by the server.</span></div>
              <div className="hal-field"><label className="hal-label" htmlFor={`${prefix}-reason`}>Reason <span aria-hidden="true">*</span></label><div className={`hal-control hal-textarea${errors.reason ? ' is-invalid' : ''}`}><span className="hal-icon"><FileText aria-hidden="true" /></span><textarea id={`${prefix}-reason`} name="reason" rows={3} placeholder="Enter reason for leave request..." value={draft.reason} maxLength={limit} required disabled={busy} aria-invalid={Boolean(errors.reason)} aria-describedby={`${prefix}-reason-count${errors.reason ? ` ${prefix}-reason-error` : ''}`} onChange={event => change('reason', event.target.value)} /></div><p className="hal-counter" id={`${prefix}-reason-count`}>{limit == null ? `${draft.reason.length} characters` : `${draft.reason.length}/${limit}`}</p>{errors.reason && <p className="hal-field-error" id={`${prefix}-reason-error`}>{errors.reason}</p>}</div>
            </div>
            <section className="hal-upload" aria-labelledby={`${prefix}-upload-label`}>
              <h3 id={`${prefix}-upload-label`}>Supporting Document <span>(Optional)</span></h3>
              <button type="button" className="hal-upload-disabled" disabled aria-describedby={`${prefix}-upload-hint`}><CloudUpload aria-hidden="true" /><span>Document upload unavailable</span></button>
              <p id={`${prefix}-upload-hint`}>The current leave API does not support attachments.</p>
            </section>
          </div>
          {error && <p role="alert" className="hal-error">{error}</p>}
        </div>
        <footer className="hal-footer"><button type="button" className="hal-button hal-button--cancel" disabled={busy} onClick={close}>Cancel</button><button type="submit" className="hal-button hal-button--add" disabled={busy || !employees.length || !types.length || lookup.loading && suppliedEmployees == null}>{busy ? <LoaderCircle className="hal-spinner" aria-hidden="true" /> : <Plus aria-hidden="true" />}{busy ? 'Adding...' : 'Add Leave'}</button></footer>
      </form>
    </Dialog.Content>
  </Dialog.Portal></Dialog.Root>
}
