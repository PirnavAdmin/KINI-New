# Two-screen password reset: backend work required

Status: frontend prepared; **backend changes and live account verification blocked**.
This workspace contains no ASP.NET source, Identity implementation or database
migrations. The backend repository and a dedicated test account are required.

## Evidence

The user subsequently supplied the actual successful verification response:

```json
{ "success": true, "message": "OTP verified successfully." }
```

This response has neither a reset token nor a nested `data` envelope. For this
confirmed response, `extractData()` does not discard reset authorization: there is
none in the JSON body. The user also confirmed that the same successful response
has **no `Set-Cookie` header**. Neither token nor reset-session authorization is
issued by this observed response. The shared API client does not enable cross-origin
`withCredentials`, but enabling it cannot create a cookie the server never issues.
This is a confirmed missing backend authorization contract; keep password creation
protected until the backend issues and accepts reset-only authorization.
Tests cover this exact response: generic verification/registration still succeeds,
but password recovery does not fabricate a token or proceed to reset.

On 2026-11-17 the public Swagger at the configured ngrok backend still declares:

- `POST /api/Auth/verify-otp`: `identifier`, `otpType`, `otp`.
- `POST /api/Auth/reset-password`: `identifier`, `otpType`, `otp`, `newPassword`,
  `confirmPassword`. No reset-token request field is documented.
- Verification/reset responses only document HTTP 200, with no response schema.
  Therefore Swagger cannot establish that a valid verification response issues
  reset authorization or a reset-only cookie/session.

The user observed reset returning HTTP 400, `OTP has already been used`, after
successful verification. Previously React saved the verified OTP in sessionStorage
and sent it again to reset. This is consistent with verification consuming the
OTP, but the precise server statement that marks it used cannot be identified
without source or a fresh-OTP trace. Do not claim that server code was inspected.

The shared Axios client has no retry loop or retry library invocation. Both UI
actions are submit handlers; verification's effect only navigates, it does not
call verify again. Verification and reset now use synchronous ref locks, so rapid
submits cannot issue concurrent requests from the same mounted form.

## Proposed coordinated contract (not deployed/confirmed)

Keep generic registration OTP verification separate from password-reset purpose.
For an OTP issued by forgot-password, the verification handler must atomically
validate/consume that OTP and issue reset-only authorization for its account.
Return, in the existing successful response (or its `data` wrapper):

```json
{
  "success": true,
  "resetToken": "<cryptographically-random-reset-only-token>",
  "resetTokenExpiresAt": "<UTC expiration timestamp>"
}
```

The two-screen React flow now requires this explicit `resetToken`. It never treats
a generic authentication `token` or a local verified flag alone as authorization.
Verification without a token reports that password-reset authorization was not
issued and does not send a final reset request. This intentionally fails closed
against the currently incompatible deployment; the complete fix requires rollout
of the backend DTO and handler changes below.

The final request to `POST /api/Auth/reset-password` is:

```json
{
  "identifier": "<verified account email>",
  "resetToken": "<issued reset-only token>",
  "newPassword": "<new password>",
  "confirmPassword": "<same password>"
}
```

No raw OTP or `otpType` is included by the two-screen flow. An isolated
`authService.resetVerifiedPassword` adapter enforces this. The existing legacy
`resetPassword` adapter is retained for other, single-step callers; it must never
be used as a fallback when token authorization fails. The backend must continue
rejecting already-consumed OTPs on any legacy path it retains.

On reset, return an explicit success flag/message only after the database commit.
The frontend rejects HTTP errors and explicit/ambiguous application-level failures
inside HTTP 200. Confirmed success clears the recovery session, displays
`Password updated successfully. Please sign in.` and replaces the current route
with `/Auth/login` or the preserved existing role-specific login route.

## Required ASP.NET / SQL implementation

Adapt the real project's existing Identity, DbContext and transaction conventions:

1. Track OTP purpose (`PasswordReset` versus registration), account ID, expiry,
   hash, attempt limits and consumed time. Atomically claim an unconsumed valid OTP
   during verification and create one reset authorization in the same transaction.
   A concurrent verification/replayed OTP must not issue another authorization.
2. Use at least 256 bits of cryptographic randomness for an opaque reset token.
   Store only its hash with account ID, reset-only purpose, UTC expiration and
   consumed time. Set a short configured lifetime. Bind it to the immutable account
   ID; the request identifier must match that account, never select a different one.
   Do not issue a normal login JWT or grant general authenticated access.
3. Update/extend the reset DTO for `resetToken`. Validate server-side password policy
   and confirmation before changing the account. Validate token hash, purpose,
   account binding, expiry and unused state on every request. Missing/expired/used
   authorization must fail without updating the password.
4. Consume reset authorization and save the password hash/security-stamp changes in
   **one database transaction on the same connection/context**. Use a locked row or
   conditional update such as `ConsumedAt IS NULL AND ExpiresAt > now`, check that
   exactly one row was affected, and keep that transaction open through password
   persistence. Roll back both operations on failure. Merely calling Identity and
   then separately setting `ConsumedAt` permits concurrent resets and is insufficient.
5. Concurrent reset requests for the same token must serialize: one commits and
   subsequent requests fail. Invalidate other reset authorizations for that account
   on completion according to the existing recovery policy. Apply the project's
   session/security-stamp invalidation policy after changing the password.
6. Use generic account/recovery errors and rate limits. Never log request/response
   bodies, passwords, OTPs, reset tokens, cookies or authorization headers. Review
   ASP.NET HTTP logging, exception telemetry and reverse-proxy logging as well as
   controller logging. Log only non-secret outcome/correlation metadata.

## Checks performed / remaining

Frontend tests and the intercepted browser script cover token transfer, no OTP in
the final request, missing token fail-closed, request locks, confirmed success,
expired authorization, recoverable validation/network errors and Back navigation.
These are mocked API responses and do not prove database atomicity or token security.

Still required in the real backend with a dedicated account:

- Obtain a fresh OTP through forgot-password. Verify it exactly once; confirm one
  reset-only authorization is issued and the OTP is consumed at the intended point.
- Reset with that authorization, then sign in with the new password. Confirm the
  old password no longer works and no unexpected verify/reset retry occurred.
- Reject the consumed OTP, wrong-account token, missing token, expired token and
  already-consumed token. Confirm a password-policy failure does not consume a valid
  authorization unless the documented policy explicitly requires it.
- Race two independent reset requests and two verification requests; verify exactly
  one reset/authorization issuance commits. Simulate password persistence failure
  and verify token consumption rolls back with the transaction.
- Inspect logs using correlation metadata without printing any credentials/secrets.

Do not mark the full error fixed until the backend repository is updated, the
ngrok/public schema reflects that deployment, and those live checks pass.
