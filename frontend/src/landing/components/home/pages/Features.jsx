// ─── Import data ──────────────────────────────────────────────
import React, { useState, useEffect, useRef } from 'react';
import { featuredCourses, getCourseCategories } from '../data/homeData'; // adjust path
import Navbar from '@landing-shared/components/navbar';
import Seo from '@landing-shared/components/Seo';
import Footer from '@landing-shared/components/Footer';

const Features = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isFlipped, setIsFlipped] = useState({});
  const cardsContainerRef = useRef(null);

  // Mouse parallax for background orbs
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      setMousePosition({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Cursor glow effect per card
  useEffect(() => {
    const container = cardsContainerRef.current;
    if (!container) return;

    const handleMouseMove = (e) => {
      const cards = container.querySelectorAll('.glow-effect');
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    };

    container.addEventListener('mousemove', handleMouseMove);
    return () => container.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const toggleFlip = (slug) => {
    setIsFlipped(prev => ({
      ...prev,
      [slug]: !prev[slug]
    }));
  };

  // Filter courses based on selected category
  const filteredCourses = selectedCategory === 'All'
    ? featuredCourses
    : featuredCourses.filter(course => course.category === selectedCategory);

  const categories = getCourseCategories();

  return (
    <div className="bg-[#031427] text-[#d3e4fe] min-h-screen overflow-x-hidden">
      <Seo
        title="Course Features"
        description="Explore live training, hands-on projects, mentorship and career support features included in every Kini Edx Hub course."
        path="/features"
      />
      <Navbar />
      <main className="relative pt-16 pb-20 min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Ambient Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,85,247,0.06),rgba(6,182,168,0.05))]"></div>
          <div className="bg-noise absolute inset-0 z-10"></div>
          
          {/* Glowing Orbs with Parallax */}
          <div 
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#0f55f7]/20 rounded-full blur-[120px] mix-blend-screen transition-transform duration-1000 ease-out" 
            style={{ transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)` }}
          ></div>
          <div 
            className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#00b4a6]/20 rounded-full blur-[150px] mix-blend-screen transition-transform duration-1000 ease-out" 
            style={{ transform: `translate(${mousePosition.x * -40}px, ${mousePosition.y * -40}px)` }}
          ></div>
        </div>

        {/* Section Header */}
        <div className="relative z-20 text-center max-w-3xl mx-auto px-4 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
            <span className="material-symbols-outlined text-[#4edbcc] text-sm">school</span>
            <span className="text-[#c3c5d9] text-xs font-medium uppercase tracking-widest">Our Courses</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#0f55f7] to-[#4edbcc] mb-4 leading-tight">
            Featured Programs
          </h2>
          <p className="text-lg text-[#c3c5d9] max-w-2xl mx-auto">
            Choose your path and start building real‑world skills today.
          </p>
        </div>

        {/* Category Filter */}
        <div className="relative z-20 flex flex-wrap justify-center gap-2 mb-10 px-4">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === cat
                  ? 'bg-[#0f55f7] text-white shadow-lg shadow-[#0f55f7]/30'
                  : 'bg-white/5 text-[#c3c5d9] hover:bg-white/10 border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Course Grid */}
        <div 
          className="relative z-20 w-full max-w-7xl mx-auto px-4 glow-container" 
          ref={cardsContainerRef}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filteredCourses.map((course, index) => (
              <div 
                key={course.slug}
                className="group perspective-1000 h-[400px] cursor-pointer"
                style={{ 
                  animationDelay: `${0.2 + index * 0.1}s`,
                  opacity: 0,
                  animation: 'fadeInUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards'
                }}
                onClick={() => toggleFlip(course.slug)}
              >
                <div 
                  className="flip-inner relative w-full h-full"
                  style={{ 
                    transformStyle: 'preserve-3d',
                    transform: isFlipped[course.slug] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    transition: 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)'
                  }}
                >
                  {/* ─── Front ─── */}
                  <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      background: 'rgba(15, 23, 42, 0.7)',
                      backdropFilter: 'blur(40px)',
                      WebkitBackdropFilter: 'blur(40px)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <img 
                      src={course.image} 
                      alt={course.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-5 flex flex-col h-[calc(100%-12rem)]">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r ${course.gradient} text-white`}>
                          {course.badge}
                        </span>
                        <span className="text-[#c3c5d9]/50 text-sm font-medium">
                          {course.duration}
                        </span>
                      </div>
                      <h3 className="font-semibold text-xl text-[#d3e4fe] mb-1 leading-tight">
                        {course.title}
                      </h3>
                      <p className="text-[#c3c5d9] text-sm line-clamp-2 flex-1">
                        {course.desc}
                      </p>
                      <div className="flex items-center justify-between mt-3 text-xs text-[#c3c5d9]/70">
                        <span>{course.sessions}</span>
                        <span className="px-2 py-1 rounded bg-white/5 border border-white/10">
                          {course.category}
                        </span>
                      </div>
                    </div>
                    {/* Glow effect overlay */}
                    <div className="absolute inset-0 glow-effect" style={{ pointerEvents: 'none' }}></div>
                  </div>

                  {/* ─── Back ─── */}
                  <div className="absolute inset-0 rounded-3xl p-6 flex flex-col shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))',
                      backdropFilter: 'blur(40px)',
                      WebkitBackdropFilter: 'blur(40px)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <h4 className="font-semibold text-xl text-[#4edbcc] mb-4">What You'll Learn</h4>
                    <ul className="space-y-2 text-[#c3c5d9] text-sm flex-1">
                      {course.outcomes.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-[18px] text-[#4edbcc] mt-0.5">check_circle</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                    <button className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-700 hover:bg-primary-600 border border-secondary-500 transition-colors text-secondary-500 text-sm font-semibold">
                      View Details
                      <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <style>{`
        /* Noise texture */
        .bg-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.03;
          pointer-events: none;
        }

        .perspective-1000 {
          perspective: 1000px;
        }

        .glow-effect::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(15, 85, 247, 0.15), transparent 40%);
          z-index: 1;
          opacity: 0;
          transition: opacity 0.5s;
          pointer-events: none;
          border-radius: 24px;
        }
        .glow-container:hover .glow-effect::before {
          opacity: 1;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined';
          font-weight: normal;
          font-style: normal;
          font-size: 24px;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-block;
          white-space: nowrap;
          word-wrap: normal;
          direction: ltr;
          -webkit-font-feature-settings: 'liga';
          -webkit-font-smoothing: antialiased;
        }

        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}</style>
      <Footer />
    </div>
  );
};

export default Features;