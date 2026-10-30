import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, BadgeCheck, BookOpen, Check, CheckCircle2, Clock3, CreditCard, GraduationCap, Layers3, LoaderCircle, LockKeyhole, Mail, Phone, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { getApiErrorMessage } from "@shared/services/apiServices";
import { batchService } from "@shared/services/batchService";
import { createEnrollmentApprovalRequest } from "@shared/services/enrollmentApprovalStore";
import { enrollmentNotificationService } from "@shared/services/enrollmentNotificationService";

const DRAFT_KEY = "kini:enrollment:draft";
const PAYMENT_KEY = "kini:enrollment:payments";
const readJson = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || "") || fallback; } catch { return fallback; } };
const writeDraft = (draft) => localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
const isEmail = (value) => /^\S+@\S+\.\S+$/.test(value);
const isPhone = (value) => /^\d{10}$/.test(value.replace(/\D/g, ""));
const shiftFromBatch = (batch = {}) => {
  const explicit = String(batch.shift ?? batch.batchShift ?? batch.session ?? "").trim();
  if (explicit) return explicit[0].toUpperCase() + explicit.slice(1).toLowerCase();
  const text = `${batch.batchName ?? batch.name ?? ""} ${batch.startTime ?? batch.time ?? ""}`.toLowerCase();
  if (text.includes("evening") || text.includes("pm")) return "Evening";
  if (text.includes("afternoon")) return "Afternoon";
  return "Morning";
};
const createMockPayment = (amount, method) => {
  const timestamp = new Date();
  return { status: "Successful", transactionId: `TXN${timestamp.getTime()}${String(timestamp.getMilliseconds()).padStart(3, "0")}`, amount, method, paidAt: timestamp.toISOString() };
};

const inputClass = "mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-[15px] font-normal text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";

function Progress({ payment }) {
  return <div className="flex items-center" aria-label="Enrollment progress">
    <div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-full bg-indigo-600 text-sm font-bold text-white">{payment ? <Check className="h-4 w-4" /> : "1"}</span><span className="hidden text-sm font-semibold text-slate-900 sm:block">Your details</span></div>
    <div className={`mx-3 h-px w-10 sm:mx-5 sm:w-16 ${payment ? "bg-indigo-500" : "bg-slate-200"}`} />
    <div className="flex items-center gap-2"><span className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${payment ? "bg-indigo-600 text-white" : "border border-slate-200 bg-slate-50 text-slate-400"}`}>2</span><span className={`hidden text-sm font-semibold sm:block ${payment ? "text-slate-900" : "text-slate-400"}`}>Payment</span></div>
  </div>;
}

export default function Enroll() {
  const navigate = useNavigate();
  const initial = useMemo(() => readJson(DRAFT_KEY, {}), []);
  const [course] = useState(initial.course || null);
  const [step, setStep] = useState(initial.step === "payment" ? "payment" : "details");
  const [student, setStudent] = useState(() => {
    const saved = initial.student || { firstName: "", lastName: "", email: "", phone: "", preferredShift: "Evening", batchId: "" };
    return { preferredShift: "Evening", ...saved, phone: String(saved.phone || "").replace(/\D/g, "").slice(0, 10) };
  });
  const [method, setMethod] = useState("UPI");
  const [payment, setPayment] = useState(initial.payment || null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(initial.result || null);
  const [courseBatches, setCourseBatches] = useState([]);
  const [batchesLoading, setBatchesLoading] = useState(Boolean(course?.id));
  const [batchLookupFailed, setBatchLookupFailed] = useState(false);
  const creatingStudentRef = useRef(false);
  const fallbackBatches = useMemo(() => (course?.batchIds || []).map((id, index) => ({ id, name: course.batchNames?.[index] || `Batch ${id}`, shift: shiftFromBatch({ name: course.batchNames?.[index] }) })).filter(({ id }) => Number(id) > 0), [course]);
  const batches = courseBatches.length ? courseBatches : fallbackBatches;
  const matchingBatches = useMemo(() => batches.filter((batch) => batch.shift === student.preferredShift), [batches, student.preferredShift]);
  const amount = Number(course?.price || 0);
  const persist = (next) => writeDraft({ course, student, payment, result, ...next });

  useEffect(() => {
    let active = true;
    if (!course?.id) return undefined;
    batchService.getAll({ pageNumber: 1, pageSize: 1000 })
      .then((response) => {
        if (!active) return;
        const eligible = (response?.data || [])
          .filter((batch) => String(batch.courseId ?? batch.course?.courseId ?? batch.course?.id) === String(course.id))
          .filter((batch) => ["active", "upcoming", "planned"].includes(String(batch.status || "").toLowerCase()))
          .filter((batch) => {
            const capacity = Number(batch.capacity ?? batch.maxStudents ?? 0);
            const enrolled = Number(batch.enrolledStudents ?? batch.studentsCount ?? batch.studentCount ?? 0);
            return capacity > 0 && enrolled < capacity;
          })
          .sort((left, right) => new Date(left.startDate || 0) - new Date(right.startDate || 0))
          .map((batch) => ({
            id: batch.batchId ?? batch.id,
            name: batch.batchName ?? batch.name ?? `Batch ${batch.batchId ?? batch.id}`,
            shift: shiftFromBatch(batch),
            startTime: batch.startTime ?? batch.time ?? "",
            endTime: batch.endTime ?? "",
            capacity: Number(batch.capacity ?? batch.maxStudents ?? 0),
            enrolled: Number(batch.enrolledStudents ?? batch.studentsCount ?? batch.studentCount ?? 0),
          }));
        setCourseBatches(eligible);
      })
      .catch(() => { setCourseBatches([]); setBatchLookupFailed(true); })
      .finally(() => { if (active) setBatchesLoading(false); });
    return () => { active = false; };
  }, [course?.id]);

  const continueToPayment = (event) => {
    event.preventDefault(); setMessage("");
    if (!course?.id) return setMessage("Please select a course from the course list first.");
    if (!student.firstName.trim() || !student.lastName.trim()) return setMessage("Enter your first and last name.");
    if (!isEmail(student.email)) return setMessage("Enter a valid email address.");
    if (!isPhone(student.phone)) return setMessage("Enter a valid 10-digit mobile number.");
    if (batchesLoading) return setMessage("Checking batch availability. Please try again in a moment.");
    if (batchLookupFailed && !fallbackBatches.length) return setMessage("Unable to verify available batch capacity. Please try again.");
    if (!student.preferredShift) return setMessage("Select your preferred batch shift.");
    if (!matchingBatches.length) return setMessage(`No available ${student.preferredShift} batch was found for this course.`);
    if (!student.batchId || !matchingBatches.some((batch) => String(batch.id) === String(student.batchId))) return setMessage(`Select an available ${student.preferredShift} batch.`);
    const nextStudent = { ...student };
    setStudent(nextStudent); persist({ student: nextStudent, step: "payment" }); setStep("payment");
  };
  const pay = async () => {
    const key = `${student.email.toLowerCase()}:${course.id}`;
    const payments = readJson(PAYMENT_KEY, {});
    if (payments[key]?.status === "Successful") { setPayment(payments[key]); persist({ payment: payments[key] }); return createStudent(payments[key]); }
    setBusy(true); setMessage("");
    await new Promise((resolve) => window.setTimeout(resolve, 1100));
    const next = createMockPayment(amount, method);
    payments[key] = next; localStorage.setItem(PAYMENT_KEY, JSON.stringify(payments)); setPayment(next); persist({ payment: next });
    await createStudent(next); setBusy(false);
  };
  const createStudent = async (verifiedPayment) => {
    if (verifiedPayment?.status !== "Successful" || !verifiedPayment.transactionId || Number(verifiedPayment.amount) !== amount) return setMessage("Payment verification failed. Please try again.");
    if (creatingStudentRef.current) return;
    creatingStudentRef.current = true; setBusy(true); setMessage("");
    try {
      const request = createEnrollmentApprovalRequest({
        student: { ...student, phone: student.phone.replace(/\D/g, "") },
        course,
        batch: batches.find((batch) => String(batch.id) === String(student.batchId)),
        payment: verifiedPayment,
      });
      const completion = { requestId: request.id, username: student.email, status: "Pending organization approval", confirmationEmailSent: false, confirmationEmailPending: true };
      setResult(completion); persist({ result: completion, step: "success" });
      enrollmentNotificationService.sendPaymentConfirmation({
          student,
          course,
          batch: batches.find((batch) => String(batch.id) === String(student.batchId)),
          payment: verifiedPayment,
          requestId: request.id,
        })
        .then(() => {
          const emailed = { ...completion, confirmationEmailSent: true, confirmationEmailPending: false };
          setResult(emailed);
          writeDraft({ course, student, payment: verifiedPayment, result: emailed, step: "success" });
        })
        .catch((emailError) => {
        console.error("Unable to send enrollment payment confirmation email", emailError);
          const pending = { ...completion, confirmationEmailPending: false };
          setResult(pending);
          writeDraft({ course, student, payment: verifiedPayment, result: pending, step: "success" });
        });
    } catch (error) {
      const detail = getApiErrorMessage(error, "Unable to complete enrollment at this time.");
      setMessage(`${detail} Your verified payment is saved; use Retry enrollment without paying again.`);
    } finally { creatingStudentRef.current = false; setBusy(false); }
  };

  if (!course) return <main className="grid min-h-screen place-items-center bg-slate-50 p-6"><section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-9 text-center shadow-xl shadow-slate-200/60"><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-indigo-50 text-indigo-600"><BookOpen className="h-8 w-8" /></span><h1 className="mt-5 text-2xl font-bold text-slate-950">Choose a course first</h1><p className="mt-2 text-sm text-slate-500">Select a course before starting your enrollment.</p><Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white">View courses <ArrowRight className="h-4 w-4" /></Link></section></main>;

  if (result) return <main className="grid min-h-screen place-items-center bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6"><section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl shadow-indigo-100/70 sm:p-10"><span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-amber-50 ring-8 ring-amber-50/50"><CheckCircle2 className="h-11 w-11 text-amber-500" /></span><p className="mt-7 text-center text-xs font-bold uppercase tracking-[.22em] text-amber-600">Payment confirmed</p><h1 className="mt-2 text-center text-3xl font-bold text-slate-950">Enrollment submitted successfully</h1><p className="mt-2 text-center text-sm leading-6 text-slate-500">Your payment was successful. We will review your enrollment as quickly as possible, usually within a few hours.</p><div className={`mt-5 rounded-2xl border px-4 py-3 text-center text-sm ${result.confirmationEmailSent ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>{result.confirmationEmailSent ? <>Payment confirmation has been emailed to <b>{result.username}</b>.</> : result.confirmationEmailPending ? <>Payment confirmed. Email is being sent now to <b>{result.username}</b>—you do not need to wait on this page.</> : <>Your payment is safely recorded. Email delivery is pending; keep your request ID for reference.</>}</div><dl className="mt-7 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-slate-50/60 px-5 text-sm">{[["Request ID", result.requestId], ["Course", course.title], ["Batch", batches.find((batch) => String(batch.id) === String(student.batchId))?.name], ["Payment status", payment.status], ["Transaction ID", payment.transactionId]].map(([label, value]) => <div key={label} className="flex justify-between gap-4 py-3.5"><dt className="text-slate-500">{label}</dt><dd className="text-right font-semibold text-slate-900">{value}</dd></div>)}</dl><p className="mt-4 text-center text-xs leading-5 text-slate-500">After organization approval, your login URL, username, temporary password, course and batch details will be sent to <b>{result.username}</b>.</p><button onClick={() => navigate("/", { replace: true })} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200">Back to home <ArrowRight className="h-4 w-4" /></button></section></main>;

  const inputs = [
    { name: "firstName", label: "First name", placeholder: "Enter your first name", icon: UserRound },
    { name: "lastName", label: "Last name", placeholder: "Enter your last name", icon: UserRound },
    { name: "email", label: "Email address", placeholder: "you@example.com", icon: Mail },
    { name: "phone", label: "Mobile number", placeholder: "10-digit mobile number", icon: Phone },
  ];

  return <main className="relative min-h-screen overflow-hidden bg-[#f5f7fb] px-4 py-6 sm:px-6 sm:py-10">
    <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" /><div className="absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-cyan-200/30 blur-3xl" />
    <section className="relative mx-auto grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-2xl shadow-slate-300/40 lg:grid-cols-[.78fr_1.22fr]">
      <aside className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-800 p-7 text-white sm:p-10 lg:p-12">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[40px] border-white/5" />
        <div className="relative flex h-full flex-col"><Link to="/" className="flex w-fit items-center gap-2 text-sm font-semibold text-indigo-100 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to courses</Link>
          <div className="mt-10 lg:mt-16"><span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-indigo-100"><Sparkles className="h-3.5 w-3.5" /> Your next chapter starts here</span><h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">Invest in skills that move you forward.</h2><p className="mt-4 text-sm leading-6 text-indigo-100/75">Complete your enrollment in two simple steps and start your learning journey.</p></div>
          <div className="mt-9 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm lg:mt-auto"><div className="flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white text-indigo-700"><GraduationCap className="h-6 w-6" /></span><div><p className="text-xs font-semibold uppercase tracking-wider text-indigo-200">Selected course</p><h3 className="mt-1 text-xl font-bold">{course.title}</h3></div></div><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl bg-black/15 p-3"><Clock3 className="h-4 w-4 text-indigo-200" /><p className="mt-2 text-xs text-indigo-200">Duration</p><p className="text-sm font-semibold">{course.duration || "Self-paced"}</p></div><div className="rounded-xl bg-black/15 p-3"><Layers3 className="h-4 w-4 text-indigo-200" /><p className="mt-2 text-xs text-indigo-200">Level</p><p className="text-sm font-semibold">{course.level || "All levels"}</p></div></div><div className="mt-5 flex items-end justify-between border-t border-white/10 pt-5"><span className="text-sm text-indigo-200">Course fee</span><span className="text-2xl font-bold">₹{amount.toLocaleString("en-IN")}</span></div></div>
        </div>
      </aside>
      <div className="p-6 sm:p-10 lg:p-12"><Progress payment={step === "payment"} /><div className="mt-9"><p className="text-xs font-bold uppercase tracking-[.18em] text-indigo-600">Step {step === "details" ? "01" : "02"}</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{step === "details" ? "Tell us about yourself" : "Complete your payment"}</h1><p className="mt-2 text-sm leading-6 text-slate-500">{step === "details" ? "Enter your details below to reserve your seat in this course." : "Choose a payment method and securely confirm your enrollment."}</p></div>
        {message && <div role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</div>}
        {step === "details" ? <form onSubmit={continueToPayment} className="mt-7 space-y-5"><div className="grid gap-5 sm:grid-cols-2">{inputs.map(({ name, label, placeholder, icon: Icon }) => { const mobile = name === "phone"; return <label key={name} className="text-sm font-semibold text-slate-700">{label}<span className="relative block"><Icon className="pointer-events-none absolute left-3.5 top-1/2 mt-1 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" /><input required aria-label={label} placeholder={placeholder} autoComplete={mobile ? "tel" : name} type={name === "email" ? "email" : "text"} inputMode={mobile ? "numeric" : undefined} maxLength={mobile ? 10 : undefined} pattern={mobile ? "[0-9]{10}" : undefined} value={student[name]} onChange={(event) => setStudent({ ...student, [name]: mobile ? event.target.value.replace(/\D/g, "").slice(0, 10) : event.target.value })} className={inputClass} /></span></label>; })}</div><div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-700">Preferred shift<select value={student.preferredShift} onChange={(event) => setStudent({ ...student, preferredShift: event.target.value, batchId: "" })} className={`${inputClass} appearance-none pl-4`}>{["Morning", "Afternoon", "Evening"].map((shift) => <option key={shift}>{shift}</option>)}</select></label><label className="text-sm font-semibold text-slate-700">Available batch<select required value={student.batchId} onChange={(event) => setStudent({ ...student, batchId: event.target.value })} className={`${inputClass} appearance-none pl-4`}><option value="">Select {student.preferredShift} batch</option>{matchingBatches.map((batch) => <option key={batch.id} value={batch.id}>{batch.name}{batch.startTime ? ` · ${batch.startTime}${batch.endTime ? `–${batch.endTime}` : ""}` : ""}{batch.capacity ? ` · ${batch.capacity - batch.enrolled} seats` : ""}</option>)}</select></label></div>{!batchesLoading && !matchingBatches.length && <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">No available {student.preferredShift} batch for this course. Choose another shift or contact the organization.</p>}<button className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700">Continue to payment <ArrowRight className="h-4 w-4" /></button><div className="flex items-center justify-center gap-2 text-xs text-slate-400"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Your information is safe and encrypted</div></form>
        : <div className="mt-7 space-y-5"><label className="block text-sm font-semibold text-slate-700">Payment method<span className="relative block"><CreditCard className="pointer-events-none absolute left-3.5 top-1/2 mt-1 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" /><select value={method} onChange={(event) => setMethod(event.target.value)} className={`${inputClass} appearance-none`}>{["UPI", "Credit Card", "Debit Card", "Net Banking"].map((name) => <option key={name}>{name}</option>)}</select></span></label><div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><div className="flex justify-between text-sm"><span className="text-slate-500">Course fee</span><b>₹{amount.toLocaleString("en-IN")}</b></div><div className="my-4 border-t border-dashed border-slate-300" /><div className="flex items-end justify-between"><b>Total payable</b><span className="text-2xl font-bold">₹{amount.toLocaleString("en-IN")}</span></div></div><div className="flex gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4"><LockKeyhole className="h-4 w-4 shrink-0 text-emerald-600" /><p className="text-xs text-emerald-800"><b>Secure mock payment.</b> Your transaction is protected.</p></div><button disabled={busy} onClick={pay} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 disabled:opacity-60">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}{busy ? "Processing payment..." : `Pay ₹${amount.toLocaleString("en-IN")}`}</button>{payment && !busy && <button onClick={() => createStudent(payment)} className="w-full rounded-xl border border-indigo-200 py-3 text-sm font-bold text-indigo-700">Retry enrollment</button>}<button onClick={() => setStep("details")} className="flex w-full items-center justify-center gap-2 text-sm font-semibold text-slate-500"><ArrowLeft className="h-4 w-4" /> Back to details</button></div>}
      </div>
    </section><p className="relative mt-5 text-center text-xs text-slate-400">© 2026 KiniEdxHub · Learn. Grow. Succeed.</p>
  </main>;
}
