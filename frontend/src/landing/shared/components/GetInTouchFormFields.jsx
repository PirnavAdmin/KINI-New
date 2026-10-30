// GetInTouchFormFields.jsx
import { useCallback, useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { z } from 'zod'

import { useThemeContext } from '@landing-shared/context/ThemeContext'
import { submitGetInTouch } from '@landing-shared/services/getInTouchService'
import Button from '@landing-shared/components/ui/Button'

// ─── Local validation schema with strict rules ──────────────────────────
const localSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .regex(/^[A-Za-z\s]+$/, 'Name can only contain letters and spaces')
    .trim(),
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  mobileNumber: z
    .string()
    .length(10, 'Mobile number must be exactly 10 digits')
    .regex(/^\d{10}$/, 'Mobile number must contain only digits')
    .min(1, 'Mobile number is required'),
  subject: z
    .enum(['general', 'career', 'placement', 'course', 'other'])
    .optional()
    .or(z.literal(''))
    .transform(val => val === '' ? undefined : val),
  message: z
    .string()
    .min(20, 'Message must be at least 20 characters')
    .max(500, 'Message cannot exceed 500 characters')
    .trim(),
})

const defaultValues = {
  name: '',
  email: '',
  mobileNumber: '',
  subject: '',
  message: '',
}

const SUBJECT_OPTIONS = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'career', label: 'Career Guidance' },
  { value: 'placement', label: 'Placement Assistance' },
  { value: 'course', label: 'Course Details' },
  { value: 'other', label: 'Other' },
]

// ─── Brand gradient (optional) ──────────────────────────────────────────
const BRAND_GRADIENT = 'linear-gradient(90deg,#133B5D 0%,#1F4A70 55%,#F39924 100%)'
const BRAND_GRADIENT_SOFT_LIGHT = 'linear-gradient(135deg,#EEF3F8 0%,#D9E3EE 50%,#FFF4E5 100%)'
const BRAND_GRADIENT_SOFT_DARK  = 'linear-gradient(135deg,rgba(19,59,93,0.14) 0%,rgba(31,74,112,0.10) 50%,rgba(243,153,36,0.10) 100%)'

// ─── Field Error component ─────────────────────────────────────────────
function FieldError({ id, message }) {
  if (!message) return null
  return (
    <motion.p
      id={id}
      role="alert"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="mt-1 flex items-center gap-1 text-[11px] font-medium text-red-500"
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
        <circle cx="5" cy="5" r="4.5" stroke="currentColor" strokeWidth="1"/>
        <path d="M5 3v2.5M5 7h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
      {message}
    </motion.p>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────
export default function GetInTouchFormFields({ onSubmitted, heading = null }) {
  const { isDark } = useThemeContext()
  const [status, setStatus] = useState('idle')
  const uid = useId()

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(localSchema),
    defaultValues,
    mode: 'onBlur',
  })

  const submitValues = useCallback(
    async (values) => {
      setStatus('submitting')
      try {
        await submitGetInTouch(values)
        setStatus('success')
        toast.success('Thank you for contacting us. Our team will reach out shortly.')
        window.setTimeout(() => {
          onSubmitted?.()
          reset()
          setStatus('idle')
        }, 1800)
      } catch {
        setStatus('error')
        toast.error('Something went wrong. Please try again.')
      }
    },
    [onSubmitted, reset],
  )

  const onSubmit = handleSubmit(submitValues)
  const handleRetry = useCallback(() => submitValues(getValues()), [getValues, submitValues])

  // ── Input styling ──────────────────────────────────────────────────────
  const inputBase = [
    'w-full rounded-xl border px-3.5 py-2.5 text-[13px] outline-none',
    'transition-all duration-200 leading-normal',
    'focus:ring-2',
  ].join(' ')

  const inputClass = (hasError) =>
    [
      inputBase,
      hasError
        ? 'border-red-400 bg-red-500/[0.04] text-red-600 placeholder:text-red-400/50 focus:border-red-400 focus:ring-red-400/15'
        : isDark
          ? [
              'border-white/[0.09] bg-white/[0.05] text-white placeholder:text-slate-500',
              'hover:border-white/[0.16] hover:bg-white/[0.08]',
              'focus:border-transparent focus:ring-[#1F4A70]/30',
              'focus:shadow-[0_0_0_2px_rgba(40,144,184,0.25)]',
            ].join(' ')
          : [
              'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400',
              'shadow-[0_1px_3px_rgba(0,0,0,0.06)]',
              'hover:border-slate-300',
              'focus:border-transparent focus:ring-[#1F4A70]/20',
              'focus:shadow-[0_0_0_2px_rgba(40,144,184,0.22),0_1px_3px_rgba(0,0,0,0.06)]',
            ].join(' '),
    ].join(' ')

  const labelClass = [
    'mb-1.5 block text-[11px] font-bold uppercase tracking-[0.07em]',
    isDark ? 'text-slate-400' : 'text-slate-500',
  ].join(' ')

  // ── Select-specific styling (native <select> needs its own color-scheme
  //    and both the control AND each <option> styled explicitly, or the
  //    browser falls back to a light popup even inside a dark-mode page) ──
  const selectStyle = {
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
    color: isDark ? '#ffffff' : 'inherit',
    colorScheme: isDark ? 'dark' : 'light',
  }

  const optionStyle = {
    backgroundColor: isDark ? '#0d1117' : '#ffffff',
    color: isDark ? '#ffffff' : '#0f172a',
  }

  const placeholderOptionStyle = {
    backgroundColor: isDark ? '#0d1117' : '#ffffff',
    color: isDark ? '#64748b' : '#94a3b8',
  }

  return (
    <div
      className={[
        'relative overflow-hidden rounded-2xl border',
        isDark ? 'border-white/[0.08]' : 'border-slate-200/80',
      ].join(' ')}
      style={{
        backgroundImage: isDark ? BRAND_GRADIENT_SOFT_DARK : BRAND_GRADIENT_SOFT_LIGHT,
        backgroundColor: isDark ? 'rgba(13,17,23,0.95)' : '#ffffff',
        colorScheme: isDark ? 'dark' : 'light',
      }}
    >
      {/* Top accent bar */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ backgroundImage: BRAND_GRADIENT }}
      />

      {/* Ambient glows */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-16 -right-16 h-40 w-40 rounded-full blur-3xl opacity-30"
          style={{ background: 'radial-gradient(circle,#1F4A70,transparent 70%)' }}
        />
        <div
          className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle,#F39924,transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 p-5 sm:p-6">
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            // ─── Success state ──────────────────────────────────────────
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex min-h-[260px] flex-col items-center justify-center gap-5 text-center"
            >
              <div className="relative flex h-24 w-24 items-center justify-center">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.45 }}
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'radial-gradient(circle,rgba(88,179,71,0.12),transparent 70%)',
                  }}
                />
                <motion.div
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.36, delay: 0.12 }}
                  className={[
                    'relative flex h-16 w-16 items-center justify-center rounded-2xl border shadow-inner',
                    isDark
                      ? 'border-[#F39924]/20 bg-[#F39924]/10'
                      : 'border-[#F39924]/25 bg-[#F39924]/08',
                  ].join(' ')}
                >
                  <CheckCircle2 className="h-8 w-8" style={{ color: '#F39924' }} />
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: 0.22 }}
                className="space-y-1.5"
              >
                <h3 className={`text-lg font-black tracking-[-0.015em] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Message sent!
                </h3>
                <p className={`text-[13px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Our team will reach out to you shortly.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex gap-1.5"
                aria-hidden="true"
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.25, 1, 0.25] }}
                    transition={{ duration: 1.4, delay: i * 0.22, repeat: Infinity }}
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: '#B6630F' }}
                  />
                ))}
              </motion.div>
            </motion.div>
          ) : (
            // ─── Form ──────────────────────────────────────────────────────
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <form onSubmit={onSubmit} noValidate>
                {heading && (
                  <h3
                    className={[
                      'mb-4 text-[17px] font-black tracking-[-0.02em]',
                      isDark ? 'text-white' : 'text-slate-900',
                    ].join(' ')}
                  >
                    {heading}
                  </h3>
                )}

                <div className={`${heading ? 'mt-4' : ''} space-y-3.5`}>
                  {/* Name */}
                  <div>
                    <label htmlFor={`${uid}-name`} className={labelClass}>
                      Full Name <span className="normal-case tracking-normal text-red-500">*</span>
                    </label>
                    <input
                      id={`${uid}-name`}
                      type="text"
                      autoComplete="name"
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? `${uid}-name-error` : undefined}
                      className={inputClass(!!errors.name)}
                      placeholder="Your full name"
                      {...register('name')}
                    />
                    <FieldError id={`${uid}-name-error`} message={errors.name?.message} />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor={`${uid}-email`} className={labelClass}>
                      Email <span className="normal-case tracking-normal text-red-500">*</span>
                    </label>
                    <input
                      id={`${uid}-email`}
                      type="email"
                      autoComplete="email"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? `${uid}-email-error` : undefined}
                      className={inputClass(!!errors.email)}
                      placeholder="you@example.com"
                      {...register('email')}
                    />
                    <FieldError id={`${uid}-email-error`} message={errors.email?.message} />
                  </div>

                  {/* Mobile */}
                  <div>
                    <label htmlFor={`${uid}-mobile`} className={labelClass}>
                      Mobile Number <span className="normal-case tracking-normal text-red-500">*</span>
                    </label>
                    <input
                      id={`${uid}-mobile`}
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      autoComplete="tel"
                      aria-invalid={!!errors.mobileNumber}
                      aria-describedby={errors.mobileNumber ? `${uid}-mobile-error` : undefined}
                      className={inputClass(!!errors.mobileNumber)}
                      placeholder="10-digit mobile number"
                      {...register('mobileNumber')}
                    />
                    <FieldError id={`${uid}-mobile-error`} message={errors.mobileNumber?.message} />
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor={`${uid}-subject`} className={labelClass}>
                      Subject
                    </label>
                    <select
                      id={`${uid}-subject`}
                      aria-invalid={!!errors.subject}
                      aria-describedby={errors.subject ? `${uid}-subject-error` : undefined}
                      className={inputClass(!!errors.subject)}
                      defaultValue=""
                      {...register('subject')}
                      style={selectStyle}
                    >
                      <option value="" disabled style={placeholderOptionStyle}>
                        Select a subject
                      </option>
                      {SUBJECT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value} style={optionStyle}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <FieldError id={`${uid}-subject-error`} message={errors.subject?.message} />
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor={`${uid}-message`} className={labelClass}>
                      Message <span className="normal-case tracking-normal text-red-500">*</span>
                    </label>
                    <textarea
                      id={`${uid}-message`}
                      rows={3}
                      aria-invalid={!!errors.message}
                      aria-describedby={errors.message ? `${uid}-message-error` : undefined}
                      className={`${inputClass(!!errors.message)} resize-none`}
                      placeholder="Tell us what you're looking for (min. 20 characters)"
                      {...register('message')}
                    />
                    <FieldError id={`${uid}-message-error`} message={errors.message?.message} />
                  </div>

                  {/* Error banner */}
                  <AnimatePresence>
                    {status === 'error' && (
                      <motion.div
                        role="alert"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className={[
                          'flex items-start gap-2.5 rounded-xl border px-3.5 py-3',
                          isDark
                            ? 'border-red-500/20 bg-red-500/[0.07]'
                            : 'border-red-200 bg-red-50',
                        ].join(' ')}
                      >
                        <div className="mt-px flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-500/15">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true" className="text-red-500">
                            <circle cx="5" cy="5" r="4.5" stroke="currentColor" strokeWidth="1"/>
                            <path d="M5 2.5v3M5 7.25h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                          </svg>
                        </div>
                        <div>
                          <p className={`text-[12px] font-semibold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                            Submission failed
                          </p>
                          <p className={`mt-0.5 text-[11px] ${isDark ? 'text-red-400/75' : 'text-red-500/80'}`}>
                            Check your connection and try again.
                          </p>
                          <button
                            type="button"
                            onClick={handleRetry}
                            className="mt-1 text-[11px] font-bold text-red-500 underline underline-offset-2
                                       hover:opacity-80 transition-opacity
                                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1 rounded"
                          >
                            Retry now
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div
                  aria-hidden="true"
                  className={`my-5 h-px ${isDark ? 'bg-white/[0.06]' : 'bg-slate-100'}`}
                />

                <Button
                  type="submit"
                  disabled={isSubmitting || status === 'submitting'}
                  className={[
                    'relative w-full overflow-hidden rounded-xl py-3 text-[13.5px] font-bold',
                    'tracking-[-0.01em] transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                    'focus-visible:ring-secondary-500',
                    isSubmitting || status === 'submitting'
                      ? isDark
                        ? 'cursor-not-allowed bg-white/10 text-slate-500'
                        : 'cursor-not-allowed bg-slate-100 text-slate-400'
                      : 'bg-secondary-500 text-primary-700 border border-secondary-500 hover:bg-secondary-600 active:scale-[0.99] shadow-md hover:shadow-lg',
                  ].join(' ')}
                >


                  {status === 'submitting' ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Sending…
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Send Message
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true" className="opacity-90">
                        <path d="M3.5 7.5h8M9 4.5l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  )}
                </Button>

                <p className={`mt-3 text-center text-[11px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                  🔒 We respect your privacy. No spam, ever.
                </p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}