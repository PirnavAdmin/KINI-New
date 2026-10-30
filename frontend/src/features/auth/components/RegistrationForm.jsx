import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  AlertCircle,
  Building2,
  CheckCircle,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  Phone,
  Smartphone,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "@shared/constants/routeConstants";
import authService from "@shared/services/authService";

const OTP_LENGTH = 6;
const RESEND_DELAY = 60;

const ROLE_OPTIONS = [
  { value: "Student", label: "Student" },
  { value: "Employee", label: "Employee" },
  { value: "Mentor", label: "Mentor" },
  { value: "Organization", label: "Organization" },
];

const PASSWORD_REQUIREMENTS = [
  { id: "min", label: "At least 8 characters", test: (value) => value.length >= 8 },
  { id: "upper", label: "One uppercase letter", test: (value) => /[A-Z]/.test(value) },
  { id: "lower", label: "One lowercase letter", test: (value) => /[a-z]/.test(value) },
  { id: "number", label: "One number", test: (value) => /[0-9]/.test(value) },
  { id: "special", label: "One special character", test: (value) => /[^A-Za-z0-9]/.test(value) },
];

const registrationSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "First name is required")
      .max(50, "First name is too long")
      .regex(/^[a-zA-Z\s'-]+$/, "First name must contain letters only"),
    lastName: z
      .string()
      .trim()
      .min(1, "Last name is required")
      .max(50, "Last name is too long")
      .regex(/^[a-zA-Z\s'-]+$/, "Last name must contain letters only"),
    phone: z
      .string()
      .trim()
      .min(1, "Phone is required")
      .regex(/^\d{10}$/, "Phone must contain exactly 10 digits."),
    email: z.string().trim().toLowerCase().min(1, "Email is required").email("Enter a valid email address"),
    role: z.enum(["Student", "Employee", "Mentor", "Organization"], {
      errorMap: () => ({ message: "Role is required" }),
    }),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms and conditions" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 2) return { label: "Weak", color: "#EF4444", width: "25%" };
  if (score <= 4) return { label: "Medium", color: "#F59E0B", width: "50%" };
  if (score <= 5) return { label: "Strong", color: "#10B981", width: "75%" };
  return { label: "Very Strong", color: "#10B981", width: "100%" };
}

function getBackendMessage(error) {
  const data = error?.response?.data;
  const candidates = [
    typeof data === "string" ? data : "",
    data?.message,
    data?.Message,
    data?.error,
    data?.Error,
    data?.title,
    data?.Title,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  if (data?.errors && typeof data.errors === "object") {
    for (const value of Object.values(data.errors)) {
      const values = Array.isArray(value) ? value : [value];
      for (const item of values) {
        if (typeof item === "string" && item.trim()) {
          return item.trim();
        }
      }
    }
  }

  return typeof error?.message === "string" && error.message.trim() ? error.message.trim() : "";
}

function FloatingInput({
  id,
  type = "text",
  label,
  register,
  error,
  icon: Icon,
  disabled,
  inputMode,
  maxLength,
  autoComplete,
  placeholder,
  onValueChange,
  onFieldBlur,
}) {
  const [focused, setFocused] = useState(false);
  const [showValue, setShowValue] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="registration-floating-input flex flex-col gap-1">
      {label && (
        <label
          htmlFor={id}
          className="text-[13px] font-semibold tracking-wide"
          style={{ color: error ? "#dc2626" : focused ? "#4338ca" : "#334155" }}
        >
          {label}
        </label>
      )}
      <div
        className="registration-input-shell flex items-center rounded-xl transition-all duration-150"
        style={{
          height: 46,
          border: `1.5px solid ${error ? "#dc2626" : focused ? "#4f46e5" : "#cbd5e1"}`,
          background: disabled ? "#f1f5f9" : "#fff",
          boxShadow: focused && !error
            ? "0 0 0 4px rgba(79,70,229,.13)"
            : error
              ? "0 0 0 4px rgba(220,38,38,.1)"
              : "0 2px 5px rgba(15,23,42,.05)",
        }}
      >
        {Icon && (
          <div className="pl-3.5 flex-shrink-0" style={{ color: error ? "#dc2626" : focused ? "#4f46e5" : "#64748b" }}>
            <Icon size={17} />
          </div>
        )}
        <input
          id={id}
          type={isPassword && showValue ? "text" : type}
          disabled={disabled}
          placeholder={placeholder || label}
          {...register(id, {
            onChange: onValueChange,
            onBlur: (event) => {
              setFocused(false);
              onFieldBlur?.(event);
            },
          })}
          onFocus={() => setFocused(true)}
          inputMode={inputMode}
          maxLength={maxLength}
          autoComplete={autoComplete || (isPassword ? "new-password" : id === "email" ? "email" : "off")}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="min-w-0 flex-1 bg-transparent text-[15px] font-medium outline-none placeholder:text-slate-400"
          style={{
            color: disabled ? "#64748b" : "#0f172a",
            fontFamily: "inherit",
            paddingLeft: Icon ? 8 : 14,
            paddingRight: isPassword ? 4 : 14,
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowValue((current) => !current)}
            className="mr-1.5 flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label={showValue ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          >
            {showValue ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            id={`${id}-error`}
            role="alert"
            className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-red-600"
          >
            <AlertCircle className="h-3 w-3 shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function AccountTypeSelector({ isDark, onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto w-full max-w-lg px-1 sm:px-2"
    >
      <div className="mb-7">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#6366f1" }}>
          Create Account
        </span>
        <h2 className="mt-2 text-[36px] font-extrabold tracking-[-.035em]" style={{ color: "#0f172a", lineHeight: 1.1 }}>
          Choose account type
        </h2>
        <p className="mt-3 text-sm font-medium" style={{ color: "#475569" }}>
          Select how you want to join Kini EduHub
        </p>
      </div>

      <button
        type="button"
        onClick={() => onSelect?.("student")}
        className={`mb-4 w-full rounded-xl border-2 p-5 text-left transition-all ${isDark ? "bg-white/[0.04] border-white/[0.08]" : "bg-white border-slate-300 shadow-md"}`}
      >
        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${isDark ? "bg-blue-500/20" : "bg-blue-100"}`}>
            <GraduationCap className={isDark ? "text-blue-400" : "text-blue-600"} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Student</h3>
            <p className={`mt-1 text-sm ${isDark ? "text-white/70" : "text-slate-600"}`}>Learn in-demand skills and earn certifications.</p>
          </div>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onSelect?.("organization")}
        className={`w-full rounded-xl border-2 p-5 text-left transition-all ${isDark ? "bg-white/[0.04] border-white/[0.08]" : "bg-white border-slate-300 shadow-md"}`}
      >
        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${isDark ? "bg-purple-500/20" : "bg-purple-100"}`}>
            <Building2 className={isDark ? "text-purple-400" : "text-purple-600"} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Organization</h3>
            <p className={`mt-1 text-sm ${isDark ? "text-white/70" : "text-slate-600"}`}>Manage employees, departments, and learning.</p>
          </div>
        </div>
      </button>

      <div className="mt-5 text-center text-sm" style={{ color: "#64748b" }}>
        Already have an account?{" "}
        <Link to={ROUTES.AUTH.LOGIN} className="font-semibold" style={{ color: "#6366f1" }}>
          Sign In
        </Link>
      </div>
    </motion.div>
  );
}

function StudentRegistrationForm({ isDark, onBack }) {
  const navigate = useNavigate();
  const location = useLocation();
  const otpInputsRef = useRef([]);
  const otpRequestInFlight = useRef(false);
  const otpVerificationInFlight = useRef(false);
  const registrationInFlight = useRef(false);

  const form = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      role: "Student",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
    mode: "onChange",
  });

  const {
    register: registerField,
    control,
    getValues,
    setValue,
    setError,
    trigger,
    formState: { errors, isValid },
  } = form;

  const emailValue = useWatch({ control, name: "email" });
  const passwordValue = useWatch({ control, name: "password" });
  const confirmPasswordValue = useWatch({ control, name: "confirmPassword" });

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpEmail, setOtpEmail] = useState("");

  const clearOtpFlow = () => {
    setOtp(Array(OTP_LENGTH).fill(""));
    setOtpSent(false);
    setOtpVerified(false);
    setCountdown(0);
    setOtpEmail("");
  };

  const trimField = (field) => (event) => {
    setValue(field, event.target.value.trim(), { shouldDirty: true, shouldValidate: true });
  };

  const handleNameChange = (field) => (event) => {
    const value = event.target.value.replace(/[0-9]/g, "");
    event.target.value = value;
    setValue(field, value, { shouldDirty: true, shouldValidate: true });
  };

  const handlePhoneChange = (event) => {
    const digitsOnly = event.target.value.replace(/\D/g, "").slice(0, 10);
    event.target.value = digitsOnly;
    setValue("phone", digitsOnly, { shouldDirty: true, shouldValidate: true });
  };

  const handleEmailChange = (event) => {
    const nextEmail = event.target.value.replace(/\s/g, "").toLowerCase();
    event.target.value = nextEmail;
    if (otpEmail && nextEmail !== otpEmail) {
      clearOtpFlow();
    }
    setValue("email", nextEmail, { shouldDirty: true, shouldValidate: true });
  };

  const normalizeEmail = (event) => {
    const nextEmail = event.target.value.trim().toLowerCase();
    setValue("email", nextEmail, { shouldDirty: true, shouldValidate: true });
  };

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < OTP_LENGTH - 1) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (event, index) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((digit, index) => {
      next[index] = digit;
    });
    setOtp(next);
    setTimeout(() => otpInputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus(), 0);
  };

  const handleSendOtp = async () => {
    if (otpRequestInFlight.current) return;

    const valid = await trigger(["firstName", "lastName", "phone", "email", "role", "password", "confirmPassword"]);
    if (!valid) return;

    const email = String(getValues("email") || "").trim().toLowerCase();
    setValue("email", email, { shouldDirty: true, shouldValidate: true });

    otpRequestInFlight.current = true;
    setSendingOtp(true);

    try {
      await authService.sendOtp({ identifier: email, otpType: "Email" });
      setOtp(Array(OTP_LENGTH).fill(""));
      setOtpSent(true);
      setOtpVerified(false);
      setOtpEmail(email);
      setCountdown(RESEND_DELAY);
      setTimeout(() => otpInputsRef.current[0]?.focus(), 0);
      toast.success("OTP sent successfully to your email.");
    } catch (error) {
      const message = getBackendMessage(error);
      if (message) toast.error(message);
    } finally {
      otpRequestInFlight.current = false;
      setSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (!otpSent || otpVerified || sendingOtp || otpRequestInFlight.current || countdown > 0) return;

    const email = otpEmail || String(getValues("email") || "").trim().toLowerCase();
    if (!email) return;

    otpRequestInFlight.current = true;
    setSendingOtp(true);
    setOtp(Array(OTP_LENGTH).fill(""));
    setOtpVerified(false);

    try {
      await authService.sendOtp({ identifier: email, otpType: "Email" });
      setOtpEmail(email);
      setCountdown(RESEND_DELAY);
      setTimeout(() => otpInputsRef.current[0]?.focus(), 0);
      toast.success("OTP sent successfully to your email.");
    } catch (error) {
      const message = getBackendMessage(error);
      if (message) toast.error(message);
    } finally {
      otpRequestInFlight.current = false;
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpVerificationInFlight.current) return;

    const code = otp.join("");
    if (!/^\d{6}$/.test(code)) {
      toast.error("Please enter the 6-digit OTP.");
      return;
    }

    const email = otpEmail || String(getValues("email") || "").trim().toLowerCase();
    if (!email) {
      toast.error("Email is required.");
      return;
    }

    otpVerificationInFlight.current = true;
    setVerifyingOtp(true);

    try {
      await authService.verifyOtp({ identifier: email, otpType: "Email", otp: code });
      setOtpVerified(true);
      setOtpSent(true);
      setCountdown(0);
      toast.success("Email verified successfully.");
    } catch (error) {
      setOtpVerified(false);
      setOtp(Array(OTP_LENGTH).fill(""));
      setTimeout(() => otpInputsRef.current[0]?.focus(), 0);
      const message = getBackendMessage(error);
      if (message) toast.error(message);
    } finally {
      otpVerificationInFlight.current = false;
      setVerifyingOtp(false);
    }
  };

  const mapRegisterErrors = (error) => {
    const errorsData = error?.response?.data?.errors;
    if (!errorsData || typeof errorsData !== "object") return false;

    const fieldMap = {
      firstname: "firstName",
      lastname: "lastName",
      phone: "phone",
      mobilenumber: "phone",
      email: "email",
      password: "password",
      confirmpassword: "confirmPassword",
      role: "role",
      acceptterms: "acceptTerms",
    };

    let mapped = false;
    Object.entries(errorsData).forEach(([field, value]) => {
      const normalizedField = String(field).replace(/[^a-z]/gi, "").toLowerCase();
      const formField = fieldMap[normalizedField];
      const values = Array.isArray(value) ? value : [value];
      const message = values.find((item) => typeof item === "string" && item.trim());
      if (formField && message) {
        setError(formField, { type: "server", message: message.trim() });
        mapped = true;
      }
    });

    return mapped;
  };

  const handleRegister = async () => {
    if (registrationInFlight.current) return;
    if (!otpVerified) {
      toast.error("Please verify your email OTP first.");
      return;
    }

    const valid = await trigger(["firstName", "lastName", "phone", "email", "role", "password", "confirmPassword", "acceptTerms"]);
    if (!valid) return;

    const values = getValues();
    const payload = {
      firstName: String(values.firstName || "").trim(),
      lastName: String(values.lastName || "").trim(),
      phone: String(values.phone || "").trim(),
      email: String(values.email || otpEmail || "").trim().toLowerCase(),
      password: values.password,
      confirmPassword: values.confirmPassword,
      role: values.role,
    };

    registrationInFlight.current = true;
    setRegistering(true);

    try {
      await authService.register(payload);
      toast.success("Registration completed successfully.");
      const requestedEnrollmentReturn = location.state?.enrollmentReturnTo;
      const enrollmentReturnTo = typeof requestedEnrollmentReturn === "string"
        && /^\/enrollment(?:[/?#]|$)/.test(requestedEnrollmentReturn)
        ? requestedEnrollmentReturn
        : null;
      navigate(ROUTES.AUTH.LOGIN, {
        replace: true,
        state: {
          registeredEmail: payload.email,
          registeredRole: values.role,
          successMessage: "Registration completed successfully.",
          ...(enrollmentReturnTo ? { enrollmentReturnTo } : {}),
        },
      });
    } catch (error) {
      mapRegisterErrors(error);
      const message = getBackendMessage(error);
      if (message) {
        toast.error(message);
      }
    } finally {
      registrationInFlight.current = false;
      setRegistering(false);
    }
  };

  useEffect(() => {
    if (countdown <= 0) return undefined;
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (!otpEmail || otpVerified) return undefined;
    const currentEmail = String(emailValue || "").trim().toLowerCase();
    if (currentEmail && currentEmail !== otpEmail) {
      const resetTimer = window.setTimeout(() => clearOtpFlow(), 0);
      return () => window.clearTimeout(resetTimer);
    }
    return undefined;
  }, [emailValue, otpEmail, otpVerified]);

  const passwordStrength = getPasswordStrength(passwordValue || "");
  const passwordsMatch = Boolean(confirmPasswordValue) && passwordValue === confirmPasswordValue;
  const canRegister = otpVerified && isValid;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto w-full max-w-lg px-1 sm:px-2"
    >
      <div className="mb-4">
        <button
          type="button"
          onClick={onBack}
          className={`mb-2 flex items-center gap-1.5 text-[11px] font-medium transition-colors ${
            isDark ? "text-white/70 hover:text-white" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <ArrowLeft className="h-3 w-3" />
          Back
        </button>

        <div className="mb-1.5 flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#6366f1" }}>
            Student Registration
          </span>
        </div>
        <h2 className="text-[30px] font-extrabold sm:text-[34px] lg:text-[36px]" style={{ color: "#0f172a", letterSpacing: "-.035em", lineHeight: 1.02, marginBottom: 6 }}>
          Create your account
        </h2>
        <p className="text-[13px] font-medium leading-5" style={{ color: "#475569" }}>
          Fill in your details, verify your email, then complete registration.
        </p>
      </div>

      <form className="space-y-3" noValidate onSubmit={(event) => event.preventDefault()}>
        <div className="space-y-2.5">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <FloatingInput
              id="firstName"
              label="First Name"
              register={registerField}
              error={errors.firstName?.message}
              icon={User}
              autoComplete="given-name"
              onValueChange={handleNameChange("firstName")}
              onFieldBlur={trimField("firstName")}
            />
            <FloatingInput
              id="lastName"
              label="Last Name"
              register={registerField}
              error={errors.lastName?.message}
              icon={User}
              autoComplete="family-name"
              onValueChange={handleNameChange("lastName")}
              onFieldBlur={trimField("lastName")}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="text-[13px] font-semibold tracking-wide" style={{ color: errors.email ? "#dc2626" : "#334155" }}>
              Email Address
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div
                className="registration-input-shell flex h-[44px] min-w-0 flex-1 items-center rounded-xl transition-all duration-150"
                style={{
                  border: `1.5px solid ${errors.email ? "#dc2626" : otpVerified ? "#10b981" : "#cbd5e1"}`,
                  background: otpVerified ? "#f0fdf4" : "#fff",
                  boxShadow: "0 2px 5px rgba(15,23,42,.05)",
                }}
              >
                <div className="pl-3.5 flex-shrink-0" style={{ color: errors.email ? "#dc2626" : otpVerified ? "#10b981" : "#64748b" }}>
                  <Mail size={17} />
                </div>
                <input
                  id="email"
                  type="email"
                  disabled={otpVerified}
                  placeholder="name@example.com"
                  {...registerField("email", {
                    onChange: handleEmailChange,
                    onBlur: normalizeEmail,
                  })}
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className="min-w-0 flex-1 bg-transparent px-2 text-[15px] font-medium outline-none placeholder:text-slate-400"
                  style={{
                    color: otpVerified ? "#047857" : "#0f172a",
                    fontFamily: "inherit",
                    paddingRight: 14,
                  }}
                />
                {otpVerified && (
                  <div className="mr-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                    <CheckCircle className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={sendingOtp || otpVerified}
                  className="registration-primary-button flex h-[44px] items-center justify-center gap-2 rounded-xl font-bold text-white transition-all duration-150 hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 active:scale-[.98] disabled:cursor-not-allowed disabled:scale-100 disabled:opacity-45"
                style={{
                  minWidth: 138,
                  border: "none",
                  background: "linear-gradient(135deg,#0f55f7,#2563eb 50%,#06b6a8)",
                  fontSize: 13,
                  letterSpacing: "-.01em",
                  boxShadow: "0 10px 20px rgba(15,85,247,.22)",
                }}
              >
                {sendingOtp ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send OTP"
                )}
              </button>
            </div>
            <AnimatePresence>
              {errors.email?.message && (
                <motion.p
                  initial={{ opacity: 0, y: -4, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -4, height: 0 }}
                  id="email-error"
                  role="alert"
                  className="flex items-center gap-1 text-[11px] font-semibold text-red-600"
                >
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  {errors.email.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <FloatingInput
              id="phone"
              type="tel"
              label="Phone"
              register={registerField}
              error={errors.phone?.message}
              icon={Phone}
              inputMode="numeric"
              maxLength={10}
              autoComplete="tel"
              placeholder="Enter 10-digit phone number"
              onValueChange={handlePhoneChange}
            />

            <div className="flex flex-col gap-1">
              <label htmlFor="role" className="text-[13px] font-semibold tracking-wide" style={{ color: errors.role ? "#dc2626" : "#334155" }}>
                Role
              </label>
              <div
                className="registration-input-shell flex h-[46px] items-center rounded-xl transition-all duration-150"
                style={{
                  border: `1.5px solid ${errors.role ? "#dc2626" : "#cbd5e1"}`,
                  background: "#fff",
                  boxShadow: "0 2px 5px rgba(15,23,42,.05)",
                }}
              >
                <select
                  id="role"
                  {...registerField("role")}
                  className="h-full w-full min-w-0 bg-transparent px-3.5 text-[15px] font-medium outline-none"
                  style={{ color: "#0f172a", fontFamily: "inherit" }}
                >
                  {ROLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <AnimatePresence>
                {errors.role?.message && (
                  <motion.p
                    initial={{ opacity: 0, y: -4, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -4, height: 0 }}
                    className="flex items-center gap-1 text-[11px] font-semibold text-red-600"
                  >
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    {errors.role.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div>
              <FloatingInput id="password" type="password" label="Password" register={registerField} error={errors.password?.message} icon={Lock} />
              {passwordValue && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-1 space-y-1">
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: passwordStrength.width }}
                      className="h-full rounded-full transition-all duration-500"
                      style={{ background: `linear-gradient(90deg, ${passwordStrength.color}, ${passwordStrength.color}88)` }}
                    />
                  </div>
                  <p className="text-[11px] font-medium" style={{ color: passwordStrength.color }}>
                    {passwordStrength.label}
                  </p>
                </motion.div>
              )}
            </div>
            <div>
              <FloatingInput
                id="confirmPassword"
                type="password"
                label="Confirm Password"
                register={registerField}
                error={errors.confirmPassword?.message}
                icon={Lock}
              />
              {passwordsMatch && (
                <p className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Passwords match
                </p>
              )}
            </div>
          </div>

          {passwordValue && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-1 rounded-lg border p-2.5"
              style={{
                borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
              }}
            >
              {PASSWORD_REQUIREMENTS.map((requirement) => {
                const passed = requirement.test(passwordValue);
                return (
                  <div key={requirement.id} className="flex items-center gap-2">
                    {passed ? (
                      <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    ) : (
                      <X className="h-3.5 w-3.5 shrink-0 text-red-500" />
                    )}
                    <span className={`text-[11px] font-semibold ${passed ? "text-emerald-700" : "text-slate-600"}`}>{requirement.label}</span>
                  </div>
                );
              })}
            </motion.div>
          )}

          <div>
            <label className="flex cursor-pointer select-none items-start gap-2 text-[13px] font-medium text-slate-700">
              <input
                type="checkbox"
                {...registerField("acceptTerms")}
                className="mt-0.5 h-4 w-4 cursor-pointer rounded border-slate-400 accent-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500"
              />
              <span>
                I agree to the{" "}
                <Link to="#" style={{ color: "#6366f1" }} className="font-medium">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="#" style={{ color: "#6366f1" }} className="font-medium">
                  Privacy Policy
                </Link>
              </span>
            </label>
            <AnimatePresence>
              {errors.acceptTerms?.message && (
                <motion.p
                  initial={{ opacity: 0, y: -4, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -4, height: 0 }}
                  className="mt-1 flex items-center gap-1 pl-1 text-[11px] text-red-600"
                >
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  {errors.acceptTerms.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {otpSent && !otpVerified && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5"
              >
                <p className={`flex items-center gap-2 text-[13px] font-medium ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>
                  <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                  OTP sent successfully to your email.
                </p>
                <p className="mt-1 truncate pl-5 text-[11px] text-slate-500">{otpEmail || emailValue}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {otpSent && !otpVerified && (
              <motion.div key="otp-section" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-2.5">
                <div>
                  <p className="mb-1 text-[11px] font-semibold tracking-wide text-slate-700">Verification code</p>
                  <div className="flex justify-center gap-1.5 sm:gap-2" onPaste={handleOtpPaste}>
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(element) => {
                          otpInputsRef.current[index] = element;
                        }}
                        type="text"
                        inputMode="numeric"
                        autoComplete={index === 0 ? "one-time-code" : "off"}
                        aria-label={`Verification digit ${index + 1}`}
                        maxLength={1}
                        value={digit}
                        onChange={(event) => handleOtpChange(index, event.target.value)}
                        onKeyDown={(event) => handleOtpKeyDown(event, index)}
                        className="registration-otp-input rounded-lg text-center text-[15px] font-bold outline-none transition-all duration-150 focus-visible:ring-4 focus-visible:ring-indigo-200"
                        style={{
                          width: 40,
                          height: 46,
                          border: `1.5px solid ${digit ? "#6366f1" : "#e2e8f0"}`,
                          background: digit ? "rgba(99,102,241,.05)" : "#fff",
                          color: "#0f172a",
                          fontFamily: "inherit",
                          boxShadow: digit ? "0 0 0 3px rgba(99,102,241,.1)" : "none",
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg p-2.5" style={{ background: "rgba(99,102,241,.05)", border: "1px solid rgba(99,102,241,.15)" }}>
                  <Smartphone className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: "#6366f1" }} />
                  <p className="text-[11px]" style={{ color: "#64748b" }}>
                    Enter the 6-digit code sent to{" "}
                    <span className="font-medium" style={{ color: "#0f172a" }}>
                      {otpEmail || emailValue}
                    </span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={verifyingOtp || otp.join("").length !== OTP_LENGTH}
                  className="registration-primary-button flex h-[44px] w-full items-center justify-center gap-2 rounded-xl font-bold text-white transition-all duration-150 hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 active:scale-[.98] disabled:cursor-not-allowed disabled:scale-100 disabled:opacity-45"
                  style={{
                    border: "none",
                    background: "linear-gradient(135deg,#0f55f7,#2563eb 50%,#06b6a8)",
                    fontSize: 13,
                    letterSpacing: "-.01em",
                    boxShadow: "0 10px 20px rgba(15,85,247,.22)",
                  }}
                >
                  {verifyingOtp ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    "Verify OTP"
                  )}
                </button>

                <div className="text-center">
                  {countdown > 0 ? (
                    <p className={isDark ? "text-[13px] text-white/40" : "text-[13px] text-slate-400"}>
                      Resend in <span className="font-medium">{countdown}s</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={sendingOtp}
                      className="text-[13px] font-bold text-blue-700 transition-colors hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {sendingOtp ? "Resending..." : "Resend OTP"}
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {otpVerified && (
              <motion.div
                key="verified-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5"
              >
                <p className={`flex items-center gap-2 text-[13px] font-medium ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>
                  <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                  Email verified successfully.
                </p>
                <p className="mt-1 truncate pl-5 text-[11px] text-slate-500">{otpEmail || emailValue}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={handleRegister}
          disabled={registering || !canRegister}
          className="registration-primary-button flex h-[46px] w-full items-center justify-center gap-2 rounded-xl font-bold text-white transition-all duration-150 hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 active:scale-[.98] disabled:cursor-not-allowed disabled:scale-100 disabled:opacity-45"
          style={{
            border: "none",
            background: "linear-gradient(135deg,#0f55f7,#2563eb 50%,#06b6a8)",
            fontSize: 14,
            letterSpacing: "-.01em",
            boxShadow: "0 10px 20px rgba(15,85,247,.22)",
          }}
        >
          {registering ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Registering...
            </>
          ) : (
            "Register"
          )}
        </button>
      </form>

      <p className="mt-2.5 text-center text-[13px]" style={{ color: "#64748b" }}>
        Already have an account?{" "}
        <Link to={ROUTES.AUTH.LOGIN} className="font-semibold" style={{ color: "#6366f1" }}>
          Sign In
        </Link>
      </p>
    </motion.div>
  );
}

export { AccountTypeSelector, StudentRegistrationForm };
export default StudentRegistrationForm;
