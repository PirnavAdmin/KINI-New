import { useRef, useState } from "react";
import { CheckCircle2, FileText, ShieldCheck, Sparkles, UploadCloud, Zap } from "lucide-react";
import { resumeFileConfig, validateResumeFile } from "./resumeUtils";

export default function ResumeUploader({ onFile, disabled }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [validationError, setValidationError] = useState("");

  const chooseFile = (file) => {
    const error = validateResumeFile(file);
    setValidationError(error);
    if (!error) onFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    if (!disabled) chooseFile(event.dataTransfer.files?.[0]);
  };

  const benefits = [
    { icon: Sparkles, title: "ATS compatibility", text: "Structure and keyword analysis" },
    { icon: Zap, title: "Actionable feedback", text: "Specific improvements, not generic tips" },
    { icon: ShieldCheck, title: "Privacy first", text: "Only extracted text is sent for analysis" },
  ];

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-4 py-1 lg:grid-cols-[0.78fr_1.22fr] lg:items-stretch">
      <section className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-[#0f55f7] via-[#087fdc] to-[#06b6a8] p-6 text-white shadow-[0_18px_45px_rgba(15,85,247,0.18)] sm:p-7">
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full border-[28px] border-white/[0.06]" />
        <div className="relative">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
            <FileText className="h-6 w-6" />
          </div>
          <p className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/70">AI-powered career tool</p>
          <h2 className="mt-1 text-2xl font-extrabold">Make your resume stand out</h2>
          <p className="mt-2 text-sm leading-6 text-white/75">Get an ATS-ready review with clear, practical recommendations for your next application.</p>

          <div className="mt-6 space-y-3">
            {benefits.map((item) => (
              <div key={item.title} className="flex items-center gap-3 rounded-xl bg-white/[0.09] px-3 py-2.5 ring-1 ring-white/10">
                <item.icon className="h-4 w-4 shrink-0 text-cyan-100" />
                <div>
                  <p className="text-xs font-bold">{item.title}</p>
                  <p className="text-[10px] text-white/65">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col rounded-[22px] bg-white p-5 shadow-[0_14px_38px_rgba(15,23,42,0.065)] ring-1 ring-slate-900/[0.06] dark:bg-slate-900 dark:ring-white/[0.08] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">Upload your resume</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">Choose a file to receive your personalized AI analysis.</p>
          </div>
          <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200 sm:inline-flex dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20">
            <ShieldCheck className="h-3 w-3" /> Secure
          </span>
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`mt-4 flex min-h-[250px] flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-7 text-center transition ${dragging ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10" : "border-slate-300 bg-slate-50/70 hover:border-blue-400 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:border-blue-500 dark:hover:bg-blue-500/5"} disabled:cursor-not-allowed disabled:opacity-60`}
        >
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-blue-600 shadow-sm ring-1 ring-slate-900/[0.06] dark:bg-slate-800 dark:text-cyan-400 dark:ring-white/[0.08]"><UploadCloud className="h-6 w-6" /></span>
          <span className="mt-3 text-sm font-extrabold text-slate-800 dark:text-white">Drop your resume here</span>
          <span className="mt-1 text-xs text-slate-400">or browse from your computer</span>
          <span className="mt-4 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20">Choose resume</span>
          <span className="mt-3 text-[10px] font-semibold text-slate-400">PDF, DOCX, TXT · Maximum {resumeFileConfig.maxSizeLabel}</span>
        </button>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {["ATS score", "Skill gaps", "Improvements"].map((label) => (
            <div key={label} className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-50 px-2 py-2 text-[10px] font-bold text-slate-600 ring-1 ring-slate-900/[0.04] dark:bg-slate-800/60 dark:text-slate-300 dark:ring-white/[0.05]">
              <CheckCircle2 className="h-3 w-3 text-teal-500" /> {label}
            </div>
          ))}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={resumeFileConfig.accept}
          disabled={disabled}
          onChange={(event) => chooseFile(event.target.files?.[0])}
          className="sr-only"
        />
        {validationError && <p role="alert" className="mt-3 text-sm font-semibold text-red-600 dark:text-red-400">{validationError}</p>}
      </section>
    </div>
  );
}
