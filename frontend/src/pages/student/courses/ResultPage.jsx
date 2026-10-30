import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ResultSummary from "@/components/student/courses/ResultSummary";
import assignmentService from "@/services/assignmentService";

export default function ResultPage() {
  const { courseId, classId, attemptId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);

  useEffect(() => {
    assignmentService.getResult(attemptId).then(setResult);
  }, [attemptId]);

  if (!result) return <div className="p-6 text-sm text-slate-500">Loading result...</div>;

  return (
    <div className="w-full max-w-[1100px] px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
      <button onClick={() => navigate(`/student/courses/${courseId}`)} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#0f55f7]">
        <ArrowLeft className="h-4 w-4" />
        Back to course
      </button>
      <ResultSummary
        result={result}
        onRetake={() => navigate(`/student/courses/${courseId}/classes/${classId}/assignment`)}
        onNext={() => navigate(`/student/courses/${courseId}`)}
      />
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <AnswerList title="Correct answers" items={result.correctAnswers || []} tone="success" />
        <AnswerList title="Wrong answers" items={result.wrongAnswers || []} tone="danger" />
      </div>
    </div>
  );
}

function AnswerList({ title, items, tone }) {
  const toneClass = tone === "success" ? "text-emerald-600 dark:text-emerald-300" : "text-red-600 dark:text-red-300";
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/70">
      <h2 className={`mb-4 font-bold ${toneClass}`}>{title}</h2>
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">No questions in this group.</p>
        ) : items.map((item) => (
          <div key={item.questionId} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.question}</p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Your answer: {item.selectedAnswer || "Not answered"}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Correct answer: {item.correctAnswer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
