import { useNavigate } from "react-router-dom";
import { X, Sun, Moon } from "lucide-react";
import { useThemeContext } from "@shared/context/ThemeContext";
import AuthHero from "../components/AuthHero";
import { StudentRegistrationForm } from "../components/RegistrationForm";

export default function Register() {
  const { isDark, toggle: toggleTheme } = useThemeContext();
  const navigate = useNavigate();
  const handleClose = () => navigate("/");

  return (
    <div
      className="register-page relative flex min-h-screen items-center justify-center overflow-x-hidden overflow-y-auto p-3 transition-colors duration-300 sm:p-4 lg:p-3"
      style={{
        background: isDark
          ? "#08031f"
          : "radial-gradient(circle at 8% 20%, rgba(15,85,247,.10), transparent 26%), linear-gradient(135deg, #07152f 0%, #14052f 100%)",
      }}
      data-lenis-prevent
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="pointer-events-none absolute left-[6%] top-[42%] h-2 w-2 rounded-full bg-[#0f55f7] blur-[1px]" />
      <div className="pointer-events-none absolute right-[9%] top-[35%] h-2 w-2 rounded-full bg-[#0f55f7] blur-[1px]" />
      <div className="pointer-events-none absolute right-[28%] top-[3%] h-2 w-2 rounded-full bg-[#0f55f7]/70 blur-[2px]" />

      {/* Two-column card */}
      <div
        className="register-shell relative grid w-full min-w-0 grid-cols-[minmax(0,1fr)] overflow-hidden rounded-[24px] border border-white/70 bg-white shadow-2xl sm:rounded-[28px] lg:h-[min(650px,calc(100dvh-120px))] lg:min-h-0 lg:grid-cols-[42%_58%] lg:grid-rows-1"
        style={{
          maxWidth: 1560,
          boxShadow: "0 34px 90px rgba(0,0,0,.38), 0 0 0 1px rgba(255,255,255,.35)",
        }}
      >
        <div className="register-actions absolute right-4 top-4 z-30 flex items-center gap-2 sm:right-8 sm:top-8 sm:gap-3">
          <button
            onClick={toggleTheme}
            className="register-action flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:h-12 sm:w-12 sm:rounded-2xl"
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          >
            {isDark ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            onClick={handleClose}
            aria-label="Close registration"
            className="register-action flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 shadow-sm transition-all hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:h-12 sm:w-12 sm:rounded-2xl"
          >
            <X size={22} />
          </button>
        </div>
        <div className="hidden min-w-0 lg:block">
          <AuthHero />
        </div>

        {/* Right panel — Form */}
        <div
          className="register-panel flex h-full min-h-0 min-w-0 justify-center overflow-hidden px-4 py-4 pt-14 sm:px-6 sm:py-6 sm:pt-[4rem] md:px-8 md:py-8 lg:px-6 lg:py-4"
          style={{ background: "#ffffff" }}
        >
          <div className="flex min-h-0 min-w-0 w-full flex-col" style={{ maxWidth: 580, gap: 8 }}>
            <div className="register-scroll flex min-h-0 flex-1 items-start justify-center overflow-y-auto overscroll-contain py-0 lg:items-center">
              <StudentRegistrationForm isDark={isDark} onBack={() => navigate("/")} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
