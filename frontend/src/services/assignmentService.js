import apiClient from "@shared/services/apiClient";
import { getPayload } from "@shared/services/apiServices";
import { getCourseProgress, getFallbackCourse, updateCourseProgress } from "./courseService";

const makeQuestion = (classId, index, topic) => {
  const answerIndex = index % 4;
  const options = [
    `${topic} foundation concept`,
    `${topic} unrelated shortcut`,
    `${topic} invalid syntax`,
    `${topic} browser-only guess`,
  ];

  return {
    id: `${classId}-q-${index}`,
    questionId: `${classId}-q-${index}`,
    topic,
    question: `Question ${index}: Which option best matches the ${topic} lesson?`,
    options,
    correctAnswer: options[answerIndex],
    explanation: `This checks the core idea covered in the ${topic} video.`,
  };
};

const buildDynamicQuestionBank = (classId, topics = []) => {
  const safeTopics = topics.length ? topics : ["Course concept"];
  return Array.from({ length: 80 }, (_, index) => ({
    ...makeQuestion(classId, index + 1, safeTopics[index % safeTopics.length]),
    classId,
  }));
};

export const normalizeQuestion = (question) => ({
  ...question,
  id: question.id ?? question.questionId,
  questionId: question.questionId ?? question.id,
  options: question.options ?? question.choices ?? [],
  correctAnswer: question.correctAnswer ?? question.answer,
});

const buildResult = (questions, answers) => {
  const details = questions.map((question) => {
    const selectedAnswer = answers[question.questionId] ?? answers[question.id] ?? "";
    const isCorrect = selectedAnswer === question.correctAnswer;
    return { ...question, selectedAnswer, isCorrect };
  });
  const correctAnswers = details.filter((item) => item.isCorrect);
  const wrongAnswers = details.filter((item) => !item.isCorrect);
  const score = Math.round((correctAnswers.length / Math.max(questions.length, 1)) * 100);

  return {
    attemptId: `attempt-${Date.now()}`,
    score,
    totalQuestions: questions.length,
    correctCount: correctAnswers.length,
    wrongCount: wrongAnswers.length,
    resultStatus: score >= 70 ? "pass" : "fail",
    correctAnswers,
    wrongAnswers,
    details,
  };
};

export const assignmentService = {
  async getQuestions(courseId, classId, topics = []) {
    const progress = getCourseProgress(courseId);
    const attemptedQuestionIds = progress.attemptedQuestionIds || [];

    try {
      const response = await apiClient.get(`/api/v1/student/classes/${classId}/questions`, {
        params: { excludeAttempted: true },
      });
      const payload = response?.data ?? response;
      const list = Array.isArray(payload)
        ? payload
        : payload?.questions ?? payload?.data?.questions ?? payload?.data ?? payload?.items ?? payload?.results ?? [];
      const questions = (Array.isArray(list) ? list : []).map(normalizeQuestion);
      return questions.slice(0, 20);
    } catch {
      const topicSet = new Set(topics);
      const builtQuestions = buildDynamicQuestionBank(classId, topics);
      const questionPool = builtQuestions.filter((question) => (
        !topicSet.size || topicSet.has(question.topic)
      ));
      const newQuestions = questionPool.filter(
        (question) => !attemptedQuestionIds.includes(question.questionId)
      );
      return (newQuestions.length >= 20 ? newQuestions : questionPool).slice(0, 20);
    }
  },

  async submitAssignment({ courseId, classId, questions, answers }) {
    const attemptedQuestionIds = questions.map((question) => question.questionId ?? question.id);

    try {
      const response = await apiClient.post("/api/v1/student/assignments/submit", {
        courseId,
        classId,
        answers,
        questionIds: attemptedQuestionIds,
      });
      const result = getPayload(response);
      return this.persistResult({ courseId, classId, questions, result: { ...buildResult(questions, answers), ...result }, attemptedQuestionIds });
    } catch {
      return this.persistResult({ courseId, classId, questions, result: buildResult(questions, answers), attemptedQuestionIds });
    }
  },

  async getResult(attemptId) {
    const stored = JSON.parse(localStorage.getItem(`studentAssignmentResult:${attemptId}`) || "null");
    if (stored) return stored;

    const response = await apiClient.get(`/api/v1/student/results/${attemptId}`);
    return getPayload(response);
  },

  persistResult({ courseId, classId, result, attemptedQuestionIds }) {
    localStorage.setItem(`studentAssignmentResult:${result.attemptId}`, JSON.stringify(result));
    updateCourseProgress(courseId, (progress) => {
      const attempts = { ...(progress.attempts || {}), [classId]: result };
      const passedClassIds = new Set(progress.passedClassIds || []);
      const classes = getFallbackCourse(courseId)?.classes || [];
      let unlockedClassId = progress.unlockedClassId || classes[0]?.id || classId;

      if (result.resultStatus === "pass") {
        passedClassIds.add(classId);
        const currentIndex = classes.findIndex((item) => item.id === classId);
        unlockedClassId = classes[currentIndex + 1]?.id ?? classId;
      }

      return {
        ...progress,
        attemptedQuestionIds: Array.from(new Set([...(progress.attemptedQuestionIds || []), ...attemptedQuestionIds])),
        score: result.score,
        resultStatus: result.resultStatus,
        unlockedClassId,
        passedClassIds: Array.from(passedClassIds),
        attempts,
      };
    });
    return result;
  },
};

export default assignmentService;
