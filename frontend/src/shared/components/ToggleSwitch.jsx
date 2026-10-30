import { motion } from 'framer-motion'

export default function ToggleSwitch({ checked, onChange, label, description, icon: Icon, disabled = false }) {
  return (
    <div className={`flex items-center justify-between gap-4 ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
          {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange?.()}
        className={`
          relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent
          transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30
          ${checked ? 'bg-[#0f55f7]' : 'bg-slate-200 dark:bg-slate-700'}
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <motion.span
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0"
        />
      </button>
    </div>
  )
}

