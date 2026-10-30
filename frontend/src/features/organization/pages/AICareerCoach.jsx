import { useMemo, useState } from "react";
import { Bot, FileText, MessageSquare, Sparkles } from "lucide-react";
import { useAuth } from "@shared/hooks/useAuth";
import AIChat from "../components/ai-career/AIChat";
import ResumeAnalyzer from "../components/ai-career/ResumeAnalyzer";

export default function AICareerCoach() {
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState("chat");
  const storageKey = useMemo(() => {
    const identity = user?.userId ?? user?.id ?? user?.email ?? "current-user";
    return `pirnav:ai-career-conversations:v1:${role || "user"}:${encodeURIComponent(String(identity))}`;
  }, [role, user?.email, user?.id, user?.userId]);

  const tabs = [
    { id: "chat", label: "AI Chat", icon: MessageSquare },
    { id: "resume", label: "Resume Analyzer", icon: FileText },
  ];

  return (
    <div className="h-[calc(100dvh-4rem)] min-h-0 w-full min-w-0 overflow-hidden bg-[var(--app-background)] dark:bg-slate-950">
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex shrink-0 flex-col gap-2 border-b border-slate-200 bg-white px-3 py-1.5 dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/15">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h1 className="flex items-center gap-2 text-sm font-extrabold text-slate-950 dark:text-white">AI Career Coach <Bot className="h-3.5 w-3.5 text-emerald-500" /></h1>
              <p className="truncate text-xs text-slate-400">Real-time career guidance and resume intelligence</p>
            </div>
          </div>

          <nav className="flex w-full rounded-xl bg-slate-100 p-1 dark:bg-slate-800 sm:w-auto" aria-label="AI Career Coach tools">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition sm:flex-none ${activeTab === tab.id ? "bg-white text-slate-950 shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"}`}
              >
                <tab.icon className="h-3.5 w-3.5" />{tab.label}
              </button>
            ))}
          </nav>
        </header>

        {activeTab === "chat" ? (
          <AIChat storageKey={storageKey} />
        ) : (
          <main className="scrollbar-hide min-h-0 flex-1 overflow-y-auto bg-[var(--app-background)] px-4 py-5 dark:bg-slate-950 sm:px-6">
            <ResumeAnalyzer />
          </main>
        )}
      </div>
    </div>
  );
}
