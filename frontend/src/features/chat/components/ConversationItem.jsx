import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { Pin } from "lucide-react";
import ChatAvatar from "./ChatAvatar";
import UnreadBadge from "./UnreadBadge";

export default function ConversationItem({ conversation, active, onClick }) {
  return (
    <motion.button
      type="button"
      layout
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.995 }}
      onClick={onClick}
      className={`group flex w-full gap-3 rounded-[1.4rem] border p-3 text-left transition ${
        active
          ? "border-blue-200 bg-blue-50/90 shadow-[0_18px_40px_-32px_rgba(37,99,235,0.7)] dark:border-blue-500/25 dark:bg-blue-500/10"
          : "border-transparent bg-white/70 hover:border-slate-200 hover:bg-white dark:bg-slate-900/55 dark:hover:border-slate-700/60 dark:hover:bg-slate-900/80"
      }`}
    >
      <ChatAvatar person={conversation} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              {conversation.name}
            </p>
            <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
              {conversation.designation}
            </p>
          </div>
          <span className="shrink-0 text-[10px] font-medium text-slate-400">
            {conversation.lastSeen}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <p
            className={`min-w-0 flex-1 truncate text-xs ${
              conversation.typing
                ? "font-semibold text-emerald-500"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {conversation.typing ? "Typing..." : conversation.lastMessage}
          </p>

          <div className="flex shrink-0 items-center gap-1.5">
            {conversation.pinned ? (
              <Pin className="h-3.5 w-3.5 text-slate-400" />
            ) : null}
            <UnreadBadge count={conversation.unread} />
          </div>
        </div>
      </div>
    </motion.button>
  );
}

ConversationItem.propTypes = {
  conversation: PropTypes.object.isRequired,
  active: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

