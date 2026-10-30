import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@shared/hooks/useAuth";
import { buildSmartActions, detectIntent } from "../services/intentEngine";
import { getAssistantGreeting, getQuickPrompts, sendAssistantQuery } from "../services/assistantApi";

const STORAGE_PREFIX = "pirnav:kini-assistant:v4";
const MAX_SAVED_MESSAGES = 20;

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const timestamp = () => Date.now();

const normalizeStoredMessages = (messages = []) =>
  messages
    .filter(Boolean)
    .map((message) => ({
      id: message.id || createId(),
      role: message.role === "assistant" ? "assistant" : "user",
      content: String(message.content ?? message.text ?? ""),
      createdAt: message.createdAt || timestamp(),
      status: message.status || "done",
      prompt: message.prompt || "",
      error: message.error || "",
      feedback: message.feedback || "",
    }))
    .slice(-MAX_SAVED_MESSAGES);

const buildStarterMessages = ({ role, isAuthenticated }) => [
  {
    id: createId(),
    role: "assistant",
    content: getAssistantGreeting({ role, isAuthenticated }),
    createdAt: timestamp(),
    status: "done",
  },
];

const readMessages = ({ storageKey, role, isAuthenticated }) => {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "null");
    const restored = normalizeStoredMessages(stored?.messages || []);
    return restored.length ? restored : buildStarterMessages({ role, isAuthenticated });
  } catch {
    return buildStarterMessages({ role, isAuthenticated });
  }
};

export const useKiniAssistantState = () => {
  const { user, role, isAuthenticated } = useAuth();
  const storageKey = useMemo(() => {
    const identity = user?.userId ?? user?.id ?? user?.email ?? "guest";
    return `${STORAGE_PREFIX}:${role || "guest"}:${encodeURIComponent(String(identity))}`;
  }, [role, user?.email, user?.id, user?.userId]);

  const [messages, setMessages] = useState(() => readMessages({ storageKey, role, isAuthenticated }));
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [lastContext, setLastContext] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [learningGoal, setLearningGoal] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ messages: normalizeStoredMessages(messages) }));
    } catch {
      // Persistence is best effort only.
    }
  }, [messages, storageKey]);

  const appendMessage = useCallback((message) => {
    setMessages((current) => [...current, message].slice(-MAX_SAVED_MESSAGES));
  }, []);

  const replaceMessage = useCallback((messageId, updater) => {
    setMessages((current) =>
      current.map((message) => (message.id === messageId ? updater(message) : message)).slice(-MAX_SAVED_MESSAGES)
    );
  }, []);

  const clearChat = useCallback(() => {
    const nextMessages = buildStarterMessages({ role, isAuthenticated });
    setMessages(nextMessages);
    setLastContext(null);
    setInput("");
    try {
      localStorage.setItem(storageKey, JSON.stringify({ messages: nextMessages }));
    } catch {
      // Ignore storage failures.
    }
  }, [isAuthenticated, role, storageKey]);

  const sendMessage = useCallback(async (rawPrompt) => {
    const prompt = String(rawPrompt ?? input).trim();
    if (!prompt || isSending) return;

    const userMessage = {
      id: createId(),
      role: "user",
      content: prompt,
      createdAt: timestamp(),
      status: "done",
    };

    const assistantMessageId = createId();
    const assistantPlaceholder = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      createdAt: timestamp(),
      status: "loading",
      prompt,
    };

    setInput("");
    appendMessage(userMessage);
    appendMessage(assistantPlaceholder);
    setIsSending(true);

    try {
      const conversationHistory = [...messages, userMessage].slice(-8);
      const response = await sendAssistantQuery({
        prompt,
        user,
        role,
        isAuthenticated,
        messages: conversationHistory,
      });

      setLastContext(response.context);
      setSelectedCourse(response.context?.liveData?.courses?.sample?.[0] || null);
      setSelectedMentor(response.context?.liveData?.mentors?.sample?.[0] || null);
      setLearningGoal(prompt);
      setCareerGoal(response.intent?.primary === "mentor" ? prompt : careerGoal);
      replaceMessage(assistantMessageId, (message) => ({
        ...message,
        content: response.answer,
        status: "done",
        error: "",
      }));
    } catch (error) {
      const friendlyMessage =
        error?.response?.status === 401
          ? "⚠️ I could not access the live backend because your session is no longer authorized. Please sign in again and retry."
          : error?.message || "⚠️ I could not reach the AI backend. Please try again.";

      replaceMessage(assistantMessageId, (message) => ({
        ...message,
        content: friendlyMessage,
        status: "error",
        error: friendlyMessage,
      }));
    } finally {
      setIsSending(false);
    }
  }, [appendMessage, careerGoal, input, isSending, isAuthenticated, messages, replaceMessage, role, user]);

  const retryMessage = useCallback((message) => {
    if (message?.prompt) sendMessage(message.prompt);
  }, [sendMessage]);

  const markFeedback = useCallback((messageId, feedback) => {
    setMessages((current) =>
      current.map((message) => (message.id === messageId ? { ...message, feedback } : message))
    );
  }, []);

  const quickPrompts = useMemo(() => getQuickPrompts(role), [role]);
  const suggestedActions = useMemo(() => buildSmartActions(role, input), [input, role]);
  const intent = useMemo(() => detectIntent(input), [input]);

  return {
    user,
    role,
    isAuthenticated,
    storageKey,
    messages,
    setMessages,
    input,
    setInput,
    isSending,
    lastContext,
    clearChat,
    sendMessage,
    retryMessage,
    markFeedback,
    quickPrompts,
    suggestedActions,
    intent,
    selectedCourse,
    selectedMentor,
    learningGoal,
    careerGoal,
    language,
    setLanguage,
    setLearningGoal,
    setCareerGoal,
  };
};

export const useKiniAssistant = useKiniAssistantState;

export default useKiniAssistantState;
