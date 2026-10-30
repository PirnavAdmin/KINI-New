import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

const FAQ_DATA = [
  {
    q: "Do I need prior coding experience to join?",
    a: "It depends on the track. Full Stack, .NET, and AI programs need basic coding familiarity (200+ lines in any language). Data Science accepts strong Excel/SQL analysts. Leadership requires 3+ years of industry experience. Book a free consultation — our counsellors will assess your level and recommend the right starting point.",
  },
  {
    q: "Are classes live or recorded?",
    a: "All sessions are 100% live. Every session is recorded and uploaded to your dashboard within 6 hours. You get lifetime access to recordings even after the program ends. No one falls behind because of a missed class.",
  },
  {
    q: "What does placement support include?",
    a: "ATS-optimised resume review and rewrite, LinkedIn profile optimisation, GitHub portfolio curation, unlimited 1:1 mock interviews, warm referrals through our 200+ company alumni network, salary negotiation coaching, and continued support until you receive and accept an offer letter.",
  },
  {
    q: "What is the refund policy?",
    a: "7-day full refund if you have attended fewer than 3 live sessions. After 7 days, pro-rated refund based on sessions attended. We also offer program pause or track transfer at no extra fee for genuine emergencies.",
  },
  {
    q: "How large are the cohorts?",
    a: "Each live cohort is capped at 30 students. Mentor-to-student ratio is 1:15. We keep cohorts deliberately small because we compete on outcome quality, not enrolment volume.",
  },
  {
    q: "What projects will I build?",
    a: "Each program includes 3 production-grade projects deployed on AWS or Azure with live URLs. Examples include an enterprise HR system (.NET), a RAG-powered AI chatbot (AI track), and a full-stack e-commerce platform (Full Stack).",
  },
  {
    q: "What is the typical salary outcome?",
    a: "Average first salary post-placement: ₹14 LPA. Freshers typically land ₹7–10 LPA. Career switchers: ₹8–12 LPA. Experienced developers upgrading stacks: ₹12–22 LPA. AI/GenAI track graduates: ₹18–40 LPA.",
  },
  {
    q: "How quickly can I join after consultation?",
    a: "Most students join a live cohort within 7–14 days of their first consultation. Our counsellor calls within 24 hours of your form submission, walks through your options, and sends program details with batch schedule.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section
      className="relative py-20 sm:py-24 lg:py-28 overflow-hidden"
      style={{ background: "#071226" }}
    >
      {/* Top border glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(99,102,241,.3), transparent)",
        }}
      />

      <div className="max-w-3xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          data-aos="fade-up"
          data-aos-duration="800"
          className="text-center mb-12"
        >
          <p
            className="text-sm font-medium uppercase tracking-[0.2em] mb-3"
            style={{ color: "rgba(255,255,255,.35)" }}
          >
            Got Questions?
          </p>
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-bold"
            style={{ color: "rgba(255,255,255,.9)" }}
          >
            Frequently Asked{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(135deg, #60A5FA, #A855F7)",
              }}
            >
              Questions
            </span>
          </h2>
        </motion.div>

        {/* FAQ list */}
        <div className="space-y-3" data-aos="fade-up" data-aos-delay="150" data-aos-duration="800">
          {FAQ_DATA.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                layout
                className="rounded-2xl overflow-hidden transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,.02)",
                  border: `1px solid ${isOpen ? "rgba(99,102,241,.2)" : "rgba(255,255,255,.06)"}`,
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-3 p-5 text-left transition-colors duration-200"
                  style={{ color: "rgba(255,255,255,.85)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        background: "rgba(99,102,241,.1)",
                        color: "rgba(99,102,241,.6)",
                      }}
                    >
                      <HelpCircle size={14} />
                    </div>
                    <span className="text-sm sm:text-base font-medium">{item.q}</span>
                  </div>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="shrink-0"
                    style={{ color: "rgba(99,102,241,.5)" }}
                  >
                    <ChevronDown size={18} />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div
                        className="px-5 pb-5 text-sm leading-relaxed"
                        style={{
                          color: "rgba(255,255,255,.55)",
                          paddingLeft: 60,
                        }}
                      >
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
