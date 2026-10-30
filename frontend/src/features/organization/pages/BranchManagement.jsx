import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Building2,
  Plus,
  Edit3,
  Trash2,
  MapPin,
  Users,
  Phone,
  Calendar,
  Search,
  X,
  CheckCircle,
} from 'lucide-react'
import PageHeader from '@shared/components/PageHeader'
import Card from '@shared/components/Card'
import DataTable from '@shared/components/DataTable'
import StatusBadge from '@shared/components/StatusBadge'
import SearchInput from '@shared/components/SearchInput'
import Modal from '@shared/components/Modal'
import { Input, Select, Button } from '@shared/components/FormElements'
import { BRANCHES, BRANCH_STATS, BRANCH_STATUSES } from '@shared/data/branchMockData'
 
const INITIAL_BRANCH = {
  name: '',
  location: '',
  city: '',
  country: '',
  phone: '',
  status: 'active',
  manager: '',
}
 
export default function BranchManagement() {
  const [branches, setBranches] = useState(BRANCHES)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editBranch, setEditBranch] = useState(null)
  const [formData, setFormData] = useState(INITIAL_BRANCH)
  const [confirmDelete, setConfirmDelete] = useState(null)
 
  const filtered = useMemo(() => {
    return branches.filter((b) => {
      const matchesSearch = !search ||
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.city.toLowerCase().includes(search.toLowerCase()) ||
        b.country.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = !statusFilter || b.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [branches, search, statusFilter])
 
  const openAdd = () => {
    setEditBranch(null)
    setFormData(INITIAL_BRANCH)
    setModalOpen(true)
  }
 
  const openEdit = (branch) => {
    setEditBranch(branch)
    setFormData({
      name: branch.name,
      location: branch.location,
      city: branch.city,
      country: branch.country,
      phone: branch.phone,
      status: branch.status,
      manager: branch.manager,
    })
    setModalOpen(true)
  }
 
  const handleSave = () => {
    if (editBranch) {
      setBranches((prev) =>
        prev.map((b) =>
          b.id === editBranch.id ? { ...b, ...formData } : b
        )
      )
    } else {
      const newBranch = {
        id: `br-${String(branches.length + 1).padStart(3, '0')}`,
        ...formData,
        employeeCount: 0,
        established: String(new Date().getFullYear()),
      }
      setBranches((prev) => [...prev, newBranch])
    }
    setModalOpen(false)
  }
 
  const handleDelete = (branch) => {
    setBranches((prev) => prev.filter((b) => b.id !== branch.id))
    setConfirmDelete(null)
  }
 
  const columns = [
    {
      header: 'Branch Name',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0f55f7]/10 to-[#06b6a8]/10 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-[#0f55f7]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{row.name}</p>
            <p className="text-xs text-slate-400">{row.city}, {row.country}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Location',
      accessor: 'city',
      render: (row) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-sm text-slate-600 dark:text-slate-300 truncate max-w-[200px]">{row.location}</span>
        </div>
      ),
    },
    {
      header: 'Employees',
      accessor: 'employeeCount',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{row.employeeCount}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      accessor: 'actions',
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); openEdit(row) }}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Edit branch"
          >
            <Edit3 className="w-4 h-4 text-slate-400 hover:text-[#0f55f7] transition-colors" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setConfirmDelete(row) }}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Delete branch"
          >
            <Trash2 className="w-4 h-4 text-slate-400 hover:text-[#EF4444] transition-colors" />
          </button>
        </div>
      ),
    },
  ]
 
  const statsCards = [
    { label: 'Total Branches', value: BRANCH_STATS.total, icon: Building2, color: '#0f55f7' },
    { label: 'Active', value: BRANCH_STATS.active, icon: CheckCircle, color: '#10B981' },
    { label: 'Total Employees', value: BRANCH_STATS.totalEmployees, icon: Users, color: '#06b6a8' },
    { label: 'Avg per Branch', value: BRANCH_STATS.avgEmployeesPerBranch, icon: Building2, color: '#F59E0B' },
  ]
 
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -3, scale: 1.02 }}
          >
            <Card delay={i * 0.05} padding="p-5" className="group hover:shadow-lg hover:shadow-[#0f55f7]/5 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                  style={{ background: `linear-gradient(135deg, ${stat.color}15, ${stat.color}08)` }}
                >
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                  <p className="text-xs text-slate-400">{stat.label}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
 
      {/* Header */}
      <PageHeader
        title="Branch Management"
        subtitle="Manage your organization's branches and locations"
        icon={Building2}
      />
 
      {/* Table */}
      <DataTable
        columns={columns}
        data={filtered}
        pageSize={5}
        searchable={true}
        searchPlaceholder="Search branches by name, city, or country..."
        emptyTitle="No branches found"
        emptyDescription="Try adjusting your search or add a new branch."
        emptyIcon={Building2}
        filters={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30"
          >
            <option value="">All Status</option>
            {BRANCH_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        }
      />
 
      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editBranch ? 'Edit Branch' : 'Add New Branch'}
        description={editBranch ? `Update ${editBranch.name}` : 'Register a new branch location'}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} icon={editBranch ? null : Plus}>
              {editBranch ? 'Save Changes' : 'Add Branch'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Branch Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Headquarters"
              icon={Building2}
              required
            />
            <Input
              label="Manager"
              value={formData.manager}
              onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
              placeholder="e.g. Jane Smith"
              icon={Users}
            />
          </div>
          <Input
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g. 350 5th Avenue, New York, NY"
            icon={MapPin}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="e.g. New York"
            />
            <Input
              label="Country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              placeholder="e.g. United States"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="e.g. +1 (555) 123-4001"
              icon={Phone}
            />
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={BRANCH_STATUSES}
            />
          </div>
        </div>
      </Modal>
 
      {/* Delete Confirmation */}
      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete Branch"
        description={`Are you sure you want to delete ${confirmDelete?.name}? This action cannot be undone.`}
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => handleDelete(confirmDelete)} icon={Trash2}>
              Delete
            </Button>
          </div>
        }
      />
    </motion.div>
  )
}
 
 