import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Lock,
  CheckCircle,
  Eye,
  EyeOff,
  Shield,
  X,
  ArrowRight,
  AlertCircle,
  Moon,
  Sun,
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useThemeContext } from '@shared/context/ThemeContext'
import { resetPassword } from '@shared/services/authApi'
import { toast } from 'sonner'

const REQUIREMENTS = [
  { id: 'min', label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { id: 'upper', label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { id: 'lower', label: 'One lowercase letter', test: (v) => /[a-z]/.test(v) },
  { id: 'number', label: 'One number', test: (v) => /[0-9]/.test(v) },
  { id: 'special', label: 'One special character', test: (v) => /[!@#$%^&*(),.?":{}|<>]/.test(v) },
]

function getStrength(password) {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++

  if (score <= 2) return { label: 'Weak', color: '#EF4444', width: '25%' }
  if (score <= 4) return { label: 'Medium', color: '#F59E0B', width: '50%' }
  if (score <= 5) return { label: 'Strong', color: '#10B981', width: '75%' }
  return { label: 'Very Strong', color: '#10B981', width: '100%' }
}

export default function OtpChangePassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''
  const { isDark, toggle: toggleTheme } = useThemeContext()

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' })
  const [show, setShow] = useState({ new: false, confirm: false })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const strength = getStrength(form.newPassword)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const failed = REQUIREMENTS.filter((r) => !r.test(form.newPassword))
    if (failed.length > 0) {
      setError('Please meet all password requirements')
      return
    }

    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      await resetPassword({
        identifier: email,
        otpType: 'Email',
        otp: location.state?.otp || '',
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });

      setLoading(false);
      setSuccess(true);

      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setLoading(false);

      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        err?.message ||
        'Failed to reset password. Please try again.';

      toast.error(msg, { duration: 4000, position: 'top-center' });
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#070711]' : 'bg-slate-50'}`}>
      {isDark && <>
        <div className="absolute -top-40 -left-40 w-[480px] h-[480px] rounded-full bg-blue-600/20 blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-[480px] h-[480px] rounded-full bg-purple-600/15 blur-[140px] pointer-events-none" />
      </>}

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className={`absolute top-5 right-5 z-50 p-2.5 rounded-xl border transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 ${
          isDark
            ? "bg-white/[0.04] border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.12]"
            : "bg-white border-slate-200 hover:bg-slate-100 hover:border-slate-300 shadow-sm"
        }`}
        aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400" />
        ) : (
          <Moon className="w-4 h-4 text-slate-500" />
        )}
      </button>

      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`backdrop-blur-2xl border rounded-[24px] p-8 shadow-2xl transition-colors duration-300 ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
          }`}
          style={{ boxShadow: isDark ? '0 32px 80px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(255,255,255,0.06)' : '0 4px 24px rgba(0,0,0,0.06)' }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Kini<span className="text-blue-400">EduHub</span>
            </h2>
          </div>

          {/* Back */}
          <button
            onClick={() => navigate('/otp-verification', { state: { email } })}
            className={`flex items-center gap-2 text-sm transition-all mb-6 group ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>

          {/* Progress */}
          <div className="flex gap-2 mb-8">
            <div className="h-1 flex-1 rounded bg-[#10B981]" />
            <div className="h-1 flex-1 rounded bg-[#10B981]" />
            <div className="h-1 flex-1 rounded bg-[#2563EB]" />
          </div>

          <AnimatePresence mode="wait">
            {success ? (
              /* ── Success State ── */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="w-20 h-20 rounded-full bg-[#10B981]/20 border border-[#10B981]/30 flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle className="w-10 h-10 text-[#10B981]" />
                </motion.div>
                <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Password reset!</h2>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Redirecting to sign in...</p>
              </motion.div>
            ) : (
              /* ── Form ── */
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Icon */}
                <div className="w-14 h-14 rounded-[18px] bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center mb-6">
                  <Lock className="w-7 h-7 text-[#2563EB]" />
                </div>

                <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Set new password</h1>
                <p className={`text-sm leading-relaxed mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Create a strong password for your account.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type={show.new ? 'text' : 'password'}
                        value={form.newPassword}
                        onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                        placeholder="Enter new password"
                        className="w-full h-12 pl-11 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]/50 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShow({ ...show, new: !show.new })}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {show.new ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Password Strength */}
                  {form.newPassword && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: strength.width }}
                          className="h-full rounded-full transition-all duration-500"
                          style={{ background: `linear-gradient(90deg, ${strength.color}, ${strength.color}88)` }}
                        />
                      </div>
                      <p className="text-xs font-medium" style={{ color: strength.color }}>{strength.label}</p>
                    </motion.div>
                  )}

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type={show.confirm ? 'text' : 'password'}
                        value={form.confirmPassword}
                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                        placeholder="Confirm new password"
                        className="w-full h-12 pl-11 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]/50 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShow({ ...show, confirm: !show.confirm })}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {show.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1 text-xs text-red-400">
                      <AlertCircle className="w-3 h-3" />
                      {error}
                    </motion.p>
                  )}

                  {/* Requirements Checklist */}
                  {form.newPassword && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5 p-3.5 rounded-xl bg-white/5 border border-white/5">
                      {REQUIREMENTS.map((req) => {
                        const passed = req.test(form.newPassword)
                        return (
                          <div key={req.id} className="flex items-center gap-2">
                            {passed ? (
                              <CheckCircle className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                            ) : (
                              <X className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            )}
                            <span className={`text-xs ${passed ? 'text-[#10B981]' : 'text-slate-400'}`}>
                              {req.label}
                            </span>
                          </div>
                        )
                      })}
                    </motion.div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="group w-full h-12 rounded-xl bg-[#2563EB] hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold transition-all duration-200 shadow-lg shadow-[#2563EB]/25 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                    ) : (
                      <>
                        Reset Password
                        <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <p className={`text-center text-sm mt-6 pt-6 ${isDark ? 'text-slate-500 border-t border-white/5' : 'text-slate-400 border-t border-slate-200'}`}>
            Remember your password?{' '}
            <button onClick={() => navigate('/login')} className="text-[#2563EB] hover:text-blue-400 font-medium transition-colors">
              Sign In
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
