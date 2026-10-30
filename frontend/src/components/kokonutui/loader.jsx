
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export default function Loader({
  title = "Preparing Your Career Journey 🚀",
  subtitle = "Setting up courses, jobs & growth path for you...",
  size = "md",
  className,
  ...props
}) {
  const sizeConfig = {
    sm: {
      container: "size-20",
      titleClass: "text-sm/tight font-medium",
      subtitleClass: "text-xs/relaxed",
      spacing: "space-y-2",
      maxWidth: "max-w-48",
    },
    md: {
      container: "size-32",
      titleClass: "text-base/snug font-medium",
      subtitleClass: "text-sm/relaxed",
      spacing: "space-y-3",
      maxWidth: "max-w-56",
    },
    lg: {
      container: "size-40",
      titleClass: "text-lg/tight font-semibold",
      subtitleClass: "text-base/relaxed",
      spacing: "space-y-4",
      maxWidth: "max-w-64",
    },
  };

  const config = sizeConfig[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-8 p-8",
        className
      )}
      {...props}
    >
      {/* 🎓 Animated Loader */}
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={cn("relative", config.container)}
      >
        {/* Main Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent"
        />

        {/* Secondary Ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 rounded-full border-2 border-gray-400 border-b-transparent opacity-60"
        />

        {/* Center Dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
        </div>
      </motion.div>

      {/* ✨ Text Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={cn("text-center", config.spacing, config.maxWidth)}
      >
        <h1
          className={cn(
            config.titleClass,
            "text-gray-900 dark:text-white"
          )}
        >
          {title}
        </h1>

        <p
          className={cn(
            config.subtitleClass,
            "text-gray-500 dark:text-gray-400"
          )}
        >
          {subtitle}
        </p>

        {/* 📊 Progress Bar */}
        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden mt-3">
          <motion.div
            className="h-full bg-blue-600"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: 2,
              ease: "easeInOut",
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}