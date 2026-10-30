// HR portal hero artwork.
// v24 — the supplied HR banners (public/assets/Hr/*.png) cut out to transparent
// WebP in public/assets/Hr/web. `v24: true` switches the hero to the wide,
// right-anchored layout from the Kini HR design screens.
const M = "/assets/MentorsBnners/web";
const K = "/assets/kini-designs";
const H = "/assets/Hr/web";

export const HR_BANNERS = {
  dashboard: { src: `${M}/mentor-leave.webp` },
  employees: { src: `${H}/hr-employees-team.webp`, v24: true },
  batches: { src: `${H}/hr-batches.webp`, v24: true },
  syllabus: { src: `${H}/hr-syllabus.webp`, v24: true },
  students: { src: `${H}/hr-students.webp`, v24: true },
  attendance: { src: `${H}/hr-attendance.webp`, v24: true },
  resources: { src: `${H}/hr-resources.webp`, v24: true },
  // No new artwork supplied for these yet — they keep the design-screen crops.
  leave: { src: `${K}/hr-leave.webp` },
  performance: { src: `${K}/hr-performance.webp` },
  calendar: { src: `${K}/hr-calendar.webp` },
  announcements: { src: `${K}/hr-announcements.webp`, wide: true },
  settings: { src: `${K}/hr-settings.webp`, wide: true },
};
