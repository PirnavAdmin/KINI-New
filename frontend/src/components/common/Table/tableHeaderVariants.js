// Global table-header variants. The visual system lives in
// src/styles/table-header-system.css and applies to every dashboard table
// automatically (colour rhythm by column position). Use these helpers only to
// pin a column to a specific colour, or to opt a table out.
//
//   <th {...thVariant("green")}>Status</th>
//   <table {...PLAIN_TABLE_HEADER}>…</table>   // print / markdown tables

export const TABLE_HEADER_VARIANTS = {
  purple: { bg: "#EDE4FF", fg: "#7C3AED" },
  blue: { bg: "#E3EEFF", fg: "#2563EB" },
  orange: { bg: "#FFEED8", fg: "#EA8A0B" },
  green: { bg: "#DDF5EA", fg: "#059669" },
  red: { bg: "#FFE4E7", fg: "#EF4444" },
};

export const thVariant = (variant) =>
  TABLE_HEADER_VARIANTS[variant] ? { "data-th-variant": variant } : {};

export const PLAIN_TABLE_HEADER = { "data-table-header": "plain" };
