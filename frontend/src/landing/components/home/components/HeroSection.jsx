import { motion } from "framer-motion";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";

import {
  ArrowRight,
  Play,
  Sparkles,
  BookOpen,
  Users,
  Award,
} from "lucide-react";

const floatingCards = [
  {
    icon: BookOpen,
    label: "Live Cohorts",
    value: "3 sessions/week",
    position: "left-8 top-36",
    delay: 3,
  },
  {
    icon: Users,
    label: "Placement Assistance",
    value: "Until hired",
    position: "right-8 top-48",
    delay: 4,
  },
  {
    icon: Award,
    label: "Certification",
    value: "Industry recognized",
    position: "left-12 bottom-48",
    delay: 5,
  },
];

const stats = [
  {
    value: 20000,
    suffix: "+",
    label: "Students Trained",
  },
  {
    value: 2200,
    suffix: "+",
    label: "Placed",
  },
  {
    value: 95,
    suffix: "%",
    label: "Success Rate",
  },
  {
    value: 50,
    suffix: "+",
    label: "Expert Mentors",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },

  visible: {
    opacity: 1,

    transition: {
      staggerChildren: 0.12,

      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,

    y: 24,
  },

  visible: {
    opacity: 1,

    y: 0,

    transition: {
      duration: 0.6,

      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function HeroSection({ onOpenEnquiry }) {
  const { ref, inView } = useInView({
    triggerOnce: true,

    threshold: 0.3,
  });

  return (
    <section className="gradient-hero relative overflow-hidden pt-14 sm:pt-[72px] lg:pt-20 pb-24">

      {/* Background Elements */}

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(8,95,167,0.4) 1px, transparent 1px),linear-gradient(90deg, rgba(8,95,167,0.4) 1px, transparent 1px)",

          backgroundSize: "56px 56px",
        }}
      />

      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[150px]" />

      <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-accent/10 blur-[150px]" />

      <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/10 blur-[120px]" />

      {/* Floating Cards */}

      {floatingCards.map((card) => (
        <motion.div
          key={card.label}
          animate={{
            y: [0, -10, 0],

            rotate: [-1, 1, -1],
          }}
          transition={{
            duration: card.delay,

            repeat: Infinity,

            ease: "easeInOut",
          }}
          className={`absolute ${card.position} hidden lg:block rounded-2xl border border-border bg-card-bg/80 px-5 py-4 backdrop-blur-xl shadow-glass`}
        >
          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">

              <card.icon className="h-4 w-4 text-primary" />

            </div>

            <div>

              <p className="text-label text-text-muted">

                {card.label}

              </p>

              <p className="font-bold text-text-primary">

                {card.value}

              </p>

            </div>

          </div>

        </motion.div>
      ))}

      {/* Main Content */}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto max-w-7xl px-6"
      >

        <div className="mx-auto max-w-[760px] text-center">

          {/* Badge */}

          <motion.div variants={itemVariants}>

            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-bold text-primary">

              <Sparkles className="h-3 w-3" />

              India's #1 Career-First Tech Platform

            </span>

          </motion.div>

          {/* Heading */}

          <motion.h1
            variants={itemVariants}
            className="mt-6 text-display-lg font-black tracking-tight"
          >
            Go from Coder to{" "}

            <span className="gradient-text">

              Employed Engineer

            </span>{" "}

            in 6 Months.

          </motion.h1>

          {/* Description */}

          <motion.p
            variants={itemVariants}
            className="mx-auto mt-6 max-w-[600px] text-body-lg text-text-secondary"
          >
            Live training, 1:1 mentorship from industry experts,
            and placement assistance that doesn't stop until you're hired.
          </motion.p>

          {/* CTA */}

          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-col gap-4 sm:flex-row justify-center"
          >

            <button
              onClick={onOpenEnquiry}
              className="group rounded-xl bg-button-primary-bg px-6 py-3.5 font-bold text-button-primary-text shadow-glow-primary"
            >

              <span className="flex items-center gap-2">

                Book Free Consultation

                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />

              </span>

            </button>

            <a
              href="#stories"
              className="rounded-xl border border-primary/20 px-6 py-3.5 font-bold"
            >

              <span className="flex items-center gap-2">

                <Play className="h-4 w-4 text-primary" />

                Watch Free Class

              </span>

            </a>

          </motion.div>

          {/* Trust */}

          <motion.p
            variants={itemVariants}
            className="mt-4 text-sm text-text-muted"
          >

            No commitment required · 24hr response · Free consultation

          </motion.p>

          {/* Stats */}

          <motion.div
            ref={ref}
            variants={itemVariants}
            className="mx-auto mt-16 max-w-[700px]"
          >

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-border bg-border">

              {stats.map((stat) => (

                <motion.div
                  key={stat.label}
                  whileHover={{
                    y: -4,

                    scale: 1.03,
                  }}
                  className="bg-card-bg px-4 py-6 text-center"
                >

                  <p className="gradient-text text-display-md font-black">

                    {inView && (

                      <CountUp
                        end={stat.value}
                        duration={2.5}
                        separator=","
                        suffix={stat.suffix}
                      />

                    )}

                  </p>

                  <p className="mt-2 text-sm font-semibold text-text-muted">

                    {stat.label}

                  </p>

                </motion.div>

              ))}

            </div>

          </motion.div>

        </div>

      </motion.div>

    </section>
  );
}