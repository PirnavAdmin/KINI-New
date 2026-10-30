import Skeleton from '@shared/ui/Skeleton'

export default function SkeletonLoader() {
  return (
    <div className="space-y-3.5">
      <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-[18px] border border-white/70 bg-white p-3 shadow-[0_6px_14px_rgba(15,23,42,0.035)] dark:border-slate-700/60 dark:bg-slate-900/80">
            <div className="flex items-start justify-between gap-2">
              <Skeleton variant="avatar" className="!h-10 !w-10" />
              <Skeleton variant="badge" className="!h-5" />
            </div>
            <div className="mt-3 space-y-2">
              <Skeleton variant="title" className="!w-2/3" />
              <Skeleton variant="text" className="!w-1/2" />
              <Skeleton variant="text" className="!w-3/5" />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[20px] border border-white/70 bg-white p-3 shadow-[0_6px_14px_rgba(15,23,42,0.035)] dark:border-slate-700/60 dark:bg-slate-900/80">
        <div className="grid gap-2.5 xl:grid-cols-[2.25fr_repeat(4,minmax(0,1fr))_auto]">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} variant="button" className="!h-9 !w-full" />
          ))}
        </div>
      </div>

      <div className="space-y-3.5">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-[20px] border border-white/70 bg-white p-3 shadow-[0_6px_14px_rgba(15,23,42,0.035)] dark:border-slate-700/60 dark:bg-slate-900/80">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.95fr)_minmax(0,0.78fr)]">
              <div className="flex gap-3">
                <Skeleton variant="card" className="!h-14 !w-14 !rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="badge" />
                  <Skeleton variant="title" className="!w-3/4" />
                  <Skeleton variant="text" className="!w-1/2" />
                  <Skeleton variant="text" className="!w-2/3" />
                </div>
              </div>
              <div className="space-y-2 rounded-[18px] bg-slate-50 p-3 dark:bg-slate-800/35">
                <Skeleton variant="text" className="!w-2/3" />
                <Skeleton variant="text" className="!w-3/4" />
                <Skeleton variant="text" className="!w-1/2" />
                <Skeleton variant="button" className="!h-8 !w-40" />
              </div>
              <div className="space-y-2 rounded-[18px] bg-white p-3 dark:bg-slate-900/70">
                <Skeleton variant="title" className="!w-1/2" />
                <Skeleton variant="text" className="!w-3/4" />
                <Skeleton variant="button" className="!h-9 !w-full" />
                <Skeleton variant="button" className="!h-9 !w-full" />
                <Skeleton variant="button" className="!h-9 !w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
