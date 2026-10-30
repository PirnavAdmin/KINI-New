import {
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { useThemeContext } from "@landing-shared/context/ThemeContext";
import Navbar from "@landing-shared/components/navbar";
import Seo from "@landing-shared/components/Seo";
import Footer from "@landing-shared/components/Footer";

const features = [
  {
    title: "Live Classes",
    academy: true,
    others: false,
    note: "Mostly Recorded",
  },
  {
    title: "Structured Curriculum",
    academy: true,
    others: false,
    note: "Scattered Content",
  },
  {
    title: "1:1 Mentorship",
    academy: true,
    others: false,
  },
  {
    title: "Placement Assistance",
    academy: true,
    others: false,
  },
  {
    title: "Real Projects",
    academy: true,
    others: "limited",
  },
  {
    title: "Mock Interviews",
    academy: true,
    others: false,
  },
];

export default function WhyChooseUs() {
  const { isDark } = useThemeContext();
  return (
    <>
      <Seo
        title="What Sets Us Apart"
        description="Discover what sets Kini Edx Hub apart: practical curriculum, expert mentors, real projects and dedicated placement support."
        path="/why-choose-us-about"
      />
      <Navbar />
      <section className={`py-24 relative overflow-hidden transition-colors duration-300 ${isDark ? 'bg-app-dark-gradient text-white' : 'bg-slate-50 text-slate-900'}`}>

      <div className="absolute inset-0 bg-gradient-to-r from-primary-900/20 via-transparent to-secondary-900/20" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        <div className="text-center mb-16">

          <span className="text-primary-400 uppercase tracking-widest">
            Why Choose Us
          </span>

          <h2 className="text-5xl font-bold mt-4">
            More Than A Course
          </h2>

          <p className="text-slate-400 mt-5 max-w-2xl mx-auto">
            Learn from industry experts, build real projects,
            receive mentorship and get complete placement assistance.
          </p>

        </div>

        <div className="rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl">

          <div className="grid grid-cols-3 bg-gradient-to-r from-primary-700 to-primary-900 p-6 font-bold text-lg">

            <div>Features</div>
            <div className="text-center">
              Our Academy
            </div>
            <div className="text-center">
              Others
            </div>

          </div>

          {features.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-3 p-6 border-b border-white/10 hover:bg-white/5 transition"
            >

              <div className="font-medium">
                {item.title}
              </div>

              <div className="flex justify-center">

                <CheckCircle
                  className="text-green-400"
                  size={24}
                />

              </div>

              <div className="flex justify-center">

                {item.others === false ? (
                  <XCircle
                    className="text-red-400"
                    size={24}
                  />
                ) : (
                  <AlertTriangle
                    className="text-yellow-400"
                    size={24}
                  />
                )}

              </div>

            </div>
          ))}

        </div>

      </div>

      </section>
      <Footer />
    </>
  );
}