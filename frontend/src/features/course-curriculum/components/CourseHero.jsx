import { motion } from "framer-motion";
import { Star, Users, Clock, Award, Play, FileDown, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CourseHero = ({ curriculum, onEnroll }) => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-[#F3F8FC]">
      {/* Brand gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#DCEFFC] via-white to-[#E7F6EC]" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#1482C4]/[0.08] rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#3D8B2E]/[0.07] rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-0 lg:pt-6 lg:pb-0">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-5 lg:mb-6"
        >
          <button onClick={() => navigate("/")} className="hover:text-[#085FA7] transition-colors">Home</button>
          <span>/</span>
          <button onClick={() => navigate("/courses")} className="hover:text-[#085FA7] transition-colors">Courses</button>
          <span>/</span>
          <span className="text-[#085FA7] font-semibold">{curriculum.title}</span>
        </motion.nav>

        <div className="grid lg:grid-cols-[1.08fr_0.92fr] gap-6 lg:gap-8 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Premium badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#085FA7]/10 to-[#5CA347]/10 border border-[#085FA7]/20 rounded-full px-4 py-1.5 mb-4 lg:mb-5">
              <Shield className="w-3.5 h-3.5 text-[#085FA7]" />
              <span className="text-[11px] font-semibold text-[#085FA7] tracking-wide">Premium Program</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#081B33] leading-[1.1] tracking-tight mb-3">
              {curriculum.title}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#405A73] leading-relaxed mb-4 lg:mb-5 max-w-xl">
              {curriculum.subtitle}
            </p>

            {/* Rating & Stats Row */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-5 lg:mb-6">
              {curriculum.rating > 0 && <div className="flex items-center gap-1.5">
                <div className="flex">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className={`w-4 h-4 ${i <= Math.round(curriculum.rating) ? "fill-[#F0765B] text-[#F0765B]" : "text-slate-300"}`} />
                  ))}
                </div>
                <span className="text-lg font-bold text-[#0F172A]">{curriculum.rating}</span>
                {curriculum.reviewCount != null && <span className="text-xs text-slate-400">({Number(curriculum.reviewCount).toLocaleString()} reviews)</span>}
              </div>}
              {curriculum.totalStudents != null && <><div className="h-4 w-px bg-[#E5E7EB]" />
              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <Users className="w-4 h-4 text-[#085FA7]" />
                <span className="font-medium">{Number(curriculum.totalStudents).toLocaleString()}+</span>
                <span>Students</span>
              </div></>}
              <div className="h-4 w-px bg-[#E5E7EB]" />
              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <Clock className="w-4 h-4 text-[#5CA347]" />
                <span className="font-medium">{curriculum.duration}</span>
              </div>
            </div>

            {/* Meta pills */}
            <div className="flex flex-wrap gap-2 mb-5 lg:mb-6">
              {curriculum.totalProjects != null && <span className="px-3 py-1.5 text-[11px] font-semibold bg-[#085FA7]/5 text-[#085FA7] border border-[#085FA7]/20 rounded-lg">{curriculum.totalProjects}+ Projects</span>}
              {curriculum.totalLessons != null && <span className="px-3 py-1.5 text-[11px] font-semibold bg-[#5CA347]/5 text-[#5CA347] border border-[#5CA347]/20 rounded-lg">{curriculum.totalLessons} Lessons</span>}
              {curriculum.level && <span className="px-3 py-1.5 text-[11px] font-semibold bg-[#F0765B]/5 text-[#F0765B] border border-[#F0765B]/20 rounded-lg">{curriculum.level}</span>}
              {curriculum.totalHours != null && <span className="px-3 py-1.5 text-[11px] font-semibold bg-[#085FA7]/5 text-[#085FA7] border border-[#085FA7]/20 rounded-lg">{curriculum.totalHours} Hours</span>}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onEnroll}
                className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#0568B2] to-[#258A43] text-white text-sm font-bold rounded-xl shadow-lg shadow-[#085FA7]/25 hover:shadow-xl hover:shadow-[#085FA7]/35 transition-all"
              >
                <Play className="w-4 h-4" />
                Enroll Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-6 py-3.5 border-2 border-[#085FA7] text-[#085FA7] text-sm font-semibold rounded-xl hover:bg-[#085FA7]/5 transition-all"
              >
                <Play className="w-4 h-4" />
                Watch Preview
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-6 py-3.5 border border-[#E5E7EB] text-slate-600 text-sm font-medium rounded-xl hover:border-[#085FA7]/30 hover:text-[#085FA7] transition-all bg-white"
              >
                <FileDown className="w-4 h-4" />
                Syllabus
              </motion.button>
            </div>
          </motion.div>

          {/* Right: Preview Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-xl shadow-[#085FA7]/10 bg-white border border-[#E5E7EB]">
              <div className="aspect-video relative bg-gradient-to-br from-[#085FA7]/10 to-[#5CA347]/10">
                <img
                  src={curriculum.image}
                  alt={curriculum.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-16 h-16 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-xl cursor-pointer"
                  >
                    <Play className="w-6 h-6 text-[#085FA7] ml-0.5" />
                  </motion.div>
                </div>
                {/* Certification badge */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-lg px-3 py-1.5 shadow-lg flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#5CA347]" />
                  <span className="text-[10px] font-bold text-[#0F172A]">Certified</span>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1,2,3].map((i) => (
                      <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-gradient-to-br from-[#085FA7] to-[#5CA347]" />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500">Industry Mentors</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  Updated {curriculum.lastUpdated}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CourseHero;
