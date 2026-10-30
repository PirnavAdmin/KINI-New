import { useEffect, useId, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, AlertCircle, ChevronDown } from 'lucide-react'
import './employee-form.css'

export function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  icon: Icon,
  hint,
  disabled = false,
  required = false,
  className = '',
  ...inputProps
}) {
  const [focused, setFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {required && <span className="text-[#EF4444] ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Icon className={`w-4 h-4 transition-colors duration-200 ${focused ? 'text-[#0f55f7]' : 'text-slate-400'}`} />
          </div>
        )}
        <input
          data-form-control=""
          aria-invalid={Boolean(error)}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          {...inputProps}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`
            w-full px-4 py-2.5 ${Icon ? 'pl-10' : ''} ${isPassword ? 'pr-10' : ''}
            bg-white dark:bg-slate-800/50
            border ${error ? 'border-[#EF4444] ring-2 ring-[#EF4444]/20' : focused ? 'border-[#0f55f7] ring-2 ring-[#0f55f7]/30' : 'border-slate-200 dark:border-slate-700'}
            rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400
            focus:outline-none
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1 text-xs text-[#EF4444]"
        >
          <AlertCircle className="w-3 h-3" />
          {error}
        </motion.p>
      )}
      {hint && !error && (
        <p className="text-xs text-slate-400">{hint}</p>
      )}
    </div>
  )
}

export function Select({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select...',
  error,
  icon: Icon,
  disabled = false,
  required = false,
  className = '',
}) {
  const [focused, setFocused] = useState(false)
  const [open, setOpen] = useState(false)
  const [menuPlacement, setMenuPlacement] = useState('bottom')
  const containerRef = useRef(null)
  const listboxId = useId()
  const safeOptions = Array.isArray(options) ? options : []
  const selectedOption = safeOptions.find((option) => String(option.value) === String(value))

  useEffect(() => {
    if (!open) return undefined

    const closeOnOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false)
        setFocused(false)
      }
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick)
  }, [open])

  const chooseOption = (option) => {
    if (option.disabled) return
    onChange?.({ target: { value: option.value } })
    setOpen(false)
    setFocused(false)
  }

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {required && <span className="text-[#EF4444] ml-1">*</span>}
        </label>
      )}
      <div ref={containerRef} className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
            <Icon className={`w-4 h-4 transition-colors duration-200 ${focused ? 'text-[#0f55f7]' : 'text-slate-400'}`} />
          </div>
        )}
        <button
          type="button"
          data-form-control=""
          data-placeholder={!selectedOption ? '' : undefined}
          aria-invalid={Boolean(error)}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-required={required}
          onClick={() => {
            if (disabled) return
            setFocused(true)
            setOpen((current) => {
              if (!current && containerRef.current) {
                const controlRect = containerRef.current.getBoundingClientRect()
                const scrollParent = containerRef.current.closest('.overflow-y-auto')
                const boundaryRect = scrollParent?.getBoundingClientRect()
                const boundaryTop = boundaryRect?.top ?? 0
                const boundaryBottom = boundaryRect?.bottom ?? window.innerHeight
                const spaceAbove = controlRect.top - boundaryTop
                const spaceBelow = boundaryBottom - controlRect.bottom

                setMenuPlacement(spaceBelow < 230 && spaceAbove > spaceBelow ? 'top' : 'bottom')
              }
              return !current
            })
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setOpen(false)
              setFocused(false)
            }
          }}
          className={`
            w-full px-4 py-2.5 ${Icon ? 'pl-10' : ''} pr-10 text-left
            bg-white dark:bg-slate-800/50
            border ${error ? 'border-[#EF4444] ring-2 ring-[#EF4444]/20' : focused ? 'border-[#0f55f7] ring-2 ring-[#0f55f7]/30' : 'border-slate-200 dark:border-slate-700'}
            rounded-xl text-sm ${selectedOption ? 'text-slate-900 dark:text-white' : 'text-slate-400'}
            cursor-pointer
            focus:outline-none
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
        >
          <span className="block truncate">{selectedOption?.label || placeholder || 'Select...'}</span>
        </button>
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
        {open && (
          <div
            id={listboxId}
            role="listbox"
            className={`absolute left-0 right-0 z-[1200] max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-800 ${
              menuPlacement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
            }`}
          >
            {safeOptions.length ? safeOptions.map((option) => {
              const selected = String(option.value) === String(value)
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  disabled={option.disabled}
                  onClick={() => chooseOption(option)}
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                    selected
                      ? 'bg-[#0f55f7]/10 font-semibold text-[#0f55f7]'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {option.label}
                </button>
              )
            }) : (
              <p className="px-3 py-2 text-sm text-slate-400">No options available</p>
            )}
          </div>
        )}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1 text-xs text-[#EF4444]"
        >
          <AlertCircle className="w-3 h-3" />
          {error}
        </motion.p>
      )}
    </div>
  )
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  fullWidth = false,
  ...buttonProps
}) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30'

  const variants = {
    primary: 'text-white bg-[#0f55f7] hover:brightness-110 shadow-sm shadow-[#0f55f7]/20 disabled:opacity-60 disabled:cursor-not-allowed',
    secondary: 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50',
    outline: 'text-[#0f55f7] border border-[#0f55f7]/30 hover:bg-[#0f55f7]/5 disabled:opacity-50',
    ghost: 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50',
    danger: 'text-white bg-[#EF4444] hover:brightness-110 shadow-sm shadow-[#EF4444]/20 disabled:opacity-60',
    success: 'text-white bg-[#06b6a8] hover:brightness-110 shadow-sm shadow-[#06b6a8]/20 disabled:opacity-60',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'h-11 px-4 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      {...buttonProps}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <span>{children}</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
        </>
      )}
    </button>
  )
}

