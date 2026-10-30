import { memo } from "react";

const SkeletonBlock = memo(function SkeletonBlock({ className }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-[#1E293B] ${className || ""}`}
    />
  );
});

export default function LoadingSkeleton() {
  return (
    <div className="min-h-screen w-full bg-[#030712] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex w-full min-w-0 gap-6 max-w-none">
        {/* Main content area */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Video player skeleton */}
          <SkeletonBlock className="aspect-video w-full rounded-2xl" />

          {/* Title */}
          <SkeletonBlock className="h-8 w-3/4" />

          {/* Tabs */}
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-10 w-24 rounded-lg" />
            ))}
          </div>

          {/* Tab content */}
          <div className="space-y-3 pt-4">
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-5/6" />
            <SkeletonBlock className="h-4 w-4/6" />
            <SkeletonBlock className="h-24 w-full mt-4" />
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="w-80 hidden lg:block space-y-3">
          <SkeletonBlock className="h-20 w-full" />
          <SkeletonBlock className="h-10 w-full" />
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
