import { forwardRef, useCallback } from 'react'
import { Check } from 'lucide-react'

/**
 * Checkbox — Standardized UI checkbox component
 *
 * Props:
 *   label      → Text label beside the checkbox
 *   checked    → Controlled checked state
 *   onChange   → Change handler (receives boolean)
 *   error      → Error state
 *   disabled   → Disabled state
 *   helperText → Small hint text below
 */
const Checkbox = forwardRef(({
  label,
  checked = false,
  onChange,
  error,
  disabled = false,
  helperText,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `checkbox-${label?.toLowerCase().replace(/\s+/g, '-') || Math.random().toString(36).slice(2)}`

  const handleToggle = useCallback(() => {
    if (!disabled && onChange) {
      onChange(!checked)
    }
  }, [checked, disabled, onChange])

  const handleKeyDown = useCallback((e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      handleToggle()
    }
  }, [handleToggle])

  return (
    <div className={className}>
      <div className="flex items-start gap-3">
        <div
          role="checkbox"
          aria-checked={checked}
          aria-labelledby={label ? `${inputId}-label` : undefined}
          tabIndex={disabled ? -1 : 0}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          className={`
            relative shrink-0 mt-0.5 w-4 h-4 rounded-md border-2 flex items-center justify-center
            transition-all duration-200 outline-none
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${checked
              ? 'bg-[#0f55f7] border-[#0f55f7]'
              : error
                ? 'border-danger/50 bg-danger/5'
                : 'border-border bg-white dark:bg-slate-800 hover:border-[#0f55f7]/50'
            }
            focus-visible:ring-2 focus-visible:ring-[#0f55f7]/30 focus-visible:ring-offset-1
          `}
        >
          {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
        </div>

        {label && (
          <label
            id={`${inputId}-label`}
            onClick={handleToggle}
            className={`text-sm cursor-pointer select-none transition-colors duration-200 ${
              disabled ? 'text-text-muted cursor-not-allowed' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {label}
          </label>
        )}
      </div>

      {helperText && (
        <p className="text-xs text-text-muted mt-1 pl-7">
          {helperText}
        </p>
      )}
    </div>
  )
})

Checkbox.displayName = 'Checkbox'

export default Checkbox
