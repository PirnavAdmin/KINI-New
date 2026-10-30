import { useState } from "react";
import PropTypes from "prop-types";

/**
 * Global hero banner for Student pages (v13).
 * Left: eyebrow pill, title with orange highlight, description, feature chips.
 * Right: artwork from public/assets/StudentBanners (fades into the banner).
 */
export default function StudentPageBanner({
  banner,
  icon: EyebrowIcon,
  eyebrow,
  title,
  highlight,
  highlightBreak = false,
  description,
  features = [],
  featuresVariant = "inline",
  className = "",
}) {
  const [artFailed, setArtFailed] = useState(false);
  const showArt = Boolean(banner?.src) && !artFailed;

  return (
    <section className={`ksl-banner ${className}`} data-ui="student-page-banner">
      <span className="ksl-banner__blob" aria-hidden="true" />
      {showArt && (
        <img
          src={banner.src}
          alt={banner.alt || ""}
          className="ksl-banner__art"
          style={{ objectPosition: banner.position || "right center" }}
          onError={() => setArtFailed(true)}
          draggable={false}
          decoding="async"
        />
      )}
      <div className="ksl-banner__copy">
        {eyebrow && (
          <p className="ksl-banner__eyebrow">
            {EyebrowIcon && <EyebrowIcon aria-hidden="true" />}
            {eyebrow}
          </p>
        )}
        <h1 className="ksl-banner__title">
          {title}
          {highlight && (
            <>
              {highlightBreak ? <br /> : " "}
              <span className="ksl-banner__highlight">{highlight}</span>
            </>
          )}
        </h1>
        {description && <p className="ksl-banner__text">{description}</p>}
        {features.length > 0 && (
          <ul className={`ksl-banner__features ksl-banner__features--${featuresVariant}`}>
            {features.map(({ Icon, title: featureTitle, text, tone = "blue" }) => (
              <li key={featureTitle} className="ksl-banner__feature">
                <span className={`ksl-banner__feature-icon ksl-tone--${tone}`}>{Icon && <Icon aria-hidden="true" />}</span>
                <span className="ksl-banner__feature-text">
                  <strong>{featureTitle}</strong>
                  {text && <small>{text}</small>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

StudentPageBanner.propTypes = {
  banner: PropTypes.shape({
    src: PropTypes.string,
    alt: PropTypes.string,
    position: PropTypes.string,
  }),
  icon: PropTypes.elementType,
  eyebrow: PropTypes.string,
  title: PropTypes.node,
  highlight: PropTypes.node,
  highlightBreak: PropTypes.bool,
  description: PropTypes.node,
  features: PropTypes.arrayOf(PropTypes.shape({
    Icon: PropTypes.elementType,
    title: PropTypes.string.isRequired,
    text: PropTypes.string,
    tone: PropTypes.string,
  })),
  featuresVariant: PropTypes.oneOf(["inline", "divided", "stacked"]),
  className: PropTypes.string,
};
