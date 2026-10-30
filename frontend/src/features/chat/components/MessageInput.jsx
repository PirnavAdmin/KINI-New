import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Image, Mic, Paperclip, Send, Smile, X } from "lucide-react";
import AttachmentPreview from "./AttachmentPreview";

const EMOJIS = ["😀", "🙂", "👍", "👏", "🎉", "🔥", "💡", "✅", "🙏", "💻", "📚", "🚀"];

export default function MessageInput({ onSend }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const textareaRef = useRef(null);
  const fileRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 132)}px`;
  }, [text]);

  useEffect(() => {
    if (!file || !file.type?.startsWith("image/")) {
      setPreviewUrl("");
      return undefined;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const submit = () => {
    if (!text.trim() && !file) {
      return;
    }

    onSend({
      text: text.trim(),
      file,
      image: previewUrl
        ? {
            src: previewUrl,
            alt: file?.name || "Uploaded image",
            caption: file?.name || "Image attachment",
          }
        : undefined,
    });

    setText("");
    setFile(null);
    setEmojiOpen(false);
    if (fileRef.current) {
      fileRef.current.value = "";
    }
    if (imageRef.current) {
      imageRef.current.value = "";
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <div className="relative z-20 w-full min-w-0 shrink-0 border-t border-slate-200/80 bg-white/85 px-2 py-2 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/75 sm:px-4 sm:py-3">
      {emojiOpen ? (
        <div className="absolute bottom-full left-2 z-30 mb-2 w-[min(18rem,calc(100%-1rem))] rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.55)] dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Frequently used
            </p>
            <button
              type="button"
              onClick={() => setEmojiOpen(false)}
              className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close emoji picker"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-6 gap-1">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setText((current) => `${current}${emoji}`)}
                className="grid h-10 place-items-center rounded-xl text-xl transition hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <AttachmentPreview file={file} onRemove={() => setFile(null)} />

      <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
        <div className="flex shrink-0 items-center gap-0.5 rounded-[1.35rem] border border-slate-200 bg-white px-1 py-1 dark:border-slate-700 dark:bg-slate-900 sm:gap-1 sm:px-2">
          <button
            type="button"
            onClick={() => setEmojiOpen((value) => !value)}
            className="grid h-8 w-8 place-items-center rounded-2xl text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800 sm:h-10 sm:w-10"
            aria-label="Emoji picker"
          >
            <Smile className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="grid h-8 w-8 place-items-center rounded-2xl text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800 sm:h-10 sm:w-10"
            aria-label="Attach file"
          >
            <Paperclip className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            onClick={() => imageRef.current?.click()}
            className="grid h-8 w-8 place-items-center rounded-2xl text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800 sm:h-10 sm:w-10"
            aria-label="Attach image"
          >
            <Image className="h-4.5 w-4.5" />
          </button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt,.zip,.csv"
          className="hidden"
          onChange={(event) => {
            setFile(event.target.files?.[0] || null);
            event.target.value = "";
          }}
        />
        <input
          ref={imageRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            setFile(event.target.files?.[0] || null);
            event.target.value = "";
          }}
        />

        <div className="flex min-h-12 min-w-0 flex-1 items-center rounded-[1.5rem] border border-slate-200 bg-white px-3 py-2 shadow-[0_16px_32px_-30px_rgba(15,23,42,0.45)] dark:border-slate-700 dark:bg-slate-900 sm:px-4">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Type a message..."
            className="max-h-[132px] min-h-[24px] min-w-0 w-full resize-none bg-transparent text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
          />
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={!text.trim() && !file}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#00a884] text-white shadow-[0_18px_40px_-20px_rgba(0,168,132,0.9)] transition hover:scale-[1.03] hover:bg-[#008f70] disabled:cursor-not-allowed disabled:opacity-40 sm:h-12 sm:w-12"
          aria-label="Send message"
        >
          <Send className="h-5 w-5" />
        </button>

        <button
          type="button"
          className="hidden h-12 w-12 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 lg:grid"
          aria-label="Record voice note"
        >
          <Mic className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

MessageInput.propTypes = {
  onSend: PropTypes.func.isRequired,
};
