import { useRef } from "react";
import { AlertTriangle, CalendarDays, ExternalLink } from "lucide-react";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";

const tone = {
  lecture: "border-blue-200 bg-blue-50 text-blue-800",
  lab: "border-emerald-200 bg-emerald-50 text-emerald-800",
  assessment: "border-violet-200 bg-violet-50 text-violet-800",
  meeting: "border-orange-200 bg-orange-50 text-orange-800",
  cancelled: "border-rose-200 bg-rose-50 text-rose-800 opacity-70",
  completed: "border-slate-200 bg-slate-100 text-slate-600",
};

const getDate = (record) => {
  const value = record.date || record.scheduledDate || record.startDate;
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
};
// Vertical scale of the week grid: 1.5px per minute = 90px per hour, with a
// guide line every 20 minutes. Event cards, hour labels and the current-time
// marker all derive from this so they stay aligned.
const PX_PER_MIN = 1.5;
const HOUR_PX = 60 * PX_PER_MIN;
const DAY_START_MIN = 480;
const DAY_END_MIN = 1200;

const getMinutes = (time = "09:00") => {
  const [hours = 9, minutes = 0] = String(time).match(/\d+/g) || [];
  return Number(hours) * 60 + Number(minutes);
};
const getDuration = (record) => {
  const value = Number(record.durationMinutes || record.duration || 90);
  return Number.isFinite(value) && value > 0 ? value : 90;
};
const getType = (record) => {
  if (record.status === "cancelled") return "cancelled";
  if (record.status === "completed") return "completed";
  const name =
    `${record.title || ""} ${record.description || ""}`.toLowerCase();
  if (name.includes("lab")) return "lab";
  if (name.includes("assessment") || name.includes("exam")) return "assessment";
  if (name.includes("meeting")) return "meeting";
  return "lecture";
};

function EventCard({ record, compact, onOpen, layout }) {
  const pointerStart = useRef(null);
  const type = getType(record);
  const conflict =
    record.conflict || record.hasConflict || record.status === "conflict";
  return (
    <button
      type="button"
      onPointerDown={(event) => {
        pointerStart.current = { x: event.clientX, y: event.clientY };
      }}
      onClick={(event) => {
        const start = pointerStart.current;
        const moved = start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6;
        pointerStart.current = null;
        if (!moved) onOpen(record);
      }}
      aria-label={`Open ${record.title}, ${record.startTime || "scheduled class"}, ${record.status || "upcoming"}`}
      className={`absolute overflow-hidden rounded-md border px-1.5 py-0.5 text-left shadow-sm transition hover:z-20 hover:scale-[1.02] hover:shadow-md ${tone[type]}`}
      style={{
        top: `${Math.max(0, (getMinutes(record.startTime) - DAY_START_MIN) * PX_PER_MIN)}px`,
        minHeight: compact ? 26 : Math.max(34, Math.min(getDuration(record), DAY_END_MIN - Math.max(DAY_START_MIN, getMinutes(record.startTime))) * PX_PER_MIN - 4),
        left: layout?.left || 4,
        right: layout?.right || 4,
      }}
    >
      {/* Full-size cards have room for two lines, so text wraps instead of clipping. */}
      <span className={`${compact ? "block truncate" : "line-clamp-2 break-words"} text-[10px] font-bold leading-4`}>
        {record.title || "Untitled class"}
      </span>
      {!compact && (
        <span className="line-clamp-2 break-words text-[9px] leading-3 opacity-80">
          {record.mentorName || record.mentor || "Mentor TBA"} ·{" "}
          {record.batchName || record.batch || "Batch"}
        </span>
      )}
      {record.meetingUrl && (
        <ExternalLink className="absolute right-1 top-1 h-3 w-3" />
      )}
      {conflict && (
        <span className="absolute bottom-1 right-1 inline-flex items-center gap-1 rounded bg-white/90 px-1 py-0.5 text-[9px] font-bold text-rose-700">
          <AlertTriangle className="h-3 w-3" /> Conflict
        </span>
      )}
    </button>
  );
}

export default function ScheduleCalendar({ records, date, view, onOpen }) {
  // A full week (Mon-Sun), matching what the header row and mini calendar
  // both show — this previously stopped at Saturday and never rendered Sunday.
  const week = Array.from({ length: 7 }, (_, index) =>
    addDays(startOfWeek(date, { weekStartsOn: 1 }), index),
  );
  const hours = Array.from({ length: 12 }, (_, index) => index + 8);
  const shown = records.filter((record) =>
    (view !== "day" || isSameDay(getDate(record), date))
      && getMinutes(record.startTime) < DAY_END_MIN
      && getMinutes(record.startTime) + getDuration(record) > DAY_START_MIN,
  );
  const currentMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  if (view === "month") return <Agenda records={records} onOpen={onOpen} desktop />;
  if (view === "day") return <Agenda records={shown} onOpen={onOpen} desktop />;
  return (
    <>
      <div className="md:hidden">
        <Agenda records={shown} onOpen={onOpen} />
      </div>
      <div data-testid="schedule-calendar-grid" className="hidden h-[clamp(360px,60vh,600px)] w-full max-w-full overflow-auto rounded-[12px] border border-[#E1EAF4] bg-white dark:border-slate-700 dark:bg-slate-900 md:block">
        <div className="w-full min-w-[712px]">
          <div className="sticky top-0 z-20 grid grid-cols-[52px_repeat(7,minmax(94px,1fr))] border-b border-[#E1EAF4] bg-white dark:border-slate-700 dark:bg-slate-900">
            <div className="sticky left-0 z-30 border-r border-[#E1EAF4] bg-[#F8FAFD] dark:border-slate-700 dark:bg-slate-900" />
            {week.map((day) => {
              const today = isSameDay(day, new Date());
              return (
                <div
                  key={day.toISOString()}
                  className={`border-l border-[#E5ECF4] px-1.5 py-1.5 text-center leading-tight dark:border-slate-700 ${today ? "border-t-2 border-t-[#FE8204] bg-[#FFF8EA] text-[#B7671A]" : "text-[#5B78A0] dark:text-slate-300"}`}
                >
                  <b className="block text-[11px]">{format(day, "EEE")}</b>
                  <span className="text-[10px]">{format(day, "d MMM")}</span>
                </div>
              );
            })}
          </div>
          <div
            className="relative grid grid-cols-[52px_repeat(7,minmax(94px,1fr))]"
            style={{ height: HOUR_PX * hours.length }}
          >
            <div className="sticky left-0 z-10 border-r border-[#E1EAF4] bg-[#F8FAFD] dark:border-slate-700 dark:bg-slate-900">
              {hours.map((hour) => (
                <span
                  key={hour}
                  style={{ height: HOUR_PX }}
                  className="flex items-start justify-end px-1.5 pt-1 text-right text-[10px] font-medium text-[#426789] dark:text-slate-400"
                >
                  {format(new Date(2026, 0, 1, hour), "h a")}
                </span>
              ))}
            </div>
            {week.map((day) => {
              const today = isSameDay(day, new Date());
              return (
                <div
                  key={day.toISOString()}
                  className={`relative border-r border-[#E5ECF4] bg-[linear-gradient(to_bottom,transparent_29px,#E5ECF4_30px,transparent_31px)] bg-[size:100%_30px] hover:bg-[#F3F8FE]/60 dark:border-slate-700 dark:bg-[linear-gradient(to_bottom,transparent_29px,#334155_30px,transparent_31px)] ${today ? "bg-[#FFF8EA]/65" : ""}`}
                >
                  {shown
                    .filter((record) => isSameDay(getDate(record), day))
                    .map((record, index, dayRecords) => {
                      const start = getMinutes(record.startTime);
                      const end = start + getDuration(record);
                      const overlapping = dayRecords.filter((other) => {
                        const otherStart = getMinutes(other.startTime);
                        const otherEnd = otherStart + getDuration(other);
                        return otherStart < end && otherEnd > start;
                      });
                      // Build stable connected overlap groups so classes that
                      // collide in time receive separate lanes consistently.
                      const group = overlapping;
                      const lane = Math.max(0, group.indexOf(record));
                      const width = 100 / Math.max(1, group.length);
                      return (
                      <EventCard
                        key={record.id}
                        record={record}
                        compact={false}
                        onOpen={onOpen}
                        layout={{ left: `calc(${lane * width}% + 4px)`, right: `calc(${(group.length - lane - 1) * width}% + 4px)` }}
                      />
                      );
                    })}
                  {today &&
                  currentMinutes >= DAY_START_MIN &&
                  currentMinutes <= 1200 ? (
                    <span
                      aria-label="Current time"
                      className="pointer-events-none absolute left-0 right-0 z-30 border-t-2 border-[#F0444F]"
                      style={{ top: `${(currentMinutes - DAY_START_MIN) * PX_PER_MIN}px` }}
                    >
                      <i className="absolute -left-1 -top-[5px] block h-2.5 w-2.5 rounded-full bg-[#F0444F]" />
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

function Agenda({ records, onOpen, desktop = false }) {
  return (
    <div className={`space-y-2 ${desktop ? "" : "md:hidden"}`}>
      {records.length ? (
        records.map((record) => (
          <button
            key={record.id}
            onClick={() => onOpen(record)}
            className="w-full rounded-xl border border-[#E1EAF4] bg-white p-3 text-left shadow-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <b className="text-sm">{record.title}</b>
              <span className="text-xs text-[#5B78A0]">
                {record.startTime || "TBA"}
              </span>
            </div>
            <p className="mt-1 text-xs text-[#5B78A0]">
              {record.mentorName || record.mentor || "Mentor TBA"} ·{" "}
              {record.batchName || record.batch || "Batch"}
            </p>
          </button>
        ))
      ) : (
        <Empty />
      )}
    </div>
  );
}
function Empty() {
  return (
    <div className="grid min-h-64 place-items-center rounded-[14px] border border-dashed border-[#C9D6E6] bg-[#F8FAFD] text-center dark:border-slate-600 dark:bg-slate-800">
      <div>
        <CalendarDays className="mx-auto h-8 w-8 text-[#B7C6D9]" />
        <p className="mt-2 text-sm font-semibold text-[#12365B] dark:text-white">No classes scheduled</p>
        <p className="mt-1 text-xs text-[#5B78A0]">
          Create a class or change your filters.
        </p>
      </div>
    </div>
  );
}
