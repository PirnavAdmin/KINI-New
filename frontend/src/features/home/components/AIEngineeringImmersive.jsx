import React, { useState, useEffect, useRef } from 'react';

const AIEngineeringImmersive = () => {
  const [activeTab, setActiveTab] = useState('module-1');
  const [indicatorTop, setIndicatorTop] = useState(0);
  const tabRefs = useRef({});

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

  const tabs = [
    { id: 'module-1', label: 'Python & Math Foundations', short: 'M1' },
    { id: 'module-2', label: 'Deep Learning & Neural Networks', short: 'M2' },
    { id: 'module-3', label: 'Natural Language Processing', short: 'M3' },
    { id: 'module-4', label: 'Computer Vision', short: 'M4' },
    { id: 'module-5', label: 'MLOps & Deployment', short: 'M5' },
    { id: 'module-6', label: 'Capstone Project', short: 'M6' },
  ];

  const contentData = {
    'module-1': {
      icon: 'functions',
      title: 'Python & Math Foundations',
      subtitle: 'Weeks 1-4',
      description: 'Establish a rock-solid foundation in the mathematics and programming skills essential for modern AI. We focus on practical application rather than pure theory.',
      items: [
        { title: 'Linear Algebra & Calculus for ML', description: 'Vectors, matrices, eigenvectors, and partial derivatives applied to optimization problems.' },
        { title: 'Advanced Python for Data', description: 'Mastering NumPy, Pandas, and PyTorch tensors for efficient numerical computation.' },
      ]
    },
    'module-2': {
      icon: 'neurology',
      title: 'Deep Learning & Neural Networks',
      subtitle: 'Weeks 5-8',
      description: 'Dive deep into neural network architectures, training methodologies, and advanced deep learning techniques.',
      items: [
        { title: 'Neural Network Fundamentals', description: 'Understanding perceptrons, activation functions, and backpropagation.' },
        { title: 'Convolutional Neural Networks', description: 'Building CNNs for image classification and object detection tasks.' },
        { title: 'Transfer Learning', description: 'Leveraging pre-trained models like ResNet, VGG, and Inception for custom tasks.' },
      ]
    },
    'module-3': {
      icon: 'text_fields',
      title: 'Natural Language Processing',
      subtitle: 'Weeks 9-12',
      description: 'Master the art of processing and understanding human language with state-of-the-art NLP techniques.',
      items: [
        { title: 'Transformers & Attention', description: 'Understanding the transformer architecture and self-attention mechanisms.' },
        { title: 'Large Language Models', description: 'Working with GPT, BERT, and T5 for text generation, classification, and QA.' },
        { title: 'Fine-tuning LLMs', description: 'Fine-tuning pre-trained language models for specific domains and tasks.' },
      ]
    },
    'module-4': {
      icon: 'visibility',
      title: 'Computer Vision',
      subtitle: 'Weeks 13-16',
      description: 'Build cutting-edge computer vision systems that can see, understand, and interpret visual information.',
      items: [
        { title: 'Object Detection & Segmentation', description: 'Implementing YOLO, SSD, and Mask R-CNN for object detection and segmentation.' },
        { title: 'Generative Models', description: 'Using GANs and VAEs for image generation and manipulation.' },
        { title: 'Video Understanding', description: 'Action recognition, video classification, and optical flow estimation.' },
      ]
    },
    'module-5': {
      icon: 'cloud',
      title: 'MLOps & Deployment',
      subtitle: 'Weeks 17-20',
      description: 'Learn how to deploy, monitor, and scale machine learning models in production environments.',
      items: [
        { title: 'Model Serving & APIs', description: 'Building REST APIs and deploying models with FastAPI, Flask, and TensorFlow Serving.' },
        { title: 'Docker & Kubernetes', description: 'Containerizing ML applications and orchestrating deployments with Kubernetes.' },
        { title: 'ML Pipelines', description: 'Building automated ML pipelines with Airflow, Kubeflow, or TFX.' },
      ]
    },
    'module-6': {
      icon: 'rocket_launch',
      title: 'Capstone Project',
      subtitle: 'Weeks 21-24',
      description: 'Apply everything you\'ve learned to build a production-ready AI application solving a real-world problem.',
      items: [
        { title: 'Project Ideation', description: 'Identifying and scoping a meaningful AI project with market potential.' },
        { title: 'Model Development', description: 'Building, training, and optimizing your AI model for your specific use case.' },
        { title: 'Deployment & Presentation', description: 'Deploying your solution and presenting your project to industry judges.' },
      ]
    }
  };

  const mentors = [
    {
      name: 'Dr. Sarah Chen',
      title: 'Senior Research Engineer',
      company: 'OpenAI',
      bio: 'Specializes in Large Language Models and alignment. Previously led ML teams at DeepMind.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJ0jOtdIRxYsXJbmbDyi4UwjcHWPg_umCNfKb_8T-A0mfzAa10xxb24uIjoZCA8Fke_P6BiSNwW8116mjJMokTGTKqbPQULLmbuF8zplynK5TpWBoNqtxdCwRsE92P981eYgqRcPZ6TeMuhUQurSNpcEs7W3rU0IoVxNWmi5KbgeAZcHhWALNnIWx2lIXzWLIxlLBkUqf-IXJ0Bk62LqQGmM4R8ExOPiNkTIUduBzxF9V6wZdqC7IIon4tWpTN5SLWINO8CpSknT4n'
    },
    {
      name: 'Marcus Johnson',
      title: 'AI Systems Architect',
      company: 'Meta',
      bio: 'Expert in distributed training and MLOps. Scaled computer vision models serving billions of requests.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDy62p4JvZOL7TqqkYaXC9GtRxuBFx4icUQ0TmuIYhI_xZeESa2bnThIEtQVMFKqeVl8ZCNVg4uKp1GgvU4Fetd6pams8qOWacu6CPRSqKhQ31PSuhIJzUBUKT3selD5kmylEAvLwialFYMG1S-EoIM5-BLHpkN3FUArpnnb9mli4itNdCEroBYT0sBQgY4N8BB2vofjQvPF_DrL72PCjGBG5ZkDRehBkhloMG3bNnlJFKVZuyO7zo2Q09MPP8C93aR6eadlB-pCqIM'
    },
    {
      name: 'Elena Rodriguez',
      title: 'Staff AI Engineer',
      company: 'Google',
      bio: 'Focuses on edge AI and model optimization. Contributor to TensorFlow and leading open-source projects.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgQjF3xmMt9FK3nXTfLulkshSib7xIDoKKQnn-MWvLCXuKilMijDJrpQ3Ja3k5Nf4ArWdAewoh4cvIF66c1u4V-Fl1lZjsvALTiysuLTVfzPQADvtAQmSJPu8gX25b1CKyv4JApSbmdjKGLTpY8WjOb1bba0AXnEBa2zmrlBCV1_JTj2p3fcHPIjnHlKFqGgF8H6tzQEekpmiD8jSelbB375mQcqF1Wr9fkLFABkBrph5Q0hZN-Fvhl98vSu1SHx3_6a_4n8dTsF70'
    }
  ];

  const overviewItems = [
    { icon: 'schedule', label: 'Duration', value: '24 Weeks' },
    { icon: 'videocam', label: 'Format', value: 'Live Online' },
    { icon: 'code_blocks', label: 'Projects', value: '12+ Real-world' },
    { icon: 'group', label: 'Mentor Ratio', value: '1:10', isPrimary: true },
  ];

  return (
    <div className="bg-white text-gray-900 antialiased font-sans">
      {/* Hero Section */}
      <header className="pt-8 pb-8 px-4 md:px-8 max-w-7xl mx-auto relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[400px] h-[400px] bg-blue-100/20 rounded-full blur-3xl -z-10 hidden md:block"></div>
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[300px] h-[300px] bg-emerald-100/20 rounded-full blur-3xl -z-10 hidden md:block"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 flex flex-col items-start space-y-4 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100/50">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span className="text-xs font-semibold text-gray-600 tracking-wider uppercase">AI Engineering Immersive</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Master the Future of <span className="bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">Intelligence</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl">
              A comprehensive 6-month journey from foundations to production-grade AI systems. Build real-world applications with guidance from industry leaders.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full sm:w-auto">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-full transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                Enroll Now <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
              <button className="bg-white border border-gray-200 hover:border-blue-300 text-gray-700 hover:bg-gray-50 font-medium px-6 py-3 rounded-full transition-all flex items-center justify-center gap-2">
                Download Syllabus <span className="material-symbols-outlined text-sm">download</span>
              </button>
            </div>
          </div>
          <div className="lg:col-span-5 mt-6 lg:mt-0 relative z-10">
            <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border border-gray-200/50">
              <img 
                className="w-full h-full object-cover" 
                alt="AI engineering workspace with neural network hologram" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwxh1xEwdef1m-w5cptf7R5U6qKXBi1NQbLqfxh_bxsbsIJ4HPk1vafeOH3pNshLqAvQErTlduYVM4HlZw6ZsFI8aEfNznkLUda6UmnnU0doF7jFzkZRCN5jOh6sFDo-c2c9lvXb16kwfcNsKhoRkKWOQHHrnSgN8v9xKZFs03c1KcphzRtCTrxrIkqqqKCxGwv9gTT3yKfq4H5alg3GQG51-a7rzJrfrxmT0M0DvbWXRhiIiZ99uoKEWHWfLHZtQ0tzv1in1zEHx9"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white/90 backdrop-blur-xl p-3 rounded-xl shadow-lg border border-white/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-sm">school</span>
              </div>
              <div>
                <div className="text-xs text-gray-500">Next Cohort</div>
                <div className="text-sm font-semibold text-gray-900">Starts Oct 15</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Program Overview */}
      <section className="py-8 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Program Overview</h2>
            <p className="text-gray-600 mt-1">Everything you need to succeed in the AI industry.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {overviewItems.map((item, index) => (
              <div 
                key={index}
                className={`rounded-xl p-4 md:p-6 flex flex-col justify-between min-h-[140px] md:min-h-[160px] transition-all hover:-translate-y-1 ${
                  item.isPrimary 
                    ? 'col-span-2 md:col-span-1 bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'bg-white border border-gray-200 shadow-sm hover:shadow-md'
                }`}
              >
                <span className={`material-symbols-outlined text-2xl ${item.isPrimary ? '' : 'text-blue-600'} mb-2`}>
                  {item.icon}
                </span>
                <div>
                  <div className={`text-xs font-semibold ${item.isPrimary ? 'text-blue-100' : 'text-gray-500'} uppercase tracking-wider mb-0.5`}>
                    {item.label}
                  </div>
                  <div className={`text-xl font-bold ${item.isPrimary ? 'text-white' : 'text-gray-900'}`}>
                    {item.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section className="py-10 max-w-7xl mx-auto px-4 md:px-8">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Curriculum</h2>
          <p className="text-gray-600 max-w-3xl">A rigorous, structured path designed to take you from foundational math to deploying state-of-the-art models.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          <div className="md:col-span-4 flex flex-col gap-1.5 relative">
            <div className="hidden md:block absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200/50 rounded-full"></div>
            <div 
              className="hidden md:block absolute left-0 w-0.5 bg-blue-600 rounded-full transition-all duration-300 ease-out" 
              style={{ top: 0, height: '48px', transform: `translateY(${indicatorTop}px)` }}
            ></div>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                ref={(el) => tabRefs.current[tab.id] = el}
                className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                  activeTab === tab.id 
                    ? 'bg-blue-50 text-gray-900' 
                    : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                }`}
                data-target={tab.id}
                onClick={(e) => handleTabClick(e, tab.id)}
              >
                <span className="text-xs text-gray-400 font-mono mr-2">{tab.short}</span> {tab.label}
              </button>
            ))}
          </div>
          <div className="md:col-span-8">
            {tabs.map((tab) => {
              const content = contentData[tab.id];
              if (!content) return null;
              return (
                <div 
                  key={tab.id}
                  className={`${activeTab === tab.id ? 'block' : 'hidden'}`}
                  id={tab.id}
                >
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <span className="material-symbols-outlined">{content.icon}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{content.title}</h3>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">{content.subtitle}</p>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-6">{content.description}</p>
                    {content.items.length > 0 && (
                      <div className="space-y-3">
                        {content.items.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors">
                            <span className="material-symbols-outlined text-blue-600 text-lg mt-0.5">check_circle</span>
                            <div>
                              <h4 className="font-medium text-gray-900">{item.title}</h4>
                              <p className="text-sm text-gray-600 mt-0.5">{item.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mentors Section */}
      <section className="py-10 bg-gray-50/50 border-t border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Learn from the Best</h2>
              <p className="text-gray-600 mt-1 max-w-2xl">Your instructors are active practitioners building AI at the world's most innovative companies.</p>
            </div>
            <button className="text-blue-600 font-medium flex items-center gap-1 hover:underline text-sm">
              View all mentors <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mentors.map((mentor, index) => (
              <div key={index} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100">
                    <img className="w-full h-full object-cover" alt={mentor.name} src={mentor.image} />
                  </div>
                  <div className="px-2.5 py-1 rounded-full bg-gray-50 text-xs font-semibold text-gray-700 flex items-center gap-1 border border-gray-200">
                    <span className="material-symbols-outlined text-xs">work</span> {mentor.company}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-0.5 group-hover:text-blue-600 transition-colors">{mentor.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{mentor.title}</p>
                <p className="text-sm text-gray-600 border-t border-gray-200/50 pt-3">{mentor.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Outcomes Section */}
      <section className="py-10 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div 
            className="bg-cover bg-center w-full h-full opacity-20" 
            style={{ 
              backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD8u_Yk5WejLemzuCyqno0-KPoOesNf41MlFBnEJ7YRtEyLoCY473Wgt7CRu_7ULbO3g1JVzPJRzmwf453YRkv8bTWx-7KX-ZocWqPDLy5ch0v2GWrxPk3NAP9llJJRwEGRqwO6NbqnaDK1_5JHiMvaSzSJTxoZ1X-WnqAnqRVLLbfq3Y3lQ6QaQ_JaOfZ6-KoBpTkFBaOf9c8N5i6RlmqllPL8prVZ7OE0ZlyG7DBskUSBY8BiHRgHXjbADvfmXttEJmDyoOdkrACA')" 
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-white"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Career Outcomes</h2>
            <p className="text-gray-600 mt-2 max-w-2xl mx-auto">Graduates of the AI Engineering Immersive step into high-impact roles at top technology companies.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-200/50 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <span className="material-symbols-outlined text-3xl text-emerald-600 mb-3">trending_up</span>
              <div className="text-3xl font-bold text-gray-900 mb-1">+$42K</div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Average Salary Increase</p>
            </div>
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-200/50 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <span className="material-symbols-outlined text-3xl text-blue-600 mb-3">business_center</span>
              <div className="text-3xl font-bold text-gray-900 mb-1">94%</div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Hired within 6 months</p>
            </div>
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-200/50 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <span className="material-symbols-outlined text-3xl text-blue-600 mb-3">badge</span>
              <div className="flex flex-wrap justify-center gap-1.5 mt-1">
                <span className="px-2.5 py-1 bg-white rounded-full text-xs font-semibold text-gray-700 shadow-sm border border-gray-100">Machine Learning Engineer</span>
                <span className="px-2.5 py-1 bg-white rounded-full text-xs font-semibold text-gray-700 shadow-sm border border-gray-100">AI Researcher</span>
                <span className="px-2.5 py-1 bg-white rounded-full text-xs font-semibold text-gray-700 shadow-sm border border-gray-100">Data Scientist</span>
              </div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mt-4">Top Alumni Roles</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 bg-gray-900 text-white relative overflow-hidden mx-4 md:mx-8 rounded-2xl shadow-2xl">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[100px] -z-0 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/20 rounded-full blur-[100px] -z-0 pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10 px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">Ready to start your AI journey?</h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">Join the next cohort of AI Engineering Immersive. Seats are strictly limited to ensure a 1:10 mentorship ratio.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3.5 rounded-full transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
              Apply for Next Cohort <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
            <button className="bg-transparent border border-gray-600 hover:bg-white/10 text-white font-medium px-8 py-3.5 rounded-full transition-all flex items-center justify-center gap-2">
              Schedule a Call <span className="material-symbols-outlined text-sm">calendar_month</span>
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-4">Next cohort begins October 15th. Applications close October 1st.</p>
        </div>
      </section>
    </div>
  );
};

export default AIEngineeringImmersive;