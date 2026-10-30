import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send, Loader2, CheckCircle, ArrowRight } from "lucide-react";
import Navbar from "@shared/components/Navbar";
import Footer from "@shared/components/Footer";
import { useThemeContext } from "@shared/context/ThemeContext";
import { toast } from "sonner";
import { getInTouchApi } from "@shared/services/publicRecordsService";

// ─── Contact Info Cards ──────────────────────────────────────────────────────

const CONTACT_INFO = [
  { icon: Mail, title: "Email Us", value: "support@kinieduhub.io", sub: "We respond within 24 hours" },
  { icon: Phone, title: "Call Us", value: "+1 (555) 123-4567", sub: "Mon–Fri, 9AM–6PM EST" },
  { icon: MapPin, title: "Our Office", value: "123 Innovation Drive, Suite 400", sub: "San Francisco, CA 94105" },
  { icon: Clock, title: "Working Hours", value: "Monday – Friday", sub: "9:00 AM – 6:00 PM EST" },
];

// ─── FAQ Data ────────────────────────────────────────────────────────────────

const FAQS = [
  { q: "How quickly can I get started?", a: "Immediately. After registering, you'll have instant access to all platform features." },
  { q: "Do you offer enterprise pricing?", a: "Yes. Contact our sales team for custom enterprise plans tailored to your organization's size and needs." },
  { q: "Can I change my plan later?", a: "Absolutely. You can upgrade, downgrade, or cancel your subscription at any time." },
  { q: "Is my data secure?", a: "Enterprise-grade security with SOC 2 compliance, end-to-end encryption, and role-based access controls." },
];

// ═════════════════════════════════════════════════════════════════════════════
// CONTACT PAGE
// ═════════════════════════════════════════════════════════════════════════════

export default function Contact() {
  const { isDark } = useThemeContext();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple validation
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const response = await getInTouchApi.create({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      setSubmitted(true);
      toast.success(response?.message || "Message sent successfully!");
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Unable to send your message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white pt-32 pb-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 blur-3xl rounded-full" />
        <div className="relative max-w-7xl mx-auto px-5 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/10 border border-white/10 backdrop-blur-xl px-5 py-2 rounded-full text-sm font-medium mb-6"
          >
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Get in Touch
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold mb-6"
          >
            We'd Love to
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Hear From You
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-lg text-gray-300 max-w-2xl mx-auto"
          >
            Have a question, need support, or want to discuss enterprise plans? Our team is here to help.
          </motion.p>
        </div>
      </section>

      {/* ─── CONTACT CARDS ────────────────────────────────── */}
      <section className={`py-16 ${isDark ? "bg-[#0B1220]" : "bg-white"}`}>
        <div className="max-w-7xl mx-auto px-5">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CONTACT_INFO.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className={`p-6 rounded-2xl border transition-all duration-200 hover:-translate-y-1 ${
                    isDark
                      ? "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-blue-500/30"
                      : "bg-white border-slate-200 hover:shadow-lg hover:border-blue-200"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-100 text-blue-600"
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className={`font-bold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>{item.title}</h3>
                  <p className={`text-sm font-medium ${isDark ? "text-white/80" : "text-slate-700"}`}>{item.value}</p>
                  <p className={`text-xs mt-1 ${isDark ? "text-white/40" : "text-slate-400"}`}>{item.sub}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── FORM + MAP ───────────────────────────────────── */}
      <section className={`py-16 ${isDark ? "bg-[#020617]" : "bg-slate-50"}`}>
        <div className="max-w-7xl mx-auto px-5">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* ── Form ── */}
            <motion.div
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className={`p-8 rounded-2xl border ${
                isDark ? "bg-white/[0.03] border-white/[0.06]" : "bg-white border-slate-200 shadow-sm"
              }`}
            >
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                    Message Sent!
                  </h3>
                  <p className={`mb-6 ${isDark ? "text-white/50" : "text-slate-500"}`}>
                    Thank you for reaching out. We'll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold hover:scale-[1.02] transition-all"
                  >
                    Send Another Message <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              ) : (
                <>
                  <h3 className={`text-2xl font-bold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>Send a Message</h3>
                  <p className={`text-sm mb-8 ${isDark ? "text-white/40" : "text-slate-400"}`}>
                    Fill out the form and our team will respond shortly.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-white/60" : "text-slate-600"}`}>
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="name" value={form.name} onChange={handleChange} placeholder="John Doe"
                          className={`w-full px-4 py-3 rounded-xl border outline-none transition-all text-sm ${
                            isDark
                              ? "bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30 focus:border-blue-500/50"
                              : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500"
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-white/60" : "text-slate-600"}`}>
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="email" value={form.email} onChange={handleChange} placeholder="john@example.com"
                          className={`w-full px-4 py-3 rounded-xl border outline-none transition-all text-sm ${
                            isDark
                              ? "bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30 focus:border-blue-500/50"
                              : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500"
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-white/60" : "text-slate-600"}`}>
                        Subject
                      </label>
                      <input
                        name="subject" value={form.subject} onChange={handleChange} placeholder="How can we help?"
                        className={`w-full px-4 py-3 rounded-xl border outline-none transition-all text-sm ${
                          isDark
                            ? "bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30 focus:border-blue-500/50"
                            : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500"
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isDark ? "text-white/60" : "text-slate-600"}`}>
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="message" value={form.message} onChange={handleChange} rows={5}
                        placeholder="Tell us more about your inquiry..."
                        className={`w-full px-4 py-3 rounded-xl border outline-none transition-all text-sm resize-none ${
                          isDark
                            ? "bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30 focus:border-blue-500/50"
                            : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500"
                        }`}
                      />
                    </div>

                    <button
                      type="submit" disabled={loading}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Send Message</>}
                    </button>
                  </form>
                </>
              )}
            </motion.div>

            {/* ── FAQ ── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            >
              <h3 className={`text-2xl font-bold mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>
                Frequently Asked Questions
              </h3>
              <div className="space-y-3">
                {FAQS.map((faq, i) => (
                  <details
                    key={i}
                    className={`group p-5 rounded-xl border transition-all duration-200 ${
                      isDark
                        ? "bg-white/[0.03] border-white/[0.06] [&[open]]:border-blue-500/30"
                        : "bg-white border-slate-200 [&[open]]:border-blue-300 shadow-sm"
                    }`}
                  >
                    <summary className={`flex items-center justify-between cursor-pointer font-semibold text-sm list-none ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}>
                      {faq.q}
                      <ArrowRight className={`w-4 h-4 transition-transform duration-200 group-open:rotate-90 ${
                        isDark ? "text-white/40" : "text-slate-400"
                      }`} />
                    </summary>
                    <p className={`mt-3 text-sm leading-relaxed ${isDark ? "text-white/50" : "text-slate-500"}`}>
                      {faq.a}
                    </p>
                  </details>
                ))}
              </div>

              {/* Map placeholder */}
              <div className={`mt-6 p-8 rounded-2xl border text-center ${
                isDark ? "bg-white/[0.03] border-white/[0.06]" : "bg-white border-slate-200"
              }`}>
                <MapPin className={`w-8 h-8 mx-auto mb-3 ${isDark ? "text-blue-400" : "text-blue-500"}`} />
                <p className={`text-sm font-medium ${isDark ? "text-white/60" : "text-slate-600"}`}>
                  123 Innovation Drive, Suite 400
                </p>
                <p className={`text-xs mt-1 ${isDark ? "text-white/40" : "text-slate-400"}`}>
                  San Francisco, CA 94105
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
