import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Bot, User, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const faqs = [
  {
    q: "Do I need coding experience?",
    a: "No. We start from basics and go to advanced AI & GenAI.",
  },
  {
    q: "Will I build real projects?",
    a: "Yes — chatbots, ML models, NLP apps, and GenAI systems.",
  },
  {
    q: "Do you provide placement support?",
    a: "Yes — resume, interviews, referrals, and portfolio help.",
  },
  {
    q: "Will I learn ChatGPT & AI tools?",
    a: "Yes — OpenAI, LLMs, RAG, LangChain, prompt engineering.",
  },
];

export default function AiFAQChat() {
  const [open, setOpen] = useState(0);
  const navigate = useNavigate();

  return (
    <section className="relative py-14 bg-[#030712] overflow-hidden">

      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-60 h-60 bg-cyan-500/10 blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-60 h-60 bg-purple-500/10 blur-[120px]" />

      <div className="relative z-10 max-w-3xl mx-auto px-4">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-cyan-300 text-xs">
            <MessageCircle size={14} />
            AI Assistant
          </div>

          <h2 className="text-3xl font-bold text-white mt-4">
            Ask Me Anything
          </h2>

          <p className="text-slate-400 text-sm mt-2">
            AI-powered course assistant answers your doubts
          </p>
        </motion.div>

        {/* Chat Container */}
        <div className="space-y-4">

          {faqs.map((item, i) => (
            <div key={i}>

              {/* USER MESSAGE */}
              <div className="flex justify-end">
                <div className="flex items-end gap-2 max-w-[80%]">

                  <div className="bg-blue-600/20 border border-blue-500/20 text-white text-xs px-4 py-2 rounded-2xl rounded-br-none backdrop-blur-xl">
                    {item.q}
                  </div>

                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                    <User size={14} className="text-blue-400" />
                  </div>

                </div>
              </div>

              {/* BOT MESSAGE */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex justify-start mt-2"
              >
                <div className="flex items-start gap-2 max-w-[85%]">

                  <div className="w-7 h-7 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
                    <Bot size={14} className="text-white" />
                  </div>

                  <div className="bg-white/5 border border-white/10 text-slate-300 text-xs px-4 py-2 rounded-2xl rounded-bl-none backdrop-blur-xl">
                    {item.a}
                  </div>

                </div>
              </motion.div>

            </div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mt-10 text-center"
        >
          <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6">

            <h3 className="text-lg font-bold text-white">
              Need More Help?
            </h3>

            <p className="text-slate-400 text-xs mt-1">
              Talk directly with our AI advisors
            </p>

            <div className="flex justify-center gap-3 mt-4">

              <button
                onClick={() => navigate("/contact")}
                className="px-5 py-2 rounded-xl text-xs font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 transition"
              >
                Chat Now
              </button>

              <button
                onClick={() => navigate("/ai-curriculum")}
                className="px-5 py-2 rounded-xl text-xs font-medium text-white bg-white/5 border border-white/10 flex items-center gap-1"
              >
                Curriculum <ArrowRight size={14} />
              </button>

            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}