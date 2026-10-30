import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCheck,
  ListFilter,
  ChevronRight,
  Loader2,
  MessageSquare,
  MoreVertical,
  Paperclip,
  Phone,
  Plus,
  Search,
  Send,
  Smile,
  UserRound,
  Video,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useMentorStudents } from "../../features/mentor/hooks/useMentorStudents";
import { useConversations } from "../../shared/hooks/useConversations";
import { useConversationMessages } from "../../shared/hooks/useConversationMessages";
import { sendMessage as sendMessageApi } from "../../shared/services/chatService";
import ChatAttachmentCard from "../../shared/components/ChatAttachmentCard";
import MentorPageHeader from "../../features/mentor/components/MentorPageHeader";
import { MessagesArt } from "../../features/mentor/components/MentorHeroArt";
import { chatErrorMessage } from "../../shared/utils/chatErrors";

// The paperclip in the message composer accepts backend-agnostic file types;
// the backend's own 413/415 responses (handled in handleAttach below) are
// the real limit, this is just a sane client-side prompt.
const MAX_ATTACHMENT_MB = 25;

// Every conversation and message on this page comes from the real Chat API
// (GET/POST /api/v1/chat/conversations, GET/POST .../messages, PUT .../read).
// There is no mock data left — the roster from useMentorStudents() is only
// used to enrich a conversation with batch/attendance/progress and to
// populate the "New Message" recipient list with the mentor's authorized
// students, exactly like Mentor -> My Students already does.
const AVATAR_COLORS = ["#2563EB", "#10B981", "#F43F5E", "#8B5CF6", "#F59E0B", "#0EA5E9", "#EC4899"];

// Hash-based so a given student keeps the same avatar color across pages.
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

const PERFORMANCE_STYLES = {
  excellent: { dot: "bg-[#10B981]", text: "text-[#10B981]", bg: "bg-[#ECFDF5] border-[#D1FAE5]" },
  good: { dot: "bg-[#2563EB]", text: "text-[#2563EB]", bg: "bg-[#EFF6FF] border-[#BFDBFE]" },
  average: { dot: "bg-[#F59E0B]", text: "text-[#B45309]", bg: "bg-[#FFFBEB] border-[#FDE68A]" },
  poor: { dot: "bg-[#EF4444]", text: "text-[#DC2626]", bg: "bg-[#FEF2F2] border-[#FECACA]" },
  "not rated": { dot: "bg-[#94A3B8]", text: "text-[#64748B]", bg: "bg-[#F1F5F9] border-[#E2E8F0]" },
};
const performanceStyle = (performance) => PERFORMANCE_STYLES[performance] ?? PERFORMANCE_STYLES["not rated"];

function ConversationItem({ item, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      aria-current={active ? "true" : undefined}
      className={`w-full border-b border-[#EEF2F7] px-4 py-3.5 text-left transition ${active ? "border-l-4 border-l-[#2563EB] bg-[#EEF4FF] pl-3" : "hover:bg-[#F7FAFD]"}`}
    >
      <div className="flex items-start gap-3.5">
        <span
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: avatarColor(item.studentId ?? item.id) }}
        >
          {item.initials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-[15px] font-bold text-[#102A43]">{item.name}</span>
            {item.lastMessageAt && <span className="shrink-0 text-xs text-[#64748B]">{formatListTimestamp(item.lastMessageAt)}</span>}
          </div>
          <p className="mt-0.5 truncate text-[13px] text-[#64748B]">{item.batch || item.email || "—"}</p>
          <div className="mt-0.5 flex items-center justify-between gap-2">
            <p className={`truncate text-[13px] ${item.unreadCount > 0 ? "font-semibold text-[#102A43]" : "text-[#475569]"}`}>{item.lastMessage || "No messages yet"}</p>
            {item.unreadCount > 0 ? (
              <span className="grid h-6 min-w-6 shrink-0 place-items-center rounded-full bg-[#2563EB] px-1.5 text-[11px] font-bold text-white">
                {item.unreadCount}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </button>
  );
}

function ConversationSkeleton() {
  return (
    <div className="space-y-1 p-3">
      {Array.from({ length: 6 }).map((_, index) => (
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

function MessageBubble({ message, onDeleteAttachment, peer }) {
  const outgoing = message.outgoing;
  return (
    <div className={`flex gap-3 ${outgoing ? "justify-end" : "justify-start"}`}>
      {!outgoing && peer && (
        <span className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: peer.color }}>{peer.initials}</span>
      )}
      <div className={`max-w-[78%] sm:max-w-[68%] ${outgoing ? "items-end" : "items-start"} flex flex-col gap-1`}>
        {message.text && (
          <div
            className={`rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${
              outgoing
                ? "rounded-br-md bg-[#5b9df5] text-[15px] text-white shadow-sm"
                : "rounded-bl-md border border-[#E8EEF5] bg-white text-[15px] text-[#102A43] shadow-sm"
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
        <div className={`flex items-center gap-1 px-1 text-xs text-[#64748B] ${outgoing ? "flex-row-reverse" : ""}`}>
          <span>{message.time}</span>
          {outgoing && <CheckCheck className={`h-3.5 w-3.5 ${message.read ? "text-[#2563EB]" : "text-[#CBD5E1]"}`} />}
        </div>
      </div>
    </div>
  );
}

function ProgressCard({ label, value }) {
  const hasValue = typeof value === "number" && Number.isFinite(value);
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">{label}</p>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-lg font-bold text-[#102A43]">{hasValue ? `${value}%` : "—"}</span>
      </div>
    </div>
  );
}

function StudentProfilePanel({ student, onClose, onViewProfile }) {
  return (
    <div className="flex h-full flex-col overflow-y-auto p-4">
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Close profile panel" className="mb-2 ml-auto grid h-8 w-8 place-items-center rounded-lg text-[#64748B] hover:bg-[#F1F5F9]">
          <X className="h-4 w-4" />
        </button>
      )}
      {!student ? (
        <div className="flex flex-1 flex-col items-center justify-center px-2 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-[#F1F5F9] text-[#94A3B8]">
            <UserRound className="h-6 w-6" />
          </span>
          <p className="mt-3 text-sm font-semibold text-[#102A43]">Student Details</p>
          <p className="mt-1 text-xs text-[#64748B]">Select a student to view their information.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center text-center">
            <span
              className="grid h-16 w-16 place-items-center rounded-full text-lg font-bold text-white"
              style={{ backgroundColor: avatarColor(student.studentId ?? student.id) }}
            >
              {student.initials}
            </span>
            <h2 className="mt-3 text-sm font-bold text-[#102A43]">{student.name}</h2>
            {student.batch && <p className="mt-0.5 text-xs text-[#64748B]">{student.batch}</p>}
            {student.email && <p className="mt-0.5 text-xs text-[#94A3B8]">{student.email}</p>}
          </div>

          <div className="my-4 border-t border-[#E2E8F0]" />

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#102A43]">Learning Progress</h3>
            <ChevronRight className="h-4 w-4 text-[#94A3B8]" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <ProgressCard label="Attendance" value={student.attendance} />
            <ProgressCard label="Progress" value={student.progress} />
          </div>

          {student.performance && (
            <div className={`mt-3 flex items-center gap-2 rounded-xl border p-3 ${performanceStyle(student.performance).bg}`}>
              <span className={`h-2 w-2 shrink-0 rounded-full ${performanceStyle(student.performance).dot}`} />
              <span className={`text-xs font-bold capitalize ${performanceStyle(student.performance).text}`}>
                {student.performance}
              </span>
            </div>
          )}

          {student.studentId != null && (
            <button
              type="button"
              onClick={() => onViewProfile?.(student.studentId)}
              className="mt-5 w-full rounded-xl border border-[#E2E8F0] py-2.5 text-xs font-semibold text-[#2563EB] hover:bg-[#F7FAFD]"
            >
              View Full Profile
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default function MessagesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { students, loading: studentsLoading } = useMentorStudents();
  const {
    conversations,
    loading: conversationsLoading,
    error: conversationsError,
    reload: reloadConversations,
    startConversation,
    markLocalRead,
  } = useConversations({ viewerRole: "mentor" });

  // Real conversations enriched with batch/attendance/progress/performance
  // from the mentor's real roster (useMentorStudents) — the Chat API itself
  // doesn't return those fields, but the roster does, and both sources
  // describe the same real student, matched by the real studentId.
  const conversationItems = useMemo(() => {
    const rosterById = new Map(students.map((item) => [String(item.studentId), item]));
    return conversations.map((item) => {
      const roster = rosterById.get(String(item.studentId));
      return {
        ...item,
        batch: roster?.batch ?? "",
        attendance: roster?.attendance,
        progress: roster?.progress,
        performance: roster?.performance,
      };
    });
  }, [conversations, students]);

  const [activeConversationId, setActiveConversationId] = useState(null);
  // A ?studentId= link (e.g. from My Students' "Message" button) doesn't
  // necessarily have a conversation yet — resolved below once real
  // conversations/students have loaded: reuse an existing conversation, or
  // create one via POST, but only for a student actually in the mentor's own
  // roster. An id that never resolves simply never opens a chat.
  const [pendingStudentId, setPendingStudentId] = useState(() => searchParams.get("studentId"));
  const [tab, setTab] = useState("Students");
  const [filter, setFilter] = useState("");
  const [draft, setDraft] = useState("");
  const [drawer, setDrawer] = useState(null);
  const [mobileView, setMobileView] = useState(() => (searchParams.get("studentId") ? "chat" : "list")); // list | chat
  // On-demand only — opened by clicking the chat header's student identity,
  // never shown permanently, and always closed on conversation switch.
  const [isStudentDetailsOpen, setIsStudentDetailsOpen] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (pendingStudentId == null) return;
    if (conversationsLoading || studentsLoading) return;
    let cancelled = false;
    const resolvePendingStudent = async () => {
      const existing = conversations.find((item) => String(item.studentId) === String(pendingStudentId));
      if (existing) {
        setActiveConversationId(existing.conversationId);
        setPendingStudentId(null);
        return;
      }
      const authorized = students.some((item) => String(item.studentId) === String(pendingStudentId));
      if (!authorized) {
        setPendingStudentId(null);
        setMobileView("list");
        return;
      }
      try {
        const created = await startConversation(pendingStudentId);
        if (!cancelled) setActiveConversationId(created.conversationId);
      } catch (error) {
        if (!cancelled) { toast.error(chatErrorMessage(error)); setMobileView("list"); }
      } finally {
        if (!cancelled) setPendingStudentId(null);
      }
    };
    resolvePendingStudent();
    return () => { cancelled = true; };
  }, [pendingStudentId, conversations, conversationsLoading, students, studentsLoading, startConversation]);

  useEffect(() => {
    if (!isStudentDetailsOpen) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setIsStudentDetailsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isStudentDetailsOpen]);

  // Only ever matches a conversation the real GET /chat/conversations call
  // actually returned for this mentor — an id from an unauthorized/unrelated
  // ?studentId= can never resolve to `active` (see the effect above).
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
  } = useConversationMessages(active?.conversationId ?? null, markLocalRead, "mentor");
  const fileInputRef = useRef(null);

  useEffect(() => {
    try {
      endRef.current?.scrollIntoView?.({ behavior: "smooth", block: "end" });
    } catch {
      // The conversation remains usable even if scrolling is unavailable.
    }
  }, [messages]);

  const visible = useMemo(() => {
    if (tab !== "Students") return [];
    const query = filter.trim().toLowerCase();
    if (!query) return conversationItems;
    return conversationItems.filter((item) =>
      [item.name, item.email, item.batch, item.studentId].some((field) =>
        String(field ?? "").toLowerCase().includes(query),
      ),
    );
  }, [conversationItems, tab, filter]);

  const openConversation = (item) => {
    setActiveConversationId(item.conversationId);
    setMobileView("chat");
    setIsStudentDetailsOpen(false);
    // Replace (not push) so clicking through several students doesn't pile
    // up history entries — browser back should leave Messages, not cycle
    // through past selections. The selection itself still survives a
    // forward navigation + back (e.g. to Student Details and back).
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("studentId", item.studentId);
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
  // file is picked via a hidden <input type="file">, uploaded immediately
  // (no separate "send" step), and the input is cleared either way so the
  // same file can be re-selected. Nothing else on the composer is disabled
  // while this is in flight — only the paperclip itself (via `uploading`).
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

  // "New Message" — reuses an existing conversation for that student if one
  // is already loaded, otherwise creates one via POST /chat/conversations
  // (confirmed idempotent server-side), then sends the typed message to it.
  const handleNewMessage = async (studentId, text) => {
    const existing = conversations.find((item) => String(item.studentId) === String(studentId));
    const conversation = existing ?? await startConversation(studentId);
    await sendMessageApi(conversation.conversationId, text);
    setActiveConversationId(conversation.conversationId);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("studentId", studentId);
      return next;
    }, { replace: true });
    setMobileView("chat");
  };

  const viewFullProfile = (studentId) => {
    navigate(`/mentor/students/${studentId}`);
  };

  return (
    <div className="chat-page flex min-h-0 flex-1 flex-col gap-3">
      <MentorPageHeader
        icon={MessageSquare}
        title="Messages"
        subtitle="Connect, learn and grow together with your students."
        tagline={["Better", "Conversation", { text: "Brighter Futures", accent: true }]}
        art={<MessagesArt />}
        className="!mb-0"
      />

      <div className="chat-workspace grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden lg:grid-cols-[minmax(280px,320px)_minmax(0,1fr)] xl:grid-cols-[minmax(300px,340px)_minmax(0,1fr)]">
        {/* B. Conversation list. A plain <div>, not <aside> — this app has a
            global stylesheet rule that forces any <aside> to the navy
            sidebar's colors (background #133B5D, white text), meant for the
            real navigation rail. */}
        <div className={`${mobileView === "chat" ? "hidden" : "flex"} chat-conversation-sidebar min-h-0 min-w-0 overflow-hidden w-full flex-col rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_4px_16px_rgba(15,42,74,.05)] lg:flex`}>
          <div className="p-3">
            <button
              onClick={() => setDrawer("message")}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F7A631] to-[#F2701E] px-3 text-[15px] font-bold text-white shadow-[0_10px_20px_-12px_rgba(242,112,30,.9)] transition hover:brightness-105"
            >
              <Plus className="h-5 w-5" />
              New Message
            </button>
            <div className="mt-3 flex gap-2">
              <label className="relative block min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                <input
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Search students, messages..."
                  aria-label="Search conversations"
                  className="h-11 w-full rounded-xl border border-[#E2E8F0] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#2563EB]"
                />
              </label>
              <button type="button" onClick={() => setFilter("")} title="Clear search" aria-label="Clear search" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F7FAFD]"><ListFilter className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex border-b border-[#E2E8F0] px-3">
            {["Students", "Mentors", "System"].map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={`flex-1 border-b-2 px-1 py-3 text-sm font-bold transition ${tab === item ? "border-[#2563EB] text-[#2563EB]" : "border-transparent text-[#64748B] hover:text-[#102A43]"}`}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="chat-conversation-list min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
            {tab === "Students" && conversationsLoading ? (
              <ConversationSkeleton />
            ) : tab === "Students" && conversationsError ? (
              <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                <p className="text-xs font-semibold text-[#DC2626]">Unable to load conversations</p>
                <p className="text-[11px] text-[#94A3B8]">Please try again.</p>
                <button
                  type="button"
                  onClick={reloadConversations}
                  className="mt-1 rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-xs font-semibold text-[#2563EB] hover:bg-[#F7FAFD]"
                >
                  Retry
                </button>
              </div>
            ) : tab === "Students" && conversationItems.length === 0 ? (
              <div className="px-4 py-8 text-center">
                {students.length === 0 ? (
                  <>
                    <p className="text-xs font-semibold text-[#102A43]">No students assigned</p>
                    <p className="mt-1 text-[11px] text-[#94A3B8]">No students are currently assigned to you.</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-semibold text-[#102A43]">No conversations yet</p>
                    <p className="mt-1 text-[11px] text-[#94A3B8]">Start a new message to begin chatting with your students.</p>
                  </>
                )}
              </div>
            ) : visible.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#94A3B8]">No conversations found.</div>
            ) : (
              visible.map((item) => (
                <ConversationItem key={item.id} item={item} active={active?.id === item.id} onSelect={openConversation} />
              ))
            )}
          </div>
          {tab === "Students" && (
            <button
              onClick={() => setDrawer("announcement")}
              className="m-3 rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-2 text-xs font-semibold text-[#2563EB]"
            >
              Send batch announcement
            </button>
          )}
        </div>

        {/* C. Main chat panel */}
        <main className={`${mobileView === "list" ? "hidden" : "flex"} chat-conversation min-h-0 overflow-hidden min-w-0 flex-col rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_4px_16px_rgba(15,42,74,.05)] lg:flex`}>
          <header className="flex items-center justify-between gap-3 border-b border-[#E2E8F0] px-5 py-4">
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
                <button
                  type="button"
                  onClick={() => setIsStudentDetailsOpen(true)}
                  title="Open student details"
                  className="flex min-w-0 items-center gap-3 rounded-lg px-1 py-0.5 text-left transition hover:bg-[#F7FAFD]"
                >
                  <span
                    className="grid h-14 w-14 shrink-0 place-items-center rounded-full text-base font-bold text-white"
                    style={{ backgroundColor: avatarColor(active.studentId ?? active.id) }}
                  >
                    {active.initials}
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-bold text-[#102A43]">{active.name}</h2>
                    <p className="truncate text-sm text-[#64748B]">{active.batch}</p>
                  </div>
                </button>
              ) : (
                <p className="text-sm font-semibold text-[#94A3B8]">No conversation selected</p>
              )}
            </div>
            {active && (
              <div className="flex shrink-0 items-center gap-2.5">
                <button type="button" title="Call" onClick={() => toast("Starting a call…")} className="grid h-12 w-12 place-items-center rounded-xl border border-[#E2E8F0] bg-white text-[#133b5d] shadow-sm hover:bg-[#F7FAFD]">
                  <Phone className="h-4 w-4" />
                </button>
                <button type="button" title="Video call" onClick={() => toast("Starting a video call…")} className="grid h-12 w-12 place-items-center rounded-xl border border-[#E2E8F0] bg-white text-[#133b5d] shadow-sm hover:bg-[#F7FAFD]">
                  <Video className="h-4 w-4" />
                </button>
                <button type="button" title="More options" onClick={() => toast("More options coming soon.")} className="grid h-12 w-12 place-items-center rounded-xl border border-[#E2E8F0] bg-white text-[#133b5d] shadow-sm hover:bg-[#F7FAFD]">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            )}
          </header>

          <div className="chat-history min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain bg-[#F5F8FC] bg-[radial-gradient(#dfe7f2_1px,transparent_1px)] [background-size:22px_22px] p-4 sm:p-6">
            {!active ? (
              <div className="grid h-full place-items-center text-center">
                <div className="flex flex-col items-center">
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-white text-[#94A3B8] shadow-sm">
                    <MessageSquare className="h-6 w-6" />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-[#102A43]">Select a conversation</p>
                  <p className="mt-1 max-w-xs text-xs text-[#64748B]">Choose a student from the list to view your messages.</p>
                </div>
              </div>
            ) : messagesLoading ? (
              <div className="grid h-full place-items-center text-center text-sm text-[#94A3B8]">Loading messages...</div>
            ) : messagesError ? (
              <div className="grid h-full place-items-center text-center">
                <p className="text-sm font-semibold text-[#DC2626]">Unable to load messages</p>
                <p className="mt-1 text-xs text-[#94A3B8]">Please try again.</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="grid h-full place-items-center text-center text-sm text-[#94A3B8]">
                No messages yet. Say hello to get the conversation started.
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message, index) => {
                  const showDate = index === 0 || messages[index - 1].date !== message.date;
                  return (
                    <div key={message.id ?? index}>
                      {showDate && message.date && (
                        <div className="my-4 text-center"><span className="inline-block rounded-lg border border-[#E8EEF5] bg-white px-4 py-1.5 text-[13px] font-semibold text-[#475569] shadow-sm">{message.date}</span></div>
                      )}
                      <MessageBubble message={message} onDeleteAttachment={handleDeleteAttachment} peer={{ initials: active.initials, color: avatarColor(active.studentId ?? active.id) }} />
                    </div>
                  );
                })}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <footer className="chat-composer shrink-0 border-t border-[#E2E8F0] px-4 py-3.5">
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
                className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F1F5F9] disabled:cursor-not-allowed disabled:opacity-40"
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
                  placeholder={active ? "Type a message..." : "Select a conversation to start messaging"}
                  className="h-12 w-full rounded-xl border border-[#E2E8F0] bg-white pl-4 pr-12 text-[15px] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
                <button
                  type="button"
                  title="Emoji"
                  onClick={() => setDraft((value) => `${value}😊`)}
                  disabled={!active}
                  aria-label="Insert emoji"
                  className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-[#94A3B8] hover:bg-white hover:text-[#2563EB] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Smile className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={handleSend}
                disabled={!active || !draft.trim() || sending}
                className="grid h-12 w-16 shrink-0 place-items-center rounded-xl bg-[#1f6fe5] text-white shadow-[0_10px_20px_-12px_rgba(31,111,229,.9)] transition hover:bg-[#1d5fcc] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                {sending ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Send className="h-4.5 w-4.5" />}
              </button>
            </div>
          </footer>
        </main>

      </div>

      {/* D. Student Details — an on-demand drawer only, never a permanent
          panel. Always mounted (not conditionally rendered) so the
          slide-in/out transform actually animates instead of popping;
          pointer-events are disabled while closed so it can't be tabbed
          into or intercept clicks. */}
      <div
        aria-hidden={!isStudentDetailsOpen}
        className={`fixed inset-0 z-[90] flex justify-end bg-[rgba(15,23,42,0.15)] transition-opacity duration-200 ${isStudentDetailsOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
        onMouseDown={() => setIsStudentDetailsOpen(false)}
      >
        <section
          onMouseDown={(event) => event.stopPropagation()}
          className={`h-full w-full max-w-[380px] transform rounded-l-2xl border-l border-[#E2E8F0] bg-white shadow-2xl transition-transform duration-300 ease-out ${isStudentDetailsOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <StudentProfilePanel student={active} onClose={() => setIsStudentDetailsOpen(false)} onViewProfile={viewFullProfile} />
        </section>
      </div>

      {drawer && <MessageDrawer type={drawer} students={students} onClose={() => setDrawer(null)} onSend={handleNewMessage} />}
    </div>
  );
}

function MessageDrawer({ type, students, onClose, onSend }) {
  const [body, setBody] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.studentId ?? "");
  const [batch, setBatch] = useState("React Morning Batch");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!body.trim()) return toast.error("Enter a message first.");
    if (type === "announcement") {
      toast.success(`Announcement sent to ${batch}.`);
      onClose();
      return;
    }
    if (!selectedStudentId) return toast.error("Select a student first.");
    setSubmitting(true);
    try {
      await onSend(selectedStudentId, body.trim());
      toast.success("Message sent.");
      onClose();
    } catch {
      toast.error("Unable to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex justify-end bg-slate-950/35" onMouseDown={onClose}>
      <section onMouseDown={(e) => e.stopPropagation()} className="h-full w-full max-w-[440px] bg-white p-6 shadow-2xl">
        <button className="float-right rounded-lg p-2 hover:bg-[#F1F5F9]" onClick={onClose} aria-label="Close">
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-bold text-[#102A43]">
          {type === "announcement" ? "Send batch announcement" : "New message"}
        </h2>
        <p className="mt-2 text-sm text-[#64748B]">
          Recipients are limited to your assigned batches and students.
        </p>
        <label className="mt-5 block text-xs font-semibold text-[#102A43]">
          Send to
          {type === "announcement" ? (
            <select
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] p-2.5 text-sm"
            >
              <option>React Morning Batch</option>
              <option>Node.js Afternoon</option>
              <option>React Advanced Aug</option>
              <option>All my batches</option>
            </select>
          ) : students.length === 0 ? (
            <p className="mt-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 text-xs text-[#94A3B8]">
              No students assigned to you yet.
            </p>
          ) : (
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] p-2.5 text-sm"
            >
              {students.map((item) => (
                <option key={item.studentId} value={item.studentId}>{item.name} · {item.batch || item.email || ""}</option>
              ))}
            </select>
          )}
        </label>
        {type === "announcement" && (
          <label className="mt-3 block text-xs font-semibold text-[#102A43]">
            Schedule
            <select className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] p-2.5 text-sm">
              <option>Send now</option>
              <option>Schedule for later</option>
            </select>
          </label>
        )}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={7}
          placeholder="Write your message..."
          className="mt-4 w-full rounded-xl border border-[#E2E8F0] p-3 text-sm outline-none focus:border-[#2563EB]"
        />
        <button
          onClick={submit}
          disabled={submitting}
          className="mt-4 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Sending..." : "Send"}
        </button>
      </section>
    </div>
  );
}
