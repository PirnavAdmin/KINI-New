import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Users, Clock, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RELATED_COURSES } from "../data/curriculumData";

const RelatedCourses = () => {
  const navigate = useNavigate();
  const [wishlisted, setWishlisted] = useState(new Set());

  return (
    <section className="bg-[#F8FAFC] rounded-2xl border border-[#E5E7EB] p-6 sm:p-8">
      <h2 className="text-lg font-extrabold text-[#0F172A] mb-1">Related Courses</h2>
      <p className="text-xs text-slate-500 mb-6">Continue your learning journey with these programs</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {RELATED_COURSES.map((course, i) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            viewport={{ once: true }}
            className="group bg-white rounded-xl border border-[#E5E7EB] overflow-hidden hover:shadow-lg hover:shadow-[#085FA7]/8 hover:border-[#085FA7]/20 transition-all duration-300 cursor-pointer"
            onClick={() => navigate(`/courses/${course.id}`)}
          >
            {/* Thumbnail */}
            <div className="aspect-[16/9] bg-gradient-to-br from-[#085FA7]/5 to-[#5CA347]/5 overflow-hidden relative">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setWishlisted((prev) => {
                    const next = new Set(prev);
                    if (next.has(course.id)) next.delete(course.id);
                    else next.add(course.id);
                    return next;
                  });
                }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur flex items-center justify-center hover:bg-white transition-all"
              >
                <Heart className={`w-3.5 h-3.5 ${wishlisted.has(course.id) ? "fill-[#F0765B] text-[#F0765B]" : "text-slate-500"}`} />
              </button>
              <div className="absolute bottom-2 left-2 bg-white/90 rounded-lg px-2 py-1 flex items-center gap-1">
                <Star className="w-3 h-3 fill-[#F0765B] text-[#F0765B]" />
                <span className="text-[10px] font-bold text-[#0F172A]">{course.rating}</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-3.5">
              <div className="flex flex-wrap gap-1 mb-2">
                {course.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="text-[9px] font-medium bg-[#085FA7]/5 text-[#085FA7] px-1.5 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="text-sm font-bold text-[#0F172A] line-clamp-1 group-hover:text-[#085FA7] transition-colors">
                {course.title}
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">{course.instructor}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E5E7EB]">
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course.students}</span>
                </div>
                <span className="text-sm font-extrabold text-[#085FA7]">₹{course.price.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default RelatedCourses;
