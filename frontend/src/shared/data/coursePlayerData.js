 
// ═══════════════════════════════════════════════════════════════════
// COURSE PLAYER — Mock Data
// ═══════════════════════════════════════════════════════════════════
//
// TODO: API Integration — Replace with API calls
// =================================
 
export const COURSE_PLAYER_DATA = {
  id: "crs-001",
  title: "Full-Stack JavaScript Mastery",
  description:
    "Master modern full-stack JavaScript development from the ground up. Build real-world applications with React, Node.js, MongoDB, and TypeScript. This comprehensive course covers frontend architecture, RESTful APIs, authentication, deployment, and best practices used in production applications.",
  longDescription:
    "This professional-grade course takes you from intermediate JavaScript knowledge to production-ready full-stack developer. You'll build 5 complete projects, work with real APIs, implement authentication systems, and deploy to cloud platforms. Each module includes hands-on exercises, code reviews, and best practices.",
  instructor: {
    id: "ins-001",
    name: "Dr. Sarah Chen",
    avatar: null,
    title: "Senior Full-Stack Engineer at Google",
    bio: "15+ years of experience in full-stack development. Former Tech Lead at Google, where she led the frontend architecture team. Passionate about teaching and building beautiful, scalable applications.",
    students: 12400,
    courses: 4,
    rating: 4.8,
    tags: ["React", "Node.js", "TypeScript", "System Design"],
  },
  rating: 4.8,
  studentCount: 12400,
  difficulty: "Intermediate",
  language: "English",
  estimatedCompletion: "24 hours",
  validTill: "31 Dec 2028",
  totalLessons: 48,
  completedLessons: 36,
  progress: 75,
  lastAccessed: "2024-12-15T10:30:00Z",
  tags: [
    "JavaScript",
    "React",
    "Node.js",
    "MongoDB",
    "TypeScript",
    "REST API",
  ],
  thumbnail:
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
  learningOutcomes: [
    "Build production-ready React applications with hooks and state management",
    "Design and implement RESTful APIs with Node.js and Express",
    "Work with MongoDB for data persistence and aggregation",
    "Implement JWT authentication and authorization flows",
    "Deploy full-stack applications to cloud platforms",
    "Write clean, maintainable TypeScript code",
  ],
  sections: [
    {
      id: "sec-1",
      title: "Foundation & Setup",
      duration: "2.5 hours",
      sectionAssessment: {
        id: "asm-001",
        title: "JavaScript Fundamentals",
        description: "Test your JavaScript fundamentals before proceeding to the next section.",
      },
      lessons: [
        {
          id: "l-1",
          title: "Welcome to the Course",
          duration: "10:30",
          videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8",
          type: "video",
          isCompleted: true,
          isLocked: false,
          assessmentPassed: true,
        },
        {
          id: "l-2",
          title: "Development Environment Setup",
          duration: "15:45",
          videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8",
          type: "video",
          isCompleted: true,
          isLocked: false,
          assessmentPassed: true,
        },
        {
          id: "l-3",
          title: "JavaScript ES6+ Refresher",
          duration: "22:00",
          videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8",
          type: "video",
          isCompleted: true,
          isLocked: false,
          assessmentPassed: true,
        },
        {
          id: "l-4",
          title: "Project Setup & Architecture",
          duration: "18:20",
          videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8",
          type: "video",
          isCompleted: true,
          isLocked: false,
          assessmentPassed: true,
        },
        {
          id: "l-5",
          title: "Foundation Quiz",
          duration: "10:00",
          videoUrl: "",
          type: "quiz",
          isCompleted: true,
          isLocked: false,
        },
      ],
    },
    {
      id: "sec-2",
      title: "React Fundamentals",
      duration: "4 hours",
      sectionAssessment: {
        id: "asm-002",
        title: "React Mastery",
        description: "Demonstrate your React skills to unlock the next section.",
      },
      lessons: [
        {
          id: "l-6",
          title: "Components & JSX Deep Dive",
          duration: "25:00",
          videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8",
          type: "video",
          isCompleted: true,
          isLocked: false,
          assessmentPassed: true,
        },
        {
          id: "l-7",
          title: "State Management with Hooks",
          duration: "32:00",
          videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8",
          type: "video",
          isCompleted: true,
          isLocked: false,
          assessmentPassed: true,
        },
        {
          id: "l-8",
          title: "Props, Events & Conditional Rendering",
          duration: "28:00",
          videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8",
          type: "video",
          isCompleted: true,
          isLocked: false,
          assessmentPassed: true,
        },
        {
          id: "l-9",
          title: "Forms & Controlled Components",
          duration: "20:00",
          videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8",
          type: "video",
          isCompleted: true,
          isLocked: false,
          assessmentPassed: true,
        },
        {
          id: "l-10",
          title: "React Router & Navigation",
          duration: "22:00",
          videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8",
          type: "video",
          isCompleted: true,
          isLocked: false,
          assessmentPassed: true,
        },
        {
          id: "l-11",
          title: "React Fundamentals Project",
          duration: "45:00",
          videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8",
          type: "project",
          isCompleted: true,
          isLocked: false,
        },
      ],
    },
    {
      id: "sec-3",
      title: "Advanced React Patterns",
      duration: "5 hours",
      sectionAssessment: {
        id: "asm-003",
        title: "TypeScript Essentials",
        description: "Pass this assessment to unlock advanced backend content.",
      },
      lessons: [
        {
          id: "l-12",
          title: "Custom Hooks & Composability",
          duration: "30:00",
          videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8",
 
 type: "video",
          isCompleted: true,
          isLocked: false,
          assessmentPassed: true,
        },
        {
          id: "l-13",
          title: "Context API & Performance Optimization",
          duration: "35:00",
          videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8",
          type: "video",
          isCompleted: false,
          isLocked: false,
          assessment: {
            title: "Context API & Performance",
            passingScore: 70,
            questions: [
              {
                id: "q-l13-1",
                question: "What is the primary purpose of React's Context API?",
                options: ["To manage component styling", "To share data across the component tree without prop drilling", "To handle API requests", "To optimize rendering performance"],
                correctAnswer: 1,
              },
              {
                id: "q-l13-2",
                question: "Which hook is commonly used to optimize re-renders in React?",
                options: ["useEffect", "useState", "useMemo", "useRef"],
                correctAnswer: 2,
              },
              {
                id: "q-l13-3",
                question: "What does React.memo do?",
                options: ["Memoizes function results", "Prevents re-render when props haven't changed", "Stores values in local storage", "Caches API responses"],
                correctAnswer: 1,
              },
            ],
          },
        },
        {
          id: "l-14",
          title: "Advanced State Management (useReducer)",
          duration: "28:00",
          videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8",
          type: "video",
          isCompleted: false,
          isLocked: false,
          assessment: {
            title: "useReducer Assessment",
            passingScore: 70,
            questions: [
              {
                id: "q-l14-1",
                question: "What does useReducer return?",
                options: ["[state, setState]", "[state, dispatch]", "{ state, dispatch }", "[value, setValue, resetValue]"],
                correctAnswer: 1,
              },
              {
                id: "q-l14-2",
                question: "When is useReducer preferred over useState?",
                options: ["For simple boolean toggles", "When state logic involves multiple sub-values or complex transitions", "When you need to store strings", "For form input binding only"],
                correctAnswer: 1,
              },
              {
                id: "q-l14-3",
                question: "What should a reducer function return?",
                options: ["The previous state", "The action object", "The new state based on the action", "A boolean indicating success"],
                correctAnswer: 2,
              },
            ],
          },
        },
        {
          id: "l-15",
          title: "Error Boundaries & Suspense",
          duration: "22:00",
          videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8",
          type: "video",
          isCompleted: false,
          isLocked: false,
          assessment: {
            title: "Error Boundaries & Suspense",
            passingScore: 70,
            questions: [
              {
                id: "q-l15-1",
                question: "Which lifecycle methods can an Error Boundary use?",
                options: ["componentDidMount and componentWillUnmount", "getDerivedStateFromError and componentDidCatch", "shouldComponentUpdate and getSnapshotBeforeUpdate", "render and constructor"],
                correctAnswer: 1,
              },
              {
                id: "q-l15-2",
                question: "What does React.Suspense allow you to do?",
                options: ["Suspend component rendering until a condition is met", "Handle errors in async code", "Show a fallback while waiting for content to load", "Pause state updates"],
                correctAnswer: 2,
              },
              {
                id: "q-l15-3",
                question: "Which components CAN an Error Boundary catch errors from?",
                options: ["Its own render method", "Event handlers inside child components", "Child components in the tree below it", "setTimeout callbacks"],
                correctAnswer: 2,
              },
            ],
          },
        },
        {
          id: "l-16",
          title: "Testing React Components",
          duration: "40:00",
          videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8",
          type: "video",
          isCompleted: false,
          isLocked: true,
          assessment: {
            title: "Testing React Components",
            passingScore: 70,
            questions: [
              {
                id: "q-l16-1",
                question: "What is the primary testing library recommended for React?",
                options: ["Mocha", "Jasmine", "React Testing Library", "Cypress"],
                correctAnswer: 2,
              },
              {
                id: "q-l16-2",
                question: "What does 'fireEvent' do in testing?",
                options: ["Simulates user events like clicks and typing", "Fires API requests", "Triggers component mount", "Updates test snapshots"],
                correctAnswer: 0,
              },
              {
                id: "q-l16-3",
                question: "What is the recommended query priority in React Testing Library?",
                options: ["Test IDs first", "Accessible queries (getByRole, getByLabelText) first", "CSS selectors first", "Class names first"],
                correctAnswer: 1,
              },
            ],
          },
        },
      ],
    },
    {
      id: "sec-4",
      title: "Node.js & Express Backend",
      duration: "5.5 hours",
      sectionAssessment: {
        id: "asm-005",
        title: "Node.js Backend Basics",
        description: "Validate your backend knowledge to move forward.",
      },
      lessons: [
        {
          id: "l-18",
          title: "Node.js Runtime & NPM",
          duration: "20:00",
          videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8",
          type: "video",
          isCompleted: false,
          isLocked: true,
          assessment: {
            title: "Node.js & NPM Basics",
            passingScore: 70,
            questions: [
              {
                id: "q-l18-1",
                question: "What does NPM stand for?",
                options: ["Node Package Manager", "Node Project Manager", "New Package Manager", "Node Protocol Manager"],
                correctAnswer: 0,
              },
              {
                id: "q-l18-2",
                question: "Which file tracks project dependencies in a Node.js project?",
                options: ["index.js", "config.json", "package.json", "node_modules.json"],
                correctAnswer: 2,
              },
              {
                id: "q-l18-3",
                question: "What is the event loop in Node.js?",
                options: ["A loop that runs events in order", "A mechanism that handles asynchronous callbacks", "A way to iterate over arrays", "A browser API for handling clicks"],
                correctAnswer: 1,
              },
            ],
          },
        },
        {
          id: "l-19",
          title: "Express.js: Routes & Middleware",
          duration: "35:00",
          videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8",
          type: "video",
          isCompleted: false,
          isLocked: true,
          assessment: {
            title: "Express.js Assessment",
            passingScore: 70,
            questions: [
              {
                id: "q-l19-1",
                question: "What is middleware in Express.js?",
                options: ["A database driver", "Functions executed during the request-response cycle", "A templating engine", "A type of route"],
                correctAnswer: 1,
              },

{
                id: "q-l19-2",
                question: "How do you define a GET route in Express?",
                options: ["app.get('/path', handler)", "app.route('GET', '/path', handler)", "router.get('/path', handler)", "Both app.get and router.get"],
                correctAnswer: 3,
              },
              {
                id: "q-l19-3",
                question: "What does 'next()' do in Express middleware?",
                options: ["Terminates the request", "Passes control to the next middleware function", "Sends a response to the client", "Restarts the server"],
                correctAnswer: 1,
              },
            ],
          },
        },
        {
          id: "l-20",
          title: "REST API Design Principles",
          duration: "28:00",
          videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8",
          type: "video",
          isCompleted: false,
          isLocked: true,
          assessment: {
            title: "REST API Design",
            passingScore: 70,
            questions: [
              {
                id: "q-l20-1",
                question: "Which HTTP method is used to update an existing resource?",
                options: ["GET", "POST", "PUT / PATCH", "DELETE"],
                correctAnswer: 2,
              },
              {
                id: "q-l20-2",
                question: "What should a RESTful endpoint look like for fetching a user?",
                options: ["/getUser?id=5", "/users/5", "/user?id=5&action=get", "/api/v1/get-user/5"],
                correctAnswer: 1,
              },
              {
                id: "q-l20-3",
                question: "What status code indicates a successful resource creation?",
                options: ["200", "201", "204", "301"],
                correctAnswer: 1,
              },
            ],
          },
        },
        {
          id: "l-21",
          title: "MongoDB Integration with Mongoose",
          duration: "42:00",
          videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8",
          type: "video",
          isCompleted: false,
          isLocked: true,
          assessment: {
            title: "MongoDB & Mongoose",
            passingScore: 70,
            questions: [
              {
                id: "q-l21-1",
                question: "What is Mongoose?",
                options: ["A NoSQL database", "An ODM library for MongoDB and Node.js", "A query language for MongoDB", "A caching layer"],
                correctAnswer: 1,
              },
              {
                id: "q-l21-2",
                question: "What does a Mongoose 'Schema' define?",
                options: ["The database connection string", "The structure of documents in a collection", "The API endpoints", "The server configuration"],
                correctAnswer: 1,
              },
              {
                id: "q-l21-3",
                question: "How do you find all documents matching a condition in Mongoose?",
                options: ["Model.find({ condition })", "Model.getAll({ condition })", "Model.query({ condition })", "Model.select({ condition })"],
                correctAnswer: 0,
              },
            ],
          },
        },
        {
          id: "l-22",
          title: "Authentication & JWT",
          duration: "38:00",
          videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8",
          type: "video",
          isCompleted: false,
          isLocked: true,
          assessment: {
            title: "JWT Authentication",
            passingScore: 70,
            questions: [
              {
                id: "q-l22-1",
                question: "What does JWT stand for?",
                options: ["Java Web Token", "JSON Web Token", "JavaScript Web Token", "Java Web Toolkit"],
                correctAnswer: 1,
              },
              {
                id: "q-l22-2",
                question: "Where should a JWT token typically be stored on the client?",
                options: ["In a plain text file", "In localStorage or httpOnly cookie", "In the URL query string", "In a global variable"],
                correctAnswer: 1,
              },
              {
                id: "q-l22-3",
                question: "What does the 'Bearer' prefix mean in an Authorization header?",
                options: ["The token is only valid for one request", "The token is a bearer token that grants access to the bearer", "The request is from a mobile device", "The token is encrypted"],
                correctAnswer: 1,
              },
            ],
          },
        },
      ],
    },
    {
      id: "sec-5",
      title: "Deployment & Best Practices",
      duration: "3 hours",
      sectionAssessment: {
        id: "asm-006",
        title: "REST API Design Principles",
        description: "Complete this final assessment to earn your certificate.",
      },
      lessons: [
        {
          id: "l-23",
          title: "Environment Configuration",
          duration: "18:00",
          videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8",
          type: "video",
          isCompleted: false,
          isLocked: true,
          assessment: {
            title: "Environment Configuration",
            passingScore: 70,
            questions: [
              {
                id: "q-l23-1",
                question: "What is the purpose of environment variables?",
                options: ["To style the application", "To store configuration outside the codebase", "To track user sessions", "To log errors"],
                correctAnswer: 1,
              },
              {
                id: "q-l23-2",
                question: "Which file is commonly used for environment variables?",
                options: ["config.js", "settings.json", ".env", "environment.json"],
                correctAnswer: 2,
              },
              {
                id: "q-l23-3",
                question: "Should .env files be committed to version control?",
                options: ["Yes, always", "No, they contain secrets and environment-specific config", "Only for development", "Only for production"],
                correctAnswer: 1,
              },
            ],
          },
        },
        {
          id: "l-24",
          title: "CI/CD Pipeline Setup",
          duration: "30:00",
          videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8",
          type: "video",
          isCompleted: false,
          isLocked: true,
          assessment: {
            title: "CI/CD Pipeline",
            passingScore: 70,
            questions: [
              {
                id: "q-l24-1",
                question: "What does CI stand for?",
                options: ["Code Integration", "Continuous Integration", "Common Interface", "Code Inspection"],
                correctAnswer: 1,
              },
              {
                id: "q-l24-2",
                question: "What is the main benefit of a CI/CD pipeline?",
                options: ["Faster page loading", "Automated testing and deployment", "Better UI design", "Reduced server costs"],
                correctAnswer: 1,
              },
              {
                id: "q-l24-3",
                question: "Which of these is a popular CI/CD service?",
                options: ["MongoDB", "GitHub Actions", "React", "Node.js"],
                correctAnswer: 1,
              },
            ],
          },
        },
        {
          id: "l-25",
          title: "Cloud Deployment (Vercel + Render)",
          duration: "35:00",
          videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8",
          type: "video",
          isCompleted: false,
          isLocked: true,

 assessment: {
            title: "Cloud Deployment",
            passingScore: 70,
            questions: [
              {
                id: "q-l25-1",
                question: "What is Vercel best suited for?",
                options: ["Backend API hosting", "Frontend deployment with serverless functions", "Database hosting", "File storage"],
                correctAnswer: 1,
              },
              {
                id: "q-l25-2",
                question: "What does 'deploy' mean in cloud computing?",
                options: ["Delete an application", "Make an application available on a server", "Test application code", "Write application documentation"],
                correctAnswer: 1,
              },
              {
                id: "q-l25-3",
                question: "Which file typically configures a Vercel deployment?",
                options: ["Dockerfile", "vercel.json", "deploy.config", "package.json"],
                correctAnswer: 1,
              },
            ],
          },
        },
        {
          id: "l-26",
          title: "Monitoring & Error Tracking",
          duration: "22:00",
          videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8",
          type: "video",
          isCompleted: false,
          isLocked: true,
          assessment: {
            title: "Monitoring & Error Tracking",
            passingScore: 70,
            questions: [
              {
                id: "q-l26-1",
                question: "Why is error tracking important in production?",
                options: ["It makes the app faster", "It helps identify and fix issues users are experiencing", "It automatically fixes bugs", "It generates code documentation"],
                correctAnswer: 1,
              },
              {
                id: "q-l26-2",
                question: "What is Sentry?",
                options: ["A CI/CD tool", "An error tracking and monitoring platform", "A database", "A frontend framework"],
                correctAnswer: 1,
              },
              {
                id: "q-l26-3",
                question: "What should you monitor in a production application?",
                options: ["Only error logs", "Server uptime, response times, error rates, and resource usage", "Only user activity", "Only database queries"],
                correctAnswer: 1,
              },
            ],
          },
        },
        {
          id: "l-27",
          title: "Final Project: Full-Stack App",
          duration: "60:00",
          videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8",
          type: "project",
          isCompleted: false,
          isLocked: true,
        },
        {
          id: "l-28",
          title: "Course Completion Quiz",
          duration: "30:00",
          videoUrl: "",
          type: "quiz",
          isCompleted: false,
          isLocked: true,
        },
      ],
    },
  ],
  resources: [
    {
      id: "res-1",
      title: "Course Notes PDF",
      type: "pdf",
      size: "2.4 MB",
      url: "#",
    },
    {
      id: "res-2",
      title: "Project Starter Templates",
      type: "zip",
      size: "8.1 MB",
      url: "#",
    },
    {
      id: "res-3",
      title: "Cheat Sheet: React Hooks",
      type: "pdf",
      size: "0.5 MB",
      url: "#",
    },
    {
      id: "res-4",
      title: "API Reference Documentation",
      type: "link",
      size: "",
      url: "#",
    },
    {
      id: "res-5",
      title: "Course GitHub Repository",
      type: "github",
      size: "",
      url: "#",
    },
    {
      id: "res-6",
      title: "Slide Deck: Week 1-3",
      type: "pdf",
      size: "4.2 MB",
      url: "#",
    },
  ],
  discussions: [
    {
      id: "disc-1",
      type: "mentor",
      author: "Rahul K.",
      avatar: null,
      question: "How do I handle CORS errors when connecting React to Express?",
      replies: 4,
      likes: 12,
      isPinned: true,
      time: "2 days ago",
      repliesList: [
        {
          id: "reply-1",
          author: "Dr. Sarah Chen",
          avatar: null,
          content:
            "You need to configure CORS middleware in your Express server. Install the `cors` package and allow your deployed frontend origin during production.",
          likes: 8,
          time: "1 day ago",
          isInstructor: true,
        },
        {
          id: "reply-2",
          author: "Priya M.",
          avatar: null,
          content:
            "Adding to Sarah's point — also make sure your frontend is sending requests to the correct backend URL. I had a typo in my axios baseURL that caused CORS-like errors.",
          likes: 3,
          time: "12 hours ago",
          isInstructor: false,
        },
      ],
    },
    {
      id: "disc-2",
      type: "mentor",
      author: "Arun S.",
      avatar: null,
      question:
        "Best practice for managing authentication state across page refreshes?",
      replies: 2,
      likes: 8,
      isPinned: false,
      time: "5 days ago",
      repliesList: [
        {
          id: "reply-3",
          author: "Dr. Sarah Chen",
          avatar: null,
          content:
            "I recommend storing the JWT token in localStorage and verifying it on app mount. Create an AuthContext that checks for the stored token and validates expiration before setting the authenticated state. We cover this in detail in Lesson 22.",
          likes: 6,
          time: "4 days ago",
          isInstructor: true,
        },
      ],
    },
    {
      id: "disc-3",
      type: "peer",
      author: "Neha G.",
      avatar: null,
      question: "Difference between useMemo and useCallback?",
      replies: 3,
      likes: 15,
      isPinned: false,
      time: "1 week ago",
      repliesList: [],
    },
  ],
  quiz: {
    title: "React & TypeScript Fundamentals",
    timeLimit: 30,
    passingScore: 70,
    questions: [
      {

 id: "q-1",
        question:
          "What is the correct way to update state based on previous state in React?",
        options: [
          "setCount(count + 1)",
          "setCount(prev => prev + 1)",
          "count = count + 1",
          "this.setState({ count: count + 1 })",
        ],
        correctAnswer: 1,
      },
      {
        id: "q-2",
        question: "Which hook would you use to run code after component mount?",
        options: ["useMemo", "useEffect", "useCallback", "useLayoutEffect"],
        correctAnswer: 1,
      },
      {
        id: "q-3",
        question: "What does the `key` prop do in React lists?",
        options: [
          "Styles the list item",
          "Helps React identify which items changed",
          "Sets the list item's index",
          "Binds event handlers",
        ],
        correctAnswer: 1,
      },
      {
        id: "q-4",
        question: "Which HTTP method should be used to update an existing resource?",
        options: ["GET", "POST", "PUT", "DELETE"],
        correctAnswer: 2,
      },
      {
        id: "q-5",
        question: "What is the primary purpose of TypeScript in React?",
        options: [
          "Faster runtime performance",
          "Type safety and better developer experience",
          "Smaller bundle size",
          "Automatic CSS styling",
        ],
        correctAnswer: 1,
      },
    ],
  },
  certificate: {
    title: "Full-Stack JavaScript Mastery",
    issuer: "Kini EduHub Academy",
    issueDate: null,
    credentialId: null,
    isEarned: false,
    previewUrl: "#",
  },
};
 
// ═══════════════════════════════════════════════════════════════════
// COURSE #2 — Python for Data Science
// ═══════════════════════════════════════════════════════════════════
 
export const PYTHON_COURSE_DATA = {
  id: "crs-002",
  title: "Python for Data Science",
  description:
    "Master Python programming for data science and analytics. Learn Pandas, NumPy, Matplotlib, and machine learning fundamentals through hands-on projects with real-world datasets.",
  longDescription:
    "This beginner-friendly course takes you from Python basics to data science proficiency. You'll work with real datasets, build visualizations, implement machine learning models, and deploy data pipelines. Each module includes practical exercises and real-world case studies.",
  instructor: {
    id: "ins-002",
    name: "Prof. Michael Roberts",
    avatar: null,
    title: "Data Science Lead at DataTech Inc.",
    bio: "12+ years in data science and analytics. Former Lead Data Scientist at DataTech, specializing in Python, ML, and statistical modeling. Passionate about making data science accessible to everyone.",
    students: 8900,
    courses: 3,
    rating: 4.6,
    tags: ["Python", "Data Science", "Machine Learning", "Pandas"],
  },
  rating: 4.6,
  studentCount: 8900,
  difficulty: "Beginner",
  language: "English",
  estimatedCompletion: "18 hours",
  totalLessons: 24,
  completedLessons: 9,
  progress: 38,
  lastAccessed: "2024-12-10T08:15:00Z",
  tags: ["Python", "Data Science", "Pandas", "NumPy", "Matplotlib", "Machine Learning"],
  thumbnail:
    "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800",
  learningOutcomes: [
    "Write Python code for data manipulation and analysis",
    "Use Pandas for data cleaning and transformation",
    "Create compelling visualizations with Matplotlib and Seaborn",
    "Build and evaluate machine learning models",
    "Work with real-world datasets and data pipelines",
    "Deploy data science projects to the cloud",
  ],
  sections: [
    {
      id: "py-sec-1",
      title: "Python Fundamentals for Data Science",
      duration: "3 hours",
      sectionAssessment: {
        id: "asm-012",
        title: "Python Programming",
        description: "Test your Python fundamentals before proceeding to data analysis.",
      },
      lessons: [
        {
          id: "py-l-1", title: "Welcome to Python for Data Science", duration: "8:00", videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8", type: "video", isCompleted: true, isLocked: false, assessmentPassed: true,
        },
        {
          id: "py-l-2", title: "Python Environment Setup (Anaconda + Jupyter)", duration: "14:00", videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8", type: "video", isCompleted: true, isLocked: false, assessmentPassed: true,
        },
        {
          id: "py-l-3", title: "Python Data Types & Structures", duration: "20:00", videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8", type: "video", isCompleted: true, isLocked: false, assessmentPassed: true,
        },
        {
          id: "py-l-4", title: "Functions, Loops & List Comprehensions", duration: "18:00", videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8", type: "video", isCompleted: false, isLocked: false,
        },
        {
          id: "py-l-5", title: "NumPy Essentials for Numerical Computing", duration: "25:00", videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8", type: "video", isCompleted: false, isLocked: false,
        },
        {
          id: "py-l-6", title: "Python Basics Quiz", duration: "10:00", videoUrl: "", type: "quiz", isCompleted: false, isLocked: false,
        },
      ],
    },
    {
      id: "py-sec-2",
      title: "Data Analysis with Pandas",
      duration: "5 hours",
      sectionAssessment: {
        id: "asm-007",
        title: "SQL & Database Fundamentals",
        description: "Demonstrate your data analysis skills to proceed.",
      },
      lessons: [
        {
          id: "py-l-7", title: "Introduction to Pandas DataFrames", duration: "22:00", videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8", type: "video", isCompleted: false, isLocked: true,
        },
        {
          id: "py-l-8", title: "Data Cleaning & Handling Missing Values", duration: "28:00", videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8", type: "video", isCompleted: false, isLocked: true,
        },
        {
          id: "py-l-9", title: "Data Transformation & Grouping", duration: "25:00", videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8", type: "video", isCompleted: false, isLocked: true,
        },
        {
          id: "py-l-10", title: "Merging, Joining & Concatenating DataFrames", duration: "20:00", videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8", type: "video", isCompleted: false, isLocked: true,
        },
      ],
    },
    {
      id: "py-sec-3",
      title: "Data Visualization & Machine Learning",
      duration: "4 hours",
      sectionAssessment: {
        id: "asm-009",
        title: "Problem Solving & Algorithms",
        description: "Complete this section to earn your certificate.",
      },
      lessons: [
        {
          id: "py-l-11", title: "Data Visualization with Matplotlib", duration: "30:00", videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8", type: "video", isCompleted: false, isLocked: true,
        },
        {
          id: "py-l-12", title: "Statistical Charts with Seaborn", duration: "25:00", videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8", type: "video", isCompleted: false, isLocked: true,
        },
        {
          id: "py-l-13", title: "Introduction to Machine Learning with Scikit-learn", duration: "35:00", videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8", type: "video", isCompleted: false, isLocked: true,
        },
        {
          id: "py-l-14", title: "Final Project: Data Analysis Portfolio", duration: "60:00", videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8", type: "project", isCompleted: false, isLocked: true,
        },
      ],
    },
  ],
  resources: [
    { id: "py-res-1", title: "Python Cheat Sheet", type: "pdf", size: "1.2 MB", url: "#" },
    { id: "py-res-2", title: "Sample Datasets", type: "zip", size: "15 MB", url: "#" },
    { id: "py-res-3", title: "Jupyter Notebook Templates", type: "zip", size: "3.5 MB", url: "#" },
  ],
  discussions: [
    {
      id: "py-disc-1", type: "mentor", author: "Priya S.", avatar: null,
      question: "How do I handle large datasets that don't fit in memory?", replies: 3, likes: 9, isPinned: true, time: "3 days ago",
      repliesList: [
        { id: "py-reply-1", author: "Prof. Michael Roberts", avatar: null, content: "For large datasets, consider using chunking with Pandas' read_csv(chunksize=...) or switch to Dask for out-of-core computing.", likes: 5, time: "2 days ago", isInstructor: true },
      ],
    },
    {
      id: "py-disc-2", type: "peer", author: "Ananya K.", avatar: null,
      question: "What's the best way to visualize time series data?", replies: 2, likes: 6, isPinned: false, time: "1 week ago", repliesList: [],
    },
  ],
  quiz: {
    title: "Python & Data Science Fundamentals", timeLimit: 25, passingScore: 70,
    questions: [
 
 { id: "py-q-1", question: "Which Python library is primarily used for data manipulation?", options: ["NumPy", "Pandas", "Matplotlib", "Scikit-learn"], correctAnswer: 1 },
      { id: "py-q-2", question: "What does the `groupby()` method do in Pandas?", options: ["Groups rows by column values", "Sorts the DataFrame", "Filters missing values", "Merges two DataFrames"], correctAnswer: 0 },
      { id: "py-q-3", question: "Which plot type is best for showing the distribution of a dataset?", options: ["Line plot", "Bar chart", "Histogram", "Scatter plot"], correctAnswer: 2 },
    ],
  },
  certificate: {
    title: "Python for Data Science", issuer: "Kini EduHub Academy", issueDate: null, credentialId: null, isEarned: false, previewUrl: "#",
  },
};
 
// ═══════════════════════════════════════════════════════════════════
// COURSE #3 — React & TypeScript Advanced
// ═══════════════════════════════════════════════════════════════════
 
export const REACT_ADVANCED_COURSE_DATA = {
  id: "crs-003",
  title: "React & TypeScript Advanced",
  description:
    "Take your React skills to the next level with TypeScript. Master advanced patterns, state management, testing, performance optimization, and production deployment techniques.",
  longDescription:
    "This advanced course is designed for experienced React developers who want to master TypeScript integration, build scalable architectures, implement complex state management, and optimize production applications. You'll work on real-world projects and learn enterprise-grade patterns.",
  instructor: {
    id: "ins-003",
    name: "Emily Watson",
    avatar: null,
    title: "Senior Frontend Architect at Netflix",
    bio: "10+ years in frontend development. Senior Frontend Architect at Netflix, specializing in React, TypeScript, and performance optimization. Authored multiple open-source React libraries.",
    students: 15200,
    courses: 3,
    rating: 4.9,
    tags: ["React", "TypeScript", "Next.js", "Testing"],
  },
  rating: 4.9,
  studentCount: 15200,
  difficulty: "Advanced",
  language: "English",
  estimatedCompletion: "16 hours",
  totalLessons: 28,
  completedLessons: 28,
  progress: 100,
  lastAccessed: "2024-12-20T14:30:00Z",
  tags: ["React", "TypeScript", "Next.js", "Testing", "Performance", "State Management"],
  thumbnail:
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
  learningOutcomes: [
    "Build type-safe React applications with TypeScript",
    "Implement advanced state management with Zustand and Redux Toolkit",
    "Write comprehensive tests with React Testing Library and Cypress",
    "Optimize React application performance",
    "Build full-stack apps with Next.js",
    "Deploy and monitor production React apps",
  ],
  sections: [
    {
      id: "ra-sec-1",
      title: "TypeScript with React Deep Dive",
      duration: "3.5 hours",
      sectionAssessment: {
        id: "asm-003",
        title: "TypeScript Essentials",
        description: "Validate your TypeScript knowledge before proceeding.",
      },
      lessons: [
        {
          id: "ra-l-1", title: "Welcome & Course Overview", duration: "8:00", videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8", type: "video", isCompleted: true, isLocked: false, assessmentPassed: true,
        },
        {
          id: "ra-l-2", title: "TypeScript Setup with React", duration: "15:00", videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8", type: "video", isCompleted: true, isLocked: false, assessmentPassed: true,
        },
        {
          id: "ra-l-3", title: "Generic Components & Custom Hooks", duration: "28:00", videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8", type: "video", isCompleted: true, isLocked: false, assessmentPassed: true,
        },
        {
          id: "ra-l-4", title: "Advanced Type Patterns in React", duration: "32:00", videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8", type: "video", isCompleted: true, isLocked: false, assessmentPassed: true,
        },
        {
          id: "ra-l-5", title: "TypeScript Quiz", duration: "10:00", videoUrl: "", type: "quiz", isCompleted: true, isLocked: false,
        },
      ],
    },
    {
      id: "ra-sec-2",
      title: "Advanced State Management & Testing",
      duration: "4 hours",
      sectionAssessment: {
        id: "asm-002",
        title: "React Mastery",
        description: "Master advanced React patterns to continue.",
      },
      lessons: [
        {
          id: "ra-l-6", title: "State Management with Zustand", duration: "25:00", videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8", type: "video", isCompleted: true, isLocked: false, assessmentPassed: true,
        },
        {
          id: "ra-l-7", title: "Redux Toolkit & Redux Thunks", duration: "35:00", videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8", type: "video", isCompleted: true, isLocked: false, assessmentPassed: true,
        },
        {
          id: "ra-l-8", title: "Unit Testing with React Testing Library", duration: "30:00", videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8", type: "video", isCompleted: true, isLocked: false,
        },
        {
          id: "ra-l-9", title: "E2E Testing with Cypress", duration: "28:00", videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8", type: "video", isCompleted: false, isLocked: false,
        },
      ],
    },
    {
      id: "ra-sec-3",
      title: "Performance & Production",
      duration: "3.5 hours",
      sectionAssessment: {
        id: "asm-010",
        title: "Data Structures Mastery",
        description: "Complete the final section to earn your certificate.",
      },
      lessons: [
        {
          id: "ra-l-10", title: "React Performance Optimization", duration: "30:00", videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8", type: "video", isCompleted: false, isLocked: true,
        },
        {
          id: "ra-l-11", title: "Bundle Optimization & Code Splitting", duration: "22:00", videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8", type: "video", isCompleted: false, isLocked: true,
        },
        {
          id: "ra-l-12", title: "Next.js & Server Components", duration: "35:00", videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8", type: "video", isCompleted: false, isLocked: true,
        },
        {
          id: "ra-l-13", title: "CI/CD & Production Deployment", duration: "20:00", videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8", type: "video", isCompleted: false, isLocked: true,
        },
        {
          id: "ra-l-14", title: "Final Project: Enterprise Dashboard", duration: "60:00", videoUrl: "https://www.youtube.com/embed/pN6jk0uUrD8", type: "project", isCompleted: false, isLocked: true,
        },
      ],
    },
  ],
  resources: [
    { id: "ra-res-1", title: "Advanced React Patterns Guide", type: "pdf", size: "3.1 MB", url: "#" },
    { id: "ra-res-2", title: "TypeScript React Cheat Sheet", type: "pdf", size: "0.8 MB", url: "#" },
    { id: "ra-res-3", title: "Testing Cookbook", type: "link", size: "", url: "#" },
  ],
  discussions: [
    {
      id: "ra-disc-1", type: "mentor", author: "Alex M.", avatar: null,
      question: "When should I use Zustand vs Redux Toolkit?", replies: 5, likes: 14, isPinned: true, time: "1 day ago",
      repliesList: [
        { id: "ra-reply-1", author: "Emily Watson", avatar: null, content: "Zustand is great for simpler state needs with less boilerplate. Redux Toolkit shines in larger apps with complex async workflows, middleware, and DevTools.", likes: 7, time: "12 hours ago", isInstructor: true },
      ],
    },
    {
      id: "ra-disc-2", type: "peer", author: "James W.", avatar: null,
      question: "How do I type Redux thunks with TypeScript?", replies: 3, likes: 8, isPinned: false, time: "4 days ago", repliesList: [],
    },
  ],
  quiz: {
    title: "Advanced React & TypeScript", timeLimit: 30, passingScore: 75,
    questions: [
      { id: "ra-q-1", question: "What is the purpose of React.memo?", options: ["To memoize values", "To prevent unnecessary re-renders", "To cache API calls", "To optimize images"], correctAnswer: 1 },
      { id: "ra-q-2", question: "In TypeScript, what does `Partial<Type>` do?", options: ["Makes all properties required", "Makes all properties optional", "Picks specific properties", "Omits properties"], correctAnswer: 1 },
      { id: "ra-q-3", question: "Which tool is best for E2E testing React apps?", options: ["Jest", "React Testing Library", "Cypress", "Vitest"], correctAnswer: 2 },
    ],
  },
  certificate: {
    title: "React & TypeScript Advanced", issuer: "Kini EduHub Academy", issueDate: "2024-12-20", credentialId: "CRT-2024-003", isEarned: true, previewUrl: "#",
  },
};
 
// ═══════════════════════════════════════════════════════════════════
// COURSE LOOKUP MAP — Used by Course Player & Assessment List
// ═══════════════════════════════════════════════════════════════════
 
export const COURSE_PLAYER_MAP = {
  "crs-001": COURSE_PLAYER_DATA,
  "crs-002": PYTHON_COURSE_DATA,
  "crs-003": REACT_ADVANCED_COURSE_DATA,
};
 
export function getCourseData(courseId) {
  return COURSE_PLAYER_MAP[courseId] || COURSE_PLAYER_DATA;
}
 
export const COURSES_LIST = [
  {
    id: "crs-001",
    title: "Full-Stack JavaScript Mastery",
    instructor: "Dr. Sarah Chen",
    progress: 75,
    totalLessons: 48,
    completedLessons: 36,
    duration: "24 hours",
    level: "Intermediate",
    rating: 4.8,
    thumbnail:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400",
  },
  {
    id: "crs-002",
    title: "Python for Data Science",
    instructor: "Prof. Michael Roberts",
    progress: 45,
    totalLessons: 24,
    completedLessons: 9,
    duration: "18 hours",
    level: "Beginner",
    rating: 4.6,
    thumbnail:
      "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400",
  },
  {
    id: "crs-003",
    title: "React & TypeScript Advanced",
    instructor: "Emily Watson",
    progress: 100,
    totalLessons: 28,
    completedLessons: 28,
    duration: "16 hours",
    level: "Advanced",
    rating: 4.9,
    thumbnail:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400",
  },
];
 
