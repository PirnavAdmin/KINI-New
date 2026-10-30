import { Construction, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

/** A deliberate UI-first destination for routes whose workflow ships next. */
export default function FoundationPlaceholder({ title, description, actionLabel = "Back to dashboard" }) {
  const navigate = useNavigate();
  return (
    <main className="mx-auto flex min-h-[56vh] max-w-3xl items-center p-4 sm:p-8">
      <section className="w-full rounded-2xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-10">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-[#085FA7] dark:bg-blue-500/10"><Construction className="h-6 w-6" /></span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[.16em] text-[#085FA7]">Platform foundation</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">{title}</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
        <button type="button" onClick={() => navigate("/super-admin/dashboard")} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#085FA7] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#064d87] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20">
          {actionLabel}<ArrowRight className="h-4 w-4" />
        </button>
      </section>
    </main>
  );
}
