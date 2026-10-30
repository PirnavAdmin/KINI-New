import { memo, useState } from "react";
import { motion } from "framer-motion";
import {
  FaThumbsUp,
  FaReply,
  FaThumbtack,
  FaSearch,
  FaCommentDots,
} from "react-icons/fa";

const DiscussionThread = memo(function DiscussionThread({
  thread,
  index,
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`bg-[#111827] border rounded-xl overflow-hidden ${
        thread.isPinned ? "border-[#F59E0B]/30" : "border-[#1F2937]"
      }`}
    >
      {/* Question */}
      <div className="p-4">
        {thread.isPinned && (
          <div className="flex items-center gap-1 text-[10px] text-[#F59E0B] font-medium mb-2">
            <FaThumbtack className="text-[8px]" />
            Pinned
          </div>
        )}
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0f55f7] to-[#06b6a8] flex items-center justify-center shrink-0">
            <span className="text-[9px] font-bold text-white">
              {thread.author
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white">
                {thread.author}
              </span>
              <span className="text-[10px] text-[#6B7280]">{thread.time}</span>
            </div>
            <p className="text-sm text-[#D1D5DB] mt-1">{thread.question}</p>
            <div className="flex items-center gap-3 mt-2">
              <button className="flex items-center gap-1 text-[10px] text-[#6B7280] hover:text-[#0f55f7] transition-colors cursor-pointer">
                <FaThumbsUp className="text-[10px]" />
                {thread.likes}
              </button>
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-[10px] text-[#6B7280] hover:text-[#0f55f7] transition-colors cursor-pointer"
              >
                <FaComment className="text-[10px]" />
                {thread.replies} replies
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Replies */}
      {expanded && thread.repliesList?.length > 0 && (
        <div className="border-t border-[#1F2937] px-4 py-3 space-y-3">
          {thread.repliesList.map((reply) => (
            <div key={reply.id} className="flex items-start gap-2.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  reply.isInstructor
                    ? "bg-[#0f55f7]"
                    : "bg-[#1E293B]"
                }`}
              >
                <span className="text-[8px] font-bold text-white">
                  {reply.author
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-white">
                    {reply.author}
                  </span>
                  {reply.isInstructor && (
                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#0f55f7]/20 text-[#0f55f7] font-medium">
                      Instructor
                    </span>
                  )}
                  <span className="text-[10px] text-[#6B7280]">
                    {reply.time}
                  </span>
                </div>
                <p className="text-[11px] text-[#9CA3AF] mt-1 leading-relaxed">
                  {reply.content}
                </p>
                <button className="flex items-center gap-1 text-[10px] text-[#6B7280] hover:text-[#0f55f7] transition-colors mt-1 cursor-pointer">
                  <FaThumbsUp className="text-[9px]" />
                  {reply.likes}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
});

const DiscussionTab = memo(function DiscussionTab({ discussions }) {
  const [search, setSearch] = useState("");

  const filtered = discussions.filter(
    (d) =>
      d.question.toLowerCase().includes(search.toLowerCase()) ||
      d.author.toLowerCase().includes(search.toLowerCase())
  );

  const pinned = filtered.filter((d) => d.isPinned);
  const normal = filtered.filter((d) => !d.isPinned);

  if (!discussions || discussions.length === 0) {
    return (
      <div className="text-center py-12">
        <FaCommentDots className="text-3xl text-[#6B7280] mx-auto mb-3" />
        <p className="text-sm text-[#6B7280]">No discussions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] text-xs" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search discussions..."
          className="w-full pl-8 pr-3 py-2 bg-[#111827] border border-[#1F2937] rounded-xl text-xs text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#0f55f7]/50 transition-all"
        />
      </div>

      {/* Pinned */}
      {pinned.map((thread, i) => (
        <DiscussionThread key={thread.id} thread={thread} index={i} />
      ))}

      {/* Normal */}
      {normal.map((thread, i) => (
        <DiscussionThread
          key={thread.id}
          thread={thread}
          index={pinned.length + i}
        />
      ))}
    </div>
  );
});

export default DiscussionTab;

