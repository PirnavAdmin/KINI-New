import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Select from "react-select";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Award, CheckCircle2, Loader2, Star, Users, X } from "lucide-react";
import { useThemeContext } from "@landing-shared/context/ThemeContext"; // adjust path if needed

// ─── Schema ───────────────────────────────────────────────────────────────────

const SUBJECT_OPTIONS = [
  { value: "career_counselling", label: "Career Counselling" },
  { value: "course_roadmap", label: "Course Roadmap" },
  { value: "scholarship", label: "Scholarship Information" },
  { value: "placement", label: "Placement Guidance" },
  { value: "other", label: "Other" },
];

const getInTouchSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name must be under 60 characters")
    .regex(/^[A-Za-z\s'\-\.]+$/, {
      message: "Name can only contain letters, spaces, hyphens, periods, or apostrophes"
    })
    .refine((val) => /[A-Za-z]/.test(val), {
      message: "Name must contain at least one letter"
    }),

  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address (e.g. you@example.com)"),

  mobileNumber: z
    .string()
    .trim()
    .min(1, "Mobile number is required")
    .regex(/^\d{10}$/, "Enter exactly 10 digits")
    .refine(
      (val) => /^[6-9]\d{9}$/.test(val),
      "Mobile number must start with 6, 7, 8, or 9"
    ),

  subject: z.string().optional(),

  message: z
    .string()
    .trim()
    .min(20, "Message must be at least 20 characters")
    .max(500, "Message must be under 500 characters"),
});

const defaultValues = {
  name: "",
  email: "",
  mobileNumber: "",
  subject: "",
  message: "",
};

// ─── Static data ─────────────────────────────────────────────────────────────

const benefits = [
  "Free Career Counselling",
  "Personalized Course Roadmap",
  "Scholarship Information",
  "Placement Guidance",
];

// ✅ Updated trust stats – removed "500+ Hiring Partners"
const trustStats = [
  { icon: Users, value: "10,000+", label: "Students Trained" },
  { icon: Award, value: "2,200+", label: "Successful Placements" },
  { icon: Star, value: "50+", label: "Mentors" },
];

// Left-panel background. No shared gradient token was available in this
// file, so this is a brand-consistent navy gradient placeholder — swap in
// the real design-token value if one already exists elsewhere in the app.
const GRADIENT = "linear-gradient(135deg, #0D2C47 0%, #133B5D 55%, #1B4C74 100%)";

// ─── Animation variants ─────────────────────────────────────────────────────

const EASE_PREMIUM = [0.25, 0.1, 0.25, 1];

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.35, ease: EASE_PREMIUM } },
  exit: { opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.2, ease: EASE_PREMIUM } },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-xs font-medium text-red-400">
      {message}
    </p>
  );
}

function useFocusTrap(active) {
  const ref = useRef(null);
  useEffect(() => {
    if (!active || !ref.current) return;
    const el = ref.current;
    const focusable = el.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();
    const trap = (e) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
        e.preventDefault();
        (e.shiftKey ? last : first)?.focus();
      }
    };
    el.addEventListener("keydown", trap);
    return () => el.removeEventListener("keydown", trap);
  }, [active]);
  return ref;
}

async function submitGetInTouch(values) {
  await new Promise((r) => setTimeout(r, 1200));
  console.log("Submitted:", values);
}

// ─── Primary button (solid orange + navy text) ──────────────────────────

function GradientButton({ children, disabled, type = "button", onClick, className = "" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`relative flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold bg-secondary-500 text-primary-700 border border-secondary-500 transition-all duration-300 hover:bg-secondary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-secondary-500 ${className}`}
    >
      {children}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────

export default function GetInTouchModal({ isOpen, onClose, onSubmitted, isDark: propIsDark }) {
  const { isDark: contextIsDark } = useThemeContext();
  const isDark = propIsDark !== undefined ? propIsDark : contextIsDark;

  const [status, setStatus] = useState("idle");
  // Tracked so Escape closes just the Subject dropdown, not the whole modal.
  const [subjectMenuOpen, setSubjectMenuOpen] = useState(false);
  // The modal's own scrollable content area — used to tell "the modal
  // scrolled" apart from "the open Subject menu's own option list scrolled".
  const scrollAreaRef = useRef(null);
  const previousFocusRef = useRef(null);
  const focusTrapRef = useFocusTrap(isOpen);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(getInTouchSchema),
    defaultValues,
    mode: "onBlur",
  });

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const submitValues = useCallback(
    async (values) => {
      setStatus("submitting");
      try {
        await submitGetInTouch(values);
        setStatus("success");
        toast.success("Thank you! Our team will reach out shortly.");
        window.setTimeout(() => {
          onSubmitted?.();
          reset();
          setStatus("idle");
        }, 1800);
      } catch {
        setStatus("error");
        toast.error("Something went wrong. Please try again.");
      }
    },
    [onSubmitted, reset]
  );

  const onSubmit = handleSubmit(submitValues);
  const handleRetry = useCallback(() => submitValues(getValues()), [getValues, submitValues]);

  // Body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Focus save / restore
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
    } else if (previousFocusRef.current?.focus) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen]);

  // ESC closes
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, handleClose]);

  useEffect(() => {
    if (isOpen) setStatus("idle");
  }, [isOpen]);

  // ── Styles ──────────────────────────────────────────────────────────────────

  const inputBase =
    "w-full min-w-0 rounded-xl border px-3.5 py-2 text-sm outline-none transition-colors focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20";

  // 44px+ tap target on mobile; textarea uses min-h instead so `rows` still works.
  const controlHeight = "h-10 sm:h-11";

  const inputTheme = (hasError) =>
    hasError
      ? "border-red-400 bg-red-500/5"
      : isDark
      ? "border-white/10 bg-white/5 text-white placeholder:text-slate-500"
      : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400";

  const inputClass = (hasError) => `${inputBase} ${inputTheme(hasError)}`;

  const labelClass = `mb-1 block text-xs font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`;

  // react-select in `unstyled` mode ships no CSS of its own, so every part
  // needs an explicit class here — kept in the modal's own slate/sky
  // palette rather than react-select defaults or another component's theme.
  const selectClassNames = {
    container: () => "w-full min-w-0 max-w-full",
    control: (state) =>
      `flex w-full min-w-0 min-h-10 items-center gap-1 rounded-xl border px-3.5 text-sm outline-none transition-colors sm:min-h-11 ${
        state.isFocused
          ? "border-sky-500 ring-2 ring-sky-500/20"
          : isDark
          ? "border-white/10 bg-white/5"
          : "border-slate-200 bg-white"
      }`,
    placeholder: () => `text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`,
    singleValue: () => `text-sm ${isDark ? "text-white" : "text-slate-900"}`,
    input: () => `text-sm ${isDark ? "text-white" : "text-slate-900"}`,
    valueContainer: () => "gap-1 py-2",
    indicatorsContainer: () => "gap-1",
    dropdownIndicator: () => `${isDark ? "text-slate-400 hover:text-slate-300" : "text-slate-400 hover:text-slate-500"}`,
    clearIndicator: () => `${isDark ? "text-slate-400 hover:text-slate-300" : "text-slate-400 hover:text-slate-500"}`,
    indicatorSeparator: () => "hidden",
    menu: () =>
      `mt-1 w-full min-w-0 max-w-full overflow-hidden rounded-xl border shadow-2xl ${
        isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
      }`,
    menuList: () => "max-h-56 overflow-y-auto py-1",
    option: (state) =>
      `cursor-pointer break-words px-3.5 py-2.5 text-sm ${
        state.isSelected
          ? "bg-primary-500/10 font-semibold text-primary-500"
          : state.isFocused
          ? isDark
            ? "bg-white/10 text-white"
            : "bg-slate-100 text-slate-900"
          : isDark
          ? "text-white/80"
          : "text-slate-700"
      }`,
    noOptionsMessage: () => `px-3.5 py-3 text-center text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`,
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop – adapt to theme */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.25 }}
            className={`absolute inset-0 ${isDark ? "bg-slate-950/75" : "bg-slate-900/40"} backdrop-blur-sm`}
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            ref={focusTrapRef}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby="git-heading"
            className={`relative z-10 w-full max-w-[700px] max-h-[calc(100dvh-24px)] overflow-hidden rounded-3xl shadow-2xl ${isDark ? "bg-slate-900 text-white" : "bg-white text-slate-900"}`}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close dialog"
              className={`
                absolute right-3 top-3 z-20
                flex h-10 w-10 items-center justify-center rounded-full transition-colors sm:h-8 sm:w-8
                ${isDark ? "bg-white/10 text-white hover:bg-white/20" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}
              `}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            {/* Single scroll area for the whole modal body, so the page
                behind stays locked while this scrolls independently. */}
            <div ref={scrollAreaRef} className="grid max-h-[calc(100dvh-24px)] grid-cols-1 overflow-y-auto sm:grid-cols-[0.85fr_1.15fr]">

            {/* ── LEFT panel ── */}
            <div
              className="relative overflow-hidden p-4 text-white sm:p-5"
              style={{ background: GRADIENT }}
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
              <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-black/10 blur-2xl" aria-hidden="true" />

              <div className="relative">
                <h2 id="git-heading" className="pr-10 text-lg font-extrabold leading-tight sm:pr-0 sm:text-xl">
                  🚀 Ready to Start Your Tech Career?
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-white/85">
                  Speak with our career experts and receive personalized guidance.
                </p>

                <ul className="mt-3 space-y-1.5">
                  {benefits.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm font-medium">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                      <span className="min-w-0 break-words">{b}</span>
                    </li>
                  ))}
                </ul>

                {/* ── Updated trust stats ── */}
                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/20 pt-2.5 sm:gap-4">
                  {trustStats.map(({ icon: Icon, value, label }) => (
                    <div key={label} className="min-w-0 text-center">
                      <Icon className="mx-auto h-3.5 w-3.5 text-white/80" aria-hidden="true" />
                      <p className="mt-1 text-sm font-extrabold">{value}</p>
                      <p className="text-[11px] text-white/70 sm:text-xs">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT panel ── */}
            <div className="p-4 sm:p-5">
              {status === "success" ? (
                <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15"
                  >
                    <CheckCircle2 className="h-9 w-9 text-emerald-400" aria-hidden="true" />
                  </motion.div>
                  <h3 className={`mt-4 text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                    Thank you!
                  </h3>
                  <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Our team will reach out shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={onSubmit} noValidate>
                  <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                    Get In Touch
                  </h3>

                  <div className="mt-2.5 space-y-2">
                    {/* Full Name */}
                    <div>
                      <label htmlFor="git-name" className={labelClass}>
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="git-name"
                        type="text"
                        autoComplete="name"
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? "git-name-err" : undefined}
                        className={`${inputClass(!!errors.name)} ${controlHeight}`}
                        placeholder="Your full name"
                        {...register("name")}
                      />
                      <FieldError id="git-name-err" message={errors.name?.message} />
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="git-email" className={labelClass}>
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="git-email"
                        type="email"
                        autoComplete="email"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "git-email-err" : undefined}
                        className={`${inputClass(!!errors.email)} ${controlHeight}`}
                        placeholder="you@example.com"
                        {...register("email")}
                      />
                      <FieldError id="git-email-err" message={errors.email?.message} />
                    </div>

                    {/* Mobile */}
                    <div>
                      <label htmlFor="git-mobile" className={labelClass}>
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="git-mobile"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        autoComplete="tel"
                        aria-invalid={!!errors.mobileNumber}
                        aria-describedby={errors.mobileNumber ? "git-mobile-err" : undefined}
                        className={`${inputClass(!!errors.mobileNumber)} ${controlHeight}`}
                        placeholder="10-digit mobile number"
                        onKeyDown={(e) => {
                          const allowed = ["Backspace","Delete","Tab","ArrowLeft","ArrowRight","Home","End"];
                          if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) e.preventDefault();
                        }}
                        {...register("mobileNumber")}
                      />
                      <FieldError id="git-mobile-err" message={errors.mobileNumber?.message} />
                    </div>

                    {/* Subject */}
                    <div
                      className="relative"
                      onKeyDown={(e) => {
                        // Let react-select close its own menu on Escape without
                        // also bubbling to the modal's window-level Escape handler.
                        if (e.key === "Escape" && subjectMenuOpen) e.stopPropagation();
                      }}
                    >
                      <label htmlFor="git-subject" className={labelClass}>
                        Subject
                      </label>
                      <Controller
                        name="subject"
                        control={control}
                        render={({ field }) => (
                          <Select
                            inputId="git-subject"
                            instanceId="git-subject"
                            unstyled
                            isClearable
                            classNames={selectClassNames}
                            options={SUBJECT_OPTIONS}
                            placeholder="Select a subject"
                            value={SUBJECT_OPTIONS.find((o) => o.value === field.value) ?? null}
                            onChange={(option) => field.onChange(option ? option.value : "")}
                            onBlur={field.onBlur}
                            onMenuOpen={() => setSubjectMenuOpen(true)}
                            onMenuClose={() => setSubjectMenuOpen(false)}
                            menuPlacement="auto"
                            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                            menuPosition="fixed"
                            // Portalled + fixed-position menu can't track the field while
                            // the modal's own inner container scrolls, so close instead
                            // of leaving it stranded over other fields. Scoped to that
                            // container specifically so scrolling the menu's own option
                            // list (which also has its own scroll area) doesn't close it.
                            closeMenuOnScroll={(e) => e.target === scrollAreaRef.current}
                            styles={{ menuPortal: (base) => ({ ...base, zIndex: 10050 }) }}
                          />
                        )}
                      />
                      <FieldError id="git-subject-err" message={errors.subject?.message} />
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="git-message" className={labelClass}>
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="git-message"
                        rows={2}
                        aria-invalid={!!errors.message}
                        aria-describedby={errors.message ? "git-message-err" : undefined}
                        className={`${inputClass(!!errors.message)} min-h-[64px] resize-none sm:min-h-[72px]`}
                        placeholder="Tell us what you're looking for (min. 20 characters)"
                        {...register("message")}
                      />
                      <FieldError id="git-message-err" message={errors.message?.message} />
                    </div>

                    {status === "error" && (
                      <div
                        role="alert"
                        className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs font-medium text-red-400"
                      >
                        <p>We couldn&apos;t submit your request. Please try again.</p>
                        <button
                          type="button"
                          onClick={handleRetry}
                          className="mt-1.5 font-bold underline underline-offset-2"
                        >
                          Retry
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <GradientButton
                      type="submit"
                      disabled={isSubmitting || status === "submitting"}
                      className="flex-1"
                    >
                      {status === "submitting" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                          Sending…
                        </>
                      ) : (
                        "Submit"
                      )}
                    </GradientButton>

                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={status === "submitting"}
                      className="flex-1 rounded-xl px-5 py-2.5 text-sm font-semibold bg-primary-700 text-secondary-500 border border-secondary-500 transition-all duration-300 hover:bg-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 sm:flex-none"
                    >
                      Maybe Later
                    </button>
                  </div>
                </form>
              )}
            </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}