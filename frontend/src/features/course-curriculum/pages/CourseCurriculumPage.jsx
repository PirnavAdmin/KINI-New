import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useMemo } from "react";
import Navbar from "@shared/components/Navbar";
import Footer from "@shared/components/Footer";

import { getCurriculumBySlug, CURRICULUM_MAP } from "../data/curriculumMap";
import { INSTRUCTOR, REVIEWS } from "../data/curriculumData";
import CourseHero from "../components/CourseHero";
import CourseStats from "../components/CourseStats";
import CourseTabs from "../components/CourseTabs";
import CurriculumAccordion from "../components/CurriculumAccordion";
import CourseSidebar from "../components/CourseSidebar";
import ReviewsSection from "../components/ReviewsSection";
import FAQSection from "../components/FAQSection";
import RelatedCourses from "../components/RelatedCourses";
import Newsletter from "../components/Newsletter";

// ── Fallback when no curriculum matches the slug ─────────────────
function CurriculumNotFound({ slug }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <section className="min-h-[60vh] flex items-center justify-center px-5">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-4xl">📚</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] mb-3">
            Course Not Found
          </h1>
          <p className="text-[#64748B] mb-8 leading-relaxed">
            We couldn't find a course matching &ldquo;{slug}&rdquo;. It may
            have been removed or the link might be incorrect.
          </p>
          <button
            onClick={() => navigate("/courses")}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#085FA7] to-[#5CA347] text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Browse All Courses
          </button>
        </div>
      </section>
      <Footer />
    </div>
  );
}

// ── Overview Tab ─────────────────────────────────────────────
const OverviewTab = ({ curriculum, navigate, onEnroll }) => (
  <div className="space-y-6">
    {/* About */}
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8">
      <h2 className="text-lg font-extrabold text-[#0F172A] mb-3">About This Program</h2>
      <p className="text-sm text-slate-600 leading-relaxed">{curriculum.description}</p>
    </div>

    {/* What You'll Learn */}
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8">
      <h2 className="text-lg font-extrabold text-[#0F172A] mb-4">What You'll Learn</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {[
          "Build production-ready applications with modern frameworks",
          "Design scalable system architectures & databases",
          "Integrate industry-standard tools and workflows",
          "Deploy applications with CI/CD & cloud services",
          "Master best practices for production code",
          "Prepare for technical interviews with DSA & system design",
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB]">
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#085FA7] to-[#5CA347] flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[10px] text-white font-bold">✓</span>
            </div>
            <span className="text-xs sm:text-sm text-slate-700">{item}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Who Is This For */}
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8">
      <h2 className="text-lg font-extrabold text-[#0F172A] mb-4">Who Is This Program For?</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {[
          { title: "Beginners", desc: "No prior coding experience? Start from zero and build a strong foundation." },
          { title: "Career Switchers", desc: "Transition into tech with a structured curriculum and placement support." },
          { title: "Junior Developers", desc: "Level up your skills with advanced topics and real-world projects." },
          { title: "Entrepreneurs", desc: "Learn to build your own products and launch your startup." },
        ].map((item, i) => (
          <div key={i} className="p-4 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F8FAFC] transition-colors">
            <h4 className="text-sm font-bold text-[#085FA7] mb-1">{item.title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Program Highlights */}
    {curriculum.highlights?.length > 0 && <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8">
      <h2 className="text-lg font-extrabold text-[#0F172A] mb-4">Program Highlights</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {curriculum.highlights.map((item, i) => (
          <div key={i} className="flex items-center gap-2.5 p-3 rounded-lg bg-gradient-to-r from-[#085FA7]/5 to-[#5CA347]/5 border border-[#085FA7]/10">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#085FA7] to-[#5CA347]" />
            <span className="text-xs font-medium text-[#0F172A]">{item}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-[#E5E7EB] text-center">
        <button
          onClick={onEnroll}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#085FA7] to-[#3D8B2E] text-white text-sm font-bold rounded-xl shadow-lg shadow-[#085FA7]/20 hover:shadow-xl transition-all"
        >
          Start Learning Today
        </button>
      </div>
    </div>}
  </div>
);

// ── Curriculum Tab ──────────────────────────────────────────
const CurriculumTab = ({ curriculum }) => (
  <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-lg font-extrabold text-[#0F172A]">Course Curriculum</h2>
        {(curriculum.sections.length || curriculum.totalLessons != null || curriculum.totalHours != null) ? <p className="text-xs text-slate-500 mt-1">
          {curriculum.sections.length ? `${curriculum.sections.length} sections` : ""}{curriculum.totalLessons != null ? ` · ${curriculum.totalLessons} lessons` : ""}{curriculum.totalHours != null ? ` · ${curriculum.totalHours} hours` : ""}
        </p> : <p className="text-xs text-slate-500 mt-1">Curriculum will be published soon.</p>}
      </div>
    </div>
    <div className="space-y-2.5">
      {curriculum.sections.map((section, i) => (
        <CurriculumAccordion key={section.id} section={section} index={i} />
      ))}
      {!curriculum.sections.length && <p className="rounded-xl border border-dashed border-[#E5E7EB] bg-[#F8FAFC] p-6 text-center text-sm text-slate-500">No curriculum is available for this course yet.</p>}
    </div>
  </div>
);

// ── Mentors Tab ─────────────────────────────────────────────
const MentorsTab = ({ instructor, navigate }) => (
  <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8">
    <div className="flex items-center gap-4 mb-6">
      <img
        src={instructor.avatar}
        alt={instructor.name}
        className="w-20 h-20 rounded-xl object-cover border-2 border-[#E5E7EB]"
      />
      <div>
        <h2 className="text-lg font-extrabold text-[#0F172A]">{instructor.name}</h2>
        <p className="text-sm text-[#085FA7] font-medium">{instructor.role}</p>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-xs text-slate-500">{instructor.experience} experience</span>
          <span className="text-xs text-[#085FA7] font-semibold">{instructor.students.toLocaleString()}+ students</span>
        </div>
      </div>
    </div>
    <p className="text-sm text-slate-600 leading-relaxed mb-6">{instructor.bio}</p>
    <div className="grid sm:grid-cols-2 gap-4 mb-6">
      <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB]">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Companies</p>
        <div className="flex flex-wrap gap-1.5">
          {instructor.companies.map((c) => (
            <span key={c} className="text-xs font-medium bg-white border border-[#E5E7EB] px-2.5 py-1 rounded-lg text-slate-700">
              {c}
            </span>
          ))}
        </div>
      </div>
      <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB]">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Specialties</p>
        <div className="flex flex-wrap gap-1.5">
          {instructor.specialties.map((s) => (
            <span key={s} className="text-xs font-medium bg-white border border-[#5CA347]/20 text-[#5CA347] px-2.5 py-1 rounded-lg">
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
    <h3 className="text-base font-extrabold text-[#0F172A] mb-4">Program Mentors</h3>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
      {[
        { name: "Anjali Sharma", role: "Frontend Architect", company: "Google", avatar: "https://i.pravatar.cc/80?img=5" },
        { name: "Rahul Verma", role: "Backend Lead", company: "Microsoft", avatar: "https://i.pravatar.cc/80?img=3" },
        { name: "Priya Patel", role: "AI/ML Engineer", company: "Amazon", avatar: "https://i.pravatar.cc/80?img=9" },
        { name: "Vikram Joshi", role: "DevOps Lead", company: "Netflix", avatar: "https://i.pravatar.cc/80?img=12" },
        { name: "Sneha Reddy", role: "Full Stack Engineer", company: "Stripe", avatar: "https://i.pravatar.cc/80?img=1" },
        { name: "Arjun Kumar", role: "System Design Expert", company: "Uber", avatar: "https://i.pravatar.cc/80?img=8" },
      ].map((mentor, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F8FAFC] transition-colors">
          <img src={mentor.avatar} alt={mentor.name} className="w-10 h-10 rounded-lg object-cover" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#0F172A] truncate">{mentor.name}</p>
            <p className="text-[10px] text-slate-500 truncate">{mentor.role}</p>
            <p className="text-[10px] text-[#085FA7] font-medium">{mentor.company}</p>
          </div>
        </div>
      ))}
    </div>
    <div className="text-center">
      <button
        onClick={() => navigate("/mentors")}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#085FA7] hover:text-[#0B6FC7] transition-colors"
      >
        View All Mentors →
      </button>
    </div>
  </div>
);

// ── Reviews Tab ──────────────────────────────────────────────
const ReviewsTab = () => (
  <ReviewsSection reviews={REVIEWS} />
);

// ── FAQ Tab ──────────────────────────────────────────────────
const FAQTab = ({ faq }) => (
  <FAQSection faq={faq} />
);

// ── Main Curriculum Page ─────────────────────────────────────
const CourseCurriculumPage = () => {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const selectedCourse = useMemo(() => {
    if (location.state?.course) return location.state.course;
    try {
      return JSON.parse(window.localStorage.getItem("kini:enrollment:draft") || "null")?.course || null;
    } catch {
      return null;
    }
  }, [location.state]);
  const curriculum = useMemo(() => {
    const mapped = slug ? getCurriculumBySlug(slug) : null;
    if (mapped || !selectedCourse) return mapped;
    const fallback = getCurriculumBySlug("fullstack-dotnet") || Object.values(CURRICULUM_MAP)[0];
    const price = Number(selectedCourse.price);
    const numberOrUndefined = (...values) => {
      const value = values.find((item) => item !== undefined && item !== null && item !== "");
      const number = Number(value);
      return value === undefined || value === null || value === "" || !Number.isFinite(number) ? undefined : number;
    };
    return {
      ...fallback,
      id: selectedCourse.id ?? slug,
      slug,
      title: selectedCourse.title || fallback.title,
      subtitle: selectedCourse.description || fallback.subtitle,
      description: selectedCourse.description || fallback.description,
      duration: selectedCourse.duration || fallback.duration,
      level: selectedCourse.level || undefined,
      rating: numberOrUndefined(selectedCourse.rating),
      reviewCount: numberOrUndefined(selectedCourse.reviewCount),
      totalStudents: numberOrUndefined(selectedCourse.students),
      image: selectedCourse.thumbnail || selectedCourse.image || fallback.image,
      price: Number.isFinite(price) && price > 0 ? price : fallback.price,
      originalPrice: Number.isFinite(price) && price > 0 ? price : fallback.originalPrice,
      discountPercent: 0,
      stats: [],
      highlights: [],
      sections: [],
      faq: [],
      totalProjects: numberOrUndefined(selectedCourse.projects, selectedCourse.projectCount),
      totalLessons: numberOrUndefined(selectedCourse.lessons, selectedCourse.lessonCount),
      totalHours: numberOrUndefined(selectedCourse.hours, selectedCourse.totalHours),
    };
  }, [slug, selectedCourse]);
  const startEnrollment = () => {
    if (!curriculum) return;
    const course = {
      id: curriculum.id,
      title: curriculum.title,
      description: curriculum.description,
      duration: curriculum.duration,
      level: curriculum.level,
      price: curriculum.price,
      thumbnail: curriculum.image,
    };
    window.localStorage.setItem("kini:enrollment:draft", JSON.stringify({ course, step: "details" }));
    navigate("/enrollment");
  };

  // If no curriculum found for this slug, show the not-found page
  if (!curriculum) {
    return <CurriculumNotFound slug={slug} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      {/* ── Hero ── */}
      <CourseHero curriculum={curriculum} onEnroll={startEnrollment} />

      {/* ── Stats ── */}
      <CourseStats stats={curriculum.stats} />

      {/* ── Tabbed Content + Sidebar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_300px] gap-4 lg:gap-5 py-4">
          {/* Main Content */}
          <div className="min-w-0">
            <CourseTabs>
              {{
                overview: <OverviewTab curriculum={curriculum} navigate={navigate} onEnroll={startEnrollment} />,
                curriculum: <CurriculumTab curriculum={curriculum} />,
                mentors: <MentorsTab instructor={INSTRUCTOR} navigate={navigate} />,
                reviews: <ReviewsTab />,
                faq: <FAQTab faq={curriculum.faq} />,
              }}
            </CourseTabs>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block">
            <CourseSidebar curriculum={curriculum} onEnroll={startEnrollment} />
          </div>
        </div>
      </div>

      {/* ── Related Courses ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 lg:pb-12">
        <RelatedCourses />
      </div>

      {/* ── Newsletter ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 lg:pb-8">
        <Newsletter />
      </div>

      <Footer />
    </div>
  );
};

export default CourseCurriculumPage;
