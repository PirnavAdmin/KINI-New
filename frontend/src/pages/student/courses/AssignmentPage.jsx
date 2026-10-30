import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import QuestionCard from "@/components/student/courses/QuestionCard";
import assignmentService from "@/services/assignmentService";
import { courseService, getCourseProgress, getFallbackCourse } from "@/services/courseService";

export default function AssignmentPage() {
  const { courseId, classId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const loadedCourse = await courseService.getStudentCourse(courseId).catch(() => getFallbackCourse(courseId));
      const module = loadedCourse?.classes?.find((item) => item.id === classId);
      if (!mounted) return;
      setCourse(loadedCourse);
      setQuestions(
        module?.assignmentQuestions?.length
          ? module.assignmentQuestions
          : await assignmentService.getQuestions(courseId, classId, module?.topics || [])
      );
      setLoading(false);
    };
    load();
    return () => { mounted = false; };
  }, [courseId, classId]);

  const module = course?.classes.find((item) => item.id === classId);
  const progress = getCourseProgress(courseId);
  const videosComplete = module?.videos.every((video) => progress.completedVideos?.includes(video.id));
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const canSubmit = answeredCount === questions.length && questions.length > 0 && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    const result = await assignmentService.submitAssignment({ courseId, classId, questions, answers });
    navigate(`/student/courses/${courseId}/classes/${classId}/results/${result.attemptId}`);
  };

  if (loading) return <div className="p-6 text-sm text-slate-500">Loading assignment...</div>;

  if (!course || !module) {
    return (
      <div className="w-full max-w-[900px] px-4 py-6 sm:px-6">
        <button onClick={() => navigate("/student/courses")} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#0f55f7]">
          <ArrowLeft className="h-4 w-4" />
          Back to courses
        </button>
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900/50">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Assignment not found.</p>
          <p className="mt-1 text-xs text-slate-500">No assignment data is available.</p>
        </div>
      </div>
    );
  }

  if (!videosComplete) {
    return (
      <div className="w-full max-w-[900px] px-4 py-6 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-700/50 dark:bg-slate-900/70">
          <h1 className="text-xl font-bold text-slate-950 dark:text-white">Assignment locked</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Complete all {module.title} videos before answering class questions.</p>
          <button onClick={() => navigate(`/student/courses/${courseId}/classes/${classId}/videos`)} className="mt-5 rounded-xl bg-[#0f55f7] px-5 py-2.5 text-sm font-semibold text-white">Watch videos</button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1100px] px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
      <button onClick={() => navigate(`/student/courses/${courseId}`)} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#0f55f7]">
        <ArrowLeft className="h-4 w-4" />
        Back to class
      </button>
      <div className="sticky top-16 z-20 mb-5 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-slate-700/50 dark:bg-slate-900/90">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-950 dark:text-white">{module.title} Assignment</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{answeredCount}/{questions.length} questions answered. Failed attempts load new question IDs.</p>
          </div>
          <button disabled={!canSubmit} onClick={submit} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f55f7] px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300">
            <Send className="h-4 w-4" />
            {submitting ? "Submitting..." : "Submit assignment"}
          </button>
        </div>
      </div>
      <div className="grid gap-4">
        {questions.map((question, index) => (
          <QuestionCard
            key={question.questionId}
            question={question}
            index={index}
            value={answers[question.questionId]}
            onChange={(value) => setAnswers((current) => ({ ...current, [question.questionId]: value }))}
          />
        ))}
      </div>
    </div>
  );
}
