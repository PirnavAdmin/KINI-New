import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, Building2, Users2, GraduationCap, ClipboardList, User, ArrowRight, Sparkles } from 'lucide-react'
import { useAuth } from '@shared/hooks/useAuth'
import { ROLES } from '@shared/constants/roles'
import { ROUTES } from '@shared/constants/routeConstants'
import { resolvePermissions } from '@shared/constants/permissions'

// Demo Mode is meant for controlled presentations, not public production traffic —
// it grants full role access with zero credentials. Visible in dev by default;
// set VITE_ENABLE_DEMO_MODE=true to opt in for a specific presentation build.
const DEMO_MODE_ENABLED = import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO_MODE === 'true'

const DEMO_ROLES = [
  {
    key: 'super-admin',
    label: 'Super Admin',
    description: 'Full platform access across every organization.',
    icon: ShieldCheck,
    color: '#0f55f7',
    role: ROLES.SUPER_ADMIN,
    department: null,
    dashboard: ROUTES.SUPER_ADMIN.DASHBOARD,
  },
  {
    key: 'org-admin',
    label: 'Organization Admin',
    description: 'Courses, employees, branches, and org-wide settings.',
    icon: Building2,
    color: '#8b5cf6',
    role: ROLES.ORG_ADMIN,
    department: null,
    dashboard: ROUTES.ORG_ADMIN.DASHBOARD,
  },
  {
    key: 'hr',
    label: 'HR',
    description: 'Employee lifecycle, attendance, and recruitment.',
    icon: Users2,
    color: '#0f55f7',
    role: ROLES.EMPLOYEE,
    department: 'HR',
    dashboard: ROUTES.EMPLOYEE.HR_DASHBOARD,
  },
  {
    key: 'mentor',
    label: 'Mentor',
    description: 'Courses, batches, and student assessments.',
    icon: GraduationCap,
    color: '#06b6a8',
    role: ROLES.MENTOR,
    department: null,
    dashboard: ROUTES.MENTOR.DASHBOARD,
  },
  {
    key: 'operations',
    label: 'Operations',
    description: 'Admissions, enrollments, and student support.',
    icon: ClipboardList,
    color: '#F59E0B',
    role: ROLES.EMPLOYEE,
    department: 'Operations',
    dashboard: ROUTES.EMPLOYEE.OPERATIONS_DASHBOARD,
  },
  {
    key: 'student',
    label: 'Student',
    description: 'Courses, assessments, and learning paths.',
    icon: User,
    color: '#EC4899',
    role: ROLES.STUDENT,
    department: null,
    dashboard: ROUTES.STUDENT.DASHBOARD,
  },
]

export default function DemoLogin() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [pendingKey, setPendingKey] = useState(null)

  const handleSelect = (config) => {
    setPendingKey(config.key)
    const permissions = resolvePermissions(config.role, config.department)

    // Mark the local-only session before mounting the dashboard. Dashboard
    // requests can begin immediately, and their 401 responses must never be
    // allowed to invalidate a presentation session that has no backend token.
    localStorage.setItem('isDemo', 'true')

    const demoUser = {
      id: `demo-${config.key}`,
      name: `Demo ${config.label}`,
      email: `${config.key}@demo.kinieduhub.io`,
      role: config.role,
      ...(config.department ? { department: config.department } : {}),
      organizationId: 'demo-org-001',
      isDemo: true,
      ...(config.role === ROLES.MENTOR ? { mentorId: 201 } : {}),
    }

    // Reuses the exact same session-persistence path a real login uses (see AuthContext.jsx),
    // so ProtectedRoute/RoleBasedRoute/usePermission/Sidebar all behave identically for a demo session.
    login({
      token: 'demo-token',
      user: demoUser,
      response: { role: config.role, organizationId: 'demo-org-001', ...(config.role === ROLES.MENTOR ? { mentorId: 201 } : {}) },
    })
    // Informational only — hasPermission() always recomputes live via resolvePermissions().
    // Stored so the granted permission set is inspectable (devtools) without decoding the user JSON.
    localStorage.setItem('demo_permissions', JSON.stringify(permissions))

    queueMicrotask(() => {
      navigate(config.dashboard, { replace: true })
    })
  }

  if (!DEMO_MODE_ENABLED) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">
        <div className="max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-card dark:border-slate-700 dark:bg-slate-900">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Demo Mode is disabled</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            This build doesn&apos;t have Demo Mode enabled. Set <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-slate-800">VITE_ENABLE_DEMO_MODE=true</code> to turn it on for a presentation build.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-[#f5f9ff] via-white to-[#e8f7ff] px-4 py-6 dark:bg-[#0F172A] dark:bg-none sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6 text-center sm:mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
            <Sparkles className="h-3.5 w-3.5" />
            Demo Mode — not connected to the real backend
          </span>
          <h1 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Pick a role to explore</h1>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400 sm:text-base">
            Each card starts a temporary local session for that role — no credentials, no real API calls.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {DEMO_ROLES.map((config, index) => {
            const Icon = config.icon
            const isPending = pendingKey === config.key
            return (
              <motion.button
                key={config.key}
                type="button"
                onClick={() => handleSelect(config)}
                disabled={pendingKey !== null}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -2 }}
                className="group relative flex min-h-0 flex-col items-start gap-2.5 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-card transition-shadow duration-200 hover:shadow-card-hover disabled:cursor-wait disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 sm:p-6 lg:p-5"
              >
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${config.color}14`, color: config.color }}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">{config.label}</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{config.description}</p>
                </div>
                <span className="mt-auto inline-flex items-center gap-1 pt-1 text-sm font-semibold" style={{ color: config.color }}>
                  {isPending ? 'Signing in…' : 'Enter as demo'}
                  {!isPending && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
                </span>
              </motion.button>
            )
          })}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Need the real login? <a href="/login" className="font-semibold text-[#0f55f7] hover:underline">Go to sign in</a>
        </p>
      </div>
    </div>
  )
}
