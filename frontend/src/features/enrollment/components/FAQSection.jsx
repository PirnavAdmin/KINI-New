import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiHelpCircle } from "react-icons/fi";
import { useThemeContext } from "@shared/context/ThemeContext";
import { BRAND } from "../theme";


const t = (dark) => ({
  card: dark ? "rgba(11,17,32,0.75)" : "rgba(255,255,255,0.9)",
  border: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
  text: dark ? "#F8FAFC" : "#0F172A",
  textSecondary: dark ? "#CBD5E1" : "#475569",
  textMuted: dark ? "#94A3B8" : "#64748B",
  textDim: dark ? "#64748B" : "#94A3B8",
  borderLight: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
  accordionBg: dark ? "rgba(11,17,32,0.5)" : "rgba(255,255,255,0.8)",
});

const FAQ_CATEGORIES = [
  {
    title: "Payment",
    icon: "💰",
    items: [
      { q: "What payment methods do you accept?", a: "We accept all major credit/debit cards (Visa, Mastercard, RuPay), UPI (Google Pay, PhonePe, Paytm), Net Banking (60+ banks), and digital wallets. All payments are processed through our PCI-DSS compliant gateway." },
      { q: "Can I pay in installments?", a: "Yes! We offer 3, 6, and 12-month no-cost EMI options on select credit cards. You can choose EMI at checkout. The option is available for transactions above ₹3,000." },
    ],
  },
  {
    title: "Refund",
    icon: "🔄",
    items: [
      { q: "What is the refund policy?", a: "We offer a 7-day full refund policy from the date of purchase. If you've attended fewer than 3 live sessions and are not satisfied, simply raise a request from your dashboard. The full amount will be refunded to your original payment method within 5-7 business days." },
      { q: "Can I transfer to another course?", a: "Absolutely. If you find another program more suitable within the first 14 days, we'll transfer your enrollment at no extra cost. Just reach out to your student advisor." },
    ],
  },
  {
    title: "Certificate & Access",
    icon: "📜",
    items: [
      { q: "How do I get my certificate?", a: "Upon completing all modules, assignments, and the final capstone project, you'll receive an industry-recognized certificate from Kini Edutech. It includes a unique verification ID sharable with employers." },
      { q: "How long do I have access?", a: "You get lifetime access to all course materials, recordings, and future updates. There are no recurring fees or subscription charges after enrollment." },
    ],
  },
  {
    title: "Placement & Support",
    icon: "💼",
    items: [
      { q: "What does placement support include?", a: "Placement support includes ATS-optimized resume review, LinkedIn optimization, unlimited 1:1 mock interviews with industry experts, warm referrals through our alumni network, and salary negotiation coaching." },
      { q: "Is there live mentor support?", a: "Yes! Each cohort has dedicated mentors available during live sessions. You also get 1:1 mentor sessions every month to track progress, clear doubts, and plan your learning path." },
    ],
  },
];

const FAQSection = () => {
  const [openId, setOpenId] = useState(null);
  const { isDark } = useThemeContext();

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

  const allItems = FAQ_CATEGORIES.flatMap((cat, ci) =>
    cat.items.map((item, ii) => ({
      id: `${ci}-${ii}`,
      category: cat.title,
      categoryIcon: cat.icon,
      ...item,
    }))
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="rounded-3xl p-5 sm:p-7 shadow-xl transition-colors duration-300"
      style={{
        border: `1px solid ${t(isDark).border}`,
        backgroundColor: t(isDark).card,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-2xl border"
          style={{
            background: `linear-gradient(135deg, ${BRAND.primary}33, ${BRAND.secondary}33)`,
            borderColor: `${BRAND.primary}33`,
          }}
        >
          <FiHelpCircle className="w-5 h-5" style={{ color: BRAND.primary }} />
        </div>
        <div>
          <h2
            className="text-lg sm:text-xl font-semibold"
            style={{ fontFamily: "'Sora', sans-serif", color: t(isDark).text }}
          >
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm" style={{ color: t(isDark).textMuted }}>Everything you need to know before enrolling</p>
        </div>
      </div>

      {/* Accordion */}
      <div className="space-y-2">
        {allItems.map((item) => {
          const isOpen = openId === item.id;
          return (
            <div
              key={item.id}
              className="rounded-2xl overflow-hidden transition-colors"
              style={{
                border: `1px solid ${t(isDark).borderLight}`,
                backgroundColor: t(isDark).accordionBg,
              }}
            >
              <button
                onClick={() => toggle(item.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm shrink-0">{item.categoryIcon}</span>
                  <span
                    className="text-xs font-medium uppercase tracking-wider shrink-0"
                    style={{ color: BRAND.primary }}
                  >
                    {item.category}
                  </span>
                  <span className="text-sm font-medium line-clamp-1" style={{ color: t(isDark).textSecondary }}>
                    {item.q}
                  </span>
                </div>
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="shrink-0"
                  style={{ color: t(isDark).textDim }}
                >
                  <FiChevronDown className="w-4 h-4" />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p
                      className="px-4 pb-4 text-sm leading-relaxed pt-3"
                      style={{
                        color: t(isDark).textMuted,
                        borderTop: `1px solid ${t(isDark).borderLight}`,
                      }}
                    >
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default FAQSection;
