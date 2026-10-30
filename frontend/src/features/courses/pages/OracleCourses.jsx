import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import { Swiper, SwiperSlide } from "swiper/react";
import {
  Pagination,
  Autoplay,
} from "swiper/modules";

import {
  FaArrowRight,
  FaUsers,
  FaClock,
} from "react-icons/fa";

import "swiper/css";
import "swiper/css/pagination";

const courses = [
  {
    title: "Oracle Fusion Financials",
    subtitle: "Master ERP & Financial Management",
    duration: "4 Months",
    students: "1200+",
    icon: "💰",
    gradient:
      "from-slate-900 via-blue-900 to-indigo-900",
  },
  {
    title: "Oracle Procurement",
    subtitle: "End-to-End Procurement Process",
    duration: "3 Months",
    students: "950+",
    icon: "🛒",
    gradient:
      "from-cyan-600 via-blue-600 to-blue-900",
  },
  {
    title: "Oracle Cloud PPM",
    subtitle: "Project Portfolio Management",
    duration: "4 Months",
    students: "850+",
    icon: "👨‍💼",
    gradient:
      "from-slate-900 via-indigo-900 to-blue-800",
  },
  {
    title: "Oracle SCM",
    subtitle: "Supply Chain Management",
    duration: "5 Months",
    students: "1500+",
    icon: "🚚",
    gradient:
      "from-black via-slate-900 to-blue-950",
  },
  {
    title: "Oracle HCM",
    subtitle: "Human Capital Management",
    duration: "4 Months",
    students: "1000+",
    icon: "🎓",
    gradient:
      "from-purple-700 via-indigo-700 to-blue-700",
  },
  {
    title: "Oracle ERP Cloud",
    subtitle:
      "Cloud Enterprise Resource Planning",
    duration: "6 Months",
    students: "1800+",
    icon: "☁️",
    gradient:
      "from-cyan-700 via-blue-700 to-indigo-800",
  },
];

function OracleCourses() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  return (
    <section className="relative overflow-hidden py-24 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">

      {/* Glow Effects */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/20 blur-[180px] rounded-full" />

      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/20 blur-[180px] rounded-full" />

      <div className="relative w-full px-6 lg:px-12">

        {/* Header */}
        <div
          className="text-center mb-16"
          data-aos="fade-up"
        >
          <span className="uppercase tracking-[4px] text-cyan-400 font-semibold">
            Oracle Courses
          </span>

          <h2 className="mt-5 text-4xl md:text-6xl font-extrabold text-white">
            Secure
            <span className="text-cyan-400">
              {" "}Your Admission
            </span>
          </h2>

          <p className="mt-5 text-slate-300 max-w-3xl mx-auto text-lg">
            Industry-ready Oracle training programs
            with live projects, expert mentorship,
            certification and placement support.
          </p>
        </div>

        {/* Slider */}
        <Swiper
          modules={[
            Pagination,
            Autoplay,
          ]}
          loop={true}
          speed={5000}
          spaceBetween={30}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          pagination={{
            clickable: true,
          }}
          breakpoints={{
            320: {
              slidesPerView: 1.1,
            },
            640: {
              slidesPerView: 2.1,
            },
            1024: {
              slidesPerView: 3.2,
            },
            1280: {
              slidesPerView: 4.2,
            },
            1536: {
              slidesPerView: 5,
            },
          }}
          className="oracleSwiper"
        >
          {courses.map(
            (course, index) => (
              <SwiperSlide key={index}>
                <div
                  data-aos="zoom-in"
                  data-aos-delay={
                    index * 100
                  }
                  className={`group relative overflow-hidden rounded-[32px] bg-gradient-to-br ${course.gradient}
                  min-h-[540px]
                  p-8
                  shadow-[0_25px_60px_rgba(0,0,0,0.25)]
                  hover:-translate-y-4
                  hover:rotate-[1deg]
                  hover:shadow-[0_40px_100px_rgba(59,130,246,0.35)]
                  transition-all duration-700`}
                >

                  {/* Card Glow */}
                  <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 blur-3xl rounded-full"></div>

                  <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-cyan-400/10 blur-3xl rounded-full"></div>

                  {/* Featured Badge */}
                  <div className="absolute top-5 right-5">
                    <span className="bg-white/10 backdrop-blur-xl text-white px-4 py-2 rounded-full text-xs font-semibold">
                      ⭐ Featured Program
                    </span>
                  </div>

                  {/* Live Badge */}
                  <div className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    🔴 Live Training
                  </div>

                  {/* Icon */}
                  <div className="flex justify-center mt-12">
                    <div className="text-8xl">
                      {course.icon}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mt-10">
                    <h3 className="text-3xl font-bold text-white leading-tight">
                      {course.title}
                    </h3>

                    <p className="mt-4 text-slate-200 leading-relaxed">
                      {course.subtitle}
                    </p>

                    <div className="flex flex-wrap gap-3 mt-8">

                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-white">
                        <FaClock />
                        <span>
                          {
                            course.duration
                          }
                        </span>
                      </div>

                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-white">
                        <FaUsers />
                        <span>
                          {
                            course.students
                          }
                        </span>
                      </div>

                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    className="
                    absolute
                    bottom-8
                    left-8
                    right-8
                    flex
                    items-center
                    justify-center
                    gap-3
                    bg-white
                    text-slate-900
                    py-4
                    rounded-2xl
                    font-bold
                    shadow-lg
                    hover:bg-cyan-400
                    hover:text-white
                    hover:scale-[1.02]
                    transition-all duration-300"
                  >
                    Explore Program

                    <FaArrowRight />
                  </button>

                </div>
              </SwiperSlide>
            )
          )}
        </Swiper>

      </div>
    </section>
  );
}

export default OracleCourses;