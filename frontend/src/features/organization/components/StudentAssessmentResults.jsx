/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from "react";
import { BookOpen, ClipboardList, X } from "lucide-react";
import { Link } from "react-router-dom";
import { assessmentService } from "@/services/assessmentService";
import { getApiErrorMessage } from "@shared/services/apiServices";
import { ROUTES } from "@shared/constants/routeConstants";
import { TableSkeleton } from "@shared/ui/Skeleton";
import EmptyState from "@shared/components/EmptyState";

const button = "inline-flex items-center justify-center rounded-xl bg-[#F39924] px-4 py-2 text-sm font-semibold text-white hover:bg-[#df8619] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#133B5D] disabled:opacity-50";
const value = (input) => input == null || input === "" ? "Not provided" : String(input);
const numeric = (input, suffix = "") => input == null ? "—" : `${Number(input.toFixed(1))}${suffix}`;
const date = (input) => {
  if (!input) return "Not provided";
  const parsed = new Date(input);
  return Number.isNaN(parsed.getTime()) ? "Not provided" : parsed.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
};

function Status({ row }) {
  return <span className={`inline-flex rounded-lg px-2 py-1 text-xs font-semibold ${row.passed ? "bg-emerald-50 text-emerald-700" : row.failed ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-600"}`}>{value(row.status)}</span>;
}

function ErrorState({ error, onRetry }) {
  const status = error?.response?.status;
  const detail = status === 401 ? "Your session could not be authenticated. Please sign in again."
    : status === 403 ? "You do not have permission to view this student's assessment results."
      : status === 404 ? "The assessment service could not find performance for this student."
        : status >= 500 ? "The assessment service is currently unavailable."
          : "The assessment response could not be loaded.";
  return <div role="alert" className="rounded-xl border border-rose-100 bg-rose-50 p-5 text-[#133B5D]">
    <h3 className="font-bold">Unable to load assessment results</h3>
    <p className="my-2 text-sm">{detail}{status ? ` (HTTP ${status})` : ""} Please try again.</p>
    <p className="mb-3 text-sm">{getApiErrorMessage(error, "The request could not be completed.")}</p>
    <button type="button" onClick={onRetry} className={button}>Retry</button>
  </div>;
}

function QuestionReview({ row }) {
  const [request, setRequest] = useState(0);
  const [state, setState] = useState({ loading: false, questions: null, error: false });
  useEffect(() => {
    if (!request) return undefined;
    let active = true;
    setState({ loading: true, questions: null, error: false });
    assessmentService.getQuestions(row.assessmentId)
      .then((questions) => { if (active) setState({ loading: false, questions, error: false }); })
      .catch(() => { if (active) setState({ loading: false, questions: null, error: true }); });
    return () => { active = false; };
  }, [request, row.assessmentId]);
  if (!row.assessmentId) return <p className="text-sm text-slate-500">Question review is unavailable for this result.</p>;
  return <section className="space-y-3 border-t border-slate-200 pt-4">
    <button type="button" className={button} disabled={state.loading} onClick={() => setRequest((count) => count + 1)}>{state.loading ? "Loading questions…" : state.error ? "Retry questions" : state.questions ? "Refresh questions" : "View Questions"}</button>
    {state.error && <p role="alert" className="text-sm text-rose-700">Unable to load questions. Please try again.</p>}
    {state.questions && <>
      <h3 className="font-bold">Question Review</h3>
      {!row.answers && <p className="text-sm text-slate-500">This result does not include the student's answers. Only assessment questions are shown.</p>}
      {!state.questions.length && <p className="text-sm text-slate-500">No questions were returned for this assessment.</p>}
      <ol className="space-y-3">{state.questions.map((question, index) => {
        const id = question.questionId ?? question.id;
        const answer = id == null ? null : row.answers?.find((item) => String(item.questionId) === String(id));
        const options = Array.isArray(question.options) ? question.options : [];
        const selected = answer?.selectedOptionId == null ? null : options.find((option) => String(option.optionId ?? option.id) === String(answer.selectedOptionId));
        return <li key={id ?? index} className="rounded-xl border border-slate-200 p-4">
          <p className="font-semibold">{index + 1}. {value(question.questionText ?? question.text)}</p>
          {options.length > 0 && <ul className="mt-2 space-y-1 text-sm text-slate-600">{options.map((option, optionIndex) => <li key={option.optionId ?? option.id ?? optionIndex}>{value(option.optionText ?? option.text)}</li>)}</ul>}
          {answer && <p className="mt-3 text-sm"><b>Student answer:</b> {value(answer.answerText ?? selected?.optionText ?? selected?.text)}{typeof answer.isCorrect === "boolean" && (answer.selectedOptionId != null || answer.answerText) ? ` · ${answer.isCorrect ? "Correct" : "Incorrect"}` : ""}</p>}
          {question.correctAnswer != null && <p className="mt-1 text-sm"><b>Correct answer:</b> {value(question.correctAnswer)}</p>}
        </li>;
      })}</ol>
    </>}
  </section>;
}

function ResultDialog({ row, rows, studentName, onClose }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  const attempts = row.assessmentId == null ? [] : rows.filter((item) => String(item.assessmentId) === String(row.assessmentId));
  const details = [
    ["Assessment Name", row.testName], ["Student Name", studentName],
    ["Score", numeric(row.score)], ["Total Marks", numeric(row.totalMarks)],
    ["Percentage", numeric(row.percentage, "%")], ["Status", row.status],
    ["Date", date(row.date)], ["Duration", numeric(row.duration, " min")],
    ["Total Questions", numeric(row.totalQuestions)], ["Correct Answers", numeric(row.correctAnswers)],
    ["Wrong Answers", numeric(row.wrongAnswers)], ["Unanswered", numeric(row.unanswered)], ["Accuracy", numeric(row.accuracy, "%")],
  ];
  return <dialog ref={dialog} onCancel={onClose} onClick={(event) => { if (event.target === dialog.current) onClose(); }} aria-labelledby="student-result-title" className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 text-[#133B5D] shadow-xl backdrop:bg-slate-950/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
    <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-slate-200 bg-white p-5 dark:bg-slate-900">
      <div><h2 id="student-result-title" className="text-lg font-bold">{row.testName}</h2><p className="text-sm text-slate-500">Assessment result for {studentName}</p></div>
      <button type="button" aria-label="Close result" onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100"><X className="h-5 w-5" /></button>
    </div>
    <div className="space-y-5 p-5">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">{details.map(([label, item]) => <div key={label} className="rounded-xl bg-[#F8FAFC] p-3 dark:bg-slate-800"><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 break-words text-sm font-semibold">{value(item)}</dd></div>)}</dl>
      <p className="text-xs text-slate-500">A dash means this information was not provided with the result.</p>
      {attempts.length > 1 && <section><h3 className="mb-2 font-bold">Attempt History</h3><ul className="space-y-2">{attempts.map((attempt, index) => <li key={`${attempt.id}-${index}`} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm"><span>{attempt.attempt == null ? "Recorded attempt" : `Attempt ${attempt.attempt}`}</span><span>{date(attempt.date)}</span><b>{numeric(attempt.percentage, "%")}</b><Status row={attempt} /></li>)}</ul></section>}
      <QuestionReview row={row} />
    </div>
  </dialog>;
}

export default function StudentAssessmentResults({ studentName, courseName, batchName, mentorName, performance }) {
  const [selected, setSelected] = useState(null);
  const { data, loading, error, retry } = performance;
  const rows = data?.assessments ?? [];
  const scored = rows.filter((row) => row.percentage != null);
  const cards = data ? [
    ["Total Tests", numeric(data.totalTests)], ["Tests Attempted", numeric(data.attemptedTests)],
    ["Tests Completed", numeric(data.completedTests)], ["Average Score", numeric(data.averageScore, "%")],
    ["Passed Tests", numeric(data.passedTests)],
  ] : [];
  return <section aria-label="Student assessment results" className="space-y-5 rounded-2xl border border-[#e6edf6] bg-white p-4 text-[#133B5D] shadow-sm sm:p-5 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
    <header>
      <h2 className="flex items-center gap-2 text-lg font-bold"><ClipboardList className="h-5 w-5 text-[#F39924]" />Assessment Results</h2>
      <p className="mt-1 text-sm text-slate-500">Assessment performance for <strong className="text-[#133B5D] dark:text-slate-100">{studentName}</strong></p>
      <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs">{[["Student", studentName], ["Course", courseName], ["Batch", batchName], ["Mentor", mentorName]].map(([label, item]) => <div key={label} className="flex gap-1"><dt className="text-slate-500">{label}:</dt><dd className="font-medium">{value(item)}</dd></div>)}</dl>
    </header>
    {loading ? <div role="status" aria-label="Loading assessment results" className="space-y-4"><div aria-hidden="true" className="grid grid-cols-2 gap-3 lg:grid-cols-5">{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-20 animate-pulse rounded-xl bg-slate-100 motion-reduce:animate-none dark:bg-slate-800" />)}</div><TableSkeleton rows={4} columns={5} /></div>
      : error ? <ErrorState error={error} onRetry={retry} />
        : data ? <>
          <dl className="grid grid-cols-2 gap-3 lg:grid-cols-5">{cards.map(([label, item]) => <div key={label} className="rounded-xl border border-slate-100 bg-[#F8FAFC] px-4 py-3 dark:border-slate-700 dark:bg-slate-800"><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 text-2xl font-bold tabular-nums">{item}</dd></div>)}</dl>
          {!rows.length ? <EmptyState icon={BookOpen} title="No assessment results available" description="No assessment attempts are recorded for this student yet." action={<Link className={button} to={ROUTES.ORG_ADMIN.ASSESSMENTS}>View Assessments</Link>} /> : <>
            <section aria-label="Performance chart" className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <h3 className="mb-3 font-bold">Performance by assessment</h3>
              {scored.length ? <ul className="max-h-72 space-y-3 overflow-y-auto pr-2">{scored.map((row, index) => <li key={`${row.id}-${index}`}>
                <div className="mb-1 flex justify-between gap-4 text-xs"><span>{row.testName}{row.attempt != null ? ` · Attempt ${row.attempt}` : ""}</span><b>{numeric(row.percentage, "%")}</b></div>
                <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-[#F39924]" style={{ width: `${Math.max(0, Math.min(100, row.percentage))}%` }} /></div>
              </li>)}</ul> : <p className="text-sm text-slate-500">Scores are not available for these attempts yet.</p>}
            </section>
            <section><h3 className="mb-3 font-bold">Assessment History</h3><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead><tr className="border-b border-slate-200 bg-[#F8FAFC] text-xs text-slate-500 dark:bg-slate-800">{["Test Name", "Course", "Attempt", "Date", "Score", "Duration", "Status", "Action"].map((heading) => <th scope="col" className="px-3 py-3" key={heading}>{heading}</th>)}</tr></thead>
              <tbody>{rows.map((row, index) => <tr key={`${row.id}-${index}`} className="border-b border-slate-100 dark:border-slate-800"><td className="px-3 py-3 font-semibold">{row.testName}</td><td className="px-3 py-3">{value(row.courseName)}</td><td className="px-3 py-3">{row.attempt == null ? "—" : `Attempt ${row.attempt}`}</td><td className="px-3 py-3">{date(row.date)}</td><td className="px-3 py-3 font-semibold">{numeric(row.percentage, "%")}</td><td className="px-3 py-3">{numeric(row.duration, " min")}</td><td className="px-3 py-3"><Status row={row} /></td><td className="px-3 py-3"><button type="button" onClick={() => setSelected(row)} className="whitespace-nowrap font-semibold text-[#133B5D] underline decoration-[#F39924] underline-offset-4 hover:text-[#F39924] dark:text-slate-100">View Result</button></td></tr>)}</tbody>
            </table></div></section>
          </>}
        </> : null}
    {selected && !loading && !error && <ResultDialog row={selected} rows={rows} studentName={studentName} onClose={() => setSelected(null)} />}
  </section>;
}
