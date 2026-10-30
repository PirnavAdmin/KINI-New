export default function TableFrame({ className = '', children }) {
  return (
    <div className={`w-full min-w-0 max-w-full overflow-x-auto [scrollbar-gutter:stable] ${className}`}>
      {children}
    </div>
  )
}
