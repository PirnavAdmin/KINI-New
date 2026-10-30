import { motion } from 'framer-motion'
import {
  UserPlus,
  GraduationCap,
  Award,
  LifeBuoy,
  Video,
  BarChart3,
  ListChecks,
  Layers,
  Calendar,
  CheckCircle2,
  FileText,
  Bell,
  Activity,
} from 'lucide-react'
import PageHeader from '@shared/components/PageHeader'
import StatsCard from '@shared/components/StatsCard'
import DashboardWidgetCard from '@shared/components/DashboardWidgetCard'
import StatusBadge from '@shared/components/StatusBadge'
import Button from '@shared/components/Button'
import {
  OPERATIONS_STATS,
  OPERATIONS_ADMISSIONS,
  OPERATIONS_SUPPORT_QUEUE,
  OPERATIONS_BATCH_SCHEDULE,
  OPERATIONS_CERTIFICATE_REQUESTS,
  OPERATIONS_RECENT_ACTIVITIES,
  OPERATIONS_NOTIFICATIONS,
} from '@shared/data/mockOperationsDashboard'

const STATS_CONFIG = [
  { key: 'newAdmissions', label: 'New Admissions', icon: UserPlus, color: '#0f55f7' },
  { key: 'activeEnrollments', label: 'Active Enrollments', icon: GraduationCap, color: '#10B981' },
  { key: 'pendingCertificates', label: 'Pending Certificates', icon: Award, color: '#F59E0B' },
  { key: 'supportTickets', label: 'Support Tickets', icon: LifeBuoy, color: '#EF4444' },
  { key: 'todaysClasses', label: "Today's Classes", icon: Video, color: '#8b5cf6' },
  { key: 'batchUtilization', label: 'Batch Utilization', icon: BarChart3, color: '#06b6a8', suffix: '%' },
  { key: 'pendingTasks', label: 'Pending Tasks', icon: ListChecks, color: '#EC4899' },
]

const QUICK_ACTIONS = [
  { key: 'create-batch', label: 'Create Batch', icon: Layers },
  { key: 'schedule-course', label: 'Schedule Course', icon: Calendar },
  { key: 'approve-admission', label: 'Approve Admission', icon: CheckCircle2 },
  { key: 'issue-certificate', label: 'Issue Certificate', icon: Award },
  { key: 'generate-report', label: 'Generate Report', icon: FileText },
]

const STATUS_MAP = { pending: 'pending', approved: 'success', issued: 'success', open: 'pending', 'in-progress': 'warning' }
const PRIORITY_MAP = { high: 'danger', medium: 'warning', low: 'default' }

export default function OperationsDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto w-full max-w-[1500px] min-w-0"
    >
      <PageHeader
        title="Operations command center"
        subtitle="Admissions, enrollments, certificates, and student support in one live workspace."
        badge={(
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live workspace
          </span>
        )}
        showBreadcrumb={false}
        compact
        containerClassName="dashboard-command-header"
      />

      {/* Statistics */}
      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STATS_CONFIG.map((stat, i) => (
          <StatsCard
            key={stat.key}
            icon={stat.icon}
            value={OPERATIONS_STATS[stat.key]}
            suffix={stat.suffix}
            label={stat.label}
            accentColor={stat.color}
            delay={i * 0.05}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-5 flex flex-wrap gap-2.5">
        {QUICK_ACTIONS.map((action) => (
          <Button key={action.key} variant="secondary" size="sm" icon={action.icon}>
            {action.label}
          </Button>
        ))}
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DashboardWidgetCard icon={UserPlus} title="Admissions">
          <ul className="space-y-3">
            {OPERATIONS_ADMISSIONS.map((admission) => (
              <li key={admission.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{admission.name}</p>
                  <p className="truncate text-xs text-slate-400">{admission.course}</p>
                </div>
                <StatusBadge status={STATUS_MAP[admission.status] || 'default'} size="sm" />
              </li>
            ))}
          </ul>
        </DashboardWidgetCard>

        <DashboardWidgetCard icon={LifeBuoy} title="Student Support Queue">
          <ul className="space-y-3">
            {OPERATIONS_SUPPORT_QUEUE.map((ticket) => (
              <li key={ticket.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{ticket.student}</p>
                  <p className="truncate text-xs text-slate-400">{ticket.issue}</p>
                </div>
                <StatusBadge status={PRIORITY_MAP[ticket.priority] || 'default'} label={ticket.priority} size="sm" />
              </li>
            ))}
          </ul>
        </DashboardWidgetCard>

        <DashboardWidgetCard icon={Calendar} title="Batch Schedule">
          <ul className="space-y-3">
            {OPERATIONS_BATCH_SCHEDULE.map((batch) => (
              <li key={batch.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{batch.course}</p>
                  <p className="truncate text-xs text-slate-400">{batch.batch} · {batch.room}</p>
                </div>
                <span className="shrink-0 text-xs font-bold text-slate-500 dark:text-slate-400">{batch.time}</span>
              </li>
            ))}
          </ul>
        </DashboardWidgetCard>

        <DashboardWidgetCard icon={Award} title="Certificate Requests">
          <ul className="space-y-3">
            {OPERATIONS_CERTIFICATE_REQUESTS.map((cert) => (
              <li key={cert.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{cert.student}</p>
                  <p className="truncate text-xs text-slate-400">{cert.course}</p>
                </div>
                <StatusBadge status={STATUS_MAP[cert.status] || 'default'} size="sm" />
              </li>
            ))}
          </ul>
        </DashboardWidgetCard>

        <DashboardWidgetCard icon={Activity} title="Recent Activities">
          <ul className="space-y-3">
            {OPERATIONS_RECENT_ACTIVITIES.map((activity) => (
              <li key={activity.id}>
                <p className="text-sm text-slate-700 dark:text-slate-200">{activity.text}</p>
                <p className="mt-0.5 text-xs text-slate-400">{activity.time}</p>
              </li>
            ))}
          </ul>
        </DashboardWidgetCard>

        <DashboardWidgetCard icon={Bell} title="Notifications">
          <ul className="space-y-3">
            {OPERATIONS_NOTIFICATIONS.map((note) => (
              <li key={note.id}>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{note.title}</p>
                <p className="mt-0.5 text-xs text-slate-400">{note.time}</p>
              </li>
            ))}
          </ul>
        </DashboardWidgetCard>
      </div>
    </motion.div>
  )
}
