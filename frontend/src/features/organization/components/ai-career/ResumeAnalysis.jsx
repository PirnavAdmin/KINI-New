import { motion } from "framer-motion";
import {
  AlertTriangle,
  Award,
  BriefcaseBusiness,
  CheckCircle2,
  FileSearch,
  FolderKanban,
  GraduationCap,
  KeyRound,
  Languages,
  RotateCcw,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react";
import CareerRoadmap from "./CareerRoadmap";
import ScoreCard from "./ScoreCard";
import SkillChip from "./SkillChip";
import SuggestionCard from "./SuggestionCard";

const panelVariants = {
  blue: "border-blue-200 bg-blue-50/60 dark:border-blue-500/20 dark:bg-blue-500/10",
  emerald: "border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/20 dark:bg-emerald-500/10",
  rose: "border-rose-200 bg-rose-50/60 dark:border-rose-500/20 dark:bg-rose-500/10",
  amber: "border-amber-200 bg-amber-50/60 dark:border-amber-500/20 dark:bg-amber-500/10",
  violet: "border-violet-200 bg-violet-50/60 dark:border-violet-500/20 dark:bg-violet-500/10",
};

function ListPanel({ title, items, icon: Icon, variant = "blue" }) {
  if (!items?.length) return null;
  return (
    <section className={`rounded-2xl border p-4 ${panelVariants[variant]}`}>
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className="flex items-start gap-2 text-xs font-medium leading-5 text-slate-700 dark:text-slate-200">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-50" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

const hasStructuredContent = (analysis) => [
  analysis.atsScore,
  analysis.resumeScore,
  analysis.projectedAtsScore,
  analysis.priorityChanges,
  analysis.rewrittenBullets,
  analysis.skillsFound,
  analysis.missingSkills,
  analysis.strengths,
  analysis.weaknesses,
  analysis.suggestions,
  analysis.careerSuggestions,
].some((value) => Array.isArray(value) ? value.length : value !== null && value !== "");

export default function ResumeAnalysis({ analysis, fileName, onReset }) {
  const showSecondarySuggestions = analysis.priorityChanges.length === 0;
  const fallbackCards = hasStructuredContent(analysis)
    ? []
    : analysis.rawResponse.split(/\n{2,}/).map((item) => item.replace(/^#+\s*/, "").trim()).filter(Boolean);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto w-full max-w-6xl space-y-5 pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-cyan-400">Analysis complete</p>
          <h2 className="mt-1 truncate text-xl font-extrabold text-slate-950 dark:text-white">{fileName}</h2>
        </div>
        <button type="button" onClick={onReset} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-blue-500">
          <RotateCcw className="h-3.5 w-3.5" /> Analyze another resume
        </button>
      </div>

      {(analysis.resumeScore !== null || analysis.atsScore !== null) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {analysis.resumeScore !== null && <ScoreCard label="Resume Score" score={analysis.resumeScore} />}
          {analysis.atsScore !== null && <ScoreCard label="ATS Score" score={analysis.atsScore} type="ats" />}
        </div>
      )}

      {(analysis.projectedAtsScore !== null || analysis.priorityChanges.length > 0) && (
        <section className="overflow-hidden rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50 via-cyan-50 to-blue-50 dark:border-teal-500/25 dark:from-teal-500/10 dark:via-cyan-500/10 dark:to-blue-500/10">
          <div className="grid gap-4 p-5 lg:grid-cols-[220px_1fr] lg:items-center">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">Estimated improvement</p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-4xl font-black text-slate-950 dark:text-white">{analysis.projectedAtsScore ?? "—"}</span>
                <span className="pb-1 text-sm font-bold text-slate-400">/100 projected ATS</span>
              </div>
              <p className="mt-1 text-[10px] leading-4 text-slate-500 dark:text-slate-400">Estimate after applying the recommended changes; hiring outcomes are not guaranteed.</p>
            </div>
            {analysis.priorityChanges.length > 0 && (
              <div className="grid gap-2 sm:grid-cols-2">
                {analysis.priorityChanges.slice(0, 6).map((change, index) => (
                  <div key={`${change}-${index}`} className="flex items-start gap-2 rounded-xl bg-white/80 p-3 text-xs font-semibold leading-5 text-slate-700 shadow-sm ring-1 ring-slate-900/[0.04] dark:bg-slate-900/60 dark:text-slate-200 dark:ring-white/[0.06]">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-teal-500 text-[9px] font-black text-white">{index + 1}</span>
                    {change}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {analysis.rewrittenBullets.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <h3 className="mb-1 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white"><Sparkles className="h-4 w-4 text-violet-500" /> Resume-ready bullet rewrites</h3>
          <p className="mb-3 text-[10px] text-slate-400">Review placeholders and confirm every fact before adding these to your resume.</p>
          <div className="grid gap-2 lg:grid-cols-2">
            {analysis.rewrittenBullets.map((bullet, index) => (
              <div key={`${bullet}-${index}`} className="rounded-xl bg-violet-50/70 p-3 text-xs font-medium leading-5 text-slate-700 ring-1 ring-violet-100 dark:bg-violet-500/10 dark:text-slate-200 dark:ring-violet-500/20">
                {bullet}
              </div>
            ))}
          </div>
        </section>
      )}

      {(analysis.recommendedRole || analysis.nextRole) && (
        <section className="flex flex-col gap-4 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-5 dark:border-blue-500/25 dark:from-blue-500/10 dark:to-cyan-500/10 sm:flex-row sm:items-center">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 text-white shadow-md"><BriefcaseBusiness className="h-6 w-6" /></span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">Career recommendation</p>
            <h3 className="mt-1 text-lg font-extrabold text-slate-950 dark:text-white">{analysis.recommendedRole || analysis.nextRole}</h3>
            {analysis.recommendedRole && analysis.nextRole && analysis.recommendedRole !== analysis.nextRole && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Suggested next step: {analysis.nextRole}</p>}
          </div>
          <Target className="hidden h-8 w-8 text-blue-300 dark:text-blue-500/50 sm:block" />
        </section>
      )}

      {(analysis.skillsFound.length > 0 || analysis.missingSkills.length > 0) && (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Skills found</h3>
            <div className="flex flex-wrap gap-2">{analysis.skillsFound.map((skill) => <SkillChip key={skill}>{skill}</SkillChip>)}</div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="mb-1 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white"><AlertTriangle className="h-4 w-4 text-orange-500" /> Skills to develop for the target role</h3>
            <p className="mb-3 text-[10px] leading-4 text-slate-400">Learn and demonstrate these skills before adding them to your resume.</p>
            <div className="flex flex-wrap gap-2">{analysis.missingSkills.map((skill) => <SkillChip key={skill} missing>{skill}</SkillChip>)}</div>
          </section>
        </div>
      )}

      {showSecondarySuggestions && analysis.suggestions.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white"><Sparkles className="h-4 w-4 text-amber-500" /> Improvement suggestions</h3>
          <div className="grid gap-2 lg:grid-cols-2">
            {analysis.suggestions.map((suggestion, index) => <SuggestionCard key={`${suggestion}-${index}`} index={index + 1}>{suggestion}</SuggestionCard>)}
          </div>
        </section>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <ListPanel title="Strengths" items={analysis.strengths} icon={Award} variant="emerald" />
        <ListPanel title="Weaknesses" items={analysis.weaknesses} icon={XCircle} variant="rose" />
        <ListPanel title="Suggested certifications" items={analysis.suggestedCertifications} icon={GraduationCap} variant="blue" />
        <ListPanel title="Recommended projects" items={analysis.recommendedProjects} icon={FolderKanban} variant="violet" />
        <ListPanel title="Missing keywords" items={analysis.missingKeywords} icon={KeyRound} variant="amber" />
        <ListPanel title="Grammar issues" items={analysis.grammarIssues} icon={Languages} variant="rose" />
        <ListPanel title="Career suggestions" items={analysis.careerSuggestions} icon={BriefcaseBusiness} variant="blue" />
      </div>

      <CareerRoadmap steps={analysis.recommendedLearningPath} nextRole={analysis.nextRole} />

      {fallbackCards.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white"><FileSearch className="h-4 w-4 text-blue-500" /> AI analysis</h3>
          <div className="grid gap-3 lg:grid-cols-2">
            {fallbackCards.map((content, index) => (
              <div key={`${content}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium leading-5 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">{content}</div>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}
