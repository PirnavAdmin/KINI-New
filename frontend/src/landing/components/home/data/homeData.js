// ─── Statistics ──────────────────────────────────────────────────────────────
export const statData = [
  { value: 10000, suffix: "+", label: "Students Trained", color: "#133B5D" },
  { value: 2200, suffix: "+", label: "Placements", color: "#F39924" },
  { value: 50, suffix: "+", label: "Expert Mentors", color: "#133B5D" },
  { value: 25, suffix: "+", label: "Skill Programs", color: "#F39924" },
];

export const trustedCompanies = [
  "Google", "Microsoft", "Amazon", "Wipro",
  "Infosys", "Accenture", "TCS", "Deloitte",
  "Salesforce", "Razorpay", "PhonePe", "CRED",
];

// ─── Categories (for UI filtering) ────────────────────────────────────────
export const categories = [
  { id: "fullstack", label: "Full Stack", gradient: "from-primary-500 to-secondary-500" },
  { id: "dotnet", label: ".NET Engineering", gradient: "from-primary-500 to-primary-400" },
  { id: "ai", label: "AI & GenAI", gradient: "from-primary-500 to-secondary-500" },
  { id: "cloud", label: "Cloud & DevOps", gradient: "from-secondary-500 to-secondary-400" },
  { id: "datascience", label: "Data Science", gradient: "from-primary-500 to-primary-400" },
  { id: "leadership", label: "Leadership", gradient: "from-primary-400 to-secondary-500" },
];

// ─── Featured Courses – combined list (8 older + 6 newer) ───────────────
export const featuredCourses = [
  // ========== 1. Python Programming ==========
  {
    slug: "python-programming",
    title: "Python Programming",
    badge: "Hot",
    desc: "Build a strong foundation in Python with practical exercises, OOP, and real-world projects.",
    duration: "12 Weeks",
    sessions: "3 sessions/week",
    category: "Python",
    gradient: "from-primary-500 to-primary-400",
    image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&q=80&w=800&h=600",
    outcomes: [
      "Python fundamentals & OOP",
      "APIs & backend basics",
      "Practical projects",
      "Git & GitHub",
    ],
    salary: "₹6–15 LPA",
  },
  // ========== 2. Web Development ==========
  {
    slug: "web-development",
    title: "Web Development — React, Node.js & Laravel",
    badge: "Popular",
    desc: "Master full‑stack web development with React, Node.js, and Laravel, building responsive apps.",
    duration: "16 Weeks",
    sessions: "3 sessions/week",
    category: "Web Development",
    gradient: "from-primary-700 to-primary-500",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800&h=600",
    outcomes: [
      "HTML, CSS & JavaScript",
      "React & modern frontend",
      "Node.js & Express APIs",
      "Laravel fundamentals",
      "Full‑stack projects",
    ],
    salary: "₹7–18 LPA",
  },
  // ========== 3. Full Stack Java ==========
  {
    slug: "cloud-computing",
    title: "Full Stack Java",
    letter: "J",
    badge: "Popular",
    desc: "Master full-stack Java development with Spring Boot, React, databases, REST APIs, and real-world application development.",
    duration: "16 Weeks",
    sessions: "3 sessions/week",
    category: "Cloud Computing",
    gradient: "from-secondary-500 to-secondary-400",
    image: "https://images.unsplash.com/photo-1695668548342-c0c1ad479aee?auto=format&fit=crop&q=80&w=800&h=600",
    outcomes: [
      "Spring Boot & REST APIs",
      "React & modern frontend",
      "SQL databases & JPA/Hibernate",
      "Microservices architecture",
      "Full-stack Java projects",
    ],
    salary: "₹10–25 LPA",
  },
  // ========== 4. Cybersecurity ==========
  {
    slug: "cybersecurity",
    title: "Cybersecurity",
    badge: "Trending",
    desc: "Understand network security, ethical hacking, and how to protect systems from cyber threats.",
    duration: "14 Weeks",
    sessions: "3 sessions/week",
    category: "Cybersecurity",
    gradient: "from-primary-600 to-secondary-500",
    image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=800&h=600",
    outcomes: [
      "Network security fundamentals",
      "Ethical hacking & penetration testing",
      "Security best practices",
      "Incident response",
    ],
    salary: "₹8–20 LPA",
  },
  // ========== 5. Data Analytics & Power BI ==========
  {
    slug: "data-analytics",
    title: "Data Analytics & Power BI",
    badge: "New",
    desc: "Turn data into insights using SQL, Python, and Power BI – from cleaning to dashboarding.",
    duration: "12 Weeks",
    sessions: "2 sessions/week",
    category: "Data Analytics",
    gradient: "from-primary-500 to-secondary-400",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800&h=600",
    outcomes: [
      "SQL & data extraction",
      "Python for data analysis",
      "Power BI dashboards",
      "Data storytelling",
    ],
    salary: "₹6–14 LPA",
  },
  // ========== 6. AI & Machine Learning ==========
  {
    slug: "ai-ml",
    title: "AI & Machine Learning",
    badge: "Popular",
    desc: "Explore machine learning, deep learning, and AI with Python – build intelligent applications.",
    duration: "16 Weeks",
    sessions: "3 sessions/week",
    category: "AI & Machine Learning",
    gradient: "from-primary-700 to-primary-400",
    image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=800&h=600",
    outcomes: [
      "Python for AI",
      "ML fundamentals",
      "Data preparation & model building",
      "Deep learning basics",
      "Practical AI projects",
    ],
    salary: "₹10–25 LPA",
  },
  // ========== 7. DevOps ==========
  {
    slug: "devops",
    title: "DevOps — Docker & Kubernetes",
    badge: "New",
    desc: "Automate, containerize, and orchestrate applications with Docker and Kubernetes.",
    duration: "12 Weeks",
    sessions: "2 sessions/week",
    category: "DevOps",
    gradient: "from-secondary-600 to-secondary-400",
    image: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&q=80&w=800&h=600",
    outcomes: [
      "Docker containers",
      "Kubernetes orchestration",
      "CI/CD pipelines",
      "Infrastructure as Code",
    ],
    salary: "₹12–30 LPA",
  },
  // ========== 8. QA Automation ==========
  {
    slug: "qa-automation",
    title: "QA Automation",
    badge: "New",
    desc: "Learn automated testing frameworks, tools, and best practices for delivering quality software.",
    duration: "10 Weeks",
    sessions: "2 sessions/week",
    category: "QA Automation",
    gradient: "from-primary-400 to-secondary-500",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=800&h=600",
    outcomes: [
      "Testing fundamentals",
      "Selenium & automation",
      "API testing",
      "Performance testing",
    ],
    salary: "₹6–15 LPA",
  },

  // ========== 9. MERN & Next.js (new) ==========
  {
    title: "MERN & Next.js Engineering",
    slug: "mern-nextjs-engineering",
    desc: "Build production-grade web applications — from React to Node.js APIs and AWS deployment.",
    badge: "Hot",
    duration: "22 weeks",
    sessions: "3 sessions/week",
    category: "Full Stack",
    salary: "₹8–22 LPA",
    outcomes: ["3 live deployed projects", "Median 45 days to placement", "Portfolio ready"],
    gradient: "from-primary-500 to-secondary-500",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800&h=600",
  },
  // ========== 10. Full Stack .NET ==========
  {
    title: "Full Stack .NET — C# to Enterprise",
    slug: "fullstack-dotnet",
    desc: "The definitive program for the Microsoft stack. Taught by a working .NET architect with 15+ years experience.",
    badge: "Hot",
    duration: "20 weeks",
    sessions: "4 sessions/week",
    category: ".NET Engineering",
    salary: "₹10–28 LPA",
    outcomes: ["Azure-deployed capstone", "Median 35 days to placement", "Enterprise patterns"],
    gradient: "from-primary-500 to-primary-400",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800&h=600",
  },
  // ========== 11. AI & Generative AI ==========
  {
    title: "AI & Generative AI Engineering",
    slug: "ai-genai-engineering",
    desc: "Build production-grade AI systems using LangChain, RAG pipelines, and vector databases.",
    badge: "New",
    duration: "24 weeks",
    sessions: "3 sessions/week",
    category: "AI & GenAI",
    salary: "₹18–40 LPA",
    outcomes: ["RAG chatbot project", "Fine-tuned LLM deployment", "Median 30 days to placement"],
    gradient: "from-primary-500 to-secondary-500",
    image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=800&h=600",
  },
  // ========== 12. Cloud & DevOps ==========
  {
    title: "AWS, Azure, Docker & Kubernetes",
    slug: "cloud-devops",
    desc: "Cloud engineers are the second-highest paid roles. Build from Linux to full EKS clusters.",
    badge: "In Demand",
    duration: "18 weeks",
    sessions: "3 sessions/week",
    category: "Cloud & DevOps",
    salary: "₹12–30 LPA",
    outcomes: ["Production AWS infra project", "GitOps pipelines", "Median 40 days to placement"],
    gradient: "from-secondary-500 to-secondary-400",
    image: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&q=80&w=800&h=600",
  },
  // ========== 13. Data Science & ML ==========
  {
    title: "Data Science & Machine Learning",
    slug: "data-science-ml",
    desc: "From Python and statistics through to building and deploying ML models on real business problems.",
    badge: "In Demand",
    duration: "20 weeks",
    sessions: "3 sessions/week",
    category: "Data Science",
    salary: "₹8–24 LPA",
    outcomes: ["3 end-to-end ML pipelines", "Real business datasets", "Median 50 days to placement"],
    gradient: "from-primary-500 to-primary-400",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800&h=600",
  },
  // ========== 14. Engineering Leadership ==========
  {
    title: "Engineering Leadership",
    slug: "engineering-leadership",
    desc: "For engineers with 3+ years targeting Tech Lead, Staff Engineer, or EM roles.",
    badge: "In Demand",
    duration: "12 weeks",
    sessions: "2 sessions/week",
    category: "Leadership",
    salary: "₹18–50+ LPA",
    outcomes: ["System design capstone", "Panel review", "Promotion in 3–6 months"],
    gradient: "from-primary-400 to-secondary-500",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800&h=600",
  },
];

// ─── Learning Paths ──────────────────────────────────────────────────────────
export const learningPaths = [
  {
    title: "Beginner to Job Ready",
    desc: "No prior coding experience? Start here. We take you from fundamentals to placement-ready in 6 months.",
    icon: "🚀",
    steps: 5,
    duration: "24 weeks",
  },
  {
    title: "Career Accelerator",
    desc: "For professionals with 1-3 years experience looking to upskill, switch stacks, or target higher salaries.",
    icon: "⚡",
    steps: 4,
    duration: "16 weeks",
  },
  {
    title: "Expert Track",
    desc: "Senior engineers targeting Staff/EM roles. Deep dives into system design, architecture, and leadership.",
    icon: "🎯",
    steps: 3,
    duration: "12 weeks",
  },
];

// ─── Why Choose Us ──────────────────────────────────────────────────────────
export const whyChooseUsFeatures = [
  {
    title: "100% Live Training",
    desc: "Every session is instructor-led and interactive. No pre-recorded content — learn in real-time with instant feedback.",
    icon: "🎓",
  },
  {
    title: "Industry-Expert Mentors",
    desc: "Learn from engineers working at top product companies with an average of 10+ years of experience.",
    icon: "👨‍🏫",
  },
  {
    title: "Placement Assistance",
    desc: "Resume rewriting, LinkedIn optimisation, unlimited mock interviews, and warm referrals through our alumni network.",
    icon: "💼",
  },
  {
    title: "Real-World Projects",
    desc: "Build and deploy production-grade applications on AWS/Azure. Every project gets a live URL and GitHub repo.",
    icon: "🛠️",
  },
  {
    title: "Small Cohort Sizes",
    desc: "Each cohort is capped at 30 students. Mentor-to-student ratio of 1:15 ensures personalized attention.",
    icon: "👥",
  },
  {
    title: "Lifetime Access",
    desc: "Access all course recordings, materials, and future updates forever — even after you've completed the program.",
    icon: "♾️",
  },
];

// ─── Learning Process Steps ────────────────────────────────────────────────
export const learningProcessSteps = [
  {
    step: 1,
    title: "Enroll & Onboard",
    desc: "Choose your program, complete enrollment, and get instant access to your personalized learning dashboard.",
    duration: "Day 1",
  },
  {
    step: 2,
    title: "Learn with Experts",
    desc: "Attend live sessions led by industry mentors. Interactive lessons, hands-on exercises, and real-time Q&A.",
    duration: "Weeks 1–10",
  },
  {
    step: 3,
    title: "Build Real Projects",
    desc: "Apply your skills to production-grade projects. Deploy on AWS/Azure with live URLs for your portfolio.",
    duration: "Weeks 11–16",
  },
  {
    step: 4,
    title: "Career Preparation",
    desc: "Resume rewriting, LinkedIn optimisation, GitHub portfolio curation, and unlimited mock interviews.",
    duration: "Weeks 17–20",
  },
  {
    step: 5,
    title: "Ready to Market",
    desc: "Connect with our extensive hiring network through placement drives, warm referrals, and our alumni network.",
    duration: "Until Hired",
  },
];

// ─── Testimonials ───────────────────────────────────────────────────────────
export const testimonials = [
  {
    name: "Sameer Vyas",
    role: "Technical Lead",
    company: "Wipro",
    text: "The training experience was excellent. The teaching methodology was simple, effective, and highly practical. I gained confidence and improved my skills significantly.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
  },
  {
    name: "Priyanka Kulkarni",
    role: "Technical Lead",
    company: "Lumedx",
    text: "I joined to upgrade my web technology skills. The sessions, assignments, and mentor support helped me gain confidence and improve my development capabilities.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80",
  },
  {
    name: "Gulam Qureshi",
    role: "UI Developer",
    company: "CRMnext",
    text: "Live sessions, recordings, projects, and mentor support helped me gain confidence and improve my development skills significantly. Highly recommended!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
  },
  {
    name: "Rahul Sharma",
    role: "Full Stack Developer",
    company: "Tech Mahindra",
    text: "The structured curriculum and real-world projects made all the difference. I was able to switch careers and land my dream job within 3 months of completing the program.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
  },
  {
    name: "Anjali Deshmukh",
    role: "Data Engineer",
    company: "Amazon",
    text: "From a non-tech background to landing a role at Amazon — this program changed my life. The mentors believed in me even when I didn't believe in myself.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
  },
];

// ─── FAQ ──────────────────────────────────────────────────────────────────
export const faqData = [
  {
    q: "Do I need prior coding experience to join?",
    a: "It depends on the track. Full Stack, .NET, and AI programs need basic coding familiarity (200+ lines in any language). Data Science accepts strong Excel/SQL analysts. Leadership requires 3+ years of industry experience. Book a free consultation — our counsellors will assess your level and recommend the right starting point.",
  },
  {
    q: "Are classes live or recorded?",
    a: "All sessions are 100% live. Every session is recorded and uploaded to your dashboard within 6 hours. You get lifetime access to recordings even after the program ends. No one falls behind because of a missed class.",
  },
  {
    q: "What does placement assistance include?",
    a: "ATS-optimised resume review and rewrite, LinkedIn profile optimisation, GitHub portfolio curation, unlimited 1:1 mock interviews, warm referrals through our 200+ company alumni network, salary negotiation coaching, and continued support until you receive and accept an offer letter.",
  },
  {
    q: "What is the refund policy?",
    a: "7-day full refund if you have attended fewer than 3 live sessions. After 7 days, pro-rated refund based on sessions attended. We also offer program pause or track transfer at no extra fee for genuine emergencies.",
  },
  {
    q: "How large are the cohorts?",
    a: "Each live cohort is capped at 30 students. Mentor-to-student ratio is 1:15. We keep cohorts deliberately small because we compete on outcome quality, not enrolment volume.",
  },
  {
    q: "What projects will I build?",
    a: "Each program includes 3 production-grade projects deployed on AWS or Azure with live URLs. Examples include an enterprise HR system (.NET), a RAG-powered AI chatbot (AI track), and a full-stack e-commerce platform (Full Stack).",
  },
  {
    q: "What is the typical salary outcome?",
    a: "Average first salary post-placement: ₹14 LPA. Freshers typically land ₹7–10 LPA. Career switchers: ₹8–12 LPA. Experienced developers upgrading stacks: ₹12–22 LPA. AI/GenAI track graduates: ₹18–40 LPA.",
  },
  {
    q: "How quickly can I join after consultation?",
    a: "Most students join a live cohort within 7–14 days of their first consultation. Our counsellor calls within 24 hours of your form submission, walks through your options, and sends program details with batch schedule.",
  },
];

// ─── Helper: get unique categories from featuredCourses ──────────────────
export const getCourseCategories = () => {
  const categories = new Set(featuredCourses.map((c) => c.category));
  return ["All", ...categories];
};