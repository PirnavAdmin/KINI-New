import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, LayoutGrid, Zap, Sparkles, Users, ShieldCheck, Activity } from 'lucide-react'
import useHrPermissions from '@features/hr/hooks/useHrPermissions'
import usePageSearch from '@features/hr/hooks/usePageSearch'
import HRPage from '@features/hr/components/HRPage'
import { HR_MODULES, HR_GROUPS } from '@features/hr/constants/hrMeta'
import { HR_WORKFORCE } from '@features/hr/data/hrEmployees'
import { HR_ATTENDANCE_TODAY } from '@features/hr/data/hrTime'
import { HR_LEAVE_STATS } from '@features/hr/data/hrTime'
import { HR_SHIFTS } from '@features/hr/data/hrTime'
import { HR_HOLIDAYS } from '@features/hr/data/hrTime'
import { HR_RECRUITMENT_STATS } from '@features/hr/data/hrTalent'
import { HR_ONBOARDING } from '@features/hr/data/hrTalent'
import { HR_GOALS } from '@features/hr/data/hrTalent'
import { HR_APPRAISAL_CYCLES } from '@features/hr/data/hrTalent'
import { HR_PAYROLL_STATS } from '@features/hr/data/hrPay'
import { HR_PAYSLIPS } from '@features/hr/data/hrPay'
import { HR_ASSET_STATS, HR_DOCUMENTS, HR_EXITS, HR_TICKET_STATS } from '@features/hr/data/hrWorkforce'

// Per-module record counts shown on each card (derived from the mock registry).
// The Employee Management card is rendered by FeaturedEmployeeCard instead.
const RECORD_COUNTS = {
  onboarding: { value: HR_ONBOARDING.length, label: 'active onboardings' },
  attendance: { value: HR_ATTENDANCE_TODAY.total, label: 'tracked today' },
  leave: { value: HR_LEAVE_STATS.totalRequests, label: 'requests this period' },
  shifts: { value: HR_SHIFTS.length, label: 'shift patterns' },
  holidays: { value: HR_HOLIDAYS.length, label: 'holidays scheduled' },
  payroll: { value: HR_PAYROLL_STATS.processedEmployees, label: 'employees processed' },
  payslips: { value: HR_PAYSLIPS.length, label: 'payslips issued' },
  recruitment: { value: HR_RECRUITMENT_STATS.totalCandidates, label: 'candidates' },
  performance: { value: HR_GOALS.length, label: 'tracked goals' },
  appraisal: { value: HR_APPRAISAL_CYCLES.length, label: 'cycles on record' },
  assets: { value: HR_ASSET_STATS.total, label: 'assets in inventory' },
  documents: { value: HR_DOCUMENTS.length, label: 'documents on file' },
  exit: { value: HR_EXITS.length, label: 'exits this quarter' },
  tickets: { value: HR_TICKET_STATS.open, label: 'open tickets' },
  reports: { value: 8, label: 'report types' },
  settings: { value: 5, label: 'policy groups' },
}

const QUICK_ACTIONS = {
  employees: 'Add Employee',
  onboarding: 'Add New Hire',
  attendance: 'Export Report',
  leave: 'New Leave Request',
  shifts: 'Assign Shift',
  holidays: 'Add Holiday',
  payroll: 'Run Payroll',
  payslips: 'Generate Payslips',
  recruitment: 'Post Vacancy',
  performance: 'New Goal',
  appraisal: 'Start Cycle',
  assets: 'Add Asset',
  documents: 'Upload Document',
  exit: 'Register Resignation',
  tickets: 'New Ticket',
  reports: 'Schedule Report',
  settings: 'Edit Policies',
}

// ── Featured unified Employee Management card ─────────────────────────────
// ENTERPRISE HRMS — one centralized workforce module. Shows Total Employees,
// Active Employees, Active Mentors and a Quick Action button.
function FeaturedEmployeeCard({ onOpen, onAdd, canAdd }) {
  // Derived from the same unified roster the Employee Management page uses, so
  // the workspace card and the page always agree on headcount.
  const active = HR_WORKFORCE.filter((r) => r.status === 'active')
  const stats = [
    { label: 'Total Employees', value: HR_WORKFORCE.length, color: '#0f55f7' },
    { label: 'Active Employees', value: active.filter((r) => r.role !== 'Mentor').length, color: '#06b6a8' },
    { label: 'Active Mentors', value: active.filter((r) => r.role === 'Mentor').length, color: '#8b5cf6' },
  ]
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
      className="group relative col-span-1 flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#0f55f7]/20 bg-gradient-to-br from-[#0f55f7]/8 via-white to-[#06b6a8]/8 p-4 shadow-sm transition-shadow duration-200 hover:shadow-xl dark:border-[#0f55f7]/30 dark:from-[#0f55f7]/15 dark:via-slate-900 dark:to-[#06b6a8]/15 sm:col-span-2 xl:col-span-4"
      onClick={onOpen}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onOpen()
      }}
      aria-label="Open Employee Management"
    >
      <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0f55f7] to-[#06b6a8]" />
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0f55f7] to-[#06b6a8] text-white shadow-md transition-transform duration-200 group-hover:scale-110">
            <Users className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Employee Management</h4>
            <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-slate-400">
              Manage all employees, mentors, HR staff, recruiters, payroll staff, managers and department heads from one centralized workspace.
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-[#0f55f7]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#0f55f7] dark:bg-[#0f55f7]/20 dark:text-blue-300">Unified</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`rounded-xl border border-slate-100 bg-white/80 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900/60 ${
              i === stats.length - 1 ? 'col-span-2 sm:col-span-1' : ''
            }`}
          >
            <p className="text-lg font-extrabold leading-none" style={{ color: stat.color }}>{stat.value}</p>
            <p className="mt-1 truncate text-[9px] font-semibold uppercase tracking-wide text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
        {canAdd && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAdd()
            }}
            className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition-all hover:shadow-md hover:brightness-110"
          >
            <Zap className="h-3 w-3" /> Add Employee
          </button>
        )}
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 transition-colors group-hover:text-[#0f55f7]">
          Open Module <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </div>
    </motion.div>
  )
}

// KINI HRMS RBAC — which permission each module's quick-action button needs.
// Employees uses the existing `?addRole=employee` deep-link on EmployeeManagement;
// every other module receives a location-state intent that its page consumes once
// (useAddIntent) to auto-open the same Add form the header button opens.
const QUICK_ACTION_PERM = {
  employees: ['employees', 'add'],
  onboarding: ['onboarding', 'add'],
  attendance: ['attendance', 'export'],
  leave: ['leave', 'add'],
  shifts: ['shifts', 'assign'],
  holidays: ['holidays', 'add'],
  payroll: ['payroll', 'manage'],
  payslips: ['payslips', 'manage'],
  recruitment: ['recruitment', 'add'],
  performance: ['performance', 'add'],
  appraisal: ['appraisal', 'add'],
  assets: ['assets', 'add'],
  documents: ['documents', 'add'],
  exit: ['exit', 'add'],
  tickets: ['tickets', 'add'],
  reports: ['reports', 'export'],
  settings: ['settings', 'edit'],
}

export default function HRWorkspace() {
  const navigate = useNavigate()
  // KINI HRMS RBAC — the workspace grid and quick actions adapt to the HR level.
  const { can, canModule, permissionSource } = useHrPermissions()
  const visibleModules = HR_MODULES.filter((m) => !m.hidden && canModule(m.id))
  // Grid cards exclude the Dashboard (Overview group) — count must match the cards
  // actually rendered, so it stays correct for custom users without Dashboard.View.
  const gridModules = visibleModules.filter((m) => m.id !== 'dashboard')
  const pageSearch = usePageSearch()
  const { matches: pageMatches } = pageSearch
  const filteredModules = useMemo(
    () => gridModules.filter((m) => pageMatches({ label: m.label, group: m.group })),
    [gridModules, pageMatches],
  )

  // ENTERPRISE RBAC — each module's quick-action button follows its own
  // permission. Unauthorized actions are HIDDEN entirely (never disabled).
  // Clicking one opens the module AND its Add form (deep-linked intent).
  const runQuickAction = (module) => {
    if (module.id === 'employees') {
      navigate(`${module.path}?addRole=employee`)
      return
    }
    // HRSettings opens straight to its own management surface — no add intent.
    const intent = module.id === 'settings' ? undefined : { openAdd: module.id }
    navigate(module.path, { state: intent })
  }

  const quickActionCount = gridModules.filter((m) => {
    const [permModule, permAction] = QUICK_ACTION_PERM[m.id] || []
    return can(permModule, permAction)
  }).length

  const recordsInView = gridModules.reduce((sum, m) => sum + (RECORD_COUNTS[m.id]?.value ?? 0), 0)

  const renderQuickAction = (module) => {
    const [permModule, permAction] = QUICK_ACTION_PERM[module.id] || []
    if (!can(permModule, permAction)) return null
    return (
      <button
        onClick={(e) => {
          e.stopPropagation()
          runQuickAction(module)
        }}
        className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-bold transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
        style={{ color: module.color }}
        title={`${QUICK_ACTIONS[module.id]} — opens the ${module.label} module`}
      >
        <Zap className="h-3 w-3" />
        {QUICK_ACTIONS[module.id] || 'Quick Action'}
      </button>
    )
  }

  return (
    <HRPage
      moduleId="dashboard"
      title="HR Workspace"
      subtitle="Your central navigation hub — open any HR module from one place."
      icon={LayoutGrid}
      lastUpdated="Aug 4, 2026"
      search={{ value: pageSearch.search, onChange: pageSearch.setSearch, placeholder: 'Search modules…' }}
    >
      {/* Hero strip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-4 overflow-hidden rounded-2xl border border-[#0f55f7]/15 bg-white shadow-sm dark:border-[#0f55f7]/25 dark:bg-slate-900"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f55f7] to-[#06b6a8] text-white shadow-lg">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="text-base font-extrabold text-slate-900 dark:text-white">
                {gridModules.length} module{gridModules.length === 1 ? '' : 's'} · one workspace
              </p>
              <p className="text-xs text-slate-400">
                Open any HR module from one place — the UI adapts to your assigned permissions.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/employee/hr-dashboard')}
            className="inline-flex items-center gap-2 rounded-xl border border-[#0f55f7]/25 bg-white px-4 py-2 text-xs font-bold text-[#0f55f7] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-[#0f55f7]/40 dark:bg-slate-900"
          >
            Go to Executive Dashboard <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        {/* Workspace stats */}
        <div className="grid grid-cols-2 gap-px border-t border-[#0f55f7]/10 bg-[#0f55f7]/5 dark:border-[#0f55f7]/20 dark:bg-[#0f55f7]/10 sm:grid-cols-4">
          <div className="bg-white/70 px-4 py-3 dark:bg-slate-900/70">
            <p className="text-lg font-extrabold leading-none text-[#0f55f7]">{gridModules.length}</p>
            <p className="mt-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              <LayoutGrid className="h-3 w-3" /> Accessible modules
            </p>
          </div>
          <div className="bg-white/70 px-4 py-3 dark:bg-slate-900/70">
            <p className="text-lg font-extrabold leading-none text-[#06b6a8]">{quickActionCount}</p>
            <p className="mt-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              <Zap className="h-3 w-3" /> Quick actions you can run
            </p>
          </div>
          <div className="bg-white/70 px-4 py-3 dark:bg-slate-900/70">
            <p className="text-lg font-extrabold leading-none text-[#8b5cf6]">{recordsInView.toLocaleString()}</p>
            <p className="mt-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              <Activity className="h-3 w-3" /> Records in your modules
            </p>
          </div>
          <div className="bg-white/70 px-4 py-3 dark:bg-slate-900/70">
            <p className="text-lg font-extrabold leading-none text-slate-800 dark:text-white">
              {permissionSource === 'custom' ? 'Custom' : 'Role'}
            </p>
            <p className="mt-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              <ShieldCheck className="h-3 w-3" /> Access source
            </p>
          </div>
        </div>
      </motion.div>

      {/* Zero-permission empty state */}
      {gridModules.length === 0 && (
        <div className="flex min-h-[36vh] flex-col items-center justify-center rounded-2xl border border-slate-200/70 bg-white p-10 text-center shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
            <LayoutGrid className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">No modules assigned yet</h2>
          <p className="mt-1.5 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
            Your HR access does not include any module permissions. Ask the Organization Admin to grant module
            access to get started.
          </p>
        </div>
      )}

      {/* Module cards, grouped */}
      {gridModules.length > 0 && HR_GROUPS.filter((g) => g.key !== 'Overview').map((group) => (
        <section key={group.key} className="mb-5">
          <div className="mb-2.5 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0f55f7]" />
            <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">{group.label}</h3>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredModules.filter((m) => m.group === group.key).map((module, i) => {
              if (module.id === 'employees') {
                return (
                  <FeaturedEmployeeCard
                    key={module.id}
                    onOpen={() => navigate(module.path)}
                    onAdd={() => navigate(`${module.path}?addRole=employee`)}
                    canAdd={can('employees', 'add')}
                  />
                )
              }
              const count = RECORD_COUNTS[module.id]
              return (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -3 }}
                  className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0f55f7]/30 hover:shadow-xl hover:ring-2 hover:ring-[#0f55f7]/15 dark:border-slate-700/60 dark:bg-slate-900"
                  onClick={() => navigate(module.path)}
                  role="link"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') navigate(module.path)
                  }}
                  aria-label={`Open ${module.label}`}
                >
                  <span
                    className="absolute inset-x-0 top-0 h-1 opacity-60 transition-opacity duration-200 group-hover:opacity-100"
                    style={{ background: `linear-gradient(90deg, ${module.color}, ${module.color}88)` }}
                  />
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md transition-transform duration-200 group-hover:scale-110"
                      style={{ background: `linear-gradient(135deg, ${module.color}, ${module.color}bb)` }}
                    >
                      <module.icon className="h-5 w-5" />
                    </span>
                    <span
                      className="rounded-full bg-slate-50 px-2.5 py-1 text-center dark:bg-slate-800"
                    >
                      <span className="block text-sm font-extrabold leading-4 text-slate-800 dark:text-white">
                        {count?.value ?? '—'}
                      </span>
                      <span className="block max-w-[110px] truncate text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                        {count?.label ?? 'records'}
                      </span>
                    </span>
                  </div>
                  <h4 className="mt-3 text-sm font-extrabold text-slate-900 dark:text-white">{module.label}</h4>
                  <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-slate-400">{module.tagline}</p>

                  <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                    {renderQuickAction(module)}
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 transition-colors group-hover:text-[#0f55f7]">
                      Open Module <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </section>
      ))}
    </HRPage>
  )
}
