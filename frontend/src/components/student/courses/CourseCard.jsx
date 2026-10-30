import { BarChart3, BookOpen, CheckCircle2, CircleArrowRight, CirclePlay, Clock, Layers3, Radio, Star, UserRound, Users } from "lucide-react";
import CourseLogo from "@features/student/components/CourseLogo";
import { formatCourseDuration } from "@features/student/utils/courseDuration";

const DEVOPS_MODULES = [
  { title: "DevOps Foundations", topics: ["DevOps lifecycle & culture", "Agile, Scrum & SDLC", "Delivery metrics & SRE basics"] },
  { title: "Linux & Networking", topics: ["Linux administration", "Shell scripting", "DNS, HTTP, SSH & troubleshooting"] },
  { title: "Git & Collaboration", topics: ["Git fundamentals", "Branching & pull requests", "GitHub workflow & releases"] },
  { title: "Docker & Containers", topics: ["Images & containers", "Dockerfile & registries", "Docker Compose & networking"] },
  { title: "CI/CD Automation", topics: ["Pipeline design", "GitHub Actions & Jenkins", "Testing, artifacts & deployment"] },
  { title: "Cloud & Infrastructure", topics: ["AWS core services", "Terraform infrastructure as code", "Ansible configuration management"] },
  { title: "Kubernetes", topics: ["Pods, deployments & services", "ConfigMaps, secrets & storage", "Helm, scaling & production operations"] },
  { title: "Observability & DevSecOps", topics: ["Prometheus & Grafana", "Centralized logging & alerting", "Security scanning & final project"] },
];

const clampProgress = (value) => Math.max(0, Math.min(Number(value) || 0, 100));

export default function CourseCard({ course, progress = 0, onOpen, onLive = onOpen }) {
  const percent = clampProgress(progress);
  const status = course.status ? String(course.status) : "";
  const isCompleted = status.toLowerCase() === "completed" || percent >= 100;
  const hasProgress = course.progress !== undefined || course.completedLessons !== undefined || course.totalLessons !== undefined;
  const statusLabel = isCompleted ? "Completed" : status.toLowerCase() === "true" ? "Available" : status || course.category || "Available";
  const hasThumbnail = Boolean(course.thumbnail);
  const isDevOps = /dev\s*ops/i.test(course.title || course.courseName || "");

  if (course.assignedCourse && !isDevOps) {
    const meta = [
      { key: "batch", label: "Batch", value: course.batchName, Icon: Users },
      { key: "mentor", label: "Mentor", value: course.mentorName, Icon: UserRound },
      { key: "level", label: "Level", value: course.level ? String(course.level) : "", Icon: BarChart3 },
      { key: "duration", label: "Duration", value: formatCourseDuration(course.duration, course.durationUnit ?? course.unit), Icon: Clock },
    ].filter((item) => item.value);
    const description = course.description || course.courseDescription || course.shortDescription;

    return (
      <article onClick={onOpen} data-ui="student-assigned-course" className="ksl-course-card">
        <CourseLogo name={course.title} />
        <div className="ksl-course-card__body">
          <span className="ksl-course-card__eyebrow">Your active course</span>
          <h3 className="ksl-course-card__title">{course.title}</h3>
          {description && <p className="ksl-course-card__desc">{description}</p>}
          {meta.length > 0 && (
            <div className="ksl-course-card__meta">
              {meta.map(({ key, label, value, Icon }) => (
                <div key={key} className={`ksl-meta ksl-meta--${key}`}>
                  <span className="ksl-meta__icon"><Icon /></span>
                  <span className="ksl-meta__text"><strong>{label}</strong><span>{value}</span></span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="ksl-course-card__aside">
          <span className={`ksl-pill ${isCompleted || statusLabel === "Available" ? "ksl-pill--success" : "ksl-pill--orange"}`}><i />{statusLabel}</span>
          <button type="button" className="ksl-btn ksl-btn--orange ksl-btn--lg" onClick={(event) => { event.stopPropagation(); onOpen(); }}>
            View Course <CircleArrowRight />
          </button>
        </div>
      </article>
    );
  }

  return (
    <article onClick={onOpen} className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_28px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_16px_36px_rgba(15,85,247,0.13)] ${hasThumbnail ? 'min-h-[286px]' : 'min-h-[208px]'}`}>
      {hasThumbnail && (
        <img
          src={course.thumbnail}
          alt={course.title}
          className="h-32 w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          loading="lazy"
        />
      )}

      <div className={`flex flex-1 flex-col ${isDevOps ? "p-5 sm:p-6" : "p-3"}`}>
        <div className="mb-1.5 flex items-start justify-between gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#e4f8fb] text-[#0f55f7]">
            <BookOpen className="h-[17px] w-[17px]" strokeWidth={2.3} />
          </div>
          {status || course.category ? (
            <span className="rounded-full border border-[#0f55f7]/25 bg-[#eef5ff] px-2 py-1 text-[10px] font-bold leading-none text-[#0f55f7]">
              {statusLabel}
            </span>
          ) : (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-bold leading-none text-emerald-600">
              Available
            </span>
          )}
        </div>

        <h3 className="line-clamp-1 text-base font-extrabold leading-tight tracking-normal text-slate-950">
          {course.title}
        </h3>

        {course.description && (
          <p className="mt-1 line-clamp-1 text-[11px] font-medium leading-[1.45] text-[#8797b6]">
            {course.description}
          </p>
        )}

        {course.instructor && (
          <p className="mt-1 truncate text-[11px] font-medium text-[#8797b6]">
            {course.instructor}
          </p>
        )}

        {course.assignedCourse && (course.batchName || course.mentorName || course.attendance !== undefined || course.assessmentsCleared !== undefined) && (
          <dl className="mt-2 grid gap-1 text-xs text-slate-600">
            {course.batchName && <div><dt className="inline font-semibold">Batch:</dt> <dd className="inline">{course.batchName}</dd></div>}
            {course.mentorName && <div><dt className="inline font-semibold">Mentor:</dt> <dd className="inline">{course.mentorName}</dd></div>}
            {(course.attendance !== undefined || course.assessmentsCleared !== undefined) && <div className="flex flex-wrap gap-x-5 gap-y-1">
              {course.attendance !== undefined && <div><dt className="inline font-semibold">Attendance:</dt> <dd className="inline">{course.attendance}%</dd></div>}
              {course.assessmentsCleared !== undefined && <div><dt className="inline font-semibold">Assessments Cleared:</dt> <dd className="inline">{course.assessmentsCleared}</dd></div>}
            </div>}
          </dl>
        )}

        {isDevOps && (
          <section className="mt-5 border-t border-slate-100 pt-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-blue-600">Complete course syllabus</p>
                <h4 className="mt-1 text-base font-extrabold text-slate-900">8 sections · 24 practical topics</h4>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-3 py-1.5 text-[11px] font-bold text-cyan-700"><Layers3 className="h-3.5 w-3.5" />Beginner to job-ready</span>
            </div>
            <div className="grid gap-3 lg:grid-cols-3">
              {DEVOPS_MODULES.map((module, moduleIndex) => (
                <div key={module.title} className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-blue-50/60 p-4">
                  <div className="flex items-start gap-2.5"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-blue-600 text-xs font-extrabold text-white">{moduleIndex + 1}</span><div><p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Section {moduleIndex + 1}</p><h5 className="mt-0.5 text-sm font-extrabold leading-5 text-slate-900">{module.title}</h5></div></div>
                  <ul className="mt-3 space-y-2 border-t border-slate-200/70 pt-3">{module.topics.map((topic) => <li key={topic} className="flex items-start gap-2 text-[11px] font-medium leading-4 text-slate-600"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />{topic}</li>)}</ul>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] font-semibold text-[#8797b6]">
          {course.level && (
            <span className="inline-flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              {course.level}
            </span>
          )}
          {course.duration && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatCourseDuration(course.duration, course.durationUnit ?? course.unit)}
            </span>
          )}
          {course.rating && (
            <span className="inline-flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {course.rating}
            </span>
          )}
        </div>

        {hasProgress && (
          <div className="mt-1.5">
            <div className="mb-1 flex items-center justify-between text-[11px]">
              {(course.completedLessons !== undefined || course.totalLessons !== undefined) && (
                <span className="font-medium text-[#8797b6]">
                  {course.completedLessons ?? 0}/{course.totalLessons ?? 0} lessons
                </span>
              )}
              {course.progress !== undefined && (
                <span className="ml-auto font-extrabold text-slate-900">{percent}%</span>
              )}
            </div>
            {course.progress !== undefined && (
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#0f55f7] to-[#06b6a8]"
                  style={{ width: `${percent}%` }}
                />
              </div>
            )}
          </div>
        )}

        {(course.validTill || course.validUntil) && (
          <p className="mt-1.5 text-xs font-semibold text-emerald-600">
            Valid till: <span className="font-bold">{course.validTill || course.validUntil}</span>
          </p>
        )}

        <div className={`flex items-center justify-between gap-2 pt-2 ${hasThumbnail ? 'mt-auto' : 'mt-4'}`}>
          <span className="truncate text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {course.category || "Enrolled course"}
          </span>
          <div className="flex flex-wrap justify-end gap-2">
            {isDevOps && <button type="button" onClick={(event) => { event.stopPropagation(); onLive(); }} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100"><Radio className="h-3.5 w-3.5" />Live Classes</button>}
            <button
              type="button"
              onClick={(event) => { event.stopPropagation(); onOpen(); }}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#0f55f7] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#0b43c3]"
            >
              {isDevOps ? "Continue Course" : "View Course"}
              <CirclePlay className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
