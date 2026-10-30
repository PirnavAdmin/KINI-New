import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Plus, Save, Trash2, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { courseService } from "@/shared/services/courseService";
import SyllabusPdfImport from "./SyllabusPdfImport";

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const lessonRow = (row = {}) => ({ key: row.lessonId ?? row.id ?? uid(), id: row.lessonId ?? row.id, name: row.lessonName ?? row.name ?? "", description: row.description ?? "" });
const topicRow = (row = {}) => ({ key: row.topicId ?? row.id ?? uid(), id: row.topicId ?? row.id, name: row.topicName ?? row.name ?? "", description: row.description ?? "", lessons: (row.lessons ?? []).map(lessonRow) });
const moduleRow = (row = {}) => ({ key: row.moduleId ?? row.id ?? uid(), id: row.moduleId ?? row.id, name: row.moduleName ?? row.name ?? "", description: row.description ?? "", topics: (row.topics ?? []).map(topicRow) });
const starter = () => [moduleRow({ topics: [{ lessons: [{}] }] })];

export default function SyllabusBuilder({ courseId, canCreate = true, onEditingChange }) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState("");
  const [modules, setModules] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  useEffect(() => {
    onEditingChange?.(editing || saving);
    return () => onEditingChange?.(false);
  }, [editing, saving, onEditingChange]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const syllabus = await courseService.getSyllabus(courseId);
      setDescription(syllabus?.description ?? "");
      setModules((syllabus?.modules ?? []).map(moduleRow));
      setEditing(false);
    } catch (error) {
      const status = error?.response?.status;
      const message = String(error?.response?.data?.message ?? "").toLowerCase();
      if (status === 404 && !message.includes("course not found")) {
        setDescription("");
        setModules([]);
        setEditing(false);
      } else {
        setLoadError(status === 403 ? "You do not have permission to manage this course syllabus." : status === 404 ? "Course could not be found." : "Unable to load the syllabus. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { Promise.resolve().then(load); }, [load]);

  // An applied PDF import only fills this form for review; Save Syllabus is
  // still the one action that persists it.
  const applyImport = (imported) => {
    if (imported.description) setDescription(imported.description);
    setModules(imported.modules.map(moduleRow));
    setErrors({});
    setImportOpen(false);
    setEditing(true);
  };
  const importButton = canCreate && <button type="button" disabled={saving || importOpen} onClick={() => setImportOpen(true)} className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-600 disabled:opacity-60"><Upload className="h-4 w-4" />Upload PDF</button>;
  const importPanel = importOpen && <SyllabusPdfImport courseId={courseId} onApply={applyImport} onClose={() => setImportOpen(false)} />;

  const updateModule = (mi, field, value) => setModules((old) => old.map((module, i) => i === mi ? { ...module, [field]: value } : module));
  const updateTopic = (mi, ti, field, value) => setModules((old) => old.map((module, i) => i !== mi ? module : { ...module, topics: module.topics.map((topic, j) => j === ti ? { ...topic, [field]: value } : topic) }));
  const updateLesson = (mi, ti, li, field, value) => setModules((old) => old.map((module, i) => i !== mi ? module : { ...module, topics: module.topics.map((topic, j) => j !== ti ? topic : { ...topic, lessons: topic.lessons.map((lesson, k) => k === li ? { ...lesson, [field]: value } : lesson) }) }));
  const removeModule = (mi) => setModules((old) => old.filter((_, i) => i !== mi));
  const removeTopic = (mi, ti) => setModules((old) => old.map((module, i) => i !== mi ? module : { ...module, topics: module.topics.filter((_, j) => j !== ti) }));
  const removeLesson = (mi, ti, li) => setModules((old) => old.map((module, i) => i !== mi ? module : { ...module, topics: module.topics.map((topic, j) => j !== ti ? topic : { ...topic, lessons: topic.lessons.filter((_, k) => k !== li) }) }));
  const moveModule = (index, direction) => setModules((old) => {
    const next = [...old];
    const target = index + direction;
    if (target < 0 || target >= next.length) return old;
    [next[index], next[target]] = [next[target], next[index]];
    return next;
  });

  const validate = () => {
    const next = {};
    if (!modules.length) next.modules = "Add at least one module.";
    modules.forEach((module, mi) => {
      if (!module.name.trim()) next[`m-${mi}`] = "Module name is required.";
      if (!module.topics.length) next[`mt-${mi}`] = "Add at least one topic.";
      module.topics.forEach((topic, ti) => {
        if (!topic.name.trim()) next[`t-${mi}-${ti}`] = "Topic name is required.";
        if (!topic.lessons.length) next[`tl-${mi}-${ti}`] = "Add at least one lesson.";
        topic.lessons.forEach((lesson, li) => { if (!lesson.name.trim()) next[`l-${mi}-${ti}-${li}`] = "Lesson name is required."; });
      });
    });
    setErrors(next);
    return !Object.keys(next).length;
  };

  const save = async () => {
    if (!canCreate || !validate() || saving) return;
    const payload = {
      description: description.trim(),
      modules: modules.map((module, mi) => ({
        moduleNumber: mi + 1,
        moduleName: module.name.trim(),
        description: module.description.trim(),
        topics: module.topics.map((topic, ti) => ({
          topicNumber: ti + 1,
          topicName: topic.name.trim(),
          description: topic.description.trim(),
          lessons: topic.lessons.map((lesson, li) => ({ lessonNumber: li + 1, lessonName: lesson.name.trim(), description: lesson.description.trim() })),
        })),
      })),
    };
    setSaving(true);
    try {
      await courseService.createSyllabus(courseId, payload);
      toast.success("Syllabus saved successfully.");
      await load();
    } catch (error) {
      const status = error?.response?.status;
      if (status === 409) {
        toast.error("A syllabus already exists for this course.");
        await load();
      } else {
        const backendMessage = error?.response?.data?.message;
        toast.error(status === 401 ? "Your session has expired. Please log in again." : status === 403 ? "You do not have permission to manage this course syllabus." : status === 400 ? backendMessage || "Please review the syllabus fields and try again." : "Unable to save the syllabus right now. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="space-y-2"><div className="h-10 animate-pulse rounded-xl bg-slate-100" /><div className="h-40 animate-pulse rounded-xl bg-slate-100" /></div>;
  if (loadError) return <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-center"><p className="text-sm font-bold text-rose-700">{loadError}</p><button onClick={load} className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white">Retry</button></div>;

  if (!editing) return <div className="space-y-3">
    {canCreate && <div className="flex justify-end gap-2">{importButton}<button type="button" onClick={() => { if (!modules.length) setModules(starter()); setEditing(true); }} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm"><Plus className="h-4 w-4" />{modules.length ? "Edit Syllabus" : "Add Syllabus"}</button></div>}
    {importPanel}
    {!!modules.length && description && <p className="rounded-xl border border-slate-200 bg-white p-3 text-xs leading-5 text-slate-600">{description}</p>}
    {modules.map((module, mi) => <details key={module.key} open={mi === 0} className="rounded-xl border border-slate-200 bg-white"><summary className="cursor-pointer list-none px-4 py-3 text-sm font-bold text-slate-800">Module {mi + 1}: {module.name}</summary><div className="border-t px-4 py-2">{module.description && <p className="mb-2 text-xs text-slate-500">{module.description}</p>}{module.topics.map((topic, ti) => <details key={topic.key} className="border-b py-2 last:border-0"><summary className="cursor-pointer text-xs font-bold text-blue-700">Topic {ti + 1}: {topic.name}</summary><ol className="mt-2 space-y-1 pl-5 text-xs text-slate-600">{topic.lessons.map((lesson, li) => <li key={lesson.key}>{li + 1}. {lesson.name}</li>)}</ol></details>)}</div></details>)}
    {!modules.length && <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center"><span className="mx-auto grid h-9 w-9 place-items-center rounded-lg bg-blue-100 font-bold text-blue-700">+</span><p className="mt-2 text-sm font-bold text-slate-700">No syllabus added yet</p><p className="mt-1 text-xs text-slate-500">{canCreate ? 'Click Add Syllabus to create modules, topics and lessons.' : 'An authorized course editor can add the syllabus.'}</p></div>}
  </div>;

  return <div className="space-y-3">
    <div className="flex justify-end gap-2">{importButton}<button type="button" disabled={saving} onClick={() => { setErrors({}); setImportOpen(false); load(); }} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold disabled:opacity-60">Cancel</button></div>
    {importPanel}
    <label className="block rounded-xl border border-slate-200 bg-white p-3 text-[11px] font-bold text-slate-600">Syllabus description<textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="mt-1 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-xs font-normal outline-none focus:border-blue-500" /></label>
    {errors.modules && <ErrorText text={errors.modules} />}
    {modules.map((module, mi) => <section key={module.key} className="overflow-hidden rounded-xl border border-blue-200 bg-white shadow-sm">
      <header className="flex items-center gap-1 bg-slate-50 px-3 py-2"><strong className="mr-auto text-xs uppercase text-slate-700">Module {mi + 1}</strong><IconButton onClick={() => moveModule(mi, -1)} disabled={!mi}><ChevronUp /></IconButton><IconButton onClick={() => moveModule(mi, 1)} disabled={mi === modules.length - 1}><ChevronDown /></IconButton><IconButton danger onClick={() => removeModule(mi)}><Trash2 /></IconButton></header>
      <div className="grid gap-2 p-3 md:grid-cols-[.9fr_1.5fr]"><Field label="Module name *" value={module.name} onChange={(value) => updateModule(mi, "name", value)} error={errors[`m-${mi}`]} /><Field label="Description" value={module.description} onChange={(value) => updateModule(mi, "description", value)} /></div>
      {errors[`mt-${mi}`] && <ErrorText text={errors[`mt-${mi}`]} className="px-3" />}
      <div className="space-y-2 px-3 pb-3">{module.topics.map((topic, ti) => <article key={topic.key} className="rounded-lg border border-slate-200">
        <div className="flex items-center bg-slate-50 px-3 py-2"><strong className="mr-auto text-[11px] uppercase text-slate-600">Topic {ti + 1}</strong><IconButton danger onClick={() => removeTopic(mi, ti)}><Trash2 /></IconButton></div>
        <div className="grid gap-2 p-2 md:grid-cols-[.9fr_1.5fr]"><Field label="Topic name *" value={topic.name} onChange={(value) => updateTopic(mi, ti, "name", value)} error={errors[`t-${mi}-${ti}`]} /><Field label="Description" value={topic.description} onChange={(value) => updateTopic(mi, ti, "description", value)} /></div>
        {errors[`tl-${mi}-${ti}`] && <ErrorText text={errors[`tl-${mi}-${ti}`]} className="px-2" />}
        <div className="mx-2 mb-2 overflow-x-auto rounded-lg border"><div className="min-w-[620px]"><div className="grid grid-cols-[42px_1fr_1.4fr_34px] bg-slate-50 px-2 py-1.5 text-[10px] font-bold uppercase text-slate-500"><span>#</span><span>Lesson name</span><span>Description</span><span /></div>{topic.lessons.map((lesson, li) => <div key={lesson.key} className="grid grid-cols-[42px_1fr_1.4fr_34px] items-start gap-2 border-t p-2"><span className="pt-2 text-center text-xs font-bold text-slate-400">{li + 1}</span><Input value={lesson.name} onChange={(value) => updateLesson(mi, ti, li, "name", value)} error={errors[`l-${mi}-${ti}-${li}`]} /><Input value={lesson.description} onChange={(value) => updateLesson(mi, ti, li, "description", value)} /><IconButton danger onClick={() => removeLesson(mi, ti, li)}><Trash2 /></IconButton></div>)}<button onClick={() => updateTopic(mi, ti, "lessons", [...topic.lessons, lessonRow()])} className="flex w-full items-center justify-center gap-1 border-t py-2 text-xs font-bold text-blue-600"><Plus className="h-3.5 w-3.5" />Add Lesson</button></div></div>
      </article>)}<button onClick={() => updateModule(mi, "topics", [...module.topics, topicRow()])} className="mx-auto flex items-center gap-1 rounded-lg border border-blue-200 px-3 py-2 text-xs font-bold text-blue-600"><Plus className="h-3.5 w-3.5" />Add Topic</button></div>
    </section>)}
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-2"><button onClick={() => setModules((old) => [...old, moduleRow()])} className="inline-flex items-center gap-1 rounded-lg border border-blue-200 px-3 py-2 text-xs font-bold text-blue-600"><Plus className="h-4 w-4" />Add Module</button><button disabled={saving} onClick={save} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm disabled:opacity-60"><Save className="h-4 w-4" />{saving ? "Saving..." : "Save Syllabus"}</button></div>
  </div>;
}

function Input({ value, onChange, error }) { return <span className="block"><input value={value} onChange={(event) => onChange(event.target.value)} className={`mt-1 h-8 w-full rounded-lg border px-2.5 text-xs outline-none ${error ? "border-rose-400" : "border-slate-200 focus:border-blue-500"}`} />{error && <span className="mt-1 block text-[10px] font-semibold text-rose-600">{error}</span>}</span>; }
function Field({ label, ...props }) { return <label className="text-[11px] font-bold text-slate-600">{label}<Input {...props} /></label>; }
function ErrorText({ text, className = "" }) { return <p className={`text-[10px] font-semibold text-rose-600 ${className}`}>{text}</p>; }
function IconButton({ children, danger, ...props }) { return <button type="button" className={`p-1 disabled:opacity-30 ${danger ? "text-rose-500" : "text-blue-600"}`} {...props}><span className="block [&>svg]:h-4 [&>svg]:w-4">{children}</span></button>; }
