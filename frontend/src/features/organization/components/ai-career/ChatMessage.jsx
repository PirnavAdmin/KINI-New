import { Children, isValidElement, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, Check, Clipboard, Copy, RefreshCw, ThumbsDown, ThumbsUp, User } from "lucide-react";

const nodeText = (node) => {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join("");
  if (isValidElement(node)) return nodeText(node.props.children);
  return "";
};

function CodeBlock({ children }) {
  const [copied, setCopied] = useState(false);
  const code = nodeText(children).replace(/\n$/, "");
  const child = Children.toArray(children)[0];
  const language = isValidElement(child)
    ? String(child.props.className || "").replace("language-", "")
    : "";

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-slate-700 bg-slate-950 text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2 text-[10px] uppercase tracking-wider text-slate-400">
        <span>{language || "code"}</span>
        <button type="button" onClick={copyCode} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 normal-case text-slate-300 hover:bg-slate-800 hover:text-white">
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-6"><code>{code}</code></pre>
    </div>
  );
}

const markdownComponents = {
  pre: CodeBlock,
  code: ({ children, className }) => (
    <code className={className || "rounded bg-slate-200 px-1.5 py-0.5 text-[0.9em] text-slate-900 dark:bg-slate-700 dark:text-slate-100"}>{children}</code>
  ),
  h1: ({ children }) => <h1 className="mb-2 mt-4 text-lg font-bold first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-2 mt-4 text-base font-bold first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-1.5 mt-3 text-sm font-bold">{children}</h3>,
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-5">{children}</ol>,
  a: ({ children, href }) => <a href={href} target="_blank" rel="noreferrer" className="font-medium text-blue-600 underline underline-offset-2 dark:text-cyan-400">{children}</a>,
  blockquote: ({ children }) => <blockquote className="my-3 border-l-4 border-blue-400 bg-blue-50 px-3 py-2 text-slate-600 dark:bg-blue-500/10 dark:text-slate-300">{children}</blockquote>,
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function ChatMessage({ message, animate, onRetry, onRegenerate, onFeedback, onTyping, onTypingComplete }) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [displayedContent, setDisplayedContent] = useState(animate ? "" : message.content);
  const animatedRef = useRef(!animate);

  useEffect(() => {
    if (!animate || animatedRef.current || !message.content) {
      setDisplayedContent(message.content);
      return undefined;
    }

    let index = 0;
    const timer = window.setInterval(() => {
      index = Math.min(message.content.length, index + 5);
      setDisplayedContent(message.content.slice(0, index));
      onTyping?.();
      if (index >= message.content.length) {
        window.clearInterval(timer);
        animatedRef.current = true;
        onTypingComplete?.(message.id);
      }
    }, 12);
    return () => window.clearInterval(timer);
  }, [animate, message.content, message.id, onTyping, onTypingComplete]);

  const copyResponse = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-white shadow-sm ${isUser ? "bg-gradient-to-br from-blue-600 to-teal-500" : "bg-gradient-to-br from-emerald-500 to-teal-600"}`}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className={`min-w-0 max-w-[88%] sm:max-w-[78%] ${isUser ? "items-end" : "items-start"}`}>
        {message.error ? (
          <div className="rounded-2xl rounded-tl-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            <p>{message.error}</p>
            <button type="button" onClick={() => onRetry(message)} className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700">
              <RefreshCw className="h-3 w-3" /> Retry
            </button>
          </div>
        ) : (
          <div className={`rounded-2xl px-4 py-3 text-sm leading-6 ${isUser ? "rounded-tr-md bg-gradient-to-br from-blue-600 to-teal-500 text-white" : "rounded-tl-md border border-slate-200 bg-white text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"}`}>
            {isUser ? (
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            ) : (
              <div className="break-words">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{displayedContent}</ReactMarkdown>
              </div>
            )}
          </div>
        )}

        <div className={`mt-1 flex flex-wrap items-center gap-1 text-[10px] text-slate-400 ${isUser ? "justify-end" : ""}`}>
          <span>{isUser ? "You" : "AI Career Coach"}{formatTime(message.timestamp) ? ` · ${formatTime(message.timestamp)}` : ""}</span>
          {!isUser && !message.error && (
            <div className="ml-1 flex items-center gap-0.5">
              <button type="button" onClick={copyResponse} title="Copy response" aria-label="Copy response" className="rounded-md p-1.5 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white">
                {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Clipboard className="h-3 w-3" />}
              </button>
              <button type="button" onClick={() => onRegenerate(message)} title="Regenerate response" aria-label="Regenerate response" className="rounded-md p-1.5 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white">
                <RefreshCw className="h-3 w-3" />
              </button>
              <button type="button" onClick={() => onFeedback(message.id, message.feedback === "like" ? "" : "like")} title="Helpful" aria-label="Mark response helpful" className={`rounded-md p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 ${message.feedback === "like" ? "text-emerald-500" : ""}`}>
                <ThumbsUp className="h-3 w-3" />
              </button>
              <button type="button" onClick={() => onFeedback(message.id, message.feedback === "dislike" ? "" : "dislike")} title="Not helpful" aria-label="Mark response not helpful" className={`rounded-md p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 ${message.feedback === "dislike" ? "text-rose-500" : ""}`}>
                <ThumbsDown className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}
