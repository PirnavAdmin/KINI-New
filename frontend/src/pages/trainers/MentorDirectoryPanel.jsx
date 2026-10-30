import { useId, useRef, useState } from "react";
import { AlertTriangle, ChevronRight, Contact, Download, RefreshCw, Search, SlidersHorizontal, X } from "lucide-react";
import FilterSelect from "@shared/components/FilterSelect";
import { ALL, STATUS_GROUPS } from "./mentorDirectory";
import { MentorAvatar } from "./MentorKit";

const withAll = (label, names) => [{ value: ALL, label }, ...names.map((name) => ({ value: name, label: name }))];
const STATUS_CHIPS = [{ value: ALL, label: "All" }, ...STATUS_GROUPS.map((group) => ({ value: group.status, label: group.status }))];

/**
 * Left panel of the mentor workspace: search, status chips, the extra
 * course / batch / type filters, and the selectable mentor list.
 * mentors: the filtered list; counts: { all, Active, "On Leave", Inactive }
 * for the current search and extra filters.
 */
export default function MentorDirectoryPanel({
  mentors, total, counts, filters, options, onFiltersChange, onClearFilters, hasFilters,
  selectedId, onSelect, onExport, photoFor, loading, error, onRetry,
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreId = useId();
  const listRef = useRef(null);
  const set = (key) => (event) => onFiltersChange({ ...filters, [key]: event.target.value });
  const extraActive = ["course", "batch", "type"].filter((key) => filters[key] !== ALL).length;

  // Roving focus: arrows / Home / End move through the list and select.
  const onListKey = (event) => {
    const keys = { ArrowDown: 1, ArrowUp: -1, Home: "first", End: "last" };
    if (!(event.key in keys) || !mentors.length) return;
    event.preventDefault();
    const index = mentors.findIndex((mentor) => mentor.id === selectedId);
    const step = keys[event.key];
    const next = step === "first" ? 0 : step === "last" ? mentors.length - 1 : Math.min(mentors.length - 1, Math.max(0, index + step));
    onSelect(mentors[next].id);
    listRef.current?.querySelectorAll("[role=option]")[next]?.focus();
  };

  return (
    <section className="mw-panel mw-dir" aria-label="Mentor directory">
      <header className="mw-dir__head">
        <span className="mw-chip-icon" aria-hidden="true"><Contact /></span>
        <h2>Mentor Directory</h2>
      </header>

      <div className="mw-dir__controls">
        <div className="mw-dir__searchrow">
          <label className="mw-search">
            <Search aria-hidden="true" />
            <span className="sr-only">Search mentors</span>
            <input type="search" value={filters.query} onChange={set("query")} placeholder="Search name, email or ID…" />
          </label>
          <button
            type="button"
            className={`mw-icon-btn is-bordered${extraActive ? " is-on" : ""}`}
            aria-expanded={moreOpen}
            aria-controls={moreId}
            aria-label={`More filters${extraActive ? ` (${extraActive} active)` : ""}`}
            title="Course, batch and type filters"
            onClick={() => setMoreOpen((value) => !value)}
          >
            <SlidersHorizontal aria-hidden="true" />
            {extraActive > 0 && <span className="mw-icon-btn__count" aria-hidden="true">{extraActive}</span>}
          </button>
          <button type="button" className="mw-icon-btn is-bordered" onClick={onExport} disabled={loading || !mentors.length} aria-label="Export mentors shown" title="Export mentors shown">
            <Download aria-hidden="true" />
          </button>
        </div>
        <div id={moreId} className="mw-dir__more" hidden={!moreOpen}>
          <FilterSelect label="Filter by course" value={filters.course} onChange={set("course")} options={withAll("All Courses", options.courses)} />
          <FilterSelect label="Filter by batch" value={filters.batch} onChange={set("batch")} options={withAll("All Batches", options.batches)} />
          <FilterSelect label="Filter by employment type" value={filters.type} onChange={set("type")} options={withAll("All Types", options.types)} />
        </div>
        <div className="mw-status" role="group" aria-label="Filter by status">
          {STATUS_CHIPS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={filters.status === value}
              onClick={() => onFiltersChange({ ...filters, status: value })}
              className={`mw-status__chip is-${value === ALL ? "all" : value === "Active" ? "active" : value === "On Leave" ? "leave" : "inactive"}`}
            >
              {label}
              <span className="mw-status__count">{counts[value === ALL ? "all" : value] ?? 0}</span>
            </button>
          ))}
        </div>
        {hasFilters && (
          <p className="mw-dir__summary" aria-live="polite">
            <span><b>{mentors.length}</b> of {total} mentors</span>
            <button type="button" onClick={onClearFilters}><X aria-hidden="true" /> Clear filters</button>
          </p>
        )}
      </div>

      {loading ? (
        <ul className="mw-dir__list" aria-busy="true" aria-label="Loading mentors">
          {[0, 1, 2, 3].map((index) => <li key={index} className="mw-skeleton is-row" />)}
        </ul>
      ) : error && !total ? (
        <div className="mw-state is-error" role="alert">
          <AlertTriangle aria-hidden="true" />
          <p><b>Mentors couldn’t be loaded.</b> {error}</p>
          <button type="button" className="mw-btn is-small" onClick={onRetry}><RefreshCw aria-hidden="true" /> Retry</button>
        </div>
      ) : mentors.length ? (
        <ul ref={listRef} className="mw-dir__list" role="listbox" aria-label="Mentors" onKeyDown={onListKey}>
          {mentors.map((mentor) => {
            const selected = mentor.id === selectedId;
            return (
              <li
                key={mentor.id}
                role="option"
                aria-selected={selected}
                tabIndex={selected ? 0 : -1}
                className={`mw-dir__item${selected ? " is-selected" : ""}`}
                onClick={() => onSelect(mentor.id)}
                onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(mentor.id); } }}
              >
                <MentorAvatar name={mentor.name} photo={photoFor(mentor)} status={mentor.status} />
                <span className="mw-dir__text">
                  <b title={mentor.name}>{mentor.name}</b>
                  <span className="mw-dir__meta">
                    Emp ID {mentor.employeeId}
                    {mentor.mentorProfileId != null && <><i aria-hidden="true">•</i>Mentor #{mentor.mentorProfileId}</>}
                    {mentor.experience > 0 && <><i aria-hidden="true">•</i>{mentor.experience} yrs</>}
                    {mentor.employmentType && <><i aria-hidden="true">•</i>{mentor.employmentType}</>}
                  </span>
                  <span className={`mw-dir__status is-${mentor.status === "Active" ? "active" : mentor.status === "On Leave" ? "leave" : "inactive"}`}>
                    <span aria-hidden="true" />{mentor.status}
                  </span>
                </span>
                <ChevronRight className="mw-dir__chevron" aria-hidden="true" />
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mw-state">
          <Contact aria-hidden="true" />
          <p>{total ? "No mentors match these filters." : "No mentors yet. Mentors appear here once they are added to your organization."}</p>
          {total ? <button type="button" className="mw-btn is-small" onClick={onClearFilters}>Clear filters</button> : null}
        </div>
      )}
    </section>
  );
}
