# Course poster persistence: missing backend support

The configured live Swagger schema was inspected on 13 November 2026.
`POST /api/v1/courses` accepts courseName, duration, level, price.
`PUT /api/v1/courses/{id}` additionally accepts status. Both disallow extra fields.
The only binary course upload is `POST /api/v1/courses/{id}/upload-pdf` (multipart `file`), which is for syllabus PDFs and must not receive poster images.
No poster/image upload or removal route is documented. No ASP.NET source is present in this workspace.

Backend work required (proposals, not implemented routes):

- Add a nullable poster storage key to the existing course entity and a database migration. Return `posterUrl` in course list/detail/public catalogue responses. Older records should return null.
- Implement authorized multipart poster upload/replacement, for example `POST /api/v1/courses/{id}/poster` with field `file`, and explicit removal such as `DELETE /api/v1/courses/{id}/poster`.
- Enforce existing course-management permissions and organization scope. Validate actual JPEG/PNG/WebP image content and the 5 MB size limit on the server. Generate safe filenames, prevent traversal, and follow existing storage/URL conventions.
- Retain the saved poster when unrelated course details are updated. Replace storage only after the new image persists; clean up obsolete objects safely. Return persisted poster metadata.
- Once deployed, create the course first, retain its returned ID, and upload the chosen poster against that ID. If upload fails, report partial success and retry only the upload, without creating a duplicate course. Keep the existing syllabus PDF operation separate.
- Verify refresh persistence, unchanged edits, replacement, removal, authorization, invalid content/oversize failures, and private storage configuration as applicable. Provide the migration/build commands from the actual ASP.NET solution.

Current frontend changes provide image selection/validation/local preview and a table column that displays returned poster URLs. They intentionally block saving a selected or removed poster rather than claiming that it persisted. Existing course saves without poster changes and syllabus PDFs continue to use the confirmed APIs. No backend migration or end-to-end persistence test can be completed without the backend source and deployed contract.
