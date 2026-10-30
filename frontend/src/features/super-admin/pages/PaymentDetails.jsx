import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  CreditCard,
  Hash,
  ReceiptText,
  Wallet,
} from "lucide-react";
import { paymentApi, getApiErrorMessage } from "@shared/services/apiServices";

export default function PaymentDetails() {
  const { paymentId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(state?.payment ?? null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (payment) return;
    paymentApi
      .getOrder(paymentId)
      .then(setPayment)
      .catch((e) =>
        setError(getApiErrorMessage(e, "Payment details could not be loaded")),
      );
  }, [paymentId, payment]);
  if (error || !payment)
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <div className="text-center">
          <ReceiptText className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-3 font-bold text-slate-600">
            {error || "Loading payment details…"}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white"
          >
            Go back
          </button>
        </div>
      </div>
    );
  const amount = Number(payment.amount ?? payment.price ?? payment.total ?? 0);
  const status = payment.status ?? payment.paymentStatus ?? "Completed";
  return (
    <div className="space-y-3 p-2 sm:p-3 lg:p-4">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <section className="rounded-3xl bg-gradient-to-r from-blue-700 to-cyan-500 p-6 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-blue-100">
              Payment details
            </p>
            <h1 className="mt-2 text-3xl font-black">
              PAY-{String(paymentId).padStart(6, "0")}
            </h1>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black">
              ₹{amount.toLocaleString("en-IN")}
            </p>
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-300 px-3 py-1 text-xs font-black text-emerald-950">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {status}
            </span>
          </div>
        </div>
      </section>
      <div className="grid gap-4 sm:grid-cols-2">
        <Detail
          icon={Building2}
          label="Organization"
          value={
            payment.organizationName ??
            payment.organization?.name ??
            "Platform customer"
          }
        />
        <Detail
          icon={CreditCard}
          label="Payment method"
          value={payment.method ?? payment.paymentMethod ?? "Online payment"}
        />
        <Detail
          icon={Hash}
          label="Order ID"
          value={payment.orderId ?? payment.id ?? paymentId}
        />
        <Detail
          icon={Wallet}
          label="Currency"
          value={payment.currency ?? "INR"}
        />
      </div>
    </div>
  );
}
function Detail({ icon: Icon, label, value }) {
  return (
    <section className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <span className="rounded-xl bg-blue-50 p-3 text-blue-600">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="mt-1 font-black text-slate-900">{value}</p>
      </div>
    </section>
  );
}
