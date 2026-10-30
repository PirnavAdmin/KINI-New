import PropTypes from "prop-types";
import { ArrowLeft, Moon, Sun, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useThemeContext } from "@shared/context/ThemeContext";
const KiniLogo = "/assets/new-logo-f.jpg.jpeg";
import AuthHero from "./AuthHero";

export default function RecoveryShell({
  step,
  eyebrow,
  title,
  description,
  icon: Icon,
  backTo,
  backLabel = "Back",
  backState,
  children,
  footer,
}) {
  const navigate = useNavigate();
  const { isDark, toggle: toggleTheme } = useThemeContext();

  return (
    <main className={`recovery-page fixed inset-0 flex h-dvh items-center justify-center overflow-hidden p-3 transition-colors sm:p-5 ${
      isDark ? "bg-slate-950" : "bg-slate-100"
    }`}>
      <div className="mx-auto grid h-auto max-h-full min-h-0 w-full max-w-[560px] overflow-hidden rounded-3xl border border-indigo-200/80 bg-[#070b35] shadow-[0_28px_70px_-28px_rgba(15,23,42,0.42)] lg:h-full lg:max-h-[700px] lg:max-w-[1120px] lg:grid-cols-[50%_50%]">
        <div className="hidden min-h-0 overflow-hidden lg:block">
          <AuthHero />
        </div>

        <section className={`relative flex min-h-0 flex-col overflow-hidden ${
          isDark ? "bg-slate-900" : "bg-white"
        }`}>
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.08),transparent_34%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.08),transparent_34%)]" />

          <div className="absolute right-4 top-4 z-20 flex gap-2 sm:right-5 sm:top-5">
            <button
              type="button"
              onClick={toggleTheme}
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white/90 text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-950/90 dark:text-amber-400 dark:hover:bg-slate-800"
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white/90 text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-950/90 dark:text-slate-400 dark:hover:bg-slate-800"
              aria-label="Close password recovery"
            >
              <X size={17} />
            </button>
          </div>

          <div className="relative z-10 mx-auto flex h-full min-h-0 w-full max-w-[450px] flex-col px-5 py-5 sm:px-6 sm:py-5">
            <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <div className="flex min-h-full flex-col justify-center py-2">
                <div className="brand-logo-viewport mb-2 flex h-10 w-[180px] items-center justify-center">
                  <img
                    src={KiniLogo}
                    alt="Kini — Learn. Innovate. Lead."
                    className="brand-logo-image"
                  />
                </div>

                <button
              type="button"
              onClick={() => navigate(backTo, { state: backState })}
              className="mb-2.5 flex w-fit items-center gap-2 rounded-lg text-sm font-semibold text-slate-500 transition hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-400 dark:hover:text-cyan-400"
            >
              <ArrowLeft size={16} />
              {backLabel}
                </button>

                {step && <div className="mb-3.5 grid grid-cols-3 gap-3" aria-label={`Password recovery step ${step} of 3`}>
              {[1, 2, 3].map((item) => (
                <span
                  key={item}
                  className={`h-1.5 rounded-full transition-colors ${
                    item < step
                      ? "bg-emerald-500"
                      : item === step
                        ? "bg-blue-600"
                        : "bg-slate-200 dark:bg-slate-700"
                  }`}
                />
              ))}
                </div>}

                <header className="mb-3">
              <div className="mb-2 grid h-10 w-10 place-items-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 shadow-sm shadow-blue-500/10 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-cyan-400">
                <Icon size={19} strokeWidth={2} />
              </div>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-blue-600 dark:text-cyan-400">
                {eyebrow}
              </p>
              <h1 className="text-2xl font-extrabold leading-tight tracking-[-0.035em] text-slate-950 dark:text-white sm:text-[1.65rem]">
                {title}
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-5 text-slate-500 dark:text-slate-400">
                {description}
              </p>
                </header>

                {children}

                {footer && (
                  <div className="mt-6 shrink-0 border-t border-slate-200 pt-4 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    {footer}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

RecoveryShell.propTypes = {
  // Omit for a single-step page (e.g. account activation) to hide the recovery progress bar.
  step: PropTypes.oneOf([1, 2, 3]),
  eyebrow: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.node.isRequired,
  icon: PropTypes.elementType.isRequired,
  backTo: PropTypes.string.isRequired,
  backLabel: PropTypes.string,
  backState: PropTypes.object,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
};
