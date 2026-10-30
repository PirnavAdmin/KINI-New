import { memo } from "react";
import { motion } from "framer-motion";
import {
  FaCertificate,
  FaLock,
  FaCheckCircle,
  FaDownload,
  FaShareAlt,
  FaTrophy,
  FaArrowRight,
} from "react-icons/fa";

const CertificateTab = memo(function CertificateTab({ certificate, progress }) {
  const isEarned = progress === 100;

  if (!certificate) {
    return (
      <div className="text-center py-12">
        <FaCertificate className="text-3xl text-[#6B7280] mx-auto mb-3" />
        <p className="text-sm text-[#6B7280]">No certificate available</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative bg-[#111827] border rounded-2xl overflow-hidden ${
          isEarned ? "border-[#22C55E]/30" : "border-[#1F2937]"
        }`}
      >
        {/* Top decoration */}
        <div
          className={`h-2 ${
            isEarned
              ? "bg-gradient-to-r from-[#22C55E] via-[#0f55f7] to-[#06b6a8]"
              : "bg-[#1F2937]"
          }`}
        />

        <div className="p-6 text-center">
          {/* Icon */}
          <div
            className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
              isEarned
                ? "bg-gradient-to-br from-[#22C55E]/20 to-[#0f55f7]/20"
                : "bg-[#1E293B]"
            }`}
          >
            {isEarned ? (
              <FaTrophy className="text-2xl text-[#22C55E]" />
            ) : (
              <FaLock className="text-xl text-[#6B7280]" />
            )}
          </div>

          <h3 className="text-lg font-bold text-white mb-1">
            {isEarned ? "Certificate Earned!" : "Course Certificate"}
          </h3>
          <p className="text-xs text-[#9CA3AF] mb-4">
            {isEarned
              ? `Congratulations on completing ${certificate.title}!`
              : `Complete ${100 - progress}% more to earn your certificate`}
          </p>

          {/* Certificate Preview */}
          <div
            className={`rounded-xl p-6 mb-4 border-2 border-dashed ${
              isEarned
                ? "bg-gradient-to-br from-[#22C55E]/5 to-[#0f55f7]/5 border-[#22C55E]/30"
                : "bg-[#1E293B]/50 border-[#1F2937]"
            }`}
          >
            <FaCertificate
              className={`text-3xl mx-auto mb-2 ${
                isEarned ? "text-[#22C55E]" : "text-[#6B7280]"
              }`}
            />
            <h4 className="text-sm font-bold text-white">
              {certificate.title}
            </h4>
            <p className="text-[10px] text-[#6B7280] mt-1">
              Issued by {certificate.issuer}
            </p>

            {/* Progress bar */}
            {!isEarned && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-[#6B7280] mb-1">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 bg-[#1F2937] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] rounded-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          {isEarned ? (
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#22C55E]/20 text-[#22C55E] text-xs font-medium hover:bg-[#22C55E]/30 transition-all cursor-pointer">
                <FaDownload className="text-[10px]" />
                Download
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#0f55f7]/20 text-[#0f55f7] text-xs font-medium hover:bg-[#0f55f7]/30 transition-all cursor-pointer">
                <FaShareAlt className="text-[10px]" />
                Share
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1 text-xs text-[#6B7280]">
              <FaLock className="text-[10px]" />
              <span>
                Complete all {100 - progress}% remaining lessons to unlock
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
});

export default CertificateTab;

