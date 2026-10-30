import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Brain, Download, Edit2, Plus, Search, Trash2, Upload } from "lucide-react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { toast } from "sonner";
import StatusBadge from "@shared/components/StatusBadge";
import getApiErrorMessage from "../../../utils/getApiErrorMessage";
import SkillFormModal from "../components/SkillFormModal";
import { useSkills } from "../hooks/useSkills";

const columnHelper = createColumnHelper();

const escapeCsv = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

const parseCsvLine = (line) => {
  const cells = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && quoted && line[index + 1] === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(value.trim());
      value = "";
    } else {
      value += char;
    }
  }
  cells.push(value.trim());
  return cells;
};

export default function SkillMaster() {
  const { skills, categories, skillTypes, loading, loadSkills, createSkill, editSkill, removeSkill, error } = useSkills();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const importInputRef = useRef(null);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  const handleCreate = useCallback(async (data) => {
    try {
      await createSkill(data).unwrap();
      toast.success(`Skill "${data.name}" added successfully`);
      return true;
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, "Unable to add the skill."));
      return false;
    }
  }, [createSkill]);

  const handleUpdate = useCallback(async (data) => {
    if (!editingSkill?.apiId) return false;
    try {
      await editSkill(editingSkill.apiId, data).unwrap();
      toast.success(`Skill "${data.name}" updated successfully`);
      return true;
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, "Unable to update the skill."));
      return false;
    }
  }, [editSkill, editingSkill]);

  const handleDelete = useCallback(async (skill) => {
    if (!skill?.apiId) {
      toast.error("Skill ID is missing.");
      return;
    }
    if (!window.confirm(`Delete "${skill.name}"? This action cannot be undone.`)) return;
    try {
      await removeSkill(skill.apiId).unwrap();
      toast.success(`Skill "${skill.name}" deleted successfully`);
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, "Unable to delete the skill."));
    }
  }, [removeSkill]);

  const columns = useMemo(() => [
    columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <input type="checkbox" aria-label="Select all skills" checked={table.getIsAllPageRowsSelected()} onChange={table.getToggleAllPageRowsSelectedHandler()} className="h-4 w-4 rounded border-slate-300 text-indigo-600" />
      ),
      cell: ({ row }) => (
        <input type="checkbox" aria-label={`Select ${row.original.name}`} checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} className="h-4 w-4 rounded border-slate-300 text-indigo-600" />
      ),
      size: 42,
    }),
    columnHelper.accessor("id", {
      header: "Skill ID",
      cell: (info) => <span className="rounded-md bg-indigo-50 px-2 py-0.5 font-mono text-xs text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">{info.getValue() || "-"}</span>,
    }),
    columnHelper.accessor("name", {
      header: "Skill Name",
      cell: (info) => <span className="font-semibold text-slate-800 dark:text-slate-200">{info.getValue() || "-"}</span>,
    }),
    columnHelper.accessor("category", {
      header: "Category",
      cell: (info) => <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-700/50 dark:text-slate-300">{info.getValue() || "-"}</span>,
    }),
    columnHelper.accessor("type", {
      header: "Type",
      cell: (info) => <span className="text-sm text-slate-500 dark:text-slate-400">{info.getValue() || "-"}</span>,
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const value = String(info.getValue() || "pending").toLowerCase();
        return <StatusBadge status={["active", "verified"].includes(value) ? "success" : "pending"} label={value} />;
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => { setEditingSkill(row.original); setModalOpen(true); }} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/10" title="Edit skill" aria-label={`Edit ${row.original.name}`}>
            <Edit2 className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => handleDelete(row.original)} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10" title="Delete skill" aria-label={`Delete ${row.original.name}`}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
      size: 96,
    }),
  ], [handleDelete]);

  // TanStack Table returns functions that cannot be safely memoized by the React compiler.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: skills,
    columns,
    state: { sorting, globalFilter, rowSelection },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
    enableRowSelection: true,
    getRowId: (row, index) => String(row.apiId || row.id || index),
  });

  const handleBulkDelete = async () => {
    const selectedSkills = table.getSelectedRowModel().rows.map((row) => row.original).filter((skill) => skill.apiId);
    if (!selectedSkills.length) return;
    if (!window.confirm(`Delete ${selectedSkills.length} selected skill(s)?`)) return;
    try {
      for (const skill of selectedSkills) {
        await removeSkill(skill.apiId).unwrap();
      }
      setRowSelection({});
      toast.success(`${selectedSkills.length} skill(s) deleted successfully`);
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, "Some selected skills could not be deleted."));
      loadSkills();
    }
  };

  const handleExport = () => {
    if (!skills.length) {
      toast.info("There are no skills to export.");
      return;
    }
    const rows = ["Name,Category,Type", ...skills.map((skill) => [skill.name, skill.category, skill.type].map(escapeCsv).join(","))];
    const url = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "skills.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Skills exported as CSV");
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const lines = (await file.text()).split(/\r?\n/).filter((line) => line.trim());
      if (lines.length < 2) throw new Error("CSV must include a header and at least one skill row.");
      const headers = parseCsvLine(lines[0]).map((header) => header.toLowerCase());
      const indexes = { name: headers.indexOf("name"), category: headers.indexOf("category"), type: headers.indexOf("type") };
      if (Object.values(indexes).some((index) => index < 0)) throw new Error("CSV headers must be Name, Category, Type.");
      const imported = lines.slice(1).map(parseCsvLine).map((cells) => ({
        name: cells[indexes.name]?.trim(),
        category: cells[indexes.category]?.trim(),
        type: cells[indexes.type]?.trim(),
      })).filter((skill) => skill.name && skill.category && skill.type);
      if (!imported.length) throw new Error("No valid skill rows were found.");
      for (const skill of imported) {
        await createSkill(skill).unwrap();
      }
      toast.success(`${imported.length} skill(s) imported successfully`);
    } catch (importError) {
      toast.error(getApiErrorMessage(importError, "Unable to import the CSV file."));
    }
  };

  const totalRows = table.getFilteredRowModel().rows.length;
  const pageStart = totalRows ? table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1 : 0;
  const pageEnd = Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, totalRows);
  const selectedCount = Object.keys(rowSelection).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-7xl space-y-4 px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500/15 to-purple-500/15 text-indigo-600 ring-1 ring-indigo-500/10 dark:text-indigo-400">
            <Brain className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Skill Management</h1>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {skills.length} live skills
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage the live skill catalog used across your organization.</p>
          </div>
        </div>
        <button type="button" onClick={() => { setEditingSkill(null); setModalOpen(true); }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5">
          <Plus className="h-4 w-4" /> Add Skill
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/80 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <input ref={importInputRef} type="file" accept=".csv,text/csv" onChange={handleImport} className="hidden" />
          <button type="button" onClick={() => importInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
            <Upload className="h-4 w-4" /> Import CSV
          </button>
          <button type="button" onClick={handleExport} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
            <Download className="h-4 w-4" /> Export
          </button>
          {selectedCount > 0 && (
            <button type="button" onClick={handleBulkDelete} className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
              <Trash2 className="h-4 w-4" /> Delete ({selectedCount})
            </button>
          )}
        </div>
        <div className="relative w-full lg:w-72 lg:shrink-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={globalFilter} onChange={(event) => setGlobalFilter(event.target.value)} placeholder="Search skills..." className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white" />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/80">
        {error ? (
          <div className="p-10 text-center">
            <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-red-500" />
            <h2 className="font-bold text-slate-900 dark:text-white">Unable to load skills</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{error}</p>
            <button type="button" onClick={loadSkills} className="mt-4 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">Retry</button>
          </div>
        ) : loading ? (
          <div className="space-y-3 p-6">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-11 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />)}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-[820px] w-full">
                <thead className="bg-slate-50/80 dark:bg-slate-800/40">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="border-b border-slate-200 dark:border-slate-700">
                      {headerGroup.headers.map((header) => (
                        <th key={header.id} className="whitespace-nowrap px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          <button type="button" onClick={header.column.getToggleSortingHandler()} className="flex items-center gap-1 disabled:cursor-default" disabled={!header.column.getCanSort()}>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{ asc: "↑", desc: "↓" }[header.column.getIsSorted()] ?? null}
                          </button>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40">
                      {row.getVisibleCells().map((cell) => <td key={cell.id} className="px-4 py-3 text-sm">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}
                    </tr>
                  )) : (
                    <tr><td colSpan={columns.length} className="px-6 py-14 text-center text-sm text-slate-500 dark:text-slate-400">{skills.length ? "No skills match your search." : "No skills have been added yet."}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
              <p className="text-xs text-slate-500">Showing {pageStart}–{pageEnd} of {totalRows}</p>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300">Previous</button>
                <span className="text-xs text-slate-500">Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}</span>
                <button type="button" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300">Next</button>
              </div>
            </div>
          </>
        )}
      </div>

      <SkillFormModal open={modalOpen} onClose={() => { setModalOpen(false); setEditingSkill(null); }} onSubmit={editingSkill ? handleUpdate : handleCreate} skill={editingSkill} categories={categories} skillTypes={skillTypes} />
    </motion.div>
  );
}
