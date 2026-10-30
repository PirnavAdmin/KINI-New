import axios from "axios";
import { API_ENDPOINTS } from "@/api/endpoints";
import { getApiErrorMessage, getListPayload, getPayload } from "./apiServices";
import { sendPrompt } from "./ai.service";
import { NGROK_HEADERS } from "./apiClient";
import { resolveUserId, normalizeProfile } from "@/services/profileService";

const assistantClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    ...NGROK_HEADERS,
  },
});

assistantClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  const isLocalDemoToken = String(token || "").startsWith("demo-");
  if (token && !isLocalDemoToken) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const ROLE_ENDPOINTS = {
  "super-admin": {
    dashboard: "/api/v1/super-admin/dashboard",
    stats: "/api/v1/super-admin/stats",
  },
  "org-admin": {
    dashboard: "/api/v1/organization/dashboard",
    stats: "/api/v1/organization/stats",
  },
  employee: {
    dashboard: "/api/v1/employee/dashboard",
    stats: "/api/v1/employee/stats",
  },
  student: {
    dashboard: "/api/v1/student/dashboard",
    stats: "/api/v1/student/stats",
  },
};

const NAVIGATION_HINTS = {
  guest: [
    { label: "Courses", path: "/courses" },
    { label: "Admissions", path: "/admissions" },
    { label: "Mentors", path: "/mentors" },
    { label: "Contact", path: "/contact" },
  ],
  student: [
    { label: "Dashboard", path: "/student/dashboard" },
    { label: "My Courses", path: "/student/courses" },
    { label: "Assessments", path: "/student/assessments" },
    { label: "AI Career Coach", path: "/student/ai-career-coach" },
    { label: "Mentor Chat", path: "/student/mentor-chat" },
  ],
  employee: [
    { label: "Dashboard", path: "/employee/dashboard" },
    { label: "Goals", path: "/employee/goals" },
    { label: "Learning", path: "/employee/learning" },
    { label: "AI Career Coach", path: "/employee/ai-career-coach" },
    { label: "Profile", path: "/employee/profile" },
  ],
  "org-admin": [
    { label: "Dashboard", path: "/organization/dashboard" },
    { label: "Employees", path: "/organization/employees" },
    { label: "Teams", path: "/organization/teams" },
    { label: "Assessments", path: "/organization/assessments" },
  ],
  "super-admin": [
    { label: "Dashboard", path: "/super-admin/dashboard" },
    { label: "Organizations", path: "/super-admin/organizations" },
    { label: "Students", path: "/super-admin/students" },
    { label: "Employees", path: "/super-admin/employees" },
    { label: "Subscriptions", path: "/super-admin/subscriptions" },
  ],
};

const INTENT_RULES = [
  { key: "profile", patterns: [/profile/, /account/, /settings/, /my info/, /my details/, /email/, /phone/] },
  { key: "courses", patterns: [/course/, /courses/, /lesson/, /class/, /curriculum/, /enroll/, /enrolled/, /learning path/] },
  { key: "assessments", patterns: [/assessment/, /quiz/, /test/, /exam/, /score/, /result/, /certificate/] },
  { key: "dashboard", patterns: [/dashboard/, /progress/, /stats/, /summary/, /analytics/, /report/] },
  { key: "organization", patterns: [/organization/, /organisation/, /company/, /department/, /team/, /branch/] },
  { key: "billing", patterns: [/payment/, /billing/, /subscription/, /invoice/, /coupon/, /plan/, /order/] },
  { key: "auth", patterns: [/password/, /login/, /logout/, /sign in/, /register/, /otp/, /verify/] },
  { key: "mentor", patterns: [/mentor/, /coach/, /guidance/, /career/, /interview/, /job/] },
];

const CACHE_TTL_MS = 60 * 1000;
const cache = new Map();

const normalizeText = (value) => String(value || "").trim().toLowerCase();

export const detectIntent = (prompt = "") => {
  const text = normalizeText(prompt);
  const matches = INTENT_RULES
    .filter((rule) => rule.patterns.some((pattern) => pattern.test(text)))
    .map((rule) => rule.key);

  return {
    primary: matches[0] || "general",
    matches,
  };
};

const readOrganizationId = (user) => {
  const direct =
    user?.organizationId ??
    user?.organisationId ??
    user?.organization?.id ??
    user?.organisation?.id ??
    localStorage.getItem("organization_id") ??
    localStorage.getItem("organizationId") ??
    localStorage.getItem("orgId");
  const numeric = Number(direct);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : undefined;
};

const compactText = (value, maxLength = 220) => {
  const text = String(value ?? "").trim();
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
};

const compactValue = (value, depth = 0) => {
  if (value == null) return value;
  if (["string", "number", "boolean"].includes(typeof value)) return value;
  if (Array.isArray(value)) {
    return value.slice(0, 5).map((item) => compactValue(item, depth + 1));
  }
  if (depth >= 2) return "[truncated]";

  return Object.entries(value).slice(0, 12).reduce((acc, [key, item]) => {
    if (typeof item === "function") return acc;
    acc[key] = compactValue(item, depth + 1);
    return acc;
  }, {});
};

const summarizeProfile = (profile) => {
  const normalized = normalizeProfile(profile);
  return compactValue({
    fullName: normalized.fullName,
    email: normalized.email,
    phoneNumber: normalized.phoneNumber,
    profileImage: normalized.profileImage,
    address: normalized.address,
    gender: normalized.gender,
    dateOfBirth: normalized.dateOfBirth,
    role: profile?.role ?? profile?.userRole,
    organizationName: profile?.organizationName ?? profile?.organisationName,
    organizationId: profile?.organizationId ?? profile?.organisationId,
    id: profile?.userId ?? profile?.id,
  });
};

const summarizeCourse = (course) => compactValue({
  id: course?.id ?? course?.courseId,
  title: course?.title ?? course?.courseTitle ?? course?.courseName ?? course?.name,
  category: course?.category ?? course?.courseCategory,
  level: course?.level ?? course?.difficulty,
  duration: course?.duration ?? course?.totalDuration,
  rating: course?.rating ?? course?.averageRating,
  status: course?.status ?? course?.courseStatus,
});

const summarizeAssessment = (assessment) => compactValue({
  id: assessment?.id ?? assessment?.assessmentId,
  title: assessment?.title ?? assessment?.assessmentTitle ?? assessment?.name,
  courseId: assessment?.courseId ?? assessment?.courseID,
  duration: assessment?.duration ?? assessment?.durationMinutes ?? assessment?.timeLimit,
});

const summarizeOrganization = (organization) => compactValue({
  id: organization?.id ?? organization?.organizationId,
  name: organization?.organizationName ?? organization?.name,
  email: organization?.email,
  phone: organization?.phone,
  industry: organization?.industry,
  country: organization?.country,
  website: organization?.website,
  createdDate: organization?.createdDate ?? organization?.createdAt,
});

const summarizeDashboard = (dashboard) => compactValue(dashboard);

const summarizeList = (items = [], mapper) => ({
  count: Array.isArray(items) ? items.length : 0,
  sample: (Array.isArray(items) ? items.slice(0, 5) : []).map(mapper),
});

const getRoleEndpoints = (role) => ROLE_ENDPOINTS[role] || null;

const getCacheKey = ({ prompt, role, userId, organizationId }) =>
  [normalizeText(prompt), role || "guest", userId || "anonymous", organizationId || "no-org"]
    .join(":");

const cached = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.value;
};

const storeCache = (key, value) => {
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  return value;
};

const requestJson = async (url, config = {}) => {
  const response = await assistantClient.request({
    url,
    method: config.method || "get",
    data: config.data,
    params: config.params,
    timeout: config.timeout || 30000,
  });
  return response;
};

const fetchProfile = async (userId) => {
  if (!userId) return null;
  const response = await requestJson(API_ENDPOINTS.auth.profile(userId));
  return summarizeProfile(getPayload(response));
};

const fetchCourses = async () => {
  const response = await requestJson("/api/v1/courses");
  return summarizeList(getListPayload(response), summarizeCourse);
};

const fetchAssessments = async () => {
  const response = await requestJson("/api/v1/assessments");
  return summarizeList(getListPayload(response), summarizeAssessment);
};

const fetchDashboard = async (role) => {
  const endpoints = getRoleEndpoints(role);
  if (!endpoints) return null;

  const [dashboard, stats] = await Promise.allSettled([
    requestJson(endpoints.dashboard),
    requestJson(endpoints.stats),
  ]);

  return {
    dashboard: dashboard.status === "fulfilled" ? summarizeDashboard(getPayload(dashboard.value)) : null,
    stats: stats.status === "fulfilled" ? summarizeDashboard(getPayload(stats.value)) : null,
  };
};

const fetchOrganization = async (organizationId) => {
  if (!organizationId) return null;
  const response = await requestJson(API_ENDPOINTS.organization.byId(organizationId));
  return summarizeOrganization(getPayload(response));
};

const fetchAssignmentQuestions = async (prompt) => {
  const text = normalizeText(prompt);
  const classIdMatch = text.match(/class\s*([a-z0-9_-]+)/i);
  const classId = classIdMatch?.[1];
  if (!classId) return null;

  const response = await requestJson(`/api/v1/student/classes/${encodeURIComponent(classId)}/questions`, {
    params: { excludeAttempted: true },
  });
  return summarizeList(getListPayload(response), (question) => ({
    id: question?.id ?? question?.questionId,
    topic: question?.topic,
    question: compactText(question?.question, 120),
  }));
};

const buildConversationContext = (messages = []) =>
  messages
    .filter((message) => message && (message.role === "user" || message.role === "assistant"))
    .slice(-8)
    .map((message) => `${message.role.toUpperCase()}: ${compactText(message.content || message.text || "", 240)}`)
    .join("\n");

const getNavigationHints = (role, intent) => {
  const base = NAVIGATION_HINTS[role] || NAVIGATION_HINTS.guest;
  if (intent === "courses" || intent === "assessments") return base;
  return base;
};

export const buildKiniAssistantPrompt = ({ prompt, context, history }) => `
You are Kini Assistant for KiniEdxHub, a real platform assistant.
Use only the provided live context and conversation history.
If a live field is missing, say so clearly instead of guessing.
If the user asks for a page or next action, mention the best matching route from the navigation hints.
Keep the answer useful, grounded in current platform data, and concise unless the user asks for detail.
Write in a friendly, professional, encouraging style.
Include 2 to 6 relevant emojis naturally. Do not spam emojis.
Start with a friendly emoji and end with a helpful question when appropriate.

LIVE_CONTEXT_START
${JSON.stringify(context, null, 2)}
LIVE_CONTEXT_END

${history ? `CONVERSATION_HISTORY_START
${history}
CONVERSATION_HISTORY_END
` : ""}
USER_QUESTION_START
${String(prompt || "").trim()}
USER_QUESTION_END
`.trim();

const buildContextSections = async ({ prompt, user, role, isAuthenticated }) => {
  const intent = detectIntent(prompt);
  const userId = resolveUserId(user);
  const organizationId = readOrganizationId(user);
  const cacheKey = getCacheKey({ prompt, role, userId, organizationId });
  const hit = cached(cacheKey);
  if (hit) return hit;

  const sections = {};
  const sources = [];
  const tasks = [];

  const addTask = (key, promiseFactory) => {
    tasks.push(
      promiseFactory()
        .then((value) => {
          sections[key] = value;
          sources.push({ key, status: "ok" });
        })
        .catch((error) => {
          sources.push({ key, status: "error", message: getApiErrorMessage(error, `${key} data could not be loaded.`) });
        })
    );
  };

  if (isAuthenticated && userId) addTask("profile", () => fetchProfile(userId));
  if (intent.matches.includes("courses") || intent.matches.includes("mentor") || intent.primary === "general") {
    addTask("courses", fetchCourses);
  }
  if (intent.matches.includes("assessments") || intent.matches.includes("mentor") || intent.primary === "general") {
    addTask("assessments", fetchAssessments);
  }
  if (intent.matches.includes("dashboard") || intent.primary === "general") {
    addTask("dashboard", () => fetchDashboard(role));
  }
  if (intent.matches.includes("organization") && organizationId) {
    addTask("organization", () => fetchOrganization(organizationId));
  }
  if (intent.matches.includes("assessments")) {
    addTask("classQuestions", () => fetchAssignmentQuestions(prompt));
  }

  await Promise.allSettled(tasks);

  const context = {
    assistant: {
      name: "Kini Assistant",
      app: "KiniEdxHub",
      source: "live backend API + AI backend",
    },
    session: {
      authenticated: Boolean(isAuthenticated),
      role: role || "guest",
      userId: userId || null,
      organizationId: organizationId || null,
      user: sections.profile || null,
    },
    intent,
    navigationHints: getNavigationHints(role, intent.primary),
    liveData: sections,
    sourceStatus: sources,
  };

  return storeCache(cacheKey, context);
};

export const getAssistantGreeting = ({ role, isAuthenticated }) => {
  const audience = isAuthenticated
    ? "I can use your live profile, dashboard, courses, and assessments to answer platform questions."
    : "I can still help you explore the platform and point you to the right pages.";

  const roleNote = role === "student"
    ? "Ask me about your courses, assessments, certificates, or mentor chat."
    : role === "employee"
      ? "Ask me about your goals, learning, reviews, or career path."
      : role === "org-admin"
        ? "Ask me about employees, teams, departments, assessments, or reports."
        : role === "super-admin"
          ? "Ask me about organizations, students, employees, or subscriptions."
          : "Ask me anything about KiniEdxHub.";

  return `👋 ${audience} ${roleNote}`;
};

export const getQuickPrompts = (role) => {
  if (role === "student") {
    return ["Show my courses", "What assessments are available?", "Summarize my dashboard", "Open mentor chat"];
  }
  if (role === "employee") {
    return ["Show my learning plan", "Summarize my goals", "What is my career path?", "Open AI career coach"];
  }
  if (role === "org-admin") {
    return ["Summarize organization dashboard", "Show employees", "Show assessments", "What reports are available?"];
  }
  if (role === "super-admin") {
    return ["Summarize platform dashboard", "Show organizations", "Show students", "Show subscriptions"];
  }
  return ["Show courses", "What can I do here?", "Tell me about assessments", "How do I enroll?"];
};

export const askKiniAssistant = async ({ prompt, user, role, isAuthenticated, messages = [] }) => {
  const intent = detectIntent(prompt);
  const context = await buildContextSections({ prompt, user, role, isAuthenticated });
  const history = buildConversationContext(messages);
  const composedPrompt = buildKiniAssistantPrompt({
    prompt,
    context,
    history,
  });

  const answer = await sendPrompt(composedPrompt);
  return {
    answer,
    context,
    intent,
  };
};

export default {
  askKiniAssistant,
  buildKiniAssistantPrompt,
  detectIntent,
  getAssistantGreeting,
  getQuickPrompts,
};
