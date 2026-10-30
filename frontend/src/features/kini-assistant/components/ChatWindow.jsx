import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";
import { useAssistantContext } from "../contexts/AssistantContext";
import AssistantHeader from "./AssistantHeader";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import ConversationSidebar from "./ConversationSidebar";
import QuickActions from "./QuickActions";
import WelcomeState from "@shared/components/kini-assistant/WelcomeState";

export default function ChatWindow() {
  const {
    messages,
    input,
    setInput,
    isSending,
    lastContext,
    selectedCourse,
    selectedMentor,
    learningGoal,
    careerGoal,
    language,
    clearChat,
    sendMessage,
    retryMessage,
    markFeedback,
    quickPrompts,
    suggestedActions,
  } = useAssistantContext();

  const [open, setOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(true);
  const [showJumpToBottom, setShowJumpToBottom] = useState(false);
  const [hasOpenDialog, setHasOpenDialog] = useState(false);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  const messageCountLabel = `${messages.length} message${messages.length === 1 ? "" : "s"}`;
  const welcomeSuggestions = useMemo(
    () => suggestedActions.slice(0, 4),
    [suggestedActions],
  );
  const sidebarContext = useMemo(
    () => ({
      ...lastContext,
      selectedCourse,
      selectedMentor,
      learningGoal,
      careerGoal,
      language,
    }),
    [
      careerGoal,
      language,
      learningGoal,
      lastContext,
      selectedCourse,
      selectedMentor,
    ],
  );

  useEffect(() => {
    if (!open) return;
    textareaRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 132)}px`;
  }, [input]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    const update = () => {
      setHasOpenDialog(
        Boolean(document.querySelector('[role="dialog"][aria-modal="true"]')),
      );
    };

    update();

    const observer = new MutationObserver(update);
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["role", "aria-modal", "class", "style"],
    });

    window.addEventListener("resize", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    setShowJumpToBottom(false);
  }, [messages, open, isSending]);

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
    setShowJumpToBottom(false);
  };

  const onSend = () => sendMessage();
  const portalTarget = typeof document !== "undefined" ? document.body : null;
  const portalContent = (
    <>
      {!open && !hasOpenDialog ? (
        <motion.button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label="Open Kini Assistant"
          aria-expanded={open}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="fixed bottom-20 right-4 z-[80] grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#085FA7] via-[#0A6BB5] to-[#5CA347] text-white shadow-[0_14px_36px_rgba(8,95,167,0.24)] ring-1 ring-white/50 backdrop-blur sm:bottom-6 sm:right-6"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/14">
            <Sparkles className="h-5 w-5" />
          </span>
        </motion.button>
      ) : null}

      <AnimatePresence>
        {open && (
          <motion.section
            role="dialog"
            aria-label="Kini Assistant"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 z-[90] h-[92dvh] w-full overflow-hidden rounded-t-[2rem] border border-slate-200 bg-white/92 shadow-[0_-24px_80px_rgba(15,23,42,0.22)] backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-950/92 sm:inset-auto sm:bottom-[5.75rem] sm:right-6 sm:h-[min(82dvh,46rem)] sm:w-[min(72rem,calc(100vw-1.5rem))] sm:rounded-[1.8rem]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(8,95,167,0.12),transparent_30%),radial-gradient(circle_at_top_right,rgba(92,163,71,0.12),transparent_25%)]" />

            <div className="relative flex h-full min-h-0 flex-col">
              <AssistantHeader
                messageCountLabel={messageCountLabel}
                insightsOpen={insightsOpen}
                onToggleInsights={() => setInsightsOpen((value) => !value)}
                onClearChat={clearChat}
                onClose={() => setOpen(false)}
              />

              <div
                className={`relative grid min-h-0 flex-1 ${insightsOpen ? "lg:grid-cols-[minmax(0,1fr)_19rem]" : "lg:grid-cols-1"}`}
              >
                <div className="flex min-h-0 flex-col">
                  <div
                    ref={scrollRef}
                    onScroll={(event) => {
                      const { scrollTop, scrollHeight, clientHeight } =
                        event.currentTarget;
                      setShowJumpToBottom(
                        scrollHeight - scrollTop - clientHeight > 120,
                      );
                    }}
                    className="relative min-h-0 flex-1 overflow-y-auto scroll-smooth px-3 py-4 sm:px-5 sm:py-5"
                  >
                    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
                      {!messages.length ? (
                        <WelcomeState
                          title="Hi, I'm Kini Assistant"
                          subtitle="I can answer questions about your learning, courses, assessments, mentors, placements, and more."
                          suggestions={welcomeSuggestions}
                          onPick={sendMessage}
                        />
                      ) : (
                        <>
                          <QuickActions
                            items={quickPrompts
                              .slice(0, 4)
                              .map((prompt) => ({ label: prompt, prompt }))}
                            onPick={sendMessage}
                          />
                          <div className="space-y-4">
                            {messages.map((message) => (
                              <ChatMessage
                                key={message.id}
                                message={message}
                                onRegenerate={retryMessage}
                                onFeedback={markFeedback}
                                onSpeak={(currentMessage) => {
                                  if (
                                    !window.speechSynthesis ||
                                    typeof window.SpeechSynthesisUtterance ===
                                      "undefined" ||
                                    !currentMessage?.content
                                  )
                                    return;
                                  const utterance =
                                    new window.SpeechSynthesisUtterance(
                                      currentMessage.content.replace(
                                        /[#*_>`]/g,
                                        "",
                                      ),
                                    );
                                  utterance.rate = 1;
                                  utterance.pitch = 1;
                                  window.speechSynthesis.cancel();
                                  window.speechSynthesis.speak(utterance);
                                }}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    <AnimatePresence>
                      {showJumpToBottom ? (
                        <motion.button
                          type="button"
                          onClick={scrollToBottom}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-lg shadow-slate-900/10 transition hover:border-[#085FA7]/20 hover:text-[#085FA7] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                          Latest
                        </motion.button>
                      ) : null}
                    </AnimatePresence>
                  </div>

                  <ChatInput
                    input={input}
                    onInputChange={setInput}
                    onSubmit={onSend}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        onSend();
                      }
                    }}
                    isSending={isSending}
                    textareaRef={textareaRef}
                  />
                </div>

                <AnimatePresence initial={false}>
                  {insightsOpen ? (
                    <motion.aside
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                      transition={{ duration: 0.18 }}
                      className="hidden min-h-0 border-l border-slate-200/80 bg-slate-50/70 backdrop-blur xl:block dark:border-slate-800/80 dark:bg-slate-950/70"
                    >
                      <ConversationSidebar context={sidebarContext} />
                    </motion.aside>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );

  return portalTarget ? createPortal(portalContent, portalTarget) : null;
}
