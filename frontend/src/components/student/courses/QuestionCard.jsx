export default function QuestionCard({ question, index, value, onChange }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/70">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0f55f7]/10 text-xs font-bold text-[#0f55f7]">{index + 1}</span>
        <div>
          <p className="font-semibold text-slate-950 dark:text-white">{question.question}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{question.topic}</p>
        </div>
      </div>
      <div className="grid gap-2">
        {question.options.map((option) => (
          <label key={option} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${value === option ? "border-[#0f55f7] bg-[#0f55f7]/10 text-[#0f55f7]" : "border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/60"}`}>
            <input type="radio" className="h-4 w-4 accent-[#0f55f7]" checked={value === option} onChange={() => onChange(option)} />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
}
