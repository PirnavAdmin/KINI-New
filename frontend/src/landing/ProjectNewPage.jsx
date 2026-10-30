import Navbar from "@landing-shared/components/navbar";
import Footer from "@landing-shared/components/Footer";
import Seo from "@landing-shared/components/Seo";
import ProjectNew from "./components/home/pages/ProjectNew";

// /project-new: ProjectNew has no page chrome of its own.
export default function ProjectNewPage() {
  return (
    <>
      <Seo
        title="Capstone Projects"
        description="See the real-world capstone projects Kini Edx Hub students build and deploy as part of their training."
        path="/project-new"
      />
      <Navbar />
      <ProjectNew />
      <Footer />
    </>
  );
}
