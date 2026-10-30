import { useState } from "react";
import { motion } from "framer-motion";
import { useThemeContext } from "@shared/context/ThemeContext";
import { FaSearch, FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";
import AlumniCard from "../components/AlumniCard";
import { FEATURED_ALUMNI } from "../constants/alumniData";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function AlumniDirectory() {
  const { isDark } = useThemeContext();
  const [search, setSearch] = useState("");
  const filtered = FEATURED_ALUMNI.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.company.toLowerCase().includes(search.toLowerCase()) ||
      a.designation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? "bg-[#0F172A]" : "bg-[#F8FAFC]"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Breadcrumb */}
        <Link
          to="/alumni"
          className={`inline-flex items-center gap-2 text-xs font-medium mb-6 transition-colors ${
            isDark ? "text-slate-400 hover:text-white" : "text-[#64748B] hover:text-[#0F172A]"
          }`}
        >
          <FaArrowLeft className="w-3 h-3" /> Back to Alumni Home
        </Link>

        {/* Header */}
        <div className="mb-10">
          <h1 className={`text-3xl sm:text-4xl font-bold ${isDark ? "text-white" : "text-[#0F172A]"}`}>
            Alumni{" "}
            <span className="bg-gradient-to-r from-[#085FA7] to-[#5CA347] bg-clip-text text-transparent">Directory</span>
          </h1>
          <p className={`mt-2 text-sm ${isDark ? "text-slate-400" : "text-[#64748B]"}`}>
            Connect with graduates across companies, roles, and batches.
          </p>
        </div>

        {/* Search */}
        <div className={`flex items-center gap-3 p-3 rounded-xl border backdrop-blur-xl mb-8 max-w-md ${
          isDark ? "bg-white/[0.03] border-white/10" : "bg-white/80 border-[#E5E7EB] shadow-sm"
        }`}>
          <FaSearch className={`w-4 h-4 ${isDark ? "text-slate-500" : "text-[#94A3B8]"}`} />
          <input
            type="text"
            placeholder="Search by name, company, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`flex-1 bg-transparent text-sm outline-none ${
              isDark ? "text-white placeholder:text-slate-500" : "text-[#0F172A] placeholder:text-[#94A3B8]"
            }`}
          />
        </div>

        {/* Grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {filtered.map((alumni) => (
            <motion.div key={alumni.id} variants={fadeUp}>
              <AlumniCard alumni={alumni} />
            </motion.div>
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className={`text-sm ${isDark ? "text-slate-500" : "text-[#94A3B8]"}`}>
              No alumni found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
