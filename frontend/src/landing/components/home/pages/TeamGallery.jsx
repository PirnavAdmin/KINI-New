import { motion } from "framer-motion";
import Navbar from "@landing-shared/components/navbar";
import Footer from "@landing-shared/components/Footer";
import Seo from "@landing-shared/components/Seo";

function TeamGallery() {
  return (
    <>
      <Seo
        title="Meet The Team"
        description="Meet the mentors, instructors and team behind Kini Edx Hub's training programs."
        path="/team-gallery"
      />
      <Navbar />
      <section className="py-24 bg-background bg-grid">
      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-center text-5xl font-bold text-foreground mb-16">
          Meet The Team
        </h2>

        <div className="grid lg:grid-cols-3 gap-6">

          <motion.img
            whileHover={{ scale: 1.03 }}
            src="https://i.pinimg.com/1200x/fd/96/24/fd9624ae8ebf666a6661ff666fa06c45.jpg"
            alt=""
            className="rounded-3xl h-[350px] object-cover w-full lg:col-span-2"
          />

          <motion.img
            whileHover={{ scale: 1.03 }}
            src="https://i.pinimg.com/736x/05/e7/0d/05e70dd17bc08cc3dfaf0ca3f5111585.jpg"
            alt=""
            className="rounded-3xl h-[350px] object-cover w-full"
          />

          <motion.img
            whileHover={{ scale: 1.03 }}
            src="https://i.pinimg.com/736x/05/e7/0d/05e70dd17bc08cc3dfaf0ca3f5111585.jpg"
            alt=""
            className="rounded-3xl h-[250px] object-cover w-full"
          />

          <motion.img
            whileHover={{ scale: 1.03 }}
            src="https://i.pinimg.com/736x/05/e7/0d/05e70dd17bc08cc3dfaf0ca3f5111585.jpg"
            alt=""
            className="rounded-3xl h-[250px] object-cover w-full lg:col-span-2"
          />

        </div>
      </div>
      </section>
      <Footer />
    </>
  );
}

export default TeamGallery;