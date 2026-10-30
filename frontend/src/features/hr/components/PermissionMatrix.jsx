import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ShieldCheck, Sparkles } from 'lucide-react'
import {
  HR_PERMISSION_MODULES, HR_FULL_ACCESS, emptyPermissions,
  moduleActionKeys, moduleAllGranted, moduleAnyGranted, countGranted,
  countGrantedModules, HR_TOTAL_ACTIONS, isFullAccess,
} from '@features/hr/constants/hrPermissionMatrix'

function MatrixCheckbox({ checked = false, partial = false, label, onToggle, disabled = false, title }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={partial ? 'mixed' : checked}
      aria-label={title || label}
      title={title || label}
      onClick={onToggle}
      disabled={disabled}
      className="group inline-flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-left transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800/60"
    >
      <span
        aria-hidden="true"
        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200 ${
          checked
            ? 'border-[#0f55f7] bg-[#0f55f7] shadow-sm shadow-[#0f55f7]/30'
            : partial
              ? 'border-[#0f55f7]/60 bg-[#0f55f7]/15'
              : 'border-slate-300 bg-white group-hover:border-[#0f55f7]/50 dark:border-slate-600 dark:bg-slate-800'
        }`}
      >
        {checked && (
          <svg
            viewBox="0 0 12 12"
            className="h-2.5 w-2.5 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="2 6.5 4.8 9.2 10 3" />
          </svg>
        )}
        {!checked && partial && <span className="h-0.5 w-2 rounded-full bg-[#0f55f7]" />}
      </span>
      <span className="select-none text-[13px] font-semibold text-slate-700 dark:text-slate-200">{label}</span>
    </button>
  )
}

function ModuleCard({ module, permissions, onToggleAction, onToggleAll, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)
  const granted = permissions[module.id] || []
  const all = moduleAllGranted(permissions, module.id)
  const any = moduleAnyGranted(permissions, module.id)
  const total = module.actions.length
  const count = granted.length

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_6px_20px_rgba(15,23,42,0.04)] transition-colors dark:border-slate-700/70 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-2.5 px-3 py-3 sm:flex-nowrap">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl text-left"
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/40 shadow-sm"
            style={{ backgroundColor: `${module.color}14`, color: module.color }}
          >
            <module.icon className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-bold text-slate-900 dark:text-white">{module.label}</span>
            <span className="block text-[10px] font-semibold text-slate-400">
              {any ? `${count} of ${total} granted` : 'No access'}
            </span>
          </span>
        </button>

        <span
          className={`hidden shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold sm:inline-flex ${
            all
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
              : any
                ? 'bg-[#0f55f7]/10 text-[#0f55f7]'
                : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
          }`}
        >
          {all ? 'Full access' : any ? 'Partial' : 'None'}
        </span>

        <MatrixCheckbox
          label="Select All"
          checked={all}
          partial={any && !all}
          onToggle={() => onToggleAll(module.id, !all)}
          title={`${module.label}: select all permissions`}
        />

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={`${open ? 'Collapse' : 'Expand'} ${module.label}`}
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
        >
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 gap-1.5 border-t border-slate-100 px-3 py-3 sm:grid-cols-2 dark:border-slate-800">
              {module.actions.map((action) => (
                <MatrixCheckbox
                  key={action.key}
                  label={action.label}
                  checked={granted.includes(action.key)}
                  onToggle={() => onToggleAction(module.id, action.key, !granted.includes(action.key))}
                  title={`${module.label} · ${action.label}`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * PermissionMatrix - enterprise permission assignment UI.
 *
 * Props:
 *   value       -> { moduleId: [actionKey] } permission profile (controlled)
 *   onChange    -> (nextPermissions) => void
 *   defaultOpen -> whether module cards render expanded (default: true)
 */
export default function PermissionMatrix({ value, onChange, defaultOpen = true }) {
  const permissions = useMemo(() => value || emptyPermissions(), [value])
  const granted = countGranted(permissions)
  const grantedModules = countGrantedModules(permissions)
  const full = isFullAccess(permissions)

  const toggleAction = (moduleId, actionKey, next) => {
    const current = permissions[moduleId] || []
    onChange?.({
      ...permissions,
      [moduleId]: next ? [...new Set([...current, actionKey])] : current.filter((key) => key !== actionKey),
    })
  }

  const toggleAll = (moduleId, next) => {
    const keys = moduleActionKeys(moduleId)
    onChange?.({ ...permissions, [moduleId]: next ? keys : [] })
  }

  const toggleFull = () => onChange?.(full ? emptyPermissions() : HR_FULL_ACCESS)

  return (
    <div className="space-y-3">
      <div
        className={`rounded-2xl border bg-[linear-gradient(135deg,rgba(15,85,247,.06)_0%,rgba(255,255,255,.96)_48%,rgba(6,182,168,.06)_100%)] p-3.5 shadow-[0_8px_24px_rgba(15,23,42,0.05)] dark:bg-[linear-gradient(135deg,rgba(15,85,247,.12)_0%,rgba(15,23,42,.96)_48%,rgba(6,182,168,.10)_100%)] ${
          full ? 'border-[#06b6a8]/35' : 'border-slate-200 dark:border-slate-700/70'
        }`}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[13px] font-bold text-slate-900 dark:text-white">
              <ShieldCheck className="h-4 w-4 text-[#0f55f7]" />
              Permission Matrix
            </p>
            <p className="mt-0.5 max-w-2xl text-[11px] leading-5 text-slate-500 dark:text-slate-400">
              {full
                ? 'Full HR access is enabled. Every module and action in the HR workspace is available.'
                : 'Custom access is active. The HR dashboard, menus and actions adapt to this permission profile.'}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:w-full sm:max-w-[340px]">
            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Modules</p>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{grantedModules}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Actions</p>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{granted}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Access</p>
              <p className={`mt-1 text-lg font-bold ${full ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#0f55f7]'}`}>
                {full ? 'Full' : 'Custom'}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleFull}
          role="checkbox"
          aria-checked={full}
          className="mt-3 flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/80 px-3.5 py-3 text-left transition-all hover:border-[#0f55f7]/40 hover:bg-white dark:border-slate-700 dark:bg-slate-900/70 dark:hover:border-[#0f55f7]/55"
        >
          <span className="flex items-center gap-2">
            <span
              className={`flex h-[18px] w-[18px] items-center justify-center rounded-md border-2 transition-all ${
                full ? 'border-[#0f55f7] bg-[#0f55f7] shadow-sm shadow-[#0f55f7]/30' : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800'
              }`}
            >
              {full && (
                <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="2 6.5 4.8 9.2 10 3" />
                </svg>
              )}
            </span>
            <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100">
              <Sparkles className="mr-1.5 inline h-3.5 w-3.5 text-[#0f55f7]" />
              Full HR Access
            </span>
          </span>
          <span className="text-[10px] font-semibold text-slate-400">
            {full ? 'Enabled' : 'Enable every module and action'}
          </span>
        </button>
      </div>

      <div className="space-y-2">
        {HR_PERMISSION_MODULES.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            permissions={permissions}
            onToggleAction={toggleAction}
            onToggleAll={toggleAll}
            defaultOpen={defaultOpen}
          />
        ))}
      </div>
    </div>
  )
}
