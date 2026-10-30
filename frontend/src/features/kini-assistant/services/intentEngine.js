import { detectIntent as detectAssistantIntent, getQuickPrompts } from "@shared/services/kiniAssistantService";

export const detectIntent = (prompt) => detectAssistantIntent(prompt);

export const buildSmartActions = (role = "guest", prompt = "") => {
  const intent = detectIntent(prompt);
  const prompts = getQuickPrompts(role);

  const labelsByIntent = {
    courses: ["Show My Courses", "Recommend Next Course", "Search Course"],
    assessments: ["Pending Assessments", "View Results", "Review Topics"],
    dashboard: ["My Progress", "Full Dashboard", "Learning Plan"],
    mentor: ["My Mentor", "Career Roadmap", "Placement Status"],
    organization: ["Show Employees", "Show Departments", "Show Reports"],
    profile: ["View Profile", "Security Settings", "Change Password"],
    billing: ["Payment Status", "Subscriptions", "Invoices"],
    auth: ["Login Help", "Reset Password", "Security Tips"],
  };

  const labels = labelsByIntent[intent.primary] || prompts.slice(0, 3);

  return labels.map((label) => ({
    label,
    prompt: label,
  }));
};

export default {
  buildSmartActions,
  detectIntent,
};
