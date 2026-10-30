// ─────────────────────────────────────────────────────────────────────
// Student page hero banners (v13)
// ─────────────────────────────────────────────────────────────────────
// Artwork lives in:  public/assets/StudentBanners/
// Each image is the right-side illustration of the banner; the heading,
// description and feature chips are rendered in HTML on the left.
// File names are case-sensitive on Linux/production hosts.
//
//  - src       → banner artwork
//  - alt       → accessible description
//  - position  → CSS object-position when the art is cropped
// ─────────────────────────────────────────────────────────────────────

const BANNER_DIR = "/assets/StudentBanners";

const banner = (file, alt, position = "right center") => ({
  src: `${BANNER_DIR}/${file}`,
  alt,
  position,
});

export const STUDENT_BANNERS = {
  myCourses: banner("myCoursesBanner.webp", "Student learning on a laptop", "right bottom"),
  myBatch: banner("myBatchBanner.webp", "Student attending batch classes", "right bottom"),
  classSchedule: banner("classScheduleBanner.webp", "Student attending a live class"),
  recordings: banner("recordingsBanner.webp", "Student watching a class recording"),
  attendance: banner("attendanceBanner.webp", "Student tracking class attendance"),
  courseMaterials: banner("courseMaterialsBanner.webp", "Student reading course material"),
  assessments: banner("assessmentsBanner.webp", "Student taking an assessment"),
  progress: banner("progressBanner.webp", "Student reviewing learning progress"),
  profile: banner("profileBanner.webp", "Student profile illustration"),
  certificates: banner("certificatesBanner.webp", "Student holding a certificate"),
  settings: banner("settingsBanner.webp", "Student adjusting settings"),
};

export default STUDENT_BANNERS;
