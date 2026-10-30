import { useEffect, useMemo, useState } from 'react'

const normalize = (value) => String(value ?? '').toLowerCase()

/**
 * usePageSearch — page-level global search for HR pages.
 *
 * Returns a controlled `search` state plus a 300ms-debounced `debounced` value
 * and a memoized `matches(row)` predicate that searches every field of a row
 * (numbers, strings, nested arrays) against the debounced term — the same
 * behaviour the shared DataTable's internal search uses, so no page data or
 * filtering logic needs to change.
 */
export default function usePageSearch(initial = '') {
  const [search, setSearch] = useState(initial)
  const [debounced, setDebounced] = useState(initial)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(search), 300)
    return () => clearTimeout(id)
  }, [search])

  const matches = useMemo(
    () => (row) => {
      const q = debounced.trim().toLowerCase()
      if (!q) return true
      return Object.values(row || {}).some((value) => {
        if (value == null) return false
        if (Array.isArray(value)) return value.some((v) => normalize(v).includes(q))
        return normalize(value).includes(q)
      })
    },
    [debounced],
  )

  return { search, setSearch, debounced, matches }
}
