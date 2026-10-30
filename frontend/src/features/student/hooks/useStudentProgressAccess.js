import { useEffect, useState } from "react";
import {
  getStudentAccessProgress,
  getCoursePercentage,
  hasStudentCareerAccess,
  saveStudentCoursePercentages,
  STUDENT_ACCESS_THRESHOLD,
  STUDENT_PROGRESS_EVENT,
} from "@features/student/utils/studentProgressAccess";

export default function useStudentProgressAccess(courses = [], requiredProgress = STUDENT_ACCESS_THRESHOLD) {
  const [storedProgress, setStoredProgress] = useState(() => getStudentAccessProgress());

  useEffect(() => {
    const refresh = () => setStoredProgress(getStudentAccessProgress());
    window.addEventListener(STUDENT_PROGRESS_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(STUDENT_PROGRESS_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    if (courses.length) saveStudentCoursePercentages(courses);
  }, [courses]);

  const courseProgress = courses.length
    ? Math.max(...courses.map(getCoursePercentage))
    : 0;
  const progress = Math.max(storedProgress, courseProgress);

  return {
    progress,
    threshold: requiredProgress,
    isUnlocked: hasStudentCareerAccess(progress, requiredProgress),
    remaining: Math.max(0, requiredProgress - progress),
  };
}
