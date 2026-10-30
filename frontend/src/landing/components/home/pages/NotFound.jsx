import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaHome,
  FaBookOpen,
} from "react-icons/fa";
import Seo from "@landing-shared/components/Seo";

function NotFound() {
  return (
    <>
    <Seo title="Page Not Found" description="The page you're looking for doesn't exist or may have been moved." path="/404" noIndex />
    <section
      className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-gradient-to-br
      from-[#0F172A]
      via-[#133B5D]
      to-[#764212]
      overflow-hidden
      relative
      px-6
      "
    >
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500/20 rounded-full blur-[120px]" />

      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary-500/20 rounded-full blur-[120px]" />

      {/* Floating Circles */}
      <div className="absolute top-20 left-20 w-8 h-8 bg-primary-400 rounded-full animate-bounce" />

      <div className="absolute bottom-24 right-32 w-6 h-6 bg-secondary-500 rounded-full animate-pulse" />

      <motion.div
        initial={{
          opacity: 0,
          y: 50,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.8,
        }}
        className="
        max-w-3xl
        text-center
        relative
        z-10
        "
      >
        {/* 404 */}
        <motion.h1
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
          }}
          className="
          text-[120px]
          md:text-[180px]
          font-black
          text-transparent
          bg-gradient-to-r
          from-primary-400
          to-secondary-500
          bg-clip-text
          leading-none
          "
        >
          404
        </motion.h1>

        {/* Heading */}
        <h2 className="text-white text-4xl md:text-5xl font-bold mt-4 ">
          Oops! Page Not Found
        </h2>

        {/* Description */}
        <p className="text-slate-300 text-lg mt-6 max-w-2xl mx-auto leading-relaxed">
          The page you're looking for doesn't exist or
          may have been moved. Let's get you back on
          track and continue your learning journey.
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap justify-center gap-5 mt-10">

          <Link to="/">
            <button
              className="
              flex items-center gap-3
              px-8 py-4
              rounded-2xl
              bg-secondary-500
              text-primary-700
              border border-secondary-500
              font-semibold
              shadow-xl
              hover:bg-secondary-600
              hover:scale-105
              transition-all
              duration-300
              cursor-pointer
              "
            >
              <FaHome />
              Back To Home
            </button>
          </Link>

          <Link to="/courses">
            <button
              className="
              flex items-center gap-3
              px-8 py-4
              rounded-2xl
              border
              border-secondary-500
              bg-primary-700
              text-secondary-500
              hover:bg-primary-600
              transition-all
              duration-300
              cursor-pointer
              "
            >
              <FaBookOpen />
              Explore Courses
            </button>
          </Link>

        </div>

        {/* Small Card */}
        <div
          className="
          mt-12
          inline-flex
          items-center
          gap-3
          px-6
          py-3
          rounded-full
          bg-white/10
          border
          border-white/10
          text-slate-300
          "
        >
          🚀 Learn. Build. Get Hired with Pirnav
        </div>
      </motion.div>
    </section>
    </>
  );
}

export default NotFound;