import PropTypes from "prop-types";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

/** Pagination footer used by mentor list pages (v15): "Showing x to y of n",
    round page buttons and a rows-per-page select. */
export default function Pager({ label, first, last, total, page, pageCount, onPage, pageSize, onPageSize, sizes = [5, 10, 25, 50] }) {
  const pages = [];
  const from = Math.max(1, Math.min(page - 2, pageCount - 4));
  for (let number = from; number <= Math.min(pageCount, from + 4); number += 1) pages.push(number);
  return (
    <nav className="mv15-pager" aria-label={`${label} pagination`}>
      <p>Showing {first} to {last} of {total} {label}</p>
      <div className="mv15-pager__controls">
        <button type="button" onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Previous page"><ChevronLeft /></button>
        {pages.map((number) => (
          <button key={number} type="button" onClick={() => onPage(number)} aria-current={number === page ? "page" : undefined} className={number === page ? "is-current" : undefined}>{number}</button>
        ))}
        <button type="button" onClick={() => onPage(page + 1)} disabled={page >= pageCount} aria-label="Next page"><ChevronRight /></button>
        {onPageSize && (
          <label className="mv15-pager__size">
            <select value={pageSize} onChange={(event) => onPageSize(Number(event.target.value))} aria-label="Rows per page">
              {sizes.map((size) => <option key={size} value={size}>{size} per page</option>)}
            </select>
            <ChevronDown aria-hidden="true" />
          </label>
        )}
      </div>
    </nav>
  );
}

Pager.propTypes = {
  label: PropTypes.string.isRequired,
  first: PropTypes.number.isRequired,
  last: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  pageCount: PropTypes.number.isRequired,
  onPage: PropTypes.func.isRequired,
  pageSize: PropTypes.number,
  onPageSize: PropTypes.func,
  sizes: PropTypes.arrayOf(PropTypes.number),
};
