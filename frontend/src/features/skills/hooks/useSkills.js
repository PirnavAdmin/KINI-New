import { useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchSkills,
  addSkill,
  updateSkill,
  deleteSkill,
  setFilters,
  resetFilters,
  toggleSelect,
  toggleSelectAll,
  clearSelection,
} from "../store/skillSlice";

export function useSkills() {
  const dispatch = useDispatch();
  const { skills, employeeSkills, categories, skillTypes, loading, error, filters, selectedIds } =
    useSelector((state) => state.skills);

  // ── Render state ────────────────────────────────────────────

  // ── Derived data ────────────────────────────────────────────
  const totalSkills = skills.length;
  const verifiedSkills = skills.filter((s) => ["active", "verified"].includes(s.status)).length;
  const pendingSkills = skills.filter((s) => s.status === "pending").length;
  const totalEmployeesMapped = new Set(employeeSkills.map((e) => e.empId)).size;

  // Top trending skills by mapped employee count
  const trendingSkills = useMemo(
    () => [...skills].sort((a, b) => (b.employees ?? 0) - (a.employees ?? 0)).slice(0, 5),
    [skills]
  );

  // Skills by category for charts
  const skillsByCategory = useMemo(() => {
    const map = {};
    skills.forEach((s) => {
      map[s.category] = (map[s.category] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [skills]);

  // Top 10 most popular
  const topPopularSkills = useMemo(
    () => [...skills].sort((a, b) => (b.employees ?? 0) - (a.employees ?? 0)).slice(0, 10),
    [skills]
  );

  // Verification status for donut chart
  const verificationStats = useMemo(() => {
    const verified = skills.filter((s) => ["active", "verified"].includes(s.status)).length;
    const pending = skills.filter((s) => s.status === "pending").length;
    const archived = skills.filter((s) => s.status === "archived").length;
    return [
      { name: "Active", value: verified, color: "#10B981" },
      { name: "Pending", value: pending, color: "#F59E0B" },
      { name: "Archived", value: archived, color: "#EF4444" },
    ];
  }, [skills]);

  // Employee skill distribution levels
  const skillLevelDistribution = useMemo(() => {
    const counts = { Beginner: 0, Intermediate: 0, Advanced: 0, Expert: 0 };
    employeeSkills.forEach((es) => {
      if (counts[es.level] !== undefined) counts[es.level]++;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value, color: levelColor(name) }));
  }, [employeeSkills]);

  // Filtered skills for SkillMaster
  const filteredSkills = useMemo(() => {
    let result = [...skills];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      );
    }
    if (filters.category) result = result.filter((s) => s.category === filters.category);
    if (filters.status) result = result.filter((s) => s.status === filters.status);
    if (filters.verification) result = result.filter((s) => s.verification === filters.verification);
    return result;
  }, [skills, filters]);

  // ── Actions (memoized to prevent infinite re-renders) ────────
  // 🛑 CRITICAL FIX: Without useCallback, every render creates a
  //    new function reference, causing useEffect dependencies to
  //    trigger on every render → infinite loop!
  const loadSkills = useCallback(() => {
    return dispatch(fetchSkills());
  }, [dispatch]);

  const createSkill = useCallback((data) => dispatch(addSkill(data)), [dispatch]);
  const editSkill = useCallback((id, data) => dispatch(updateSkill({ id, data })), [dispatch]);
  const removeSkill = useCallback((id) => dispatch(deleteSkill(id)), [dispatch]);
  const updateFilters = useCallback((f) => dispatch(setFilters(f)), [dispatch]);
  const resetAllFilters = useCallback(() => dispatch(resetFilters()), [dispatch]);
  const selectSkill = useCallback((id) => dispatch(toggleSelect(id)), [dispatch]);
  const selectAll = useCallback((all) => dispatch(toggleSelectAll(all)), [dispatch]);
  const clearAllSelection = useCallback(() => dispatch(clearSelection()), [dispatch]);

  // Note: bulkDelete depends on selectedIds, which changes. This is
  // intentional — it's a user-initiated action, not an effect dependency.
  const bulkDelete = useCallback(() => {
    return Promise.all(selectedIds.map((id) => dispatch(deleteSkill(id)).unwrap()));
  }, [selectedIds, dispatch]);

  return {
    skills,
    employeeSkills,
    categories,
    skillTypes,
    loading,
    error,
    filters,
    selectedIds,
    totalSkills,
    verifiedSkills,
    pendingSkills,
    totalEmployeesMapped,
    trendingSkills,
    skillsByCategory,
    topPopularSkills,
    verificationStats,
    skillLevelDistribution,
    filteredSkills,
    loadSkills,
    createSkill,
    editSkill,
    removeSkill,
    bulkDelete,
    updateFilters,
    resetAllFilters,
    selectSkill,
    selectAll,
    clearAllSelection,
  };
}

export function levelColor(level) {
  switch (level) {
    case "Beginner": return "#94A3B8";
    case "Intermediate": return "#F59E0B";
    case "Advanced": return "#4F46E5";
    case "Expert": return "#10B981";
    default: return "#94A3B8";
  }
}
