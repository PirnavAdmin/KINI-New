import { useMemo, useState } from "react";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  Clock,
  CreditCard,
  Database,
  FileText,
  GraduationCap,
  ReceiptText,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

import { OrgEmpty, OrgHero, OrgKpiCard, OrgPage, OrgPanel, OrgTabs } from "@features/organization/components/org-ui/OrgPageKit";
import { RevenueArt } from "@features/organization/components/org-ui/OrgIllustrations";
import { demoOrganizationStore } from "@features/organization/data/demoOrganizationStore";

const TABS = [
  ["overview", "Overview"],
  ["courses", "Course Revenue"],
  ["batches", "Batch Revenue"],
  ["expenses", "Employee Expense"],
  ["outstanding", "Pending & Expected"],
];

const EMPTY = {
  courses: [
    GraduationCap,
    "course revenue records",
    "Course revenue is calculated from the organization fee snapshot and payment history.",
  ],
  batches: [
    CalendarDays,
    "batch revenue records",
    "Batch-level paid, pending, and expected amounts are shown from the same finance snapshot.",
  ],
  expenses: [
    Users,
    "expense records",
    "Payroll expense data is not connected yet, so this tab stays informative instead of showing blank placeholders.",
  ],
  outstanding: [
    ReceiptText,
    "outstanding amounts",
    "Pending student balances and expected collections are listed here.",
  ],
};

const formatINR = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatPeriod = (payments) => {
  const dates = payments
    .map((payment) => new Date(payment.date))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  if (!dates.length) return "No payment history yet";

  const first = dates[0];
  const last = dates[dates.length - 1];
  const sameMonth =
    first.getFullYear() === last.getFullYear() &&
    first.getMonth() === last.getMonth();

  const monthFormatter = new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  });
  const dateFormatter = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return sameMonth
    ? monthFormatter.format(first)
    : `${dateFormatter.format(first)} - ${dateFormatter.format(last)}`;
};

const groupFinanceRows = (students, keySelector, labelSelector) => {
  const groups = new Map();

  students.forEach((student) => {
    const key = keySelector(student);
    const label = labelSelector(student);
    const current = groups.get(key) || {
      id: key,
      label,
      students: 0,
      fee: 0,
      paid: 0,
      pending: 0,
    };

    current.students += 1;
    current.fee += Number(student.fee || 0);
    current.paid += Number(student.paid || 0);
    current.pending += Number(student.pending || 0);
    groups.set(key, current);
  });

  return Array.from(groups.values()).sort((a, b) => b.fee - a.fee);
};

export default function RevenueApiReady() {
  const [tab, setTab] = useState("overview");
  const finance = useMemo(() => demoOrganizationStore.getFinance(), []);

  const summary = useMemo(() => {
    const students = Array.isArray(finance.students) ? finance.students : [];
    const payments = Array.isArray(finance.payments) ? finance.payments : [];
    const courses = Array.isArray(finance.courses) ? finance.courses : [];
    const batches = Array.isArray(finance.batches) ? finance.batches : [];

    const totalCourseRevenue = students.reduce((sum, student) => sum + Number(student.fee || 0), 0);
    const paidAmount = students.reduce((sum, student) => sum + Number(student.paid || 0), 0);
    const outstandingAmount = students.reduce((sum, student) => sum + Number(student.pending || 0), 0);
    const collectionRate = totalCourseRevenue > 0 ? Math.round((paidAmount / totalCourseRevenue) * 100) : 0;
    const pendingStudents = students.filter((student) => Number(student.pending || 0) > 0).length;
    const recentPayment = [...payments]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    return {
      students,
      payments,
      courses,
      batches,
      totalCourseRevenue,
      paidAmount,
      outstandingAmount,
      netRevenue: paidAmount,
      collectionRate,
      pendingStudents,
      revenuePeriod: formatPeriod(payments),
      recentPayment,
      courseRows: groupFinanceRows(
        students,
        (student) => student.course?.id || student.courseId || "unassigned",
        (student) => student.course?.name || "Unassigned course",
      ),
      batchRows: groupFinanceRows(
        students,
        (student) => student.batch?.id || student.batchId || "unassigned",
        (student) => student.batch?.name || "Unassigned batch",
      ),
      pendingRows: students
        .filter((student) => Number(student.pending || 0) > 0)
        .sort((a, b) => Number(b.pending || 0) - Number(a.pending || 0)),
    };
  }, [finance]);

  return (
    <OrgPage className="revenue-overview-page">
      <OrgHero
        icon={BarChart3}
        title="Revenue Overview"
        badge={<span className="kx-badge-live">Demo finance snapshot</span>}
        subtitle="Track course income, student payments, outstanding balances, and the current net collection snapshot."
        tagline="Growth Today, Greater Learners Tomorrow"
        art={<RevenueArt />}
        motto={["Education", "Creates", "Brighter Futures"]}
      />

      <OrgTabs tabs={TABS} active={tab} onChange={setTab} label="Revenue sections" />

      {tab === "overview" ? (
        <RevenueOverview summary={summary} />
      ) : (
        <RevenueEmpty tab={tab} summary={summary} />
      )}
    </OrgPage>
  );
}

function RevenueOverview({ summary }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <section className="kx-grid kx-grid--4" aria-label="Revenue summary">
        <OrgKpiCard
          sparkline
          capsLabel
          tone="blue"
          icon={Database}
          label="Total course revenue"
          value={formatINR(summary.totalCourseRevenue)}
          hint={`${summary.students.length} students across ${summary.courses.length} courses`}
        />
        <OrgKpiCard
          sparkline
          capsLabel
          tone="orange"
          icon={Wallet}
          label="Paid amount"
          value={formatINR(summary.paidAmount)}
          hint={`${summary.collectionRate}% collected so far`}
        />
        <OrgKpiCard
          sparkline
          capsLabel
          tone="purple"
          icon={Clock}
          label="Outstanding amount"
          value={formatINR(summary.outstandingAmount)}
          hint={`${summary.pendingStudents} students still pending`}
        />
        <OrgKpiCard
          sparkline
          capsLabel
          tone="green"
          icon={BarChart3}
          label="Net revenue"
          value={formatINR(summary.netRevenue)}
          hint="Collected revenue from the available payment records"
        />
      </section>

      <div className="kx-grid kx-grid--main">
        <OrgPanel icon={CalendarDays} title="Revenue Period" subtitle={summary.revenuePeriod}>
          <div className="kx-grid kx-grid--2">
            <SmallStat label="Revenue collected" value={formatINR(summary.paidAmount)} icon={TrendingUp} />
            <SmallStat label="Outstanding" value={formatINR(summary.outstandingAmount)} icon={CreditCard} />
          </div>

          <div style={{ marginTop: 14 }}>
            {summary.recentPayment ? (
              <div className="kx-latest">
                <span className="kx-mini__icon kx-tone-blue" style={{ width: 58, height: 58 }}>
                  <FileText aria-hidden="true" />
                </span>
                <div style={{ minWidth: 0 }}>
                  <p className="kx-meta__label" style={{ textTransform: "uppercase", letterSpacing: ".06em", fontWeight: 600 }}>Latest payment</p>
                  <p className="kx-meta__value" style={{ fontSize: 17 }}>{summary.recentPayment.id}</p>
                  <p className="kx-meta__label" style={{ marginTop: 3 }}>
                    {summary.recentPayment.method || "Payment"} | {formatDate(summary.recentPayment.date)}
                  </p>
                </div>
                <p className="kx-latest__amount">{formatINR(summary.recentPayment.amount)}</p>
              </div>
            ) : (
              <OrgEmpty icon={CreditCard} title="No revenue data available" text="No organization-scoped payment records are available yet." />
            )}
          </div>
        </OrgPanel>

        <OrgPanel icon={ReceiptText} title="Revenue Formula" subtitle="Net revenue currently reflects collected amount from the available finance snapshot.">
          <div className="kx-formula">
            <div className="kx-formula__row kx-formula__row--add">
              <span>Total course revenue</span>
              <span>{formatINR(summary.totalCourseRevenue)}</span>
            </div>
            <div className="kx-formula__row kx-formula__row--sub">
              <span>- Outstanding amount</span>
              <span>{formatINR(summary.outstandingAmount)}</span>
            </div>
            <div className="kx-formula__row kx-formula__row--total">
              <span>= Net revenue collected</span>
              <span>{formatINR(summary.totalCourseRevenue - summary.outstandingAmount)}</span>
            </div>
          </div>

          <div className="kx-grid kx-grid--3" style={{ marginTop: 16 }}>
            {[
              ["Courses", summary.courses.length, BookOpen],
              ["Batches", summary.batches.length, Users],
              ["Payments", summary.payments.length, CreditCard],
            ].map(([label, value, Icon]) => (
              <div key={label} className="kx-mini kx-tone-blue">
                <span className="kx-mini__icon">
                  <Icon aria-hidden="true" />
                </span>
                <div>
                  <p className="kx-mini__label">{label}</p>
                  <p className="kx-mini__value">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </OrgPanel>
      </div>
    </div>
  );
}

function SmallStat({ label, value, icon: Icon }) {
  return (
    <div className="kx-mini kx-tone-orange">
      <span className="kx-mini__icon">
        <Icon aria-hidden="true" />
      </span>
      <div style={{ minWidth: 0 }}>
        <p className="kx-mini__label">{label}</p>
        <p className="kx-mini__value">{value}</p>
      </div>
    </div>
  );
}

function RevenueEmpty({ tab, summary }) {
  if (tab === "expenses") {
    return (
      <section className="kx-panel">
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Employee Expense
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Payroll expense data is not connected yet, so we keep this tab
              useful with the current finance snapshot instead of showing blank
              fields.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <SmallStat
                label="Revenue collected"
                value={formatINR(summary.paidAmount)}
                icon={TrendingUp}
              />
              <SmallStat
                label="Outstanding balance"
                value={formatINR(summary.outstandingAmount)}
                icon={CreditCard}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
            <OrgEmpty
              icon={Users}
              title="Expense API not connected"
              text="Connect employee expense or payroll records to show finalized expense totals here."
            />
          </div>
        </div>
      </section>
    );
  }

  if (tab === "courses") {
    return (
      <section className="kx-panel">
        <RevenueBreakdown
          title="Course Revenue"
          description="Course-wise billed, paid, and outstanding amounts."
          rows={summary.courseRows}
          emptyState={EMPTY.courses}
        />
      </section>
    );
  }

  if (tab === "batches") {
    return (
      <section className="kx-panel">
        <RevenueBreakdown
          title="Batch Revenue"
          description="Batch-level payment performance for each active cohort."
          rows={summary.batchRows}
          emptyState={EMPTY.batches}
        />
      </section>
    );
  }

  return (
    <section className="kx-panel">
      <RevenueBreakdown
        title="Pending & Expected"
        description="Students with a remaining balance and the amount still expected."
        rows={summary.pendingRows.map((student) => ({
          id: student.id,
          label: student.name,
          students: 1,
          fee: Number(student.fee || 0),
          paid: Number(student.paid || 0),
          pending: Number(student.pending || 0),
          meta: `${student.course?.name || "Unassigned course"} - ${
            student.batch?.name || "Unassigned batch"
          }`,
        }))}
        emptyState={EMPTY.outstanding}
      />
    </section>
  );
}

function RevenueBreakdown({ title, description, rows, emptyState }) {
  const [Icon, emptyLabel, emptyDescription] = emptyState;

  if (!rows.length) {
    return (
      <OrgEmpty
        icon={Icon}
        title={`No ${emptyLabel} found`}
        text={emptyDescription}
      />
    );
  }

  return (
    <div>
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-[1.4fr_.7fr_.7fr_.7fr] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-900">
          <span>Segment</span>
          <span>Paid</span>
          <span>Outstanding</span>
          <span className="text-right">Total</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {rows.map((row) => {
            const total = Number(row.fee || 0);
            const paid = Number(row.paid || 0);
            const pending = Number(row.pending || 0);
            const collectionRate = total > 0 ? Math.round((paid / total) * 100) : 0;

            return (
              <div
                key={row.id}
                className="grid grid-cols-[1.4fr_.7fr_.7fr_.7fr] gap-3 px-4 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900 dark:text-white">
                    {row.label}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {row.students} student{row.students === 1 ? "" : "s"}
                    {row.meta ? ` - ${row.meta}` : ""}
                  </p>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-[#f28a1e]"
                      style={{ width: `${collectionRate}%` }}
                    />
                  </div>
                </div>
                <div className="self-center text-sm font-semibold text-emerald-600">
                  {formatINR(paid)}
                </div>
                <div className="self-center text-sm font-semibold text-amber-600">
                  {formatINR(pending)}
                </div>
                <div className="self-center text-right text-sm font-bold text-slate-900 dark:text-white">
                  {formatINR(total)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
