import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { BookOpen, CalendarDays, Layers3, MoreVertical, Search, UserRound, Users, UsersRound } from "lucide-react";
import { SectionHead, StatusPill } from "./ProfileKit";

const TONES = ["purple", "green", "blue", "orange"];
const shortDate = (value) => {
  if (!value) return "-";
  const parsed = new Date(String(value).length === 10 ? `${value}T00:00:00` : value);
  return Number.isNaN(parsed.getTime()) ? "-" : new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(parsed).replace("Sep ", "Sept ");
};
const statusText = (value) => {
  if (value && typeof value === "object") return String(value.name ?? value.label ?? value.status ?? value.value ?? "").trim();
  return String(value ?? "").trim();
};

function CardMenu({ items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => { if (!ref.current?.contains(event.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  if (!items.length) return null;
  return (
    <div className="relative" ref={ref}>
      <button type="button" className="pk-icon-btn" aria-label="More actions" aria-expanded={open} onClick={() => setOpen((value) => !value)}><MoreVertical /></button>
      {open && (
        <div className="pk-menu" role="menu">
          {items.map(({ label, onClick }) => <button key={label} type="button" role="menuitem" onClick={() => { setOpen(false); onClick(); }}>{label}</button>)}
        </div>
      )}
    </div>
  );
}

function useFiltered(rows, query, status, fields) {
  return useMemo(() => {
    const term = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (status !== "all" && statusText(row.status).toLowerCase() !== status) return false;
      if (!term) return true;
      return fields(row).some((value) => String(value ?? "").toLowerCase().includes(term));
    });
  }, [rows, query, status, fields]);
}

function Toolbar({ query, setQuery, status, setStatus, statuses, placeholder }) {
  return (
    <>
      <label className="pk-search"><Search aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={placeholder} aria-label={placeholder} /></label>
      <select className="pk-select" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by status">
        <option value="all">All Statuses</option>
        {statuses.map((value) => <option key={statusText(value)} value={statusText(value).toLowerCase()}>{statusText(value)}</option>)}
      </select>
    </>
  );
}

/** Batches assigned to an employee (Employee profile › Batches). */
export function BatchCards({ batches, mentorName, onOpen, empty }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const statuses = useMemo(() => [...new Set(batches.map((batch) => statusText(batch.status)).filter(Boolean))], [batches]);
  const fields = useMemo(() => (batch) => [batch.batchName, batch.courseName, batch.status], []);
  const rows = useFiltered(batches, query, status, fields);
  return (
    <section>
      <SectionHead icon={Layers3} title="Batches" subtitle="Manage and view batches assigned to this employee.">
        <Toolbar query={query} setQuery={setQuery} status={status} setStatus={setStatus} statuses={statuses} placeholder="Search batch by name, course or status..." />
      </SectionHead>
      <p className="pk-count">{rows.length} {rows.length === 1 ? "Batch" : "Batches"}</p>
      {!rows.length ? empty : rows.map((batch, index) => (
        <article key={batch.batchId ?? index} className={`pk-card pk-card--${TONES[index % TONES.length]}`}>
          <div className="pk-card__head">
            <span className="pk-card__icon" aria-hidden="true"><UsersRound /></span>
            <div className="pk-card__title">
              <h3>{batch.batchName || `Batch ${batch.batchId}`}</h3>
              <p>{batch.courseName || "Course not available"}</p>
            </div>
            <div className="pk-card__side">
              <StatusPill status={batch.status ?? "Active"} />
              <CardMenu items={onOpen && batch.batchId != null ? [{ label: "Open batch", onClick: () => onOpen(batch) }] : []} />
            </div>
          </div>
          <div className="pk-card__stats">
            <div><span><Users /></span><div><small>Students</small><b>{batch.studentCount ?? batch.studentsCount ?? 0}/{batch.capacity ?? "-"}</b></div></div>
            <div><span><CalendarDays /></span><div><small>Starts On</small><b>{shortDate(batch.startDate)}</b></div></div>
            <div><span className="is-red"><CalendarDays /></span><div><small>Ends On</small><b>{shortDate(batch.endDate)}</b></div></div>
            <div><span className="is-purple"><UserRound /></span><div><small>Mentor</small><b>{batch.mentorName || mentorName || "-"}</b></div></div>
          </div>
        </article>
      ))}
    </section>
  );
}

/** Courses assigned to an employee (Employee profile › Courses). */
export function CourseCards({ courses, onOpen, empty }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const statuses = useMemo(() => [...new Set(courses.map((course) => statusText(course.status)).filter(Boolean))], [courses]);
  const fields = useMemo(() => (course) => [course.courseName, course.status, ...(course.batches ?? []).map((batch) => batch.batchName)], []);
  const rows = useFiltered(courses, query, status, fields);
  return (
    <section>
      <SectionHead icon={BookOpen} title="Courses" subtitle="View courses assigned to this employee">
        <Toolbar query={query} setQuery={setQuery} status={status} setStatus={setStatus} statuses={statuses} placeholder="Search course name, batch or status..." />
      </SectionHead>
      <p className="pk-count">{rows.length} {rows.length === 1 ? "Course" : "Courses"}</p>
      {!rows.length ? empty : rows.map((course, index) => (
        <article key={course.courseId ?? course.courseName} className={`pk-card pk-card--${TONES[index % TONES.length]}`}>
          <div className="pk-card__head">
            <span className="pk-card__icon" aria-hidden="true"><BookOpen /></span>
            <div className="pk-card__title">
              <h3>{course.courseName}</h3>
              <div className="pk-card__chips">
                {(course.batches ?? []).filter((batch) => batch.batchName).map((batch) => <span key={batch.batchId ?? batch.batchName}>Assigned Batch: <b>{batch.batchName}</b></span>)}
                <span className="is-blue">Mentor Course</span>
              </div>
            </div>
            <div className="pk-card__side">
              {course.status && <StatusPill status={course.status} />}
              <CardMenu items={onOpen && course.courseId != null ? [{ label: "Open course", onClick: () => onOpen(course) }] : []} />
            </div>
          </div>
          <div className="pk-card__stats" style={{ "--cols": 3 }}>
            <div><span><Users /></span><div><small>Students</small><b>{course.studentCount ?? 0}</b></div></div>
            <div><span><CalendarDays /></span><div><small>Duration</small><b>{course.duration || "-"}</b></div></div>
            <div><span><Layers3 /></span><div><small>Batches</small><b>{(course.batches ?? []).length}</b></div></div>
          </div>
        </article>
      ))}
    </section>
  );
}

BatchCards.propTypes = { batches: PropTypes.array.isRequired, mentorName: PropTypes.string, onOpen: PropTypes.func, empty: PropTypes.node };
CourseCards.propTypes = { courses: PropTypes.array.isRequired, onOpen: PropTypes.func, empty: PropTypes.node };
