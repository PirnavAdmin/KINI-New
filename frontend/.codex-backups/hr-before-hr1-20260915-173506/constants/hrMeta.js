// ================================================================
// HR MODULE REGISTRY — single source of truth for the Kini HRMS.
// Drives the module hub grid, sidebar navigation, and route wiring.
// Each module: id, label, tagline, path (route), permission key,
// accent color + lucide icon name (resolved by HRModuleIcon).
// ================================================================
import {
  LayoutDashboard, Users, ClipboardCheck, CreditCard, Briefcase,
  GraduationCap, UserPlus, CalendarCheck, Clock4, PartyPopper, Banknote,
  FileText, Target, TrendingUp, Package, FolderOpen, DoorOpen, Ticket, Settings,
} from 'lucide-react'

export const HR_MODULES = [
  {
    id: 'dashboard', label: 'HR Dashboard', tagline: 'Workforce pulse, approvals & insights',
    path: '/employee/hr-dashboard', permission: 'hr-dashboard', icon: LayoutDashboard,
    color: '#0f55f7', group: 'Overview',
  },
  {
    id: 'employees', label: 'Employee Management', tagline: 'Profiles, lifecycle & documents',
    path: '/employee/hr-employees', permission: 'employees', icon: Users,
    color: '#0f55f7', group: 'Core HR',
  },
  // ENTERPRISE HRMS — Mentors are Employees with role = 'Mentor'. The standalone
  // mentor module is hidden from the hub grid and navigation; the legacy route
  // redirects to the unified Employee Management page (Role = Mentor filter).
  // Kept in the registry (hidden) so legacy pages can still resolve module meta.
  {
    id: 'mentors', label: 'Mentors', tagline: 'Faculty, batches & ratings',
    path: '/employee/hr-mentors', permission: 'hr.mentors', icon: GraduationCap,
    color: '#8b5cf6', group: 'Core HR', hidden: true,
  },
  {
    id: 'onboarding', label: 'Onboarding', tagline: 'Hire to welcome-kit pipeline',
    path: '/employee/hr-onboarding', permission: 'hr.onboarding', icon: UserPlus,
    color: '#10b981', group: 'Core HR',
  },
  {
    id: 'attendance', label: 'Attendance', tagline: 'Live presence, heatmaps & reports',
    path: '/employee/hr-attendance', permission: 'hr.attendance', icon: CalendarCheck,
    color: '#F59E0B', group: 'Workforce',
  },
  {
    id: 'leave', label: 'Leave Management', tagline: 'Requests, balances & calendars',
    path: '/employee/hr-leave', permission: 'leave', icon: ClipboardCheck,
    color: '#06b6a8', group: 'Workforce',
  },
  {
    id: 'shifts', label: 'Shifts', tagline: 'Rosters, rotation & coverage',
    path: '/employee/hr-shifts', permission: 'hr.shifts', icon: Clock4,
    color: '#6366f1', group: 'Workforce',
  },
  {
    id: 'holidays', label: 'Holidays', tagline: 'Company & regional calendars',
    path: '/employee/hr-holidays', permission: 'hr.holidays', icon: PartyPopper,
    color: '#EC4899', group: 'Workforce',
  },
  {
    id: 'payroll', label: 'Payroll', tagline: 'Structures, runs & settlements',
    path: '/employee/hr-payroll', permission: 'payroll', icon: CreditCard,
    color: '#0f55f7', group: 'Finance',
  },
  {
    id: 'payslips', label: 'Payslips', tagline: 'Generate, preview & distribute',
    path: '/employee/hr-payslips', permission: 'hr.payslips', icon: Banknote,
    color: '#10b981', group: 'Finance',
  },
  {
    id: 'recruitment', label: 'Recruitment', tagline: 'Vacancies, pipeline & offers',
    path: '/employee/hr-recruitment', permission: 'recruitment', icon: Briefcase,
    color: '#8b5cf6', group: 'Talent',
  },
  {
    id: 'performance', label: 'Performance', tagline: 'Goals, KPIs & reviews',
    path: '/employee/hr-performance', permission: 'hr.performance', icon: Target,
    color: '#F59E0B', group: 'Talent',
  },
  {
    id: 'appraisal', label: 'Appraisal', tagline: 'Cycles, revisions & promotions',
    path: '/employee/hr-appraisal', permission: 'hr.appraisal', icon: TrendingUp,
    color: '#0f55f7', group: 'Talent',
  },
  {
    id: 'assets', label: 'Assets', tagline: 'Inventory, assignment & warranty',
    path: '/employee/hr-assets', permission: 'hr.assets', icon: Package,
    color: '#6366f1', group: 'Operations',
  },
  {
    id: 'documents', label: 'Employee Documents', tagline: 'Uploads, verification & expiry',
    path: '/employee/hr-documents', permission: 'hr.documents', icon: FolderOpen,
    color: '#06b6a8', group: 'Operations',
  },
  {
    id: 'exit', label: 'Exit Management', tagline: 'Resignation, clearance & settlement',
    path: '/employee/hr-exit', permission: 'hr.exit', icon: DoorOpen,
    color: '#EF4444', group: 'Operations',
  },
  {
    id: 'tickets', label: 'HR Tickets', tagline: 'Employee support & resolutions',
    path: '/employee/hr-tickets', permission: 'hr.tickets', icon: Ticket,
    color: '#F59E0B', group: 'Reports',
  },
  {
    id: 'reports', label: 'HR Reports', tagline: 'Analytics, exports & schedules',
    path: '/employee/hr-reports', permission: 'hr.reports', icon: FileText,
    color: '#0f55f7', group: 'Reports',
  },
  {
    id: 'settings', label: 'HR Settings', tagline: 'Policies, roles & workflows',
    path: '/employee/hr-settings', permission: 'hr.settings', icon: Settings,
    color: '#64748b', group: 'System',
  },
]

export const HR_GROUPS = [
  { key: 'Overview', label: 'Overview' },
  { key: 'Core HR', label: 'Core HR' },
  { key: 'Workforce', label: 'Workforce' },
  { key: 'Talent', label: 'Talent' },
  { key: 'Finance', label: 'Finance' },
  { key: 'Operations', label: 'Operations' },
  { key: 'Reports', label: 'Reports' },
  { key: 'System', label: 'System' },
]

export const HR_MODULE_MAP = Object.fromEntries(HR_MODULES.map((m) => [m.id, m]))

// ENTERPRISE RBAC — the first HR module the user can actually open, in
// navigation order (hidden modules like the legacy Mentors page are skipped).
// Returns null when nothing is accessible. Used by the Unauthorized page's
// "Continue to your workspace" target and by DemoLogin to land custom HR
// personas on their first permitted module instead of a restricted page.
export const firstAccessibleHrModule = (canModule) => {
  for (const module of HR_MODULES) {
    if (!module.hidden && canModule(module.id)) return module
  }
  return null
}

export const HR_NAV_GROUPS = [
  { title: 'OVERVIEW', items: ['dashboard'] },
  { title: 'CORE HR', items: ['employees', 'onboarding'] },
  { title: 'TIME & PAY', items: ['attendance', 'leave', 'shifts', 'holidays', 'payroll', 'payslips'] },
  { title: 'TALENT', items: ['recruitment', 'performance', 'appraisal'] },
  { title: 'WORKFORCE', items: ['assets', 'documents', 'exit', 'tickets'] },
  { title: 'SYSTEM', items: ['reports', 'settings'] },
]
