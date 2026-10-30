import { useState } from "react";
import Navbar from "@shared/components/Navbar";
import Footer from "@shared/components/Footer";

import ResumePreview from "../components/ResumePreview";
import ATSScoreCard from "../components/ATSScoreCard";
import AISuggestions from "../components/AISuggestions";
import TemplateSelector from "../components/TemplateSelector";

import { calculateATS } from "@shared/utils/calculateATS";
import { generateResume } from "@shared/services/resumeService";

import { toast } from "sonner";

import {
  FaUser,
  FaGraduationCap,
  FaBriefcase,
  FaMagic,
} from "react-icons/fa";

function ResumeBuilder() {
  const [formData, setFormData] =
    useState({
      fullName: "",
      email: "",
      phone: "",
      skills: "",
      education: "",
      experience: "",
    });

  const [selectedTemplate,
    setSelectedTemplate] =
    useState(1);

  const [generatedResume,
    setGeneratedResume] =
    useState("");

  const [loading,
    setLoading] =
    useState(false);

  const atsScore =
    calculateATS(formData);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleGenerate =
    async () => {
      try {
        setLoading(true);

        toast.loading(
          "Generating ATS Resume..."
        );

        const data =
          await generateResume(
            formData
          );

        setGeneratedResume(
          data.resume
        );

        toast.dismiss();

        toast.success(
          "Resume Generated Successfully"
        );

      } catch (error) {
        console.log(error);

        toast.dismiss();

        toast.error(
          "Failed to Generate Resume"
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 pt-32 pb-24">

        <div className="absolute top-0 left-0 w-[450px] h-[450px] bg-cyan-500/20 blur-[180px] rounded-full" />

        <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-purple-500/20 blur-[180px] rounded-full" />

        <div className="relative max-w-7xl mx-auto px-5 text-center">

          <span className="uppercase tracking-[4px] text-cyan-400 font-semibold">
            Career Tools
          </span>

          <h1 className="mt-5 text-5xl md:text-7xl font-extrabold text-white">

            ATS Resume

            <span className="text-cyan-400">
              {" "}Builder
            </span>

          </h1>

          <p className="mt-6 max-w-3xl mx-auto text-slate-300 text-lg">

            Build professional ATS
            friendly resumes powered
            by AI and increase your
            interview opportunities.

          </p>

        </div>

      </section>

      {/* Main Section */}
      <section className="py-24 bg-slate-50">

        <div className="max-w-7xl mx-auto px-5">

          <div className="grid lg:grid-cols-2 gap-10">

            {/* FORM */}
            <div className="bg-white rounded-[32px] p-8 shadow-xl">

              <h2 className="text-3xl font-bold mb-8">

                Build Your Resume

              </h2>

              {/* Steps */}
              <div className="grid grid-cols-3 gap-4 mb-8">

                <div className="bg-blue-50 rounded-2xl p-4 text-center font-semibold">
                  1. Details
                </div>

                <div className="bg-cyan-50 rounded-2xl p-4 text-center font-semibold">
                  2. Generate
                </div>

                <div className="bg-green-50 rounded-2xl p-4 text-center font-semibold">
                  3. Download
                </div>

              </div>

              {/* Personal Details */}
              <div className="mb-8">

                <h3 className="flex items-center gap-3 text-xl font-semibold mb-4">

                  <FaUser />

                  Personal Details

                </h3>

                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full p-4 border rounded-2xl mb-4"
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-4 border rounded-2xl mb-4"
                />

                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-4 border rounded-2xl"
                />

              </div>

              {/* Skills */}
              <div className="mb-8">

                <h3 className="flex items-center gap-3 text-xl font-semibold mb-4">

                  <FaMagic />

                  Skills

                </h3>

                <textarea
                  rows="4"
                  name="skills"
                  placeholder="React, JavaScript, Node.js, SQL..."
                  value={formData.skills}
                  onChange={handleChange}
                  className="w-full p-4 border rounded-2xl"
                />

              </div>

              {/* Education */}
              <div className="mb-8">

                <h3 className="flex items-center gap-3 text-xl font-semibold mb-4">

                  <FaGraduationCap />

                  Education

                </h3>

                <textarea
                  rows="4"
                  name="education"
                  placeholder="B.Sc Computer Science..."
                  value={formData.education}
                  onChange={handleChange}
                  className="w-full p-4 border rounded-2xl"
                />

              </div>

              {/* Experience */}
              <div className="mb-8">

                <h3 className="flex items-center gap-3 text-xl font-semibold mb-4">

                  <FaBriefcase />

                  Experience

                </h3>

                <textarea
                  rows="5"
                  name="experience"
                  placeholder="Describe your work experience..."
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full p-4 border rounded-2xl"
                />

              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="
                w-full
                bg-gradient-to-r
                from-cyan-500
                via-blue-600
                to-indigo-700
                text-white
                py-4
                rounded-2xl
                font-bold
                text-lg
                hover:scale-[1.02]
                transition
                "
              >

                {loading
                  ? "Generating..."
                  : "🤖 Generate ATS Resume"}

              </button>

            </div>

            {/* RIGHT SIDE */}
            <div className="space-y-6">

              <ATSScoreCard
                score={atsScore}
              />

              <AISuggestions />

              <ResumePreview
                formData={formData}
                generatedResume={
                  generatedResume
                }
                template={
                  selectedTemplate
                }
              />

            </div>

          </div>

        </div>

      </section>

      {/* Templates */}
      <section className="py-24 bg-white">

        <div className="max-w-7xl mx-auto px-5">

          <h2 className="text-4xl font-bold text-center mb-12">

            Choose Resume Template

          </h2>

          <TemplateSelector
            selectedTemplate={
              selectedTemplate
            }
            setSelectedTemplate={
              setSelectedTemplate
            }
          />

        </div>

      </section>

      <Footer />
    </>
  );
}

export default ResumeBuilder;