import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Bell } from "lucide-react";

const Newsletter = () => {
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
    <section className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
      <div className="relative bg-gradient-to-r from-[#085FA7] to-[#3D8B2E] p-8 sm:p-10">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-40 h-40 border border-white/30 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-60 h-60 border border-white/20 rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-4 h-4 text-white/80" />
              <span className="text-[10px] font-semibold text-white/60 uppercase tracking-wider">Stay Updated</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-1">
              Get notified about new courses
            </h3>
            <p className="text-sm text-white/70">
              Subscribe to receive updates on new programs, early-bird discounts, and learning resources.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full sm:w-auto flex-shrink-0">
            <div className="relative flex items-center">
              <Mail className="absolute left-3 w-4 h-4 text-white/50" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full sm:w-64 pl-9 pr-4 py-3 bg-white/15 backdrop-blur border border-white/20 rounded-xl text-sm text-white placeholder-white/40 outline-none focus:bg-white/20 focus:border-white/40 transition-all"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="absolute right-1.5 p-2 bg-white text-[#085FA7] rounded-lg hover:bg-white/90 transition-all"
              >
                {subscribed ? (
                  <span className="text-[10px] font-bold px-1">✓</span>
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </motion.button>
            </div>
            {subscribed && (
              <p className="text-[11px] text-green-200 mt-1.5">Thanks for subscribing! 🎉</p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
