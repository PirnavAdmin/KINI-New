import { useState } from "react";

const allowed = ["application/pdf", "video/mp4", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/zip"];

export default function LessonUpload({ onComplete, batch = "React Morning Batch" }) {
  const [file, setFile] = useState(null); const [title, setTitle] = useState(""); const [progress, setProgress] = useState(0); const [error, setError] = useState("");
  const upload = () => { if (!title.trim() || /^(file\d*|untitled)$/i.test(title.trim())) return setError("Use a clear material title."); if (!file) return setError("Choose a PDF, MP4, PPTX, DOCX, or ZIP file."); if (file.size > 50 * 1024 * 1024) return setError("Maximum file size is 50MB."); if (!allowed.includes(file.type)) return setError("This file type is not allowed."); setError(""); setProgress(20); const timer = setInterval(() => setProgress(v => { if (v >= 100) { clearInterval(timer); onComplete?.({ title, file, batch }); return 100; } return v + 20; }), 150); };
  return <div className="space-y-4"><p className="text-sm text-slate-500">Target batch: <b>{batch}</b></p><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Material title" className="w-full rounded-lg border p-2"/><input type="file" onChange={e=>setFile(e.target.files?.[0])} className="w-full text-sm"/>{progress>0&&<div className="h-2 overflow-hidden rounded bg-slate-100"><div className="h-full bg-blue-600" style={{width:`${progress}%`}}/></div>}{error&&<p className="text-sm text-rose-600">{error}</p>}<button onClick={upload} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Upload material</button></div>;
}
