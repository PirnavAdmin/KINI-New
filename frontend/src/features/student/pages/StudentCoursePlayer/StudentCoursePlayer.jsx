import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, BookOpen, CalendarDays, CheckCircle2, ChevronRight, ClipboardCheck, Clock3, Download, FileText, LoaderCircle, LockKeyhole, MessageCircle, PlayCircle, UserRound, UsersRound } from "lucide-react";
import { courseService as studentCourseService } from "@/services/courseService";
import { courseService as organizationCourseService } from "@shared/services/courseService";
import tutorService from "@shared/services/tutorService";
import toast from "react-hot-toast";
import { triggerFileDownload } from "@shared/utils/download";
import { courseMaterialService } from "@shared/services/courseMaterialService";
import { studentClassService } from "@shared/services/studentClassService";
import { getStudentJoinState, normalizeLiveClassList } from "@features/live-classes/utils/liveClassMappers";
import { ROUTES } from "@shared/constants/routeConstants";
import { createSectionAssessment } from "./utils/createSectionAssessment";
import { getStoredCoursePercentages } from "@features/student/utils/studentProgressAccess";
import { ORG_BANNERS } from "@features/organization/constants/orgBanners";
import "./student-course-hero.css";

const rows = (value) => Array.isArray(value) ? value : value?.data || value?.items || value?.results || value?.rows || value?.content || [];
const pick = (...values) => values.find((value) => value !== undefined && value !== null && String(value).trim() !== "");
const nameOf = (...values) => String(pick(...values) || "").trim().replace(/\b\w/g, (letter) => letter.toUpperCase());
const dateTime = (value) => value && !Number.isNaN(new Date(value).getTime()) ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Schedule unavailable";
const countdown = (target, now) => {
  const totalSeconds = Math.max(0, Math.ceil((new Date(target).getTime() - now) / 1000));
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  return `${days ? `${days}d ` : ""}${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
};

const DEVOPS_SYLLABUS = [
  { id: "devops-1", name: "DevOps Foundations", description: "Understand modern software delivery, collaboration and reliability.", topics: [
    { id: "devops-1-1", name: "DevOps Lifecycle & Culture", description: "DevOps principles, lifecycle, roles and delivery practices." },
    { id: "devops-1-2", name: "Agile, Scrum & SDLC", description: "Plan and deliver software using modern development workflows." },
    { id: "devops-1-3", name: "Delivery Metrics & SRE Basics", description: "DORA metrics, SLIs, SLOs and reliability fundamentals." },
  ] },
  { id: "devops-2", name: "Linux & Networking", description: "Build the operating-system and networking foundation used by DevOps engineers.", topics: [
    { id: "devops-2-1", name: "Linux Administration", description: "Users, permissions, processes, packages and system services." },
    { id: "devops-2-2", name: "Shell Scripting", description: "Automate operational work using Bash and command-line tools." },
    { id: "devops-2-3", name: "DNS, HTTP, SSH & Troubleshooting", description: "Diagnose connectivity, protocols, ports and service failures." },
  ] },
  { id: "devops-3", name: "Git & Collaboration", description: "Manage source code and releases through professional team workflows.", topics: [
    { id: "devops-3-1", name: "Git Fundamentals", description: "Repositories, commits, history, remotes and conflict resolution." },
    { id: "devops-3-2", name: "Branching & Pull Requests", description: "Feature branches, reviews, merging and collaboration." },
    { id: "devops-3-3", name: "GitHub Workflow & Releases", description: "Tags, releases, protected branches and repository automation." },
  ] },
  { id: "devops-4", name: "Docker & Containers", description: "Package and run applications consistently across environments.", topics: [
    { id: "devops-4-1", name: "Images & Containers", description: "Container lifecycle, layers, volumes and networking." },
    { id: "devops-4-2", name: "Dockerfile & Registries", description: "Build optimized images and publish them securely." },
    { id: "devops-4-3", name: "Docker Compose & Networking", description: "Operate practical multi-container applications." },
  ] },
  { id: "devops-5", name: "CI/CD Automation", description: "Build reliable automated software delivery pipelines.", topics: [
    { id: "devops-5-1", name: "Pipeline Design", description: "Plan build, test, security and deployment stages." },
    { id: "devops-5-2", name: "GitHub Actions & Jenkins", description: "Implement automated workflows using leading CI tools." },
    { id: "devops-5-3", name: "Testing, Artifacts & Deployment", description: "Manage quality gates, artifacts and release strategies." },
  ] },
  { id: "devops-6", name: "Cloud & Infrastructure", description: "Provision repeatable and scalable cloud environments.", topics: [
    { id: "devops-6-1", name: "AWS Core Services", description: "IAM, EC2, VPC, S3, load balancing and autoscaling." },
    { id: "devops-6-2", name: "Terraform Infrastructure as Code", description: "Create reusable modules and manage infrastructure state." },
    { id: "devops-6-3", name: "Ansible Configuration Management", description: "Automate server configuration and application setup." },
  ] },
  { id: "devops-7", name: "Kubernetes", description: "Deploy, scale and operate containerized workloads in production.", topics: [
    { id: "devops-7-1", name: "Pods, Deployments & Services", description: "Understand core Kubernetes workload and networking resources." },
    { id: "devops-7-2", name: "ConfigMaps, Secrets & Storage", description: "Manage application configuration and persistent data." },
    { id: "devops-7-3", name: "Helm, Scaling & Operations", description: "Package, scale and maintain production clusters." },
  ] },
  { id: "devops-8", name: "Observability & DevSecOps", description: "Monitor systems, secure delivery and complete a production project.", topics: [
    { id: "devops-8-1", name: "Prometheus & Grafana", description: "Collect metrics and build operational dashboards." },
    { id: "devops-8-2", name: "Logging, Alerting & Incident Response", description: "Centralize logs, configure alerts and handle incidents." },
    { id: "devops-8-3", name: "Security Scanning & Final Project", description: "Apply DevSecOps controls in an end-to-end capstone." },
  ] },
];

const DEVOPS_SCHEDULE_KEY = "kiniedx-devops-demo-schedule-v2";
const devopsDemoClasses = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(DEVOPS_SCHEDULE_KEY) || "null");
    if (Array.isArray(stored) && stored.length) return stored.map((item) => ({ ...item, moduleId: item.id === "devops-recorded" ? "devops-2" : item.id === "devops-live" ? "devops-4" : item.id === "devops-next" ? "devops-5" : item.moduleId }));
  } catch { /* Create a clean schedule when stored data is invalid. */ }
  const now = Date.now();
  const schedule = [
    { id: "devops-recorded-foundations", moduleId: "devops-1", title: "DevOps Lifecycle & Culture", startAt: new Date(now - 259_200_000).toISOString(), endAt: new Date(now - 255_600_000).toISOString(), recordingUrl: "https://www.youtube.com/results?search_query=devops+lifecycle+culture+tutorial" },
    { id: "devops-recorded", moduleId: "devops-2", title: "Linux & Shell Essentials", startAt: new Date(now - 86_400_000).toISOString(), endAt: new Date(now - 82_800_000).toISOString(), recordingUrl: "https://www.youtube.com/results?search_query=linux+shell+devops+tutorial" },
    { id: "devops-recorded-git", moduleId: "devops-3", title: "Git Collaboration Workflow", startAt: new Date(now - 43_200_000).toISOString(), endAt: new Date(now - 39_600_000).toISOString(), recordingUrl: "https://www.youtube.com/results?search_query=git+github+workflow+tutorial" },
    { id: "devops-live", moduleId: "devops-4", title: "Docker Fundamentals", startAt: new Date(now - 600_000).toISOString(), endAt: new Date(now + 3_000_000).toISOString(), meetingUrl: "https://meet.google.com/" },
    { id: "devops-next", moduleId: "devops-5", title: "Advanced CI/CD Pipeline with GitHub Actions", startAt: new Date(now + 86_400_000).toISOString(), endAt: new Date(now + 90_000_000).toISOString(), meetingUrl: "https://meet.google.com/" },
  ];
  localStorage.setItem(DEVOPS_SCHEDULE_KEY, JSON.stringify(schedule));
  return schedule;
};

const lifecycleStatus = (classItem, now) => {
  const start = new Date(classItem.startAt).getTime();
  const end = new Date(classItem.endAt).getTime();
  if (Number.isFinite(start) && now < start) return "scheduled";
  if (Number.isFinite(start) && Number.isFinite(end) && now >= start && now < end) return "live";
  if (Number.isFinite(end) && now >= end) return "completed";
  return String(classItem.status || "scheduled").toLowerCase();
};

const matchingModuleIndex = (modules, classItem) => {
  const linkedModuleId = pick(classItem?.moduleId, classItem?.courseModuleId, classItem?.syllabusModuleId);
  const linkedIndex = linkedModuleId === undefined ? -1 : modules.findIndex((module) => String(module.id) === String(linkedModuleId));
  if (linkedIndex >= 0) return linkedIndex;
  const classTitle = String(pick(classItem?.title, classItem?.className, classItem?.topicName) || "").toLowerCase();
  if (!classTitle) return 0;
  const exactTopicIndex = modules.findIndex((module) => module.topics.some((topic) => {
    const topicName = String(topic.name || "").toLowerCase();
    return topicName === classTitle || topicName.includes(classTitle) || classTitle.includes(topicName);
  }));
  if (exactTopicIndex >= 0) return exactTopicIndex;
  const ignoredWords = new Set(["advanced", "pipeline", "with", "class", "session", "fundamentals"]);
  const titleWords = classTitle.split(/[^a-z0-9]+/).filter((word) => word.length >= 2 && !ignoredWords.has(word));
  const scores = modules.map((module) => {
    const moduleText = `${module.name} ${module.topics.map((topic) => topic.name).join(" ")}`.toLowerCase();
    return titleWords.reduce((score, word) => score + (moduleText.includes(word) ? 1 : 0), 0);
  });
  const bestScore = Math.max(...scores, 0);
  return bestScore > 0 ? scores.indexOf(bestScore) : 0;
};

const normalizeEnrollment = (course = {}) => ({
  ...course,
  courseId: pick(course.courseId, course.id),
  courseName: nameOf(course.courseName, course.courseTitle, course.title, course.name),
  batchId: pick(course.batchId, course.batch?.batchId, course.batch?.id),
  batchName: nameOf(course.batchName, course.batch?.batchName, course.batch?.name),
  mentorId: pick(course.mentorId, course.tutorId, course.mentor?.mentorId, course.mentor?.id),
  mentorName: nameOf(course.mentorName, course.tutorName, course.mentor?.mentorName, course.mentor?.name),
});

const cachedEnrollment = (courseId) => {
  try {
    const cached = JSON.parse(sessionStorage.getItem("student-selected-course") || "null");
    const cachedId = cached?.courseId ?? cached?.id;
    return String(cachedId) === String(courseId) ? cached : null;
  } catch {
    return null;
  }
};

const devopsFallbackEnrollment = (courseId) => String(courseId) === "6" ? {
  id: courseId,
  courseId,
  courseName: "DevOps",
  batchName: "Python Developer",
  mentorName: "Praveen Sai",
} : null;

const normalizeSyllabus = (payload) => {
  const root = payload?.syllabus ?? payload?.courseSyllabus ?? payload?.data ?? payload ?? {};
  const modules = rows(root.modules ?? root.courseModules ?? root.subjects ?? root.items ?? root);
  return modules.map((module, moduleIndex) => ({
    id: pick(module.moduleId, module.id, `module-${moduleIndex}`),
    name: pick(module.moduleName, module.title, module.name, module.subjectName, `Module ${moduleIndex + 1}`),
    description: pick(module.description, module.summary),
    topics: rows(module.topics ?? module.subjects ?? module.sessions ?? module.lessons ?? module.items).map((topic, topicIndex) => ({
      id: pick(topic.topicId, topic.subjectId, topic.sessionId, topic.lessonId, topic.id, `topic-${topicIndex}`),
      name: pick(topic.topicName, topic.subjectName, topic.sessionName, topic.lessonName, topic.title, topic.name, `Topic ${topicIndex + 1}`),
      description: pick(topic.description, topic.summary, topic.learningObjective),
    })),
}));
};

const loadPublishedModules = async (courseId) => {
  const modules = rows(await tutorService.modules(courseId));
  const completeModules = await Promise.all(modules.map(async (module) => {
    const moduleId = pick(module.moduleId, module.id);
    const hasTopics = rows(module.topics ?? module.subjects ?? module.sessions ?? module.lessons).length > 0;
    if (!moduleId || hasTopics) return module;

    try {
      return { ...module, subjects: await tutorService.subjects(courseId, moduleId) };
    } catch {
      return module;
    }
  }));
  return normalizeSyllabus({ modules: completeModules });
};

export default function StudentCoursePlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [syllabus, setSyllabus] = useState([]);
  const [classes, setClasses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedModule, setSelectedModule] = useState(0);
  const [referenceTime, setReferenceTime] = useState(() => Date.now());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [, setRecordingProgressVersion] = useState(0);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      let enrollment = cachedEnrollment(courseId);
      try {
        const enrollments = await studentCourseService.getStudentCourses();
        enrollment = enrollments.find((item) => String(item.courseId ?? item.id) === String(courseId)) || enrollment;
      } catch { /* A cached or detail response can keep the workspace available. */ }
      if (!enrollment) {
        try {
          enrollment = await studentCourseService.getStudentCourse(courseId);
        } catch { /* DevOps demo data is the final offline fallback for course 6. */ }
      }
      enrollment ||= devopsFallbackEnrollment(courseId);
      if (!enrollment) throw new Error("not-enrolled");
      const selectedCourse = normalizeEnrollment(enrollment);
      setCourse(selectedCourse);
      setSelectedModule(0);
      const [syllabusResult, classResult, materialResult] = await Promise.allSettled([
        studentCourseService.getStudentSyllabus(),
        studentClassService.list({ courseId, ...(selectedCourse.batchId ? { batchId: selectedCourse.batchId } : {}) }, { skipAuthRedirect: true }),
        courseMaterialService.list(),
      ]);
      let apiSyllabus = syllabusResult.status === "fulfilled" ? normalizeSyllabus(syllabusResult.value) : [];
      // The student syllabus endpoint is not course-specific in older API versions.
      // Fall back to the published organization syllabus for this enrolled course.
      if (!apiSyllabus.length) {
        try {
          apiSyllabus = normalizeSyllabus(await organizationCourseService.getSyllabus(courseId));
        } catch {
          apiSyllabus = [];
        }
      }
      if (!apiSyllabus.length) {
        try {
          apiSyllabus = await loadPublishedModules(courseId);
        } catch {
          apiSyllabus = normalizeSyllabus(selectedCourse);
        }
      }
      const apiClasses = classResult.status === "fulfilled" ? normalizeLiveClassList(rows(classResult.value)).filter((item) => !item.courseId || String(item.courseId) === String(courseId)) : [];
      const isDevOps = /dev\s*ops/i.test(selectedCourse.courseName);
      const resolvedSyllabus = apiSyllabus.length ? apiSyllabus : isDevOps ? DEVOPS_SYLLABUS : [];
      const resolvedClasses = apiClasses.length ? apiClasses : isDevOps ? devopsDemoClasses() : [];
      const currentTime = Date.now();
      const activeClasses = resolvedClasses
        .filter((item) => item.startAt)
        .map((item) => ({ ...item, status: lifecycleStatus(item, currentTime) }))
        .sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
      const matchingClass = activeClasses.find((item) => item.status === "live")
        || activeClasses.find((item) => new Date(item.startAt).getTime() > currentTime);
      setSyllabus(resolvedSyllabus);
      setClasses(resolvedClasses);
      setSelectedModule(matchingModuleIndex(resolvedSyllabus, matchingClass));
      if (materialResult.status === "fulfilled") setMaterials(rows(materialResult.value).filter((item) => String(item.courseId ?? item.id) === String(courseId)));
    } catch (requestError) {
      setCourse(null);
      setError(requestError?.message === "not-enrolled" ? "You do not have access to this course." : "Unable to load this course workspace. Please try again.");
    } finally { setLoading(false); }
  }, [courseId]);

  useEffect(() => { Promise.resolve().then(load); }, [load]);
  useEffect(() => {
    const timer = window.setInterval(() => setReferenceTime(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const orderedClasses = useMemo(() => classes.filter((item) => item.startAt).map((item) => ({ ...item, status: lifecycleStatus(item, referenceTime) })).sort((a, b) => new Date(a.startAt) - new Date(b.startAt)), [classes, referenceTime]);
  const selectedModuleClasses = orderedClasses.filter((item) => matchingModuleIndex(syllabus, item) === selectedModule);
  const liveClass = selectedModuleClasses.find((item) => String(item.status).toLowerCase() === "live");
  const nextClass = selectedModuleClasses.find((item) => new Date(item.startAt).getTime() > referenceTime);
  const scheduledClasses = selectedModuleClasses.filter((item) => ["live", "scheduled", "upcoming"].includes(String(item.status || "").toLowerCase()));
  const allRecordings = orderedClasses.filter((item) => String(item.status || "").toLowerCase() === "completed" && pick(item.recordingUrl, item.recordingLink));
  const featuredClass = liveClass || nextClass || selectedModuleClasses.at(-1);
  // The initial section follows the current/next class, but students remain free
  // to browse every section afterward.
  const liveModuleIndex = -1;
  const displayedModuleIndex = selectedModule;
  const activeModule = syllabus[displayedModuleIndex];
  const recordings = allRecordings.filter((classItem) => matchingModuleIndex(syllabus, classItem) === displayedModuleIndex);
  const recordingProgressKey = activeModule ? `devops-recording-completed:${courseId}:${activeModule.id}` : "";
  const recordingCompleted = Boolean(recordingProgressKey) && (
    localStorage.getItem(recordingProgressKey) === "true"
    || (activeModule?.id === "devops-2" && localStorage.getItem(`devops-recording-completed:${courseId}`) === "true")
  );
  const mentorName = course?.mentorName || featuredClass?.mentorName;
  // Same per-course percentage the student dashboard shows.
  const coursePercent = Math.round(Math.min(100, Math.max(0, Number(getStoredCoursePercentages()[String(courseId)] || 0))));
  const mentorId = course?.mentorId || featuredClass?.mentorId;
  const meetingUrl = pick(featuredClass?.meetingUrl, featuredClass?.meetingLink, featuredClass?.joinUrl);
  const featuredCountdown = featuredClass ? countdown(liveClass ? featuredClass.endAt : featuredClass.startAt, referenceTime) : "";
  const openChat = () => mentorName && navigate("/student/mentor-chat", { state: { recipient: { id: mentorId || `mentor-${courseId}`, name: mentorName, course: course.courseName } } });
  // Opens the embedded Jitsi classroom. Previously this opened the raw link in
  // a new tab AND immediately posted a "Present" attendance record from the
  // click itself; attendance now starts only when Jitsi reports the student
  // inside the conference (videoConferenceJoined → /api/jitsi-attendance/join).
  const openClassroom = (classItem) => {
    const classId = classItem?.id ?? classItem?.classId ?? classItem?.liveClassId;
    if (!classId) return;
    const joinState = getStudentJoinState(classItem);
    if (!joinState.canJoin) {
      toast(joinState.message || "This class cannot be joined right now.");
      return;
    }
    navigate(ROUTES.STUDENT.CLASS_JOIN.replace(":classId", encodeURIComponent(classId)), { state: { liveClass: classItem } });
  };
  const joinClass = () => openClassroom(featuredClass);
  const downloadMaterial = async (material) => {
    try {
      const blob = await courseMaterialService.file(material);
      const filename = material.pdfFileName ?? material.fileName ?? material.title ?? "Course material";
      triggerFileDownload(blob, /\.pdf$/i.test(filename) ? filename : filename + ".pdf");
    } catch {
      toast.error("Unable to download this file. Please try again or contact your mentor.");
    }
  };
  const downloadMentorGuide = async () => {
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF();
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(20); pdf.text("DevOps Course Study Guide", 18, 22);
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(11); pdf.text(`Mentor: ${mentorName || "Praveen Sai"}`, 18, 32);
    let y = 45;
    DEVOPS_SYLLABUS.forEach((section, index) => { pdf.setFont("helvetica", "bold"); pdf.text(`Section ${index + 1}: ${section.name}`, 18, y); y += 7; pdf.setFont("helvetica", "normal"); section.topics.forEach((topic) => { pdf.text(`- ${topic.name}`, 24, y); y += 6; }); y += 4; });
    pdf.save("DevOps-Mentor-Study-Guide.pdf");
  };
  const completeRecording = () => {
    if (!recordingProgressKey) return;
    localStorage.setItem(recordingProgressKey, "true");
    if (activeModule?.id === "devops-2") localStorage.setItem(`devops-recording-completed:${courseId}`, "true");
    setRecordingProgressVersion((version) => version + 1);
  };
  const startUnlockedAssessment = () => {
    if (!activeModule || !recordingCompleted) return;
    const assessment = createSectionAssessment({ section: { id: activeModule.id, title: activeModule.name }, course: { id: courseId, title: course.courseName } });
    sessionStorage.setItem(`selectedAssessment:${assessment.id}`, JSON.stringify(assessment));
    sessionStorage.setItem(`selectedAssessment:${assessment.id}`, JSON.stringify(assessment));
    navigate(`/student/assessments/${assessment.id}`, { state: { assessment, courseId, sectionId: activeModule.id, sectionTitle: activeModule.name, nextSectionId: syllabus[displayedModuleIndex + 1]?.id, courseTitle: course.courseName, requiredScore: 80, returnTo: `/student/courses/${courseId}` } });
  };

  if (loading) return <div className="grid min-h-dvh place-items-center bg-slate-50"><LoaderCircle className="h-9 w-9 animate-spin text-blue-600" /></div>;
  if (error) return <div className="grid min-h-dvh place-items-center bg-slate-50 p-5"><div className="text-center"><AlertCircle className="mx-auto h-10 w-10 text-amber-500" /><h1 className="mt-3 text-xl font-bold">{error}</h1><button onClick={load} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white">Retry</button></div></div>;

  return <div className="min-h-dvh bg-[#eef3f9] text-slate-900">
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-sm"><div className="mx-auto flex h-16 max-w-[1680px] items-center gap-4 px-5"><button onClick={() => navigate("/student/courses")} className="inline-flex items-center gap-2 text-sm font-bold text-slate-600"><ArrowLeft className="h-4 w-4" />My courses</button><div className="h-7 w-px bg-slate-200" /><div className="min-w-0"><h1 className="truncate text-base font-black">{course.courseName}</h1><p className="text-[11px] font-semibold text-slate-500">Batch: {course.batchName || "Not assigned"} · Mentor: {mentorName || "Not assigned"}</p></div><button onClick={() => navigate("/student/courses")} className="ml-auto text-xs font-extrabold text-blue-700">Exit course</button></div></header>
    <main className="mx-auto grid max-w-[1680px] gap-4 p-4 lg:grid-cols-[330px_minmax(0,1fr)]">
      <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-20 lg:h-[calc(100dvh-6rem)]"><div className="border-b bg-gradient-to-br from-blue-50 to-cyan-50 p-5"><p className="text-[10px] font-black uppercase tracking-[.18em] text-blue-600">Complete course index</p><h2 className="mt-2 text-xl font-black">{course.courseName} Syllabus</h2><p className="mt-1 text-xs text-slate-500">{syllabus.length ? `${syllabus.length} sections · ${syllabus.reduce((total, item) => total + item.topics.length, 0)} topics` : "Syllabus not published yet"}</p>{liveModuleIndex >= 0 && <p className="mt-2 text-[10px] font-bold text-rose-600">Showing the section for the current live class</p>}</div><div className="max-h-[calc(100dvh-12rem)] overflow-y-auto p-3">{syllabus.length ? syllabus.map((module, index) => { const isDisplayed = displayedModuleIndex === index; return <button key={module.id} onClick={() => liveModuleIndex < 0 && setSelectedModule(index)} disabled={liveModuleIndex >= 0 && !isDisplayed} title={liveModuleIndex >= 0 && !isDisplayed ? "Other sections are available after the current live class" : undefined} className={`mb-2 w-full rounded-xl p-3 text-left transition ${isDisplayed ? "bg-blue-600 text-white shadow-md" : "border border-transparent hover:border-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"}`}><span className="flex items-start gap-3"><span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-black ${isDisplayed ? "bg-white/20" : "bg-blue-50 text-blue-700"}`}>{index + 1}</span><span className="min-w-0 flex-1"><small className={isDisplayed ? "font-bold uppercase text-blue-100" : "font-bold uppercase text-blue-600"}>Section {index + 1}</small><b className="block text-sm">{module.name}</b></span><ChevronRight className={`mt-1 h-4 w-4 shrink-0 transition ${isDisplayed ? "rotate-90" : ""}`} /></span><span className={`mt-3 block space-y-1 border-t pt-2 ${isDisplayed ? "border-white/20" : "border-slate-100"}`}>{module.topics.map((topic, topicIndex) => <span key={topic.id} className={`block truncate pl-10 text-[11px] ${isDisplayed ? "text-blue-100" : "text-slate-500"}`}>{topicIndex + 1}. {topic.name}</span>)}</span></button>; }) : <div className="px-3 py-10 text-center"><BookOpen className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-sm font-bold">Syllabus not published</p><p className="mt-1 text-xs text-slate-500">Published modules will appear here like a book index.</p></div>}</div></aside>
      <div className="min-w-0 space-y-4 [&_button:disabled]:hidden">
        <section className="scp-hero" aria-label={`${course.courseName} course overview`}>
          <div className="scp-hero__copy">
            <p className="scp-hero__eyebrow">Live learning path</p>
            <h2 className="scp-hero__title">{course.courseName}</h2>
            <dl className="scp-hero__stats">
              <div><dt><UsersRound aria-hidden="true" />Batch</dt><dd>{course.batchName || "Not assigned"}</dd></div>
              <div><dt><UserRound aria-hidden="true" />Mentor</dt><dd>{mentorName || "Not assigned"}</dd></div>
              <div><dt><Clock3 aria-hidden="true" />Progress</dt><dd>{coursePercent}% complete</dd></div>
              <div><dt><BookOpen aria-hidden="true" />Sections</dt><dd>{syllabus.length ? `${syllabus.length} sections` : "Not published"}</dd></div>
            </dl>
          </div>
          <img className="scp-hero__art" src={ORG_BANNERS.courseDetails.src} alt="" aria-hidden="true" draggable={false} decoding="async" />
        </section>
        {featuredClass && !liveClass && meetingUrl && <div className="flex justify-end"><button onClick={joinClass} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white shadow-sm hover:bg-blue-700"><PlayCircle className="h-4 w-4" />Open Live Classroom</button></div>}
        {featuredClass ? <section className={`rounded-2xl border bg-white p-5 shadow-sm ${liveClass ? "border-rose-200" : "border-blue-200"}`}><div className="flex flex-wrap items-start justify-between gap-3"><div><p className={`text-[11px] font-black uppercase tracking-widest ${liveClass ? "text-rose-600" : "text-blue-600"}`}>{liveClass ? "Current live class" : "Next scheduled class"}</p><h2 className="mt-1 text-2xl font-black">{pick(featuredClass.title, featuredClass.className, featuredClass.topicName, "Scheduled class")}</h2><p className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-slate-500"><span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-blue-600" />{liveClass ? "Started" : "Starts"}: {dateTime(featuredClass.startAt)}</span>{liveClass && featuredClass.endAt && <span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4 text-rose-500" />Ends: {dateTime(featuredClass.endAt)}</span>}<span className="inline-flex items-center gap-1.5"><UserRound className="h-4 w-4 text-blue-600" />{mentorName || "Mentor not assigned"}</span></p></div><span className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-black tabular-nums ${liveClass ? "bg-rose-50 text-rose-700" : "bg-blue-50 text-blue-700"}`}>{liveClass ? `● LIVE · Ends in ${featuredCountdown}` : `Starts in ${featuredCountdown}`}</span></div><div className="mt-4 flex flex-wrap gap-2"><button disabled={!liveClass} onClick={joinClass} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-45"><PlayCircle className="h-4 w-4" />{liveClass ? "Join Live Class" : "Available when live"}</button>{mentorName && <button onClick={openChat} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black"><MessageCircle className="h-4 w-4" />Chat with Mentor</button>}</div></section> : <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-6"><Clock3 className="h-6 w-6 text-slate-400" /><h2 className="mt-2 font-black">No classes scheduled yet</h2><p className="mt-1 text-xs text-slate-500">Today’s live class and tomorrow’s countdown will appear here after the mentor schedules them.</p></section>}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 p-5"><p className="text-[10px] font-black uppercase tracking-widest text-blue-600">{liveModuleIndex >= 0 ? "Live class syllabus" : "Syllabus"} · Section {activeModule ? displayedModuleIndex + 1 : "—"}</p><h2 className="mt-1 text-xl font-black">{activeModule?.name || "Topic syllabus"}</h2>{activeModule?.description && <p className="mt-1 text-sm text-slate-500">{activeModule.description}</p>}</div><div className="divide-y divide-slate-100">{activeModule?.topics.length ? activeModule.topics.map((topic, index) => <article key={topic.id} className={`flex gap-4 p-5 ${liveClass && String(topic.name).toLowerCase() === String(pick(liveClass.title, liveClass.className, liveClass.topicName)).toLowerCase() ? "bg-blue-50/70" : ""}`}><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-50 text-xs font-black text-blue-700">{index + 1}</span><div><h3 className="text-sm font-black">{topic.name}</h3>{topic.description && <p className="mt-1 text-xs leading-5 text-slate-500">{topic.description}</p>}</div></article>) : <div className="p-10 text-center text-sm font-medium text-slate-500">{syllabus.length ? "Topics have not been published for this section." : "The DevOps syllabus will appear here when it is published by the organization."}</div>}</div></section>
        {recordings.length > 0 && <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-violet-600" /><h2 className="text-sm font-black">Class Completion & Assessment</h2></div>
          <p className="mt-1 text-xs text-slate-500">Complete each step to unlock the next learning activity.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4"><CheckCircle2 className="h-5 w-5 text-emerald-600" /><p className="mt-2 text-xs font-black">1. Class completed</p><p className="mt-1 text-[11px] text-slate-500">Mentor completed the {activeModule?.name} class and published its recording.</p></div>
            <div className={`rounded-xl border p-4 ${recordingCompleted ? "border-emerald-200 bg-emerald-50/50" : "border-blue-200 bg-blue-50/50"}`}><PlayCircle className={`h-5 w-5 ${recordingCompleted ? "text-emerald-600" : "text-blue-600"}`} /><p className="mt-2 text-xs font-black">2. Complete recording</p><p className="mt-1 text-[11px] text-slate-500">Watch the mentor recording before attempting the assessment.</p>{recordingCompleted ? <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-700"><CheckCircle2 className="h-4 w-4" />Recording completed</span> : <button disabled={!allRecordings.length} onClick={completeRecording} className="mt-3 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white">Mark Recording Complete</button>}</div>
            <div className={`rounded-xl border p-4 ${recordingCompleted ? "border-violet-200 bg-violet-50/50" : "border-slate-200 bg-slate-50"}`}>{recordingCompleted ? <ClipboardCheck className="h-5 w-5 text-violet-600" /> : <LockKeyhole className="h-5 w-5 text-slate-400" />}<p className="mt-2 text-xs font-black">3. Take assessment</p><p className="mt-1 text-[11px] text-slate-500">Your result is published for you and your mentor after submission.</p><button disabled={!recordingCompleted} onClick={startUnlockedAssessment} className="mt-3 rounded-lg bg-violet-600 px-3 py-2 text-xs font-bold text-white">Start Assessment</button></div>
          </div>
        </section>}
        <div className="grid items-start gap-4 xl:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-blue-600" /><h2 className="text-sm font-black">Upcoming Live Classes</h2></div><p className="mt-1 text-[11px] text-slate-500">Classes scheduled for {activeModule?.name || "this section"}</p><div className="mt-4 space-y-3">{scheduledClasses.length ? scheduledClasses.map((classItem) => { const status = String(classItem.status || "scheduled").toLowerCase(); const remaining = countdown(status === "live" ? classItem.endAt : classItem.startAt, referenceTime); return <article key={classItem.id ?? classItem.classId} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${status === "live" ? "bg-rose-50 text-rose-700" : "bg-blue-50 text-blue-700"}`}>{status}</span><h3 className="mt-3 text-sm font-black">{pick(classItem.title, classItem.className, "DevOps class")}</h3><p className="mt-1 text-[11px] text-slate-500">{dateTime(classItem.startAt)}</p></div><span className="whitespace-nowrap rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-700 tabular-nums">{status === "live" ? "Ends" : "Starts"} in {remaining}</span></div>{status === "live" && <button onClick={() => openClassroom(classItem)} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-45"><PlayCircle className="h-4 w-4" />Join Live Class</button>}</article>; }) : <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center"><p className="text-sm font-bold">No upcoming classes for this section</p><p className="mt-1 text-xs text-slate-500">A scheduled class will appear here when your mentor publishes it.</p></div>}</div></section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><PlayCircle className="h-5 w-5 text-emerald-600" /><h2 className="text-sm font-black">Class Recordings</h2></div><p className="mt-1 text-[11px] text-slate-500">Recordings appear only after the mentor completes and publishes a class</p><div className="mt-4 space-y-3">{recordings.length ? recordings.map((classItem) => { const recording = pick(classItem.recordingUrl, classItem.recordingLink); return <article key={classItem.id ?? classItem.classId} className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4"><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black uppercase text-emerald-700">Recording available</span><h3 className="mt-3 text-sm font-black">{pick(classItem.title, classItem.className, "DevOps class")}</h3><p className="mt-1 text-[11px] text-slate-500">Completed {dateTime(classItem.endAt || classItem.startAt)}</p><button onClick={() => window.open(recording, "_blank", "noopener,noreferrer")} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white"><PlayCircle className="h-4 w-4" />View Recording</button></article>; }) : <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center"><p className="text-sm font-bold">No recordings published yet</p><p className="mt-1 text-xs text-slate-500">After a live class ends, the mentor-published recording will appear here.</p></div>}</div></section>
        </div>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><FileText className="h-5 w-5 text-rose-600" /><div><h2 className="text-sm font-black">Mentor PDFs & Course Materials</h2><p className="text-[11px] text-slate-500">Files published for {course.courseName}</p></div></div>{materials.length ? <div className="mt-4 divide-y divide-slate-100 border-t">{materials.map((material) => <div key={material.materialId ?? material.id} className="flex items-center gap-3 py-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-rose-50 text-rose-600"><FileText className="h-5 w-5" /></span><div className="min-w-0 flex-1"><p className="truncate text-xs font-black">{material.title}</p><p className="text-[10px] text-slate-500">PDF document</p></div>{material.resourceUrl ? <button type="button" onClick={() => downloadMaterial(material)} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold"><Download className="h-3.5 w-3.5" />Download</button> : <span className="text-xs text-slate-400">File unavailable</span>}</div>)}</div> : <div className="mt-4 flex items-center gap-3 rounded-xl border border-rose-100 bg-rose-50 p-4"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-rose-600"><FileText className="h-5 w-5" /></span><div className="min-w-0 flex-1"><p className="text-xs font-black">DevOps Mentor Study Guide.pdf</p><p className="text-[10px] text-slate-500">Shared by {mentorName || "Praveen Sai"}</p></div><button onClick={downloadMentorGuide} className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white"><Download className="h-3.5 w-3.5" />Download PDF</button></div>}</section>
      </div>
    </main>
  </div>;
}
