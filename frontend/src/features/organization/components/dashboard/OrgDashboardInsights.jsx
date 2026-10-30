import PropTypes from "prop-types";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  Check,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  IndianRupee,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import { EmptyState, Panel } from "./DashboardPanel";

/* ──────────────────────────────────────────────────────────────────────
   Organization dashboard — operations, finance and student analytics.
   Presentation only; InstituteAdminDashboard owns loading and scoping.
   ────────────────────────────────────────────────────────────────────── */

const rupees = (value) => `₹${(Number(value) || 0).toLocaleString("en-IN")}`;
const rupeesOrDash = (value) => (value === undefined || value === null ? "—" : rupees(value));

const CHART_TICK = { fontSize: 10, fill: "#64748b" };
const TOOLTIP_STYLE = { borderRadius: 10, border: "1px solid #e4ebf4", fontSize: 12, boxShadow: "0 8px 24px rgba(15,42,74,.12)" };

/** approvals: [{ id, name, type, course, sla, time, docs: [[label, ok]], path }] */
export function OperationsCard({ approvals, onViewAll, onReview }) {
  const rows = [...approvals]
    .sort((a, b) => {
      const hours = (item) => Number.parseInt(item.sla?.match(/\d+/)?.[0] || "0", 10);
      return hours(b) - hours(a);
    })
    .slice(0, 3);
  return (
    <Panel
      icon={ClipboardCheck}
      tone="orange"
      title="Operations Overview"
      subtitle={approvals.length ? `${approvals.length} approval${approvals.length === 1 ? "" : "s"} awaiting review` : "Pending approvals"}
      action={{ label: "View All", onClick: onViewAll }}
      bodyClassName="is-flush"
    >
      {rows.length ? (
        <ul className="kd-approvals">
          {rows.map((item) => {
            const hasIssues = item.docs.some(([, ok]) => !ok);
            const allVerified = item.docs.every(([, ok]) => ok);
            return (
              <li key={item.id}>
                <div className="kd-approvals__top">
                  <div className="kd-approvals__copy">
                    <p className="kd-approvals__name">{item.name}</p>
                    <p className="kd-approvals__meta">
                      {item.type || "Approval"} · {item.course || "—"} · {item.sla || `Pending ${item.time.replace(" ago", "")}`.trim()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onReview(item, hasIssues)}
                    className={`kd-btn is-small ${hasIssues ? "is-warning" : "is-primary"}`}
                  >
                    {hasIssues ? "Review issues" : "Approve"}
                  </button>
                </div>
                {allVerified ? (
                  <p className="kd-tag is-green"><Check aria-hidden="true" /> All documents verified</p>
                ) : (
                  <div className="kd-approvals__docs">
                    {item.docs.map(([label, ok]) => (
                      <span
                        key={label}
                        aria-label={`${label}: ${ok ? "Verified" : "Missing or rejected"}`}
                        className={`kd-tag ${ok ? "is-green" : "is-red"}`}
                      >
                        {label} · {ok ? "Verified" : "Missing / rejected"}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState icon={Check} text="No approvals waiting for review." />
      )}
    </Panel>
  );
}

const MONTH_LABELS = Array.from({ length: 12 }, (_, month) =>
  new Intl.DateTimeFormat("en-IN", { month: "short" }).format(new Date(2026, month, 1)),
);

/**
 * finance: { collected, pending, overdue, collectionRate, billed }
 * trend:   [{ month: "YYYY-MM", value }] — present only when the payment API answered.
 */
export function RevenueCard({ finance, trend, note, available, onViewFinance, onOpenTab }) {
  const year = new Date().getFullYear();
  const byMonth = new Map(trend.map((point) => [point.month, Number(point.value) || 0]));
  const series = MONTH_LABELS.map((label, index) => ({
    label,
    value: byMonth.get(`${year}-${String(index + 1).padStart(2, "0")}`) ?? 0,
  }));
  const tiles = [
    ["Collected", finance.collected, "green", "all"],
    ["Pending", finance.pending, "orange", "pending"],
    ["Overdue", finance.overdue, "red", "overdue"],
  ];
  return (
    <Panel
      icon={IndianRupee}
      tone="blue"
      title="Revenue Overview"
      action={{ label: "View Finance", onClick: onViewFinance, tone: "orange" }}
    >
      <div className="kd-stats">
        {tiles.map(([label, value, tone, tab]) => (
          <button key={label} type="button" className={`kd-stat is-${tone} is-button`} onClick={() => onOpenTab(tab)}>
            <b className="kd-stat__money">{rupeesOrDash(value)}</b>
            <small>{label}</small>
          </button>
        ))}
      </div>
      <div className="kd-chart-head">
        <p className="kd-subhead">{note}</p>
        {available && finance.billed > 0 && (
          <span className="kd-chart-head__meta">{finance.collectionRate}% of {rupees(finance.billed)} collected</span>
        )}
      </div>
      {available ? (
        <div className="kd-chart is-revenue">
          <ResponsiveContainer>
            <AreaChart data={series} margin={{ top: 6, right: 6, bottom: 0, left: -18 }}>
              <defs>
                <linearGradient id="kd-revenue-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#2f6fe4" stopOpacity={0.22} />
                  <stop offset="1" stopColor="#2f6fe4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#edf2f8" vertical />
              <XAxis dataKey="label" tick={CHART_TICK} axisLine={false} tickLine={false} interval={0} />
              <YAxis tick={CHART_TICK} axisLine={false} tickLine={false} allowDecimals={false} width={44}
                domain={[0, (max) => Math.max(1, max)]}
                tickFormatter={(value) => (value >= 100000 ? `${Math.round(value / 100000)}L` : value >= 1000 ? `${Math.round(value / 1000)}k` : value)} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [rupees(value), "Collected"]} />
              <Area type="monotone" dataKey="value" stroke="#2f6fe4" strokeWidth={2} fill="url(#kd-revenue-fill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <EmptyState icon={CreditCard} text="Payment data is unavailable right now." boxed />
      )}
    </Panel>
  );
}

/** series: [{ day, present, absent }] */
export function AttendanceCard({ scope, onScope, value, series, hasData, change, onAnalytics }) {
  const students = scope === "students";
  return (
    <Panel
      icon={UserCheck}
      tone="blue"
      title={`${students ? "Student" : "Employee"} attendance - Last 7 days`}
      action={{ label: "Analytics", onClick: onAnalytics, tone: "orange" }}
    >
      <div className="kd-tabs" role="tablist" aria-label="Attendance scope">
        {["students", "employees"].map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={scope === key}
            className={`kd-tabs__tab${scope === key ? " is-active" : ""}`}
            onClick={() => onScope(key)}
          >
            {key === "students" ? "Students" : "Employees"}
          </button>
        ))}
      </div>
      {hasData ? (
        <>
          <div className="kd-figure">
            <b>{value == null ? "—" : `${Number(value).toLocaleString("en-IN")}%`}</b>
            <small>{students ? "Student attendance" : "Employee attendance"}</small>
            {change !== undefined && <span className="kd-tag is-green">{change}% vs prior week</span>}
          </div>
          <div className="kd-chart is-attendance">
            <ResponsiveContainer>
              <BarChart data={series} barGap={2} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8eef5" />
                <XAxis dataKey="day" tick={CHART_TICK} axisLine={false} tickLine={false} />
                <YAxis hide allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(47,111,228,.06)" }} />
                <Bar dataKey="present" name="Present" fill="#2f6fe4" radius={[3, 3, 0, 0]} barSize={11} />
                <Bar dataKey="absent" name="Absent" fill="#cbd5e1" radius={[3, 3, 0, 0]} barSize={8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <EmptyState icon={ClipboardList} text="No attendance data recorded yet." boxed />
      )}
      <p className="kd-footnote">{students ? "Class attendance across enrolled students" : "Workforce attendance across staff"}</p>
    </Panel>
  );
}

/** groups: [{ name, value, count, color }] */
export function StudentProgressCard({ groups, selected, onSelect, onViewAll }) {
  return (
    <Panel icon={TrendingUp} tone="purple" title="Student Progress" subtitle="Current learning health" action={{ label: "View All", onClick: onViewAll }}>
      {groups.length ? (
        <div className="kd-split">
          <div
            className="kd-split__chart"
            role="group"
            tabIndex={0}
            aria-label={`Student progress: ${selected.name}, ${selected.value == null ? "unavailable" : `${selected.value} percent`}, ${selected.count} students`}
          >
            <ResponsiveContainer>
              <PieChart>
                <Pie data={groups} dataKey="value" innerRadius="68%" outerRadius="100%" paddingAngle={1} stroke="none">
                  {groups.map((group) => (
                    <Cell
                      key={group.name}
                      fill={group.color}
                      cursor="pointer"
                      opacity={selected.name === group.name ? 1 : 0.6}
                      onMouseEnter={() => onSelect(group)}
                      onClick={() => onSelect(group)}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <span className="kd-split__center">
              <b>{selected.value == null ? "—" : `${selected.value}%`}</b>
              <small>{selected.name}</small>
            </span>
          </div>
          <div className="kd-split__legend">
            {groups.map((group) => (
              <button
                key={group.name}
                type="button"
                onClick={() => onSelect(group)}
                onMouseEnter={() => onSelect(group)}
                aria-pressed={selected.name === group.name}
                className={`kd-legend-row${selected.name === group.name ? " is-active" : ""}`}
              >
                <i style={{ background: group.color }} />
                <span>{group.name}</span>
                <b>{group.value}% <small>({group.count})</small></b>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={ClipboardList}
          text="No student learning progress recorded yet."
          action={{ label: "View All Progress", onClick: onViewAll }}
        />
      )}
    </Panel>
  );
}

/** students: [{ name, course, attendance, progress, reason, risk, studentId|id }] */
export function AtRiskCard({ students, onViewAll, onView }) {
  return (
    <Panel
      icon={AlertTriangle}
      tone="red"
      title="At-Risk Students"
      subtitle="Why they need intervention and what to do next"
      action={{ label: "View All", onClick: onViewAll }}
      bodyClassName="is-flush"
    >
      <div className="kd-table-wrap is-scroll">
        <table className="kd-table is-risk" data-table-header="plain">
          <colgroup><col /><col style={{ width: "17%" }} /><col style={{ width: "15%" }} /><col style={{ width: "18%" }} /><col style={{ width: "13%" }} /></colgroup>
          <thead>
            <tr>
              <th scope="col">Student</th>
              <th scope="col">Attendance</th>
              <th scope="col">Progress</th>
              <th scope="col">Risk</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {students.length ? students.map((student) => (
              <tr key={student.studentId ?? student.id ?? student.name}>
                <td>
                  <b className="kd-table__name" title={student.name}>{student.name}</b>
                  <small className="kd-table__sub" title={`${student.reason} · ${student.course}`}>{student.course}</small>
                </td>
                <td className="is-danger">{student.attendance}%</td>
                <td>{student.progress}%</td>
                <td>
                  <span className={`kd-pill ${student.risk === "High Risk" ? "is-red" : "is-orange"}`} title={student.reason}>{student.risk}</span>
                </td>
                <td>
                  <button type="button" className="kd-pill is-button is-orange" onClick={() => onView(student)}>View</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="kd-table__empty">No students are currently flagged as at risk.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/** payments: [{ student, amount, date, status }] */
export function RecentPaymentsCard({ payments, onViewAll, onOpen }) {
  return (
    <Panel
      icon={CreditCard}
      tone="green"
      title="Recent Payments"
      subtitle="Latest institute transactions"
      action={{ label: "View All Payments", onClick: onViewAll }}
      bodyClassName="is-flush"
    >
      <div className="kd-table-wrap">
        <table className="kd-table" data-table-header="plain">
          <thead>
            <tr>
              <th scope="col">Student</th>
              <th scope="col">Amount</th>
              <th scope="col">Date</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.length ? payments.slice(0, 3).map((payment, index) => (
              <tr key={`${payment.student}-${index}`} className="is-clickable" onClick={() => onOpen(payment)}>
                <td className="is-strong">{payment.student}</td>
                <td className="is-strong">{payment.amount}</td>
                <td>{payment.date}</td>
                <td><span className={`kd-pill ${payment.status === "Paid" ? "is-green" : "is-orange"}`}>{payment.status}</span></td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="kd-table__empty">No payment records were returned by the payment API.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

OperationsCard.propTypes = { approvals: PropTypes.array.isRequired, onViewAll: PropTypes.func, onReview: PropTypes.func.isRequired };
RevenueCard.propTypes = {
  finance: PropTypes.object.isRequired,
  trend: PropTypes.array.isRequired,
  note: PropTypes.string,
  available: PropTypes.bool,
  onViewFinance: PropTypes.func,
  onOpenTab: PropTypes.func.isRequired,
};
AttendanceCard.propTypes = {
  scope: PropTypes.oneOf(["students", "employees"]).isRequired,
  onScope: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  series: PropTypes.array.isRequired,
  hasData: PropTypes.bool,
  change: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onAnalytics: PropTypes.func,
};
StudentProgressCard.propTypes = { groups: PropTypes.array.isRequired, selected: PropTypes.object.isRequired, onSelect: PropTypes.func.isRequired, onViewAll: PropTypes.func };
AtRiskCard.propTypes = { students: PropTypes.array.isRequired, onViewAll: PropTypes.func, onView: PropTypes.func.isRequired };
RecentPaymentsCard.propTypes = { payments: PropTypes.array.isRequired, onViewAll: PropTypes.func, onOpen: PropTypes.func.isRequired };
