import { useRef, useState } from "react";
import { Download, Eye, FileText, Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { downloadAttachment, viewAttachment } from "@shared/services/chatService";
import { triggerFileDownload } from "@shared/utils/download";
import { chatErrorMessage } from "@shared/utils/chatErrors";

const formatSize = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${unitIndex === 0 || value >= 10 ? Math.round(value) : value.toFixed(1)} ${units[unitIndex]}`;
};

// A compact attachment row rendered next to a chat message bubble — shared
// by Mentor Chat (pages/messages/MessagesPage.jsx) and Student Chat
// (features/student/pages/StudentMentorChat.jsx) so the view/download/delete
// behavior only lives in one place. It's a separate white card below the
// text bubble (not nested inside it), so it always sits on the chat panel's
// own light background whether the message is outgoing or incoming — one
// consistent light style for both, rather than trying to match whichever
// bubble color happens to be above it.
//
// View opens the file in a new tab via a temporary object URL (a blank tab is
// opened synchronously on click, then redirected once the blob resolves, to
// avoid popup blockers); Download saves it locally, preferring the filename
// the backend's own Content-Disposition header provides. Both call the
// authenticated API client — never an unauthenticated raw URL — since these
// endpoints sit behind auth like every other Chat route.
export default function ChatAttachmentCard({ attachment, canDelete = false, onDelete }) {
  const [busy, setBusy] = useState(""); // "" | "view" | "download" | "delete"
  const busyRef = useRef(false);
  if (!attachment) return null;
  const { attachmentId, filename, size } = attachment;

  const handleView = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy("view");
    // noopener in window.open can return null even when the tab was opened.
    // Retain the handle, then immediately detach its opener before loading.
    const preview = window.open("", "_blank");
    if (preview) preview.opener = null;
    let objectUrl;
    try {
      if (!preview) throw new Error("Allow pop-ups to view this attachment.");
      const { blob, contentType } = await viewAttachment(attachmentId);
      const typed = contentType && blob.type !== contentType ? new Blob([blob], { type: contentType }) : blob;
      objectUrl = URL.createObjectURL(typed);
      preview.location.href = objectUrl;
      window.setTimeout(() => { if (objectUrl) URL.revokeObjectURL(objectUrl); }, 60000);
    } catch (error) {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      preview?.close();
      toast.error(chatErrorMessage(error, "Unable to open this attachment. Please try again."));
    } finally {
      busyRef.current = false;
      setBusy("");
    }
  };

  const handleDownload = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy("download");
    try {
      const { blob, filename: serverFilename } = await downloadAttachment(attachmentId);
      triggerFileDownload(blob, serverFilename || filename || `attachment-${attachmentId}`);
    } catch (error) {
      toast.error(chatErrorMessage(error, "Unable to download this attachment. Please try again."));
    } finally {
      busyRef.current = false;
      setBusy("");
    }
  };

  const handleDelete = async () => {
    if (busyRef.current || !onDelete) return;
    // Reuses this app's existing window.confirm() pattern (already used for
    // several other delete actions) rather than introducing a new dialog.
    if (!window.confirm(`Delete "${filename}"? This action cannot be undone.`)) return;
    busyRef.current = true;
    setBusy("delete");
    try {
      await onDelete();
      toast.success("Attachment deleted.");
    } catch (error) {
      toast.error(chatErrorMessage(error, "Unable to delete this attachment. Please try again."));
    } finally {
      busyRef.current = false;
      setBusy("");
    }
  };

  const btnTone = "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#102A43]";

  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-[#E2E8F0] bg-white px-2.5 py-2 shadow-sm">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#F1F5F9] text-[#64748B]">
        <FileText className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-[#102A43]" title={filename}>{filename}</p>
        {size ? <p className="text-[10px] text-[#64748B]">{formatSize(size)}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          title="View"
          aria-label={`View ${filename}`}
          onClick={handleView}
          disabled={Boolean(busy)}
          className={`grid h-7 w-7 place-items-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-50 ${btnTone}`}
        >
          {busy === "view" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          title="Download"
          aria-label={`Download ${filename}`}
          onClick={handleDownload}
          disabled={Boolean(busy)}
          className={`grid h-7 w-7 place-items-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-50 ${btnTone}`}
        >
          {busy === "download" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
        </button>
        {canDelete && (
          <button
            type="button"
            title="Delete"
            aria-label={`Delete ${filename}`}
            onClick={handleDelete}
            disabled={Boolean(busy)}
            className="grid h-7 w-7 place-items-center rounded-lg text-rose-500 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy === "delete" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
}
