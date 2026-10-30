export default function BatchesPageHero({ title, subtitle, icon: Icon, badge, actions }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        {Icon && <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#E8F1FF] text-[#133B5D] dark:bg-slate-800 dark:text-sky-300"><Icon aria-hidden="true" className="h-6 w-6" /></span>}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-[#133B5D] sm:text-2xl dark:text-white">{title}</h1>
            {badge}
          </div>
          <p className="mt-1 text-sm text-[#5B78A0] dark:text-slate-400">{subtitle}</p>
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
