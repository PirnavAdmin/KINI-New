import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Award, Eye, FileText, SquareCheckBig, BarChart3, BookOpen, CheckCircle2, ChevronDown, Columns3, Target, Trophy } from "lucide-react";
import StudentPageBanner from "@features/student/components/StudentPageBanner";
import CourseLogo from "@features/student/components/CourseLogo";
import { STUDENT_BANNERS } from "@features/student/constants/studentBanners";
import { useNavigate } from "react-router-dom";
import {
  getStoredCoursePercentages,
  STUDENT_PROGRESS_EVENT,
} from "@features/student/utils/studentProgressAccess";
import { courseService } from "@/services/courseService";

const PROGRESS_FEATURES = [
  { Icon: BarChart3, title: "Track Progress", text: "See your learning journey", tone: "violet" },
  { Icon: Target, title: "Set Goals", text: "Stay motivated", tone: "orange" },
  { Icon: Trophy, title: "Earn Certificates", text: "Celebrate achievements", tone: "green" },
  { Icon: BookOpen, title: "Build Skills", text: "Grow your future", tone: "blue" },
];

// "3/12" when the API returns a total, otherwise "—".
const countPair = (done, total) => (Number.isFinite(Number(total)) && total !== null && total !== undefined ? `${Number(done) || 0}/${Number(total)}` : "—");
const certificateState = (progress) => (progress >= 100 ? "Earned" : progress >= 70 ? "Eligible" : progress > 0 ? "In Progress" : "Not Started");

const clamp = (value) => Math.min(100, Math.max(0, Number(value) || 0));

export default function StudentProgress() {
  const navigate = useNavigate();
  const [percentages, setPercentages] = useState(() => getStoredCoursePercentages());
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [courseFilter, setCourseFilter] = useState("all");

  useEffect(() => {
    const refresh = () => setPercentages(getStoredCoursePercentages());
    window.addEventListener(STUDENT_PROGRESS_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(STUDENT_PROGRESS_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    let active = true;
    courseService.getStudentCourses()
      .then((items) => {
        if (active) setEnrolledCourses(Array.isArray(items) && items.length ? items : [{ id: 6, courseId: 6, title: "DevOps", courseName: "DevOps", batchName: "Python Developer", mentorName: "Praveen Sai" }]);
      })
      .catch(() => {
        if (active) setEnrolledCourses([{ id: 6, courseId: 6, title: "DevOps", courseName: "DevOps", batchName: "Python Developer", mentorName: "Praveen Sai" }]);
      });
    return () => { active = false; };
  }, []);

  const courses = useMemo(() => enrolledCourses.map((course) => {
    const id = course.courseId ?? course.id;
    const storedValue = percentages[id] ?? percentages[String(id)];
    const recordingDone = localStorage.getItem(`devops-recording-completed:${id}`) === "true";
    const progress = clamp(storedValue ?? course.progress ?? course.progressPercentage ?? (recordingDone ? 13 : 0));
    return {
      id,
      title: course.courseName ?? course.courseTitle ?? course.title ?? course.name ?? "Assigned course",
      batchName: course.batchName ?? course.batch?.name,
      mentorName: course.mentorName ?? course.mentor?.name,
      lessons: countPair(course.completedLessons ?? course.lessonsCompleted, course.totalLessons ?? course.lessonCount ?? course.lessonsCount),
      assignments: countPair(course.completedAssignments ?? course.assignmentsCompleted, course.totalAssignments ?? course.assignmentCount),
      quizzes: countPair(course.completedQuizzes ?? course.quizzesCompleted, course.totalQuizzes ?? course.quizCount),
      progress,
    };
  }), [enrolledCourses, percentages]);
  const average = courses.length
    ? Math.round(courses.reduce((total, course) => total + course.progress, 0) / courses.length)
    : 0;
  const completed = courses.filter((course) => course.progress >= 100).length;
  const inProgress = courses.filter((course) => course.progress > 0 && course.progress < 100).length;

  const summary = [
    { label: "Overall progress", value: `${average}%`, Icon: BarChart3, tone: "blue" },
    { label: "Courses tracked", value: courses.length, Icon: BookOpen, tone: "violet" },
    { label: "In progress", value: inProgress, Icon: Target, tone: "orange" },
    { label: "Completed", value: completed, Icon: CheckCircle2, tone: "green" },
  ];
  const shown = courseFilter === "all" ? courses : courses.filter((course) => String(course.id) === courseFilter);

  return (
    <main className="ksl-page w-full px-2 py-2 sm:px-3">
      <StudentPageBanner
        banner={STUDENT_BANNERS.progress}
        icon={BarChart3}
        eyebrow="Learning Analytics"
        title="My"
        highlight="Progress"
        description={<>Track your course completion and learning milestones. Stay consistent<br className="ksl-hide-sm" /> and achieve your goals!</>}
        features={PROGRESS_FEATURES}
        featuresVariant="divided"
      />
      <div className="ksx-stack">
        <div className="ksx-stats">
          {summary.map(({ label, value, Icon, tone }) => (
            <div key={label} className={`ksx-stat ksx-stat--${tone}`}>
              <span className={`ksx-stat__icon ksl-tone--${tone}`}><Icon /></span>
              <div className="ksx-stat__body"><p className="ksx-stat__value" style={{ marginTop: 0 }}>{value}</p><p className="ksx-stat__label">{label}</p></div>
            </div>
          ))}
        </div>

        <section className="ksl-card">
          <div className="ksx-head">
            <div className="ksx-head__main">
              <BookOpen className="ksl-card__title-icon ksl-card__title-icon--orange" style={{ width: "1.8rem", height: "1.8rem" }} />
              <div><h2 className="ksx-head__title">Course progress</h2><p className="ksx-head__sub">Completion recorded from your assigned courses and lessons.</p></div>
            </div>
            <label className="ksx-field" style={{ width: "12.5rem" }}>
              <Columns3 aria-hidden="true" />
              <select value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)} aria-label="Filter by course">
                <option value="all">All Courses</option>
                {courses.map((course) => <option key={course.id} value={String(course.id)}>{course.title}</option>)}
              </select>
              <ChevronDown aria-hidden="true" className="ksx-field__chevron" />
            </label>
          </div>
          {shown.length ? shown.map((course) => (
            <article key={course.id} className="ksx-progress-row">
              <div className="ksx-progress-row__top">
                <CourseLogo name={course.title} size="sm" />
                <div style={{ minWidth: 0 }}>
                  <h3 className="ksx-progress-row__name">{course.title}</h3>
                  <p className="ksx-progress-row__sub">{[course.batchName, course.mentorName].filter(Boolean).join(" • ") || "Learning completion"}</p>
                </div>
                <div className="ksx-progress-row__pct"><strong>{course.progress}%</strong><span>Complete</span></div>
              </div>
              <div className="ksx-bar ksx-bar--blue" role="progressbar" aria-label={`${course.title} progress`} aria-valuenow={course.progress} aria-valuemin="0" aria-valuemax="100"><div style={{ width: `${course.progress}%` }} /></div>
              <div className="ksx-progress-row__foot">
                <dl className="ksx-progress-stats">
                  <div><span className="ksl-tile-icon ksl-tone--blue"><BookOpen /></span><div><dd>{course.lessons}</dd><dt>Lessons</dt></div></div>
                  <div><span className="ksl-tile-icon ksl-tone--red"><FileText /></span><div><dd>{course.assignments}</dd><dt>Assignments</dt></div></div>
                  <div><span className="ksl-tile-icon ksl-tone--violet"><SquareCheckBig /></span><div><dd>{course.quizzes}</dd><dt>Quizzes</dt></div></div>
                  <div><span className="ksl-tile-icon ksl-tone--amber"><Trophy /></span><div><dd>{certificateState(course.progress)}</dd><dt>Certificate</dt></div></div>
                </dl>
                <button type="button" onClick={() => navigate(course.id ? `/student/courses/${course.id}` : "/student/courses")} className="ksl-btn ksl-btn--orange"><Eye />Open course <ArrowRight /></button>
              </div>
            </article>
          )) : (
            <div className="ksx-empty" style={{ marginTop: "1rem" }}>
              <span className="ksx-empty__icon"><Award /></span>
              <h3>Your learning journey starts here</h3>
              <p>Open an assigned course and complete lessons. Your progress will automatically appear on this page.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
