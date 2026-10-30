import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, BookOpen, ClipboardCheck, Clock, PlayCircle, RefreshCw } from "lucide-react";
import assessmentService, { getAssessmentErrorMessage, normalizeAssessment } from "@/services/assessmentService";
import { courseService } from "@/services/courseService";

const readStoredAssessment = (assessmentId) => {
  try {
    const stored = sessionStorage.getItem(`selectedAssessment:${assessmentId}`);
    return stored ? normalizeAssessment(JSON.parse(stored)) : null;
  } catch {
    return null;
  }
};

export default function AssessmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const requestStarted = useRef(false);
  const initialAssessment = useMemo(
    () =>
      location.state?.assessment
        ? normalizeAssessment(location.state.assessment)
        : readStoredAssessment(id),
    [id, location.state]
  );
  const [assessment, setAssessment] = useState(() => initialAssessment);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(!initialAssessment);
  const [error, setError] = useState("");

  const loadDetails = useCallback(async () => {
    if (!initialAssessment) setLoading(true);
    setError("");
    try {
      // Student-scoped only — GET /api/Assessment and GET
      // /api/AssessmentQuestion/... are the Mentor/Admin management
      // endpoints and are never called from a student screen. Question
      // text/answers are never fetched here at all; they're only loaded
      // after a real POST .../start call.
      const assessmentList = initialAssessment ? [initialAssessment] : await assessmentService.getAvailableAssessments();
      const selectedAssessment = assessmentList.find((item) =>
        String(item.assessmentId ?? item.id) === String(id)
      );
      setAssessment(selectedAssessment ? normalizeAssessment(selectedAssessment) : null);

      if (selectedAssessment?.courseId && !selectedAssessment?.courseName) {
        try {
          const courseList = await courseService.getCourses();
          setCourses(Array.isArray(courseList) ? courseList : []);
        } catch (courseError) {
          console.error("Unable to load assessment course lookup", courseError);
          setCourses([]);
        }
      }
    } catch (err) {
      console.error("Unable to load assessment details", err);
      setError(getAssessmentErrorMessage(err));
    } finally {
      if (!initialAssessment) setLoading(false);
    }
  }, [id, initialAssessment]);

  useEffect(() => {
    if (requestStarted.current) return;
    requestStarted.current = true;
    loadDetails();
  }, [loadDetails]);

  const relatedCourse = useMemo(() => {
    if (!assessment?.courseId) return assessment?.courseName ? { title: assessment.courseName } : null;
    return courses.find((course) => String(course.courseId ?? course.id) === String(assessment.courseId)) ||
      (assessment?.courseName ? { title: assessment.courseName } : null);
  }, [assessment, courses]);

  if (loading) {
    return (
      <div className="max-w-5xl px-4 py-6 sm:px-6">
        <div className="mb-5 h-9 w-36 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="max-w-4xl px-4 py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-400">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="mb-1 text-lg font-bold text-slate-900">Assessment not found</h2>
        <p className="mx-auto mb-5 max-w-md text-sm text-slate-500">
          {error || "The assessment details could not be loaded."}
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => navigate("/student/assessments")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700"
          >
            Back
          </button>
          <button
            onClick={loadDetails}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0f55f7] px-4 py-2 text-xs font-semibold text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-4 sm:px-6">
      <button
        onClick={() => navigate("/student/assessments")}
        className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-[#0f55f7]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Assessments
      </button>

      <div className="overflow-hidden rounded-[18px] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.07)] ring-1 ring-slate-900/[0.06] dark:bg-slate-900 dark:ring-white/[0.08]">
        <div className="relative overflow-hidden bg-gradient-to-r from-[#0f55f7] via-[#087fdc] to-[#06b6a8] px-5 py-4 text-white sm:px-6">
          <div className="absolute -right-12 -top-20 h-52 w-52 rounded-full border-[28px] border-white/[0.06]" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
              <ClipboardCheck className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-100">Assessment overview</p>
              <h1 className="truncate text-xl font-extrabold text-white">{assessment.title}</h1>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {assessment.description && (
            <p className="mb-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{assessment.description}</p>
          )}

          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            <div className="rounded-[15px] bg-slate-50 px-4 py-3.5 ring-1 ring-slate-900/[0.035] dark:bg-slate-800/70 dark:ring-white/[0.05]">
              <div className="mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                <BookOpen className="h-4 w-4" />
                Related Course
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {relatedCourse?.title || "Course not found"}
              </p>
            </div>

            {assessment.duration && (
              <div className="rounded-[15px] bg-slate-50 px-4 py-3.5 ring-1 ring-slate-900/[0.035] dark:bg-slate-800/70 dark:ring-white/[0.05]">
                <div className="mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  <Clock className="h-4 w-4" />
                  Duration
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{assessment.duration} minutes</p>
              </div>
            )}
            <div className="rounded-[15px] bg-slate-50 px-4 py-3.5 ring-1 ring-slate-900/[0.035] dark:bg-slate-800/70 dark:ring-white/[0.05]">
              <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">Questions</div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{assessment.totalQuestions ?? assessment.questionCount ?? 0}</p>
            </div>
            <div className="rounded-[15px] bg-slate-50 px-4 py-3.5 ring-1 ring-slate-900/[0.035] dark:bg-slate-800/70 dark:ring-white/[0.05]">
              <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">Passing score</div>
              <p className="text-sm font-bold text-emerald-700">{assessment.passingScore ?? 80}%</p>
            </div>
          </div>

          <button
            onClick={() =>
              navigate(`/student/assessments/${assessment.assessmentId ?? assessment.id}/instructions`, {
                state: { assessment, ...location.state },
              })
            }
            className="ml-auto mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] px-6 text-sm font-bold text-white shadow-[0_8px_20px_rgba(15,85,247,0.2)] transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-[#0f55f7]/15 sm:w-auto sm:min-w-56"
          >
            Start Assessment
            <PlayCircle className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

