import { memo, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ROUTES } from "@shared/constants/routeConstants";
import { ADMISSION_DATA } from "./admission.data";
import HeroSection from "./components/HeroSection";
import BenefitCard from "./components/BenefitCard";

const AdmissionCard = memo(function AdmissionCard({ onOpenEnquiry }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handlePrimary = useCallback(() => {
    setLoading(true);
    // Simulate processing
    setTimeout(() => {
      setLoading(false);
      navigate(ROUTES.PUBLIC.ENROLL);
    }, 800);
  }, [navigate]);

  const handleSecondary = useCallback(() => {
    if (onOpenEnquiry) {
      onOpenEnquiry();
    }
  }, [onOpenEnquiry]);

  if (!ADMISSION_DATA) return null;

  return (
    <section className="relative overflow-hidden py-12 md:py-16 lg:py-20">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/[0.03] via-transparent to-purple-500/[0.02] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] bg-gradient-radial from-blue-600/8 via-purple-600/5 to-transparent pointer-events-none" />

      {/* Decorative grid */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right,#ffffff 1px,transparent 1px),linear-gradient(to bottom,#ffffff 1px,transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <HeroSection
            data={ADMISSION_DATA}
            onPrimary={handlePrimary}
            onSecondary={handleSecondary}
            loading={loading}
          />
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mt-12 sm:mt-16 lg:mt-20 pt-8 sm:pt-10 border-t border-slate-800/40"
        >
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Everything You Get
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-lg mx-auto">
              A comprehensive suite of career-building resources included with every enrollment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ADMISSION_DATA.benefits.map((benefit, i) => (
              <BenefitCard key={i} benefit={benefit} index={i} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
});

export default AdmissionCard;
