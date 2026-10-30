import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "@shared/components/Navbar";
import Footer from "@shared/components/Footer";
import coursesData from "@shared/data/coursesData";

import { FaHeart, FaTrash } from "react-icons/fa";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);

  // Load wishlist
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(stored);
  }, []);

  // Filter courses
  const wishlistCourses = coursesData.filter((course) =>
    wishlist.includes(course.id)
  );

  // Remove item
  const removeFromWishlist = (id) => {
    const updated = wishlist.filter((item) => item !== id);
    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
  };

  return (
    <>
      <Navbar />

      <section className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-5">

          {/* Title */}
          <h1 className="text-4xl font-extrabold text-gray-900 mb-10">
            My Wishlist ❤️
          </h1>

          {/* Empty State */}
          {wishlistCourses.length === 0 ? (
            <div className="text-center py-20">
              <FaHeart className="text-6xl text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-700 mb-3">
                Your wishlist is empty
              </h2>
              <p className="text-gray-500 mb-6">
                Browse courses and add them to your wishlist
              </p>
              <Link
                to="/courses"
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
              >
                Explore Courses
              </Link>
            </div>
          ) : (
            /* Grid */
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

              {wishlistCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-3xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden"
                >

                  {/* Image */}
                  <img
                    src={course.image}
                    alt={course.title}
                    className="h-52 w-full object-cover"
                  />

                  {/* Content */}
                  <div className="p-6">

                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {course.title}
                    </h3>

                    <p className="text-gray-500 text-sm mb-4">
                      {course.students}+ students
                    </p>

                    {/* Actions */}
                    <div className="flex justify-between items-center">

                      <Link
                        to={`/course/${course.id}`}
                        className="text-blue-600 font-semibold hover:underline"
                      >
                        View Details →
                      </Link>

                      <button
                        onClick={() => removeFromWishlist(course.id)}
                        className="flex items-center gap-2 text-red-500 hover:text-red-600 transition"
                      >
                        <FaTrash />
                        Remove
                      </button>

                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Wishlist;