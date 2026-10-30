import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle, CheckCircle, ChevronDown, Loader2, Save, Search, X,
} from 'lucide-react'
import { COUNTRIES } from '@features/organization/data/settingsConstants'

/* ═══════════════════════════════════════════
   Section header
   ═══════════════════════════════════════════ */
export const SectionHeader = ({ title, description, action }) => (
  <div className="mb-4 flex items-start justify-between gap-4">
    <div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
      {description && <p className="mt-0.5 text-sm text-slate-400">{description}</p>}
    </div>
    {action}
  </div>
)

/* ═══════════════════════════════════════════
   Form fields
   ═══════════════════════════════════════════ */
export const InputField = ({ label, type = 'text', value, onChange, icon: Icon, error, hint, placeholder, ...inputProps }) => {
  const messageId = `${String(label).toLowerCase().replace(/\s+/g, '-')}-message`
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <div className="relative">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Icon className="w-4 h-4 text-slate-400" />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={(error || hint) ? messageId : undefined}
          {...inputProps}
          className={`w-full px-4 py-2.5 ${Icon ? 'pl-10' : ''} bg-white dark:bg-slate-800/50
            border ${error ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-200 dark:border-slate-700'}
            rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400
            focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30 focus:border-[#0f55f7] transition-all`}
        />
      </div>
      {(error || hint) && (
        <p id={messageId} className={`text-xs ${error ? 'font-medium text-red-600' : 'text-slate-500'}`}>
          {error || hint}
        </p>
      )}
    </div>
  )
}

export const SelectField = ({ label, value, onChange, options, icon: Icon, placeholder }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
    <div className="relative">
      {Icon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3.5">
          <Icon className="w-4 h-4 text-slate-400" />
        </div>
      )}
      <select
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2.5 ${Icon ? 'pl-10' : ''} bg-white dark:bg-slate-800/50
          border border-slate-200 dark:border-slate-700 rounded-xl text-sm appearance-none cursor-pointer
          text-slate-900 dark:text-white
          focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30 focus:border-[#0f55f7] transition-all`}
      >
        <option value="" disabled>{placeholder || 'Select...'}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5">
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </div>
    </div>
  </div>
)

export const TextareaField = ({ label, value, onChange, icon: Icon, error, hint, rows = 4, placeholder }) => {
  const messageId = `${String(label).toLowerCase().replace(/\s+/g, '-')}-message`
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <div className="relative">
        {Icon && (
          <div className="pointer-events-none absolute top-3 left-0 flex items-start pl-3.5">
            <Icon className="w-4 h-4 text-slate-400" />
          </div>
        )}
        <textarea
          value={value}
          onChange={onChange}
          rows={rows}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={(error || hint) ? messageId : undefined}
          className={`w-full px-4 py-2.5 ${Icon ? 'pl-10' : ''} bg-white dark:bg-slate-800/50
            border ${error ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-200 dark:border-slate-700'}
            rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 resize-y
            focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30 focus:border-[#0f55f7] transition-all`}
        />
      </div>
      {(error || hint) && (
        <p id={messageId} className={`text-xs ${error ? 'font-medium text-red-600' : 'text-slate-500'}`}>
          {error || hint}
        </p>
      )}
    </div>
  )
}

export const Toggle = ({ label, description, checked, onChange, disabled }) => (
  <div className="flex items-center justify-between py-3">
    <div className="pr-4">
      <p className="text-sm font-medium text-slate-900 dark:text-white">{label}</p>
      {description && <p className="mt-0.5 text-xs text-slate-400">{description}</p>}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0
        ${checked ? 'bg-[#0f55f7]' : 'bg-slate-300 dark:bg-slate-600'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm
        transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  </div>
)

/* ═══════════════════════════════════════════
   Save bar
   ═══════════════════════════════════════════ */
export const SaveButton = ({ onSave, saving, disabled, label = 'Save Changes', savingLabel = 'Saving...' }) => (
  <div className="mt-6 flex justify-end">
    <button
      onClick={onSave}
      disabled={saving || disabled}
      className="inline-flex items-center gap-2 rounded-xl bg-[#0f55f7] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110 disabled:opacity-60"
    >
      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      {saving ? savingLabel : label}
    </button>
  </div>
)

/* ═══════════════════════════════════════════
   Toast
   ═══════════════════════════════════════════ */
export const Toast = ({ message, type = 'success', show, onClose }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-3 shadow-lg
          ${type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-slate-800'}`}
        role="status"
        aria-live="polite"
      >
        {type === 'success' ? <CheckCircle className="w-5 h-5 text-white" /> : <AlertTriangle className="w-5 h-5 text-white" />}
        <span className="text-sm font-medium text-white">{message}</span>
        <button onClick={onClose} className="ml-2 text-white/70 hover:text-white" aria-label="Dismiss">
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    )}
  </AnimatePresence>
)

/* ═══════════════════════════════════════════
   Searchable country select
   ═══════════════════════════════════════════ */
export const SearchableCountrySelect = ({ label, value, onChange, icon: Icon, placeholder = 'Select Country' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  const selectedCountry = COUNTRIES.find((country) => country.value === value)

  const filteredCountries = useMemo(() => {
    if (!search.trim()) return COUNTRIES
    const query = search.toLowerCase()
    return COUNTRIES.filter((country) => country.label.toLowerCase().includes(query))
  }, [search])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus()
  }, [isOpen])

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <div className="relative">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3.5">
            <Icon className="w-4 h-4 text-slate-400" />
          </div>
        )}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center gap-2 px-4 py-2.5 ${Icon ? 'pl-10' : ''} bg-white dark:bg-slate-800/50
            border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-left
            text-slate-900 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30 focus:border-[#0f55f7] transition-all`}
        >
          <span className={`flex-1 ${!selectedCountry ? 'text-slate-400' : ''}`}>
            {selectedCountry ? selectedCountry.label : placeholder}
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="border-b border-slate-100 p-2 dark:border-slate-700/50">
                <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-700/50">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search countries..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
                  />
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto p-1">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country) => (
                    <button
                      key={country.value}
                      type="button"
                      onClick={() => {
                        onChange(country.value)
                        setIsOpen(false)
                        setSearch('')
                      }}
                      className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors
                        ${country.value === value
                          ? 'bg-[#0f55f7]/10 font-semibold text-[#0f55f7]'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/50'}`}
                    >
                      <span className="flex-1">{country.label}</span>
                      {country.value === value && <CheckCircle className="w-4 h-4 text-[#0f55f7]" />}
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-8 text-center text-xs text-slate-400">No countries found</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   Loading / error / empty states
   ═══════════════════════════════════════════ */
const skeletonBase = 'animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700/60'

export const SettingsSkeleton = () => (
  <div className="space-y-5" role="status" aria-label="Loading settings">
    <div className="flex items-center gap-3">
      <div className={`${skeletonBase} h-16 w-16 rounded-2xl`} />
      <div className="flex-1 space-y-2">
        <div className={`${skeletonBase} h-5 w-1/3`} />
        <div className={`${skeletonBase} h-4 w-2/3`} />
      </div>
    </div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="space-y-2">
          <div className={`${skeletonBase} h-3 w-24`} />
          <div className={`${skeletonBase} h-10 w-full`} />
        </div>
      ))}
    </div>
    <div className="flex justify-end">
      <div className={`${skeletonBase} h-10 w-40`} />
    </div>
  </div>
)

export const RoleListSkeleton = () => (
  <div className="space-y-3" role="status" aria-label="Loading roles">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="flex items-center gap-4 rounded-xl border border-slate-100 p-4 dark:border-slate-700/50">
        <div className={`${skeletonBase} h-10 w-10 rounded-xl`} />
        <div className="flex-1 space-y-2">
          <div className={`${skeletonBase} h-4 w-1/3`} />
          <div className={`${skeletonBase} h-3 w-1/2`} />
        </div>
        <div className={`${skeletonBase} h-6 w-20`} />
      </div>
    ))}
  </div>
)

export const PermissionMatrixSkeleton = () => (
  <div className="space-y-3" role="status" aria-label="Loading permissions">
    <div className={`${skeletonBase} h-8 w-2/3`} />
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="flex items-center gap-4 rounded-xl border border-slate-100 p-4 dark:border-slate-700/50">
        <div className={`${skeletonBase} h-4 w-32`} />
        {Array.from({ length: 6 }).map((__, cell) => (
          <div key={cell} className={`${skeletonBase} h-5 w-5 rounded`} />
        ))}
      </div>
    ))}
  </div>
)

export const EmailTemplateSkeleton = () => (
  <div className="space-y-3" role="status" aria-label="Loading email templates">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="flex items-center gap-4 rounded-xl border border-slate-100 p-4 dark:border-slate-700/50">
        <div className={`${skeletonBase} h-10 w-10 rounded-xl`} />
        <div className="flex-1 space-y-2">
          <div className={`${skeletonBase} h-4 w-1/3`} />
          <div className={`${skeletonBase} h-3 w-2/3`} />
        </div>
        <div className={`${skeletonBase} h-6 w-16`} />
      </div>
    ))}
  </div>
)

export const SettingsErrorState = ({ message = 'Unable to load settings.', onRetry }) => (
  <div className="flex flex-col items-center justify-center py-14 text-center">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-500/10">
      <AlertTriangle className="h-8 w-8 text-amber-500" />
    </div>
    <h3 className="text-base font-bold text-slate-900 dark:text-white">Something went wrong</h3>
    <p className="mt-1 max-w-md text-sm text-slate-400">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0f55f7] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0f55f7]/90"
      >
        <Loader2 className="w-4 h-4" />
        Retry
      </button>
    )}
  </div>
)

export const SettingsEmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-14 text-center">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
      <Icon className="h-8 w-8 text-slate-300 dark:text-slate-600" />
    </div>
    <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
    {description && <p className="mt-1 max-w-sm text-sm text-slate-400">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
)
