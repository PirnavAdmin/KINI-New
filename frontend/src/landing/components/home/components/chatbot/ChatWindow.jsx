// ============================================================
// ChatWindow.jsx — chat panel: header, messages, input
// ============================================================
import { useState, useRef, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, RotateCcw } from "lucide-react";
import ChatMessage, { QuickActionGrid } from "./ChatMessage";
import { detectIntent, buildResponse, buildRecommendResponse } from "./chatbotUtils";

const GRAD = "linear-gradient(135deg, #133B5D 0%, #35608A 50%, #F39924 100%)";

const WELCOME = {
  id: 0,
  role: "bot",
  data: {
    type: "text",
    text: "Hi! 👋 I'm the **Kini Edx Hub AI Course Advisor**.\n\nI can help you explore courses, pricing, learning modes, mentors, projects, training, and enrollment.\n\nWhat would you like to know?",
    showQuickActions: true,
  },
};

let msgIdCounter = 1;

export default function ChatWindow({ onClose, isDark }) {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [recommendState, setRecommendState] = useState(null);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    // small delay so panel animation finishes first
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  function addUserMessage(text) {
    return { id: msgIdCounter++, role: "user", text };
  }

  function addBotMessage(data) {
    return { id: msgIdCounter++, role: "bot", data };
  }

  function handleSend(text) {
    const trimmed = (text || input).trim();
    if (!trimmed) return;
    setInput("");

    const userMsg = addUserMessage(trimmed);
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);

    setTimeout(() => {
      let responseData;

      // Are we mid-recommendation flow?
      if (recommendState) {
        responseData = buildRecommendResponse(recommendState, trimmed);
        // Clear recommend state if we hit the result
        if (responseData.type === "recommend_result") setRecommendState(null);
        else if (responseData.nextState)              setRecommendState(responseData.nextState);
      } else {
        const intentResult = detectIntent(trimmed);
        responseData = buildResponse(intentResult);
        if (responseData.nextState) setRecommendState(responseData.nextState);
      }

      setTyping(false);
      setMessages(prev => [...prev, addBotMessage(responseData)]);
    }, 600);
  }

  function handleQuickAction({ text, recommendState: rs }) {
    if (rs) setRecommendState(rs);
    handleSend(text);
  }

  function handleReset() {
    setMessages([WELCOME]);
    setRecommendState(null);
    setInput("");
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 12 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={`flex flex-col overflow-hidden rounded-2xl shadow-2xl border
        ${isDark
          ? "bg-slate-900 border-slate-700"
          : "bg-slate-50 border-slate-200"
        }
      `}
      style={{
        width: "min(420px, calc(100vw - 32px))",
        height: "min(680px, calc(100dvh - 96px))",
      }}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-4 py-3 shrink-0"
        style={{ background: GRAD }}
      >
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <Bot size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm leading-tight">Kini AI Assistant</p>
          <p className="text-white/70 text-xs truncate">Your Kini Edx Hub Course Advisor</p>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
          <span className="text-white/70 text-xs mr-2">Online</span>
        </div>
        <button
          onClick={handleReset}
          className="text-white/70 hover:text-white transition-colors p-1"
          title="Reset chat"
        >
          <RotateCcw size={14} />
        </button>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white transition-colors p-1"
          title="Close"
        >
          <X size={18} />
        </button>
      </div>

      {/* ── Messages ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-1">
        {messages.map(msg => (
          <ChatMessage
            key={msg.id}
            message={msg}
            isDark={isDark}
            onQuickAction={handleQuickAction}
          />
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {typing && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 mb-3"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ background: GRAD }}
              >
                K
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-sm px-3.5 py-2.5 flex gap-1 items-center shadow-sm">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-slate-400"
                    style={{ animation: `bounce 1.2s ${i * 0.2}s infinite` }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ───────────────────────────────────── */}
      <div
        className={`px-3 py-2.5 shrink-0 border-t ${
          isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
        }`}
      >
        <div className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 ${
          isDark
            ? "bg-slate-800 border-slate-600"
            : "bg-slate-50 border-slate-200"
        }`}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="Ask about courses, pricing, mentors…"
            className={`flex-1 bg-transparent text-sm outline-none ${
              isDark ? "text-slate-100 placeholder-slate-500" : "text-slate-700 placeholder-slate-400"
            }`}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
              input.trim()
                ? "opacity-100 cursor-pointer"
                : "opacity-30 cursor-default"
            }`}
            style={{ backgroundColor: "#F39924" }}
          >
            <Send size={13} className="text-primary-700" />
          </button>
        </div>
        <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-1.5">
          Kini Edx Hub AI · Answers based on configured data only
        </p>
      </div>
    </motion.div>
  );
}

// ── Bounce keyframes injected globally ───────────────────────
if (typeof document !== "undefined" && !document.getElementById("kini-chat-styles")) {
  const s = document.createElement("style");
  s.id = "kini-chat-styles";
  s.textContent = `
    @keyframes bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30%            { transform: translateY(-4px); }
    }
  `;
  document.head.appendChild(s);
}