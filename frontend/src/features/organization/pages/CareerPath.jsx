import { useState, useMemo } from "react";
 
import { motion, AnimatePresence } from "framer-motion";
 
import {
 
  Briefcase, Target, Award, TrendingUp, Zap, ChevronRight,
 
  Plus, Search, Filter, Grid3X3, List, Edit3, Trash2, Eye, X,
 
  CheckCircle, Clock, User, Building2, GraduationCap, Star, AlertCircle,
 
  Lightbulb, ChevronDown, Sparkles
 
} from "lucide-react";
 
 
const container = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } };
 
const item = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
 
 
const MOCK_CAREER_PATHS = [
 
  { id: 1, name: "Frontend Development Track", department: "Engineering", description: "From Junior to Principal Frontend Engineer", currentPosition: "Junior Developer", targetPosition: "Principal Engineer", skills: ["React", "TypeScript", "System Design", "Leadership"], experience: "5-7 years", employees: 12, status: "active", createdAt: "2024-03-15" },
 
  { id: 2, name: "Backend Engineering Path", department: "Engineering", description: "Backend developer career progression", currentPosition: "Backend Developer", targetPosition: "Architect", skills: ["Node.js", "Python", "AWS", "Microservices"], experience: "6-8 years", employees: 8, status: "active", createdAt: "2024-03-10" },
 
  { id: 3, name: "Data Science Track", department: "Data Science", description: "From analyst to AI/ML lead", currentPosition: "Data Analyst", targetPosition: "AI Lead", skills: ["Python", "ML", "Deep Learning", "Statistics"], experience: "4-6 years", employees: 5, status: "active", createdAt: "2024-04-01" },
 
  { id: 4, name: "DevOps Career Path", department: "Engineering", description: "Infrastructure and DevOps progression", currentPosition: "Jr. DevOps", targetPosition: "Cloud Architect", skills: ["Docker", "Kubernetes", "Terraform", "CI/CD"], experience: "3-5 years", employees: 6, status: "active", createdAt: "2024-02-20" },
 
  { id: 5, name: "Management Track", department: "Management", description: "From Team Lead to Director", currentPosition: "Team Lead", targetPosition: "Director", skills: ["Leadership", "Strategy", "Communication", "Budgeting"], experience: "8-10 years", employees: 4, status: "draft", createdAt: "2024-05-01" },
 
  { id: 6, name: "UI/UX Design Path", department: "Design", description: "Design career progression", currentPosition: "Junior Designer", targetPosition: "Design Lead", skills: ["Figma", "User Research", "Prototyping", "Design Systems"], experience: "4-6 years", employees: 3, status: "active", createdAt: "2024-03-25" },
 
];
 
 
const ROADMAP_STAGES = [
 
  { role: "Junior Developer", description: "Build features, write tests, and learn core technologies.", skills: ["React", "JavaScript", "CSS", "Git"], certs: ["Frontend Fundamentals"], exp: "0-2 years", status: "completed", icon: User },
 
  { role: "Developer", description: "Own features, code reviews, and mentor juniors.", skills: ["TypeScript", "Node.js", "Testing", "APIs"], certs: ["Advanced React"], exp: "2-4 years", status: "completed", icon: Briefcase },
 
  { role: "Senior Developer", description: "Lead projects, architecture decisions, cross-team collaboration.", skills: ["System Design", "Performance", "Mentoring", "AWS"], certs: ["AWS Solutions Architect"], exp: "4-6 years", status: "current", icon: Award },
 
  { role: "Lead Developer", description: "Technical strategy, team leadership, stakeholder management.", skills: ["Architecture", "Team Management", "Strategy", "Agile"], certs: ["Engineering Management"], exp: "6-8 years", status: "upcoming", icon: Target },
 
  { role: "Architect", description: "Organization-wide technical vision, innovation, and standards.", skills: ["Enterprise Architecture", "Innovation", "Governance", "Mentoring"], certs: ["Enterprise Architecture"], exp: "8+ years", status: "upcoming", icon: Zap },
 
];
 
 
const CURRENT_SKILLS = [
 
  { name: "React", level: 85, category: "technical" },
 
  { name: "TypeScript", level: 78, category: "technical" },
 
  { name: "Node.js", level: 72, category: "technical" },
 
  { name: "System Design", level: 55, category: "technical" },
 
  { name: "Testing", level: 60, category: "technical" },
 
  { name: "Leadership", level: 45, category: "soft" },
 
  { name: "Communication", level: 70, category: "soft" },
 
  { name: "Mentoring", level: 50, category: "soft" },
 
];
 
 
const GAP_SKILLS = [
 
  { name: "AWS Architecture", demand: 90, current: 30, gap: 60 },
 
  { name: "Docker/Kubernetes", demand: 85, current: 25, gap: 60 },
 
  { name: "Team Management", demand: 80, current: 35, gap: 45 },
 
  { name: "System Design", demand: 88, current: 55, gap: 33 },
 
  { name: "Mentoring", demand: 75, current: 50, gap: 25 },
 
  { name: "Performance Optimization", demand: 70, current: 45, gap: 25 },
 
];
 
 
function KpiCard({ icon: Icon, label, value, sub, color, delay }) {
 
  return (
 
    <motion.div variants={item} className={`bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}>
 
      <div className="flex items-center gap-3 mb-3">
 
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} shadow-lg flex items-center justify-center`}>
 
          <Icon className="w-5 h-5 text-white" />
 
        </div>
 
        <div className="flex-1 min-w-0">
 
          <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">{value}</p>
 
          <p className="text-xs text-slate-400 dark:text-slate-500">{label}</p>
 
        </div>
 
      </div>
 
      {sub && <p className="text-xs font-medium text-emerald-500">{sub}</p>}
 
    </motion.div>
 
  );
 
}
 
 
function RoadmapStage({ stage, index }) {
 
  const statusColors = { completed: "bg-emerald-500", current: "bg-[#0f55f7]/50", upcoming: "bg-slate-300 dark:bg-slate-600" };
 
  const statusBgs = { completed: "bg-emerald-500 text-white", current: "bg-[#0f55f7]/50 text-white", upcoming: "bg-slate-200 dark:bg-slate-700 text-slate-400" };
 
  const IconComp = stage.icon;
 
 
  return (
 
 <motion.div variants={container} initial="hidden" animate="visible" className="p-6 space-y-6">
 
      {/* Header */}
 
      <motion.div variants={item} className="flex items-center justify-between">
 
        <div>
 
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Career Development</h1>
 
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Plan and manage career progression paths for your organization</p>
 
        </div>
 
        <button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] text-white text-sm font-semibold shadow-lg shadow-[#0f55f7]/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
 
          <Plus className="w-4 h-4" /> Create Path
 
        </button>
 
      </motion.div>
 
 
      {/* KPI Cards */}
 
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
 
        {kpiData.map((kpi, i) => <KpiCard key={kpi.label} icon={kpi.icon} label={kpi.label} value={kpi.value} sub={kpi.sub} color={kpi.color} delay={i * 0.05} />)}
 
      </div>
 
 
      {/* Career Roadmap */}
 
      <motion.div variants={item} className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-5">
 
        <div className="flex items-center gap-3 mb-5">
 
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0f55f7]/10 to-[#06b6a8]/10 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-[#0f55f7]" /></div>
 
          <div>
 
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Career Roadmap</h3>
 
            <p className="text-xs text-slate-400 dark:text-slate-500">Frontend Engineering progression path</p>
 
          </div>
 
        </div>
 
        <div className="pl-1">
 
          {ROADMAP_STAGES.map((stage, i) => <RoadmapStage key={stage.role} stage={stage} index={i} />)}
 
        </div>
 
      </motion.div>
 
 
      {/* Skill Gap Analysis & Career Paths */}
 
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
 
        {/* Skill Gap */}
 
        <motion.div variants={item} className="xl:col-span-2 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-5">
 
          <div className="flex items-center gap-3 mb-4">
 
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center"><Lightbulb className="w-4 h-4 text-amber-500" /></div>
 
            <div>
 
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Skill Gap Analysis</h3>
 
              <p className="text-xs text-slate-400 dark:text-slate-500">Identify development areas</p>
 
            </div>
 
          </div>
 
 
          {/* Tabs */}
 
          <div className="flex gap-1 mb-4 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
 
            <button onClick={() => setActiveSkillTab("current")} className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeSkillTab === "current" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Current Skills</button>
 
            <button onClick={() => setActiveSkillTab("gaps")} className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeSkillTab === "gaps" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Gap Analysis</button>
 
          </div>
 
 
          <AnimatePresence mode="wait">
 
            {activeSkillTab === "current" ? (
 
              <motion.div key="current" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2.5">
 
                {CURRENT_SKILLS.map(skill => (
 
                  <div key={skill.name}>
 
                    <div className="flex items-center justify-between mb-1">
 
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{skill.name}</span>
 
                      <span className="text-[10px] font-semibold text-slate-400">{skill.level}%</span>
 
                    </div>
 
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
 
                      <motion.div initial={{ width: 0 }} animate={{ width: `${skill.level}%` }} transition={{ duration: 1, delay: 0.1 }} className={`h-full rounded-full ${skill.category === "technical" ? "bg-gradient-to-r from-[#0f55f7] to-[#06b6a8]" : "bg-gradient-to-r from-emerald-500 to-[#06b6a8]"}`} />
 
                    </div>
 
                  </div>
 
                ))}
 
              </motion.div>
 
            ) : (
 
              <motion.div key="gaps" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
 
                {GAP_SKILLS.map(gap => (
 
                  <div key={gap.name}>
 
                    <div className="flex items-center justify-between mb-1">
 
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{gap.name}</span>
 
                      <span className="text-[10px] font-semibold text-rose-500">{gap.gap}% gap</span>
 
                    </div>
 
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
 
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#0f55f7]/20 to-[#06b6a8]/20" style={{ width: `${gap.demand}%` }} />
 
                      <motion.div initial={{ width: 0 }} animate={{ width: `${gap.current}%` }} transition={{ duration: 1, delay: 0.1 }} className="h-full rounded-full bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] relative z-10" />
 
                    </div>
 
                    <div className="flex items-center justify-between mt-0.5">
 
                      <span className="text-[10px] text-[#0f55f7]">Demand: {gap.demand}%</span>
 
                      <span className="text-[10px] text-slate-400">Current: {gap.current}%</span>
 
                    </div>
 
                  </div>
 
                ))}
 
                <div className="pt-2">
 
                  <button className="w-full px-3 py-2 rounded-xl bg-gradient-to-r from-[#0f55f7]/10 to-[#06b6a8]/10 border border-[#0f55f7]/20 dark:border-[#0f55f7]/20 text-xs font-semibold text-[#0f55f7] dark:text-[#0f55f7] hover:bg-[#0f55f7]/50/20 transition-colors">
 
                    View Recommended Learning
 
                  </button>
 
                </div>
 
              </motion.div>
 
            )}
 
          </AnimatePresence>
 
        </motion.div>
 
 
        {/* Career Path List */}
 
        <motion.div variants={item} className="xl:col-span-3 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-5">
 
          <div className="flex items-center justify-between mb-4">
 
            <div className="flex items-center gap-3">
 
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 flex items-center justify-center"><Building2 className="w-4 h-4 text-emerald-500" /></div>
 
              <div>
 
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Career Paths</h3>
 
                <p className="text-xs text-slate-400 dark:text-slate-500">{paths.length} paths defined</p>
 
              </div>
 
            </div>
 
            <div className="flex items-center gap-2">
 
              <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
 
                <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white dark:bg-slate-700 shadow-sm" : ""}`}><Grid3X3 className="w-3.5 h-3.5 text-slate-500" /></button>
 
                <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white dark:bg-slate-700 shadow-sm" : ""}`}><List className="w-3.5 h-3.5 text-slate-500" /></button>
 
              </div>
 
            </div>
 
          </div>
 

          {/* Search & Filter */}
 
          <div className="flex gap-3 mb-4">
 
            <div className="relative flex-1">
 
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
 
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search career paths..." className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30" />
 
            </div>
 
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="px-3 py-2 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30">
 
              <option value="">All Departments</option>
 
              {["Engineering", "Data Science", "Design", "Management"].map(d => <option key={d} value={d}>{d}</option>)}
 
            </select>
 
          </div>
 
 
          {/* Grid/List View */}
 
          {filteredPaths.length === 0 ? (
 
            <div className="py-12 text-center">
 
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3"><Search className="w-6 h-6 text-slate-400" /></div>
 
              <p className="text-sm text-slate-400">No career paths found</p>
 
            </div>
 
          ) : viewMode === "grid" ? (
 
            <div className="grid sm:grid-cols-2 gap-3">
 
              {filteredPaths.map((path, i) => (
 
                <motion.div key={path.id} variants={item} className="group p-4 rounded-xl border border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800/50 hover:border-[#0f55f7]/20 dark:hover:border-[#0f55f7]/30 hover:shadow-md transition-all duration-200">
 
                  <div className="flex items-start justify-between mb-2">
 
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${["from-[#0f55f7] to-[#06b6a8]", "from-cyan-500 to-[#0f55f7]", "from-emerald-500 to-green-600", "from-amber-500 to-orange-600"][i % 4]} flex items-center justify-center`}>
 
                      <Award className="w-4 h-4 text-white" />
 
                    </div>
 
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${path.status === "active" ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>{path.status}</span>
 
                  </div>
 
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{path.name}</h4>
 
                  <p className="text-xs text-slate-400 mb-2 line-clamp-1">{path.description}</p>
 
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-2">
 
                    <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{path.department}</span>
 
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{path.employees} employees</span>
 
                  </div>
 
                  <div className="flex items-center gap-1.5 flex-wrap mb-2">
 
                    {path.skills.slice(0, 3).map(s => <span key={s} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500">{s}</span>)}
 
                    {path.skills.length > 3 && <span className="text-[10px] text-slate-400">+{path.skills.length - 3}</span>}
 
                  </div>
 
                  <div className="flex items-center gap-1 pt-1 border-t border-slate-100 dark:border-slate-700/50">
 
                    <button className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><Eye className="w-3.5 h-3.5 text-slate-400" /></button>
 
                    <button className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><Edit3 className="w-3.5 h-3.5 text-slate-400" /></button>
 
                    <button onClick={() => handleDelete(path.id)} className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"><Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" /></button>
 
                    <span className="ml-auto text-[10px] text-slate-400">Created {path.createdAt}</span>
 
                  </div>
 
                </motion.div>
 
              ))}
 
            </div>
 
          ) : (
 
            <div className="space-y-1">
 
              {filteredPaths.map((path, i) => (
 
                <motion.div key={path.id} variants={item} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
 
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${["from-[#0f55f7] to-[#06b6a8]", "from-cyan-500 to-[#0f55f7]", "from-emerald-500 to-green-600", "from-amber-500 to-orange-600"][i % 4]} flex items-center justify-center`}><Award className="w-4 h-4 text-white" /></div>
 
                  <div className="flex-1 min-w-0">
 
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{path.name}</p>
 
                    <p className="text-xs text-slate-400">{path.department} · {path.currentPosition} → {path.targetPosition}</p>
 
                  </div>
 
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${path.status === "active" ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>{path.status}</span>
 
                  <span className="text-xs text-slate-400">{path.employees} assigned</span>
 
                  <div className="flex gap-1">
 
                    <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><Edit3 className="w-3.5 h-3.5 text-slate-400" /></button>
 
                    <button onClick={() => handleDelete(path.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"><Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" /></button>
 
                  </div>
 
                </motion.div>
 
              ))}
 
            </div>
 
          )}
 
        </motion.div>
 
      </div>
 
 
      <CreatePathModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleCreatePath} />
 
    </motion.div>
 
  );
 
}
 
 
 
 