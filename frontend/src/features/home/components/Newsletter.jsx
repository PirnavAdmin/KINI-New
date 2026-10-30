import { memo, useState } from "react";
import { motion } from "framer-motion";
import { useThemeContext } from "@shared/context/ThemeContext";
import { FaArrowRight, FaEnvelope } from "react-icons/fa";

const Newsletter = memo(function Newsletter() {
  const { isDark } = useThemeContext();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <section className={`relative overflow-hidden py-8 md:py-10 lg:py-12 transition-colors duration-500 ${isDark ? "bg-[#050816]" : "bg-white"}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-[#085FA7]/10 to-[#5CA347]/10 blur-[150px]" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#085FA7] to-[#5CA347] flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FaEnvelope className="w-7 h-7 text-white" />
          </div>
          <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight ${isDark ? "text-white" : "text-[#0F172A]"}`}>
            Stay Ahead in Your{" "}
            <span className="bg-gradient-to-r from-[#085FA7] to-[#5CA347] bg-clip-text text-transparent">
              Tech Career
            </span>
          </h2>
          <p className={`mt-3 text-sm max-w-md mx-auto ${isDark ? "text-slate-400" : "text-[#64748B]"}`}>
            Get weekly career insights, interview tips, and program updates delivered to your inbox.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 max-w-lg mx-auto">
            <div className={`flex items-center gap-4 p-1.5 rounded-xl border backdrop-blur-xl transition-all duration-300 ${
              isDark
                ? "bg-white/[0.03] border-white/10 focus-within:border-[#085FA7]/30"
                : "bg-white/80 border-[#E5E7EB] focus-within:border-[#085FA7]/30 shadow-sm"
            }`}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className={`flex-1 px-4 bg-transparent text-sm outline-none h-14 ${
                  isDark ? "text-white placeholder:text-slate-500" : "text-[#0F172A] placeholder:text-[#94A3B8]"
                }`}
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#085FA7] to-[#5CA347] text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 h-14"
              >
                Subscribe <FaArrowRight className="text-xs" />
              </motion.button>
            </div>
          </form>

          {subscribed && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-sm text-[#5CA347]"
            >
              ✅ You're subscribed! Check your inbox for updates.
            </motion.p>
          )}

          <p className={`mt-4 text-xs ${isDark ? "text-slate-500" : "text-[#94A3B8]"}`}>
            No spam. Unsubscribe anytime. Join 20,000+ subscribers.
          </p>
        </motion.div>
      </div>
    </section>
  );
});

export default Newsletter;
