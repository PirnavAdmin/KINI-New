import { memo, useMemo } from "react";
import { FaStar, FaQuoteRight } from "react-icons/fa";
import { useThemeContext } from "@landing-shared/context/ThemeContext";
import Section from "@landing-shared/components/ui/Section";
import SectionHeader from "@landing-shared/components/ui/SectionHeader";

// Telugu testimonials data
const teluguTestimonials = [
  {
    name: "Sravani Reddy",
    role: "Software Engineer",
    text: "This program completely transformed my career. I went from a non-IT background to landing a job at a top product company in just 6 months.",
    rating: 5,
  },
  {
    name: "Vamsi Krishna",
    role: "Full Stack Developer",
    text: "The live mentorship and project-based learning were game-changers. I built a portfolio that impressed recruiters and got me multiple offers.",
    rating: 5,
  },
  {
    name: "Keerthana Rao",
    role: "Data Analyst",
    text: "I was hesitant to start, but the structured curriculum and supportive community made all the difference. I'm now working as a data analyst at a leading firm.",
    rating: 4.9,
  },
  {
    name: "Naveen Kumar",
    role: "UI/UX Designer",
    text: "The hands-on projects and mock interviews prepared me so well that I aced my first interview. Truly a life-changing experience!",
    rating: 5,
  },
  {
    name: "Harika Varma",
    role: "Product Manager",
    text: "The career guidance and placement assistance were top-notch. I got a role as a product manager within a month of completing the program.",
    rating: 4.8,
  },
  {
    name: "Sai Kiran",
    role: "DevOps Engineer",
    text: "I was able to transition from support to a DevOps role thanks to the practical skills I learned. Highly recommended!",
    rating: 4.9,
  },
];

function ReviewCard({ item, isDark }) {
  return (
    <article
      className={`
        group relative flex h-full flex-col rounded-card border p-5
        backdrop-blur-xl transition-all duration-300
        hover:-translate-y-2
        ${
          isDark
            ? "border-white/10 bg-white/[0.04] hover:border-primary-500/20 hover:shadow-[0_16px_48px_rgba(8,95,167,0.12)]"
            : "border-ink-900/[0.06] bg-white/90 shadow-sm hover:border-primary-500/20 hover:shadow-[0_16px_48px_rgba(8,95,167,0.08)]"
        }
      `}
    >
      {/* Decorative glow */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute -right-16 -top-16
          h-32 w-32 rounded-full
          bg-primary-500/10 opacity-0 blur-2xl
          transition-opacity duration-300
          group-hover:opacity-100
        "
      />

      {/* Rating + Quote */}
      <div className="mb-4 flex items-center justify-between">
        <div
          className="flex items-center gap-1"
          aria-label={`${item.rating} out of 5 stars`}
        >
          {[0, 1, 2, 3, 4].map((star) => (
            <FaStar
              key={star}
              aria-hidden="true"
              className={`
                text-xs
                ${
                  star < Math.floor(item.rating)
                    ? "text-amber-400"
                    : isDark
                      ? "text-white/15"
                      : "text-ink-900/15"
                }
              `}
            />
          ))}
        </div>

        <FaQuoteRight
          aria-hidden="true"
          className="
            text-2xl text-primary-500/10
            transition-all duration-300
            group-hover:text-primary-500/20
          "
        />
      </div>

      {/* Testimonial */}
      <p
        className={`
          mb-4 flex-1 overflow-hidden text-xs leading-6
          line-clamp-4
          ${isDark ? "text-white/70" : "text-ink-900/60"}
        `}
      >
        &ldquo;{item.text}&rdquo;
      </p>

      {/* Divider */}
      <div className="mb-4 h-px w-full bg-gradient-to-r from-primary-500/20 via-secondary-500/10 to-transparent" />

      {/* Student information */}
      <div className="flex min-w-0 items-center">
        <div className="min-w-0">
          <h3
            className={`
              truncate font-display text-sm font-bold
              transition-colors duration-200
              ${
                isDark
                  ? "text-white group-hover:text-primary-400"
                  : "text-ink-900 group-hover:text-primary-500"
              }
            `}
          >
            {item.name}
          </h3>

          <p
            className={`
              truncate text-xs
              ${isDark ? "text-white/40" : "text-ink-900/40"}
            `}
          >
            {item.role}
          </p>
        </div>
      </div>
    </article>
  );
}

const Testimonials = memo(function Testimonials() {
  const { isDark } = useThemeContext();

  // Duplicate testimonials for seamless marquee animation
  const doubled = useMemo(
    () => [...teluguTestimonials, ...teluguTestimonials],
    []
  );

  return (
    <Section
      className={isDark ? "bg-app-dark-gradient" : "bg-white"}
      decoration={
        <>
          {/* Primary glow */}
          <div
            aria-hidden="true"
            className="
              absolute left-1/2 top-0
              h-[350px] w-[700px]
              -translate-x-1/2
              rounded-full
              bg-primary-500/[0.06]
              blur-[160px]
              dark:bg-primary-500/[0.07]
            "
          />

          {/* Secondary glow */}
          <div
            aria-hidden="true"
            className="
              absolute bottom-0 right-0
              h-[400px] w-[400px]
              rounded-full
              bg-secondary-500/[0.06]
              blur-[160px]
              dark:bg-secondary-500/[0.07]
            "
          />

          {/* Grid background */}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              backgroundSize: "60px 60px",
              backgroundImage: isDark
                ? `
                  linear-gradient(
                    to right,
                    rgba(255,255,255,0.03) 1px,
                    transparent 1px
                  ),
                  linear-gradient(
                    to bottom,
                    rgba(255,255,255,0.03) 1px,
                    transparent 1px
                  )
                `
                : `
                  linear-gradient(
                    to right,
                    rgba(0,0,0,0.03) 1px,
                    transparent 1px
                  ),
                  linear-gradient(
                    to bottom,
                    rgba(0,0,0,0.03) 1px,
                    transparent 1px
                  )
                `,
            }}
          />
        </>
      }
    >
      <SectionHeader
        eyebrowIcon={FaStar}
        eyebrow="Student Testimonials"
        heading={
          <>
            What Our{" "}
            <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              Students Say
            </span>
          </>
        }
        subheading="Real stories from real students who transformed their careers through our programs."
      />

      {/* Auto-scrolling testimonial marquee */}
      <div className="mt-6 w-full overflow-hidden">
        <div
          className="
            flex w-max gap-5
            animate-[testimonial-marquee_30s_linear_infinite]
            hover:[animation-play-state:paused]
            focus-within:[animation-play-state:paused]
            motion-reduce:animate-none
          "
        >
          {doubled.map((item, index) => (
            <div
              key={`${item.name}-${index}`}
              className="
                w-[280px]
                flex-shrink-0
                sm:w-[300px]
                md:w-[320px]
              "
            >
              <ReviewCard item={item} isDark={isDark} />
            </div>
          ))}
        </div>
      </div>

      {/* Marquee animation */}
      <style>{`
        @keyframes testimonial-marquee {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .testimonial-marquee {
            animation: none;
          }
        }
      `}</style>
    </Section>
  );
});

export default Testimonials;