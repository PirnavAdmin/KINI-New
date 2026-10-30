import { useThemeContext } from "@landing-shared/context/ThemeContext";
import Navbar from "@landing-shared/components/navbar";
import Footer from "@landing-shared/components/Footer";
import Seo from "@landing-shared/components/Seo";

function MissionVision() {
  const { isDark } = useThemeContext();
  return (
    <>
      <Seo
        title="Our Mission & Vision"
        description="Kini Edx Hub's mission and vision: helping learners build real-world skills and become top technology professionals through world-class training and mentorship."
        path="/mission-vision"
      />
      <Navbar />
      <section className={`py-24 transition-colors duration-300 ${isDark ? 'bg-app-dark-gradient' : 'bg-slate-50'}`}>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center px-6">

        <div className="text-foreground">

          <h2 className="text-5xl font-bold mb-8">
            Our Mission
          </h2>

          <p className="text-lg leading-relaxed text-foreground-secondary">
            Help learners gain strong fundamentals,
            real-world skills and confidence to
            succeed in top technology companies.
          </p>

          <h2 className="text-5xl font-bold mt-16 mb-8">
            Our Vision
          </h2>

          <p className="text-lg leading-relaxed text-foreground-secondary">
            Empower students to become the top 1%
            professionals in technology through
            world-class education and mentorship.
          </p>

        </div>

        <div>
          <img
            src="https://i.pinimg.com/736x/d9/2e/38/d92e38c7e6a00b2c2557bf25c95f4813.jpg"
            alt=""
            className="rounded-3xl"
          />
        </div>

      </div>

      </section>
      <Footer />
    </>
  );
}

export default MissionVision;