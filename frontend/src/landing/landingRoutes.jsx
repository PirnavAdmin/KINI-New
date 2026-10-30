/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react";
import { Route } from "react-router-dom";
import LandingLayout from "./LandingLayout";

const Home = lazy(() => import("./components/home/pages/Home"));
const About = lazy(() => import("./components/home/pages/About"));
const Contact = lazy(() => import("./components/home/pages/Contact"));
const FAQ = lazy(() => import("./components/home/pages/FAQ"));
const MissionVision = lazy(() => import("./components/home/pages/MissionVision"));
const WhoWeAre = lazy(() => import("./components/home/pages/WhoWeAre"));
const OrganizationStructure = lazy(() => import("./components/home/pages/OrganizationStructure"));
const TeamGallery = lazy(() => import("./components/home/pages/TeamGallery"));
const WhyChooseUs = lazy(() => import("./components/home/pages/WhyChooseUs"));
const WhyChooseUsAbout = lazy(() => import("./components/home/pages/WhyChooseUsAbout"));
const FounderSection = lazy(() => import("./components/home/pages/FounderSection"));
const StudentReviews = lazy(() => import("./components/home/pages/StudentReviews"));
const SuccessStories = lazy(() => import("./components/home/pages/SuccessStories"));
const Lightfall = lazy(() => import("./components/home/pages/Lightfall"));
const UpskillCourseProgram = lazy(() => import("./components/home/pages/UpskillCourseProgram"));
const PremiumDashboard = lazy(() => import("./components/home/pages/PremiumDashboard"));
const ProjectNewPage = lazy(() => import("./ProjectNewPage"));
const CorporateTraining = lazy(() => import("./components/home/pages/CorporateTraining"));
const Internships = lazy(() => import("./components/home/pages/Internships"));
const Placements = lazy(() => import("./components/home/components/Placementspage"));
const TermsAndConditions = lazy(() => import("./components/home/pages/legal/TermsAndConditions"));
const PrivacyPolicy = lazy(() => import("./components/home/pages/legal/PrivacyPolicy"));

// Public landing routes, mounted inside the app's <Routes>. Landing paths
// the app already serves (/blog, /career, /mentors,
// /features, /upskill-program, /admissions, /courses, /courses/:slug,
// /course-curriculum/:slug, /ai-engineering-immersive, /dashboard and *)
// stay on the app's pages and are not listed here.
export const landingRoutes = (
  <Route element={<LandingLayout />}>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/faq" element={<FAQ />} />
    <Route path="/mission-vision" element={<MissionVision />} />
    <Route path="/who-we-are" element={<WhoWeAre />} />
    <Route path="/organization-structure" element={<OrganizationStructure />} />
    <Route path="/team-gallery" element={<TeamGallery />} />
    <Route path="/why-choose-us" element={<WhyChooseUs />} />
    <Route path="/why-choose-us-about" element={<WhyChooseUsAbout />} />
    <Route path="/founder-section" element={<FounderSection />} />
    <Route path="/student-reviews" element={<StudentReviews />} />
    <Route path="/success-stories" element={<SuccessStories />} />
    <Route path="/lightfall" element={<Lightfall />} />
    <Route path="/programs" element={<UpskillCourseProgram />} />
    <Route path="/project-new" element={<ProjectNewPage />} />
    <Route path="/corporate-training" element={<CorporateTraining />} />
    <Route path="/internships" element={<Internships />} />
    <Route path="/placement" element={<Placements />} />
    <Route path="/placements" element={<Placements />} />
    <Route path="/students" element={<SuccessStories />} />
    <Route path="/premium-dashboard" element={<PremiumDashboard />} />
    <Route path="/terms-conditions" element={<TermsAndConditions />} />
    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
  </Route>
);
