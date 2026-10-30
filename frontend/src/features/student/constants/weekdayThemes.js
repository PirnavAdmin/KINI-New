import { BookOpen, CalendarDays, Sun } from "lucide-react";

// Per-weekday tone + icon used by the Attendance week strip and the
// Class Schedule month header. Index = Date#getDay() (0 = Sunday).
export const WEEKDAY_THEMES = [
  { short: "Sun", tone: "pink", Icon: CalendarDays },
  { short: "Mon", tone: "red", Icon: Sun },
  { short: "Tue", tone: "blue", Icon: CalendarDays },
  { short: "Wed", tone: "green", Icon: Sun },
  { short: "Thu", tone: "violet", Icon: BookOpen },
  { short: "Fri", tone: "orange", Icon: Sun },
  { short: "Sat", tone: "sky", Icon: CalendarDays },
];

export default WEEKDAY_THEMES;
