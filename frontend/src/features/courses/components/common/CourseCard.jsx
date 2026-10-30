import { Link } from "react-router-dom";

import {
  FaUsers,
  FaStar,
  FaArrowRight,
  FaPlayCircle,
  FaClock,
} from "react-icons/fa";

import { FiCheck, FiShoppingCart } from "react-icons/fi";

import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@shared/utils/formatters";

function CourseCard({ course }) {
  const { addToCart, isInCart } = useCart();
  const hasPrice = Number.isFinite(course.price);
  const inCart = hasPrice && isInCart(course.id);

  const handleAddToCart = () => {
    addToCart({
      id: course.id,
      name: course.title,
      price: course.price,
      duration: course.duration,
      level: course.level,
      thumbnail: course.image,
    });
  };

  return (

    <motion.div
      whileHover={{ y: -12 }}
      transition={{ duration: 0.4 }}
      className="group relative bg-white rounded-[32px] overflow-hidden border border-slate-200 shadow-sm hover:shadow-[0_25px_80px_rgba(59,130,246,0.18)] transition-all duration-500"
    >

      {/* Top Gradient Border */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600"></div>

      {/* ================= IMAGE SECTION ================= */}
      <div className="relative overflow-hidden">

        {/* Course Image */}
        {course.image ? (
          <img
            src={course.image}
            alt={course.title}
            className="h-64 w-full object-cover group-hover:scale-110 transition duration-700"
          />
        ) : (
          <div className="h-64 w-full flex items-center justify-center bg-gradient-to-br from-[#133B5D] via-[#1b4f7a] to-[#0d2a43] group-hover:scale-110 transition duration-700">
            <span className="px-6 text-center text-4xl font-extrabold text-white/90 tracking-tight">
              {course.title}
            </span>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>

        {/* Bestseller Badge */}
        <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-xl px-4 py-2 rounded-full shadow-lg">

          <p className="text-sm font-bold text-blue-700">
            Best Seller
          </p>

        </div>

        {/* Rating */}
        <div className="absolute top-5 right-5 flex items-center gap-1 bg-yellow-400 text-black px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">

          <FaStar className="text-xs" />

          4.9

        </div>

        {/* Bottom Course Info */}
        <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 px-3 py-2 rounded-full text-white text-sm">

            <FaPlayCircle />

            24 Lessons

          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 px-3 py-2 rounded-full text-white text-sm">

            <FaClock />

            40 Hours

          </div>

        </div>

      </div>

      {/* ================= CONTENT ================= */}
      <div className="p-7">

        {/* Category */}
        <p className="text-blue-600 font-semibold uppercase tracking-[3px] text-sm mb-3">

          Development

        </p>

        {/* Title */}
        <h3 className="text-2xl font-extrabold text-gray-900 leading-snug mb-4 line-clamp-2 group-hover:text-blue-600 transition duration-300">

          {course.title}

        </h3>

        {/* Instructor */}
        <div className="flex items-center gap-3 mb-5">

          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-100">

            <img
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="instructor"
              className="w-full h-full object-cover"
            />

          </div>

          <div>

            <p className="text-sm text-gray-500">
              Instructor
            </p>

            <h4 className="font-bold text-gray-800">
              {course.instructor}
            </h4>

          </div>

        </div>

        {/* Students + Price */}
        <div className="flex items-center justify-between mb-7">

          <div className="flex items-center gap-2 text-gray-500">

            <FaUsers className="text-blue-500" />

            <span className="font-medium">
              {course.students}+ Students
            </span>

          </div>

          <div>

            <p className="text-2xl font-extrabold text-blue-600">

              {hasPrice ? formatCurrency(course.price) : "$99"}

            </p>

          </div>

        </div>

        {/* Progress Bar */}
        <div className="mb-7">

          <div className="flex justify-between text-sm text-gray-500 mb-2">

            <span>Course Popularity</span>

            <span>92%</span>

          </div>

          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">

            <div className="w-[92%] h-full bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full"></div>

          </div>

        </div>

        {/* Buttons */}
        <div className={hasPrice ? "grid grid-cols-2 gap-3" : ""}>

          <Link
            to={`/course/${course.id}`}
            className={`group/btn flex items-center justify-center w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-700 text-white rounded-2xl font-bold shadow-lg hover:shadow-2xl transition-all duration-300 ${hasPrice ? "gap-2 py-3.5 px-3 text-sm" : "gap-3 py-4"}`}
          >

            View Course

            <FaArrowRight className="group-hover/btn:translate-x-1 transition duration-300" />

          </Link>

          {hasPrice && (
            <motion.button
              type="button"
              onClick={handleAddToCart}
              disabled={inCart}
              whileTap={inCart ? undefined : { scale: 0.96 }}
              aria-label={inCart ? `${course.title} is already in your cart` : `Add ${course.title} to cart`}
              className={`flex items-center justify-center gap-2 w-full py-3.5 px-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
                inCart
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                  : "bg-[#F39924] text-[#133B5D] hover:bg-[#e08a17] shadow-lg hover:shadow-2xl"
              }`}
            >

              {inCart ? <FiCheck className="w-4 h-4" /> : <FiShoppingCart className="w-4 h-4" />}

              {inCart ? "Added to Cart" : "Add to Cart"}

            </motion.button>
          )}

        </div>

      </div>

    </motion.div>

  );
}

export default CourseCard;