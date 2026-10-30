import { useState } from "react";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiPhone, FiMapPin, FiGlobe, FiBookOpen, FiBriefcase, FiTag, FiLayers } from "react-icons/fi";
import { useThemeContext } from "@shared/context/ThemeContext";
import { QUALIFICATION_OPTIONS, EXPERIENCE_OPTIONS, INDIAN_STATES } from "@shared/data/mockData";
import { paymentApi } from "@shared/services/apiServices";
import LegalSection from "@shared/components/legal/LegalSection";
import { batchFieldName } from "../utils/enrollmentDraft";
import { BRAND } from "../theme";


const t = (dark) => ({
  card: dark ? "rgba(11,17,32,0.75)" : "#FFFFFF",
  text: dark ? "#F8FAFC" : "#0F172A",
  heading: dark ? "#F8FAFC" : BRAND.primary,
  label: dark ? "#CBD5E1" : "#1E3A55",
  textMuted: dark ? "#94A3B8" : "#64748B",
  inputBg: dark ? "rgba(11,17,32,0.5)" : "#FFFFFF",
  inputBorder: dark ? "rgba(255,255,255,0.1)" : "rgba(19,59,93,0.16)",
  iconBg: dark ? "rgba(147,197,253,0.1)" : "#EEF4FA",
  panel: dark ? "rgba(255,255,255,0.03)" : "#F3F8FD",
  note: dark ? "rgba(255,255,255,0.05)" : "#F1F4F8",
});

const FieldIcon = ({ icon: Icon, isDark }) => (
  <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg" style={{ backgroundColor: t(isDark).iconBg }}>
    <Icon className="h-4 w-4" style={{ color: isDark ? "#93C5FD" : BRAND.primary }} />
  </span>
);

// Label above the value inside one bordered box, as in the KINI reference.
// Focus is drawn with :focus-within so react-hook-form keeps its own
// onBlur/onChange handlers.
const FloatingInput = ({ id, label, placeholder, type = "text", icon: Icon, error, isDark, required = true, options = [], optionValues, ...props }) => {
  const theme = t(isDark);
  const errorId = error ? `${id}-error` : undefined;
  const field = {
    id,
    "aria-invalid": Boolean(error),
    "aria-required": required,
    "aria-describedby": errorId,
    className: "w-full bg-transparent py-0.5 text-sm outline-none disabled:cursor-not-allowed",
    style: { color: theme.text },
  };

  return (
    <div>
      <div
        className="flex items-center gap-3 rounded-xl border px-3 py-2 transition-[border-color,box-shadow] duration-200 border-[var(--field-border)] focus-within:border-[#2D6A9F] focus-within:shadow-[0_0_0_4px_rgba(45,106,159,0.12)]"
        style={{ "--field-border": error ? "rgba(225,29,72,0.55)" : theme.inputBorder, backgroundColor: theme.inputBg }}
      >
        {Icon && <FieldIcon icon={Icon} isDark={isDark} />}
        <div className="min-w-0 flex-1">
          <label htmlFor={id} className="block text-xs font-medium" style={{ color: theme.label }}>
            {label}
            {required && <span aria-hidden="true" className="ml-0.5 text-rose-500">*</span>}
          </label>
          {type === "select" ? (
            <select {...field} {...props} className={`${field.className} cursor-pointer`}>
              <option value="">{placeholder ?? `Select ${label.toLowerCase()}`}</option>
              {options.map((opt, index) => (
                <option key={opt} value={optionValues?.[index] ?? opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              {...field}
              type={type}
              placeholder={placeholder}
              onInput={(event) => {
                if (id === "phone") event.currentTarget.value = event.currentTarget.value.replace(/\D/g, "").slice(0, 10);
              }}
              {...props}
            />
          )}
        </div>
      </div>
      {error && <p id={errorId} className="mt-1.5 px-1 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
};

// Reads POST /api/v1/coupons/validate. The response schema is not published, so
// the common field spellings are accepted; the backend still applies the coupon
// itself when it receives couponCode on order creation.
const readCouponResult = (result, amount) => {
  const valid = result?.isValid ?? result?.valid ?? result?.success ?? result?.status === "valid";
  const finalAmount = Number(result?.finalAmount ?? result?.payableAmount ?? result?.amountAfterDiscount);
  const discount = Number(result?.discountAmount ?? result?.discount
    ?? (Number.isFinite(finalAmount) ? amount - finalAmount : NaN));
  if (!valid || !Number.isFinite(discount) || discount < 0) return null;
  return Math.min(discount, amount);
};

const CouponInput = ({ appliedCoupon, onApply, onRemove, isDark, amount, canValidate }) => {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("idle");
  const theme = t(isDark);

  const handleApply = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    if (!canValidate) {
      setStatus("error");
      setMessage("Sign in as a student to apply a coupon");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const result = await paymentApi.validateCoupon({ couponCode: trimmed, amount });
      const discount = readCouponResult(result, amount);
      if (discount === null) throw new Error(result?.message || "Invalid or expired coupon code");
      const label = `₹${discount.toLocaleString("en-IN")} off`;
      setStatus("success");
      setMessage(`Coupon applied — ${label}`);
      onApply({ code: trimmed, type: "flat", value: discount, label });
    } catch (error) {
      setStatus("error");
      setMessage(error?.response?.data?.message || error?.message || "Invalid or expired coupon code");
    }
  };

  const handleRemove = () => {
    setCode("");
    setStatus("idle");
    setMessage("");
    onRemove();
  };

  const [message, setMessage] = useState("");

  return (
    <div
      className="rounded-xl p-4 transition-colors duration-300"
      style={{
        border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(45,106,159,0.18)"}`,
        backgroundColor: theme.panel,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <FiTag aria-hidden="true" className="w-4 h-4" style={{ color: isDark ? "#93C5FD" : BRAND.secondary }} />
        <h3 className="text-sm font-semibold" style={{ color: theme.heading }}>Have a coupon code?</h3>
      </div>

      {appliedCoupon ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-between rounded-xl px-4 py-3"
          style={{
            border: `1px solid ${BRAND.secondary}4D`,
            backgroundColor: `${BRAND.secondary}1A`,
          }}
        >
          <p className="text-sm font-medium" style={{ color: BRAND.secondary }}>
            {appliedCoupon.code} — {appliedCoupon.label}
          </p>
          <button
            onClick={handleRemove}
            className="text-xs font-medium transition-colors"
            style={{ color: BRAND.secondary }}
            onMouseEnter={(e) => e.currentTarget.style.color = theme.text}
            onMouseLeave={(e) => e.currentTarget.style.color = BRAND.secondary}
          >
            Remove
          </button>
        </motion.div>
      ) : (
        <>
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (status !== "idle") setStatus("idle");
              }}
              placeholder="Enter coupon code"
              aria-label="Coupon code"
              className="min-w-0 flex-1 rounded-lg border px-4 py-2.5 text-sm uppercase outline-none transition-[border-color,box-shadow] placeholder:normal-case focus:border-[#2D6A9F] focus:shadow-[0_0_0_4px_rgba(45,106,159,0.12)]"
              style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
            />
            <button
              type="button"
              onClick={handleApply}
              disabled={!code.trim() || status === "loading"}
              className="shrink-0 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-[opacity,transform] active:scale-95 disabled:cursor-not-allowed"
              style={{ backgroundColor: BRAND.primary, opacity: !code.trim() ? 0.55 : 1 }}
            >
              Apply
            </button>
          </div>
          {(message || status === "loading") && (
            <p
              role="status"
              className="mt-2 text-xs font-medium"
              style={{ color: status === "error" ? "#E11D48" : theme.textMuted }}
            >
              {status === "loading" ? "Checking coupon…" : message}
            </p>
          )}
        </>
      )}
    </div>
  );
};

// `courseBatches` = [{ course: { id, name }, batches: [{ id, name, shift }] }] — one
// batch picker per purchased course, each validated against that course's own
// batches so a batch from another course can never be chosen.
const StudentDetailsForm = ({ register, errors, appliedCoupon, onApplyCoupon, onRemoveCoupon, courseBatches = [], batchesLoading = false, couponAmount, canValidateCoupon = false }) => {
  const { isDark } = useThemeContext();
  const theme = t(isDark);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="rounded-2xl p-4 sm:p-5 transition-colors duration-300"
      style={{
        border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(19,59,93,0.1)"}`,
        backgroundColor: theme.card,
        boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 10px 30px -18px rgba(19,59,93,0.35)",
      }}
    >
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <span aria-hidden="true" className="grid h-12 w-12 place-items-center rounded-full" style={{ backgroundColor: theme.iconBg }}>
          <FiUser className="w-5 h-5" style={{ color: isDark ? "#93C5FD" : BRAND.primary }} />
        </span>
        <div>
          <h2
            className="text-lg sm:text-xl font-bold"
            style={{ fontFamily: "'Sora', sans-serif", color: theme.heading }}
          >
            Student Information
          </h2>
          <p className="text-xs sm:text-sm" style={{ color: theme.textMuted }}>We'll use this to set up your learning account</p>
        </div>
      </div>

      {/* Form grid */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FloatingInput
            id="firstName"
            label="First Name"
            placeholder="Enter your first name"
            autoComplete="given-name"
            icon={FiUser}
            isDark={isDark}
            {...register("firstName", {
              required: "First name is required",
              minLength: { value: 2, message: "Min 2 characters" },
            })}
            error={errors.firstName?.message}
          />
          <FloatingInput
            id="lastName"
            label="Last Name"
            placeholder="Enter your last name"
            autoComplete="family-name"
            icon={FiUser}
            isDark={isDark}
            {...register("lastName", {
              required: "Last name is required",
            })}
            error={errors.lastName?.message}
          />
          <div className="sm:col-span-2">
            <FloatingInput
              id="email"
              label="Email Address"
              placeholder="Enter your email address"
              autoComplete="email"
              type="email"
              icon={FiMail}
              isDark={isDark}
              {...register("email", { required: "Email is required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address" } })}
              error={errors.email?.message}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FloatingInput
            id="phone"
            label="Phone Number"
            placeholder="10-digit mobile number"
            autoComplete="tel-national"
            type="tel"
            icon={FiPhone}
            isDark={isDark}
            inputMode="numeric"
            maxLength={10}
            {...register("phone", { required: "Phone is required", pattern: { value: /^[6-9]\d{9}$/, message: "Enter a valid 10-digit mobile number" } })}
            error={errors.phone?.message}
          />
          <FloatingInput
            id="pincode"
            label="Pincode"
            placeholder="Enter pincode"
            autoComplete="postal-code"
            inputMode="numeric"
            maxLength={6}
            type="text"
            icon={FiMapPin}
            isDark={isDark}
            {...register("pincode", { required: "Pincode is required", pattern: { value: /^\d{6}$/, message: "Enter a valid 6-digit pincode" } })}
            error={errors.pincode?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FloatingInput
            id="state"
            label="State"
            type="select"
            icon={FiGlobe}
            isDark={isDark}
            options={INDIAN_STATES}
            {...register("state", { required: "Select your state" })}
            error={errors.state?.message}
          />
          <FloatingInput
            id="qualification"
            label="Qualification"
            type="select"
            icon={FiBookOpen}
            isDark={isDark}
            options={QUALIFICATION_OPTIONS}
            {...register("qualification", { required: "Select qualification" })}
            error={errors.qualification?.message}
          />
          <FloatingInput
            id="experience"
            label="Experience"
            type="select"
            icon={FiBriefcase}
            isDark={isDark}
            options={EXPERIENCE_OPTIONS}
            {...register("experience", { required: "Select experience" })}
            error={errors.experience?.message}
          />
        </div>

        {courseBatches.map(({ course, batches }) => {
          const field = batchFieldName(course.id);
          const multiple = courseBatches.length > 1;
          // No open batch listed for this course: the organization assigns one
          // when it approves the enrollment, so the field is optional.
          const assignedOnApproval = !batchesLoading && !batches.length;
          if (assignedOnApproval) {
            return (
              <div
                key={field}
                className="flex items-start gap-3 rounded-xl border px-3 py-2.5"
                style={{ borderColor: theme.inputBorder, backgroundColor: theme.inputBg }}
              >
                <FieldIcon icon={FiLayers} isDark={isDark} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium" style={{ color: theme.label }}>
                    {multiple ? `${course.name}: batch assigned on approval` : "Batch assigned on approval"}
                  </p>
                  <p className="mt-1.5 rounded-md px-3 py-2 text-xs leading-relaxed" style={{ backgroundColor: theme.note, color: theme.textMuted }}>
                    No open batch is listed for {multiple ? course.name : "this course"} yet. The organization will assign one when it approves your enrollment.
                  </p>
                </div>
              </div>
            );
          }
          return (
            <div key={field}>
              <FloatingInput
                id={field}
                label={batchesLoading
                  ? (multiple ? `${course.name}: loading batches…` : "Loading available batches…")
                  : (multiple ? `Batch for ${course.name}` : "Select Available Batch")}
                placeholder={batchesLoading ? "Loading…" : "Select a batch"}
                type="select"
                icon={FiLayers}
                isDark={isDark}
                options={batches.map((batch) => `${batch.name}${batch.shift ? ` · ${batch.shift}` : ""}`)}
                optionValues={batches.map((batch) => String(batch.id))}
                {...register(field, {
                  validate: (value) => {
                    if (!batches.length) return true;
                    if (!value) return multiple ? `Select a batch for ${course.name}` : "Please select an available batch";
                    return batches.some((batch) => String(batch.id) === String(value)) || "Please select a valid batch";
                  },
                })}
                disabled={batchesLoading}
                error={errors[field]?.message}
              />
            </div>
          );
        })}

        {/* Coupon */}
        <CouponInput
          appliedCoupon={appliedCoupon}
          onApply={onApplyCoupon}
          onRemove={onRemoveCoupon}
          amount={couponAmount}
          canValidate={canValidateCoupon}
          isDark={isDark}
        />

        {/* Terms & Conditions + Privacy Policy */}
        <LegalSection register={register} errors={errors} />
      </div>
    </motion.div>
  );
};

export default StudentDetailsForm;
