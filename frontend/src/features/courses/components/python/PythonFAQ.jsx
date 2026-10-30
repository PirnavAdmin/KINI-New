import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";


const faqs = [
  {
    q: "Do I need coding experience?",
    a: "No. This program is designed for complete beginners. We start with fundamentals and gradually move toward advanced concepts through practical projects.",
  },
  {
    q: "Will I get placement support?",
    a: "Yes. You'll receive end-to-end career assistance including resume building, LinkedIn optimization, mock interviews, aptitude preparation, and placement drives.",
  },
  {
    q: "Is this live or recorded?",
    a: "You'll get the best of both worlds — live instructor-led classes along with lifetime access to session recordings.",
  },
  {
    q: "How long is the program?",
    a: "The curriculum is designed as a structured learning journey spanning several weeks, including projects, assignments, assessments, and career preparation.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);
  const navigate = useNavigate();

  const handleExpertClick = () => {
    navigate("/contact");
  };

  return (
    <section className="relative py-32 overflow-hidden bg-[#030712]">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[180px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[180px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="inline-flex items-center px-5 py-2 rounded-full border border-cyan-500/20 bg-white/5 backdrop-blur-xl text-cyan-300 text-sm font-medium">
            ❓ Support Center
          </span>

          <h2 className="mt-6 text-5xl md:text-6xl font-bold text-white">
            Frequently Asked
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>

          <p className="mt-6 text-slate-400 max-w-2xl mx-auto text-lg">
            Everything you need to know before joining our career-focused
            training programs.
          </p>
        </div>

        {/* FAQ Cards */}
        <div className="space-y-6">
          {faqs.map((item, index) => {
            const isOpen = open === index;

            return (
              <motion.div
                key={index}
                layout
                transition={{ duration: 0.3 }}
                className="
                  group
                  overflow-hidden
                  rounded-[28px]
                  border border-white/10
                  bg-white/[0.04]
                  backdrop-blur-2xl
                  hover:border-cyan-400/30
                  transition-all
                  duration-500
                "
              >
                <button
                  onClick={() => setOpen(isOpen ? null : index)}
                  className="
                    w-full
                    flex
                    items-center
                    justify-between
                    gap-5
                    p-7
                    text-left
                  "
                >
                  <h3 className="text-lg md:text-xl font-semibold text-white">
                    {item.q}
                  </h3>

                  <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="
                      flex-shrink-0
                      w-12
                      h-12
                      rounded-xl
                      bg-white/5
                      border border-white/10
                      flex items-center justify-center
                    "
                  >
                    <Plus className="w-5 h-5 text-cyan-400" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{
                        opacity: 1,
                        height: "auto",
                      }}
                      exit={{
                        opacity: 0,
                        height: 0,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-7 pb-7">
                        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-5" />

                        <p className="text-slate-400 leading-relaxed text-base">
                          {item.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div
            className="
              rounded-[32px]
              border border-white/10
              bg-white/[0.04]
              backdrop-blur-2xl
              p-10
            "
          >
            <h3 className="text-2xl font-bold text-white">
              Still have questions?
            </h3>

            <p className="text-slate-400 mt-3">
              Our admissions team is ready to help you choose the right career
              path.
            </p>

            <button
              onClick={handleExpertClick}
              className="
                mt-6
                inline-flex
                items-center
                gap-2
                px-8
                py-4
                rounded-2xl
                text-white
                font-semibold
                bg-gradient-to-r
                from-cyan-500
                via-blue-500
                to-purple-600
                shadow-[0_20px_60px_rgba(59,130,246,0.35)]
                hover:scale-105
                transition-all
                duration-300
              "
            >
              <MessageCircle size={18} />
              Talk to an Expert
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}