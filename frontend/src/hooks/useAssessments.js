import { useCallback, useEffect, useMemo, useState } from "react";
import assessmentService, { normalizeAssessment } from "../services/assessmentService";
import { getMentorDashboardBatches } from "@shared/services/mentorService";
import { batchService } from "@shared/services/batchService";
import { courseService } from "@shared/services/courseService";
import { getApiErrorMessage, getListPayload, readStoredOrganizationId } from "@shared/services/apiServices";

const normalizeBatch = (batch = {}) => ({
  ...batch,
  id: String(batch.batchId ?? batch.id),
  name: batch.batchName ?? batch.name ?? "Unnamed batch",
  subject: batch.courseName ?? batch.subject ?? batch.course?.courseName ?? "Course",
});

const toUiAssessment = (row = {}) => {
  const assessment = normalizeAssessment(row);
  // Prefer the scheduled start timestamp. Created/updated timestamps describe
  // record activity and are not the assessment's scheduled time.
  const scheduledAt = row.startDate ?? row.start ?? row.scheduledAt ?? row.scheduledDate ?? row.date ?? "";
  const scheduledEnd = row.endDate ?? row.end ?? "";
  return {
    ...assessment,
    name: assessment.title,
    batchId: String(row.batchId ?? row.batch?.batchId ?? ""),
    batchName: row.batchName ?? row.batch?.batchName ?? row.batch?.name ?? "",
    type: row.type ?? row.assessmentType ?? "MCQ",
    date: scheduledAt,
    start: scheduledAt,
    end: scheduledEnd,
    total: Number(row.totalMarks ?? row.total ?? 0),
    pass: Number(row.passMarks ?? row.passingMarks ?? row.pass ?? 0),
    attempted: Number(row.attempted ?? row.attemptCount ?? 0),
    passed: Number(row.passed ?? row.passedCount ?? 0),
    status: row.status ?? "Draft",
    questions: Array.isArray(row.questions) ? row.questions : [],
  };
};

export function useAssessments() {
  const organizationScope = String(readStoredOrganizationId() ?? "");
  const [assessments, setAssessments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [audit, setAudit] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [assessmentRows, batchResult, courseResult] = await Promise.all([
        assessmentService.getAssessments(),
        window.location.pathname.startsWith("/organization/")
          ? batchService.getOrganizationBatches({ pageNumber: 1, pageSize: 1000 })
          : getMentorDashboardBatches(),
        courseService.getCourses({ pageSize: 1000 }),
      ]);
      setCourses(getListPayload(courseResult));
      const batchPayload = batchResult?.data ?? batchResult;
      const batchRows = Array.isArray(batchPayload)
        ? batchPayload
        : batchPayload?.batches ?? batchPayload?.items ?? batchPayload?.records ?? batchPayload?.data ?? [];
      const normalizedBatches = (Array.isArray(batchRows) ? batchRows : []).map(normalizeBatch);
      const organizationBatchIds = new Set(normalizedBatches.map((batch) => batch.id));
      const organizationBatchNames = new Set(normalizedBatches.map((batch) => String(batch.name).trim().toLowerCase()));
      const batchByName = new Map(
        normalizedBatches.map((batch) => [String(batch.name).trim().toLowerCase(), batch]),
      );
      setBatches(normalizedBatches);
      const scopedAssessmentRows = (Array.isArray(assessmentRows) ? assessmentRows : []).filter((row) => {
        if (!window.location.pathname.startsWith("/organization/")) return true;
        const rowOrganizationId = row.organizationId ?? row.orgId ?? row.organization?.organizationId ?? row.organization?.id;
        if (rowOrganizationId != null) return organizationScope !== "" && String(rowOrganizationId) === organizationScope;
        const batchId = row.batchId ?? row.batchID ?? row.batch?.batchId ?? row.batch?.id;
        const batchName = String(row.batchName ?? row.batch?.batchName ?? row.batch?.name ?? "").trim().toLowerCase();
        // The legacy assessment endpoint returns a global list without an
        // organization ID. In the organization portal, only retain rows that
        // can be tied to a batch returned for this organization's session.
        return (batchId != null && organizationBatchIds.has(String(batchId)))
          || (batchName !== "" && organizationBatchNames.has(batchName));
      });
      setAssessments(scopedAssessmentRows.map((row) => {
        const assessment = toUiAssessment(row);
        // The Assessment list API currently returns batchName but omits batchId.
        // Resolve that ID from the batch API so display, filters, and edits stay usable.
        const matchedBatch = assessment.batchName
          ? batchByName.get(String(assessment.batchName).trim().toLowerCase())
          : null;
        return {
          ...assessment,
          batchId: assessment.batchId || matchedBatch?.id || "",
          batchName: assessment.batchName || matchedBatch?.name || "",
        };
      }));
    } catch (reason) {
      setError(getApiErrorMessage(reason, "Unable to load assessments."));
    } finally {
      setLoading(false);
    }
  }, [organizationScope]);

  useEffect(() => { refresh(); }, [refresh]);

  const stats = useMemo(() => {
    const attempted = assessments.filter((assessment) => assessment.attempted > 0);
    return {
      total: assessments.length,
      scheduled: assessments.filter((assessment) => String(assessment.status).toLowerCase() === "scheduled").length,
      active: assessments.filter((assessment) => String(assessment.status).toLowerCase() === "active").length,
      completed: assessments.filter((assessment) => ["completed", "results published"].includes(String(assessment.status).toLowerCase())).length,
      passRate: attempted.length
        ? `${Math.round(attempted.reduce((sum, assessment) => sum + (assessment.passed / assessment.attempted) * 100, 0) / attempted.length)}%`
        : "—",
    };
  }, [assessments]);

  return { assessments, setAssessments, audit, setAudit, stats, batches, courses, loading, error, refresh };
}
