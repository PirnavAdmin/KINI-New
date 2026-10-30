import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AlertTriangle, BookOpen, Brain, CheckCircle2, Layers3, RefreshCw } from 'lucide-react'
import CountUpModule from 'react-countup'
import { useSkills } from '../hooks/useSkills'

const CountUp = CountUpModule.default
const item = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } }
const TYPE_COLORS = ['#2563EB', '#06B6D4', '#8B5CF6', '#10B981', '#F59E0B', '#F43F5E']

function ChartPanel({ title, subtitle, children }) {
  return (
    <motion.section variants={item} className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 sm:p-5">
      <h2 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h2>
      <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
      <div className="mt-4 h-[310px] min-h-[310px] w-full">{children}</div>
    </motion.section>
  )
}

function AnalyticsTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-slate-700 dark:bg-slate-800">
      {label && <p className="mb-1 font-semibold text-slate-900 dark:text-white">{label}</p>}
      {payload.map((entry) => <p key={entry.name} className="text-slate-500 dark:text-slate-300">{entry.name}: <strong>{entry.value}</strong></p>)}
    </div>
  )
}

export default function SkillAnalytics() {
  const { skills, categories, loading, error, loadSkills, skillsByCategory, verificationStats } = useSkills()

  useEffect(() => {
    loadSkills()
  }, [loadSkills])

  const skillsByType = useMemo(() => {
    const counts = skills.reduce((result, skill) => {
      const type = skill.type && skill.type !== '-' ? skill.type : 'Unspecified'
      result[type] = (result[type] || 0) + 1
      return result
    }, {})
    return Object.entries(counts).map(([name, value], index) => ({ name, value, color: TYPE_COLORS[index % TYPE_COLORS.length] }))
  }, [skills])

  const activeSkills = skills.filter((skill) => ['active', 'verified'].includes(String(skill.status).toLowerCase())).length
  const pendingSkills = skills.filter((skill) => String(skill.status).toLowerCase() === 'pending').length
  const stats = [
    { label: 'Total Skills', value: skills.length, icon: Brain, className: 'from-blue-600 to-indigo-600' },
    { label: 'Categories', value: categories.length, icon: Layers3, className: 'from-violet-500 to-purple-600' },
    { label: 'Active Skills', value: activeSkills, icon: CheckCircle2, className: 'from-emerald-500 to-teal-600' },
    { label: 'Pending Review', value: pendingSkills, icon: BookOpen, className: 'from-amber-500 to-orange-600' },
  ]

  if (loading) {
    return <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-72 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />)}</div>
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6"><div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-500/25 dark:bg-red-500/10"><AlertTriangle className="mx-auto h-8 w-8 text-red-500" /><h1 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">Unable to load skill analytics</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{error}</p><button type="button" onClick={loadSkills} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white"><RefreshCw className="h-4 w-4" />Retry</button></div></div>
    )
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }} className="mx-auto max-w-7xl space-y-5 px-4 py-5 sm:px-6 sm:py-6">
      <motion.header variants={item} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Skill Analytics</h1><p className="mt-1 text-sm text-slate-400">Live insights from your organization skill catalog</p></div>
        <button type="button" onClick={loadSkills} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"><RefreshCw className="h-4 w-4" />Refresh</button>
      </motion.header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={item} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/80">
            <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${stat.className}`} />
            <div className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br text-white ${stat.className}`}><stat.icon className="h-4 w-4" /></div>
            <p className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-white"><CountUp end={stat.value} duration={1.2} /></p>
            <p className="mt-1 text-xs font-medium text-slate-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {skills.length === 0 ? (
        <motion.div variants={item} className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-4 py-16 text-center dark:border-slate-700 dark:bg-slate-900/70"><Brain className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" /><h2 className="mt-3 font-bold text-slate-800 dark:text-white">No skill data available</h2><p className="mt-1 text-sm text-slate-400">Create skills in Skill Master to populate analytics.</p></motion.div>
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-2">
            <ChartPanel title="Skills by category" subtitle="Number of catalog skills in each category">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={310}>
                <BarChart data={skillsByCategory} margin={{ top: 5, right: 10, left: -20, bottom: 30 }}><CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" vertical={false} /><XAxis dataKey="name" angle={-20} textAnchor="end" interval={0} tick={{ fontSize: 10 }} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip content={<AnalyticsTooltip />} /><Bar dataKey="count" name="Skills" fill="#2563EB" radius={[5, 5, 0, 0]} maxBarSize={42} /></BarChart>
              </ResponsiveContainer>
            </ChartPanel>
            <ChartPanel title="Catalog composition" subtitle="Live distribution by skill type">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={310}>
                <PieChart><Pie data={skillsByType} dataKey="value" nameKey="name" cx="50%" cy="46%" innerRadius={55} outerRadius={90} paddingAngle={3}>{skillsByType.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip content={<AnalyticsTooltip />} /><Legend verticalAlign="bottom" formatter={(value) => <span className="text-xs text-slate-500 dark:text-slate-300">{value}</span>} /></PieChart>
              </ResponsiveContainer>
            </ChartPanel>
          </div>
          <ChartPanel title="Verification status" subtitle="Active, pending, and archived catalog records">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={310}>
              <BarChart data={verificationStats.filter((entry) => entry.value > 0)} layout="vertical" margin={{ top: 10, right: 25, left: 10, bottom: 10 }}><CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" horizontal={false} /><XAxis type="number" allowDecimals={false} /><YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} /><Tooltip content={<AnalyticsTooltip />} /><Bar dataKey="value" name="Skills" radius={[0, 5, 5, 0]} maxBarSize={32}>{verificationStats.filter((entry) => entry.value > 0).map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Bar></BarChart>
            </ResponsiveContainer>
          </ChartPanel>
        </>
      )}
    </motion.div>
  )
}
