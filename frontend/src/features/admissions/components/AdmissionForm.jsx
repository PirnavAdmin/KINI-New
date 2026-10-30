import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import { FiCheckCircle, FiLoader } from "react-icons/fi";

const programs = [
  "Full-Stack Web Development",
  "Data Science & Machine Learning",
  "Cloud DevOps Engineering",
  "Product Management",
  "UI/UX Design",
  "Cybersecurity",
  "Business Analytics",
];

const experiences = [
  "Fresher (0–1 yr)",
  "Early Career (1–3 yrs)",
  "Mid-Level (3–6 yrs)",
  "Senior (6+ yrs)",
  "Career Switcher",
];

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  city: "",
  experience: "",
  program: "",
  linkedin: "",
  message: "",
};

const initialErrors = {};

function FloatingField({ label, id, type = "text", value, onChange, onBlur, error, children }) {
  const filled = value && value.length > 0;
  return (
    <div className="relative">
      {children ? (
        <div className="relative">
          {children}
          <label
            htmlFor={id}
            className={`absolute left-4 transition-all duration-200 pointer-events-none font-medium
              ${filled ? "top-2 text-[10px] text-indigo-400" : "top-1/2 -translate-y-1/2 text-sm text-slate-500"}`}
          >
            {label}
          </label>
        </div>
      ) : (
        <div className="relative">
          <input
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder=" "
            className={`peer w-full rounded-xl border bg-white/5 backdrop-blur-sm text-white text-sm px-4 pt-6 pb-2 outline-none transition-all duration-200
              ${error ? "border-red-500/60 focus:border-red-400" : "border-white/10 focus:border-indigo-500/60"}
              placeholder-transparent focus:bg-white/8`}
          />
          <label
            htmlFor={id}
            className={`absolute left-4 transition-all duration-200 pointer-events-none font-medium
              peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-indigo-400
              peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500
              ${value ? "top-2 text-[10px] text-indigo-400" : ""}`}
          >
            {label}
          </label>
        </div>
      )}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-xs text-red-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

function validate(form) {
  const errs = {};
  if (!form.fullName.trim()) errs.fullName = "Full name is required.";
  if (!form.email.trim()) errs.email = "Email is required.";
  else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email.";
  if (!form.phone.trim()) errs.phone = "Phone number is required.";
  else if (!/^\+?[\d\s\-]{8,15}$/.test(form.phone)) errs.phone = "Enter a valid phone number.";
  if (!form.city.trim()) errs.city = "City is required.";
  if (!form.experience) errs.experience = "Select your experience level.";
  if (!form.program) errs.program = "Select a program.";
  return errs;
}

export default function AdmissionForm() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState(initialErrors);
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState("idle"); // idle | loading | success

  const headRef = useRef(null);
  const headInView = useInView(headRef, { once: true });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((f) => ({ ...f, [id]: value }));
    if (touched[id]) {
      const errs = validate({ ...form, [id]: value });
      setErrors((prev) => ({ ...prev, [id]: errs[id] }));
    }
  };

  const handleBlur = (e) => {
    const { id } = e.target;
    setTouched((t) => ({ ...t, [id]: true }));
    const errs = validate(form);
    setErrors((prev) => ({ ...prev, [id]: errs[id] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = Object.keys(initialForm).reduce((a, k) => ({ ...a, [k]: true }), {});
    setTouched(allTouched);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus("loading");
    await new Promise((r) => setTimeout(r, 1800));
    setStatus("success");
  };

  const selectClass = (id) =>
    `w-full rounded-xl border bg-white/5 backdrop-blur-sm text-white text-sm px-4 pt-6 pb-2 outline-none transition-all duration-200 appearance-none
    ${errors[id] ? "border-red-500/60 focus:border-red-400" : "border-white/10 focus:border-indigo-500/60"}`;

  return (
    <section id="apply" className="relative py-12 md:py-16 lg:py-20 px-4 overflow-hidden">
      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-indigo-700/10 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-3xl mx-auto">
        <motion.div
          ref={headRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-widest mb-4">
            Start Here
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
            Apply for Admission
          </h2>
          <p className="text-slate-400 text-base md:text-lg max-w-lg mx-auto">
            Complete this form and a senior counselor will reach out within 24
            hours to guide your next step.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl border border-green-500/30 bg-green-500/5 backdrop-blur-md p-14 text-center"
            >
              <FiCheckCircle className="text-green-400 text-6xl mx-auto mb-5" />
              <h3 className="text-white text-2xl font-bold mb-2">Application Received!</h3>
              <p className="text-slate-400 text-base max-w-sm mx-auto">
                Thanks, <span className="text-white font-semibold">{form.fullName}</span>. A
                counselor will contact you at{" "}
                <span className="text-indigo-300">{form.email}</span> within 24
                hours.
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              onSubmit={handleSubmit}
              noValidate
              className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-7 md:p-10 space-y-5"
            >
              {/* Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FloatingField label="Full Name *" id="fullName" value={form.fullName} onChange={handleChange} onBlur={handleBlur} error={errors.fullName} />
                <FloatingField label="Email Address *" id="email" type="email" value={form.email} onChange={handleChange} onBlur={handleBlur} error={errors.email} />
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FloatingField label="Phone Number *" id="phone" type="tel" value={form.phone} onChange={handleChange} onBlur={handleBlur} error={errors.phone} />
                <FloatingField label="City *" id="city" value={form.city} onChange={handleChange} onBlur={handleBlur} error={errors.city} />
              </div>

              {/* Row 3 — Selects */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FloatingField label="Experience Level *" id="experience" value={form.experience} onChange={handleChange} onBlur={handleBlur} error={errors.experience}>
                  <select id="experience" value={form.experience} onChange={handleChange} onBlur={handleBlur} className={selectClass("experience")}>
                    <option value="" disabled />
                    {experiences.map((e) => (
                      <option key={e} value={e} className="bg-[#0B1739] text-white">{e}</option>
                    ))}
                  </select>
                </FloatingField>

                <FloatingField label="Program Interested In *" id="program" value={form.program} onChange={handleChange} onBlur={handleBlur} error={errors.program}>
                  <select id="program" value={form.program} onChange={handleChange} onBlur={handleBlur} className={selectClass("program")}>
                    <option value="" disabled />
                    {programs.map((p) => (
                      <option key={p} value={p} className="bg-[#0B1739] text-white">{p}</option>
                    ))}
                  </select>
                </FloatingField>
              </div>

              {/* LinkedIn */}
              <FloatingField label="LinkedIn Profile (optional)" id="linkedin" value={form.linkedin} onChange={handleChange} onBlur={handleBlur} error={errors.linkedin} />

              {/* Message */}
              <div className="relative">
                <textarea
                  id="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder=" "
                  className="peer w-full rounded-xl border border-white/10 focus:border-indigo-500/60 bg-white/5 backdrop-blur-sm text-white text-sm px-4 pt-6 pb-2 outline-none transition-all duration-200 placeholder-transparent resize-none"
                />
                <label
                  htmlFor="message"
                  className={`absolute left-4 transition-all duration-200 pointer-events-none font-medium
                    peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-indigo-400
                    peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500
                    ${form.message ? "top-2 text-[10px] text-indigo-400" : ""}`}
                >
                  Anything else you'd like us to know? (optional)
                </label>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={status === "loading"}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-base shadow-lg shadow-indigo-900/40 hover:shadow-indigo-700/50 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {status === "loading" ? (
                  <>
                    <FiLoader className="animate-spin text-xl" />
                    Submitting…
                  </>
                ) : (
                  "Submit Application →"
                )}
              </motion.button>

              <p className="text-center text-slate-500 text-xs">
                By submitting, you agree to our{" "}
                <a href="#" className="text-indigo-400 hover:underline">Privacy Policy</a>{" "}
                and{" "}
                <a href="#" className="text-indigo-400 hover:underline">Terms of Use</a>.
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}