import { useEffect, useRef, useState } from "react";
import { studentsApi } from "@/api/students";
import { attendanceRowsOf, normalizeAttendanceRow, summarizeAttendance } from "./studentAttendance";

/**
 * Attendance for the students currently on screen, from their attendance
 * records (the same source as Student Details → Attendance). There is no bulk
 * endpoint, so only the visible page is requested, each student once; results
 * are kept until `refreshKey` changes (the roster was reloaded).
 *
 * Returns { [studentId]: { status: "ready", summary } | { status: "error" } };
 * a missing key means the request is still in flight.
 */
export default function useStudentAttendance(studentIds, refreshKey) {
  const [byId, setById] = useState({});
  const requested = useRef(new Set());
  const generation = useRef(0);
  const [cacheKey, setCacheKey] = useState(refreshKey);
  if (cacheKey !== refreshKey) {
    setCacheKey(refreshKey);
    setById({});
  }
  const missing = studentIds
    .filter((id) => id != null)
    .map(String)
    .filter((id) => !(id in byId))
    .join(",");

  // A reloaded roster starts a new generation; older responses are ignored.
  useEffect(() => {
    generation.current += 1;
    requested.current = new Set();
  }, [refreshKey]);

  useEffect(() => {
    const ids = missing ? missing.split(",").filter((id) => !requested.current.has(id)) : [];
    if (!ids.length) return;
    ids.forEach((id) => requested.current.add(id));
    const requestGeneration = generation.current;
    Promise.allSettled(ids.map((id) => studentsApi.getAttendance(id))).then((results) => {
      if (requestGeneration !== generation.current) return;
      setById((current) => {
        const next = { ...current };
        results.forEach((result, index) => {
          next[ids[index]] = result.status === "fulfilled"
            ? { status: "ready", summary: summarizeAttendance(attendanceRowsOf(result.value.data).map(normalizeAttendanceRow)) }
            : { status: "error" };
        });
        return next;
      });
    });
  }, [missing]);

  useEffect(() => () => { generation.current += 1; }, []);

  return byId;
}
