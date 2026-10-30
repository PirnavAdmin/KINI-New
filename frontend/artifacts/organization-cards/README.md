# Organization dashboard card changes

Image 2 is the design reference. Only the Upcoming Classes, Learning Progress,
and Live Class / Current Session row was restyled. No sidebar, navbar, hero,
KPI, analytics, authentication, backend, or dependency files were changed.

## Implementation files

- `src/features/organization/pages/InstituteAdminDashboard.jsx`: connect the
  three-card row to the shared card data helpers and Schedule Class action.
- `src/features/organization/components/dashboard/OrgDashboardSections.jsx`:
  compact clickable class rows, persistent Schedule button, progress summary,
  decorative illustrations, and reference-matched empty states.
- `src/features/organization/components/dashboard/org-dashboard-learning.css`:
  styles scoped to `.odb-row--learning`.
- `src/features/organization/utils/dashboardCards.js`: normalize the card data
  using the existing live-class mapper and Student Profile services.
- `public/assets/Org/dashboard/learning-books.png`: transparent cap/books art.
- `public/assets/Org/dashboard/live-camera.png`: transparent video-camera art.
- `tests/component/OrganizationDashboardCards.test.js`: schedule and learning
  data regressions.
- `artifacts/verify-organization-cards.mjs`: repeatable Playwright checks.

## Layout and screenshot comparison

- Three desktop columns in 35:31:34 proportions, after subtracting gaps.
- All desktop cards measure 424px high with 12px grid gaps.
- Header icons: 40px containers / 20px icons; headings: 16px / 700.
- Class rows: approximately 69px, pastel category icons, subtle separators,
  title/subtitle on the left, date/time on the right, four records maximum.
- Schedule button: 40px; live-class button: 42px.
- Progress donut: 180px at 1440px viewport, approximately 168px at 1280px,
  and 175px at 390px. Ring thickness is approximately 20–21px.
- The learning illustration reserves its own column beside the text. Both
  images use `object-fit: contain` and preserve their transparent backgrounds.
- Mobile cards stack in one column. No zoom or scale fitting is used.

Screenshots are saved beside this report. `before-empty-1440-cards.png` records
the previous implementation. `after-populated-1440-cards.png` shows four class
rows and measured course progress. `after-empty-1280-cards.png` shows the
confirmed-empty state. Each mobile card is captured individually because
this application scrolls inside main rather than the document body.

The browser comparisons use synthetic API fixtures, not production records.
They verify presentation, data mapping, tenant exclusion, 0% empty-state
behavior, and navigation without modifying real enrollments or classes.

## Data issues addressed

The dashboard and Classes page already use `liveClassService.list` and
`normalizeLiveClassList`. The dashboard previously rebuilt timestamps from
date plus HH:mm, losing explicit offsets and seconds. It also discarded
scheduled sessions as soon as their start time passed, even if the session
had not ended, and independently interpreted statuses. The cards now use the
mapper's `startAt`, `endAt`, and lifecycle status, including Live/InProgress
and completed/cancelled aliases. Today's response supplements the full list,
with IDs deduplicated and the existing organization/batch ownership boundary
preserved. Tomorrow's scheduled classes stay in Upcoming Classes rather than
occupying Current Session before their day.

Learning Progress previously read only progress fields on the student list.
It now reuses the Student Profile's existing services:

- `GET /api/StudentBatch/student/{studentId}/enrollments`, whose `courses`
  array is already unwrapped by `studentsApi.getEnrollments`.
- `GET /api/v1/organization/students/{studentId}/progress`, whose object
  includes fields such as `percentage`, not a list response.

The loader matches per-course measurements by courseId, keeps inline primary
course measurements, counts duplicate course rows once, excludes pending,
rejected and other-organization enrollments, and limits concurrent student
requests to four. It never copies one aggregate percentage to every course.
Confirmed zero eligible enrollments produce 0%; missing measurements produce
a dash and an unavailable-count message. Failed optional requests do not
become fabricated zero progress.

No authenticated live tenant browser session was available. Whether the
user's organization currently has upcoming classes or recorded progress
cannot be confirmed from fixture-based verification. No backend defect was
established and no backend changes were made.

## Validation

46 focused tests passed:

```text
npx vitest run tests/component/OrganizationDashboardCards.test.js tests/component/InstituteAdminDashboardApprovals.test.jsx tests/component/OrganizationDashboardRegression.test.jsx --maxWorkers=1 --pool=threads
```

Playwright checks passed at 1440×900, 1280×929, and 390×844 with the default
100% browser zoom. Both populated and empty states were checked for overflow,
image loading, card dimensions, progress display, tenant filtering, and the
Schedule Class form navigation. Browser errors: none. The exact measurements
are in `after-metrics.json`.

The additional active-session browser check was not run because its execution
approval was declined. Active lifecycle mapping is covered by the focused
data tests; no browser-pass claim is made for that additional scenario.

The broader `LiveClassStatusLifecycle.test.jsx` run has three failures in
unchanged `useLiveClasses` behavior: its fixtures provide neither organization
ownership nor batch membership, so the existing ownership filter excludes
them. That suite does not import the changed dashboard files. Its fixture
failures were left outside this card task.

## Illustration generation

Both assets were generated with the built-in image-generation tool and copied
into `public/assets/Org/dashboard/`. Both PNGs are 1254×1254 with alpha channels.
They are decorative and have empty alt text. No runtime image service is used.

Prompt for `learning-books.png`:

> Use case: stylized-concept. Create a single small dashboard decorative illustration: three stacked closed textbooks in soft lavender, periwinkle, pale blue with white cream page edges, a purple graduation mortarboard resting on top, tiny warm golden four-point stars to either side. Soft polished 3D clay render, gentle pastel gradients, rounded forms, front three-quarter view. Similar to a friendly education SaaS empty-state illustration. Isolated on truly transparent background, centered square composition, object fills 88 percent of frame, no floor or backdrop, no text, no letters, no logo, no border. This will be displayed at 125 by 125 pixels.

Prompt for `live-camera.png`:

> Use case: stylized-concept. Create a single small dashboard decorative illustration: a rounded pastel lavender video camera with a large luminous royal-blue rounded-square play button on its front and a crisp white right-pointing triangle. Camera lens hood points to right in pale periwinkle, a small coral rounded recording bar on top, a tiny warm golden star at upper right and subtle peach highlight. Soft polished 3D clay render, gentle pastel gradients, front three-quarter view. Friendly education SaaS live class empty state. Isolated on truly transparent background, centered square composition, object fills 85 percent of frame, no floor or backdrop, no text, no letters, no logo, no border. Display size 135 by 135 pixels.
