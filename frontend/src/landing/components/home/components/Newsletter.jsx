import { memo, useState } from "react";
import { motion } from "framer-motion";
import { FaArrowRight, FaEnvelope } from "react-icons/fa";

const Newsletter = memo(function Newsletter() {
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
    <section
      className="relative overflow-hidden py-12 sm:py-16 md:py-20 lg:py-24"
      style={{ background: "linear-gradient(110deg, #0B3554 0%, #164D70 55%, #FF9D1C 100%)" }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] lg:w-[600px] lg:h-[600px] rounded-full bg-white/10 blur-[120px] lg:blur-[150px]" />
      </div>

      <div className="relative max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center mx-auto mb-4 sm:mb-5 lg:mb-6 shadow-lg">
            <FaEnvelope className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
          </div>
          <h2 className="text-[26px] sm:text-3xl md:text-[2.5rem] lg:text-4xl xl:text-[2.75rem] font-bold leading-tight text-white">
            Stay Ahead in Your{" "}
            <span className="text-secondary-200">Tech Career</span>
          </h2>
          <p className="mt-2.5 sm:mt-3 text-[13px] sm:text-sm md:text-[15px] lg:text-base max-w-md mx-auto text-white/75 leading-relaxed">
            Get weekly career insights, interview tips, and program updates delivered to your inbox.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 sm:mt-6 max-w-lg mx-auto">
            {/* Desktop/laptop: horizontal form */}
            <div className="hidden sm:flex items-center gap-3 md:gap-4 p-1.5 rounded-xl border border-white/25 bg-white shadow-lg transition-all duration-300 focus-within:border-white/50">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-4 bg-transparent text-sm outline-none h-12 md:h-14 text-primary-900 placeholder:text-primary-900/40"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 px-5 md:px-6 py-2.5 rounded-lg bg-secondary-500 text-primary-950 text-sm font-semibold shadow-lg hover:bg-secondary-400 hover:shadow-xl transition-all duration-300 h-12 md:h-14 whitespace-nowrap"
              >
                Subscribe <FaArrowRight className="text-xs" />
              </motion.button>
            </div>

            {/* Mobile: stacked form */}
            <div className="flex sm:hidden flex-col gap-3 p-3 sm:p-1.5 rounded-xl border border-white/25 bg-white shadow-lg transition-all duration-300 focus-within:border-white/50">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 bg-transparent text-sm outline-none text-primary-900 placeholder:text-primary-900/40"
              />
              <motion.button
                type="submit"
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-secondary-500 text-primary-950 text-sm font-semibold shadow-lg transition-all duration-300 w-full"
              >
                Subscribe <FaArrowRight className="text-xs" />
              </motion.button>
            </div>
          </form>

          {subscribed && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2.5 sm:mt-3 text-xs sm:text-sm text-white"
            >
              ✅ You're subscribed! Check your inbox for updates.
            </motion.p>
          )}

          <p className="mt-3 sm:mt-4 text-[11px] sm:text-xs text-white/60 leading-relaxed">
            No spam. Unsubscribe anytime. Join 20,000+ subscribers.
          </p>
        </motion.div>
      </div>
    </section>
  );
});

export default Newsletter;
