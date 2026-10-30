/**
 * Development-only demo payment backend.
 *
 * This is the server-side half of Demo Payment Mode: it owns transaction IDs,
 * order idempotency, enrollment requests, organization approval, student
 * account provisioning, activation tokens and the outbound email log. It runs
 * inside the Vite dev server (see vitePlugin.js) and is never part of a
 * production build. It is also the executable contract the real backend
 * should implement before demo mode is replaced by a real gateway.
 *
 * Nothing here talks to a bank or to the live API. Every record carries
 * paymentMode "demo" and the DEMO_LABEL so it can never be mistaken for, or
 * reported as, real revenue.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export const DEMO_LABEL = "DEMO PAYMENT — NO REAL MONEY CHARGED";
const ACTIVATION_TTL_MS = 48 * 60 * 60 * 1000;
const MIN_PASSWORD_LENGTH = 8;

export class DemoPaymentError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const emptyState = () => ({
  sequence: { order: 0, transaction: 0, request: 0, account: 0, email: 0 },
  orders: [],
  transactions: [],
  requests: [],
  accounts: [],
  activationTokens: [],
  outbox: [],
});

const pad = (value) => String(value).padStart(6, "0");
const now = () => new Date().toISOString();
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const normalizeEmail = (value) => String(value ?? "").trim().toLowerCase();
const digits = (value) => String(value ?? "").replace(/\D/g, "").slice(-10);
const money = (value) => Math.round(Number(value) * 100) / 100;

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
};

/** Splits a paid amount across lines by list price; the last line takes the rounding remainder. */
const splitAmount = (items, paid) => {
  const listTotal = items.reduce((sum, item) => sum + item.listPrice, 0);
  let allocated = 0;
  return items.map((item, index) => {
    if (index === items.length - 1) return money(paid - allocated);
    const share = listTotal ? money((item.listPrice / listTotal) * paid) : 0;
    allocated += share;
    return share;
  });
};

const requireText = (value, label) => {
  const text = String(value ?? "").trim();
  if (!text) throw new DemoPaymentError(400, `${label} is required`, "validation");
  return text;
};

/**
 * @param {{ filePath?: string, appOrigin?: string, log?: (message: string) => void }} options
 *   filePath  JSON file the demo data persists to (omit for in-memory, e.g. tests)
 *   appOrigin origin used to build activation links
 */
export function createDemoPaymentStore({ filePath, appOrigin = "http://localhost:5173", log = () => {} } = {}) {
  let state = emptyState();
  if (filePath && fs.existsSync(filePath)) {
    try {
      state = { ...emptyState(), ...JSON.parse(fs.readFileSync(filePath, "utf8")) };
    } catch {
      state = emptyState();
    }
  }

  // Every mutation runs synchronously and ends in save(), so two requests on
  // the Node event loop can never interleave inside one operation.
  const save = () => {
    if (!filePath) return;
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const temp = `${filePath}.tmp`;
    fs.writeFileSync(temp, JSON.stringify(state, null, 2));
    fs.renameSync(temp, filePath);
  };

  const nextId = (kind, prefix) => {
    state.sequence[kind] += 1;
    return `${prefix}-${pad(state.sequence[kind])}`;
  };

  const findOrder = (orderId) => {
    const order = state.orders.find((item) => item.orderId === orderId);
    if (!order) throw new DemoPaymentError(404, "Demo order not found", "not_found");
    return order;
  };

  const findRequest = (requestId) => {
    const request = state.requests.find((item) => item.id === requestId);
    if (!request) throw new DemoPaymentError(404, "Enrollment request not found", "not_found");
    return request;
  };

  // Emails are keyed so a repeated approval never sends the same message twice.
  const sendEmail = ({ dedupeKey, to, subject, text, meta = {} }) => {
    const existing = state.outbox.find((email) => email.dedupeKey === dedupeKey);
    if (existing) return existing;
    const email = { id: nextId("email", "DEMO-MAIL"), dedupeKey, to, subject, text, meta, delivery: "dev-outbox", createdAt: now() };
    state.outbox.unshift(email);
    log(`[demo-payments] email to ${to}: ${subject}${meta.activationUrl ? `\n  activation link: ${meta.activationUrl}` : ""}`);
    return email;
  };

  const publicOrder = (order) => ({
    ...order,
    label: DEMO_LABEL,
    transactions: state.transactions.filter((txn) => txn.orderId === order.orderId),
    requests: state.requests.filter((request) => request.orderId === order.orderId),
  });

  const successResult = (order) => {
    const txn = state.transactions.find((item) => item.transactionId === order.successTransactionId);
    return {
      success: true,
      paymentMode: "demo",
      label: DEMO_LABEL,
      paymentStatus: "DemoSuccess",
      orderId: order.orderId,
      transactionId: txn.transactionId,
      paymentMethod: txn.paymentMethod,
      amount: order.amount,
      currency: order.currency,
      paidAt: txn.createdAt,
      enrollmentStatus: "PendingApproval",
      requests: state.requests.filter((request) => request.orderId === order.orderId),
    };
  };

  return {
    /** Creates (or, for a repeated idempotency key, returns) a pending demo order. */
    createOrder(input = {}) {
      const idempotencyKey = requireText(input.idempotencyKey, "idempotencyKey");
      const existing = state.orders.find((order) => order.idempotencyKey === idempotencyKey);
      if (existing) return publicOrder(existing);

      const student = {
        firstName: requireText(input.student?.firstName, "First name"),
        lastName: requireText(input.student?.lastName, "Last name"),
        email: normalizeEmail(requireText(input.student?.email, "Email")),
        phone: digits(requireText(input.student?.phone, "Mobile number")),
      };
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) throw new DemoPaymentError(400, "Email is invalid", "validation");
      if (student.phone.length !== 10) throw new DemoPaymentError(400, "Mobile number must have 10 digits", "validation");

      const items = Array.isArray(input.items) ? input.items : [];
      if (!items.length) throw new DemoPaymentError(400, "Select at least one course", "validation");
      const seen = new Set();
      const lines = items.map((item) => {
        const courseId = requireText(item.courseId, "Course");
        if (seen.has(courseId)) throw new DemoPaymentError(400, "A course appears twice in this checkout", "validation");
        seen.add(courseId);
        const listPrice = money(item.listPrice);
        if (!Number.isFinite(listPrice) || listPrice <= 0) throw new DemoPaymentError(400, `Course ${courseId} has no valid price`, "validation");
        return {
          courseId,
          courseTitle: String(item.courseTitle ?? "").trim() || `Course #${courseId}`,
          batchId: item.batchId == null || item.batchId === "" ? null : String(item.batchId),
          batchName: item.batchName ? String(item.batchName) : null,
          organizationId: item.organizationId == null || item.organizationId === "" ? null : String(item.organizationId),
          listPrice,
        };
      });

      // Demo pricing comes from the checkout page; the real backend must price
      // courses itself. The discount can only lower the total, never raise it.
      const subtotal = money(lines.reduce((sum, line) => sum + line.listPrice, 0));
      const discount = Math.min(subtotal, Math.max(0, money(input.couponDiscount ?? 0) || 0));
      const order = {
        orderId: nextId("order", "DEMO-ORD"),
        idempotencyKey,
        paymentMode: "demo",
        status: "Pending",
        currency: "INR",
        subtotal,
        discount,
        couponCode: input.couponCode ? String(input.couponCode) : null,
        amount: money(subtotal - discount),
        student,
        items: lines,
        createdAt: now(),
        successTransactionId: null,
      };
      state.orders.push(order);
      save();
      return publicOrder(order);
    },

    getOrder(orderId) {
      return publicOrder(findOrder(orderId));
    },

    /**
     * Simulates the gateway result for an order. A successful order is final:
     * any later call returns the same success, so duplicate callbacks never
     * create a second transaction or enrollment. Each failed attempt is
     * recorded as its own DemoFailed transaction and the order stays payable.
     */
    completeOrder(orderId, { outcome, paymentMethod, attemptId } = {}) {
      const order = findOrder(orderId);
      if (order.successTransactionId) return successResult(order);
      if (!["success", "failed"].includes(outcome)) throw new DemoPaymentError(400, "outcome must be success or failed", "validation");
      const method = requireText(paymentMethod, "Payment method");
      const attempt = requireText(attemptId, "attemptId");

      const repeated = state.transactions.find((txn) => txn.orderId === orderId && txn.attemptId === attempt);
      if (repeated) {
        return { success: false, paymentMode: "demo", label: DEMO_LABEL, paymentStatus: repeated.paymentStatus, orderId, transactionId: repeated.transactionId, amount: order.amount, currency: order.currency };
      }

      const txn = {
        transactionId: nextId("transaction", "DEMO-TXN"),
        orderId,
        attemptId: attempt,
        paymentMode: "demo",
        label: DEMO_LABEL,
        paymentStatus: outcome === "success" ? "DemoSuccess" : "DemoFailed",
        paymentMethod: method,
        amount: order.amount,
        currency: order.currency,
        // Demo transactions are never gateway-verified and never count as revenue.
        gatewayVerified: false,
        countsAsRevenue: false,
        createdAt: now(),
      };
      state.transactions.push(txn);

      if (outcome === "failed") {
        order.status = "Failed";
        save();
        return { success: false, paymentMode: "demo", label: DEMO_LABEL, paymentStatus: "DemoFailed", orderId, transactionId: txn.transactionId, amount: order.amount, currency: order.currency };
      }

      order.status = "Paid";
      order.successTransactionId = txn.transactionId;
      const shares = splitAmount(order.items, order.amount);
      order.items.forEach((line, index) => {
        state.requests.push({
          id: nextId("request", "DEMO-ENR"),
          orderId,
          transactionId: txn.transactionId,
          paymentMode: "demo",
          label: DEMO_LABEL,
          student: order.student,
          course: { id: line.courseId, title: line.courseTitle },
          batch: line.batchId ? { id: line.batchId, name: line.batchName } : null,
          organizationId: line.organizationId,
          amount: shares[index],
          orderAmount: order.amount,
          orderCourseCount: order.items.length,
          paymentMethod: method,
          paymentStatus: "DemoSuccess",
          enrollmentStatus: "PendingApproval",
          accountStatus: "NotCreated",
          createdAt: txn.createdAt,
        });
      });
      save();
      return successResult(order);
    },

    /** Requests for one organization; requests without an organization are visible to every reviewer. */
    listRequests({ status, organizationId } = {}) {
      return state.requests
        .filter((request) => !status || request.enrollmentStatus === status)
        .filter((request) => !organizationId || !request.organizationId || request.organizationId === String(organizationId))
        .map((request) => ({
          ...request,
          accountStatus: state.accounts.find((account) => account.email === request.student.email)?.status ?? request.accountStatus,
        }))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },

    approveRequest(requestId, { actor } = {}) {
      const request = findRequest(requestId);
      if (request.enrollmentStatus === "Approved") return { request, account: this.accountSummary(request.student.email), emailSent: false };
      if (request.enrollmentStatus === "Rejected") throw new DemoPaymentError(409, "This enrollment was rejected and can't be approved", "conflict");

      const { student } = request;
      // One account per student: match on email first, then mobile number.
      let account = state.accounts.find((item) => item.email === student.email)
        ?? state.accounts.find((item) => item.phone === student.phone);
      let email;
      if (!account) {
        account = {
          accountId: nextId("account", "DEMO-STU"),
          email: student.email,
          phone: student.phone,
          firstName: student.firstName,
          lastName: student.lastName,
          status: "PendingActivation",
          passwordHash: null,
          courses: [],
          createdAt: now(),
          activatedAt: null,
        };
        state.accounts.push(account);
        const token = crypto.randomBytes(32).toString("base64url");
        state.activationTokens.push({ tokenHash: sha256(token), accountId: account.accountId, expiresAt: new Date(Date.now() + ACTIVATION_TTL_MS).toISOString(), usedAt: null });
        const activationUrl = `${appOrigin}/activate-account?token=${token}`;
        email = sendEmail({
          dedupeKey: `activation:${account.accountId}`,
          to: account.email,
          subject: "Your Kini EduHub Account Is Approved",
          text: [
            `Hello ${student.firstName} ${student.lastName},`,
            "",
            "Your enrollment has been approved.",
            `Your registered email: ${account.email}`,
            "",
            "Click the secure activation link below to set your password and activate your account.",
            activationUrl,
            "",
            "Once activated, log in to the Kini EduHub Student Portal to access your approved courses.",
            "",
            "Regards,",
            "Kini EduHub Team",
          ].join("\n"),
          meta: { activationUrl, requestId, demo: true },
        });
      } else {
        // Existing student: notify only, never touch their credentials.
        email = sendEmail({
          dedupeKey: `approved:${requestId}`,
          to: account.email,
          subject: `Enrollment approved: ${request.course.title}`,
          text: [
            `Hello ${account.firstName} ${account.lastName},`,
            "",
            `Your enrollment in ${request.course.title} has been approved.`,
            account.status === "Active"
              ? "Log in to the Kini EduHub Student Portal to start learning."
              : "Use the activation link we sent earlier to set your password.",
            "",
            "Regards,",
            "Kini EduHub Team",
          ].join("\n"),
          meta: { requestId, demo: true },
        });
      }

      if (!account.courses.some((course) => course.requestId === requestId)) {
        account.courses.push({ requestId, courseId: request.course.id, courseTitle: request.course.title, batchId: request.batch?.id ?? null, demo: true });
      }
      request.enrollmentStatus = "Approved";
      request.accountStatus = account.status;
      request.approvedBy = actor ?? "unknown";
      request.approvedAt = now();
      save();
      return { request, account: this.accountSummary(account.email), emailSent: true, emailId: email.id };
    },

    /**
     * Stores the real backend student id created or found for this request,
     * so the demo payment stays mapped to it. Status is unchanged: the
     * approval itself happens in the live backend.
     */
    linkBackendStudent(requestId, { actor, liveStudentId } = {}) {
      const request = findRequest(requestId);
      const studentId = requireText(liveStudentId, "liveStudentId");
      if (request.liveStudentId && request.liveStudentId !== studentId) {
        throw new DemoPaymentError(409, `This payment is already linked to backend student #${request.liveStudentId}`, "conflict");
      }
      if (!request.liveStudentId) {
        request.liveStudentId = studentId;
        request.backendLinkedBy = actor ?? "unknown";
        request.backendLinkedAt = now();
        save();
      }
      return { request };
    },

    /**
     * The organization approved the matching student in the live backend. The
     * live API owns that account and its email, so this only records the
     * outcome on the demo request: no demo account, no demo email.
     */
    recordLiveApproval(requestId, { actor, liveStudentId } = {}) {
      const request = findRequest(requestId);
      const studentId = requireText(liveStudentId, "liveStudentId");
      if (request.enrollmentStatus === "Rejected") throw new DemoPaymentError(409, "This enrollment was rejected and can't be approved", "conflict");
      if (request.enrollmentStatus === "Approved") return { request };
      request.enrollmentStatus = "Approved";
      request.approvedVia = "live-backend";
      request.liveStudentId = studentId;
      request.accountStatus = "ManagedByBackend";
      request.approvedBy = actor ?? "unknown";
      request.approvedAt = now();
      save();
      return { request };
    },

    rejectRequest(requestId, { actor, reason } = {}) {
      const request = findRequest(requestId);
      if (request.enrollmentStatus === "Rejected") return { request };
      if (request.enrollmentStatus === "Approved") throw new DemoPaymentError(409, "This enrollment is already approved", "conflict");
      request.enrollmentStatus = "Rejected";
      request.rejectedBy = actor ?? "unknown";
      request.rejectedAt = now();
      request.rejectionReason = String(reason ?? "").trim() || null;
      // A real paid rejection goes to refund review; a demo payment moved no money.
      request.refundStatus = "NotApplicable";
      save();
      return { request };
    },

    accountSummary(email) {
      const account = state.accounts.find((item) => item.email === normalizeEmail(email));
      if (!account) return null;
      // Never return the password hash.
      return Object.fromEntries(Object.entries(account).filter(([key]) => key !== "passwordHash"));
    },

    /** Describes an activation token without consuming it. */
    inspectActivation(token) {
      const record = state.activationTokens.find((item) => item.tokenHash === sha256(String(token ?? "")));
      if (!record) throw new DemoPaymentError(404, "This activation link is invalid", "invalid_token");
      const account = state.accounts.find((item) => item.accountId === record.accountId);
      const status = record.usedAt ? "used" : Date.parse(record.expiresAt) < Date.now() ? "expired" : "valid";
      return { status, email: account.email, firstName: account.firstName, expiresAt: record.expiresAt };
    },

    activateAccount(token, password) {
      const record = state.activationTokens.find((item) => item.tokenHash === sha256(String(token ?? "")));
      if (!record) throw new DemoPaymentError(404, "This activation link is invalid", "invalid_token");
      if (record.usedAt) throw new DemoPaymentError(410, "This activation link has already been used", "used_token");
      if (Date.parse(record.expiresAt) < Date.now()) throw new DemoPaymentError(410, "This activation link has expired", "expired_token");
      if (String(password ?? "").length < MIN_PASSWORD_LENGTH) throw new DemoPaymentError(400, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`, "validation");
      const account = state.accounts.find((item) => item.accountId === record.accountId);
      account.passwordHash = hashPassword(String(password));
      account.status = "Active";
      account.activatedAt = now();
      record.usedAt = now();
      state.requests
        .filter((request) => request.student.email === account.email && request.enrollmentStatus === "Approved")
        .forEach((request) => { request.accountStatus = "Active"; });
      save();
      return this.accountSummary(account.email);
    },

    listOutbox() {
      return state.outbox;
    },
  };
}
