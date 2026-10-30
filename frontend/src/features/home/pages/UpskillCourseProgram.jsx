import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const UpskillCourseProgram = () => {
  const [isDark, setIsDark] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Business');
  const [hoveredCard, setHoveredCard] = useState(null);

  // Categories data
  const categories = [
    { id: 1, name: 'Business', icon: 'monitoring', color: 'primary' },
    { id: 2, name: 'Development', icon: 'code', color: 'secondary' },
    { id: 3, name: 'Language', icon: 'language', color: 'tertiary' },
    { id: 4, name: 'Marketing', icon: 'campaign', color: 'error' },
    { id: 5, name: 'Finance', icon: 'attach_money', color: 'surface-tint' },
    { id: 6, name: 'Design', icon: 'palette', color: '#22c55e' },
  ];

  // Courses data
  const courses = [
    {
      id: 1,
      title: 'Advanced UI/UX Design Patterns',
      instructor: 'Sarah Jenkins',
      rating: 4.8,
      reviews: 124,
      price: 89.99,
      badge: 'New',
      badgeColor: 'tertiary',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcZ9MuHcz2JvvehgARWmH7vHd4CsJCet9fPIf7UvuxLakM0yER8pJbyNsL30AV_kt04wLHgcNZ3K5xUN0Ul1uMCMzXdEMr98gfmW8Jccmyv6ZgTovd0vlepLvThT4uliLRZ6g4MiX5_5I5ycRnjFbGNkPOBixmaG2EkFXE5y6MavQdqEi0uL0A6OKRv1bJFiQB-I9L8iibS9Mwbjl2nkCQsY3WtvnKpgcopTTHcrW0ouhR9_oo99Es8ox7Noy3pWJC0iMIOmV-hy71'
    },
    {
      id: 2,
      title: 'Full-Stack Web Masterclass',
      instructor: 'Alex Rivera',
      rating: 5.0,
      reviews: 89,
      price: 120.00,
      badge: 'Popular',
      badgeColor: 'secondary',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDyQ9SA8b-2ChoESr3ETkZUsWaiZt4NdlfN9lG9nIYA7UqJ8zNUXRj_DLpWM4rH9P40YykHc_IP-qM1UHvOAEq2glnoUm49_wYdRP8cS-rdmbXCF2caNqYH8aLOKEFVRX1TR79N1IKF1-AS1LOU9WFJq76L6AeEuYo8tXRWCyJezRDi1GECmCRW_Gf4INYdAfD0z2PWYNnjh6Kdtign7Lvb2zm2Vgacm-4JYmA3jZIUeskaUvNeWrtwPvYWtJAdi9iuFqutqxLRm4-w'
    },
    {
      id: 3,
      title: 'Digital Marketing Strategy',
      instructor: 'Emily Chen',
      rating: 4.2,
      reviews: 56,
      price: 49.50,
      badge: null,
      badgeColor: null,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0RSMGGt-7nScQn7xgYIIE6OTuW344Und3Ii7HWxK-ebDOGV9DNUKhamGVmi0_2V6qFqcABrVCtdto_YhvlYbqV1yhqDqAe8dFOeMxbxvOFiQ-0VLMIbLhiZZJoSTkVR6mjiOWQEC7aGu2pg5ipheubrQW2g-70AQc2pCay1f4IqC6umk1IxcE3RISjBUwzTvZqeiPmd5i4C4M-B14OK2gFPO73I3gi0WkZNRYa5nw7LMu7FMTgBCJuTMKPhCmb1LSZFmeQ1qfH4lP'
    },
    {
      id: 4,
      title: 'Personal Finance for Beginners',
      instructor: 'Marcus Johnson',
      rating: 4.9,
      reviews: 210,
      price: 35.00,
      badge: 'Bestseller',
      badgeColor: '#22c55e',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpvoSC1aldKdebrmEL3fuKoCay7QHAf1_XmxE_AKxQ2TsZeWlGEdMLYb7xbRguwDXmjfBP0z72XBJaKIojXqMLD7QOgsnFLbsAYqWo2VkonFUa_36hujWQx8BD4iFtu3izHMZ64WDzQC90SBQfYUuW2mFpAXKfAiGVnFe4rdKBl2AeCn3fFM7NwMd6kH5UKoSj-_VHOx_IjyRg9sYLSYYHoi_RLIGilaunsUXLUZgqX3b-cKIVnwUgGcb1z9ILsoK7IHInMPSJjn4Y'
    }
  ];

  // Benefits data
  const benefits = [
    {
      id: 1,
      title: 'Affordable Pricing',
      description: "Quality education shouldn't break the bank. Flexible plans for everyone.",
      icon: 'savings',
      color: 'primary'
    },
    {
      id: 2,
      title: 'Expert Mentors',
      description: 'Learn directly from industry leaders with real-world experience.',
      icon: 'workspace_premium',
      color: 'secondary'
    },
    {
      id: 3,
      title: 'Lifetime Access',
      description: 'Learn at your own pace. Once enrolled, the course is yours forever.',
      icon: 'all_inclusive',
      color: 'tertiary'
    },
    {
      id: 4,
      title: 'Fun & Interactive',
      description: 'Gamified learning paths keep you motivated and engaged every step.',
      icon: 'extension',
      color: 'error'
    }
  ];

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`star-${i}`} className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half-star" className="material-symbols-outlined text-[18px]">star_half</span>);
    }
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="material-symbols-outlined text-[18px]">star_border</span>);
    }
    return stars;
  };

  return (
    <div className="bg-background text-on-surface font-body-md overflow-x-hidden relative min-h-screen flex flex-col">
      {/* Ambient Background Blobs */}
      <div className="blob-bg w-[500px] h-[500px] bg-primary-fixed rounded-full top-[-100px] left-[-200px]"></div>
      <div className="blob-bg w-[400px] h-[400px] bg-secondary-fixed rounded-full top-[20%] right-[-100px]" style={{ animationDelay: '-5s' }}></div>
      <div className="blob-bg w-[600px] h-[600px] bg-tertiary-fixed rounded-full bottom-[-200px] left-[10%] opacity-40" style={{ animationDelay: '-10s' }}></div>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 px-container-padding overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-fixed-dim/30 text-on-secondary-container font-label-bold text-label-bold border border-secondary/20">
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                <span>Discover Joyful Learning</span>
              </div>
              <h1 className="font-headline-xl text-headline-xl lg:text-[64px] lg:leading-[1.1] text-on-background">
                Your vibrant <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Course Program</span> <br />
                starts here.
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
                Dive into a colorful world of knowledge. Learn from experts, build real-world skills, and have fun doing it in our interactive digital playground.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <button className="bg-gradient-to-r from-primary to-secondary text-white font-label-bold text-label-bold px-8 py-4 rounded-full squish shadow-lg shadow-primary/30 hover:shadow-xl transition-all">Start Learning Today</button>
                <button className="bg-surface text-primary font-label-bold text-label-bold px-8 py-4 rounded-full squish shadow-sm border border-outline-variant hover:border-primary transition-all">Browse Courses</button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-[3rem] transform rotate-3 scale-105 z-0 blur-sm"></div>
              <img className="relative z-10 w-full h-[500px] object-cover rounded-[3rem] shadow-[0px_20px_50px_rgba(139,92,246,0.15)]" alt="Students learning together" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAoQdoW7WMr712oU9bHgoSuTRK6qFZTk6nnbFyOUiSo_GuNGd34QDb8HIOIFo4VsOliJYRUyA9UaJ-_w0rV6IqIqEF8xpje6EO0FRcz1doU9aLkn_QUvzVhL0CZjhCXfwgi8NNTZJV6MSMsYT_WF7GTCXs2Rm-itg-vJvIXxHsR9FLg2TtFyknhOXFQrzD-Lg9Sj-gWhRB_GRUTJYW7UNwOrtBgrDtz4zk5EGQ6pkNUbVrnylkjh6jg-7viS9g-NlLpBCJhbK-WzQW-" />
              {/* Floating Badge */}
              <div className="absolute top-10 -left-6 z-20 glass-card px-4 py-3 rounded-2xl flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-tertiary-container">school</span>
                </div>
                <div>
                  <p className="font-label-bold text-label-bold text-on-surface">100k+ Students</p>
                  <p className="font-body-md text-sm text-on-surface-variant">Active now</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-section-gap px-container-padding bg-surface/50 border-y border-outline-variant/30">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-headline-lg text-headline-lg text-center mb-12">Explore Categories</h2>
            <div className="flex overflow-x-auto pb-8 gap-6 snap-x hide-scrollbar">
              {categories.map((category) => (
                <a 
                  key={category.id}
                  className="snap-start shrink-0 glass-card rounded-2xl p-6 flex flex-col items-center gap-4 min-w-[160px] hover:scale-105 transition-transform group cursor-pointer border-t-4"
                  style={{ borderTopColor: category.color === 'primary' ? '#8455ef' : 
                                    category.color === 'secondary' ? '#fd56a7' :
                                    category.color === 'tertiary' ? '#eec200' :
                                    category.color === 'error' ? '#ff4d4d' :
                                    category.color === 'surface-tint' ? '#6d3bd7' : '#22c55e' }}
                  href="#"
                >
                  <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center group-hover:bg-primary transition-colors">
                    <span className="material-symbols-outlined text-[32px] text-primary group-hover:text-on-primary transition-colors">{category.icon}</span>
                  </div>
                  <span className="font-label-bold text-label-bold text-on-surface">{category.name}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Courses */}
        <section className="py-section-gap px-container-padding relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-on-background mb-2">Featured Courses</h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant">Top picks for your learning journey.</p>
              </div>
              <a className="hidden md:inline-flex items-center gap-2 text-primary font-label-bold text-label-bold hover:text-secondary transition-colors" href="#">
                View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {courses.map((course) => (
                <div 
                  key={course.id}
                  className="glass-card rounded-[32px] overflow-hidden border-2 border-transparent hover:border-primary/30 transition-all group flex flex-col"
                  onMouseEnter={() => setHoveredCard(course.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={course.title} src={course.image} />
                    {course.badge && (
                      <div className="absolute top-4 left-4 bg-tertiary text-on-tertiary font-label-bold text-[12px] px-3 py-1 rounded-full uppercase tracking-wider" style={{ backgroundColor: course.badgeColor === 'tertiary' ? '#eec200' : course.badgeColor === 'secondary' ? '#fd56a7' : course.badgeColor === '#22c55e' ? '#22c55e' : '#8455ef' }}>
                        {course.badge}
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex-grow flex flex-col">
                    <div className="flex items-center gap-1 mb-3 text-tertiary-fixed-dim">
                      {renderStars(course.rating)}
                      <span className="text-on-surface-variant text-sm ml-1 font-label-bold">({course.rating})</span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-2 line-clamp-2">{course.title}</h3>
                    <p className="font-body-md text-on-surface-variant mb-6 text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">person</span>
                      {course.instructor}
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="font-headline-md text-headline-md text-primary">${course.price.toFixed(2)}</span>
                      <button className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors squish">
                        <span className="material-symbols-outlined">add</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center md:hidden">
              <a className="inline-flex items-center gap-2 text-primary font-label-bold text-label-bold hover:text-secondary transition-colors px-6 py-3 rounded-full border border-primary/20" href="#">
                View All Courses
              </a>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-section-gap px-container-padding bg-surface-container-low rounded-t-[3rem] relative mt-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-headline-xl text-headline-xl text-on-background">Why choose Upskill?</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-4 max-w-2xl mx-auto">We make learning joyful, accessible, and effective with our unique approach.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit) => (
                <div key={benefit.id} className="bg-white rounded-3xl p-8 text-center shadow-sm hover:shadow-md transition-shadow group">
                  <div className={`w-20 h-20 mx-auto bg-${benefit.color}-fixed rounded-2xl rotate-3 group-hover:rotate-12 transition-transform duration-300 flex items-center justify-center mb-6`}>
                    <span className={`material-symbols-outlined text-[40px] text-${benefit.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{benefit.icon}</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-3">{benefit.title}</h3>
                  <p className="font-body-md text-on-surface-variant">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Styles */}
      <style>{`
        .blob-bg {
          position: absolute;
          filter: blur(80px);
          z-index: -1;
          opacity: 0.6;
          animation: drift 20s infinite alternate ease-in-out;
        }
        @keyframes drift {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(50px, 30px) scale(1.1); }
          100% { transform: translate(-30px, 50px) scale(0.9); }
        }
        .squish:active {
          transform: scale(0.95);
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0px 10px 30px rgba(0,0,0,0.05);
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .animate-bounce {
          animation: bounce 3s ease-in-out infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
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
      `}</style>
    </div>
  );
};

export default UpskillCourseProgram;