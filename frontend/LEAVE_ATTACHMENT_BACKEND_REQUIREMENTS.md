# Leave supporting documents: backend integration blocker

Verified against the configured backend Swagger schema on 13 November 2026.

## Confirmed current API

- `POST /api/v1/leave-requests` accepts JSON `leaveType`, `startDate`, `endDate`, and `reason`. Its schema disallows additional properties. It has no binary attachment field.
- `GET /api/v1/leave-requests/my` returns the mentor's requests.
- `GET /api/hr/leave/{leaveId}` returns HR leave details.
- No leave-specific attachment upload, list, view, download, or delete endpoint is documented.
- Chat attachment APIs and employee-profile document APIs exist, but do not associate a document with a leave request. They must not be used as substitutes.
- This workspace has no ASP.NET `.cs`, `.csproj`, or `.sln` source files.

The frontend cannot persist or authorize access to a medical certificate with this contract. Files selected in the original form were held in React state and omitted from the leave POST. Previously selected files cannot be recovered from those requests.

## Required backend implementation

The following paths are proposals, NOT implemented or callable contracts. Equivalent routes following the backend's conventions are acceptable.

| Operation | Proposed route | Required behavior |
| --- | --- | --- |
| Upload | `POST /api/hr/leave/{leaveId}/attachments` | Multipart `file`; authorize the submitting mentor; link to the exact leave record; return persisted attachment metadata. |
| List | `GET /api/hr/leave/{leaveId}/attachments` | Authorize mentor ownership or scoped HR access; return `items`, including an explicit empty array when none exist. |
| Preview | `GET /api/hr/leave/attachments/{attachmentId}/view` | Authorized binary response with verified MIME type and inline disposition. |
| Download | `GET /api/hr/leave/attachments/{attachmentId}/download` | Authorized binary response with attachment disposition and original filename. |
| Delete | `DELETE /api/hr/leave/attachments/{attachmentId}` | Enforce ownership, scope, and applicable leave-status policy. |

Leave creation must return the persisted leave ID, with the same identifier understood by upload and HR detail routes. Document metadata must contain attachment ID, leave ID, employee ID, original filename, storage key, MIME type, size, upload time, and uploader. Return documented preview/download routes or identifiers; never return storage credentials.

Store medical files privately using the backend's database and storage conventions. Validate PDF/JPEG/PNG content and a configurable 5 MB maximum on the server. Generate storage keys; reject path traversal. Verify document ownership and organization scope on every read/write. Use bearer authentication without tokens in URLs. Define supported errors for 400, 401, 403, 404, 413, 415, and server failures. Upload retries should be idempotent or deduplicated.

## Frontend work after the contract is available

1. Keep current leave validation and duplicate-submit lock. Validate the selected file and create the leave through the existing authenticated client.
2. Retain the returned leave ID; upload the file only on the intended submission. Show upload progress. Confirm success only after persistence succeeds.
3. If creation succeeds but upload fails, retain the leave ID and file, show partial success, and retry only the upload. Do not create another leave.
4. Load documents for the exact leave ID in mentor and HR details; distinguish loading, failure, confirmed empty, and malformed metadata.
5. Fetch protected binary content with the existing Axios client and `responseType: 'blob'`. Preview safe PDF/image blobs, provide sanitized filename downloads, and revoke object URLs on close/unmount.
6. Keep approval/rejection APIs and permission checks unchanged.

## Acceptance checks requiring the backend

Create a request with a PDF, JPEG, and PNG; verify persisted bytes, metadata, and leave association after refreshing both portals. Verify HR preview/download filenames and contents. Verify cross-employee and cross-organization requests are denied. Test invalid content, oversize uploads, network failures, upload-only retries, missing files, and unchanged approval/rejection.

No end-to-end persistence, authorization, or download test can pass until this backend functionality is implemented and deployed. Provide the ASP.NET source workspace and its applicable instructions to implement it; do not fabricate working routes in the frontend.
