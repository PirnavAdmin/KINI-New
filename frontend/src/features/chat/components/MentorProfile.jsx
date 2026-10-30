import PropTypes from "prop-types";
import { motion } from "framer-motion";
import {
  BookOpen,
  BriefcaseBusiness,
  FileText,
  Mail,
  MapPin,
  Phone,
  Clock3,
  MessageSquare,
  Video,
  X,
} from "lucide-react";
import ChatAvatar from "./ChatAvatar";

function InfoRow({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
      <Icon className="h-4.5 w-4.5 shrink-0 text-blue-500" />
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </div>
  );
}

InfoRow.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
};

function FileRow({ file }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
          {file.name}
        </p>
        <p className="mt-0.5 text-xs text-slate-400">
          {(file.type || "file").toUpperCase()} {file.size ? `· ${file.size}` : ""}
        </p>
      </div>
      <FileText className="h-4.5 w-4.5 text-slate-400" />
    </div>
  );
}

FileRow.propTypes = {
  file: PropTypes.object.isRequired,
};

export default function MentorProfile({ person, onClose }) {
  if (!person) {
    return null;
  }

  return (
    <motion.aside
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      className="mentor-profile-panel flex h-full min-h-0 w-full flex-col border-l border-slate-200/80 bg-white/85 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/80"
    >
      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
        <div className="flex items-center justify-end xl:hidden">
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-2xl text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close mentor details"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="flex flex-col items-center text-center">
          <ChatAvatar person={person} size="xl" />
          <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
            {person.name}
          </h2>
          <p className="mt-1 text-sm font-medium text-blue-600 dark:text-cyan-400">
            {person.designation}
          </p>
          <p className="text-sm text-slate-400">{person.company}</p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2">
          {[
            ["Message", MessageSquare],
            ["Call", Phone],
            ["Video", Video],
          ].map(([label, Icon]) => (
            <button
              key={label}
              type="button"
              className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-slate-200 bg-white px-3 py-4 text-sm text-slate-500 transition hover:border-blue-200 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-500/30 dark:hover:text-blue-300"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>

        <section className="mt-5 space-y-2">
          <InfoRow icon={Mail} label={person.email || "Mentor email is not available"} />
          {person.phone ? <InfoRow icon={Phone} label={person.phone} /> : null}
          <InfoRow icon={MapPin} label={person.location} />
          <InfoRow icon={BriefcaseBusiness} label={person.experience} />
        </section>

        {person.skills?.length ? <section className="mt-5 rounded-[1.6rem] border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Skills
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {person.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </section> : null}

        {person.courses?.length ? <section className="mt-5 rounded-[1.6rem] border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            <BookOpen className="h-3.5 w-3.5" />
            Assigned courses
          </h3>
          <div className="mt-3 space-y-2">
            {person.courses.map((course) => (
              <div
                key={course}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200"
              >
                {course}
              </div>
            ))}
          </div>
        </section> : null}

        {person.sharedFiles?.length ? <section className="mt-5 rounded-[1.6rem] border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            <FileText className="h-3.5 w-3.5" />
            Shared files
          </h3>
          <div className="mt-3 space-y-2">
            {person.sharedFiles.map((file) => <FileRow key={file.name} file={file} />)}
          </div>
        </section> : null}

        {person.activity?.length ? <section className="mt-5 rounded-[1.6rem] border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            <Clock3 className="h-3.5 w-3.5" />
            About and availability
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {person.about}
          </p>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            {person.availability}
          </p>
        </section> : null}

        <section className="mt-5 rounded-[1.6rem] border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Recent activity
          </h3>
          <div className="mt-3 space-y-2">
            {person.activity.map((item) => (
              <div
                key={item}
                className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-800/80 dark:text-slate-300"
              >
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>

    </motion.aside>
  );
}

MentorProfile.propTypes = {
  person: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};
