import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import MentorPageHero from "../components/MentorPageHero";
import "./mentor-courses-density.css";
import CourseIcon from "../components/CourseIcon";
import { MENTOR_BANNERS } from "../constants/mentorBanners";
import { BookOpen, CalendarDays, ChevronDown, ChevronRight, CirclePlay, Download, Eye, FileText, GraduationCap, Grid3X3, Hourglass, Layers3, MoreVertical, Search, Upload, Users, UsersRound } from "lucide-react";
import { ROUTES } from "@shared/constants/routeConstants";
import { liveClassService } from "@features/live-classes/services/liveClassService";
import { normalizeLiveClassList } from "@features/live-classes/utils/liveClassMappers";
import { toast } from "sonner";
import { getMentorDashboardBatches, getMentorDashboardCourseSyllabus, getMentorDashboardCourses, getMentorDashboardStudents } from "@shared/services/mentorService";
import { batchService } from "@shared/services/batchService";
import { courseMaterialService } from "@shared/services/courseMaterialService";
import { courseService } from "@shared/services/courseService";
import { getApiErrorMessage } from "@shared/services/apiServices";
import tutorService from "@shared/services/tutorService";
import { studentsApi } from "@/api/students";
import { triggerFileDownload } from "@shared/utils/download";
import KPI from "@/components/common/KPI";

const TABS = [
  { id: "overview", label: "Overview", icon: BookOpen },
  { id: "syllabus", label: "Syllabus", icon: Layers3 },
  { id: "materials", label: "Course Materials", icon: FileText },
  { id: "matrix", label: "Course Matrix", icon: Grid3X3 },
];

const list = (value, key) => {
  const root = value?.data ?? value;
  if (Array.isArray(root)) return root;
  if (Array.isArray(root?.[key])) return root[key];
  for (const candidate of ["items", "records", "results"]) if (Array.isArray(root?.[candidate])) return root[candidate];
  return root?.data && root.data !== root ? list(root.data, key) : [];
};
const keyOf = (value) => String(value ?? "").trim().toLowerCase();
const formatDate = (value) => value && !Number.isNaN(new Date(value).getTime())
  ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value))
  : "Not scheduled";
const normalizeCourses = (response) => list(response, "courses").map((item) => ({
  ...item, id: item.courseId ?? item.id, name: item.courseName ?? item.name ?? item.title ?? "Assigned course",
  duration: item.duration ?? (item.totalSessions ? `${item.totalSessions} sessions` : "Not specified"),
  progress: Number(item.progress ?? item.progressPercentage ?? item.completionPercentage ?? 0),
  status: item.status ?? "Active", startDate: item.startDate ?? item.courseStartDate,
  currentTopic: item.currentTopic ?? item.todayTopic ?? "No topic scheduled today",
  nextTopic: item.nextTopic ?? "No next topic scheduled",
})).filter((item) => item.id != null);
const normalizeSyllabus = (payload) => {
  let root = payload ?? {};
  // The syllabus endpoint is returned with different wrapper depths across
  // deployments (data, result, syllabus, and courseSyllabus are all used).
  // Unwrap those containers before reading the module collection.
  for (let depth = 0; depth < 4 && root && !Array.isArray(root); depth += 1) {
    const nested = root.modules || root.sections || root.items || root.syllabusModules
      ? root
      : root.data ?? root.result ?? root.syllabus ?? root.courseSyllabus ?? root.course ?? root.courseDetails;
    if (!nested || nested === root) break;
    root = nested;
  }
  const modules = Array.isArray(root)
    ? root
    : root.modules ?? root.sections ?? root.items ?? root.syllabusModules ?? [];
  return modules.map((module, moduleIndex) => {
    const topics = list(module.topics ?? module.subjects ?? module.children ?? [], "topics").map((topic, topicIndex) => ({
      ...topic, id: topic.topicId ?? topic.id ?? `${moduleIndex}-${topicIndex}`,
      name: topic.topicName ?? topic.subjectName ?? topic.name ?? topic.title ?? `Topic ${topicIndex + 1}`,
      lessons: list(topic.lessons ?? topic.children ?? [], "lessons"),
      completed: Boolean(topic.completed ?? topic.isCompleted), isToday: Boolean(topic.isToday ?? topic.today),
    }));
    const completed = topics.filter((topic) => topic.completed).length;
    return { ...module, id: module.moduleId ?? module.id ?? moduleIndex, name: module.moduleName ?? module.moduleTitle ?? module.name ?? module.title ?? `Module ${moduleIndex + 1}`, topics, progress: Number(module.progress ?? module.progressPercentage ?? (topics.length ? completed / topics.length * 100 : 0)) };
  });
};

export default function MentorCourses() {
  const [params, setParams] = useSearchParams();
  const [courses, setCourses] = useState([]), [batches, setBatches] = useState([]);
  const [syllabus, setSyllabus] = useState([]), [materials, setMaterials] = useState([]);
  const [expanded, setExpanded] = useState({ 0: true }), [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true), [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(""), [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [pageOpenedAt] = useState(() => Date.now());
  const activeTab = TABS.some((tab) => tab.id === params.get("tab")) ? params.get("tab") : "overview";
  const selected = courses.find((course) => String(course.id) === params.get("courseId")) ?? courses[0] ?? null;

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true); setError("");
      try {
        const [courseResult, batchResult, studentResult, organizationStudentResult] = await Promise.allSettled([
          getMentorDashboardCourses(),
          getMentorDashboardBatches(),
          getMentorDashboardStudents(),
          studentsApi.list({ pageNumber: 1, pageSize: 1000 }),
        ]);
        const rawBatches = batchResult.status === "fulfilled" ? list(batchResult.value, "batches") : [];
        const rawStudents = studentResult.status === "fulfilled" ? list(studentResult.value, "students") : [];
        const organizationStudents = organizationStudentResult.status === "fulfilled" ? list(organizationStudentResult.value, "students") : [];
        const rawCourses = courseResult.status === "fulfilled"
          ? normalizeCourses(courseResult.value)
          : [];
        const derivedCourses = rawBatches.reduce((result, batch) => {
          const id = batch.courseId ?? batch.course?.courseId ?? batch.course?.id ?? batch.courseName ?? batch.course?.name;
          const name = batch.courseName ?? batch.CourseName ?? batch.course?.courseName ?? batch.course?.name;
          if (id == null || !name || result.some((course) => String(course.id) === String(id))) return result;
          result.push({
            id,
            name,
            duration: batch.course?.duration ?? batch.duration ?? "Not specified",
            progress: 0,
            status: batch.status ?? "Active",
            startDate: batch.startDate,
            currentTopic: "No topic scheduled today",
            nextTopic: "No next topic scheduled",
          });
          return result;
        }, []);
        const availableCourses = rawCourses.length ? rawCourses : derivedCourses;
        // The batch summary already contains the enrolled count. Only request
        // a roster when that count is absent, avoiding a broken legacy roster
        // endpoint on deployments that do not expose StudentBatch/{id}/students.
        const rosters = await Promise.allSettled(rawBatches
          .filter((batch) => (batch.batchId ?? batch.id) && batch.studentCount == null && batch.studentsCount == null && batch.enrolledStudents == null)
          .map(async (batch) => ({ id: batch.batchId ?? batch.id, students: await batchService.getStudents(batch.batchId ?? batch.id) })));
        const enriched = availableCourses.map((course) => {
          const matching = rawBatches.filter((batch) => String(batch.courseId ?? batch.course?.id) === String(course.id) || keyOf(batch.courseName ?? batch.course?.name) === keyOf(course.name));
          const ids = new Set();
          const matchingBatchIds = new Set(matching.map((batch) => String(batch.batchId ?? batch.id)));
          const matchingBatchNames = new Set(matching.map((batch) => keyOf(batch.batchName ?? batch.name)).filter(Boolean));
          const countStudent = (student) => {
            const studentBatchId = student.batchId ?? student.batch?.batchId ?? student.batch?.id;
            const studentBatchName = keyOf(student.batchName ?? student.batch?.batchName ?? student.batch?.name ?? student.batch);
            const studentCourseId = student.courseId ?? student.course?.courseId ?? student.course?.id;
            const studentCourseName = keyOf(student.courseName ?? student.course?.courseName ?? student.course?.name ?? student.course);
            const belongsToBatch = (studentBatchId != null && matchingBatchIds.has(String(studentBatchId))) || (studentBatchName && matchingBatchNames.has(studentBatchName));
            const belongsToCourse = String(studentCourseId ?? "") === String(course.id) || studentCourseName === keyOf(course.name);
            if ((belongsToBatch || belongsToCourse) && (student.studentId ?? student.id ?? student.email)) {
              ids.add(String(student.studentId ?? student.id ?? student.email));
            }
          };
          rawStudents.forEach(countStudent);
          organizationStudents.forEach(countStudent);
          matching.forEach((batch) => { const result = rosters.find((entry) => entry.status === "fulfilled" && String(entry.value.id) === String(batch.batchId ?? batch.id)); list(result?.status === "fulfilled" ? result.value.students : [], "students").forEach((student) => ids.add(String(student.studentId ?? student.id ?? student.email))); });
          return { ...course, batches: matching.length, students: ids.size || matching.reduce((sum, batch) => sum + Number(batch.studentCount ?? 0), 0), startDate: course.startDate ?? matching[0]?.startDate };
        });
        if (alive) {
          setCourses(enriched);
          setBatches(rawBatches);
          if (!enriched.length && courseResult.status === "rejected" && batchResult.status === "rejected") {
            setError(courseResult.reason?.response?.data?.message ?? "Unable to load assigned courses.");
          }
        }
      } catch (requestError) { if (alive) setError(requestError?.response?.data?.message ?? requestError?.message ?? "Unable to load assigned courses."); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!selected) return;
    let alive = true;
    setDetailLoading(true);
    Promise.allSettled([
      getMentorDashboardCourseSyllabus(selected.id),
      courseService.getSyllabus(selected.id),
      tutorService.modules(selected.id),
      courseMaterialService.list(),
      Promise.resolve(selected),
    ]).then(([mentorSyllabusResult, syllabusResult, modulesResult, materialResult, courseResult]) => {
      if (!alive) return;
      const mentorApiSyllabus = mentorSyllabusResult.status === "fulfilled" ? normalizeSyllabus(mentorSyllabusResult.value) : [];
      const apiSyllabus = syllabusResult.status === "fulfilled" ? normalizeSyllabus(syllabusResult.value) : [];
      const apiModules = modulesResult.status === "fulfilled" ? normalizeSyllabus(modulesResult.value) : [];
      const courseDetails = courseResult.status === "fulfilled" ? courseResult.value : null;
      const embeddedSyllabus = normalizeSyllabus(
        selected.syllabus
          ?? selected.courseSyllabus
          ?? courseDetails?.syllabus
          ?? courseDetails?.courseSyllabus
          ?? (Array.isArray(selected.modules) ? { modules: selected.modules } : null)
          ?? (Array.isArray(courseDetails?.modules) ? { modules: courseDetails.modules } : null),
      );
      setSyllabus(
        mentorApiSyllabus.length
          ? mentorApiSyllabus
          : apiSyllabus.length
            ? apiSyllabus
            : apiModules.length
              ? apiModules
              : embeddedSyllabus,
      );
      const all = materialResult.status === "fulfilled" ? materialResult.value : [];
      setMaterials(all.filter((item) => String(item.courseId ?? item.id) === String(selected.id) || keyOf(item.courseName) === keyOf(selected.name)));
      setExpanded({ 0: true }); setDetailLoading(false);
    });
    return () => { alive = false; };
  }, [selected?.id]);

  useEffect(() => {
    let alive = true;
    liveClassService.list()
      .then((rows) => { if (alive) setClasses(normalizeLiveClassList(rows)); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => courses.filter((course) => keyOf(course.name).includes(keyOf(search))), [courses, search]);
  const selectedBatches = batches.filter((batch) => String(batch.courseId ?? batch.course?.id) === String(selected?.id) || keyOf(batch.courseName ?? batch.course?.name) === keyOf(selected?.name));
  const completedTopics = syllabus.reduce((sum, module) => sum + module.topics.filter((topic) => topic.completed).length, 0);
  const totalTopics = syllabus.reduce((sum, module) => sum + module.topics.length, 0);
  const changeTab = (tab) => setParams((current) => { current.set("tab", tab); if (selected) current.set("courseId", selected.id); return current; }, { replace: true });

  const upload = async (event) => {
    const file = event.target.files?.[0]; event.target.value = "";
    if (!file || !selected) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Only PDF files can be uploaded as course material.");
      return;
    }
    setUploading(true);
    try {
      const body = new FormData(); body.append("courseId", selected.id); body.append("file", file);
      await courseMaterialService.create(body);
      const all = await courseMaterialService.list();
      setMaterials(all.filter((item) => String(item.courseId ?? item.id) === String(selected.id)));
      toast.success(`${file.name} uploaded successfully.`);
    } catch (uploadError) { toast.error(getApiErrorMessage(uploadError, "Unable to upload material. Check the courses server connection and try again.")); }
    finally { setUploading(false); }
  };
  const openMaterial = async (material, download = false) => {
    if (!material?.resourceUrl && !material?.courseId) {
      toast.error("File URL is unavailable.");
      return;
    }
    const preview = download ? null : window.open("", "_blank");
    if (preview) preview.opener = null;
    const materialId = material.materialId ?? material.id ?? material.courseId;
    if (download) setDownloadingId(materialId);
    try {
      // Fetch through the authenticated API client. Opening resourceUrl directly
      // makes relative values such as /coursepdfs/... fall through to the SPA
      // router and display the application's 404 page.
      const blob = await courseMaterialService.file(material);
      if (download) {
        const filename = material.pdfFileName ?? material.fileName ?? material.title ?? "course-material";
        triggerFileDownload(blob, /\.pdf$/i.test(filename) ? filename : `${filename}.pdf`);
        toast.success("Course material downloaded successfully.");
      } else if (preview && !preview.closed) {
        const previewUrl = URL.createObjectURL(blob);
        preview.location.href = previewUrl;
        window.setTimeout(() => URL.revokeObjectURL(previewUrl), 60000);
      } else if (!download) {
        // Popup blockers can prevent the preview tab even though the file was
        // fetched successfully. Keep the action useful in that case.
        triggerFileDownload(blob, `${material.title ?? "course-material"}.pdf`);
        toast.info("Preview was blocked, so the PDF was downloaded instead.");
      }
    } catch (error) {
      preview?.close();
      toast.error(download
        ? "Unable to download this file."
        : error?.response?.status === 404 ? "This file is no longer available." : "Unable to open this file.");
    } finally {
      if (download) setDownloadingId(null);
    }
  };

  const nextClass = useMemo(() => {
    if (!selected) return null;
    const now = pageOpenedAt;
    return classes
      .filter((item) => String(item.courseId ?? "") === String(selected.id) || keyOf(item.courseName) === keyOf(selected.name))
      .map((item) => ({ item, at: new Date(`${String(item.scheduledDate ?? item.date ?? item.classDate ?? "").slice(0, 10)}T${String(item.startTime ?? "00:00").slice(0, 5)}`).getTime() }))
      .filter(({ at }) => Number.isFinite(at) && at >= now)
      .sort((left, right) => left.at - right.at)[0] ?? null;
  }, [classes, selected, pageOpenedAt]);

  return <main className="mentor-courses-page mv17 min-h-full bg-[#faf7f1] px-3 pb-4 dark:bg-slate-950 sm:px-4"><div className="mx-auto max-w-[1500px] space-y-3">
    <MentorPageHero
      icon={BookOpen}
      title="My Courses"
      subtitle="Manage your courses, update syllabus, share materials and track teaching progress in one place."
      image={MENTOR_BANNERS.attendance.src}
      artWidth="330px"
      script={[{ text: "Teach", accent: true }, { text: "Inspire", accent: true }, { text: "Empower" }]}
    />
    <nav className="mv17-tabbar" aria-label="Course sections">{TABS.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => changeTab(id)} aria-current={activeTab === id ? "page" : undefined}><Icon aria-hidden="true" />{label}</button>)}</nav>
    <section className="grid items-start gap-3 lg:grid-cols-[minmax(240px,25%)_minmax(0,1fr)]">
      <aside className="mv17-card mv17-course-list lg:sticky lg:top-3">
        <h2>My Courses</h2>
        <label className="mv17-search"><Search aria-hidden="true" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search courses..." aria-label="Search courses" /></label>
        <div className="mv17-course-list__items">
          {filtered.map((course) => <button key={course.id} type="button" aria-current={selected?.id === course.id ? "true" : undefined} onClick={() => setParams({ courseId: String(course.id), tab: activeTab })}>
            <CourseIcon name={course.name} size="sm" />
            <span className="min-w-0 flex-1"><b>{course.name}</b><small>{course.batches} {course.batches === 1 ? "batch" : "batches"} <i aria-hidden="true">•</i> {course.students} students</small></span>
            <ChevronRight className="mv17-course-list__chev" aria-hidden="true" />
          </button>)}
          {!loading && !filtered.length && <p className="mv17-muted-note">{courses.length ? "No courses match your search." : "No assigned courses."}</p>}
        </div>
      </aside>
      <div className="mv17-card mv17-course-detail min-w-0">
        {loading ? <div className="h-64 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"/> : error ? <State text={error} error/> : !selected ? <State text="No assigned courses found."/> : <>
          <header className="mv17-course-detail__head">
            <CourseIcon name={selected.name} size="lg" />
            <div className="min-w-0 flex-1">
              <h2>{selected.name}</h2>
              <p>{selected.duration}<span aria-hidden="true">|</span>Starts {formatDate(selected.startDate)}</p>
            </div>
            <span className={`mv17-status ${/inactive|closed|complete/i.test(selected.status) ? "mv17-status--gray" : "mv17-status--green"} mv17-status--auto`}><i />{selected.status}</span>
            <div className="mv17-menu-wrap">
              <button type="button" className="mv17-icon-btn" aria-label="More course actions" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><MoreVertical aria-hidden="true" /></button>
              {menuOpen && <div className="mv17-menu" role="menu">
                <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); changeTab("syllabus"); }}>View syllabus</button>
                <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); changeTab("materials"); }}>Course materials</button>
                <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); navigate(ROUTES.MENTOR.BATCHES); }}>View batches</button>
              </div>}
            </div>
          </header>
          <div className="mv17-course-detail__body">{detailLoading ? <div className="h-44 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"/> : activeTab === "overview" ? <Overview course={selected} batches={selectedBatches} totalTopics={totalTopics} completedTopics={completedTopics} nextClass={nextClass?.item} onBatch={(id) => navigate(`${ROUTES.MENTOR.BATCHES}/${id}`)} onAllBatches={() => navigate(ROUTES.MENTOR.BATCHES)} />
          : activeTab === "syllabus" ? <Syllabus modules={syllabus} expanded={expanded} setExpanded={setExpanded}/>
          : activeTab === "materials" ? <Materials items={materials} fileRef={fileRef} upload={upload} uploading={uploading} openMaterial={openMaterial} downloadingId={downloadingId}/>
          : <Matrix modules={syllabus} completed={completedTopics} total={totalTopics}/>}</div>
        </>}
      </div>
    </section>
  </div></main>;
}

// Only the API's own completion figure is shown — no progress is inferred
// from calendar dates.
const batchProgress = (batch) => {
  const explicit = Number(batch.progress ?? batch.progressPercentage ?? batch.completionPercentage ?? 0);
  return Number.isFinite(explicit) ? Math.max(0, Math.min(100, Math.round(explicit))) : 0;
};

function Overview({ course, batches, totalTopics, completedTopics, nextClass, onBatch, onAllBatches }) {
  const teachingProgress = totalTopics ? Math.round((completedTopics / totalTopics) * 100) : Math.round(course.progress || 0);
  const kpis = [
    ["purple", UsersRound, batches.length, "Active Batches"],
    ["green", Users, course.students, "Total Students"],
    ["orange", BookOpen, totalTopics, "Syllabus Topics"],
  ];
  const nextClassText = nextClass
    ? `${formatDate(nextClass.scheduledDate ?? nextClass.date)}${nextClass.startTime ? `, ${String(nextClass.startTime).slice(0, 5)}` : ""}`
    : "No class scheduled";
  return <div className="space-y-3">
    <div className="mv17-kpi-row">
      {kpis.map(([tone, Icon, value, label]) => <KPI key={label} label={label} value={value} icon={Icon} accent={tone} />)}
      <KPI label="Teaching Progress" value={`${teachingProgress}%`} icon={<ProgressRingIcon value={teachingProgress} />} accent="blue" />
    </div>
    <div className="grid gap-3 md:grid-cols-3">
      <Info icon={CalendarDays} label="Start Date" value={formatDate(course.startDate)}/>
      <Info icon={Hourglass} label="Course Duration" value={course.duration}/>
      <Info icon={GraduationCap} label="Next Class" value={nextClassText}/>
    </div>
    <section className="mv17-subcard">
      <div className="mv17-subcard__head"><h3>Recent Batches</h3><button type="button" className="mv17-outline-orange" onClick={onAllBatches}>View All Batches</button></div>
      <div className="mv17-table-wrap mv17-table-wrap--flush">
        <table data-table-header="plain" className="mv17-table mv17-table--compact">
          <thead><tr><th className="mv17-col-num">#</th><th>Batch Name</th><th>Start Date</th><th>End Date</th><th>Students</th><th>Status</th><th>Progress</th></tr></thead>
          <tbody>
            {batches.slice(0, 5).map((batch, index) => { const progress = batchProgress(batch); const status = batch.status ?? "Active"; return <tr key={batch.batchId ?? batch.id ?? index}>
              <td className="mv17-col-num">{index + 1}</td>
              <td className="font-semibold">{batch.batchName ?? batch.name}</td>
              <td>{formatDate(batch.startDate)}</td>
              <td>{formatDate(batch.endDate)}</td>
              <td>{batch.studentCount ?? batch.studentsCount ?? batch.enrolledStudents ?? 0}</td>
              <td><button type="button" onClick={() => onBatch(batch.batchId ?? batch.id)} className={`mv17-status mv17-status--auto ${/active|ongoing/i.test(status) ? "mv17-status--green" : /upcoming|scheduled/i.test(status) ? "mv17-status--blue" : "mv17-status--gray"}`}><i />{status}<ChevronRight className="h-3.5 w-3.5" aria-hidden="true" /></button></td>
              <td><span className="mv17-progress"><span><i style={{ width: `${progress}%` }} /></span>{progress}%</span></td>
            </tr>; })}
            {!batches.length && <tr><td colSpan="7" className="mv15-empty-cell">No batches are assigned for this course yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
    <div className="grid gap-3 md:grid-cols-2">
      <TopicCard icon={FileText} label="Today's Topic" value={course.currentTopic} />
      <TopicCard icon={CirclePlay} label="Next Topic" value={course.nextTopic} />
    </div>
  </div>;
}
function TopicCard({ icon: Icon, label, value }) { return <div className="mv17-topic"><span className="mv17-topic__icon"><Icon aria-hidden="true" /></span><div><h3>{label}</h3><p>{value}</p></div></div>; }
function Syllabus({ modules, expanded, setExpanded }) { return modules.length ? <div className="space-y-3">{modules.map((module, index) => <article key={module.id} className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700"><button onClick={() => setExpanded((old) => ({ ...old, [index]: !old[index] }))} className="flex w-full items-center gap-3 bg-slate-50 px-4 py-3 text-left dark:bg-slate-800"><ChevronDown className={`h-4 w-4 transition ${expanded[index] ? "rotate-180" : ""}`}/><div className="min-w-0 flex-1"><b className="text-sm text-slate-900 dark:text-white">{module.name}</b><p className="text-[10px] text-slate-500">{module.topics.length} topics · {module.topics.reduce((sum, topic) => sum + topic.lessons.length, 0)} lessons</p></div><span className="text-xs font-black text-blue-600">{Math.round(module.progress)}%</span></button>{expanded[index] && <div className="divide-y divide-slate-100 dark:divide-slate-800">{module.topics.map((topic) => <div key={topic.id} className={`px-5 py-3 ${topic.isToday ? "bg-blue-50 dark:bg-blue-950/30" : ""}`}><div className="flex justify-between gap-3"><span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{topic.name}</span>{topic.isToday && <span className="rounded-full bg-blue-600 px-2 py-1 text-[9px] font-bold text-white">TODAY</span>}</div>{topic.lessons.map((lesson, lessonIndex) => <p key={lesson.lessonId ?? lesson.id ?? lessonIndex} className="ml-4 mt-2 text-xs text-slate-500">• {lesson.lessonName ?? lesson.name ?? lesson.title ?? `Lesson ${lessonIndex + 1}`}</p>)}</div>)}</div>}</article>)}</div> : <State text="The institute has not published syllabus modules for this course."/>; }
function Materials({ items, fileRef, upload, uploading, openMaterial, downloadingId }) { return <div><div className="mb-4 flex justify-end"><input ref={fileRef} type="file" className="hidden" onChange={upload}/><button disabled={uploading} onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-60"><Upload className="h-4 w-4"/>{uploading ? "Uploading…" : "Upload material"}</button></div>{items.length ? <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700"><table className="w-full min-w-[650px] text-left text-xs"><thead className="bg-slate-100 text-[10px] uppercase tracking-wider dark:bg-slate-800"><tr><th className="p-3">File name</th><th>Type</th><th>Size</th><th>Uploaded date</th><th>Actions</th></tr></thead><tbody>{items.map((item) => { const id = item.materialId ?? item.id ?? item.courseId; return <tr key={id} className="border-t border-slate-100 dark:border-slate-800"><td className="p-3 font-bold">{item.title}</td><td>{item.materialType ?? "PDF"}</td><td>{item.size ?? "—"}</td><td>{formatDate(item.uploadedDate ?? item.updatedAt)}</td><td><div className="flex gap-3"><button onClick={() => openMaterial(item)} className="inline-flex items-center gap-1 text-blue-600"><Eye className="h-3.5 w-3.5"/>View</button><button type="button" disabled={downloadingId === id} onClick={() => openMaterial(item, true)} className="inline-flex items-center gap-1 text-blue-600 disabled:cursor-wait disabled:opacity-60"><Download className="h-3.5 w-3.5"/>{downloadingId === id ? "Downloading…" : "Download"}</button></div></td></tr>; })}</tbody></table></div> : <State text="No materials have been uploaded for this course."/>}</div>; }
function Matrix({ modules, completed, total }) { return modules.length ? <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700"><table className="w-full min-w-[620px] text-left text-xs"><thead className="bg-slate-100 text-[10px] uppercase dark:bg-slate-800"><tr><th className="p-3">Module</th><th>Total topics</th><th>Completed</th><th>Remaining</th><th>Progress</th></tr></thead><tbody>{modules.map((module) => { const done = module.topics.filter((topic) => topic.completed).length; return <tr key={module.id} className="border-t border-slate-100 dark:border-slate-800"><td className="p-3 font-bold">{module.name}</td><td>{module.topics.length}</td><td>{done}</td><td>{module.topics.length - done}</td><td className="w-48"><div className="flex items-center gap-2"><div className="h-2 flex-1 rounded-full bg-slate-100 dark:bg-slate-700"><div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.min(100, module.progress)}%` }}/></div><b>{Math.round(module.progress)}%</b></div></td></tr>; })}</tbody></table><div className="border-t p-3 text-xs font-bold dark:border-slate-700">Overall: {completed} of {total} topics completed</div></div> : <State text="Course matrix will appear after syllabus modules are published."/>; }
function Info({ icon: Icon, label, value }) { return <div className="mv17-info">{Icon && <span className="mv17-info__icon"><Icon aria-hidden="true"/></span>}<div className="min-w-0"><p className="mv17-info__label">{label}</p><p className="mv17-info__value">{value}</p></div></div>; }
function State({ text, error = false }) { return <div className={`rounded-xl border border-dashed p-10 text-center text-sm ${error ? "border-rose-300 font-bold text-rose-600" : "border-slate-300 text-slate-500 dark:border-slate-700"}`}>{text}</div>; }

// Teaching progress shown as a ring inside the KPI icon circle.
function ProgressRingIcon({ value = 0 }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const circumference = 2 * Math.PI * 9;
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity=".2" strokeWidth="3" />
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
        strokeDasharray={`${(pct / 100) * circumference} ${circumference}`} transform="rotate(-90 12 12)" />
    </svg>
  );
}
