import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useThemeContext } from "@shared/context/ThemeContext";
import { FaArrowLeft } from "react-icons/fa";
import EventCard from "../components/EventCard";
import { UPCOMING_EVENTS } from "../constants/alumniData";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function AlumniEvents() {
  const { isDark } = useThemeContext();

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? "bg-[#050816]" : "bg-white"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <Link
          to="/alumni"
          className={`inline-flex items-center gap-2 text-xs font-medium mb-6 transition-colors ${
            isDark ? "text-slate-400 hover:text-white" : "text-[#64748B] hover:text-[#0F172A]"
          }`}
        >
          <FaArrowLeft className="w-3 h-3" /> Back to Alumni Home
        </Link>

        <div className="mb-10">
          <h1 className={`text-3xl sm:text-4xl font-bold ${isDark ? "text-white" : "text-[#0F172A]"}`}>
            Upcoming{" "}
            <span className="bg-gradient-to-r from-[#085FA7] to-[#5CA347] bg-clip-text text-transparent">Events</span>
          </h1>
          <p className={`mt-2 text-sm ${isDark ? "text-slate-400" : "text-[#64748B]"}`}>
            Networking, learning, and community events for alumni worldwide.
          </p>
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {UPCOMING_EVENTS.map((event) => (
            <motion.div key={event.id} variants={fadeUp}>
              <EventCard event={event} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
