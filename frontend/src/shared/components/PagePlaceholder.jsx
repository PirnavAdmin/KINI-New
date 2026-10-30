import { motion } from "framer-motion";
import { Rocket, Construction, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@shared/hooks/useAuth";
import { hasStoredSession } from "@shared/utils/authSession";

/**
 * PagePlaceholder — premium "under development" view for routes
 * that have been defined but not yet implemented.
 */
const PagePlaceholder = ({ title = "Page" }) => {
  const location = useLocation();
  const { isAuthenticated, getDashboardRoute } = useAuth();

  const isAuthPage = isAuthenticated || hasStoredSession();

  return (
    <div className="flex h-full min-h-[60vh] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-5 px-6 text-center"
      >
        <div className="relative">
          <motion.div
            className="flex h-20 w-20 items-center justify-center rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/20 to-orange-500/20"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Rocket className="h-9 w-9 text-amber-500" />
          </motion.div>
          <motion.div
            className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-xl border border-[#0f55f7]/20 bg-gradient-to-br from-[#0f55f7]/20 to-[#06b6a8]/20"
            animate={{ rotate: [0, 12, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <Construction className="h-4 w-4 text-[#0f55f7]" />
          </motion.div>
        </div>

        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>

        <p className="max-w-sm text-sm leading-relaxed text-slate-400">
          This page is under development and will be available soon.
          We're working hard to bring you an amazing experience.
        </p>

        {isAuthPage && (
          <Link
            to={getDashboardRoute() || "/"}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #3d75ff, #06b6a8)", boxShadow: "0 4px 24px rgba(59,130,246,0.25)" }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        )}

        {!isAuthPage && (
          <p className={`text-xs ${location.pathname !== "/" ? "text-slate-400" : ""}`}>
            <Link to="/" className="font-medium text-[#0f55f7] transition-colors hover:text-[#0f55f7]">
              Go to Home
            </Link>
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default PagePlaceholder;
