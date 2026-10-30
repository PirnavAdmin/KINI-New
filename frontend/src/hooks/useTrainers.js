import { getListPayload, getPayload, readableApiMessage } from "@shared/services/apiServices";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import { countUniqueStudents, mentorRosterSummary } from "@/pages/trainers/trainerStudents";
import { useCallback, useEffect, useMemo, useState } from "react";
import { tutorService } from "@shared/services/tutorService";
import { mentorService } from "@shared/services/mentorService";
import { employeeService } from "@shared/services/employeeService";
import { batchService } from "@shared/services/batchService";
import { studentsApi } from "@/api/students";
import { saveManagedMentor } from "@shared/services/managedMentorService";
import { normalizeEmploymentType } from "@shared/utils/employeePresentation";
import { liveClassService } from "@features/live-classes/services/liveClassService";
import { normalizeLiveClassList } from "@features/live-classes/utils/liveClassMappers";

const ASSIGNMENT_STORAGE_KEY = "organization-mentor-course-assignments";
const storedAssignments = () => {
  try {
    const value = JSON.parse(localStorage.getItem(ASSIGNMENT_STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const assignmentMatchesMentor = (assignment = {}, mentor = {}) => {
  const mentorIds = [mentor.id, mentor.mentorId, mentor.tutorId, mentor.employeeId]
    .filter((value) => value != null && value !== "")
    .map(String);
  const assignmentIds = [assignment.mentorId, assignment.tutorId, assignment.employeeId]
    .filter((value) => value != null && value !== "")
    .map(String);
  const emailMatch = assignment.mentorEmail && mentor.email
    && String(assignment.mentorEmail).trim().toLowerCase() === String(mentor.email).trim().toLowerCase();
  const nameMatch = assignment.mentorName && mentor.name
    && String(assignment.mentorName).trim().toLowerCase() === String(mentor.name).trim().toLowerCase();
  return assignmentIds.some((value) => mentorIds.includes(value)) || emailMatch || nameMatch;
};

const DEMO_TRAINERS = [
  { id: "TUT-001", tutorCode: "TUT-001", firstName: "Rahul", lastName: "Reddy", email: "rahul.reddy@kinieduhub.demo", phone: "9876543210", department: "Technology", designation: "Senior Full Stack Mentor", experience: 8, expertise: ["React", "Node.js"], courses: ["React Fundamentals", "Node.js APIs"], batches: 3, todayClass: "React Fundamentals · 10:00 AM", classState: "class", status: "Active" },
  { id: "TUT-002", tutorCode: "TUT-002", firstName: "Priya", lastName: "Sharma", email: "priya.sharma@kinieduhub.demo", phone: "9876543211", department: "Technology", designation: "Backend Mentor", experience: 6, expertise: ["Python", "Django"], courses: ["Python Basics", "Backend Development"], batches: 2, todayClass: "Node.js APIs · 2:00 PM", classState: "soon", status: "Active" },
  { id: "TUT-003", tutorCode: "TUT-003", firstName: "Meera", lastName: "Nair", email: "meera.nair@kinieduhub.demo", phone: "9876543212", department: "Data Science", designation: "Data Science Lead", experience: 9, expertise: ["Python", "Machine Learning"], courses: ["Data Science & AI", "Machine Learning"], batches: 4, todayClass: "Data Science · 6:00 PM", classState: "soon", status: "Active" },
  { id: "TUT-004", tutorCode: "TUT-004", firstName: "Ankit", lastName: "Verma", email: "ankit.verma@kinieduhub.demo", phone: "9876543213", department: "Design", designation: "UI/UX Mentor", experience: 5, expertise: ["Figma", "UX Research"], courses: ["UI/UX Design"], batches: 2, todayClass: "No class today", classState: "free", status: "On Leave" },
  { id: "TUT-005", tutorCode: "TUT-005", firstName: "Kavya", lastName: "Iyer", email: "kavya.iyer@kinieduhub.demo", phone: "9876543214", department: "Business", designation: "Business Analytics Mentor", experience: 7, expertise: ["Power BI", "Analytics"], courses: ["Business Analytics"], batches: 2, todayClass: "Analytics Workshop · 4:00 PM", classState: "class", status: "Active" },
  { id: "TUT-006", tutorCode: "TUT-006", firstName: "Arjun", lastName: "Kumar", email: "arjun.kumar@kinieduhub.demo", phone: "9876543215", department: "Technology", designation: "Java Mentor", experience: 4, expertise: ["Java", "Spring Boot"], courses: ["Java Full Stack"], batches: 0, todayClass: "No class today", classState: "free", status: "Inactive" },
];

const normalize = (item = {}) => {
  const tutorId = item.mentorId ?? item.tutorId ?? item.employeeId ?? item.id;
  const skills = item.expertise ?? item.skills ?? [];
  const rawStatus = item.status ?? (item.isActive ?? item.active);
  const statusText = String(rawStatus ?? "Active").trim().toLowerCase();
  const status = typeof rawStatus === "boolean"
    ? (rawStatus ? "Active" : "Inactive")
    : statusText === "active" || statusText === "enabled" || statusText === "true"
      ? "Active"
      : statusText === "on leave" || statusText === "leave"
        ? "On Leave"
        : "Inactive";
  const courseRows = item.courses ?? item.courseNames ?? item.assignedCourses ?? [];
  const batchRows = item.batches ?? item.batchNames ?? item.assignedBatches ?? [];
  return {
    ...item, id: tutorId, tutorId,
    name: (item.mentorName ?? item.fullName ?? item.name ?? [item.firstName, item.lastName].filter(Boolean).join(" ")) || "Mentor",
    employeeRecordId: item.employeeId ?? item.EmployeeId ?? null,
    employeeId: item.mentorCode ?? item.tutorCode ?? item.employeeCode ?? item.employeeId ?? tutorId,
    email: item.email ?? item.emailAddress ?? "",
    // The organization employee API contract calls this field `phone`.
    // Accept legacy aliases too, but expose one stable value to mentor pages.
    mobile: item.phone ?? item.Phone ?? item.mobile ?? item.Mobile ?? item.mobileNumber ?? item.phoneNumber ?? "",
    department: (typeof item.department === "object" ? item.department?.name : item.department) ?? item.departmentName ?? "",
    designation: item.designation ?? item.roleName ?? item.role ?? "Mentor",
    employmentType: normalizeEmploymentType(item.employeeType ?? item.employmentType),
    skills: Array.isArray(skills) ? skills : String(skills).split(",").map((value) => value.trim()).filter(Boolean),
    courseIds: item.courseIds ?? (Array.isArray(courseRows) ? courseRows.map((course) => course.courseId ?? course.id).filter(Boolean) : []),
    courses: Array.isArray(courseRows) ? courseRows.map((course) => course.courseName ?? course.name ?? course) : [],
    batches: Array.isArray(batchRows)
      ? batchRows.length
      : (Number.isFinite(Number(item.totalBatches ?? item.batchCount ?? item.batches))
          ? Number(item.totalBatches ?? item.batchCount ?? item.batches)
          : 0),
    active: String(status).toLowerCase() === "active",
    status, schedule: item.schedule ?? [],
    todayClass: item.todayClass ?? "No class today",
    classState: item.classState ?? "free",
    experience: Number(item.experience ?? 0),
    students: Number(item.students ?? item.studentCount ?? item.totalStudents ?? 0),
    profilePhoto: item.profilePhoto ?? item.photoUrl ?? item.avatarUrl ?? item.profileImageUrl ?? "",
  };
};

const rowsFrom = (value) => {
  const payload = value?.data?.data ?? value?.data ?? value;
  if (Array.isArray(payload)) return payload;
  return payload?.items ?? payload?.records ?? payload?.results ?? payload?.mentors ?? payload?.employees ?? payload?.batches ?? [];
};

const mentorKey = (item = {}) => String(item.mentorId ?? item.tutorId ?? item.employeeId ?? item.id ?? "").trim();
const isMentor = (item = {}) => /mentor|tutor/i.test(String(item.role ?? item.roleName ?? item.designation ?? item.employeeType ?? item.userRole ?? ""));

const formatClassLabel = (item = {}) => {
  const title = String(item.title ?? item.courseName ?? item.batchName ?? "Class").trim();
  const time = String(item.startTime ?? item.timeLabel ?? item.time ?? "").trim();
  return time ? `${title} - ${time}` : title;
};

const matchesMentorAndClass = (mentor = {}, classItem = {}) => {
  const mentorIds = [
    mentor.id,
    mentor.mentorId,
    mentor.tutorId,
    mentor.employeeId,
  ]
    .filter((value) => value != null && value !== "")
    .map(String);
  const classMentorIds = [
    classItem.mentorId,
    classItem.tutorId,
    classItem.mentor?.mentorId,
    classItem.mentor?.tutorId,
    classItem.mentor?.employeeId,
    classItem.mentor?.id,
  ]
    .filter((value) => value != null && value !== "")
    .map(String);
  if (mentorIds.some((value) => classMentorIds.includes(value))) return true;

  const mentorEmail = String(mentor.email ?? "").trim().toLowerCase();
  const classEmail = String(
    classItem.mentor?.email ??
    classItem.mentorEmail ??
    classItem.tutorEmail ??
    "",
  ).trim().toLowerCase();
  if (mentorEmail && classEmail && mentorEmail === classEmail) return true;

  const mentorName = String(mentor.name ?? "").trim().toLowerCase();
  const className = String(
    classItem.mentorName ??
    classItem.tutorName ??
    classItem.mentor?.name ??
    classItem.mentor?.mentorName ??
    "",
  ).trim().toLowerCase();
  return Boolean(mentorName && className && mentorName === className);
};

const deriveTodayClass = (mentor = {}, liveClasses = []) => {
  const mentorClasses = liveClasses.filter((classItem) => matchesMentorAndClass(mentor, classItem));
  const activeClasses = mentorClasses.filter((classItem) =>
    ["live", "scheduled", "upcoming", "starting-soon"].includes(String(classItem.status ?? "").toLowerCase()),
  );
  if (!activeClasses.length) {
    return { todayClass: "No class today", classState: "free" };
  }

  const classPriority = { live: 0, "starting-soon": 1, scheduled: 2, upcoming: 3 };
  const [nextClass] = [...activeClasses].sort((a, b) => {
    const priorityA = classPriority[String(a.status ?? "").toLowerCase()] ?? 9;
    const priorityB = classPriority[String(b.status ?? "").toLowerCase()] ?? 9;
    if (priorityA !== priorityB) return priorityA - priorityB;
    return String(a.startAt ?? a.startTime ?? "").localeCompare(String(b.startAt ?? b.startTime ?? ""));
  });

  const status = String(nextClass.status ?? "").toLowerCase();
  return {
    todayClass: formatClassLabel(nextClass),
    classState: status === "live" ? "class" : ["scheduled", "upcoming", "starting-soon"].includes(status) ? "soon" : "class",
  };
};

const mergeMentorSources = (catalogueRows, employeeRows, batchRows) => {
  const records = new Map();
  const add = (item) => {
    const key = mentorKey(item) || `email:${String(item.email ?? "").toLowerCase()}`;
    if (!key || key === "email:") return;
    records.set(key, { ...(records.get(key) || {}), ...item });
  };

  catalogueRows.forEach(add);
  // Employee-backed mentors use the employee resource for profile/status edits.
  // Its persisted status must win over an older catalogue snapshot.
  employeeRows.filter(isMentor).forEach(add);

  // A batch response contains enough mentor identity to keep an assigned
  // mentor visible even when the dedicated mentor catalogue is unavailable.
  batchRows.forEach((batch) => {
    const id = batch.mentorId ?? batch.tutorId ?? batch.mentor?.mentorId ?? batch.mentor?.id;
    if (id == null) return;
    add({
      mentorId: id,
      mentorName: batch.mentorName ?? batch.tutorName ?? batch.mentor?.mentorName ?? batch.mentor?.name,
    });
  });

  return [...records.values()].map((record) => {
    const key = mentorKey(record);
    const assignedBatches = batchRows.filter((batch) => String(batch.mentorId ?? batch.tutorId ?? batch.mentor?.mentorId ?? batch.mentor?.id ?? "") === key);
    const assignedCourses = assignedBatches
      .map((batch) => batch.courseName ?? batch.course?.courseName ?? batch.course?.name)
      .filter(Boolean);
    const existingCourses = Array.isArray(record.courses ?? record.courseNames ?? record.assignedCourses)
      ? (record.courses ?? record.courseNames ?? record.assignedCourses)
      : [];
    return normalize({
      ...record,
      courses: [...new Set([...existingCourses.map((course) => course.courseName ?? course.name ?? course), ...assignedCourses])],
      assignedBatches,
      batches: assignedBatches.length || record.totalBatches || record.batchCount || record.batches || 0,
    });
  });
};

// Each mentor-role employee has a separate Mentor profile (the ID batches
// use). The mentor list omits email, so read each profile and link them by
// email; never by ID number or name.
const withMentorProfileIds = async (employees, catalogueRows) => {
  const profiles = await Promise.allSettled(catalogueRows
    .map((row) => row.mentorId ?? row.id)
    .filter((id) => id != null && id !== "")
    // A failed lookup only leaves that mentor ID unlinked; the directory still loads.
    .map((id) => Promise.resolve()
      .then(() => mentorService.getMentor(id))
      .then((profile) => ({ ...getPayload(profile), mentorId: id }))));
  const mentorIdByEmail = new Map();
  profiles.forEach((result) => {
    const email = result.status === "fulfilled" ? String(result.value?.email ?? "").trim().toLowerCase() : "";
    if (!email) return;
    // An email shared by two profiles can't identify either one.
    mentorIdByEmail.set(email, mentorIdByEmail.has(email) ? null : result.value.mentorId);
  });
  return employees.map((employee) => {
    const mentorProfileId = mentorIdByEmail.get(String(employee.email ?? "").trim().toLowerCase());
    return mentorProfileId == null ? employee : { ...employee, mentorProfileId };
  });
};

export default function useTrainers() {
  const isDemo = localStorage.getItem("isDemo") === "true";
  const [trainers, setTrainers] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const [courseOptions, setCourseOptions] = useState([]);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    if (isDemo) { setTrainers(DEMO_TRAINERS.map(normalize)); setLoading(false); return; }
    const [catalogueResult, employeeResult, batchResult, studentResult, courseResult, classResult] = await Promise.allSettled([
      tutorService.list({ pageNumber: 1, pageSize: 1000 }),
      employeeService.getEmployees({ pageNumber: 1, pageSize: 1000 }),
      batchService.getOrganizationBatches({ pageNumber: 1, pageSize: 1000 }),
      studentsApi.list(),
      tutorService.courses(),
      liveClassService.today({ page: 1, pageSize: 1000 }),
    ]);
    const catalogueRows = catalogueResult.status === "fulfilled" ? rowsFrom(catalogueResult.value) : [];
    const employeeRows = employeeResult.status === "fulfilled" ? rowsFrom(employeeResult.value) : [];
    const batchRows = batchResult.status === "fulfilled" ? rowsFrom(batchResult.value) : [];
    const studentRows = studentResult.status === "fulfilled" ? rowsFrom(studentResult.value) : [];
    const courseRows = courseResult.status === "fulfilled" ? rowsFrom(courseResult.value) : [];
    const classRows = classResult.status === "fulfilled" ? normalizeLiveClassList(rowsFrom(classResult.value)) : [];
    setCourseOptions(courseRows);
    // Employee Management is the authoritative organization roster. Use the
    // mentor catalogue only when the employee endpoint is unavailable; merging
    // both creates duplicate/stale mentors with different IDs.
    // Batch rows carry Mentor.MentorId, a different namespace from EmployeeId,
    // so they are never merged into employee rows by ID (that renamed employee
    // 3 after mentor 3). Assigned batches come from the employee-scoped
    // endpoint below instead.
    const employeeMentors = employeeResult.status === "fulfilled"
      ? await withMentorProfileIds(employeeRows.filter(isMentor), catalogueRows)
      : [];
    const merged = employeeResult.status === "fulfilled"
      ? mergeMentorSources([], employeeMentors, [])
      : mergeMentorSources(catalogueRows, [], batchRows);
    // The employee-scoped endpoint owns assignment membership; the general
    // batch catalogue can omit mentor IDs or use a different mentor identifier.
    const assignmentResults = await Promise.allSettled(merged.map(async trainer => {
      const id = trainer.employeeRecordId ?? trainer.id;
      const payload = await employeeService.getEmployeeBatches(id);
      if (payload?.success === false) throw new Error(payload.message || 'Unable to load assigned batches.');
      return getListPayload(payload).map(batch => ({
        ...batch,
        batchId: batch.batchId ?? batch.BatchId ?? batch.id ?? batch.Id,
        batchName: batch.batchName ?? batch.BatchName ?? batch.name,
        courseName: batch.courseName ?? batch.CourseName ?? batch.course?.courseName ?? batch.course?.name,
        status: batch.status ?? batch.Status,
      }));
    }));
    const batchIds = [...new Set(assignmentResults.flatMap(result => result.status === 'fulfilled' ? result.value : []).map(batch => batch.batchId).filter(id => id != null && id !== '').map(String))];
    const rosterResults = await Promise.allSettled(batchIds.map(id => batchService.getStudents(id)));
    const rosters = new Map(rosterResults.flatMap((result, index) => result.status === 'fulfilled' ? [[batchIds[index], result.value]] : []));
    const trainersWithStudents = merged.map((trainer, trainerIndex) => {
      const mentorIds = new Set(
        [trainer.id, trainer.tutorId, trainer.employeeId, trainer.mentorId]
          .filter((value) => value != null && value !== "")
          .map(String),
      );
      const mentorName = String(trainer.name ?? "").trim().toLowerCase();
      const assignmentResult = assignmentResults[trainerIndex];
      const batchesError = assignmentResult.status === 'rejected' ? 'Unable to load assigned batches. Please retry.' : '';
      const mentorBatchRows = assignmentResult.status === 'fulfilled' ? assignmentResult.value : [];
      const mentorBatchIds = new Set(mentorBatchRows.map((batch) => String(batch.batchId ?? batch.id ?? "")).filter(Boolean));
      const mentorBatchNames = new Set(mentorBatchRows.map((batch) => String(batch.batchName ?? batch.name ?? "").trim().toLowerCase()).filter(Boolean));
      const matchedStudents = studentRows.filter((student) => {
        const studentMentorId = student.mentorId ?? student.tutorId ?? student.mentor?.id ?? student.mentor?.mentorId;
        const studentMentorName = String(
          student.mentorName ?? student.tutorName ?? student.mentor?.name ?? student.mentor?.mentorName ?? "",
        ).trim().toLowerCase();
        const studentBatchId = student.batchId ?? student.batch?.batchId ?? student.batch?.id;
        const studentBatchName = String(student.batchName ?? student.batch?.batchName ?? student.batch?.name ?? student.batch ?? "").trim().toLowerCase();
        return (studentMentorId != null && mentorIds.has(String(studentMentorId)))
          || (mentorName && studentMentorName === mentorName)
          || (studentBatchId != null && mentorBatchIds.has(String(studentBatchId)))
          || (studentBatchName && mentorBatchNames.has(studentBatchName));
      });
      const matchedCourseNames = mentorBatchRows
        .map((batch) => batch.courseName ?? batch.course?.courseName ?? batch.course?.name)
        .filter(Boolean);
      const rosterSummary = mentorRosterSummary(mentorBatchRows, rosters);
      const students = batchesError ? null
        : mentorBatchRows.length ? rosterSummary.students
        : studentResult.status === 'fulfilled' ? countUniqueStudents(matchedStudents) : null;
      const { todayClass, classState } = deriveTodayClass(trainer, classRows);
      return {
        ...trainer,
        courses: [...new Set([...(trainer.courses || []), ...matchedCourseNames])],
        batches: batchesError ? null : mentorBatchRows.length,
        batchesError,
        students,
        assignedBatches: rosterSummary.assignedBatches,
        todayClass: trainer.todayClass && trainer.todayClass !== "No class today" ? trainer.todayClass : todayClass,
        classState: trainer.classState && trainer.classState !== "free" ? trainer.classState : classState,
      };
    });
    setTrainers(trainersWithStudents);
    if (catalogueResult.status === "rejected" && employeeResult.status === "rejected" && !merged.length) {
      const requestError = catalogueResult.reason ?? employeeResult.reason;
      setError(requestError?.response?.data?.detail || requestError?.response?.data?.message || "Mentors could not be loaded.");
    }
    setLoading(false);
  }, [isDemo]);
  useEffect(() => { const timer = window.setTimeout(() => load(), 0); return () => window.clearTimeout(timer); }, [load]);
  const saveTrainer = useCallback(async (values, tutorId) => {
    const existing = trainers.find((item) => String(item.id) === String(tutorId));
    if (tutorId != null && !existing) throw new Error("Mentor record is unavailable. Refresh and try again.");
    if (isDemo) {
      const result = normalize({ ...existing, ...values, status: values.active, id: tutorId || "TUT-DEMO-" + Date.now() });
      setTrainers((items) => existing ? items.map((item) => item.id === existing.id ? result : item) : [result, ...items]);
      return result;
    }
    const saved = await saveManagedMentor(existing, values);
    const result = normalize(saved);
    await load();
    return result;
  }, [isDemo, load, trainers]);
  const changeTrainerStatus = useCallback(async (trainer, requestedStatus) => {
    const nextStatus = requestedStatus ?? (trainer.status === "Active" ? "Inactive" : "Active");
    if (!["Active", "Inactive"].includes(nextStatus)) return { ok: false, reason: "Select Active or Inactive." };
    try {
      if (!isDemo) {
        // Employee-backed rows must use the same resource as Edit Mentor;
        // employee IDs and mentor catalogue IDs are separate namespaces.
        if (trainer.employeeRecordId != null) {
          const response = getPayload(await employeeService.getEmployee(trainer.employeeRecordId));
          const current = { ...response, firstName: response?.firstName ?? trainer.firstName, lastName: response?.lastName ?? trainer.lastName, email: response?.email ?? response?.emailAddress ?? trainer.email, phone: response?.phone ?? response?.phoneNumber ?? response?.mobile ?? trainer.mobile, role: response?.role ?? response?.roleName ?? trainer.role ?? "Mentor" };
          if (!current?.firstName || !current?.email || !current?.phone || !current?.role) {
            throw new Error("The employee profile needed to change mentor status is incomplete. Check Edit Mentor and retry.");
          }
          await employeeService.updateEmployee(trainer.employeeRecordId, { ...current, status: nextStatus });
        } else {
          await mentorService.updateMentorStatus(trainer.mentorId ?? trainer.tutorId ?? trainer.id, nextStatus === "Active");
        }
      }
      setTrainers((items) => items.map((item) => item.id === trainer.id
        ? { ...item, active: nextStatus === "Active", status: nextStatus }
        : item));
      return { ok: true, status: nextStatus };
    } catch (error) {
      return { ok: false, reason: readableApiMessage(error?.response?.data)
        || (error?.response?.status === 409 ? "The server did not allow this status change. Check the mentor's current assignments and retry."
          : getApiErrorMessage(error, `Unable to change this mentor to ${nextStatus}.`)) };
    }
  }, [isDemo]);
  const recordAssignment = useCallback((mentor, assignment) => {
    if (!isDemo) { void load(); return; }
    const mentorId = mentor.id ?? mentor.mentorId ?? mentor.tutorId ?? mentor.employeeId;
    const record = {
      ...assignment,
      mentorId,
      employeeId: mentor.employeeId,
      mentorEmail: mentor.email,
      mentorName: mentor.name,
    };
    const previous = storedAssignments().filter((item) => !(
      String(item.mentorId) === String(mentorId)
      && String(item.batchId) === String(record.batchId)
      && String(item.courseId) === String(record.courseId)
    ));
    try {
      localStorage.setItem(ASSIGNMENT_STORAGE_KEY, JSON.stringify([record, ...previous]));
    } catch {
      // The current table can still be updated when browser storage is restricted.
    }
    setTrainers((items) => items.map((trainer) => assignmentMatchesMentor(record, trainer) ? {
      ...trainer,
      courses: [...new Set([...(trainer.courses || []), record.courseName].filter(Boolean))],
      batches: Math.max(Number(trainer.batches || 0), 1),
    } : trainer));
  }, [isDemo, load]);
  const stats = useMemo(() => ({ total: trainers.length, active: trainers.filter((item) => item.status === "Active").length, classesToday: trainers.filter((item) => item.todayClass && item.todayClass !== "No class today").length, onLeave: trainers.filter((item) => item.status === "On Leave").length }), [trainers]);
  return { trainers, courseOptions, loading, error, retry: load, saveTrainer, changeTrainerStatus, recordAssignment, stats };
}
