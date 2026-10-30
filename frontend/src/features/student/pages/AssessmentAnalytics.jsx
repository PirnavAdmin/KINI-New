import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BarChart3, TrendingUp, Target, Brain, Clock, ArrowLeft,
  Download, Zap, Award, Star, Activity
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip,
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const TOOLTIP_STYLE = {
  background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: '12px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: '8px 12px', fontSize: '12px',
}

const SCORE_TREND = [
  { month: 'Sep', score: 65 }, { month: 'Oct', score: 72 }, { month: 'Nov', score: 68 },
  { month: 'Dec', score: 78 }, { month: 'Jan', score: 85 }, { month: 'Feb', score: 82 },
]

const TOPIC_PERFORMANCE = [
  { topic: 'JavaScript', score: 88 }, { topic: 'React', score: 82 },
  { topic: 'TypeScript', score: 76 }, { topic: 'Node.js', score: 70 },
  { topic: 'CSS', score: 90 }, { topic: 'Testing', score: 65 },
]

const SKILL_RADAR = [
  { skill: 'Frontend', value: 85, fullMark: 100 },
  { skill: 'Backend', value: 65, fullMark: 100 },
  { skill: 'Data', value: 72, fullMark: 100 },
  { skill: 'DevOps', value: 45, fullMark: 100 },
  { skill: 'Algorithms', value: 70, fullMark: 100 },
  { skill: 'Design', value: 78, fullMark: 100 },
]

const ACCURACY_DATA = [
  { name: 'Easy', correct: 92, incorrect: 8 },
  { name: 'Medium', correct: 78, incorrect: 22 },
  { name: 'Hard', correct: 55, incorrect: 45 },
]

const TIME_DISTRIBUTION = [
  { name: 'Easy', time: 12 },
  { name: 'Medium', time: 28 },
  { name: 'Hard', time: 35 },
  { name: 'Review', time: 15 },
]

const LEARNING_PROGRESS = [
  { month: 'Week 1', progress: 20 }, { month: 'Week 2', progress: 35 },
  { month: 'Week 3', progress: 45 }, { month: 'Week 4', progress: 60 },
  { month: 'Week 5', progress: 72 }, { month: 'Week 6', progress: 88 },
]

export default function AssessmentAnalytics() {
  const navigate = useNavigate()

  return (
    <div className="w-full max-w-none px-4 sm:px-5 lg:px-6 py-4 sm:py-5 lg:py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0f55f7]/10 to-[#06b6a8]/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-[#0f55f7]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Performance Analytics</h1>
            <p className="text-sm text-slate-400">Detailed insights across all assessments</p>
          </div>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
          <Download className="w-3.5 h-3.5" /> Export Report
        </button>
      </motion.div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Award, label: 'Avg Score', value: '84%', change: '+5%', color: '#0f55f7' },
          { icon: Zap, label: 'Assessments', value: '12', change: '+2', color: '#06b6a8' },
          { icon: Star, label: 'Certificates', value: '5', change: '+1', color: '#06b6a8' },
          { icon: Activity, label: 'Accuracy', value: '78%', change: '+3%', color: '#F59E0B' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * i }}
            className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/40 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <span className="text-[10px] font-semibold text-[#06b6a8]">{stat.change}</span>
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            <p className="text-[10px] text-slate-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Score Trend */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/40 rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[#0f55f7]" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Score Trend</h2>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SCORE_TREND} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f55f7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0f55f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="score" stroke="#0f55f7" strokeWidth={2.5} fill="url(#scoreGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Topic Performance */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/40 rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-[#06b6a8]" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Topic Performance</h2>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TOPIC_PERFORMANCE} margin={{ top: 5, right: 5, left: -10, bottom: 0 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="topic" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={70} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="score" name="Score" fill="#06b6a8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Skill Radar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/40 rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-[#06b6a8]" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Skill Radar</h2>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={SKILL_RADAR} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <PolarGrid stroke="rgba(148,163,184,0.2)" />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Radar name="Your Skills" dataKey="value" stroke="#06b6a8" fill="#06b6a8" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Accuracy by Difficulty */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/40 rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-[#F59E0B]" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Accuracy by Difficulty</h2>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ACCURACY_DATA} margin={{ top: 5, right: 5, left: -10, bottom: 0 }} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="correct" name="Correct %" stackId="a" fill="#06b6a8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="incorrect" name="Incorrect %" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Time Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/40 rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-[#EC4899]" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Time Distribution</h2>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={TIME_DISTRIBUTION} cx="50%" cy="50%" outerRadius={70}
                  paddingAngle={3} dataKey="time" animationBegin={300} animationDuration={1000}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {TIME_DISTRIBUTION.map((entry, i) => (
                    <Cell key={i} fill={['#0f55f7', '#06b6a8', '#EC4899', '#F59E0B'][i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Learning Progress */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/40 rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[#06b6a8]" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Learning Progress</h2>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={LEARNING_PROGRESS} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6a8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6a8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="progress" stroke="#06b6a8" strokeWidth={2.5} fill="url(#progressGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Back button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6"
      >
        <button
          onClick={() => navigate('/student/assessments')}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Assessments
        </button>
      </motion.div>
    </div>
  )
}



