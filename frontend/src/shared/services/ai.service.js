import apiClient from "./apiClient";

const AI_CHAT_ENDPOINT = "/api/AI/chat";

const unwrapResponseText = (payload) => {
  const value = payload?.data?.response ?? payload?.response ?? payload?.data?.data?.response;
  return typeof value === "string" ? value.trim() : "";
};

export const sendPrompt = async (prompt) => {
  const normalizedPrompt = String(prompt || "").trim();
  if (!normalizedPrompt) throw new Error("Enter a message before sending.");

  const { data } = await apiClient.post(
    AI_CHAT_ENDPOINT,
    { prompt: normalizedPrompt },
    { timeout: 60000 },
  );
  const response = unwrapResponseText(data);
  if (!response) throw new Error("The AI service returned an empty response. Please try again.");
  return response;
};

const RESUME_ANALYSIS_INSTRUCTIONS = `Analyze the resume between the RESUME_START and RESUME_END markers.
Return only valid JSON. Do not wrap it in markdown fences and do not add commentary outside the JSON.
Use this exact schema:
{
  "atsScore": number from 0 to 100,
  "resumeScore": number from 0 to 100,
  "projectedAtsScore": number from 0 to 100 after applying the recommendations,
  "priorityChanges": [string describing the highest-impact exact changes first],
  "rewrittenBullets": [string containing an improved, metrics-oriented resume bullet ready to use],
  "skillsFound": [string],
  "missingSkills": [string],
  "strengths": [string],
  "weaknesses": [string],
  "suggestions": [string],
  "suggestedCertifications": [string],
  "recommendedProjects": [string],
  "missingKeywords": [string],
  "grammarIssues": [string],
  "careerSuggestions": [string],
  "recommendedLearningPath": [string],
  "recommendedRole": string,
  "nextRole": string
}
Scoring and accuracy rules:
- Base every claim only on the supplied resume. Never invent employers, qualifications, dates, tools, achievements, uptime, performance scores, percentages, user counts, or other metrics.
- A rewritten bullet may reuse a number only when that exact number appears in the resume. Otherwise use a visible placeholder such as [X%], [N users], or [time saved].
- Infer recommendedRole from the candidate's strongest existing evidence. missingSkills and missingKeywords must be relevant to that recommendedRole only; do not list a full-stack/backend skill merely because it could support a future nextRole.
- Do not tell the candidate to add a technology, certification, employer, or experience unless they genuinely have it. Phrase unverified items as learning or portfolio recommendations.
- Treat projectedAtsScore as a clearly labelled estimate, not a guarantee.
- Avoid repeating the same recommendation across priorityChanges, weaknesses, and suggestions. Keep every list concise, specific, and actionable.`;

export const analyzeResume = (resumeText) => {
  const normalizedText = String(resumeText || "").trim();
  if (!normalizedText) throw new Error("No readable text was found in this resume.");

  return sendPrompt(`${RESUME_ANALYSIS_INSTRUCTIONS}\n\nRESUME_START\n${normalizedText}\nRESUME_END`);
};

export default { sendPrompt, analyzeResume };
