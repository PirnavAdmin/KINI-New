import { useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, ArrowUpRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import InputField from './InputField'
import PhoneField from './PhoneField'
import SelectField from './SelectField'
import FormFooter from './FormFooter'

/* ── Animation Variants ─────────────────────────────────────────── */

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
}

const leftPanelVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut', delay: 0.1 },
  },
  exit: {
    x: -20,
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
}

const rightPanelVariants = {
  hidden: { x: 20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut', delay: 0.15 },
  },
  exit: {
    x: 20,
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
}

const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut', delay: 0.2 + i * 0.08 },
  }),
}

/* ── Form Options ───────────────────────────────────────────────── */

const jobTitleOptions = [
  { value: 'software-engineer', label: 'Software Engineer' },
  { value: 'data-scientist', label: 'Data Scientist' },
  { value: 'product-manager', label: 'Product Manager' },
  { value: 'designer', label: 'Designer' },
  { value: 'student', label: 'Student' },
  { value: 'entrepreneur', label: 'Entrepreneur' },
  { value: 'other', label: 'Other' },
]

const experienceOptions = [
  { value: '0-1', label: '0–1 years' },
  { value: '1-3', label: '1–3 years' },
  { value: '3-5', label: '3–5 years' },
  { value: '5-8', label: '5–8 years' },
  { value: '8-12', label: '8–12 years' },
  { value: '12+', label: '12+ years' },
]

const countryOptions = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'india', label: 'India' },
  { value: 'canada', label: 'Canada' },
  { value: 'australia', label: 'Australia' },
  { value: 'germany', label: 'Germany' },
  { value: 'france', label: 'France' },
  { value: 'singapore', label: 'Singapore' },
  { value: 'uae', label: 'UAE' },
  { value: 'other', label: 'Other' },
]

/* ── Focus Trap ─────────────────────────────────────────────────── */

function useFocusTrap(containerRef, active) {
  useEffect(() => {
    if (!active) return

    const container = containerRef.current
    if (!container) return

    const focusableSelectors =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

    const getFocusableElements = () => {
      return Array.from(container.querySelectorAll(focusableSelectors))
    }

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return
      const focusable = getFocusableElements()
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    // Focus first element
    const timer = setTimeout(() => {
      const focusable = getFocusableElements()
      if (focusable.length > 0) focusable[0].focus()
    }, 50)

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [active, containerRef])
}

/* ── Component ──────────────────────────────────────────────────── */

/**
 * ConsultationModal — Premium two-column consultation booking modal.
 *
 * Props:
 *   open      → Boolean to show/hide the modal
 *   onClose   → Close handler function
 */
export default function ConsultationModal({ open, onClose }) {
  const modalRef = useRef(null)

  const schema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().min(7, 'Please enter a valid phone number'),
    jobTitle: z.string().min(1, 'Please select your job title'),
    experience: z.string().min(1, 'Please select your experience level'),
    country: z.string().min(1, 'Please select your country'),
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
  })

  // ── Focus trap ─────────────────────────────────────────────
  useFocusTrap(modalRef, open)

  // ── ESC close ──────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && onClose) onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, handleKeyDown])



  // ── Submit handler ─────────────────────────────────────────
  const onSubmit = (data) => {
    console.log('Consultation request:', data)
    // Simulate API call
    setTimeout(() => {
      reset()
      if (onClose) onClose()
    }, 1200)
  }

  const formFields = [
    { delay: 0, component: <InputField label="Full Name" name="name" placeholder="John Doe" register={register} required error={errors.name?.message} /> },
    { delay: 1, component: <InputField label="Email Address" name="email" type="email" placeholder="john@company.com" register={register} required error={errors.email?.message} /> },
    { delay: 2, component: <PhoneField label="Phone Number" name="phone" register={register} required error={errors.phone?.message} /> },
    { delay: 3, component: <SelectField label="Job Title" name="jobTitle" placeholder="Select your role" options={jobTitleOptions} register={register} required error={errors.jobTitle?.message} /> },
    { delay: 4, component: <SelectField label="Experience Level" name="experience" placeholder="Years of experience" options={experienceOptions} register={register} required error={errors.experience?.message} /> },
    { delay: 5, component: <SelectField label="Country" name="country" placeholder="Select your country" options={countryOptions} register={register} required error={errors.country?.message} /> },
  ]

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-label="Book a consultation"
            className="relative w-full max-w-[1400px] min-h-[720px] bg-white rounded-[32px] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,.12)] flex flex-col"
          >
            {/* ── HEADER ─────────────────────────────────────── */}
            <div className="h-[72px] px-8 flex items-center justify-between border-b border-black/5 shrink-0">
              {/* Logo */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0F4FA8] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">K</span>
                </div>
                <span
                  className="font-bold text-lg tracking-tight"
                  style={{ color: '#0F4FA8' }}
                >
                  KiniEdxHub
                </span>
              </div>

              {/* Close */}
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
                aria-label="Close consultation modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ── BODY: Two-column grid ──────────────────────── */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_0.95fr] gap-0 overflow-hidden">
              {/* ── LEFT PANEL: Illustration ─────────────────── */}
              <motion.div
                variants={leftPanelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="hidden lg:flex relative bg-[#071529] p-10 flex-col justify-center items-center overflow-hidden"
              >
                {/* Glow behind image */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#0F4FA8]/25 rounded-full blur-[120px] pointer-events-none" />

                {/* Badge */}
                <div className="absolute top-8 left-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F4FA8]/10 border border-[#0F4FA8]/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4A9EE0] animate-pulse" />
                  <span className="text-xs font-semibold text-[#4A9EE0] tracking-wide">
                    AI expertise is now a premium skill
                  </span>
                </div>

                {/* Hero Illustration */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-full max-w-[520px]">
                    {/* Abstract illustration using clean geometric shapes */}
                    <svg
                      viewBox="0 0 520 400"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-full h-auto"
                      aria-hidden="true"
                    >
                      {/* Background gradient circles */}
                      <circle cx="260" cy="200" r="180" fill="url(#glowGrad)" opacity="0.4" />
                      <circle cx="260" cy="200" r="120" stroke="rgba(74,158,224,0.15)" strokeWidth="1" strokeDasharray="6 6" />

                      {/* Central hub */}
                      <circle cx="260" cy="200" r="48" fill="rgba(15,79,168,0.2)" stroke="rgba(74,158,224,0.3)" strokeWidth="1.5" />
                      <circle cx="260" cy="200" r="24" fill="#0F4FA8" />

                      {/* Orbiting nodes */}
                      {[45, 135, 225, 315].map((angle, i) => {
                        const rad = (angle * Math.PI) / 180
                        const x = 260 + Math.cos(rad) * 90
                        const y = 200 + Math.sin(rad) * 90
                        return (
                          <g key={i}>
                            <line
                              x1={260} y1={200} x2={x} y2={y}
                              stroke="rgba(74,158,224,0.12)"
                              strokeWidth="1"
                            />
                            <circle cx={x} cy={y} r="10" fill="rgba(15,79,168,0.15)" stroke="rgba(74,158,224,0.25)" strokeWidth="1" />
                            <circle cx={x} cy={y} r="4" fill="rgba(74,158,224,0.5)" />
                          </g>
                        )
                      })}

                      {/* Outer dots */}
                      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
                        const rad = (angle * Math.PI) / 180
                        const x = 260 + Math.cos(rad) * 155
                        const y = 200 + Math.sin(rad) * 155
                        return (
                          <circle key={i} cx={x} cy={y} r="2.5" fill="rgba(74,158,224,0.2)" />
                        )
                      })}

                      {/* Gradient definition */}
                      <defs>
                        <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#0F4FA8" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#0F4FA8" stopOpacity="0" />
                        </radialGradient>
                      </defs>
                    </svg>
                  </div>

                  {/* Title */}
                  <h2 className="text-white text-4xl font-bold mt-8 leading-tight">
                    Unlock Your
                    <br />
                    <span className="text-[#4A9EE0]">Full Potential</span>
                  </h2>

                  {/* Subtitle */}
                  <p className="text-slate-300 text-sm mt-3 max-w-sm leading-relaxed">
                    Get personalized career guidance from industry experts and take your skills to the next level.
                  </p>
                </div>
              </motion.div>

              {/* ── RIGHT PANEL: Form ─────────────────────────── */}
              <motion.div
                variants={rightPanelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex flex-col justify-center px-8 lg:px-12 py-10 overflow-y-auto"
              >
                {/* Mobile logo (shown on small screens) */}
                <div className="flex items-center gap-2.5 mb-6 lg:hidden">
                  <div className="w-8 h-8 rounded-lg bg-[#0F4FA8] flex items-center justify-center">
                    <span className="text-white font-bold text-sm">K</span>
                  </div>
                  <span className="font-bold text-lg tracking-tight" style={{ color: '#0F4FA8' }}>
                    KiniEdxHub
                  </span>
                </div>

                {/* Heading */}
                <motion.div
                  custom={0}
                  variants={staggerItem}
                  initial="hidden"
                  animate="visible"
                  className="mb-8"
                >
                  <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
                    Talk to Our
                    <br />
                    Advisor
                  </h2>
                  <p className="text-slate-500 mt-2 text-sm">
                    Fill in your details and we'll get back to you within 24 hours.
                  </p>
                </motion.div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                  {formFields.map((field) => (
                    <motion.div
                      key={field.delay}
                      custom={field.delay}
                      variants={staggerItem}
                      initial="hidden"
                      animate="visible"
                    >
                      {field.component}
                    </motion.div>
                  ))}

                  {/* CTA Button */}
                  <motion.div
                    custom={6}
                    variants={staggerItem}
                    initial="hidden"
                    animate="visible"
                    className="pt-2"
                  >
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`
                        relative w-full h-14 rounded-xl
                        bg-[#0F4FA8]
                        text-white font-semibold tracking-wide text-sm
                        flex items-center justify-center gap-2.5
                        shadow-[0_10px_30px_rgba(15,79,168,.18)]
                        hover:shadow-[0_15px_40px_rgba(15,79,168,.25)]
                        hover:bg-[#0A438E]
                        focus:outline-none focus:ring-4 focus:ring-[#0F4FA8]/20
                        transition-all duration-300
                        disabled:opacity-60 disabled:cursor-not-allowed
                      `}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2.5">
                          <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Sending Request...
                        </span>
                      ) : (
                        <>
                          Request A Call
                          <ArrowUpRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </motion.div>

                  {/* Footer */}
                  <motion.div
                    custom={7}
                    variants={staggerItem}
                    initial="hidden"
                    animate="visible"
                  >
                    <FormFooter />
                  </motion.div>
                </form>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
