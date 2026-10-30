import { useEffect, useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Building2, Eye, EyeOff, Lock, Mail, Moon, ShieldCheck, Sun, X } from "lucide-react";
import AuthHero from "@features/auth/components/AuthHero";
import HeroBackground from "@features/auth/components/HeroBackground";
import GrainOverlay from "@features/auth/components/GrainOverlay";
import GlowOrb from "@features/auth/components/GlowOrb";
import { useThemeContext } from "@shared/context/ThemeContext";
import { useSuperAdminLogin } from "../hooks/useSuperAdminLogin";
import { useAuth } from "@shared/hooks/useAuth";
import { ROUTES } from "@shared/constants/routeConstants";
import SuperAdminPasswordRecovery from "../components/SuperAdminPasswordRecovery";

const SuperAdminLogin = () => {
  const navigate = useNavigate();
  const { isDark, toggle: toggleTheme } = useThemeContext();
  const { isAuthenticated, role } = useAuth();
  const { login, resetState, isLoading, errorMessage } = useSuperAdminLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", rememberMe: false });
  const [authView, setAuthView] = useState("signin"); // "signin" | "recovery"

  useEffect(() => resetState(), [resetState]);

  if (isAuthenticated && role === "super-admin") {
    return <Navigate to={ROUTES.SUPER_ADMIN.DASHBOARD} replace />;
  }

  const submit = (event) => {
    event.preventDefault();
    login(form);
  };

  return (
    <main className={`fixed inset-0 flex min-h-dvh w-full items-center justify-center overflow-x-hidden overflow-y-auto transition-colors duration-300 lg:h-dvh lg:overflow-hidden ${isDark ? "bg-slate-950" : "bg-slate-100"}`}>
      <HeroBackground />
      <GrainOverlay />
      <GlowOrb className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0f55f7]/10 blur-[120px]" />

      <div className={`relative z-10 grid min-h-[620px] w-full grid-cols-1 overflow-hidden border shadow-[0_32px_80px_-18px_rgba(8,15,70,.55)] lg:h-full lg:min-h-0 lg:grid-cols-[55%_45%] ${isDark ? "border-indigo-400/70 bg-[#070b35]" : "border-indigo-300/70 bg-[#070b35]"}`}>
        <div className="relative h-72 w-full overflow-hidden bg-[#070b35] sm:h-80 lg:h-full">
          <AuthHero />
        </div>

        <section className="relative m-0 flex min-h-0 w-full flex-col justify-start overflow-y-auto bg-white pb-6 pt-16 dark:bg-slate-900 lg:m-3 lg:w-auto lg:rounded-[24px] xl:m-4">
          <div className="absolute right-6 top-5 z-30 flex items-center gap-2">
            <button type="button" onClick={toggleTheme} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/60 bg-white/80 text-slate-500 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-amber-400" aria-label="Toggle theme">
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button type="button" onClick={() => navigate("/")} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/60 bg-white/80 text-slate-500 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400" aria-label="Close">
              <X size={14} />
            </button>
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto flex w-full max-w-[410px] shrink-0 flex-col px-5 py-3 sm:px-6">
            <AnimatePresence mode="wait" initial={false}>
              {authView === "signin" ? (
                <motion.div
                  key="signin"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.16 }}
                >
                  <header className="mb-5">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-600/20"><ShieldCheck size={22} /></div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[.2em] text-blue-600 dark:text-cyan-400">Secure Super Admin Portal</p>
                    <h1 className="mt-1.5 text-3xl font-extrabold tracking-[-.04em] text-slate-950 dark:text-white">Welcome Back! <span className="inline-block origin-bottom animate-bounce">👋</span></h1>
                    <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">Sign in to manage the complete platform</p>
                  </header>

                  {errorMessage && (
                    <div role="alert" className="mb-4 flex items-start gap-3 rounded-2xl border border-red-300 bg-red-50 p-4 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                      <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-red-100 font-bold dark:bg-red-500/20">!</div>
                      <div><p className="text-sm font-bold">Sign in failed</p><p className="mt-1 text-xs font-medium leading-5">{errorMessage}</p></div>
                    </div>
                  )}

                  <form onSubmit={submit} className="space-y-4">
                    <div>
                      <label htmlFor="super-admin-email" className="mb-2 block text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-200">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                        <input id="super-admin-email" type="email" required autoComplete="username" value={form.email} onChange={(event) => setForm((value) => ({ ...value, email: event.target.value }))} className="h-[52px] w-full rounded-xl border border-slate-300 bg-white pl-12 pr-4 text-sm font-medium text-slate-950 shadow-sm outline-none transition hover:border-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-500/20" placeholder="admin@kiniedxhub.com" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="super-admin-password" className="mb-2 block text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-200">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                        <input id="super-admin-password" type={showPassword ? "text" : "password"} minLength={8} required autoComplete="current-password" value={form.password} onChange={(event) => setForm((value) => ({ ...value, password: event.target.value }))} className="h-[52px] w-full rounded-xl border border-slate-300 bg-white pl-12 pr-12 text-sm font-medium text-slate-950 shadow-sm outline-none transition hover:border-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-500/20" placeholder="Enter your password" />
                        <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button>
                      </div>
                    </div>

                    <div className="-mt-1.5 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setAuthView("recovery")}
                        aria-label="Forgot password?"
                        className="rounded text-sm font-semibold text-blue-600 transition hover:text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-cyan-400 dark:hover:text-cyan-300"
                      >
                        Forgot Password?
                      </button>
                    </div>

                    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300"><input type="checkbox" checked={form.rememberMe} onChange={(event) => setForm((value) => ({ ...value, rememberMe: event.target.checked }))} className="h-4 w-4 rounded border-slate-400 accent-blue-600" />Remember me for 30 days</label>

                    <button type="submit" disabled={isLoading} className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(15,85,247,.25)] transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50">
                      {isLoading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />Signing in...</> : <>Sign in<ArrowRight size={16} /></>}
                    </button>
                  </form>

                  <div className="relative my-5"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-800" /></div><div className="relative flex justify-center"><span className="bg-white px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:bg-slate-900">Other portals</span></div></div>

                  <Link to={ROUTES.AUTH.LOGIN} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"><Building2 size={16} />Student, Employee or Organization Login</Link>
                </motion.div>
              ) : (
                <motion.div
                  key="recovery"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.16 }}
                >
                  <SuperAdminPasswordRecovery onBackToSignIn={() => setAuthView("signin")} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </section>
      </div>
    </main>
  );
};

export default SuperAdminLogin;
