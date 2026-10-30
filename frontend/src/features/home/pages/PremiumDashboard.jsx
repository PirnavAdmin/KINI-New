import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  FiChevronDown, FiArrowRight, FiMenu, FiX, FiExternalLink, 
  FiCode, FiCpu, FiAward, FiCloud, FiDatabase, FiLayers 
} from 'react-icons/fi';
import { FaLinkedinIn, FaStar, FaQuoteRight } from 'react-icons/fa';
import { useThemeContext } from '@shared/context/ThemeContext';

// ─── STATIC DATA CONTRACTS ──────────────────────────────────────────────────

const NAVIGATION_DATA = {
  categories: [
    { id: 'dotnet', label: '.NET Platform' },
    { id: 'aiml', label: 'AI/ML & Gen AI' },
    { id: 'cloud', label: 'Cloud & DevOps' },
    { id: 'java', label: 'Java Platform' },
  ],
  courses: {
    java: [
      {
        id: 'j1',
        title: 'Data Structures and Algorithms Training',
        desc: 'Master foundational computer science matrices, complex sorting algorithms, and system optimized balance trees.',
        icon: FiLayers,
        gradient: 'from-purple-500/20 to-indigo-600/20 text-purple-400 border-purple-500/30'
      },
      {
        id: 'j2',
        title: 'Java Microservices Certification Training',
        desc: 'Build scalable distributed systems using Spring Boot, Spring Cloud, Docker, and reactive architecture frameworks.',
        icon: FiDatabase,
        gradient: 'from-emerald-500/20 to-teal-600/20 text-emerald-400 border-emerald-500/30'
      }
    ],
    dotnet: [
      {
        id: 'd1',
        title: 'Enterprise .NET Core Architecture',
        desc: 'Deep dive into Clean Architecture, Web API optimization, and secure entity frameworks for high-throughput enterprise scale.',
        icon: FiCode,
        gradient: 'from-blue-500/20 to-cyan-600/20 text-blue-400 border-blue-500/30'
      },
      {
        id: 'd2',
        title: 'Advanced C# & Concurrency Patterns',
        desc: 'Harness multi-threading systems, memory channels, async pipelining, and high-performance garbage collector modifications.',
        icon: FiCpu,
        gradient: 'from-amber-500/20 to-orange-600/20 text-amber-400 border-amber-500/30'
      }
    ]
  },
  promoBanner: {
    badge: 'Limited Live Cohort',
    headline: 'Architect-Level Dev Bootcamp 2026',
    subtext: 'Join 5,000+ engineers building reactive Web3 & distributed microservice meshes. Live mentoring ends this week.',
    ctaText: 'Claim Your Seat'
  }
};

const TESTIMONIALS_DATA = [
  {
    id: 't1',
    text: 'Shailendra sir has in-depth and sound knowledge of .NET and related stack. His way of conducting sessions and handling doubts/queries is awesome. And the staff are awesome they are eager to help that’s sounds Great. All the assignments and videos are also very helpful to enhance .NET...',
    name: 'Sameer Vyas',
    role: 'Technical Lead',
    company: 'Wipro',
    rating: '5.00',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    linkedin: 'https://linkedin.com'
  },
  {
    id: 't2',
    text: 'I have joined the Full Stack .NET Development Training to upgrade web technologies skills and It was a great experience getting training with ScholarHat. Thanks to Trainer for his simple and effective technique of teaching. He is a very experienced and knowledgeable professional....',
    name: 'Priyanka Kulkarni',
    role: 'Technical Lead',
    company: 'Lumedx',
    rating: '5.00',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
    linkedin: 'https://linkedin.com'
  },
  {
    id: 't3',
    text: 'It was an excellent experience to learn MERN Stack training from ScholarHat. The courses are top rate and the best part is live instruction, with playback. DNT is one of the modern platforms to learn and equip in the IT Market. I have learned a lot from this training. And really helped to...',
    name: 'Gulam Simnani Qureshi',
    role: 'UI Developer',
    company: 'CRMnext',
    rating: '5.00',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    linkedin: 'https://linkedin.com'
  }
];

// ─── FRAMER MOTION ANIMATION VARIANTS ────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 110, damping: 14 } }
};

// ─── MAIN APP CONTAINER ──────────────────────────────────────────────────────

export default function PremiumDashboard() {
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeTab, setActiveTab] = useState('java');
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDark } = useThemeContext();

  return (
    <div className={`min-h-screen font-sans antialiased overflow-x-hidden selection:bg-cyan-500/30 select-none transition-colors duration-300 ${isDark ? 'bg-[#020b14] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* ─── PREMIUM SAAS HEADER / NAVBAR ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#010b14]/70 border-b border-white/[0.04] backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-10">
            <a href="#" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-transform duration-300 group-hover:scale-105">
                <span className="text-white font-black text-lg tracking-tighter">S</span>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight">
                Skill<span className="text-cyan-400">Tracks</span>
              </span>
            </a>

            <nav className="hidden md:flex items-center gap-1" onMouseLeave={() => setActiveMenu(null)}>
              <div className="relative py-7">
                <button
                  onMouseEnter={() => setActiveMenu('tracks')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium tracking-wide transition-all duration-200 ${
                    activeMenu === 'tracks' ? 'text-cyan-400 bg-white/[0.03]' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span>Courses Catalog</span>
                  <FiChevronDown className={`w-4 h-4 transition-transform duration-300 ${activeMenu === 'tracks' ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {activeMenu === 'tracks' && (
                    <MegaMenuContainer activeTab={activeTab} setActiveTab={setActiveTab} />
                  )}
                </AnimatePresence>
              </div>
              <a href="#" className="px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors">Enterprise</a>
              <a href="#" className="px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors">Pricing</a>
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Sign In</button>
            <button className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_4px_20px_rgba(6,182,212,0.25)] hover:shadow-[0_4px_25px_rgba(6,182,212,0.4)] transition-all duration-300 hover:-translate-y-0.5">
              Get Started
            </button>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-slate-300 hover:text-white text-2xl p-2 transition-colors">
            {mobileOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && <MobileDrawer close={() => setMobileOpen(false)} />}
        </AnimatePresence>
      </header>

      {/* ─── STUDENT REVIEWS / TESTIMONIALS SECTION ─── */}
      <main className="pt-20">
        <section className="relative w-full min-h-screen bg-gradient-to-b from-[#061C2D] to-[#0B2E4A] flex flex-col items-center justify-center py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
          
          {/* Ambient Aurora Glow Maps */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none" />
          <div className="absolute bottom-20 left-10 w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none" />
          
          <div className="w-full max-w-7xl mx-auto relative z-10">
            
            {/* Header Layout Module */}
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-6 mb-16 border-b border-white/[0.04] pb-6">
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left group">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
                  Our Students Review
                </h2>
                <div className="h-0.5 w-20 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-300 group-hover:w-36 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
              </div>

              <a href="#" className="flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors group">
                <span>View All</span>
                <FiArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
            </div>

            {/* Grid Presenter Frame */}
            <motion.div 
              className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {TESTIMONIALS_DATA.map((item) => (
                <ReviewCard key={item.id} item={item} />
              ))}
            </motion.div>

            {/* Mobile Drag-Swipe Wrapper */}
            <div className="block md:hidden overflow-hidden cursor-grab active:cursor-grabbing py-2">
              <motion.div drag="x" dragConstraints={{ right: 0, left: -640 }} className="flex gap-5 w-max">
                {TESTIMONIALS_DATA.map((item) => (
                  <div key={item.id} className="w-[85vw] max-w-[340px]">
                    <ReviewCard item={item} />
                  </div>
                ))}
              </motion.div>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function MegaMenuContainer({ activeTab, setActiveTab }) {
  const currentCourses = NAVIGATION_DATA.courses[activeTab] || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.99 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-full left-0 mt-1 w-[900px] bg-[#021529]/95 border border-white/[0.06] rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-2xl overflow-hidden z-50 transform -translate-x-[15%]"
    >
      <div className="grid grid-cols-[240px_1fr] divide-x divide-white/[0.04]">
        <aside className="bg-slate-950/20 p-4 flex flex-col gap-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">Skill Domains</p>
          {NAVIGATION_DATA.categories.map((cat) => {
            const isSelected = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onMouseEnter={() => setActiveTab(cat.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 text-left ${
                  isSelected 
                    ? 'bg-gradient-to-r from-cyan-500/10 to-transparent text-cyan-400 border-l-2 border-cyan-400 pl-4' 
                    : 'text-slate-400 border-l-2 border-transparent hover:text-slate-200 hover:bg-white/[0.01]'
                }`}
              >
                <span>{cat.label}</span>
                {isSelected && <FiArrowRight className="text-cyan-400 text-xs" />}
              </button>
            );
          })}
        </aside>

        <div className="flex flex-col">
          <div className="px-6 py-4 flex items-center justify-between border-b border-white/[0.04]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Curriculums</h3>
            </div>
            <a href="#" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors group">
              <span>View All Paths</span>
              <FiExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          <div className="p-5 grid grid-cols-2 gap-4 flex-1">
            {currentCourses.map((course) => {
              const Icon = course.icon;
              return (
                <div key={course.id} className="group flex flex-col justify-between p-4 rounded-xl bg-slate-900/30 border border-white/[0.03] hover:border-cyan-500/30 transition-all duration-300 hover:shadow-[0_0_25px_rgba(6,182,212,0.1)] hover:-translate-y-0.5 cursor-pointer">
                  <div>
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br border flex items-center justify-center mb-3 ${course.gradient}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs font-bold text-white mb-1.5 group-hover:text-cyan-400 transition-colors line-clamp-1">{course.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-normal line-clamp-2">{course.desc}</p>
                  </div>
                  <div className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase group-hover:text-white transition-colors">
                    <span>Explore Track</span>
                    <FiArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              );
            })}
          </div>

          <footer className="m-4 mt-1 p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-indigo-950/40 border border-cyan-500/15 flex items-center justify-between overflow-hidden relative group">
            <div className="max-w-[70%] z-10">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase bg-cyan-400 text-slate-950 mb-1.5">{NAVIGATION_DATA.promoBanner.badge}</span>
              <h5 className="text-xs font-bold text-white mb-0.5">{NAVIGATION_DATA.promoBanner.headline}</h5>
              <p className="text-[10px] text-slate-400 line-clamp-1">{NAVIGATION_DATA.promoBanner.subtext}</p>
            </div>
            <button className="z-10 px-4 py-2 rounded-lg text-xs font-extrabold text-slate-950 bg-white hover:bg-cyan-400 transition-all duration-300">{NAVIGATION_DATA.promoBanner.ctaText}</button>
          </footer>
        </div>
      </div>
    </motion.div>
  );
}

function ReviewCard({ item }) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -6, scale: 1.01, boxShadow: "0 20px 40px rgba(0,0,0,0.4), 0 0 25px rgba(6,182,212,0.12)" }}
      className="flex flex-col justify-between h-full p-6 sm:p-7 rounded-2xl bg-slate-900/40 border border-white/[0.05] shadow-lg backdrop-blur-xl hover:border-cyan-500/30 transition-colors duration-300 group relative overflow-hidden"
    >
      <div>
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className="text-amber-400 text-sm drop-shadow-[0_0_4px_rgba(251,191,36,0.3)]" />
            ))}
            <span className="text-xs font-bold text-slate-400 ml-1.5">({item.rating})</span>
          </div>
          <FaQuoteRight className="text-white/[0.03] text-4xl group-hover:text-cyan-400/10 transition-colors" />
        </div>
        <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed tracking-wide mb-6 line-clamp-6 group-hover:text-white transition-colors">"{item.text}"</p>
      </div>

      <div>
        <div className="w-full h-px bg-gradient-to-r from-white/[0.06] via-white/[0.02] to-transparent mb-5" />
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full border border-white/10 overflow-hidden bg-slate-950 transition-transform group-hover:scale-105 group-hover:border-cyan-400/30">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-white tracking-tight line-clamp-1 group-hover:text-cyan-400 transition-colors">{item.name}</h4>
              <p className="text-[11px] text-slate-400 line-clamp-1">{item.role} <span className="text-cyan-500/80 font-medium">@ {item.company}</span></p>
            </div>
          </div>
          <a href={item.linkedin} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#0077B5] hover:border-[#0077B5] transition-all duration-300 shadow-sm shrink-0">
            <FaLinkedinIn className="text-xs" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function MobileDrawer({ close }) {
  const [openCat, setOpenCat] = useState(null);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 top-20 bg-slate-950/95 z-40 p-4 overflow-y-auto border-t border-white/[0.05] md:hidden flex flex-col justify-between">
      <div className="flex flex-col gap-2">
        <div className="border border-white/[0.04] rounded-xl bg-slate-900/20 overflow-hidden">
          <button onClick={() => setOpenCat(openCat === 'tracks' ? null : 'tracks')} className="w-full flex items-center justify-between p-3.5 text-sm font-semibold text-slate-200">
            <span>Course Track Catalog</span>
            <FiChevronDown className={`transform transition-transform ${openCat === 'tracks' ? 'rotate-180 text-cyan-400' : ''}`} />
          </button>
          {openCat === 'tracks' && (
            <div className="px-3 pb-3 flex flex-col gap-1.5 bg-slate-950/40 pt-1">
              {NAVIGATION_DATA.categories.map(cat => (
                <div key={cat.id} className="pt-2">
                  <h5 className="text-[11px] font-bold text-cyan-400 px-2 mb-1">{cat.label}</h5>
                  {(NAVIGATION_DATA.courses[cat.id] || []).map(course => (
                    <a key={course.id} href="#" className="block p-2 rounded-lg text-xs text-slate-300 hover:text-white">{course.title}</a>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
        <a href="#" className="p-3.5 border border-white/[0.04] rounded-xl text-sm font-semibold text-slate-200 bg-slate-900/20">Enterprise</a>
        <a href="#" className="p-3.5 border border-white/[0.04] rounded-xl text-sm font-semibold text-slate-200 bg-slate-900/20">Pricing</a>
      </div>
    </motion.div>
  );
}