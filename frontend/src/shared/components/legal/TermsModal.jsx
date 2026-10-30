import { FiShield } from "react-icons/fi";
import ModalWrapper from "./ModalWrapper";
import { useThemeContext } from "@shared/context/ThemeContext";

const BRAND = {
  primary: "#085FA7",
  secondary: "#5CA347",
};

const SECTIONS = [
  {
    title: "Acceptance of Terms",
    content:
      "By accessing or using KiniEduHub's platform, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, you must not use our services. Continued use of the platform constitutes acceptance of any updates or modifications to these terms.",
  },
  {
    title: "Eligibility",
    content:
      "You must be at least 18 years of age to enroll in our courses. If you are under 18, you must have a parent or guardian's consent. You represent that all information provided during registration is accurate, complete, and current.",
  },
  {
    title: "Account Responsibilities",
    content:
      "You are solely responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. KiniEduHub is not liable for any loss or damage arising from your failure to safeguard your login information.",
  },
  {
    title: "Course Access",
    content:
      "Upon successful enrollment and payment, you receive a non-transferable license to access the course materials for your personal educational use. Access duration is specified at the time of purchase. Sharing account access or course materials with others is strictly prohibited.",
  },
  {
    title: "Payments",
    content:
      "All payments must be made through our authorized payment gateway. Prices are subject to change, but enrolled students will not be affected by price changes. All fees are non-transferable except as outlined in our refund policy.",
  },
  {
    title: "Refund Policy",
    content:
      "You may request a full refund within 7 days of enrollment, provided you have not attended any live sessions. A prorated refund is available for the first 30 days. No refunds are issued after 30 days from enrollment. Refund processing takes 5–10 business days.",
  },
  {
    title: "Certificates",
    content:
      "Course completion certificates are awarded upon meeting all assessment criteria, including minimum attendance, assignment submission, and passing the final evaluation. Digital certificates are issued within 7 days of completion. Physical certificates may incur additional shipping charges.",
  },
  {
    title: "Intellectual Property",
    content:
      "All course content, including videos, code samples, assignments, and proprietary frameworks, is the intellectual property of KiniEduHub. You may not reproduce, distribute, modify, or create derivative works without explicit written permission.",
  },
  {
    title: "Student Conduct",
    content:
      "Students are expected to maintain professional and respectful behavior in all interactions — including live sessions, discussion forums, and peer reviews. Harassment, hate speech, plagiarism, or any disruptive behavior may result in immediate suspension without refund.",
  },
  {
    title: "Assessment Guidelines",
    content:
      "All assessments must be completed independently unless explicitly designated as a group project. Plagiarism, unauthorized collaboration, or use of prohibited resources will result in disqualification and possible account termination.",
  },
  {
    title: "Termination",
    content:
      "KiniEduHub reserves the right to suspend or terminate accounts for violations of these terms. In the event of termination due to a breach, no refunds will be issued. You may terminate your account at any time by contacting support.",
  },
  {
    title: "Limitation of Liability",
    content:
      "KiniEduHub shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform. Our total liability is limited to the amount you paid for the specific course giving rise to the claim.",
  },
  {
    title: "Contact Information",
    content:
      "For questions about these Terms & Conditions, please contact our support team at legal@kiniedutech.com or write to us at KiniEduHub, Bangalore, Karnataka, India. We aim to respond to all inquiries within 48 business hours.",
  },
];

const TermsModal = ({ open, onClose }) => {
  const { isDark } = useThemeContext();

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      icon={FiShield}
      title="Terms & Conditions"
      subtitle="Please review our policies before proceeding."
    >
      <div className="space-y-6">
        {SECTIONS.map((section, idx) => (
          <SectionCard
            key={section.title}
            section={section}
            index={idx}
            isDark={isDark}
          />
        ))}
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

export default TermsModal;
