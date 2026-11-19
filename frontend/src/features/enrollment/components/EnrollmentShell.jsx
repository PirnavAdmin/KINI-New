import { useThemeContext } from "@shared/context/ThemeContext";
import EnrollmentNavbar from "./EnrollmentNavbar";
import EnrollmentFooter from "./EnrollmentFooter";

/** Page frame shared by the public enrollment payment/status/access pages. */
export default function EnrollmentShell({ children, width = "max-w-6xl" }) {
  const { isDark } = useThemeContext();
  return (
    <div
      className="flex min-h-screen flex-col bg-[#F3F7FB] text-slate-900 dark:bg-[#050816] dark:text-slate-100"
      style={{ fontFamily: "'Sora', sans-serif" }}
    >
      <EnrollmentNavbar />
      <main className={`relative mx-auto w-full ${width} flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8`}>
        {children}
      </main>
      <EnrollmentFooter isDark={isDark} />
    </div>
  );
}

/** Card surface used across the enrollment pages. */
export function EnrollmentCard({ className = "", children, ...props }) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-slate-900/70 ${className}`.trim()}
      {...props}
    >
      {children}
    </section>
  );
}

const NOTICE = {
  info: "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-100",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100",
  warning: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100",
  error: "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100",
};

export function EnrollmentNotice({ tone = "info", icon: Icon, title, children, action }) {
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`flex gap-3 rounded-xl border p-4 text-sm ${NOTICE[tone]}`}>
      {Icon && <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />}
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? "mt-1 opacity-90" : ""}>{children}</div>}
        {action && <div className="mt-3">{action}</div>}
      </div>
    </div>
  );
}
