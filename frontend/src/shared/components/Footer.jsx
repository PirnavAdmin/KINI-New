import { useState } from "react";
import {
  FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn,
  FaArrowRight, FaMapMarkerAlt, FaPhone, FaEnvelope,
  FaHeart, FaRocket,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useThemeContext } from "@shared/context/ThemeContext";

const footerLinks = {
  courses: [
    { name: "React Mastery", path: "/courses/react" },
    { name: "Python Full Stack", path: "/courses/python" },
    { name: "MERN Stack", path: "/courses/mern" },
    { name: "AI & Machine Learning", path: "/courses/ai" },
    { name: "DevOps & Cloud", path: "/courses/devops" },
  ],
  quickLinks: [
    { name: "Home", path: "/" },
    { name: "Courses", path: "/courses" },
    { name: "About Us", path: "/about" },
    { name: "Contact", path: "/contact" },
    { name: "Blog", path: "/blog" },
  ],
  resources: [
    { name: "Success Stories", path: "/success-stories" },
    { name: "Mentors", path: "/mentors" },
    { name: "FAQ", path: "/faq" },
    { name: "Careers", path: "/careers" },
    { name: "Privacy Policy", path: "/privacy" },
  ],
};

const socialLinks = [
  { icon: FaFacebookF, href: "#", label: "Facebook", hoverColor: "#1877F2" },
  { icon: FaTwitter, href: "#", label: "Twitter", hoverColor: "#1DA1F2" },
  { icon: FaInstagram, href: "#", label: "Instagram", hoverColor: "#E4405F" },
  { icon: FaLinkedinIn, href: "#", label: "LinkedIn", hoverColor: "#0A66C2" },
];

export default function Footer() {
  const { isDark } = useThemeContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      navigate("/courses");
      setEmail("");
    }
  };

  return (
    <footer
      className={`relative overflow-hidden transition-colors duration-500 ${
        isDark
          ? "bg-[#050816] text-white"
          : "bg-gradient-to-b from-white to-slate-50 text-slate-900"
      }`}
    >
      {/* Background glow */}          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#085FA7]/5 dark:bg-[#085FA7]/10 blur-[200px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#5CA347]/5 dark:bg-[#5CA347]/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12 pb-8">
        {/* Top: Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 pb-12 border-b border-slate-200/50 dark:border-white/5">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="brand-logo-viewport mb-4 flex h-12 w-[155px] items-center justify-center">
              <motion.img whileHover={{ scale: 1.05 }} src="/assets/new-logo-f.jpg.jpeg" alt="Kini — Learn. Innovate. Lead." className="brand-logo-image" />
            </Link>

            <p className={`text-sm leading-relaxed mb-6 max-w-sm ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}>
              Empowering the next generation of tech professionals with industry-aligned training, expert mentorship, and career-focused programs.
            </p>

            {/* Contact Info */}
            <div className="space-y-2 mb-6">              <div className={`flex items-center gap-2 text-xs ${isDark ? "text-slate-400" : "text-[#64748B]"}`}>
                <FaMapMarkerAlt className="w-3 h-3 text-[#085FA7]" />
                Bangalore, Karnataka, India
              </div>
              <div className={`flex items-center gap-2 text-xs ${isDark ? "text-slate-400" : "text-[#64748B]"}`}>
                <FaPhone className="w-3 h-3 text-[#085FA7]" />
                +91 98765 43210
              </div>
              <div className={`flex items-center gap-2 text-xs ${isDark ? "text-slate-400" : "text-[#64748B]"}`}>
                <FaEnvelope className="w-3 h-3 text-[#085FA7]" />
                hello@kinieduhub.com
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2">
              {socialLinks.map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  aria-label={social.label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isDark
                      ? "bg-white/5 border border-white/5 text-slate-400"
                      : "bg-slate-100 border border-slate-200 text-slate-500"
                  }`}
                  style={{ "--hover-color": social.hoverColor }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDark
                      ? `${social.hoverColor}20`
                      : `${social.hoverColor}15`;
                    e.currentTarget.style.color = social.hoverColor;
                    e.currentTarget.style.borderColor = `${social.hoverColor}30`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isDark
                      ? "rgba(255,255,255,0.05)"
                      : "#f1f5f9";
                    e.currentTarget.style.color = isDark
                      ? "#94A3B8"
                      : "#64748B";
                    e.currentTarget.style.borderColor = isDark
                      ? "rgba(255,255,255,0.05)"
                      : "#e2e8f0";
                  }}
                >
                  <social.icon className="w-3.5 h-3.5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={`text-sm font-bold mb-4 ${
              isDark ? "text-white" : "text-slate-900"
            }`}>
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.quickLinks.map((link, i) => (
                <li key={i}>
                  <Link
                    to={link.path}
                    className={`inline-flex items-center gap-1.5 text-xs transition-all duration-200 group ${
                      isDark
                        ? "text-slate-400 hover:text-white"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <FaArrowRight className="w-2 h-2 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Courses */}
          <div>
            <h3 className={`text-sm font-bold mb-4 ${
              isDark ? "text-white" : "text-slate-900"
            }`}>
              Popular Courses
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.courses.map((course, i) => (
                <li key={i}>
                  <Link
                    to={course.path}
                    className={`inline-flex items-center gap-1.5 text-xs transition-all duration-200 group ${
                      isDark
                        ? "text-slate-400 hover:text-white"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <FaArrowRight className="w-2 h-2 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                    {course.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className={`text-sm font-bold mb-4 ${
              isDark ? "text-white" : "text-slate-900"
            }`}>
              Resources
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.resources.map((resource, i) => (
                <li key={i}>
                  <Link
                    to={resource.path}
                    className={`inline-flex items-center gap-1.5 text-xs transition-all duration-200 group ${
                      isDark
                        ? "text-slate-400 hover:text-white"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <FaArrowRight className="w-2 h-2 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                    {resource.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
          <p className={`text-xs ${
            isDark ? "text-slate-500" : "text-slate-400"
          }`}>
            © 2026 Kini EduHub. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <span className={`text-[10px] flex items-center gap-1 ${
              isDark ? "text-slate-500" : "text-slate-400"
            }`}>
              Made with <FaHeart className="w-3 h-3 text-rose-400" /> for learners
            </span>            <span className={`text-[10px] flex items-center gap-1 ${isDark ? "text-slate-500" : "text-[#94A3B8]"}`}>
              <FaRocket className="w-3 h-3 text-[#085FA7]" /> Powered by AI
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/privacy")}
              className={`text-xs transition-colors duration-200 ${
                isDark
                  ? "text-slate-500 hover:text-slate-300"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Privacy Policy
            </button>
            <button
              onClick={() => navigate("/terms")}
              className={`text-xs transition-colors duration-200 ${
                isDark
                  ? "text-slate-500 hover:text-slate-300"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Terms & Conditions
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
