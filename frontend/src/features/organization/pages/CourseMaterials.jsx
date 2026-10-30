import useDashboardFormReturn from '@shared/hooks/useDashboardFormReturn';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  ArrowUpDown,
  BookOpen,
  Download,
  ExternalLink,
  FileText,
  FolderOpen,
  Loader2,
  RefreshCw,
  RotateCcw,
  Search,
  Upload,
  CheckCircle2,
  FileType,
  FileUp,
  FolderUp,
  Layers,
  Link2,
  MoreHorizontal,
  Award,
  Share2,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import KiniDialog from "@shared/components/KiniDialog";
import { ORG_BANNERS } from "../constants/orgBanners";
import OrgShowcaseHero from "../components/showcase/OrgShowcaseHero";
import { courseMaterialService } from "@shared/services/courseMaterialService";
import { getApiErrorMessage } from "@shared/services/apiServices";
import {
  OrgEmpty,
  OrgKpiCard,
  OrgPage,
  OrgRowMenu,
  OrgSearch,
  OrgSelect,
  OrgStatus,
  OrgTableFooter,
  toDate,
  usePaged,
} from "../components/org-ui/OrgPageKit";
import "./course-materials.css";

const EMPTY = { title: "", courseId: "", materialType: "PDF", status: "Draft", description: "", resourceUrl: "", file: null };
const PAGE_SIZE = 10;
const RECENT_DAYS = 30;
// Only PDF is accepted by the upload API today; other types are shown for
// context but disabled until the backend supports them.
const MATERIAL_TYPES = [
  { value: "PDF", label: "PDF", icon: FileText, tone: "red", supported: true },
  { value: "Video", label: "Video", icon: PlayCircle, tone: "purple", supported: false },
  { value: "Document", label: "Document", icon: FileType, tone: "blue", supported: false },
  { value: "Link", label: "Link", icon: Link2, tone: "green", supported: false },
  { value: "Other", label: "Other", icon: MoreHorizontal, tone: "gray", supported: false },
];
const courseLabel = (course) => course.courseName ?? course.name ?? course.title ?? "Untitled course";

const SORTS = [
  ["latest", "Latest First"],
  ["oldest", "Oldest First"],
  ["name-asc", "Name A–Z"],
  ["name-desc", "Name Z–A"],
];

const materialIdOf = (material) => material.materialId ?? material.id;
const materialNameOf = (material) => material.title ?? material.materialName ?? "Untitled material";
const materialTypeOf = (material) => String(material.materialType ?? material.type ?? "PDF").toUpperCase();
const uploadedAtOf = (material) =>
  toDate(
    material.pdfUploadedAt ??
      material.uploadedAt ??
      material.uploadedOn ??
      material.updatedAt ??
      material.updatedDate ??
      material.modifiedAt ??
      material.createdAt ??
      material.createdDate,
  );
const sizeOf = (material) => {
  const bytes = Number(material.pdfFileSize ?? material.fileSize ?? material.size ?? material.fileSizeInBytes);
  if (!Number.isFinite(bytes) || bytes <= 0) return "—";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};
const isActive = (material) => {
  const status = material.status ?? material.isActive ?? material.active;
  if (status === undefined || status === null) return true;
  if (typeof status === "boolean") return status;
  return !["inactive", "archived", "false", "0", "disabled"].includes(String(status).toLowerCase());
};

const formatDate = (date) =>
  date ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date) : "—";
const formatTime = (date) =>
  date ? new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit" }).format(date) : "";

function PdfGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 2h8l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="currentColor" />
      <path d="M14 2v5h5" fill="#ffffff" opacity=".55" />
      <text x="12" y="17.5" textAnchor="middle" fontSize="6" fontWeight="800" fill="#ffffff" fontFamily="Inter, sans-serif">PDF</text>
    </svg>
  );
}

export default function CourseMaterials() {
  const fileInputRef = useRef(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sort, setSort] = useState("latest");
  const [open, setOpen] = useState(false);
  const openQuickUpload = useCallback(() => {
    setOpen(true);
    courseMaterialService.courses().then(setCourses).catch(() => toast.error('Unable to load courses.'));
  }, []);
  useDashboardFormReturn(open, openQuickUpload, 'upload');
  const [dragOver, setDragOver] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [courses, setCourses] = useState([]);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState({ id: null, action: null });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setMaterials(await courseMaterialService.list());
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to load course materials."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const cutoff = Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000;
    return {
      total: materials.length,
      pdfs: materials.filter((material) => materialTypeOf(material) === "PDF").length,
      recent: materials.filter((material) => (uploadedAtOf(material)?.getTime() ?? 0) >= cutoff).length,
      courses: new Set(materials.map((material) => material.courseName).filter(Boolean)).size,
    };
  }, [materials]);

  const courseOptions = useMemo(
    () => [["all", "All Courses"], ...[...new Set(materials.map((material) => material.courseName).filter(Boolean))].sort().map((name) => [name, name])],
    [materials],
  );
  const typeOptions = useMemo(
    () => [["all", "All File Types"], ...[...new Set(materials.map(materialTypeOf))].sort().map((type) => [type, type])],
    [materials],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const list = materials.filter((material) => {
      if (courseFilter !== "all" && material.courseName !== courseFilter) return false;
      if (typeFilter !== "all" && materialTypeOf(material) !== typeFilter) return false;
      if (!term) return true;
      return [materialNameOf(material), material.courseName].some((value) => String(value ?? "").toLowerCase().includes(term));
    });
    const time = (material) => uploadedAtOf(material)?.getTime() ?? 0;
    return [...list].sort((a, b) => {
      if (sort === "oldest") return time(a) - time(b);
      if (sort === "name-asc") return materialNameOf(a).localeCompare(materialNameOf(b));
      if (sort === "name-desc") return materialNameOf(b).localeCompare(materialNameOf(a));
      return time(b) - time(a);
    });
  }, [materials, query, courseFilter, typeFilter, sort]);

  const filtersActive = query || courseFilter !== "all" || typeFilter !== "all" || sort !== "latest";
  const { page, rows, setPage } = usePaged(filtered, PAGE_SIZE, `${query}|${courseFilter}|${typeFilter}|${sort}`);

  const clearFilters = () => {
    setQuery("");
    setCourseFilter("all");
    setTypeFilter("all");
    setSort("latest");
  };

  const focusMaterials = (next = {}) => {
    setQuery("");
    setCourseFilter(next.course ?? "all");
    setTypeFilter(next.type ?? "all");
    setSort(next.sort ?? "latest");
    window.requestAnimationFrame(() => {
      document.getElementById("course-materials-list")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const openUpload = async (presetCourseId = "") => {
    setOpen(true);
    setForm({ ...EMPTY, courseId: presetCourseId ? String(presetCourseId) : "" });
    setErrors({});
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
    try {
      setCourses(await courseMaterialService.courses());
    } catch {
      toast.error("Unable to load courses.");
    }
  };

  const submit = async (event) => {
    event?.preventDefault?.();
    const next = {};
    if (!form.title.trim()) next.title = "Material title is required";
    if (!form.courseId) next.courseId = "Course is required";
    if (!form.file) next.resource = "Select a PDF file to upload";
    else if (form.file.type !== "application/pdf" && !form.file.name.toLowerCase().endsWith(".pdf")) next.resource = "Only PDF files are supported";
    setErrors(next);
    if (Object.keys(next).length) return;
    const body = new FormData();
    body.append("courseId", form.courseId);
    body.append("file", form.file);
    setSaving(true);
    try {
      await courseMaterialService.create(body, (uploadEvent) => uploadEvent.total && setProgress(Math.round((uploadEvent.loaded * 100) / uploadEvent.total)));
      toast.success("Course PDF uploaded.");
      setOpen(false);
      await load();
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, "Unable to upload course PDF."));
    } finally {
      setSaving(false);
    }
  };

  const openMaterial = async (material) => {
    const id = materialIdOf(material);
    if (!material.resourceUrl) {
      toast.error("The uploaded file URL is unavailable for this material.");
      return;
    }
    const previewWindow = window.open("", "_blank");
    setBusy({ id, action: "open" });
    try {
      const blob = await courseMaterialService.file(material);
      const previewUrl = URL.createObjectURL(blob);
      if (previewWindow) previewWindow.location.replace(previewUrl);
      else window.open(previewUrl, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(previewUrl), 60000);
    } catch (requestError) {
      previewWindow?.close();
      toast.error(getApiErrorMessage(requestError, "Unable to open this course material."));
    } finally {
      setBusy({ id: null, action: null });
    }
  };

  const downloadMaterial = async (material) => {
    const id = materialIdOf(material);
    if (!material.resourceUrl) {
      toast.error("The uploaded file URL is unavailable for this material.");
      return;
    }
    setBusy({ id, action: "download" });
    try {
      const blob = await courseMaterialService.file(material);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const name = materialNameOf(material);
      link.href = url;
      link.download = name.toLowerCase().endsWith(".pdf") ? name : `${name}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 10000);
      toast.success(`${name} downloaded successfully.`);
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, "Unable to download this course material."));
    } finally {
      setBusy({ id: null, action: null });
    }
  };

  return (
    <OrgPage className="course-materials-page">
      <OrgShowcaseHero
        variant="v14"
        className="course-materials-hero"
        eyebrow="Empower Learners"
        title={["Course", "Materials"]}
        subtitle="Access, organize, and share learning resources for better teaching and learning."
        features={[
          { icon: FolderOpen, label: ["Organize", "Resources"], tone: "blue" },
          { icon: Share2, label: ["Share", "Easily"], tone: "purple" },
          { icon: BookOpen, label: ["Support", "Learning"], tone: "green" },
          { icon: Award, label: ["Build Better", "Outcomes"], tone: "orange" },
        ]}
        art={ORG_BANNERS.courseMaterials}
      />

      <section className="kx-grid kx-grid--4 course-materials-summary" aria-label="Material summary">
        {[
          ["blue", FileText, stats.total, "Total Materials", "All uploaded materials", () => focusMaterials()],
          ["red", FileText, stats.pdfs, "PDFs", "PDF documents", () => focusMaterials({ type: "PDF" })],
          ["green", UploadCloud, stats.recent, "Recent Uploads", `Added in last ${RECENT_DAYS} days`, () => focusMaterials({ sort: "latest" })],
          ["purple", BookOpen, stats.courses, "Courses Covered", "Unique courses", () => focusMaterials()],
        ].map(([tone, Icon, value, label, hint, onClick]) => (
          <OrgKpiCard key={label} decoration="bars" tone={tone} icon={Icon} label={label} value={value} hint={hint} loading={loading} onClick={onClick} />
        ))}
      </section>

      <div className="kx-toolbar" role="search">
        <OrgSearch icon={Search} value={query} onChange={setQuery} placeholder="Search materials..." label="Search materials" />
        <OrgSelect label="Filter by course" value={courseFilter} onChange={setCourseFilter} options={courseOptions} />
        <OrgSelect label="Filter by file type" value={typeFilter} onChange={setTypeFilter} options={typeOptions} />
        <OrgSelect label="Sort materials" icon={ArrowUpDown} value={sort} onChange={setSort} options={SORTS} />
        <button type="button" className="kx-btn kx-btn--text" onClick={clearFilters} disabled={!filtersActive}>
          <RotateCcw aria-hidden="true" />
          Clear
        </button>
        <button type="button" className="kx-btn kx-btn--primary" onClick={() => openUpload()}>
          <Upload aria-hidden="true" />
          Upload Material
        </button>
      </div>

      <section id="course-materials-list" className="kx-panel kx-panel--flush" aria-label="Course materials">
        {error ? (
          <div className="kx-note kx-note--error" role="alert">
            <AlertTriangle aria-hidden="true" />
            <span>{error}</span>
            <button type="button" className="kx-note__action" onClick={load}>
              <RefreshCw width={15} height={15} aria-hidden="true" />
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="kx-table-wrap">
              <table className="kx-table">
                <colgroup>
                  <col style={{ width: 44 }} />
                  <col />
                  <col style={{ width: "18%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: 220 }} />
                </colgroup>
                <thead>
                  <tr>
                    <th className="kx-col-num">#</th>
                    <th>Material Name</th>
                    <th>Course</th>
                    <th>File Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading &&
                    Array.from({ length: 3 }, (_, index) => (
                      <tr key={`skeleton-${index}`}>
                        {Array.from({ length: 6 }, (__, cell) => (
                          <td key={cell}>
                            <span className="kx-skel" style={{ display: "block", height: 18, width: cell === 0 ? "80%" : "60%" }} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  {!loading && !rows.length && (
                    <tr>
                      <td colSpan={6}>
                        {materials.length ? (
                          <OrgEmpty
                            icon={Search}
                            title="No materials match these filters"
                            text="Try a different search term, course, or file type."
                            action={
                              <button type="button" className="kx-btn kx-btn--ghost kx-btn--sm" onClick={clearFilters}>
                                <RotateCcw aria-hidden="true" />
                                Clear filters
                              </button>
                            }
                          />
                        ) : (
                          <OrgEmpty
                            icon={FolderOpen}
                            title="No course materials yet"
                            text="Upload a PDF to a course so batches and learners can access it."
                            action={
                              <button type="button" className="kx-btn kx-btn--primary kx-btn--sm" onClick={() => openUpload()}>
                                <Upload aria-hidden="true" />
                                Upload Material
                              </button>
                            }
                          />
                        )}
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    rows.map((material, index) => {
                      const id = materialIdOf(material);
                      const isBusy = busy.id === id;
                      const active = isActive(material);
                      return (
                        <tr key={id ?? index}>
                          <td className="kx-col-num">{String((page - 1) * PAGE_SIZE + index + 1).padStart(2, "0")}</td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <span className="kx-file-tile">
                                <FileText aria-hidden="true" />
                              </span>
                              <div style={{ minWidth: 0 }}>
                                <span className="kx-strong" style={{ fontSize: 14 }}>{materialNameOf(material)}</span>
                                <span className="kx-cell-sub">{material.courseName ?? "—"}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="kx-pill">{material.courseName ?? "Uncategorised"}</span>
                          </td>
                          <td>
                            <span className="kx-filetype">
                              {materialTypeOf(material) === "PDF" ? <PdfGlyph /> : <FileText aria-hidden="true" />}
                              {materialTypeOf(material)}
                            </span>
                          </td>
                          <td>
                            <OrgStatus tone={active ? "success" : "muted"} dot>
                              {active ? "Active" : "Inactive"}
                            </OrgStatus>
                          </td>
                          <td>
                            <div className="kx-cell-actions">
                              <button type="button" className="kx-btn kx-btn--soft" onClick={() => openMaterial(material)} disabled={isBusy}>
                                {isBusy && busy.action === "open" ? <Loader2 className="animate-spin" aria-hidden="true" /> : <ExternalLink aria-hidden="true" />}
                                {isBusy && busy.action === "open" ? "Opening…" : "Open"}
                              </button>
                              <button
                                type="button"
                                className="kx-icon-btn"
                                onClick={() => downloadMaterial(material)}
                                disabled={isBusy}
                                aria-label={`Download ${materialNameOf(material)}`}
                                title="Download"
                              >
                                {isBusy && busy.action === "download" ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Download aria-hidden="true" />}
                              </button>
                              <OrgRowMenu
                                label={`More actions for ${materialNameOf(material)}`}
                                openUp={index >= rows.length - 2 && rows.length > 3}
                                items={[
                                  { label: "Open in new tab", icon: ExternalLink, onClick: () => openMaterial(material) },
                                  { label: "Download PDF", icon: Download, onClick: () => downloadMaterial(material) },
                                  { label: "Replace PDF", icon: Upload, onClick: () => openUpload(material.courseId ?? id) },
                                ]}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
            {!loading && filtered.length > 0 && (
              <OrgTableFooter page={page} pageSize={PAGE_SIZE} total={filtered.length} noun={filtered.length === 1 ? "material" : "materials"} onPageChange={setPage} />
            )}
          </>
        )}
      </section>

      <KiniDialog
        open={open}
        onClose={() => !saving && setOpen(false)}
        icon={FileUp}
        title={<>Upload <span className="text-[#1f6fe5]">Material</span></>}
        subtitle="Upload a course resource and map it to an existing course."
        width={1180}
        className="kum-dialog"
        headerClassName="kum-dialog__header"
        artClassName="kum-dialog__art"
        art={<img src={ORG_BANNERS.courseDetails.src} alt="" onError={(event) => { event.currentTarget.src = ORG_BANNERS.courseDetails.fallbackSrc; }} />}
        meta={(
          <ul className="kum-features">
            {[
              [FolderUp, "Share Resources", "PDF course files", "purple"],
              [Layers, "Organize Content", "Map to courses", "green"],
              [Sparkles, "Better Learning", "Help students grow", "blue"],
            ].map(([Icon, label, text, tone]) => (
              <li key={label}>
                <span className={`kum-features__icon kum-features__icon--${tone}`} aria-hidden="true"><Icon /></span>
                <span><b>{label}</b><small>{text}</small></span>
              </li>
            ))}
          </ul>
        )}
        footer={(
          <>
            <p className="kum-footnote">
              <span aria-hidden="true"><ShieldCheck /></span>
              This material will be mapped to the selected course and visible to students based on course permissions.
            </p>
            <button type="button" className="kgi-btn kgi-btn--ghost" disabled={saving} onClick={() => setOpen(false)}>Cancel</button>
            <button type="button" className="kgi-btn kgi-btn--primary" disabled={saving} onClick={submit}>
              {saving ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Upload aria-hidden="true" />}
              {saving ? `Uploading ${progress}%` : "Upload Material"}
            </button>
          </>
        )}
      >
        <form onSubmit={submit} className="kum-form" noValidate>
          <div className="kum-grid">
            <div className="kgi-field">
              <label htmlFor="kum-title">Material Title<span aria-hidden="true"> *</span></label>
              <div className={`kgi-control ${errors.title ? "has-error" : ""}`}>
                <FileText className="kgi-control__icon" aria-hidden="true" />
                <input id="kum-title" value={form.title} placeholder="Enter material title" onChange={(event) => setForm({ ...form, title: event.target.value })} />
              </div>
              {errors.title && <p className="kgi-error">{errors.title}</p>}
            </div>
            <div className="kgi-field">
              <label htmlFor="kum-course">Course<span aria-hidden="true"> *</span></label>
              <div className={`kgi-control ${errors.courseId ? "has-error" : ""}`}>
                <BookOpen className="kgi-control__icon" aria-hidden="true" />
                <select id="kum-course" value={form.courseId} onChange={(event) => setForm({ ...form, courseId: event.target.value })}>
                  <option value="">Select course</option>
                  {courses.map((course) => <option key={course.courseId ?? course.id} value={String(course.courseId ?? course.id)}>{courseLabel(course)}</option>)}
                </select>
              </div>
              {errors.courseId && <p className="kgi-error">{errors.courseId}</p>}
            </div>
            <div className="kgi-field">
              <span className="kgi-field__label">Material Type</span>
              <div className="kum-types" role="radiogroup" aria-label="Material type">
                {MATERIAL_TYPES.map(({ value, label, icon: Icon, tone, supported }) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={form.materialType === value}
                    disabled={!supported}
                    title={supported ? undefined : "Only PDF uploads are supported right now"}
                    onClick={() => setForm({ ...form, materialType: value })}
                    className={`kum-type kum-type--${tone} ${form.materialType === value ? "is-active" : ""}`}
                  >
                    <span aria-hidden="true"><Icon /></span>
                    {label}
                    {form.materialType === value && <CheckCircle2 className="kum-type__check" aria-hidden="true" />}
                  </button>
                ))}
              </div>
            </div>
            <div className="kgi-field">
              <label htmlFor="kum-status">Status</label>
              <div className="kgi-control">
                <span className={`kum-status-dot kum-status-dot--${form.status.toLowerCase()}`} aria-hidden="true" />
                <select id="kum-status" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                  {["Draft", "Published", "Archived"].map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="kgi-field">
            <label htmlFor="kum-description">Description</label>
            <div className="kgi-control kgi-control--area">
              <FileText className="kgi-control__icon" aria-hidden="true" />
              <textarea id="kum-description" rows="3" maxLength={500} placeholder="Add a brief description about this material (optional)" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            </div>
            <p className="kum-counter">{form.description.length}/500</p>
          </div>
          <div className="kgi-field">
            <span className="kgi-field__label">File<span aria-hidden="true"> *</span></span>
            <input ref={fileInputRef} id="course-material-file" type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(event) => setForm({ ...form, file: event.target.files?.[0] ?? null })} />
            <div
              className={`kum-drop ${dragOver ? "is-over" : ""} ${errors.resource ? "has-error" : ""}`}
              onDragOver={(event) => { event.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragOver(false);
                const file = event.dataTransfer.files?.[0];
                if (file) setForm((current) => ({ ...current, file }));
              }}
            >
              <UploadCloud className="kum-drop__cloud" aria-hidden="true" />
              {form.file ? (
                <>
                  <p className="kum-drop__title">{form.file.name}</p>
                  <p className="kum-drop__hint">{(form.file.size / 1024 / 1024).toFixed(2)} MB · <button type="button" disabled={saving} onClick={() => fileInputRef.current?.click()}>choose another file</button></p>
                </>
              ) : (
                <>
                  <p className="kum-drop__title">Drag &amp; drop your file here</p>
                  <p className="kum-drop__hint">or <button type="button" disabled={saving} onClick={() => fileInputRef.current?.click()}>click to browse</button></p>
                </>
              )}
              <p className="kum-drop__formats">Supports PDF files</p>
              <span className="kum-drop__deco" aria-hidden="true">
                <i className="kum-drop__file kum-drop__file--pdf">PDF</i>
                <i className="kum-drop__file kum-drop__file--doc">W</i>
                <i className="kum-drop__file kum-drop__file--vid">▶</i>
              </span>
            </div>
            {errors.resource && <p className="kgi-error">{errors.resource}</p>}
          </div>
          {saving && (
            <div className="kum-progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
              <i style={{ width: `${progress}%` }} />
            </div>
          )}
        </form>
      </KiniDialog>
    </OrgPage>
  );
}
