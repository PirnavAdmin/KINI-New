import { useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { User, Target, BookOpen, TrendingUp, Award, Star, Clock, BarChart3, GraduationCap, Briefcase, ArrowRight, CheckCircle, CircleDot, Trophy, Layers, Video, Bell, RefreshCw, Download, Filter, ShieldCheck, Sparkles } from 'lucide-react'
import { ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area } from 'recharts'
import toast from 'react-hot-toast'
import { useAuth } from '@shared/hooks/useAuth'
import { KPICard, DashboardSection, StatusBadge } from '@shared/components/SharedComponents'

const TOOLTIP_STYLE = { background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: '8px 12px', fontSize: '12px' }

const MOCK_SKILLS = [
  { name: 'React', level: 75, targetLevel: 90 },
  { name: 'Node.js', level: 65, targetLevel: 85 },
  { name: 'Python', level: 45, targetLevel: 80 },
  { name: 'TypeScript', level: 55, targetLevel: 75 },
  { name: 'MongoDB', level: 60, targetLevel: 80 },
]

const MOCK_GOALS = [
  { id: 1, title: 'Complete Full Stack Certification', progress: 65, status: 'in-progress', dueDate: 'Mar 2025' },
  { id: 2, title: 'Improve Python to Advanced Level', progress: 40, status: 'in-progress', dueDate: 'Jun 2025' },
  { id: 3, title: 'Lead 3 team projects', progress: 100, status: 'completed', dueDate: 'Jan 2025' },
]

const MOCK_LEARNING = [
  { title: 'Advanced React Patterns', provider: 'Frontend Masters', duration: '6 hours', relevance: 92, type: 'Course' },
  { title: 'Node.js Microservices', provider: 'Udemy', duration: '12 hours', relevance: 85, type: 'Course' },
  { title: 'Python for Data Science', provider: 'Coursera', duration: '8 hours', relevance: 78, type: 'Certification' },
]

const MOCK_PERFORMANCE = [
  { month: 'Aug', avgScore: 82 }, { month: 'Sep', avgScore: 78 }, { month: 'Oct', avgScore: 85 },
  { month: 'Nov', avgScore: 80 }, { month: 'Dec', avgScore: 88 }, { month: 'Jan', avgScore: 92 },
]

export default function EmployeeDashboard() {
  const navigate = useNavigate()
  const { user, role } = useAuth()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening'
  const displayName = user?.fullName || user?.name || user?.firstName || 'Employee'
  const workspaceLabel = role === 'org-admin' ? 'Admin workspace' : 'Employee workspace'
  const goalProgress = Math.round(MOCK_GOALS.reduce((a, g) => a + g.progress, 0) / MOCK_GOALS.length)
  const activeGoals = MOCK_GOALS.filter(g => g.status === 'in-progress').length
  const completedGoals = MOCK_GOALS.filter(g => g.status === 'completed').length
  const skillsAtTarget = MOCK_SKILLS.filter(s => s.level >= s.targetLevel).length

  const handleRefresh = useCallback(() => {
    toast.success('Dashboard refreshed!')
  }, [])

  const handleExport = useCallback(() => {
    toast.success('Dashboard data exported!')
  }, [])

  const handleFilter = useCallback(() => {
    toast.success('Filter options opened')
  }, [])

  return (
    <div className="mx-auto min-h-full w-full max-w-[1560px] space-y-2.5 bg-[var(--app-background)] sm:space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#DFE7EE] bg-white px-3 py-2.5 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/70">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0f55f7]/25 hover:text-[#0f55f7] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-[#06b6a8]/25 hover:text-[#06b6a8] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <button
            onClick={handleFilter}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300/60 hover:text-amber-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <Filter className="h-3.5 w-3.5" /> Filter
          </button>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
          <ShieldCheck className="h-3.5 w-3.5" />
          Workspace active
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-[#DFE7EE] bg-white p-4 shadow-sm sm:p-5"
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.72fr)] lg:items-start">
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#64748B]">
              <Sparkles className="h-3.5 w-3.5" />
              {workspaceLabel}
            </div>
            <div className="flex items-start gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EEF6FF] text-[#133B5D]">
                <User className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#64748B]">Hello again</p>
                <h1 className="mt-1 truncate text-2xl font-bold tracking-[-0.03em] text-[#133B5D] sm:text-[28px]">
                  {greeting}, {displayName}
                </h1>
                <p className="mt-1.5 max-w-2xl text-sm leading-5 text-slate-500">
                  A compact command center for approvals, learning progress, goals and team activity.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#DFE7EE] bg-[#FAFAFA] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#475569]">
                <Briefcase className="h-3 w-3" /> Software Engineer
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#DFE7EE] bg-[#FAFAFA] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#475569]">
                <Layers className="h-3 w-3" /> Engineering
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#DFE7EE] bg-[#FAFAFA] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#475569]">
                <BookOpen className="h-3 w-3" /> 6 courses
              </span>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-3">
            {[
              { label: 'Completion', value: '92%', hint: 'Learning score' },
              { label: 'Growth', value: '+8%', hint: 'This month' },
              { label: 'Reviews', value: '3', hint: 'Pending feedback' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-[#DFE7EE] bg-[#FBFBFB] p-3 text-center">
                <p className="text-xl font-bold tracking-tight text-[#133B5D]">{item.value}</p>
                <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
                <p className="mt-0.5 text-[10px] text-slate-400">{item.hint}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* KPI Row */}
      <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2 sm:grid-cols-[repeat(4,minmax(0,1fr))]">
        <KPICard dense icon={Star} label="Performance" value={92} suffix="%" change={8} color="#0f55f7" delay={0} onClick={() => navigate('/employee/performance')} />
        <KPICard dense icon={Target} label="Active Goals" value={activeGoals} changeLabel={`${completedGoals} done`} color="#06b6a8" delay={1} onClick={() => navigate('/employee/goals')} />
        <KPICard dense icon={Trophy} label="Goal Progress" value={goalProgress} suffix="%" changeLabel="Overall" color="#06b6a8" delay={2} onClick={() => navigate('/employee/goals')} />
        <KPICard dense icon={GraduationCap} label="Skills" value={MOCK_SKILLS.length} changeLabel={`${skillsAtTarget} at target`} color="#F59E0B" delay={3} onClick={() => navigate('/employee/skills')} />
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        {[
          { label: 'Priority today', value: 'Complete React Module 4', icon: Clock, color: '#EF4444', path: '/employee/my-learning' },
          { label: 'Next live class', value: 'React Hooks - Today 3PM', icon: Video, color: '#0f55f7', path: '/employee/live-classes' },
          { label: 'Notifications', value: '3 new updates', icon: Bell, color: '#F59E0B', path: '/employee/notifications' },
        ].map((item) => (
          <motion.button key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            type="button" onClick={() => navigate(item.path)}
            className="group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/90 p-3 text-left shadow-sm hover:-translate-y-0.5 hover:border-blue-500/25 hover:shadow-md dark:border-slate-700/40 dark:bg-slate-900/60 dark:hover:border-blue-500/30">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${item.color}14` }}>
              <item.icon className="h-5 w-5" style={{ color: item.color }} />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</span>
              <span className="mt-0.5 block truncate text-sm font-semibold text-slate-800 group-hover:text-blue-600 dark:text-slate-100">{item.value}</span>
            </span>
          </motion.button>
        ))}
      </div>

      {/* Goals + Learning */}
      <div className="grid grid-cols-1 gap-2.5 sm:gap-3 lg:grid-cols-6">
        <DashboardSection title="My Goals" subtitle={`${activeGoals} active`} icon={Target} className="lg:col-span-3">
          <div className="space-y-3">
            {MOCK_GOALS.map((goal, i) => (
              <motion.div key={goal.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}
                className="rounded-xl border border-slate-100 dark:border-slate-700/30 p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`w-2 h-2 rounded-full ${goal.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{goal.title}</p>
                  <StatusBadge status={goal.status === 'in-progress' ? 'active' : goal.status} />
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-teal-500" style={{ width: `${goal.progress}%` }} />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">{goal.progress}% · Due {goal.dueDate}</p>
              </motion.div>
            ))}
          </div>
        </DashboardSection>

        <DashboardSection title="Learning Recommendations" subtitle="AI-powered" icon={BookOpen} className="lg:col-span-3">
          <div className="space-y-3">
            {MOCK_LEARNING.map((rec, i) => (
              <motion.div key={rec.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * i }}
                onClick={() => navigate('/employee/my-learning')}
                className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-700/30 hover:border-slate-200 dark:hover:border-slate-600 transition-colors cursor-pointer group">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500/10 to-teal-500/10 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4.5 h-4.5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{rec.title}</p>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-blue-500/10 text-blue-600">{rec.type}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{rec.provider} · {rec.duration}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-teal-500" style={{ width: `${rec.relevance}%` }} />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400">{rec.relevance}% match</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
              </motion.div>
            ))}
          </div>
        </DashboardSection>
      </div>

      {/* Skills + Performance */}
      <div className="grid grid-cols-1 gap-2.5 sm:gap-3 lg:grid-cols-5">
        <DashboardSection title="My Skills" subtitle="Current vs target" icon={BarChart3} className="lg:col-span-3">
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_SKILLS} margin={{ top: 5, right: 10, left: -10, bottom: 0 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="level" name="Current" fill="#0f55f7" radius={[0, 4, 4, 0]} animationBegin={200} animationDuration={1000} />
                <Bar dataKey="targetLevel" name="Target" fill="#06b6a8" radius={[0, 4, 4, 0]} animationBegin={400} animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Current</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-teal-500" /> Target</span>
          </div>
        </DashboardSection>

        <DashboardSection title="Performance Trend" subtitle="Monthly" icon={Award} className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_PERFORMANCE} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs><linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0f55f7" stopOpacity={0.3} /><stop offset="95%" stopColor="#0f55f7" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="avgScore" stroke="#0f55f7" strokeWidth={2} fill="url(#perfGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </DashboardSection>
      </div>

      {/* Career Path */}
      <DashboardSection title="Career Path" subtitle="Your journey" icon={TrendingUp}>
        <div className="relative">
          <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-blue-500 via-teal-500 to-slate-200 dark:to-slate-700" />
          <div className="space-y-0">
            {[
              { title: 'Associate Engineer', period: '2021 - 2022', completed: true },
              { title: 'Software Engineer', period: '2022 - 2024', completed: true },
              { title: 'Senior Engineer', period: '2024 - Present', completed: false, current: true },
              { title: 'Tech Lead', period: 'Next milestone', completed: false },
            ].map((step, i) => (
              <motion.div key={step.title} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 * i }}
                className="relative flex items-start gap-4 pb-7 last:pb-0">
                <div className={`relative z-10 w-[38px] h-[38px] rounded-full flex items-center justify-center shrink-0 ${
                  step.current ? 'bg-gradient-to-br from-blue-500 to-teal-500 shadow-lg shadow-blue-500/20 ring-2 ring-white dark:ring-slate-900' :
                  step.completed ? 'bg-teal-500' : 'bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600'
                }`}>
                  {step.completed ? <CheckCircle className="w-[18px] h-[18px] text-white" /> :
                   step.current ? <CircleDot className="w-[18px] h-[18px] text-white" /> :
                   <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />}
                </div>
                <div className="pt-1.5">
                  <p className={`text-sm font-semibold ${step.current ? 'text-blue-600 dark:text-blue-400' : step.completed ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}`}>{step.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{step.period}</p>
                </div>
                {step.current && (
                  <span className="absolute -right-1 top-2 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">Current</span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </DashboardSection>
    </div>
  )
}
