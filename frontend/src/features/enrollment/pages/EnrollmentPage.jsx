import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FiAlertTriangle, FiShoppingCart } from "react-icons/fi";
import { useThemeContext } from "@shared/context/ThemeContext";
import { useAuth } from "@shared/hooks/useAuth";
import { ROUTES } from "@shared/constants/routeConstants";
import { useCart } from "@/context/CartContext";
import { courseService } from "@/services/courseService";
import { paymentApi, readStoredOrganizationId } from "@shared/services/apiServices";
import { isPaymentVerified, openRazorpayCheckout, PaymentError } from "@shared/services/razorpayCheckout";
import { DEMO_LABEL, demoPaymentApi, isDemoPaymentMode } from "@shared/services/demoPaymentApi";
import { PAYMENT_METHODS } from "@shared/data/mockData";
import {
  batchFieldName,
  clearEnrollmentDraft,
  isPurchasableCourse,
  readEnrollmentDraft,
  updateEnrollmentDraft,
  writeEnrollmentDraft,
} from "../utils/enrollmentDraft";

import CheckoutHeader from "../components/CheckoutHeader";
import CoursePreviewCard from "../components/CoursePreviewCard";
import StudentDetailsForm from "../components/StudentDetailsForm";
import EnrollmentNavbar from "../components/EnrollmentNavbar";
import EnrollmentFooter from "../components/EnrollmentFooter";
import PaymentSection from "../components/PaymentSection";
import OrderSummary from "../components/OrderSummary";
import TrustLogos from "../components/TrustLogos";
import Testimonials from "../components/Testimonials";
import FAQSection from "../components/FAQSection";
import SuccessScreen from "../components/SuccessScreen";
import DemoPaymentModal from "../components/DemoPaymentModal";

import { createEnrollmentApprovalRequest } from "@shared/services/enrollmentApprovalStore";
import { enrollmentNotificationService } from "@shared/services/enrollmentNotificationService";
import { batchService } from "@shared/services/batchService";
import apiClient from "@shared/services/apiClient";
import { API_ENDPOINTS } from "@/api/endpoints";
import { BRAND } from "../theme";


const STUDENT_FIELDS = ["firstName", "lastName", "email", "phone", "pincode", "state", "qualification", "experience"];

const normalizeCourse = (raw) => {
  if (!raw) return null;
  return {
    ...raw,
    id: raw.id ?? raw.courseId,
    name: raw.title || raw.name || raw.courseName || "",
    trainer: raw.instructor || raw.trainer || "",
    thumbnail: raw.thumbnail || raw.image || "",
    price: Number(raw.price),
  };
};

/**
 * The courses being purchased together: cart items named by ?courseIds=a,b
 * (or the single ?courseId=), else the saved draft. Duplicates are dropped.
 */
const resolveCourses = (idParams, cartItems) => {
  const draft = readEnrollmentDraft();
  const draftCourses = draft?.courses?.length ? draft.courses : (draft?.course ? [draft.course] : []);
  const ids = [...new Set(idParams.map(String))];
  if (!ids.length) return draftCourses.map(normalizeCourse).filter(Boolean);
  return ids.map((id) => {
    const cartItem = cartItems.find((item) => String(item.id) === id);
    if (cartItem) return normalizeCourse({ ...cartItem, title: cartItem.name, image: cartItem.thumbnail });
    return normalizeCourse(draftCourses.find((course) => String(course.id ?? course.courseId) === id));
  }).filter(Boolean);
};

const sameIds = (a, b) => a.length === b.length && a.every((id) => b.includes(id));

/** The organization that reviews one course line of the purchase. */
const organizationIdFor = (line) => line.batch?.organizationId
  ?? line.source.organizationId
  ?? line.source.organization?.id
  ?? line.source.organization?.organizationId
  ?? readEnrollmentDraft()?.organizationId
  ?? readStoredOrganizationId();

/**
 * Each course's share of the amount paid, split by list price so a coupon
 * discount is spread across the courses; the last course takes the rounding
 * remainder so the shares add up to exactly the amount paid.
 */
const splitByListPrice = (prices, paid) => {
  const listTotal = prices.reduce((sum, price) => sum + (Number(price) || 0), 0);
  let allocated = 0;
  return prices.map((price, index) => {
    if (index === prices.length - 1) return Math.round((paid - allocated) * 100) / 100;
    const share = listTotal ? Math.round(((Number(price) || 0) / listTotal) * paid * 100) / 100 : 0;
    allocated += share;
    return share;
  });
};

/** Short stable fingerprint of a string (not for security; keys a demo order to its checkout content). */
const hashText = (text) => {
  let hash = 5381;
  for (let index = 0; index < text.length; index += 1) hash = ((hash << 5) + hash + text.charCodeAt(index)) >>> 0;
  return hash.toString(36);
};

/** Compact list of the courses in a multi-course purchase (step 1). */
function SelectedCoursesCard({ isDark, courses }) {
  const format = (n) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
  return (
    <section
      aria-label="Courses in this purchase"
      className="rounded-xl p-4 shadow-md"
      style={{ border: `1px solid ${t(isDark).border}`, backgroundColor: t(isDark).card }}
    >
      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: t(isDark).textMuted }}>
        {courses.length} courses · one payment
      </p>
      <ul className="mt-3 divide-y" style={{ borderColor: t(isDark).borderLight }}>
        {courses.map((course) => (
          <li key={course.id} className="flex items-center justify-between gap-3 py-2.5">
            <span className="min-w-0 truncate text-sm font-semibold" style={{ color: t(isDark).text }}>{course.name}</span>
            <span className="shrink-0 text-sm font-semibold tabular-nums" style={{ color: t(isDark).text }}>₹{format(course.price)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs" style={{ color: t(isDark).textMuted }}>
        Your details below are used for every course. Choose a batch for each one.
      </p>
    </section>
  );
}

const digitsOnly = (value) => String(value ?? "").replace(/\D/g, "").slice(-10);


const t = (dark) => ({
  bg: dark ? "#050816" : "#EEF3F8",
  surface: dark ? "#0B1120" : "#FFFFFF",
  card: dark ? "rgba(11,17,32,0.75)" : "rgba(255,255,255,0.9)",
  border: dark ? "rgba(255,255,255,0.1)" : "rgba(71,85,105,0.18)",
  text: dark ? "#F8FAFC" : "#0F172A",
  textSecondary: dark ? "#CBD5E1" : "#475569",
  textMuted: dark ? "#94A3B8" : "#64748B",
  textDim: dark ? "#64748B" : "#94A3B8",
  borderLight: dark ? "rgba(255,255,255,0.08)" : "rgba(71,85,105,0.14)",
  borderMedium: dark ? "rgba(255,255,255,0.12)" : "rgba(71,85,105,0.22)",
  overlay: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
});

const NOTICE_TONES = {
  info: { color: BRAND.primary },
  warning: { color: "#B45309" },
  error: { color: "#E11D48" },
};

function Notice({ isDark, tone = "info", icon: Icon, title, action, children }) {
  const { color } = NOTICE_TONES[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className="flex gap-3 rounded-xl p-4 text-sm"
      style={{ border: `1px solid ${color}40`, backgroundColor: `${color}12`, color: t(isDark).text }}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} />
      <div className="min-w-0 flex-1">
        <p className="font-semibold" style={{ color }}>{title}</p>
        <p className="mt-1" style={{ color: t(isDark).textSecondary }}>{children}</p>
        {action && <div className="mt-2" style={{ color }}>{action}</div>}
      </div>
    </div>
  );
}

function NoCourseSelected({ isDark }) {
  return (
    <div className="relative mx-auto flex min-h-[70vh] max-w-[32rem] flex-col items-center justify-center px-4 text-center">
      <FiShoppingCart className="h-10 w-10" style={{ color: BRAND.primary }} />
      <h1 className="mt-5 text-2xl font-bold" style={{ color: t(isDark).text }}>Choose a course to enroll</h1>
      <p className="mt-2 text-sm" style={{ color: t(isDark).textMuted }}>
        We couldn't find a course with a valid price for this enrollment. Pick a course from the
        catalog or your cart to continue.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to={ROUTES.PUBLIC.CART} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white" style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})` }}>
          Go to Cart
        </Link>
        <Link to={ROUTES.PUBLIC.COURSES} className="rounded-xl px-5 py-2.5 text-sm font-semibold" style={{ border: `1px solid ${t(isDark).borderMedium}`, color: t(isDark).text }}>
          Browse Courses
        </Link>
      </div>
    </div>
  );
}

const EnrollmentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useThemeContext();
  const { user } = useAuth();
  const { cartItems, removeFromCart } = useCart();
  const [searchParams] = useSearchParams();
  const idParams = (searchParams.get("courseIds") ?? searchParams.get("courseId") ?? "")
    .split(",").map((id) => id.trim()).filter(Boolean);

  // Resolved once so later cart changes (e.g. removing the paid courses)
  // don't swap the page out from under the student.
  const [selectedCourses] = useState(() => resolveCourses(idParams, cartItems));
  const selectedCourse = selectedCourses[0] ?? null;
  const multiCourse = selectedCourses.length > 1;
  const coursePrice = selectedCourses.reduce((sum, course) => sum + (Number(course.price) || 0), 0);
  const purchasable = selectedCourses.length > 0 && selectedCourses.every(isPurchasableCourse);

  // A receipt saved after backend verification survives a refresh.
  const [savedReceipt] = useState(() => {
    const draft = readEnrollmentDraft();
    if (draft?.step !== "complete" || !draft?.receipt) return null;
    const receiptIds = (draft.receipt.items?.map((item) => item.course?.id) ?? [draft.receipt.course?.id]).map(String);
    return !idParams.length || sameIds([...new Set(idParams)], receiptIds) ? draft.receipt : null;
  });

  const [step, setStep] = useState(savedReceipt ? 3 : location.state?.resumeEnrollment && readEnrollmentDraft()?.step === "payment" ? 2 : 1);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(Boolean(savedReceipt));
  const [enrollmentResult, setEnrollmentResult] = useState(savedReceipt);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  // Open batches for each selected course, keyed by course id.
  const [batchesByCourse, setBatchesByCourse] = useState({});
  const [batchesLoading, setBatchesLoading] = useState(Boolean(purchasable));
  const [paymentError, setPaymentError] = useState(null);
  const [alreadyEnrolledIds, setAlreadyEnrolledIds] = useState([]);
  const alreadyEnrolled = alreadyEnrolledIds.length > 0;
  const payingRef = useRef(false);
  const [upiApp, setUpiApp] = useState(null);
  // Demo Payment Mode: "checking" | "ready" | "unavailable" ("off" outside demo mode).
  const [demoServer, setDemoServer] = useState(isDemoPaymentMode ? "checking" : "off");
  const [demoCheckout, setDemoCheckout] = useState(null);
  const [demoBusy, setDemoBusy] = useState(null);

  const userId = user?.userId ?? user?.id ?? null;
  const isSignedIn = userId !== null && userId !== undefined && String(userId).trim() !== "";
  const accountRole = String(user?.role ?? user?.roleName ?? user?.userRole ?? "").trim().toLowerCase();
  const isStudentAccount = isSignedIn && ["student", "learner", "3"].includes(accountRole);
  // Guests pay without an account; only a signed-in student's order carries their userId.
  const orderUserId = isStudentAccount ? userId : undefined;

  useEffect(() => {
    if (!purchasable) return undefined;
    let active = true;
    setBatchesLoading(true);
    const rowsOf = (response) => {
      const payload = response?.data?.data ?? response?.data ?? response;
      return Array.isArray(payload) ? payload : (payload?.data ?? payload?.items ?? payload?.batches ?? []);
    };
    // Open, non-full batches of one course only.
    const openBatchesFor = (rows, courseId) => rows
      .filter((batch) => String(batch.courseId ?? batch.course?.id ?? batch.course?.courseId) === String(courseId))
      .filter((batch) => !["completed", "cancelled", "archived"].includes(String(batch.status ?? "active").toLowerCase()))
      .filter((batch) => Number(batch.enrolledStudents ?? batch.studentsCount ?? batch.studentCount ?? 0) < Number(batch.capacity ?? Number.MAX_SAFE_INTEGER))
      .map((batch) => ({
        id: batch.batchId ?? batch.id,
        name: batch.batchName ?? batch.name ?? `Batch #${batch.batchId ?? batch.id}`,
        shift: batch.shift ?? batch.batchShift ?? "",
        organizationId: batch.organizationId ?? batch.OrganizationId ?? batch.orgId ?? batch.OrgId
          ?? batch.organization?.id ?? batch.organization?.organizationId,
        organizationEmail: batch.organizationEmail ?? batch.organization?.email ?? batch.organization?.organizationEmail,
        organizationName: batch.organizationName ?? batch.organization?.name ?? batch.organization?.organizationName,
      }))
      .filter((batch) => batch.id !== undefined && batch.id !== null && String(batch.id).trim() !== "");
    batchService.getAll({ pageNumber: 1, pageSize: 1000 })
      .then((response) => Object.fromEntries(selectedCourses.map((course) => [String(course.id), openBatchesFor(rowsOf(response), course.id)])))
      // Fallback: the per-course dropdown endpoint, one request per course.
      .catch(() => Promise.all(selectedCourses.map((course) =>
        apiClient.get(API_ENDPOINTS.liveClassDropdowns.batches, { params: { courseId: course.id } })
          .then((response) => [String(course.id), openBatchesFor(rowsOf(response), course.id)])
          .catch(() => [String(course.id), []]))).then(Object.fromEntries))
      .then((byCourse) => { if (active) setBatchesByCourse(byCourse); })
      .catch(() => active && setBatchesByCourse({}))
      .finally(() => active && setBatchesLoading(false));
    return () => { active = false; };
  }, [selectedCourses, purchasable]);

  // Demo mode also needs the dev server's demo backend switched on.
  useEffect(() => {
    if (!isDemoPaymentMode) return undefined;
    let active = true;
    demoPaymentApi.status()
      .then((status) => active && setDemoServer(status.enabled ? "ready" : "unavailable"))
      .catch(() => active && setDemoServer("unavailable"));
    return () => { active = false; };
  }, []);

  const courseBatches = selectedCourses.map((course) => ({ course, batches: batchesByCourse[String(course.id)] ?? [] }));

  // Block paying twice for a course the student already has.
  useEffect(() => {
    if (!purchasable || !isStudentAccount) return undefined;
    let active = true;
    courseService.getStudentCourses()
      .then((rows) => {
        if (!active) return;
        const enrolled = new Set(rows.map((row) => String(row.courseId ?? row.id)));
        setAlreadyEnrolledIds(selectedCourses.filter((course) => enrolled.has(String(course.id))).map((course) => course.name));
      })
      // Not a student account, or the list is unavailable: let the backend decide.
      .catch(() => {});
    return () => { active = false; };
  }, [purchasable, isStudentAccount, selectedCourses]);

  // Prefill from details saved for this purchase, then from the signed-in
  // profile (name, email and phone are all the auth profile carries).
  const defaultValues = useMemo(() => {
    const draft = readEnrollmentDraft();
    const saved = draft?.student || {};
    // An organization account may be signed in while a new learner is being
    // enrolled. Never copy that account's identity into the learner form.
    const studentProfile = isStudentAccount ? user : null;
    // Batches saved for these courses; a legacy single-course draft kept one batchId.
    const savedBatches = saved.batches ?? {};
    const legacyCourseId = draft?.course?.id;
    const batchDefaults = Object.fromEntries(selectedCourses.map((course) => [
      batchFieldName(course.id),
      savedBatches[String(course.id)] ?? (String(legacyCourseId) === String(course.id) ? (saved.batchId ?? "") : ""),
    ]));
    return {
      firstName: saved.firstName || studentProfile?.firstName || "",
      lastName: saved.lastName || studentProfile?.lastName || "",
      email: saved.email || studentProfile?.email || "",
      phone: saved.phone || digitsOnly(studentProfile?.phone ?? studentProfile?.phoneNumber),
      pincode: saved.pincode ?? "",
      state: saved.state ?? "",
      qualification: saved.qualification ?? "",
      experience: saved.experience ?? "",
      ...batchDefaults,
    };
    // Computed once: later profile updates are merged by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStudentAccount, user]);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    trigger,
    formState: { errors, isValid },
    watch,
  } = useForm({ mode: "onChange", defaultValues });

  // Fill blanks once the signed-in profile is available.
  useEffect(() => {
    if (!isStudentAccount || !user) return;
    const profile = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: digitsOnly(user.phone ?? user.phoneNumber),
    };
    Object.entries(profile).forEach(([field, value]) => {
      if (value && !getValues(field)) setValue(field, value, { shouldValidate: true });
    });
  }, [isStudentAccount, user, getValues, setValue]);

  // Keep entered details in the draft so a refresh or failed payment keeps them.
  useEffect(() => {
    if (!purchasable || savedReceipt) return undefined;
    const restoredPaymentStep = location.state?.resumeEnrollment === true
      && readEnrollmentDraft()?.step === "payment";
    updateEnrollmentDraft({ courses: selectedCourses, course: undefined, step: restoredPaymentStep ? "payment" : "details" });
    const subscription = watch((values) => {
      const student = Object.fromEntries(STUDENT_FIELDS.map((field) => [field, values[field] ?? ""]));
      student.batches = Object.fromEntries(selectedCourses.map((course) => [String(course.id), values[batchFieldName(course.id)] ?? ""]));
      updateEnrollmentDraft({ student });
    });
    return () => subscription.unsubscribe();
  }, [watch, purchasable, savedReceipt, selectedCourses, location.state]);

  // The batch <select> has no options until batches load, so the browser drops
  // a restored value; re-apply it once it is a valid option for this course.
  useEffect(() => {
    if (batchesLoading) return;
    selectedCourses.forEach((course) => {
      const field = batchFieldName(course.id);
      const restored = defaultValues[field];
      if (restored && (batchesByCourse[String(course.id)] ?? []).some((batch) => String(batch.id) === String(restored))) {
        setValue(field, String(restored), { shouldValidate: true });
      }
    });
  }, [batchesLoading, batchesByCourse, defaultValues, selectedCourses, setValue]);

  const couponDiscount = Math.min(coursePrice || 0, appliedCoupon?.type === "percent"
    ? Math.round((coursePrice || 0) * appliedCoupon.value / 100)
    : (appliedCoupon?.value || 0));
  const payableAmount = Math.max(0, (coursePrice || 0) - couponDiscount);
  // A course with no listed batch is still purchasable; the organization assigns the batch at approval.
  const detailsReady = purchasable && isValid && !batchesLoading;

  // The student and one line per course (each with its own batch), read from the form.
  const collectCheckout = useCallback(() => {
    const details = getValues();
    const firstName = String(details.firstName || "").trim();
    const lastName = String(details.lastName || "").trim();
    const student = {
      firstName,
      lastName,
      fullName: [firstName, lastName].filter(Boolean).join(" "),
      email: String(details.email || "").trim(),
      phone: digitsOnly(details.phone),
      pincode: details.pincode,
      state: details.state,
      qualification: details.qualification,
      experience: details.experience,
    };
    const lines = selectedCourses.map((selected) => {
      const batchId = details[batchFieldName(selected.id)];
      return {
        source: selected,
        course: { id: selected.id, title: selected.name },
        batch: (batchesByCourse[String(selected.id)] ?? []).find((item) => String(item.id) === String(batchId)) ?? null,
        batchId,
      };
    });
    return { student, lines };
  }, [batchesByCourse, getValues, selectedCourses]);

  // Saves the receipt so a refresh keeps it, and removes only the paid courses from the cart.
  const finishCheckout = useCallback((receipt, lines) => {
    writeEnrollmentDraft({ step: "complete", courses: selectedCourses, receipt });
    lines.forEach((line) => removeFromCart(line.course.id, { silent: true }));
    setEnrollmentResult(receipt);
    setStep(3);
    setShowSuccess(true);
  }, [removeFromCart, selectedCourses]);

  const methodLabel = [
    PAYMENT_METHODS.find((method) => method.id === paymentMethod)?.label ?? paymentMethod,
    paymentMethod === "upi" && upiApp ? `(${upiApp})` : "",
  ].filter(Boolean).join(" ");

  const completeDemoPayment = async (outcome, checkout = demoCheckout) => {
    if (!checkout || demoBusy) return;
    setDemoBusy(outcome);
    try {
      const result = await demoPaymentApi.completeOrder(checkout.order.orderId, {
        outcome,
        paymentMethod: methodLabel,
        attemptId: crypto.randomUUID(),
      });
      setDemoCheckout(null);
      if (!result.success) {
        setPaymentError({
          kind: "failed",
          message: `The demo payment failed (transaction ${result.transactionId}). No money was charged. Your details and cart are unchanged, so you can retry.`,
        });
        return;
      }
      const payment = {
        status: "Demo success",
        mode: "demo",
        label: DEMO_LABEL,
        verified: false,
        orderId: result.orderId,
        transactionId: result.transactionId,
        amount: result.amount,
        method: result.paymentMethod,
        paidAt: result.paidAt,
      };
      const items = result.requests.map((request) => ({ course: request.course, batch: request.batch, requestId: request.id, amount: request.amount }));
      finishCheckout({
        student: checkout.student,
        payment,
        enrollmentStatus: "PendingApproval",
        items,
        course: items[0].course,
        batch: items[0].batch,
        requestId: items[0].requestId,
      }, checkout.lines);
      toast.success("Demo payment recorded");
    } catch (err) {
      setDemoCheckout(null);
      setPaymentError({ kind: "failed", message: err?.message || "The demo payment couldn't be recorded. Please retry." });
    } finally {
      setDemoBusy(null);
    }
  };

  // Demo mode: the demo backend creates the order (one per checkout content,
  // so a repeated click reuses it) and the demo gateway modal picks the outcome.
  const startDemoPayment = async () => {
    if (demoServer !== "ready") {
      setPaymentError({ kind: "failed", message: "Demo payments are switched off on the dev server. Set DEMO_PAYMENTS_ENABLED=true and restart it." });
      return;
    }
    const { student, lines } = collectCheckout();
    const items = lines.map((line) => ({
      courseId: String(line.course.id),
      courseTitle: line.course.title,
      batchId: line.batch?.id ?? null,
      batchName: line.batch?.name ?? null,
      organizationId: organizationIdFor(line),
      listPrice: Number(line.source.price),
    }));
    const draft = readEnrollmentDraft() ?? {};
    const checkoutId = draft.demoCheckoutId ?? crypto.randomUUID();
    if (!draft.demoCheckoutId) updateEnrollmentDraft({ demoCheckoutId: checkoutId });
    const content = { student: [student.firstName, student.lastName, student.email, student.phone], items, couponDiscount };
    const order = await demoPaymentApi.createOrder({
      idempotencyKey: `${checkoutId}:${hashText(JSON.stringify(content))}`,
      student: { firstName: student.firstName, lastName: student.lastName, email: student.email, phone: student.phone },
      items,
      couponCode: appliedCoupon?.code,
      couponDiscount,
    });
    const checkout = { order, lines, student };
    setDemoCheckout(checkout);
    // Already paid (e.g. the page reloaded before the receipt was saved):
    // completing again returns the same recorded success.
    if (order.status === "Paid") await completeDemoPayment("success", checkout);
  };

  const cancelDemoPayment = () => {
    setDemoCheckout(null);
    setPaymentError({ kind: "cancelled", message: "Demo payment cancelled. No transaction was recorded and your details are saved." });
  };

  const handlePay = async () => {
    // One payment attempt at a time; a second click or callback is ignored.
    if (payingRef.current) return;
    const valid = await trigger();
    if (!valid) {
      setStep(1);
      return;
    }
    if (alreadyEnrolled) return;

    payingRef.current = true;
    setIsProcessing(true);
    setPaymentError(null);

    if (isDemoPaymentMode) {
      try {
        await startDemoPayment();
      } catch (err) {
        setPaymentError({ kind: "failed", message: err?.message || "Couldn't start the demo payment. Please retry." });
      } finally {
        payingRef.current = false;
        setIsProcessing(false);
      }
      return;
    }

    const { student, lines } = collectCheckout();

    try {
      // The backend receives the coupon code and creates the gateway order;
      // the gateway charges the order's amount, not a value from this page.
      // TEMPORARY (multi-course): CreateOrderDto has no course/line-item field,
      // so one order is created for the combined amount of every selected
      // course. Once the backend accepts line items it must price the order
      // itself and create the enrollments on verification.
      const order = await paymentApi.createOrder({
        userId: orderUserId,
        amount: payableAmount,
        currency: "INR",
        couponCode: appliedCoupon?.code,
      });
      const paidAmount = Number(order?.finalAmount ?? order?.payableAmount ?? payableAmount);

      const gatewayResult = await openRazorpayCheckout({
        order,
        amount: paidAmount,
        description: multiCourse ? `${selectedCourses.length} courses` : selectedCourse.name,
        prefill: { name: student.fullName, email: student.email, contact: student.phone },
      });

      // The gateway callback is not proof of payment: the backend verifies the signature.
      const verification = await paymentApi.verifyPayment(gatewayResult);
      if (!isPaymentVerified(verification)) {
        throw new PaymentError(
          `We couldn't verify this payment. If money was debited, contact support with payment ID ${gatewayResult.paymentId}.`,
          "unverified",
        );
      }

      const payment = {
        status: "Successful",
        verified: true,
        orderId: gatewayResult.orderId,
        transactionId: gatewayResult.paymentId,
        amount: paidAmount,
        method: methodLabel,
        paidAt: new Date().toISOString(),
      };
      // Existing enrollment step, once per course: the organization approves each
      // paid request and links the student to that course's batch. Identity
      // includes the course and payment ID, so a repeated verification never
      // creates a second request for any course.
      const shares = splitByListPrice(lines.map((line) => line.source.price), paidAmount);

      const items = [];
      for (const [index, line] of lines.entries()) {
        const lineStudent = { ...student, courseId: line.course.id, batchId: line.batchId };
        // The request records this course's share; the order total and course
        // count show it was paid together with the others in one payment.
        const linePayment = { ...payment, amount: shares[index], orderAmount: paidAmount, orderCourseCount: lines.length };
        const request = createEnrollmentApprovalRequest({
          student: lineStudent,
          course: line.source,
          batch: line.batch,
          payment: linePayment,
          organizationId: organizationIdFor(line),
        });
        enrollmentNotificationService.sendOrganizationApprovalNotification({
            student: lineStudent,
            course: line.source,
            batch: line.batch,
            payment: linePayment,
            requestId: request.id,
            organizationId: request.organizationId,
            organizationEmail: line.batch?.organizationEmail
              ?? line.source.organizationEmail
              ?? readEnrollmentDraft()?.organizationEmail,
          }).catch((notificationError) => {
          console.error(`Payment verified, but the organization notification for ${line.course.title} failed`, notificationError);
          });
        enrollmentNotificationService.sendPaymentConfirmation({
            student: lineStudent,
            course: line.source,
            batch: line.batch,
            payment: linePayment,
            requestId: request.id,
          }).catch((confirmationError) => {
          console.error(`Payment verified, but the student confirmation for ${line.course.title} failed`, confirmationError);
          });
        items.push({ course: line.course, batch: line.batch, requestId: request.id, amount: shares[index] });
      }

      finishCheckout({ student, payment, items, course: items[0].course, batch: items[0].batch, requestId: items[0].requestId }, lines);
      toast.success("Payment verified");
    } catch (err) {
      const cancelled = err?.code === "cancelled";
      setPaymentError({
        kind: cancelled ? "cancelled" : "failed",
        message: cancelled
          ? "Payment cancelled — you have not been charged. Your details are saved, so you can retry when ready."
          : (err?.response?.data?.message || err?.message || "Payment failed. Please try again."),
      });
    } finally {
      payingRef.current = false;
      setIsProcessing(false);
    }
  };

  // A guest has no account until the organization approves the enrollment,
  // so they leave the success screen for the catalog instead of the portal.
  const leaveSuccess = (route) => {
    clearEnrollmentDraft();
    navigate(route);
  };

  const handleCtaClick = step === 1
    ? handleSubmit(() => {
      updateEnrollmentDraft({ courses: selectedCourses, course: undefined, step: "payment" });
      setStep(2);
    })
    : handlePay;
  // OrderSummary appends the payable amount, so step 2 reads "Pay ₹25,000".
  // The retry case is explained by the payment-error notice above the methods.
  const ctaLabel = step === 1 ? "Continue to Checkout" : "Pay";
  const isCtaDisabled = step === 1 ? !detailsReady : (alreadyEnrolled || demoServer === "checking" || demoServer === "unavailable");

  return (
    <div
      className="flex min-h-screen flex-col transition-colors duration-300"
      style={{
        background: isDark ? t(isDark).bg : "linear-gradient(180deg, #F5F9FD 0%, #EAF2F9 55%, #F3F7FB 100%)",
        fontFamily: "'Sora', sans-serif",
        color: t(isDark).text,
      }}
    >
      <EnrollmentNavbar />
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[150px]"
          style={{ backgroundColor: `${BRAND.primary}08` }}
        />
        <div
          className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full blur-[150px]"
          style={{ backgroundColor: `${BRAND.secondary}08` }}
        />
        <div
          className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[150px]"
          style={{ backgroundColor: `${BRAND.primary}06` }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[150px]"
          style={{ backgroundColor: `${BRAND.accent}06` }}
        />
      </div>

      <DemoPaymentModal
        open={Boolean(demoCheckout) && !showSuccess}
        order={demoCheckout?.order}
        methodLabel={methodLabel}
        busy={demoBusy}
        onSucceed={() => completeDemoPayment("success")}
        onFail={() => completeDemoPayment("failed")}
        onCancel={cancelDemoPayment}
      />

      {showSuccess ? (
        <SuccessScreen
          course={{ ...selectedCourse, name: enrollmentResult?.course?.title || selectedCourse?.name }}
          finalPrice={enrollmentResult?.payment?.amount}
          receipt={enrollmentResult}
          isStudentAccount={isStudentAccount}
          onBrowseCourses={() => leaveSuccess(ROUTES.PUBLIC.COURSES)}
          onGoToDashboard={() => leaveSuccess(ROUTES.STUDENT.DASHBOARD)}
        />
      ) : !purchasable ? (
        <NoCourseSelected isDark={isDark} />
      ) : (
        <main className="relative mx-auto w-full max-w-7xl flex-1 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
          <CheckoutHeader currentStep={step} demoMode={isDemoPaymentMode} />

          <div className="mt-3 lg:mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-4 lg:gap-5">
              {/* ── LEFT COLUMN ── */}
              <div className="space-y-4 order-1">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-3"
                    >
                      {multiCourse
                        ? <SelectedCoursesCard isDark={isDark} courses={selectedCourses} />
                        : <CoursePreviewCard course={selectedCourse} />}
                      <StudentDetailsForm
                        register={register}
                        errors={errors}
                        appliedCoupon={appliedCoupon}
                        onApplyCoupon={setAppliedCoupon}
                        onRemoveCoupon={() => setAppliedCoupon(null)}
                        courseBatches={courseBatches}
                        batchesLoading={batchesLoading}
                        couponAmount={coursePrice}
                        canValidateCoupon
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-3"
                    >
                      {demoServer === "ready" && (
                        <Notice isDark={isDark} tone="warning" icon={FiAlertTriangle} title="Demo Payment Mode">
                          This is a test transaction. No real money will be charged.
                        </Notice>
                      )}
                      {demoServer === "unavailable" && (
                        <Notice isDark={isDark} tone="error" icon={FiAlertTriangle} title="Demo payments are switched off">
                          This checkout is in demo mode, but the dev server's demo backend isn't enabled. Set DEMO_PAYMENTS_ENABLED=true and restart the dev server.
                        </Notice>
                      )}
                      {alreadyEnrolled && (
                        <Notice
                          isDark={isDark}
                          tone="warning"
                          icon={FiAlertTriangle}
                          title={multiCourse ? `You're already enrolled in: ${alreadyEnrolledIds.join(", ")}` : "You're already enrolled in this course"}
                          action={<Link to={ROUTES.STUDENT.COURSES} className="font-semibold underline underline-offset-2">Go to My Courses</Link>}
                        >
                          {multiCourse ? "Go back to your cart and untick these courses — there's no need to pay for them again." : "There's no need to pay again."}
                        </Notice>
                      )}
                      {paymentError && (
                        <Notice
                          isDark={isDark}
                          tone={paymentError.kind === "cancelled" ? "warning" : "error"}
                          icon={FiAlertTriangle}
                          title={paymentError.kind === "cancelled" ? "Payment cancelled" : "Payment failed"}
                        >
                          {paymentError.message} {multiCourse ? "No enrollment has been submitted and all selected courses are still in your cart." : "Your enrollment has not been submitted and the course is still in your cart."}
                        </Notice>
                      )}
                      <PaymentSection
                        selected={paymentMethod}
                        onSelect={setPaymentMethod}
                        upiApp={upiApp}
                        onSelectUpiApp={setUpiApp}
                        demoMode={isDemoPaymentMode}
                      />
                      <TrustLogos />
                      <Testimonials />
                      <FAQSection />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── RIGHT COLUMN ── */}
              <div className="order-2">
                <div className="lg:sticky lg:top-20 space-y-3">
                  <OrderSummary
                    courseName={multiCourse ? `${selectedCourses.length} courses` : selectedCourse.name}
                    courseMeta={multiCourse ? "" : [selectedCourse.level, selectedCourse.duration].filter(Boolean).join(" • ")}
                    organizationName={multiCourse ? "" : selectedCourse.organizationName}
                    demoMode={isDemoPaymentMode}
                    disabledHint={step === 1 ? "Complete the required details and accept the terms to continue." : ""}
                    courseThumbnail={selectedCourse.thumbnail}
                    originalPrice={coursePrice}
                    discountAmount={0}
                    finalPrice={coursePrice}
                    couponDiscount={couponDiscount}
                    isLoading={isProcessing}
                    isDisabled={isCtaDisabled}
                    ctaLabel={ctaLabel}
                    footnote={isDemoPaymentMode ? "By enrolling you agree to our Terms of Service. Demo mode: no payment provider is contacted and no money is charged." : undefined}
                    onSubmit={handleCtaClick}
                    lines={selectedCourses}
                  />

                  {step === 2 && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep(1)}
                        className="flex-1 rounded-2xl px-4 py-3 text-sm font-medium transition-all"
                        style={{
                          border: `1px solid ${t(isDark).borderLight}`,
                          backgroundColor: t(isDark).overlay,
                          color: t(isDark).textMuted,
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = t(isDark).text; e.currentTarget.style.borderColor = t(isDark).borderMedium; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = t(isDark).textMuted; e.currentTarget.style.borderColor = t(isDark).borderLight; }}
                      >
                        ← Back to Details
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </main>
      )}
      <EnrollmentFooter isDark={isDark} />
    </div>
  );
};

export default EnrollmentPage;
