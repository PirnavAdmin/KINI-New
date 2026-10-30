import { sendPrompt } from "@shared/services/ai.service";

export const generateGeminiReply = async (prompt) => sendPrompt(prompt);

export default { generateGeminiReply };
