import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ClipboardCheck, Briefcase, FolderCheck, UserPlus, DoorOpen, ArrowRight, ShieldCheck } from 'lucide-react'
import useHrPermissions from '@features/hr/hooks/useHrPermissions'
import HrTooltip from '@features/hr/components/HrTooltip'
import { HRSection } from '@features/hr/components/hrPrimitives'
import { ROUTES } from '@shared/constants/routeConstants'
import { HR_LEAVE_STATS } from '@features/hr/data/hrTime'
import { HR_RECRUITMENT_STATS } from '@features/hr/data/hrTalent'
import { HR_ONBOARDING } from '@features/hr/data/hrTalent'
import { HR_DOCUMENTS } from '@features/hr/data/hrWorkforce'
import { HR_EXIT_STATS } from '@features/hr/data/hrWorkforce'

/**
 * ApprovalCenter — dashboard widget listing every pending approval queue the
 * HR user is allowed to see (Leave, Recruitment, Documents, Onboarding, Exit).
 * Rows are gated by the existing module-view permissions; clicking a row opens
 * the module. Pure UI — no new APIs, no logic changes.
 */
const PENDING_CATEGORIES = [
  {
    key: 'leave', module: 'leave', label: 'Leave Approval',
    desc: 'Requests waiting for a decision',
    icon: ClipboardCheck, color: '#06b6a8', path: ROUTES.EMPLOYEE.HR_LEAVE,
    count: HR_LEAVE_STATS.pending,
  },
  {
    key: 'recruitment', module: 'recruitment', label: 'Recruitment Approval',
    desc: 'Offers, interviews & stage moves',
    icon: Briefcase, color: '#8b5cf6', path: ROUTES.EMPLOYEE.HR_RECRUITMENT,
    count: HR_RECRUITMENT_STATS.interviews + HR_RECRUITMENT_STATS.offersOut,
  },
  {
    key: 'documents', module: 'documents', label: 'Document Verification',
    desc: 'Uploads pending review',
    icon: FolderCheck, color: '#0f55f7', path: ROUTES.EMPLOYEE.HR_DOCUMENTS,
    count: HR_DOCUMENTS.filter((d) => d.status === 'pending' || d.status === 'expiring').length,
  },
  {
    key: 'onboarding', module: 'onboarding', label: 'Onboarding Approval',
    desc: 'Hires waiting for next step',
    icon: UserPlus, color: '#10b981', path: ROUTES.EMPLOYEE.HR_ONBOARDING,
    count: HR_ONBOARDING.filter((o) => o.stage !== 'welcome' && o.stage !== 'activation').length,
  },
  {
    key: 'exit', module: 'exit', label: 'Exit Approval',
    desc: 'Clearances & settlements',
    icon: DoorOpen, color: '#EF4444', path: ROUTES.EMPLOYEE.HR_EXIT,
    count: HR_EXIT_STATS.inProcess + HR_EXIT_STATS.settlementDue,
  },
]

export default function ApprovalCenter() {
  const navigate = useNavigate()
  // KINI HRMS RBAC — each approval queue follows the HR level's module view.
  const { canModule } = useHrPermissions()
  const visible = PENDING_CATEGORIES.filter((category) => canModule(category.module))
  const total = visible.reduce((sum, category) => sum + category.count, 0)

  if (visible.length === 0) return null

  return (
    <HRSection
      title="Approval Center"
      subtitle={`${total} pending approvals across ${visible.length} queues`}
      icon={ShieldCheck}
      padding="p-4"
      action={
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0f55f7]/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#0f55f7] dark:bg-[#0f55f7]/20 dark:text-blue-300">
          {total} pending
        </span>
      }
    >
      <div className="space-y-1.5">
        {visible.map((category, i) => (
          <motion.button
            key={category.key}
            type="button"
            onClick={() => navigate(category.path)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
            whileHover={{ x: 2 }}
            className="group flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2.5 text-left transition-all duration-200 hover:border-slate-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-800/30 dark:hover:border-slate-700"
            aria-label={`${category.label} — ${category.count} pending, open module`}
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white shadow-sm transition-transform duration-200 group-hover:scale-105"
              style={{ background: `linear-gradient(135deg, ${category.color}, ${category.color}bb)` }}
            >
              <category.icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-bold text-slate-800 dark:text-slate-100">{category.label}</span>
              <span className="block truncate text-[10px] text-slate-400">{category.desc}</span>
            </span>
            <span
              className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold"
              style={{ backgroundColor: `${category.color}14`, color: category.color }}
            >
              {category.count}
            </span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#0f55f7] dark:text-slate-600" />
          </motion.button>
        ))}
      </div>
      <HrTooltip text="Open the module to review and approve" side="bottom" className="mt-2 w-full">
        <span className="block w-full cursor-default rounded-lg bg-slate-50 px-3 py-2 text-center text-[10px] font-semibold text-slate-400 dark:bg-slate-800/40 dark:text-slate-500">
          Approval actions open in their module
        </span>
      </HrTooltip>
    </HRSection>
  )
}
