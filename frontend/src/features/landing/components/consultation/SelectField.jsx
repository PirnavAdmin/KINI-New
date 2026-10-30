import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

/**
 * SelectField — Premium select dropdown with label, error state, and chevron.
 *
 * Props:
 *   label       → Field label text
 *   name        → Select name
 *   placeholder → Default placeholder option
 *   options     → Array of { value, label } objects
 *   error       → Error message string
 *   register    → react-hook-form register function
 *   required    → Whether field is required
 *   disabled    → Disabled state
 *   className   → Additional wrapper classes
 */
export default function SelectField({
  label,
  name,
  placeholder = 'Select...',
  options = [],
  error,
  register,
  required = false,
  disabled = false,
  className = '',
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-slate-700"
        >
          {label}
          {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={name}
          disabled={disabled}
          {...(register ? register(name) : {})}
          className={`
            w-full h-14 pl-5 pr-12
            bg-white
            border ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-[#0F4FA8] focus:ring-[#0F4FA8]/10'}
            rounded-xl
            text-sm text-slate-900
            appearance-none cursor-pointer
            focus:outline-none focus:ring-4
            transition-all duration-300
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${name}-error` : undefined}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none">
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          id={`${name}-error`}
          className="flex items-center gap-1 text-xs text-red-500"
          role="alert"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}
