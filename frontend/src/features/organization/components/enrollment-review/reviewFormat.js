import { useEffect, useState } from "react";

// Formatters + hooks shared by the enrollment review pages.

export const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

export const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

export const formatAmount = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Debounced value for search inputs. */
export function useDebounced(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/**
 * Paged list loader: state is only set from the request's promise (no
 * synchronous setState in effects). `loading` is true until the response for
 * the current key arrives; `reload()` refetches the same page.
 */
export function usePagedList(fetchPage, params) {
  const [tick, setTick] = useState(0);
  const key = `${JSON.stringify(params)}|${tick}`;
  const [state, setState] = useState({ key: null, data: [], totalRecords: 0, error: null });

  useEffect(() => {
    let active = true;
    fetchPage(params)
      .then((result) => active && setState({ key, data: result?.data ?? [], totalRecords: result?.totalRecords ?? 0, error: null }))
      .catch((error) => active && setState((current) => ({ ...current, key, error })));
    return () => { active = false; };
    // `key` covers params + tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return {
    ...state,
    loading: state.key !== key,
    reload: () => setTick((value) => value + 1),
  };
}
