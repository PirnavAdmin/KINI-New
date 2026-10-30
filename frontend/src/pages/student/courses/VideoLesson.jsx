import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ClipboardCheck } from "lucide-react";
import VideoPlayerCard from "@/components/student/courses/VideoPlayerCard";
import { courseService, getCourseProgress, getFallbackCourse } from "@/services/courseService";

export default function VideoLesson() {
  const { courseId, classId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(getCourseProgress(courseId));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    courseService.getStudentCourse(courseId)
      .then(setCourse)
      .catch(() => setCourse(getFallbackCourse(courseId)))
      .finally(() => setLoading(false));
  }, [courseId]);

  const module = course?.classes.find((item) => item.id === classId);
  const allComplete = module?.videos.every((video) => progress.completedVideos?.includes(video.id));

  const completeVideo = (videoId) => {
    setProgress((current) => ({
      ...current,
      watchedVideos: Array.from(new Set([...(current.watchedVideos || []), videoId])),
      completedVideos: Array.from(new Set([...(current.completedVideos || []), videoId])),
    }));
    courseService.completeVideo(courseId, classId, videoId).finally(() => {
      setProgress(getCourseProgress(courseId));
    });
  };

  const completeAllVideos = async () => {
    const completedVideoIds = module.videos.map((video) => video.id);
    setProgress((current) => ({
      ...current,
      watchedVideos: Array.from(new Set([...(current.watchedVideos || []), ...completedVideoIds])),
      completedVideos: Array.from(new Set([...(current.completedVideos || []), ...completedVideoIds])),
    }));

    await Promise.all(module.videos.map((video) => courseService.completeVideo(courseId, classId, video.id)));
    setProgress(getCourseProgress(courseId));
  };

  if (loading) return <div className="p-6 text-sm text-slate-500">Loading videos...</div>;

  if (!course || !module) {
    return (
      <div className="w-full max-w-[900px] px-4 py-6 sm:px-6">
        <button onClick={() => navigate("/student/courses")} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#0f55f7]">
          <ArrowLeft className="h-4 w-4" />
          Back to courses
        </button>
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900/50">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Videos not found.</p>
          <p className="mt-1 text-xs text-slate-500">No course video data is available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1180px] px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
      <button onClick={() => navigate(`/student/courses/${courseId}`)} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#0f55f7]">
        <ArrowLeft className="h-4 w-4" />
        Back to class list
      </button>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-950 dark:text-white">{module.title} Videos</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Complete every video to unlock this class assignment.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={completeAllVideos} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
            Mark all complete
          </button>
          <button type="button" disabled={!allComplete} onClick={() => navigate(`/student/courses/${courseId}/classes/${classId}/assignment`)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f55f7] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300">
            <ClipboardCheck className="h-4 w-4" />
            Start assignment
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 justify-items-start gap-4 sm:grid-cols-2">
        {module.videos.map((video) => (
          <VideoPlayerCard key={video.id} video={video} completed={progress.completedVideos?.includes(video.id)} onComplete={() => completeVideo(video.id)} />
        ))}
      </div>
    </div>
  );
}
