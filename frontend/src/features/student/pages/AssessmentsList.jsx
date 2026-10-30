import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Award,
  BarChart3,
  BookOpen,
  ChevronDown,
  CircleArrowRight,
  ClipboardCheck,
  CircleHelp,
  Clock,
  FileText,
  ListChecks,
  PlayCircle,
  RefreshCw,
  Search,
  Target,
} from "lucide-react";
import StudentPageBanner from "@features/student/components/StudentPageBanner";
import { STUDENT_BANNERS } from "@features/student/constants/studentBanners";

const ASSESSMENT_FEATURES = [
  { Icon: FileText, title: "Practice Tests", text: "Prepare Confidently", tone: "pink" },
  { Icon: BarChart3, title: "Track Progress", text: "See Improvements", tone: "orange" },
  { Icon: Award, title: "Assess Skills", text: "Know Your Strengths", tone: "violet" },
  { Icon: Target, title: "Achieve Goals", text: "Stay Ahead", tone: "green" },
];
import assessmentService, { normalizeAssessment } from "@/services/assessmentService";
import { getApiErrorMessage } from "@shared/services/apiServices";

const getCourseId = (course) => course.courseId ?? course.id;

const AssessmentSkeleton = () => (
  <div className="h-[178px] animate-pulse rounded-[15px] border border-slate-200 bg-white p-3.5 dark:border-slate-700 dark:bg-slate-900">
    <div className="mb-4 flex items-center gap-3">
      <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
      <div className="space-y-2">
        <div className="h-4 w-44 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-3 w-28 rounded bg-slate-100 dark:bg-slate-800" />
      </div>
    </div>
    <div className="h-6 w-24 rounded-full bg-slate-100 dark:bg-slate-800" />
    <div className="mt-5 h-9 w-full rounded-xl bg-slate-200 dark:bg-slate-700" />
  </div>
);

export default function AssessmentsList() {
  const navigate = useNavigate();
  const location = useLocation();
  const gateContext = location.state?.sectionId ? location.state : null;
  const requestStarted = useRef(false);
  const [assessments, setAssessments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // GET /api/StudentAssessment/available — scoped to the logged-in
      // student server-side. Unlike the mentor/admin GET /api/Assessment
      // listing, this must never be enriched with a per-item question
      // fetch here: that would ship every question's options/correctAnswer
      // to the browser before the student has even started the attempt.
      // Questions are only ever loaded after a real POST .../start call.
      const rows = await assessmentService.getAvailableAssessments();
      const liveAssessments = (Array.isArray(rows) ? rows : []).map((row) => {
        const assessment = normalizeAssessment(row);
        return {
          ...assessment,
          id: assessment.assessmentId ?? assessment.id,
          title: assessment.title,
          course: assessment.courseName ?? `Course ${assessment.courseId ?? ""}`,
          questionCount: Number(row.questionCount ?? row.totalQuestions ?? 0),
          status: ["completed", "passed", "results published"].includes(String(row.status ?? "").toLowerCase())
            ? "completed"
            : "pending",
          passingScore: Number(row.passingMarks ?? row.passingScore ?? row.passMarks ?? 0),
          attempts: Number(row.attempts ?? row.attemptCount ?? 0),
          maxAttempts: Number(row.maxAttempts ?? row.allowedAttempts ?? 1),
        };
      });
      setCourses([...new Map(liveAssessments.map((item) => [String(item.courseId), { id: item.courseId, title: item.course }])).values()]);
      setAssessments(liveAssessments);
    } catch (reason) {
      setAssessments([]);
      setCourses([]);
      setError(getApiErrorMessage(reason, "Unable to load assessments."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (requestStarted.current) return;
    requestStarted.current = true;
    loadData();
  }, [loadData]);

  const courseNameById = useMemo(() => {
    return courses.reduce((map, course) => {
      const id = getCourseId(course);
      if (id !== undefined && id !== null) map.set(String(id), course.title ?? course.courseName ?? course.name);
      return map;
    }, new Map());
  }, [courses]);

  const enrichedAssessments = useMemo(() => {
    return assessments.map((assessment) => ({
      ...assessment,
      courseName: courseNameById.get(String(assessment.courseId)) || assessment.courseName || "Course not found",
    }));
  }, [assessments, courseNameById]);

  const filteredAssessments = useMemo(() => {
    const value = query.trim().toLowerCase();
    return enrichedAssessments.filter((assessment) => {
      if (statusFilter !== "all" && assessment.status !== statusFilter) return false;
      if (!value) return true;
      return [assessment.title, assessment.courseName, assessment.duration]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(value);
    });
  }, [enrichedAssessments, query, statusFilter]);

  const totalMinutes = enrichedAssessments.reduce(
    (sum, assessment) => sum + (Number(assessment.duration) || 0),
    0
  );
  const courseCount = new Set(
    enrichedAssessments
      .map((assessment) => assessment.courseId ?? assessment.courseName)
      .filter(Boolean)
      .map(String)
  ).size;

  const startAssessment = (assessment) => {
    const assessmentId = assessment.assessmentId ?? assessment.id;
    // Only display metadata is passed forward — no questions/answers exist
    // in this list response to begin with (see loadData above), and the
    // instructions page still confirms via GET /api/Assessment/{id} before
    // the student can actually start the real attempt.
    navigate(`/student/assessments/${assessmentId}/instructions`, { state: { assessment, ...(gateContext || {}) } });
  };

  const stats = [
    { key: "tests", eyebrow: "Tests", value: loading ? "—" : enrichedAssessments.length, label: "Total Assessments", Icon: ClipboardCheck, tone: "blue" },
    { key: "courses", eyebrow: "Courses", value: loading ? "—" : courseCount, label: "Courses with Assessments", Icon: BookOpen, tone: "green" },
    { key: "minutes", eyebrow: "Minutes", value: loading ? "—" : totalMinutes || "-", label: "Total Duration", Icon: Clock, tone: "orange" },
  ];

  return (
    <main className="ksl-page w-full px-2 py-2 sm:px-3">
      <StudentPageBanner
        banner={STUDENT_BANNERS.assessments}
        icon={ClipboardCheck}
        eyebrow="Assessments"
        title="Test Your Knowledge,"
        highlight="Achieve More!"
        description={<>Take assessments, track your performance, and identify your<br className="ksl-hide-sm" /> strengths to keep improving in your learning journey.</>}
        features={ASSESSMENT_FEATURES}
        featuresVariant="divided"
      />
      <div className="ksx-stack">
        {gateContext && (
          <div className="ksx-alert">
            <span>Section gate: pass with {gateContext.requiredScore || 80}% to unlock {gateContext.sectionTitle ? `the section after ${gateContext.sectionTitle}` : "the next section"}.</span>
            <span className="ksl-pill ksl-pill--sm ksl-pill--orange">Required: {gateContext.requiredScore || 80}%</span>
          </div>
        )}

        <div className="ksx-stats ksx-stats--3">
          {stats.map(({ key, eyebrow, value, label, Icon, tone }) => (
            <div key={key} className={`ksx-stat ksx-stat--${tone}`}>
              <span className={`ksx-stat__icon ksl-tone--${tone}`}><Icon /></span>
              <div className="ksx-stat__body"><p className="ksx-stat__eyebrow">{eyebrow}</p><p className="ksx-stat__value">{value}</p><p className="ksx-stat__label">{label}</p></div>
            </div>
          ))}
        </div>

        <div className="ksl-toolbar" style={{ marginBottom: 0 }}>
          <label className="ksl-search"><Search aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search assessments..." aria-label="Search assessments" /></label>
          <label className="ksl-select" style={{ width: "15rem" }}>
            <Target aria-hidden="true" />
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter assessments">
              <option value="all">All Assessments</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
            <ChevronDown aria-hidden="true" className="ksl-select__chevron" />
          </label>
        </div>

        {error && (
          <div className="ksx-alert ksx-alert--error">
            <span>{error}</span>
            <button type="button" onClick={loadData} className="ksl-btn ksl-btn--orange"><RefreshCw />Retry</button>
          </div>
        )}

        {loading ? (
          <div className="ksx-assess-grid">
            {Array.from({ length: 4 }).map((_, index) => <AssessmentSkeleton key={index} />)}
          </div>
        ) : filteredAssessments.length > 0 ? (
          <div className="ksx-split">
            <div className="ksx-assess-grid">
              {filteredAssessments.map((assessment, index) => (
                <motion.article
                  key={assessment.assessmentId ?? assessment.id ?? index}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="ksl-card ksx-assess"
                >
                  <div className="ksx-assess__top">
                    <span className="ksx-head__icon ksl-tone--blue"><ClipboardCheck /></span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p className="ksl-eyebrow">Assessment #{String(index + 1).padStart(2, "0")}</p>
                      <h2 className="ksx-assess__title">{assessment.title}</h2>
                      <p className="ksx-list__sub"><BookOpen className="mr-1 inline h-3.5 w-3.5" />{assessment.courseName}</p>
                    </div>
                    <span className={`ksl-pill ksl-pill--sm ${assessment.status === "completed" ? "ksl-pill--success" : "ksl-pill--orange"}`}><i />{assessment.status === "completed" ? "Completed" : "Pending"}</span>
                  </div>
                  <div className="ksx-assess__foot">
                    {assessment.duration ? <span className="ksx-chip ksl-tone--navy"><Clock />{assessment.duration} min</span> : <span />}
                    <button type="button" onClick={() => startAssessment(assessment)} className="ksl-btn ksl-btn--orange">
                      {assessment.status === "completed" ? "View Assessment" : "Start Assessment"}<PlayCircle />
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>
            <div className="ksl-card">
              <span className="ksx-head__icon ksl-tone--blue"><ListChecks /></span>
              <h2 className="ksx-head__title" style={{ marginTop: "0.8rem" }}>Before you begin</h2>
              <p className="ksx-head__sub">A little preparation helps you make the most of every assessment.</p>
              <ul className="ksx-list">
                <li>Keep a stable internet connection.</li>
                <li>Review the time limit before starting.</li>
                <li>Your answers are saved as you go.</li>
              </ul>
              <p className="ksx-muted-sm"><CircleHelp className="mr-1 inline h-4 w-4" />Need help? Contact your mentor.</p>
            </div>
          </div>
        ) : !error && (
          <div className="ksx-empty">
            <span className="ksx-empty__icon"><ClipboardCheck /></span>
            <h2>{query || statusFilter !== "all" ? "No matching assessments" : "No Assessments Available"}</h2>
            <p>{query || statusFilter !== "all" ? "Try a different search term or filter." : "No assessments are available for your assigned course yet. Your mentor will publish them here."}</p>
            <button type="button" onClick={() => navigate("/student/courses")} className="ksl-btn ksl-btn--orange">
              <BookOpen />Open My Courses<CircleArrowRight />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
