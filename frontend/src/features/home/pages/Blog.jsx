import Navbar from "@shared/components/Navbar";
import Footer from "@shared/components/Footer";

import {
  FaClock,
  FaArrowRight,
  FaFire,
} from "react-icons/fa";
import { useThemeContext } from "@shared/context/ThemeContext";

const blogs = [
  {
    id: 1,
    title:
      "Top 10 React Trends Every Developer Should Know in 2026",
    category: "React JS",
    readTime: "5 Min Read",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
  },
  {
    id: 2,
    title:
      "How AI is Transforming Software Development",
    category: "Artificial Intelligence",
    readTime: "7 Min Read",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995",
  },
  {
    id: 3,
    title:
      "Complete Roadmap To Become MERN Stack Developer",
    category: "Career",
    readTime: "8 Min Read",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
  },
  {
    id: 4,
    title:
      "Master Python For AI & Machine Learning",
    category: "Python",
    readTime: "6 Min Read",
    image:
      "https://images.unsplash.com/photo-1526379095098-d400fd0bf935",
  },
];

function Blog() {
  const { isDark } = useThemeContext();
  return (
    <>
      <Navbar />

      <section className="bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white pt-32 pb-24">

        <div className="max-w-7xl mx-auto px-5">

          {/* Hero */}
          <div className="text-center mb-20">

            <span className="uppercase tracking-[4px] text-cyan-400 font-semibold">
              Knowledge Hub
            </span>

            <h1 className="text-5xl md:text-7xl font-extrabold mt-5 leading-tight">
              Insights, Trends &
              <span className="text-cyan-400">
                {" "}Tech Blogs
              </span>
            </h1>

            <p className="max-w-3xl mx-auto text-slate-300 mt-6 text-lg">
              Explore expert articles on React,
              AI, Python, Data Science, Career
              Growth and Emerging Technologies.
            </p>

          </div>

          {/* Featured Blog */}
          <div className="grid lg:grid-cols-2 gap-10 items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] overflow-hidden mb-20">

            <img
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3"
              alt=""
              className="h-full min-h-[350px] object-cover"
            />

            <div className="p-10">

              <span className="inline-flex items-center gap-2 bg-red-500 px-4 py-2 rounded-full text-sm font-semibold">

                <FaFire />

                Featured Article

              </span>

              <h2 className="text-4xl font-bold mt-6 leading-tight">

                Complete React Developer Roadmap For 2026

              </h2>

              <p className="text-slate-300 mt-5 text-lg">

                Learn the exact roadmap to become a
                highly paid React Developer with
                modern tools, projects, TypeScript,
                Next.js and AI integration.

              </p>

              <button className="mt-8 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-8 py-4 rounded-2xl transition">

                Read Article

              </button>

            </div>

          </div>

        </div>
      </section>

      {/* Latest Blogs */}
      <section className="py-24 bg-slate-50">

        <div className="max-w-7xl mx-auto px-5">

          <div className="flex items-center justify-between mb-12">

            <h2 className="text-4xl font-bold text-slate-900">

              Latest Articles

            </h2>

            <button className="text-blue-600 font-semibold">

              View All

            </button>

          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">

            {blogs.map((blog) => (

              <div
                key={blog.id}
                className="group bg-white rounded-[28px] overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-3 transition-all duration-500"
              >

                <div className="overflow-hidden">

                  <img
                    src={blog.image}
                    alt=""
                    className="h-56 w-full object-cover group-hover:scale-110 transition duration-700"
                  />

                </div>

                <div className="p-6">

                  <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">

                    {blog.category}

                  </span>

                  <h3 className="text-xl font-bold text-slate-900 mt-4 leading-snug">

                    {blog.title}

                  </h3>

                  <div className="flex items-center justify-between mt-6">

                    <span className="flex items-center gap-2 text-gray-500 text-sm">

                      <FaClock />

                      {blog.readTime}

                    </span>

                    <button className="text-blue-600 flex items-center gap-2 font-semibold">

                      Read

                      <FaArrowRight />

                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>
      </section>

      {/* Newsletter */}
      <section className={`py-24 transition-colors duration-300 ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-900'}`}>

        <div className="max-w-4xl mx-auto px-5 text-center">

          <h2 className="text-5xl font-bold">

            Stay Updated

          </h2>

          <p className="text-slate-400 mt-5 text-lg">

            Get the latest tech blogs, career tips,
            AI updates and programming tutorials
            delivered directly to your inbox.
          </p>

          <div className="flex flex-col md:flex-row gap-4 mt-10">

            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-2xl bg-slate-900 border border-slate-700 outline-none"
            />

            <button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-8 py-4 rounded-2xl font-bold transition">

              Subscribe

            </button>

          </div>

        </div>

      </section>

      <Footer />
    </>
  );
}

export default Blog;