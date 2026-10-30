import { Mic } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const getSpeechRecognition = () =>
  window.SpeechRecognition || window.webkitSpeechRecognition || null;

export default function VoiceInput({ onTranscript }) {
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const supported = useMemo(() => Boolean(getSpeechRecognition()), []);

  useEffect(() => () => {
    recognitionRef.current?.abort?.();
  }, []);

  const toggleListening = () => {
    if (!supported) return;

    if (listening) {
      recognitionRef.current?.stop?.();
      setListening(false);
      return;
    }

    const SpeechRecognition = getSpeechRecognition();
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      if (transcript) onTranscript?.(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      disabled={!supported}
      aria-label={supported ? (listening ? "Stop voice input" : "Start voice input") : "Voice input unavailable"}
      title={supported ? (listening ? "Stop voice input" : "Voice input") : "Voice input unavailable"}
      className={`grid h-9 w-9 place-items-center rounded-full border transition ${
        listening
          ? "border-[#085FA7]/20 bg-[#085FA7]/10 text-[#085FA7]"
          : "border-slate-200 bg-white text-slate-500 hover:border-[#085FA7]/20 hover:text-[#085FA7] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:text-cyan-300"
      } disabled:cursor-not-allowed disabled:opacity-40`}
    >
      <Mic className={`h-4 w-4 ${listening ? "animate-pulse" : ""}`} />
    </button>
  );
}
