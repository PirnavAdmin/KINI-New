import React, { useState, useEffect, useRef } from 'react';
import { 
  FiMenu, FiArrowRight, FiDownload, FiCalendar, FiUsers, FiClock, 
  FiCode, FiVideo, FiGrid, FiUser, FiBriefcase, FiTrendingUp, 
  FiAward, FiCheckCircle, FiBookOpen, FiCpu, FiGlobe,
  FiMail, FiLock, FiStar, FiSearch, FiUserCheck, FiBarChart2
} from 'react-icons/fi';
import { 
  FaPython, FaReact, FaNodeJs, FaAws, FaDocker, FaGitAlt 
} from 'react-icons/fa';
import { 
  SiTensorflow, SiPytorch, SiKeras, SiLangchain, SiGooglecloud 
} from 'react-icons/si';
import { LuSparkles, LuBrain, LuCpu, LuRocket } from 'react-icons/lu';

const AIEngineeringImmersive = () => {
  const [activeTab, setActiveTab] = useState('module-1');
  const [indicatorTop, setIndicatorTop] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredMentor, setHoveredMentor] = useState(null);
  const tabRefs = useRef({});

  // Scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialize indicator position
  useEffect(() => {
    const initialTab = document.querySelector(`[data-target="${activeTab}"]`);
    if (initialTab) {
      setTimeout(() => {
        const top = initialTab.offsetTop || 0;
        setIndicatorTop(top);
      }, 100);
    }
  }, []);

  const handleTabClick = (e, tabId) => {
    setActiveTab(tabId);
    const tabElement = e.currentTarget;
    const top = tabElement.offsetTop || 0;
    setIndicatorTop(top);
  };

  // Tab data
  const tabs = [
    { id: 'module-1', label: 'Python & Math Foundations', short: 'M1', icon: FaPython },
    { id: 'module-2', label: 'Deep Learning & Neural Networks', short: 'M2', icon: LuBrain },
    { id: 'module-3', label: 'Natural Language Processing', short: 'M3', icon: FiBookOpen },
    { id: 'module-4', label: 'Computer Vision', short: 'M4', icon: FiGrid },
    { id: 'module-5', label: 'MLOps & Deployment', short: 'M5', icon: FaAws },
    { id: 'module-6', label: 'Capstone Project', short: 'M6', icon: LuRocket },
  ];

  // Content data
  const contentData = {
    'module-1': {
      icon: 'FaPython',
      title: 'Python & Math Foundations',
      subtitle: 'Weeks 1-4',
      description: 'Establish a rock-solid foundation in the mathematics and programming skills essential for modern AI. We focus on practical application rather than pure theory.',
      items: [
        { title: 'Linear Algebra & Calculus for ML', description: 'Vectors, matrices, eigenvectors, and partial derivatives applied to optimization problems.', duration: '2 weeks', icon: FiBarChart2 },
        { title: 'Advanced Python for Data', description: 'Mastering NumPy, Pandas, and PyTorch tensors for efficient numerical computation.', duration: '2 weeks', icon: FaPython },
      ],
      techStack: ['Python', 'NumPy', 'Pandas', 'PyTorch', 'Matplotlib']
    },
    'module-2': {
      icon: 'LuBrain',
      title: 'Deep Learning & Neural Networks',
      subtitle: 'Weeks 5-8',
      description: 'Dive deep into neural network architectures, training methodologies, and advanced deep learning techniques.',
      items: [
        { title: 'Neural Network Fundamentals', description: 'Understanding perceptrons, activation functions, and backpropagation.', duration: '1 week', icon: FiCpu },
        { title: 'Convolutional Neural Networks', description: 'Building CNNs for image classification and object detection tasks.', duration: '1.5 weeks', icon: FiGrid },
        { title: 'Transfer Learning', description: 'Leveraging pre-trained models like ResNet, VGG, and Inception for custom tasks.', duration: '1 week', icon: SiTensorflow },
      ],
      techStack: ['PyTorch', 'TensorFlow', 'Keras', 'CNN', 'RNN']
    },
    'module-3': {
      icon: 'FiBookOpen',
      title: 'Natural Language Processing',
      subtitle: 'Weeks 9-12',
      description: 'Master the art of processing and understanding human language with state-of-the-art NLP techniques.',
      items: [                        { title: 'Transformers & Attention', description: 'Understanding the transformer architecture and self-attention mechanisms.', duration: '1.5 weeks', icon: SiLangchain },
        { title: 'Large Language Models', description: 'Working with GPT, BERT, and T5 for text generation, classification, and QA.', duration: '1.5 weeks', icon: LuCpu },
        { title: 'Fine-tuning LLMs', description: 'Fine-tuning pre-trained language models for specific domains and tasks.', duration: '1 week', icon: FiCode },
      ],
      techStack: ['Transformers', 'BERT', 'GPT', 'Hugging Face', 'LangChain']
    },
    'module-4': {
      icon: 'FiGrid',
      title: 'Computer Vision',
      subtitle: 'Weeks 13-16',
      description: 'Build cutting-edge computer vision systems that can see, understand, and interpret visual information.',
      items: [
        { title: 'Object Detection & Segmentation', description: 'Implementing YOLO, SSD, and Mask R-CNN for object detection and segmentation.', duration: '1.5 weeks', icon: FiGrid },
        { title: 'Generative Models', description: 'Using GANs and VAEs for image generation and manipulation.', duration: '1.5 weeks', icon: FiTrendingUp },
        { title: 'Video Understanding', description: 'Action recognition, video classification, and optical flow estimation.', duration: '1 week', icon: FiVideo },
      ],
      techStack: ['OpenCV', 'YOLO', 'GANs', 'ViT', 'MediaPipe']
    },
    'module-5': {
      icon: 'FaAws',
      title: 'MLOps & Deployment',
      subtitle: 'Weeks 17-20',
      description: 'Learn how to deploy, monitor, and scale machine learning models in production environments.',
      items: [
        { title: 'Model Serving & APIs', description: 'Building REST APIs and deploying models with FastAPI, Flask, and TensorFlow Serving.', duration: '1 week', icon: FiCode },
        { title: 'Docker & Kubernetes', description: 'Containerizing ML applications and orchestrating deployments with Kubernetes.', duration: '1.5 weeks', icon: FaDocker },
        { title: 'ML Pipelines', description: 'Building automated ML pipelines with Airflow, Kubeflow, or TFX.', duration: '1.5 weeks', icon: FiBarChart2 },
      ],
      techStack: ['Docker', 'Kubernetes', 'FastAPI', 'Airflow', 'AWS/GCP']
    },
    'module-6': {
      icon: 'LuRocket',
      title: 'Capstone Project',
      subtitle: 'Weeks 21-24',
      description: 'Apply everything you\'ve learned to build a production-ready AI application solving a real-world problem.',
      items: [
        { title: 'Project Ideation', description: 'Identifying and scoping a meaningful AI project with market potential.', duration: '1 week', icon: FiStar },
        { title: 'Model Development', description: 'Building, training, and optimizing your AI model for your specific use case.', duration: '1.5 weeks', icon: FiCode },
        { title: 'Deployment & Presentation', description: 'Deploying your solution and presenting your project to industry judges.', duration: '1.5 weeks', icon: LuRocket },
      ],
      techStack: ['Full Stack', 'MLOps', 'Cloud', 'Production AI']
    }
  };

  const mentors = [
    {
      name: 'Dr. Sarah Chen',
      title: 'Senior Research Engineer',
      company: 'OpenAI',
      bio: 'Specializes in Large Language Models and alignment. Previously led ML teams at DeepMind.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJ0jOtdIRxYsXJbmbDyi4UwjcHWPg_umCNfKb_8T-A0mfzAa10xxb24uIjoZCA8Fke_P6BiSNwW8116mjJMokTGTKqbPQULLmbuF8zplynK5TpWBoNqtxdCwRsE92P981eYgqRcPZ6TeMuhUQurSNpcEs7W3rU0IoVxNWmi5KbgeAZcHhWALNnIWx2lIXzWLIxlLBkUqf-IXJ0Bk62LqQGmM4R8ExOPiNkTIUduBzxF9V6wZdqC7IIon4tWpTN5SLWINO8CpSknT4n',
      expertise: ['LLMs', 'NLP', 'Reinforcement Learning'],
      rating: 4.9,
      students: 1240
    },
    {
      name: 'Marcus Johnson',
      title: 'AI Systems Architect',
      company: 'Meta',
      bio: 'Expert in distributed training and MLOps. Scaled computer vision models serving billions of requests.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDy62p4JvZOL7TqqkYaXC9GtRxuBFx4icUQ0TmuIYhI_xZeESa2bnThIEtQVMFKqeVl8ZCNVg4uKp1GgvU4Fetd6pams8qOWacu6CPRSqKhQ31PSuhIJzUBUKT3selD5kmylEAvLwialFYMG1S-EoIM5-BLHpkN3FUArpnnb9mli4itNdCEroBYT0sBQgY4N8BB2vofjQvPF_DrL72PCjGBG5ZkDRehBkhloMG3bNnlJFKVZuyO7zo2Q09MPP8C93aR6eadlB-pCqIM',
      expertise: ['MLOps', 'Distributed Systems', 'Vision'],
      rating: 4.8,
      students: 980
    },
    {
      name: 'Elena Rodriguez',
      title: 'Staff AI Engineer',
      company: 'Google',
      bio: 'Focuses on edge AI and model optimization. Contributor to TensorFlow and leading open-source projects.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgQjF3xmMt9FK3nXTfLulkshSib7xIDoKKQnn-MWvLCXuKilMijDJrpQ3Ja3k5Nf4ArWdAewoh4cvIF66c1u4V-Fl1lZjsvALTiysuLTVfzPQADvtAQmSJPu8gX25b1CKyv4JApSbmdjKGLTpY8WjOb1bba0AXnEBa2zmrlBCV1_JTj2p3fcHPIjnHlKFqGgF8H6tzQEekpmiD8jSelbB375mQcqF1Wr9fkLFABkBrph5Q0hZN-Fvhl98vSu1SHx3_6a_4n8dTsF70',
      expertise: ['Edge AI', 'Optimization', 'Open Source'],
      rating: 4.9,
      students: 1520
    }
  ];

  const overviewItems = [
    { icon: FiClock, label: 'Duration', value: '24 Weeks', detail: 'Full-time intensive' },
    { icon: FiVideo, label: 'Format', value: 'Live Online', detail: 'Interactive sessions' },
    { icon: FiCode, label: 'Projects', value: '12+ Real-world', detail: 'Portfolio building' },
    { icon: FiUsers, label: 'Mentor Ratio', value: '1:10', detail: 'Personalized support', isPrimary: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 font-sans antialiased">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-2xl border-b border-slate-200/50 shadow-lg' 
          : 'bg-white/60 backdrop-blur-xl border-b border-slate-200/30'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/20">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">Pirnav</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              {['Programs', 'Mentors', 'Projects', 'Success Stories', 'Careers', 'Community'].map((item, idx) => (
                <a 
                  key={idx}
                  className={`text-sm font-medium ${
                    idx === 0 ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'
                  } transition-all duration-300 hover:scale-105 cursor-pointer`} 
                  href="#"
                >
                  {item}
                </a>
              ))}
            </div>
            
            <button className="hidden md:flex bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium px-6 py-2.5 rounded-full transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 hover:shadow-blue-600/30">
              Apply Now
            </button>
            
            <button className="md:hidden text-gray-700 hover:text-blue-600 transition-colors">
              <FiMenu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[600px] h-[600px] bg-blue-100/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[400px] h-[400px] bg-emerald-100/20 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-100/10 rounded-full blur-3xl -z-10 animate-spin-slow"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 flex flex-col items-start space-y-6 z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100/50 shadow-sm animate-float">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
              <span className="text-xs font-semibold text-gray-700 tracking-wider uppercase">AI Engineering Immersive</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
              Master the Future of <br />
              <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Intelligence</span>
            </h1>
            
            <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
              A comprehensive 6-month journey from foundations to production-grade AI systems. Build real-world applications with guidance from industry leaders.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
              <button className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium px-8 py-3.5 rounded-full transition-all duration-300 shadow-md hover:shadow-xl flex items-center justify-center gap-2 hover:scale-105 hover:shadow-blue-600/30">
                Enroll Now 
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="group bg-white border border-gray-200 text-gray-900 font-medium px-8 py-3.5 rounded-full transition-all duration-300 flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-blue-300 hover:shadow-md">
                Download Syllabus 
                <FiDownload className="group-hover:translate-y-0.5 transition-transform" />
              </button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-2">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center shadow-md">
                    <span className="text-xs font-bold text-blue-600">👤</span>
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <span className="font-bold text-gray-900">2,500+</span>
                <span className="text-gray-600 ml-1">graduates worldwide</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex text-yellow-400">
                  <FiStar fill="currentColor" />
                  <FiStar fill="currentColor" />
                  <FiStar fill="currentColor" />
                  <FiStar fill="currentColor" />
                  <FiStar fill="currentColor" />
                </div>
                <span className="text-gray-600 text-sm">4.9 (342 reviews)</span>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-5 mt-12 lg:mt-0 relative z-10">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-emerald-500/20 rounded-3xl blur-xl"></div>
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-gray-200/50">
                <img 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
                  alt="AI engineering workspace with neural network hologram" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwxh1xEwdef1m-w5cptf7R5U6qKXBi1NQbLqfxh_bxsbsIJ4HPk1vafeOH3pNshLqAvQErTlduYVM4HlZw6ZsFI8aEfNznkLUda6UmnnU0doF7jFzkZRCN5jOh6sFDo-c2c9lvXb16kwfcNsKhoRkKWOQHHrnSgN8v9xKZFs03c1KcphzRtCTrxrIkqqqKCxGwv9gTT3yKfq4H5alg3GQG51-a7rzJrfrxmT0M0DvbWXRhiIiZ99uoKEWHWfLHZtQ0tzv1in1zEHx9"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
              </div>
            </div>
            
            {/* Floating badges */}
            <div className="absolute -bottom-6 -left-6 bg-white/80 backdrop-blur-xl p-4 rounded-xl shadow-lg border border-white/50 flex items-center gap-4 animate-float" style={{ animationDelay: '1s' }}>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
                <FiBookOpen size={24} />
              </div>
              <div>
                <div className="text-xs text-gray-600">Next Cohort</div>
                <div className="text-sm font-bold text-gray-900">Starts Oct 15</div>
              </div>
            </div>
            
            <div className="absolute -top-6 -right-6 bg-white/80 backdrop-blur-xl p-3 rounded-xl shadow-lg border border-white/50 flex items-center gap-3 animate-float" style={{ animationDelay: '2s' }}>
              <div className="flex items-center gap-1">
                <FiStar className="text-yellow-400 fill-current" size={16} />
                <span className="font-bold text-gray-900 text-sm">4.9</span>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="text-gray-600 text-sm">Top Rated</div>
            </div>
          </div>
        </div>
      </header>

      {/* Program Overview */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100/80 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-4">
              Program Highlights
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Program Overview</h2>
            <p className="text-gray-600 mt-2">Everything you need to succeed in the AI industry.</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {overviewItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div 
                  key={index}
                  className={`group relative overflow-hidden rounded-xl p-6 flex flex-col justify-between aspect-square lg:aspect-auto h-full min-h-[180px] transition-all duration-500 ${
                    item.isPrimary 
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-600/20 hover:shadow-2xl hover:shadow-blue-600/30 hover:-translate-y-2' 
                      : 'bg-white border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-2'
                  }`}
                >
                  {!item.isPrimary && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  )}
                  
                  <Icon className={`text-3xl ${item.isPrimary ? '' : 'text-blue-600'} mb-4 group-hover:scale-110 transition-transform duration-300`} />
                  
                  <div>
                    <div className={`text-xs font-semibold ${item.isPrimary ? 'text-blue-100' : 'text-gray-600'} uppercase tracking-wider mb-1`}>
                      {item.label}
                    </div>
                    <div className={`text-2xl font-bold ${item.isPrimary ? 'text-white' : 'text-gray-900'}`}>
                      {item.value}
                    </div>
                    {item.detail && (
                      <div className={`text-xs ${item.isPrimary ? 'text-blue-100/70' : 'text-gray-500'} mt-1`}>
                        {item.detail}
                      </div>
                    )}
                  </div>
                  
                  <div className={`absolute bottom-0 right-0 w-20 h-20 rounded-tl-full ${item.isPrimary ? 'bg-white/5' : 'bg-blue-500/5'} transform translate-x-4 translate-y-4`}></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100/80 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-4">
            Curriculum
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Your Learning Journey</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">A rigorous, structured path designed to take you from foundational math to deploying state-of-the-art models.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Tabs Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-gray-50/50 rounded-2xl p-2 backdrop-blur-sm border border-gray-200/50 shadow-lg">
              <div className="relative">
                <div className="hidden lg:block absolute left-3 top-3 bottom-3 w-0.5 bg-gray-200/30 rounded-full"></div>
                <div 
                  className="hidden lg:block absolute left-3 w-0.5 bg-gradient-to-b from-blue-600 to-blue-700 rounded-full transition-all duration-500 ease-out" 
                  style={{ top: '12px', height: '44px', transform: `translateY(${indicatorTop}px)` }}
                ></div>
                
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      ref={(el) => tabRefs.current[tab.id] = el}
                      className={`group w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative ${
                        activeTab === tab.id 
                          ? 'bg-white shadow-md text-gray-900' 
                          : 'hover:bg-white/50 text-gray-600 hover:text-gray-900'
                      }`}
                      data-target={tab.id}
                      onClick={(e) => handleTabClick(e, tab.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                          activeTab === tab.id 
                            ? 'bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600' 
                            : 'bg-transparent text-gray-400 group-hover:text-blue-600'
                        }`}>
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-mono ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}`}>
                              {tab.short}
                            </span>
                            <span className="truncate">{tab.label}</span>
                          </div>
                        </div>
                        {activeTab === tab.id && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Tab Content Area */}
          <div className="lg:col-span-8">
            {tabs.map((tab) => {
              const content = contentData[tab.id];
              if (!content) return null;
              return (
                <div 
                  key={tab.id}
                  className={`transition-all duration-500 ${
                    activeTab === tab.id ? 'block animate-fadeIn' : 'hidden'
                  }`}
                  id={tab.id}
                >
                  <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-600 shadow-lg shadow-blue-100">
                        {content.icon === 'FaPython' && <FaPython size={28} />}
                        {content.icon === 'LuBrain' && <LuBrain size={28} />}
                        {content.icon === 'FiBookOpen' && <FiBookOpen size={28} />}
                        {content.icon === 'FiGrid' && <FiGrid size={28} />}
                        {content.icon === 'FaAws' && <FaAws size={28} />}
                        {content.icon === 'LuRocket' && <LuRocket size={28} />}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{content.title}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-600 uppercase tracking-wider">{content.subtitle}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span className="text-xs text-blue-600 font-medium">{content.items.length} modules</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-8 leading-relaxed">{content.description}</p>
                    
                    {content.items.length > 0 && (
                      <div className="space-y-3">
                        {content.items.map((item, idx) => {
                          const ItemIcon = item.icon;
                          return (
                            <div 
                              key={idx} 
                              className="group/item flex items-start gap-4 p-4 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-all duration-300 hover:shadow-md hover:translate-x-1 cursor-default"
                            >
                              <div className="mt-1 w-6 h-6 rounded-full bg-blue-100/50 flex items-center justify-center flex-shrink-0 group-hover/item:bg-blue-200/50 transition-colors">
                                <FiCheckCircle className="text-blue-600 text-sm" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between gap-4">
                                  <h4 className="font-medium text-gray-900">{item.title}</h4>
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                    {item.duration || '1 week'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{item.description}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {/* Tech Stack */}
                    {content.techStack && (
                      <div className="mt-8 pt-6 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Tech Stack</p>
                        <div className="flex flex-wrap gap-2">
                          {content.techStack.map((tech, idx) => (
                            <span key={idx} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Progress indicator */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="text-blue-600 font-medium">Module {tabs.findIndex(t => t.id === tab.id) + 1} of {tabs.length}</span>
                      </div>
                      <div className="mt-2 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-600 to-blue-700 rounded-full transition-all duration-1000"
                          style={{ width: `${((tabs.findIndex(t => t.id === tab.id) + 1) / tabs.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mentors Section */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50/80 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100/80 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-4">
                Expert Instructors
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Learn from the Best</h2>
              <p className="text-lg text-gray-600 mt-2 max-w-2xl">Your instructors are active practitioners building AI at the world's most innovative companies.</p>
            </div>
            <button className="group text-blue-600 font-medium flex items-center gap-1 hover:gap-2 transition-all duration-300 hover:underline">
              View all mentors 
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mentors.map((mentor, index) => (
              <div 
                key={index}
                className="group relative bg-white rounded-2xl p-6 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl border border-gray-100 shadow-lg"
                onMouseEnter={() => setHoveredMentor(index)}
                onMouseLeave={() => setHoveredMentor(null)}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
                        <img className="w-full h-full object-cover" alt={mentor.name} src={mentor.image} />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/20">
                        {mentor.rating}
                      </div>
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-gray-50 text-xs font-semibold text-gray-700 flex items-center gap-1.5 shadow-sm border border-gray-100">
                      <FiBriefcase size={12} className="text-blue-600" /> 
                      {mentor.company}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {mentor.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">{mentor.title}</p>
                  
                  {/* Expertise tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {mentor.expertise.map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  <p className="text-sm text-gray-600 border-t border-gray-100 pt-4">{mentor.bio}</p>
                  
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <FiUsers size={16} className="text-blue-600" />
                      <span>{mentor.students}+ students</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Outcomes Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div 
            className="bg-cover bg-center w-full h-full opacity-10" 
            style={{ 
              backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD8u_Yk5WejLemzuCyqno0-KPoOesNf41MlFBnEJ7YRtEyLoCY473Wgt7CRu_7ULbO3g1JVzPJRzmwf453YRkv8bTWx-7KX-ZocWqPDLy5ch0v2GWrxPk3NAP9llJJRwEGRqwO6NbqnaDK1_5JHiMvaSzSJTxoZ1X-WnqAnqRVLLbfq3Y3lQ6QaQ_JaOfZ6-KoBpTkFBaOf9c8N5i6RlmqllPL8prVZ7OE0ZlyG7DBskUSBY8BiHRgHXjbADvfmXttEJmDyoOdkrACA')" 
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-white"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100/80 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-4">
              Career Outcomes
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Career Outcomes</h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">Graduates of the AI Engineering Immersive step into high-impact roles at top technology companies.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl border border-gray-200/50 shadow-lg flex flex-col items-center text-center hover:shadow-xl transition-shadow">
              <FiTrendingUp className="text-4xl text-emerald-600 mb-4" />
              <div className="text-4xl font-bold text-gray-900 mb-2">+$42K</div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Average Salary Increase</p>
            </div>
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl border border-gray-200/50 shadow-lg flex flex-col items-center text-center hover:shadow-xl transition-shadow">
              <FiUsers className="text-4xl text-blue-600 mb-4" />
              <div className="text-4xl font-bold text-gray-900 mb-2">94%</div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Hired within 6 months</p>
            </div>
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl border border-gray-200/50 shadow-lg flex flex-col items-center text-center hover:shadow-xl transition-shadow">
              <FiAward className="text-4xl text-blue-600 mb-4" />
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                <span className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-gray-700 shadow-sm border border-gray-100">Machine Learning Engineer</span>
                <span className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-gray-700 shadow-sm border border-gray-100">AI Researcher</span>
                <span className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-gray-700 shadow-sm border border-gray-100">Data Scientist</span>
              </div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mt-6">Top Alumni Roles</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dark CTA Section */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden m-4 md:m-8 rounded-3xl shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] -z-0 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[100px] -z-0 pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10 px-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">Ready to start your AI journey?</h2>
          <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">Join the next cohort of AI Engineering Immersive. Seats are strictly limited to ensure a 1:10 mentorship ratio.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium px-8 py-4 rounded-full transition-all duration-300 shadow-lg flex items-center justify-center gap-2 hover:shadow-xl hover:scale-105 hover:shadow-blue-600/30">
              Apply for Next Cohort <FiArrowRight />
            </button>
            <button className="bg-transparent border border-gray-600 text-white font-medium px-8 py-4 rounded-full transition-all duration-300 hover:bg-white/10 flex items-center justify-center gap-2">
              Schedule a Call <FiCalendar />
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-6">Next cohort begins October 15th. Applications close October 1st.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
          <div className="flex flex-col items-center md:items-start">
            <div className="text-2xl font-bold text-blue-600 mb-4">Pirnav</div>
            <p className="text-sm text-gray-600">© 2024 Pirnav EdTech. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-end gap-x-8 gap-y-4">
            <a className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200" href="#">Privacy Policy</a>
            <a className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200" href="#">Terms of Service</a>
            <a className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200" href="#">Cookie Policy</a>
            <a className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200" href="#">Contact Us</a>
          </div>
        </div>
      </footer>

      {/* Custom CSS */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default AIEngineeringImmersive;