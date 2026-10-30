import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import ChatHeader from "./ChatHeader";
import DateSeparator from "./DateSeparator";
import EmptyState from "./EmptyState";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";

export default function ChatWindow({ person, messages, onSend, onBack, onToggleProfile, viewer }) {
  const messagesRef = useRef(null);
  const stickToBottomRef = useRef(true);
  const previousThreadIdRef = useRef(person.id);
  const previousLengthRef = useRef(messages.length);

  useEffect(() => {
    const threadChanged = previousThreadIdRef.current !== person.id;
    const threadGrew = messages.length > previousLengthRef.current;

    if ((threadChanged || threadGrew) && (threadChanged || stickToBottomRef.current)) {
      messagesRef.current?.scrollTo({
        top: messagesRef.current.scrollHeight,
        behavior: threadChanged ? "auto" : "smooth",
      });
    }

    previousThreadIdRef.current = person.id;
    previousLengthRef.current = messages.length;
  }, [messages.length, person.id]);

  if (!person) {
    return <EmptyState />;
  }

  return (
    <section className="mentor-chat-window flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden bg-[#efeae2] dark:bg-slate-950">
      <ChatHeader person={person} onBack={onBack} onToggleProfile={onToggleProfile} viewer={viewer} />

      <div
        ref={messagesRef}
        onScroll={(event) => {
          const area = event.currentTarget;
          stickToBottomRef.current = area.scrollHeight - area.scrollTop - area.clientHeight < 80;
        }}
        className="custom-scrollbar min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-[radial-gradient(rgba(15,81,50,0.1)_1px,transparent_1px)] bg-[size:18px_18px] px-3 py-4 dark:bg-slate-950 sm:px-6"
      >
        {!messages.length && !person.typing && (
          <div className="flex h-full min-h-40 flex-col items-center justify-center text-center text-slate-500">
            <p className="font-semibold text-slate-700">No messages yet</p>
            <p className="mt-1 text-sm">Start a conversation with your mentor.</p>
          </div>
        )}
        {messages.map((message, index) => {
          const showSeparator =
            index === 0 || message.date !== messages[index - 1].date;

          return (
            <div key={message.id}>
              {showSeparator ? <DateSeparator label={message.date} /> : null}
              <MessageBubble message={message} />
            </div>
          );
        })}

        {person.typing ? <TypingIndicator name={person.name.split(" ")[0]} /> : null}
      </div>

      <MessageInput onSend={onSend} />
    </section>
  );
}

ChatWindow.propTypes = {
  person: PropTypes.object,
  messages: PropTypes.array.isRequired,
  onSend: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onToggleProfile: PropTypes.func.isRequired,
  viewer: PropTypes.oneOf(["student", "mentor"]),
};
