import { useState } from "react";
import PropTypes from "prop-types";
import { Check } from "lucide-react";
import "./mentor-hero.css"; // .mentor-hero-btn styles for `actions`
import "./mentor-hero.css";
import "./mentor-banner.css";

/* Soft blue backdrop shared by every mentor banner: light blobs, a bottom
   wave and (optionally) leaves at the left edge. Purely decorative. */
function BannerBackdrop({ leaves }) {
  return (
    <svg className="mentor-banner__backdrop" viewBox="0 0 1600 300" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="mbGlowA" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".85" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="mbGlowB" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#cfe1fb" stopOpacity=".9" />
          <stop offset="1" stopColor="#cfe1fb" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="1180" cy="40" rx="420" ry="150" fill="url(#mbGlowA)" />
      <ellipse cx="1480" cy="250" rx="260" ry="140" fill="url(#mbGlowB)" />
      <ellipse cx="620" cy="-40" rx="360" ry="120" fill="url(#mbGlowA)" />
      <path d="M0 250 C220 212 420 286 700 256 C930 232 1080 280 1320 262 C1440 254 1530 236 1600 228 V300 H0 Z" fill="#ffffff" fillOpacity=".55" />
      <path d="M0 276 C260 248 520 300 820 280 C1080 262 1300 296 1600 270 V300 H0 Z" fill="#dbe8fa" fillOpacity=".55" />
      {leaves && (
        <g opacity=".85">
          <path d="M-10 170 C40 120 90 110 120 40 C70 70 30 90 -10 150 Z" fill="#b9d4f5" />
          <path d="M-10 230 C30 190 80 180 110 120 C60 140 20 170 -10 210 Z" fill="#a7c7f0" />
          <path d="M20 300 C40 250 90 230 130 190 C80 200 40 230 10 280 Z" fill="#c8dcf7" />
          <path d="M120 40 C80 90 40 120 -10 160" stroke="#9dbfeb" strokeWidth="2" fill="none" />
        </g>
      )}
    </svg>
  );
}
BannerBackdrop.propTypes = { leaves: PropTypes.bool };

const toneClass = (tone) => `mentor-banner__tone--${tone || "blue"}`;

/**
 * MentorBanner — full-width illustrated hero used at the top of mentor
 * pages (Dashboard, My Attendance, Leave Requests, My Batches, My Students,
 * Reports). Artwork comes from public/assets/MentorsBnners via
 * constants/mentorBanners.js; everything else is real HTML text.
 *
 * variant     layout key — each variant positions art / script / chips
 *             to match its page design (see mentor-banner.css)
 * image       { src, fallbackSrc, alt } — optional; pass `art` instead for
 *             an inline SVG illustration
 * eyebrow     small label above the title; eyebrowStyle "pill" | "bar" | "text"
 * title       leading part of the heading; highlight renders in brand blue
 * lead        optional stronger line under the title
 * subtitle    muted supporting line(s)
 * features    [{ icon, title, text, tone }] row under the copy
 * script      handwritten lines (the last one gets an orange swoosh)
 * quote       quoted handwritten lines with an orange underline
 * floating    [{ icon, label, tone }] white chips floating over the art
 * checklist   [string] white card with ticks next to the art
 * meta        extra nodes under the subtitle (status pills, …)
 * actions     buttons / selects, top-right
 * leading     node shown before the copy (avatar, back button …)
 * titleAside  node shown next to the title (status badges)
 * featureShape "circle" | "square" | "stack" (icon tile above a two-line label)
 * as          wrapper element (default "section"; Dashboard uses "header")
 */
export default function MentorBanner({
  variant = "default",
  image,
  art,
  eyebrow,
  eyebrowIcon: EyebrowIcon,
  eyebrowStyle = "pill",
  title,
  highlight,
  lead,
  subtitle,
  features = [],
  featureShape = "circle",
  script = [],
  quote = [],
  floating = [],
  checklist = [],
  meta,
  actions,
  leaves = false,
  leading,
  titleAside,
  as: Tag = "section",
  className = "",
  ...rest
}) {
  const sources = [image?.src, image?.fallbackSrc].filter(Boolean);
  const [sourceIndex, setSourceIndex] = useState(0);
  const imageSrc = sources[sourceIndex];

  return (
    <Tag
      {...rest}
      data-ui="mentor-banner"
      data-variant={variant}
      className={`mentor-banner mentor-banner--${variant} ${className}`}
    >
      <BannerBackdrop leaves={leaves} />

      {leading && <div className="mentor-banner__leading">{leading}</div>}
      <div className="mentor-banner__copy">
        {eyebrow && (
          <p className={`mentor-banner__eyebrow mentor-banner__eyebrow--${eyebrowStyle}`}>
            {EyebrowIcon && <EyebrowIcon aria-hidden="true" />}
            {eyebrow}
          </p>
        )}
        <div className="mentor-banner__titlerow">
          <h1 className="mentor-banner__title">
            {title}
            {highlight && <> <span className="mentor-banner__highlight">{highlight}</span></>}
          </h1>
          {titleAside}
        </div>
        {lead && <p className="mentor-banner__lead">{lead}</p>}
        {subtitle && <p className="mentor-banner__subtitle">{subtitle}</p>}
        {meta && <div className="mentor-banner__meta">{meta}</div>}
        {features.length > 0 && (
          <ul className={`mentor-banner__features mentor-banner__features--${featureShape}`}>
            {features.map(({ icon: Icon, title: featureTitle, text, tone }) => (
              <li key={`${featureTitle}-${text}`} className="mentor-banner__feature">
                <span className={`mentor-banner__feature-icon ${toneClass(tone)}`} aria-hidden="true">{Icon && <Icon />}</span>
                <span className="mentor-banner__feature-text"><b>{featureTitle}</b>{text && <span>{text}</span>}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {(imageSrc || art) && (
        <div className="mentor-banner__art" aria-hidden={image?.alt ? undefined : "true"}>
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={image?.alt || ""}
              draggable={false}
              decoding="async"
              onError={() => setSourceIndex((index) => index + 1)}
            />
          ) : art}
        </div>
      )}

      {script.length > 0 && (
        <div className="mentor-banner__script" aria-hidden="true">
          {script.map((line, index) => (
            <em key={`${line}-${index}`} className={index === script.length - 1 ? "is-last" : undefined}>{line}</em>
          ))}
          <svg className="mentor-banner__swoosh" viewBox="0 0 160 20" aria-hidden="true"><path d="M4 15 C50 5 110 3 156 8" /></svg>
        </div>
      )}

      {quote.length > 0 && (
        <blockquote className="mentor-banner__quote">
          <span className="mentor-banner__quote-mark" aria-hidden="true">&ldquo;</span>
          {quote.map((line, index) => <em key={`${line}-${index}`}>{line}</em>)}
          <span className="mentor-banner__quote-mark mentor-banner__quote-mark--end" aria-hidden="true">&rdquo;</span>
          <i className="mentor-banner__quote-line" aria-hidden="true" />
        </blockquote>
      )}

      {floating.map(({ icon: Icon, label, tone }, index) => (
        <span key={label} className={`mentor-banner__float mentor-banner__float--${index + 1}`} aria-hidden="true">
          <span className={`mentor-banner__float-icon ${toneClass(tone)}`}>{Icon && <Icon />}</span>
          {label}
        </span>
      ))}

      {checklist.length > 0 && (
        <ul className="mentor-banner__checklist" aria-hidden="true">
          {checklist.map((item) => (
            <li key={item}><span><Check /></span>{item}<Check className="mentor-banner__checklist-tick" /></li>
          ))}
        </ul>
      )}

      {actions && <div className="mentor-banner__actions">{actions}</div>}
    </Tag>
  );
}

MentorBanner.propTypes = {
  variant: PropTypes.string,
  image: PropTypes.shape({ src: PropTypes.string, fallbackSrc: PropTypes.string, alt: PropTypes.string }),
  art: PropTypes.node,
  eyebrow: PropTypes.node,
  eyebrowIcon: PropTypes.elementType,
  eyebrowStyle: PropTypes.oneOf(["pill", "bar", "text"]),
  title: PropTypes.node,
  highlight: PropTypes.node,
  lead: PropTypes.node,
  subtitle: PropTypes.node,
  features: PropTypes.arrayOf(PropTypes.shape({
    icon: PropTypes.elementType, title: PropTypes.node, text: PropTypes.node, tone: PropTypes.string,
  })),
  featureShape: PropTypes.oneOf(["circle", "square", "stack", "chip"]),
  script: PropTypes.arrayOf(PropTypes.string),
  quote: PropTypes.arrayOf(PropTypes.string),
  floating: PropTypes.arrayOf(PropTypes.shape({ icon: PropTypes.elementType, label: PropTypes.string, tone: PropTypes.string })),
  checklist: PropTypes.arrayOf(PropTypes.string),
  meta: PropTypes.node,
  actions: PropTypes.node,
  leaves: PropTypes.bool,
  as: PropTypes.elementType,
  leading: PropTypes.node,
  titleAside: PropTypes.node,
  className: PropTypes.string,
};
