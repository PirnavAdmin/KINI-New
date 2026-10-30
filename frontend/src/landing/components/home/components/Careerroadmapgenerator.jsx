import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import CreatableSelect from "react-select/creatable";
import Select from "react-select";
import { useThemeContext } from "@landing-shared/context/ThemeContext";
import {
  Rocket,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Loader2,
  Award,
  Briefcase,
  Target,
  Code2,
  FileJson,
  GitBranch,
  Atom,
  RefreshCcw,
  Wind,
  Server,
  Database,
  Terminal,
  Layers,
  Coffee,
  Boxes,
  Brain,
  Cloud,
  Link2,
  LineChart,
  FolderGit2,
  Star,
  Clock,
  ShieldCheck,
  Milestone,
  BadgeCheck, // ✅ added
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Data – Curricula per role                                         */
/* ------------------------------------------------------------------ */

const SKILL_LIBRARY = {
  "HTML & CSS": { icon: Code2, baseWeeks: 2 },
  JavaScript: { icon: FileJson, baseWeeks: 4 },
  "Git & GitHub": { icon: GitBranch, baseWeeks: 1 },
  "React JS": { icon: Atom, baseWeeks: 6 },
  "Redux Toolkit": { icon: RefreshCcw, baseWeeks: 2 },
  "Tailwind CSS": { icon: Wind, baseWeeks: 2 },
  "Node.js": { icon: Server, baseWeeks: 4 },
  "Express & MongoDB": { icon: Database, baseWeeks: 4 },
  "REST APIs": { icon: Link2, baseWeeks: 2 },
  "SQL & Databases": { icon: Database, baseWeeks: 2 },
  "Python Core": { icon: Terminal, baseWeeks: 3 },
  "OOP & Advanced Python": { icon: Coffee, baseWeeks: 3 },
  "Django / Flask": { icon: Layers, baseWeeks: 4 },
  "Java Core": { icon: Coffee, baseWeeks: 4 },
  "Spring Boot": { icon: Boxes, baseWeeks: 4 },
  "Machine Learning": { icon: Brain, baseWeeks: 6 },
  "Deep Learning": { icon: Sparkles, baseWeeks: 4 },
  "Data Analysis": { icon: LineChart, baseWeeks: 4 },
  "Cloud Fundamentals (AWS)": { icon: Cloud, baseWeeks: 4 },
  "DevOps & CI/CD": { icon: GitBranch, baseWeeks: 3 },
  Projects: { icon: FolderGit2, baseWeeks: 4 },
  "Interview Prep": { icon: Target, baseWeeks: 2 },
  "Career Prep": { icon: Briefcase, baseWeeks: 1 },
  "Practice & Revision": { icon: RefreshCcw, baseWeeks: 2 },
};

const ROLE_CURRICULUM = {
  "React JS Developer": [
    "HTML & CSS",
    "JavaScript",
    "Git & GitHub",
    "React JS",
    "Redux Toolkit",
    "Tailwind CSS",
    "REST APIs",
    "Projects",
    "Interview Prep",
    "Career Prep",
  ],
  "Frontend Developer": [
    "HTML & CSS",
    "JavaScript",
    "Git & GitHub",
    "React JS",
    "Tailwind CSS",
    "Projects",
    "Interview Prep",
    "Career Prep",
  ],
  "MERN Stack Developer": [
    "HTML & CSS",
    "JavaScript",
    "Git & GitHub",
    "React JS",
    "Node.js",
    "Express & MongoDB",
    "Redux Toolkit",
    "Projects",
    "Interview Prep",
    "Career Prep",
  ],
  "Full Stack Developer": [
    "HTML & CSS",
    "JavaScript",
    "Git & GitHub",
    "React JS",
    "Node.js",
    "Express & MongoDB",
    "REST APIs",
    "SQL & Databases",
    "Projects",
    "Interview Prep",
    "Career Prep",
  ],
  "Python Developer": [
    "Python Core",
    "OOP & Advanced Python",
    "SQL & Databases",
    "Django / Flask",
    "REST APIs",
    "Projects",
    "Interview Prep",
    "Career Prep",
  ],
  "Java Developer": [
    "Java Core",
    "SQL & Databases",
    "Spring Boot",
    "REST APIs",
    "Projects",
    "Interview Prep",
    "Career Prep",
  ],
  "AI Engineer": [
    "Python Core",
    "OOP & Advanced Python",
    "SQL & Databases",
    "Machine Learning",
    "Deep Learning",
    "Projects",
    "Interview Prep",
    "Career Prep",
  ],
  "Data Scientist": [
    "Python Core",
    "SQL & Databases",
    "Data Analysis",
    "Machine Learning",
    "Git & GitHub",
    "Projects",
    "Interview Prep",
    "Career Prep",
  ],
  "Cloud Engineer": [
    "Python Core",
    "Git & GitHub",
    "Cloud Fundamentals (AWS)",
    "DevOps & CI/CD",
    "SQL & Databases",
    "Projects",
    "Interview Prep",
    "Career Prep",
  ],
};

const ADVANCED_MODULES = {
  "React JS Developer": ["Advanced React", "Next.js", "TypeScript"],
  "Frontend Developer": ["TypeScript", "Next.js"],
  "MERN Stack Developer": ["TypeScript", "Docker"],
  "Full Stack Developer": ["TypeScript", "Docker", "GraphQL"],
  "Python Developer": ["Data Structures", "Algorithms", "Docker"],
  "Java Developer": ["Docker", "Microservices"],
  "AI Engineer": ["NLP", "Computer Vision"],
  "Data Scientist": ["Big Data", "Spark"],
  "Cloud Engineer": ["Kubernetes", "Terraform"],
};

const ROLE_META = {
  "React JS Developer": { icon: Atom, tone: "from-primary-500 to-secondary-500" },
  "Frontend Developer": { icon: Code2, tone: "from-primary-400 to-primary-600" },
  "MERN Stack Developer": { icon: Layers, tone: "from-secondary-500 to-primary-500" },
  "Full Stack Developer": { icon: Boxes, tone: "from-primary-600 to-secondary-600" },
  "Python Developer": { icon: Terminal, tone: "from-secondary-400 to-secondary-600" },
  "Java Developer": { icon: Coffee, tone: "from-secondary-600 to-primary-700" },
  "AI Engineer": { icon: Brain, tone: "from-primary-500 to-primary-700" },
  "Data Scientist": { icon: LineChart, tone: "from-secondary-500 to-secondary-700" },
  "Cloud Engineer": { icon: Cloud, tone: "from-primary-400 to-secondary-500" },
};

const roadmapConfig = {
  currentRoles: [
    "Student",
    "Fresher",
    "Frontend Developer",
    "Backend Developer",
    "QA Engineer",
    "Support Engineer",
    "Working Professional",
  ],
  targetRoles: Object.keys(ROLE_META),
  companies: [
    "Google",
    "Microsoft",
    "Amazon",
    "Meta",
    "Apple",
    "Netflix",
    "Adobe",
    "Oracle",
    "Salesforce",
    "TCS",
    "Infosys",
    "Wipro",
    "Accenture",
    "Capgemini",
    "Startup",
  ],
  timelines: ["3 Months", "6 Months", "9 Months", "12 Months"],
  learningModes: ["Live", "Recorded", "Hybrid"],
  studyHours: ["1 Hour", "2 Hours", "4 Hours", "Weekend Only"],
};

const AVATAR_TONES = [
  "from-primary-500 to-primary-700",
  "from-secondary-400 to-secondary-600",
  "from-primary-400 to-secondary-500",
  "from-secondary-500 to-primary-600",
  "from-primary-600 to-primary-800",
  "from-secondary-600 to-secondary-800",
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function initials(label) {
  return label
    .replace(/\(.*?\)/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function toneFor(label) {
  let hash = 0;
  for (let i = 0; i < label.length; i++) hash = (hash * 31 + label.charCodeAt(i)) >>> 0;
  return AVATAR_TONES[hash % AVATAR_TONES.length];
}

function getBaseWeeks(name) {
  if (name.startsWith("Project")) return 4;
  if (name === "Practice & Revision") return 2;
  return SKILL_LIBRARY[name]?.baseWeeks || 2;
}

function getIcon(name) {
  if (name.startsWith("Project")) return FolderGit2;
  return SKILL_LIBRARY[name]?.icon || Sparkles;
}

/* ------------------------------------------------------------------ */
/*  Roadmap Generation Logic                                          */
/* ------------------------------------------------------------------ */

function generateRoadmap({ currentRole, targetRole, experience, dailyHours, learningPreference, targetTimeline }) {
  const timelineWeeksMap = { "3 Months": 12, "6 Months": 24, "9 Months": 36, "12 Months": 48 };
  const totalWeeksAvailable = timelineWeeksMap[targetTimeline] || 24;

  const isWeekend = dailyHours === "Weekend Only";
  const hoursFactor = isWeekend ? 0.7 : dailyHours === "1 Hour" ? 0.6 : dailyHours === "2 Hours" ? 0.8 : 1.0;

  let curriculum = [...(ROLE_CURRICULUM[targetRole] || [])];

  const beginnerModules = ["HTML & CSS", "JavaScript", "Git & GitHub", "Python Core", "Java Core"];
  if (experience >= 3) {
    curriculum = curriculum.filter((name) => !beginnerModules.includes(name));
  }

  let projectCount;
  if (totalWeeksAvailable <= 12) projectCount = 1;
  else if (totalWeeksAvailable <= 24) projectCount = 2;
  else if (totalWeeksAvailable <= 36) projectCount = 3;
  else projectCount = 4;
  if (hoursFactor < 0.7) projectCount = Math.max(1, projectCount - 1);
  const maxProjects = Math.floor(totalWeeksAvailable / 8);
  projectCount = Math.min(projectCount, maxProjects);

  let modules = [];
  const skills = curriculum.filter((name) => name !== "Projects");
  modules.push(...skills);

  const advanced = ADVANCED_MODULES[targetRole] || [];
  const extraCount = totalWeeksAvailable > 24 ? (totalWeeksAvailable > 36 ? 3 : 2) : 1;
  for (let i = 0; i < Math.min(extraCount, advanced.length); i++) {
    if (!modules.includes(advanced[i])) modules.push(advanced[i]);
  }

  if (!modules.includes("Interview Prep")) modules.push("Interview Prep");
  if (!modules.includes("Career Prep")) modules.push("Career Prep");
  if (totalWeeksAvailable > 24) {
    modules.push("Practice & Revision");
  }

  const projectItems = [];
  const projectNames = ["Project 1: Foundation", "Project 2: Intermediate", "Project 3: Advanced", "Project 4: Capstone"];
  for (let i = 0; i < projectCount; i++) {
    projectItems.push({
      name: projectNames[i] || `Project ${i + 1}`,
      icon: FolderGit2,
      weeks: Math.max(3, Math.round(4 * hoursFactor)),
      isProject: true,
    });
  }

  const skillModules = modules.filter(
    (name) => !["Interview Prep", "Career Prep", "Practice & Revision"].includes(name)
  );
  const otherModules = modules.filter((name) =>
    ["Interview Prep", "Career Prep", "Practice & Revision"].includes(name)
  );

  let finalItems = [];
  const splitIndex = Math.min(skillModules.length, Math.floor(skillModules.length * 0.6));
  finalItems.push(...skillModules.slice(0, splitIndex));
  if (projectItems.length > 0) {
    finalItems.push(...projectItems);
  }
  finalItems.push(...skillModules.slice(splitIndex));
  finalItems.push(...otherModules);

  const itemDetails = finalItems.map((item) => {
    let name = item;
    let isProject = false;
    let weeks = 0;
    if (typeof item === "object" && item.isProject) {
      isProject = true;
      name = item.name;
      weeks = item.weeks;
    } else {
      weeks = getBaseWeeks(name);
    }
    return { name, isProject, weeks, icon: isProject ? FolderGit2 : getIcon(name) };
  });

  const sumBase = itemDetails.reduce((sum, d) => sum + d.weeks, 0);
  const scale = Math.min(1.2, totalWeeksAvailable / sumBase);
  let adjustedItems = itemDetails.map((d) => ({
    ...d,
    weeks: Math.max(1, Math.round(d.weeks * scale)),
  }));

  let totalAdjusted = adjustedItems.reduce((s, d) => s + d.weeks, 0);
  let diff = totalWeeksAvailable - totalAdjusted;
  if (diff !== 0) {
    for (let i = adjustedItems.length - 1; i >= 0; i--) {
      const item = adjustedItems[i];
      if (!item.isProject && !["Interview Prep", "Career Prep"].includes(item.name)) {
        const newWeeks = Math.max(1, item.weeks + diff);
        diff -= newWeeks - item.weeks;
        item.weeks = newWeeks;
        if (diff === 0) break;
      }
    }
    if (diff !== 0) {
      const last = adjustedItems[adjustedItems.length - 1];
      last.weeks = Math.max(1, last.weeks + diff);
    }
  }

  const phases = [];
  const phaseNames = ["Foundation", "Core", "Advanced", "Projects & Practice", "Interview & Career"];
  let phaseIndex = 0;
  let currentPhase = { name: phaseNames[0], items: [] };
  let phaseWeeks = 0;
  const targetPhaseWeeks = totalWeeksAvailable / phaseNames.length;

  adjustedItems.forEach((item) => {
    if (phaseWeeks + item.weeks > targetPhaseWeeks * 1.3 && phaseIndex < phaseNames.length - 1) {
      if (currentPhase.items.length > 0) {
        phases.push({ ...currentPhase, totalWeeks: phaseWeeks });
      }
      phaseIndex++;
      currentPhase = { name: phaseNames[phaseIndex] || "Additional", items: [] };
      phaseWeeks = 0;
    }
    currentPhase.items.push(item);
    phaseWeeks += item.weeks;
  });
  if (currentPhase.items.length > 0) {
    phases.push({ ...currentPhase, totalWeeks: phaseWeeks });
  }

  const allItems = adjustedItems;
  const totalModules = allItems.length;
  const projects = allItems.filter((i) => i.isProject).length;
  const skillsCount = allItems.filter(
    (i) => !i.isProject && !["Interview Prep", "Career Prep", "Practice & Revision"].includes(i.name)
  ).length;
  const totalWeeks = allItems.reduce((s, i) => s + i.weeks, 0);

  return {
    currentRole,
    targetRole,
    phases,
    items: allItems,
    totalWeeks,
    totalModules,
    skills: skillsCount,
    projects,
    timeline: targetTimeline,
    learningPreference,
    dailyHours,
  };
}

/* ------------------------------------------------------------------ */
/*  react-select shared classNames                                    */
/* ------------------------------------------------------------------ */

const selectClassNames = {
  control: (state) =>
    `flex min-h-[42px] items-center rounded-2xl border bg-white px-3 text-sm transition-colors dark:bg-white/[0.03] ${
      state.isFocused
        ? "border-primary-500 ring-2 ring-primary-500/20"
        : "border-ink-900/10 dark:border-white/10"
    }`,
  placeholder: () => "text-ink-900/35 dark:text-white/30 text-sm",
  singleValue: () => "text-ink-900 dark:text-white text-sm font-semibold",
  input: () => "text-ink-900 dark:text-white text-sm",
  valueContainer: () => "gap-1 py-1",
  indicatorsContainer: () => "gap-1",
  dropdownIndicator: () => "text-ink-900/40 dark:text-white/40",
  indicatorSeparator: () => "hidden",
  clearIndicator: () => "text-ink-900/30 hover:text-ink-900/60 dark:text-white/30",
  menu: () =>
    "mt-2 overflow-hidden rounded-2xl border border-ink-900/10 bg-white shadow-card-lg dark:border-white/10 dark:bg-ink-900",
  menuList: () => "max-h-64 overflow-y-auto py-1",
  option: (state) =>
    `cursor-pointer px-3 py-2 text-sm ${
      state.isFocused ? "bg-primary-50 dark:bg-white/10" : ""
    } ${
      state.isSelected
        ? "font-bold text-primary-600 dark:text-primary-300"
        : "text-ink-900/80 dark:text-white/70"
    }`,
  noOptionsMessage: () => "px-3 py-4 text-center text-sm text-ink-900/40 dark:text-white/40",
};

function formatCompanyOption(option) {
  return (
    <span className="flex items-center gap-2">
      <span
        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br ${toneFor(
          option.label
        )} text-[9px] font-bold text-white`}
      >
        {initials(option.label)}
      </span>
      {option.label}
      {option.__isNew__ && (
        <span className="ml-auto rounded-md bg-primary-50 px-1.5 py-0.5 text-[10px] font-bold text-primary-600 dark:bg-primary-500/10 dark:text-primary-300">
          Custom
        </span>
      )}
    </span>
  );
}

function formatRoleOption(option) {
  const meta = ROLE_META[option.value];
  const Icon = meta?.icon ?? Sparkles;
  return (
    <span className="flex items-center gap-2">
      <span
        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br ${
          meta?.tone ?? "from-primary-500 to-secondary-500"
        } text-white`}
      >
        <Icon className="h-3 w-3" aria-hidden="true" />
      </span>
      {option.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Small presentational helpers                                      */
/* ------------------------------------------------------------------ */

function Field({ label, htmlFor, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold text-ink-900/60 dark:text-white/45">
        {label}
      </label>
      {children}
    </div>
  );
}

function NativeSelect({ id, value, onChange, options }) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-2xl border border-ink-900/10 bg-white px-3.5 py-2.5 pr-9 text-sm font-semibold text-ink-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:[color-scheme:dark]"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-white text-ink-900 dark:bg-ink-900 dark:text-white">
            {o}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-900/40 dark:text-white/40"
        aria-hidden="true"
      />
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-ink-900/[0.06] bg-white p-4 dark:border-white/10 dark:bg-white/[0.03]">
      <Icon className="h-4 w-4 text-primary-500" aria-hidden="true" />
      <p className="mt-2 text-lg font-extrabold leading-tight text-ink-900 dark:text-white">{value}</p>
      <p className="text-[11px] font-semibold text-ink-900/45 dark:text-white/40">{label}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Creatable company select                                          */
/* ------------------------------------------------------------------ */

function CompanySelect({ inputId, instanceId, value, onChange, placeholder, isClearable = true }) {
  const options = useMemo(() => roadmapConfig.companies.map((c) => ({ value: c, label: c })), []);

  return (
    <CreatableSelect
      inputId={inputId}
      instanceId={instanceId}
      unstyled
      isClearable={isClearable}
      classNames={selectClassNames}
      options={options}
      formatOptionLabel={formatCompanyOption}
      placeholder={placeholder}
      value={value ? { value, label: value } : null}
      onChange={(option) => onChange(option ? option.value : null)}
      formatCreateLabel={(inputValue) => `➕ Add "${inputValue}" as custom company`}
      isValidNewOption={(inputValue) => inputValue.trim().length > 0}
      getNewOptionData={(inputValue) => ({ value: inputValue.trim(), label: inputValue.trim(), __isNew__: true })}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

export default function CareerRoadmapGenerator() {
  const { isDark } = useThemeContext();
  const reduceMotion = useReducedMotion();
  const roadmapRef = useRef(null);

  const [currentRole, setCurrentRole] = useState(roadmapConfig.currentRoles[0]);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [experience, setExperience] = useState(0);
  const [targetRole, setTargetRole] = useState(roadmapConfig.targetRoles[0]);
  const [targetCompany, setTargetCompany] = useState("Google");
  const [timeAvailable, setTimeAvailable] = useState(roadmapConfig.studyHours[1]);
  const [learningMode, setLearningMode] = useState(roadmapConfig.learningModes[0]);
  const [timeline, setTimeline] = useState(roadmapConfig.timelines[1]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmap, setRoadmap] = useState(null);

  const targetRoleOptions = useMemo(() => roadmapConfig.targetRoles.map((r) => ({ value: r, label: r })), []);

  const canGenerate = Boolean(currentRole && targetRole) && !isGenerating;

  const handleGenerate = () => {
    if (!canGenerate) return;
    setIsGenerating(true);
    window.setTimeout(() => {
      const result = generateRoadmap({
        currentRole,
        targetRole,
        experience,
        dailyHours: timeAvailable,
        learningPreference: learningMode,
        targetTimeline: timeline,
      });
      setRoadmap(result);
      setIsGenerating(false);
    }, 700);
  };

  useEffect(() => {
    if (!roadmap || !roadmapRef.current) return;
    const id = window.setTimeout(() => {
      roadmapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
    return () => window.clearTimeout(id);
  }, [roadmap]);

  return (
    <section
      id="career-roadmap"
      className="relative overflow-hidden py-12 sm:py-16"
      style={{
        background: isDark
          ? "#0B2237"
          : "#F3F8FC",
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-secondary-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-80px" }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="flex items-center justify-center gap-2 font-display text-2xl font-extrabold text-ink-900 dark:text-white sm:text-3xl">
            <Sparkles className="h-6 w-6 text-primary-500" aria-hidden="true" />
            Build Your Career Roadmap
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-900/55 dark:text-white/50 sm:text-base">
            Tell us your goal and we&apos;ll create a personalized learning path for you.
          </p>
        </motion.div>

        {/* Form card */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-80px" }}
          className="mx-auto mt-10 max-w-6xl rounded-3xl border border-ink-900/[0.06] bg-white p-6 shadow-card-lg dark:border-white/10 dark:bg-white/[0.02] sm:p-8"
        >
          {/* Row A: current + target */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-4">
            <div className="flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-900/40 dark:text-white/35">
                Where You Are
              </p>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Current Role" htmlFor="current-role">
                  <NativeSelect
                    id="current-role"
                    value={currentRole}
                    onChange={setCurrentRole}
                    options={roadmapConfig.currentRoles}
                  />
                </Field>
                <Field label="Current Company (Optional)" htmlFor="current-company">
                  <CompanySelect
                    inputId="current-company"
                    instanceId="current-company"
                    value={currentCompany}
                    onChange={setCurrentCompany}
                    placeholder="Not Working / Student"
                  />
                  <p className="mt-1 text-[10px] text-ink-900/35 dark:text-white/25">
                    Not in list? Type your company name and press Enter
                  </p>
                </Field>
              </div>
            </div>

            <div className="flex items-center justify-center lg:pt-6">
              <motion.div
                animate={reduceMotion ? undefined : { scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-lg"
                aria-hidden="true"
              >
                <ArrowRight className="h-5 w-5 rotate-90 lg:rotate-0" />
              </motion.div>
            </div>

            <div className="flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-900/40 dark:text-white/35">
                Where You Want To Go
              </p>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Target Role" htmlFor="target-role">
                  <Select
                    inputId="target-role"
                    instanceId="target-role"
                    unstyled
                    classNames={selectClassNames}
                    options={targetRoleOptions}
                    formatOptionLabel={formatRoleOption}
                    placeholder="Search role..."
                    value={targetRole ? { value: targetRole, label: targetRole } : null}
                    onChange={(option) => setTargetRole(option ? option.value : null)}
                  />
                </Field>
                <Field label="Target Company (Optional)" htmlFor="target-company">
                  <CompanySelect
                    inputId="target-company"
                    instanceId="target-company"
                    value={targetCompany}
                    onChange={setTargetCompany}
                    placeholder="Search company..."
                  />
                  <p className="mt-1 text-[10px] text-ink-900/35 dark:text-white/25">
                    Not in list? Type your company name and press Enter
                  </p>
                </Field>
              </div>
            </div>
          </div>

          <div className="my-7 h-px bg-ink-900/[0.06] dark:bg-white/10" />

          {/* Row B: experience + extras */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="experience" className="text-xs font-semibold text-ink-900/60 dark:text-white/45">
                  Work Experience
                </label>
                <span className="rounded-pill bg-primary-50 px-2.5 py-0.5 text-[11px] font-bold text-primary-600 dark:bg-primary-500/10 dark:text-primary-300">
                  {experience >= 10 ? "10+ Years" : `${experience} ${experience === 1 ? "Year" : "Years"}`}
                </span>
              </div>
              <input
                id="experience"
                type="range"
                min={0}
                max={10}
                step={1}
                value={experience}
                onChange={(e) => setExperience(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-ink-900/10 accent-primary-500 dark:bg-white/10"
              />
              <div className="mt-1 flex justify-between text-[10px] font-semibold text-ink-900/35 dark:text-white/30">
                <span>0 Years</span>
                <span>10+ Years</span>
              </div>
            </div>

            <Field label="Time Available Per Day" htmlFor="time-available">
              <NativeSelect
                id="time-available"
                value={timeAvailable}
                onChange={setTimeAvailable}
                options={roadmapConfig.studyHours}
              />
            </Field>

            <Field label="Learning Preference" htmlFor="learning-mode">
              <NativeSelect
                id="learning-mode"
                value={learningMode}
                onChange={setLearningMode}
                options={roadmapConfig.learningModes}
              />
            </Field>

            <Field label="Target Timeline" htmlFor="timeline">
              <NativeSelect id="timeline" value={timeline} onChange={setTimeline} options={roadmapConfig.timelines} />
            </Field>
          </div>

          {/* CTA */}
          <motion.button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate}
            whileHover={canGenerate ? { scale: 1.01 } : undefined}
            whileTap={canGenerate ? { scale: 0.98 } : undefined}
            className="group relative mt-8 flex w-full items-center justify-center gap-2 rounded-pill bg-secondary-500 hover:bg-secondary-600 px-6 py-4 text-sm font-bold text-primary-700 shadow-lg transition-shadow hover:shadow-[0_4px_12px_rgba(19,59,93,0.10)] disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                Generating your roadmap...
              </>
            ) : (
              <>
                <Rocket className="h-5 w-5" aria-hidden="true" />
                Generate My Roadmap
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </>
            )}
          </motion.button>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] font-semibold text-ink-900/40 dark:text-white/35">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
            Trusted by 100K+ learners to build successful careers
          </p>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {roadmap && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="mx-auto mt-8 max-w-6xl"
            >
              <div
                ref={roadmapRef}
                className="scroll-mt-24 rounded-3xl border border-ink-900/[0.06] bg-white p-6 shadow-card dark:border-white/10 dark:bg-white/[0.02] sm:p-8"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="flex items-center gap-2 font-display text-lg font-bold text-ink-900 dark:text-white sm:text-xl">
                      <Milestone className="h-5 w-5 text-primary-500" aria-hidden="true" />
                      Your Career Roadmap
                    </h3>
                    <p className="mt-1 text-xs font-semibold text-ink-900/45 dark:text-white/40">
                      {roadmap.currentRole} <ArrowRight className="inline h-3 w-3" aria-hidden="true" />{" "}
                      {roadmap.targetRole}
                    </p>
                  </div>
                  <span className="rounded-pill bg-primary-50 px-4 py-1.5 text-xs font-bold text-primary-600 dark:bg-primary-500/10 dark:text-primary-300">
                    Estimated Duration: {roadmap.timeline}
                  </span>
                </div>

                {/* Desktop horizontal roadmap */}
                <div className="mt-8 hidden overflow-x-auto pb-4 lg:block [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-ink-900/10 [&::-webkit-scrollbar-track]:bg-transparent dark:[&::-webkit-scrollbar-thumb]:bg-white/10">
                  <div className="flex min-w-max items-start gap-0">
                    {roadmap.items.map((mod, idx) => (
                      <Fragment key={idx}>
                        {idx > 0 && (
                          <div
                            className="mt-7 h-0.5 w-8 flex-shrink-0 border-t-2 border-dashed border-ink-900/15 dark:border-white/15"
                            aria-hidden="true"
                          />
                        )}
                        <div className="flex w-28 flex-shrink-0 flex-col items-center text-center">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-card">
                            <mod.icon className="h-6 w-6" aria-hidden="true" />
                          </div>
                          <p className="mt-2 text-xs font-bold leading-tight text-ink-900 dark:text-white">
                            {mod.name}
                          </p>
                          <p className="text-[11px] font-semibold text-ink-900/45 dark:text-white/40">
                            {mod.weeks} {mod.weeks === 1 ? "Week" : "Weeks"}
                          </p>
                        </div>
                      </Fragment>
                    ))}
                  </div>
                </div>

                {/* Mobile vertical timeline */}
                <div className="mt-8 space-y-0 lg:hidden">
                  {roadmap.items.map((mod, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="relative flex items-start gap-4"
                    >
                      <div className="flex flex-col items-center">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow">
                          <mod.icon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        {idx < roadmap.items.length - 1 && (
                          <div className="h-8 w-0.5 bg-ink-900/10 dark:bg-white/10" />
                        )}
                      </div>
                      <div className="flex-1 rounded-2xl border border-ink-900/[0.06] p-4 dark:border-white/10">
                        <p className="text-sm font-bold text-ink-900 dark:text-white">{mod.name}</p>
                        <p className="font-mono text-xs text-ink-900/45 dark:text-white/40">
                          {mod.weeks} {mod.weeks === 1 ? "Week" : "Weeks"}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Stats */}
                <motion.div
                  initial="hidden"
                  animate="visible"
                  className="mt-8 grid grid-cols-2 gap-3 border-t border-ink-900/[0.06] pt-6 dark:border-white/10 sm:grid-cols-3 lg:grid-cols-6"
                >
                  {[
                    { icon: Clock, label: "Total Weeks", value: roadmap.totalWeeks },
                    { icon: Sparkles, label: "Skills Covered", value: roadmap.skills },
                    { icon: FolderGit2, label: "Projects", value: roadmap.projects },
                    { icon: Award, label: "Modules", value: roadmap.totalModules },
                    { icon: Briefcase, label: "Learning Mode", value: roadmap.learningPreference },
                    { icon: BadgeCheck, label: "Daily Hours", value: roadmap.dailyHours },
                  ].map(({ icon, label, value }) => (
                    <motion.div
                      key={label}
                      variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                    >
                      <StatCard icon={icon} label={label} value={value} />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}