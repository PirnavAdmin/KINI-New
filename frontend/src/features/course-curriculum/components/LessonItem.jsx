import { motion } from "framer-motion";
import { Play, Lock, CheckCircle, FileText, PenTool, Brain, Download } from "lucide-react";

const TYPE_ICONS = {
  video: { icon: Play, bg: "bg-[#085FA7]/10", color: "text-[#085FA7]" },
  tutorial: { icon: Play, bg: "bg-[#5CA347]/10", color: "text-[#5CA347]" },
  article: { icon: FileText, bg: "bg-[#F0765B]/10", color: "text-[#F0765B]" },
  assignment: { icon: PenTool, bg: "bg-[#085FA7]/10", color: "text-[#085FA7]" },
  quiz: { icon: Brain, bg: "bg-[#5CA347]/10", color: "text-[#5CA347]" },
  resource: { icon: Download, bg: "bg-slate-100", color: "text-slate-500" },
  project: { icon: PenTool, bg: "bg-[#F0765B]/10", color: "text-[#F0765B]" },
};

const LessonItem = ({ lesson, index }) => {
  const typeConfig = TYPE_ICONS[lesson.type] || TYPE_ICONS.video;
  const Icon = typeConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
      className={`group flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
        lesson.locked
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-[#F0F7FF] hover:shadow-sm"
      }`}
    >
      {/* Status / Type Icon */}
      <div className="relative shrink-0">
        {lesson.completed ? (
          <CheckCircle className="w-5 h-5 text-[#5CA347]" />
        ) : lesson.locked ? (
          <Lock className="w-4 h-4 text-slate-300" />
        ) : (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeConfig.bg} ${typeConfig.color} transition-transform group-hover:scale-110`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {/* Lesson Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium truncate ${
          lesson.completed ? "text-[#5CA347]" : lesson.locked ? "text-slate-400" : "text-[#0F172A]"
        }`}>
          {lesson.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] font-medium text-slate-400 capitalize">{lesson.type}</span>
          <span className="text-[10px] text-slate-300">•</span>
          <span className="text-[10px] font-mono text-slate-400">{lesson.duration}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {lesson.free && !lesson.completed && !lesson.locked && (
          <span className="text-[9px] font-bold text-[#5CA347] bg-[#5CA347]/10 px-1.5 py-0.5 rounded">FREE</span>
        )}
        {!lesson.locked && !lesson.free && (
          <div className="w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-3 h-3 text-[#085FA7]" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LessonItem;
