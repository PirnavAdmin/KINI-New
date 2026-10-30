// ─── Navigation Data ──────────────────────────────────────────────────────────

export const NAV_ITEMS = [
  { label: "Bootcamps",       hasMega: true, key: "bootcamps"     },
  { label: "Masterclasses",   hasMega: true, key: "masterclasses" },
  { label: "Courses",         hasMega: true, key: "coursesBooks"  },
];

export const PUBLIC_ROUTES = [
  { label: "Alumni", path: "/alumni" },
  { label: "Upskill Programs", path: "/upskill-program" },
];

// ─── Navigation Icon Data ─────────────────────────────────────────────────────

export const MEGA_DATA = {
  skillTracks: {
    featured: "Master in-demand skills with structured learning paths designed by industry experts.",
    categories: [
      {
        id: "frontend", label: "Frontend Development",
        courses: [
          { title: "React Mastery Track",  desc: "Hooks, architecture patterns, scalable SPAs",           badge: "Hot"   },
          { title: "Advanced TypeScript",  desc: "Type systems, generics, enterprise-grade patterns",      badge: "New"   },
          { title: "Next.js Full Stack",   desc: "SSR, ISR, App Router, production deployment",            badge: null    },
        ],
      },
      {
        id: "backend", label: "Backend Development",
        courses: [
          { title: "Node.js & Express",   desc: "REST APIs, middleware, auth, microservices",              badge: "Hot"   },
          { title: "Go for Backend Devs", desc: "Concurrency, HTTP servers, production Go",                badge: "New"   },
          { title: "System Design Pro",   desc: "Scalability, caching, queues, distributed systems",       badge: null    },
        ],
      },
      {
        id: "cloud", label: "Cloud & DevOps",
        courses: [
          { title: "AWS Solutions Architect", desc: "Certification-ready for SAA-C03",                     badge: "Popular" },
          { title: "Docker & Kubernetes",     desc: "Containerization, orchestration, CI/CD pipelines",    badge: null    },
          { title: "Terraform Infrastructure",desc: "IaC patterns, modules, state management",            badge: null    },
        ],
      },
      {
        id: "ai", label: "AI & Machine Learning",
        courses: [
          { title: "Machine Learning A-Z",  desc: "Supervised, unsupervised, reinforcement learning",      badge: "Hot"   },
          { title: "LLM Engineering",       desc: "Prompt design, fine-tuning, RAG pipelines",             badge: "New"   },
          { title: "Data Science with Python",desc: "EDA, visualization, predictive modeling",             badge: null    },
        ],
      },
    ],
  },
  bootcamps: {
    featured: "Intensive, cohort-based programs designed to make you job-ready in 12–24 weeks.",
    categories: [
      {
        id: "fullstack", label: "Full Stack",
        courses: [
          { title: "MERN Stack Bootcamp",  desc: "12-week intensive from zero to job-ready",               badge: "Live" },
          { title: "Next.js + Supabase",   desc: "Modern full-stack with serverless + real-time",          badge: "New"  },
          { title: "T3 Stack Bootcamp",    desc: "TypeScript, tRPC, Prisma, and deployment",               badge: null   },
        ],
      },
      {
        id: "datascience", label: "Data Science",
        courses: [
          { title: "Data Science Bootcamp", desc: "Python, SQL, ML, and Tableau in 16 weeks",              badge: "Hot"  },
          { title: "Analytics Engineering", desc: "dbt, Snowflake, and the modern data stack",             badge: "New"  },
          { title: "ML Ops Bootcamp",      desc: "Model deployment, monitoring, and drift detection",      badge: null   },
        ],
      },
      {
        id: "devops", label: "DevOps",
        courses: [
          { title: "DevOps Engineer Bootcamp",desc: "CI/CD, containers, and cloud infrastructure",         badge: "Live" },
          { title: "Kubernetes Bootcamp",     desc: "CKA exam prep with hands-on cluster labs",           badge: null   },
          { title: "Platform Engineering",    desc: "Internal developer portals and golden paths",        badge: "New"  },
        ],
      },
      {
        id: "aiml", label: "AI & ML",
        courses: [
          { title: "AI Engineering Bootcamp",desc: "Build and ship production AI applications",            badge: "Hot"  },
          { title: "Deep Learning Intensive",desc: "PyTorch, transformers, custom model training",         badge: null   },
          { title: "Generative AI Track",    desc: "LLMs, diffusion models, and agentic systems",          badge: "New"  },
        ],
      },
    ],
  },
  masterclasses: {
    featured: "Expert-led deep dives into specific topics — 2–4 hour focused sessions.",
    categories: [
      {
        id: "engineering", label: "Engineering",
        courses: [
          { title: "Clean Code Masterclass",  desc: "Refactoring, naming, writing code that lasts",        badge: "Bestseller" },
          { title: "Performance Engineering", desc: "Profiling, caching, latency reduction at scale",     badge: null    },
          { title: "API Design Principles",   desc: "REST, GraphQL, versioning that does not break",       badge: "New"   },
        ],
      },
      {
        id: "architecture", label: "Architecture",
        courses: [
          { title: "Microservices Design", desc: "DDD, event-driven systems, decomposition patterns",      badge: "Hot"   },
          { title: "Cloud Native Patterns",desc: "12-factor apps, observability, resilience",              badge: null    },
          { title: "Secure Architecture",  desc: "Threat modeling, zero-trust, defense in depth",          badge: null    },
        ],
      },
      {
        id: "leadership", label: "Leadership",
        courses: [
          { title: "Engineering Management",  desc: "1:1s, roadmaps, growing high-performing teams",       badge: "Popular" },
          { title: "Staff Engineer Path",     desc: "Influence, technical strategy, org navigation",       badge: "New"   },
          { title: "Tech Lead Skills",        desc: "Delegation, code review culture, delivery",           badge: null    },
        ],
      },
      {
        id: "interview", label: "Interview Prep",
        courses: [
          { title: "Coding Interview Pro",    desc: "LeetCode patterns, complexity, mock interviews",      badge: "Hot"        },
          { title: "System Design Interview", desc: "Framework, trade-offs, 30 real design questions",     badge: "Bestseller" },
          { title: "Salary Negotiation",      desc: "Comp research, anchoring, negotiation scripts",       badge: "New"   },
        ],
      },
    ],
  },
  coursesBooks: {
    featured: "Self-paced courses and curated reading lists for continuous learning.",
    categories: [
      {
        id: "webdev", label: "Web Development",
        courses: [
          { title: "JavaScript: The Good Parts", desc: "Core semantics, closures, prototype chains",       badge: "Classic" },
          { title: "CSS in Depth",              desc: "Modern layout, custom properties, animation",       badge: null     },
          { title: "React Patterns",            desc: "Compound components, render props, composition",    badge: "Hot"    },
        ],
      },
      {
        id: "databooks", label: "Data & AI",
        courses: [
          { title: "Designing ML Systems",       desc: "Chip Huyen's guide to production ML",              badge: "Bestseller" },
          { title: "Python for Data Analysis",   desc: "Pandas, NumPy, Jupyter for real datasets",         badge: null     },
          { title: "Fundamentals of Data Eng",   desc: "Pipelines, storage, the modern data stack",         badge: "Hot"    },
        ],
      },
      {
        id: "algos", label: "Algorithms",
        courses: [
          { title: "CLRS Algorithms",        desc: "The definitive guide to algorithm design",             badge: "Classic" },
          { title: "Grokking Algorithms",    desc: "Illustrated walkthrough of essential CS algorithms",   badge: "Beginner"},
          { title: "Competitive Programming",desc: "Graph theory, DP, segment trees for contests",         badge: null     },
        ],
      },
      {
        id: "devbooks", label: "Developer Essentials",
        courses: [
          { title: "The Pragmatic Programmer", desc: "20th anniversary edition, career wisdom",            badge: "Classic"    },
          { title: "Clean Architecture",       desc: "Robert Martin's guide to software structure",        badge: "Bestseller" },
          { title: "An Elegant Puzzle",        desc: "Engineering management for growing teams",           badge: null     },
        ],
      },
    ],
  },
};

// ─── Badge Color Map ──────────────────────────────────────────────────────────

export const BADGE_COLORS = {
  Hot:        "bg-rose-500/20 text-rose-400",
  New:        "bg-primary/20 text-primary-lighter",
  Popular:    "bg-secondary/20 text-secondary-light",
  Live:       "bg-emerald-500/20 text-emerald-400",
  Bestseller: "bg-amber-500/20 text-amber-400",
  Classic:    "bg-slate-500/20 text-slate-300",
  Beginner:   "bg-teal-500/20 text-teal-400",
};

// ─── Focus Ring ───────────────────────────────────────────────────────────────

export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";
