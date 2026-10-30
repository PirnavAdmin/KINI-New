import "./prisma.css";
import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import FeaturesSection from "./components/FeaturesSection";
import useActiveSection from "./hooks/useActiveSection";

export default function PrismaLanding() {
  const activeSection = useActiveSection();

  return (
    <div className="prisma">
      <main className="bg-black">
        <HeroSection activeSection={activeSection} />
        <AboutSection />
        <FeaturesSection />
      </main>
    </div>
  );
}
