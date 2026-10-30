import {
  FaUserGraduate,
  FaLaptopCode,
  FaChalkboardTeacher,
  FaBriefcase,
} from "react-icons/fa";
import Navbar from "@landing-shared/components/navbar";
import Footer from "@landing-shared/components/Footer";
import Seo from "@landing-shared/components/Seo";

function WhoWeAre() {
  return (
    <>
      <Seo
        title="Who We Are"
        description="Kini Edx Hub builds industry-ready engineers through structured learning, live mentorship, real projects and placement assistance."
        path="/who-we-are"
      />
      <Navbar />
      <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">

        <p className="text-center uppercase tracking-[5px] text-foreground-muted">
          About Us
        </p>

        <h2 className="text-center text-5xl font-bold mt-4 text-foreground">
          Who Are We
        </h2>

        <div className="mt-12 bg-gradient-to-r from-primary-950 to-primary-700 rounded-3xl p-10 text-white text-center">

          <p className="text-2xl font-medium leading-relaxed">
            We build industry-ready engineers through structured
            learning, mentorship and placement assistance.
          </p>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">

          <div className="bg-primary-50 dark:bg-white/5 p-8 rounded-2xl text-foreground">
            <FaLaptopCode size={35} />
            <h3 className="font-bold mt-5">
              Industry Curriculum
            </h3>
          </div>

          <div className="bg-primary-50 dark:bg-white/5 p-8 rounded-2xl text-foreground">
            <FaChalkboardTeacher size={35} />
            <h3 className="font-bold mt-5">
              Live Mentorship
            </h3>
          </div>

          <div className="bg-primary-50 dark:bg-white/5 p-8 rounded-2xl text-foreground">
            <FaUserGraduate size={35} />
            <h3 className="font-bold mt-5">
              Real Projects
            </h3>
          </div>

          <div className="bg-primary-50 dark:bg-white/5 p-8 rounded-2xl text-foreground">
            <FaBriefcase size={35} />
            <h3 className="font-bold mt-5">
              Placement Assistance
            </h3>
          </div>

        </div>
      </div>
      </section>
      <Footer />
    </>
  );
}

export default WhoWeAre;