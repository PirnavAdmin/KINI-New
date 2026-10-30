import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, BookOpen, Clock, DollarSign, Layers, Users, Star, CheckCircle2, ChevronRight, Code2, Database, Server, GraduationCap, ListOrdered } from 'lucide-react'
import { COURSES_DATA } from '@shared/data/orgBatchesMockData'
import { ROUTES } from '@shared/constants/routeConstants'
import StatusBadge from '@shared/components/StatusBadge'
import { Button } from '@shared/components/FormElements'
import EmptyState from '@shared/components/EmptyState'

const fmt = (v) => Number.isNaN(Number(v)) ? '-' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(v))

const getModuleIcon = (name) => {
  if (name.startsWith('Frontend')) return Code2
  if (name.startsWith('Backend')) return Server
  if (name.startsWith('Database') || name.startsWith('Python')) return Database
  if (name.startsWith('Statistics') || name.startsWith('Machine') || name.startsWith('Deep')) return Star
  return BookOpen
}

export default function OrgCourseDetails() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('fullstack')
  const course = useMemo(() => COURSES_DATA.find((c) => c.courseId === Number(courseId)), [courseId])

  if (!course) return (
    <div className="px-4 py-12"><EmptyState icon={BookOpen} title="Course not found" action={<Button onClick={() => navigate(ROUTES.ORG_ADMIN.COURSES)}><ArrowLeft className="w-4 h-4 mr-1.5" /> Back</Button>} /></div>
  )

  const module = activeTab === 'fullstack' ? null : course.modules.find(m => m.id === activeTab)
  const ModuleIcon = module ? getModuleIcon(module.name) : BookOpen

  return (
    <div className="w-full px-4 py-3 sm:px-5 lg:px-6 space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <button onClick={() => navigate(ROUTES.ORG_ADMIN.COURSES)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-[#0f55f7]/30 hover:text-[#0f55f7] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"><ArrowLeft className="h-4 w-4" /></button>
        <div className="flex items-center gap-2.5">
          <div><h1 className="text-lg font-bold text-slate-950 dark:text-white">{course.courseName}</h1><p className="text-xs text-slate-400">{course.totalModules} Modules · {course.totalDuration} · {course.totalStudentsEnrolled} Enrolled</p></div>
          <StatusBadge status={course.status === 'Active' ? 'success' : 'inactive'} label={course.status} size="sm" />
        </div>
      </motion.div>

      {/* Overview Cards */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid gap-2.5 grid-cols-2 lg:grid-cols-5">
        {[
          { label: 'Total Price', value: fmt(course.totalPrice), icon: DollarSign, color: 'from-[#0f55f7]/10 to-[#06b6a8]/10', iconColor: 'text-[#0f55f7]' },
          { label: 'Duration', value: course.totalDuration, icon: Clock, color: 'from-emerald-500/10 to-emerald-400/10', iconColor: 'text-emerald-600' },
          { label: 'Modules', value: `${course.totalModules} Modules`, icon: Layers, color: 'from-violet-500/10 to-violet-400/10', iconColor: 'text-violet-600' },
          { label: 'Level', value: course.level || 'All Levels', icon: GraduationCap, color: 'from-cyan-500/10 to-cyan-400/10', iconColor: 'text-cyan-600' },
          { label: 'Enrolled', value: `${course.totalStudentsEnrolled} Students`, icon: Users, color: 'from-amber-500/10 to-amber-400/10', iconColor: 'text-amber-600' },
        ].map((c) => {
          const Icon = c.icon
          return (
            <div key={c.label} className="rounded-[14px] border border-slate-200/70 bg-white/95 p-3 dark:border-slate-700/60 dark:bg-slate-900/80">
              <div className="flex items-center gap-2.5">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${c.color}`}><Icon className={`h-4 w-4 ${c.iconColor}`} /></div>
                <div className="min-w-0"><p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">{c.label}</p><p className="text-xs font-bold text-slate-900 dark:text-white truncate">{c.value}</p></div>
              </div>
            </div>
          )
        })}
      </motion.div>

      {/* Description */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="rounded-[16px] border border-slate-200/70 bg-white/95 p-4 dark:border-slate-700/60 dark:bg-slate-900/80">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-1.5">Course Overview</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{course.description}</p>
      </motion.div>

      {/* Module Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700/60">
        <nav className="flex gap-0 -mb-px overflow-x-auto scrollbar-hide">
          {/* Full Stack Overview Tab */}
          <button onClick={() => setActiveTab('fullstack')}
            className={`flex items-center gap-1.5 whitespace-nowrap px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'fullstack' ? 'border-[#0f55f7] text-[#0f55f7]' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}>
            <Layers className="w-3.5 h-3.5" /> Full Stack Development
          </button>
          {/* Individual Module Tabs */}
          {course.modules.map((m) => {
            const Mi = getModuleIcon(m.name)
            return (
              <button key={m.id} onClick={() => setActiveTab(m.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                  activeTab === m.id ? 'border-[#0f55f7] text-[#0f55f7]' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}>
                <Mi className="w-3.5 h-3.5" /> {m.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Module Content */}
      <AnimatePresence mode="wait">
        {/* ─── Full Stack Overview Tab ─── */}
        {activeTab === 'fullstack' && (
          <motion.div key="fullstack" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {/* Course Description */}
              <div className="rounded-[16px] border border-slate-200/70 bg-white/95 p-4 dark:border-slate-700/60 dark:bg-slate-900/80">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-2">Full Stack Development</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{course.description}</p>
              </div>

              {/* Module Detail Cards */}
              {course.modules.map((mod, i) => {
                const Mi = getModuleIcon(mod.name)
                const moduleColors = [
                  { bg: 'from-blue-500/10 to-cyan-500/10', icon: 'text-blue-600' },
                  { bg: 'from-emerald-500/10 to-teal-500/10', icon: 'text-emerald-600' },
                  { bg: 'from-violet-500/10 to-purple-500/10', icon: 'text-violet-600' },
                ]
                const color = moduleColors[i % moduleColors.length]
                return (
                  <motion.div
                    key={mod.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -2 }}
                    className="group rounded-[16px] border border-slate-200/70 bg-white/95 p-4 transition-all duration-300 hover:shadow-lg hover:shadow-[#0f55f7]/5 hover:border-[#0f55f7]/20 dark:border-slate-700/60 dark:bg-slate-900/80 dark:hover:border-[#0f55f7]/30"
                  >
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${color.bg} group-hover:scale-110 transition-transform`}>
                        <Mi className={`w-4.5 h-4.5 ${color.icon}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{mod.name}</h4>
                        <p className="text-[10px] text-slate-400">{mod.topics.length} topics · {mod.duration}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">{mod.description}</p>
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2.5">
                        <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Price</p>
                        <p className="text-xs font-bold text-[#0f55f7]">{fmt(mod.price)}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2.5">
                        <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Duration</p>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{mod.duration}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2.5">
                        <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Topics</p>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{mod.topics.length}</p>
                      </div>
                    </div>
                    {/* Module Topics */}
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                      <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Topics Covered</p>
                      <div className="flex flex-wrap gap-1">
                        {mod.topics.map((topic) => (
                          <span key={topic} className="inline-flex rounded-md bg-slate-100 dark:bg-slate-800/70 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600 dark:text-slate-400">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )
              })}

              {/* All Topics Covered */}
              <div className="rounded-[16px] border border-slate-200/70 bg-white/95 p-4 dark:border-slate-700/60 dark:bg-slate-900/80">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3">All Topics Covered</h3>
                <div className="flex flex-wrap gap-1.5">
                  {course.modules.flatMap((m) => m.topics).map((topic) => (
                    <span key={topic} className="rounded-lg bg-[#0f55f7]/5 dark:bg-[#0f55f7]/10 px-2.5 py-1 text-[10px] font-medium text-[#0f55f7] dark:text-[#0f55f7]/80 border border-[#0f55f7]/10">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Full Stack Sidebar */}
            <div className="space-y-3">
              {/* Course Stats */}
              <div className="rounded-[16px] border border-slate-200/70 bg-white/95 p-4 dark:border-slate-700/60 dark:bg-slate-900/80">
                <h3 className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-2.5">Course Stats</h3>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <ListOrdered className="w-3 h-3" /> Total Topics
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{course.modules.reduce((s, m) => s + m.topics.length, 0)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <DollarSign className="w-3 h-3" /> Total Price
                    </span>
                    <span className="font-bold text-[#0f55f7]">{fmt(course.totalPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> Total Duration
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{course.totalDuration}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <Layers className="w-3 h-3" /> Total Modules
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{course.totalModules}</span>
                  </div>
                </div>
              </div>

              {/* All Modules */}
              <div className="rounded-[16px] border border-slate-200/70 bg-white/95 p-4 dark:border-slate-700/60 dark:bg-slate-900/80">
                <h3 className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-2.5">All Modules</h3>
                <div className="space-y-1.5">
                  {course.modules.map((m) => {
                    const Mi = getModuleIcon(m.name)
                    return (
                      <button key={m.id} onClick={() => setActiveTab(m.id)}
                        className="w-full flex items-center gap-2.5 rounded-lg p-2.5 text-left transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500"><Mi className="w-3.5 h-3.5" /></div>
                        <div className="flex-1 min-w-0"><p className="text-[11px] font-semibold truncate">{m.name}</p><p className="text-[9px] text-slate-400">{m.topics.length} topics</p></div>
                        <ChevronRight className="w-3 h-3 shrink-0 text-slate-300" />
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="rounded-[16px] border border-slate-200/70 bg-white/95 p-4 dark:border-slate-700/60 dark:bg-slate-900/80">
                <h3 className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-2.5">Price Breakdown</h3>
                <div className="space-y-1.5">
                  {course.modules.map((m) => (
                    <div key={m.id} className="flex justify-between text-[11px] py-1">
                      <span className="text-slate-600 dark:text-slate-400">{m.name}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{fmt(m.price)}</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-1.5 mt-1.5 flex justify-between text-[11px]">
                    <span className="font-bold text-slate-900 dark:text-white">Total</span>
                    <span className="font-black text-[#0f55f7]">{fmt(course.totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── Individual Module Tab ─── */}
        {activeTab !== 'fullstack' && module && (
          <motion.div key={module.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-[16px] border border-slate-200/70 bg-white/95 p-4 dark:border-slate-700/60 dark:bg-slate-900/80">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-2">{module.name}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{module.description}</p>
                <div className="grid grid-cols-3 gap-2.5 mt-4">
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2.5"><p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Price</p><p className="text-xs font-bold text-slate-900 dark:text-white">{fmt(module.price)}</p></div>
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2.5"><p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Duration</p><p className="text-xs font-bold text-slate-900 dark:text-white">{module.duration}</p></div>
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2.5"><p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Topics</p><p className="text-xs font-bold text-slate-900 dark:text-white">{module.topics.length}</p></div>
                </div>
              </div>
              <div className="rounded-[16px] border border-slate-200/70 bg-white/95 p-4 dark:border-slate-700/60 dark:bg-slate-900/80">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3">Topics Covered</h3>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {module.topics.map((topic, i) => (
                    <motion.button
                      key={topic}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => navigate(`/organization/courses/${course.courseId}/modules/${module.id}/topics/${encodeURIComponent(topic)}`)}
                      className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 px-3 py-2 hover:bg-[#0f55f7]/10 dark:hover:bg-[#0f55f7]/20 transition-all group text-left w-full"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 group-hover:text-[#0f55f7] transition-colors" />
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-[#0f55f7] transition-colors">{topic}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-[16px] border border-slate-200/70 bg-white/95 p-4 dark:border-slate-700/60 dark:bg-slate-900/80">
                <h3 className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-2.5">All Modules</h3>
                <div className="space-y-1.5">
                  {course.modules.map((m) => {
                    const Mi = getModuleIcon(m.name)
                    return (
                      <button key={m.id} onClick={() => setActiveTab(m.id)}
                        className={`w-full flex items-center gap-2.5 rounded-lg p-2.5 text-left transition-all ${
                          activeTab === m.id ? 'bg-[#0f55f7]/10 text-[#0f55f7] dark:bg-[#0f55f7]/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300'
                        }`}>
                        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${activeTab === m.id ? 'bg-[#0f55f7] text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}><Mi className="w-3.5 h-3.5" /></div>
                        <div className="flex-1 min-w-0"><p className="text-[11px] font-semibold truncate">{m.name}</p><p className="text-[9px] text-slate-400">{m.topics.length} topics</p></div>
                        <ChevronRight className="w-3 h-3 shrink-0 text-slate-300" />
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="rounded-[16px] border border-slate-200/70 bg-white/95 p-4 dark:border-slate-700/60 dark:bg-slate-900/80">
                <h3 className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-2.5">Price Breakdown</h3>
                <div className="space-y-1.5">
                  {course.modules.map((m) => (
                    <div key={m.id} className="flex justify-between text-[11px] py-1"><span className="text-slate-600 dark:text-slate-400">{m.name}</span><span className="font-bold text-slate-900 dark:text-white">{fmt(m.price)}</span></div>
                  ))}
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-1.5 mt-1.5 flex justify-between text-[11px]"><span className="font-bold text-slate-900 dark:text-white">Total</span><span className="font-black text-[#0f55f7]">{fmt(course.totalPrice)}</span></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
