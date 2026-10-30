import { useEffect, useState } from 'react'
import {
  Settings, Clock4, ClipboardCheck, ShieldCheck, Bell, History, Workflow, UserCog, Save, RotateCcw,
  Pencil, Trash2, LockKeyhole,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@shared/hooks/useAuth'
import { getApiErrorMessage } from '@shared/services/apiServices'
import { employeeService } from '@shared/services/employeeService'
import { permissionApi } from '@shared/services/platformModulesApi'
import useHrPermissions from '@features/hr/hooks/useHrPermissions'
import Button from '@shared/components/Button'
import DataTable from '@shared/components/DataTable'
import HRPage from '@features/hr/components/HRPage'
import HRQuickActions from '@features/hr/components/HRQuickActions'
import HRDrawer from '@features/hr/components/HRDrawer'
import HrUserForm from '@features/hr/components/HrUserForm'
import { HRAvatar, HRSection, HRStatusBadge } from '@features/hr/components/hrPrimitives'
import { normalizeRole, ROLES, USER_ROLES, USER_ROLE_LABELS, HR_ROLE_LABELS } from '@shared/constants/roles'
import { useHrUsers, emptyHrUser, findHrUserByEmail } from '@features/hr/services/hrUserStore'
import { countGranted, countGrantedModules, isFullAccess } from '@features/hr/constants/hrPermissionMatrix'
import {
  HR_ROLES, HR_AUDIT_LOGS, HR_APPROVAL_MATRIX,
} from '@features/hr/data/hrWorkforce'

const normalizeValue = (value) => String(value ?? '').trim().toLowerCase()

const toHrUserRecord = (employee) => ({
  id: employee?.employeeId ?? employee?.id ?? employee?.userId ?? '',
  name: employee?.firstName ?? employee?.name ?? employee?.fullName ?? '',
  lastName: employee?.lastName ?? '',
  email: employee?.email ?? employee?.Email ?? '',
  mobile: employee?.phone ?? employee?.mobile ?? employee?.Mobile ?? '',
  designation: employee?.designation ?? employee?.jobTitle ?? employee?.title ?? '',
  employeeType: employee?.employeeType ?? employee?.employmentType ?? 'Full-Time',
  status: normalizeValue(employee?.status) === 'inactive' ? 'inactive' : 'active',
  role: 'hr',
  hrRole: employee?.hrRole ?? employee?.hrRoleId ?? employee?.employeeRole ?? 'HR_EXECUTIVE',
  permissions: employee?.permissions ?? {},
})

const isHrEmployee = (employee) => {
  const role = normalizeValue(employee?.role ?? employee?.Role ?? employee?.userRole)
  const department = normalizeValue(employee?.department ?? employee?.departmentName)
  return role === 'hr'
    || role === 'human resources'
    || department === 'hr'
    || department === 'human resources'
    || Boolean(employee?.hrRole || employee?.hrRoleId)
}

const hasPermissions = (permissions) => Object.values(permissions || {}).some(
  (granted) => Array.isArray(granted) && granted.length > 0,
)

function SettingToggle({ checked, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f55f7]/40 disabled:cursor-not-allowed disabled:opacity-50 ${checked ? 'bg-[#0f55f7]' : 'bg-slate-300 dark:bg-slate-600'}`}
    >
      <span className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )
}

export default function HRSettings() {
  // KINI HRMS RBAC — saving settings and managing HR users requires the edit permission.
  const { role, user } = useAuth()
  const { can } = useHrPermissions()
  const resolvedRole = normalizeRole(user?.userRole ?? user?.role ?? role)
  const isOrganizationAdmin = role === ROLES.ORG_ADMIN || resolvedRole === ROLES.ORG_ADMIN
  const canSettings = (module, action) => isOrganizationAdmin || can(module, action)
  const canEditSettings = canSettings('settings', 'edit')
  const canManageHrUsers = canEditSettings && canSettings('permissions', 'edit')
  const canViewPermissions = canSettings('permissions', 'view')
  // ── ENTERPRISE RBAC — HR users with custom permission profiles ────────────
  const { users: hrUsers, createUser, updateUser, replaceUsers, deleteUser } = useHrUsers()
  const [hrDrawer, setHrDrawer] = useState(null) // null | 'edit'
  const [hrDraft, setHrDraft] = useState(() => emptyHrUser())
  const [editingUser, setEditingUser] = useState(null)
  const [activeSection, setActiveSection] = useState('policies')
  const defaultPolicySettings = {
    workHours: 9,
    graceMinutes: 15,
    wfhDays: 2,
    casualLeave: 12,
    sickLeave: 10,
    privilegeLeave: 15,
    carryForward: true,
    managerApproval: true,
    hrApprovalOverThreeDays: true,
    leaveNotifications: true,
  }
  const [policySettings, setPolicySettings] = useState(defaultPolicySettings)
  const [savedPolicySettings, setSavedPolicySettings] = useState(defaultPolicySettings)
  const settingsDirty = JSON.stringify(policySettings) !== JSON.stringify(savedPolicySettings)

  useEffect(() => {
    if (activeSection !== 'access' || !canViewPermissions) return undefined
    let active = true

    Promise.all([
      employeeService.getEmployees({ pageNumber: 1, pageSize: 1000 }),
      // Load the backend role catalog as part of the same organization scope.
      // HR accounts still use the fixed HR platform role in this form.
      employeeService.getRoles().catch(() => null),
    ])
      .then(([response]) => {
        if (!active) return
        const employees = Array.isArray(response?.data) ? response.data : []
        replaceUsers(employees.filter(isHrEmployee).map((employee) => {
          const fetched = toHrUserRecord(employee)
          const existing = findHrUserByEmail(fetched.email)
          return existing
            ? { ...fetched, id: existing.id, hrRole: existing.hrRole, permissions: existing.permissions }
            : fetched
        }))
      })
      .catch(() => {
        // Keep locally cached HR users visible when the API is unavailable.
      })
      .finally(() => {
        active = false
      })

    return () => {
      active = false
    }
  }, [activeSection, canViewPermissions, replaceUsers])

  const updatePolicy = (key, value) => setPolicySettings((current) => ({ ...current, [key]: value }))
  const savePolicySettings = () => {
    setSavedPolicySettings(policySettings)
    toast.success('HR settings saved successfully')
  }
  const resetPolicySettings = () => {
    setPolicySettings(savedPolicySettings)
    toast.success('Unsaved changes discarded')
  }

  const openEditHr = (user) => {
    setEditingUser(user)
    setHrDraft({ ...user, password: '', confirmPassword: '' })
    setHrDrawer('edit')
  }

  const saveHrUser = async () => {
    if (!String(hrDraft.name || '').trim() || !String(hrDraft.lastName || '').trim() || !String(hrDraft.email || '').trim()) {
      toast.error('Name, Last Name and email are required to create an HR user')
      return
    }
    // ENTERPRISE RBAC — HR users must carry an HR Role tier; non-HR user roles
    // (e.g. Organization Admin) must not (the form clears it automatically).
    if (hrDraft.role === USER_ROLES.HR && !hrDraft.hrRole) {
      toast.error('HR Role is required for HR users')
      return
    }
    if (hrDrawer === 'create' && Date.now() < 0) {
      const nameParts = String(hrDraft.name || '').trim().split(/\s+/).filter(Boolean)
      let savedLocally = false
      try {
        const persistedEmployee = await employeeService.createEmployee({
          firstName: nameParts[0] || 'HR User',
          lastName: String(hrDraft.lastName || '').trim(),
          email: String(hrDraft.email || '').trim().toLowerCase(),
          phone: String(hrDraft.mobile || '').trim(),
          role: 'HR',
          hrRole: hrDraft.hrRole || 'HR_EXECUTIVE',
          employeeType: 'Full-Time',
          status: hrDraft.status === 'inactive' ? 'Inactive' : 'Active',
          createLogin: true,
          sendCredentialsEmail: true,
        })
        const employeeId = persistedEmployee?.employeeId || persistedEmployee?.id || persistedEmployee?.userId
        if (employeeId && hasPermissions(hrDraft.permissions)) {
          try {
            await permissionApi.updateEmployee(employeeId, { permissions: hrDraft.permissions })
          } catch (permissionError) {
            toast.warning(getApiErrorMessage(permissionError, 'HR user created, but permissions could not be synced.'))
          }
        }
        createUser({
          ...hrDraft,
          id: employeeId || hrDraft.id,
        })
      } catch (error) {
        const isNetworkFailure = !error?.response
          || ['ERR_NETWORK', 'ECONNABORTED', 'ETIMEDOUT'].includes(error?.code)
        const allowLocalFallback = import.meta.env.DEV
          && import.meta.env.VITE_ALLOW_LOCAL_HR_USER_FALLBACK === 'true'

        if (!isNetworkFailure || !allowLocalFallback) {
          toast.error(getApiErrorMessage(error, 'Unable to create HR user or send credentials email.'))
          return
        }

        // Keep local development usable when the optional backend tunnel is down.
        // This does not claim that credentials were created or emailed remotely.
        createUser(hrDraft)
        savedLocally = true
      }
      const granted = countGranted(hrDraft.permissions)
      if (savedLocally) {
        toast.warning(`HR user ${hrDraft.name} saved locally for development. Backend credentials email was not sent.`)
      } else {
        toast.success(`HR user ${hrDraft.name} created · ${granted} permission${granted === 1 ? '' : 's'} granted`)
      }
    } else if (editingUser) {
      const remoteId = editingUser.id && !String(editingUser.id).startsWith('HRU-')
        ? editingUser.id
        : null
      if (remoteId) {
        try {
          await employeeService.updateEmployee(remoteId, {
            firstName: hrDraft.name,
            lastName: hrDraft.lastName,
            email: hrDraft.email,
            phone: hrDraft.mobile,
            role: 'HR',
            hrRole: hrDraft.hrRole,
            employeeType: hrDraft.employeeType || 'Full-Time',
            status: hrDraft.status === 'inactive' ? 'Inactive' : 'Active',
          })
          await permissionApi.updateEmployee(remoteId, { permissions: hrDraft.permissions })
        } catch (error) {
          toast.error(getApiErrorMessage(error, 'Unable to update HR user or permissions.'))
          return
        }
      }
      updateUser({ ...hrDraft, id: editingUser.id, createdAt: editingUser.createdAt })
      toast.success(`${hrDraft.name} updated successfully`)
    }
    setHrDrawer(null)
  }

  const deleteHrUser = async (user) => {
    const remoteId = user.id && !String(user.id).startsWith('HRU-') ? user.id : null
    if (remoteId) {
      try {
        await employeeService.deleteEmployee(remoteId)
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Unable to delete HR user.'))
        return
      }
    }
    deleteUser(user.id)
    toast.success(`${user.name} removed from HR users`)
  }

  const hrUserColumns = [
    {
      accessor: 'name', header: 'User', sortable: true, minWidth: 220,
      render: (row) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <HRAvatar name={row.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">{row.name}</p>
            <p className="truncate text-[11px] text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessor: 'mobile', header: 'Mobile', sortable: true,
      render: (row) => <span className="text-xs text-slate-600 dark:text-slate-300">{row.mobile || '—'}</span>,
    },
    {
      // ENTERPRISE RBAC — canonical User Role + HR Role tiers, displayed as a
      // compact pair (designation above stays untouched — they are different
      // concepts: job title vs platform role vs HR permission tier).
      accessor: 'role', header: 'User Role / HR Role', sortable: true, minWidth: 190,
      render: (row) => (
        <div className="flex flex-wrap items-center gap-1">
          <span className="rounded-full bg-[#0f55f7]/10 px-2 py-0.5 text-[10px] font-bold text-[#0f55f7] dark:bg-[#0f55f7]/20">
            {USER_ROLE_LABELS[row.role] || USER_ROLE_LABELS[USER_ROLES.HR]}
          </span>
          {row.hrRole && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {HR_ROLE_LABELS[row.hrRole] || row.hrRole}
            </span>
          )}
        </div>
      ),
    },
    {
      accessor: 'status', header: 'Status', sortable: true,
      render: (row) => <HRStatusBadge status={row.status} />,
    },
    {
      accessor: 'permissions', header: 'Permissions', sortable: false, minWidth: 200,
      render: (row) => {
        if (isFullAccess(row.permissions)) {
          return (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/10">
              <ShieldCheck className="h-3 w-3" /> Full HR Access
            </span>
          )
        }
        const modules = countGrantedModules(row.permissions)
        const granted = countGranted(row.permissions)
        return <span className="text-[11px] font-semibold text-slate-500">{modules} modules · {granted} actions</span>
      },
    },
    {
      accessor: 'id', header: 'Actions', sortable: false, sticky: 'right', width: 130,
      render: (row) => (
        <div className="flex items-center gap-1">
          {canManageHrUsers && <Button variant="secondary" size="xs" icon={Pencil} onClick={() => openEditHr(row)}>Edit</Button>}
          {canManageHrUsers && <Button variant="danger" size="xs" icon={Trash2} onClick={() => deleteHrUser(row)}>Delete</Button>}
        </div>
      ),
    },
  ]

  const roleColumns = [
    { accessor: 'role', header: 'Role', sortable: true, minWidth: 180, render: (row) => <span className="text-sm font-semibold text-slate-900 dark:text-white">{row.role}</span> },
    { accessor: 'users', header: 'Users', sortable: true, render: (row) => <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{row.users}</span> },
    { accessor: 'permissions', header: 'Permissions', sortable: true, minWidth: 240, render: (row) => <span className="text-xs text-slate-500">{row.permissions}</span> },
    { accessor: 'status', header: 'Status', sortable: true, render: (row) => <HRStatusBadge status={row.status} /> },
    { accessor: 'id', header: 'Actions', sortable: false, sticky: 'right', width: 100, render: (row) => (
      <Button variant="secondary" size="xs" onClick={() => toast.success(`Configuring ${row.role} (demo)`)}>Configure</Button>
    )},
  ]

  const auditColumns = [
    { accessor: 'user', header: 'User', sortable: true, minWidth: 150, render: (row) => <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{row.user}</span> },
    { accessor: 'action', header: 'Action', sortable: true, minWidth: 220, render: (row) => <span className="text-xs text-slate-600 dark:text-slate-300">{row.action}</span> },
    { accessor: 'module', header: 'Module', sortable: true, render: (row) => (
      <span className="rounded-full bg-[#0f55f7]/10 px-2 py-0.5 text-[10px] font-bold text-[#0f55f7]">{row.module}</span>
    )},
    { accessor: 'ip', header: 'IP', sortable: true, render: (row) => <span className="font-mono text-[11px] text-slate-500">{row.ip}</span> },
    { accessor: 'at', header: 'Timestamp', sortable: true, render: (row) => <span className="text-xs text-slate-500">{row.at}</span> },
  ]

  const matrixColumns = [
    { accessor: 'type', header: 'Request Type', sortable: true, minWidth: 180, render: (row) => <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{row.type}</span> },
    { accessor: 'level1', header: 'Level 1', sortable: true, render: (row) => <span className="text-xs text-slate-600 dark:text-slate-300">{row.level1}</span> },
    { accessor: 'level2', header: 'Level 2', sortable: true, render: (row) => <span className="text-xs text-slate-500">{row.level2 || '—'}</span> },
    { accessor: 'sla', header: 'SLA', sortable: true, render: (row) => <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/10">{row.sla}</span> },
    { accessor: 'id', header: 'Actions', sortable: false, sticky: 'right', width: 90, render: (row) => (
      <Button variant="secondary" size="xs" onClick={() => toast.success(`Editing ${row.type} approval rule (demo)`)}>Edit</Button>
    )},
  ]

  return (
    <HRPage
      moduleId="settings"
      title="HR Settings"
      subtitle="Attendance and leave policies, roles, permissions, notifications and workflows."
      icon={Settings}
      lastUpdated="Aug 4, 2026"
      actions={
        <HRQuickActions
          can={canSettings}
          actions={[
            { key: 'reset', label: 'Reset', icon: RotateCcw, permission: ['settings', 'edit'], onClick: resetPolicySettings },
            { key: 'save', label: settingsDirty ? 'Save Changes' : 'Saved', icon: Save, variant: 'primary', permission: ['settings', 'edit'], onClick: savePolicySettings },
          ]}
        />
      }
    >
      <nav aria-label="HR settings sections" className="mb-2 flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        {[
          { id: 'policies', label: 'HR Policies', icon: ClipboardCheck },
            ...(canSettings('permissions', 'view') ? [{ id: 'access', label: 'People & Access', icon: UserCog }] : []),
          { id: 'workflow', label: 'Approval Workflows', icon: Workflow },
          { id: 'activity', label: 'Activity Log', icon: History },
        ].map(({ id, label, icon: TabIcon }) => (
          <button key={id} type="button" onClick={() => setActiveSection(id)} className={`inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f55f7]/40 ${activeSection === id ? 'bg-[#0f55f7] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white'}`}>
            <TabIcon className="h-3.5 w-3.5" />{label}
          </button>
        ))}
      </nav>

      {/* Policies */}
      {activeSection === 'policies' && <div className="space-y-3">
        <HRSection title="Attendance Settings" subtitle="Configure working time and attendance rules" icon={Clock4} padding="p-4">
          <div>
            {[
              ['Daily work hours', 'workHours', 'hours', 1, 16],
              ['Grace period', 'graceMinutes', 'minutes', 0, 60],
              ['Work from home allowance', 'wfhDays', 'days per week', 0, 7],
            ].map(([label, key, unit, min, max]) => <label key={key} className="flex min-h-16 items-center justify-between gap-4 border-b border-slate-100 py-3 first:pt-0 last:border-0 last:pb-0 dark:border-slate-800"><span><span className="block text-sm font-semibold text-slate-800 dark:text-white">{label}</span><span className="text-xs text-slate-500">Applied to all active employees</span></span><span className="flex items-center gap-3"><input type="number" min={min} max={max} disabled={!canEditSettings} value={policySettings[key]} onChange={(event) => updatePolicy(key, Number(event.target.value))} className="h-9 w-24 rounded-lg border border-slate-300 bg-slate-50 px-3 text-right text-sm font-semibold outline-none focus:border-[#0f55f7] focus:ring-2 focus:ring-[#0f55f7]/10 dark:border-slate-600 dark:bg-slate-800" /><span className="w-24 text-xs text-slate-500">{unit}</span></span></label>)}
          </div>
        </HRSection>
        <HRSection title="Leave Entitlements" subtitle="Set annual leave allowances" icon={ClipboardCheck} padding="p-4">
          <div>
            {[
              ['Casual leave', 'casualLeave'],
              ['Sick leave', 'sickLeave'],
              ['Privilege leave', 'privilegeLeave'],
            ].map(([label, key]) => <label key={key} className="flex min-h-16 items-center justify-between gap-4 border-b border-slate-100 py-3 first:pt-0 last:border-0 last:pb-0 dark:border-slate-800"><span><span className="block text-sm font-semibold text-slate-800 dark:text-white">{label}</span><span className="text-xs text-slate-500">Annual entitlement per eligible employee</span></span><span className="flex items-center gap-3"><input type="number" min="0" max="365" disabled={!canEditSettings} value={policySettings[key]} onChange={(event) => updatePolicy(key, Number(event.target.value))} className="h-9 w-24 rounded-lg border border-slate-300 bg-slate-50 px-3 text-right text-sm font-semibold outline-none focus:border-[#0f55f7] focus:ring-2 focus:ring-[#0f55f7]/10 dark:border-slate-600 dark:bg-slate-800" /><span className="w-24 text-xs text-slate-500">days</span></span></label>)}
          </div>
        </HRSection>
        <HRSection title="Approval Rules" subtitle="Control how leave requests are approved" icon={Workflow} padding="p-4">
          <div>{[
            ['managerApproval', 'Require manager approval', 'All leave requests first go to the reporting manager'],
            ['hrApprovalOverThreeDays', 'HR approval for long leave', 'Require HR approval when leave exceeds three days'],
            ['carryForward', 'Allow leave carry forward', 'Unused privilege leave moves to the next year'],
          ].map(([key, label, description]) => <div key={key} className="flex min-h-16 items-center justify-between gap-4 border-b border-slate-100 py-3 first:pt-0 last:border-0 last:pb-0 dark:border-slate-800"><span><span className="block text-sm font-semibold text-slate-800 dark:text-white">{label}</span><span className="text-xs text-slate-500">{description}</span></span><SettingToggle label={label} disabled={!canEditSettings} checked={policySettings[key]} onChange={(value) => updatePolicy(key, value)} /></div>)}</div>
        </HRSection>
        <HRSection title="Notifications" subtitle="Choose when HR receives alerts" icon={Bell} padding="p-4">
          <div className="flex min-h-12 items-center justify-between gap-4"><span><span className="block text-sm font-semibold text-slate-800 dark:text-white">Leave request notifications</span><span className="text-xs text-slate-500">Notify HR when a request is submitted, approved or rejected</span></span><SettingToggle label="Leave request notifications" disabled={!canEditSettings} checked={policySettings.leaveNotifications} onChange={(value) => updatePolicy('leaveNotifications', value)} /></div>
        </HRSection>
      </div>}

      {/* ENTERPRISE RBAC — HR users with custom permission profiles */}
      {activeSection === 'access' && canSettings('permissions', 'view') && <HRSection
        title="HR Users & Permissions"
        subtitle={`${hrUsers.length} HR ${hrUsers.length === 1 ? 'account' : 'accounts'} from the organization employee API`}
        icon={ShieldCheck}
        padding="p-3"
      >
        {hrUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
              <LockKeyhole className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">No custom HR users yet</p>
              <p className="mt-1 max-w-md text-xs leading-5 text-slate-500 dark:text-slate-400">
                Create the HR employee from Employee Management, then return here to assign the custom permission profile.
                Their dashboard, menus and buttons adapt to exactly the permissions you grant.
              </p>
            </div>
          </div>
        ) : (
          <DataTable columns={hrUserColumns} data={hrUsers} searchable searchPlaceholder="Search HR users…" pageSize={5} />
        )}
      </HRSection>}

      {/* ENTERPRISE RBAC — create / edit HR user drawer with permission matrix */}
      <HRDrawer
        open={hrDrawer !== null}
        onClose={() => setHrDrawer(null)}
        title={`Edit ${editingUser?.name || 'HR User'}`}
        subtitle="Update account details and custom permissions"
        icon={UserCog}
        width="max-w-[860px]"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setHrDrawer(null)}>Cancel</Button>
            <Button variant="primary" size="sm" icon={Save} onClick={saveHrUser}>Save Changes</Button>
          </div>
        }
      >
        <HrUserForm
          key={`${hrDrawer}-${editingUser?.id || 'new'}`}
          value={hrDraft}
          onChange={setHrDraft}
        />
      </HRDrawer>

      {activeSection === 'workflow' && <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        <HRSection title="Roles & Permissions" subtitle="HRMS access control" icon={UserCog} padding="p-3">
          <DataTable columns={roleColumns} data={HR_ROLES} searchable={false} pageSize={5} />
        </HRSection>
        <HRSection title="Approval Matrix" subtitle="Levels and SLAs per request type" icon={Workflow} padding="p-3">
          <DataTable columns={matrixColumns} data={HR_APPROVAL_MATRIX} searchable={false} pageSize={5} />
        </HRSection>
      </div>}

      {activeSection === 'activity' && <HRSection title="Activity Log" subtitle="Recent HR workspace changes" icon={History} padding="p-3">
        <DataTable columns={auditColumns} data={HR_AUDIT_LOGS} searchable searchPlaceholder="Search audit logs…" stickyHeader pageSize={5} />
      </HRSection>}
    </HRPage>
  )
}
