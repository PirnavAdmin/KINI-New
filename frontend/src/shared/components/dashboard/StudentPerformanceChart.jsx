import { memo, useMemo } from "react";
import { AlertCircle, BarChart3, RefreshCw } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardSection } from "@shared/components/SharedComponents";

const TOOLTIP_STYLE = {
  background: "rgba(255,255,255,0.98)",
  border: "none",
  borderRadius: "12px",
  boxShadow: "0 10px 28px rgba(15,23,42,0.12)",
  padding: "8px 12px",
  fontSize: "12px",
};

const MAX_STUDENTS = 6;

const isArrayWithItems = (value) => Array.isArray(value) && value.length > 0;

const isPlainObject = (value) => (
  value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length > 0
);

const extractArray = (value, keys = []) => {
  if (isArrayWithItems(value)) return value;
  if (!isPlainObject(value)) return [];

  for (const key of keys) {
    const candidate = value[key] ?? value.data?.[key];
    if (isArrayWithItems(candidate)) return candidate;
  }

  for (const child of Object.values(value)) {
    if (isArrayWithItems(child)) return child;
    if (isPlainObject(child)) {
      const nested = extractArray(child, keys);
      if (nested.length) return nested;
    }
  }

  return [];
};

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizePercentage = (value) => {
  const numberValue = toNumber(value);
  if (numberValue === null) return null;
  const percentage = numberValue > 0 && numberValue <= 1
    ? Math.round(numberValue * 100)
    : Math.round(numberValue);
  return Math.min(100, Math.max(0, percentage));
};

const getStudentName = (row) => {
  const name = [
    row?.fullName,
    [row?.firstName, row?.lastName].filter(Boolean).join(" ").trim(),
    row?.studentName,
    row?.name,
    row?.displayName,
    row?.email,
  ].find((value) => typeof value === "string" && value.trim());

  return String(name || "").trim();
};

const getStudentValue = (row, keys, normalizer = toNumber) => {
  for (const key of keys) {
    const value = normalizer(row?.[key]);
    if (value !== null) return value;
  }
  return null;
};

const collectRows = ({ students, dashboardData, statsData }) => {
  const sources = [
    isArrayWithItems(students) ? students : [],
    extractArray(dashboardData, ["studentPerformance", "studentPerformances", "performanceByStudent", "students", "studentRows", "rows", "items", "data"]),
    extractArray(statsData, ["studentPerformance", "studentPerformances", "performanceByStudent", "students", "studentRows", "rows", "items", "data"]),
  ].filter((source) => source.length > 0);

  for (const source of sources) {
    const normalized = source
      .map((row, index) => {
        const name = getStudentName(row);
        if (!name) return null;

        const attendance = getStudentValue(row, [
          "attendancePercentage",
          "attendanceRate",
          "attendance",
          "attendancePercent",
          "attendanceValue",
        ], normalizePercentage);

        const assessments = getStudentValue(row, [
          "assessmentsCleared",
          "completedAssessments",
          "assessmentCount",
          "assessments",
          "clearedAssessments",
          "passedAssessments",
        ]);

        if (attendance === null && assessments === null) return null;

        return {
          id: row?.studentId ?? row?.id ?? row?.userId ?? row?.email ?? `${name}-${index}`,
          name,
          attendance: attendance ?? 0,
          assessments: assessments ?? 0,
        };
      })
      .filter(Boolean)
      .slice(0, MAX_STUDENTS);

    if (normalized.length) return normalized;
  }

  return [];
};

function StudentPerformanceChart({
  students = [],
  dashboardData = null,
  statsData = null,
  loading = false,
  error = "",
  onRetry,
}) {
  const chartData = useMemo(
    () => collectRows({ students, dashboardData, statsData }),
    [students, dashboardData, statsData]
  );

  const hasData = chartData.length > 0;

  return (
    <DashboardSection
      title="Student Performance"
      subtitle="Attendance % vs Assessments Cleared"
      icon={BarChart3}
      action={
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Live Data
        </span>
      }
      className="!border-slate-200/90 !bg-white/90 !shadow-[0_14px_35px_-24px_rgba(15,23,42,0.35)] dark:!border-slate-700 dark:!bg-slate-900/90"
    >
      {loading ? (
        <div className="space-y-3">
          <div className="h-5 w-44 rounded-full bg-slate-200/80 dark:bg-slate-700/60" />
          <div className="h-80 rounded-2xl bg-slate-100/80 dark:bg-slate-800/50 animate-pulse" />
        </div>
      ) : error && !hasData ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center dark:border-red-500/20 dark:bg-red-500/10">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <p className="mt-4 text-sm font-semibold text-red-700 dark:text-red-300">{error}</p>
          <p className="mt-1 text-sm text-red-600/80 dark:text-red-200/80">No performance data available.</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-50 dark:border-red-500/20 dark:bg-slate-900 dark:text-red-300 dark:hover:bg-slate-800"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          )}
        </div>
      ) : hasData ? (
        <div className="h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 10, left: -12, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#94A3B8" }}
                axisLine={false}
                tickLine={false}
                interval={0}
                height={48}
              />
              <YAxis
                yAxisId="attendance"
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: "#94A3B8" }}
                axisLine={false}
                tickLine={false}
                width={42}
                label={{ value: "Attendance %", angle: -90, position: "insideLeft", fill: "#94A3B8", style: { fontSize: 11 } }}
              />
              <YAxis
                yAxisId="assessments"
                orientation="right"
                domain={[0, "dataMax + 1"]}
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#94A3B8" }}
                axisLine={false}
                tickLine={false}
                width={42}
                label={{ value: "Assessments", angle: 90, position: "insideRight", fill: "#94A3B8", style: { fontSize: 11 } }}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                labelStyle={{ fontWeight: 700, color: "#0f172a" }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "11px", color: "#64748B" }}
              />
              <Bar
                yAxisId="attendance"
                dataKey="attendance"
                name="Attendance %"
                fill="#0f55f7"
                radius={[6, 6, 0, 0]}
                maxBarSize={26}
              />
              <Bar
                yAxisId="assessments"
                dataKey="assessments"
                name="Assessments Cleared"
                fill="#06b6a8"
                radius={[6, 6, 0, 0]}
                maxBarSize={26}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-8 text-center dark:border-slate-700 dark:bg-slate-800/30">
          <BarChart3 className="h-10 w-10 text-slate-300 dark:text-slate-500" />
          <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">No performance data available.</p>
          <p className="mt-1 text-sm text-slate-400">The backend has not returned student attendance or assessment metrics yet.</p>
        </div>
      )}
    </DashboardSection>
  );
}

export default memo(StudentPerformanceChart);
