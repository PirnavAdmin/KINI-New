import { useRef } from "react";
import { motion } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { REVIEWS } from "../data/curriculumData";

const ReviewsSection = () => {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 340, behavior: "smooth" });
    }
  };

  return (
    <section className="bg-[#F8FAFC] rounded-2xl border border-[#E5E7EB] p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-extrabold text-[#0F172A]">Student Reviews</h2>
          <p className="text-xs text-slate-500 mt-1">What our students say about this program</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scroll(-1)}
            className="w-8 h-8 rounded-lg border border-[#E5E7EB] flex items-center justify-center hover:bg-[#F0F7FF] hover:border-[#085FA7]/30 transition-all text-slate-400 hover:text-[#085FA7]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll(1)}
            className="w-8 h-8 rounded-lg border border-[#E5E7EB] flex items-center justify-center hover:bg-[#F0F7FF] hover:border-[#085FA7]/30 transition-all text-slate-400 hover:text-[#085FA7]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2 -mx-2 px-2 scrollbar-hide"
      >
        {REVIEWS.map((review, i) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            viewport={{ once: true }}
            className="min-w-[300px] sm:min-w-[340px] bg-white rounded-xl border border-[#E5E7EB] p-5 hover:shadow-md hover:shadow-[#085FA7]/5 hover:border-[#085FA7]/20 transition-all duration-300 flex-shrink-0"
          >
            <Quote className="w-6 h-6 text-[#085FA7]/20 mb-2" />
            <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-3">
              "{review.text}"
            </p>
            <div className="flex items-center gap-1 mb-3">
              {[1,2,3,4,5].map((s) => (
                <Star
                  key={s}
                  className={`w-3.5 h-3.5 ${s <= review.rating ? "fill-[#F0765B] text-[#F0765B]" : "text-slate-200"}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <img
                src={review.avatar}
                alt={review.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#0F172A] truncate">{review.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{review.role}</p>
              </div>
              <div className="bg-gradient-to-r from-[#5CA347]/10 to-[#5CA347]/5 text-[#5CA347] text-[9px] font-bold px-2 py-1 rounded-lg border border-[#5CA347]/20 whitespace-nowrap">
                {review.achievement}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default ReviewsSection;
