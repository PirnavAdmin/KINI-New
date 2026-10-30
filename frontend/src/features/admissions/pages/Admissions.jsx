import AdmissionCard from "../components/AdmissionCard/AdmissionCard";
import TrustedCompanies from "../components/TrustedCompanies";
import WhyChooseUs from "../components/WhyChooseUs";
import AdmissionProcess from "../components/AdmissionProcess";
import Eligibility from "../components/Eligibility";
import ProgramHighlights from "../components/ProgramHighlights";
import Documents from "../components/Documents";
import ScholarshipSection from "../components/ScholarshipSection";
import SuccessStories from "../components/SuccessStories";
import AdmissionForm from "../components/AdmissionForm";
import FAQ from "../components/FAQ";

import Navbar from "@shared/components/Navbar";
import Footer from "@shared/components/Footer";
import { useThemeContext } from "@shared/context/ThemeContext";


export default function Admissions() {
  const { isDark } = useThemeContext();
  return (
    <main
      className={`min-h-[100vh] font-sans antialiased overflow-x-hidden selection:bg-purple-500/30 selection:text-purple-200 transition-colors duration-300 ${
        isDark ? 'bg-[#030B24] text-slate-100' : 'bg-slate-50 text-slate-800'
      }`}
      style={{
        fontFamily: "'Sora', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      <Navbar />
      {/* Decorative Global Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[800px] bg-gradient-radial from-purple-600/10 via-blue-600/5 to-transparent pointer-events-none z-0" />
      <div className="absolute top-[2500px] right-0 w-[400px] h-[600px] bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[1000px] left-0 w-[500px] h-[700px] bg-purple-500/5 blur-[150px] pointer-events-none" />

 <div className="relative z-10 pb-24">
        <AdmissionCard />
        <TrustedCompanies />
        <WhyChooseUs />
        <AdmissionProcess />
        <Eligibility />
        <ProgramHighlights />
        <Documents />
        <ScholarshipSection />
        <SuccessStories />
        
        {/* Dual Column Layout for Form + FAQ to mimic high-converting structures */}
        <AdmissionForm/>

        <FAQ/>
     
       
      </div>
      <Footer />
    </main>
  );
}