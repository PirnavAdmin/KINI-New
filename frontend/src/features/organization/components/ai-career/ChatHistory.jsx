import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, Pencil, Plus, Search, Trash2, X } from "lucide-react";

const formatConversationDate = (timestamp) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

export default function ChatHistory({ conversations, activeId, open, onClose, onNew, onSelect, onRename, onDelete }) {
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState("");
  const [editingTitle, setEditingTitle] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return conversations;
    return conversations.filter((conversation) => {
      const messageText = conversation.messages.map((message) => message.content).join(" ");
      return `${conversation.title} ${messageText}`.toLowerCase().includes(query);
    });
  }, [conversations, search]);

  const beginRename = (conversation) => {
    setEditingId(conversation.id);
    setEditingTitle(conversation.title);
  };

  const submitRename = (event) => {
    event.preventDefault();
    const title = editingTitle.trim();
    if (title) onRename(editingId, title);
    setEditingId("");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close conversation history"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-30 bg-slate-950/45 backdrop-blur-sm lg:hidden"
          />
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="absolute inset-y-0 left-0 z-40 flex w-[272px] shrink-0 flex-col border-r border-slate-200/80 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 lg:relative lg:z-0 lg:shadow-[8px_0_30px_-24px_rgba(15,23,42,0.28)]"
          >
            <div className="flex items-center justify-between border-b border-slate-200/80 px-4 py-4 dark:border-slate-700">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Conversations</h2>
                <p className="mt-0.5 text-[10px] text-slate-400">Saved in this browser</p>
              </div>
              <button type="button" onClick={onClose} aria-label="Close history" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white lg:hidden">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2.5 p-3">
              <button type="button" onClick={onNew} className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-bold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30">
                <Plus className="h-4 w-4" /> New chat
              </button>
              <label className="relative block">
                <span className="sr-only">Search conversations</span>
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search conversations"
                  className="h-9 w-full rounded-xl border border-transparent bg-slate-50 pl-9 pr-3 text-xs text-slate-900 ring-1 ring-slate-900/[0.06] outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-800 dark:text-white dark:ring-white/[0.07]"
                />
              </label>
            </div>

            <div className="scrollbar-hide flex-1 space-y-1 overflow-y-auto px-2 pb-3">
              {filtered.map((conversation) => {
                const lastMessage = conversation.messages.at(-1);
                const active = conversation.id === activeId;
                return (
                  <div key={conversation.id} className={`group rounded-xl border transition ${active ? "border-blue-200 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-500/10" : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60"}`}>
                    {editingId === conversation.id ? (
                      <form onSubmit={submitRename} className="p-2">
                        <input
                          autoFocus
                          value={editingTitle}
                          onChange={(event) => setEditingTitle(event.target.value)}
                          onBlur={submitRename}
                          maxLength={80}
                          className="h-8 w-full rounded-lg border border-blue-300 bg-white px-2 text-xs font-semibold text-slate-900 outline-none ring-2 ring-blue-500/10 dark:border-blue-500 dark:bg-slate-800 dark:text-white"
                        />
                      </form>
                    ) : (
                      <button type="button" onClick={() => onSelect(conversation.id)} className="w-full p-3 text-left">
                        <div className="flex items-start gap-2">
                          <MessageSquare className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${active ? "text-blue-600" : "text-slate-400"}`} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">{conversation.title}</p>
                            <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-400">{lastMessage?.content || "Empty conversation"}</p>
                          </div>
                          <span className="shrink-0 text-[9px] text-slate-400">{formatConversationDate(conversation.updatedAt)}</span>
                        </div>
                      </button>
                    )}
                    {editingId !== conversation.id && (
                      <div className="flex justify-end gap-0.5 px-2 pb-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                        <button type="button" onClick={() => beginRename(conversation)} aria-label={`Rename ${conversation.title}`} className="rounded-md p-1.5 text-slate-400 hover:bg-white hover:text-blue-600 dark:hover:bg-slate-700">
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button type="button" onClick={() => onDelete(conversation.id)} aria-label={`Delete ${conversation.title}`} className="rounded-md p-1.5 text-slate-400 hover:bg-white hover:text-red-500 dark:hover:bg-slate-700">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="mx-2 mt-2 flex min-h-28 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-4 text-center dark:border-slate-700 dark:bg-slate-800/40">
                  <span className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-500 ring-1 ring-blue-500/10 dark:bg-blue-500/10 dark:text-blue-400">
                    <MessageSquare className="h-4 w-4" />
                  </span>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {conversations.length ? "No conversations found" : "No conversations yet"}
                  </p>
                  <p className="mt-1 text-[10px] leading-4 text-slate-400">
                    {conversations.length ? "Try another search term." : "Start a new chat to save your career guidance here."}
                  </p>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
