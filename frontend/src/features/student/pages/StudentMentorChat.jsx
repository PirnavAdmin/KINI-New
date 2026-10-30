import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCheck,
  Loader2,
  MessageSquare,
  MoreVertical,
  Paperclip,
  Phone,
  Plus,
  Search,
  Send,
  SlidersHorizontal,
  SquarePen,
  Video,
  Smile,
  UserRound,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useConversations } from "@shared/hooks/useConversations";
import { useConversationMessages } from "@shared/hooks/useConversationMessages";
import ChatAttachmentCard from "@shared/components/ChatAttachmentCard";
import { chatErrorMessage } from "@shared/utils/chatErrors";
import { useAssignedMentor } from "../hooks/useAssignedMentor";

// Client-side-only sanity cap before the upload even starts — the backend's
// own 413 response (see chatErrorMessage) is the real limit.
const MAX_ATTACHMENT_MB = 25;

// Every conversation and message on this page comes from the real Chat API
// (GET/POST /api/v1/chat/conversations, GET/POST .../messages, PUT .../read)
// — the same shared service and hooks Mentor -> Messages uses, with
// viewerRole: "student" so the OTHER party shown is the mentor, and the
// student's own messages render on the right. useAssignedMentor() lists the
// mentors of the student's own batches: it enriches conversations with
// course/batch, fills the Mentors tab, and is the only set of mentors a
// conversation may be started with.
const AVATAR_COLORS = ["#133B5D", "#10B981", "#F39924", "#8B5CF6", "#0EA5E9", "#EC4899"];

const avatarColor = (id) => {
  const key = String(id ?? "");
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

const formatListTimestamp = (iso) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

function ConversationItem({ item, active, onSelect }) {
  return (
    <button
      onClick={() => onSelect(item)}
      className={`w-full border-b border-[#EEF2F7] px-5 py-3.5 text-left transition ${active ? "border-l-4 border-l-[#F39924] bg-[#FFF3E3] pl-4" : "hover:bg-[#F7FAFD]"}`}
    >
      <div className="flex items-start gap-3">
        <span
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: avatarColor(item.mentorId ?? item.id) }}
        >
          {item.initials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-[15px] font-bold text-[#133B5D]">{item.name}</span>
            {item.lastMessageAt && <span className="shrink-0 text-[11px] text-[#94A3B8]">{formatListTimestamp(item.lastMessageAt)}</span>}
          </div>
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="truncate text-sm text-[#475569]">{item.lastMessage || "No messages yet"}</p>
            {item.unreadCount > 0 ? (
              <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-[#EF4444] px-1.5 text-[10px] font-bold text-white">
                {item.unreadCount}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </button>
  );
}

const initialsOf = (name = "") => name.split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "M";

// One of the student's own mentors, whether or not a conversation exists yet.
function MentorRow({ mentor, conversation, starting, disabled, onStart }) {
  return (
    <div className="flex items-center gap-3 border-b border-[#EEF2F7] px-5 py-3.5">
      <span
        aria-hidden="true"
        className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
        style={{ backgroundColor: avatarColor(mentor.mentorId) }}
      >
        {initialsOf(mentor.name)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-bold text-[#133B5D]">{mentor.name}</p>
        <p className="truncate text-xs text-[#64748B]">{mentor.assignments.join(", ") || mentor.designation}</p>
      </div>
      <button
        type="button"
        onClick={() => onStart(mentor.mentorId)}
        disabled={disabled}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#F39924] px-3 py-2 text-xs font-bold text-white hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {starting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MessageSquare className="h-3.5 w-3.5" />}
        {conversation ? "Open chat" : "Start conversation"}
      </button>
    </div>
  );
}

function ConversationSkeleton() {
  return (
    <div className="space-y-1 p-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 rounded-lg p-2">
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-[#E2E8F0]" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-3/5 animate-pulse rounded bg-[#E2E8F0]" />
            <div className="h-2.5 w-2/5 animate-pulse rounded bg-[#EEF2F7]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MessageBubble({ message, onDeleteAttachment }) {
  const outgoing = message.outgoing;
  return (
    <div className={`flex ${outgoing ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[78%] sm:max-w-[68%] ${outgoing ? "items-end" : "items-start"} flex flex-col gap-1`}>
        {message.text && (
          <div
            className={`rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${
              outgoing
                ? "rounded-br-md bg-[#133B5D] text-white"
                : "rounded-bl-md border border-[#E2E8F0] bg-white text-[#133B5D] shadow-sm"
            }`}
          >
            {message.text}
          </div>
        )}
        {message.attachment && (
          <ChatAttachmentCard
            attachment={message.attachment}
            canDelete={outgoing}
            onDelete={onDeleteAttachment ? () => onDeleteAttachment(message.attachment.attachmentId) : undefined}
          />
        )}
        <div className={`flex items-center gap-1 px-1 text-[10px] text-[#94A3B8] ${outgoing ? "flex-row-reverse" : ""}`}>
          <span>{message.time}</span>
          {outgoing && <CheckCheck className={`h-3.5 w-3.5 ${message.read ? "text-[#10B981]" : "text-[#CBD5E1]"}`} />}
        </div>
      </div>
    </div>
  );
}

export default function StudentMentorChat() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { mentors, loading: mentorLoading, status: mentorStatus, reload: reloadMentors } = useAssignedMentor();
  const {
    conversations,
    loading: conversationsLoading,
    error: conversationsError,
    errorDetail: conversationsErrorDetail,
    reload: reloadConversations,
    startConversation,
    markLocalRead,
  } = useConversations({ viewerRole: "student" });

  const mentorById = useMemo(() => new Map(mentors.map((item) => [String(item.mentorId), item])), [mentors]);
  const isOwnMentor = (mentorId) => mentorId != null && mentorById.has(String(mentorId));

  // Real conversations enriched with course/batch from the student's own
  // enrollments — the Chat API doesn't return those fields.
  const conversationItems = useMemo(() => conversations.map((item) => {
    const assigned = mentorById.get(String(item.mentorId));
    return { ...item, course: assigned?.course ?? "", batch: assigned?.batch ?? "" };
  }), [conversations, mentorById]);

  const conversationByMentor = useMemo(
    () => new Map(conversationItems.filter((item) => item.mentorId != null).map((item) => [String(item.mentorId), item])),
    [conversationItems],
  );

  const [activeConversationId, setActiveConversationId] = useState(null);
  // A ?mentorId= link (e.g. from My Batch's "Chat with Mentor" button) doesn't
  // necessarily have a conversation yet — resolved below once real
  // conversations/mentor data have loaded: reuse an existing conversation, or
  // create one via POST, but only for the student's own real assigned
  // mentor. An id that never matches the student's own mentor never opens a chat.
  const [pendingMentorId, setPendingMentorId] = useState(() => searchParams.get("mentorId"));
  const [filter, setFilter] = useState("");
  const [tab, setTab] = useState("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [draft, setDraft] = useState("");
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [startingConversation, setStartingConversation] = useState(false);
  const [mobileView, setMobileView] = useState(() => (searchParams.get("mentorId") ? "chat" : "list"));
  const endRef = useRef(null);

  useEffect(() => {
    if (pendingMentorId == null) return;
    if (conversationsLoading || mentorLoading) return;
    let cancelled = false;
    const resolvePendingMentor = async () => {
      const existing = conversations.find((item) => String(item.mentorId) === String(pendingMentorId));
      if (existing) {
        setActiveConversationId(existing.conversationId);
        setPendingMentorId(null);
        return;
      }
      if (!mentorById.has(String(pendingMentorId))) {
        setPendingMentorId(null);
        setMobileView("list");
        return;
      }
      try {
        const created = await startConversation(pendingMentorId);
        if (!cancelled) setActiveConversationId(created.conversationId);
      } catch (error) {
        if (!cancelled) { toast.error(chatErrorMessage(error)); setMobileView("list"); }
      } finally {
        if (!cancelled) setPendingMentorId(null);
      }
    };
    resolvePendingMentor();
    return () => { cancelled = true; };
  }, [pendingMentorId, conversations, conversationsLoading, mentorById, mentorLoading, startConversation]);

  const active = conversationItems.find((item) => String(item.conversationId) === String(activeConversationId)) ?? null;

  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    sending,
    send,
    uploading,
    sendAttachment,
    removeAttachment,
  } = useConversationMessages(active?.conversationId ?? null, markLocalRead, "student");
  const fileInputRef = useRef(null);

  useEffect(() => {
    try {
      endRef.current?.scrollIntoView?.({ behavior: "smooth", block: "end" });
    } catch {
      // The conversation remains usable even if scrolling is unavailable.
    }
  }, [messages]);

  const visible = useMemo(() => {
    const query = filter.trim().toLowerCase();
    const scoped = conversationItems.filter((item) => {
      if ((tab === "unread" || showUnreadOnly) && !(item.unreadCount > 0)) return false;
      if (tab === "mentors" && item.mentorId == null) return false;
      return true;
    });
    if (!query) return scoped;
    return scoped.filter((item) =>
      [item.name, item.email, item.course, item.batch, item.lastMessage].some((field) =>
        String(field ?? "").toLowerCase().includes(query),
      ),
    );
  }, [conversationItems, filter, tab, showUnreadOnly]);

  const openConversation = (item) => {
    setActiveConversationId(item.conversationId);
    setMobileView("chat");
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("mentorId", item.mentorId);
      return next;
    }, { replace: true });
  };

  const handleSend = async () => {
    if (!draft.trim() || !active || sending) return;
    const text = draft;
    try {
      await send(text);
      setDraft((current) => current === text ? "" : current);
    } catch (error) {
      toast.error(chatErrorMessage(error, "Unable to send message. Please try again."));
    }
  };

  // Reuses the existing paperclip button — no second uploader is added. The
  // file is picked via a hidden <input type="file">, uploaded immediately,
  // and the input is cleared either way so the same file can be re-selected.
  // Only the paperclip itself is disabled while this is in flight.
  const handleAttachClick = () => {
    if (!active || uploading) return;
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !active) return;
    if (file.size > MAX_ATTACHMENT_MB * 1024 * 1024) {
      toast.error(`That file is larger than ${MAX_ATTACHMENT_MB}MB.`);
      return;
    }
    try {
      await sendAttachment(file, "");
    } catch (error) {
      toast.error(chatErrorMessage(error, "Unable to upload this attachment. Please try again."));
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    await removeAttachment(attachmentId);
  };

  // Opens the existing conversation with one of the student's own mentors, or
  // creates it (POST /chat/conversations is idempotent server-side). A ref
  // blocks a second request while one is in flight, so repeated clicks never
  // send duplicate creates.
  const startingRef = useRef(false);
  const handleStartConversation = async (mentorId) => {
    if (!isOwnMentor(mentorId) || startingRef.current) return;
    const existing = conversationByMentor.get(String(mentorId));
    startingRef.current = true;
    setStartingConversation(String(mentorId));
    try {
      const conversation = existing ?? await startConversation(mentorId);
      setActiveConversationId(conversation.conversationId);
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        next.set("mentorId", mentorId);
        return next;
      }, { replace: true });
      setMobileView("chat");
      setShowNewConversation(false);
    } catch (error) {
      toast.error(chatErrorMessage(error, "Unable to start a conversation. Please try again."));
    } finally {
      startingRef.current = false;
      setStartingConversation(false);
    }
  };

  // Mentors the student may message, for the Mentors tab and the empty state.
  const visibleMentors = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return mentors;
    return mentors.filter((item) => [item.name, item.email, ...item.assignments].some((field) => String(field ?? "").toLowerCase().includes(query)));
  }, [mentors, filter]);

  const mentorStateText = {
    "no-mentor": "No mentor is assigned to your batch yet. Your institute will assign one; you can message them here once they do.",
    "no-enrollment": "You aren't enrolled in a batch yet. A mentor is assigned once you join a batch.",
    error: "We couldn't load your mentor details. Please try again.",
    "not-student": "Mentor chat is available to student accounts only.",
  }[mentorStatus] ?? "";

  const unreadTotal = conversationItems.filter((item) => item.unreadCount > 0).length;

  return (
    <div className="chat-page flex min-h-0 flex-1 flex-col gap-3">
      <div className="chat-workspace ksx-chat flex min-h-0 flex-1 gap-4 overflow-hidden">
        {/* Left: mentor conversation list. A plain <div>, not <aside> — this
            app has a global stylesheet rule that forces any <aside> to the
            navy sidebar's colors, meant for the real navigation rail. */}
        <div className={`${mobileView === "chat" ? "hidden" : "flex"} chat-conversation-sidebar ksx-chat__panel min-h-0 overflow-hidden w-full shrink-0 flex-col lg:flex lg:w-[26rem]`}>
          <div className="px-5 pt-5">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-2xl font-extrabold text-[#133B5D]">Mentor Chat</h1>
              <button
                type="button"
                onClick={() => setShowNewConversation(true)}
                disabled={!mentors.length}
                title="New conversation"
                aria-label="New conversation"
                className="grid h-11 w-11 place-items-center rounded-xl bg-[#F39924] text-white shadow-[0_6px_14px_rgba(243,153,36,0.35)] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <SquarePen className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 flex items-center gap-2">
            <label className="relative block min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search mentors or conversations..."
                className="h-11 w-full rounded-xl border border-[#E2E8F0] bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#F39924]"
              />
            </label>
            <button
              type="button"
              onClick={() => setShowUnreadOnly((value) => !value)}
              aria-pressed={showUnreadOnly}
              title={showUnreadOnly ? "Show all conversations" : "Show unread only"}
              className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border ${showUnreadOnly ? "border-[#F39924] bg-[#FFF7EC] text-[#E8830F]" : "border-[#E2E8F0] text-[#133B5D] hover:bg-[#F7FAFD]"}`}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
            </div>
            <div className="ksx-chat__tabs mt-3" role="tablist" aria-label="Conversation filter">
              {[["all", "All Chats"], ["mentors", "Mentors"], ["unread", "Unread"]].map(([id, label]) => (
                <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>
                  {label}
                  {id === "unread" && unreadTotal > 0 && <span className="ksx-chat__badge">{unreadTotal}</span>}
                </button>
              ))}
            </div>
          </div>
          <div className="chat-conversation-list min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
            {tab === "mentors" ? (
              mentorLoading ? (
                <ConversationSkeleton />
              ) : !mentors.length ? (
                <div role={mentorStatus === "error" ? "alert" : "status"} className="flex flex-col items-center px-6 py-10 text-center">
                  <UserRound className="h-8 w-8 text-[#94A3B8]" />
                  <p className="mt-3 text-xs text-[#64748B]">{mentorStateText}</p>
                  {mentorStatus === "error" && (
                    <button type="button" onClick={reloadMentors} className="mt-3 rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-xs font-semibold text-[#133B5D] hover:bg-[#F7FAFD]">Retry</button>
                  )}
                </div>
              ) : visibleMentors.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#94A3B8]">No mentors match your search.</div>
              ) : (
                visibleMentors.map((item) => (
                  <MentorRow
                    key={item.mentorId}
                    mentor={item}
                    conversation={conversationByMentor.get(String(item.mentorId))}
                    starting={startingConversation === String(item.mentorId)}
                    disabled={Boolean(startingConversation)}
                    onStart={handleStartConversation}
                  />
                ))
              )
            ) : conversationsLoading ? (
              <ConversationSkeleton />
            ) : conversationsError ? (
              <div role="alert" className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                <p className="text-xs font-semibold text-[#DC2626]">Unable to load conversations</p>
                <p className="text-[11px] text-[#64748B]">{chatErrorMessage(conversationsErrorDetail, conversationsError)}</p>
                <button
                  type="button"
                  onClick={reloadConversations}
                  className="mt-1 rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-xs font-semibold text-[#133B5D] hover:bg-[#F7FAFD]"
                >
                  Retry
                </button>
              </div>
            ) : conversationItems.length === 0 ? (
              <div>
                <div className="flex flex-col items-center px-6 pb-4 pt-8 text-center">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-[#F1F5F9] text-2xl">💬</span>
                  <p className="mt-3 text-sm font-semibold text-[#133B5D]">No mentor conversations yet</p>
                  <p className="mt-1 text-xs text-[#64748B]">
                    {mentors.length
                      ? "Start a conversation with your mentor to ask questions, get guidance, and discuss your learning."
                      : mentorLoading ? "Looking up your assigned mentor…" : mentorStateText}
                  </p>
                  {mentorStatus === "error" && (
                    <button type="button" onClick={reloadMentors} className="mt-3 rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-xs font-semibold text-[#133B5D] hover:bg-[#F7FAFD]">Retry</button>
                  )}
                </div>
                {visibleMentors.map((item) => (
                  <MentorRow
                    key={item.mentorId}
                    mentor={item}
                    starting={startingConversation === String(item.mentorId)}
                    disabled={Boolean(startingConversation)}
                    onStart={handleStartConversation}
                  />
                ))}
              </div>
            ) : visible.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#94A3B8]">No conversations found.</div>
            ) : (
              visible.map((item) => (
                <ConversationItem key={item.id} item={item} active={active?.id === item.id} onSelect={openConversation} />
              ))
            )}
          </div>
          {tab !== "mentors" && conversationItems.length > 0 && mentors.some((item) => !conversationByMentor.has(String(item.mentorId))) && (
            <button
              type="button"
              onClick={() => setShowNewConversation(true)}
              className="m-3 flex items-center justify-center gap-2 rounded-lg border border-[#FCE3B6] bg-[#FFF7EC] px-3 py-2 text-xs font-semibold text-[#B45309]"
            >
              <Plus className="h-3.5 w-3.5" />
              Message another mentor
            </button>
          )}
        </div>

        {/* Right: chat panel */}
        <main className={`${mobileView === "list" ? "hidden" : "flex"} chat-conversation ksx-chat__panel min-h-0 overflow-hidden min-w-0 flex-1 flex-col lg:flex`}>
          <header className="flex items-center justify-between gap-3 border-b border-[#E2E8F0] bg-white px-5 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileView("list")}
                aria-label="Back to conversations"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#64748B] hover:bg-[#F1F5F9] lg:hidden"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              {active ? (
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: avatarColor(active.mentorId ?? active.id) }}
                  >
                    {active.initials}
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-bold text-[#133B5D]">{active.name}</h2>
                    {(active.course || active.batch) && (
                      <p className="truncate text-xs text-[#64748B]">{[active.course, active.batch].filter(Boolean).join(" · ")}</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm font-semibold text-[#94A3B8]">No conversation selected</p>
              )}
            </div>
            {active && (
              <div className="flex shrink-0 items-center gap-1">
                <button type="button" title="Call" onClick={() => toast("Starting a call…")} className="grid h-9 w-9 place-items-center rounded-lg text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#133B5D]">
                  <Phone className="h-5 w-5" />
                </button>
                <button type="button" title="Video call" onClick={() => toast("Starting a video call…")} className="grid h-9 w-9 place-items-center rounded-lg text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#133B5D]">
                  <Video className="h-5 w-5" />
                </button>
                <button type="button" title="More options" onClick={() => toast("More options coming soon.")} className="grid h-9 w-9 place-items-center rounded-lg text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#133B5D]">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            )}
          </header>

          <div className="chat-history min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-4 sm:p-5">
            {!active ? (
              <div className="grid h-full place-items-center text-center">
                <div className="flex flex-col items-center">
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-white text-[#94A3B8] shadow-sm">
                    <MessageSquare className="h-6 w-6" />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-[#133B5D]">Choose a mentor</p>
                  <p className="mt-1 max-w-xs text-xs text-[#64748B]">Select a mentor from your conversations to start chatting.</p>
                </div>
              </div>
            ) : messagesLoading ? (
              <div className="grid h-full place-items-center text-center text-sm text-[#94A3B8]">Loading messages...</div>
            ) : messagesError ? (
              <div className="grid h-full place-items-center text-center">
                <p className="text-sm font-semibold text-[#DC2626]">{messagesError}</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="grid h-full place-items-center text-center text-sm text-[#94A3B8]">
                No messages yet. Start the conversation with your mentor.
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message, index) => {
                  const showDate = index === 0 || messages[index - 1].date !== message.date;
                  return (
                    <div key={message.id ?? index}>
                      {showDate && message.date && (
                        <div className="my-4 flex justify-center"><span className="rounded-full border border-[#E2E8F0] bg-white px-4 py-1.5 text-xs font-semibold text-[#475569] shadow-sm">{message.date}</span></div>
                      )}
                      <MessageBubble message={message} onDeleteAttachment={handleDeleteAttachment} />
                    </div>
                  );
                })}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <footer className="chat-composer shrink-0 border-t border-[#E2E8F0] bg-white px-5 py-4">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelected}
                aria-hidden="true"
                tabIndex={-1}
              />
              <button
                onClick={handleAttachClick}
                disabled={!active || uploading}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-[#64748B] hover:bg-[#F1F5F9] disabled:cursor-not-allowed disabled:opacity-40"
                title="Attach file"
                aria-label="Attach file"
              >
                {uploading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Paperclip className="h-4.5 w-4.5" />}
              </button>
              <div className="relative min-w-0 flex-1">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  disabled={!active}
                  placeholder={active ? "Write a message..." : "Select a conversation to start messaging"}
                  className="h-12 w-full rounded-full border border-[#E2E8F0] bg-white pl-5 pr-11 text-sm outline-none focus:border-[#F39924] focus:ring-2 focus:ring-[#F39924]/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
                <button
                  type="button"
                  title="Emoji"
                  onClick={() => setDraft((value) => `${value}😊`)}
                  disabled={!active}
                  aria-label="Insert emoji"
                  className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-[#94A3B8] hover:bg-white hover:text-[#F39924] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Smile className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={handleSend}
                disabled={!active || !draft.trim() || sending}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#133B5D] text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                {sending ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Send className="h-4.5 w-4.5" />}
              </button>
            </div>
          </footer>
        </main>
      </div>

      {showNewConversation && (
        <div className="fixed inset-0 z-[90] flex justify-end bg-slate-950/35" onMouseDown={() => setShowNewConversation(false)}>
          <section onMouseDown={(e) => e.stopPropagation()} className="h-full w-full max-w-[420px] bg-white p-6 shadow-2xl">
            <button className="float-right rounded-lg p-2 hover:bg-[#F1F5F9]" onClick={() => setShowNewConversation(false)} aria-label="Close">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-[#133B5D]">Start New Conversation</h2>
            <p className="mt-2 text-sm text-[#64748B]">You can message the mentors assigned to your batches.</p>
            <div className="-mx-6 mt-5 border-t border-[#EEF2F7]">
              {!mentors.length ? (
                <p className="m-6 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs text-[#64748B]">
                  {mentorLoading ? "Looking up your assigned mentor…" : mentorStateText}
                </p>
              ) : mentors.map((item) => (
                <MentorRow
                  key={item.mentorId}
                  mentor={item}
                  conversation={conversationByMentor.get(String(item.mentorId))}
                  starting={startingConversation === String(item.mentorId)}
                  disabled={Boolean(startingConversation)}
                  onStart={handleStartConversation}
                />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
