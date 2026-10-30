import { AvatarPhoto } from "@/components/common/ProfileImage";
import { avatarTone, getInitials, statusTone } from "./studentUi";

// Profile photo when one is available, otherwise initials on a stable pastel per student name.
export function StudentAvatar({ name, photoUrl, className = "h-8 w-8 text-xs" }) {
  const tone = avatarTone(name);
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center overflow-hidden rounded-full font-bold ${className}`}
      style={{ backgroundColor: tone.bg, color: tone.fg }}
    >
      <AvatarPhoto src={photoUrl} fallback={getInitials(name)} />
    </span>
  );
}

// Status pill (dot + label) using the student's real backend status.
export function StatusPill({ status, className = "" }) {
  const tone = statusTone(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${className}`}
      style={{ backgroundColor: tone.bg, color: tone.fg }}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: tone.dot }}
      />
      {status}
    </span>
  );
}
