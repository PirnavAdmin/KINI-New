import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import KPI from "@/components/common/KPI";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  Legend,
} from "recharts";
import { Brain, Users, CheckCircle, Clock, TrendingUp, BookOpen, AlertTriangle, RefreshCw } from "lucide-react";
import { useSkills } from "../hooks/useSkills";

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const KPI_ICONS = {
  total: { icon: Brain, accent: "purple" },
  categories: { icon: BookOpen, accent: "blue" },
  verified: { icon: CheckCircle, accent: "green" },
  employees: { icon: Users, accent: "orange" },
  pending: { icon: Clock, accent: "red" },
  trending: { icon: TrendingUp, accent: "cyan" },
};

function KpiCard({ title, value, icon, accent, prefix = "", suffix = "" }) {
  return (
    <motion.div variants={item} className="h-full">
      <KPI value={`${prefix}${Number(value || 0).toLocaleString("en-IN")}`} suffix={suffix || undefined} label={title} icon={icon} accent={accent} size="compact" className="h-full" />
    </motion.div>
  );
}

function ChartCard({ title, subtitle, children, className = "" }) {
  return (
    <motion.div variants={item} className={`bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-5 ${className}`}>
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="w-full h-[350px] min-h-[350px] relative">
        {children}
      </div>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-lg text-xs">
        <p className="font-semibold text-slate-900 dark:text-white mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: <span className="font-bold">{p.value}</span></p>
        ))}
      </div>
    );
  }
  return null;
};

export default function SkillDashboard() {
  const { loadSkills, totalSkills, totalEmployeesMapped, verifiedSkills, pendingSkills, skillsByCategory, topPopularSkills, verificationStats, skillLevelDistribution, trendingSkills, categories, skills, loading, error } = useSkills();

  const skillsByType = useMemo(() => {
    const totals = skills.reduce((acc, skill) => {
      const type = skill.type && skill.type !== "-" ? skill.type : "Unspecified";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(totals)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [skills]);

  // Render

  // ── Load skills once on mount ────────────────────────────────
  // 🛑 CRITICAL FIX: loadSkills is now memoized with useCallback in the hook.
  //    Previously, a new function reference every render caused the effect
  //    to re-run on every Redux state update, creating an infinite loop.
  //    The local setTimeout-based 'loading' state is REMOVED — we use the
  //    Redux loading state directly.
  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Failed to Load Skills</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{error}</p>
          <button onClick={() => loadSkills()}
            className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-36 bg-slate-200 dark:bg-slate-700/50 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-80 bg-slate-200 dark:bg-slate-700/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (totalSkills === 0) {
    return (
      <div className="p-4 sm:p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/10">
            <Brain className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">No skills in the catalog yet</h1>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400">
            Add skills from Skill Master to populate organization-wide analytics and mapping insights.
          </p>
          <button type="button" onClick={loadSkills} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            <RefreshCw className="h-4 w-4" /> Refresh catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
      {/* Page Header */}
      <motion.div variants={item} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Skill Dashboard</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Real-time overview of organizational skills and competencies</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Live</span>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard title="Total Skills" value={totalSkills} {...KPI_ICONS.total} delay={0} />
        <KpiCard title="Categories" value={categories.length} {...KPI_ICONS.categories} delay={0.1} />
        <KpiCard title="Verified Skills" value={verifiedSkills} {...KPI_ICONS.verified} delay={0.15} />
        <KpiCard title="Employees Mapped" value={totalEmployeesMapped} {...KPI_ICONS.employees} delay={0.2} />
        <KpiCard title="Pending Verification" value={pendingSkills} {...KPI_ICONS.pending} delay={0.25} />
        <KpiCard title="Top Skill Usage" value={trendingSkills[0]?.employees || 0} {...KPI_ICONS.trending} delay={0.3} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <ChartCard title="Skills by Category" subtitle="Distribution of skills across categories">
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={350}>
            <BarChart data={skillsByCategory} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={40} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Skills" radius={[4, 4, 0, 0]} fill="#4F46E5" maxBarSize={32}>
                {skillsByCategory.map((_, i) => (
                  <Cell key={i} fill={["#4F46E5", "#7C3AED", "#2563EB", "#0891B2", "#059669", "#D97706", "#DC2626", "#9333EA", "#0EA5E9", "#84CC16"][i % 10]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top 10 Most Popular Skills" subtitle="By number of employees mapped">
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={350}>
            <BarChart data={topPopularSkills} layout="vertical" margin={{ top: 5, right: 20, left: -5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="employees" name="Employees" radius={[0, 4, 4, 0]} fill="#7C3AED" maxBarSize={16}>
                {topPopularSkills.map((_, i) => (
                  <Cell key={i} fill={`hsl(262, 83%, ${60 - i * 2.5}%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Skill Status" subtitle="Active, pending, and archived catalog entries">
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={350}>
            <PieChart>
              <Pie
                data={verificationStats}
                cx="50%" cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {verificationStats.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span className="text-xs text-slate-500">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <ChartCard title="Employee Skill Distribution" subtitle="Skill levels across the organization">
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={350}>
            <PieChart>
              <Pie
                data={skillLevelDistribution}
                cx="50%" cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {skillLevelDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span className="text-xs text-slate-500">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Skill Types" subtitle="Live composition of the current catalog">
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={350}>
            <BarChart data={skillsByType} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Skills" radius={[5, 5, 0, 0]} fill="#4F46E5" maxBarSize={46} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Trending Skills" subtitle="Top 5 skills by employee mapping">
          <div className="space-y-3 h-full flex flex-col justify-center">
            {trendingSkills.map((skill, i) => (
              <div key={skill.id} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white ${["bg-indigo-500", "bg-purple-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500"][i]}`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{skill.name}</span>
                    <span className="text-xs font-semibold text-slate-400">{skill.employees ?? 0}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000" style={{ width: `${Math.min(100, ((skill.employees ?? 0) / Math.max(1, trendingSkills[0]?.employees ?? 1)) * 100)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </motion.div>
  );
}
