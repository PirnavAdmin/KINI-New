import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Target, Plus, TrendingUp, CheckCircle2, Users, Trash2, Edit3 } from 'lucide-react'
import PageHeader from '@shared/components/PageHeader'
import Card from '@shared/components/Card'
import StatusBadge from '@shared/components/StatusBadge'
import { employeeApi, getApiErrorMessage, goalsApi } from '@shared/services/apiServices'

const formatEmployeeName = (employee) =>
  [employee.firstName, employee.lastName].filter(Boolean).join(' ') || employee.email || `Employee ${employee.employeeId}`

const mapGoal = (goal, employees = []) => {
  const owner = employees.find((employee) => Number(employee.employeeId) === Number(goal.ownerId))
  return {
    id: goal.goalId ?? goal.id,
    goalId: goal.goalId ?? goal.id,
    title: goal.title || `Goal #${goal.goalId ?? goal.id}`,
    department: owner?.departmentName || owner?.department || 'Organization',
    quarter: goal.quarter || 'Q1 2025',
    progress: goal.status?.toLowerCase() === 'completed' ? 100 : 0,
    status: goal.status || 'active',
    ownerId: goal.ownerId,
    owner: owner ? formatEmployeeName(owner) : `Employee ${goal.ownerId}`,
    teamSize: 1,
    keyResults: ['Track progress in the backend'],
  }
}

export default function OrgGoals() {
  const [goals, setGoals] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeQuarter, setActiveQuarter] = useState('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [newGoal, setNewGoal] = useState({ goalId: '', title: '', quarter: 'Q1', ownerId: '', status: 'active' })

  const fetchData = async () => {
    setLoading(true)
    try {
      const [goalRows, employeeRows] = await Promise.all([goalsApi.list(), employeeApi.list()])
      setEmployees(Array.isArray(employeeRows) ? employeeRows : [])
      setGoals((Array.isArray(goalRows) ? goalRows : []).map((goal) => mapGoal(goal, employeeRows)))
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to load goals'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(fetchData, 0)
    return () => window.clearTimeout(timer)
  }, [])

  const openGoalForm = (goal = null) => {
    setEditingGoal(goal)
    setNewGoal(goal ? { goalId: goal.goalId ?? goal.id, title: goal.title, quarter: goal.quarter, ownerId: goal.ownerId, status: goal.status } : { goalId: '', title: '', quarter: 'Q1', ownerId: '', status: 'active' })
    setShowAddModal(true)
  }

  const handleSaveGoal = async () => {
    if (!newGoal.title.trim()) {
      toast.error('Goal title is required')
      return
    }
    if (!newGoal.ownerId) {
      toast.error('Please select an owner')
      return
    }

    const payload = {
      title: newGoal.title.trim(),
      ownerId: Number(newGoal.ownerId),
      quarter: newGoal.quarter,
      status: newGoal.status,
    }

    try {
      if (editingGoal) await goalsApi.update(editingGoal.goalId ?? editingGoal.id, payload)
      else await goalsApi.create(payload)
      toast.success(editingGoal ? 'Goal updated!' : 'Goal created!')
      setShowAddModal(false)
      setNewGoal({ goalId: '', title: '', quarter: 'Q1', ownerId: '', status: 'active' })
      await fetchData()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to save goal'))
    }
  }

  const filtered = activeQuarter === 'All' ? goals : goals.filter(g => g.quarter === activeQuarter)
  const goalQuarterOptions = [...new Set([...goals.map((goal) => goal.quarter).filter(Boolean), 'Q1', 'Q2', 'Q3', 'Q4'])]
  const quarters = ['All', ...goalQuarterOptions]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <PageHeader title="Company Goals" subtitle="Track and manage organizational OKRs" icon={Target}
        actions={            <button onClick={() => openGoalForm()} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-all"
            style={{ background: 'linear-gradient(135deg, #0f55f7, #06b6a8)', boxShadow: '0 4px 16px rgba(59,130,246,0.25)' }}>
            <Plus className="w-4 h-4" /> Add Goal
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {[
          { label: 'Total Goals', value: goals.length, icon: Target, color: '#0f55f7' },
          { label: 'Active', value: goals.filter(g => g.status === 'active').length, icon: TrendingUp, color: '#10B981' },
          { label: 'Completed', value: goals.filter(g => g.status === 'completed').length, icon: CheckCircle2, color: '#06b6a8' },
          { label: 'Departments', value: [...new Set(goals.map(g => g.department))].length, icon: Users, color: '#F59E0B' },
        ].map((stat, i) => (
          <Card key={stat.label} delay={i * 0.05} padding="p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div><p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p><p className="text-xs text-slate-400">{stat.label}</p></div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {[...new Set(quarters)].map(q => (
          <button key={q} onClick={() => setActiveQuarter(q)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeQuarter === q ? 'bg-[#0f55f7] text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
            {q}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading && <Card padding="p-5"><p className="text-sm text-slate-400">Loading goals...</p></Card>}
        {!loading && filtered.map((goal, i) => (
          <motion.div key={goal.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card padding="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${goal.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-500/10' : 'bg-[#0f55f7]/10'}`}>
                    {goal.status === 'completed' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Target className="w-5 h-5 text-[#0f55f7]" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{goal.title}</h3>
                      <StatusBadge status={goal.status} />
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                      <span>{goal.department}</span>
                      <span>·</span>
                      <span>{goal.quarter}</span>
                      <span>·</span>
                      <span>Owner: {goal.owner}</span>
                      <span>·</span>
                      <span><Users className="w-3 h-3 inline" /> {goal.teamSize} people</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openGoalForm(goal)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all" title="Edit goal"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={async () => {
                    try {
                      await goalsApi.remove(goal.goalId)
                      toast.success('Goal deleted')
                      await fetchData()
                    } catch (error) {
                      toast.error(getApiErrorMessage(error, 'Unable to delete goal'))
                    }
                  }} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all" title="Delete goal">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="text-right w-20">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{goal.progress}%</p>
                  <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#0f55f7] to-[#06b6a8]" style={{ width: `${goal.progress}%` }} />
                  </div>
                </div>
              </div>
              </div>
              <div className="pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Key Results</p>
                <div className="space-y-1.5">
                  {goal.keyResults.map((kr, ki) => (
                    <div key={ki} className="flex items-center gap-2 text-xs text-slate-500">
                      <div className="w-1 h-1 rounded-full bg-slate-300" />
                      {kr}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setShowAddModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">{editingGoal ? 'Edit Company Goal' : 'Add Company Goal'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Goal ID</label>
                <input type="text" value={newGoal.goalId || 'Auto generated'} readOnly disabled
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Goal Title</label>
                <input type="text" value={newGoal.title} onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                  placeholder="e.g. Increase Revenue by 25%"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0f55f7]/30" />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Owner ID</label>
                  <select value={newGoal.ownerId} onChange={e => setNewGoal({...newGoal, ownerId: e.target.value})}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0f55f7]/30">
                    <option value="">Select owner</option>
                    {employees.map((employee) => (
                      <option key={employee.employeeId} value={employee.employeeId}>{formatEmployeeName(employee)}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Quarter</label>
                  <select value={newGoal.quarter} onChange={e => setNewGoal({...newGoal, quarter: e.target.value})}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0f55f7]/30">
                    {goalQuarterOptions.map(q => <option key={q} value={q}>{q}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
                <select value={newGoal.status} onChange={e => setNewGoal({...newGoal, status: e.target.value})}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0f55f7]/30">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={handleSaveGoal}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-all"
                style={{ background: 'linear-gradient(135deg, #0f55f7, #06b6a8)' }}>
                {editingGoal ? 'Save Changes' : 'Create Goal'}
              </button>
              <button onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
