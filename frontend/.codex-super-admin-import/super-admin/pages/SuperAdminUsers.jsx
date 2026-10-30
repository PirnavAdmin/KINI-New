import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Building2, Edit3, Eye, KeyRound, Power, ShieldCheck, UserCheck, UserX, Users,
} from 'lucide-react'
import PageHeader from '@shared/components/PageHeader'
import DataTable from '@shared/components/DataTable'
import StatusBadge from '@shared/components/StatusBadge'
import { KPICard } from '@shared/components/SharedComponents'
import Modal from '@shared/components/Modal'
import { Button, Select } from '@shared/components/FormElements'
import { PLATFORM_USERS } from '@shared/data/platformMockData'
import { ROUTES } from '@shared/constants/routeConstants'

// =================================
// TODO: API Integration
// GET /api/v1/super-admin/users
// PATCH /api/v1/super-admin/users/:id/access
// PATCH /api/v1/super-admin/users/:id/status
// =================================

const ROLE_FILTERS = [
  { value: '', label: 'All Roles' },
  { value: 'Super Admin', label: 'Super Admin' },
  { value: 'Organization Admin', label: 'Organization Admin' },
  { value: 'HR', label: 'HR' },
  { value: 'Mentor', label: 'Mentor' },
  { value: 'Tutor', label: 'Tutor' },
]

const STATUS_FILTERS = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'pending', label: 'Pending' },
]

const ACCESS_LEVELS = ['Full Access', 'Manage', 'Standard', 'Restricted', 'View Only']

const ROLE_STYLES = {
  'Super Admin': 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/20',
  'Organization Admin': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20',
  HR: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:border-teal-500/20',
  Mentor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20',
  Tutor: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20',
}

function RoleBadge({ role }) {
  const classes = ROLE_STYLES[role] || ROLE_STYLES['Organization Admin']
  return (
    <span className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-bold ${classes}`}>
      {role}
    </span>
  )
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

export default function SuperAdminUsers() {
  const navigate = useNavigate()
  const [users, setUsers] = useState(() => PLATFORM_USERS.map((item) => ({ ...item })))
  const [roleFilter, setRoleFilter] = useState('')
  const [orgFilter, setOrgFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [editUser, setEditUser] = useState(null)
  const [editForm, setEditForm] = useState({ role: 'Organization Admin', accessLevel: 'Standard', status: 'active' })

  const organizationOptions = useMemo(() => {
    const orgs = [...new Set(users.map((user) => user.organization).filter(Boolean))]
    return [{ value: '', label: 'All Organizations' }, ...orgs.map((org) => ({ value: org, label: org }))]
  }, [users])

  const openEditAccess = (user) => {
    setEditUser(user)
    setEditForm({ role: user.role, accessLevel: user.accessLevel, status: user.status })
  }

  const saveEditAccess = () => {
    if (!editUser) return
    setUsers((current) =>
      current.map((item) =>
        item.id === editUser.id
          ? { ...item, role: editForm.role, accessLevel: editForm.accessLevel, status: editForm.status }
          : item,
      ),
    )
    toast.success(`${editUser.name}'s access updated`)
    setEditUser(null)
  }

  const toggleUserStatus = (user) => {
    const nextStatus = user.status === 'active' ? 'inactive' : 'active'
    setUsers((current) =>
      current.map((item) => (item.id === user.id ? { ...item, status: nextStatus } : item)),
    )
    toast.success(nextStatus === 'active' ? `${user.name}'s access activated` : `${user.name}'s access deactivated`)
  }

  const navigateToUserDetails = (user) => {
    navigate(
      ROUTES.SUPER_ADMIN.USER_DETAILS.replace(':userId', String(user.id)),
      { state: { user } },
    )
  }

  const filtered = useMemo(() => {
    return users.filter((user) => {
      const matchRole = !roleFilter || user.role === roleFilter
      const matchOrg = !orgFilter || user.organization === orgFilter
      const matchStatus = !statusFilter || user.status === statusFilter
      return matchRole && matchOrg && matchStatus
    })
  }, [users, roleFilter, orgFilter, statusFilter])

  const kpis = useMemo(() => ({
    total: users.length,
    active: users.filter((item) => item.status === 'active').length,
    restricted: users.filter((item) => item.status === 'suspended' || item.status === 'inactive').length,
    admins: users.filter((item) => item.role === 'Organization Admin').length,
  }), [users])

  const columns = [
    {
      header: 'User',
      accessor: 'name',
      width: '20%',
      searchValue: (row) => `${row.name} ${row.email}`,
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[11px] font-extrabold text-white ${AVATAR_GRADIENT}`}>
            {initialsOf(row.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{row.name}</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Organization',
      accessor: 'organization',
      width: '16%',
      render: (row) => (
        <div className="flex min-w-0 items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="truncate text-sm text-slate-600 dark:text-slate-300">{row.organization}</span>
        </div>
      ),
    },
    {
      header: 'Role',
      accessor: 'role',
      width: '15%',
      render: (row) => <RoleBadge role={row.role} />,
    },
    {
      header: 'Access Level',
      accessor: 'accessLevel',
      width: '12%',
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <KeyRound className="h-3.5 w-3.5 text-slate-400" />
          {row.accessLevel}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      width: '10%',
      render: (row) => <StatusBadge status={row.status} label={row.status === 'active' ? 'Active' : row.status === 'pending' ? 'Pending' : undefined} />,
    },
    {
      header: 'Last Login',
      accessor: 'lastLogin',
      width: '12%',
      render: (row) => <span className="text-sm text-slate-500 dark:text-slate-400">{row.lastLogin}</span>,
    },
    {
      header: 'Created',
      accessor: 'createdDate',
      width: '9%',
      render: (row) => <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(row.createdDate)}</span>,
    },
    {
      header: 'Actions',
      accessor: 'actions',
      sortable: false,
      width: '6%',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); navigateToUserDetails(row) }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 transition-colors hover:bg-blue-600 dark:border-blue-500/30 dark:bg-blue-500/10"
            aria-label="View user"
            title="View user details"
          >
            <Eye className="h-3.5 w-3.5 text-blue-600 group-hover/action:text-white" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); openEditAccess(row) }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            aria-label="Edit access"
            title="Edit access"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); toggleUserStatus(row) }}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
              row.status === 'active'
                ? 'border-red-200 bg-red-50 hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10'
                : 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10'
            }`}
            aria-label={row.status === 'active' ? 'Deactivate user access' : 'Activate user access'}
            title={row.status === 'active' ? 'Deactivate access' : 'Activate access'}
          >
            {row.status === 'active'
              ? <UserX className="h-3.5 w-3.5 text-red-500" />
              : <UserCheck className="h-3.5 w-3.5 text-emerald-600" />}
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="w-full px-4 py-3 sm:px-6 lg:px-7">
      {/* KPIs */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KPICard dense icon={Users} label="Total Users" value={kpis.total} color="#0f55f7" delay={0} />
        <KPICard dense icon={UserCheck} label="Active Users" value={kpis.active} color="#06b6a8" delay={1} />
        <KPICard dense icon={UserX} label="Restricted / Inactive" value={kpis.restricted} color="#f59e0b" delay={2} />
        <KPICard dense icon={ShieldCheck} label="Organization Admins" value={kpis.admins} color="#8b5cf6" delay={3} />
      </div>

      <section className="organization-directory-workspace overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_12px_38px_-28px_rgba(15,23,42,.35)]">
        <div className="border-b border-slate-200 bg-white px-5 pt-5 sm:px-6">
          <PageHeader
            showBreadcrumb={false}
            titleClassName="!text-2xl !leading-8"
            containerClassName="!mb-5"
            title="Users & Access"
            subtitle={`${kpis.active} active users across ${new Set(users.map((u) => u.organization).filter(Boolean)).size} organizations`}
            icon={Users}
            actions={
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                <ShieldCheck className="h-4 w-4 text-[#0f55f7]" />
                Platform-wide access control
              </div>
            }
          />
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          pageSize={8}
          searchPlaceholder="Search users by name, email, organization or role..."
          emptyTitle="No users found"
          emptyDescription="Try adjusting your filters to find the right user."
          emptyIcon={Users}
          onRowClick={navigateToUserDetails}
          fitToContainer
          tableStyle={{ tableLayout: 'fixed' }}
          tableClassName="organization-directory-table"
          toolbarClassName="organization-directory-toolbar"
          headerCellClassName="organization-directory-header-cell"
          cellClassName="organization-directory-cell"
          rowClassName="organization-directory-row"
          filters={
            <div className="flex flex-wrap gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30"
              >
                {ROLE_FILTERS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              <select
                value={orgFilter}
                onChange={(e) => setOrgFilter(e.target.value)}
                className="px-3 py-2.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30"
              >
                {organizationOptions.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30"
              >
                {STATUS_FILTERS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
          }
        />
      </section>

      {/* Edit Access modal */}
      <Modal
        open={Boolean(editUser)}
        onClose={() => setEditUser(null)}
        title={`Edit Access — ${editUser?.name || ''}`}
        description="Update the role, access level and status for this user."
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button onClick={saveEditAccess} icon={KeyRound}>Save Access</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-slate-800/40">
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg text-xs font-extrabold text-white ${AVATAR_GRADIENT}`}>
              {initialsOf(editUser?.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{editUser?.name}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{editUser?.email}</p>
            </div>
          </div>
          <Select
            label="Role"
            icon={ShieldCheck}
            value={editForm.role}
            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
            options={ROLE_FILTERS.filter((f) => f.value)}
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
