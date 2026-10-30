import {
  BookOpen, UserCheck, CreditCard, Users, Copyright,
  ShieldAlert, XOctagon, RefreshCw, Scale, Mail,
} from 'lucide-react'
import { LegalLayout, LegalList, LegalCallout } from './LegalLayout.jsx'
import { useThemeContext } from '@landing-shared/context/ThemeContext' // adjust path if needed

const sections = [
  {
    id: 'services',
    title: 'Services Provided',
    icon: BookOpen,
    content: (
      <>
        <p>
          By enrolling in courses or using services provided by Kini EdX Hub
          Pvt Ltd, you agree to abide by these Terms and Conditions. Kini EdX
          Hub offers:
        </p>
        <LegalList
          items={[
            'Instructor-led online and offline training sessions.',
            'Hands-on projects, mock assessments, and aptitude tests.',
            'Placement assistance upon successful completion.',
          ]}
        />
        <p>
          We reserve the right to modify, update, or discontinue any services
          at any time without prior notice.
        </p>
      </>
    ),
  },
  {
    id: 'account-registration',
    title: 'Account Registration',
    icon: UserCheck,
    content: (
      <LegalList
        items={[
          'Students must provide accurate and complete information during registration.',
          'Each account is unique and non-transferable.',
        ]}
      />
    ),
  },
  {
    id: 'subscription-payments',
    title: 'Subscription and Payments',
    icon: CreditCard,
    content: (
      <>
        <p>
          Full payment is required to access the course materials and
          resources.
        </p>
        <LegalCallout title="Batch changes carry a ₹10,000 fee">
          Batch changes will incur an additional fee of ₹10,000 for valid
          reasons.
        </LegalCallout>
      </>
    ),
  },
  {
    id: 'user-conduct',
    title: 'User Conduct',
    icon: Users,
    content: (
      <>
        <LegalList
          items={[
            'Regular attendance and punctuality (80%) are mandatory.',
            'Use of mobile phones during class is prohibited without prior permission.',
          ]}
        />
        <LegalCallout title="Misbehavior can result in expulsion without refund">
          Misbehavior or indiscipline will result in serious action,
          including expulsion — without refund.
        </LegalCallout>
      </>
    ),
  },
  {
    id: 'ip-rights',
    title: 'Intellectual Property Rights',
    icon: Copyright,
    content: (
      <p>
        All course content, materials, and resources provided by Kini EdX
        Hub Pvt Ltd are protected by copyright laws. Unauthorized use,
        sharing, or distribution is prohibited.
      </p>
    ),
  },
  {
    id: 'liability',
    title: 'Limitation of Liability',
    icon: ShieldAlert,
    content: (
      <>
        <p>Kini EdX Hub Pvt Ltd is not responsible for:</p>
        <LegalList
          items={[
            'Failure to meet placement goals due to industry demand or student performance.',
            'Losses or damages arising from technical issues or misuse of services.',
          ]}
        />
      </>
    ),
  },
  {
    id: 'termination',
    title: 'Termination of Services',
    icon: XOctagon,
    content: (
      <p>
        Kini EdX Hub Pvt Ltd reserves the right to terminate services for
        students violating these terms.
      </p>
    ),
  },
  {
    id: 'modifications',
    title: 'Modifications to Terms',
    icon: RefreshCw,
    content: (
      <p>
        These Terms and Conditions may be updated periodically. Students will
        be notified of significant changes via email or website
        announcements.
      </p>
    ),
  },
  {
    id: 'governing-law',
    title: ' Governing Law',
    icon: Scale,
    content: (
      <p>
        These Terms and Conditions are governed by the laws of Telangana,
        India.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact Us',
    icon: Mail,
    content: ({ isDark }) => (
      <>
        <p>For any questions regarding these Terms, contact us at:</p>
        <div className={`rounded-2xl border p-5 text-sm ${
          isDark
            ? 'border-white/10 bg-white/[0.03] text-white'
            : 'border-slate-200 bg-slate-50 text-slate-900'
        }`}>
          <p className="font-medium">Kini EdX Hub Pvt Ltd</p>
          <p className={`mt-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            407, 4th Floor, Capital Park, Madhapur, Hyderabad, 500081
          </p>
          <p className="mt-3">
            <a href="mailto:contact@kiniedx.com" className="text-brand-blue hover:underline dark:text-primary-300">
              contact@kiniedx.com
            </a>
          </p>
          <p className="mt-1">
            <a href="tel:+919000198239" className="text-brand-blue hover:underline dark:text-primary-300">
              +91 90001 98239
            </a>
          </p>
        </div>
      </>
    ),
  },
]

export default function TermsAndConditions() {
  const { isDark } = useThemeContext()

  // Process each section: if content is a function, call it with isDark
  const processedSections = sections.map((section) => ({
    ...section,
    content: typeof section.content === 'function' ? section.content({ isDark }) : section.content,
  }))

  return (
    <LegalLayout
      eyebrow="Legal · Terms"
      title="Terms and Conditions"
      intro="The terms that apply when you enroll in courses or use services provided by Kini EdX Hub Pvt Ltd."
      sections={processedSections}
      className={isDark ? 'dark' : ''}
      path="/terms-conditions"
    />
  )
}