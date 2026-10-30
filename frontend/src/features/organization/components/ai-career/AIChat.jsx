import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bot, FileText, Lightbulb, Menu, Target, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import getApiErrorMessage from "@/utils/getApiErrorMessage";
import { sendPrompt } from "@shared/services/ai.service";
import ChatHistory from "./ChatHistory";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";

const SUGGESTED_PROMPTS = [
  { text: "Create a practical roadmap for my next career role", icon: Target },
  { text: "Which skills should I prioritize for career growth?", icon: Lightbulb },
  { text: "Help me prepare for a promotion discussion", icon: TrendingUp },
  { text: "How can I make my resume more results-focused?", icon: FileText },
];
const MAX_SAVED_CONVERSATIONS = 50;

const createId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const createMessage = (role, content, extras = {}) => ({
  id: createId(),
  role,
  content,
  timestamp: new Date().toISOString(),
  ...extras,
});

const conversationTitle = (message) => {
  const normalized = message.replace(/\s+/g, " ").trim();
  return normalized.length > 52 ? `${normalized.slice(0, 52)}…` : normalized;
};

const loadConversationState = (storageKey) => {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (!stored || !Array.isArray(stored.conversations)) return { conversations: [], activeId: "" };
    const conversations = stored.conversations
      .filter((item) => item?.id && Array.isArray(item.messages))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    const activeId = conversations.some((item) => item.id === stored.activeId) ? stored.activeId : conversations[0]?.id || "";
    return { conversations, activeId };
  } catch {
    return { conversations: [], activeId: "" };
  }
};

export default function AIChat({ storageKey }) {
  const initialState = useMemo(() => loadConversationState(storageKey), [storageKey]);
  const [conversations, setConversations] = useState(initialState.conversations);
  const [activeId, setActiveId] = useState(initialState.activeId);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(() => window.innerWidth >= 1024);
  const [animateMessageId, setAnimateMessageId] = useState("");
  const messagesEndRef = useRef(null);

  const activeConversation = conversations.find((conversation) => conversation.id === activeId);
  const messages = activeConversation?.messages || [];

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        conversations: conversations.slice(0, MAX_SAVED_CONVERSATIONS),
        activeId,
      }));
    } catch (error) {
      if (import.meta.env.DEV) console.error("Unable to save AI conversations", error);
    }
  }, [activeId, conversations, storageKey]);

  const scrollToBottom = useCallback((behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);
  const handleTypingScroll = useCallback(() => scrollToBottom("auto"), [scrollToBottom]);
  const handleTypingComplete = useCallback((messageId) => {
    setAnimateMessageId((current) => current === messageId ? "" : current);
  }, []);

  useEffect(() => {
    scrollToBottom(messages.length > 1 ? "smooth" : "auto");
  }, [messages.length, sending, scrollToBottom]);

  const updateConversation = useCallback((conversationId, updater) => {
    setConversations((current) => current
      .map((conversation) => conversation.id === conversationId ? updater(conversation) : conversation)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
  }, []);

  const addUserMessage = (content) => {
    const userMessage = createMessage("user", content);
    const now = new Date().toISOString();
    const existing = conversations.find((conversation) => conversation.id === activeId);
    const conversationId = existing?.id || createId();

    if (existing) {
      updateConversation(conversationId, (conversation) => ({
        ...conversation,
        messages: [...conversation.messages, userMessage],
        updatedAt: now,
      }));
    } else {
      setConversations((current) => [{
        id: conversationId,
        title: conversationTitle(content),
        messages: [userMessage],
        createdAt: now,
        updatedAt: now,
      }, ...current].slice(0, MAX_SAVED_CONVERSATIONS));
      setActiveId(conversationId);
    }

    return { conversationId, userMessage };
  };

  const requestResponse = async (conversationId, prompt, targetMessageId = "") => {
    setSending(true);
    try {
      const content = await sendPrompt(prompt);
      const assistantMessage = createMessage("assistant", content);
      setAnimateMessageId(targetMessageId || assistantMessage.id);
      updateConversation(conversationId, (conversation) => ({
        ...conversation,
        messages: targetMessageId
          ? conversation.messages.map((message) => message.id === targetMessageId ? { ...assistantMessage, id: targetMessageId } : message)
          : [...conversation.messages, assistantMessage],
        updatedAt: new Date().toISOString(),
      }));
    } catch (error) {
      const errorMessage = getApiErrorMessage(error, "Unable to reach the AI Career Coach. Please try again.");
      if (targetMessageId) throw error;
      toast.error(errorMessage);
      updateConversation(conversationId, (conversation) => ({
        ...conversation,
        messages: [...conversation.messages, createMessage("assistant", "", { error: errorMessage, prompt })],
        updatedAt: new Date().toISOString(),
      }));
    } finally {
      setSending(false);
    }
  };

  const sendMessage = async (text = input) => {
    const prompt = text.trim();
    if (!prompt || sending) return;
    const { conversationId } = addUserMessage(prompt);
    setInput("");
    await requestResponse(conversationId, prompt);
  };

  const retryMessage = async (message) => {
    if (sending || !activeConversation) return;
    try {
      await requestResponse(activeConversation.id, message.prompt, message.id);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to retry this response."));
    }
  };

  const regenerateMessage = async (message) => {
    if (sending || !activeConversation) return;
    const assistantIndex = activeConversation.messages.findIndex((item) => item.id === message.id);
    const userMessage = [...activeConversation.messages.slice(0, assistantIndex)].reverse().find((item) => item.role === "user");
    if (!userMessage) return;

    try {
      await requestResponse(activeConversation.id, userMessage.content, message.id);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to regenerate this response."));
    }
  };

  const updateFeedback = (messageId, feedback) => {
    if (!activeConversation) return;
    updateConversation(activeConversation.id, (conversation) => ({
      ...conversation,
      messages: conversation.messages.map((message) => message.id === messageId ? { ...message, feedback } : message),
      updatedAt: new Date().toISOString(),
    }));
  };

  const renameConversation = (conversationId, title) => {
    updateConversation(conversationId, (conversation) => ({ ...conversation, title, updatedAt: new Date().toISOString() }));
  };

  const deleteConversation = (conversationId) => {
    const remaining = conversations.filter((conversation) => conversation.id !== conversationId);
    setConversations(remaining);
    if (conversationId === activeId) setActiveId(remaining[0]?.id || "");
  };

  return (
    <div className="relative flex min-h-0 flex-1 overflow-hidden">
      <ChatHistory
        conversations={conversations}
        activeId={activeId}
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onNew={() => { setActiveId(""); setInput(""); setHistoryOpen(window.innerWidth >= 1024); }}
        onSelect={(conversationId) => { setActiveId(conversationId); if (window.innerWidth < 1024) setHistoryOpen(false); }}
        onRename={renameConversation}
        onDelete={deleteConversation}
      />

      <section className="flex min-w-0 flex-1 flex-col bg-white dark:bg-slate-950/30">
        <div className="flex h-12 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 dark:border-slate-700 dark:bg-slate-900/90">
          <button type="button" onClick={() => setHistoryOpen(true)} aria-label="Open conversation history" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            <Menu className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{activeConversation?.title || "New conversation"}</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400">API-connected AI Career Coach</p>
          </div>
        </div>

        <div className="scrollbar-hide flex-1 overflow-y-auto bg-none px-4 py-5 sm:px-6 lg:px-8 dark:bg-none">
          <div className="mx-auto flex h-full min-h-[360px] max-w-5xl flex-col">
            {messages.length === 0 ? (
              <div className="my-auto rounded-3xl border border-slate-200/90 bg-white px-6 py-7 text-center shadow-[0_18px_50px_-28px_rgba(15,23,42,0.3)] dark:border-slate-800 dark:bg-slate-900 sm:px-9 sm:py-8">
                <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 text-white shadow-lg shadow-blue-500/20">
                  <Bot className="h-5 w-5" />
                </div>
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-blue-600 dark:text-cyan-400">Your private workspace</p>
                <h2 className="text-xl font-extrabold text-slate-950 dark:text-white sm:text-2xl">How can I help your career today?</h2>
                <p className="mx-auto mt-1.5 max-w-2xl text-sm leading-5 text-slate-500 dark:text-slate-400">Get focused guidance for skills, interviews, promotions, role transitions, and resume improvement.</p>
                <div className="mx-auto mt-3 grid max-w-3xl gap-2 sm:grid-cols-2">
                  {SUGGESTED_PROMPTS.map((suggestion) => (
                    <button key={suggestion.text} type="button" disabled={sending} onClick={() => sendMessage(suggestion.text)} className="group flex min-h-16 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-left transition hover:border-blue-300 hover:bg-white hover:shadow-[0_8px_24px_-16px_rgba(37,99,235,.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-500/60">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"><suggestion.icon className="h-4 w-4" /></span>
                      <span className="text-xs font-semibold leading-5 text-slate-700 dark:text-slate-200">{suggestion.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    animate={message.id === animateMessageId}
                    onRetry={retryMessage}
                    onRegenerate={regenerateMessage}
                    onFeedback={updateFeedback}
                    onTyping={handleTypingScroll}
                    onTypingComplete={handleTypingComplete}
                  />
                ))}
                {sending && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>
        <ChatInput value={input} onChange={setInput} onSend={() => sendMessage()} disabled={sending} />
      </section>
    </div>
  );
}
