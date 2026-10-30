
import React, { useState } from 'react';
import {
  FiCode, FiCpu, FiAward, FiCloud, FiDatabase, FiLayers,
  FiChevronRight, FiZap, FiShield, FiTrendingUp, FiUsers,
  FiGlobe, FiTerminal,
} from 'react-icons/fi';
import { useThemeContext } from '@shared/context/ThemeContext';

// ─── Data (unchanged) ────────────────────────────────────────────────────────

const TABS = [
  { id: 'dotnet',   label: '.NET Platform',      icon: FiLayers   },
  { id: 'aiml',     label: 'AI/ML & Gen AI',      icon: FiCpu      },
  { id: 'career',   label: 'Career & Leadership', icon: FiAward    },
  { id: 'devops',   label: 'Cloud & DevOps',       icon: FiCloud    },
  { id: 'java',     label: 'Java Platform',        icon: FiDatabase },
  { id: 'frontend', label: 'JS & Front-end',       icon: FiCode     },
];

const COURSE_DATA = {
  java: [
    { id: 'j1', title: 'Data Structures and Algorithms Training',     desc: 'Master foundational computer science matrices, complex sorting algorithms, and system optimized balance trees.', icon: FiLayers,   iconGradient: 'from-purple-500/20 to-indigo-600/20 text-purple-400 border-purple-500/30' },
    { id: 'j2', title: 'Java Microservices Certification Training',   desc: 'Build scalable distributed systems using Spring Boot, Spring Cloud, Docker, and reactive architecture frameworks.', icon: FiDatabase, iconGradient: 'from-emerald-500/20 to-teal-600/20 text-emerald-400 border-emerald-500/30' },
    { id: 'j3', title: 'Spring Boot & REST API Mastery',              desc: 'Design production-grade REST APIs with Spring Boot, security layers, JPA, and full test coverage.', icon: FiZap,      iconGradient: 'from-yellow-500/20 to-orange-600/20 text-yellow-400 border-yellow-500/30' },
    { id: 'j4', title: 'Java Concurrency & Performance',              desc: 'Deep dive into thread pools, CompletableFuture, JVM tuning, and high-throughput system design patterns.', icon: FiTrendingUp, iconGradient: 'from-rose-500/20 to-pink-600/20 text-rose-400 border-rose-500/30' },
  ],
  dotnet: [
    { id: 'd1', title: 'Enterprise .NET Core Architecture',   desc: 'Deep dive into Clean Architecture, Web API optimization, and secure entity frameworks for high-throughput enterprise scale.', icon: FiLayers, iconGradient: 'from-blue-500/20 to-cyan-600/20 text-blue-400 border-blue-500/30' },
    { id: 'd2', title: 'ASP.NET Core Microservices',          desc: 'Build cloud-native microservices with ASP.NET Core, gRPC, MassTransit, and Azure Service Bus.', icon: FiCloud,  iconGradient: 'from-sky-500/20 to-blue-600/20 text-sky-400 border-sky-500/30' },
    { id: 'd3', title: 'C# Advanced Patterns & LINQ',         desc: 'Master generics, expression trees, async streams, and writing idiomatic modern C# for enterprise codebases.', icon: FiCode,   iconGradient: 'from-violet-500/20 to-purple-600/20 text-violet-400 border-violet-500/30' },
    { id: 'd4', title: 'Blazor Full-Stack Development',        desc: 'Build interactive SPAs using Blazor WebAssembly and Server with component architecture and SignalR integration.', icon: FiZap,    iconGradient: 'from-fuchsia-500/20 to-pink-600/20 text-fuchsia-400 border-fuchsia-500/30' },
  ],
  aiml: [
    { id: 'a1', title: 'Machine Learning A–Z Bootcamp',      desc: 'Supervised, unsupervised, and reinforcement learning with Python, scikit-learn, and real-world project capstones.', icon: FiCpu,      iconGradient: 'from-cyan-500/20 to-blue-600/20 text-cyan-400 border-cyan-500/30' },
    { id: 'a2', title: 'LLM Engineering & RAG Pipelines',    desc: 'Design production LLM applications with prompt engineering, fine-tuning, vector databases, and agentic workflows.', icon: FiZap,      iconGradient: 'from-emerald-500/20 to-teal-600/20 text-emerald-400 border-emerald-500/30' },
    { id: 'a3', title: 'Generative AI for Developers',        desc: 'Build with OpenAI, Anthropic, and open-source models — images, audio, code generation, and multi-modal pipelines.', icon: FiLayers,   iconGradient: 'from-violet-500/20 to-indigo-600/20 text-violet-400 border-violet-500/30' },
    { id: 'a4', title: 'Deep Learning with PyTorch',          desc: 'CNNs, transformers, and custom model training pipelines for computer vision and NLP production workloads.', icon: FiDatabase, iconGradient: 'from-orange-500/20 to-red-600/20 text-orange-400 border-orange-500/30' },
  ],
  career: [
    { id: 'c1', title: 'Engineering Management Masterclass', desc: 'Lead high-performing teams with effective 1:1s, technical roadmaps, hiring frameworks, and performance culture.', icon: FiUsers,     iconGradient: 'from-amber-500/20 to-yellow-600/20 text-amber-400 border-amber-500/30' },
    { id: 'c2', title: 'Staff Engineer Career Path',          desc: 'Navigate technical strategy, cross-team influence, and org-level impact — the playbook for principal+ engineers.', icon: FiAward,     iconGradient: 'from-rose-500/20 to-pink-600/20 text-rose-400 border-rose-500/30' },
    { id: 'c3', title: 'System Design Interview Pro',         desc: 'Crack senior-level design rounds with a repeatable framework, 30+ real questions, and trade-off mastery.', icon: FiLayers,    iconGradient: 'from-cyan-500/20 to-blue-600/20 text-cyan-400 border-cyan-500/30' },
    { id: 'c4', title: 'Salary Negotiation & Career Growth',  desc: 'Data-driven compensation research, anchoring tactics, and promotion strategies for senior engineering roles.', icon: FiTrendingUp, iconGradient: 'from-emerald-500/20 to-green-600/20 text-emerald-400 border-emerald-500/30' },
  ],
  devops: [
    { id: 'dv1', title: 'AWS Solutions Architect Training',       desc: 'Certification-ready SAA-C03 prep covering VPC, IAM, compute, storage, and multi-region resilient architectures.', icon: FiCloud,    iconGradient: 'from-orange-500/20 to-amber-600/20 text-orange-400 border-orange-500/30' },
    { id: 'dv2', title: 'Docker & Kubernetes in Production',      desc: 'Containerize apps, manage clusters with Kubernetes, set up CI/CD pipelines, and master Helm chart deployments.', icon: FiLayers,   iconGradient: 'from-blue-500/20 to-indigo-600/20 text-blue-400 border-blue-500/30' },
    { id: 'dv3', title: 'Terraform & Infrastructure as Code',     desc: 'Provision cloud infrastructure at scale using Terraform modules, remote state, and GitOps deployment strategies.', icon: FiShield,   iconGradient: 'from-violet-500/20 to-purple-600/20 text-violet-400 border-violet-500/30' },
    { id: 'dv4', title: 'Site Reliability Engineering (SRE)',     desc: 'Build observable systems with Prometheus, Grafana, alerting runbooks, SLOs, and incident response playbooks.', icon: FiTerminal, iconGradient: 'from-teal-500/20 to-cyan-600/20 text-teal-400 border-teal-500/30' },
  ],
  frontend: [
    { id: 'f1', title: 'React Mastery Track',                  desc: 'From hooks to architecture patterns — build scalable SPAs with React, Context, Zustand, and React Query.', icon: FiCode,   iconGradient: 'from-cyan-500/20 to-sky-600/20 text-cyan-400 border-cyan-500/30' },
    { id: 'f2', title: 'Next.js Full-Stack Development',        desc: 'Server components, App Router, ISR, and full-stack patterns with Prisma, Auth.js, and Vercel deployments.', icon: FiZap,    iconGradient: 'from-slate-500/20 to-gray-600/20 text-slate-300 border-slate-500/30' },
    { id: 'f3', title: 'Advanced TypeScript for React',         desc: 'Generics, discriminated unions, mapped types, and enterprise-grade TypeScript patterns for large codebases.', icon: FiLayers, iconGradient: 'from-blue-500/20 to-indigo-600/20 text-blue-400 border-blue-500/30' },
    { id: 'f4', title: 'Web Performance & Core Web Vitals',     desc: 'Master bundling, lazy loading, image optimization, runtime profiling, and achieving green CWV scores.', icon: FiGlobe,  iconGradient: 'from-emerald-500/20 to-green-600/20 text-emerald-400 border-emerald-500/30' },
  ],
};

// ─── CourseCard ──────────────────────────────────────────────────────────────

function CourseCard({ course }) {
  const Icon = course.icon;
  return (
    <div className="
      group relative flex items-start gap-4 p-4 rounded-xl
      bg-slate-900/40 border border-white/[0.05]
      backdrop-blur-md shadow-[0_4px_20px_0_rgba(0,0,0,0.25)]
      transition-all duration-300
      hover:scale-[1.02] hover:border-cyan-500/30
      hover:shadow-[0_0_24px_rgba(6,182,212,0.12)]
      cursor-pointer
    ">
      {/* Icon */}
      <div className={`
        flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br border
        flex items-center justify-center shadow-inner
        transition-transform duration-300 group-hover:scale-105
        ${course.iconGradient}
      `}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <h4 className="
          text-sm font-bold text-white tracking-tight mb-1
          group-hover:text-cyan-400 transition-colors duration-200
          line-clamp-1
        ">
          {course.title}
        </h4>
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-3">
          {course.desc}
        </p>
        <button className="
          flex items-center gap-1 px-3 py-1.5 rounded-lg
          text-xs font-semibold text-slate-300
          border border-white/10 bg-white/[0.02]
          hover:text-white hover:border-cyan-400/50 hover:bg-cyan-500/5
          transition-all duration-300
        ">
          More Details
          <FiChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Section ────────────────────────────────────────────────────────────

export default function SkillTracksSection() {
  const [activeTab, setActiveTab] = useState('java');
  const activeCourses = COURSE_DATA[activeTab] ?? [];
  const { isDark } = useThemeContext();

  return (
    <section className={`
  relative w-full overflow-hidden font-sans transition-colors duration-300
  ${isDark ? 'bg-[#020b14] text-white' : 'bg-slate-50 text-slate-900'}
`}>

      {/* Ambient glows */}
      {isDark && <>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[110px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-[320px] h-[320px] rounded-full bg-blue-600/10 blur-[90px] pointer-events-none" />
        <div className="absolute top-20 left-[15%] w-1 h-1 bg-white/40 rounded-full animate-pulse" />
        <div className="absolute bottom-40 right-[12%] w-1.5 h-1.5 bg-cyan-400/30 rounded-full animate-ping [animation-duration:3s]" />
        <div className="absolute top-1/2 right-[8%] w-1 h-1 bg-blue-400/40 rounded-full animate-pulse [animation-duration:2s]" />
      </>}

      {/* FIX 2: consistent padding — py-10 gives breathing room without overflow */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 flex flex-col items-center">

        {/* Heading — FIX 3: reduced mb-10 → mb-6 so heading and tabs are tighter */}
        <div className="flex flex-col items-center text-center mb-6 group">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2 select-none">
            Skill Tracks
          </h2>
          <div className="h-0.5 w-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300 group-hover:w-28 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
        </div>

        {/* Tabs — FIX 4: mb-12 → mb-5 so tabs and cards land together on screen */}
        <div className="w-full p-1.5 mb-5 rounded-2xl bg-slate-950/40 border border-white/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.6)] backdrop-blur-xl overflow-x-auto scrollbar-none">
          <div className="flex items-center justify-between gap-1 min-w-max md:min-w-0 w-full">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-1.5 px-3 py-2 rounded-xl
                    text-xs font-semibold tracking-wide
                    transition-all duration-300 whitespace-nowrap
                    ${isActive
                      ? 'bg-gradient-to-b from-white/[0.07] to-white/[0.02] text-cyan-400 border border-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-400/20'
                      : 'text-slate-400 border border-transparent hover:text-slate-200 hover:bg-white/[0.02]'
                    }
                  `}
                >
                  <tab.icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Course cards grid — FIX 5: removed min-h-[220px], gap-5 → gap-3 */}
        <div className="w-full">
          {activeCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="w-full py-12 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl bg-slate-950/10 backdrop-blur-sm">
              <FiCode className="w-7 h-7 text-slate-600 mb-2 stroke-[1.5]" />
              <p className="text-sm text-slate-500 font-medium">
                New cohorts forming soon. Check back shortly!
              </p>
            </div>
          )}
        </div>

        {/* CTA button — FIX 6: mt-8 → mt-5 so button stays on screen */}
        <div className="mt-5">
          <button className="
            group relative flex items-center gap-2
            px-6 py-3 rounded-full
            bg-gradient-to-r from-cyan-500 to-blue-600
            text-sm font-bold tracking-wide text-white
            shadow-[0_4px_20px_rgba(6,182,212,0.25)]
            transition-all duration-300
            hover:-translate-y-0.5
            hover:shadow-[0_6px_25px_rgba(6,182,212,0.4)]
            active:scale-[0.98]
          ">
            Explore All Live Training
            <div className="flex items-center text-white/80 group-hover:translate-x-0.5 transition-transform duration-200">
              <FiChevronRight className="w-4 h-4 -mr-1" />
              <FiChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>

      </div>
    </section>
  );
}