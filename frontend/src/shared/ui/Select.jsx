import { forwardRef, useState } from 'react'
import { ChevronDown, AlertCircle } from 'lucide-react'

/**
 * Select — Standardized UI select component
 *
 * Props:
 *   label       → Floating label text
 *   options     → Array of { value, label } or string[]
 *   placeholder → Default placeholder text
 *   error       → Error message
 *   icon: Icon  → Lucide icon on the left
 *   fullWidth   → w-full (default: true)
 */
const Select = forwardRef(({
  label,
  options = [],
  placeholder = 'Select...',
  error,
  icon: Icon,
  fullWidth = true,
  className = '',
  id,
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false)
  const hasValue = props.value?.length > 0
  const inputId = id || `select-${label?.toLowerCase().replace(/\s+/g, '-') || Math.random().toString(36).slice(2)}`
  const active = focused || hasValue

  const normalizedOptions = options.map(opt =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  )

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      <div className="relative group">
        <div
          className={`relative flex items-center rounded-xl border transition-all duration-200 ${
            error
              ? 'border-danger/50 bg-danger/5'
              : focused
                ? 'border-primary/50 bg-primary/5'
                : 'border-border bg-white dark:bg-slate-800/50 hover:border-border-hover'
          }`}
        >
          {Icon && (
            <div
              className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                error
                  ? 'text-danger'
                  : focused
                    ? 'text-primary'
                    : 'text-text-muted group-hover:text-text-secondary'
              }`}
            >
              <Icon size={16} />
            </div>
          )}

          <select
            ref={ref}
            id={inputId}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`
              w-full bg-transparent rounded-xl text-sm outline-none appearance-none cursor-pointer
              ${Icon ? 'pl-11' : 'pl-4'}
              pr-10 pt-6 pb-2.5
              text-text-primary
              transition-colors duration-200
            `}
            aria-invalid={!!error}
            {...props}
          >
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {normalizedOptions.map(opt => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
            <ChevronDown className="w-4 h-4 text-text-muted" />
          </div>

          <label
            htmlFor={inputId}
            className={`
              ${Icon ? 'left-11' : 'left-4'} pointer-events-none transition-all duration-200 select-none absolute
              ${active
                ? 'top-2 text-[10px] font-semibold tracking-wider'
                : 'top-1/2 -translate-y-1/2 text-sm'
              }
              ${error
                ? 'text-danger'
                : focused
                  ? 'text-primary'
                  : 'text-text-muted'
              }
            `}
          >
            {label}
          </label>
        </div>
      </div>

      {error && (
        <p className="flex items-center gap-1 text-xs text-danger mt-1.5 pl-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
})

Select.displayName = 'Select'

export default Select
