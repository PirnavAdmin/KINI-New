import { motion } from 'framer-motion'

/**
 * InputField — Premium text input with label, error state, and animation.
 *
 * Props:
 *   label       → Field label text
 *   name        → Input name (used for react-hook-form register)
 *   type        → Input type (text, email, tel, etc.)
 *   placeholder → Placeholder text
 *   error       → Error message string
 *   register    → react-hook-form register function
 *   required    → Whether field is required
 *   disabled    → Disabled state
 *   className   → Additional wrapper classes
 */
export default function InputField({
  label,
  name,
  type = 'text',
  placeholder,
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
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        {...(register ? register(name) : {})}
        className={`
          w-full h-14 px-5
          bg-white
          border ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-[#0F4FA8] focus:ring-[#0F4FA8]/10'}
          rounded-xl
          text-sm text-slate-900 placeholder:text-slate-400
          focus:outline-none focus:ring-4
          transition-all duration-300
          disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50
        `}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${name}-error` : undefined}
      />
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
