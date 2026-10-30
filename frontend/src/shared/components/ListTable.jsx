// Shared organization list table, following the Batches table architecture
// (features/organization/pages/BatchManagement.jsx):
//
// - A real <table className="table-fixed"> with one <colgroup>, so header and
//   body cells always share the same column boundaries.
// - Compact columns get fixed pixel widths sized to their pastel header label
//   (the global header theme adds ~20px padding on each side). Primary text
//   columns get no width and split the remaining space equally.
// - The pastel header blocks come from table-header-system.css.
// - The wrapper only scrolls when the card is narrower than `minWidth`; on a
//   normal desktop the table fits. The inner <div> keeps the table out of the
//   generic ".overflow-x-auto > table" theme rules.
// - `layout="auto"` sizes columns to their content instead (the given widths
//   become minimums), for dense tables whose text columns must not truncate.
// - `headerStyle="plain"` opts out of the pastel header blocks; the page then
//   styles its own header row.

export function ListTable({ label, widths, minWidth = 960, layout = "fixed", headerStyle, children }) {
  return (
    <div className="overflow-x-auto [scrollbar-color:#94A3B8_#EDF2F7] [scrollbar-width:thin]">
      <div>
        <table
          aria-label={label}
          data-table-header={headerStyle}
          className={`w-full ${layout === "auto" ? "table-auto" : "table-fixed"} border-collapse text-left`}
          style={{ minWidth }}
        >
          <colgroup>
            {widths.map((width, index) => (
              <col key={index} style={width ? { width } : undefined} />
            ))}
          </colgroup>
          {children}
        </table>
      </div>
    </div>
  );
}

export function ListTableHead({ children }) {
  return (
    <thead className="bg-white dark:bg-slate-900">
      <tr className="text-[11px] font-semibold uppercase tracking-[.05em] text-[#173A63] dark:text-slate-300">
        {children}
      </tr>
    </thead>
  );
}

// `compact` is for narrow checkbox / # columns: the header uses the same 8px
// padding as the body cell so the checkbox or number lines up exactly.
export function ListTableHeaderCell({ align = "left", ariaSort, compact = false, className = "", children }) {
  return (
    <th
      aria-sort={ariaSort}
      data-compact={compact || undefined}
      className={`border-b border-[#EDF2F7] px-2 py-3.5 dark:border-slate-700 ${align === "center" ? "text-center" : "text-left"} ${className}`}
    >
      {children}
    </th>
  );
}

export function ListTableBody({ children }) {
  return <tbody>{children}</tbody>;
}

// `onClick` makes the whole row a click target (e.g. open details).
export function ListTableRow({ selected = false, onClick, children }) {
  return (
    <tr
      onClick={onClick}
      className={`border-b border-[#EDF2F7] transition-colors last:border-0 hover:bg-[#F8FBFF] dark:border-slate-800 dark:hover:bg-slate-800/60 ${onClick ? "cursor-pointer" : ""} ${selected ? "bg-[#F3F8FE] dark:bg-slate-800/50" : "bg-white dark:bg-slate-900"}`}
    >
      {children}
    </tr>
  );
}

// Body cells use the same 12px inline padding as header cells (see
// table-header-system.css), so values start directly under their label.
// `compact` matches a compact header cell (8px) for checkbox / # columns.
// `truncate` clips overflowing text with an ellipsis; turn it off for cells
// holding buttons so their focus rings are not clipped.
export function ListTableCell({ align = "left", compact = false, truncate = true, title, className = "", onClick, children }) {
  return (
    <td
      title={title}
      onClick={onClick}
      data-compact={compact || undefined}
      className={`h-15 whitespace-nowrap ${compact ? "px-[8px]" : "px-[12px]"} py-2 ${truncate ? "overflow-hidden text-ellipsis" : ""} ${align === "center" ? "text-center" : ""} ${className}`}
    >
      {children}
    </td>
  );
}
