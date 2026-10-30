import { useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";

/**
 * ProjectsShowcase
 * ------------------------------------------------------------------
 * A sticky-text / scrolling-gallery section that replaces the old
 * inline "Real Projects. Real Experience." block.
 *
 * This version ships with `DEFAULT_PROJECTS` baked in (your four
 * projects with the images you provided) so the component works
 * out of the box with `<ProjectsShowcase />` — no data wiring
 * required in Home.jsx. Pass a `projects` prop to override.
 *
 * Note on the default images: they're hotlinked from i.pinimg.com,
 * which is fine for a preview but risky for production — Pinterest
 * can rate-limit/block hotlinking and the URLs aren't guaranteed
 * stable. Before shipping, move them to your own /public/images or
 * a CDN you control and swap the `image` values below.
 *
 * Brand pass v2:
 *  - Section background is white to match the logo treatment.
 *  - Brand gradient uses the logo colors: #0f55f7 (blue) → #06b6a8
 *    (teal).
 *  - Image cards stay dark (they hold photos + white overlay text),
 *    so they read as intentional "windows" against the white section.
 *
 * Fixes carried over from earlier passes:
 *  - Sticky-left / scroll-right layout is disabled below `md`.
 *  - Motion is scroll-linked (useScroll/useTransform), not hover-only.
 *  - Respects prefers-reduced-motion.
 *  - Images are lazy-loaded, have real alt text, and gracefully
 *    degrade (branded placeholder) if a src 404s or is missing.
 *  - A live "02 / 04" badge communicates position in the scroll story.
 *
 * Usage:
 *   <ProjectsShowcase />                       // uses DEFAULT_PROJECTS
 *   <ProjectsShowcase projects={myProjects} />  // uses your own data
 *
 * Each project: { id, title, category, description, image, alt, href }
 * ------------------------------------------------------------------
 */

const BRAND_FROM = "#0f55f7";
const BRAND_TO = "#06b6a8";

export const DEFAULT_PROJECTS = [
  {
    id: "p1",
    title: "E-Commerce Platform",
    category: "Frontend Track",
    description: "React + Next.js storefront with a headless CMS backend.",
    image:
      "https://i.pinimg.com/736x/2b/d1/9c/2bd19cd788723cb5211155cc4706b387.jpg",
    alt: "E-commerce storefront UI showcasing the platform's design",
    href: "/projects/ecommerce-platform",
  },
  {
    id: "p2",
    title: "Realtime Chat App",
    category: "Backend Track",
    description: "Node.js, Socket.IO, and Redis-backed presence system.",
    image:
      "https://i.pinimg.com/736x/4c/e9/9b/4ce99b299d1e8a555f1fcbddb40ec7b0.jpg",
    alt: "Realtime chat application interface with live messaging",
    href: "/projects/realtime-chat",
  },
  {
    id: "p3",
    title: "Resume Screener",
    category: "AI Track",
    description: "NLP pipeline that ranks resumes against a job description.",
    image:
      "https://i.pinimg.com/736x/e6/e5/8d/e6e58db84bc08d960a3ee76014a4bf3e.jpg",
    alt: "Resume screening tool showing candidate match scores",
    href: "/projects/resume-screener",
  },
  {
    id: "p4",
    title: "Fitness Tracker",
    category: "Frontend Track",
    description: "PWA with offline logging and animated progress charts.",
    image:
      "https://i.pinimg.com/736x/df/f0/7f/dff07f2b60074160e6de185404424c47.jpg",
    alt: "Fitness tracker app showing workout and progress charts",
    href: "/projects/fitness-tracker",
  },
];

function ProjectCard({ project, index, total }) {
  const [imgError, setImgError] = useState(false);
  const ref = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "start 0.35"],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0.3, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [40, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.96, 1]);

  const content = (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200 transition-colors duration-500 group-hover:ring-[#0f55f7]/40">
      {/* Brand gradient top bar */}
      <div className="absolute inset-x-0 top-0 z-10 h-1.5 bg-gradient-to-r from-[#0f55f7] to-[#06b6a8]" />

      {/* Ambient glow orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-to-br from-[#0f55f7] to-[#06b6a8] opacity-0 blur-[60px] transition-opacity duration-700 group-hover:opacity-30" />
        <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-gradient-to-br from-[#06b6a8] to-[#0f55f7] opacity-0 blur-[60px] transition-opacity duration-700 group-hover:opacity-20" />
      </div>

      {!imgError && project.image ? (
        <img
          src={project.image}
          alt={project.alt || project.title}
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
          className="h-96 w-80 object-cover md:h-[26rem] md:w-96 transition-transform duration-700 ease-out group-hover:scale-105"
        />
      ) : (
        // Branded fallback — used until real screenshots are wired up,
        // or if an image src 404s. Looks intentional instead of broken.
        <div className="relative h-96 w-80 overflow-hidden bg-gradient-to-br from-[#0a1f63] via-slate-900 to-[#053f3a] md:h-[26rem] md:w-96">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute -top-10 -right-10 h-52 w-52 rounded-full bg-gradient-to-br from-[#0f55f7] to-[#06b6a8] opacity-30 blur-[70px]"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-10 -left-10 h-52 w-52 rounded-full bg-gradient-to-br from-[#06b6a8] to-[#0f55f7] opacity-20 blur-[70px]"
          />
          <div className="relative flex h-full w-full items-center justify-center">
            <span className="bg-gradient-to-br from-[#0f55f7] to-[#06b6a8] bg-clip-text text-6xl font-bold text-transparent">
              {project.title?.charAt(0) ?? "?"}
            </span>
          </div>
        </div>
      )}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/10 to-transparent"
      />

      <div className="absolute inset-x-0 bottom-0 p-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#5fe6d8]">
          {project.category}
        </span>
        <h3 className="mt-1 text-xl font-bold text-white">
          {project.title}
        </h3>
        {project.description && (
          <p className="mt-1 text-sm text-slate-300 line-clamp-2">
            {project.description}
          </p>
        )}
      </div>

      <span className="absolute right-4 top-4 rounded-full bg-slate-950/70 px-3 py-1 text-xs font-mono text-slate-300 ring-1 ring-white/10">
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </span>
    </div>
  );

  return (
    <motion.div
      ref={ref}
      style={shouldReduceMotion ? undefined : { opacity, y, scale }}
      className="group"
    >
      {project.href ? (
        <a
          href={project.href}
          className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#0f55f7] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          aria-label={`View project: ${project.title}`}
        >
          {content}
        </a>
      ) : (
        content
      )}
    </motion.div>
  );
}

ProjectCard.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    category: PropTypes.string,
    description: PropTypes.string,
    image: PropTypes.string.isRequired,
    alt: PropTypes.string,
    href: PropTypes.string,
  }).isRequired,
  index: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
};

export default function ProjectsShowcase({
  projects = DEFAULT_PROJECTS,
  eyebrow = "Portfolio",
  title = "Real Projects.",
  highlight = "Real Experience.",
  description,
}) {
  if (!projects || projects.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-white text-slate-900">
      {/* Ambient section-level glow, ties this section to the rest of the page */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-gradient-to-br from-[#0f55f7] to-[#06b6a8] opacity-[0.08] blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 md:grid md:grid-cols-2 md:gap-10 md:px-10">
        {/* LEFT — sticky on desktop, static stack on mobile */}
        <div className="flex flex-col justify-center py-16 md:sticky md:top-0 md:h-screen md:py-0">
          {eyebrow && (
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-[#0f55f7]/5 px-4 py-2 text-sm font-semibold text-[#0f55f7] ring-1 ring-[#0f55f7]/15">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] animate-pulse" />
              {eyebrow}
            </span>
          )}
          <h2 className="text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
            {title}
            <br />
            <span className="bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] bg-clip-text text-transparent">
              {highlight}
            </span>
          </h2>
          {description && (
            <p className="mt-4 max-w-md text-slate-500">{description}</p>
          )}
        </div>

        {/* RIGHT — scroll-linked gallery */}
        <div className="flex flex-col gap-10 py-16 md:py-24">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              total={projects.length}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

ProjectsShowcase.propTypes = {
  projects: PropTypes.array,
  eyebrow: PropTypes.string,
  title: PropTypes.string,
  highlight: PropTypes.string,
  description: PropTypes.string,
};