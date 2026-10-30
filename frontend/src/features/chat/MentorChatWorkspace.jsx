import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import ConversationList from "./components/ConversationList";
import ChatWindow from "./components/ChatWindow";
import MentorProfile from "./components/MentorProfile";
import EmptyState from "./components/EmptyState";
import useChat from "./hooks/useChat";

export default function MentorChatWorkspace({ viewer = "student", initialRecipient = null }) {
  const location = useLocation();
  const isStudentMentorChat = viewer === "student";
  const {
    conversations,
    allConversations,
    selectedConversationId,
    selectedConversation,
    selectedMessages,
    searchQuery,
    setSearchQuery,
    setSelectedConversationId,
    sendMessage,
    markAsRead,
  } = useChat(location.state?.recipient ?? initialRecipient, { includeDemoConversations: !isStudentMentorChat });
  const [mobileView, setMobileView] = useState(isStudentMentorChat ? "chat" : "list");
  const [profileOpen, setProfileOpen] = useState(false);

  const visibleConversations = useMemo(() => conversations, [conversations]);

  const handleSelect = (id) => {
    setSelectedConversationId(id);
    markAsRead(id);
    setMobileView("chat");
    setProfileOpen(false);
  };

  useEffect(() => {
    if (selectedConversationId) {
      markAsRead(selectedConversationId);
    }
  }, [markAsRead, selectedConversationId]);

  return (
    <motion.main
      data-chat-viewer={viewer}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="mentor-chat-workspace relative h-full min-h-0 min-w-0 overflow-hidden rounded-[18px] border border-slate-200/80 bg-white/80 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.4)] backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-950/60"
    >
      <div className="h-full min-h-0 min-w-0">
        <div className={`grid h-full min-h-0 min-w-0 grid-cols-1 ${isStudentMentorChat ? "xl:grid-cols-[minmax(0,1fr)_290px]" : "xl:grid-cols-[310px_minmax(0,1fr)_290px]"}`}>
          {!isStudentMentorChat && <div className={`${mobileView === "list" ? "flex" : "hidden"} xl:flex min-h-0`}>
            <ConversationList
              conversations={visibleConversations}
              totalCount={allConversations.length}
              selectedId={selectedConversationId}
              onSelect={handleSelect}
              search={searchQuery}
              onSearch={setSearchQuery}
              onNewChat={() => setMobileView("chat")}
            />
          </div>}

          <div
            className={`${mobileView === "chat" ? "flex" : "hidden"} xl:flex min-h-0 min-w-0`}
          >
            {selectedConversation ? (
              <ChatWindow
                person={selectedConversation}
                messages={selectedMessages}
                onSend={sendMessage}
                onBack={() => setMobileView("list")}
                onToggleProfile={() => setProfileOpen(true)}
                viewer={viewer}
              />
            ) : (
              <EmptyState />
            )}
          </div>

          <div className="hidden min-h-0 xl:flex">
            {selectedConversation ? (
              <MentorProfile
                person={selectedConversation}
                onClose={() => setProfileOpen(false)}
              />
            ) : (
              <EmptyState compact />
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {profileOpen && selectedConversation && (
          <motion.div
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 18 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-30 bg-slate-950/30 backdrop-blur-sm xl:hidden"
          >
            <MentorProfile
              person={selectedConversation}
              onClose={() => setProfileOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}

MentorChatWorkspace.propTypes = {
  viewer: PropTypes.oneOf(["student", "mentor"]),
  initialRecipient: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    type: PropTypes.string,
  }),
};
