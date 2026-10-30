import { useEffect, useState } from "react";
import { AlertCircle, ArrowRight, Check, CheckCircle2, Eye, EyeOff, KeyRound, LockKeyhole } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import RecoveryShell from "../components/RecoveryShell";
import { ROUTES } from "@shared/constants/routeConstants";
import { demoPaymentApi, isDemoPaymentMode } from "@shared/services/demoPaymentApi";

const PASSWORD_RULES = [
  { label: "8+ characters", test: (value) => value.length >= 8 },
  { label: "Uppercase letter", test: (value) => /[A-Z]/.test(value) },
  { label: "Lowercase letter", test: (value) => /[a-z]/.test(value) },
  { label: "Number", test: (value) => /\d/.test(value) },
  { label: "Special character", test: (value) => /[^A-Za-z0-9]/.test(value) },
];

const INPUT_CLASS = "h-12 w-full rounded-xl border border-slate-300 bg-white pl-12 pr-12 text-sm font-medium text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-500/30";

/**
 * Activation link target from the "Your Kini EduHub Account Is Approved"
 * email: the student sets their password once with a single-use, expiring
 * token. Only the Demo Payment Mode backend issues these tokens today.
 */
export default function ActivateAccount() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  // checking | valid | invalid | unsupported | done
  const [state, setState] = useState(() => (!isDemoPaymentMode ? "unsupported" : token ? "checking" : "invalid"));
  const [account, setAccount] = useState(null);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (state !== "checking") return undefined;
    let active = true;
    demoPaymentApi.inspectActivation(token)
      .then((info) => {
        if (!active) return;
        setAccount(info);
        if (info.status === "valid") return setState("valid");
        setError(info.status === "used" ? "This activation link has already been used. Sign in with your password." : "This activation link has expired. Ask your organization to send a new one.");
        setState("invalid");
      })
      .catch((requestError) => {
        if (!active) return;
        setError(requestError.message);
        setState("invalid");
      });
    return () => { active = false; };
  }, [state, token]);

  const passedRules = PASSWORD_RULES.map((rule) => rule.test(password));
  const allRulesPassed = passedRules.every(Boolean);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!allRulesPassed || !passwordsMatch || loading) return;
    setLoading(true);
    setError("");
    try {
      await demoPaymentApi.activateAccount(token, password);
      setState("done");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const description = {
    checking: "Checking your activation link…",
    valid: `Set a password for ${account?.email ?? "your account"} to finish activating it.`,
    invalid: "We couldn't use this activation link.",
    unsupported: "Account activation isn't available yet.",
    done: "Your account is active.",
  }[state];

  return (
    <RecoveryShell
      eyebrow={isDemoPaymentMode ? "Account activation (demo)" : "Account activation"}
      title={account?.firstName ? `Welcome, ${account.firstName}` : "Activate your account"}
      description={description}
      icon={KeyRound}
      backTo={ROUTES.AUTH.LOGIN}
      backLabel="Back to sign in"
    >
      {state === "done" ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center dark:border-emerald-500/20 dark:bg-emerald-500/10">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
          <p className="mt-3 text-sm font-semibold text-emerald-800 dark:text-emerald-200">Your password is set.</p>
          {/* The live Student Portal signs in through the backend, which doesn't know demo accounts yet. */}
          <p className="mt-2 text-xs leading-5 text-emerald-900/80 dark:text-emerald-200/80">
            This account was created by Demo Payment Mode. Signing in to the Student Portal with it needs the backend
            activation API; until that exists, demo accounts can't sign in.
          </p>
        </div>
      ) : state === "valid" ? (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="activation-password" className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">Password</label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="activation-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                autoFocus
                value={password}
                onChange={(event) => { setPassword(event.target.value); setError(""); }}
                placeholder="Create a strong password"
                className={INPUT_CLASS}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/50">
            {PASSWORD_RULES.map((rule, index) => (
              <div key={rule.label} className={`flex items-center gap-1.5 text-[11px] font-medium ${passedRules[index] ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`}>
                <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border ${passedRules[index] ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 dark:border-slate-600"}`}>
                  {passedRules[index] && <Check size={10} strokeWidth={3} />}
                </span>
                {rule.label}
              </div>
            ))}
          </div>

          <div>
            <label htmlFor="activation-confirm" className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">Confirm password</label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="activation-confirm"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => { setConfirmPassword(event.target.value); setError(""); }}
                placeholder="Re-enter your password"
                aria-invalid={Boolean(confirmPassword) && !passwordsMatch}
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div className="min-h-5">
            {error && (
              <p role="alert" className="flex items-start gap-1.5 text-xs font-medium leading-5 text-red-600 dark:text-red-400">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !allRulesPassed || !passwordsMatch}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 font-bold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50"
          >
            {loading ? "Activating…" : <>Activate account <ArrowRight size={17} /></>}
          </button>
        </form>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-300">
          {state === "checking" ? "One moment…" : state === "unsupported"
            ? "Activation links come from the enrollment approval email. The backend doesn't issue them yet, so there is nothing to activate here."
            : error || "This activation link is invalid."}
          {state !== "checking" && (
            <Link to={ROUTES.AUTH.LOGIN} className="mt-3 block font-semibold text-blue-600 dark:text-cyan-400">Go to sign in</Link>
          )}
        </div>
      )}
    </RecoveryShell>
  );
}
