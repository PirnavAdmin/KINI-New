import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  Award,
  CheckCircle,
  Edit3,
  Layers,
  Plus,
  Search,
  Target,
  Trash2,
  Users,
} from 'lucide-react'
import PageHeader from '@shared/components/PageHeader'
import Card from '@shared/components/Card'
import DataTable from '@shared/components/DataTable'
import StatusBadge from '@shared/components/StatusBadge'
import Modal from '@shared/components/Modal'
import { Button, Input } from '@shared/components/FormElements'
import { competencyApi, getApiErrorMessage } from '@shared/services/apiServices'

const INITIAL_COMPETENCY = {
  competencyId: '',
  name: '',
  description: '',
  createdDate: '',
}

const LEVEL_OPTIONS = [
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
  { value: 'Expert', label: 'Expert' },
]

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

const normalizeStatus = (status) => String(status || 'active').toLowerCase()

const getCompetencyId = (competency) =>
  competency.competencyId ?? competency.id ?? competency.competencyID

const normalizeCompetency = (competency = {}) => {
  const id = getCompetencyId(competency)
  const statusSupported = competency.status !== undefined || typeof competency.isActive === 'boolean'

  return {
    ...competency,
    id,
    competencyId: id,
    name: competency.name ?? competency.competencyName ?? competency.title ?? `Competency #${id ?? '-'}`,
    description: competency.description ?? competency.details ?? '',
    category: competency.category ?? competency.domain ?? competency.skillArea ?? '-',
    level: competency.level ?? competency.proficiencyLevel ?? competency.difficulty ?? '-',
    roleId: competency.roleId ?? competency.roleID ?? '',
    roleName: competency.roleName ?? competency.role?.name ?? (competency.roleId ? `Role #${competency.roleId}` : '-'),
    status: normalizeStatus(competency.status ?? (competency.isActive === false ? 'inactive' : 'active')),
    statusSupported,
    createdDate: competency.createdDate ?? competency.createdAt ?? '',
  }
}

const buildPayload = (formData) => ({
  competencyName: formData.name.trim(),
  description: formData.description.trim(),
})

const upsertCompetency = (items, competency) => {
  const id = getCompetencyId(competency)
  const index = items.findIndex((item) => String(getCompetencyId(item)) === String(id))

  if (index === -1) return [competency, ...items]
  return items.map((item, itemIndex) => (itemIndex === index ? competency : item))
}

export default function CompetencyManagement() {
  const [competencies, setCompetencies] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editCompetency, setEditCompetency] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [formData, setFormData] = useState(INITIAL_COMPETENCY)
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [levelFilter, setLevelFilter] = useState('')

  const fetchCompetencies = useCallback(async ({ preserveExisting = false } = {}) => {
    setLoading(true)
    try {
      const [competencyRows, dashboardData] = await Promise.all([
        roleFilter ? competencyApi.byRole(roleFilter) : competencyApi.list(),
        competencyApi.dashboard().catch(() => null),
      ])
      const nextCompetencies = (Array.isArray(competencyRows) ? competencyRows : []).map(normalizeCompetency)
      setDashboard(dashboardData)
      setCompetencies((prev) => (preserveExisting && nextCompetencies.length === 0 ? prev : nextCompetencies))
      return nextCompetencies
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to load competencies'))
      return null
    } finally {
      setLoading(false)
    }
  }, [roleFilter])

  useEffect(() => {
    const timer = window.setTimeout(fetchCompetencies, 0)
    return () => window.clearTimeout(timer)
  }, [fetchCompetencies])

  const openAdd = () => {
    setEditCompetency(null)
    setFormData(INITIAL_COMPETENCY)
    setModalOpen(true)
  }

  const openEdit = (competency) => {
    setEditCompetency(competency)
    setFormData({
      competencyId: getCompetencyId(competency) ?? '',
      name: competency.name || '',
      description: competency.description || '',
      createdDate: competency.createdDate || '',
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Competency name is required')
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...buildPayload(formData),
      }

      if (editCompetency) {
        const saved = await competencyApi.update(getCompetencyId(editCompetency), payload)
        const persisted = normalizeCompetency(await competencyApi.getById(getCompetencyId(editCompetency)))
        if (persisted.name !== payload.competencyName || String(persisted.description || '') !== String(payload.description || '')) {
          throw new Error('The server did not persist the competency changes.')
        }
        const normalized = normalizeCompetency({
          ...editCompetency,
          name: payload.competencyName,
          description: payload.description,
          createdDate: formData.createdDate || editCompetency.createdDate,
          ...(saved && !Array.isArray(saved) ? saved : {}),
        })
        setCompetencies((prev) => upsertCompetency(prev, normalized))
        await fetchCompetencies({ preserveExisting: true })
        toast.success('Competency updated successfully')
      } else {
        const saved = await competencyApi.create(payload)
        const normalized = normalizeCompetency({
          name: payload.competencyName,
          description: payload.description,
          createdDate: formData.createdDate,
          ...(saved && !Array.isArray(saved) ? saved : {}),
          competencyId: saved?.competencyId ?? saved?.id ?? `local-${Date.now()}`,
        })
        await fetchCompetencies({ preserveExisting: true })
        setCompetencies((prev) => upsertCompetency(prev, normalized))
        toast.success('Competency created successfully')
      }

      setModalOpen(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to save competency'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (competency) => {
    setSaving(true)
    try {
      await competencyApi.remove(getCompetencyId(competency))
      setCompetencies((prev) => prev.filter((item) => String(getCompetencyId(item)) !== String(getCompetencyId(competency))))
      setConfirmDelete(null)
      toast.success('Competency deleted successfully')
      await fetchCompetencies({ preserveExisting: true })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to delete competency'))
    } finally {
      setSaving(false)
    }
  }

  const filtered = useMemo(() =>
    competencies.filter((competency) => {
      const matchesStatus = !statusFilter || competency.status === statusFilter
      const matchesLevel = !levelFilter || competency.level === levelFilter
      return matchesStatus && matchesLevel
    }), [competencies, statusFilter, levelFilter])
  const statusSupported = competencies.some((competency) => competency.statusSupported)

  const stats = useMemo(() => {
    const total = dashboard?.totalCompetencies ?? dashboard?.total ?? competencies.length
    const active = dashboard?.activeCompetencies ?? dashboard?.active ?? (statusSupported ? competencies.filter((item) => item.status === 'active').length : 'N/A')
    const roles = dashboard?.rolesCovered ?? dashboard?.roleCount ?? new Set(competencies.map((item) => item.roleId).filter(Boolean)).size
    const categories = dashboard?.categories ?? dashboard?.categoryCount ?? new Set(competencies.map((item) => item.category).filter((item) => item && item !== '-')).size

    return [
      { label: 'Competencies', value: total, icon: Award, color: '#0f55f7' },
      { label: statusSupported ? 'Active' : 'Status API', value: active, icon: CheckCircle, color: '#10B981' },
      { label: 'Roles Covered', value: roles, icon: Users, color: '#06b6a8' },
      { label: 'Categories', value: categories, icon: Layers, color: '#F59E0B' },
    ]
  }, [competencies, dashboard, statusSupported])

  const columns = [
    {
      header: 'Competency',
      accessor: 'name',
      minWidth: 260,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0f55f7]/10 flex items-center justify-center">
            <Award className="w-5 h-5 text-[#0f55f7]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{row.name}</p>
            <p className="text-xs text-slate-400 truncate">{row.description || 'No description'}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (row) => <span className="text-sm text-slate-600 dark:text-slate-300">{row.category}</span>,
    },
    {
      header: 'Level',
      accessor: 'level',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
          <Target className="w-3.5 h-3.5 text-slate-400" />
          {row.level}
        </span>
      ),
    },
    {
      header: 'Role',
      accessor: 'roleName',
      render: (row) => <span className="text-sm text-slate-600 dark:text-slate-300">{row.roleName}</span>,
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
            onClick={(event) => { event.stopPropagation(); openEdit(row) }}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Edit competency"
          >
            <Edit3 className="w-4 h-4 text-slate-400 hover:text-[#0f55f7]" />
          </button>
          <button
            onClick={(event) => { event.stopPropagation(); setConfirmDelete(row) }}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Delete competency"
          >
            <Trash2 className="w-4 h-4 text-slate-400 hover:text-[#EF4444]" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto w-full max-w-7xl min-w-0 px-4 py-6 sm:px-6 sm:py-8 lg:py-10"
    >
      <PageHeader
        title="Competency Management"
        subtitle="Create and manage role-based competencies"
        icon={Award}
        actions={<Button icon={Plus} onClick={openAdd}>Add Competency</Button>}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={stat.label} delay={index * 0.05} padding="p-5" className="group relative overflow-hidden !border-slate-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#0f55f7]/5 dark:!border-slate-700">
            <span className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: stat.color }} />
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ring-1 ring-slate-900/5 transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: `${stat.color}12` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        pageSize={6}
        searchable
        searchPlaceholder="Search competencies by name, category, level, or role..."
        emptyTitle="No competencies found"
        emptyDescription="Try adjusting your filters or add a new competency."
        emptyIcon={Award}
        filters={
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                placeholder="Role ID"
                className="w-32 pl-9 pr-3 py-2.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30"
              />
            </div>
            <select
              value={levelFilter}
              onChange={(event) => setLevelFilter(event.target.value)}
              className="px-3 py-2.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30"
            >
              <option value="">All Levels</option>
              {LEVEL_OPTIONS.map((level) => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
            {statusSupported && <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="px-3 py-2.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30"
            >
              <option value="">All Status</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>}
          </>
        }
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editCompetency ? 'Edit Competency' : 'Add Competency'}
        description={editCompetency ? `Update ${editCompetency.name}` : 'Create a competency from the API'}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} icon={editCompetency ? null : Plus} loading={saving}>
              {editCompetency ? 'Save Changes' : 'Save'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input label="Competencies ID" value={formData.competencyId || 'Auto generated'} readOnly disabled />
          <Input
            label="Competencies Name"
            value={formData.name}
            onChange={(event) => setFormData({ ...formData, name: event.target.value })}
            placeholder="e.g. Strategic Thinking"
            icon={Award}
            required
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
            <textarea
              value={formData.description}
              onChange={(event) => setFormData({ ...formData, description: event.target.value })}
              placeholder="Describe the expected competency behavior..."
              rows={3}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30 focus:border-[#0f55f7] transition-all duration-200 resize-none"
            />
          </div>
          <Input label="Created Date" type="date" value={formData.createdDate ? String(formData.createdDate).slice(0, 10) : ''} readOnly disabled />
        </div>
      </Modal>

      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete Competency"
        description={`Delete ${confirmDelete?.name}? This action cannot be undone.`}
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
