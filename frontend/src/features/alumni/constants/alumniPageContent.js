// Copy for the public /alumni page. The alumni backend does not exist yet
// (alumniApi.js serves mock data), so this page describes the alumni areas and
// links to them without showing member counts, names, events or testimonials.
import {
  Award,
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  GraduationCap,
  HeartHandshake,
  Users,
} from "lucide-react";

const ART = "/assets/StudentBanners";

export const ALUMNI_HERO_ART = `${ART}/certificatesBanner.webp`;

export const ALUMNI_HERO_POINTS = [
  { icon: Users, label: "Alumni directory" },
  { icon: CalendarDays, label: "Events" },
  { icon: HeartHandshake, label: "Mentorship" },
  { icon: BriefcaseBusiness, label: "Job board" },
];

export const ALUMNI_AREAS = [
  {
    icon: Users,
    title: "Alumni directory",
    body: "Find and reconnect with people who learned on Kini, by name, role or company.",
    to: "/alumni/directory",
    cta: "Open the directory",
  },
  {
    icon: CalendarDays,
    title: "Events",
    body: "Meet-ups, talks and workshops for the alumni community.",
    to: "/alumni/events",
    cta: "See events",
  },
  {
    icon: HeartHandshake,
    title: "Mentorship",
    body: "Connect with experienced alumni for guidance on your next career move.",
    to: "/alumni/mentorship",
    cta: "Explore mentorship",
  },
  {
    icon: BriefcaseBusiness,
    title: "Job board",
    body: "Openings shared within the alumni community.",
    to: "/alumni/jobs",
    cta: "Browse jobs",
  },
];

export const MENTOR_ART = "/assets/Hr/web/hr-batches.webp";

export const MENTOR_POINTS = [
  "Share what you learned with current learners",
  "Help with interview preparation and career questions",
  "Stay close to the Kini community",
];

export const ALUMNI_JOURNEY = [
  { icon: GraduationCap, title: "Complete your course", body: "Finish your modules, live classes and assessments in the student portal." },
  { icon: Award, title: "Get your certificate", body: "Certificates you earn are listed in your student portal to view and download." },
  { icon: FileText, title: "Keep preparing", body: "The resume builder, interview guides and practice tests stay open to you." },
  { icon: Users, title: "Stay connected", body: "Use the alumni areas to reconnect, find events and share opportunities." },
];
