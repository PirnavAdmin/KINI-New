import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import HRDrawer from '@features/hr/components/HRDrawer'
import Button from '@shared/components/Button'

/**
 * HREntityForm — shared right-side form drawer used by every HR module's
 * Add / Edit actions. Configure it with a `fields` array:
 *
 *   { key, label, type: 'text'|'select'|'textarea'|'number'|'date'|'email',
 *     options?: [{value,label}], required?, placeholder?, hint?, defaultValue? }
 *
 * On submit it validates required fields, calls `onSave(values)` (which the
 * page wires to useHrCrud's addRow/updateRow) and closes. A success toast is
 * fired by the page so messages stay contextual.
 */
export default function HREntityForm({
  open,
  onClose,
  title,
  subtitle,
  icon,
  accent = '#0f55f7',
  fields = [],
  values = {},
  onSave,
  saveLabel = 'Save',
  width = 'max-w-[520px]',
}) {
  const [draft, setDraft] = useState({})

  // Re-seed the draft every time the drawer opens (fresh for Add, prefilled
  // for Edit). Not on every keystroke — that would clobber user input.
  useEffect(() => {
    if (!open) return undefined
    const seed = {}
    fields.forEach((field) => {
      seed[field.key] = values[field.key] ?? field.defaultValue ?? ''
    })
    // Re-seeding on open is intentional (fresh form for Add, prefilled for Edit)
    // and only runs when the drawer transitions closed → open.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(seed)
    return undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }))

  const handleSubmit = (event) => {
    event?.preventDefault?.()
    const missing = fields.filter((f) => f.required && !String(draft[f.key] ?? '').trim())
    if (missing.length) {
      toast.error(`Please complete: ${missing.map((f) => f.label).join(', ')}`)
      return
    }
    onSave({ ...draft })
    onClose()
  }

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-all ' +
    'focus:border-[#0f55f7] focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30 ' +
    'dark:border-slate-700 dark:bg-slate-800/60 dark:text-white'

  return (
    <HRDrawer
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      icon={icon}
      accent={accent}
      width={width}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>{saveLabel}</Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
              {field.label}
              {field.required && <span className="ml-0.5 text-red-500">*</span>}
            </label>

            {field.type === 'select' ? (
              <select
                value={draft[field.key] ?? ''}
                onChange={(e) => set(field.key, e.target.value)}
                className={inputClass}
              >
                <option value="">{field.placeholder || `Select ${field.label.toLowerCase()}…`}</option>
                {(field.options || []).map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea
                rows="3"
                value={draft[field.key] ?? ''}
                onChange={(e) => set(field.key, e.target.value)}
                placeholder={field.placeholder}
                className={`${inputClass} resize-none`}
              />
            ) : (
              <input
                type={field.type || 'text'}
                value={draft[field.key] ?? ''}
                onChange={(e) => set(field.key, e.target.value)}
                placeholder={field.placeholder}
                className={inputClass}
              />
            )}

            {field.hint && <p className="mt-1 text-[11px] text-slate-400">{field.hint}</p>}
          </div>
        ))}
      </form>
    </HRDrawer>
  )
}
