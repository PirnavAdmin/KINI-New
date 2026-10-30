import { memo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useThemeContext } from "@shared/context/ThemeContext";

// Brand palette
const BRAND_BLUE = "#085FA7";
const BRAND_GREEN = "#5CA347";
const BRAND_GRADIENT = `linear-gradient(135deg, ${BRAND_BLUE}, ${BRAND_GREEN})`;
const DARK_BG = "#0F172A";
const LIGHT_BG = "#F8FAFC";

// Row 1 — distinct set of companies
const rowOneCompanies = [
  { name: "Google", logo: "https://cdn.simpleicons.org/google" },
  { name: "Microsoft", logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSB9Q6UJD8MB-XB7djjBlr9QjBWZNB3WDagK1yQzIfHEFgx9JJpVjoJIm7b&s=10" },
  { name: "Amazon", logo: "https://static.vecteezy.com/system/resources/previews/019/136/319/non_2x/amazon-logo-amazon-icon-free-free-vector.jpg" },
  { name: "Adobe", logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYwgbLPGIauG3Gjph_EERza0f_cxIB0K3hZCw9AKGeOA&s=10" },
  { name: "IBM", logo: "https://images.vexels.com/media/users/3/140583/isolated/preview/905dd25934b7a05516389863f7cb9417-ibm-logo.png" },
  { name: "Oracle", logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTaj6RqJsoLNCXVO9b1FRwsguue4_CZUb9auXhaD3bQA&s" },
  { name: "Salesforce", logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhzGsfBiKTjQUbKwC2BVBfyWJThIXA-H_jHeBixRW5Eg&s=10" },
  { name: "Cisco", logo: "https://cdn.simpleicons.org/cisco" },
];

// Row 2 — a different set of companies (no overlap with row 1)
const rowTwoCompanies = [
  { name: "Meta", logo: "https://cdn.simpleicons.org/meta" },
  { name: "Netflix", logo: "https://cdn.simpleicons.org/netflix" },
  { name: "Spotify", logo: "https://cdn.simpleicons.org/spotify" },
  { name: "Airbnb", logo: "https://cdn.simpleicons.org/airbnb" },
  { name: "Uber", logo: "https://cdn.simpleicons.org/uber" },
  { name: "Slack", logo: "https://1000logos.net/wp-content/uploads/2021/06/Slack-logo.png" },
  { name: "Dropbox", logo: "https://cdn.simpleicons.org/dropbox" },
  { name: "Atlassian", logo: "https://cdn.simpleicons.org/atlassian" },
];

const topRow = [...rowOneCompanies, ...rowOneCompanies];
const bottomRow = [...rowTwoCompanies, ...rowTwoCompanies];

function LogoCard({ company, isDark }) {
  const [imgError, setImgError] = useState(false);
  const handleImgError = useCallback(() => setImgError(true), []);

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.08 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group flex-shrink-0 w-[120px] h-[72px] rounded-2xl p-[1.5px] transition-all duration-300"
      style={{ background: `${BRAND_BLUE}33` }}
      onMouseEnter={(e) => (e.currentTarget.style.background = BRAND_GRADIENT)}
      onMouseLeave={(e) => (e.currentTarget.style.background = `${BRAND_BLUE}33`)}
    >
      <div
        className={`
        flex h-full w-full items-center justify-center rounded-[18px]
        backdrop-blur-xl transition-all duration-300
        ${isDark
          ? "bg-white/[0.03] group-hover:bg-white/[0.06] group-hover:shadow-[0_8px_28px_rgba(8,95,167,0.18)]"
          : "bg-white/80 group-hover:bg-white group-hover:shadow-[0_8px_28px_rgba(8,95,167,0.12)]"
        }
        `}
      >
        {imgError ? (
          <div
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ background: BRAND_GRADIENT }}
          >
            {company.name.charAt(0)}
          </div>
        ) : (
          <img
            src={company.logo}
            alt={company.name}
            loading="lazy"
            onError={handleImgError}
            className="h-8 w-auto object-contain opacity-80 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110"
          />
        )}
      </div>
    </motion.div>
  );
}

const TrustedCompanies = memo(() => {
  const { isDark } = useThemeContext();

  const edgeFadeStyle = {
    maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
    WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
  };

  return (
    <section
      className="relative overflow-hidden py-10 md:py-12 lg:py-14"
      style={{ backgroundColor: isDark ? DARK_BG : LIGHT_BG }}
    >
      {/* Glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[650px] h-[650px] rounded-full blur-[180px]"
        style={{ backgroundColor: `${BRAND_BLUE}1A` }}
      />
      <div
        className="absolute bottom-0 right-0 w-[420px] h-[420px] rounded-full blur-[150px]"
        style={{ backgroundColor: `${BRAND_GREEN}1A` }}
      />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <span
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold"
            style={{ backgroundColor: `${BRAND_BLUE}14`, color: BRAND_BLUE }}
          >
            <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: BRAND_BLUE }} />
            Trusted Hiring Partners
          </span>

          <h2
            className="mt-3 text-2xl lg:text-3xl font-black leading-tight"
            style={{ color: isDark ? "#E7ECF3" : "#0F172A" }}
          >
            Students Placed At
            <span
              className="block bg-clip-text text-transparent"
              style={{ backgroundImage: BRAND_GRADIENT }}
            >
              Leading Companies
            </span>
          </h2>

          <p className={`mt-2 max-w-2xl mx-auto text-sm leading-6 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Our learners are building careers at world-class technology companies.
          </p>
        </motion.div>

        {/* TOP ROW */}
        <div className="relative mt-8 overflow-hidden" style={edgeFadeStyle}>
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
            className="flex gap-4 w-max"
          >
            {topRow.map((company, index) => (
              <LogoCard key={`top-${company.name}-${index}`} company={company} isDark={isDark} />
            ))}
          </motion.div>
        </div>

        {/* SECOND ROW */}
        <div className="relative mt-4 overflow-hidden" style={edgeFadeStyle}>
          <motion.div
            animate={{ x: ["-50%", "0%"] }}
            transition={{ repeat: Infinity, duration: 32, ease: "linear" }}
            className="flex gap-4 w-max"
          >
            {bottomRow.map((company, index) => (
              <LogoCard key={`bottom-${company.name}-${index}`} company={company} isDark={isDark} />
            ))}
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-10 grid grid-cols-3 gap-4 max-w-2xl mx-auto"
        >
          <div className="text-center">
            <h3 className="text-2xl font-black" style={{ color: BRAND_BLUE }}>500+</h3>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Hiring Partners</p>
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-black" style={{ color: BRAND_GREEN }}>95%</h3>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Placement Rate</p>
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-black" style={{ color: BRAND_BLUE }}>2200+</h3>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Students Placed</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

export default TrustedCompanies;