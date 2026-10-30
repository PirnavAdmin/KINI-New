import { useState } from "react";
import apiClient from "@shared/services/apiClient";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FaUserGraduate, FaBriefcase, FaChalkboardTeacher } from "react-icons/fa";
import { useThemeContext } from "@shared/context/ThemeContext";
import { th } from "@shared/theme/theam";

function EnrollmentForm() {
  const { isDark } = useThemeContext();

  const [formData, setFormData] = useState({
    topic: "", name: "", email: "", phone: "", experience: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await apiClient.post("/api/register", formData);
      toast.success(res.data.message);
      setFormData({ topic: "", name: "", email: "", phone: "", experience: "" });
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { icon: <FaUserGraduate />,      value: "500+", label: "Students Trained" },
    { icon: <FaChalkboardTeacher />, value: "50+",  label: "Industry Mentors" },
    { icon: <FaBriefcase />,         value: "95%",  label: "Placement Success" },
  ];

  // ── Input class — adapts to dark/light mode ──────────────────────────────
  const inputCls = `
    w-full rounded-2xl px-5 py-4 text-sm outline-none transition-all duration-300
    ${isDark
      ? "bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
      : "bg-slate-100 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
    }
  `;

  return (
    // ── FIX 1: min-h-screen + flex flex-col so section fills viewport ──────
    <section
      className={`
        relative min-h-screen flex flex-col justify-center
        overflow-hidden transition-colors duration-300
        ${th.section(isDark)}
      `}
    >
      {/* Background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[180px]" />
        <div className="absolute bottom-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[180px]" />
      </div>

      {/* ── FIX 2: consistent py so content never gets clipped ───────────── */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 py-16 lg:py-20">

        {/* ── FIX 3: gap-10 instead of gap-16 so both columns fit ────────── */}
        <div className="grid lg:grid-cols-2 gap-10 items-center">

          {/* ── LEFT ─────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-col gap-6"
          >
            {/* Badge */}
            <span
              className={`
                self-start inline-flex items-center gap-2 px-4 py-2
                rounded-full border text-sm font-semibold
                ${th.textSecondary(isDark)}
              `}
            >
              🚀 Start Your Learning Journey
            </span>

            {/* ── FIX 4: heading size stepped down so it fits on one screen */}
            <h2 className={`text-3xl md:text-4xl lg:text-5xl font-black leading-tight ${th.textPrimary(isDark)}`}>
              Secure Your Role In
              <span className="block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                The Technology Sector
              </span>
            </h2>

            <p className={`text-base leading-7 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Learn from industry experts, build real-world projects, prepare for
              interviews, and get placement assistance. Join thousands of students
              building successful careers in technology.
            </p>

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-4">
              {stats.map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className={`
                    rounded-2xl p-4 shadow-md transition-all
                    ${isDark
                      ? "bg-white/5 border border-white/10 backdrop-blur-xl"
                      : "bg-white border border-slate-200"
                    }
                  `}
                >
                  <div className={`text-xl mb-2 ${isDark ? "text-cyan-400" : "text-cyan-600"}`}>
                    {item.icon}
                  </div>
                  <p className={`text-2xl font-bold ${th.textPrimary(isDark)}`}>{item.value}</p>
                  <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{item.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Feature tags */}
            <div className={`flex flex-wrap gap-3 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              <span>✓ Live Classes</span>
              <span>✓ Placement Support</span>
              <span>✓ Real Projects</span>
            </div>
          </motion.div>

          {/* ── RIGHT FORM ───────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div
              className={`
                rounded-[28px] p-7 lg:p-9 shadow-xl border backdrop-blur-2xl
                ${th.card(isDark)}
              `}
            >
              <h3 className={`text-2xl font-bold ${th.textPrimary(isDark)}`}>
                Free Career Consultation
              </h3>
              <p className={`mt-1 mb-6 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Fill out the form and our experts will contact you within 24 hours.
              </p>

              {/* ── FIX 5: no <form> tag (React artifact rule) — use div + onClick */}
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text" name="name" placeholder="Full Name"
                    value={formData.name} onChange={handleChange}
                    className={inputCls}
                  />
                  <input
                    type="email" name="email" placeholder="Email Address"
                    value={formData.email} onChange={handleChange}
                    className={inputCls}
                  />
                  <input
                    type="tel" name="phone" placeholder="Phone Number"
                    value={formData.phone} onChange={handleChange}
                    className={inputCls}
                  />
                  <select
                    name="experience" value={formData.experience}
                    onChange={handleChange} className={inputCls}
                  >
                    <option value="">Experience Level</option>
                    <option value="Fresher">Fresher</option>
                    <option value="0-1 Years">0–1 Years</option>
                    <option value="1-3 Years">1–3 Years</option>
                    <option value="3+ Years">3+ Years</option>
                  </select>
                </div>

                <input
                  type="text" name="topic" placeholder="Interested Course"
                  value={formData.topic} onChange={handleChange}
                  className={inputCls}
                />

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={loading}
                  onClick={handleSubmit}
                  className="
                    w-full py-4 rounded-2xl font-bold text-white text-sm
                    bg-gradient-to-r from-cyan-500 to-blue-600
                    shadow-lg hover:shadow-cyan-500/30
                    disabled:opacity-60 disabled:cursor-not-allowed
                    transition-all duration-300
                  "
                >
                  {loading ? "Submitting..." : "Book Free Consultation"}
                </motion.button>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

export default EnrollmentForm;
