/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { assessmentService } from "@/services/assessmentService";
import { normalizeStudentAssessmentPerformance } from "@/services/studentAssessmentPerformance";

export default function useStudentAssessmentPerformance(studentId, active) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState(null);
  useEffect(() => {
    if (!active) return undefined;
    let current = true;
    const controller = new AbortController();
    setState({ studentId, loading: true, data: null, error: null });
    assessmentService.getStudentPerformance(studentId, { signal: controller.signal })
      .then((response) => {
        const data = normalizeStudentAssessmentPerformance(response, studentId);
        if (current) setState({ studentId, loading: false, data, error: null });
      })
      .catch((error) => {
        if (!current) return;
        if (import.meta.env.DEV && !error.response) console.error("Assessment Results Error:", {
          studentId, url: `/api/Assessment/students/${studentId}/performance`, message: error.message,
        });
        setState({ studentId, loading: false, data: null, error });
      });
    return () => { current = false; controller.abort(); };
  }, [studentId, active, attempt]);
  // Hide stale data in the render that precedes the next student's effect.
  const visible = state?.studentId === studentId ? state : null;
  return {
    data: visible?.data ?? null, loading: active && (visible?.loading ?? true),
    error: visible?.error ?? null, retry: () => setAttempt((value) => value + 1),
  };
}
