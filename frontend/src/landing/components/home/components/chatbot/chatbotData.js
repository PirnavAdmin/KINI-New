// ============================================================
// KINI EDX HUB — CHATBOT KNOWLEDGE BASE
// ============================================================
// Edit ONLY this file to update chatbot content.
// All course info, prices, mentors, FAQs live here.
// ============================================================

export const kiniKnowledgeBase = {

  // ----------------------------------------------------------
  // INSTITUTE
  // ----------------------------------------------------------
  institute: {
    name: "Kini Edx Hub",
    tagline: "Technology-focused, career-driven education",
    description:
      "Kini Edx Hub is a technology-focused education platform delivering career-driven, practical learning through live instruction, real-world projects, and mentor guidance.",
    benefits: [
      {
        icon: "🎥",
        title: "100% Live Training",
        description: "Instructor-led, interactive sessions with real-time feedback.",
      },
      {
        icon: "👨‍💼",
        title: "Industry-Expert Mentors",
        description: "Learn from experienced professionals with practical industry knowledge.",
      },
      {
        icon: "🛠",
        title: "Real-World Projects",
        description: "Build practical applications that strengthen your portfolio and GitHub.",
      },
      {
        icon: "👥",
        title: "Small Cohort Sizes",
        description: "Smaller batches for more personalized mentor interaction.",
      },
      {
        icon: "💼",
        title: "Placement Assistance",
        description:
          "Resume guidance, interview preparation, LinkedIn optimization, and career support.",
      },
    ],
    // Add contact details here when available
    whatsapp: null,      // e.g. "https://wa.me/91XXXXXXXXXX"
    email: null,         // e.g. "hello@kiniedxhub.com"
    website: null,       // e.g. "https://kiniedxhub.com"
  },

  // ----------------------------------------------------------
  // COURSES
  // Add/remove courses here. Fields marked (optional) can be
  // left null — the chatbot will say "contact us for details".
  // ----------------------------------------------------------
  courses: [
    // ── TEMPLATE ──────────────────────────────────────────
    // {
    //   id: "course-id",              // unique slug
    //   name: "Course Display Name",
    //   shortName: "Short Name",      // used in comparisons
    //   category: "frontend" | "backend" | "fullstack" | "data" | "design" | "devops",
    //   level: "Beginner" | "Intermediate" | "Advanced" | "All Levels",
    //   mode: "Live" | "Recorded" | "Hybrid",
    //   duration: "X Months",         // or null
    //   fee: "₹XX,XXX",              // or null
    //   description: "One-liner",
    //   highlights: ["..."],          // what you'll learn bullets
    //   projects: ["..."],            // projects you'll build (optional)
    //   mentorId: "mentor-id",        // links to mentors array (optional)
    //   enrollUrl: null,              // direct enroll link (optional)
    // },
    // ── END TEMPLATE ──────────────────────────────────────

    {
      id: "react-dev",
      name: "React Development",
      shortName: "React",
      category: "frontend",
      level: "Beginner to Intermediate",
      mode: "Live",
      duration: null,        // Add e.g. "3 Months" when confirmed
      fee: null,             // Add e.g. "₹18,000" when confirmed
      description: "Build modern, interactive UIs with React and the JavaScript ecosystem.",
      highlights: [
        "React fundamentals & JSX",
        "State management & hooks",
        "React Router & navigation",
        "API integration",
        "Component design patterns",
      ],
      projects: null,        // Add project names when confirmed
      mentorId: null,
      enrollUrl: null,
    },
    {
      id: "python-dev",
      name: "Python Development",
      shortName: "Python",
      category: "backend",
      level: "Beginner",
      mode: "Live",
      duration: null,
      fee: null,
      description: "Master Python for scripting, backend development, and automation.",
      highlights: [
        "Python syntax & data structures",
        "Object-oriented programming",
        "File handling & modules",
        "REST APIs with Flask/Django",
        "Database integration",
      ],
      projects: null,
      mentorId: null,
      enrollUrl: null,
    },
    {
      id: "fullstack",
      name: "Full Stack Development",
      shortName: "Full Stack",
      category: "fullstack",
      level: "Intermediate",
      mode: "Live",
      duration: null,
      fee: null,
      description: "End-to-end web development — from UI to server and database.",
      highlights: [
        "HTML, CSS & JavaScript",
        "React frontend",
        "Node.js & Express backend",
        "Database design (SQL/NoSQL)",
        "Deployment & DevOps basics",
      ],
      projects: null,
      mentorId: null,
      enrollUrl: null,
    },
    // ── Add more courses below this line ──────────────────
  ],

  // ----------------------------------------------------------
  // MENTORS
  // Add mentor profiles here. Leave fields null if unknown.
  // ----------------------------------------------------------
  mentors: [
    // ── TEMPLATE ──────────────────────────────────────────
    // {
    //   id: "mentor-id",
    //   name: "Full Name",
    //   role: "Job Title",
    //   expertise: ["React", "JavaScript"],
    //   courseId: "course-id",        // which course they teach
    //   experience: "X years",        // or null
    //   bio: "One-line bio",          // or null
    // },
    // ── END TEMPLATE ──────────────────────────────────────
    // No mentors configured yet — add them above.
  ],

  // ----------------------------------------------------------
  // LEARNING MODES (for the "Live vs Recorded" question)
  // ----------------------------------------------------------
  learningModes: [
    {
      mode: "Live",
      icon: "🔴",
      points: [
        "Instructor-led sessions in real time",
        "Ask questions during class",
        "Immediate mentor feedback",
        "Peer learning with your cohort",
      ],
    },
    {
      mode: "Recorded",
      icon: "🎬",
      points: [
        "Pre-recorded video lessons",
        "Learn at your own pace",
        "Rewatch content anytime",
        "Flexible schedule",
      ],
    },
    {
      mode: "Hybrid",
      icon: "🔀",
      points: [
        "Combination of live sessions and recorded resources",
        "Live mentor interactions",
        "Recorded material for revision",
      ],
    },
  ],

  // ----------------------------------------------------------
  // TRAINING PROCESS (the step-by-step learning journey)
  // ----------------------------------------------------------
  trainingProcess: [
    {
      step: "01",
      title: "Learn",
      description: "Absorb concepts through your chosen course format — live, recorded, or hybrid.",
    },
    {
      step: "02",
      title: "Practice",
      description: "Reinforce understanding with exercises and structured assignments.",
    },
    {
      step: "03",
      title: "Build",
      description: "Work on practical projects that go into your portfolio.",
    },
    {
      step: "04",
      title: "Get Mentored",
      description: "Receive direct guidance, code reviews, and feedback from your mentor.",
    },
    {
      step: "05",
      title: "Prepare",
      description: "Interview prep, mock sessions, and career guidance where applicable.",
    },
    {
      step: "06",
      title: "Career Support",
      description: "Resume help, LinkedIn optimization, and ongoing placement assistance.",
    },
  ],

  // ----------------------------------------------------------
  // INTERNSHIP INFO
  // Set available: true and add details if/when internship
  // program is launched.
  // ----------------------------------------------------------
  internships: {
    available: false,
    details: null,
    // Example when launched:
    // available: true,
    // details: "Selected students may get access to internship opportunities ..."
  },

  // ----------------------------------------------------------
  // PLACEMENT / CAREER SUPPORT
  // ----------------------------------------------------------
  placementSupport: [
    "Resume building & review",
    "LinkedIn profile optimization",
    "Interview preparation",
    "Mock interview sessions",
    "Career guidance & mentorship",
  ],

  // ----------------------------------------------------------
  // ENROLLMENT STEPS
  // ----------------------------------------------------------
  enrollmentSteps: [
    "Browse and choose a course that fits your goals.",
    "View the full course details page.",
    "Click the Enroll button on the course page.",
    "Complete the enrollment form.",
    "Proceed to payment if applicable.",
    "Receive your batch joining details via email/WhatsApp.",
  ],

  // ----------------------------------------------------------
  // FAQs
  // Add common questions here. The chatbot uses these as
  // fallback answers for unmatched queries.
  // ----------------------------------------------------------
  faqs: [
    {
      q: "Do I need prior coding experience?",
      a: "It depends on the course. Beginner courses start from scratch. Check the course level before enrolling.",
    },
    {
      q: "Will I get a certificate?",
      a: "Please contact the Kini Edx Hub team for the latest information on certifications.",
    },
    {
      q: "Are classes recorded?",
      a: "This depends on the course mode. Live courses may or may not provide recordings — please check the specific course details or contact us.",
    },
    {
      q: "How many students per batch?",
      a: "Kini Edx Hub keeps cohort sizes small to ensure personalized attention. Contact us for current batch sizes.",
    },
    {
      q: "Is there an EMI or instalment option?",
      a: "Please contact the Kini Edx Hub team for the latest payment plan options.",
    },
    {
      q: "How do I contact support?",
      a: "Use the 'Talk to Kini Edx Hub' button in this chat or visit the Contact page on the website.",
    },
  ],
};