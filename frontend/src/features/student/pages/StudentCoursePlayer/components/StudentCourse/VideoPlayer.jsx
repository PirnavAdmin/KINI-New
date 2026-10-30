import { useState, useCallback, memo } from "react";
import { motion } from "framer-motion";
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaExpand,
  FaCompress,
  FaForward,
  FaBackward,
  FaDownload,
  FaCheckCircle,
} from "react-icons/fa";
import { FiMonitor } from "react-icons/fi";

const VideoPlayer = memo(function VideoPlayer({
  lesson,
  course,
  onComplete,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handleComplete = useCallback(() => {
    setIsCompleted(true);
    if (onComplete) onComplete(lesson.id);
  }, [lesson.id, onComplete]);

  const containerRef = useCallback((node) => {
    if (node) {
      const handleFSChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
      };
      document.addEventListener("fullscreenchange", handleFSChange);
      return () =>
        document.removeEventListener("fullscreenchange", handleFSChange);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = document.getElementById("video-container");
    if (!document.fullscreenElement) {
      el?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  if (!lesson) {
    return (
      <div className="h-[min(46vh,430px)] min-h-[280px] bg-[#111827] rounded-xl flex items-center justify-center">
        <p className="text-[#6B7280] text-sm">Select a lesson to begin</p>
      </div>
    );
  }

  const isQuiz = lesson.type === "quiz" || lesson.type === "project";

  return (
    <div className="space-y-3">
      {/* Video Container */}
      <div
        id="video-container"
        ref={containerRef}
        className="relative h-[min(46vh,430px)] min-h-[280px] bg-black rounded-xl overflow-hidden group shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
      >
        {lesson.videoUrl && !isPlaying ? (
          <>
            {/* Thumbnail / Placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1E293B] to-[#0F172A] flex items-center justify-center">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-[#0f55f7]/20 flex items-center justify-center mb-2">
                  <FiMonitor className="text-xl text-[#0f55f7]" />
                </div>
                <p className="text-[#9CA3AF] text-sm font-medium max-w-[560px] px-4">
                  {lesson.title}
                </p>
                <p className="text-[#6B7280] text-xs mt-1">{lesson.duration}</p>
              </div>
            </div>

            {/* Play Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePlay}
              className="absolute inset-0 flex items-center justify-center cursor-pointer"
              aria-label="Play video"
            >
              <div className="w-14 h-14 rounded-full bg-[#0f55f7] shadow-lg shadow-[#0f55f7]/30 flex items-center justify-center transition-transform">
                <FaPlay className="text-white text-lg ml-1" />
              </div>
            </motion.button>
          </>
        ) : isPlaying && lesson.videoUrl ? (
          <iframe
            src={lesson.videoUrl}
            className="w-full h-full"
            allowFullScreen
            title={lesson.title}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1E293B] to-[#0F172A] flex items-center justify-center">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#F59E0B]/20 flex items-center justify-center mb-2">
                {isQuiz ? (
                  <FaPlay className="text-xl text-[#F59E0B] ml-1" />
                ) : (
                  <FiMonitor className="text-xl text-[#6B7280]" />
                )}
              </div>
              <p className="text-[#9CA3AF] text-sm font-medium">
                {isQuiz
                  ? `${lesson.type === "quiz" ? "Quiz" : "Project"} Content`
                  : "No video available"}
              </p>
              <p className="text-[#6B7280] text-xs mt-1">{lesson.duration}</p>
            </div>
          </div>
        )}

        {/* Video Controls Overlay */}
        {isPlaying && lesson.videoUrl && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(false)}
                className="text-white hover:text-[#0f55f7] transition-colors cursor-pointer"
                aria-label="Pause"
              >
                <FaPause className="text-sm" />
              </button>
              <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="w-1/3 h-full bg-[#0f55f7] rounded-full" />
              </div>
              <span className="text-white/60 text-xs font-mono">
                08:32 / {lesson.duration}
              </span>
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-[#0f55f7] transition-colors cursor-pointer"
                aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? (
                  <FaCompress className="text-sm" />
                ) : (
                  <FaExpand className="text-sm" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lesson Info Bar */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-white">{lesson.title}</h2>
          <div className="flex items-center gap-2.5 mt-1 text-[11px] text-[#6B7280]">
            <span>Dr. Sarah Chen</span>
            <span className="w-1 h-1 rounded-full bg-[#6B7280]" />
            <span>{lesson.duration}</span>
            <span className="w-1 h-1 rounded-full bg-[#6B7280]" />
            <span className="capitalize">{lesson.type}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleComplete}
            disabled={isCompleted}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 cursor-pointer ${
              isCompleted
                ? "bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30"
                : "bg-[#0f55f7]/20 text-[#0f55f7] border border-[#0f55f7]/30 hover:bg-[#0f55f7]/30"
            }`}
            aria-label={
              isCompleted ? "Lesson completed" : "Mark as completed"
            }
          >
            <FaCheckCircle
              className={`text-xs ${isCompleted ? "" : "opacity-70"}`}
            />
            {isCompleted ? "Completed" : "Mark Complete"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#1F2937] bg-[#111C30] px-3 py-2.5 text-xs">
        <span className="font-semibold text-[#9CA3AF]">Course access</span>
        <span className="font-bold text-emerald-400">Valid till: {course?.validTill || course?.validUntil || "Lifetime access"}</span>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E293B] text-[#9CA3AF] text-[11px] font-medium hover:bg-[#2A3A4E] hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          aria-label="Previous lesson"
        >
          <FaBackward className="text-xs" />
          Previous
        </button>
        <button
          onClick={onNext}
          disabled={!hasNext}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f55f7] text-white text-[11px] font-medium hover:bg-[#0b3fc4] transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          aria-label="Next lesson"
        >
          Next
          <FaForward className="text-xs" />
        </button>
      </div>
    </div>
  );
});

export default VideoPlayer;

