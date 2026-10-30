import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, BookOpen, Check, Clock3, IndianRupee, MessageCircle, RefreshCw, ShoppingCart, Users } from "lucide-react";
import { courseService, publicCatalogueErrorMessage } from "@shared/services/courseService";
import { useCart } from "@/context/CartContext";
import Skeleton from "@shared/ui/Skeleton";
import SectionHeading from "./landing/SectionHeading";
import { BTN_PRIMARY, BTN_SECONDARY, CONTAINER, DISPLAY_FONT, FOCUS_RING } from "./landing/landingStyles";

const VISIBLE_LIMIT = 6;
const ALL = "all";
const EMPTY_ART = "/assets/StudentBanners/myCoursesBanner.webp";
const DURATION_FALLBACK = "Duration to be announced";
const LEVEL_FALLBACK = "Career course";
const field = (course, ...keys) => keys.map((key) => course?.[key]).find((value) => value !== null && value !== undefined && value !== "");
const isExplicitlyUnavailable = (status) => status === false
  || ["inactive", "draft", "disabled", "archived", "false", "0"].includes(String(status ?? "").trim().toLowerCase());
const toCard = (course) => ({
  id: field(course, "courseId", "id", "CourseId", "Id"),
  title: field(course, "courseName", "name", "title", "CourseName", "Name") || "Untitled course",
  description: field(course, "description", "courseDescription", "Description", "CourseDescription") || "Open the curriculum to see every module in this course.",
  duration: field(course, "duration", "courseDuration", "Duration", "CourseDuration") || DURATION_FALLBACK,
  level: field(course, "level", "category", "Level", "Category") || LEVEL_FALLBACK,
  image: field(course, "thumbnail", "thumbnailUrl", "imageUrl", "image", "Thumbnail", "ThumbnailUrl", "ImageUrl"),
  price: field(course, "price", "courseFee", "fee", "Price", "CourseFee", "Fee"),
  students: field(course, "enrolledStudents", "studentCount", "students", "EnrolledStudents", "StudentCount"),
  rating: field(course, "rating", "averageRating", "Rating", "AverageRating"),
  reviewCount: field(course, "reviewCount", "reviewsCount", "numberOfReviews", "ReviewCount"),
  batchIds: field(course, "batchIds", "BatchIds") || [],
  batchNames: field(course, "batchNames", "BatchNames") || [],
  status: field(course, "status", "isActive", "Status", "IsActive"),
  available: !isExplicitlyUnavailable(field(course, "status", "isActive", "Status", "IsActive")),
});
const priceText = (price) => {
  const amount = Number(price);
  return Number.isFinite(amount) && amount > 0 ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount) : "Contact for fee";
};
const initials = (title) => title.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase();

// Adds the course to the shared cart, keyed by its real API courseId.
function CartAction({ course }) {
  const { addToCart, isInCart } = useCart();
  const price = Number(course.price);
  const canAdd = course.id !== undefined && Number.isFinite(price) && price > 0;
  const inCart = canAdd && isInCart(course.id);

  const handleAdd = () => addToCart({
    id: course.id,
    name: course.title,
    price,
    duration: course.duration === DURATION_FALLBACK ? "" : course.duration,
    level: course.level === LEVEL_FALLBACK ? "" : course.level,
    thumbnail: course.image,
  });

  if (!canAdd) return null;
  return <button type="button" onClick={handleAdd} disabled={inCart}
    aria-label={inCart ? `${course.title} is already in your cart` : `Add ${course.title} to cart`}
    title={inCart ? "In your cart" : "Add to cart"}
    className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border transition-colors ${FOCUS_RING} ${inCart ? "cursor-default border-emerald-200 bg-emerald-50 text-emerald-700" : "border-[#F39924]/50 bg-[#F39924]/10 text-[#9A5A06] hover:bg-[#F39924] hover:text-[#133B5D]"}`}>
    {inCart ? <Check aria-hidden="true" className="h-4 w-4" /> : <ShoppingCart aria-hidden="true" className="h-4 w-4" />}
  </button>;
}

const slugify = (value) => String(value || "course").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "course";

// Three header treatments so a row of courses without thumbnails still reads
// as distinct programs.
const HEADER_TONES = [
  { bg: "bg-[#133B5D]", text: "text-white", chip: "bg-white/10 text-white", mark: "text-white/[0.07]" },
  { bg: "bg-[#FDF1E1]", text: "text-[#133B5D]", chip: "bg-white text-[#9A5A06]", mark: "text-[#F39924]/20" },
  { bg: "bg-[#EAF0F6]", text: "text-[#133B5D]", chip: "bg-white text-[#133B5D]", mark: "text-[#133B5D]/[0.08]" },
];

function CourseHeader({ course, tone }) {
  const [failed, setFailed] = useState(false);
  if (course.image && !failed) {
    return <div className="relative aspect-[16/8] overflow-hidden bg-[#EAF0F6]">
      <img src={course.image} alt="" loading="lazy" decoding="async" width="480" height="240" onError={() => setFailed(true)}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none" />
      <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#133B5D]">{course.level}</span>
    </div>;
  }
  return <div className={`relative flex aspect-[16/8] flex-col justify-between overflow-hidden p-5 ${tone.bg} ${tone.text}`}>
    <span aria-hidden="true" className={`${DISPLAY_FONT} pointer-events-none absolute -bottom-6 -right-2 text-[7.5rem] font-semibold leading-none tracking-tighter ${tone.mark}`}>
      {initials(course.title) || <BookOpen className="h-16 w-16" />}
    </span>
    <span className={`w-fit rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${tone.chip}`}>{course.level}</span>
    <p className={`${DISPLAY_FONT} relative max-w-[85%] text-xl font-semibold leading-tight`} aria-hidden="true">{course.title}</p>
  </div>;
}

function CourseCard({ course, index, onOpen }) {
  const tone = HEADER_TONES[index % HEADER_TONES.length];
  return <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#133B5D]/10 bg-white transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-[0_28px_50px_-30px_rgba(19,59,93,0.55)] motion-reduce:hover:translate-y-0">
    <CourseHeader course={course} tone={tone} />
    <div className="flex flex-1 flex-col p-6">
      <h3 className="text-lg font-semibold leading-snug text-[#133B5D]">{course.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#5f7180]">{course.description}</p>
      <dl className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-[#F6F8FB] p-4 text-xs">
        <div>
          <dt className="flex items-center gap-1.5 font-medium uppercase tracking-wider text-[#5f7180]"><Clock3 aria-hidden="true" className="h-3.5 w-3.5" /> Duration</dt>
          <dd className="mt-1 text-sm font-semibold text-[#133B5D]">{course.duration}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 font-medium uppercase tracking-wider text-[#5f7180]"><IndianRupee aria-hidden="true" className="h-3.5 w-3.5" /> Course fee</dt>
          <dd className="mt-1 text-sm font-semibold text-[#133B5D]">{priceText(course.price)}</dd>
        </div>
        {course.students !== undefined && <div className="col-span-2 flex items-center gap-1.5 border-t border-[#133B5D]/[0.08] pt-3 text-[#5f7180]">
          <Users aria-hidden="true" className="h-3.5 w-3.5" /> <span><strong className="font-semibold text-[#133B5D]">{course.students}</strong> enrolled</span>
        </div>}
      </dl>
      <div className="mt-auto flex items-center gap-3 pt-6">
        <button type="button" onClick={() => onOpen(course)}
          className={`inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#133B5D] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0E2D47] ${FOCUS_RING}`}>
          View curriculum <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
          <span className="sr-only"> for {course.title}</span>
        </button>
        <CartAction course={course} />
      </div>
    </div>
  </article>;
}

function CourseSkeletons() {
  return <div role="status" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 3 }).map((_, index) => <div key={index} className="overflow-hidden rounded-3xl border border-[#133B5D]/10 bg-white">
      <Skeleton variant="custom" className="aspect-[16/8] w-full !rounded-none" />
      <div className="space-y-3 p-6"><Skeleton variant="title" /><Skeleton variant="text" /><Skeleton variant="text" className="!w-2/3" /><Skeleton variant="custom" className="h-20 w-full !rounded-2xl" /><Skeleton variant="button" className="!h-11 !w-full" /></div>
    </div>)}
    <span className="sr-only">Loading courses…</span>
  </div>;
}

function StatePanel({ icon: Icon, title, body, children }) {
  return <div className="grid items-center overflow-hidden rounded-3xl border border-[#133B5D]/10 bg-gradient-to-br from-[#F6F8FB] to-white md:grid-cols-[1fr_1.1fr]">
    <div className="p-8 sm:p-10">
      <span aria-hidden="true" className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-[#133B5D] shadow-sm ring-1 ring-[#133B5D]/10"><Icon className="h-5 w-5" /></span>
      <p className={`${DISPLAY_FONT} mt-5 text-2xl font-semibold text-[#133B5D]`}>{title}</p>
      <p className="mt-2 max-w-[28rem] text-sm leading-6 text-[#5f7180]">{body}</p>
      <div className="mt-6 flex flex-wrap items-center gap-3">{children}</div>
    </div>
    <img src={EMPTY_ART} alt="" loading="lazy" decoding="async" width="1700" height="640" className="h-full max-h-72 w-full object-contain object-right-bottom" />
  </div>;
}

export default function FeaturedCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState(ALL);

  const loadCourses = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const result = await courseService.getPublicCourses();
      setCourses((result?.data || []).map(toCard).filter((course) => course.available));
    } catch (requestError) {
      setCourses([]);
      setError(publicCatalogueErrorMessage(requestError));
    } finally { setLoading(false); }
  }, []);
  useEffect(() => {
    const requestTimer = window.setTimeout(() => { loadCourses(); }, 0);
    return () => window.clearTimeout(requestTimer);
  }, [loadCourses]);

  // Filters come from the categories the API actually returns.
  const categories = useMemo(() => [...new Set(courses.map((course) => course.level).filter((level) => level !== LEVEL_FALLBACK))], [courses]);
  const activeCategory = categories.includes(category) ? category : ALL;
  const visibleCourses = (activeCategory === ALL ? courses : courses.filter((course) => course.level === activeCategory)).slice(0, VISIBLE_LIMIT);

  const enroll = (course) => {
    window.localStorage.setItem("kini:enrollment:draft", JSON.stringify({ course, step: "landing" }));
    navigate(`/course-curriculum/${slugify(course.title)}`, { state: { course } });
  };

  return <section id="courses" aria-labelledby="courses-title" className="scroll-mt-24 bg-white py-20 lg:py-28">
    <div className={CONTAINER}>
      <SectionHeading id="courses-title" eyebrow="Programs" title="Choose the right course for your next step"
        intro="Every course listed here comes from our live catalogue, with its current duration and fee. Open one to read the full curriculum.">
        {!loading && !error && courses.length > 0 && <Link to="/courses" className={BTN_SECONDARY}>View all courses <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>}
      </SectionHeading>

      {!loading && !error && categories.length > 1 && <div role="group" aria-label="Filter courses by category" className="mt-8 flex flex-wrap gap-2">
        {[ALL, ...categories].map((item) => {
          const pressed = item === activeCategory;
          return <button key={item} type="button" aria-pressed={pressed} onClick={() => setCategory(item)}
            className={`min-h-10 rounded-full border px-4 text-sm font-semibold transition-colors ${FOCUS_RING} ${pressed ? "border-[#133B5D] bg-[#133B5D] text-white" : "border-[#133B5D]/15 bg-white text-[#17324a] hover:border-[#133B5D]/40"}`}>
            {item === ALL ? "All courses" : item}
          </button>;
        })}
      </div>}

      <div className="mt-10" aria-live="polite" aria-busy={loading}>
        {loading && <CourseSkeletons />}
        {!loading && error && <StatePanel icon={AlertCircle} title="Courses are unavailable right now" body={error}>
          <button type="button" onClick={loadCourses} className={BTN_PRIMARY}><RefreshCw aria-hidden="true" className="h-4 w-4" /> Try again</button>
          <Link to="/courses" className={`${FOCUS_RING} inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-[#133B5D] underline decoration-[#F39924] decoration-2 underline-offset-4`}>Open the course catalogue</Link>
        </StatePanel>}
        {!loading && !error && !visibleCourses.length && <StatePanel icon={BookOpen} title="New courses are on the way" body="There are no courses open for enrolment right now. Tell us what you want to learn and we'll get back to you.">
          <Link to="/contact" className={BTN_PRIMARY}>Contact us</Link>
        </StatePanel>}
        {!loading && !error && visibleCourses.length > 0 && <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleCourses.map((course, index) => <motion.li key={course.id ?? course.title} layout="position"
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, delay: (index % 3) * 0.06 }}>
            <CourseCard course={course} index={index} onOpen={enroll} />
          </motion.li>)}
        </ul>}
      </div>

      <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-[#133B5D]/10 bg-[#F6F8FB] px-6 py-5 sm:flex-row sm:items-center">
        <p className="flex items-center gap-3 text-[15px] font-semibold text-[#133B5D]">
          <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F39924]/15 text-[#9A5A06]"><MessageCircle className="h-5 w-5" /></span>
          Not sure which course is best for you?
        </p>
        <Link to="/contact" className={`${FOCUS_RING} inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#133B5D] px-5 text-sm font-semibold text-white hover:bg-[#0E2D47]`}>
          Talk to our team <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>
    </div>
  </section>;
}
