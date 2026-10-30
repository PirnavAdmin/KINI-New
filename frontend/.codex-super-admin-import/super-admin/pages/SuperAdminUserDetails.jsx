import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  Activity, ArrowLeft, ArrowUpRight, Building2, CalendarDays, Edit3, KeyRound,
  Mail, MapPin, Phone, Power, ShieldCheck, UserCheck, UserX, Users,
} from 'lucide-react'
import PageHeader from '@shared/components/PageHeader'
import StatusBadge from '@shared/components/StatusBadge'
import Modal from '@shared/components/Modal'
import { Button, Select } from '@shared/components/FormElements'
import { PLATFORM_AUDIT_LOGS, PLATFORM_USERS } from '@shared/data/platformMockData'
import { ROUTES } from '@shared/constants/routeConstants'

// =================================
// TODO: API Integration
// GET /api/v1/super-admin/users/:id
// PATCH /api/v1/super-admin/users/:id/access
// =================================

const ROLE_PERMISSIONS = {
  'Super Admin': ['Organizations', 'Plans & subscriptions', 'Global reports', 'Security alerts', 'System logs', 'Feature configuration'],
  'Organization Admin': ['Students & mentors', 'Courses & batches', 'Attendance & progress', 'Certificates', 'Institute reports', 'Organization settings'],
  HR: ['Employees', 'Mentors', 'Departments', 'Leave management', 'Recruitment', 'Performance records'],
  Mentor: ['Assigned courses', 'Assigned batches', 'Assigned students', 'Attendance', 'Assignments', 'Assessments & feedback'],
  Tutor: ['Assigned courses', 'Batch scheduling', 'Student queries', 'Assignment review'],
}

const ROLE_STYLES = {
  'Super Admin': 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/20',
  'Organization Admin': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20',
  HR: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:border-teal-500/20',
  Mentor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20',
  Tutor: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20',
}

const AVATAR_GRADIENT = 'bg-gradient-to-br from-[#0877B9] via-[#278F8D] to-[#58A94B]'

const initialsOf = (name = '') =>
  String(name)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatTimestamp = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

const ACCESS_LEVELS = ['Full Access', 'Manage', 'Standard', 'Restricted', 'View Only']

function RoleBadge({ role }) {
  return (
    <span className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-bold ${ROLE_STYLES[role] || ROLE_STYLES['Organization Admin']}`}>
      {role}
    </span>
  )
}

function Field({ label, value, icon: Icon, mono = false }) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </dt>
      <dd className={`mt-1 truncate text-sm font-semibold text-slate-800 dark:text-slate-100 ${mono ? 'font-mono text-[#0f55f7] dark:text-[#3b82f6]' : ''}`} title={value}>
        {value}
      </dd>
    </div>
  )
}

export default function SuperAdminUserDetails() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const passedUser = location.state?.user
  const user = useMemo(() => {
    if (passedUser) return passedUser
    return PLATFORM_USERS.find((item) => String(item.id) === String(userId)) || null
    // location.state is read once per route — intentional.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({ role: 'Organization Admin', accessLevel: 'Standard', status: 'active' })
  const [localUser, setLocalUser] = useState(() => (user ? { ...user } : null))
  const displayUser = localUser || user

  const openEdit = () => {
    if (!displayUser) return
    setEditForm({ role: displayUser.role, accessLevel: displayUser.accessLevel, status: displayUser.status })
    setEditOpen(true)
  }

  const saveEdit = () => {
    if (!displayUser) return
    setLocalUser((currentValue) => ({ ...(currentValue || displayUser), ...editForm }))
    toast.success(`${displayUser.name}'s access updated`)
    setEditOpen(false)
  }

  const toggleStatus = () => {
    if (!displayUser) return
    const nextStatus = displayUser.status === 'active' ? 'inactive' : 'active'
    setLocalUser((currentValue) => ({ ...(currentValue || displayUser), status: nextStatus }))
    toast.success(nextStatus === 'active' ? `${displayUser.name}'s access activated` : `${displayUser.name}'s access deactivated`)
  }

  // Recent activity — audit entries by this user, falling back to org-wide events.
  const recentActivity = (() => {
    if (!displayUser) return []
    const byUser = PLATFORM_AUDIT_LOGS.filter(
      (entry) => entry.user === displayUser.name || (displayUser.email && entry.target.toLowerCase().includes(displayUser.email.split('@')[0].toLowerCase())),
    )
    if (byUser.length) return byUser.slice(0, 6)
    return PLATFORM_AUDIT_LOGS.filter((entry) => entry.target === displayUser.organization).slice(0, 6)
  })()

  if (!displayUser) {
    return (
      <div className="flex w-full items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-500/10">
            <Users className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">User Not Found</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            The user you&apos;re looking for could not be found.
          </p>
          <button
            type="button"
            onClick={() => navigate(ROUTES.SUPER_ADMIN.USERS)}
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-[#0f55f7] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0b46d6]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Users & Access
          </button>
        </motion.div>
      </div>
    )
  }

  const status = displayUser.status
  const isActive = status === 'active'

  return (
    <div className="w-full px-4 py-3 sm:px-6 lg:px-6">
      <PageHeader
        breadcrumb={['Super Admin', 'Users & Access', 'User Details']}
        title={displayUser.name}
        subtitle={`${displayUser.role} · ${displayUser.organization}`}
        icon={Users}
        titleClassName="!text-2xl !leading-8"
        containerClassName="!mb-4"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" icon={Edit3} onClick={openEdit}>Edit Access</Button>
            {isActive ? (
              <Button variant="danger" size="sm" icon={UserX} onClick={toggleStatus}>Deactivate</Button>
            ) : (
              <Button size="sm" icon={UserCheck} onClick={toggleStatus}>Activate</Button>
            )}
          </div>
        }
      />

      {/* Profile summary */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="h-1 w-full bg-gradient-to-r from-[#0877B9] via-[#278F8D] to-[#58A94B]" />
        <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3.5">
            <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-lg font-extrabold text-white shadow-md shadow-[#278F8D]/20 ${AVATAR_GRADIENT}`}>
              {initialsOf(displayUser.name)}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-bold tracking-tight text-slate-900 dark:text-white">{displayUser.name}</h1>
                <RoleBadge role={displayUser.role} />
                <StatusBadge status={status} label={status === 'active' ? 'Active' : status === 'pending' ? 'Pending' : undefined} />
              </div>
              <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-slate-400" />{displayUser.email}</span>
                <span className="inline-flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-slate-400" />{displayUser.organization}</span>
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400" />{displayUser.location || '—'}</span>
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={ArrowUpRight}
              disabled={!displayUser.organizationId}
              onClick={() => navigate(ROUTES.SUPER_ADMIN.ORGANIZATION_DETAILS.replace(':organizationId', displayUser.organizationId))}
            >
              View Organization
            </Button>
          </div>
        </div>
      </motion.section>

      {/* KPI strip */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        {[
          { icon: KeyRound, color: '#0f55f7', label: 'Access Level', value: displayUser.accessLevel },
          { icon: CalendarDays, color: '#06b6a8', label: 'Member Since', value: formatDate(displayUser.createdDate) },
          { icon: Activity, color: '#8b5cf6', label: 'Last Login', value: displayUser.lastLogin },
          { icon: ShieldCheck, color: '#f59e0b', label: 'Role', value: displayUser.role },
        ].map(({ icon: Icon, color, label, value }) => (
          <div key={label} className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: color }} />
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg" style={{ background: `${color}14` }}>
                <Icon className="h-[18px] w-[18px]" style={{ color }} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold leading-none tracking-tight text-slate-900 dark:text-white">{value}</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Access + Activity */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Access details */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-5"
        >
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 dark:bg-blue-500/10">
              <KeyRound className="h-4 w-4 text-[#0f55f7]" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-white">Access Details</h3>
              <p className="text-xs text-slate-400">Role permissions and session information</p>
            </div>
          </div>

          <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <Field icon={ShieldCheck} label="Role" value={displayUser.role} />
            <Field icon={KeyRound} label="Access Level" value={displayUser.accessLevel} />
            <Field icon={Mail} label="Email" value={displayUser.email} />
            <Field icon={Phone} label="Phone" value={displayUser.phone || '—'} />
            <Field icon={MapPin} label="Location" value={displayUser.location || '—'} />
            <Field icon={CalendarDays} label="Created" value={formatDate(displayUser.createdDate)} />
          </dl>

          <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Role permissions</p>
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(ROLE_PERMISSIONS[displayUser.role] || ROLE_PERMISSIONS['Organization Admin']).map((permission) => (
                <li key={permission} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  {permission}
                </li>
              ))}
            </ul>
          </div>
        </motion.section>

        {/* Recent activity */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-5"
        >
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-violet-50 dark:bg-violet-500/10">
              <Activity className="h-4 w-4 text-[#8b5cf6]" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-white">Recent Activity</h3>
              <p className="text-xs text-slate-400">Latest audit events involving this user</p>
            </div>
          </div>

          {recentActivity.length ? (
            <ol className="mt-3 space-y-0">
              {recentActivity.map((entry) => (
                <li key={entry.id} className="flex items-start gap-3 border-b border-slate-100 py-3 last:border-b-0 dark:border-slate-800">
                  <span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                    entry.status === 'failed'
                      ? 'bg-red-50 text-red-500 dark:bg-red-500/10'
                      : 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10'
                  }`}>
                    {entry.status === 'failed' ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{entry.action}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{entry.module} · {entry.target}</p>
                  </div>
                  <time className="shrink-0 text-[11px] font-medium text-slate-400">{formatTimestamp(entry.timestamp)}</time>
                </li>
              ))}
            </ol>
          ) : (
            <div className="mt-3 rounded-lg border border-dashed border-slate-200 bg-slate-50/70 px-4 py-8 text-center dark:border-slate-700 dark:bg-slate-800/40">
              <Activity className="mx-auto h-6 w-6 text-slate-300" />
              <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">No recent activity for this user.</p>
            </div>
          )}

          <button
            type="button"
            onClick={() => navigate(ROUTES.SUPER_ADMIN.AUDIT_LOGS)}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0f55f7] transition hover:underline"
          >
            View full audit log
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </motion.section>
      </div>

      {/* Edit access modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit User Access"
        description="Update the role, access level and status for this user."
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={saveEdit} icon={KeyRound}>Save Access</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Select
            label="Role"
            icon={ShieldCheck}
            value={editForm.role}
            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
            options={[
              { value: 'Super Admin', label: 'Super Admin' },
              { value: 'Organization Admin', label: 'Organization Admin' },
              { value: 'HR', label: 'HR' },
              { value: 'Mentor', label: 'Mentor' },
              { value: 'Tutor', label: 'Tutor' },
            ]}
          />
          <Select
            label="Access Level"
            icon={KeyRound}
            value={editForm.accessLevel}
            onChange={(e) => setEditForm({ ...editForm, accessLevel: e.target.value })}
            options={ACCESS_LEVELS.map((level) => ({ value: level, label: level }))}
          />
          <Select
            label="Status"
            icon={Power}
            value={editForm.status}
            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'suspended', label: 'Suspended' },
              { value: 'pending', label: 'Pending' },
            ]}
          />
        </div>
      </Modal>
    </div>
  )
}
