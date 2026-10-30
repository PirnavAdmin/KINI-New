import { useMemo, useState } from "react";
import {
  BookOpen,
  Clock3,
  Edit3,
  Grid2X2,
  List,
  MoreHorizontal,
  Search,
  Users,
} from "lucide-react";

const statusTone = {
  Published: "bg-emerald-50 text-emerald-700",
  Draft: "bg-amber-50 text-amber-700",
  Archived: "bg-slate-100 text-slate-500",
};
const gradients = [
  "from-blue-600 to-cyan-500",
  "from-violet-600 to-indigo-500",
  "from-pink-500 to-orange-400",
  "from-emerald-600 to-teal-500",
  "from-slate-700 to-blue-600",
];
const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function CourseList({ courses, onEdit, onManage, onArchive }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [status, setStatus] = useState("All statuses");
  const [duration, setDuration] = useState("All durations");
  const [view, setView] = useState("grid");
  const [menu, setMenu] = useState(null);
  const filtered = useMemo(
    () =>
      courses.filter(
        (course) =>
          `${course.name} ${course.code}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (category === "All categories" || course.category === category) &&
          (status === "All statuses" || course.status === status) &&
          (duration === "All durations" || course.duration === duration),
      ),
    [category, courses, duration, query, status],
  );
  const categories = [...new Set(courses.map((course) => course.category))];
  const durations = [...new Set(courses.map((course) => course.duration))];

  return (
    <div className="space-y-3">
      <div className="grid gap-2 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm sm:grid-cols-2 lg:grid-cols-[minmax(260px,1fr)_170px_150px_150px_auto] lg:items-center">
        <label className="relative min-w-0">
          <Search className="absolute left-3 top-2 h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search courses by name or code"
            className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-blue-500 focus:bg-white"
          />
        </label>
        {[
          [
            "Category",
            category,
            setCategory,
            ["All categories", ...categories],
          ],
          [
            "Status",
            status,
            setStatus,
            ["All statuses", "Published", "Draft", "Archived"],
          ],
          ["Duration", duration, setDuration, ["All durations", ...durations]],
        ].map(([label, value, setter, options]) => (
          <select
            aria-label={label}
            key={label}
            value={value}
            onChange={(event) => setter(event.target.value)}
            className="h-8 min-w-0 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs"
          >
            {options.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        ))}
        <div className="flex rounded-lg border border-slate-200 p-1">
          <button
            aria-label="Grid view"
            onClick={() => setView("grid")}
            className={`flex items-center gap-1 rounded px-2.5 py-1.5 text-xs font-semibold ${view === "grid" ? "bg-slate-900 text-white" : "text-slate-500"}`}
          >
            <Grid2X2 className="h-3.5 w-3.5" />
            Grid
          </button>
          <button
            aria-label="List view"
            onClick={() => setView("list")}
            className={`flex items-center gap-1 rounded px-2.5 py-1.5 text-xs font-semibold ${view === "list" ? "bg-slate-900 text-white" : "text-slate-500"}`}
          >
            <List className="h-3.5 w-3.5" />
            List
          </button>
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="grid min-h-72 place-items-center rounded-xl border border-slate-200 bg-white text-center">
          <div>
            <BookOpen className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 font-semibold">No courses found</p>
            <button
              onClick={() => {
                setQuery("");
                setCategory("All categories");
                setStatus("All statuses");
                setDuration("All durations");
              }}
              className="mt-2 text-xs font-semibold text-blue-600"
            >
              Clear filters
            </button>
          </div>
        </div>
      ) : view === "grid" ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course, index) => (
            <CourseCard
              key={course.id}
              course={course}
              color={gradients[index % gradients.length]}
              menu={menu}
              setMenu={setMenu}
              onEdit={onEdit}
              onManage={onManage}
              onArchive={onArchive}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-xs">
              <thead className="bg-slate-50 uppercase tracking-wider text-slate-500">
                <tr>
                  {[
                    "Course",
                    "Category",
                    "Duration",
                    "Fee",
                    "Students",
                    "Batches",
                    "Status",
                    "Actions",
                  ].map((item) => (
                    <th key={item} className="px-4 py-3">
                      {item}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <button
                        onClick={() => onManage(course)}
                        className="font-semibold text-slate-900 hover:text-blue-600"
                      >
                        {course.name}
                      </button>
                      <p className="font-mono text-[10px] text-slate-400">
                        {course.code}
                      </p>
                    </td>
                    <td className="px-4">{course.category}</td>
                    <td className="px-4">{course.duration}</td>
                    <td className="px-4 font-mono">
                      {money.format(course.fee)}
                    </td>
                    <td className="px-4">{course.students}</td>
                    <td className="px-4">{course.batches}</td>
                    <td className="px-4">
                      <span
                        className={`rounded-full px-2 py-1 font-semibold ${statusTone[course.status]}`}
                      >
                        {course.status}
                      </span>
                    </td>
                    <td className="px-4">
                      <button
                        onClick={() => onEdit(course)}
                        className="text-blue-600"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function CourseCard({
  course,
  color,
  menu,
  setMenu,
  onEdit,
  onManage,
  onArchive,
}) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <button
        type="button"
        onClick={() => onManage(course)}
        aria-label={`Open ${course.name}`}
        className={`relative block h-20 w-full bg-gradient-to-br ${color} p-3 text-left text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white`}
      >
        <BookOpen className="h-6 w-6 opacity-90" />
        <span className="absolute bottom-2.5 right-3 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold backdrop-blur">
          {course.code}
        </span>
      </button>
      <div className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3>
              <button
                type="button"
                onClick={() => onManage(course)}
                className="text-left font-semibold text-slate-900 transition hover:text-blue-600 focus:outline-none focus-visible:underline"
              >
                {course.name}
              </button>
            </h3>
            <span className="mt-1 inline-flex rounded bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
              {course.category}
            </span>
          </div>
          <span
            className={`rounded-full px-2 py-1 text-[10px] font-semibold ${statusTone[course.status]}`}
          >
            {course.status}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 border-y border-slate-100 py-2.5 text-xs">
          <span className="flex items-center gap-1.5 text-slate-500">
            <Clock3 className="h-3.5 w-3.5" />
            {course.duration}
          </span>
          <b className="text-right font-mono text-slate-900">
            {money.format(course.fee)}
          </b>
          <span className="flex items-center gap-1.5 text-slate-500">
            <Users className="h-3.5 w-3.5" />
            {course.students} students
          </span>
          <span className="text-right text-slate-500">
            {course.batches} active batches
          </span>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => onEdit(course)}
            className="inline-flex h-8 flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 text-xs font-semibold"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            onClick={() => onManage(course)}
            className="h-8 flex-1 rounded-lg bg-blue-600 text-xs font-semibold text-white"
          >
            Manage
          </button>
          <div className="relative">
            <button
              aria-label="More course actions"
              onClick={() => setMenu(menu === course.id ? null : course.id)}
              className="rounded-lg border border-slate-200 p-2"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menu === course.id && (
              <div className="absolute bottom-10 right-0 z-20 w-36 rounded-lg border bg-white p-1 shadow-xl">
                <button
                  onClick={() => {
                    setMenu(null);
                    onArchive(course);
                  }}
                  className="w-full rounded px-3 py-2 text-left text-xs text-red-600 hover:bg-slate-50"
                >
                  Archive course
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
