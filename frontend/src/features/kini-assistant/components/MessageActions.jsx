import { Check, Copy, MessageSquareReply, Mic, ThumbsDown, ThumbsUp } from "lucide-react";

const buttonClass =
  "grid h-8 w-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-[#085FA7]/20 hover:text-[#085FA7] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:text-cyan-300";

export default function MessageActions({ message, onRegenerate, onFeedback, onSpeak }) {
  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(message?.content || "");
      onFeedback?.(message?.id, "copied");
    } catch {
      // Clipboard is best effort only.
    }
  };

  const disabled = message?.status === "loading";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className={buttonClass} onClick={copyText} disabled={disabled} aria-label="Copy response" title="Copy">
        <Copy className="h-3.5 w-3.5" />
      </button>
      <button type="button" className={buttonClass} onClick={() => onSpeak?.(message)} disabled={disabled} aria-label="Read response" title="Read response">
        <Mic className="h-3.5 w-3.5" />
      </button>
      <button type="button" className={buttonClass} onClick={() => onRegenerate?.(message)} disabled={disabled} aria-label="Regenerate response" title="Regenerate">
        <MessageSquareReply className="h-3.5 w-3.5" />
      </button>
      <button type="button" className={buttonClass} onClick={() => onFeedback?.(message?.id, "like")} disabled={disabled} aria-label="Like response" title="Like">
        <ThumbsUp className="h-3.5 w-3.5" />
      </button>
      <button type="button" className={buttonClass} onClick={() => onFeedback?.(message?.id, "dislike")} disabled={disabled} aria-label="Dislike response" title="Dislike">
        <ThumbsDown className="h-3.5 w-3.5" />
      </button>
      {message?.feedback === "copied" ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"><Check className="h-3 w-3" />Copied</span> : null}
    </div>
  );
}
