import { Paperclip, Send } from "lucide-react";

export default function ChatInput({ value, onChange, onSend, disabled }) {
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!disabled && value.trim()) onSend();
    }
  };

  return (
    <div className="border-t border-slate-200 bg-white/95 px-3 py-2.5 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 sm:px-5">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_10px_35px_-18px_rgba(15,23,42,0.35)] transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:focus-within:border-blue-500">
          <button
            type="button"
            disabled
            title="Attachments will be available in a future update"
            aria-label="Attach a file (coming soon)"
            className="grid h-10 w-10 shrink-0 cursor-not-allowed place-items-center rounded-xl text-slate-400 opacity-60"
          >
            <Paperclip className="h-4.5 w-4.5" />
          </button>
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={disabled}
            placeholder="Ask about your career, skills, interviews, or resume..."
            className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-1 py-2 text-sm leading-5 text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed dark:text-white dark:placeholder:text-slate-500"
          />
          <button
            type="button"
            onClick={onSend}
            disabled={disabled || !value.trim()}
            aria-label="Send message"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 text-white shadow-md shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-slate-400">
          Enter to send · Shift + Enter for a new line · Verify important career decisions independently
        </p>
      </div>
    </div>
  );
}
