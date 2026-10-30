import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Check, CheckCircle2, Copy, Eye, EyeOff, KeyRound, Mail, ShieldCheck, X } from 'lucide-react'

const ENTITY_LABELS = {
  organization: 'Organization',
  hr: 'HR user',
  mentor: 'Mentor',
  student: 'Student',
  employee: 'Employee',
}

function CopyButton({ value, label }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    if (!value) return
    await navigator.clipboard.writeText(String(value))
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-100 bg-white text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:text-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
      aria-label={`Copy ${label}`}
      title={copied ? 'Copied' : `Copy ${label}`}
    >
      {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
    </button>
  )
}

export default function AccountCreatedModal({
  open,
  onClose,
  entityType = 'employee',
  name,
  id,
  email,
  password,
  onView,
  onDashboard,
}) {
  const [showPassword, setShowPassword] = useState(false)
  const label = ENTITY_LABELS[entityType] || entityType
  const titleLabel = label.charAt(0).toUpperCase() + label.slice(1)

  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowPassword(false)
        onClose?.()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  const closeModal = () => {
    setShowPassword(false)
    onClose?.()
  }

  const viewEntity = () => {
    setShowPassword(false)
    const handler = onView || onClose
    handler?.()
  }

  const goToDashboard = () => {
    setShowPassword(false)
    const handler = onDashboard || onClose
    handler?.()
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center overflow-y-auto bg-slate-950/55 p-2 backdrop-blur-md sm:p-4">
          <motion.button
            type="button"
            aria-label="Close success dialog"
            className="absolute inset-0 cursor-default"
            onClick={closeModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-created-title"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative my-auto max-h-[calc(100dvh-1rem)] w-full max-w-[520px] overflow-y-auto rounded-[24px] border border-white/70 bg-white shadow-[0_30px_90px_rgba(2,44,78,0.28)] dark:border-slate-700 dark:bg-slate-900 sm:max-h-[calc(100dvh-2rem)]"
          >
            <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_50%_0%,rgba(45,212,191,0.18),transparent_68%)]" />
            <button type="button" onClick={closeModal} className="absolute right-3 top-3 z-10 rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 dark:hover:bg-slate-800 dark:hover:text-white" aria-label="Close">
              <X className="h-4 w-4" />
            </button>

            <div className="relative px-4 pb-4 pt-6 text-center sm:px-6 sm:pb-5 sm:pt-7">
              <div className="relative mx-auto flex h-18 w-18 items-center justify-center">
                <motion.div className="absolute inset-0 rounded-full border border-emerald-300/70" initial={{ scale: 0.65, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.12 }} />
                <div className="absolute inset-1.5 rounded-full bg-emerald-100/70 dark:bg-emerald-500/10" />
                <motion.div initial={{ scale: 0, rotate: -25 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.18, type: 'spring', stiffness: 360 }} className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
                  <CheckCircle2 className="h-7 w-7" strokeWidth={2.4} />
                </motion.div>
                {['top-0 left-0 bg-cyan-400', 'top-3 -right-1 bg-amber-400', 'bottom-0 right-2 bg-rose-400', 'bottom-2 -left-1 bg-indigo-400'].map((classes) => <span key={classes} className={`absolute h-1.5 w-1.5 rotate-45 rounded-sm ${classes}`} />)}
              </div>

              <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">Account ready</p>
              <h2 id="account-created-title" className="mt-1.5 text-xl font-bold tracking-tight text-slate-950 sm:text-[22px] dark:text-white">{titleLabel} created successfully</h2>
              <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-200">{name || `New ${label}`}</span> has been added and account access is ready.
              </p>

              <div className="mt-4 overflow-hidden rounded-xl border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-emerald-50/70 text-left dark:border-slate-700 dark:from-slate-800 dark:via-slate-850 dark:to-slate-800">
                <div className="flex items-center gap-2 border-b border-cyan-100/80 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-800 dark:border-slate-700 dark:text-cyan-300">
                  <ShieldCheck className="h-4 w-4" /> Sign-in details
                </div>
                <div className="divide-y divide-cyan-100/80 px-3 dark:divide-slate-700">
                  {id && <CredentialRow icon={KeyRound} label={`${titleLabel} ID`} value={id} />}
                  <CredentialRow icon={Mail} label="Email address" value={email || 'Not provided'} copy={Boolean(email)} />
                  <div className="flex items-center gap-2.5 py-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-cyan-700 shadow-sm dark:bg-slate-900 dark:text-cyan-300"><KeyRound className="h-3.5 w-3.5" /></div>
                    <div className="min-w-0 flex-1"><p className="text-xs font-medium text-slate-500">Password</p><p className="mt-0.5 truncate font-mono text-sm font-bold text-slate-900 dark:text-white">{password ? (showPassword ? password : '••••••••••••') : 'Set through activation email'}</p></div>
                    {password && <button type="button" onClick={() => setShowPassword((value) => !value)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white hover:text-cyan-700 dark:hover:bg-slate-900" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>}
                    {password && <CopyButton value={password} label="password" />}
                  </div>
                </div>
              </div>

              <p className="mt-2 text-left text-[11px] leading-4 text-slate-500 dark:text-slate-400">Copy these details now and share them through a trusted channel. The password will not be shown again.</p>

              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                <button type="button" onClick={viewEntity} className="inline-flex min-h-10 items-center justify-center rounded-xl border border-cyan-200 bg-white px-4 text-xs font-bold text-cyan-800 transition hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-cyan-300">View {titleLabel}</button>
                <button type="button" onClick={goToDashboard} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-4 text-xs font-bold text-white shadow-lg shadow-cyan-600/20 transition hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/40">Go to Dashboard <ArrowRight className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </motion.section>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

function CredentialRow({ icon: Icon, label, value, copy = true }) {
  return (
    <div className="flex items-center gap-2.5 py-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-cyan-700 shadow-sm dark:bg-slate-900 dark:text-cyan-300"><Icon className="h-3.5 w-3.5" /></div>
      <div className="min-w-0 flex-1"><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-0.5 truncate text-sm font-bold text-slate-900 dark:text-white">{value}</p></div>
      {copy && <CopyButton value={value} label={label.toLowerCase()} />}
    </div>
  )
}
