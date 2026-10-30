import { askKiniAssistant, buildKiniAssistantPrompt, detectIntent, getAssistantGreeting, getQuickPrompts } from "@shared/services/kiniAssistantService";

export const sendAssistantQuery = (payload) => askKiniAssistant(payload);
export { getAssistantGreeting, getQuickPrompts, buildKiniAssistantPrompt, detectIntent };

export const assistantApi = {
  askKiniAssistant,
  buildKiniAssistantPrompt,
  detectIntent,
  getAssistantGreeting,
  getQuickPrompts,
  sendAssistantQuery,
};

export default assistantApi;
