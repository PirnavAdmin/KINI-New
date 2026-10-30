import { useEffect, useRef, useState } from "react";
import { AlertCircle, FileText, LoaderCircle, RefreshCw, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import getApiErrorMessage from "@/utils/getApiErrorMessage";
import { analyzeResume } from "@shared/services/ai.service";
import ResumeAnalysis from "./ResumeAnalysis";
import ResumeUploader from "./ResumeUploader";
import { extractResumeText, parseResumeAnalysis } from "./resumeUtils";

const STAGES = {
  extracting: "Extracting resume text...",
  analyzing: "Analyzing your experience and skills...",
  scoring: "Generating ATS and resume scores...",
};

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [stage, setStage] = useState("");
  const [error, setError] = useState("");
  const stageTimerRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    // React Strict Mode runs an extra setup/cleanup cycle in development.
    // Restore this flag during every setup so completed extraction/AI results
    // are allowed to update the UI instead of leaving the loader spinning.
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      window.clearTimeout(stageTimerRef.current);
    };
  }, []);

  const runAnalysis = async (selectedFile, existingText = "") => {
    setFile(selectedFile);
    setAnalysis(null);
    setError("");

    try {
      let text = existingText;
      if (!text) {
        setStage("extracting");
        text = await extractResumeText(selectedFile);
        if (!mountedRef.current) return;
        setResumeText(text);
      }

      setStage("analyzing");
      stageTimerRef.current = window.setTimeout(() => setStage("scoring"), 1800);
      const response = await analyzeResume(text);
      if (!mountedRef.current) return;
      const parsed = parseResumeAnalysis(response);
      window.clearTimeout(stageTimerRef.current);
      setAnalysis(parsed);
      toast.success("Resume analysis completed", { duration: 1800 });
    } catch (requestError) {
      window.clearTimeout(stageTimerRef.current);
      if (!mountedRef.current) return;
      const message = getApiErrorMessage(requestError, "Unable to analyze this resume. Please try again.");
      setError(message);
      toast.error(message);
    } finally {
      if (mountedRef.current) setStage("");
    }
  };

  const reset = () => {
    window.clearTimeout(stageTimerRef.current);
    setFile(null);
    setResumeText("");
    setAnalysis(null);
    setError("");
    setStage("");
  };

  if (analysis) return <ResumeAnalysis analysis={analysis} fileName={file?.name || "Resume"} onReset={reset} />;

  if (stage) {
    const stageIndex = Object.keys(STAGES).indexOf(stage);
    return (
      <div className="mx-auto flex min-h-[430px] max-w-xl flex-col items-center justify-center px-4 text-center">
        <div className="relative grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-blue-600/10 to-teal-500/10 text-blue-600 dark:text-cyan-400">
          <FileText className="h-8 w-8" />
          <LoaderCircle className="absolute inset-0 h-20 w-20 animate-spin p-1 text-blue-500/40" />
        </div>
        <h2 className="mt-5 text-lg font-extrabold text-slate-950 dark:text-white">{STAGES[stage]}</h2>
        <p className="mt-2 truncate text-sm text-slate-500 dark:text-slate-400">{file?.name}</p>
        <div className="mt-6 grid w-full grid-cols-3 gap-2">
          {Object.entries(STAGES).map(([key, label], index) => (
            <div key={key} className={`rounded-xl border px-2 py-3 text-[10px] font-semibold leading-4 ${index <= stageIndex ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-300" : "border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900"}`}>
              <span className="mb-1 block text-xs font-extrabold">{index + 1}</span>{label.replace("...", "")}
            </div>
          ))}
        </div>
        <p className="mt-4 text-[11px] text-slate-400">This normally completes within a few seconds.</p>
        <button type="button" onClick={reset} className="mt-3 inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          <RotateCcw className="h-3.5 w-3.5" /> Cancel analysis
        </button>
      </div>
    );
  }

  if (error && file) {
    return (
      <div className="mx-auto flex min-h-[430px] max-w-xl flex-col items-center justify-center px-4 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"><AlertCircle className="h-7 w-7" /></div>
        <h2 className="mt-4 text-lg font-extrabold text-slate-950 dark:text-white">Analysis could not be completed</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{error}</p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={() => runAnalysis(file, resumeText)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 px-4 text-xs font-bold text-white shadow-md">
            <RefreshCw className="h-3.5 w-3.5" /> Try again
          </button>
          <button type="button" onClick={reset} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <RotateCcw className="h-3.5 w-3.5" /> Choose another file
          </button>
        </div>
      </div>
    );
  }

  return <ResumeUploader onFile={(selectedFile) => runAnalysis(selectedFile)} disabled={Boolean(stage)} />;
}
