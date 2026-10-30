import { useMemo, useState } from "react";

export const mentorBatches = [
  { id: "react-morning", name: "React Morning", course: "Full Stack Dev" },
  { id: "node-afternoon", name: "Node.js Afternoon", course: "Full Stack Dev" },
  { id: "react-advanced", name: "React Advanced", course: "React Advanced" },
];

const initialAssignments = [
  { id: "a1", title: "React Component Lifecycle", batchId: "react-morning", totalMarks: 50, passMarks: 20, deadline: "2026-08-06T18:00", submitted: 20, pending: 8, reviewed: 12, average: "—", status: "Active" },
  { id: "a2", title: "REST API Design Task", batchId: "node-afternoon", totalMarks: 40, passMarks: 16, deadline: "2026-08-08T18:00", submitted: 14, pending: 4, reviewed: 10, average: "28.4/40", status: "Overdue" },
  { id: "a3", title: "React Hooks Practice", batchId: "react-morning", totalMarks: 30, passMarks: 12, deadline: "2026-07-30T18:00", submitted: 28, pending: 0, reviewed: 28, average: "24.5/30", status: "Completed" },
  { id: "a4", title: "Node.js Middleware Task", batchId: "node-afternoon", totalMarks: 50, passMarks: 20, deadline: "2026-08-20T18:00", submitted: 0, pending: 0, reviewed: 0, average: "—", status: "Active" },
];

export function useAssignments() {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [auditLog, setAuditLog] = useState([]);
  const getBatch = (id) => mentorBatches.find((batch) => batch.id === id);
  const stats = useMemo(() => ({
    total: assignments.length,
    active: assignments.filter((item) => item.status === "Active").length,
    pending: assignments.reduce((sum, item) => sum + item.pending, 0),
    overdue: assignments.filter((item) => item.status === "Overdue").length,
    avg: "26.5/40",
  }), [assignments]);
  const createAssignment = (assignment) => setAssignments((items) => [...items, { ...assignment, id: `a${Date.now()}`, submitted: 0, pending: 0, reviewed: 0, average: "—" }]);
  return { assignments, setAssignments, auditLog, setAuditLog, stats, getBatch, createAssignment, mentorBatches };
}
