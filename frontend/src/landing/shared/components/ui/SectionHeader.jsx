import { motion } from "framer-motion";
import { fadeUp } from "@landing-shared/hooks/useScrollAnimation";
import Badge from "./Badge";

/**
 * Eyebrow + heading + subheading block used at the top of every section.
 * `heading` accepts JSX so a word can be wrapped in the brand gradient,
 * e.g. heading={<>Trusted <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">Hiring Partners</span></>}.
 */
export default function SectionHeader({
  eyebrow,
  eyebrowIcon,
  heading,
  subheading,
  align = "center",
  className = "",
}) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false }}
      variants={fadeUp}
      className={`max-w-2xl ${alignClass} ${className}`}
    >
      {eyebrow && (
        <Badge icon={eyebrowIcon} className="mb-4">
          {eyebrow}
        </Badge>
      )}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">{heading}</h2>
      {subheading && (
        <p className="mt-3 text-sm sm:text-base leading-relaxed text-foreground-muted">{subheading}</p>
      )}
    </motion.div>
  );
}
