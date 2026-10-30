import { useCallback, useEffect, useMemo, useState } from "react";
import { conversations as initialConversations, messagesByConversation } from "../mock/chatData";

const buildComposerMessage = ({ id, sender, text, file, image, code, voice }) => ({
  id,
  sender,
  type: image ? "image" : file ? "file" : code ? "code" : voice ? "voice" : "text",
  text,
  fileName: file?.name,
  fileSize: file ? `${Math.max(1, Math.round(file.size / 1024))} KB` : undefined,
  fileExt: file?.type?.split("/").pop()?.toUpperCase() || "FILE",
  image,
  code,
  voice,
  time: "Now",
  status: "sent",
  date: "Today",
});

const buildRecipientConversation = (recipient) => ({
  id: `${recipient.type === "mentor" ? "mentor" : "student"}-${recipient.id}`,
  name: recipient.name,
  initials: recipient.avatar || recipient.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
  gradient: "from-blue-600 via-violet-500 to-purple-500",
  designation: recipient.type === "mentor" ? (recipient.designation || "Mentor") : "Student",
  company: recipient.course || (recipient.type === "mentor" ? "Assigned mentor" : "Assigned student"),
  experience: recipient.type === "mentor" ? "Your assigned mentor" : "Mentor conversation",
  online: true,
  pinned: false,
  unread: 0,
  typing: false,
  lastSeen: "Now",
  lastMessage: "Start a conversation",
  email: recipient.email,
  phone: recipient.phone,
  location: recipient.type === "mentor" ? (recipient.batch || "Assigned batch") : "Student profile",
  about: recipient.type === "mentor"
    ? `Mentor for ${recipient.course || "your assigned course"}.`
    : `Learning ${recipient.course || "an assigned course"}.`,
  availability: recipient.type === "mentor" ? "Available through mentor chat" : "Contact through messages",
  skills: [], courses: recipient.course ? [recipient.course] : [], sharedFiles: [], activity: [],
});

export default function useChat(initialRecipient = null, { includeDemoConversations = true } = {}) {
  const initialThread = initialRecipient ? buildRecipientConversation(initialRecipient) : null;
  const seededConversations = initialThread
    ? [initialThread, ...(includeDemoConversations ? initialConversations.filter((item) => item.id !== initialThread.id) : [])]
    : (includeDemoConversations ? initialConversations : []);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState(seededConversations[0]?.id ?? null);
  const [conversationList, setConversationList] = useState(seededConversations);
  const [messages, setMessages] = useState(() => initialThread ? { ...messagesByConversation, [initialThread.id]: [] } : messagesByConversation);

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return conversationList;
    }

    return conversationList.filter((conversation) => {
      return [
        conversation.name,
        conversation.lastMessage,
        conversation.typing ? "typing" : "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [conversationList, searchQuery]);

  useEffect(() => {
    if (!selectedConversationId && filteredConversations[0]) {
      setSelectedConversationId(filteredConversations[0].id);
    }
  }, [filteredConversations, selectedConversationId]);

  const selectedConversation = useMemo(
    () => conversationList.find((conversation) => conversation.id === selectedConversationId) ?? null,
    [conversationList, selectedConversationId]
  );

  const selectedMessages = useMemo(
    () => (selectedConversationId ? messages[selectedConversationId] ?? [] : []),
    [messages, selectedConversationId]
  );

  const sendMessage = useCallback((payload) => {
    if (!selectedConversationId) {
      return;
    }

    const nextMessage = buildComposerMessage({
      id: `${Date.now()}`,
      sender: "student",
      ...payload,
    });

    setMessages((current) => ({
      ...current,
      [selectedConversationId]: [...(current[selectedConversationId] ?? []), nextMessage],
    }));

    setConversationList((current) =>
      current.map((conversation) =>
        conversation.id === selectedConversationId
          ? {
              ...conversation,
              unread: 0,
              lastMessage: payload.text?.trim()
                ? payload.text.trim()
                : payload.file?.name || payload.image?.caption || "Attachment sent",
              lastSeen: "Now",
            }
          : conversation
      )
    );
  }, [selectedConversationId]);

  const markAsRead = useCallback((conversationId) => {
    setConversationList((current) => {
      let changed = false;
      const next = current.map((conversation) => {
        if (conversation.id !== conversationId || conversation.unread === 0) {
          return conversation;
        }

        changed = true;
        return { ...conversation, unread: 0 };
      });

      return changed ? next : current;
    });

    setMessages((current) => {
      const thread = current[conversationId];
      if (!thread) {
        return current;
      }

      let changed = false;
      const nextThread = thread.map((message) => {
        if (message.sender !== "mentor" || message.status === "read") {
          return message;
        }

        changed = true;
        return { ...message, status: "read" };
      });

      return changed ? { ...current, [conversationId]: nextThread } : current;
    });
  }, []);

  return {
    conversations: filteredConversations,
    allConversations: conversationList,
    messages,
    selectedConversationId,
    selectedConversation,
    selectedMessages,
    searchQuery,
    setSearchQuery,
    setSelectedConversationId,
    sendMessage,
    markAsRead,
  };
}
