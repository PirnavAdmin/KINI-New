import { motion } from "framer-motion";

const LIVE_CLASS_IMAGE =
  "https://i.pinimg.com/1200x/ad/40/41/ad404119fbb9f67bd7e48ddd56d2dc68.jpg";

/* =========================================================
   LIVE CLASS IMAGE
   ========================================================= */
function HeroIllustration() {
  return (
    <div
      aria-hidden="true"
      className="
        relative
        hidden
        h-[160px]
        w-full
        max-w-[440px]
        shrink-0
        items-center
        justify-center
        overflow-hidden
        rounded-[24px]
        bg-[#DDEEFF]
        ring-1
        ring-[#C8DDF8]
        shadow-[0_8px_24px_rgba(30,91,160,.12)]
        xl:flex
      "
    >
      {/* Image */}
      <img
        src={LIVE_CLASS_IMAGE}
        alt=""
        draggable="false"
        className="h-[160px] w-full max-w-[440px] select-none object-cover object-center"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#EAF4FF]/10 via-transparent to-[#EAF4FF]/20" />
    </div>
  );
}

/* =========================================================
   LIVE CLASSES HERO
   ========================================================= */
export default function LiveClassesHero({
  title,
  subtitle,
  icon: Icon,
  tagline,
  actions,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="
        relative
        w-full
        overflow-hidden
        rounded-[16px]
        border
        border-[#E2EAF4]
        bg-gradient-to-r
        from-white
        via-[#F7FBFF]
        to-[#EAF4FF]
        shadow-[0_4px_18px_rgba(38,83,130,0.045)]
        dark:border-slate-700
        dark:from-slate-900
        dark:via-slate-900
        dark:to-slate-800
      "
    >
      {/* =====================================================
          BACKGROUND DECORATION
      ===================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          right-0
          top-0
          h-full
          w-[55%]
          bg-[radial-gradient(
            ellipse_at_65%_50%,
            rgba(8,119,249,0.09),
            rgba(243,153,36,0.035)_42%,
            transparent_72%
          )]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-20
          -top-28
          h-64
          w-64
          rounded-full
          bg-[#DDEEFF]/45
          blur-3xl
        "
      />

      {/* =====================================================
          MAIN HERO CONTENT
      ===================================================== */}

      <div
        className="
          relative
          grid
          min-h-[150px]
          grid-cols-1
          items-center
          gap-4
          px-4
          py-4

          sm:px-5

        xl:grid-cols-[minmax(320px,1fr)_minmax(320px,400px)_minmax(360px,0.95fr)]
          xl:gap-2
          xl:px-6
          xl:py-2
        "
      >
        {/* =================================================
            LEFT — ICON + TITLE
        ================================================= */}

        <div
          className="
            flex
            min-w-0
            items-center
            gap-4
          "
        >
          {Icon && (
            <span
              aria-hidden="true"
              className="
                grid
                h-[68px]
                w-[68px]
                shrink-0
                place-items-center
                rounded-[20px]
                bg-[#E5F1FF]
                text-[#0877F9]
                ring-1
                ring-[#D3E4FB]
                shadow-[0_4px_12px_rgba(8,119,249,0.05)]
                dark:bg-slate-800
                dark:text-sky-300
                dark:ring-slate-700
              "
            >
              <Icon
                className="h-[35px] w-[35px]"
                strokeWidth={1.75}
              />
            </span>
          )}

          <div className="min-w-0">
            <h1
              className="
                whitespace-nowrap
                text-[28px]
                font-bold
                leading-none
                tracking-[-0.025em]
                !text-[#102D50]
                sm:text-[30px]
                dark:!text-white
              "
            >
              {title}
            </h1>

            <p
              className="
                mt-2
                max-w-[500px]
                text-[15px]
                leading-[1.45]
                !text-[#5B78A0]
                dark:!text-slate-400
              "
            >
              {subtitle}
            </p>
          </div>
        </div>

        {/* =================================================
            CENTER — LIVE CLASS IMAGE
        ================================================= */}

        <HeroIllustration />

        {/* =================================================
            RIGHT — TAGLINE + ACTIONS
        ================================================= */}

        <div
          className="
            flex
            min-w-0
            shrink-0
            flex-col
            items-end
            justify-center
            gap-3
            xl:pr-0
          "
        >
          {/* TAGLINE */}

          {tagline && (
            <div
              className="
                hidden
                text-right
                min-[1180px]:block
              "
            >
              <p
                aria-hidden="true"
                className="
                  whitespace-nowrap
                  text-[22px]
                  leading-none
                  text-[#0877F9]
                "
                style={{
                  fontFamily:
                    '"Instrument Serif", Georgia, serif',
                  fontStyle: "italic",
                }}
              >
                {tagline}
              </p>

              <span
                aria-hidden="true"
                className="
                  ml-auto
                  mt-[7px]
                  block
                  h-[3px]
                  w-[185px]
                  rounded-full
                  bg-[#FE8204]
                "
              />
            </div>
          )}

          {/* ACTION BUTTONS */}

          {actions && (
          <div
            className="
              flex
                flex-nowrap
                items-center
                justify-end
                gap-2
              "
            >
              {actions}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
