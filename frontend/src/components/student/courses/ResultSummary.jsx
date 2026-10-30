import { CheckCircle2, RotateCcw, Trophy, XCircle } from "lucide-react";

export default function ResultSummary({ result, onRetake, onNext }) {
  const passed = result.resultStatus === "pass";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/70">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${passed ? "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10" : "bg-red-50 text-red-500 dark:bg-red-500/10"}`}>
            {passed ? <Trophy className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">{passed ? "Passed" : "Retake needed"}</p>
            <h2 className="mt-1 text-3xl font-black text-slate-950 dark:text-white">{result.score}%</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{result.correctCount} correct, {result.wrongCount} wrong out of {result.totalQuestions}</p>
          </div>
        </div>
        {passed ? (
          <button onClick={onNext} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f55f7] px-5 py-3 text-sm font-semibold text-white">
            <CheckCircle2 className="h-4 w-4" />
            Unlock next class
          </button>
        ) : (
          <button onClick={onRetake} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white">
            <RotateCcw className="h-4 w-4" />
            Retake with new questions
          </button>
        )}
      </div>
    </div>
  );
}
