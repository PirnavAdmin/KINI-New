import { useState } from 'react'
import { AlertCircle, Calendar, FileText } from 'lucide-react'
import Modal from '@shared/components/Modal'
import Button from '@shared/components/Button'

const REPORT_TYPES = ['Summary', 'Growth', 'Financial', 'Annual']

const toDateInputValue = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatDate = (value) => {
  if (!value) return ''
  const [year, month, day] = String(value).split('-').map(Number)
  if (!year || !month || !day) return value
  return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

const buildReportingPeriod = (start, end) => {
  if (start && end) {
    const from = formatDate(start)
    const to = formatDate(end)
    return from === to ? from : `${from} – ${to}`
  }
  return ''
}

const inputClasses = (hasError = false) =>
  `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 dark:bg-slate-900 dark:text-white ${
    hasError
      ? 'border-red-400 focus:border-red-500 focus:ring-red-200 dark:border-red-500/50 dark:focus:ring-red-500/20'
      : 'border-slate-300 focus:border-[#0f55f7] focus:ring-[#0f55f7]/25 dark:border-slate-700'
  }`

const FieldError = ({ message }) =>
  message ? (
    <p id="report-generate-field-error" role="alert" className="mt-1.5 flex items-start gap-1.5 text-xs font-medium leading-5 text-red-600 dark:text-red-400">
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  ) : null

export default function ReportGenerateModal({ open, onClose, onSubmit }) {
  const now = new Date()
  const [form, setForm] = useState(() => ({
    name: '',
    type: '',
    startDate: toDateInputValue(new Date(now.getFullYear(), 0, 1)),
    endDate: toDateInputValue(now),
    description: '',
  }))
  const [errors, setErrors] = useState({})

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Report name is required.'
    if (!form.type) next.type = 'Report type is required.'
    if (!form.startDate) next.startDate = 'Start date is required.'
    if (!form.endDate) next.endDate = 'End date is required.'
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      next.endDate = 'End date must be on or after the start date.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onSubmit({
      name: form.name.trim(),
      type: form.type,
      startDate: form.startDate,
      endDate: form.endDate,
      description: form.description.trim(),
      reportingPeriod: buildReportingPeriod(form.startDate, form.endDate),
    })
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && event.target.tagName !== 'TEXTAREA') {
      event.preventDefault()
      handleSubmit()
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Generate Report"
      description="Create a new platform report from the selected data"
      size="md"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" icon={FileText} onClick={handleSubmit}>Generate Report</Button>
        </div>
      }
    >
      <form onSubmit={(event) => { event.preventDefault(); handleSubmit(); }} noValidate className="space-y-4" onKeyDown={handleKeyDown}>
        <div>
          <label htmlFor="report-name" className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-200">
            Report Name <span className="text-red-500">*</span>
          </label>
          <input
            id="report-name"
            name="name"
            type="text"
            autoComplete="off"
            autoFocus
            value={form.name}
            onChange={(event) => update('name', event.target.value)}
            placeholder="e.g. Q1 2025 Platform Summary"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'report-generate-field-error' : undefined}
            className={inputClasses(Boolean(errors.name))}
          />
          <FieldError message={errors.name} />
        </div>

        <div>
          <label htmlFor="report-type" className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-200">
            Report Type <span className="text-red-500">*</span>
          </label>
          <select
            id="report-type"
            name="type"
            value={form.type}
            onChange={(event) => update('type', event.target.value)}
            aria-invalid={Boolean(errors.type)}
            className={`${inputClasses(Boolean(errors.type))} cursor-pointer ${form.type ? '' : 'text-slate-400 dark:text-slate-500'}`}
          >
            <option value="" disabled>Select a report type</option>
            {REPORT_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <FieldError message={errors.type} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="report-start-date" className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-200">
              From <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="report-start-date"
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={(event) => update('startDate', event.target.value)}
                aria-invalid={Boolean(errors.startDate)}
                className={`${inputClasses(Boolean(errors.startDate))} pl-9`}
              />
            </div>
            <FieldError message={errors.startDate} />
          </div>
          <div>
            <label htmlFor="report-end-date" className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-200">
              To <span className="text-red-500">*</span>
            </label>
            <input
              id="report-end-date"
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={(event) => update('endDate', event.target.value)}
              aria-invalid={Boolean(errors.endDate)}
              className={inputClasses(Boolean(errors.endDate))}
            />
            <FieldError message={errors.endDate} />
          </div>
        </div>

        <div>
          <label htmlFor="report-description" className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-200">
            Description <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <textarea
            id="report-description"
            name="description"
            rows={3}
            value={form.description}
            onChange={(event) => update('description', event.target.value)}
            placeholder="What does this report cover?"
            className={`${inputClasses()} resize-none`}
          />
        </div>
      </form>
    </Modal>
  )
}
