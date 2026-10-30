import { Bot, Sparkles } from "lucide-react";
import MessageBubble from "./MessageBubble";

export default function MessageList({ messages = [], onRetry, emptyState = null }) {
  if (!messages.length) return emptyState;

  return (
    <div className="space-y-4 px-1 sm:px-2">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} onRetry={onRetry} />
      ))}

      <div className="flex items-center gap-2 px-1 pt-1 text-[11px] text-slate-400 dark:text-slate-500">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-[#085FA7]/10 text-[#085FA7]">
          <Bot className="h-3 w-3" />
        </span>
        <span className="inline-flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-[#5CA347]" />
          Responses are grounded in live data
        </span>
      </div>
    </div>
  );
}
