import { motion } from 'framer-motion'
import { BarChart3, TrendingUp } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { DashboardSection } from '@shared/components/SharedComponents'

const TOOLTIP_STYLE = { background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: '8px 12px', fontSize: '12px' }

export default function EmployeeSkills() {
  const skills = [
    { name: 'React', level: 75, targetLevel: 90 }, { name: 'Node.js', level: 65, targetLevel: 85 },
    { name: 'Python', level: 45, targetLevel: 80 }, { name: 'TypeScript', level: 55, targetLevel: 75 },
    { name: 'MongoDB', level: 60, targetLevel: 80 }, { name: 'AWS', level: 30, targetLevel: 60 },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-5 py-4 sm:py-5 lg:py-6">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">My Skills</h1>
      <p className="text-sm text-slate-500 mb-6">Track your skill development</p>
      <DashboardSection title="Skill Matrix" subtitle="Current vs target" icon={BarChart3}>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={skills} margin={{ top: 5, right: 10, left: -10, bottom: 0 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="level" name="Current" fill="#0f55f7" radius={[0, 4, 4, 0]} />
              <Bar dataKey="targetLevel" name="Target" fill="#06b6a8" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Current</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-teal-500" /> Target</span>
        </div>
      </DashboardSection>
    </div>
  )
}
