import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useThemeContext } from "@shared/context/ThemeContext";

import CheckoutHeader from "../components/CheckoutHeader";
import StudentDetailsForm from "../components/StudentDetailsForm";
import CourseSummaryCard from "../components/CourseSummaryCard";
import PriceBreakdown from "../components/PriceBreakdown";
import CouponSection from "../components/CouponSection";
import PaymentMethodSelector from "../components/PaymentMethodSelector";
import TrustBadges from "../components/TrustBadges";
import FAQMini from "../components/FAQMini";
import TermsAndConditions from "../components/TermsAndConditions";
import PaymentButton from "../components/PaymentButton";

import { COURSE_DATA, PRICE_DATA } from "@shared/data/mockData";
import { paymentApi } from "@shared/services/apiServices";
import { isPaymentVerified, openRazorpayCheckout } from "@shared/services/razorpayCheckout";
import invoiceService from "@shared/services/invoiceService";
import { enrollmentNotificationService } from "@shared/services/enrollmentNotificationService";
import { useAuth } from "@shared/hooks/useAuth";

/**
 * CheckoutPage
 * Top-level page that orchestrates the full checkout experience:
 * - Student details form (React Hook Form)
 * - Course summary + pricing
 * - Coupon application
 * - Payment method selection
 * - Terms acceptance
 * - Payment initiation
 *
 * Payment flow (steps 6-12 from the spec) are stubbed as async mock
 * functions ready to be wired up to a real backend / Razorpay or
 * Cashfree SDKs.
 */
const CheckoutPage = () => {
  const { isDark } = useThemeContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({ mode: "onBlur" });

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [isProcessing, setIsProcessing] = useState(false);

  // Watch consent checkboxes to drive the PaymentButton's disabled state
  const agreeTerms = watch("agreeTerms");
  const agreePrivacy = watch("agreePrivacy");

  // ---- Derived final amount (mirrors PriceBreakdown's calculation) ----
  const { originalPrice, discountPercent, gstPercent } = PRICE_DATA;
  const baseDiscount = Math.round((originalPrice * discountPercent) / 100);
  const priceAfterBaseDiscount = originalPrice - baseDiscount;
  const couponDiscount = appliedCoupon
    ? appliedCoupon.type === "percent"
      ? Math.round((priceAfterBaseDiscount * appliedCoupon.value) / 100)
      : appliedCoupon.value
    : 0;
  const taxableAmount = Math.max(originalPrice - baseDiscount - couponDiscount, 0);
  const finalAmount = taxableAmount + Math.round((taxableAmount * gstPercent) / 100);
  const formattedAmount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(finalAmount);

  // -------------------------------------------------------------
  // PAYMENT FLOW — order creation, gateway capture and server verification
  // -------------------------------------------------------------

  /** Step 6: Create a payment order on the backend */
  const createPaymentOrder = async () => {
    const userId = user?.userId ?? user?.id;
    if (!userId) throw new Error("Please sign in before making a payment");
    return paymentApi.createOrder({
      userId,
      amount: finalAmount,
      currency: "INR",
      couponCode: appliedCoupon?.code,
      paymentMethod,
    });
  };

  /** Step 7: Open Razorpay/Cashfree checkout modal */
  const openPaymentModal = (order) => openRazorpayCheckout({
    order,
    amount: finalAmount,
    name: "Pirnav Edutech",
    prefill: { name: [user?.firstName, user?.lastName].filter(Boolean).join(" "), email: user?.email, contact: user?.phone },
  });

  /** Step 8: Verify payment signature on the backend */
  const verifyPayment = async (paymentResult) => {
    return paymentApi.verifyPayment(paymentResult);
  };

  // -------------------------------------------------------------
  // Form submit handler — orchestrates the full flow
  // -------------------------------------------------------------
  const onSubmit = async (studentDetails) => {
    try {
      setIsProcessing(true);

      const order = await createPaymentOrder();
      const paymentResult = await openPaymentModal(order);
      const verification = await verifyPayment(paymentResult);

      if (!isPaymentVerified(verification)) {
        throw new Error("Payment verification failed");
      }

      await paymentApi.getOrder(order.orderId ?? order.id);
      try {
        const studentId = user?.studentId ?? user?.StudentId ?? user?.student?.studentId ?? user?.student?.id;
        const courseId = user?.courseId ?? user?.student?.courseId ?? COURSE_DATA.courseId ?? COURSE_DATA.id;
        const invoicePayload = {
          studentId: Number.isFinite(Number(studentId)) ? Number(studentId) : undefined,
          courseId: Number.isFinite(Number(courseId)) ? Number(courseId) : undefined,
          subTotal: finalAmount,
          discountAmount: baseDiscount + couponDiscount,
          taxPercentage: gstPercent,
          invoiceDate: new Date().toISOString(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          orderId: order.orderId ?? order.id,
          paymentId: paymentResult.paymentId,
          paymentMethod,
          paidAmount: finalAmount,
          status: "Paid",
          notes: `Payment invoice for ${COURSE_DATA.title ?? COURSE_DATA.name ?? "course"}`,
        };
        await invoiceService.create(invoicePayload);
      } catch (invoiceError) {
        console.error("Payment succeeded, but invoice creation failed", invoiceError);
        toast.error("Payment succeeded. Your invoice will be available shortly.");
      }
      try {
        await enrollmentNotificationService.sendPaymentConfirmation({
          student: studentDetails,
          course: COURSE_DATA,
          payment: {
            status: "Successful",
            amount: finalAmount,
            transactionId: paymentResult.paymentId,
            paidAt: new Date().toISOString(),
          },
          requestId: String(order.orderId ?? order.id),
        });
      } catch (emailError) {
        console.error("Payment succeeded, but its confirmation email could not be sent", emailError);
        toast.error("Payment succeeded. Confirmation email is pending.");
      }
      toast.success("Payment completed successfully");
      navigate("/student/dashboard", { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Checkout failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const consentGiven = Boolean(agreeTerms) && Boolean(agreePrivacy);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-[#030712] text-white" : "bg-slate-50 text-slate-900"}`}>
      {/* Ambient gradient background accents */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
        <CheckoutHeader currentStep={2} />

        <form onSubmit={handleSubmit(onSubmit)} className="mt-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 lg:gap-8">
            {/* ---------------- Left column ---------------- */}
            <div className="space-y-6 order-2 lg:order-1">
              <StudentDetailsForm register={register} errors={errors} />
              <PaymentMethodSelector selected={paymentMethod} onSelect={setPaymentMethod} />
              <TrustBadges />
              <FAQMini />
            </div>

            {/* ---------------- Right column (sticky on desktop) ---------------- */}
            <div className="space-y-6 order-1 lg:order-2">
              <div className="lg:sticky lg:top-8 space-y-6">
                <CourseSummaryCard course={COURSE_DATA} />
                <CouponSection
                  appliedCoupon={appliedCoupon}
                  amount={priceAfterBaseDiscount}
                  onApply={setAppliedCoupon}
                  onRemove={() => setAppliedCoupon(null)}
                />
                <PriceBreakdown priceData={PRICE_DATA} appliedCoupon={appliedCoupon} />
                <TermsAndConditions register={register} errors={errors} />
                <PaymentButton
                  isLoading={isProcessing}
                  disabled={!consentGiven}
                  amountLabel={formattedAmount}
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center text-xs text-slate-500"
        >
          © {new Date().getFullYear()} Pirnav Edutech. All rights reserved. Need help?{" "}
          <a href="#" className={`hover:underline ${isDark ? "text-cyan-400" : "text-cyan-600"}`}>
            Contact support
          </a>
        </motion.footer>
      </div>
    </div>
  );
};

export default CheckoutPage;
