import React, { useState, useEffect, useRef } from 'react';

const Features = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isFlipped, setIsFlipped] = useState({});
  const cardsContainerRef = useRef(null);
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true after mounting
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Mouse parallax for background orbs
  useEffect(() => {
    if (!isClient) return;

    const handleMouseMove = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isClient]);

  // Cursor glow effect for cards
  useEffect(() => {
    if (!isClient) return;
    
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
  }, [isClient]);

  const toggleFlip = (id) => {
    setIsFlipped(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const cards = [
    {
      id: 1,
      icon: 'psychology',
      iconColor: 'text-primary',
      borderColor: 'border-primary/30',
      gradient: 'from-primary-container/20 to-primary-container/5',
      title: 'AI Insights',
      description: 'Adaptive learning paths that evolve with your progress.',
      backTitle: 'Deep Learning',
      backColor: 'text-primary',
      features: [
        'Real-time skill gap analysis',
        'Personalized study regimens',
        'Predictive outcome modeling'
      ],
      delay: '0.2s'
    },
    {
      id: 2,
      icon: 'science',
      iconColor: 'text-secondary',
      borderColor: 'border-secondary/30',
      gradient: 'from-secondary/20 to-secondary/5',
      title: 'Immersive Labs',
      description: 'Hands-on, browser-based environments for real-world practice.',
      backTitle: 'Practical Mastery',
      backColor: 'text-secondary',
      features: [
        'Zero-setup environments',
        'Cloud-native infrastructure',
        'Instant automated feedback'
      ],
      delay: '0.3s'
    },
    {
      id: 3,
      icon: 'rocket_launch',
      iconColor: 'text-tertiary-fixed-dim',
      borderColor: 'border-tertiary-fixed-dim/30',
      gradient: 'from-tertiary-fixed-dim/30 to-tertiary-fixed-dim/5',
      title: 'Accelerator',
      description: 'Direct pathways to top-tier tech roles and certifications.',
      backTitle: 'Launch Pad',
      backColor: 'text-tertiary-fixed-dim',
      features: [
        '1-on-1 industry mentorship',
        'Portfolio-ready projects',
        'Hiring partner network'
      ],
      delay: '0.4s'
    },
    {
      id: 4,
      icon: 'public',
      iconColor: 'text-primary-fixed',
      borderColor: 'border-inverse-primary/30',
      gradient: 'from-inverse-primary/20 to-inverse-primary/5',
      title: 'Global Network',
      description: 'Connect, collaborate, and build with peers worldwide.',
      backTitle: 'Collective Intelligence',
      backColor: 'text-primary-fixed',
      features: [
        'Live collaborative coding',
        'Global hackathon events',
        'Peer code reviews'
      ],
      delay: '0.5s'
    }
  ];

  return (
    <div className="bg-[#031427] text-[#d3e4fe] min-h-screen overflow-x-hidden">
      {/* Main Content */}
      <main className="relative pt-16 pb-20 min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Ambient Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,85,247,0.06),rgba(6,182,168,0.05))]"></div>
          <div className="bg-noise absolute inset-0 z-10"></div>
          
          {/* Glowing Orbs with Parallax */}
          <div 
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#0f55f7]/20 rounded-full blur-[120px] mix-blend-screen transition-transform duration-1000 ease-out" 
            id="orb1"
            style={{ transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)` }}
          ></div>
          <div 
            className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#00b4a6]/20 rounded-full blur-[150px] mix-blend-screen transition-transform duration-1000 ease-out" 
            id="orb2"
            style={{ transform: `translate(${mousePosition.x * -40}px, ${mousePosition.y * -40}px)` }}
          ></div>
        </div>

        {/* Section Header */}
        <div className="relative z-20 text-center max-w-3xl mx-auto px-4 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
            <span className="material-symbols-outlined text-[#4edbcc] text-sm">auto_awesome</span>
            <span className="text-[#c3c5d9] text-xs font-medium uppercase tracking-widest">Next-Gen Platform</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#0f55f7] to-[#4edbcc] mb-4 leading-tight">
            Features That Set Us Apart
          </h2>
          <p className="text-lg text-[#c3c5d9] max-w-2xl mx-auto">
            Discover the powerful features designed to accelerate your learning journey.
          </p>
        </div>

        {/* Interactive Card Grid */}
        <div 
          className="relative z-20 w-full max-w-7xl mx-auto px-4 glow-container" 
          ref={cardsContainerRef}
          id="cards-container"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {cards.map((card, index) => (
              <div 
                key={card.id}
                className="group perspective-1000 h-[340px] cursor-pointer"
                style={{ 
                  animationDelay: card.delay,
                  opacity: 0,
                  animation: 'fadeInUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards'
                }}
                onClick={() => toggleFlip(card.id)}
              >
                <div 
                  className="flip-inner relative w-full h-full"
                  style={{ 
                    transformStyle: 'preserve-3d',
                    transform: isFlipped[card.id] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    transition: 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)'
                  }}
                >
                  {/* Front */}
                  <div className="absolute inset-0 rounded-3xl p-8 flex flex-col justify-between overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-transform duration-300 group-hover:scale-[1.03]"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      background: 'rgba(15, 23, 42, 0.6)',
                      backdropFilter: 'blur(40px)',
                      WebkitBackdropFilter: 'blur(40px)',
                      border: '1px solid transparent',
                      backgroundClip: 'padding-box',
                      position: 'relative'
                    }}
                  >
                    {/* Glass border effect */}
                    <div className="absolute inset-0 rounded-3xl -z-10" style={{
                      margin: '-1px',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
                      borderRadius: 'inherit'
                    }}></div>
                    
                    <div className="flex justify-between items-start z-10">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center border ${card.borderColor}`}>
                        <span className={`material-symbols-outlined ${card.iconColor}`}>{card.icon}</span>
                      </div>
                      <span className="text-[#c3c5d9]/50 text-xl font-bold">
                        {String(card.id).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="z-10 mt-auto">
                      <h3 className="font-semibold text-2xl text-[#d3e4fe] mb-2">{card.title}</h3>
                      <p className="text-[#c3c5d9] text-sm line-clamp-2">{card.description}</p>
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#0f55f7]/10 rounded-full blur-2xl"></div>
                    
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-3xl glow-effect" style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      borderRadius: '24px',
                      pointerEvents: 'none',
                      zIndex: 0
                    }}></div>
                  </div>

                  {/* Back */}
                  <div className="absolute inset-0 rounded-3xl p-8 flex flex-col shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))',
                      backdropFilter: 'blur(40px)',
                      WebkitBackdropFilter: 'blur(40px)',
                      border: '1px solid transparent',
                      backgroundClip: 'padding-box',
                      position: 'relative'
                    }}
                  >
                    <div className="absolute inset-0 rounded-3xl -z-10" style={{
                      margin: '-1px',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
                      borderRadius: 'inherit'
                    }}></div>
                    
                    <h4 className={`font-semibold text-xl ${card.backColor} mb-4`}>{card.backTitle}</h4>
                    <ul className="space-y-3 text-[#c3c5d9] text-sm mb-auto">
                      {card.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-[18px] text-[#4edbcc] mt-0.5">check_circle</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-[#d3e4fe] text-sm font-medium">
                      Explore More
                      <span className="material-symbols-outlined text-[18px] transition-transform group-hover/btn:translate-x-1">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* CSS Styles */}
      <style>{`
        /* Ambient Noise Texture */
        .bg-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.03;
          pointer-events: none;
        }

        /* Cursor Glow Effect */
        .glow-effect::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(15, 85, 247, 0.1), transparent 40%);
          z-index: 0;
          opacity: 0;
          transition: opacity 0.5s;
          pointer-events: none;
          border-radius: 24px;
        }
        .glow-container:hover .glow-effect::before {
          opacity: 1;
        }

        /* Animation Classes */
        @keyframes fadeInUp {
          from { 
            opacity: 0; 
            transform: translateY(40px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }

        /* Material Icons */
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

        /* Line clamp */
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #0f172a;
        }
        ::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
};

export default Features;