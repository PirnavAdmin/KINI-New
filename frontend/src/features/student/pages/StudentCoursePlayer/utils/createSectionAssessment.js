const question = (id, topic, text, options, correctAnswer = 0) => ({
  id,
  type: "single",
  difficulty: "medium",
  topic,
  question: text,
  options,
  correctAnswer,
});

const DEVOPS_QUESTIONS = [
  question("devops-1", "Containers", "What is the primary purpose of a Docker container?", ["Package an application with its dependencies", "Replace source control", "Design UI screens", "Store passwords"]),
  question("devops-2", "Kubernetes", "Which Kubernetes object maintains a desired number of application replicas?", ["Deployment", "ConfigMap", "Secret", "Ingress"]),
  question("devops-3", "CI/CD", "What does continuous integration primarily encourage?", ["Frequent automated builds and tests", "Manual releases only", "Long-lived branches", "Skipping code reviews"]),
  question("devops-4", "Infrastructure", "What is Infrastructure as Code used for?", ["Provisioning infrastructure through versioned definitions", "Editing videos", "Writing UI styles", "Managing payroll"]),
  question("devops-5", "Monitoring", "Which signal is most useful for detecting service availability problems?", ["Error rate and request success rate", "Font size", "Repository name", "Developer location"]),
];

const DEVOPS_SECTION_QUESTIONS = {
  foundations: [
    question("foundations-1", "DevOps Culture", "What is the central goal of DevOps culture?", ["Improve collaboration and continuously deliver reliable software", "Separate development and operations", "Avoid automation", "Release only once a year"]),
    question("foundations-2", "Lifecycle", "Which practice provides fast feedback after a code change?", ["Automated build and test pipelines", "Annual planning", "Manual file copying", "Long-lived branches"]),
    question("foundations-3", "Agile", "What does an Agile retrospective help a team do?", ["Inspect its process and improve the next iteration", "Purchase cloud servers", "Replace source control", "Create database passwords"]),
    question("foundations-4", "Reliability", "What does an SLO define?", ["A measurable reliability target for a service", "A programming language", "A source-code license", "A UI color standard"]),
    question("foundations-5", "Metrics", "Which metric measures how often deployments cause incidents or rollback?", ["Change failure rate", "Screen resolution", "Repository size", "Employee count"]),
  ],
  linux: [
    question("linux-1", "Linux", "Which command prints the current working directory?", ["pwd", "mkdir", "grep", "chmod"]),
    question("linux-2", "Shell", "What is a shell script primarily used for?", ["Automating command-line tasks", "Designing page layouts", "Storing images", "Replacing a kernel"]),
    question("linux-3", "Permissions", "Which permission allows a file to be run as a program?", ["Execute", "Read", "Archive", "Compress"]),
    question("linux-4", "Networking", "Which protocol securely connects to a remote Linux server?", ["SSH", "HTTP", "DNS", "SMTP"]),
    question("linux-5", "DNS", "What does DNS translate for clients?", ["Domain names into IP addresses", "Source code into binaries", "Passwords into tokens", "Logs into metrics"]),
  ],
  git: [
    question("git-1", "Git", "What does a Git commit represent?", ["A recorded snapshot of tracked changes", "A running container", "A cloud server", "A DNS lookup"]),
    question("git-2", "Branches", "Why are feature branches used?", ["To isolate work before integration", "To delete repository history", "To replace testing", "To publish passwords"]),
    question("git-3", "Collaboration", "What is the purpose of a pull request?", ["Review and discuss changes before merging", "Start a virtual machine", "Create a database", "Monitor CPU usage"]),
    question("git-4", "Merging", "When does a merge conflict occur?", ["When Git cannot automatically reconcile competing changes", "When a build succeeds", "When a branch is created", "When a tag is read"]),
    question("git-5", "Releases", "What is a Git tag commonly used to identify?", ["A specific release or version", "A network port", "A Docker volume", "A cloud region"]),
  ],
  docker: DEVOPS_QUESTIONS,
  cicd: [
    question("cicd-1", "CI", "What should a continuous integration pipeline run after each change?", ["Automated builds and tests", "Only manual approval", "A yearly backup", "A UI redesign"]),
    question("cicd-2", "CD", "What is the purpose of a deployment pipeline?", ["Move a validated change safely through environments", "Store employee records", "Replace Git", "Resolve domain names"]),
    question("cicd-3", "Artifacts", "What is a build artifact?", ["A versioned output produced by the build", "A developer account", "A live database password", "A sprint meeting"]),
    question("cicd-4", "GitHub Actions", "Where are GitHub Actions workflows normally defined?", ["YAML files under .github/workflows", "Browser cookies", "Docker volumes", "DNS records"]),
    question("cicd-5", "Quality", "Why should a pipeline fail when tests fail?", ["To prevent an invalid change from progressing", "To increase deployment risk", "To remove version history", "To disable feedback"]),
  ],
};

const JAVASCRIPT_QUESTIONS = [
  question("js-1", "Variables", "Which keyword declares a block-scoped variable that can be reassigned?", ["let", "const", "static", "define"]),
  question("js-2", "Async JavaScript", "What does an async function always return?", ["A Promise", "A callback", "A string", "A generator"]),
  question("js-3", "Arrays", "Which method creates a new array by transforming every item?", ["map", "push", "find", "sort"]),
  question("js-4", "Equality", "Which operator checks value and type equality?", ["===", "==", "=", "!="]),
  question("js-5", "Modules", "Which keyword exports a value from an ES module?", ["export", "public", "expose", "module"]),
];

const REACT_QUESTIONS = [
  question("react-1", "Components", "What is the standard way to pass data from a parent to a child component?", ["Props", "Direct DOM mutation", "Cookies", "CSS variables"]),
  question("react-2", "Hooks", "Which hook stores local component state?", ["useState", "useEffect", "useRef", "useMemo"]),
  question("react-3", "Rendering", "Why should list items have stable keys?", ["To help React identify changed items", "To apply global CSS", "To call APIs", "To encrypt data"]),
  question("react-4", "Effects", "Which hook handles synchronization with external systems?", ["useEffect", "useId", "useContext", "useReducer"]),
  question("react-5", "State", "What is the recommended way to update React state?", ["Use the state setter", "Mutate it directly", "Reload the page", "Edit the DOM"]),
];

const selectQuestions = (courseTitle, sectionTitle) => {
  const context = `${courseTitle || ""} ${sectionTitle || ""}`.toLowerCase();
  if (/foundation|lifecycle|culture/.test(sectionTitle?.toLowerCase() || "")) return DEVOPS_SECTION_QUESTIONS.foundations;
  if (/linux|network/.test(sectionTitle?.toLowerCase() || "")) return DEVOPS_SECTION_QUESTIONS.linux;
  if (/git|collaboration/.test(sectionTitle?.toLowerCase() || "")) return DEVOPS_SECTION_QUESTIONS.git;
  if (/docker|container/.test(sectionTitle?.toLowerCase() || "")) return DEVOPS_SECTION_QUESTIONS.docker;
  if (/ci\/cd|automation/.test(sectionTitle?.toLowerCase() || "")) return DEVOPS_SECTION_QUESTIONS.cicd;
  if (/devops|docker|kubernetes|cloud|ci\/cd/.test(context)) return DEVOPS_QUESTIONS;
  if (/react|jsx|hooks/.test(context)) return REACT_QUESTIONS;
  return JAVASCRIPT_QUESTIONS;
};

export const createSectionAssessment = ({ section, course }) => {
  const source = section.sectionAssessment || {};
  const questions = selectQuestions(course.title, section.title);

  return {
    ...source,
    id: source.id || `${course.id}-${section.id}-assessment`,
    assessmentId: source.id || `${course.id}-${section.id}-assessment`,
    title: source.title || `${section.title} Assessment`,
    description: source.description || `Validate your ${section.title} knowledge before continuing.`,
    category: course.title,
    courseId: course.id,
    courseName: course.title,
    duration: 15,
    totalQuestions: questions.length,
    passingScore: 80,
    questions,
  };
};

export default createSectionAssessment;
