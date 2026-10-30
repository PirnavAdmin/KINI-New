import { memo } from "react";
import { motion } from "framer-motion";
import {
  FaFilePdf,
  FaDownload,
  FaGithub,
  FaExternalLinkAlt,
  FaFolderOpen,
  FaFileArchive,
} from "react-icons/fa";

const TYPE_CONFIG = {
  pdf: { icon: FaFilePdf, color: "text-red-400", bg: "bg-red-500/10" },
  zip: { icon: FaFileArchive, color: "text-amber-400", bg: "bg-amber-500/10" },
  link: {
    icon: FaExternalLinkAlt,
    color: "text-blue-400",
    bg: "bg-[#0f55f7]/10",
  },
  github: { icon: FaGithub, color: "text-white", bg: "bg-white/10" },
};

const ResourcesTab = memo(function ResourcesTab({ resources }) {
  if (!resources || resources.length === 0) {
    return (
      <div className="text-center py-12">
        <FaFolderOpen className="text-3xl text-[#6B7280] mx-auto mb-3" />
        <p className="text-sm text-[#6B7280]">No resources available yet</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {resources.map((resource, i) => {
        const config = TYPE_CONFIG[resource.type] || TYPE_CONFIG.link;
        const Icon = config.icon;

        return (
          <motion.a
            key={resource.id}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-3 p-4 bg-[#111827] border border-[#1F2937] rounded-xl hover:border-[#0f55f7]/30 hover:bg-[#1A2332] transition-all duration-200 group cursor-pointer"
          >
            <div
              className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center`}
            >
              <Icon className={`text-base ${config.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate group-hover:text-[#0f55f7] transition-colors">
                {resource.title}
              </p>
              <p className="text-[10px] text-[#6B7280] mt-0.5">
                {resource.type.toUpperCase()}
                {resource.size ? ` · ${resource.size}` : ""}
              </p>
            </div>
            <FaDownload className="text-xs text-[#6B7280] group-hover:text-white transition-colors shrink-0" />
          </motion.a>
        );
      })}
    </div>
  );
});

export default ResourcesTab;

