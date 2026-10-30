import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { getCourseData } from "@shared/data/coursePlayerData";
import { saveStudentCoursePercentage } from "@features/student/utils/studentProgressAccess";

const STORAGE_KEY_PREFIX = "course-progress-";

export default function useCoursePlayer() {
  const { courseId } = useParams();
  const [activeTab, setActiveTab] = useState("video");
  const [completedLessonIds, setCompletedLessonIds] = useState(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${courseId}-completed`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [currentLessonId, setCurrentLessonId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState([]);
  const [quizScore, setQuizScore] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [passedSectionAssessmentIds, setPassedSectionAssessmentIds] = useState(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${courseId}-section-passed`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [pendingSectionAssessmentId, setPendingSectionAssessmentId] = useState(null);
  const [passedAssessmentIds, setPassedAssessmentIds] = useState(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${courseId}-passed`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [pendingAssessmentLessonId, setPendingAssessmentLessonId] = useState(null);
  const [lessonQuizAnswers, setLessonQuizAnswers] = useState({});
  const [lessonQuizSubmitted, setLessonQuizSubmitted] = useState(false);
  const [lessonQuizScore, setLessonQuizScore] = useState(null);

  const course = useMemo(() => getCourseData(courseId), [courseId]);

  const baseLessons = useMemo(() => {
    return course.sections.flatMap((section) => section.lessons);
  }, [course.sections]);

  const lessonsWithLockState = useMemo(() => {
    const result = [];

    for (let index = 0; index < baseLessons.length; index += 1) {
      const lesson = baseLessons[index];
      const isCompleted = lesson.isCompleted || completedLessonIds.includes(lesson.id);
      const previousVideoLesson = [...result].reverse().find((item) => item.type === "video");
      const sectionIndex = course.sections.findIndex((section) =>
        section.lessons.some((sectionLesson) => sectionLesson.id === lesson.id)
      );
      const previousSection = sectionIndex > 0 ? course.sections[sectionIndex - 1] : null;
      const blockedBySectionAssessment = Boolean(
        previousSection?.sectionAssessment &&
        !passedSectionAssessmentIds.includes(previousSection.id)
      );

      let previousAssessmentPassed = true;
      if (previousVideoLesson?.assessment) {
        previousAssessmentPassed =
          previousVideoLesson.assessmentPassed ||
          passedAssessmentIds.includes(previousVideoLesson.id);
      }

      const isLocked =
        index === 0
          ? false
          : ["video", "quiz", "project"].includes(lesson.type)
            ? blockedBySectionAssessment || !previousAssessmentPassed
            : lesson.isLocked;

      const isAssessmentPassed =
        lesson.assessmentPassed || passedAssessmentIds.includes(lesson.id);
      const hasPendingAssessment =
        lesson.type === "video" &&
        lesson.assessment &&
        isCompleted &&
        !isAssessmentPassed;

      result.push({
        ...lesson,
        isLocked,
        _isAssessmentPassed: isAssessmentPassed,
        _hasPendingAssessment: hasPendingAssessment,
      });
    }

    return result;
  }, [baseLessons, completedLessonIds, passedAssessmentIds, passedSectionAssessmentIds, course.sections]);

  const currentLesson = useMemo(() => {
    if (currentLessonId) {
      return lessonsWithLockState.find((lesson) => lesson.id === currentLessonId) || lessonsWithLockState[0];
    }
    return (
      lessonsWithLockState.find(
        (lesson) => !lesson.isCompleted && !lesson.isLocked && !completedLessonIds.includes(lesson.id)
      ) || lessonsWithLockState[0]
    );
  }, [currentLessonId, lessonsWithLockState, completedLessonIds]);

  const allCompletedIds = useMemo(() => {
    const fromData = baseLessons
      .filter((lesson) => lesson.isCompleted)
      .map((lesson) => lesson.id);
    return [...new Set([...fromData, ...completedLessonIds])];
  }, [baseLessons, completedLessonIds]);

  const progress = useMemo(() => {
    if (baseLessons.length === 0) return 0;
    return Math.round((allCompletedIds.length / baseLessons.length) * 100);
  }, [baseLessons, allCompletedIds]);

  useEffect(() => {
    saveStudentCoursePercentage(courseId, progress);
  }, [courseId, progress]);

  useEffect(() => {
    try {
      localStorage.setItem(
        `${STORAGE_KEY_PREFIX}${courseId}-completed`,
        JSON.stringify(completedLessonIds)
      );
    } catch {
      // Storage can be unavailable in private browsing or blocked environments.
    }
  }, [completedLessonIds, courseId]);

  useEffect(() => {
    try {
      localStorage.setItem(
        `${STORAGE_KEY_PREFIX}${courseId}-passed`,
        JSON.stringify(passedAssessmentIds)
      );
    } catch {
      // Storage can be unavailable in private browsing or blocked environments.
    }
  }, [passedAssessmentIds, courseId]);

  useEffect(() => {
    try {
      localStorage.setItem(
        `${STORAGE_KEY_PREFIX}${courseId}-section-passed`,
        JSON.stringify(passedSectionAssessmentIds)
      );
    } catch {
      // Storage can be unavailable in private browsing or blocked environments.
    }
  }, [passedSectionAssessmentIds, courseId]);

  useEffect(() => {
    setExpandedSections(course.sections.map((section) => section.id));
  }, [course.sections]);

  const markLessonCompleted = useCallback((lessonId) => {
    setCompletedLessonIds((prev) => {
      if (prev.includes(lessonId)) return prev;
      return [...prev, lessonId];
    });

    const lesson = baseLessons.find((item) => item.id === lessonId);
    if (lesson?.assessment) {
      const isAlreadyPassed =
        lesson.assessmentPassed || passedAssessmentIds.includes(lessonId);
      if (!isAlreadyPassed) {
        setPendingAssessmentLessonId(lessonId);
      }
    }
  }, [baseLessons, passedAssessmentIds]);

  const goToNextLesson = useCallback(() => {
    const currentIndex = lessonsWithLockState.findIndex(
      (lesson) => lesson.id === currentLesson?.id
    );
    if (currentIndex < lessonsWithLockState.length - 1) {
      const nextUnlocked = lessonsWithLockState
        .slice(currentIndex + 1)
        .find((lesson) => !lesson.isLocked);
      if (nextUnlocked) {
        setCurrentLessonId(nextUnlocked.id);
        setActiveTab("video");
      }
    }
  }, [lessonsWithLockState, currentLesson]);

  const goToPrevLesson = useCallback(() => {
    const currentIndex = lessonsWithLockState.findIndex(
      (lesson) => lesson.id === currentLesson?.id
    );
    if (currentIndex > 0) {
      setCurrentLessonId(lessonsWithLockState[currentIndex - 1].id);
      setActiveTab("video");
    }
  }, [lessonsWithLockState, currentLesson]);

  const toggleSection = useCallback((sectionId) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  }, []);

  const sectionsWithProgress = useMemo(() => {
    const lessonMap = {};
    lessonsWithLockState.forEach((lesson) => {
      lessonMap[lesson.id] = lesson;
    });

    const sectionLockState = course.sections.map((section, index) => {
      if (index === 0) return false;

      const previousSection = course.sections[index - 1];
      if (previousSection.sectionAssessment) {
        return !passedSectionAssessmentIds.includes(previousSection.id);
      }

      const allPreviousCompleted = previousSection.lessons.every(
        (lesson) =>
          lessonMap[lesson.id]?.isCompleted ||
          lesson.isCompleted ||
          completedLessonIds.includes(lesson.id)
      );
      return !allPreviousCompleted;
    });

    return course.sections.map((section, index) => {
      const lessons = section.lessons.map((lesson) => {
        const resolvedLesson = lessonMap[lesson.id] || lesson;
        return {
          ...resolvedLesson,
          isLocked: sectionLockState[index] || resolvedLesson.isLocked,
        };
      });
      const allCompleted = lessons.every(
        (lesson) => lesson.isCompleted || completedLessonIds.includes(lesson.id)
      );
      const assessmentPassed = section.sectionAssessment
        ? passedSectionAssessmentIds.includes(section.id)
        : false;
      const needsAssessment = Boolean(allCompleted && section.sectionAssessment && !assessmentPassed);

      return {
        ...section,
        lessons,
        _isLocked: sectionLockState[index],
        _allCompleted: allCompleted,
        _needsAssessment: needsAssessment,
        _assessmentPassed: assessmentPassed,
      };
    });
  }, [course.sections, lessonsWithLockState, completedLessonIds, passedSectionAssessmentIds]);

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sectionsWithProgress;
    const query = searchQuery.toLowerCase();
    return sectionsWithProgress
      .map((section) => ({
        ...section,
        lessons: section.lessons.filter(
          (lesson) =>
            lesson.title.toLowerCase().includes(query) ||
            lesson.type.toLowerCase().includes(query)
        ),
      }))
      .filter((section) => section.lessons.length > 0);
  }, [sectionsWithProgress, searchQuery]);

  const quizAnswersRef = useRef(quizAnswers);
  quizAnswersRef.current = quizAnswers;

  const handleQuizAnswer = useCallback((questionId, answerIndex) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: answerIndex }));
  }, []);

  const submitQuiz = useCallback(() => {
    const correct = course.quiz.questions.filter(
      (question) => quizAnswersRef.current[question.id] === question.correctAnswer
    ).length;
    const total = course.quiz.questions.length;
    setQuizScore(Math.round((correct / total) * 100));
    setQuizSubmitted(true);
  }, [course.quiz]);

  const resetQuiz = useCallback(() => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  }, []);

  const lessonQuizAnswersRef = useRef(lessonQuizAnswers);
  lessonQuizAnswersRef.current = lessonQuizAnswers;

  const handleLessonQuizAnswer = useCallback((questionId, answerIndex) => {
    setLessonQuizAnswers((prev) => ({ ...prev, [questionId]: answerIndex }));
  }, []);

  const submitLessonQuiz = useCallback(() => {
    const lesson = baseLessons.find((item) => item.id === pendingAssessmentLessonId);
    if (!lesson?.assessment) return;

    const correct = lesson.assessment.questions.filter(
      (question) => lessonQuizAnswersRef.current[question.id] === question.correctAnswer
    ).length;
    const total = lesson.assessment.questions.length;
    const score = Math.round((correct / total) * 100);
    setLessonQuizScore(score);
    setLessonQuizSubmitted(true);

    if (score >= (lesson.assessment.passingScore || 70)) {
      setPassedAssessmentIds((prev) => {
        if (prev.includes(lesson.id)) return prev;
        return [...prev, lesson.id];
      });
      setPendingAssessmentLessonId(null);
    }
  }, [baseLessons, pendingAssessmentLessonId]);

  const resetLessonQuiz = useCallback(() => {
    setLessonQuizAnswers({});
    setLessonQuizSubmitted(false);
    setLessonQuizScore(null);
  }, []);

  const passSectionAssessment = useCallback((sectionId) => {
    setPassedSectionAssessmentIds((prev) => {
      if (prev.includes(sectionId)) return prev;
      return [...prev, sectionId];
    });
    setPendingSectionAssessmentId(null);
  }, []);

  const startSectionAssessment = useCallback((sectionId) => {
    setPendingSectionAssessmentId(sectionId);
  }, []);

  const clearPendingSectionAssessment = useCallback(() => {
    setPendingSectionAssessmentId(null);
  }, []);

  const currentLessonAssessment = useMemo(() => {
    if (!pendingAssessmentLessonId) return null;
    const lesson = baseLessons.find((item) => item.id === pendingAssessmentLessonId);
    return lesson?.assessment || null;
  }, [baseLessons, pendingAssessmentLessonId]);

  const hasPendingAssessment = useMemo(() => {
    return Boolean(currentLesson?._hasPendingAssessment);
  }, [currentLesson]);

  const isNextLocked = useMemo(() => {
    if (!currentLesson) return false;
    const currentIndex = lessonsWithLockState.findIndex(
      (lesson) => lesson.id === currentLesson.id
    );
    if (currentIndex < lessonsWithLockState.length - 1) {
      return lessonsWithLockState[currentIndex + 1].isLocked;
    }
    return false;
  }, [lessonsWithLockState, currentLesson]);

  return {
    course,
    currentLesson,
    allLessons: lessonsWithLockState,
    allCompletedIds,
    progress,
    activeTab,
    setActiveTab,
    currentLessonId,
    setCurrentLessonId,
    sidebarCollapsed,
    setSidebarCollapsed,
    searchQuery,
    setSearchQuery,
    expandedSections,
    toggleSection,
    filteredSections,
    markLessonCompleted,
    goToNextLesson,
    goToPrevLesson,
    quizAnswers,
    handleQuizAnswer,
    quizScore,
    quizSubmitted,
    submitQuiz,
    resetQuiz,
    navbarTitle: course.title,
    courseId,
    sectionsWithProgress,
    passedSectionAssessmentIds,
    pendingSectionAssessmentId,
    passSectionAssessment,
    startSectionAssessment,
    clearPendingSectionAssessment,
    pendingAssessmentLessonId,
    setPendingAssessmentLessonId,
    currentLessonAssessment,
    hasPendingAssessment,
    isNextLocked,
    passedAssessmentIds,
    lessonQuizAnswers,
    handleLessonQuizAnswer,
    lessonQuizScore,
    lessonQuizSubmitted,
    submitLessonQuiz,
    resetLessonQuiz,
  };
}
