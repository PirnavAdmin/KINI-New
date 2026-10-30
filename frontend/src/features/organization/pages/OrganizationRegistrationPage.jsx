import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Building2,
  Globe,
  Mail,
  MapPin,
  Phone,
  Briefcase,
  Lock,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import PageHeader from "@shared/components/PageHeader";
import Card from "@shared/components/Card";
import { Button, Input } from "@shared/components/FormElements";
import { ROUTES } from "@shared/constants/routeConstants";
import { registerOrganization } from "@shared/services/organizationService";
import { authService } from "@shared/services/authService";

const EMPTY_FORM = {
  organizationName: "",
  email: "",
  phone: "",
  industry: "",
  country: "",
  website: "",
  password: "",
  confirmPassword: "",
};

const OTP_LENGTH = 6;
const RESEND_DELAY = 60;

const REQUIRED_FIELDS = [
  ["organizationName", "Organization name"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["industry", "Industry"],
  ["country", "Country"],
  ["website", "Website"],
  ["password", "Password"],
  ["confirmPassword", "Confirm password"],
];

const OTP_FIELD_KEYS = Array.from({ length: OTP_LENGTH }, (_, index) => `otp-${index}`);

function getExactBackendMessage(error) {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data.trim();

  const keys = ["message", "Message", "error", "Error", "title", "Title"];
  for (const key of keys) {
    if (typeof data?.[key] === "string" && data[key].trim()) {
      return data[key].trim();
    }
  }

  if (data?.errors && typeof data.errors === "object") {
    for (const value of Object.values(data.errors)) {
      const messages = Array.isArray(value) ? value : [value];
      for (const message of messages) {
        if (typeof message === "string" && message.trim()) {
          return message.trim();
        }
      }
    }
  }

  return "";
}

function getValidationMessage(form) {
  const missingFields = REQUIRED_FIELDS
    .filter(([field]) => !form[field].trim())
    .map(([, label]) => label);

  if (missingFields.length) {
    return `${missingFields.join(", ")} ${missingFields.length === 1 ? "is" : "are"} required`;
  }

  if (form.password.length < 8) {
    return "Password must contain at least 8 characters";
  }

  if (form.password !== form.confirmPassword) {
    return "Password and confirm password do not match";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    return "Please enter a valid email address";
  }

  if (!/^\d{10}$/.test(form.phone.trim())) {
    return "Phone number must contain exactly 10 digits";
  }

  try {
    new URL(form.website.trim());
  } catch {
    return "Please enter a valid website URL, including https://";
  }

  return "";
}

export default function OrganizationRegistrationPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef([]);
  const sendOtpLockRef = useRef(false);
  const verifyOtpLockRef = useRef(false);
  const registerLockRef = useRef(false);

  const organizationPayload = useMemo(
    () => ({
      organizationName: form.organizationName.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      industry: form.industry.trim(),
      country: form.country.trim(),
      website: form.website.trim(),
      password: form.password,
      confirmPassword: form.confirmPassword,
    }),
    [form]
  );

  const updateField = (field) => (event) => {
    const value = field === "phone"
      ? event.target.value.replace(/\D/g, "").slice(0, 10)
      : event.target.value;

    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "email" && otpEmail && value.trim().toLowerCase() !== otpEmail) {
        setOtp(Array(OTP_LENGTH).fill(""));
        setOtpSent(false);
        setOtpVerified(false);
        setCountdown(0);
        setOtpEmail("");
      }
      return next;
    });
  };

  const handleClear = () => {
    setForm(EMPTY_FORM);
    setOtp(Array(OTP_LENGTH).fill(""));
    setOtpSent(false);
    setOtpVerified(false);
    setOtpEmail("");
    setCountdown(0);
  };

  const handleSendOtp = async () => {
    if (sendOtpLockRef.current || sendingOtp || otpVerified) return;

    const validationMessage = getValidationMessage(form);
    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }

    const email = form.email.trim().toLowerCase();
    sendOtpLockRef.current = true;
    setSendingOtp(true);

    try {
      await authService.sendOtp({ identifier: email, otpType: "Email" });
      setOtp(Array(OTP_LENGTH).fill(""));
      setOtpSent(true);
      setOtpVerified(false);
      setOtpEmail(email);
      setCountdown(RESEND_DELAY);
      setTimeout(() => otpRefs.current[0]?.focus(), 0);
      toast.success("OTP sent successfully to your email.");
    } catch (error) {
      const message = getExactBackendMessage(error);
      if (message) toast.error(message);
    } finally {
      sendOtpLockRef.current = false;
      setSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (!otpSent || otpVerified || sendingOtp || countdown > 0 || sendOtpLockRef.current) return;

    const email = otpEmail || form.email.trim().toLowerCase();
    if (!email) return;

    sendOtpLockRef.current = true;
    setSendingOtp(true);
    setOtp(Array(OTP_LENGTH).fill(""));

    try {
      await authService.sendOtp({ identifier: email, otpType: "Email" });
      setOtpEmail(email);
      setCountdown(RESEND_DELAY);
      setTimeout(() => otpRefs.current[0]?.focus(), 0);
      toast.success("OTP sent successfully to your email.");
    } catch (error) {
      const message = getExactBackendMessage(error);
      if (message) toast.error(message);
    } finally {
      sendOtpLockRef.current = false;
      setSendingOtp(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (event, index) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
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
    setTimeout(() => otpRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus(), 0);
  };

  const handleVerifyOtp = async () => {
    if (verifyOtpLockRef.current || verifyingOtp) return;

    const code = otp.join("");
    if (!/^\d{6}$/.test(code)) {
      toast.error("Please enter the 6-digit OTP.");
      return;
    }

    const email = otpEmail || form.email.trim().toLowerCase();
    if (!email) {
      toast.error("Email is required.");
      return;
    }

    verifyOtpLockRef.current = true;
    setVerifyingOtp(true);

    try {
      await authService.verifyOtp({ identifier: email, otpType: "Email", otp: code });
      setOtpVerified(true);
      setOtpSent(true);
      setCountdown(0);
      toast.success("Email verified successfully.");
    } catch (error) {
      const message = getExactBackendMessage(error);
      setOtp(Array(OTP_LENGTH).fill(""));
      setTimeout(() => otpRefs.current[0]?.focus(), 0);
      if (message) toast.error(message);
    } finally {
      verifyOtpLockRef.current = false;
      setVerifyingOtp(false);
    }
  };

  const mapRegisterFieldErrors = (error) => {
    const errorsData = error?.response?.data?.errors;
    if (!errorsData || typeof errorsData !== "object") return false;

    const fieldMap = {
      firstname: "Organization name",
      lastname: "Organization name",
      email: "Email",
      phone: "Phone",
      password: "Password",
      confirmpassword: "Confirm password",
      role: "Role",
    };

    let messageShown = false;
    Object.entries(errorsData).forEach(([field, value]) => {
      const values = Array.isArray(value) ? value : [value];
      const message = values.find((item) => typeof item === "string" && item.trim());
      if (!message) return;
      const normalizedField = String(field).replace(/[^a-z]/gi, "").toLowerCase();
      const label = fieldMap[normalizedField];
      if (label) {
        toast.error(message.trim());
        messageShown = true;
      }
    });

    return messageShown;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (registerLockRef.current || saving) return;

    const validationMessage = getValidationMessage(form);
    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }

    registerLockRef.current = true;
    setSaving(true);

    try {
      console.group("🏢 Organization Registration");
      console.log("Payload:", organizationPayload);
      console.groupEnd();

      const created = await registerOrganization(organizationPayload);
      setForm(EMPTY_FORM);
      setOtp(Array(OTP_LENGTH).fill(""));
      setOtpSent(false);
      setOtpVerified(false);
      setOtpEmail("");
      setCountdown(0);
      console.group("✅ Registration Success");
      console.log(created);
      console.groupEnd();
      toast.success(created?.message || "Organization registered successfully");
      navigate(ROUTES.ORG_ADMIN.LOGIN, {
        replace: true,
        state: {
          registeredEmail: organizationPayload.email,
          organizationRegistered: true,
        },
      });
    } catch (error) {
      console.group("❌ Registration Failed");
      console.log(error?.response?.status);
      console.log(error?.response?.data);
      console.groupEnd();
      const mapped = mapRegisterFieldErrors(error);
      const status = error?.response?.status;
      const message = getExactBackendMessage(error);
      if (status === 409) {
        toast.error("Organization already exists.");
      } else if (status === 500) {
        toast.error("Something went wrong. Please try again.");
      } else if (status === 400 && message && !mapped) {
        toast.error(message);
      } else if (message && !mapped) {
        toast.error(message);
      }
    } finally {
      registerLockRef.current = false;
      setSaving(false);
    }
  };

  useEffect(() => {
    if (countdown <= 0) return undefined;
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  const registerDisabled = saving;
  const isEmailLocked = otpVerified;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title="Register Organization"
        subtitle="Create your organization before accessing its management data"
        icon={Building2}
      />

      <Card padding="p-5 sm:p-8">
        <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
          Organization details will be available only after this registration is completed.
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Input
            label="Organization Name"
            icon={Building2}
            value={form.organizationName}
            onChange={updateField("organizationName")}
            placeholder="Enter organization name"
            required
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Email
              <span className="ml-1 text-[#EF4444]">*</span>
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div
                className="flex h-[44px] min-w-0 flex-1 items-center rounded-xl border bg-white dark:bg-slate-800/50"
                style={{
                  borderColor: otpVerified ? "#10b981" : "#e2e8f0",
                }}
              >
                <div className="pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={form.email}
                  onChange={updateField("email")}
                  placeholder="organization@example.com"
                  disabled={isEmailLocked}
                  className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:text-emerald-700 dark:text-white"
                  autoComplete="email"
                  aria-label="Email"
                />
                {otpVerified && (
                  <div className="mr-3 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={sendingOtp || otpVerified}
                className="inline-flex h-[44px] items-center justify-center gap-2 rounded-xl bg-[#0f55f7] px-4 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sendingOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {sendingOtp ? "Sending..." : "Send OTP"}
              </button>
            </div>
          </div>

          <Input
            label="Phone"
            type="tel"
            icon={Phone}
            value={form.phone}
            onChange={updateField("phone")}
            placeholder="e.g. 9876543210"
            inputMode="numeric"
            pattern="[0-9]{10}"
            maxLength={10}
            title="Enter exactly 10 digits"
            required
          />

          <Input
            label="Industry"
            icon={Briefcase}
            value={form.industry}
            onChange={updateField("industry")}
            placeholder="e.g. Technology"
            required
          />

          <Input
            label="Country"
            icon={MapPin}
            value={form.country}
            onChange={updateField("country")}
            placeholder="Enter country"
            required
          />

          <Input
            label="Website"
            type="url"
            icon={Globe}
            value={form.website}
            onChange={updateField("website")}
            placeholder="https://example.com"
            required
          />

          <Input
            label="Password"
            type="password"
            icon={Lock}
            value={form.password}
            onChange={updateField("password")}
            placeholder="Enter password"
            autoComplete="new-password"
            minLength={8}
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            icon={Lock}
            value={form.confirmPassword}
            onChange={updateField("confirmPassword")}
            placeholder="Re-enter password"
            autoComplete="new-password"
            minLength={8}
            error={form.confirmPassword && form.password !== form.confirmPassword
              ? "Password and confirm password do not match."
              : undefined}
            required
          />

          <div className="md:col-span-2">
            {otpSent && !otpVerified && (
              <div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-500/20 dark:bg-indigo-500/10">
                <p className="text-sm font-medium text-indigo-700 dark:text-indigo-200">
                  OTP sent successfully to your email.
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">{otpEmail || form.email}</p>
              </div>
            )}

            {otpSent && !otpVerified && (
              <div className="mb-5 space-y-3">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Enter OTP</label>
                  <div className="flex items-center gap-2" onPaste={handleOtpPaste}>
                    {OTP_FIELD_KEYS.map((key, index) => (
                      <input
                        key={key}
                        ref={(element) => {
                          otpRefs.current[index] = element;
                        }}
                        type="text"
                        inputMode="numeric"
                        autoComplete={index === 0 ? "one-time-code" : "off"}
                        maxLength={1}
                        value={otp[index]}
                        onChange={(event) => handleOtpChange(index, event.target.value)}
                        onKeyDown={(event) => handleOtpKeyDown(event, index)}
                        className="h-12 w-12 rounded-xl border border-slate-200 bg-white text-center text-base font-semibold text-slate-900 outline-none transition focus:border-[#0f55f7] focus:ring-4 focus:ring-[#0f55f7]/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        aria-label={`OTP digit ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  {countdown > 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Resend in <span className="font-semibold">{countdown}s</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={sendingOtp}
                      className="text-sm font-semibold text-[#0f55f7] transition hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {sendingOtp ? "Resending..." : "Resend OTP"}
                    </button>
                  )}

                  {!otpVerified ? (
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={verifyingOtp || otp.join("").length !== OTP_LENGTH}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {verifyingOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {verifyingOtp ? "Verifying..." : "Verify OTP"}
                    </button>
                  ) : null}
                </div>
              </div>
            )}

            {otpVerified && (
              <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                <CheckCircle2 className="h-4 w-4" />
                Email verified successfully.
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5 dark:border-slate-700/50 md:col-span-2">
            <Button type="button" variant="secondary" onClick={handleClear} disabled={saving}>
              Clear
            </Button>
            <Button
              type="submit"
              icon={Building2}
              loading={saving}
              disabled={registerDisabled}
            >
              Register Organization
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
