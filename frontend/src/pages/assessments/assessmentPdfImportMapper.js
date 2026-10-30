// Maps POST /api/v1/mentor/assessments/import-pdf → data into the question
// shape CreateAssessment already edits and publishes (see toQuestionPayload):
//   { text, difficulty, type, marks, options: string[], correct: index, answer }
//
// Nothing is invented: a question missing text, marks or a correct answer is
// reported as incomplete rather than filled with a default.
const list = (value) => (Array.isArray(value) ? value : []);
const text = (value) => (value == null ? "" : String(value).trim());

// Backend questionType → the builder's accepted types (MCQ | TrueFalse |
// Descriptive | Coding). Anything else is kept verbatim and flagged.
const QUESTION_TYPES = {
  mcq: "MCQ",
  multiplechoice: "MCQ",
  truefalse: "TrueFalse",
  descriptive: "Descriptive",
  coding: "Coding",
};
const toQuestionType = (value) => QUESTION_TYPES[text(value).toLowerCase().replace(/[^a-z]/g, "")] ?? null;

const optionText = (option) => text(typeof option === "string" ? option : option?.text ?? option?.optionText);
const isCorrectOption = (option) => typeof option === "object" && option !== null && (option.isCorrect === true || String(option.isCorrect).toLowerCase() === "true");

const toEditorQuestion = (raw = {}) => {
  const issues = [];
  const questionText = text(raw.questionText ?? raw.text ?? raw.question);
  const rawType = text(raw.questionType ?? raw.type);
  const type = toQuestionType(rawType);
  const marks = Number(raw.marks);
  const options = list(raw.options);
  const optionTexts = options.map(optionText);
  const correctIndexes = options.map((option, index) => (isCorrectOption(option) ? index : -1)).filter((index) => index >= 0);
  const declaredAnswer = text(raw.correctAnswer ?? raw.answer);

  if (!questionText) issues.push("Question text was not detected.");
  if (!Number.isInteger(marks) || marks <= 0) issues.push("Marks were not detected.");
  if (!type) issues.push(rawType ? `Unsupported question type "${rawType}".` : "Question type was not detected.");

  let correct = -1;
  let answer = "";
  if (type === "MCQ") {
    if (optionTexts.length < 2) issues.push("Fewer than two options were detected.");
    if (optionTexts.some((option) => !option)) issues.push("An option has no text.");
    if (correctIndexes.length === 0) issues.push("No correct option was detected.");
    if (correctIndexes.length > 1) issues.push("More than one option is marked correct.");
    correct = correctIndexes.length === 1 ? correctIndexes[0] : -1;
    answer = correct >= 0 ? optionTexts[correct] : "";
  } else if (type === "TrueFalse") {
    const fromOptions = correctIndexes.length === 1 ? optionTexts[correctIndexes[0]] : "";
    const value = (declaredAnswer || fromOptions).toLowerCase();
    answer = value === "true" ? "True" : value === "false" ? "False" : "";
    if (!answer) issues.push("The True/False answer was not detected.");
  } else if (type) {
    answer = declaredAnswer;
  }

  return {
    question: {
      text: questionText,
      difficulty: text(raw.difficulty),
      type: type ?? rawType,
      marks: Number.isFinite(marks) ? marks : 0,
      options: type === "MCQ" ? optionTexts : ["", "", "", ""],
      correct: type === "MCQ" ? correct : 0,
      answer,
    },
    issues,
  };
};

export const mapImportedAssessment = (data = {}) => {
  const questions = list(data?.questions).map(toEditorQuestion);
  const summary = data?.summary ?? {};
  const count = (value, fallback) => {
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? number : fallback;
  };
  return {
    fileName: text(data?.fileName),
    summary: {
      questionCount: count(summary.questionCount, questions.length),
      totalMarks: count(summary.totalMarks, questions.reduce((sum, item) => sum + (Number(item.question.marks) || 0), 0)),
    },
    questions,
    // Applied only when every extracted question is complete; publishing does
    // not re-validate each question, so a partial question must be fixed first.
    canApply: questions.length > 0 && questions.every((item) => item.issues.length === 0),
  };
};
