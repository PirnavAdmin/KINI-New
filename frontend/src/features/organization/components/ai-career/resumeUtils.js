const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_RESUME_CHARACTERS = 120000;
const SUPPORTED_EXTENSIONS = new Set(["pdf", "docx", "txt"]);
const EXTRACTION_TIMEOUT_MS = 20000;

const getExtension = (fileName = "") => fileName.split(".").pop()?.toLowerCase() || "";

const withTimeout = (promise, timeoutMs, message) => {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = window.setTimeout(() => reject(new Error(message)), timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => window.clearTimeout(timer));
};

export const validateResumeFile = (file) => {
  if (!file) return "Choose a resume to continue.";
  const extension = getExtension(file.name);
  if (!SUPPORTED_EXTENSIONS.has(extension)) return "Unsupported file. Upload a PDF, DOCX, or TXT resume.";
  if (file.size > MAX_FILE_SIZE) return "This file is larger than 10 MB.";
  if (file.size === 0) return "This file is empty.";
  return "";
};

const extractPdfText = async (file) => {
  const [{ getDocument, GlobalWorkerOptions }, workerModule] = await Promise.all([
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
  ]);
  GlobalWorkerOptions.workerSrc = workerModule.default;
  const document = await getDocument({ data: await file.arrayBuffer() }).promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => item.str || "").join(" "));
  }

  return pages.join("\n");
};

const extractDocxText = async (file) => {
  // Use Mammoth's browser bundle directly. The package's default entry includes
  // Node-oriented modules and can remain pending in some Vite/browser builds.
  const mammothModule = await import("mammoth/mammoth.browser");
  const mammoth = mammothModule.default ?? mammothModule;
  const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return result.value;
};

export const extractResumeText = async (file) => {
  const validationError = validateResumeFile(file);
  if (validationError) throw new Error(validationError);

  const extension = getExtension(file.name);
  let text = "";
  const extraction = extension === "pdf"
    ? extractPdfText(file)
    : extension === "docx"
      ? extractDocxText(file)
      : file.text();

  text = await withTimeout(
    extraction,
    EXTRACTION_TIMEOUT_MS,
    "Resume text extraction timed out. Please save the document again as DOCX, or upload a text-based PDF/TXT file.",
  );

  const normalized = String(text || "")
    .split(String.fromCharCode(0)).join("")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!normalized) throw new Error("No readable text was found. Try a text-based PDF, DOCX, or TXT file.");
  return normalized.slice(0, MAX_RESUME_CHARACTERS);
};

const cleanListItem = (value) => String(value || "")
  .replace(/^[-*•\d.)\s]+/, "")
  .replace(/^\*\*(.*?)\**:?$/, "$1")
  .trim();

const toList = (value) => {
  if (Array.isArray(value)) return value.map(cleanListItem).filter(Boolean);
  if (typeof value !== "string") return [];
  return value.split(/\n|;|,(?=\s*[A-Z])/).map(cleanListItem).filter(Boolean);
};

const scoreValue = (value) => {
  const parsed = Number.parseInt(String(value ?? "").match(/\d{1,3}/)?.[0] || "", 10);
  return Number.isFinite(parsed) ? Math.min(100, Math.max(0, parsed)) : null;
};

const firstValue = (source, keys) => {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null) return source[key];
  }
  return undefined;
};

const normalizeStructuredAnalysis = (source, rawResponse) => ({
  atsScore: scoreValue(firstValue(source, ["atsScore", "ats_score", "ATS Score"])),
  resumeScore: scoreValue(firstValue(source, ["resumeScore", "resume_score", "Resume Score"])),
  projectedAtsScore: scoreValue(firstValue(source, ["projectedAtsScore", "projected_ats_score", "Projected ATS Score"])),
  priorityChanges: toList(firstValue(source, ["priorityChanges", "highImpactChanges", "priorityImprovements"])),
  rewrittenBullets: toList(firstValue(source, ["rewrittenBullets", "improvedBullets", "bulletRewrites"])),
  skillsFound: toList(firstValue(source, ["skillsFound", "skills", "technicalSkills"])),
  missingSkills: toList(firstValue(source, ["missingSkills", "skillGaps"])),
  strengths: toList(firstValue(source, ["strengths"])),
  weaknesses: toList(firstValue(source, ["weaknesses", "areasForImprovement"])),
  suggestions: toList(firstValue(source, ["suggestions", "improvementSuggestions", "recommendations"])),
  suggestedCertifications: toList(firstValue(source, ["suggestedCertifications", "certifications"])),
  recommendedProjects: toList(firstValue(source, ["recommendedProjects", "projects"])),
  missingKeywords: toList(firstValue(source, ["missingKeywords", "keywords"])),
  grammarIssues: toList(firstValue(source, ["grammarIssues", "grammar"])),
  careerSuggestions: toList(firstValue(source, ["careerSuggestions", "careerRecommendation"])),
  recommendedLearningPath: toList(firstValue(source, ["recommendedLearningPath", "learningRoadmap", "learningPath"])),
  recommendedRole: String(firstValue(source, ["recommendedRole", "careerRecommendation", "targetRole"]) || "").trim(),
  nextRole: String(firstValue(source, ["nextRole", "nextCareerRole"]) || "").trim(),
  rawResponse,
});

const SECTION_ALIASES = {
  priorityChanges: ["priority changes", "high impact changes", "priority improvements"],
  rewrittenBullets: ["rewritten bullets", "improved bullets", "bullet rewrites"],
  skillsFound: ["skills found", "skills", "technical skills"],
  missingSkills: ["missing skills", "skill gaps"],
  strengths: ["strengths"],
  weaknesses: ["weaknesses", "areas for improvement"],
  suggestions: ["improvement suggestions", "suggestions", "recommendations"],
  suggestedCertifications: ["suggested certifications", "certifications"],
  recommendedProjects: ["recommended projects", "projects"],
  missingKeywords: ["missing keywords", "keywords"],
  grammarIssues: ["grammar issues", "grammar"],
  careerSuggestions: ["career suggestions", "career recommendation"],
  recommendedLearningPath: ["recommended learning path", "learning roadmap", "learning path"],
};

const parsePlainText = (response) => {
  const sections = {};
  let activeKey = "";

  response.split(/\r?\n/).forEach((line) => {
    const normalizedHeading = line.replace(/[#*_:`]/g, "").replace(/^\d+[.)]\s*/, "").trim().toLowerCase();
    const match = Object.entries(SECTION_ALIASES).find(([, aliases]) =>
      aliases.some((alias) => normalizedHeading === alias || normalizedHeading.startsWith(`${alias} `))
    );
    if (match) {
      activeKey = match[0];
      sections[activeKey] ||= [];
      const inlineValue = line.split(":").slice(1).join(":").trim();
      if (inlineValue) sections[activeKey].push(inlineValue);
      return;
    }
    if (activeKey && line.trim()) sections[activeKey].push(line);
  });

  const roleMatch = response.match(/(?:recommended role|next role|career recommendation)\s*[:-]\s*([^\n]+)/i);
  return normalizeStructuredAnalysis({
    atsScore: response.match(/ATS\s*Score\s*[:-]?\s*(\d{1,3})/i)?.[1],
    resumeScore: response.match(/Resume\s*Score\s*[:-]?\s*(\d{1,3})/i)?.[1],
    projectedAtsScore: response.match(/Projected\s*ATS\s*Score\s*[:-]?\s*(\d{1,3})/i)?.[1],
    ...Object.fromEntries(Object.entries(sections).map(([key, lines]) => [key, lines.map(cleanListItem).filter(Boolean)])),
    recommendedRole: roleMatch?.[1] || "",
  }, response);
};

export const parseResumeAnalysis = (response) => {
  const normalized = String(response || "").trim();
  if (!normalized) throw new Error("The AI service returned an empty analysis.");

  const candidate = normalized.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    const parsed = JSON.parse(candidate);
    const source = parsed?.analysis ?? parsed?.data ?? parsed;
    if (source && typeof source === "object" && !Array.isArray(source)) {
      return normalizeStructuredAnalysis(source, normalized);
    }
  } catch {
    // The endpoint can return prose; the section parser below handles it.
  }

  return parsePlainText(normalized);
};

export const resumeFileConfig = {
  accept: ".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain",
  maxSizeLabel: "10 MB",
};
