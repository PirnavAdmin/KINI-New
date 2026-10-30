import { useCallback, useEffect, useMemo, useState } from "react";
const names = [
  "Anjali Sharma",
  "Kiran Mehta",
  "Rohan Verma",
  "Pooja Singh",
  "Arjun Kumar",
  "Meera Nair",
  "Vikram Patel",
  "Sneha Reddy",
  "Rahul Gupta",
  "Divya Iyer",
  "Aditya Joshi",
  "Neha Kulkarni",
  "Siddharth Rao",
  "Ishita Bose",
  "Manish Yadav",
  "Sana Khan",
  "Harsh Vardhan",
  "Lakshmi Pillai",
  "Kabir Shah",
  "Nisha Menon",
  "Varun Reddy",
  "Aditi Kapoor",
  "Rakesh Nair",
  "Simran Kaur",
  "Yash Desai",
];
export const STUDENTS = names.map((name, index) => ({
  id: index + 1,
  studentId: `STU-2026-${String(847 + index).padStart(4, "0")}`,
  name,
  status:
    index < 18
      ? index % 8 === 2
        ? "Absent"
        : index % 8 === 4
          ? "Late"
          : index % 10 === 6
            ? "Leave"
            : "Present"
      : null,
}));
export const CLASSES = [
  {
    id: 1,
    name: "React Hooks",
    batch: "React Morning Batch",
    course: "Full Stack Dev",
    trainer: "Rahul Sharma",
    time: "10:00–11:30 AM",
    status: "Live",
    marked: true,
    present: 24,
    absent: 3,
    late: 1,
    percent: 86,
    date: "2026-08-04",
  },
  {
    id: 2,
    name: "Node.js APIs",
    batch: "Node.js Afternoon",
    course: "Full Stack Dev",
    trainer: "Priya Nair",
    time: "2:00–3:30 PM",
    status: "Upcoming",
    marked: false,
    present: 0,
    absent: 0,
    late: 0,
    percent: 0,
    date: "2026-08-04",
  },
  {
    id: 3,
    name: "Python Basics",
    batch: "Python Beginners",
    course: "Full Stack Dev",
    trainer: "Suresh Kumar",
    time: "8:00–9:30 AM",
    status: "Completed",
    marked: true,
    present: 26,
    absent: 4,
    late: 0,
    percent: 87,
    date: "2026-08-04",
  },
  {
    id: 4,
    name: "ML Models",
    batch: "Data Science Weekend",
    course: "Data Science",
    trainer: "Ankit Singh",
    time: "10:00–11:30 AM",
    status: "Completed",
    marked: false,
    present: 0,
    absent: 0,
    late: 0,
    percent: 0,
    date: "2026-08-04",
  },
  {
    id: 5,
    name: "Design Systems",
    batch: "UI/UX Evening",
    course: "UI/UX Design",
    trainer: "Kavya Reddy",
    time: "6:00–7:30 PM",
    status: "Upcoming",
    marked: false,
    present: 0,
    absent: 0,
    late: 0,
    percent: 0,
    date: "2026-08-04",
  },
  {
    id: 6,
    name: "Advanced State",
    batch: "React Advanced",
    course: "React Advanced",
    trainer: "Riya Joshi",
    time: "11:00–12:30 PM",
    status: "Completed",
    marked: true,
    present: 11,
    absent: 1,
    late: 0,
    percent: 92,
    date: "2026-08-04",
  },
];
export const REQUESTS = [
  {
    id: 1,
    student: "Pooja Singh",
    date: "Aug 1, 2026",
    original: "Absent",
    requested: "Present",
    reason: "Joined from classroom; QR scan failed",
    requestedBy: "Rahul Sharma",
    requestedAt: "Aug 2",
  },
  {
    id: 2,
    student: "Arjun Kumar",
    date: "Aug 2, 2026",
    original: "Absent",
    requested: "Leave",
    reason: "Approved medical leave",
    requestedBy: "Arjun Kumar",
    requestedAt: "Aug 3",
  },
  {
    id: 3,
    student: "Meera Nair",
    date: "Aug 3, 2026",
    original: "Late",
    requested: "Present",
    reason: "Mentor confirmed arrival before class",
    requestedBy: "Priya Nair",
    requestedAt: "Aug 4",
  },
];
export default function useAttendance() {
  const [classes, setClasses] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [auditLog, setAuditLog] = useState([]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setClasses(CLASSES);
      setRequests(REQUESTS);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);
  const saveSheet = useCallback((classId, records, notify) => {
    const counts = Object.values(records).reduce(
      (acc, status) => {
        if (status) acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      { Present: 0, Absent: 0, Late: 0, Leave: 0 },
    );
    setClasses((items) =>
      items.map((item) =>
        item.id === classId
          ? {
              ...item,
              marked: true,
              present: counts.Present,
              absent: counts.Absent,
              late: counts.Late,
              percent: Math.round(
                (counts.Present / Object.keys(records).length) * 100,
              ),
            }
          : item,
      ),
    );
    setAuditLog((items) => [
      {
        action: "Attendance marked",
        classId,
        notify,
        when: new Date().toISOString(),
        by: "Rahul Sharma",
      },
      ...items,
    ]);
  }, []);
  const resolveRequest = useCallback((request, decision, reason) => {
    if (!reason.trim()) return { ok: false, error: "Reason is required." };
    setRequests((items) => items.filter((item) => item.id !== request.id));
    setAuditLog((items) => [
      {
        action: `Correction ${decision}`,
        student: request.student,
        from: request.original,
        to: request.requested,
        why: reason,
        when: new Date().toISOString(),
        by: "Rahul Sharma",
      },
      ...items,
    ]);
    return { ok: true };
  }, []);
  const stats = useMemo(
    () => ({ classes: 12, marked: 8, unmarked: 4, average: 78 }),
    [],
  );
  return {
    classes,
    requests,
    students: STUDENTS,
    loading,
    stats,
    auditLog,
    saveSheet,
    resolveRequest,
  };
}
