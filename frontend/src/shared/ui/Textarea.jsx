import { forwardRef, useState } from 'react'
import { AlertCircle } from 'lucide-react'

/**
 * Textarea — Standardized UI textarea component
 *
 * Props:
 *   label       → Floating label text
 *   error       → Error message
 *   helperText  → Small hint text below
 *   rows        → Number of rows (default: 3)
 *   fullWidth   → w-full (default: true)
 */
const Textarea = forwardRef(({
  label,
  error,
  helperText,
  rows = 3,
  fullWidth = true,
  className = '',
  id,
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false)
  const hasValue = props.value?.length > 0
  const inputId = id || `textarea-${label?.toLowerCase().replace(/\s+/g, '-') || Math.random().toString(36).slice(2)}`
  const active = focused || hasValue

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      <div className="relative group">
        <div
          className={`relative rounded-xl border transition-all duration-200 ${
            error
              ? 'border-danger/50 bg-danger/5'
              : focused
                ? 'border-primary/50 bg-primary/5'
                : 'border-border bg-white dark:bg-slate-800/50 hover:border-border-hover'
          }`}
        >
          <textarea
            ref={ref}
            id={inputId}
            rows={rows}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`
              w-full bg-transparent rounded-xl text-sm outline-none resize-none
              px-4 pt-6 pb-2.5
              text-text-primary
              placeholder:text-text-muted
              transition-colors duration-200
            `}
            aria-invalid={!!error}
            {...props}
          />

          <label
            htmlFor={inputId}
            className={`
              left-4 pointer-events-none transition-all duration-200 select-none absolute
              ${active
                ? 'top-2 text-[10px] font-semibold tracking-wider'
                : 'top-4 text-sm'
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

      {helperText && !error && (
        <p className="text-xs text-text-muted mt-1.5 pl-1">
          {helperText}
        </p>
      )}
    </div>
  )
})

Textarea.displayName = 'Textarea'

export default Textarea
