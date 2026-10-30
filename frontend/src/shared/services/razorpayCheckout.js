/**
 * Razorpay gateway helpers shared by the checkout and enrollment pages.
 *
 * Flow: paymentApi.createOrder → openRazorpayCheckout → paymentApi.verifyPayment.
 * The gateway callback alone is never treated as proof of payment; callers must
 * confirm the result with the backend via isPaymentVerified(verifyResponse).
 */

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

export class PaymentError extends Error {
  /** @param {"cancelled" | "failed" | "config"} code */
  constructor(message, code) {
    super(message);
    this.name = "PaymentError";
    this.code = code;
  }
}

export const loadRazorpay = async () => {
  if (window.Razorpay) return;
  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_URL;
    script.onload = resolve;
    script.onerror = () => reject(new PaymentError("Unable to load the payment gateway", "config"));
    document.head.appendChild(script);
  });
};

/**
 * Opens the gateway for an order created by POST /api/v1/orders/create.
 * Resolves with the fields POST /api/v1/payments/verify expects.
 */
export const openRazorpayCheckout = async ({ order, amount, name = "Kini EduHub", description, prefill }) => {
  await loadRazorpay();

  const key = order?.keyId || order?.razorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID;
  const gatewayOrderId = order?.razorpayOrderId || order?.gatewayOrderId;
  const databaseOrderId = order?.orderId ?? order?.id;
  if (!key || !gatewayOrderId || !databaseOrderId) {
    throw new PaymentError("Payment gateway configuration is incomplete", "config");
  }

  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay({
      key,
      order_id: gatewayOrderId,
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      name,
      description,
      prefill,
      handler: (response) => resolve({
        orderId: databaseOrderId,
        paymentId: response.razorpay_payment_id,
        signature: response.razorpay_signature,
      }),
      modal: { ondismiss: () => reject(new PaymentError("Payment cancelled", "cancelled")) },
    });
    checkout.on("payment.failed", (response) =>
      reject(new PaymentError(response.error?.description || "Payment failed", "failed")));
    checkout.open();
  });
};

export const isPaymentVerified = (verification) =>
  Boolean(verification?.verified ?? verification?.isVerified ?? verification?.success ?? verification?.status === "success");
