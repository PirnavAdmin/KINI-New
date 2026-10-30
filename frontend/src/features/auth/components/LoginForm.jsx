import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { ROUTES } from '@shared/constants/routeConstants';
const KiniLogo = '/assets/new-logo-f.jpg.jpeg';
import ForgotPasswordLink from './ForgotPasswordLink';
 
export default function LoginForm({
  onLogin,
  errorMessage = '',
  onClearError,
  isLoading = false,
  showDemoCredentials = false,
  initialEmail = '',
  infoMessage = '',
  title = 'Student Login',
  subtitle = 'Sign in to continue your learning journey',
  registerLabel = 'Create account',
  registerTo,
  registerState,
  showFooter = true,
  checkoutLogin = false,
  recoveryReturnTo,
  onGoogleLogin,
  googleLoading = false,
}) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const submitLockRef = useRef(false);

  useEffect(() => {
    if (!isLoading) {
      submitLockRef.current = false;
    }
  }, [isLoading]);

  const clearError = () => {
    if (onClearError) onClearError();
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    clearError();
    if (isLoading || submitLockRef.current) {
      return;
    }
    submitLockRef.current = true;
    if (onLogin) {
      const maybePromise = onLogin({
        email,
        password,
        remember: rememberMe
      });
      if (maybePromise && typeof maybePromise.finally === "function") {
        maybePromise.finally(() => {
          submitLockRef.current = false;
        });
      } else {
        submitLockRef.current = false;
      }
      return;
    }
    submitLockRef.current = false;
  };
 
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.01 } }
  };
 
  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 18 } }
  };
 
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="login-form-shell mx-auto flex w-full max-w-[420px] shrink-0 flex-col justify-start overflow-visible px-5 pb-2 pt-8 sm:px-6 sm:pb-3"
    >
      <motion.div variants={itemVariants} className="brand-logo-viewport mb-5 flex h-10 w-[150px] items-center justify-center lg:hidden">
        <img src={KiniLogo} alt="Kini — Learn. Innovate. Lead." className="brand-logo-image" />
      </motion.div>
      <motion.div variants={itemVariants} className="login-form-header mb-4 text-left">
        {title === 'Mentor Login' && (
          <span className="mb-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
            Mentor Portal
          </span>
        )}
        <h3 className="login-form-title flex items-center gap-2 text-[clamp(1.65rem,4.5vh,2.25rem)] font-extrabold tracking-[-0.035em] text-slate-950 dark:text-white">
          {title}
        </h3>
        <h3 className="hidden">
          Welcome Back! <span className="inline-block origin-bottom animate-bounce">👋</span>
        </h3>
        <p className="login-form-subtitle mt-2 text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">
          {subtitle}
        </p>
      </motion.div>
      {infoMessage && (
        <div className="mb-4 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium leading-relaxed text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          {infoMessage}
        </div>
      )}
 
      {/* Error Popup */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="relative mb-4 flex max-h-[72px] items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-3 shadow-sm dark:border-red-500/30 dark:bg-red-500/10"
          role="alert"
        >
          {/* Icon */}
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
            <svg className="w-3.5 h-3.5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          {/* Message */}
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm font-medium leading-5 text-red-700 dark:text-red-300">
              {errorMessage}
            </p>
          </div>
          {/* Close button */}
          <button
            type="button"
            onClick={onClearError}
            aria-label="Dismiss login error"
            className="flex h-7 w-7 shrink-0 items-center justify-center self-center rounded-lg text-red-600 transition-all hover:bg-red-100 hover:text-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:hover:bg-red-500/20"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </motion.div>
      )}
 
      <form onSubmit={handleFormSubmit} noValidate className="login-form-fields space-y-4">
        {/* Identifier Field */}
        <motion.div variants={itemVariants}>
          <label htmlFor="login-email" className="mb-2 block text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-200">
            Email Address or Phone
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
          <input
              id="login-email"
            name={checkoutLogin ? "checkout-student-identifier" : "username"}
              type="text"
              value={email}
              onChange={(e) => {
                clearError();
                setEmail(e.target.value);
              }}
              placeholder="Enter your email or phone"
              autoComplete={checkoutLogin ? "new-password" : "username"}
              required
              className="login-control h-[clamp(44px,6.5vh,52px)] w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-sm font-medium text-slate-950 shadow-sm transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-500/20"
            />
          </div>
        </motion.div>
 
        {/* Password Field */}
        <motion.div variants={itemVariants}>
          <label htmlFor="login-password" className="mb-2 block text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-200">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
          <input
              id="login-password"
            name={checkoutLogin ? "checkout-student-secret" : "password"}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                clearError();
                setPassword(e.target.value);
              }}
              placeholder="Enter your password"
              autoComplete={checkoutLogin ? "new-password" : "current-password"}
              minLength={8}
              required
              className="login-control h-[clamp(44px,6.5vh,52px)] w-full rounded-xl border border-slate-300 bg-white pl-11 pr-12 text-sm font-medium text-slate-950 shadow-sm transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-500/20"
            />
            <button
              type="button"
              onClick={() => {
                clearError();
                setShowPassword(!showPassword);
              }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-slate-800 dark:hover:text-white"
              >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <div className="mt-2 flex justify-end">
            <ForgotPasswordLink
              returnTo={recoveryReturnTo}
              className="rounded text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-teal"
            />
          </div>
        </motion.div>
 
        {/* Remember Me Box */}
        <motion.div variants={itemVariants} className="login-remember flex items-center pt-1">
          <input
            id="remember_me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => {
              clearError();
              setRememberMe(e.target.checked);
            }}
            className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 accent-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-slate-600"
          />
          <label htmlFor="remember_me" className="ml-2 block cursor-pointer text-sm font-medium text-slate-600 dark:text-slate-300">
            Remember me for 30 days
          </label>
        </motion.div>
 
        {/* Submit Action */}
        <motion.div variants={itemVariants} className="pt-0.5">
          <button
            type="submit"
            disabled={isLoading}
            className="login-control group flex h-[clamp(44px,6.5vh,52px)] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(15,85,247,.25)] transition-all hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            {isLoading && (
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white"
              />
            )}
            <span>{isLoading ? 'Signing in...' : 'Sign in'}</span>
            {!isLoading && <ArrowRight className="h-[18px] w-[18px] transition-transform duration-200 group-hover:translate-x-1" />}
          </button>
        </motion.div>
      </form>

      {showDemoCredentials && (
        <motion.div
          variants={itemVariants}
          className="mt-3 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-[10px] leading-relaxed text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300"
        >
          <p className="font-bold">Demo credentials</p>
          <p><span className="font-semibold">Email:</span> admin@kiniedxhub.com</p>
          <p><span className="font-semibold">Password:</span> Admin@123</p>
          <p className="mt-1 border-t border-blue-200/60 pt-1 dark:border-blue-400/20">
            For Student, Employee, or Organization: select the role and use your own email and password.
          </p>
        </motion.div>
      )}
 
      <motion.div variants={itemVariants} className="login-divider my-5 flex items-center gap-3" role="separator" aria-label="Or continue with">
        <span aria-hidden="true" className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        <span className="shrink-0 text-[11px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">Or continue with</span>
        <span aria-hidden="true" className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      </motion.div>
 
      {/* Social Providers */}
      <motion.div variants={itemVariants} className="login-social grid grid-cols-1 gap-3">
        <button
          type="button"
          disabled={googleLoading || isLoading}
          onClick={() => {
            clearError();
            onGoogleLogin?.();
          }}
          className="login-social-control flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
        >
          {googleLoading ? (
            <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.96 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.6 2.8C6.01 7.22 8.78 5.04 12 5.04z"/>
              <path fill="#4285F4" d="M23.52 12.3c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.28 1.48-1.12 2.73-2.38 3.58l3.6 2.8c2.1-1.94 3.33-4.8 3.33-8.62z"/>
              <path fill="#FBBC05" d="M5.1 14.3c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3L1.5 6.9C.54 8.84 0 11.01 0 12.3s.54 3.46 1.5 5.4l3.6-2.8z"/>
              <path fill="#34A853" d="M12 23c3.24 0 5.97-1.08 7.96-2.9l-3.6-2.8c-1.1.74-2.5 1.18-4.36 1.18-3.22 0-5.99-2.18-6.96-5.26l-3.6 2.8C3.4 20.35 7.35 23 12 23z"/>
            </svg>
          )}
          <span>{googleLoading ? 'Connecting…' : 'Google'}</span>
        </button>
      </motion.div>
 
      {/* Footer: pages with their own sign-up and checkout sign-ins keep the
          register link; the shared user login points organizations to their
          own login page instead. Pages can turn it off with showFooter. */}
      {showFooter && <motion.div variants={itemVariants} className="login-register mt-2 flex flex-wrap items-center justify-center gap-x-1 border-t border-gray-100 pt-4 text-center text-sm text-gray-500 dark:border-slate-800 dark:text-slate-300">
        {registerTo || checkoutLogin ? (
          <>
            Don't have an account?
            <button
              type="button"
              onClick={() => navigate(registerTo || '/register', { state: registerState })}
              className="cursor-pointer rounded border-none bg-transparent p-0 font-semibold text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-teal"
            >
              {registerLabel}
            </button>
          </>
        ) : (
          <>
            Organization login?
            <Link
              to={ROUTES.ORG_ADMIN.LOGIN}
              className="rounded font-semibold text-blue-600 underline-offset-4 transition-colors hover:text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-teal dark:hover:text-teal/80"
            >
              Login here
            </Link>
          </>
        )}
      </motion.div>}
    </motion.div>
  );
}
 
