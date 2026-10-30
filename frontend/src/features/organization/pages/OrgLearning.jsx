import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { BookOpen, Plus, Users, Star, Award, PlayCircle, Trash2, Edit3, Info } from 'lucide-react'
import PageHeader from '@shared/components/PageHeader'
import Card from '@shared/components/Card'
import StatusBadge from '@shared/components/StatusBadge'
import SearchInput from '@shared/components/SearchInput'

// TODO(backend): Confirm Learning endpoints for GET list, POST create,
// PUT /{learningId} update, and DELETE /{learningId} before enabling mutations.

export default function OrgLearning() {
  const [programs] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [saving] = useState(false)
  const [newProgram, setNewProgram] = useState({ title: '', provider: '', duration: '', category: 'Beginner', categoryId: 1, price: 0 })
  const [editingProgram, setEditingProgram] = useState(null)

  const openCreate = () => {
    setEditingProgram(null)
    const firstCategoryId = programs.find((program) => Number(program.categoryId) > 0)?.categoryId || 1
    setNewProgram({ title: '', provider: '', duration: '', category: 'Beginner', categoryId: firstCategoryId, price: 0 })
    setShowAddModal(true)
  }

  const openEdit = (program) => {
    setEditingProgram(program)
    setNewProgram({ title: program.title, provider: program.provider === '-' ? '' : program.provider, duration: program.duration, category: program.level || program.category, categoryId: program.categoryId || 1, price: program.price || 0 })
    setShowAddModal(true)
  }

  const saveProgram = async () => {
    toast.error('Learning API is not available yet. No data was submitted.')
  }

  const deleteProgram = async (program) => {
    toast.error(`Learning API is not available yet. ${program.title} was not deleted.`)
  }

  const filtered = programs.filter(p => {
    const m = p.title.toLowerCase().includes(search.toLowerCase())
    const c = category === 'All' || p.category === category
    return m && c
  })
  const categories = ['All', ...new Set(programs.map((program) => program.category).filter(Boolean))]
  const categoryIds = [...new Set(programs.map((program) => Number(program.categoryId)).filter((id) => Number.isInteger(id) && id > 0))]
  if (categoryIds.length === 0) categoryIds.push(1)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 [&>div:first-child]:!mb-6">
      <PageHeader title="Learning & Development" subtitle="Manage training programs and employee development" icon={BookOpen}
        actions={            <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-all"
            style={{ background: 'linear-gradient(135deg, #0f55f7, #06b6a8)', boxShadow: '0 4px 16px rgba(59,130,246,0.25)' }}>
            <Plus className="w-4 h-4" /> Add Program
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Programs', value: programs.length, icon: BookOpen, color: '#0f55f7' },
          { label: 'Enrolled Employees', value: programs.reduce((a, p) => a + p.enrolled, 0), icon: Users, color: '#10B981' },
          { label: 'Active Programs', value: programs.filter(p => p.status === 'active').length, icon: PlayCircle, color: '#06b6a8' },
          { label: 'Avg Rating', value: (programs.reduce((a, p) => a + p.rating, 0) / Math.max(programs.length, 1)).toFixed(1), icon: Star, color: '#F59E0B' },
        ].map((stat, i) => (
          <Card key={stat.label} delay={i * 0.05} padding="p-4" className="group relative overflow-hidden !border-slate-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#0f55f7]/5 dark:!border-slate-700">
            <span className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: stat.color }} />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ring-1 ring-slate-900/5 transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: `${stat.color}15` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div><p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p><p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{stat.label}</p></div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur-xl sm:flex-row sm:items-center dark:border-slate-700 dark:bg-slate-900/70">
        <SearchInput value={search} onChange={e => setSearch(e.target.value)} placeholder="Search programs..." onClear={() => setSearch('')} className="min-w-0 flex-1" />
        <div className="flex gap-2 flex-wrap">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${category === c ? 'bg-[#0f55f7] text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((prog, i) => (
          <motion.div key={prog.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="group bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-[20px] p-5 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0f55f7]/10 to-[#06b6a8]/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-[#0f55f7]" />
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={prog.status} />
                <button onClick={(e) => { e.stopPropagation(); openEdit(prog) }} className="p-1.5 rounded-lg text-slate-400 hover:text-brand hover:bg-brand/5 transition-all opacity-0 group-hover:opacity-100" title="Edit program">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={(e) => {
                  e.stopPropagation()
                  deleteProgram(prog)
                }} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100" title="Delete program">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{prog.title}</h3>
            <p className="text-[10px] text-slate-400 mb-1">{prog.provider} · {prog.duration} · Category {prog.categoryId}</p>
            <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{prog.enrolled}</span>
              <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" />{prog.rating}</span>
              <span className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{prog.category}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {programs.length === 0 && (
        <Card padding="p-5" className="!border-amber-200 bg-amber-50/70 dark:!border-amber-500/20 dark:bg-amber-500/10">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/20">
              <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Learning API integration pending</p>
              <p className="mt-1 text-sm font-medium leading-5 text-slate-600 dark:text-slate-300">The backend does not currently expose a confirmed Learning endpoint. Create, update, and delete are disabled to prevent false success.</p>
            </div>
          </div>
        </Card>
      )}

      {/* Add Program Modal */}
      {showAddModal && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setShowAddModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">{editingProgram ? 'Edit Learning Program' : 'Add Learning Program'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Program Title</label>
                <input type="text" value={newProgram.title} onChange={e => setNewProgram({...newProgram, title: e.target.value})}
                  placeholder="e.g. Full Stack Web Development"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0f55f7]/30" />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                  <input type="text" value={newProgram.provider} onChange={e => setNewProgram({...newProgram, provider: e.target.value})}
                    placeholder="e.g. ExpertEra"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0f55f7]/30" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Duration</label>
                  <input type="text" value={newProgram.duration} onChange={e => setNewProgram({...newProgram, duration: e.target.value})}
                    placeholder="e.g. 12 weeks"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0f55f7]/30" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Price</label>
                <input type="number" min="0" value={newProgram.price} onChange={e => setNewProgram({...newProgram, price: e.target.value})}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0f55f7]/30" />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Level</label>
                  <select value={newProgram.category} onChange={e => setNewProgram({...newProgram, category: e.target.value})}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0f55f7]/30">
                    {['Beginner', 'Intermediate', 'Advanced'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Category ID</label>
                  <select value={newProgram.categoryId} onChange={e => setNewProgram({...newProgram, categoryId: Number(e.target.value)})}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0f55f7]/30">
                    {categoryIds.map((id) => <option key={id} value={id}>Category {id}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={saveProgram} disabled={saving}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-all disabled:cursor-not-allowed disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #0f55f7, #06b6a8)' }}>
                {saving ? 'Saving...' : editingProgram ? 'Update Program' : 'Create Program'}
              </button>
              <button onClick={() => setShowAddModal(false)} disabled={saving}
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
