export default function PageLayout({ children, className = '' }) {
  return (
    <div className={`mx-auto flex w-full min-w-0 max-w-none flex-col gap-6 ${className}`.trim()}>
      {children}
    </div>
  )
}
