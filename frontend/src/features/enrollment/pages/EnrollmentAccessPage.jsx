import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import EnrollmentShell, { EnrollmentCard, EnrollmentNotice } from "../components/EnrollmentShell";
import { inputClass, primaryButtonClass, primaryButtonStyle } from "../utils/enrollmentUi";
import { publicEnrollmentApi, toEnrollmentError } from "@shared/services/publicEnrollmentApi";

/** Request a fresh private enrollment link by email (no sign-in). */
export default function EnrollmentAccessPage() {
  const [email, setEmail] = useState("");
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && enrollmentNumber.trim().length >= 6;

  const submit = async (event) => {
    event.preventDefault();
    if (!valid || sending) return;
    setSending(true);
    setError(null);
    try {
      await publicEnrollmentApi.requestAccessLink({ email: email.trim(), enrollmentNumber: enrollmentNumber.trim() });
      setSent(true);
    } catch (err) {
      setError(toEnrollmentError(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <EnrollmentShell width="max-w-lg">
      <EnrollmentCard>
        <Mail className="h-8 w-8 text-sky-700 dark:text-sky-300" aria-hidden="true" />
        <h1 className="mt-3 text-xl font-bold">Get a new enrollment link</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Enter the email you enrolled with and your enrollment number (it starts with <span className="font-mono">KEN-</span> and is in your enrollment email).
          We'll email you a new private link. Any older link stops working.
        </p>

        {sent ? (
          <div className="mt-5">
            <EnrollmentNotice tone="success" icon={CheckCircle2} title="Check your email">
              If the details match an enrollment, a new link is on its way. It can take a few minutes to arrive.
            </EnrollmentNotice>
            <Link to="/courses" className="mt-4 inline-block text-sm font-semibold text-sky-700 hover:underline dark:text-sky-300">Back to courses</Link>
          </div>
        ) : (
          <form className="mt-5 space-y-4" onSubmit={submit} noValidate>
            <div>
              <label htmlFor="access-email" className="mb-1.5 block text-sm font-semibold">Email</label>
              <input id="access-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label htmlFor="access-number" className="mb-1.5 block text-sm font-semibold">Enrollment number</label>
              <input
                id="access-number"
                value={enrollmentNumber}
                onChange={(e) => setEnrollmentNumber(e.target.value.toUpperCase())}
                placeholder="KEN-261117-AB12CD"
                className={`${inputClass} font-mono`}
                required
              />
            </div>
            {error && <EnrollmentNotice tone="error" title="Couldn't send the link">{error.message}</EnrollmentNotice>}
            <button type="submit" className={`${primaryButtonClass} w-full`} style={primaryButtonStyle} disabled={!valid || sending}>
              {sending ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Sending…</> : "Email me a new link"}
            </button>
          </form>
        )}
      </EnrollmentCard>
    </EnrollmentShell>
  );
}
