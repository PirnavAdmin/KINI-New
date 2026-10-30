import { motion } from "framer-motion";
import { RefreshCcw } from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";
import TypingIndicator from "./TypingIndicator";

const formatTime = (value = Date.now()) =>
  new Intl.DateTimeFormat([], { hour: "2-digit", minute: "2-digit" }).format(new Date(value));

export default function MessageBubble({ message, onRetry }) {
  const isUser = message.role === "user";
  const isLoading = message.status === "loading";
  const isError = message.status === "error";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18 }}
      className={`flex flex-col gap-1.5 ${isUser ? "items-end" : "items-start"}`}
    >
      <div className="flex items-end gap-2">
        {!isUser ? (
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#085FA7]/15 to-[#5CA347]/15 text-[#085FA7] ring-1 ring-[#085FA7]/10 dark:text-cyan-300">
            {isLoading ? <span className="h-2 w-2 rounded-full bg-current" /> : <span className="text-[10px] font-bold">K</span>}
          </div>
        ) : null}

        <div
          className={`max-w-[min(42rem,82vw)] rounded-[1.6rem] px-4 py-3 text-sm leading-6 shadow-sm ${
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

      <div className={`flex items-center gap-2 px-1 text-[10px] text-slate-400 dark:text-slate-500 ${isUser ? "justify-end" : "justify-start"}`}>
        <span>{formatTime(message.createdAt)}</span>
        {isError && message.prompt ? (
          <button
            type="button"
            onClick={() => onRetry?.(message)}
            className="inline-flex items-center gap-1 font-semibold text-rose-600 hover:underline dark:text-rose-300"
          >
            <RefreshCcw className="h-3 w-3" />
            Retry
          </button>
        ) : null}
      </div>
    </motion.div>
  );
}
