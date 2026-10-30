import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Target, Plus, Edit3, Trash2, Search, CheckCircle,
  Clock, AlertCircle, CircleDot, Filter, BarChart3, Users
} from 'lucide-react'
import PageHeader from '@shared/components/PageHeader'
import Card from '@shared/components/Card'
import DataTable from '@shared/components/DataTable'
import StatusBadge from '@shared/components/StatusBadge'
import Modal from '@shared/components/Modal'
import { Input, Select, Button } from '@shared/components/FormElements'
 
// =================================
// TODO: API Integration
// GET /api/v1/goals
// POST /api/v1/goals
// PUT /api/v1/goals/:id
// DELETE /api/v1/goals/:id
// =================================
 
const GOALS_DATA = [
  { id: 'goal-001', title: 'Complete React Mastery Certification', employee: 'Alice Johnson', department: 'Engineering', dueDate: 'Dec 15, 2024', progress: 75, status: 'in-progress', priority: 'high' },
  { id: 'goal-002', title: 'Lead 3 Architecture Reviews', employee: 'Bob Smith', department: 'Engineering', dueDate: 'Nov 30, 2024', progress: 100, status: 'completed', priority: 'medium' },
  { id: 'goal-003', title: 'Improve Test Coverage to 90%', employee: 'Carol Davis', department: 'Engineering', dueDate: 'Jan 20, 2025', progress: 60, status: 'in-progress', priority: 'high' },
  { id: 'goal-004', title: 'Mentor 2 Junior Developers', employee: 'Alice Johnson', department: 'Engineering', dueDate: 'Mar 1, 2025', progress: 50, status: 'in-progress', priority: 'medium' },
  { id: 'goal-005', title: 'Publish Technical Blog Post', employee: 'David Lee', department: 'Marketing', dueDate: 'Feb 15, 2025', progress: 0, status: 'pending', priority: 'low' },
  { id: 'goal-006', title: 'Q4 Sales Target Achievement', employee: 'Eva Martinez', department: 'Sales', dueDate: 'Dec 31, 2024', progress: 85, status: 'in-progress', priority: 'high' },
  { id: 'goal-007', title: 'Employee Wellness Program', employee: 'Eva Martinez', department: 'HR', dueDate: 'Jan 30, 2025', progress: 30, status: 'in-progress', priority: 'medium' },
  { id: 'goal-008', title: 'Complete AWS Certification', employee: 'Bob Smith', department: 'Engineering', dueDate: 'Oct 15, 2024', progress: 100, status: 'completed', priority: 'low' },
]
 
const INITIAL_GOAL = { title: '', employee: '', department: '', dueDate: '', priority: 'medium', status: 'pending' }
 
export default function GoalManagement() {
  const [goals, setGoals] = useState(GOALS_DATA)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editGoal, setEditGoal] = useState(null)
  const [formData, setFormData] = useState(INITIAL_GOAL)
  const [confirmDelete, setConfirmDelete] = useState(null)
 
  const filtered = useMemo(() => {
    return goals.filter((g) => {
      const matchesSearch = !search || g.title.toLowerCase().includes(search.toLowerCase()) || g.employee.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = !statusFilter || g.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [goals, search, statusFilter])
 
  const stats = {
    total: goals.length,
    completed: goals.filter(g => g.status === 'completed').length,
    inProgress: goals.filter(g => g.status === 'in-progress').length,
    pending: goals.filter(g => g.status === 'pending').length,
    completionRate: Math.round((goals.filter(g => g.status === 'completed').length / goals.length) * 100),
  }
 
  const openAdd = () => { setEditGoal(null); setFormData(INITIAL_GOAL); setModalOpen(true) }
  const openEdit = (goal) => { setEditGoal(goal); setFormData({ title: goal.title, employee: goal.employee, department: goal.department, dueDate: goal.dueDate, priority: goal.priority, status: goal.status }); setModalOpen(true) }
  const handleSave = () => {
    if (editGoal) { setGoals((prev) => prev.map((g) => g.id === editGoal.id ? { ...g, ...formData } : g)) }
    else { setGoals((prev) => [...prev, { id: `goal-${String(prev.length + 1).padStart(3, '0')}`, ...formData, progress: 0 }]) }
    setModalOpen(false)
  }
  const handleDelete = (goal) => { setGoals((prev) => prev.filter((g) => g.id !== goal.id)); setConfirmDelete(null) }
 
  const columns = [
    { header: 'Goal', accessor: 'title', render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F59E0B]/10 to-[#0f55f7]/10 flex items-center justify-center">
          <Target className="w-4 h-4 text-[#F59E0B]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white max-w-[250px] truncate">{row.title}</p>
          <p className="text-xs text-slate-400">{row.employee} · {row.department}</p>
        </div>
      </div>
    )},
    { header: 'Due Date', accessor: 'dueDate' },
    { header: 'Progress', accessor: 'progress', render: (row) => (
      <div className="flex items-center gap-2 min-w-[100px]">
        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${row.progress}%` }} className="h-full rounded-full bg-gradient-to-r from-[#F59E0B] to-[#10B981]" />
        </div>
        <span className="text-xs font-semibold text-slate-500">{row.progress}%</span>
      </div>
    )},
    { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status === 'in-progress' ? 'active' : row.status} /> },
    { header: 'Priority', accessor: 'priority', render: (row) => (
      <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-md ${
        row.priority === 'high' ? 'bg-red-50 dark:bg-red-500/10 text-red-600' :
        row.priority === 'medium' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600' :
        'bg-slate-100 dark:bg-slate-800 text-slate-500'
      }`}>{row.priority}</span>
    )},
    { header: 'Actions', accessor: 'actions', sortable: false, render: (row) => (
      <div className="flex items-center gap-2">
        <button onClick={() => openEdit(row)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><Edit3 className="w-4 h-4 text-slate-400 hover:text-[#F59E0B]" /></button>
        <button onClick={() => setConfirmDelete(row)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><Trash2 className="w-4 h-4 text-slate-400 hover:text-[#EF4444]" /></button>
      </div>
    )},
  ]
 
  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total Goals', value: stats.total, color: '#0f55f7', icon: Target },
          { label: 'Completed', value: stats.completed, color: '#10B981', icon: CheckCircle },
          { label: 'In Progress', value: stats.inProgress, color: '#F59E0B', icon: CircleDot },
          { label: 'Pending', value: stats.pending, color: '#94A3B8', icon: Clock },
          { label: 'Completion Rate', value: `${stats.completionRate}%`, color: '#06b6a8', icon: BarChart3 },
        ].map((stat, i) => (
          <Card key={stat.label} delay={i * 0.05} padding="p-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${stat.color}15, ${stat.color}08)` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
 
      <PageHeader title="Goal Management" subtitle="Track and manage employee goals" icon={Target}
        actions={<Button onClick={openAdd} icon={Plus}>Add Goal</Button>}
      />
 
      <DataTable columns={columns} data={filtered} pageSize={5} searchable searchPlaceholder="Search goals by title or employee..."
        emptyTitle="No goals found" emptyDescription="Create your first goal to get started." emptyIcon={Target}
        filters={
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30">
            <option value="">All Status</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        }
      />
 
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editGoal ? 'Edit Goal' : 'Add New Goal'}
        description={editGoal ? `Update ${editGoal.title}` : 'Create a new employee goal'} size="lg"
        footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button onClick={handleSave} icon={editGoal ? null : Plus}>{editGoal ? 'Save Changes' : 'Add Goal'}</Button></div>}>
        <div className="space-y-4">
          <Input label="Goal Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Complete React Certification" required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Employee" value={formData.employee} onChange={(e) => setFormData({ ...formData, employee: e.target.value })} placeholder="e.g. Alice Johnson" icon={Users} />
            <Input label="Department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} placeholder="e.g. Engineering" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Due Date" type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
            <Select label="Priority" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} options={[{ value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }]} />
          </div>
          {editGoal && (
            <Select label="Status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} options={[{ value: 'pending', label: 'Pending' }, { value: 'in-progress', label: 'In Progress' }, { value: 'completed', label: 'Completed' }]} />
          )}
        </div>
      </Modal>
 
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete Goal" size="sm"
        description={`Are you sure you want to delete "${confirmDelete?.title}"?`}
        footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancel</Button><Button variant="danger" onClick={() => handleDelete(confirmDelete)} icon={Trash2}>Delete</Button></div>} />
    </div>
  )
}
 
 