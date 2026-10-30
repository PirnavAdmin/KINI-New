import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDownUp, BookOpen, CalendarDays, ChevronDown, CirclePlay, CloudDownload, Download, Eye, File, FileCode2, FileText, FolderOpen, Layers, Loader2, Search } from "lucide-react";
import StudentPageBanner from "@features/student/components/StudentPageBanner";
import { STUDENT_BANNERS } from "@features/student/constants/studentBanners";
import { courseMaterialService } from "@shared/services/courseMaterialService";
import { courseService } from "@/services/courseService";
import { triggerFileDownload } from "@shared/utils/download";
import toast from "react-hot-toast";

const courseIdOf = (course = {}) => course.courseId ?? course.id;
const courseNameOf = (course = {}) => course.courseName ?? course.title ?? course.name ?? "Assigned course";
const materialUrlOf = (course = {}) => course.resourceUrl ?? course.pdfUrl ?? course.coursePdfUrl ?? course.pdfFileUrl ?? course.documentUrl ?? course.fileUrl ?? course.materialUrl ?? course.courseMaterialUrl ?? null;
const MATERIAL_FEATURES = [
  { Icon: FileText, title: "PDF Notes", text: "Study Material", tone: "pink" },
  { Icon: CirclePlay, title: "Video Resources", text: "Class Recordings", tone: "orange" },
  { Icon: FileCode2, title: "Code Files", text: "Practice & Projects", tone: "violet" },
  { Icon: CloudDownload, title: "Additional Resources", text: "Docs & References", tone: "green" },
];
const typeOf = (material = {}) => String(material.materialType ?? material.fileType ?? material.type ?? "PDF").toUpperCase();
const tagsOf = (material = {}) => {
  const raw = material.tags ?? material.keywords ?? material.topics ?? material.topic ?? [];
  const list = Array.isArray(raw) ? raw : String(raw).split(",");
  return list.map((tag) => String(tag?.name ?? tag).trim()).filter(Boolean);
};
const dateOf = (material = {}) => material.publishedAt ?? material.uploadedAt ?? material.createdAt ?? material.updatedAt ?? null;
const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};
const formatSize = (material = {}) => {
  const bytes = Number(material.fileSize ?? material.size ?? material.sizeInBytes);
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};
const authorOf = (material = {}) => material.uploadedByName ?? material.mentorName ?? material.createdByName ?? material.uploadedBy?.name ?? (typeof material.uploadedBy === "string" ? material.uploadedBy : "");
const initialsOf = (name = "") => String(name).trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "M";
const fileNameOf = (material = {}) => material.title ?? material.pdfFileName ?? material.fileName ?? `${courseNameOf(material)} material`;
const materialIdOf = (material = {}) => material.materialId ?? material.documentId ?? material.courseMaterialId ?? material.id ?? material.courseId;

export default function StudentCourseMaterials() {
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openingId, setOpeningId] = useState(null);
  const [fileError, setFileError] = useState("");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("latest");

  const loadMaterials = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const courses = await courseService.getStudentCourses();
      const assignedCourse = courses[0] ?? null;
      setCourse(assignedCourse);
      if (!assignedCourse) { setMaterials([]); return; }
      let publishedMaterials = [];
      try {
        const allMaterials = await courseMaterialService.list();
        const assignedCourseId = String(courseIdOf(assignedCourse));
        publishedMaterials = allMaterials.filter((material) => String(material.courseId ?? material.id) === assignedCourseId || String(material.courseName ?? "").trim().toLowerCase() === courseNameOf(assignedCourse).trim().toLowerCase());
      } catch {
        // Student access can be restricted from the organization-wide file list.
      }
      if (!publishedMaterials.length && materialUrlOf(assignedCourse)) {
        publishedMaterials = [{ ...assignedCourse, id: courseIdOf(assignedCourse), materialId: courseIdOf(assignedCourse), title: assignedCourse.pdfFileName ?? `${courseNameOf(assignedCourse)} course material`, courseName: courseNameOf(assignedCourse), materialType: "PDF", resourceUrl: materialUrlOf(assignedCourse) }];
      }
      setMaterials(publishedMaterials);
    } catch {
      setCourse(null); setMaterials([]); setError("Unable to load your course materials. Please try again.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { queueMicrotask(loadMaterials); }, [loadMaterials]);

  const openMaterial = async (material, download = false) => {
    const resourceUrl = material.resourceUrl ?? materialUrlOf(material);
    if (!resourceUrl) return;
    const materialId = materialIdOf(material);
    // Reserve the tab during the click, before awaiting the authenticated file request.
    const preview = download ? null : window.open("about:blank", "_blank");
    if (preview) preview.opener = null;
    setOpeningId(materialId);
    setFileError("");
    try {
      const blob = await courseMaterialService.file({ ...material, resourceUrl });
      if (download || !preview) {
        const filename = material.pdfFileName ?? material.fileName ?? fileNameOf(material);
        triggerFileDownload(blob, /\.pdf$/i.test(filename) ? filename : `${filename}.pdf`);
        toast.success("Course material downloaded successfully.");
      } else {
        const previewUrl = URL.createObjectURL(blob);
        preview.location.replace(previewUrl);
        window.setTimeout(() => URL.revokeObjectURL(previewUrl), 60000);
      }
    } catch (error) {
      preview?.close();
      setFileError(error?.response?.status === 404 ? "This file is no longer available. Please contact your mentor." : "Unable to open this file. Please try again.");
    } finally { setOpeningId(null); }
  };

  const courseName = courseNameOf(course ?? {});
  const types = useMemo(() => [...new Set(materials.map(typeOf))].sort(), [materials]);
  const topics = useMemo(() => [...new Set(materials.flatMap(tagsOf))].sort(), [materials]);
  const visible = useMemo(() => {
    const value = query.trim().toLowerCase();
    const list = materials.filter((material) => {
      if (typeFilter !== "all" && typeOf(material) !== typeFilter) return false;
      if (topicFilter !== "all" && !tagsOf(material).includes(topicFilter)) return false;
      if (!value) return true;
      return [fileNameOf(material), material.description, ...tagsOf(material)].filter(Boolean).join(" ").toLowerCase().includes(value);
    });
    const time = (material) => new Date(dateOf(material) ?? 0).getTime() || 0;
    return [...list].sort((a, b) => (sortOrder === "name"
      ? fileNameOf(a).localeCompare(fileNameOf(b))
      : sortOrder === "oldest" ? time(a) - time(b) : time(b) - time(a)));
  }, [materials, query, typeFilter, topicFilter, sortOrder]);

  return <main className="ksl-page w-full px-2 py-2 sm:px-3">
    <StudentPageBanner
      banner={STUDENT_BANNERS.courseMaterials}
      icon={BookOpen}
      eyebrow="Learning Library"
      title="Course"
      highlight="Materials"
      description={<>Access mentor-published PDFs, notes, recordings and resources<br className="ksl-hide-sm" /> for {course ? courseName : "your course"}. Learn, practice and build your skills!</>}
      features={MATERIAL_FEATURES}
      featuresVariant="divided"
    />
    <div className="ksx-stack">
      {fileError && <div role="alert" className="ksx-alert ksx-alert--error">{fileError}</div>}
      <section className="ksl-card">
        <div className="ksx-head">
          <div className="ksx-head__main">
            <span className="ksx-head__icon ksl-tone--orange"><FolderOpen /></span>
            <div><h2 className="ksx-head__title">{course ? `${courseName} Library` : "Course Library"}</h2><p className="ksx-head__sub">Only files published for your assigned course are shown here.</p></div>
          </div>
          {!loading && !error && <span className="ksl-pill ksl-pill--success"><i />{materials.length} {materials.length === 1 ? "resource" : "resources"} available</span>}
        </div>
      </section>

      <div className="ksx-filters ksl-card">
        <label className="ksx-field"><Search aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search materials..." aria-label="Search materials" /></label>
        <label className="ksx-field"><File aria-hidden="true" /><select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} aria-label="Filter by type"><option value="all">All Types</option>{types.map((type) => <option key={type} value={type}>{type}</option>)}</select><ChevronDown aria-hidden="true" className="ksx-field__chevron" /></label>
        <label className="ksx-field"><Layers aria-hidden="true" /><select value={topicFilter} onChange={(event) => setTopicFilter(event.target.value)} aria-label="Filter by topic"><option value="all">All Topics</option>{topics.map((topic) => <option key={topic} value={topic}>{topic}</option>)}</select><ChevronDown aria-hidden="true" className="ksx-field__chevron" /></label>
        <label className="ksx-field"><ArrowDownUp aria-hidden="true" /><select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} aria-label="Sort materials"><option value="latest">Latest First</option><option value="oldest">Oldest First</option><option value="name">Name (A–Z)</option></select><ChevronDown aria-hidden="true" className="ksx-field__chevron" /></label>
      </div>

      {loading ? <div className="ksl-card ksx-empty" style={{ borderStyle: "solid" }}><Loader2 className="h-6 w-6 animate-spin text-slate-400" /><p style={{ marginTop: "0.6rem" }}>Loading published materials...</p></div>
        : error ? <div className="ksx-alert ksx-alert--error"><span>{error}</span><button type="button" onClick={loadMaterials} className="ksl-btn ksl-btn--orange">Retry</button></div>
          : !course ? <div className="ksx-empty"><span className="ksx-empty__icon"><BookOpen /></span><h3>No course assigned</h3><p>No course is assigned to this student yet.</p></div>
            : !visible.length ? <div className="ksx-empty"><span className="ksx-empty__icon"><FileText /></span><h3>{materials.length ? "No matching materials" : "No materials yet"}</h3><p>{materials.length ? "Try a different search or filter." : `No materials have been published for ${courseName} yet.`}</p></div>
              : visible.map((material) => {
                const id = materialIdOf(material) ?? fileNameOf(material);
                const isOpening = openingId === id;
                const hasFile = Boolean(material.resourceUrl ?? materialUrlOf(material));
                const tags = tagsOf(material);
                const size = formatSize(material);
                const date = formatDate(dateOf(material));
                const author = authorOf(material);
                return <article key={id} className="ksl-card ksx-material">
                  <span className="ksx-material__icon"><FileText /><span>{typeOf(material)}</span></span>
                  <div style={{ minWidth: 0 }}>
                    <h3 className="ksx-material__title">{fileNameOf(material)}</h3>
                    <div className="ksx-material__meta ksx-material__meta--divided">
                      <span className="ksx-chip ksl-tone--blue">{typeOf(material)}</span>
                      {author && <span><i className="ksx-mini-avatar">{initialsOf(author)}</i>{author}</span>}
                      {date && <span><CalendarDays />{date}</span>}
                      {size && <span><File />{size}</span>}
                      {tags.map((tag) => <span key={tag} className="ksx-tag-dot">{tag}</span>)}
                    </div>
                    {material.description && <p className="ksx-material__desc">{material.description}</p>}
                  </div>
                  <div className="ksx-material__actions">
                    <button type="button" onClick={() => openMaterial(material)} disabled={openingId !== null || !hasFile} className="ksl-btn ksl-btn--orange"><Eye />{isOpening ? "Opening..." : "Open PDF"}</button>
                    <button type="button" onClick={() => openMaterial(material, true)} disabled={openingId !== null || !hasFile} className="ksx-btn-outline"><Download />Download PDF</button>
                  </div>
                </article>;
              })}
    </div>
  </main>;
}
