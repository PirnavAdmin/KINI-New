import apiClient from "@shared/services/apiClient";
import { getApiErrorMessage, getListPayload, getPayload, toAssessmentPayload } from "@shared/services/apiServices";
import { API_ENDPOINTS } from "@/api/endpoints";

const requireRecord = (response, label) => {
  const record = getPayload(response);
  if (!record || typeof record !== "object" || Array.isArray(record) || !Object.keys(record).length) {
    throw new Error(`${label} returned an empty response.`);
  }
  return record;
};

export const toQuestionPayload = (assessmentId, question, index) => ({
  assessmentId: Number(assessmentId),
  questionText: question.text,
  questionType: question.type,
  difficulty: question.difficulty ?? "",
  marks: Number(question.marks),
  correctAnswer: question.type === "MCQ" ? question.options[question.correct] : question.answer,
  orderNo: index + 1,
  options: question.type === "MCQ"
    ? question.options.map((optionText, optionIndex) => ({ optionText, isCorrect: optionIndex === question.correct }))
    : question.type === "TrueFalse"
      ? ["True", "False"].map((optionText) => ({ optionText, isCorrect: optionText === question.answer }))
      : [],
});

export const normalizeAssessment = (assessment = {}) => {
  const id = assessment.assessmentId ?? assessment.id;

  return {
    ...assessment,
    id,
    assessmentId: id,
    title: assessment.title ?? assessment.assessmentTitle ?? assessment.name ?? "Untitled Assessment",
    courseId: assessment.courseId ?? assessment.courseID ?? assessment.course?.courseId ?? assessment.course?.id,
    batchId: assessment.batchId ?? assessment.batchID ?? assessment.batch?.batchId ?? assessment.batch?.id,
    batchName: assessment.batchName ?? assessment.batch?.batchName ?? assessment.batch?.name,
    duration: assessment.duration ?? assessment.durationMinutes ?? assessment.timeLimit,
  };
};

// datetime-local values represent wall-clock time in the user's configured
// browser timezone. Serialize that wall time with its local UTC offset instead
// of calling toISOString(), which would shift the selected clock time before
// the assessment reaches the API.
export const toAssessmentScheduleTimestamp = (value) => {
  const input = String(value ?? "").trim();
  const match = input.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/);
  if (!match) throw new Error("Enter a valid assessment date and time.");
  const [, date, hour, minute, second = "00", millisecond = ""] = match;
  const local = new Date(Number(date.slice(0, 4)), Number(date.slice(5, 7)) - 1, Number(date.slice(8, 10)), Number(hour), Number(minute), Number(second), Number(millisecond.padEnd(3, "0") || 0));
  if (Number.isNaN(local.getTime())
    || local.getFullYear() !== Number(date.slice(0, 4))
    || local.getMonth() !== Number(date.slice(5, 7)) - 1
    || local.getDate() !== Number(date.slice(8, 10))
    || local.getHours() !== Number(hour)
    || local.getMinutes() !== Number(minute)) {
    throw new Error("Enter a valid assessment date and time.");
  }
  const offset = -local.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const absoluteOffset = Math.abs(offset);
  return `${date}T${hour}:${minute}:${second}${sign}${String(Math.floor(absoluteOffset / 60)).padStart(2, "0")}:${String(absoluteOffset % 60).padStart(2, "0")}`;
};

// GET /api/StudentAssessment/{id} has no documented response schema in
// Swagger (just "OK") — this defensively resolves the shape from the
// StudentAssessment/AssessmentQuestion/AssessmentOption entity definitions
// (the only available reference) rather than guessing a flat shape. Every
// field is optional; nothing here is fabricated if the backend omits it.
export const normalizeAttemptOption = (option = {}) => ({
  optionId: option.optionId ?? option.id,
  optionText: option.optionText ?? option.text ?? option.label ?? "",
});

export const normalizeAttemptQuestion = (question = {}) => ({
  ...question,
  questionId: question.questionId ?? question.id,
  questionText: question.questionText ?? question.text ?? "",
  questionType: question.questionType ?? question.type ?? "MCQ",
  marks: Number(question.marks ?? 1),
  orderNo: question.orderNo ?? question.order ?? 0,
  options: Array.isArray(question.options) ? question.options.map(normalizeAttemptOption) : [],
});

export const normalizeAttempt = (attempt = {}) => {
  const assessment = attempt.assessment ? normalizeAssessment(attempt.assessment) : null;
  const questions = Array.isArray(attempt.questions)
    ? attempt.questions
    : Array.isArray(attempt.assessment?.questions)
      ? attempt.assessment.questions
      : [];
  return {
    ...attempt,
    studentAssessmentId: attempt.studentAssessmentId ?? attempt.id,
    assessmentId: attempt.assessmentId ?? assessment?.assessmentId,
    assessment,
    title: assessment?.title ?? attempt.title ?? "Assessment",
    durationMinutes: assessment?.duration ?? attempt.durationMinutes,
    // The mentor editor explicitly sorts by orderNo (AssessmentsPage.jsx) rather
    // than trusting array order — the student attempt must not silently rely on
    // array index either, since the backend may return questions in a different
    // order than orderNo implies.
    questions: questions.map(normalizeAttemptQuestion).sort((a, b) => (a.orderNo ?? 0) - (b.orderNo ?? 0)),
    startedAt: attempt.startedAt ?? null,
    submittedAt: attempt.submittedAt ?? null,
  };
};

export const assessmentService = {
  async getAssessmentStudentResults(assessmentId, { search = '', pageNumber = 1, pageSize = 10 } = {}, config = {}) {
    if (!Number.isSafeInteger(Number(assessmentId)) || Number(assessmentId) <= 0) throw new Error('A valid selected assessment ID is required.');
    const response = await apiClient.get(`/api/Assessment/${encodeURIComponent(assessmentId)}/students/results`, { ...config, params: { search, pageNumber, pageSize } });
    return response.data;
  },
  async getStudentPerformance(studentId, config = {}) {
    if (!Number.isSafeInteger(Number(studentId)) || Number(studentId) <= 0) {
      throw new Error("A valid selected student ID is required.");
    }
    const url = `/api/Assessment/students/${encodeURIComponent(studentId)}/performance`;
    const response = await apiClient.get(url, config);
    // Keep the performance envelope: getListPayload would discard summaries
    // and silently turn an unrecognized response into an empty list.
    return response.data;
  },

  async getAssessments() {
    const response = await apiClient.get(API_ENDPOINTS.assessments.base);
    return getListPayload(response).map(normalizeAssessment);
  },

  async getAssessmentById(assessmentId) {
    const response = await apiClient.get(API_ENDPOINTS.assessments.byId(assessmentId));
    return normalizeAssessment(requireRecord(response, "Assessment"));
  },

  createAssessment: (payload) => apiClient.post(API_ENDPOINTS.assessments.base, toAssessmentPayload(payload)).then(getPayload),
  updateAssessment: (assessmentId, payload) => apiClient.put(API_ENDPOINTS.assessments.byId(assessmentId), toAssessmentPayload(payload)).then(getPayload),
  deleteAssessment: (assessmentId) => apiClient.delete(API_ENDPOINTS.assessments.byId(assessmentId)).then(getPayload),
  // Swagger-confirmed: POST only, no request body — the assessment is
  // identified entirely by the path id.
  // POST .../mentor/assessments/import-pdf. apiClient drops its JSON
  // Content-Type for FormData so the browser adds the multipart boundary, and
  // its interceptor attaches the Bearer token. Returns data: { fileName,
  // summary: { questionCount, totalMarks }, questions: [...] }.
  importQuestionsPdf: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post(API_ENDPOINTS.assessments.mentorImportPdf, formData, { timeout: 120000 }).then(getPayload);
  },
  publishAssessment: (assessmentId) => apiClient.post(API_ENDPOINTS.assessments.publish(assessmentId)).then(getPayload),

  getQuestions: (assessmentId) => apiClient.get(API_ENDPOINTS.assessmentQuestions.byAssessment(assessmentId)).then(getListPayload),
  getQuestion: (questionId) => apiClient.get(API_ENDPOINTS.assessmentQuestions.byId(questionId)).then((response) => requireRecord(response, "Question")),
  createQuestion: (payload) => apiClient.post(API_ENDPOINTS.assessmentQuestions.base, payload).then(getPayload),
  updateQuestion: (questionId, payload) => apiClient.put(API_ENDPOINTS.assessmentQuestions.byId(questionId), payload).then(getPayload),
  deleteQuestion: (questionId) => apiClient.delete(API_ENDPOINTS.assessmentQuestions.byId(questionId)).then(getPayload),

  // Swagger-confirmed: the student is resolved server-side from the Bearer
  // JWT for every StudentAssessment endpoint below — none of them accept or
  // require a studentId in the request.
  getAvailableAssessments: () => apiClient.get(API_ENDPOINTS.studentAssessment.available).then(getListPayload),
  // StartAssessmentDto = { assessmentId } only, additionalProperties: false.
  startAttempt: (payload) => apiClient.post(API_ENDPOINTS.studentAssessment.start, payload).then(getPayload),
  // SubmitAssessmentDto = { studentAssessmentId, answers: [{ questionId, selectedOptionId }] },
  // additionalProperties: false. selectedOptionId is the real AssessmentOption.optionId,
  // not an option array index, and there is no free-text answer field.
  submitAttempt: (payload) => apiClient.post(API_ENDPOINTS.studentAssessment.submit, payload).then(getPayload),
  async getAttempt(studentAssessmentId) {
    const response = await apiClient.get(API_ENDPOINTS.studentAssessment.byId(studentAssessmentId));
    return normalizeAttempt(requireRecord(response, "Student assessment"));
  },
  getResult: (studentAssessmentId) => apiClient.get(API_ENDPOINTS.studentAssessment.result(studentAssessmentId)).then(getPayload),
  generateWithAI: (payload) => apiClient.post("/api/AI/assessment/generate", payload, { timeout: 60000 }).then(getPayload),
};

export const getAssessmentErrorMessage = (error) =>
  getApiErrorMessage(error, "Unable to load assessments. Please try again.");

export default assessmentService;
