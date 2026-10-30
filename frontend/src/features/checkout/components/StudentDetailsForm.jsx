import { motion } from "framer-motion";
import { FiUser } from "react-icons/fi";
import FloatingInput from "./FloatingInput";
import { QUALIFICATION_OPTIONS, EXPERIENCE_OPTIONS, INDIAN_STATES } from "@shared/data/mockData";

/**
 * StudentDetailsForm
 * Collects the student's personal information using React Hook Form.
 * Validation rules are defined inline and surfaced via `errors`.
 *
 * @param {object} register - react-hook-form register function
 * @param {object} errors - react-hook-form formState.errors object
 */
const StudentDetailsForm = ({ register, errors }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 sm:p-7 shadow-xl shadow-black/20"
    >
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/20">
          <FiUser className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-white">Your Details</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            We'll use this to set up your learning account
          </p>
        </div>
      </div>

      {/* Form grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <FloatingInput
          id="fullName"
          label="Full Name"
          register={register("fullName", {
            required: "Full name is required",
            minLength: { value: 3, message: "Name must be at least 3 characters" },
          })}
          error={errors.fullName?.message}
        />

        <FloatingInput
          id="email"
          label="Email Address"
          type="email"
          register={register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email address",
            },
          })}
          error={errors.email?.message}
        />

        <FloatingInput
          id="phone"
          label="Phone Number"
          type="tel"
          register={register("phone", {
            required: "Phone number is required",
            pattern: {
              value: /^[6-9]\d{9}$/,
              message: "Enter a valid 10-digit phone number",
            },
          })}
          error={errors.phone?.message}
        />

        <FloatingInput
          id="city"
          label="City"
          register={register("city", {
            required: "City is required",
            minLength: { value: 2, message: "Enter a valid city name" },
          })}
          error={errors.city?.message}
        />

        <FloatingInput
          id="state"
          label="State"
          options={INDIAN_STATES}
          register={register("state", { required: "Please select your state" })}
          error={errors.state?.message}
        />

        <FloatingInput
          id="qualification"
          label="Qualification"
          options={QUALIFICATION_OPTIONS}
          register={register("qualification", { required: "Please select your qualification" })}
          error={errors.qualification?.message}
        />

        <div className="sm:col-span-2">
          <FloatingInput
            id="experience"
            label="Experience Level"
            options={EXPERIENCE_OPTIONS}
            register={register("experience", { required: "Please select your experience level" })}
            error={errors.experience?.message}
          />
        </div>
      </div>
    </motion.section>
  );
};

export default StudentDetailsForm;
