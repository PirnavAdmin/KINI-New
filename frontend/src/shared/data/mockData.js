// =====================================================
// MOCK DATA — Replace with real API responses
// =====================================================

export const COURSE_DATA = {
  id: "course_data_science_pro",
  thumbnail:
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
  name: "Data Science & Machine Learning Bootcamp",
  duration: "6 Months",
  mode: "Online (Live + Recorded)",
  trainer: "Dr. Ananya Sharma",
  projects: 12,
  placementAssistance: true,
  certificateIncluded: true,
};

export const PRICE_DATA = {
  originalPrice: 49999,
  discountPercent: 20, // base discount before coupon
  gstPercent: 18,
};

export const QUALIFICATION_OPTIONS = [
  "High School",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
  "Other",
];

export const EXPERIENCE_OPTIONS = [
  "Student / Fresher",
  "0-1 Years",
  "1-3 Years",
  "3-5 Years",
  "5+ Years",
];

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Delhi",
  "Karnataka",
  "Maharashtra",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "West Bengal",
  "Other",
];

// Coupon codes available for redemption (mock validation)
export const VALID_COUPONS = {
  PIRNAV10: { type: "percent", value: 10, label: "10% extra off" },
  WELCOME500: { type: "flat", value: 500, label: "₹500 off" },
  EDU25: { type: "percent", value: 25, label: "25% extra off" },
};

export const PAYMENT_METHODS = [
  { id: "upi", label: "UPI", description: "Pay via Google Pay, PhonePe, Paytm" },
  { id: "card_credit", label: "Credit Card", description: "Visa, Mastercard, RuPay & more" },
  { id: "card_debit", label: "Debit Card", description: "All major banks supported" },
  { id: "netbanking", label: "Net Banking", description: "60+ banks supported" },
  { id: "wallet", label: "Wallet", description: "Paytm, Amazon Pay, Mobikwik" },
];

export const TRUST_BADGES = [
  {
    id: "secure",
    title: "Secure Payments",
    description: "256-bit SSL encrypted transactions",
  },
  {
    id: "invoice",
    title: "GST Invoice",
    description: "Get a valid invoice for reimbursement",
  },
  {
    id: "placement",
    title: "Placement Support",
    description: "Dedicated career assistance team",
  },
  {
    id: "certificate",
    title: "Certificate Included",
    description: "Industry-recognized certification",
  },
  {
    id: "mentorship",
    title: "Industry Mentorship",
    description: "1:1 sessions with working professionals",
  },
  {
    id: "community",
    title: "Lifetime Community Access",
    description: "Join 10,000+ learners network",
  },
];

export const FAQ_DATA = [
  {
    id: "refund",
    question: "What is the refund policy?",
    answer:
      "We offer a 7-day no-questions-asked refund policy from the date of purchase. If you're not satisfied with the course content, simply raise a request from your dashboard and the full amount will be refunded to your original payment method within 5-7 business days.",
  },
  {
    id: "certificate",
    question: "How does the certificate work?",
    answer:
      "Upon successful completion of the course (including all assignments and the final project), you'll receive an industry-recognized certificate from Pirnav Edutech. The certificate includes a unique verification ID that can be shared with employers and verified online.",
  },
  {
    id: "placement",
    question: "What does placement assistance include?",
    answer:
      "Placement assistance includes resume building workshops, mock interviews with industry experts, access to our exclusive hiring partner network, and dedicated 1:1 career counselling sessions until you land your first role in the field.",
  },
  {
    id: "access",
    question: "How long do I have access to the course?",
    answer:
      "You get lifetime access to all course materials, including future updates and additional content added to the curriculum. You can also re-watch live session recordings at any time from your learning dashboard.",
  },
];

// Progress steps for the checkout flow indicator
export const CHECKOUT_STEPS = [
  { id: 1, label: "Course Selection" },
  { id: 2, label: "Checkout" },
  { id: 3, label: "Payment" },
  { id: 4, label: "Success" },
];
