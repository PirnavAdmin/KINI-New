// Performance has no response schema in the backend Swagger. Accept explicit
// collections and the documented StudentAssessment entity fields; reject an
// unknown envelope instead of misreporting it as a student with no attempts.
const number = (value) => value === null || value === undefined || value === "" || typeof value === "boolean"
  ? null : Number.isFinite(Number(value)) ? Number(value) : null;
const text = (value) => typeof value === "string" ? value : null;
const record = (value) => value && typeof value === "object" && !Array.isArray(value);
const identity = (value, studentId) => {
  const id = value?.studentId ?? value?.student?.studentId;
  if (id != null && String(id) !== String(studentId)) throw new Error("Assessment response does not match the selected student.");
};

function normalizeRow(row, index, studentId) {
  if (!record(row)) throw new Error("The assessment response contains an invalid result.");
  identity(row, studentId);
  const assessment = row.assessment ?? {};
  const score = number(row.score);
  const totalMarks = number(row.totalMarks ?? assessment.totalMarks);
  const percentage = number(row.percentage) ?? (score != null && totalMarks > 0 ? score / totalMarks * 100 : null);
  const result = text(row.result);
  const status = result || text(row.status);
  const completed = Boolean(row.submittedAt) || /^(completed|submitted|evaluated|passed|failed|pass|fail)$/i.test(status ?? "");
  const elapsed = row.startedAt && row.submittedAt ? (Date.parse(row.submittedAt) - Date.parse(row.startedAt)) / 60000 : null;
  const stats = record(row.statistics) ? row.statistics : row;
  const correctAnswers = number(stats.correctAnswers);
  const wrongAnswers = number(stats.wrongAnswers);
  return {
    id: row.studentAssessmentId ?? row.id ?? `result-${index}`,
    assessmentId: row.assessmentId ?? assessment.assessmentId ?? assessment.id,
    testName: text(row.testName ?? row.assessmentTitle ?? row.assessmentName ?? assessment.title ?? row.title) ?? "Assessment",
    courseName: text(row.courseName ?? assessment.courseName ?? assessment.course?.courseName),
    attempt: number(row.attempt ?? row.attemptNumber),
    date: row.submittedAt ?? row.date ?? row.startedAt,
    score, totalMarks, percentage,
    duration: number(row.durationMinutes) ?? (Number.isFinite(elapsed) && elapsed >= 0 ? elapsed : null),
    status, completed,
    passed: /^(passed|pass)$/i.test(status ?? ""),
    failed: /^(failed|fail)$/i.test(status ?? ""),
    totalQuestions: number(stats.totalQuestions), correctAnswers, wrongAnswers,
    unanswered: number(stats.unanswered),
    accuracy: number(stats.accuracy) ?? (correctAnswers != null && wrongAnswers != null && correctAnswers + wrongAnswers > 0
      ? correctAnswers / (correctAnswers + wrongAnswers) * 100 : null),
    answers: Array.isArray(row.answers) ? row.answers : null,
  };
}

export function normalizeStudentAssessmentPerformance(response, studentId) {
  let payload = response;
  for (let depth = 0; depth < 4 && record(payload); depth += 1) {
    identity(payload, studentId);
    if (payload.success === false || payload.Success === false) throw new Error(text(payload.message ?? payload.Message) || "The assessment request failed.");
    if (payload.data == null) break;
    payload = payload.data;
  }
  identity(payload, studentId);
  const rows = Array.isArray(payload) ? payload
    : payload?.assessments ?? payload?.studentAssessments ?? payload?.items ?? payload?.results;
  if (!Array.isArray(rows)) throw new Error("The assessment service returned an unrecognized performance response.");
  const assessments = rows.flatMap((row) => {
    identity(row, studentId);
    // Expand only explicitly supplied attempts, never manufacture attempt rows.
    return Array.isArray(row?.attempts) ? row.attempts.map((attempt) => ({ ...row, ...attempt, attempts: undefined })) : [row];
  }).map((row, index) => normalizeRow(row, index, studentId));
  const summary = record(payload?.summary) ? payload.summary : payload;
  identity(summary, studentId);
  const uniqueCount = (records) => records.every((row) => row.assessmentId != null)
    ? new Set(records.map((row) => String(row.assessmentId))).size : null;
  const percentages = assessments.filter((row) => row.completed && row.percentage != null).map((row) => row.percentage);
  const hasStatuses = assessments.every((row) => row.status != null || row.completed);
  return {
    // The attempted collection cannot tell us how many unattempted tests exist.
    totalTests: number(summary?.totalTests),
    attemptedTests: number(summary?.attemptedTests) ?? uniqueCount(assessments),
    completedTests: number(summary?.completedTests) ?? (hasStatuses ? uniqueCount(assessments.filter((row) => row.completed)) : null),
    averageScore: number(summary?.averageScore) ?? (percentages.length ? percentages.reduce((sum, value) => sum + value, 0) / percentages.length : null),
    passedTests: number(summary?.passedTests) ?? (assessments.every((row) => row.passed || row.failed) ? uniqueCount(assessments.filter((row) => row.passed)) : null),
    failedTests: number(summary?.failedTests) ?? (assessments.every((row) => row.passed || row.failed) ? uniqueCount(assessments.filter((row) => row.failed)) : null),
    assessments,
  };
}
