import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertTriangle, Check, Lock, Plus, Shield, ShieldCheck, Trash2, Users as UsersIcon,
} from 'lucide-react'
import { getApiErrorMessage } from '@shared/services/apiServices'
import {
  createRole, deleteRole, fetchRoles,
} from '@shared/services/organizationSettingsService'
import { permissionApi } from '@shared/services/platformModulesApi'
import { readLocalList, writeLocalList } from '@shared/services/localSettingsStore'
import {
  BLOCKED_ROLE_NAMES, emptyPermissionMatrix, PERMISSION_ACTION_LABELS, PERMISSION_ACTIONS,
  PERMISSION_MODULES, SYSTEM_ROLES,
} from '@features/organization/data/settingsConstants'
import Modal from '@shared/components/Modal'
import {
  InputField, PermissionMatrixSkeleton, RoleListSkeleton, SectionHeader, SettingsEmptyState,
  SettingsErrorState, TextareaField,
} from './settingsUi'

const LOCAL_ROLES_KEY = 'customRoles'
const LOCAL_PERMS_KEY = 'rolePermissions'

/* Default matrices for seeded system roles (backend may override). */
const SYSTEM_ROLE_PERMISSIONS = {
  'org-admin': () => {
    const matrix = emptyPermissionMatrix()
    Object.keys(matrix).forEach((moduleId) => {
      Object.keys(matrix[moduleId]).forEach((action) => { matrix[moduleId][action] = true })
    })
    return matrix
  },
  mentor: () => {
    const matrix = emptyPermissionMatrix()
    ;['students', 'courses', 'batches', 'classes', 'live-classes', 'attendance', 'courseMaterials'].forEach((moduleId) => {
      matrix[moduleId] = { view: true, add: false, edit: true, delete: false, export: true, approve: false }
    })
    return matrix
  },
  student: () => {
    const matrix = emptyPermissionMatrix()
    ;['courses', 'classes'].forEach((moduleId) => {
      matrix[moduleId] = { view: true, add: false, edit: false, delete: false, export: false, approve: false }
    })
    return matrix
  },
}

const buildSystemRoles = () =>
  SYSTEM_ROLES.map((role) => ({
    ...role,
    id: role.id,
    name: role.name,
    system: true,
    status: 'Active',
    userCount: null,
    createdAt: null,
    permissions: SYSTEM_ROLE_PERMISSIONS[role.id] ? SYSTEM_ROLE_PERMISSIONS[role.id]() : emptyPermissionMatrix(),
  }))

const normalizeCustomRole = (role, index) => {
  const source = role?.role ?? role
  return {
    id: source.id ?? source.roleId ?? `custom-${index}`,
    name: source.name ?? source.roleName ?? 'Untitled Role',
    description: source.description ?? '',
    system: false,
    status: source.status ?? 'Active',
    userCount: source.userCount ?? source.users ?? null,
    createdAt: source.createdAt ?? source.createdDate ?? null,
    permissions: emptyPermissionMatrix(),
  }
}

const loadLocalPermissions = (roleId) => {
  const stored = readLocalList(LOCAL_PERMS_KEY, [])
  const entry = stored.find((item) => item.roleId === roleId)
  return entry?.permissions || null
}

const saveLocalPermissions = (roleId, permissions) => {
  const stored = readLocalList(LOCAL_PERMS_KEY, [])
  writeLocalList(LOCAL_PERMS_KEY, [
    ...stored.filter((item) => item.roleId !== roleId),
    { roleId, permissions },
  ])
}

const extractRolePermissionSource = (payload) =>
  payload?.permissions ?? payload?.data ?? payload?.items ?? payload?.modules ?? payload

const normalizeModuleId = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

const canonicalModuleId = (value) => {
  const id = normalizeModuleId(value)
  if (id === 'liveclasses' || id === 'liveclass') return 'live-classes'
  if (id === 'employee') return 'employees'
  // EmployeeProfile (permissionId 9) is a distinct backend module from
  // Employees (permissionId 2) — aliasing them together made one module's
  // saved permission silently overwrite the other's.
  if (id === 'employeeprofile') return 'employee-profile'
  return id
}

const normalizeModuleCatalog = (rows) => (Array.isArray(rows) ? rows : [])
  .map((item) => {
    const id = item?.moduleKey ?? item?.moduleName ?? item?.module ?? item?.name ?? item?.id
    const normalizedId = canonicalModuleId(id)
    if (!normalizedId) return null
    return {
      id: normalizedId === 'liveclasses' ? 'live-classes' : normalizedId,
      label: item?.moduleName ?? item?.module ?? item?.name ?? item?.label ?? id,
      permissionId: item?.permissionId ?? item?.moduleId ?? item?.id,
    }
  })
  .filter(Boolean)

const normalizePermissionMatrix = (source) => {
  const merged = emptyPermissionMatrix()
  if (!source) return merged

  if (Array.isArray(source)) {
    source.forEach((permission) => {
        const moduleKey = canonicalModuleId(
        permission?.moduleKey
        ?? permission?.moduleName
        ?? permission?.moduleId
        ?? permission?.module
        ?? '',
      )
      const module = PERMISSION_MODULES.find((candidate) =>
        canonicalModuleId(candidate.id) === moduleKey || canonicalModuleId(candidate.id) === `${moduleKey}s`,
      )
      if (!module) return
      if (permission?.canView !== undefined || permission?.canAdd !== undefined || permission?.canEdit !== undefined || permission?.canDelete !== undefined || permission?.canAccess !== undefined || permission?.canExport !== undefined || permission?.canApprove !== undefined) {
        merged[module.id] = {
          view: Boolean(permission?.canView),
          add: Boolean(permission?.canAdd),
          edit: Boolean(permission?.canEdit),
          delete: Boolean(permission?.canDelete),
          export: Boolean(permission?.canExport),
          approve: Boolean(permission?.canApprove),
        }
        return
      }
      const action = String(permission?.action ?? permission?.actionKey ?? permission?.permission ?? '').toLowerCase()
      if (PERMISSION_ACTIONS.includes(action)) {
        merged[module.id][action] = Boolean(permission?.allowed ?? permission?.isAllowed ?? permission?.value ?? true)
      }
    })
    return merged
  }

  if (typeof source !== 'object') return merged

  let hasMatrix = false
  Object.keys(merged).forEach((moduleId) => {
    const row = source[moduleId]
    if (row && typeof row === 'object') {
      hasMatrix = true
      PERMISSION_ACTIONS.forEach((action) => { merged[moduleId][action] = Boolean(row[action]) })
    }
  })

  if (hasMatrix) return merged

  Object.entries(source).forEach(([key, value]) => {
    const [moduleKey, action] = String(key).split('.')
    const module = PERMISSION_MODULES.find((candidate) =>
      canonicalModuleId(candidate.id) === moduleKey || canonicalModuleId(candidate.id) === `${moduleKey}s`,
    )
    if (module && PERMISSION_ACTIONS.includes(action)) {
      merged[module.id][action] = Boolean(value)
    }
  })

  return merged
}

const MatrixCell = ({ checked, disabled, onChange }) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`mx-auto flex h-6 w-6 items-center justify-center rounded-md border transition-colors
      ${checked ? 'border-[#0f55f7] bg-[#0f55f7] text-white' : 'border-slate-200 text-transparent hover:border-slate-300 dark:border-slate-700'}
      ${disabled ? 'cursor-not-allowed opacity-30' : 'cursor-pointer'}`}
  >
    <Check className="w-3.5 h-3.5" />
  </button>
)

export default function RolesPermissionsTab({ onNotify, onDirtyChange, editable = true }) {
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [roles, setRoles] = useState([])
  const [selectedRoleId, setSelectedRoleId] = useState(null)
  const [matrix, setMatrix] = useState(null)
  const [matrixLoading, setMatrixLoading] = useState(false)
  const [savingPermissions, setSavingPermissions] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', description: '', status: 'Active' })
  const [createSaving, setCreateSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteSaving, setDeleteSaving] = useState(false)
  const [confirmPermissionSave, setConfirmPermissionSave] = useState(false)
  const [permissionToggleCount, setPermissionToggleCount] = useState(0)
  const [permissionsDirty, setPermissionsDirty] = useState(false)
  const [permissionModules, setPermissionModules] = useState(PERMISSION_MODULES)
  const navigate = useNavigate()
  const rolesRef = useRef([])
  const matrixRef = useRef(null)

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === selectedRoleId) || null,
    [roles, selectedRoleId],
  )

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setLoadError(false)
      let custom
      let local = false
      try {
        const modules = await permissionApi.modules()
        const catalog = normalizeModuleCatalog(modules)
        if (catalog.length) setPermissionModules(catalog)
      } catch {
        // Keep the product catalog when the permission catalog is unavailable.
      }
      try {
        const rows = await fetchRoles()
        custom = (Array.isArray(rows) ? rows : []).map(normalizeCustomRole)
      } catch {
        custom = readLocalList(LOCAL_ROLES_KEY, []).map(normalizeCustomRole)
        local = true
      }
      const system = buildSystemRoles()
      // Local permission overrides (stored when the permissions API is unavailable).
      const merged = [...system, ...custom].map((role) => {
        const localPermissions = loadLocalPermissions(role.id)
        return localPermissions ? { ...role, permissions: localPermissions } : role
      })
      if (active) {
        rolesRef.current = merged
        setRoles(merged)
        const first = merged[0] || null
        setSelectedRoleId(first?.id ?? null)
        setMatrix(first ? first.permissions : null)
        setLoading(false)
        if (local) onNotify?.('Roles API is not connected. Showing system roles and locally saved custom roles.', 'info')
      }
    }
    load()
    return () => { active = false }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const selectRole = async (role) => {
    setSelectedRoleId(role.id)
    const localPermissions = loadLocalPermissions(role.id)
    if (localPermissions) {
      setMatrix(structuredClone(localPermissions))
      setPermissionsDirty(false)
      return
    }
    if (role.system) setMatrix(structuredClone(role.permissions))
    setMatrixLoading(true)
    try {
      const response = await permissionApi.byRole(role.name)
      const source = extractRolePermissionSource(response)
      const remoteMatrix = normalizePermissionMatrix(source)
      if (remoteMatrix) setMatrix(remoteMatrix)
    } catch {
      // Keep the seeded system-role matrix if the permission endpoint is unavailable.
      if (!role.system) setMatrix(emptyPermissionMatrix())
    } finally {
      setMatrixLoading(false)
      setPermissionsDirty(false)
    }
  }

  const togglePermission = (moduleId, action) => {
    if (!matrix) return
    setPermissionsDirty(true)
    setMatrix((current) => {
      const next = structuredClone(current)
      if (action === 'view' && !next[moduleId].view) {
        // View drives the other actions — avoid impossible permission states.
        PERMISSION_ACTIONS.forEach((other) => { next[moduleId][other] = false })
      } else if (action !== 'view' && !next[moduleId].view) {
        return current
      }
      next[moduleId][action] = !next[moduleId][action]
      return next
    })
  }

  const toggleModuleRow = (moduleId, value) => {
    if (!matrix) return
    setPermissionsDirty(true)
    setMatrix((current) => {
      const next = structuredClone(current)
      PERMISSION_ACTIONS.forEach((action) => { next[moduleId][action] = value })
      return next
    })
  }

  const toggleActionColumn = (action, value) => {
    if (!matrix) return
    setPermissionsDirty(true)
    setMatrix((current) => {
      const next = structuredClone(current)
      Object.keys(next).forEach((moduleId) => {
        if (action === 'view') {
          PERMISSION_ACTIONS.forEach((other) => { next[moduleId][other] = value })
        } else if (next[moduleId].view) {
          next[moduleId][action] = value
        }
      })
      return next
    })
  }

  const requestSavePermissions = () => {
    if (!matrix || !selectedRole) return
    const current = matrixRef.current
    const toggles = current
      ? Object.keys(matrix).reduce((count, moduleId) =>
          count + PERMISSION_ACTIONS.filter((action) => matrix[moduleId][action] !== current[moduleId][action]).length, 0)
      : 0
    setPermissionToggleCount(toggles)
    if (toggles >= 10) {
      setConfirmPermissionSave(true)
      return
    }
    savePermissions()
  }

  const savePermissions = async () => {
    if (!matrix || !selectedRole) return
    setSavingPermissions(true)
    const permissions = matrix
    try {
      await permissionApi.updateRole(selectedRole.name, permissions)
      onNotify?.('Permissions updated successfully.')
    } catch {
      saveLocalPermissions(selectedRole.id, permissions)
      onNotify?.('Permissions saved locally. The permissions API is not connected yet.', 'info')
    }
    matrixRef.current = structuredClone(permissions)
    rolesRef.current = rolesRef.current.map((role) => (role.id === selectedRole.id ? { ...role, permissions } : role))
    setRoles(rolesRef.current)
    setPermissionsDirty(false)
    setConfirmPermissionSave(false)
    setSavingPermissions(false)
  }

  const handleCreateRole = async () => {
    const name = createForm.name.trim()
    if (!name) {
      onNotify?.('Role name is required.', 'error')
      return
    }
    if (BLOCKED_ROLE_NAMES.includes(name.toLowerCase())) {
      onNotify?.('Super Admin is a platform-level role and cannot be created here.', 'error')
      return
    }
    setCreateSaving(true)
    const payload = { roleName: name, description: createForm.description, status: createForm.status }
    let newRole = { id: `custom-${Date.now()}`, name, description: createForm.description, status: createForm.status, system: false, userCount: 0, createdAt: null, permissions: emptyPermissionMatrix() }
    try {
      const created = await createRole(payload)
      const normalized = normalizeCustomRole(created)
      if (normalized.id && !String(normalized.id).startsWith('custom-')) newRole = { ...newRole, ...normalized, name }
      onNotify?.('Role created successfully.')
    } catch (error) {
      onNotify?.(getApiErrorMessage(error, 'Unable to create role. Saved locally for this browser.', 'error'))
    }
    // Keep the new role visible even when the roles API is unavailable.
    const local = readLocalList(LOCAL_ROLES_KEY, [])
    writeLocalList(LOCAL_ROLES_KEY, [...local.filter((role) => role.name !== name), newRole])
    rolesRef.current = [...rolesRef.current, newRole]
    setRoles(rolesRef.current)
    setShowCreateModal(false)
    setCreateForm({ name: '', description: '', status: 'Active' })
    setSelectedRoleId(newRole.id)
    setMatrix(emptyPermissionMatrix())
    setCreateSaving(false)
  }

  const handleDeleteRole = async () => {
    if (!deleteTarget) return
    setDeleteSaving(true)
    try {
      await deleteRole(deleteTarget.id)
      onNotify?.('Role deleted successfully.')
    } catch {
      /* Remove from the local list so the role stays deleted while the API is unavailable. */
      const local = readLocalList(LOCAL_ROLES_KEY, [])
      writeLocalList(LOCAL_ROLES_KEY, local.filter((role) => role.id !== deleteTarget.id))
      onNotify?.('Role removed locally. The roles API is not connected yet.', 'info')
    }
    rolesRef.current = rolesRef.current.filter((role) => role.id !== deleteTarget.id)
    setRoles(rolesRef.current)
    setDeleteTarget(null)
    setDeleteSaving(false)
    if (selectedRoleId === deleteTarget.id) {
      const next = rolesRef.current[0] || null
      setSelectedRoleId(next?.id ?? null)
      setMatrix(next ? next.permissions : null)
    }
  }

  useEffect(() => {
    onDirtyChange?.(permissionsDirty)
  }, [permissionsDirty, onDirtyChange])

  useEffect(() => {
    matrixRef.current = matrix
  }, [matrix])

  if (loading) return <RoleListSkeleton />
  if (loadError) {
    return <SettingsErrorState message="Unable to load roles." onRetry={() => { setLoadError(false); setLoading(true); window.location.reload() }} />
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      <SectionHeader
        title="Roles & Permissions"
        description="Control organization-wide roles. HR Admin, HR Executive and Recruiter access is managed in HR Settings."
        action={                <button
                  onClick={() => setShowCreateModal(true)}
                  disabled={!editable}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0f55f7] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  Create Role
                </button>
        }
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-amber-900/50 dark:bg-amber-950/20">
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">HR roles are managed separately</p>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            This page is for organization roles such as Mentor and Student. Create HR Admin, HR Executive or Recruiter accounts in HR Settings.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/employee/hr-settings')}
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#0f55f7] px-3.5 py-2 text-xs font-bold text-white transition hover:brightness-110"
        >
          Open HR Settings
        </button>
      </div>

      {roles.length === 0 ? (
        <SettingsEmptyState
          icon={Shield}
          title="No custom roles created yet"
          description="Create your first role to start defining who can access what."
          action={
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0f55f7] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110"
            >
              <Plus className="w-4 h-4" />
              Create Role
            </button>
          }
        />
      ) : (
        <>
          {/* Role list */}
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => selectRole(role)}
                className={`group flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                  selectedRoleId === role.id
                    ? 'border-[#0f55f7] bg-[#0f55f7]/5 ring-2 ring-[#0f55f7]/20'
                    : 'border-slate-100 hover:border-slate-200 dark:border-slate-700/50 dark:hover:border-slate-600'
                }`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${selectedRoleId === role.id ? 'bg-[#0f55f7] text-white' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                  {role.system ? <Lock className="w-4.5 h-4.5" /> : <ShieldCheck className="w-4.5 h-4.5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{role.name}</p>
                    {role.system && (
                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        System
                      </span>
                    )}
                  </div>
                  {role.description && <p className="mt-0.5 line-clamp-2 text-xs text-slate-400">{role.description}</p>}
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <UsersIcon className="w-3 h-3" />
                      {role.userCount ?? '—'}
                    </span>
                    {!role.system && (
                      <button
                        onClick={(event) => { event.stopPropagation(); setDeleteTarget(role) }}
                        className="inline-flex items-center gap-1 text-red-500 opacity-0 transition-opacity hover:underline group-hover:opacity-100"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Permission matrix */}
          {selectedRole && (
            <div className="rounded-2xl border border-slate-100 bg-white/70 p-4 dark:border-slate-700/50 dark:bg-slate-900/40 sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Selected Role: <span className="text-[#0f55f7]">{selectedRole.name}</span>
                  </h4>
                  <p className="text-xs text-slate-400">Click a cell to toggle permission. View must stay on for other actions.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <button
                    onClick={() => toggleActionColumn('view', true)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Select All View
                  </button>
                  <button
                    onClick={() => toggleActionColumn('add', true)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Select All Add
                  </button>
                  <button
                    onClick={() => toggleActionColumn('edit', true)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Select All Edit
                  </button>
                </div>
              </div>

              {matrixLoading ? (
                <PermissionMatrixSkeleton />
              ) : (
                <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-700/50">
                  <table className="w-full table-fixed border-separate border-spacing-0 text-sm">
                    <thead>
                      <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        <th style={{ color: '#475569', WebkitTextFillColor: '#475569', width: '28%' }} className="bg-white px-2 py-2.5 text-left dark:bg-slate-900 sm:px-3">Module</th>
                        {PERMISSION_ACTIONS.map((action) => (
                          <th key={action} style={{ color: '#475569', WebkitTextFillColor: '#475569', width: '12%' }} className="px-1 py-2.5 text-center sm:px-2">{PERMISSION_ACTION_LABELS[action]}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                      {permissionModules.map((module) => {
                        const row = matrix?.[module.id]
                        if (!row) return null
                        const allSelected = PERMISSION_ACTIONS.every((action) => row[action])
                        return (
                          <tr key={module.id} className="border-b border-slate-50 dark:border-slate-700/30">
                            <td className="bg-white px-2 py-2.5 dark:bg-slate-900 sm:px-3">
                              <div className="flex min-w-0 items-center gap-1.5">
                                <span style={{ color: '#334155', WebkitTextFillColor: '#334155' }} className="min-w-0 truncate font-medium">{module.label}</span>
                                <button
                                  onClick={() => toggleModuleRow(module.id, !allSelected)}
                                  style={{ color: '#64748b', WebkitTextFillColor: '#64748b' }}
                                  className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold transition-colors hover:bg-slate-200 dark:bg-slate-800 sm:px-2 sm:text-[10px]"
                                  title="Select all for module"
                                >
                                  {allSelected ? 'Clear' : 'All'}
                                </button>
                              </div>
                            </td>
                            {PERMISSION_ACTIONS.map((action) => (
                              <td key={action} className="px-1 py-2.5 text-center sm:px-2">
                                <MatrixCell
                                  checked={row[action]}
                                  disabled={!editable || (action !== 'view' && !row.view)}
                                  onChange={() => togglePermission(module.id, action)}
                                />
                              </td>
                            ))}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-5 flex items-center justify-between gap-3">
                <p className="text-xs text-slate-400">
                  {permissionsDirty ? 'You have unsaved permission changes.' : 'All permission changes are saved per role.'}
                </p>
                <button
                  onClick={requestSavePermissions}
                  disabled={savingPermissions || !permissionsDirty || matrixLoading || !editable}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0f55f7] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110 disabled:opacity-60"
                >
                  {savingPermissions ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Check className="w-4 h-4" />}
                  {savingPermissions ? 'Saving...' : 'Save Permissions'}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Role modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Role"
        description="Define a new role, then configure its permission matrix."
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setShowCreateModal(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateRole}
              disabled={createSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0f55f7] px-4 py-2 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60"
            >
              {createSaving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Plus className="w-4 h-4" />}
              {createSaving ? 'Creating...' : 'Create Role'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <InputField
            label="Role Name *"
            value={createForm.name}
            onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))}
            icon={ShieldCheck}
            error={createForm.name && BLOCKED_ROLE_NAMES.includes(createForm.name.trim().toLowerCase()) ? 'Super Admin is platform-level and cannot be created here.' : ''}
            placeholder="e.g. HR Manager"
          />
          <TextareaField
            label="Description"
            rows={3}
            value={createForm.description}
            onChange={(event) => setCreateForm((current) => ({ ...current, description: event.target.value }))}
            placeholder="e.g. Manages employees, attendance and payroll."
          />
        </div>
      </Modal>

      {/* Delete role confirm */}
      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Role"
        description={`This will permanently remove "${deleteTarget?.name}". Users assigned this role may lose access.`}
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setDeleteTarget(null)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteRole}
              disabled={deleteSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60"
            >
              <Trash2 className="w-4 h-4" />
              {deleteSaving ? 'Deleting...' : 'Delete Role'}
            </button>
          </div>
        }
      >
        <div className="flex items-start gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p>System roles (Organization Admin, Mentor, Student) cannot be deleted. This action applies to custom roles only.</p>
        </div>
      </Modal>

      {/* Permission bulk-save confirm */}
      <Modal
        open={confirmPermissionSave}
        onClose={() => setConfirmPermissionSave(false)}
        title="Confirm Permission Changes"
        description={`You are about to change ${permissionToggleCount} permission${permissionToggleCount === 1 ? '' : 's'} for "${selectedRole?.name}".`}
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setConfirmPermissionSave(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Continue Editing
            </button>
            <button
              onClick={savePermissions}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0f55f7] px-4 py-2 text-sm font-semibold text-white transition-all hover:brightness-110"
            >
              <Check className="w-4 h-4" />
              Save Permissions
            </button>
          </div>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          This is a large change and will affect what users with this role can access immediately after saving.
        </p>
      </Modal>
    </motion.div>
  )
}
