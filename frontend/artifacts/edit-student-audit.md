# Edit Student enrollment fix

## Root cause
The form initialized only the primary courseId/batchId from the student list row, rather than fetching all current assignments. The first row remained editable and was sent through the profile PUT, while every subsequent row was treated as an enrollment to POST. The old enrollment response reader could silently convert an unknown response to an empty list, and the create/retry path continued even after an enrollment verification read failed. Course statistics counted only the primary course.

## Implementation files changed
- src/pages/students/StudentForm.jsx: loads the current profile, per-student assignments, and batch memberships; preserves and labels existing assignments; restricts new course choices by canonical ID; validates selected batches; blocks unchanged or invalid saves; shows load and save errors without discarding entries.
- src/pages/students/studentEditEnrollments.js (new): merges assignment sources, preserves the current primary IDs for personal updates, rechecks enrollment before POST, verifies the persisted result even after network errors, and skips assignments confirmed from a previous attempt. Conflicting existing batches are never replaced.
- src/api/students.js: accepts supported list/envelope response shapes, rejects unverifiable or wrong-student responses, and surfaces logical backend enrollment failures returned with HTTP 200.
- src/hooks/useCourses.js: counts unique students across primary and additional memberships and reloads those counts on kini:student-updated. Existing dashboard and batch listeners receive the same event; the parent form callback reloads the student list.

## Live API contract checked
The configured backend returned HTTP 200 for /swagger/v1/swagger.json. Its StudentBatch POST DTO uses batchId and studentIds. UpdateStudentDto uses firstName, lastName, email, phone, courseId, and batchId. The published routes contain no enrollment removal operation, so existing assignments are preserved and cannot be removed through this form.

Reads:
- GET /api/v1/organization/students/{id}
- GET /api/StudentBatch/student/{studentId}/enrollments
- GET /api/StudentBatch/{batchId}/students
- Existing organization course and batch catalogue reads.

Writes:
- PUT /api/v1/organization/students/{id} only when personal details changed, retaining the current primary assignment.
- POST /api/StudentBatch with { batchId, studentIds: [studentId] } only for a new course not present in the verified backend assignments.

## Verification limitation
Authenticated organization data requests returned HTTP 401 and no browser session was connected. No live student record was modified. Real student data flow and server-side atomic uniqueness enforcement cannot be confirmed without authenticated access. The Swagger contract does not document a uniqueness constraint or a duplicate-conflict response; the application handles a 409 when returned and does not treat an unverified rejection as success. The external enrollment backend source is not present in this repository.

## Regression checks
Tests cover primary/additional source merging, canonical IDs and case-varied labels, course-specific batches, duplicate rejection, unchanged saves, personal-detail preservation, repeated saves, partial retries, lost POST responses, backend conflicts, invalid API responses, unavailable enrollment reads, required fields, retired courses, and course-count refresh events.

Validation logs: edit-student-tests-verified.log, edit-student-form-final.log, edit-student-build-verified.log, edit-student-lint-verified.log.

Final results: 71 regression tests passed across 10 suites. After the final roster-source change, all 15 form and seat checks passed across 2 suites. Production build passed. Targeted lint passed with 0 errors and 1 existing React Hook Form compatibility warning.
