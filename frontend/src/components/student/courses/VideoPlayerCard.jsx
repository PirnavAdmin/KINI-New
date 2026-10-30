import { CheckCircle2, PlayCircle } from "lucide-react";

export default function VideoPlayerCard({ video, completed, onComplete }) {
  return (
    <div className="w-full max-w-[400px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700/50 dark:bg-slate-900/70">
      <div className="aspect-video w-full bg-slate-950">
        <iframe
          className="h-full w-full"
          src={video.videoUrl}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-bold text-slate-950 dark:text-white">{video.title}</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{video.topic} - {video.duration}</p>
        </div>
        <button type="button" onClick={onComplete} className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold ${completed ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-[#0f55f7] text-white"}`}>
          {completed ? <CheckCircle2 className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
          {completed ? "Completed" : "Mark complete"}
        </button>
      </div>
    </div>
  );
}
