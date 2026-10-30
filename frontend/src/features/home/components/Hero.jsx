import { motion } from "framer-motion";
import { GraduationCap, Users, Award, Sparkles, ArrowRight, Play } from "lucide-react";

const originalStudentHero =
  "https://i.pinimg.com/736x/1f/7b/2d/1f7b2d383bb7dbe374203379b1ffc887.jpg";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#F8FAFC]">
      {/* Background glow */}
      <div className="absolute inset-0">
        <div
          className="absolute top-0 left-0 w-[500px] h-[500px]
        rounded-full bg-[#085FA7]/10 blur-[120px]"
        />

        <div
          className="absolute right-0 bottom-0 w-[500px] h-[500px]
        rounded-full bg-[#5CA347]/10 blur-[120px]"
        />
      </div>

      <div className="mx-auto grid min-h-[calc(100svh-72px)] w-full max-w-[1580px] grid-cols-1 items-center gap-6 px-6 py-6 sm:px-8 lg:grid-cols-2 lg:px-12 lg:py-5 xl:px-16">
        {/* LEFT */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#EDF4FC] px-4 py-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-[#085FA7] animate-pulse" />
            Future Ready Learning Platform
          </span>

          <h1 className="mt-4 text-[clamp(2.75rem,8vh,4.5rem)] font-black leading-[1.02] tracking-[-0.03em]">
            Empowering
            <br />
            <span
              className="bg-gradient-to-r
            from-[#085FA7]
            to-[#5CA347]
            bg-clip-text
            text-transparent"
            >
              Minds.
            </span>
            <br />
            Building{" "}
            <span className="text-[#5CA347]">Futures.</span>
          </h1>

          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 xl:text-lg">
            Master industry skills with live training, projects, mentorship and
            placement assistance.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/upskill-program"
              className="px-7 py-3 rounded-xl
            bg-gradient-to-r
            from-[#085FA7]
            to-[#5CA347]
            text-white font-semibold
            transition-all duration-300
            hover:shadow-lg hover:shadow-[#085FA7]/30
            hover:scale-[1.02] active:scale-[0.98]
            inline-flex items-center gap-2"
            >
              Explore Programs
              <ArrowRight className="w-4 h-4" />
            </a>

            <button 
              onClick={() => window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank')}
              className="px-8 py-3 rounded-xl border border-[#085FA7]/20 
              bg-white hover:bg-[#085FA7]/5 
              transition-all duration-300
              hover:shadow-md hover:border-[#085FA7]/40
              inline-flex items-center gap-2
              text-[#085FA7] font-semibold"
            >
              <Play className="w-4 h-4" />
              Watch Demo
            </button>
          </div>
        </div>

        {/* IMAGE */}
        <div className="relative flex justify-center">
          {/* glow */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
            }}
            className="absolute h-[min(44vw,64vh,560px)]
            w-[min(44vw,64vh,560px)]
            rounded-full
            bg-gradient-to-r
            from-[#085FA7]/20
            to-[#5CA347]/20
            blur-3xl"
          />

          {/* pulse */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
            }}
            className="absolute
            h-[min(40vw,58vh,520px)]
            w-[min(40vw,58vh,520px)]
            rounded-full
            border
            border-[#085FA7]/20"
          />

          {/* image */}
          <motion.div
            whileHover={{
              scale: 1.03,
            }}
            className="relative"
          >
            <img
              src={originalStudentHero}
              alt="Student learning"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="h-[min(40vw,58vh,520px)]
              w-[min(40vw,58vh,520px)]
              object-cover
              rounded-full
              shadow-[0_40px_80px_rgba(0,0,0,.15)]"
            />
          </motion.div>

          {/* placement */}
          <motion.div
            animate={{
              y: [0, -12, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
            }}
            className="absolute
            top-12
            left-0
            backdrop-blur-xl
            bg-white/80
            rounded-3xl
            p-2
            shadow-xl
            cursor-pointer
            hover:scale-105 transition-transform"
            onClick={() => window.location.href = '/placement'}
          >
            <div className="flex gap-4">
              <div
                className="w-12 h-12 rounded-full
              bg-[#EDF4FC]
              flex items-center justify-center"
              >
                <Award className="text-[#085FA7]" />
              </div>

              <div>
                <h3 className="font-bold text-xl">96%</h3>

                <p className="text-sm text-slate-600">Placement Rate</p>
              </div>
            </div>
          </motion.div>

          {/* students */}
          <motion.div
            animate={{
              y: [0, 12, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
            }}
            className="absolute
            top-24
            right-0
            bg-white/80
            backdrop-blur-xl
            rounded-3xl
            p-2
            shadow-xl
            cursor-pointer
            hover:scale-105 transition-transform"
            onClick={() => window.location.href = '/students'}
          >
            <div className="flex gap-4">
              <div
                className="w-12 h-12 rounded-full
              bg-[#5CA347]/10
              flex items-center justify-center"
              >
                <Users className="text-[#5CA347]" />
              </div>

              <div>
                <h3 className="font-bold text-xl">15K+</h3>

                <p className="text-sm text-slate-600">Students</p>
              </div>
            </div>
          </motion.div>

          {/* mentors */}
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
            }}
            className="absolute
            bottom-20
            left-6
            bg-white/80
            backdrop-blur-xl
            rounded-3xl
            p-2
            shadow-xl
            cursor-pointer
            hover:scale-105 transition-transform"
            onClick={() => window.location.href = '/mentors'}
          >
            <div className="flex gap-4">
              <div
                className="w-12 h-12 rounded-full
              bg-[#085FA7]/10
              flex items-center justify-center"
              >
                <GraduationCap className="text-[#085FA7]" />
              </div>

              <div>
                <h3 className="font-bold text-xl">500+</h3>

                <p className="text-sm text-slate-600">Mentors</p>
              </div>
            </div>
          </motion.div>

          {/* spark */}
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute
            -top-4
            right-20"
          >
            <Sparkles size={34} className="text-[#085FA7]" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
