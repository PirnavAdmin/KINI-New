import { useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, FileText, Loader2, Upload, X } from "lucide-react";
import assessmentService from "@/services/assessmentService";
import { mapImportedAssessment } from "./assessmentPdfImportMapper";

const isPdf = (file) => file && (file.type === "application/pdf" || /\.pdf$/i.test(file.name || ""));
const backendText = (error) => {
  const message = error?.response?.data?.message;
  return typeof message === "string" && message.trim() ? message.trim() : "";
};
const importErrorMessage = (error) => {
  const status = error?.response?.status;
  if (status === 401 || status === 403) return "Your session is not authorized to import assessment PDFs.";
  if (status === 413) return "PDF exceeds the allowed file size.";
  if (status === 415) return "Please upload a valid PDF.";
  if (status === 400) return backendText(error) || "Please upload a valid PDF.";
  return "Unable to process the assessment PDF. Please try again.";
};
const TYPE_LABEL = { MCQ: "MCQ", TrueFalse: "True/False", Descriptive: "Descriptive", Coding: "Coding" };

// Questions step → Upload Questions PDF → Process PDF → preview → Apply
// Questions. Applying only adds questions to the builder; the assessment is
// still created/published through the existing Review step.
export default function AssessmentPdfImport({ onApply, onClose }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const choose = (event) => {
    const next = event.target.files?.[0];
    event.target.value = "";
    if (!next) return;
    setResult(null);
    if (!isPdf(next)) {
      setFile(null);
      setError("Please upload a valid PDF.");
      return;
    }
    setError("");
    setFile(next);
  };
  const pickAnother = () => {
    setFile(null);
    setResult(null);
    setError("");
    inputRef.current?.click();
  };
  const process = async () => {
    if (!file || processing) return;
    setProcessing(true);
    setError("");
    try {
      setResult(mapImportedAssessment(await assessmentService.importQuestionsPdf(file)));
    } catch (requestError) {
      setError(importErrorMessage(requestError));
    } finally {
      setProcessing(false);
    }
  };

  const incomplete = result ? result.questions.filter((item) => item.issues.length).length : 0;

  return <section aria-label="Import questions from PDF" className="rounded-2xl border border-blue-200 bg-white p-4 shadow-sm dark:border-blue-900 dark:bg-slate-900">
    <header className="mb-3 flex items-center gap-2"><Upload className="h-4 w-4 text-blue-600" /><h3 className="mr-auto text-sm font-bold text-slate-900 dark:text-white">Upload Questions PDF</h3><button type="button" aria-label="Close PDF import" disabled={processing} onClick={onClose} className="p-1 text-slate-500 disabled:opacity-40"><X className="h-4 w-4" /></button></header>
    <input ref={inputRef} type="file" accept="application/pdf,.pdf" onChange={choose} className="hidden" data-testid="assessment-pdf-input" />

    {!result && !processing && <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-2 text-xs font-bold text-blue-600"><FileText className="h-4 w-4" />{file ? "Choose another PDF" : "Choose PDF"}</button>
      {file && <span className="min-w-0 flex-1 truncate text-xs text-slate-600 dark:text-slate-300">{file.name}</span>}
      <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold">Cancel</button>
      <button type="button" disabled={!file} onClick={process} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">Process PDF</button>
    </div>}

    {processing && <div role="status" className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-900">
      <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin" />
      <div><p className="font-bold">Processing assessment PDF...</p><p className="mt-1">Extracting:</p><ul className="ml-4 list-disc"><li>Questions</li><li>Options</li><li>Correct answers</li><li>Marks</li><li>Difficulty</li></ul></div>
    </div>}
    {error && <p role="alert" className="mt-2 text-xs font-semibold text-rose-600">{error}</p>}

    {result && <div className="space-y-3">
      {result.questions.length === 0 ? <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
        <p className="flex items-center gap-1.5 font-bold"><AlertTriangle className="h-4 w-4" />PDF uploaded successfully, but no questions were extracted.</p>
        <p className="mt-1">The PDF parser could not identify any questions.</p>
        <p className="mt-2">File: <b>{result.fileName || file?.name}</b></p>
        <p>Questions detected: <b>{result.summary.questionCount}</b></p>
        <p>Total marks: <b>{result.summary.totalMarks}</b></p>
      </div> : <div className={`rounded-xl border p-3 text-xs ${result.canApply ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
        <p className="flex items-center gap-1.5 font-bold">{result.canApply ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}PDF processed successfully</p>
        <p className="mt-1">File: <b>{result.fileName || file?.name}</b></p>
        <p className="mt-1"><b>{result.questions.length} Questions detected</b> · <b>{result.summary.totalMarks} Total Marks</b></p>
        {!result.canApply && <p role="alert" className="mt-2 font-semibold">{incomplete} of {result.questions.length} questions are incomplete. Fix the PDF and try again, or add those questions manually.</p>}
      </div>}

      {result.questions.length > 0 && <ol aria-label="Imported questions preview" className="max-h-96 space-y-3 overflow-y-auto rounded-xl border border-slate-200 p-3 text-xs dark:border-slate-700">
        {result.questions.map(({ question, issues }, index) => <li key={index} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Question {index + 1}</p>
          <p className="font-semibold text-slate-900 dark:text-white">{question.text || "—"}</p>
          <p className="mt-1 text-slate-500">Type: {TYPE_LABEL[question.type] ?? (question.type || "—")} · Difficulty: {question.difficulty || "—"} · Marks: {question.marks || "—"}</p>
          {question.type === "MCQ" && <ul className="mt-1.5 space-y-0.5">{question.options.map((option, optionIndex) => <li key={optionIndex} className={optionIndex === question.correct ? "font-semibold text-emerald-700" : "text-slate-600 dark:text-slate-300"}>○ {option || "—"}{optionIndex === question.correct ? " ✓" : ""}</li>)}</ul>}
          {question.type === "TrueFalse" && question.answer && <p className="mt-1 font-semibold text-emerald-700">Answer: {question.answer} ✓</p>}
          {issues.length > 0 && <ul className="mt-1.5 list-disc pl-4 font-semibold text-rose-600">{issues.map((issue) => <li key={issue}>{issue}</li>)}</ul>}
        </li>)}
      </ol>}

      <div className="flex flex-wrap items-center justify-end gap-2">
        {result.canApply && <span className="mr-auto text-[11px] text-slate-500">Questions are added to this paper for review. Nothing is published until you publish from Review.</span>}
        <button type="button" onClick={pickAnother} className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-bold text-blue-600">Try Another PDF</button>
        <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold">Cancel</button>
        <button type="button" disabled={!result.canApply} onClick={() => onApply(result.questions.map((item) => item.question))} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">Apply Questions</button>
      </div>
    </div>}
  </section>;
}
