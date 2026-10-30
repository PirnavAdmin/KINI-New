import { forwardRef, useState } from 'react'
import { AlertCircle } from 'lucide-react'

/**
 * Input — Standardized UI input component
 *
 * Variants:
 *   default → Normal input
 *   error   → Red border + error message
 *
 * Props:
 *   label       → Floating label text
 *   error       → Error message string (shows if present)
 *   icon: Icon  → Lucide icon to show on the left
 *   helperText  → Small hint text below input
 *   fullWidth   → w-full (default: true)
 */
const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  helperText,
  fullWidth = true,
  className = '',
  id,
  type = 'text',
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false)
  const hasValue = props.value?.length > 0
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-') || Math.random().toString(36).slice(2)}`
  const active = focused || hasValue

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      <div className="relative group">
        {/* Glow effect on focus */}
        <div
          className={`absolute -inset-0.5 rounded-xl transition-all duration-300 pointer-events-none ${
            focused && !error ? 'opacity-100' : 'opacity-0'
          }`}
          style={{              background: error
              ? 'linear-gradient(135deg, rgba(239,68,68,0.5), rgba(239,68,68,0.3))'
              : 'linear-gradient(135deg, rgba(37,99,235,0.5), rgba(124,58,237,0.5))',
            filter: 'blur(4px)',
          }}
        />

        {/* Input wrapper */}
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
                  ? 'text-red-400'
                  : focused
                    ? 'text-blue-400'
                    : 'text-slate-400 group-hover:text-slate-500'
              }`}
            >
              <Icon size={16} />
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`
              w-full bg-transparent rounded-xl text-sm outline-none
              ${Icon ? 'pl-11' : 'pl-4'}
              pr-4 pt-6 pb-2.5
              text-slate-900 dark:text-white
              placeholder:text-slate-400
              transition-colors duration-200
            `}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />

          <label
            htmlFor={inputId}
            className={`
              ${Icon ? 'left-11' : 'left-4'} pointer-events-none transition-all duration-200 select-none
              ${active
                ? 'top-2 text-caption font-semibold tracking-wider'
                : 'top-1/2 -translate-y-1/2 text-sm'
              }
              ${error
                ? 'text-red-400'
                : focused
                  ? 'text-blue-400'
                  : 'text-slate-400'
              }
            `}
          >
            {label}
          </label>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p
          id={`${inputId}-error`}
          aria-live="polite"
          className="flex items-center gap-1 text-xs text-red-400 mt-1.5 pl-1"
        >
          <AlertCircle className="w-3 h-3 shrink-0" />
          {error}
        </p>
      )}

      {/* Helper text */}
      {helperText && !error && (
        <p
          id={`${inputId}-helper`}
          className="text-xs text-slate-400 mt-1.5 pl-1"
        >
          {helperText}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
