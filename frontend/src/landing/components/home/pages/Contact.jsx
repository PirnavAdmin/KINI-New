import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MapPin, ArrowUpRight, Zap, Building2, RefreshCw, ShieldCheck } from "lucide-react";
import Navbar from "@landing-shared/components/navbar";
import Seo from "@landing-shared/components/Seo";
import Footer from "@landing-shared/components/Footer";
import GetInTouchFormFields from "@landing-shared/components/GetInTouchFormFields";
import { useThemeContext } from "@landing-shared/context/ThemeContext";

// ─── Design tokens ───────────────────────────────────────────────────────────
const EASE = [0.16, 0.8, 0.3, 1];

// Swap for a real office/team photo when available.
const HERO_IMAGE =
  "https://i.pinimg.com/1200x/df/d8/da/dfd8daa35cd2985d221f17dd5512c43c.jpg";

// ─── FAQ Data ────────────────────────────────────────────────────────────────
const FAQS = [
  {
    icon: Zap,
    q: "How quickly can I get started?",
    a: "Immediately. After registering, you'll have instant access to all platform features.",
  },
  {
    icon: Building2,
    q: "Do you offer enterprise pricing?",
    a: "Yes. Contact our sales team for custom enterprise plans tailored to your organization's size and needs.",
  },
  {
    icon: RefreshCw,
    q: "Can I change my plan later?",
    a: "Absolutely. You can upgrade, downgrade, or cancel your subscription at any time.",
  },
  {
    icon: ShieldCheck,
    q: "Is my data secure?",
    a: "Enterprise-grade security with SOC 2 compliance, end-to-end encryption, and role-based access controls.",
  },
];

const OFFICE_ADDRESS = "Kini Edx Hub";

// ─── Updated map embed — from the provided iframe src ────────────────────────
const MAP_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15224.502453297702!2d78.36597487093385!3d17.453700905058!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb91bdc55868d5%3A0xaf7031e24e2af1c!2sKini%20Edx%20Hub!5e0!3m2!1sen!2sin!4v1786613077461!5m2!1sen!2sin";

const DIRECTIONS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(OFFICE_ADDRESS)}`;

// ═════════════════════════════════════════════════════════════════════════════
// CONTACT PAGE
// ═════════════════════════════════════════════════════════════════════════════

export default function Contact() {
  const { isDark } = useThemeContext();
  const prefersReducedMotion = useReducedMotion();
  const [openFaq, setOpenFaq] = useState(0);

  const rise = (delay = 0) => ({
    initial: { opacity: 0, y: prefersReducedMotion ? 0 : 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: EASE, delay },
  });

  return (
    <>
      <Seo
        title="Contact Us"
        description="Get in touch with Kini Edx Hub for course details, admissions, corporate training or placement support."
        path="/contact"
      />
      <Navbar />

      {/* ─── HERO (dark image banner + overlapping intro card) ─── */}
      <section className="relative">
        {/* Dark image hero */}
        <div className="relative min-h-[300px] w-full overflow-hidden sm:min-h-[340px] lg:min-h-[380px]">
          <img
            src={HERO_IMAGE}
            alt="Kini team ready to help"
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(100deg, rgba(11,53,84,0.90) 0%, rgba(11,53,84,0.62) 45%, rgba(11,53,84,0.32) 100%)",
            }}
          />

          <div className="relative mx-auto flex max-w-7xl flex-col justify-start px-5 pt-8 pb-20 sm:pt-10 sm:pb-24 lg:pt-12 lg:pb-28">
            <motion.span
              {...rise(0)}
              className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-white backdrop-blur-xl"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              Get in Touch
            </motion.span>

            <motion.h1
              {...rise(0.08)}
              className="max-w-2xl text-[2.2rem] font-extrabold leading-[1.05] tracking-tight text-white sm:text-4xl md:text-5xl"
            >
              We'd Love to
              <span className="block bg-gradient-to-r from-secondary-400 to-secondary-500 bg-clip-text text-transparent">
                Hear From You
              </span>
            </motion.h1>

            <motion.p
              {...rise(0.16)}
              className="mt-3 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg"
            >
              Have a question, need support, or want to discuss enterprise plans? Our team is here to help.
            </motion.p>
          </div>
        </div>

        {/* Overlapping intro card */}
        <div className="relative z-10 mx-auto -mt-14 max-w-7xl px-5 sm:-mt-16 lg:-mt-20">
          <motion.div
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.5, ease: EASE }}
            className={`grid gap-4 rounded-3xl border p-5 shadow-xl sm:grid-cols-2 sm:p-6 lg:gap-6 lg:p-7 ${
              isDark ? "border-white/10 bg-slate-900" : "border-[#CFE1EF] bg-white"
            }`}
          >
            <div className="flex items-start gap-3 rounded-2xl p-4">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  isDark ? "bg-primary-500/15 text-primary-300" : "bg-primary-100 text-primary-600"
                }`}
              >
                <MapPin className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-white/40" : "text-slate-400"}`}>
                  Visit us
                </p>
                <p className={`mt-0.5 text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                  {OFFICE_ADDRESS}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl p-4">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  isDark ? "bg-secondary-500/15 text-secondary-300" : "bg-secondary-50 text-secondary-600"
                }`}
              >
                <Zap className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-white/40" : "text-slate-400"}`}>
                  Fast response
                </p>
                <p className={`mt-0.5 text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                  We usually reply within 24 hours
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FORM + CONTENT ── */}
      <section className={`py-10 sm:py-12 ${isDark ? "bg-app-dark-gradient" : "bg-slate-50"}`}>
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid gap-10 lg:grid-cols-[440px_1fr] lg:gap-12">

            {/* ── LEFT: sticky form ── */}
            <aside className="lg:sticky lg:top-[110px] lg:h-fit">
              <motion.div
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.6, ease: EASE }}
                className="relative overflow-hidden rounded-[28px] border shadow-elevated"
                style={{
                  borderColor: isDark ? "rgba(255,255,255,0.1)" : "#CFE1EF",
                  boxShadow: isDark
                    ? "0 24px 60px -20px rgba(0,0,0,0.6)"
                    : "0 24px 60px -20px rgba(19,59,93,0.25)",
                }}
              >
                <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-primary-500/20 blur-3xl" />
                <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/40" />
                <div className={`relative p-6 backdrop-blur-xl sm:p-7 ${isDark ? "bg-slate-950/60" : "bg-white/70"}`}>
                  <GetInTouchFormFields heading="Get In Touch" />
                </div>
              </motion.div>
            </aside>

            {/* ── RIGHT: map + FAQ ── */}
            <div className="min-w-0 space-y-12 lg:space-y-16">

              {/* Map */}
              <motion.div
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <div className="mb-4 flex items-end justify-between gap-4">
                  <h2 className={`text-xl font-extrabold sm:text-2xl ${isDark ? "text-white" : "text-slate-900"}`}>
                    Visit Our Office
                  </h2>
                  <a
                    href={DIRECTIONS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex shrink-0 items-center gap-1 rounded-full bg-secondary-500 text-primary-700 border border-secondary-500 px-4 py-2 text-sm font-semibold shadow-md transition-all duration-300 hover:bg-secondary-600 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500 focus-visible:ring-offset-2"
                  >
                    Get directions
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </div>

                {/* Map container — updated iframe matching the provided embed code */}
                <div
                  className={`relative overflow-hidden rounded-[28px] border shadow-lg transition-shadow duration-300 hover:shadow-xl ${
                    isDark ? "border-white/[0.08]" : "border-[#CFE1EF]"
                  }`}
                  style={{ paddingBottom: "56.25%", height: 0 }} /* 16:9 responsive ratio */
                >
                  <iframe
                    title="Kini Edx Hub office location"
                    src={MAP_SRC}
                    width="600"
                    height="450"
                    style={{ border: 0 }}
                    className="absolute inset-0 h-full w-full grayscale-[15%]"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />

                  {/* Address overlay */}
                  <div
                    className={`absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-2xl border p-4 shadow-lg backdrop-blur-xl sm:right-auto sm:max-w-xs ${
                      isDark ? "border-white/10 bg-slate-950/85" : "border-[#CFE1EF] bg-white/90"
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        isDark ? "bg-primary-500/15 text-primary-300" : "bg-primary-100 text-primary-600"
                      }`}
                    >
                      <MapPin className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className={`text-xs font-medium leading-snug ${isDark ? "text-white" : "text-slate-900"}`}>
                        {OFFICE_ADDRESS}
                      </p>
                      <a
                        href={DIRECTIONS_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold sm:hidden ${
                          isDark ? "text-primary-300" : "text-primary-600"
                        }`}
                      >
                        Get directions <ArrowUpRight className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* FAQ */}
              <div>
                <motion.div
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="mb-5"
                >
                  <h2 className={`text-xl font-extrabold sm:text-2xl ${isDark ? "text-white" : "text-slate-900"}`}>
                    Frequently Asked Questions
                  </h2>
                  <p className={`mt-1.5 text-sm ${isDark ? "text-white/50" : "text-slate-500"}`}>
                    Can't find what you're looking for? Send us a message.
                  </p>
                </motion.div>

                <div className="space-y-2.5">
                  {FAQS.map((faq, i) => {
                    const isOpen = openFaq === i;
                    const Icon = faq.icon;
                    return (
                      <motion.div
                        key={faq.q}
                        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.3 }}
                        transition={{ duration: 0.4, ease: EASE, delay: i * 0.06 }}
                        className={`overflow-hidden rounded-2xl border transition-colors duration-200 ${
                          isDark
                            ? `bg-white/[0.03] ${isOpen ? "border-primary-500/30" : "border-white/[0.06]"}`
                            : `bg-white shadow-[0_2px_8px_rgba(19,59,93,0.06)] ${isOpen ? "border-primary-300" : "border-[#CFE1EF]"}`
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaq(isOpen ? null : i)}
                          aria-expanded={isOpen}
                          aria-controls={`faq-panel-${i}`}
                          className="flex w-full items-center gap-4 rounded-2xl p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60 focus-visible:ring-offset-2"
                        >
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors duration-200 ${
                              isOpen
                                ? isDark
                                  ? "bg-primary-500/20 text-primary-300"
                                  : "bg-primary-100 text-primary-600"
                                : isDark
                                ? "bg-white/5 text-white/40"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <span
                            className={`flex-1 text-sm font-semibold sm:text-base ${
                              isDark ? "text-white" : "text-slate-900"
                            }`}
                          >
                            {faq.q}
                          </span>
                          <ArrowUpRight
                            className={`h-4 w-4 shrink-0 transition-transform duration-300 ${
                              isOpen ? "rotate-45" : "rotate-0"
                            } ${isDark ? "text-white/40" : "text-slate-400"}`}
                          />
                        </button>

                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              id={`faq-panel-${i}`}
                              key="content"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: EASE }}
                              className="overflow-hidden"
                            >
                              <p
                                className={`px-4 pb-4 pl-[3.5rem] text-sm leading-relaxed ${
                                  isDark ? "text-white/50" : "text-slate-500"
                                }`}
                              >
                                {faq.a}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      <Footer compact />
    </>
  );
}