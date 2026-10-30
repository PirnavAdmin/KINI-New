import { Bot, Sparkles } from "lucide-react";
import MarkdownRenderer from "@shared/components/kini-assistant/MarkdownRenderer";
import MessageActions from "./MessageActions";
import TypingIndicator from "./TypingIndicator";

const formatTime = (value = Date.now()) =>
  new Intl.DateTimeFormat([], { hour: "2-digit", minute: "2-digit" }).format(new Date(value));

export default function ChatMessage({ message, onRegenerate, onFeedback, onSpeak }) {
  const isUser = message.role === "user";
  const isLoading = message.status === "loading";
  const isError = message.status === "error";

  return (
    <article className={`flex flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
      <div className="flex items-end gap-2">
        {!isUser ? (
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#085FA7]/15 to-[#5CA347]/15 text-[#085FA7] ring-1 ring-[#085FA7]/10 dark:text-cyan-300">
            {isLoading ? <Sparkles className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          </div>
        ) : null}

        <div
          className={`max-w-[min(44rem,82vw)] rounded-[1.6rem] px-4 py-3 text-sm leading-6 shadow-sm ${
            isUser
              ? "rounded-br-md bg-gradient-to-br from-[#085FA7] to-[#4B93D9] text-white shadow-[0_12px_28px_rgba(8,95,167,0.16)]"
              : isError
                ? "rounded-bl-md border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-200"
                : "rounded-bl-md border border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          }`}
        >
          {isLoading ? (
            <TypingIndicator />
          ) : isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
        </div>
      </div>

      <div className={`flex flex-col gap-2 px-1 ${isUser ? "items-end" : "items-start"}`}>
        <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500">
          <span>{formatTime(message.createdAt)}</span>
          {isError ? <span className="rounded-full bg-rose-100 px-2 py-0.5 font-semibold text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">Error</span> : null}
        </div>
        {!isUser ? <MessageActions message={message} onRegenerate={onRegenerate} onFeedback={onFeedback} onSpeak={onSpeak} /> : null}
      </div>
    </article>
  );
}
