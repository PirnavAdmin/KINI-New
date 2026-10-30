# Organization Batches: engineering report

Date: 12 October 2026

The six repository fixes are implemented. Verification used component tests and an isolated browser session with mocked API responses. No production records were changed. Backend source, database and storage code are not part of this repository, so live persistence and server authorization are not verified.

## 1. Header action alignment

**Root cause:** Refresh and Add Batch were rendered in the table toolbar, separately from the page heading. The illustrated header also constrained its copy width, causing actions placed beside the heading to wrap on wide desktops.

**Files:** `src/features/organization/pages/BatchManagement.jsx`, `src/features/organization/pages/batches-density.css`.

**Fix:** Move both buttons into the shared hero title row, retaining their handlers, icons and loading state. Give that row sufficient copy width on wide desktops; allow wrapping on narrow screens.

**Verification:** Component checks for placement and both handlers. Chromium geometry confirms desktop vertical alignment and usable tablet/mobile layouts.

**Status:** FIXED.

## 2. Batch Code table column

**Root cause:** The search used mapped codes, but the table only showed secondary text under the name. Missing values were replaced with generated `BAT-ID` identifiers.

**Files:** `BatchManagement.jsx`, `src/hooks/useBatches.js`, `src/pages/batches/BatchDetail.jsx`.

**Fix:** Add a labeled Batch Code column, update column widths, preserve the existing code aliases, and show `—` for missing values. Remove generated codes from list, detail and edit normalization. Search uses the same mapped value as the column.

**Verification:** API-shaped records with different code properties, missing codes, partial case-insensitive search, refresh and column alignment. Browser confirms the labeled column and actual fixture code.

**Status:** FIXED in the frontend. Whether the live listing API supplies a code for every applicable record remains NOT VERIFIED; no backend schema or field was invented.

## 3. Batch row actions

**Root cause:** Edit/Delete used HR-only action checks; those checks return false for Organization Admin. Employee-module permissions were also incorrectly used as a fallback for batch actions. View already existed.

**Files:** `BatchManagement.jsx`.

**Fix:** Recognize the authenticated Organization Admin role and retain batch-specific permission checks for employees. Keep existing View, Edit and Delete workflows and correct row IDs. No new destructive operation was introduced.

**Verification:** Admin controls render, View links target the right batch, Edit loads the selected record, and employees without batch permissions do not receive edit/delete controls. Browser confirms visible controls.

**Status:** FIXED. Backend authorization enforcement is NOT VERIFIED.

## 4. Past class classification

**Root cause:** Non-lifecycle Scheduled/Upcoming values never expired after their scheduled end. Cached class lists did not update with time. End-time parsing could lose seconds, timezone offsets and overnight boundaries.

**Files:** `src/features/live-classes/utils/liveClassMappers.js`, `src/features/live-classes/utils/dateUtils.js`, `src/features/live-classes/hooks/useLiveClasses.js`, `BatchDetail.jsx`.

**Fix:** Expire ordinary scheduled sessions at the real end timestamp, preserve original backend status for remapping, retain seconds and explicit nonzero offsets, and handle overnight sessions. Batch and Live Classes views re-evaluate the clock and refresh the API every 30 seconds. Upcoming excludes already-started/invalid-start records. Clock-only updates do not trigger attendance requests.

**Existing lifecycle rules preserved:** A class becomes joinable/live only after the backend Start operation. A backend-declared Live class may run beyond its scheduled end until explicitly ended. Cancelled, manually completed, postponed and rescheduled states remain authoritative. No database statuses are changed based on the clock; a server that keeps incorrectly returning Live must be corrected through its lifecycle handling.

**Verification:** Future, start/end boundaries, previous dates, seconds, midnight crossing, offsets, missing/invalid times, cached remapping, open-page expiry, explicit Live after scheduled end, cancellation, completion and late Start regression checks.

**Status:** FIXED for schedule-derived classification and stale frontend cache. Live backend lifecycle correctness is NOT VERIFIED.

## 5. Add Students popup

**Root cause:** The fixed overlay lived inside page layout/transform contexts and used a separate modal implementation. The app's named container token also produced an overly wide desktop dialog.

**Files:** `BatchDetail.jsx`.

**Fix:** Use the shared modal portal with focus trapping, Escape handling, body scroll locking, a 672px responsive maximum width, a scrolling student area and a fixed footer. Preserve student selection, capacity checks and assignment API context; prevent closing while saving.

**Verification:** Portal location, Escape/scroll restoration, selected student and correct batch ID, and centered viewport-contained dialogs at all three browser widths.

**Status:** FIXED in the frontend. Live assignment persistence is NOT VERIFIED.

## 6. Edit Batch popup

**Root cause:** The detail-page form used an inline fixed overlay. The list dialog did not opt into shared focus management. Detail-page saving did not await the API before displaying success, and unmatched existing course/mentor values were absent from the form options.

**Files:** `src/pages/batches/BatchForm.jsx`, `BatchDetail.jsx`, `BatchManagement.jsx`.

**Fix:** Use the shared portal modal for the detail form, with accessible heading, scrollable body and an external submit footer. Enable focus trapping for the list dialog. Preserve existing values, await saving, prevent duplicate submission, retain the form on errors and update displayed details only after success.

**Verification:** Correct initial values, selected batch ID, saving/disabled state, API-error behavior and portal location. Browser checks both list and detail edit dialogs on desktop/tablet/mobile.

**Status:** FIXED in the frontend. Live edit persistence after refresh is NOT VERIFIED.

## Final validation

| Check | Result |
|---|---|
| Header alignment | PASS — Chromium 1440, 768, 390px |
| Batch Code display/search | PASS — API-shaped fixtures and browser |
| Row actions | PASS — component and browser |
| Upcoming/Live classification | PASS — existing manual lifecycle rules preserved |
| Add Students alignment | PASS — browser |
| Add Students functionality | PASS — mocked API association |
| Edit Batch alignment | PASS — both forms, browser |
| Edit Batch save functionality | PASS — mocked save, pending/error states |
| Frontend role/action permissions | PASS |
| Live organization authorization/tenant isolation | NOT VERIFIED |
| Regression tests | PASS — 49 tests across 6 files |
| Type-check | NOT RUN — JavaScript project; no configured type-check script |
| Scoped lint | PASS — all changed JS/JSX files and verification script |
| Production build | PASS — existing @theme/chunk-size warnings remain |
| Live backend persistence | NOT VERIFIED |

## Verification artifacts

- `layout-results.json`: viewport and dialog geometry.
- `list-1440.png`, `list-768.png`, `list-390.png`: header, columns and actions.
- `add-students-*.png`: Add Students dialog.
- `edit-list-*.png`, `edit-details-*.png`: both Edit Batch dialogs.
- `scripts/verify-batch-bugs.mjs`: reproducible isolated browser checks.

Focused tests: `BatchManagementRegression.test.jsx`, `BatchFormDialog.test.jsx`, `BatchDetailStudentsTab.test.jsx`, `BatchDetailAssessmentsTab.test.jsx`, `BatchClassExpiry.test.js`, `LiveClassStatusLifecycle.test.jsx`.

Remaining checks require an authorized live backend session: actual batch-code availability, database persistence after edit/enrollment, server-side permissions and tenant isolation. No new product decision was made about automatic class starts or forced class endings.
