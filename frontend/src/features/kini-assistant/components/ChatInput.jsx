import { Paperclip, Send, Smile, Sparkles } from "lucide-react";
import VoiceInput from "./VoiceInput";

export default function ChatInput({
  input,
  onInputChange,
  onSubmit,
  onKeyDown,
  isSending,
  textareaRef,
}) {
  return (
    <div className="border-t border-slate-200 bg-white/95 px-3 py-3 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 sm:px-4">
      <div className="mb-2 flex items-center justify-between gap-3 px-1 text-[11px] text-slate-400 dark:text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-[#5CA347]" />
          Ask anything about your learning, courses, assessments, mentors, placements, and more.
        </span>
        <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-2 py-1 font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-900 sm:inline-flex">
          Enter to send
        </span>
      </div>

      <div className="flex items-end gap-2 rounded-[1.35rem] border border-slate-200 bg-slate-50 px-2.5 py-2 shadow-[0_12px_30px_rgba(15,23,42,0.04)] transition focus-within:border-[#085FA7]/30 focus-within:ring-2 focus-within:ring-[#085FA7]/10 dark:border-slate-800 dark:bg-slate-900">
        <div className="hidden items-center gap-1.5 self-end pb-0.5 sm:flex">
          <button
            type="button"
            disabled
            className="grid h-9 w-9 place-items-center rounded-full text-slate-400 transition hover:bg-white hover:text-slate-600 dark:hover:bg-slate-800"
            aria-label="Attach file"
            title="Coming soon"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <VoiceInput onTranscript={(text) => onInputChange((current) => `${current}${current ? " " : ""}${text}`)} />
          <button
            type="button"
            disabled
            className="grid h-9 w-9 place-items-center rounded-full text-slate-400 transition hover:bg-white hover:text-slate-600 dark:hover:bg-slate-800"
            aria-label="Emoji"
            title="Coming soon"
          >
            <Smile className="h-4 w-4" />
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <label className="sr-only" htmlFor="kini-assistant-input">
            Ask Kini Assistant
          </label>
          <textarea
            id="kini-assistant-input"
            ref={textareaRef}
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Ask anything about your learning..."
            className="max-h-36 w-full resize-none border-0 bg-transparent px-2 py-2 text-[15px] leading-6 text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
          />
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!input.trim() || isSending}
          aria-label="Send message"
          className="grid h-12 w-12 shrink-0 place-items-center rounded-[1.1rem] bg-gradient-to-br from-[#085FA7] to-[#5CA347] text-white shadow-[0_14px_30px_rgba(8,95,167,0.22)] transition hover:scale-[1.02] hover:shadow-[0_16px_36px_rgba(8,95,167,0.28)] disabled:cursor-not-allowed disabled:scale-100 disabled:opacity-40"
        >
          <Send className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
}
