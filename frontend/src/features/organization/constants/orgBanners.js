// ─────────────────────────────────────────────────────────────────────
// Organization page hero artwork
// ─────────────────────────────────────────────────────────────────────
// Source artwork (as supplied): public/assets/Org/*.png
// Web-ready copies:             public/assets/Org/web/*.webp
//   - painted grey "checkerboard" backgrounds removed → real transparency
//   - trimmed and resized to ≤1600px wide (≈10x smaller)
// `fallbackSrc` is used only if the web copy fails to load. It must never be
// a PNG with a painted checkerboard, so every fallback is a transparent file.
//
// To change a banner: drop the PNG in public/assets/Org, export a transparent
// WebP into public/assets/Org/web and point the key below at it.
// Screens marked "shared art" have no dedicated image yet.
// ─────────────────────────────────────────────────────────────────────

const DIR = "/assets/Org";

export const ORG_BANNERS = {
  liveClasses: {
    src: `${DIR}/web/org-live-classes.webp`,
    fallbackSrc: `${DIR}/OrgLiveClass.png`,
    alt: "",
  },
  // Course pages (org course details, student course player) — from
  // OrgCourseDetailsHeroBanner.png.
  courseDetails: {
    src: `${DIR}/web/org-course-details-hero.webp`,
    fallbackSrc: `${DIR}/web/org-course-details.webp`,
    alt: "",
  },
  // Organization dashboard — from OrgDashBordHeroBanner.png.
  dashboard: {
    src: `${DIR}/web/org-dashboard-hero.webp`,
    fallbackSrc: `${DIR}/OrgDashBordHeroBanner.png`,
    alt: "",
  },
  // Dialog headers (ModalHero).
  addStudent: { src: `${DIR}/web/org-add-student.webp`, alt: "" },
  addEmployee: { src: `${DIR}/web/org-add-employee.webp`, alt: "" },
  addAttendance: { src: `${DIR}/web/org-add-attendance.webp`, alt: "" },
  createAssessment: { src: `${DIR}/web/org-create-assessment.webp`, alt: "" },
  // No dedicated Add Batch art was supplied; the attendance artwork (same
  // character with calendar + checklist) is the closest match.
  addBatch: { src: `${DIR}/web/org-add-attendance.webp`, alt: "" },
  invoice: {
    src: `${DIR}/web/org-invoice.webp`,
    fallbackSrc: `${DIR}/OrgInvoice.png`,
    alt: "",
  },
  // No dedicated batch-management illustration was supplied with the v14
  // design; this is the closest existing batch artwork.
  batches: {
    src: `${DIR}/web/org-batch-management.webp`,
    fallbackSrc: `${DIR}/orgBatchMenagementBanner.png`,
    alt: "",
  },
  // v14 — from OrgCourseMaterialsHeroBanner.png.
  courseMaterials: {
    src: `${DIR}/web/org-course-materials.webp`,
    fallbackSrc: `${DIR}/web/org-batch-management.webp`,
    alt: "",
  },
  // v14 — boy + girl assessments board, from OrgAssessmentsHeroBanner.png
  // (already transparent; trimmed and resized).
  assessments: {
    src: `${DIR}/web/org-assessments-management.webp`,
    fallbackSrc: `${DIR}/OrgAssessmentsHeroBanner.png`,
    alt: "",
  },
  // Full-resolution PNG of OrgStudentsManagementHeroBanner.png with the
  // painted checkerboard removed (real transparency). The original PNG is kept.
  students: {
    src: `${DIR}/OrgStudentsManagementHeroBanner-transparent.png`,
    fallbackSrc: `${DIR}/web/org-students-management.webp`,
    alt: "",
  },
  // Shared art — no dedicated image supplied yet. Same artwork as `batches`,
  // served as its 292 KB WebP (the 1.8 MB PNG loaded visibly slowly).
  studentProfile: {
    src: `${DIR}/web/org-batch-management.webp`,
    fallbackSrc: `${DIR}/orgBatchMenagementBanner.png`,
    alt: "",
  },
  // Full-resolution PNG of OrgMentorManagementHeroBanner.png with the painted
  // checkerboard removed (real transparency, complete artwork incl. desk).
  mentors: {
    src: `${DIR}/OrgMentorManagementHeroBanner-transparent.png`,
    fallbackSrc: `${DIR}/web/org-course-details.webp`,
    alt: "",
  },
  // v14 — from OrgEmployeeManagementHeroBanner.png (checkerboard removed).
  employees: {
    src: `${DIR}/web/org-employee-management.webp`,
    fallbackSrc: `${DIR}/web/org-course-details.webp`,
    alt: "",
  },
  // v14 — from OrgAttendanceManagementHeroBanner.png (checkerboard removed).
  attendance: {
    src: `${DIR}/web/org-attendance-management.webp`,
    fallbackSrc: `${DIR}/web/org-employee-management.webp`,
    alt: "",
  },
  // v19 profile heroes. `src: null` keeps the built-in drawn decoration
  // (skyline, graduation cap, books). To use artwork instead, drop a PNG in
  // public/assets/Org/ and set src, e.g. `${DIR}/orgEmployeeProfileBanner.png`.
  employeeProfile: { src: null, alt: "" },
  mentorProfile: { src: null, alt: "" },
  batchDetail: { src: null, alt: "" },
};

export default ORG_BANNERS;
