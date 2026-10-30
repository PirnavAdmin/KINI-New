import Card from '@shared/components/Card'

/**
 * DashboardWidgetCard — shared "widget" shell (icon + title + optional action, then content)
 * used by dashboard pages that need several small panels (recent items, queues, calendars…)
 * without each page re-implementing the same header markup. Built on top of the existing Card.
 */
export default function DashboardWidgetCard({ icon: Icon, title, action, children, delay = 0, className = '', onClick }) {
  return (
    <Card
      dataUi="dashboard-widget"
      delay={delay}
      padding="p-4"
      variant="elevated"
      hover={Boolean(onClick)}
      onClick={onClick}
      className={`h-full border-slate-300/75 shadow-[0_3px_14px_rgba(15,23,42,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f55f7]/40 ${className}`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {Icon && (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0f55f7]/10 text-[#0f55f7] dark:bg-[#0f55f7]/15">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </Card>
  )
}
