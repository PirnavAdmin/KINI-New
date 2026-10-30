import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Database, Search, Download, Printer, X } from "lucide-react";
import { toast } from "sonner";
import StatusBadge from "@shared/components/StatusBadge";
import { levelColor, useSkills } from "../hooks/useSkills";

const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

export default function SkillMatrix() {
  const { employeeSkills } = useSkills();
  const [search, setSearch] = useState("");
  const [filterSkill, setFilterSkill] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterLevel, setFilterLevel] = useState("");

  const uniqueSkills = useMemo(() => [...new Set(employeeSkills.map((e) => e.skill))].sort(), [employeeSkills]);
  const departments = useMemo(() => [...new Set(employeeSkills.map((entry) => entry.department).filter(Boolean))].sort(), [employeeSkills]);

  const filtered = useMemo(() => {
    let result = [...employeeSkills];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) => String(e.empName || "").toLowerCase().includes(q) || String(e.empId || "").toLowerCase().includes(q) || String(e.department || "").toLowerCase().includes(q)
      );
    }
    if (filterSkill) result = result.filter((e) => e.skill === filterSkill);
    if (filterDept) result = result.filter((e) => e.department === filterDept);
    if (filterLevel) result = result.filter((e) => e.level === filterLevel);
    return result;
  }, [employeeSkills, search, filterSkill, filterDept, filterLevel]);

  const handleExport = () => {
    if (!filtered.length) {
      toast.info("There are no employee skill mappings to export.");
      return;
    }
    const csv = ["Employee ID,Employee Name,Department,Designation,Skill,Skill Level,Years Exp,Last Verified,Verified By,Status"];
    filtered.forEach((e) => csv.push(`${e.empId},"${e.empName}","${e.department}","${e.designation}","${e.skill}",${e.level},${e.yearsExp},${e.lastVerified},"${e.verifiedBy}",${e.status}`));
    const blob = new Blob([csv.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "skill-matrix.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Matrix exported as CSV");
  };

  const handlePrint = () => window.print();

  const filterChip = (label, onRemove) => (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-xs font-medium text-indigo-600 dark:text-indigo-400">
      {label}
      <button onClick={onRemove} className="hover:text-indigo-800 dark:hover:text-indigo-200"><X className="w-3 h-3" /></button>
    </span>
  );

  const levelBadge = (level) => {
    const colors = {
      Beginner: "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
      Intermediate: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
      Advanced: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
      Expert: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${colors[level] || colors.Beginner}`}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: levelColor(level) }} />
        {level}
      </span>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Employee Skill Matrix</h1>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">Comprehensive view of employee skills across the organization</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} disabled={!employeeSkills.length}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 transition-all">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={handlePrint} disabled={!employeeSkills.length}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 transition-all">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/70">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee, skill, department..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all" />
          </div>
          {/* Skill filter */}
          <select value={filterSkill} onChange={(e) => setFilterSkill(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
            <option value="">All Skills</option>
            {uniqueSkills.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {/* Department filter */}
          <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
            <option value="">All Departments</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          {/* Level filter */}
          <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
            <option value="">All Levels</option>
            {SKILL_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        {/* Active filter chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          {filterSkill && filterChip(`Skill: ${filterSkill}`, () => setFilterSkill(""))}
          {filterDept && filterChip(`Dept: ${filterDept}`, () => setFilterDept(""))}
          {filterLevel && filterChip(`Level: ${filterLevel}`, () => setFilterLevel(""))}
          {search && filterChip(`Search: "${search}"`, () => setSearch(""))}
        </div>
      </div>

      {/* Matrix Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur-xl print:border-none dark:border-slate-700 dark:bg-slate-900/70">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30">
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Department</th>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Designation</th>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Skill</th>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Level</th>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Experience</th>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Last Verified</th>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Verified By</th>
                <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-14 text-center">
                    <Database className="mx-auto mb-3 h-8 w-8 text-slate-300 dark:text-slate-600" />
                    <p className="font-semibold text-slate-700 dark:text-slate-200">
                      {employeeSkills.length ? "No mappings match the selected filters" : "Employee skill mappings are not available"}
                    </p>
                    <p className="mx-auto mt-1 max-w-xl text-sm font-medium text-slate-600 dark:text-slate-300">
                      {employeeSkills.length
                        ? "Clear one or more filters and try again."
                        : "The current backend exposes the skill catalog, but does not yet provide an employee-to-skill mapping endpoint."}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((entry, i) => (
                  <motion.tr key={`${entry.empId}-${entry.skill}-${i}`}
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.015 }}
                    className="border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                          {entry.empName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{entry.empName}</span>
                          <span className="text-[10px] text-slate-400 block">{entry.empId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{entry.department}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{entry.designation}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2.5 py-1 rounded-lg text-[11px] font-medium bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                        {entry.skill}
                      </span>
                    </td>
                    <td className="px-4 py-3">{levelBadge(entry.level)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${(entry.yearsExp / 8) * 100}%`, backgroundColor: levelColor(entry.level) }} />
                        </div>
                        <span className="text-xs font-medium text-slate-500">{entry.yearsExp}y</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{entry.lastVerified}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{entry.verifiedBy}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={entry.status === "verified" ? "success" : "pending"} label={entry.status} />
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Showing {filtered.length} of {employeeSkills.length} records</p>
          <div className="flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400" /> Beginner</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Intermediate</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Advanced</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Expert</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
