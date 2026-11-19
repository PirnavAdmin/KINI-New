# HR bug audit — 5 November 2026

This report covers all 31 reported items. Automated tests and browser checks use synthetic API fixtures. Live backend documentation timed out even outside the sandbox. Real employee records were not edited or deleted during verification.

Final checks: **334 tests passed, 0 failed** in the combined HR audit. The production build passed. Lint passed for the 22 changed source files. All three browser verification scripts passed. The strengthened country-code save test also passed after the final metadata-retention adjustment.

| Area | Reported issue | Implemented behavior |
| --- | --- | --- |
| Dashboard 1 | Missing breadcrumb | Dashboard appears in the application header. |
| Dashboard 2 | Approved leave not counted | Approved requests covering today are combined with attendance without double-counting an employee. |
| Dashboard 3 | Overlapping 14-day labels | Responsive tick spacing preserves readable dates. |
| Dashboard 4 | Syllabus tab alignment | Equal alignment, consistent icons, wrapping when needed. |
| Dashboard 5 | Add Employee returns to list | Cancel/success return to the originating HR dashboard. |
| Dashboard 6 | Announcement returns to list | Cancel/success return to the originating HR dashboard. |
| Dashboard 7 | Event returns to calendar | Cancel/success return to the originating HR dashboard. |
| Employees 1 | Name/role search | Searches the complete paginated directory, with shared search rules. |
| Employees 2 | Export toast alignment | One export notification with explicit positioning and layout. |
| Employees 3 | HR card misses records | Includes the supported HR roles and clears conflicting filters. |
| Employees 4 | On Leave card destination | Opens Leave Management. |
| Employees 5 | Edit detail GET returns 404 | The directory row can populate Edit when detail GET is missing. |
| Employees 6 | Edit save resource error | Numeric record identity is retained for PUT; live backend success is unverified. |
| Employees 7 | Invalid status ID | Uses a positive numeric employee record ID; never derives it from user ID or a display code. Live PATCH remains unverified. |
| Employees 8 | Missing employment type | Preserves supplied type and fills an omitted detail field from the exact matching directory record. Actual server persistence remains unverified. |
| Employees 9 | Delete resource error | DELETE uses the verified numeric record ID. Live deletion remains unverified. |
| Batches 1 | Wrong breadcrumb | Home → Batches. |
| Batches 2 | Counts differ across portals | Shared roster loader counts eligible unique students, including primary assignments; failed reads show unavailable. |
| Batches 3 | Dropdown labels clipped | Controls use sufficient intrinsic width and wrap; browser checks cover desktop and mobile. |
| Students 1 | Export toast alignment | Uses the same export notification layout. |
| Students 2 | Status differs across modules | Both normalize boolean/numeric/string account statuses consistently. Live cross-endpoint freshness remains unverified. |
| Attendance 1 | Content touches sidebar | Adds a responsive content gutter. |
| Leave 1 | Balance action empty | Fetches the balance independently of history, resolves supported identifiers, and provides loading/error/retry states. |
| Leave 2 | Content overlaps sidebar | Adds the same responsive content gutter. |
| Performance 1 | History 404 | Falls back to the complete performance collection, scoped to the selected employee. Permission errors remain visible. |
| Performance 2 | Filter dropdown | Supports the returned filter-option shapes and sends the selected API value. |
| Resources 1 | Wrong breadcrumb | Home → Resources. |
| Resources 2 | PDF preview error | Validates returned files, recognizes generic-MIME PDFs, removes the PDF plugin-blocking iframe sandbox, and offers a separate-tab link. |
| Announcements 1 | Unusable checkboxes | Selection appears only when export is permitted. |
| Settings 1 | Country code disappears | Keeps the saved country code when a partial refreshed profile omits it; displays the dialing prefix. |
| Settings 2 | Wrong breadcrumb | Home → Settings. |

Verification artifacts:

- `hr-final-audit.json`: combined HR regression results.
- `hr-build.log`: production build output.
- `scripts/verify-hr-dashboard-fixes.mjs`: header, approved leave, chart labels and responsive tabs.
- `scripts/verify-hr-batch-fixes.mjs`: roster count, breadcrumb, dropdown label widths and overflow.
- `scripts/verify-hr-student-leave-fixes.mjs`: gutters, Balance action and export notification positioning.

Remaining external verification: a reachable backend (or its source) is required to establish actual employee PUT/PATCH/DELETE behavior and saved employment-type persistence. Frontend fallbacks do not repair missing server routes or manufacture saved data.
