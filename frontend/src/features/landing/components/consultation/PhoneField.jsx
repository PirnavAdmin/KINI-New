import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const countries = [
  { code: '+1', flag: '🇺🇸', label: 'US' },
  { code: '+44', flag: '🇬🇧', label: 'UK' },
  { code: '+91', flag: '🇮🇳', label: 'IN' },
  { code: '+61', flag: '🇦🇺', label: 'AU' },
  { code: '+81', flag: '🇯🇵', label: 'JP' },
  { code: '+86', flag: '🇨🇳', label: 'CN' },
  { code: '+49', flag: '🇩🇪', label: 'DE' },
  { code: '+33', flag: '🇫🇷', label: 'FR' },
  { code: '+55', flag: '🇧🇷', label: 'BR' },
  { code: '+971', flag: '🇦🇪', label: 'AE' },
  { code: '+65', flag: '🇸🇬', label: 'SG' },
  { code: '+82', flag: '🇰🇷', label: 'KR' },
]

/**
 * PhoneField — Phone input with integrated country code selector.
 *
 * Props:
 *   label       → Field label text
 *   name        → Input name
 *   placeholder → Placeholder text
 *   error       → Error message string
 *   register    → react-hook-form register function
 *   value       → Phone number value
 *   onChange    → Change handler for phone number
 *   required    → Whether field is required
 *   disabled    → Disabled state
 */
export default function PhoneField({
  label,
  name = 'phone',
  placeholder = '+1 (555) 000-0000',
  error,
  register,
  value: phoneValue,
  onChange: onPhoneChange,
  required = false,
  disabled = false,
}) {
  const [country, setCountry] = useState(countries[0])
  const [open, setOpen] = useState(false)

  const handleCountrySelect = (c) => {
    setCountry(c)
    setOpen(false)
  }

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      <div
        className={`
          flex h-14 rounded-xl overflow-hidden
          border ${error ? 'border-red-300' : 'border-slate-200'}
          focus-within:border-[#0F4FA8] focus-within:ring-4 focus-within:ring-[#0F4FA8]/10
          transition-all duration-300
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {/* Country Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => !disabled && setOpen(!open)}
            disabled={disabled}
            className="flex items-center gap-1.5 h-full px-3 bg-slate-50 border-r border-slate-200 text-sm text-slate-700 hover:bg-slate-100 transition-colors duration-200 min-w-[80px]"
            aria-label="Select country code"
            aria-expanded={open}
          >
            <span className="text-base leading-none">{country.flag}</span>
            <span className="text-slate-500 font-medium">{country.code}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                open ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown */}
          <AnimatePresence>
            {open && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute top-full left-0 mt-1 z-20 w-[180px] max-h-[240px] overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-lg"
                >
                  {countries.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleCountrySelect(c)}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors duration-150 ${
                        country.code === c.code
                          ? 'bg-[#0F4FA8]/5 text-[#0F4FA8] font-medium'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-base leading-none">{c.flag}</span>
                      <span className="font-medium">{c.code}</span>
                      <span className="text-slate-400">{c.label}</span>
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Phone Number Input */}
        <input
          id={name}
          type="tel"
          placeholder={placeholder}
          value={phoneValue}
          disabled={disabled}
          {...(register
            ? register(name)
            : { onChange: onPhoneChange, value: phoneValue })}
          className="flex-1 h-full px-4 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${name}-error` : undefined}
        />
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
