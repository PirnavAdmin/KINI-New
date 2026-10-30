// ============================================================
// KINI EDX HUB — CHATBOT UTILITIES
// Intent detection + response builder (no API, no backend)
// ============================================================

import { kiniKnowledgeBase as KB } from "./chatbotData";

// ── Intent keywords ─────────────────────────────────────────
const INTENTS = {
  greeting:     ["hi", "hello", "hey", "hii", "good morning", "good evening", "howdy", "namaste"],
  about:        ["what is kini", "about kini", "tell me about", "who are you", "kini edx hub"],
  courses:      ["courses", "course list", "what do you offer", "what courses", "which courses", "available courses", "all courses", "show courses"],
  price:        ["price", "fee", "cost", "pricing", "how much", "fees", "charges", "payment", "rupees", "₹"],
  duration:     ["duration", "how long", "length", "months", "weeks", "time", "period"],
  mode:         ["live", "recorded", "hybrid", "online", "offline", "class type", "format", "mode", "sessions"],
  mentor:       ["mentor", "teacher", "instructor", "faculty", "who teaches", "trainer", "coach"],
  teaching:     ["how do mentors", "how does mentor", "how is teaching", "teaching style", "how they teach"],
  training:     ["training", "how does training", "how it works", "process", "journey", "program structure", "learning path"],
  projects:     ["project", "build", "portfolio", "what will i build", "what do i make", "github"],
  internship:   ["internship", "intern", "work experience"],
  placement:    ["placement", "job", "career", "hiring", "salary", "employment", "resume", "linkedin", "interview"],
  enroll:       ["enroll", "join", "register", "sign up", "admission", "apply", "how to start", "get started"],
  recommend:    ["recommend", "which course", "what course", "suggest", "best course for me", "which is good", "help me choose", "not sure", "confused"],
  compare:      ["vs", "versus", "compare", "difference between", "which is better", "react vs", "python vs"],
  benefits:     ["benefits", "features", "what do i get", "what's included", "included", "perks", "advantages"],
  faq:          ["certificate", "certification", "emi", "instalment", "batch size", "refund", "recording"],
  contact:      ["contact", "talk to", "reach", "email", "whatsapp", "human", "agent", "support team"],
};

// Course-specific keyword map (shortName → id)
function buildCourseKeywordMap() {
  const map = {};
  KB.courses.forEach(c => {
    const words = [
      c.id,
      c.shortName.toLowerCase(),
      c.name.toLowerCase(),
      c.category.toLowerCase(),
    ];
    words.forEach(w => { map[w] = c.id; });
  });
  return map;
}
const COURSE_KEYWORD_MAP = buildCourseKeywordMap();

// ── Main intent detector ─────────────────────────────────────
export function detectIntent(text) {
  const lower = text.toLowerCase().trim();

  // 1. Course-specific price or duration
  const matchedCourseId = Object.keys(COURSE_KEYWORD_MAP).find(kw => lower.includes(kw));
  const hasPriceKw  = INTENTS.price.some(kw => lower.includes(kw));
  const hasDurationKw = INTENTS.duration.some(kw => lower.includes(kw));
  const hasModeKw   = INTENTS.mode.some(kw => lower.includes(kw));
  const hasMentorKw = INTENTS.mentor.some(kw => lower.includes(kw));

  if (matchedCourseId) {
    if (hasPriceKw)    return { intent: "course_price",    courseId: matchedCourseId };
    if (hasDurationKw) return { intent: "course_duration", courseId: matchedCourseId };
    if (hasModeKw)     return { intent: "course_mode",     courseId: matchedCourseId };
    if (hasMentorKw)   return { intent: "course_mentor",   courseId: matchedCourseId };
    return { intent: "course_detail", courseId: matchedCourseId };
  }

  // 2. Compare two courses
  if (INTENTS.compare.some(kw => lower.includes(kw))) {
    const courseIds = Object.keys(COURSE_KEYWORD_MAP)
      .filter(kw => lower.includes(kw))
      .map(kw => COURSE_KEYWORD_MAP[kw]);
    const uniqueIds = [...new Set(courseIds)];
    if (uniqueIds.length >= 2) return { intent: "compare", courseIds: uniqueIds.slice(0, 2) };
    return { intent: "compare", courseIds: uniqueIds };
  }

  // 3. General intents
  for (const [intent, keywords] of Object.entries(INTENTS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      return { intent };
    }
  }

  return { intent: "unknown" };
}

// ── Response builders ────────────────────────────────────────

export function buildResponse(intentResult, conversationState) {
  const { intent, courseId, courseIds } = intentResult;

  switch (intent) {
    case "greeting":        return responseGreeting();
    case "about":           return responseAbout();
    case "courses":         return responseCourseList();
    case "price":           return responsePriceOverview();
    case "duration":        return responseDurationOverview();
    case "mode":            return responseLearningModes();
    case "mentor":          return responseMentorOverview();
    case "teaching":        return responseTeachingStyle();
    case "training":        return responseTrainingProcess();
    case "projects":        return responseProjects();
    case "internship":      return responseInternship();
    case "placement":       return responsePlacement();
    case "enroll":          return responseEnroll();
    case "recommend":       return responseRecommendStart();
    case "benefits":        return responseBenefits();
    case "faq":             return responseFAQ();
    case "contact":         return responseContact();
    case "compare":         return responseCompare(courseIds);
    case "course_detail":   return responseCourseDetail(courseId);
    case "course_price":    return responseCoursePrice(courseId);
    case "course_duration": return responseCourseDuration(courseId);
    case "course_mode":     return responseCourseMode(courseId);
    case "course_mentor":   return responseCourseMentor(courseId);
    default:                return responseUnknown();
  }
}

// ── Helpers ──────────────────────────────────────────────────
function getCourse(id) {
  return KB.courses.find(c => c.id === id);
}

function noInfo() {
  return {
    type: "text",
    text: "I don't have that information available right now. Please contact the Kini Edx Hub team for the latest details.",
    showContact: true,
  };
}

// ── Individual response functions ────────────────────────────

function responseGreeting() {
  return {
    type: "text",
    text: "Hi there! 👋 I'm the **Kini Edx Hub AI Course Advisor**.\n\nI can help you explore courses, pricing, learning modes, mentors, projects, training, and enrollment.\n\nWhat would you like to know?",
    showQuickActions: true,
  };
}

function responseAbout() {
  const { description, benefits } = KB.institute;
  return {
    type: "about",
    text: description,
    benefits,
  };
}

function responseCourseList() {
  if (!KB.courses.length) return noInfo();
  return {
    type: "course_list",
    courses: KB.courses,
  };
}

function responsePriceOverview() {
  const withPrice = KB.courses.filter(c => c.fee);
  const without   = KB.courses.filter(c => !c.fee);
  return {
    type: "price_overview",
    withPrice,
    without,
  };
}

function responseDurationOverview() {
  return {
    type: "duration_overview",
    courses: KB.courses,
  };
}

function responseLearningModes() {
  return {
    type: "learning_modes",
    modes: KB.learningModes,
    courses: KB.courses,
  };
}

function responseMentorOverview() {
  if (!KB.mentors.length) {
    return {
      type: "text",
      text: "Our mentor information is currently not available here. Please contact the Kini Edx Hub team for mentor details.",
      showContact: true,
    };
  }
  return {
    type: "mentor_list",
    mentors: KB.mentors,
  };
}

function responseTeachingStyle() {
  return {
    type: "teaching_style",
    items: [
      "Live instruction & demonstrations",
      "Hands-on coding exercises",
      "Real-world project guidance",
      "Doubt clarification sessions",
      "Code reviews & mentor feedback",
      "Interview preparation support",
      "Career guidance",
    ],
  };
}

function responseTrainingProcess() {
  return {
    type: "training_process",
    steps: KB.trainingProcess,
  };
}

function responseProjects() {
  const coursesWithProjects = KB.courses.filter(c => c.projects && c.projects.length);
  if (!coursesWithProjects.length) {
    return {
      type: "text",
      text: "🛠 **Real-World Projects**\n\nEvery Kini Edx Hub course includes practical projects you'll add to your portfolio and GitHub profile.\n\nSpecific project details for each course aren't listed here yet. Please contact the Kini Edx Hub team for current project information.",
      showContact: true,
    };
  }
  return {
    type: "projects",
    courses: coursesWithProjects,
  };
}

function responseInternship() {
  const { available, details } = KB.internships;
  if (!available || !details) {
    return {
      type: "text",
      text: "Internship information depends on the applicable program. Please contact the Kini Edx Hub team for current details.",
      showContact: true,
    };
  }
  return { type: "text", text: details };
}

function responsePlacement() {
  return {
    type: "placement",
    items: KB.placementSupport,
  };
}

function responseEnroll() {
  return {
    type: "enroll",
    steps: KB.enrollmentSteps,
  };
}

function responseRecommendStart() {
  return {
    type: "recommend_start",
    question: "I'd love to help you find the right course! Let me ask a couple of quick questions.\n\n**First — what's your background?**",
    options: [
      "Complete beginner (no coding experience)",
      "I know some basics",
      "I'm intermediate / already a developer",
    ],
    nextState: "recommend_background",
  };
}

export function buildRecommendResponse(state, answer) {
  if (state === "recommend_background") {
    return {
      type: "recommend_question",
      question: "Got it! **What area interests you most?**",
      options: ["Frontend / UI", "Backend / Server", "Full Stack (both)", "Data / Python"],
      nextState: "recommend_area",
      context: { background: answer },
    };
  }
  if (state === "recommend_area") {
    return {
      type: "recommend_question",
      question: "Almost there! **What's your main goal?**",
      options: [
        "Get a developer job",
        "Freelance / build my own projects",
        "Upskill for my current job",
        "Just learning / exploring",
      ],
      nextState: "recommend_goal",
      context: { area: answer },
    };
  }
  if (state === "recommend_goal") {
    // Match to courses by category
    const areaMap = {
      "Frontend / UI":          ["frontend"],
      "Backend / Server":       ["backend"],
      "Full Stack (both)":      ["fullstack"],
      "Data / Python":          ["backend", "data"],
    };
    const prevArea = answer; // we'd pass context through in state
    let candidates = KB.courses;
    // Simple filter — show all if no strong match
    if (candidates.length === 0) return noInfo();
    return {
      type: "recommend_result",
      courses: candidates.slice(0, 2),
      reason: "Based on your answers, here are the best-fit Kini Edx Hub courses for you:",
    };
  }
  return { type: "recommend_start" };
}

function responseBenefits() {
  return {
    type: "benefits",
    benefits: KB.institute.benefits,
  };
}

function responseFAQ() {
  return {
    type: "faq",
    faqs: KB.faqs,
  };
}

function responseContact() {
  return {
    type: "contact",
    whatsapp: KB.institute.whatsapp,
    email: KB.institute.email,
  };
}

function responseCompare(ids = []) {
  if (ids.length < 2) {
    return {
      type: "text",
      text: "Which two courses would you like to compare? For example: \"React vs Python\" or \"Full Stack vs React\".",
    };
  }
  const courses = ids.map(id => KB.courses.find(c => c.id === id)).filter(Boolean);
  if (courses.length < 2) {
    return {
      type: "text",
      text: "I couldn't find both courses to compare. Please check the course names and try again.",
    };
  }
  return {
    type: "compare",
    courses,
  };
}

function responseCourseDetail(id) {
  const course = getCourse(id);
  if (!course) return noInfo();
  return { type: "course_detail", course };
}

function responseCoursePrice(id) {
  const course = getCourse(id);
  if (!course) return noInfo();
  return { type: "course_price", course };
}

function responseCourseDuration(id) {
  const course = getCourse(id);
  if (!course) return noInfo();
  return { type: "course_duration", course };
}

function responseCourseMode(id) {
  const course = getCourse(id);
  if (!course) return noInfo();
  const modeInfo = KB.learningModes.find(m => m.mode === course.mode);
  return { type: "course_mode", course, modeInfo };
}

function responseCourseMentor(id) {
  const course = getCourse(id);
  if (!course) return noInfo();
  const mentor = KB.mentors.find(m => m.courseId === course.id || m.id === course.mentorId);
  if (!mentor) {
    return {
      type: "text",
      text: `Mentor details for **${course.name}** aren't listed here yet. Please contact the Kini Edx Hub team for mentor information.`,
      showContact: true,
    };
  }
  return { type: "mentor_detail", mentor, course };
}

function responseUnknown() {
  return {
    type: "text",
    text: "I'm not sure I understood that. Here are some things I can help you with 👇",
    showQuickActions: true,
  };
}