function CourseCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">

      {/* Image Skeleton */}
      <div className="h-64 bg-slate-200 animate-pulse"></div>

      {/* Content Skeleton */}
      <div className="p-6">

        <div className="h-4 w-24 bg-slate-200 rounded animate-pulse mb-4"></div>

        <div className="h-8 w-full bg-slate-200 rounded animate-pulse mb-3"></div>

        <div className="h-8 w-3/4 bg-slate-200 rounded animate-pulse mb-6"></div>

        <div className="flex items-center gap-3 mb-6">

          <div className="w-12 h-12 rounded-full bg-slate-200 animate-pulse"></div>

          <div className="flex-1">

            <div className="h-4 w-20 bg-slate-200 rounded animate-pulse mb-2"></div>

            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse"></div>

          </div>

        </div>

        <div className="flex justify-between mb-6">

          <div className="h-4 w-28 bg-slate-200 rounded animate-pulse"></div>

          <div className="h-6 w-16 bg-slate-200 rounded animate-pulse"></div>

        </div>

        <div className="h-2 bg-slate-200 rounded-full animate-pulse mb-6"></div>

        <div className="h-14 w-full bg-slate-200 rounded-2xl animate-pulse"></div>

      </div>

    </div>
  );
}

export default CourseCardSkeleton;