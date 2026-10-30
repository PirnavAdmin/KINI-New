import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { Code2, Play, Image as ImageIcon } from "lucide-react";
import MessageStatus from "./MessageStatus";
import FileCard from "./FileCard";

function VoiceMessage({ duration, transcript, outgoing }) {
  return (
    <div className={`rounded-2xl px-4 py-3 ${outgoing ? "bg-white/10" : "bg-slate-100/80 dark:bg-slate-800/70"}`}>
      <div className="flex items-center gap-3">
        <span className={`grid h-9 w-9 place-items-center rounded-full ${outgoing ? "bg-white/15" : "bg-white dark:bg-slate-900"}`}>
          <Play className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {["w-2", "w-3", "w-4", "w-5", "w-6", "w-7"].map((widthClass, index) => (
              <span
                key={index}
                className={`h-2 rounded-full ${widthClass} ${
                  outgoing ? "bg-white/70" : "bg-slate-300 dark:bg-slate-600"
                }`}
              />
            ))}
          </div>
          <p className={`mt-1 text-[11px] ${outgoing ? "text-white/70" : "text-slate-400"}`}>
            Voice note {duration ? `- ${duration}` : ""}
          </p>
        </div>
      </div>
      {transcript ? (
        <p className={`mt-3 text-xs leading-5 ${outgoing ? "text-white/85" : "text-slate-500 dark:text-slate-300"}`}>
          {transcript}
        </p>
      ) : null}
    </div>
  );
}

export default function MessageBubble({ message }) {
  const outgoing = message.sender === "student";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18 }}
      className={`mb-3 flex min-w-0 ${outgoing ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`min-w-0 max-w-[88%] [overflow-wrap:anywhere] rounded-[1.6rem] px-4 py-3 text-sm shadow-[0_16px_36px_-30px_rgba(15,23,42,0.7)] sm:max-w-[75%] ${
          outgoing
            ? "rounded-br-md bg-[#d9fdd3] text-slate-800"
            : "rounded-bl-md border border-slate-200 bg-white text-slate-700 dark:border-slate-700/80 dark:bg-slate-900/85 dark:text-slate-100"
        }`}
      >
        {message.type === "text" ? (
          <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] leading-6">{message.text}</p>
        ) : null}

        {message.type === "file" ? (
          <FileCard name={message.fileName} size={message.fileSize} type={message.fileExt?.toLowerCase()} />
        ) : null}

        {message.type === "image" ? (
          <div className="overflow-hidden rounded-[1.3rem] border border-white/20 bg-black/5">
            <img
              src={message.image?.src}
              alt={message.image?.alt || "Attached image"}
              className="h-56 w-full object-cover"
            />
            {message.image?.caption ? (
              <div className="px-4 py-3 text-xs text-slate-500 dark:text-slate-300">
                <ImageIcon className="mb-1 h-4 w-4 text-blue-500" />
                {message.image.caption}
              </div>
            ) : null}
          </div>
        ) : null}

        {message.type === "code" ? (
          <div className="overflow-hidden rounded-[1.2rem] border border-slate-200 bg-slate-950 px-4 py-3 text-[12px] text-slate-100 dark:border-slate-700">
            <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-slate-400">
              <Code2 className="h-3.5 w-3.5" />
              {message.language || "Code"}
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap break-words [overflow-wrap:anywhere] font-mono leading-6">
              {message.code}
            </pre>
          </div>
        ) : null}

        {message.type === "voice" ? (
          <VoiceMessage
            duration={message.duration}
            transcript={message.transcript}
            outgoing={outgoing}
          />
        ) : null}

        <div
          className={`mt-2 flex items-center justify-end gap-1 text-[10px] ${
            outgoing ? "text-emerald-800/70" : "text-slate-400"
          }`}
        >
          <span>{message.time}</span>
          {outgoing ? <MessageStatus status={message.status} /> : null}
        </div>
      </div>
    </motion.article>
  );
}

MessageBubble.propTypes = {
  message: PropTypes.object.isRequired,
};

VoiceMessage.propTypes = {
  duration: PropTypes.string,
  transcript: PropTypes.string,
  outgoing: PropTypes.bool.isRequired,
};
