const STORAGE_KEY = "kini-organization-demo-v1";

// A UI-only data boundary. Replace these calls with API calls later without
// changing the screens that consume the view model.
export const initialDemoData = {
  courses: [{ id: "CRS-001", name: "Full Stack Development", fee: 75000 }, { id: "CRS-002", name: "Data Science & AI", fee: 82000 }],
  batches: [{ id: "BAT-001", name: "FS-JUL-2026", courseId: "CRS-001", tutor: "Arjun Reddy" }, { id: "BAT-002", name: "DS-AUG-2026", courseId: "CRS-002", tutor: "Meera Nair" }],
  students: [
    { id: "STU-001", name: "Rahul Kumar", courseId: "CRS-001", batchId: "BAT-001", fee: 75000, paid: 50000 },
    { id: "STU-002", name: "Priya Sharma", courseId: "CRS-001", batchId: "BAT-001", fee: 75000, paid: 75000 },
    { id: "STU-003", name: "Aman Verma", courseId: "CRS-002", batchId: "BAT-002", fee: 82000, paid: 42000 },
    { id: "STU-004", name: "Sneha Iyer", courseId: "CRS-002", batchId: "BAT-002", fee: 82000, paid: 82000 },
  ],
  payments: [{ id: "PAY-1001", studentId: "STU-001", amount: 50000, method: "UPI", date: "2026-08-04" }, { id: "PAY-1002", studentId: "STU-002", amount: 75000, method: "Bank Transfer", date: "2026-08-02" }, { id: "PAY-1003", studentId: "STU-003", amount: 42000, method: "Card", date: "2026-08-10" }, { id: "PAY-1004", studentId: "STU-004", amount: 82000, method: "UPI", date: "2026-08-12" }],
  classes: [{ id: "CLS-001", batchId: "BAT-001", title: "React State & Effects", date: "2026-08-17" }, { id: "CLS-002", batchId: "BAT-002", title: "Regression Models", date: "2026-08-17" }],
  attendance: [{ id: "ATT-001", classId: "CLS-001", studentId: "STU-001", status: "Present" }, { id: "ATT-002", classId: "CLS-001", studentId: "STU-002", status: "Late" }, { id: "ATT-003", classId: "CLS-002", studentId: "STU-003", status: "Present" }, { id: "ATT-004", classId: "CLS-002", studentId: "STU-004", status: "Present" }],
};
const clone = (value) => JSON.parse(JSON.stringify(value));
const read = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || clone(initialDemoData); } catch { return clone(initialDemoData); } };
const save = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
export const demoOrganizationStore = {
  getSnapshot: read,
  reset: () => save(clone(initialDemoData)),
  getFinance() { const data = read(); const courses = Array.isArray(data.courses) ? data.courses : []; const batches = Array.isArray(data.batches) ? data.batches : []; const students = Array.isArray(data.students) ? data.students : []; return { courses, batches, payments: Array.isArray(data.payments) ? data.payments : [], students: students.map((student) => ({ ...student, course: courses.find((course) => course.id === student.courseId), batch: batches.find((batch) => batch.id === student.batchId), pending: Math.max(0, Number(student.fee || 0) - Number(student.paid || 0)) })) }; },
  recordPayment({ studentId, amount, method = "UPI" }) { const data = read(); const value = Number(amount); const student = data.students.find((item) => item.id === studentId); if (!student || !Number.isFinite(value) || value <= 0) throw new Error("Select a student and enter a valid amount."); student.paid = Math.min(student.fee, student.paid + value); data.payments.unshift({ id: `PAY-${Date.now()}`, studentId, amount: value, method, date: new Date().toISOString().slice(0, 10) }); save(data); return this.getFinance(); },
  getAttendance() { const data = read(); return data.classes.map((lesson) => ({ ...lesson, batch: data.batches.find((batch) => batch.id === lesson.batchId), students: data.students.filter((student) => student.batchId === lesson.batchId).map((student) => ({ ...student, record: data.attendance.find((record) => record.classId === lesson.id && record.studentId === student.id) })) })); },
  setAttendance({ classId, studentId, status }) { const data = read(); const record = data.attendance.find((item) => item.classId === classId && item.studentId === studentId); if (record) record.status = status; else data.attendance.push({ id: `ATT-${Date.now()}`, classId, studentId, status }); save(data); return this.getAttendance(); },
};
