import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import { BookOpen, X } from "lucide-react";

const WIDTH = 320;

/**
 * Every course/batch/mentor assignment of one student. Each line is a single
 * enrollment record, so a course is never shown next to another course's batch.
 * Opened from "+N more" or the row menu; closes on Escape, outside click or scroll.
 */
export default function EnrollmentsPopover({ student, anchor, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.focus();
    const outside = (event) => {
      if (!ref.current?.contains(event.target) && !event.target.closest?.("[data-enrollments-trigger]")) onClose();
    };
    const escape = (event) => { if (event.key === "Escape") onClose(); };
    const scroll = (event) => { if (!ref.current?.contains(event.target)) onClose(); };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    window.addEventListener("resize", onClose);
    window.addEventListener("scroll", scroll, true);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("resize", onClose);
      window.removeEventListener("scroll", scroll, true);
    };
  }, [onClose]);

  const rows = student.enrollments ?? [];
  const estimatedHeight = 64 + rows.length * 52;
  const left = Math.min(Math.max(8, anchor.left), window.innerWidth - WIDTH - 8);
  const top = anchor.bottom + 6 + estimatedHeight <= window.innerHeight
    ? anchor.bottom + 6
    : Math.max(8, anchor.top - estimatedHeight - 6);

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-label={`Enrollments for ${student.name}`}
      tabIndex={-1}
      className="students-enrollments"
      style={{ left, top, width: WIDTH }}
    >
      <header className="students-enrollments__head">
        <span>
          <b>{student.name}</b>
          <small>{rows.length} course enrollment{rows.length === 1 ? "" : "s"}</small>
        </span>
        <button type="button" onClick={onClose} aria-label="Close enrollments"><X aria-hidden="true" /></button>
      </header>
      <ul>
        {rows.map((item) => (
          <li key={`${item.batchId ?? "no-batch"}-${item.courseId ?? item.course}`}>
            <span className="students-enrollments__icon" aria-hidden="true"><BookOpen /></span>
            <span className="students-enrollments__copy">
              <span className="students-enrollments__pair">
                <span className="students-chip is-course" title={item.course}>{item.course}</span>
                <span className="students-chip is-batch" title={item.batch}>{item.batch || "Not assigned"}</span>
              </span>
              <small>Mentor: {item.mentor || "Unassigned"}</small>
            </span>
          </li>
        ))}
      </ul>
    </div>,
    document.body,
  );
}

EnrollmentsPopover.propTypes = {
  student: PropTypes.shape({ name: PropTypes.string, enrollments: PropTypes.array }).isRequired,
  anchor: PropTypes.shape({ left: PropTypes.number, top: PropTypes.number, bottom: PropTypes.number }).isRequired,
  onClose: PropTypes.func.isRequired,
};
