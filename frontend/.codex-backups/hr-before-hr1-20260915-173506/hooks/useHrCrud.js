import { useCallback, useState } from 'react'

/**
 * useHrCrud — lightweight local CRUD engine shared by every Kini HRMS page.
 *
 * Each page seeds it with its mock registry; Add / Edit / Delete / status
 * transitions update the visible rows instantly. No backend is involved —
 * this makes every table action genuinely functional in the demo while the
 * real API layer (if wired later) can swap these calls out one-for-one.
 *
 * @param {Array}  initialRows - seed rows from the mock data registry
 * @param {string} idKey       - primary key field name (default 'id')
 */
export default function useHrCrud(initialRows, idKey = 'id') {
  const [rows, setRows] = useState(initialRows)

  const addRow = useCallback((row) => setRows((prev) => [row, ...prev]), [])
  const updateRow = useCallback(
    (id, patch) => setRows((prev) => prev.map((r) => (r[idKey] === id ? { ...r, ...patch } : r))),
    [idKey],
  )
  const removeRow = useCallback((id) => setRows((prev) => prev.filter((r) => r[idKey] !== id)), [idKey])
  const reset = useCallback(() => setRows(initialRows), [initialRows])

  return { rows, setRows, addRow, updateRow, removeRow, reset }
}
