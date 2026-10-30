import { Info, Globe, MapPin, Database, Mail, PhoneCall } from 'lucide-react'
import { LegalLayout, LegalList, LegalCallout } from './LegalLayout.jsx'
import { useThemeContext } from '@landing-shared/context/ThemeContext'

const sections = [
  {
    id: 'introduction',
    title: 'Introduction',
    icon: Info,
    content: (
      <>
        <p>
          Welcome, and thank you for your interest in Kini EdX Hub Pvt Ltd
          ("Company", "we", "us", or "our"). This Privacy Policy outlines how
          we collect, use, store, and protect your personal information when
          you visit our website, interact with our services, or contact us
          for information or assistance.
        </p>
        <p>This policy applies to:</p>
        <LegalList
          items={[
            'Our website and services (including online platforms, mobile applications, and downloadable software).',
            'Interactions through social media platforms such as Facebook, Instagram, LinkedIn, and similar channels.',
            'Communications via email, phone, or other written or oral means.',
          ]}
        />
        <p>
          We encourage you to read this policy carefully, along with any
          additional privacy notices specific to campaigns, programs, or
          promotions you participate in.
        </p>
      </>
    ),
  },
  {
    id: 'scope',
    title: 'Scope of Policy',
    icon: Globe,
    content: (
      <>
        <p>
          This Privacy Policy applies to data collected through our services
          and platforms, collectively referred to as the "Service." By using
          our Service, you agree to the terms outlined here. If you do not
          agree, please refrain from using our Service.
        </p>
        <p>
          We may update this policy periodically to reflect changes in our
          practices or legal requirements. Continued use of our services
          after updates means you accept the revised terms.
        </p>
      </>
    ),
  },
  {
    id: 'data-we-collect',
    title: 'What Personal Data We Collect',
    icon: Database,
    content: ({ isDark }) => (
      <>
        <p>We may collect the following categories of personal data:</p>
        <LegalList
          items={[
            'Personal Identification Information — name, email address, phone number, date of birth, and physical address.',
            'Payment Information — details related to course fees, transactions, and billing.',
            'Educational Data — academic background, project submissions, mock assessments, and placement progress.',
            'Technical Data — IP address, browser type, and activity logs for website interactions.',
            'Communication Records — emails, feedback forms, and chat history for support and queries.',
          ]}
        />
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Note: We do not collect sensitive data, such as religious beliefs,
          health details, or criminal records.
        </p>
      </>
    ),
  },
  {
    id: 'electronic-communication',
    title: 'Electronic Communication',
    icon: Mail,
    content: (
      <>
        <p>
          When you voluntarily visit our website or send us electronic mail,
          we will keep a record of this information so that we can respond to
          you. We only collect information from you when you register on our
          site or fill out a form. When filling out a form on our site, you
          may be asked to enter your name, e-mail address, or phone number.
          You may, however, visit our site anonymously.
        </p>
        <p>
          All agreements, notices, disclosures, and other communications that
          we provide to you electronically — via email, SMS, or through our
          website — satisfy any legal requirement that such communication be
          in writing.
        </p>
      </>
    ),
  },
  {
    id: 'consent-to-contact',
    title: 'Consent to Contact',
    icon: PhoneCall,
    content: (
      <>
        <p>
          By submitting a form on our website, you authorize Kini EdX Hub Pvt
          Ltd and its representatives to call, SMS, email, or WhatsApp you
          about its updates and notifications.
        </p>
        <LegalCallout title="This consent overrides DND / NDNC registration">
          In case you have submitted your personal information and contact
          details, we reserve the right to call, SMS, email, or WhatsApp you
          about our products and offers — even if your number has DND (Do
          Not Disturb) activated on it. This consent overrides any
          registration for DND / NDNC (National Do Not Call Registry).
        </LegalCallout>
      </>
    ),
  },
  {
    id: 'contact',
    title: 'Contact Information',
    icon: MapPin,
    content: ({ isDark }) => (
      <>
        <p>
          For questions or requests related to this Privacy Policy, please
          contact us at:
        </p>
        <div
          className={`rounded-2xl border p-5 text-sm ${
            isDark
              ? 'border-white/10 bg-white/[0.03] text-white'
              : 'border-slate-200 bg-slate-50 text-slate-900'
          }`}
        >
          <p className="font-medium">Kini EdX Hub Pvt Ltd</p>
          <p className={`mt-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            407, 4th Floor, Capital Park, Madhapur, Hyderabad, 500081
          </p>
          <p className="mt-3">
            <a
              href="mailto:contact@kiniedx.com"
              className={`${isDark ? 'text-primary-300' : 'text-brand-blue'} hover:underline`}
            >
              contact@kiniedx.com
            </a>
          </p>
          <p className="mt-1">
            <a
              href="tel:+919000198239"
              className={`${isDark ? 'text-primary-300' : 'text-brand-blue'} hover:underline`}
            >
              +91 90001 98239
            </a>
          </p>
        </div>
      </>
    ),
  },
]

export default function PrivacyPolicy() {
  const { isDark } = useThemeContext()

  // Process each section: if content is a function, call it with isDark
  const processedSections = sections.map((section) => ({
    ...section,
    content: typeof section.content === 'function' ? section.content({ isDark }) : section.content,
  }))

  return (
    <LegalLayout
      eyebrow="Legal · Privacy"
      title="Privacy Policy"
      intro="How Kini EdX Hub Pvt Ltd collects, uses, stores, and protects your personal information."
      sections={processedSections}
      path="/privacy-policy"
    />
  )
}