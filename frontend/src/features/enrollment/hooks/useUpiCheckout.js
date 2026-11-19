import { useCallback, useEffect, useRef, useState } from "react";
import { getApiErrorMessage } from "@shared/services/apiServices";
import { loadEnrollmentState, upiPaymentApi } from "@shared/services/upiPaymentService";
import { readEnrollmentDraft, updateEnrollmentDraft } from "../utils/enrollmentDraft";
import { guestEnrollmentApi } from "@shared/services/guestEnrollmentApi";
import { readGuestStatusRecords } from "../utils/guestStatusLink";

const POLL_MS = 20000;
const STAGE_ORDER = ["awaiting-payment", "submitted", "verified", "approved"];

const sameCourseSet = (records, courses) => records.length === courses.length
  && courses.every((course) => records.some((record) => String(record.courseId) === String(course.id)));

/** UPI state saved with the enrollment draft, if it belongs to these courses. */
export const readUpiDraft = (courses) => {
  const upi = readEnrollmentDraft()?.upi;
  const linked = readGuestStatusRecords();
  if (linked && sameCourseSet(linked, courses)) return { records: linked, phase: "status" };
  return upi?.records?.length && sameCourseSet(upi.records, courses) ? upi : null;
};

/** One status for several enrollments: any rejection wins, otherwise the least advanced stage. */
const aggregateStage = (stages) => {
  if (stages.includes("enrollment-rejected")) return "enrollment-rejected";
  if (stages.includes("payment-rejected")) return "payment-rejected";
  return stages.reduce((low, stage) => (STAGE_ORDER.indexOf(stage) < STAGE_ORDER.indexOf(low) ? stage : low), "approved");
};

/**
 * Drives the UPI checkout: one backend enrollment per course (POST
 * /enrollments), the QR details and proof submission for each, then status
 * polling until the organization verifies the payment and approves.
 * Enrollment and payment ids are kept in the draft so a refresh resumes
 * instead of creating duplicates.
 */
export default function useUpiCheckout({ enabled, courses, getStudent, onAllSubmitted, guest = false, getBatchId }) {
  const saved = enabled ? readUpiDraft(courses) : null;
  const [records, setRecords] = useState(() => saved?.records ?? courses.map((course) => ({
    courseId: course.id, courseName: course.name, price: Number(course.price) || null,
  })));
  const [phase, setPhase] = useState(saved?.phase === "status" ? "status" : "idle");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [info, setInfo] = useState(null);
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoError, setInfoError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [status, setStatus] = useState({ stage: "submitted", byEnrollment: {}, lastChecked: null, refreshing: false });
  const busyRef = useRef(false);

  const persist = useCallback((nextRecords, nextPhase) => {
    setRecords(nextRecords);
    if (nextPhase) setPhase(nextPhase);
    updateEnrollmentDraft({ upi: { records: nextRecords, phase: nextPhase ?? phase } });
  }, [phase]);

  const current = records.find((record) => record.enrollmentId && !record.paymentId) ?? null;
  const currentIndex = current ? records.indexOf(current) : -1;

  // 1. Create any missing enrollments, one per course.
  const start = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setCreating(true);
    setCreateError("");
    try {
      const student = getStudent();
      const next = records.map((record) => ({ ...record, createKey: record.createKey || crypto.randomUUID() }));
      persist(next);
      for (const [index, record] of next.entries()) {
        if (record.enrollmentId) continue;
        const created = guest
          ? await guestEnrollmentApi.create({ courseId: record.courseId, student, batchId: getBatchId?.(record.courseId), idempotencyKey: record.createKey })
          : await upiPaymentApi.createEnrollment({ courseId: record.courseId, student });
        if (created.id == null || String(created.id).trim() === "") {
          throw new Error("The enrollment was created but the server didn't return its ID. Please contact support before paying.");
        }
        next[index] = { ...record, guestAccessToken: created.guestAccessToken, enrollmentId: created.id, createdAt: created.createdAt || new Date().toISOString(), amount: created.amount ?? record.price };
        persist([...next]);
      }
      const allPaid = next.every((record) => record.paymentId);
      persist(next, allPaid ? "status" : "paying");
      if (allPaid) onAllSubmitted?.(next);
    } catch (error) {
      setCreateError(getApiErrorMessage(error, "We couldn't start your enrollment. Please try again."));
    } finally {
      busyRef.current = false;
      setCreating(false);
    }
  }, [getStudent, onAllSubmitted, persist, records, guest, getBatchId]);

  // 2. QR / UPI details for the enrollment being paid.
  const currentEnrollmentId = current?.enrollmentId;
  const loadInfo = useCallback(async () => {
    if (!currentEnrollmentId) return;
    setInfoLoading(true);
    setInfoError("");
    try {
      const info = current.guestAccessToken
        ? await guestEnrollmentApi.paymentInfo(currentEnrollmentId, current.guestAccessToken)
        : await upiPaymentApi.getPaymentInfo(currentEnrollmentId);
      if (!Number.isFinite(info.amount) || info.amount <= 0 || !info.upiId || !info.payeeName) {
        throw new Error("The institute's UPI payment details or payable amount are incomplete. Please contact the institute before paying.");
      }
      setInfo(info);
    } catch (error) {
      setInfo(null);
      setInfoError(getApiErrorMessage(error, "We couldn't load the institute's UPI details. Please try again."));
    } finally {
      setInfoLoading(false);
    }
  }, [currentEnrollmentId, current?.guestAccessToken]);

  useEffect(() => {
    // Data fetch on entering the payment step (same pattern as other portal pages).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (enabled && phase === "paying" && currentEnrollmentId) loadInfo();
  }, [enabled, phase, currentEnrollmentId, loadInfo]);

  // 3. Proof of payment.
  const submit = useCallback(async ({ utrNumber, screenshot, amount }) => {
    if (!current || busyRef.current) return;
    busyRef.current = true;
    setSubmitting(true);
    setSubmitError("");
    try {
      const paymentDate = new Date().toISOString();
      const payload = {
        utrNumber, amount, paymentDate, paymentMethod: "UPI", screenshot,
      };
      // A proof retry keeps its key until the organization rejects it.
      const proofKey = current.proofKey || crypto.randomUUID();
      persist(records.map((r) => r === current ? { ...r, proofKey } : r));
      const payment = current.guestAccessToken
        ? await guestEnrollmentApi.submit(current.enrollmentId, current.guestAccessToken, payload, proofKey)
        : await upiPaymentApi.submitPayment(current.enrollmentId, payload);
      const next = records.map((record) => (record === current
        ? { ...record, paymentId: payment.id ?? record.paymentId ?? "submitted", utrNumber, submittedAt: payment.submittedAt || paymentDate, rejection: "" }
        : record));
      const allPaid = next.every((record) => record.paymentId);
      persist(next, allPaid ? "status" : "paying");
      if (allPaid) onAllSubmitted?.(next);
      return true;
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "We couldn't submit your payment details. Please check them and try again."));
      return false;
    } finally {
      busyRef.current = false;
      setSubmitting(false);
    }
  }, [current, onAllSubmitted, persist, records]);

  // 4. Status of every submitted enrollment.
  const refreshStatus = useCallback(async () => {
    const tracked = records.filter((record) => record.enrollmentId);
    if (!tracked.length) return;
    setStatus((value) => ({ ...value, refreshing: true }));
    const results = await Promise.allSettled(tracked.map((record) => record.guestAccessToken
      ? guestEnrollmentApi.status(record.enrollmentId, record.guestAccessToken)
      : loadEnrollmentState({
      enrollmentId: record.enrollmentId,
      paymentId: record.paymentId && record.paymentId !== "submitted" ? record.paymentId : null,
    })));
    const byEnrollment = {};
    results.forEach((result, index) => {
      if (result.status === "fulfilled") byEnrollment[tracked[index].enrollmentId] = result.value;
    });
    const stages = Object.values(byEnrollment).map((value) => value.stage);
    setStatus((value) => ({
      stage: stages.length === tracked.length ? aggregateStage(stages) : value.stage,
      byEnrollment: stages.length ? byEnrollment : value.byEnrollment,
      lastChecked: stages.length ? new Date() : value.lastChecked,
      refreshing: false,
      error: stages.length === tracked.length ? "" : "We couldn't check every enrollment status right now. Reopen your private status link or try again.",
      accountReady: results.every((r) => r.status === "fulfilled" && r.value.stage === "approved" && r.value.accountReady === true),
      requiresPasswordSetup: Object.values(byEnrollment).some((value) => value.requiresPasswordSetup),
    }));
  }, [records]);

  const terminal = ["enrollment-rejected", "payment-rejected"].includes(status.stage)
    || (status.stage === "approved" && (!records.some((r) => r.guestAccessToken) || status.accountReady));
  useEffect(() => {
    if (enabled && phase === "status" && status.stage === "awaiting-payment") persist(records, "paying");
  }, [enabled, phase, status.stage, records, persist]);
  useEffect(() => {
    if (!enabled || phase !== "status") return undefined;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshStatus();
    if (terminal) return undefined;
    const timer = window.setInterval(refreshStatus, POLL_MS);
    window.addEventListener("focus", refreshStatus);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refreshStatus);
    };
    // refreshStatus changes with records only; terminal stops the polling.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, phase, terminal]);

  /** Back to the payment form for every enrollment whose payment was rejected. */
  const resubmitRejected = useCallback(() => {
    const next = records.map((record) => {
      const state = status.byEnrollment[record.enrollmentId];
      return state?.stage === "payment-rejected"
        ? { ...record, paymentId: undefined, proofKey: undefined, rejection: state.rejectionReason || "Please check the UTR and screenshot." }
        : record;
    });
    setStatus((value) => ({ ...value, stage: "submitted" }));
    persist(next, "paying");
  }, [persist, records, status.byEnrollment]);

  // The enrollment shown on the status screen: the least advanced one.
  const focusState = Object.values(status.byEnrollment).find((value) => value.stage === status.stage)
    ?? Object.values(status.byEnrollment)[0] ?? null;
  const focusRecord = records.find((record) => String(record.enrollmentId) === String(focusState?.enrollment?.id))
    ?? records.find((record) => record.paymentId) ?? records[0];

  return {
    records,
    phase,
    creating,
    createError,
    start,
    current,
    currentIndex,
    info,
    infoLoading,
    infoError,
    loadInfo,
    submitting,
    submitError,
    submit,
    status,
    refreshStatus,
    resubmitRejected,
    focusRecord,
    focusState,
  };
}
