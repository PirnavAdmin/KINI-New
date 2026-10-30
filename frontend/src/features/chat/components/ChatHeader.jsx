import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { ArrowLeft, MoreVertical, Phone, Video } from "lucide-react";
import ChatAvatar from "./ChatAvatar";
import OnlineIndicator from "./OnlineIndicator";

export default function ChatHeader({ person, onBack, onToggleProfile, viewer }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="z-20 flex min-h-[72px] shrink-0 items-center gap-3 border-b border-slate-200/80 bg-white/80 px-3 py-2 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/75 sm:px-5"
    >
      <button
        type="button"
        onClick={onBack}
        className={`h-10 w-10 place-items-center rounded-2xl text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800 xl:hidden ${viewer === "student" ? "hidden" : "grid"}`}
        aria-label="Back to conversations"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <ChatAvatar person={person} size="sm" />

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-semibold text-slate-950 dark:text-white">
          {person.name}
        </h2>
        {viewer === "student" ? (
          <p className="mt-0.5 truncate text-[11px] text-slate-500">
            {[person.company, person.location].filter(Boolean).join(" · ")}
          </p>
        ) : (
          <div className="mt-0.5 flex items-center gap-2">
            <OnlineIndicator online={person.online} label={person.typing ? "Typing..." : undefined} />
            <span className="text-[11px] text-slate-400">{person.designation}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-2xl text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Voice call"
        >
          <Phone className="h-4.5 w-4.5" />
        </button>
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-2xl text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Video call"
        >
          <Video className="h-4.5 w-4.5" />
        </button>
        <button
          type="button"
          onClick={onToggleProfile}
          className="grid h-10 w-10 place-items-center rounded-2xl text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800 xl:hidden"
          aria-label="Open mentor details"
        >
          <MoreVertical className="h-4.5 w-4.5" />
        </button>
      </div>
    </motion.header>
  );
}

ChatHeader.propTypes = {
  person: PropTypes.object.isRequired,
  onBack: PropTypes.func.isRequired,
  onToggleProfile: PropTypes.func.isRequired,
  viewer: PropTypes.oneOf(["student", "mentor"]),
};
