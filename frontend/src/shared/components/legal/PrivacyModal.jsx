import { FiLock } from "react-icons/fi";
import ModalWrapper from "./ModalWrapper";
import { useThemeContext } from "@shared/context/ThemeContext";

const BRAND = {
  primary: "#085FA7",
  secondary: "#5CA347",
};

const SECTIONS = [
  {
    title: "Information We Collect",
    content:
      "When you register, enroll in courses, or use our platform, we collect information you provide directly, including your full name, email address, phone number, educational qualifications, professional experience, and payment details. We also automatically collect certain information about your device, browsing actions, and usage patterns.",
  },
  {
    title: "Personal Information",
    content:
      "Personal information refers to data that can be used to identify you as an individual. This includes your name, email address, phone number, and billing details. We collect this information only when you voluntarily provide it during registration, enrollment, or when contacting our support team.",
  },
  {
    title: "Usage Analytics",
    content:
      "We use analytics tools to understand how you interact with our platform. This includes pages visited, time spent on course materials, assessment performance, feature usage, and navigation patterns. This data helps us improve the learning experience and optimize platform performance.",
  },
  {
    title: "Cookies",
    content:
      "KiniEduHub uses cookies and similar tracking technologies to enhance your experience. Essential cookies are required for platform functionality, while analytics and preference cookies help us personalize your experience. You can manage cookie preferences through your browser settings.",
  },
  {
    title: "Third-Party Services",
    content:
      "We partner with trusted third-party service providers for payment processing, video hosting, analytics, email communications, and cloud infrastructure. These partners have access to the minimum data necessary to perform their functions and are contractually bound to protect your data.",
  },
  {
    title: "Data Retention",
    content:
      "We retain your personal information for as long as your account is active or as needed to provide you with our services. Following account termination, we retain your data for a period of 90 days before permanent deletion, unless legal obligations require longer retention.",
  },
  {
    title: "Security Practices",
    content:
      "We implement industry-standard security measures including SSL/TLS encryption for all data in transit, AES-256 encryption for sensitive data at rest, regular security audits, and strict access controls. Our platform undergoes periodic penetration testing by independent security firms.",
  },
  {
    title: "Your Rights",
    content:
      "You have the right to access, correct, update, or request deletion of your personal information. You may also object to or restrict certain processing activities. To exercise these rights, please contact our Data Protection Officer at privacy@kiniedutech.com.",
  },
  {
    title: "Email Communications",
    content:
      "We send transactional emails related to your enrollment, course progress, certificates, and account management. With your consent, we may also send promotional communications about new courses, offers, and learning resources. You can opt out of marketing emails at any time.",
  },
  {
    title: "Refund Information",
    content:
      "In the event of a refund, we retain your basic information (name, email, course details) for accounting and fraud prevention purposes. Payment data is handled by our payment gateway partners and is not stored on our primary servers.",
  },
  {
    title: "Children's Privacy",
    content:
      "Our platform is not intended for children under the age of 13. We do not knowingly collect personal information from children. If we become aware that a child under 13 has provided us with personal data, we will take immediate steps to delete such information.",
  },
  {
    title: "Contact Support",
    content:
      "If you have questions or concerns about this Privacy Policy or our data practices, please reach out to our Data Protection Officer at privacy@kiniedutech.com or write to KiniEduHub, Bangalore, Karnataka, India. We are committed to addressing your concerns promptly.",
  },
];

const PrivacyModal = ({ open, onClose }) => {
  const { isDark } = useThemeContext();

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      icon={FiLock}
      title="Privacy Policy"
      subtitle="How KiniEduHub collects, stores and protects user data."
    >
      <div className="space-y-5">
        <p
          className="text-xs sm:text-sm leading-relaxed mb-2"
          style={{
            color: isDark ? "#CBD5E1" : "#475569",
          }}
        >
          Last updated: January 2026. This Privacy Policy describes how KiniEduHub ("we", "our", or "us") collects, uses, and shares your personal information when you use our platform, website, and services.
        </p>

        <div className="space-y-4">
          {SECTIONS.map((section, idx) => (
            <SectionCard
              key={section.title}
              section={section}
              index={idx}
              isDark={isDark}
            />
          ))}
        </div>
      </div>
    </ModalWrapper>
  );
};

const SectionCard = ({ section, index, isDark }) => {
  return (
    <div
      className="rounded-xl p-4 sm:p-5 transition-colors duration-200"
      style={{
        backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}`,
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className="flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold shrink-0 mt-0.5"
          style={{
            background: `linear-gradient(135deg, ${BRAND.primary}1A, ${BRAND.secondary}1A)`,
            color: BRAND.primary,
            border: `1px solid ${BRAND.primary}1A`,
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <div>
          <h3
            className="text-sm font-semibold mb-1.5"
            style={{
              fontFamily: "'Sora', sans-serif",
              color: isDark ? "#F8FAFC" : "#0F172A",
            }}
          >
            {section.title}
          </h3>
          <p
            className="text-xs sm:text-sm leading-relaxed"
            style={{
              color: isDark ? "#94A3B8" : "#64748B",
            }}
          >
            {section.content}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyModal;
