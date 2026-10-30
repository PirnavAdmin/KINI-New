/**
 * Skeleton — Reusable loading skeleton component
 *
 * Variants:
 *   text     → Single line (like a paragraph)
 *   title    → Thicker line (like a heading)
 *   avatar   → Circular (like a profile picture)
 *   card     → Full card shape (for card loading states)
 *   custom   → Custom dimensions via className
 */
const Skeleton = ({
  variant = 'text',
  className = '',
  width,
  height,
  count = 1,
}) => {
  const variants = {
    text: 'h-4 rounded-md',
    title: 'h-6 rounded-lg w-3/4',
    avatar: 'w-10 h-10 rounded-full',
    card: 'h-40 rounded-[20px] w-full',
    badge: 'h-5 rounded-full w-16',
    button: 'h-10 rounded-xl w-24',
    custom: '',
  }

  const variantClass = variants[variant] || variants.text
  const style = width || height ? { width, height } : undefined

  const items = Array.from({ length: count }).map((_, i) => (
    <div
      key={i}
      className={`skeleton ${variantClass} ${className}`}
      style={style}
      aria-hidden="true"
    />
  ))

  return <>{items}</>
}

/**
 * CardSkeleton — Pre-built skeleton for card layouts
 * Shows 3 skeleton cards in a responsive grid
 */
const CardSkeleton = ({ count = 3 }) => (
  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-700/50 rounded-[20px] p-5"
      >
        <div className="flex items-start gap-3 mb-4">
          <Skeleton variant="avatar" className="!w-10 !h-10" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="title" className="!h-5" />
            <Skeleton variant="text" className="!w-1/3" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton variant="text" />
          <Skeleton variant="text" className="!w-3/4" />
          <Skeleton variant="text" className="!w-1/2" />
        </div>
        <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
          <Skeleton variant="text" className="!w-1/4" />
        </div>
      </div>
    ))}
  </div>
)

/**
 * TableSkeleton — Pre-built skeleton for DataTable loading states
 */
const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-700/50 rounded-[20px] overflow-hidden">
    <div className="p-4 border-b border-slate-200/50 dark:border-slate-700/50">
      <Skeleton variant="button" className="!w-48" />
    </div>
    <div className="p-4 space-y-3">
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b border-slate-200/50 dark:border-slate-700/50">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" className="flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4 py-2 border-b border-slate-100 dark:border-slate-800/50 last:border-0">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton key={colIdx} variant="text" className="flex-1" style={{ width: colIdx === 0 ? '30%' : undefined }} />
          ))}
        </div>
      ))}
    </div>
  </div>
)

export { CardSkeleton, TableSkeleton }
export default Skeleton
