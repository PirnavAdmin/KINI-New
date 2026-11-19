import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@shared/hooks/useAuth";
import { useLocation } from 'react-router-dom';
import { isHrModuleUser } from '@features/hr/constants/hrPermissions';
import usePermission from '@shared/hooks/usePermission';
import { buildSmartActions, detectIntent } from "../services/intentEngine";
import { getAssistantGreeting, getQuickPrompts, sendAssistantQuery } from "../services/assistantApi";

const STORAGE_PREFIX = "pirnav:kini-assistant:v5";
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
  const auth = useAuth();
  const isAuthenticated = Boolean(auth.isAuthenticated && !auth.loading && auth.user);
  const user = isAuthenticated ? auth.user : null;
  const role = isAuthenticated ? auth.role === 'employee' && isHrModuleUser(user) ? 'hr' : auth.role || 'guest' : 'guest';
  const location = useLocation();
  const { hasPermission } = usePermission();
  const enrollmentCourseId = location.pathname === '/enrollment' ? new URLSearchParams(location.search).get('courseId') : null;
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
        enrollmentCourseId,
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
  }, [appendMessage, careerGoal, input, isSending, isAuthenticated, messages, replaceMessage, role, user, enrollmentCourseId]);

  const retryMessage = useCallback((message) => {
    if (message?.prompt) sendMessage(message.prompt);
  }, [sendMessage]);

  const markFeedback = useCallback((messageId, feedback) => {
    setMessages((current) =>
      current.map((message) => (message.id === messageId ? { ...message, feedback } : message))
    );
  }, []);

  const allowedPrompt = useCallback(prompt => {
    const module = /employees/i.test(prompt) ? 'employees' : /assessments/i.test(prompt) ? 'assessments' : /reports/i.test(prompt) ? 'reports' : /leave/i.test(prompt) ? 'leave' : /attendance/i.test(prompt) ? 'attendance' : null;
    return !module || role === 'guest' || hasPermission(module);
  }, [role, hasPermission]);
  const quickPrompts = useMemo(() => enrollmentCourseId
    ? ['What is this course fee?', 'What information do I need to enroll?', 'What happens after I apply?', 'Can I talk to an advisor?']
    : getQuickPrompts(role).filter(allowedPrompt), [role, allowedPrompt, enrollmentCourseId]);
  const suggestedActions = useMemo(() => enrollmentCourseId
    ? ['What is this course fee?', 'What information do I need to enroll?', 'What happens after I apply?', 'Can I talk to an advisor?'].map(label => ({ label, prompt: label }))
    : buildSmartActions(role, input).filter(action => allowedPrompt(action.prompt)), [input, role, enrollmentCourseId, allowedPrompt]);
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
