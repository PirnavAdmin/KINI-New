# Organization UPI routing diagnosis

Checked on 2026-11-17 against the frontend's configured backend:
`https://unguarded-hypnotic-stray.ngrok-free.dev`.
The downloaded public `/swagger/v1/swagger.json` identifies the backend as
`TalentSphereAPI`, version `1.0`; its snapshot is `artifacts/live-swagger.json`.

## Root cause and current behavior

React call chain:
`OrganizationSettingsPage` → `PaymentsTab` → `upiPaymentApi` →
`API_ENDPOINTS.upi.paymentSettings` → shared authenticated `apiClient`.

- Load: `GET /api/v1/organization/payment-settings`.
- First save: `POST /api/v1/organization/payment-settings`.
- Update: `PUT /api/v1/organization/payment-settings`.
- Save body: multipart `UpiId`, `PayeeName`, optional `QrCodeImage`.
- Organization ID is deliberately not supplied by the form. The backend must
  derive it from the authenticated organization/admin claims and permissions.

The live Swagger has **none** of these payment-settings operations, no alternative
UPI settings URL, no UPI settings fields in `UpdateOrganizationDto`, and no UPI
enrollment-payment module. It does expose the Organization-tagged
`GET /api/v1/organization/{id}` with an `int32` path parameter.

Read-only live probes, without modifying any organization:

| GET path | HTTP | Finding |
| --- | --- | --- |
| `/api/v1/organization/payment-settings` | 400 | `errors.id: The value 'payment-settings' is not valid.` |
| `/api/v1/organization/invoice` | 400 | `errors.id: The value 'invoice' is not valid.` |
| `/api/v1/organization/settings/invoice` | 404 | Current Invoice settings URL is absent; different from the single-segment ID collision. |
| `/api/v1/organization/1` | 200 | Existing numeric organization detail request resolves. Response content was not recorded. |

The failing request matches the Organization controller's numeric details route,
then fails automatic integer model binding/validation before its business action
can run. The source method name is not exposed in Swagger (no operationId), so it
cannot be identified more precisely without the controller source. This is a
missing deployed endpoint plus an unconstrained route collision, not invalid UPI
form input. Changing the frontend to another guessed URL would not fix it.

No ASP.NET project, controller source, EF model or migrations are in this checkout.
The `server` directory contains only the development payment simulator. The ngrok
hostname responds, but its upstream process/repository cannot be determined from
the public schema. If another backend has these actions locally, the tunnel must
be repointed/restarted and the **public** Swagger checked again before changing
the frontend contract. No backend source or tunnel configuration was changed.

## Required backend correction — not yet implemented

Keep the frontend's existing contract and add authenticated actions:

| Operation | Route to implement |
| --- | --- |
| Read own organization's UPI settings | `GET /api/v1/organization/payment-settings` |
| Create first settings | `POST /api/v1/organization/payment-settings` |
| Update existing settings | `PUT /api/v1/organization/payment-settings` |

Apply the existing organization authentication and permission policies. Resolve
the organization exclusively from validated claims/membership. Enforce a unique
settings record per organization in SQL. Validate UPI ID/name and QR file contents
on the server; preserve the current QR when the multipart replacement is omitted.
Persist and reload via the same organization scope. Return the saved UPI ID, payee
name and QR reference in the read response. First setup should return `204`/empty
success, or a structured `404` with `code: PAYMENT_SETTINGS_NOT_CONFIGURED`
(`PAYMENT_SETTINGS_NOT_FOUND` is also supported). A generic route 404 is not evidence
that an organization's settings are empty.

In the existing numeric organization details controller, constrain the applicable
attributes to `[HttpGet("{id:int}")]`, `[HttpPut("{id:int}")]` and
`[HttpDelete("{id:int}")]`, retaining their existing bodies and policies. Use the
project's actual attribute conventions. Verify `/organization/1` still reaches the
same action. This constraint only prevents text from matching numeric actions;
it does **not** implement payment settings or invoice settings.

Invoice is separate: current frontend load/save calls are
`GET`/`PUT /api/v1/organization/settings/invoice`. These are not in the live schema.
Existing `/api/v1/invoices` CRUD endpoints manage invoice records, not invoice
preferences; do not substitute them. InvoiceTab currently falls back to local
preview preferences and labels them browser-local. No Invoice route was changed.

## Public enrollment

Guests still enter the payment step without login. The guest adapter expects
`GET /api/v1/guest/enrollments/{id}/payment` with `X-Enrollment-Token`; signed-in
enrollment uses `GET /api/v1/enrollments/{id}/payment`. Neither module is present in
the live Swagger. The backend must join application → course → owning organization
→ payment settings and return that organization's UPI ID/name/QR and backend fee.
Do not use a localStorage organization ID, the admin's current organization, or a
client-provided QR/price for the guest payment response.

The component renders QR/organization/amount from that enrollment-specific API,
not from admin settings in browser storage. Missing or invalid backend amount/UPI
details block proof submission. Real organization QR display cannot be verified
until the backend module exists. See `GUEST_ENROLLMENT_BACKEND_REQUIREMENTS.md` for
the full guest-access contract.

## Frontend fixes and verification limits

- A route collision or missing settings route now shows an unavailable-service
  error instead of presenting it as a student/form validation error or empty setup.
- Empty setup requires a successful empty response or explicit not-configured code.
- Saves reload settings before announcing success. Reload failure is reported
  separately. Read-only forms and repeated in-flight saves are guarded.
- Tests exercise empty setup, multipart POST/PUT, QR retention, reload/remount,
  route-collision/generic-404 errors, authorization errors and reload failure.
- Guest progression, capability-scoped payment-info loading and corrected-proof
  submission remain covered by component/API tests using mocked services.

Live persistence, authenticated organization isolation, QR display from saved
records, and ASP.NET route-constraint changes remain **blocked on backend source**.
The recorded live probes are GET-only and do not verify saving. No production
POST/PUT requests or organization data changes were performed.
