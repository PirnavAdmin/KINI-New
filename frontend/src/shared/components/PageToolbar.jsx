export default function PageToolbar({ children, className = '' }) {
  return (
    <div className={`flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-700/50 ${className}`.trim()}>
      {children}
    </div>
  )
}
