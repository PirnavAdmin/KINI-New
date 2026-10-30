export default function CourseCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="h-5 w-24 rounded-full bg-background-secondary" />
      <div className="mt-4 h-6 w-3/4 rounded bg-background-secondary" />
      <div className="mt-3 h-4 w-full rounded bg-background-secondary" />
      <div className="mt-2 h-4 w-5/6 rounded bg-background-secondary" />
      <div className="mt-5 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-background-secondary" />
        <div className="h-4 w-20 rounded bg-background-secondary" />
      </div>
    </div>
  );
}
