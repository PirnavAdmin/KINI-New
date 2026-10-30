# Student count audit

The screenshots compare different populations: the full roster badge (16), a course-filtered table (10), and an additional-membership batch roster (7). Those quantities cannot be treated as interchangeable.

Changes:
- The list badge and summary now use the filtered rows used by pagination; the summary states filtered versus total when they differ. Export uses those same rows.
- The registered total on the organization dashboard uses all registered student records. Inactive is counted directly by status.
- Approval badges, cards, and the dashboard share review grouping, pending status detection, and linked demo-request folding.
- Batch seats combine primary batch assignments and additional StudentBatch memberships, deduplicated by student ID. Unapproved and ended assignments do not occupy seats; inactive assigned members do.
- Configured capacity is respected without a 25-seat cap or an invented capacity when none is reported. Failed roster reads do not advertise available seats. Existing members can still be edited in a full batch.

Live API check: unauthenticated GETs to the configured organization students and batches endpoints both returned HTTP 401. No authenticated browser was connected. Live organization counts have not been verified; regression tests use API-shaped fixtures.

Validation logs: student-count-tests-final.log, student-count-build-final.log, student-count-lint-final.log. The lint error is an existing synchronous setForm call in a StudentsPage effect; the other two diagnostics are existing React Hook Form and TanStack Table compatibility warnings.

Implementation files changed:

- src/pages/students/StudentsPage.jsx
- src/pages/students/StudentList.jsx
- src/pages/students/StudentForm.jsx
- src/pages/students/ApprovalQueue.jsx
- src/pages/students/studentApproval.js
- src/pages/students/studentBatchSeats.js
- src/shared/services/batchService.js
- src/features/organization/pages/InstituteAdminDashboard.jsx

Final regression result: 57 tests passed across 7 suites. Production build passed.
