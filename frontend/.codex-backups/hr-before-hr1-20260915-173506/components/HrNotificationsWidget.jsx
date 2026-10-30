import { motion } from 'framer-motion'
import { Bell, CheckCheck, TriangleAlert, Info, XCircle, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useHrPermissions from '@features/hr/hooks/useHrPermissions'
import { HRSection } from '@features/hr/components/hrPrimitives'
import { ROUTES } from '@shared/constants/routeConstants'

/**
 * HrNotificationsWidget — role-aware notification feed for the HR dashboard.
 * Every notification is tagged with the module it belongs to; the widget only
 * shows the ones the logged-in HR user may view. Pure UI on mock data.
 */
const NOTIFICATIONS = [
  { id: 'nf-1', title: '3 attendance corrections pending', at: '10 min ago', tone: 'warning', module: 'attendance', path: ROUTES.EMPLOYEE.HR_ATTENDANCE },
  { id: 'nf-2', title: 'Visa expires in 45 days — Vikram Shah', at: '1h ago', tone: 'danger', module: 'documents', path: ROUTES.EMPLOYEE.HR_DOCUMENTS },
  { id: 'nf-3', title: 'New candidate applied for DevOps', at: '2h ago', tone: 'info', module: 'recruitment', path: ROUTES.EMPLOYEE.HR_RECRUITMENT },
  { id: 'nf-4', title: 'Q3 review cycle opens Aug 5', at: '1d ago', tone: 'info', module: 'performance', path: ROUTES.EMPLOYEE.HR_PERFORMANCE },
  { id: 'nf-5', title: 'Payroll run completed for July', at: '3h ago', tone: 'info', module: 'payroll', path: ROUTES.EMPLOYEE.HR_PAYROLL },
  { id: 'nf-6', title: 'Exit clearance due for Ramesh Iyer', at: '4h ago', tone: 'warning', module: 'exit', path: ROUTES.EMPLOYEE.HR_EXIT },
]

const TONE_STYLES = {
  warning: { icon: TriangleAlert, color: '#F59E0B', bg: 'bg-[#F59E0B]/10 text-[#F59E0B]' },
  danger: { icon: XCircle, color: '#EF4444', bg: 'bg-[#EF4444]/10 text-[#EF4444]' },
  info: { icon: Info, color: '#0f55f7', bg: 'bg-[#0f55f7]/10 text-[#0f55f7]' },
}

export default function HrNotificationsWidget() {
  const navigate = useNavigate()
  // KINI HRMS RBAC — every notification follows the HR level's module view.
  const { canModule } = useHrPermissions()
  const visible = NOTIFICATIONS.filter((n) => canModule(n.module))

  if (visible.length === 0) return null

  return (
    <HRSection
      title="Notifications"
      subtitle="Role-aware alerts & updates"
      icon={Bell}
      padding="p-4"
      action={
        <button
          onClick={() => navigate(ROUTES.EMPLOYEE.HR_DASHBOARD)}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold text-[#0f55f7] transition-colors hover:bg-[#0f55f7]/10 dark:text-blue-300"
          aria-label="View all notifications"
        >
          View all <ArrowRight className="h-3 w-3" />
        </button>
      }
    >
      <div className="space-y-1.5">
        {visible.slice(0, 5).map((n, i) => {
          const tone = TONE_STYLES[n.tone] || TONE_STYLES.info
          const ToneIcon = tone.icon
          return (
            <motion.button
              key={n.id}
              type="button"
              onClick={() => navigate(n.path)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              whileHover={{ x: 2 }}
              className="flex w-full items-start gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
              aria-label={`${n.title} — ${n.at}`}
            >
              <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${tone.bg}`}>
                <ToneIcon className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold leading-4 text-slate-700 dark:text-slate-200">{n.title}</span>
                <span className="mt-0.5 block text-[10px] font-medium text-slate-400">{n.at}</span>
              </span>
            </motion.button>
          )
        })}
      </div>
      <p className="mt-2 flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-[10px] font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
        <CheckCheck className="h-3 w-3" /> Shown for your access level only
      </p>
    </HRSection>
  )
}
