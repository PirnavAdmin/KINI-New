import { Outlet, useNavigate } from "react-router-dom";
import { BookOpen, LockKeyhole } from "lucide-react";
import useStudentProgressAccess from "@features/student/hooks/useStudentProgressAccess";

export default function StudentProgressGate({ requiredProgress, featureName }) {
  const navigate = useNavigate();
  const { progress, threshold, isUnlocked, remaining } = useStudentProgressAccess([], requiredProgress);

  if (isUnlocked) return <Outlet />;

  return (
    <div className="flex min-h-[65vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-xl shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 dark:bg-amber-500/10">
          <LockKeyhole className="h-8 w-8" />
        </div>
        <h1 className="mt-5 text-xl font-extrabold text-slate-900 dark:text-white">{featureName} is locked</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          Complete at least {threshold}% of a course to unlock {featureName}.
        </p>
        <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
            <span>Course progress</span>
            <span>{progress}% / {threshold}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div className="h-full rounded-full bg-gradient-to-r from-[#0f55f7] to-[#06b6a8]" style={{ width: `${Math.min(progress, threshold) / threshold * 100}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-400">Complete {remaining}% more to unlock.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/student/courses")}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20"
        >
          <BookOpen className="h-4 w-4" /> Continue learning
        </button>
      </div>
    </div>
  );
}
