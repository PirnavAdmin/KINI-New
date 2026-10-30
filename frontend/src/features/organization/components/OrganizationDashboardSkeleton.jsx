const MetricSkeleton = () => (
  <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
    <div className="h-3 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
    <div className="mt-3 h-7 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
    <div className="mt-3 h-3 w-32 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
  </div>
)

export default function OrganizationDashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading organization dashboard" className="space-y-4">
      <span className="sr-only">Loading organization dashboard</span>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => <MetricSkeleton key={index} />)}
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-4">
          <div className="h-4 w-44 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-8 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="mt-6 flex h-56 items-end gap-3">
          {[42, 66, 51, 82, 58, 74, 63, 88, 70, 78, 61, 84].map((height, index) => (
            <div
              key={index}
              className="flex-1 animate-pulse rounded-t bg-slate-100 dark:bg-slate-800"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {[0, 1].map((panel) => (
          <div key={panel} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="h-4 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="mt-5 grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="h-20 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
