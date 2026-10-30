// ─────────────────────────────────────────────────────────────────────
// Mentor page hero banners
// ─────────────────────────────────────────────────────────────────────
// Source artwork (as supplied):  public/assets/MentorsBnners/*.png
// Web-ready copies used here:    public/assets/MentorsBnners/web/*.webp
//   - fake "checkerboard" / black backgrounds removed → real transparency
//   - trimmed to the artwork and resized to 1500px wide (≈10x smaller)
//
// To swap artwork, drop a new file in public/assets/MentorsBnners and
// point `src` at it. `fallbackSrc` is used if `src` fails to load.
// ─────────────────────────────────────────────────────────────────────

const DIR = "/assets/MentorsBnners";

export const MENTOR_BANNERS = {
  dashboard: {
    src: `${DIR}/web/mentor-dashboard.webp`,
    fallbackSrc: `${DIR}/MentorDashBanner.png`,
    alt: "Mentor working on a laptop at a desk",
  },
  attendance: {
    src: `${DIR}/web/mentor-attendance.webp`,
    fallbackSrc: `${DIR}/MentorMyattencesBnner.png`,
    alt: "Mentor checking in on a laptop",
  },
  leave: {
    src: `${DIR}/web/mentor-leave.webp`,
    fallbackSrc: `${DIR}/MentorleaveReq.png`,
    alt: "Mentor submitting a leave request",
  },
  batches: {
    src: `${DIR}/web/mentor-batches.webp`,
    fallbackSrc: `${DIR}/MentorMyCourcesBanner (2).png`,
    alt: "Mentor managing course batches",
  },
  students: {
    src: `${DIR}/web/mentor-students.webp`,
    fallbackSrc: `${DIR}/MentorMyStudentsbanner.png`,
    alt: "Mentor guiding two students on a laptop",
  },
  studentWorkspace: {
    src: `${DIR}/web/mentor-student-workspace.webp`,
    fallbackSrc: `${DIR}/MentorStudentBanner (2).png`,
    alt: "",
  },
  courses: {
    src: `${DIR}/web/mentor-courses.webp`,
    fallbackSrc: `${DIR}/MentorMyCourcesBanner.png`,
    alt: "Mentor reviewing courses",
  },
};

export default MENTOR_BANNERS;
