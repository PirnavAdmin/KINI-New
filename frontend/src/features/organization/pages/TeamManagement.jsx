import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  LayoutGrid,
  Plus,
  Edit3,
  Trash2,
  Users,
  UserCircle,
  FolderKanban,
  CheckCircle,
} from 'lucide-react'
import PageHeader from '@shared/components/PageHeader'
import Card from '@shared/components/Card'
import DataTable from '@shared/components/DataTable'
import StatusBadge from '@shared/components/StatusBadge'
import Modal from '@shared/components/Modal'
import { Input, Select, Button } from '@shared/components/FormElements'
import { departmentApi, employeeApi, getApiErrorMessage, teamsApi } from '@shared/services/apiServices'

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

const INITIAL_TEAM = {
  teamId: '',
  name: '',
  departmentId: '',
  managerId: '',
}

const getEmployeeName = (employee) =>
  [employee.firstName, employee.lastName].filter(Boolean).join(' ') || employee.name || `Employee #${employee.employeeId ?? employee.id}`

const normalizeDepartment = (department) => ({
  ...department,
  id: department.departmentId ?? department.id,
  departmentId: department.departmentId ?? department.id,
})

const normalizeTeam = (team, departments = [], employees = []) => {
  const id = team.teamId ?? team.id
  const statusSupported = team.status !== undefined || typeof team.isActive === 'boolean'
  const descriptionSupported = team.description !== undefined
  const department = departments.find((item) => Number(item.departmentId ?? item.id) === Number(team.departmentId))
  const manager = employees.find((employee) => Number(employee.employeeId ?? employee.id) === Number(team.managerId))

  return {
    ...team,
    id,
    teamId: id,
    department: team.departmentName || department?.name || team.department || (team.departmentId ? `Department #${team.departmentId}` : '-'),
    manager: team.managerName || (manager ? getEmployeeName(manager) : team.manager || '-'),
    membersCount: team.membersCount ?? team.memberCount ?? team.members?.length ?? 0,
    members: team.members || [],
    projects: team.projects || [],
    description: team.description || '',
    descriptionSupported,
    createdAt: team.createdAt || '-',
    status: String(team.status || (team.isActive === false ? 'inactive' : 'active')).toLowerCase(),
    statusSupported,
  }
}

export default function TeamManagement() {
  const [teams, setTeams] = useState([])
  const [departments, setDepartments] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deptFilter, setDeptFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editTeam, setEditTeam] = useState(null)
  const [formData, setFormData] = useState(INITIAL_TEAM)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [detailTeam, setDetailTeam] = useState(null)

  const fetchTeams = useCallback(async () => {
    setLoading(true)
    try {
      const [teamRows, departmentRows, employeeRows] = await Promise.all([
        teamsApi.list(),
        departmentApi.list(),
        employeeApi.list(),
      ])
      const departmentList = (Array.isArray(departmentRows) ? departmentRows : []).map(normalizeDepartment)
      const employeeList = Array.isArray(employeeRows) ? employeeRows : []
      setDepartments(departmentList)
      setEmployees(employeeList)
      const normalizedTeams = (Array.isArray(teamRows) ? teamRows : []).map((team) => normalizeTeam(team, departmentList, employeeList))
      setTeams(normalizedTeams)
      return normalizedTeams
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to load teams'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    queueMicrotask(fetchTeams)
  }, [fetchTeams])

  const filtered = useMemo(() => {
    return teams.filter((t) => {
      const matchesDept = !deptFilter || String(t.departmentId) === String(deptFilter)
      const matchesStatus = !statusFilter || t.status === statusFilter
      return matchesDept && matchesStatus
    })
  }, [teams, deptFilter, statusFilter])
  const statusSupported = teams.some((team) => team.statusSupported)

  const openAdd = () => {
    setEditTeam(null)
    setFormData(INITIAL_TEAM)
    setModalOpen(true)
  }

  const openEdit = (team) => {
    setEditTeam(team)
    setFormData({
      teamId: team.teamId ?? team.id ?? '',
      name: team.name,
      departmentId: team.departmentId || '',
      managerId: team.managerId || '',
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.departmentId) {
      toast.error('Team name and department are required')
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: formData.name.trim(),
        departmentId: formData.departmentId,
        managerId: formData.managerId || null,
      }

      if (editTeam) {
        await teamsApi.update(editTeam.teamId ?? editTeam.id, payload)
        const refreshed = await fetchTeams()
        const persisted = refreshed?.find((team) => String(team.teamId ?? team.id) === String(editTeam.teamId ?? editTeam.id))
        if (!persisted || persisted.name !== payload.name
          || String(persisted.departmentId) !== String(payload.departmentId)
          || String(persisted.managerId || '') !== String(payload.managerId || '')) {
          throw new Error('The Team API returned success but did not persist the changes. Backend PUT /organization/teams/{id} must be fixed.')
        }
        toast.success('Team updated successfully')
      } else {
        await teamsApi.create(payload)
        await fetchTeams()
        toast.success('Team created successfully')
      }

      setModalOpen(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to save team'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (team) => {
    setSaving(true)
    try {
      await teamsApi.remove(team.teamId ?? team.id)
      toast.success('Team deleted successfully')
      setConfirmDelete(null)
      await fetchTeams()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to delete team'))
    } finally {
      setSaving(false)
    }
  }

  const getInitial = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  const columns = [
    {
      header: 'Team',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F59E0B]/10 to-[#0f55f7]/10 flex items-center justify-center">
            <LayoutGrid className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{row.name}</p>
            <p className="text-xs text-slate-400">{row.description?.slice(0, 60)}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Department',
      accessor: 'department',
      render: (row) => (
        <div className="flex items-center gap-2">
          <FolderKanban className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-sm text-slate-600 dark:text-slate-300">{row.department}</span>
        </div>
      ),
    },
    {
      header: 'Manager',
      accessor: 'manager',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#F59E0B]/20 to-[#0f55f7]/20 flex items-center justify-center">
            <span className="text-[10px] font-bold text-[#F59E0B]">{getInitial(row.manager)}</span>
          </div>
          <span className="text-sm text-slate-700 dark:text-slate-300">{row.manager}</span>
        </div>
      ),
    },
    {
      header: 'Members',
      accessor: 'membersCount',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{row.membersCount}</span>
          <div className="flex -space-x-1.5">
            {row.members?.slice(0, 3).map((m) => (
              <div
                key={m.id}
                className="w-6 h-6 rounded-full bg-gradient-to-br from-[#0f55f7]/30 to-[#06b6a8]/30 border-2 border-white dark:border-slate-800 flex items-center justify-center"
                title={m.name}
              >
                <span className="text-[8px] font-bold text-slate-600 dark:text-slate-300">
                  {getInitial(m.name)}
                </span>
              </div>
            ))}
            {row.membersCount > 3 && (
              <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center">
                <span className="text-[8px] font-semibold text-slate-400">+{row.membersCount - 3}</span>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => row.statusSupported
        ? <StatusBadge status={row.status} />
        : <StatusBadge status="default" label="Not available" />,
    },
    {
      header: 'Actions',
      accessor: 'actions',
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setDetailTeam(row) }}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="View team details"
          >
            <Users className="w-4 h-4 text-slate-400 hover:text-[#0f55f7] transition-colors" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); openEdit(row) }}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Edit team"
          >
            <Edit3 className="w-4 h-4 text-slate-400 hover:text-[#F59E0B] transition-colors" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setConfirmDelete(row) }}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Delete team"
          >
            <Trash2 className="w-4 h-4 text-slate-400 hover:text-[#EF4444] transition-colors" />
          </button>
        </div>
      ),
    },
  ]

  const teamStats = useMemo(() => {
    const totalMembers = teams.reduce((sum, team) => sum + (team.membersCount || 0), 0)
    return {
      total: teams.length,
      active: statusSupported ? teams.filter((team) => team.status === 'active').length : 'N/A',
      totalMembers,
      avgTeamSize: teams.length ? Math.round(totalMembers / teams.length) : 0,
    }
  }, [teams, statusSupported])

  const statsCards = [
    { label: 'Total Teams', value: teamStats.total, icon: LayoutGrid, color: '#F59E0B' },
    { label: statusSupported ? 'Active Teams' : 'Status API', value: teamStats.active, icon: CheckCircle, color: '#10B981' },
    { label: 'Total Members', value: teamStats.totalMembers, icon: Users, color: '#0f55f7' },
    { label: 'Avg Team Size', value: teamStats.avgTeamSize, icon: Users, color: '#06b6a8' },
  ]

  const departmentOptions = useMemo(() => {
    const fromDepartments = departments.map((department) => ({
      value: department.departmentId ?? department.id,
      label: department.name || `Department #${department.departmentId ?? department.id}`,
    }))
    const fromTeams = teams
      .filter((team) => team.departmentId && !fromDepartments.some((department) => String(department.value) === String(team.departmentId)))
      .map((team) => ({ value: team.departmentId, label: team.department }))
    return [...fromDepartments, ...fromTeams]
  }, [departments, teams])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10"
    >
      <PageHeader
        title="Team Management"
        subtitle="Create and manage teams across your organization"
        icon={LayoutGrid}
        actions={<Button onClick={openAdd} icon={Plus}>Create Team</Button>}
      />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -3, scale: 1.02 }}
          >
            <Card key={stat.label} delay={i * 0.05} padding="p-5" className="group relative overflow-hidden !border-slate-200 bg-white hover:shadow-lg hover:shadow-[#F59E0B]/5 transition-all duration-300 dark:!border-slate-700">
              <span className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: stat.color }} />
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                  style={{ background: `linear-gradient(135deg, ${stat.color}15, ${stat.color}08)` }}
                >
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{stat.label}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        pageSize={5}
        searchable={true}
        searchPlaceholder="Search teams by name, department, or manager..."
        emptyTitle="No teams found"
        emptyDescription="Try adjusting your search or create a new team."
        emptyIcon={LayoutGrid}
        filters={
          <div className="flex gap-2">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-2.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30"
            >
              <option value="">All Departments</option>
              {departmentOptions.map((department) => (
                <option key={department.value} value={department.value}>{department.label}</option>
              ))}
            </select>
            {statusSupported && <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30"
            >
              <option value="">All Status</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>}
          </div>
        }
      />

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTeam ? 'Edit Team' : 'Create New Team'}
        description={editTeam ? `Update ${editTeam.name}` : 'Set up a new team'}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} icon={editTeam ? null : Plus} loading={saving}>
              {editTeam ? 'Save Changes' : 'Create Team'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input label="Team ID" value={formData.teamId || 'Auto generated'} readOnly disabled />
          <Select
            label="Department ID"
            value={formData.departmentId}
            onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
            options={departmentOptions}
            placeholder="Select department"
            icon={FolderKanban}
            required
          />
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Frontend Platform"
            icon={LayoutGrid}
            required
          />
          <Select
            label="Manager ID"
            value={formData.managerId}
            onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
            options={employees.map((employee) => ({ value: employee.employeeId ?? employee.id, label: getEmployeeName(employee) }))}
            placeholder="Select manager"
            icon={UserCircle}
          />
        </div>
      </Modal>

      {/* Team Details Modal */}
      <Modal
        open={!!detailTeam}
        onClose={() => setDetailTeam(null)}
        title={detailTeam?.name}
        description={`${detailTeam?.department} - ${detailTeam?.membersCount} members`}
        size="lg"
        footer={
          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setDetailTeam(null)}>Close</Button>
          </div>
        }
      >
        {detailTeam && (
          <div className="space-y-6">
            {/* Projects */}
            {detailTeam.projects?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Projects</p>
                <div className="flex flex-wrap gap-2">
                  {detailTeam.projects.map((p) => (
                    <span key={p} className="px-3 py-1.5 bg-[#0f55f7]/5 border border-[#0f55f7]/20 rounded-lg text-xs font-medium text-[#0f55f7]">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Members */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Team Members</p>
              <div className="space-y-2">
                {detailTeam.members?.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0f55f7]/20 to-[#06b6a8]/20 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-[#0f55f7]">{getInitial(member.name)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{member.name}</p>
                        <p className="text-xs text-slate-400">{member.role}</p>
                      </div>
                    </div>
                    <StatusBadge status="active" />
                  </div>
                ))}
                {detailTeam.members?.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">No members assigned yet</p>
                )}
              </div>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-6 pt-4 border-t border-slate-100 dark:border-slate-700/50">
              <div>
                <p className="text-xs text-slate-400">Created</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{detailTeam.createdAt}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Status</p>
                <StatusBadge status={detailTeam.status} />
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete Team"
        description={`Are you sure you want to delete ${confirmDelete?.name}? Team members will be unlinked from this team.`}
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setConfirmDelete(null)} disabled={saving}>Cancel</Button>
            <Button variant="danger" onClick={() => handleDelete(confirmDelete)} icon={Trash2} loading={saving}>
              Delete
            </Button>
          </div>
        }
      />
    </motion.div>
  )
}
