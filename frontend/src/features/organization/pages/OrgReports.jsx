import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import KPI from "@/components/common/KPI";
import {
  Activity,
  Award,
  BarChart3,
  Brain,
  Building2,
  Clock,
  Download,
  MapPin,
  Star,
  Target,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import toast from "react-hot-toast";
import { getApiErrorMessage, reportsApi } from "@shared/services/apiServices";

const TOOLTIP_STYLE = {
  background: "rgba(255,255,255,0.95)",
  border: "none",
  borderRadius: "12px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
  padding: "8px 12px",
  fontSize: "12px",
};

const COLORS = ["#0f55f7", "#10B981", "#F59E0B", "#06b6a8", "#EF4444", "#06B6D4", "#84CC16"];

const TABS = [
  { id: "hr", label: "HR Analytics", icon: Users },
  { id: "skills", label: "Skills Analytics", icon: Brain },
  { id: "performance", label: "Performance Analytics", icon: TrendingUp },
  { id: "workforce", label: "Workforce Analytics", icon: Building2 },
];

const REPORT_REQUESTS = {
  hr: reportsApi.hrAnalytics,
  skills: reportsApi.skillsAnalytics,
  performance: reportsApi.performanceAnalytics,
  workforce: reportsApi.workforceAnalytics,
};

const pickArray = (data, keys) => {
  if (!data || typeof data !== "object") return [];
  for (const key of keys) {
    if (Array.isArray(data[key])) return data[key];
    if (Array.isArray(data.data?.[key])) return data.data[key];
  }
  return [];
};

const namedValues = (rows, nameKeys, valueKeys) => rows.map((row, index) => ({
  ...row,
  name: nameKeys.map((key) => row?.[key]).find((value) => value != null) ?? `Item ${index + 1}`,
  value: Number(valueKeys.map((key) => row?.[key]).find((value) => value != null) ?? 0),
  color: row?.color ?? COLORS[index % COLORS.length],
}));

const escapeCsvValue = (value) => {
  const stringValue = value === null || value === undefined ? "" : String(value);
  return `"${stringValue.replace(/"/g, '""')}"`;
};

const downloadCsv = (rows, fileName) => {
  if (!Array.isArray(rows) || rows.length === 0) throw new Error("No data available to export");
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(",")),
  ].join("\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const buildExportRows = (data) => {
  const rows = [];
  const visit = (value, path = "summary", record = "summary") => {
    if (value === null || value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((child, index) => visit(child, path, String(index + 1)));
    } else if (typeof value === "object") {
      Object.entries(value).forEach(([key, child]) => visit(child, path === "summary" ? key : `${path}.${key}`, record));
    } else {
      rows.push({ section: path.split(".")[0], record, field: path, value });
    }
  };
  visit(data);
  return rows;
};

const getTodayDate = () => {
  const date = new Date();
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
};

function KpiCard({ icon, label, value, color }) {
  return <KPI value={value} label={label} icon={icon} accent={color} size="compact" className="h-full" />;
}

function ChartCard({ title, subtitle, data, children, className = "" }) {
  return (
    <div className={`min-w-0 rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/70 ${className}`}>
      <div className="mb-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>}
      </div>
      {data.length ? <div className="relative h-[320px] min-h-[320px] w-full">{children}</div> : (
        <div className="flex h-[240px] flex-col items-center justify-center rounded-xl bg-slate-50/70 text-center dark:bg-slate-800/30">
          <BarChart3 className="mb-2 h-8 w-8 text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No analytics data available</p>
          <p className="mt-1 text-xs text-slate-400">Insights will appear when report data is available.</p>
        </div>
      )}
    </div>
  );
}

function KpiGrid({ items }) {
  return <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">{items.map((item) => <KpiCard key={item.label} {...item} />)}</div>;
}

function StandardBarChart({ data, xKey = "name", bars }) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={320}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        {bars.map((bar, index) => <Bar key={bar.key} dataKey={bar.key} name={bar.label} fill={COLORS[index]} radius={[4, 4, 0, 0]} maxBarSize={28} />)}
      </BarChart>
    </ResponsiveContainer>
  );
}

function DistributionChart({ data }) {
  return (
    <>
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={320}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
            {data.map((entry) => <Cell key={entry.name} fill={entry.color} stroke="transparent" />)}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} />
        </PieChart>
      </ResponsiveContainer>
      <div className="-mt-7 flex flex-wrap justify-center gap-x-3 gap-y-1">
        {data.map((entry) => <span key={entry.name} className="flex items-center gap-1.5 text-xs text-slate-500"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />{entry.name}</span>)}
      </div>
    </>
  );
}

function HRTab({ data }) {
  const hiring = pickArray(data, ["hiringTrends", "hiringTrend", "monthlyHiring", "hiresByMonth"]).map((row) => ({
    ...row,
    month: row.month ?? row.label ?? row.period ?? row.date,
    hires: Number(row.hires ?? row.newHires ?? row.value ?? 0),
    applications: Number(row.applications ?? row.applicants ?? 0),
  }));
  const departments = namedValues(pickArray(data, ["departmentDistribution", "deptDistribution", "employeesByDepartment", "departmentHeadcount"]), ["name", "department", "departmentName", "label"], ["value", "count", "employees", "headcount"]);
  const attendance = pickArray(data, ["attendanceTrend", "attendanceTrends", "monthlyAttendance"]).map((row) => ({
    ...row,
    month: row.month ?? row.label ?? row.period ?? row.date,
    rate: Number(row.rate ?? row.attendanceRate ?? row.value ?? 0),
  }));
  const kpis = [
    { label: "Total Employees", value: data.totalEmployees ?? 0, color: "#0f55f7", icon: Users },
    { label: "Active Employees", value: data.activeEmployees ?? 0, color: "#10B981", icon: UserCheck },
    { label: "Attendance Rate", value: `${data.attendanceRate ?? 0}%`, color: "#06b6a8", icon: Clock },
    { label: "Attrition Rate", value: `${data.attritionRate ?? 0}%`, color: "#F59E0B", icon: Activity },
  ];
  return <div className="space-y-3"><KpiGrid items={kpis} /><div className="grid gap-3 lg:grid-cols-5"><ChartCard title="Hiring Trends" subtitle="Monthly hires and applications" data={hiring} className="lg:col-span-3"><StandardBarChart data={hiring} xKey="month" bars={[{ key: "hires", label: "Hires" }, { key: "applications", label: "Applications" }]} /></ChartCard><ChartCard title="Department Distribution" subtitle="Headcount by department" data={departments} className="lg:col-span-2"><DistributionChart data={departments} /></ChartCard></div><ChartCard title="Attendance Trends" subtitle="Monthly attendance rate" data={attendance}><ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={320}><LineChart data={attendance}><CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} /><XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={TOOLTIP_STYLE} /><Line type="monotone" dataKey="rate" stroke="#10B981" strokeWidth={2.5} /></LineChart></ResponsiveContainer></ChartCard></div>;
}

function SkillsTab({ data }) {
  const topSkills = pickArray(data, ["topSkills", "skills", "skillDemand"]).map((row, index) => ({ ...row, name: row.name ?? row.skill ?? row.skillName ?? `Skill ${index + 1}`, employees: Number(row.employees ?? row.employeeCount ?? row.count ?? 0), demand: Number(row.demand ?? row.demandScore ?? row.required ?? 0) }));
  const gaps = pickArray(data, ["skillGap", "skillGaps", "gapAnalysis"]).map((row, index) => ({ ...row, name: row.skill ?? row.name ?? row.skillName ?? `Skill ${index + 1}`, current: Number(row.current ?? row.available ?? row.employeeCount ?? 0), gap: Number(row.gap ?? Math.max(0, Number(row.demand ?? row.required ?? 0) - Number(row.current ?? row.available ?? 0))) }));
  const certifications = pickArray(data, ["certificationCompletion", "certCompletion", "certifications"]).map((row, index) => ({ ...row, name: row.name ?? row.certification ?? row.title ?? `Certification ${index + 1}`, completed: Number(row.completed ?? row.completedCount ?? 0), enrolled: Number(row.enrolled ?? row.enrolledCount ?? row.total ?? 0) }));
  const kpis = [
    { label: "Skills Tracked", value: data.totalSkills ?? topSkills.length, color: "#0f55f7", icon: Brain },
    { label: "Skill Gaps", value: data.totalSkillGaps ?? gaps.length, color: "#EF4444", icon: Target },
    { label: "Certifications", value: data.totalCertifications ?? certifications.length, color: "#10B981", icon: Award },
    { label: "Employees Assessed", value: data.employeesAssessed ?? 0, color: "#06b6a8", icon: Users },
  ];
  return <div className="space-y-3"><KpiGrid items={kpis} /><div className="grid gap-3 lg:grid-cols-2"><ChartCard title="Top Skills" subtitle="Employee count and demand" data={topSkills}><StandardBarChart data={topSkills} bars={[{ key: "employees", label: "Employees" }, { key: "demand", label: "Demand" }]} /></ChartCard><ChartCard title="Skill Gap Analysis" subtitle="Current availability and gaps" data={gaps}><StandardBarChart data={gaps} bars={[{ key: "current", label: "Current" }, { key: "gap", label: "Gap" }]} /></ChartCard></div><ChartCard title="Certification Completion" subtitle="Enrolled vs completed" data={certifications}><StandardBarChart data={certifications} bars={[{ key: "completed", label: "Completed" }, { key: "enrolled", label: "Enrolled" }]} /></ChartCard></div>;
}

function PerformanceTab({ data }) {
  const trend = pickArray(data, ["scoreTrend", "performanceTrend", "monthlyPerformance"]).map((row) => ({ ...row, month: row.month ?? row.label ?? row.period ?? row.date, score: Number(row.score ?? row.performance ?? row.value ?? 0) }));
  const departments = pickArray(data, ["departmentPerformance", "deptPerformance", "performanceByDepartment"]).map((row, index) => ({ ...row, name: row.name ?? row.department ?? row.departmentName ?? `Department ${index + 1}`, score: Number(row.score ?? row.performance ?? row.value ?? 0), goals: Number(row.goals ?? row.goalCompletion ?? row.goalCompletionRate ?? 0) }));
  const performers = pickArray(data, ["topPerformers", "highestRatedEmployees"]);
  const kpis = [
    { label: "Avg Performance", value: `${data.averagePerformance ?? data.avgPerformance ?? 0}%`, color: "#0f55f7", icon: Star },
    { label: "Goal Completion", value: `${data.goalCompletion ?? data.goalCompletionRate ?? 0}%`, color: "#10B981", icon: Target },
    { label: "Top Performers", value: data.topPerformerCount ?? performers.length, color: "#F59E0B", icon: Award },
    { label: "Avg Satisfaction", value: data.averageSatisfaction ?? data.avgSatisfaction ?? 0, color: "#06b6a8", icon: Activity },
  ];
  return <div className="space-y-3"><KpiGrid items={kpis} /><div className="grid gap-3 lg:grid-cols-5"><ChartCard title="Performance Score Trend" subtitle="Monthly average performance" data={trend} className="lg:col-span-3"><ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={320}><LineChart data={trend}><CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} /><XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={TOOLTIP_STYLE} /><Line type="monotone" dataKey="score" stroke="#0f55f7" strokeWidth={2.5} /></LineChart></ResponsiveContainer></ChartCard><ChartCard title="Top Performers" subtitle="Highest rated employees" data={performers} className="lg:col-span-2"><div className="h-[320px] space-y-2 overflow-y-auto">{performers.map((performer, index) => { const name = performer.name ?? performer.employeeName ?? performer.fullName ?? `Employee ${index + 1}`; return <div key={performer.id ?? performer.employeeId ?? name} className="flex items-center gap-3 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800/30"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0f55f7] to-[#06b6a8] text-[10px] font-bold text-white">{name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{name}</p><p className="truncate text-xs text-slate-400">{performer.role ?? performer.designation ?? "-"}</p></div><span className="text-sm font-bold text-slate-900 dark:text-white">{performer.score ?? performer.performanceScore ?? 0}</span></div>; })}</div></ChartCard></div><ChartCard title="Department Performance" subtitle="Scores across departments" data={departments}><StandardBarChart data={departments} bars={[{ key: "score", label: "Performance" }, { key: "goals", label: "Goal Completion" }]} /></ChartCard></div>;
}

function WorkforceTab({ data }) {
  const experience = namedValues(pickArray(data, ["experienceLevels", "experienceDistribution", "seniorityDistribution"]), ["name", "level", "seniority", "label"], ["value", "count", "employees", "headcount"]);
  const locations = namedValues(pickArray(data, ["locationData", "locationDistribution", "employeesByLocation", "locations"]), ["name", "location", "city", "label"], ["value", "count", "employees", "headcount"]);
  const teams = namedValues(pickArray(data, ["teamSize", "teamSizeDistribution", "teamsBySize"]), ["name", "range", "size", "label"], ["value", "count", "teams"]);
  const kpis = [
    { label: "Total Headcount", value: data.totalHeadcount ?? data.totalEmployees ?? 0, color: "#0f55f7", icon: Users },
    { label: "Avg Tenure", value: data.averageTenure ?? data.avgTenure ?? 0, color: "#10B981", icon: Clock },
    { label: "Departments", value: data.totalDepartments ?? 0, color: "#06b6a8", icon: Building2 },
    { label: "Locations", value: data.totalLocations ?? locations.length, color: "#F59E0B", icon: MapPin },
  ];
  return <div className="space-y-3"><KpiGrid items={kpis} /><div className="grid gap-3 lg:grid-cols-3"><ChartCard title="Experience Levels" subtitle="Seniority distribution" data={experience}><DistributionChart data={experience} /></ChartCard><ChartCard title="Location Distribution" subtitle="Employees by office" data={locations}><DistributionChart data={locations} /></ChartCard><ChartCard title="Team Size Distribution" subtitle="Teams by headcount" data={teams}><DistributionChart data={teams} /></ChartCard></div></div>;
}

export default function OrgReports() {
  const [activeTab, setActiveTab] = useState("hr");
  const [hrData, setHrData] = useState(null);
  const [skillsData, setSkillsData] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [workforceData, setWorkforceData] = useState(null);
  const [loadingTabs, setLoadingTabs] = useState({ hr: true, skills: true, performance: true, workforce: true });
  const [tabErrors, setTabErrors] = useState({});
  const [exporting, setExporting] = useState(false);

  const loadReport = useCallback(async (tab) => {
    const setters = { hr: setHrData, skills: setSkillsData, performance: setPerformanceData, workforce: setWorkforceData };
    setLoadingTabs((current) => ({ ...current, [tab]: true }));
    setTabErrors((current) => ({ ...current, [tab]: "" }));
    try {
      setters[tab]((await REPORT_REQUESTS[tab]()) ?? {});
    } catch (error) {
      setTabErrors((current) => ({ ...current, [tab]: getApiErrorMessage(error, `Unable to load ${tab} analytics`) }));
    } finally {
      setLoadingTabs((current) => ({ ...current, [tab]: false }));
    }
  }, []);

  useEffect(() => {
    TABS.forEach((tab) => { void loadReport(tab.id); });
  }, [loadReport]);

  const reportsByTab = useMemo(() => ({ hr: hrData, skills: skillsData, performance: performanceData, workforce: workforceData }), [hrData, skillsData, performanceData, workforceData]);
  const activeData = reportsByTab[activeTab];
  const activeLoading = Boolean(loadingTabs[activeTab]);
  const activeError = tabErrors[activeTab];

  const handleExport = async () => {
    try {
      setExporting(true);
      await new Promise((resolve) => window.requestAnimationFrame(resolve));
      downloadCsv(buildExportRows(activeData), `${activeTab}-analytics-${getTodayDate()}.csv`);
      toast.success("Report exported successfully");
    } catch (error) {
      toast.error(error?.message || "Unable to export report");
    } finally {
      setExporting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full min-w-0 space-y-3 px-1 pb-5 pt-0 sm:px-1.5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-cyan-50 shadow-inner dark:from-blue-500/20 dark:to-cyan-500/10"><BarChart3 className="h-5 w-5 text-[#0f55f7]" /></div><div className="min-w-0"><h1 className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-2xl">Reports & Analytics</h1><p className="truncate text-sm text-slate-400 dark:text-slate-500">Data-driven insights for strategic workforce planning.</p></div></div>
        <button type="button" onClick={handleExport} disabled={exporting || activeLoading || !activeData} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#0f55f7]/30 transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"><Download className="h-4 w-4" />{exporting ? "Exporting..." : "Export Report"}</button>
      </div>
      <div role="tablist" className="flex max-w-full gap-1 overflow-x-auto rounded-xl border border-slate-200/70 bg-white/80 p-1 shadow-sm backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/70">
        {TABS.map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} className={`flex h-10 items-center gap-2 whitespace-nowrap rounded-lg px-3.5 text-sm font-semibold transition-all ${activeTab === tab.id ? "bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] text-white shadow-md shadow-[#0f55f7]/20" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-300"}`}><tab.icon className="h-4 w-4" />{tab.label}</button>)}
      </div>
      {activeLoading ? <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-[82px] animate-pulse rounded-xl border border-slate-200/50 bg-white/70 dark:border-slate-700/50 dark:bg-slate-900/70" />)}</div> : activeError ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center dark:border-red-500/20 dark:bg-red-500/10"><p className="text-sm text-red-700 dark:text-red-300">{activeError}</p><button type="button" onClick={() => loadReport(activeTab)} className="mt-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 dark:border-red-500/30 dark:text-red-300">Retry</button></div> : <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="min-w-0">{activeTab === "hr" && <HRTab data={hrData || {}} />}{activeTab === "skills" && <SkillsTab data={skillsData || {}} />}{activeTab === "performance" && <PerformanceTab data={performanceData || {}} />}{activeTab === "workforce" && <WorkforceTab data={workforceData || {}} />}</motion.div>}
    </motion.div>
  );
}
