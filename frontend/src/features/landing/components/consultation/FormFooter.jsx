/**
 * FormFooter — Terms, privacy policy, and support links for the consultation form.
 *
 * Props:
 *   className → Additional wrapper classes
 */
export default function FormFooter({ className = '' }) {
  return (
    <div className={`text-xs text-slate-500 leading-relaxed ${className}`}>
      <p>
        By submitting, you agree to our{' '}
        <a
          href="#"
          className="text-[#0F4FA8] hover:underline transition-colors duration-200"
          onClick={(e) => e.preventDefault()}
        >
          Terms of Service
        </a>{' '}
        and{' '}
        <a
          href="#"
          className="text-[#0F4FA8] hover:underline transition-colors duration-200"
          onClick={(e) => e.preventDefault()}
        >
          Privacy Policy
        </a>
        . We'll never share your information with third parties.
      </p>
    </div>
  )
}
