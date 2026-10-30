import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, ChevronDown, GraduationCap, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import ModalOverlay from "@landing-shared/components/ModalOverlay";
import { useThemeContext } from "@landing-shared/context/ThemeContext";
import { registerDefaultValues, registerSchema } from "@landing-shared/schemas/registerSchema";
import {
  getRegisterFieldErrors,
  registerErrorMessage,
  submitRegister,
} from "@landing-shared/services/registerService";
import Button from "@landing-shared/components/ui/Button";

// TODO: replace with your real programs list/data source (e.g. an import from
// a shared courses/programs data file) — this is a placeholder so the dropdown
// works immediately. Only used when the modal opens without a pre-selected
// `course` (i.e. from a generic "Register" button rather than a course's
// "Enroll" button).
const PROGRAM_OPTIONS = [
  "Full-Stack Web Masterclass",
  "MERN Stack Development",
  "Full Stack .NET Development",
  "React JS Developer",
  "AI & Generative AI Engineering",
  "Data Science",
  "UI/UX Design",
  "Digital Marketing Strategy",
];

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-0.5 text-[11px] font-medium text-rose-500 animate-fadeIn">
      {message}
    </p>
  );
}

export default function RegisterModal({ isOpen, onClose, course, onSuccess }) {
  const { isDark } = useThemeContext();
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: registerDefaultValues,
    mode: "onBlur",
  });

  const submitValues = useCallback(
    async (values) => {
      // Read the program selection straight from RHF's live form state rather
      // than `values` — `values` has already been through zodResolver, and
      // Zod's default behavior for z.object({...}) is to silently strip any
      // key not declared in the schema. Since registerSchema doesn't (yet)
      // know about `program`, `values.program` would be undefined here even
      // when the user picked one correctly. `getValues()` isn't affected by
      // that stripping, since it reads the raw uncontrolled-input state.
      const selectedProgram = course?.title ?? getValues("program");

      if (!selectedProgram) {
        setError("program", { type: "manual", message: "Please select a program to continue." });
        return;
      }
      clearErrors("program");

      setStatus("submitting");
      setErrorMessage("");
      try {
        await submitRegister({ ...values, program: selectedProgram });
        setStatus("success");
        toast.success("Registration completed successfully.");
        if (onSuccess) {
          onSuccess();
          reset();
          setStatus("idle");
        } else {
          window.setTimeout(() => {
            onClose?.();
            reset();
            setStatus("idle");
          }, 1500);
        }
      } catch (error) {
        // Entered values stay in the form so the user can correct and retry.
        Object.entries(getRegisterFieldErrors(error)).forEach(([field, message]) =>
          setError(field, { type: "server", message }),
        );
        const message = registerErrorMessage(error);
        setErrorMessage(message);
        setStatus("error");
        toast.error(message);
      }
    },
    [course, onClose, onSuccess, reset, setError, clearErrors, getValues],
  );

  const onSubmit = handleSubmit(submitValues);
  const handleRetry = useCallback(() => {
    if (status !== "submitting") onSubmit();
  }, [onSubmit, status]);
  const programField = register("program");

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) setStatus("idle");
  }, [isOpen]);

  const inputClass = (hasError) =>
    `w-full rounded-lg border px-3 py-2 text-xs outline-none transition-all duration-200 shadow-sm ${
      hasError
        ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10"
        : isDark
          ? "border-slate-800 bg-slate-900/50 text-white placeholder:text-slate-500 focus:border-slate-600 focus:bg-slate-900/80 focus:ring-2 focus:ring-slate-700/20"
          : "border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
    }`;

  return (
    <ModalOverlay isOpen={isOpen} onClose={handleClose} labelledBy="register-modal-heading">
      <div className={`relative overflow-hidden rounded-xl ${isDark ? "text-slate-100" : "text-slate-900"}`}>
        {/* Subtle decorative gradient background flare */}
        <div className="absolute -right-20 -top-20 h-32 w-32 rounded-full bg-slate-500/10 blur-2xl pointer-events-none" />

        {status === "success" ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center text-center p-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-inner">
              <CheckCircle2 className="h-7 w-7 text-emerald-500 animate-bounce" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-base font-bold tracking-tight">
              Registration completed successfully
            </h3>
            <p className={`mt-1 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              We&apos;re excited to have you on board. Redirecting shortly...
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="p-0.5">
            <div className="space-y-0.5">
              <h2 id="register-modal-heading" className="text-base font-bold tracking-tight">
                Create your account
              </h2>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Enter your details to get started with the program.
              </p>
            </div>

            {course ? (
              <div
                className={`mt-3.5 flex items-center gap-2.5 rounded-lg border px-3 py-2 shadow-sm ${
                  isDark 
                    ? "border-slate-700 bg-slate-900/60 text-slate-200" 
                    : "border-slate-200 bg-slate-100/70 text-slate-800"
                }`}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-800 text-slate-200 dark:bg-slate-800">
                  <GraduationCap className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">Selected Program</p>
                  <p className="text-[11px] font-bold leading-tight">{course.title}</p>
                </div>
              </div>
            ) : (
              <div className="mt-3.5">
                <label htmlFor="reg-program" className={`mb-1 block text-[11px] font-semibold tracking-wide ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Program <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="reg-program"
                    required
                    defaultValue=""
                    aria-invalid={!!errors.program}
                    aria-describedby={errors.program ? "reg-program-error" : undefined}
                    className={`${inputClass(!!errors.program)} appearance-none pr-8`}
                    {...programField}
                    onChange={(event) => {
                      programField.onChange(event);
                      if (event.target.value) clearErrors("program");
                    }}
                  >
                    <option value="" disabled>
                      Select a program
                    </option>
                    {PROGRAM_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className={`pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 ${
                      isDark ? "text-slate-500" : "text-slate-400"
                    }`}
                    aria-hidden="true"
                  />
                </div>
                <FieldError id="reg-program-error" message={errors.program?.message} />
              </div>
            )}

            <div className="mt-4 space-y-3">
              <div>
                <label htmlFor="reg-name" className={`mb-1 block text-[11px] font-semibold tracking-wide ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="reg-name"
                  type="text"
                  autoComplete="name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "reg-name-error" : undefined}
                  className={inputClass(!!errors.name)}
                  placeholder="Alex Johnson"
                  {...register("name")}
                />
                <FieldError id="reg-name-error" message={errors.name?.message} />
              </div>

              <div>
                <label htmlFor="reg-email" className={`mb-1 block text-[11px] font-semibold tracking-wide ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "reg-email-error" : undefined}
                  className={inputClass(!!errors.email)}
                  placeholder="alex@company.com"
                  {...register("email")}
                />
                <FieldError id="reg-email-error" message={errors.email?.message} />
              </div>

              <div>
                <label htmlFor="reg-mobile" className={`mb-1 block text-[11px] font-semibold tracking-wide ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <input
                  id="reg-mobile"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  autoComplete="tel"
                  aria-invalid={!!errors.mobileNumber}
                  aria-describedby={errors.mobileNumber ? "reg-mobile-error" : undefined}
                  className={inputClass(!!errors.mobileNumber)}
                  placeholder="9876543210"
                  {...register("mobileNumber")}
                />
                <FieldError id="reg-mobile-error" message={errors.mobileNumber?.message} />
              </div>

              <div>
                <label htmlFor="reg-qualification" className={`mb-1 block text-[11px] font-semibold tracking-wide ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Degree Details <span className="text-rose-500">*</span>
                </label>
                <input
                  id="reg-qualification"
                  type="text"
                  aria-invalid={!!errors.qualification}
                  aria-describedby={errors.qualification ? "reg-qualification-error" : undefined}
                  className={inputClass(!!errors.qualification)}
                  placeholder="B.Tech Computer Science, 2024"
                  {...register("qualification")}
                />
                <FieldError id="reg-qualification-error" message={errors.qualification?.message} />
              </div>

              {status === "error" && (
                <div role="alert" className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3.5 py-2 text-[11px] font-medium text-rose-500 animate-fadeIn">
                  <p>{errorMessage || "We couldn't submit your registration."}</p>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="mt-0.5 font-bold underline underline-offset-2 hover:opacity-85"
                  >
                    Try again
                  </button>
                </div>
              )}
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isSubmitting || status === "submitting"}
              className="mt-5 w-full rounded-lg py-2.5 text-xs font-semibold tracking-wide disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {status === "submitting" ? (
                <span className="flex items-center justify-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  Creating account...
                </span>
              ) : (
                "Complete Registration"
              )}
            </Button>
          </form>
        )}
      </div>
    </ModalOverlay>
  );
}