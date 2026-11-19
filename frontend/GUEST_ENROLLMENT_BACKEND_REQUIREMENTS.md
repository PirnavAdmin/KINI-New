# Guest enrollment integration — backend required

Status: **frontend integration prepared; backend not implemented in this checkout**.
There is no ASP.NET Core project, EF model, SQL migration, Identity implementation,
or production mail service here. `server/demo-payments` is a development simulator.
The endpoints below are a proposed contract, not verified existing API routes.
Do not deploy this flow as complete until they are implemented and tested against
the real backend. Existing authenticated UPI/organization APIs remain in use.

## Anonymous API contract

Use HTTPS. Return JSON (optionally wrapped in `data`). All enrollment amounts must
come from the backend course/fee/coupon policy. Resolve organization from the course;
never accept an organization ID or a payable amount as authority from the browser.

| Method / path | Request | Required response |
| --- | --- | --- |
| `POST /api/v1/guest/enrollments` | `{ courseId, batchId: null or id, acceptedTerms: true, studentDetails: { firstName, lastName, fullName, email, phone, pincode, state, qualification, experience } }`; `Idempotency-Key` header | `{ enrollmentId, accessToken, amount, createdAt }` |
| `GET /api/v1/guest/enrollments/{id}/payment` | `X-Enrollment-Token` | `{ enrollmentId, organizationName, payeeName, upiId, qrCodeUrl, amount, currency: "INR" }` |
| `POST /api/v1/guest/enrollments/{id}/payments` | `X-Enrollment-Token`, `Idempotency-Key`; multipart `UTRNumber`, `PaymentScreenshot` | `{ paymentId, status: "Pending", submittedAt }` |
| `GET /api/v1/guest/enrollments/{id}` | `X-Enrollment-Token` | `{ enrollment: { enrollmentId, enrollmentStatus, paymentStatus, amount, createdAt, approvedAt, rejectionReason }, payment: { paymentId, status, utrNumber, submittedAt, verifiedAt, rejectionReason }, accountReady: boolean, requiresPasswordSetup: boolean }` |
| `POST /api/v1/guest/account-activation/inspect` | `{ token }` | `{ status: "valid" or "used" or "expired", email, firstName }` |
| `POST /api/v1/guest/account-activation` | `{ token, password }` | Success only after the password hash and activation state commit |

Creation saves a pending **application**, not an activated student account. Validate
every student field and terms server-side. Allow null batch when the organization
assigns it on approval. Validate any selected batch belongs to the course and is
available. Snapshot the payable fee and owning organization on the application.

Generate a cryptographically random, per-application bearer capability (at least
256 bits, base64url). Persist only its hash, expiry and revocation metadata. Validate
token, expiry and application ID together on every guest operation; ID alone never
authorizes access. Use constant-time comparison. Keep capability tokens out of logs,
analytics, error bodies and ordinary query strings. The frontend provides a private
status URL containing credentials in its fragment, not a public ID-only URL.
Email this private status link after creation or proof submission so a lost browser
session can recover; configure the public frontend origin on the server. Provide
rate-limited recovery with generic responses and rotate compromised links.

## Staff verification and approval

Reuse the existing `/api/v1/organization/payments/*` review and
`/api/v1/organization/enrollments/*` approval endpoints. Include guest applications
in those queues. Every read, screenshot preview, verify, reject and approve action
must derive the staff organization from authenticated claims and compare it with
the application's owning organization; enforce the existing staff permissions.

Payment review rows/details must include student, course, UTR, submitted amount,
`expectedAmount`, and a private screenshot reference. Screenshot bytes must only be
available through the authorized organization screenshot endpoint. Staff manually
match UTR, amount, recipient and transaction against bank/UPI records; uploaded
proof never implies payment verification. Verified payment is a separate persisted
state and is the prerequisite for entering Student Approvals.

Reject payment with a required reason. Public status returns `payment-rejected`
through a payment status of `Rejected`, permits corrected proof, and retains old
proofs for audit. Prevent new submissions during verification or after verification
unless a staff rejection has explicitly reopened the application.

Approval must lock/re-read the payment and application in one database transaction
and reject if payment is not `Verified`, even when the UI enabled the action.
Create the actual student enrollment only on approval. Reuse an existing student
by normalized email without changing their password. Reject incompatible existing
account roles rather than silently converting them. Create new student Identity
accounts with no usable password until activation. Use the existing account setup
service if available and adapt the frontend activation API adapter to its routes.

On approval return `accountReady: false, requiresPasswordSetup: true` until a new
student completes password setup. Existing active student accounts return readiness
only after enrollment approval. Never infer readiness solely from `Approved`.
Use the same explicit `Verified` payment status in the approval queue; missing or
ambiguous payment status disables approval in the frontend.

## Database and retry safeguards

Add changes through the real repository's EF migrations, not an independent schema:

- Application: immutable course/organization/expected fee; student details; optional
  batch; terms acceptance timestamp/version; workflow state; capability hash/expiry;
  nullable resulting student/enrollment IDs; SQL Server `rowversion`.
- Proof attempts: application FK, normalized UTR, claimed/expected amounts, private
  storage key, content metadata, pending/verified/rejected state, reviewer/remarks
  and timestamps. Preserve audit history on replacement.
- Idempotency ledger: unique operation/scope/key, request hash and committed result.
  Replays with the same payload return the same application/payment/approval;
  changed payload with a reused key returns conflict. Creation retries must recover
  the same guest capability safely (encrypted replay response or equivalent), not
  create a new application. The frontend preserves keys after a lost response and
  issues a new proof key after rejection.
- A database-enforced unique index for normalized **verified** UTRs across
  enrollments (not merely a client check). Serialize verification with the index
  and transaction so simultaneous requests cannot both verify a duplicate.
- Unique normalized student email through Identity, unique final student/course
  enrollment as appropriate to existing enrollment policy, and unique application
  conversion. Handle concurrent existing-account creation by re-reading the winner.
- Approval, student/enrollment creation and activation-email outbox entry commit
  atomically. Use a transactional outbox and retrying mail worker so a mail failure
  cannot create duplicate students/enrollments or lose the activation email.

Do not retry a rejected proof under its previous idempotency key. Do not reset
existing student passwords on approval or repeated approval requests.

## Upload and activation security

Enforce a 5 MB upload limit at the proxy and ASP.NET request/form limits. Accept PNG
and JPEG only after inspecting magic bytes and decoding the image; reject empty,
malformed, oversized-dimension and decompression-bomb files. Do not trust filename,
extension or browser MIME. Strip metadata/re-encode, scan per deployment policy,
use random storage keys, and store outside the web root/private object storage.
Never expose a public screenshot URL. Audit proof access and reviewer actions.

Activation tokens must be cryptographically random or Identity purpose-bound,
single-use and expiring; persist only secure token metadata. Apply server password
policy, rate limits and generic invalid-token responses. Password setup atomically
consumes the token and updates the existing account hash. An existing account is
never reset by this process. Email contains a setup link, never a password.
Configure activation links as `<public-origin>/activate-account?token=...`, exclude
that route from third-party analytics and token logging, and apply no-referrer and
no-store policies. Setup success redirects to the existing `/login` route.

## Deployment configuration and real integration acceptance

- Configure the owning organization's UPI ID, payee name and QR in existing
  Organization Payment Settings. Verify the QR recipient agrees with those settings.
- Configure database migrations/connection, HTTPS frontend/API origins, CORS for
  `X-Enrollment-Token` and `Idempotency-Key`, private screenshot storage, upload
  limits, activation/status token lifetimes, mail sender/provider and outbox worker.
- In a fresh signed-out browser, submit course 5, inspect the correct institute QR
  and backend fee, upload proof, reopen the saved private status link on another
  browser, reject with a reason, correct and resubmit. Verify status remains pending
  until staff manually verifies payment, then pending approval until approval.
- Call approve directly before verification and require rejection. Try other
  organization staff, missing/incorrect/expired capabilities, swapped IDs, malformed
  uploads, duplicate verified UTRs, double-clicks and replayed/lost responses.
- Approve a new email: verify one student/enrollment/outbox event, setup email,
  expiring one-use setup token, password setup, status readiness, automatic login
  redirect and successful login/course access. Repeat with an existing student and
  verify their original password still works. Check retry/concurrency cases in SQL.

Frontend component/API tests use mocks. They do not verify these database, mail,
authorization or real bank verification guarantees. Full signed-out end-to-end
acceptance is blocked until the backend repository and configured services exist.
