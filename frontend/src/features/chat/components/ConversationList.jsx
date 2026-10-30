import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { MessageSquareText, Plus } from "lucide-react";
import SearchBar from "./SearchBar";
import ConversationItem from "./ConversationItem";

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
  search,
  onSearch,
  onNewChat,
  totalCount,
}) {
  return (
    <aside className="mentor-conversation-list flex h-full min-h-0 w-full flex-col border-r border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-950/50">
      <div className="shrink-0 border-b border-slate-200/70 px-4 py-3 dark:border-slate-800/70">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-600 dark:text-cyan-400">
              Mentor Support
            </p>
            <h1 className="mt-0.5 text-xl font-bold tracking-tight text-slate-950 dark:text-white">
              Messages
            </h1>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onNewChat}
            className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-[0_12px_24px_-16px_rgba(37,99,235,0.95)]"
            aria-label="New chat"
          >
            <Plus className="h-5 w-5" />
          </motion.button>
        </div>

        <div className="mt-3">
          <SearchBar value={search} onChange={onSearch} />
        </div>
      </div>

      <div className="flex items-center justify-between px-4 pb-2 pt-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Recent chats
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
          {totalCount}
        </span>
      </div>

      <div className="custom-scrollbar min-h-0 flex-1 space-y-1.5 overflow-y-auto px-2.5 pb-3">
        {conversations.length ? (
          conversations.map((conversation, index) => (
            <motion.div
              key={conversation.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.02, 0.2) }}
            >
              <ConversationItem
                conversation={conversation}
                active={selectedId === conversation.id}
                onClick={() => onSelect(conversation.id)}
              />
            </motion.div>
          ))
        ) : (
          <div className="grid place-items-center rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50/80 px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900/50">
            <MessageSquareText className="h-8 w-8 text-slate-300 dark:text-slate-500" />
            <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
              No conversations found
            </p>
            <p className="mt-1 max-w-[220px] text-xs leading-5 text-slate-400">
              Try a different mentor name, message, or typing status.
            </p>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-slate-200/70 p-5 dark:border-slate-800/70">
        <button
          type="button"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-blue-700 transition hover:border-blue-200 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-blue-300 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/10"
        >
          View all conversations
        </button>
      </div>
    </aside>
  );
}

ConversationList.propTypes = {
  conversations: PropTypes.array.isRequired,
  selectedId: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  search: PropTypes.string.isRequired,
  onSearch: PropTypes.func.isRequired,
  onNewChat: PropTypes.func.isRequired,
  totalCount: PropTypes.number,
};
