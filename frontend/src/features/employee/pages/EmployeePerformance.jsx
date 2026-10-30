import { useState } from 'react'
import { TrendingUp, Award, Users, ArrowUp, ArrowDown, RefreshCw, Download, Filter, Eye, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { DashboardSection } from '@shared/components/SharedComponents'
import toast from 'react-hot-toast'

const TOOLTIP_STYLE = { background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: '8px 12px', fontSize: '12px' }

const MOCK_DATA = [
  { month: 'Aug', score: 82 }, { month: 'Sep', score: 78 }, { month: 'Oct', score: 85 },
  { month: 'Nov', score: 80 }, { month: 'Dec', score: 88 }, { month: 'Jan', score: 92 },
]

export default function EmployeePerformance() {
  const [dateFilter, setDateFilter] = useState('6months')

  const handleRefresh = () => {
    toast.success('Charts refreshed!')
  }

  const handleExport = () => {
    toast.success('Performance report exported!')
  }

  const handleFilterChange = (filter) => {
    setDateFilter(filter)
    toast.success(`Showing: ${filter}`)
  }

  const handleViewAnalytics = () => {
    toast.success('Opening detailed analytics...')
  }

  const stats = [
    { icon: TrendingUp, label: 'Overall Avg', value: '85%', change: '+4%', up: true, color: '#0f55f7' },
    { icon: Award, label: 'Completion', value: '83%', change: '+7%', up: true, color: '#06b6a8' },
    { icon: Users, label: 'Ranking', value: 'Top 15%', change: '+2%', up: true, color: '#F59E0B' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-5 py-4 sm:py-5 lg:py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Performance</h1>
          <p className="text-sm text-slate-500">Track your performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Date Filter */}
      <div className="flex items-center gap-2 mb-5">
        <Calendar className="w-4 h-4 text-slate-400" />
        {['6months', '3months', '1month', '1year'].map(range => (
          <button key={range} onClick={() => handleFilterChange(range)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${dateFilter === range ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
            {range === '6months' ? '6 Months' : range === '3months' ? '3 Months' : range === '1month' ? '1 Month' : '1 Year'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
            className="rounded-xl border border-slate-200/80 dark:border-slate-700/40 bg-white dark:bg-slate-900/60 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${s.color}15` }}><s.icon className="w-4 h-4" style={{ color: s.color }} /></div>
              <span className={`flex items-center gap-0.5 text-xs font-bold ${s.up ? 'text-emerald-600' : 'text-rose-600'}`}>{s.up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}{s.change}</span>
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{s.value}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <DashboardSection title="Performance Trend" subtitle="Monthly scores" icon={TrendingUp}
        action={
          <button onClick={handleViewAnalytics}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">
            <Eye className="w-3.5 h-3.5" /> View Analytics
          </button>
        }>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_DATA} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs><linearGradient id="perfGrad2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0f55f7" stopOpacity={0.3} /><stop offset="95%" stopColor="#0f55f7" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="score" stroke="#0f55f7" strokeWidth={2} fill="url(#perfGrad2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </DashboardSection>
    </div>
  )
}
