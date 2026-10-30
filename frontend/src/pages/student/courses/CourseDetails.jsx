import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import ModuleCard from "@/components/student/courses/ModuleCard";
import { courseService, getCourseProgress, getFallbackCourse, normalizeErrorMessage } from "@/services/courseService";
import { formatCourseDuration } from "@features/student/utils/courseDuration";

export default function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(getCourseProgress(courseId));
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    courseService.getStudentCourse(courseId)
      .then((data) => mounted && setCourse(data))
      .catch((err) => {
        if (!mounted) return;
        setMessage(normalizeErrorMessage(err));
        setCourse(getFallbackCourse(courseId));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    setProgress(getCourseProgress(courseId));
    return () => { mounted = false; };
  }, [courseId]);

  if (loading) {
    return <div className="p-6 text-sm text-slate-500">Loading course...</div>;
  }

  if (!course) {
    return (
      <div className="w-full max-w-[900px] px-4 py-6 sm:px-6">
        <button onClick={() => navigate("/student/courses")} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#0f55f7]">
          <ArrowLeft className="h-4 w-4" />
          Back to courses
        </button>
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900/50">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Course not found.</p>
          <p className="mt-1 text-xs text-slate-500">{message || "No course data is available."}</p>
        </div>
      </div>
    );
  }

  const unlockedIndex = Math.max(
    0,
    course.classes.findIndex((module) => module.id === progress.unlockedClassId)
  );
  const isUnlocked = (module, index) => index <= unlockedIndex || progress.passedClassIds?.includes(module.id);
  const isVideosComplete = (module) => module.videos.every((video) => progress.completedVideos?.includes(video.id));

  return (
    <div className="w-full max-w-[1680px] px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
      <button onClick={() => navigate("/student/courses")} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#0f55f7]">
        <ArrowLeft className="h-4 w-4" />
        Back to courses
      </button>

      <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700/50 dark:bg-slate-900/70">
        <div className="grid gap-0 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="p-6 lg:p-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-xl bg-[#0f55f7]/10 px-3 py-1.5 text-xs font-bold text-[#0f55f7]">
              <BookOpen className="h-4 w-4" />
              Step-by-step learning flow
            </div>
            <h1 className="text-2xl font-black text-slate-950 dark:text-white sm:text-3xl">{course.title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">{course.description}</p>
            {formatCourseDuration(course.duration, course.durationUnit ?? course.unit) && (
              <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                Duration: {formatCourseDuration(course.duration, course.durationUnit ?? course.unit)}
              </p>
            )}
            {message && <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-200">{message}</p>}
          </div>
          <img src={course.thumbnail} alt="" className="h-56 w-full object-cover lg:h-full" />
        </div>
      </section>

      <div className="grid gap-4">
        {course.classes.map((module, index) => {
          const locked = !isUnlocked(module, index);
          return (
            <ModuleCard
              key={module.id}
              module={module}
              index={index}
              locked={locked}
              videosComplete={isVideosComplete(module)}
              passed={progress.passedClassIds?.includes(module.id)}
              onOpen={() => navigate(`/student/courses/${course.id}/classes/${module.id}/videos`)}
              onAssignment={() => navigate(`/student/courses/${course.id}/classes/${module.id}/assignment`)}
            />
          );
        })}
      </div>
    </div>
  );
}
