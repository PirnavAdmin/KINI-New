import { useEffect, useState } from "react";
import { courseService } from "@/shared/services/courseService";

export default function CoursePdfAttachment({ courseId }) {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  const load = async () => {
    setBusy(true);
    setError("");
    try {
      const pdf = await courseService.getPdf(courseId);
      if (pdf.type && !pdf.type.toLowerCase().includes("pdf")) throw new Error("Invalid PDF response");
      setUrl(URL.createObjectURL(new Blob([pdf], { type: "application/pdf" })));
    } catch (requestError) {
      setError(requestError?.response?.status === 404 ? "No syllabus PDF is attached to this course." : "Unable to load the syllabus PDF. Check your access and try again.");
    } finally { setBusy(false); }
  };
  return <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 p-3">
    <strong className="text-sm">Course Syllabus PDF</strong>
    {url ? <>
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-600">View PDF</a>
      <a href={url} download="course-syllabus.pdf" className="text-sm font-semibold text-blue-600">Download PDF</a>
    </> : <button type="button" disabled={busy} onClick={load} className="text-sm font-semibold text-blue-600 disabled:opacity-50">{busy ? "Loading PDF…" : "View / Download PDF"}</button>}
    {error && <p role="alert" className="w-full text-sm text-red-600">{error}</p>}
  </div>;
}
