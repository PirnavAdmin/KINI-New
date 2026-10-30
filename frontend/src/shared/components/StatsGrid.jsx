export default function StatsGrid({ children, className = '' }) {
  return (
    <section className={`grid gap-3 sm:grid-cols-2 xl:grid-cols-4 ${className}`.trim()}>
      {children}
    </section>
  )
}
