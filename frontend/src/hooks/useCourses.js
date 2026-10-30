import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { courseService } from "@/shared/services/courseService";
import { batchService } from "@/shared/services/batchService";
import { buildRosterIndex, enrollmentsOf } from "@/pages/students/studentCourseEnrollments";
import { isPendingApprovalStudent } from "@/shared/utils/studentApprovalStatus";
import { studentsApi } from "@/api/students";

// Students who are not (or no longer) enrolled are not counted on a course.
// Pending = awaiting approval; Rejected/Cancelled = enrolment refused/ended.
const NOT_ENROLLED = new Set(["rejected", "pending", "pending approval", "cancelled", "canceled"]);
const keyOf = (value) => String(value ?? "").trim().toLowerCase();

/**
 * Unique enrolled students per course, from the organization student roster
 * (each student record carries its courseId). Keyed by courseId; students
 * whose record has no courseId are matched by course name.
 */
export const countStudentsByCourse = (students) => {
  const byId = new Map();
  const byName = new Map();
  for (const student of students) {
    if (NOT_ENROLLED.has(keyOf(student.status)) || isPendingApprovalStudent(student)) continue;
    const studentKey = String(student.studentId ?? student.id ?? "");
    if (!studentKey) continue;
    for (const enrollment of [student, ...(student.enrollments ?? [])]) {
      const courseId = enrollment.courseId ?? enrollment.course?.courseId;
      const target = courseId != null && courseId !== "" ? byId : byName;
      const courseKey = courseId != null && courseId !== "" ? String(courseId) : keyOf(enrollment.courseName ?? enrollment.course);
      if (!courseKey || courseKey === "\u2014") continue;
      if (!target.has(courseKey)) target.set(courseKey, new Set());
      target.get(courseKey).add(studentKey);
    }
  }
  return (course) => {
    const ids = new Set([...(byId.get(String(course.courseId)) ?? []), ...(byName.get(keyOf(course.name)) ?? [])]);
    return ids.size;
  };
};

const DEMO_COURSES = [
  { courseId: "demo-course-1", courseName: "Full Stack Web Development", courseCode: "FSWD-2026", level: "Development", duration: "24 Weeks", price: 75000, totalStudents: 84, status: "Active", mentorName: "Rahul Kumar", totalBatches: 3, totalModules: 12, totalAssessments: 8, mode: "Hybrid", shortDescription: "Build production-ready applications with React, Node.js, Express and MongoDB." },
  { courseId: "demo-course-2", courseName: "Data Science & Artificial Intelligence", courseCode: "DSAI-2026", level: "Data & AI", duration: "28 Weeks", price: 85000, totalStudents: 62, status: "Active", mentorName: "Priya Sharma", totalBatches: 2, totalModules: 14, totalAssessments: 10, mode: "Online", shortDescription: "Master Python, data analytics, machine learning and practical AI projects." },
  { courseId: "demo-course-3", courseName: "UI/UX Product Design", courseCode: "UIUX-2026", level: "Design", duration: "16 Weeks", price: 48000, totalStudents: 38, status: "Active", mentorName: "Neha Verma", totalBatches: 2, totalModules: 9, totalAssessments: 5, mode: "Hybrid", shortDescription: "Learn user research, wireframing, prototyping and modern product design systems." },
  { courseId: "demo-course-4", courseName: "Cloud & DevOps Engineering", courseCode: "CDE-2026", level: "Cloud", duration: "20 Weeks", price: 68000, totalStudents: 46, status: "Active", mentorName: "Arjun Kapoor", totalBatches: 2, totalModules: 11, totalAssessments: 7, mode: "Online", shortDescription: "Hands-on AWS, Docker, Kubernetes, CI/CD and infrastructure automation." },
  { courseId: "demo-course-5", courseName: "Cybersecurity Professional", courseCode: "CSP-2026", level: "Security", duration: "18 Weeks", price: 62000, totalStudents: 31, status: "Draft", mentorName: "Karan Mehta", totalBatches: 1, totalModules: 10, totalAssessments: 6, mode: "Classroom", shortDescription: "Develop practical skills in network security, ethical testing and incident response." },
  { courseId: "demo-course-6", courseName: "Digital Marketing & Analytics", courseCode: "DMA-2026", level: "Marketing", duration: "14 Weeks", price: 42000, totalStudents: 55, status: "Active", mentorName: "Sara Thomas", totalBatches: 2, totalModules: 8, totalAssessments: 4, mode: "Online", shortDescription: "Plan measurable campaigns across SEO, social media, content and performance marketing." },
];

const isDemoSession = () => localStorage.getItem("isDemo") === "true"

const normalizeDuration = (value) => {
  const text = String(value ?? "").trim();
  if (!text) return "—";
  if (/^\d+$/.test(text)) return `${text} Months`;
  return text
    .replace(/(\d)\s*(months?|weeks?|days?)/i, "$1 $2")
    .replace(/\b(months?|weeks?|days?)\b/gi, (unit) => `${unit[0].toUpperCase()}${unit.slice(1).toLowerCase()}`);
};

const normalizeCourse = (course = {}) => ({
  id: String(course.courseId ?? course.id),
  courseId: course.courseId ?? course.id,
  name: course.title ?? course.courseName ?? course.name ?? "Untitled course",
  code: course.courseCode ?? course.CourseCode ?? course.course_code ?? course.code ?? course.Code ?? "",
  category: course.level ?? course.category ?? "General",
  duration: normalizeDuration(course.duration),
  fee: Number(course.price ?? course.fee ?? 0),
  students: Number(course.totalStudents ?? course.students ?? 0),
  status: course.status === true ? "Active" : course.status || "Draft",
  mentorId: course.mentorId ?? null,
  mentorName: course.mentorName ?? "Unassigned",
  totalBatches: Number(course.totalBatches ?? course.batches ?? 0),
  totalModules: Number(course.totalModules ?? course.moduleCount ?? 0),
  totalAssessments: Number(course.totalAssessments ?? 0),
  shortDescription:
    course.shortDescription ||
    `Industry-focused ${course.title || course.courseName || course.name || "course"} program with practical projects and guided instruction.`,
  description:
    course.description ||
    `A complete ${course.title || course.courseName || course.name || "course"} curriculum designed for job-ready skills, hands-on practice, assessments, and mentor support.`,
  mode: course.mode ?? "Online",
  maxStudents: Number(course.maxStudents ?? 0),
  startDate: course.startDate ?? "—",
  endDate: course.endDate ?? "—",
  tags: Array.isArray(course.tags) ? course.tags : [],
  rules: {
    completion: 80,
    attendance: 75,
    assignmentsRequired: true,
    assessmentPass: true,
    autoCertificate: true,
    passMarks: 60,
    maxReattempts: 3,
    negativeMarking: false,
  },
  modules: [],
});

export default function useCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => {
    let active = true;
    setLoading(true);
    if (isDemoSession()) {
      setCourses(DEMO_COURSES.map(normalizeCourse));
      setLoading(false);
      return () => { active = false; };
    }
    Promise.allSettled([
      courseService.getCourses({ pageSize: 1000 }),
      batchService.getOrganizationBatches({ pageSize: 1000 }),
      studentsApi.list(),
    ])
      .then(async ([courseResult, batchResult, studentResult]) => {
        if (!active) return;
        if (courseResult.status === "rejected") throw courseResult.reason;
        const courseResponse = courseResult.value;
        const batchResponse = batchResult.status === "fulfilled" ? batchResult.value : { data: [] };
        const courseRows = (courseResponse?.data || []).map(normalizeCourse);
        const batchRows = batchResponse?.data || [];
        const rosterResults = await Promise.allSettled(batchRows.map(batch => batchService.getStudents(batch.batchId ?? batch.id)));
        if (!active) return;
        const rosters = rosterResults.flatMap((result, index) => result.status === "fulfilled"
          ? [{ batchId: batchRows[index].batchId ?? batchRows[index].id, students: result.value.students }] : []);
        const rosterIndex = buildRosterIndex(batchRows, rosters);
        const studentRows = (studentResult.value?.data ?? []).map(student => ({
          ...student, enrollments: enrollmentsOf(student, rosterIndex, batchRows),
        }));
        const studentsFor = studentResult.status === "fulfilled" && batchResult.status === "fulfilled"
          ? countStudentsByCourse(studentRows) : null;
        const incompleteCourses = new Set(rosterResults.flatMap((result, index) => result.status === "rejected"
          ? [String(batchRows[index].courseId ?? batchRows[index].course?.courseId)] : []));
        if (studentResult.status === "rejected") console.error("Student roster unavailable for course counts", studentResult.reason);
        setCourses(courseRows.map((course) => {
          const courseBatchRows = batchRows.filter(
            (batch) => String(batch.courseId ?? batch.course?.courseId ?? batch.course?.id) === String(course.courseId),
          );
          return {
            ...course,
            // Batch count is only trusted when the batch request succeeded.
            batches: batchResult.status === "fulfilled" ? courseBatchRows.length : course.totalBatches,
            totalBatches: batchResult.status === "fulfilled" ? courseBatchRows.length : course.totalBatches,
            students: studentsFor && !incompleteCourses.has(String(course.courseId)) && !incompleteCourses.has("undefined") ? studentsFor(course) : null,
          };
        }));
      })
      .catch((error) => {
        if (!active) return;
        console.error(error);
        toast.error("Unable to load courses.");
        setCourses([]);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    let cleanup;
    const refresh = () => { cleanup?.(); cleanup = load(); };
    const timer = window.setTimeout(refresh, 0);
    window.addEventListener("kini:student-updated", refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("kini:student-updated", refresh);
      cleanup?.();
    };
  }, [load]);
  const persist = useCallback(
    (updater) =>
      setCourses((current) => {
        const next = typeof updater === "function" ? updater(current) : updater;
        return next;
      }),
    [],
  );
  const saveCourse = useCallback(
    async (values, id, status) => {
      const record = normalizeCourse(isDemoSession()
        ? { ...values, status, courseId: id || `demo-course-${Date.now()}` }
        : id ? await courseService.updateCourse(id, { ...values, status }) : await courseService.createCourse({ ...values, status }));
      persist((items) =>
        id
          ? items.map((item) =>
              // Enrollment-derived counts come from the roster/batches, not
              // the course record, so a course edit must not reset them.
              item.id === id
                ? { ...item, ...record, students: item.students, batches: item.batches, totalBatches: item.totalBatches }
                : item,
            )
          : [record, ...items],
      );
      return record;
    },
    [persist],
  );
  const archiveCourse = useCallback(
    (id) =>
      persist((items) =>
        items.map((item) =>
          item.id === id ? { ...item, status: "Archived" } : item,
        ),
      ),
    [persist],
  );
  const removeCourse = useCallback(
    async (id) => {
      const courseId = String(id);
      if (isDemoSession()) {
        const index = DEMO_COURSES.findIndex(
          (course) => String(course.courseId ?? course.id) === courseId,
        );
        if (index >= 0) DEMO_COURSES.splice(index, 1);
      } else {
        await courseService.deleteCourse(id);
      }
      persist((items) =>
        items.filter((course) => String(course.courseId ?? course.id) !== courseId),
      );
    },
    [persist],
  );
  const stats = useMemo(
    () => ({
      total: courses.length,
      published: courses.filter((course) => course.status === "Active").length,
      draft: courses.filter((course) => course.status === "Draft").length,
      archived: courses.filter((course) => course.status === "Archived").length,
      students: courses.reduce((sum, course) => sum + Number(course.students || 0), 0),
    }),
    [courses],
  );
  return {
    courses,
    loading,
    stats,
    saveCourse,
    archiveCourse,
    removeCourse,
    reload: load,
    getCourse: (id) => courses.find((course) => course.id === String(id)),
  };
}
