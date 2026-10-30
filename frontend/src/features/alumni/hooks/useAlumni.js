import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getAlumni,
  getAlumniStats,
  getEvents,
  getMentors,
  getJobs,
  getTestimonials,
} from "../services/alumniApi";

/**
 * useAlumni — Custom hook for alumni feature data
 *
 * Responsibilities:
 * - Fetch all alumni data from the API service
 * - Manage loading, error, and empty states
 * - Provide pagination and filter placeholders
 * - Ready for React Query / SWR migration
 *
 * @returns {{ alumni, stats, events, mentors, jobs, testimonials, loading, error }}
 *
 * Usage:
 *   const { alumni, stats, loading, error } = useAlumni();
 */
export function useAlumni() {
  const [alumni, setAlumni] = useState([]);    const [stats, setStats] = useState([]);
  const [events, setEvents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // TODO: Add pagination state
  // const [page, setPage] = useState(1);
  // const [totalPages, setTotalPages] = useState(1);

  // TODO: Add filters state
  // const [filters, setFilters] = useState({ search: '', category: '', remote: null });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const results = await Promise.allSettled([
        getAlumniStats(),
        getAlumni(),
        getEvents(),
        getMentors(),
        getJobs(),
        getTestimonials(),
      ]);

      const [statsRes, alumniRes, eventsRes, mentorsRes, jobsRes, testimonialsRes] = results;

      if (statsRes.status === "fulfilled" && statsRes.value.success) {
        setStats(statsRes.value.data);
      }
      if (alumniRes.status === "fulfilled" && alumniRes.value.success) {
        setAlumni(alumniRes.value.data);
      }
      if (eventsRes.status === "fulfilled" && eventsRes.value.success) {
        setEvents(eventsRes.value.data);
      }
      if (mentorsRes.status === "fulfilled" && mentorsRes.value.success) {
        setMentors(mentorsRes.value.data);
      }
      if (jobsRes.status === "fulfilled" && jobsRes.value.success) {
        setJobs(jobsRes.value.data);
      }
      if (testimonialsRes.status === "fulfilled" && testimonialsRes.value.success) {
        setTestimonials(testimonialsRes.value.data);
      }

      // Check if any request failed
      const failures = results.filter((r) => r.status === "rejected" || (r.value && !r.value.success));
      if (failures.length > 0) {
        setError("Some alumni data could not be loaded.");
      }
    } catch (err) {
      setError(err.message || "Failed to load alumni data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const retry = useCallback(() => {
    fetchAll();
  }, [fetchAll]);

  return useMemo(
    () => ({ alumni, stats, events, mentors, jobs, testimonials, loading, error, retry }),
    [alumni, stats, events, mentors, jobs, testimonials, loading, error, retry]
  );
}

/**
 * useAlumniDetail — Fetch a single alumni member by ID
 * TODO: Implement when backend is ready
 */

/**
 * useAlumniSearch — Search/filter alumni with debounce
 * TODO: Implement search functionality
 */
