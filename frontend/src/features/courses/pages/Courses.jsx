import { useCallback, useEffect, useMemo, useState } from "react";
import { normalizeCourse } from "@/services/courseService";
import { courseService, publicCatalogueErrorMessage } from "@shared/services/courseService";

import Navbar from "@shared/components/Navbar";
import Footer from "@shared/components/Footer";
import CourseCard from "@features/courses/components/common/CourseCard";
import CourseCardSkeleton from "@shared/components/CourseCardSkeleton";

import AOS from "aos";
import "aos/dist/aos.css";

import { FaSearch } from "react-icons/fa";

// Price comes only from the API; courses without one cannot be added to the cart.
const withCartPrice = (course) => {
  const price = Number(course.price ?? course.fee ?? course.courseFee);
  return { ...course, price: Number.isFinite(price) && price > 0 ? price : undefined };
};

function Courses() {

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Public catalogue: published courses from every organization, no login needed.
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await courseService.getPublicCourses();
      setCourses((result?.data || []).map(normalizeCourse).map(withCartPrice));
    } catch (requestError) {
      setCourses([]);
      setError(publicCatalogueErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {

    AOS.init({
      duration: 1000,
      once: true,
      easing: "ease-in-out",
    });

    const requestTimer = window.setTimeout(() => { fetchCourses(); }, 0);
    return () => window.clearTimeout(requestTimer);

  }, [fetchCourses]);

  const categoryOf = (course) => course.category || course.level;
  const categories = ["All", ...new Set(courses.map(categoryOf).filter(Boolean))];

  const filterCourses = (category) => {

    setActiveCategory(category);

  };

  const filteredCourses = useMemo(() => {
    let filtered = courses;

    if (activeCategory !== "All") {

      filtered = filtered.filter(
        (course) =>
          categoryOf(course) === activeCategory
      );
    }

    filtered = filtered.filter((course) =>
      course.title.toLowerCase().includes(
        search.toLowerCase()
      )
    );

    return filtered;
  }, [search, activeCategory, courses]);

  return (
    <>
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">

        <div className="absolute top-0 left-0 w-80 h-80 bg-cyan-500/20 blur-3xl rounded-full"></div>

        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/20 blur-3xl rounded-full"></div>

        <div className="relative max-w-7xl mx-auto px-5 py-12 md:py-16 lg:py-20 text-center">

          <div
            data-aos="fade-down"
            className="inline-flex items-center gap-2 bg-white/10 border border-white/10 backdrop-blur-xl px-5 py-2 rounded-full mb-6"
          >

            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>

            <span className="text-sm font-medium">
              100+ Premium Courses
            </span>

          </div>

          <h1
            data-aos="zoom-in"
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6"
          >

            Explore Your

            <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">

              Dream Career

            </span>

          </h1>

          <p
            data-aos="fade-up"
            data-aos-delay="200"
            className="text-lg text-gray-300 max-w-3xl mx-auto"
          >

            Learn React JS, MERN Stack, Python,
            Artificial Intelligence, Cloud Computing,
            Cyber Security and more from industry experts.

          </p>

        </div>

      </section>

      {/* COURSES SECTION */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-12 md:py-16 lg:py-20">

        <div className="max-w-7xl mx-auto px-5">

          {/* SEARCH */}
          <div
            data-aos="fade-up"
            className="relative mb-10"
          >

            <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              placeholder="Search Courses..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full pl-14 pr-5 py-4 rounded-2xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

          {/* CATEGORIES */}
          <div
            data-aos="fade-up"
            className="flex flex-wrap gap-4 mb-14"
          >

            {categories.map((category) => (

              <button
                key={category}
                onClick={() =>
                  filterCourses(category)
                }
                className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                  activeCategory === category
                    ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg"
                    : "bg-white border border-gray-200 text-gray-700 hover:border-blue-500"
                }`}
              >

                {category}

              </button>

            ))}

          </div>

          {/* HEADER */}
          <div
            data-aos="fade-up"
            className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4"
          >

            <div>

              <h2 className="text-4xl font-extrabold text-gray-900">

                Courses Available

              </h2>

              <p className="text-gray-500 mt-2">

                Find the perfect course for your career growth

              </p>

            </div>

            <div className="bg-blue-100 text-blue-700 px-5 py-3 rounded-full font-bold">

              {filteredCourses.length} Courses

            </div>

          </div>

          {/* COURSES GRID */}
          {loading ? (

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">

              {[...Array(6)].map((_, index) => (

                <CourseCardSkeleton
                  key={index}
                />

              ))}

            </div>

          ) : error ? (

            <div role="alert" className="rounded-3xl border border-red-100 bg-red-50 px-6 py-12 text-center">
              <p className="text-lg font-semibold text-red-700">{error}</p>
              <button
                type="button"
                onClick={fetchCourses}
                className="mt-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-3 font-semibold text-white"
              >
                Try again
              </button>
            </div>

          ) : filteredCourses.length === 0 ? (

            <div className="rounded-3xl border border-gray-200 bg-white px-6 py-12 text-center text-gray-600">
              {courses.length === 0
                ? "No courses are open for enrolment right now. Please check back soon."
                : "No courses match your search."}
            </div>

          ) : (

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">

              {filteredCourses.map(
                (course, index) => (

                  <div
                    key={course.id}
                    data-aos="fade-up"
                    data-aos-delay={
                      index * 100
                    }
                  >

                    <CourseCard
                      course={{
                        id: course.id,
                        title: course.title,
                        instructor: course.instructor || course.organizationName || course.level,
                        image: course.thumbnail,
                        students: course.students || 0,
                        price: course.price,
                        duration: course.duration,
                        level: course.level,
                      }}
                    />

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </section>

      <Footer />
    </>
  );
}

export default Courses;
