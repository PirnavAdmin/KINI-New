/**
 * Mounts the development-only demo payment backend on the Vite dev server
 * under /demo-api/v1. `apply: "serve"` keeps it out of every production
 * build, and it answers only when DEMO_PAYMENTS_ENABLED=true is set for the
 * dev server (a server-side switch, separate from VITE_PAYMENT_MODE).
 */
import path from "node:path";
import { Buffer } from "node:buffer";
import process from "node:process";
import { createDemoPaymentStore, DemoPaymentError } from "./demoPaymentStore.js";

const BASE = "/demo-api/v1";
const MAX_BODY_BYTES = 64 * 1024;

const readJson = (req) => new Promise((resolve, reject) => {
  let size = 0;
  const chunks = [];
  req.on("data", (chunk) => {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      reject(new DemoPaymentError(413, "Request body is too large", "too_large"));
      req.destroy();
      return;
    }
    chunks.push(chunk);
  });
  req.on("end", () => {
    if (!chunks.length) return resolve({});
    try {
      resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
    } catch {
      reject(new DemoPaymentError(400, "Body must be JSON", "validation"));
    }
  });
  req.on("error", reject);
});

const send = (res, status, body) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
};

/**
 * Organization actions need a signed-in reviewer. The dev server can't verify
 * the live API's JWT signature, so it only requires a bearer token and reads
 * the reviewer's identity and organization from its claims when present.
 */
const reviewerFrom = (req) => {
  const header = String(req.headers.authorization ?? "");
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) throw new DemoPaymentError(401, "Sign in to the Organization Portal to review enrollments", "unauthorized");
  let claims = {};
  try {
    claims = JSON.parse(Buffer.from(token.split(".")[1] ?? "", "base64url").toString("utf8")) ?? {};
  } catch {
    claims = {};
  }
  const pick = (...keys) => keys.map((key) => claims[key]).find((value) => value != null && String(value).trim() !== "");
  return {
    actor: String(pick("email", "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress", "name", "sub") ?? "organization-reviewer"),
    organizationId: pick("organizationId", "OrganizationId", "orgId", "OrgId") ?? null,
  };
};

export function demoPaymentsPlugin({ enabled = false, dataFile, appOrigin } = {}) {
  const isEnabled = enabled && process.env.NODE_ENV !== "production";
  let store;

  return {
    name: "kini-demo-payments",
    apply: "serve",
    configureServer(server) {
      const origin = appOrigin ?? `http://localhost:${server.config.server.port ?? 5173}`;
      if (isEnabled) {
        store = createDemoPaymentStore({
          filePath: dataFile ?? path.resolve(server.config.root, ".demo-data/demo-payments.json"),
          appOrigin: origin,
          log: (message) => server.config.logger.info(message, { timestamp: true }),
        });
        server.config.logger.info("[demo-payments] Demo payment mode is ON — no real money is charged.", { timestamp: true });
      }

      server.middlewares.use(BASE, async (req, res) => {
        const url = new URL(req.url ?? "/", "http://dev.local");
        const parts = url.pathname.split("/").filter(Boolean).map(decodeURIComponent);
        const route = `${req.method} /${parts.map((part, index) => (index > 0 && parts[index - 1] !== "dev" ? ":id" : part)).join("/")}`;

        try {
          if (route === "GET /status") return send(res, 200, { enabled: isEnabled, paymentMode: isEnabled ? "demo" : "disabled" });
          if (!isEnabled) throw new DemoPaymentError(403, "Demo payments are disabled on this server", "disabled");

          switch (route) {
            case "POST /orders":
              return send(res, 201, store.createOrder(await readJson(req)));
            case "GET /orders/:id":
              return send(res, 200, store.getOrder(parts[1]));
            case "POST /orders/:id/:id":
              if (parts[2] !== "complete") break;
              return send(res, 200, store.completeOrder(parts[1], await readJson(req)));
            case "GET /enrollment-requests": {
              const reviewer = reviewerFrom(req);
              return send(res, 200, store.listRequests({ status: url.searchParams.get("status") || undefined, organizationId: reviewer.organizationId }));
            }
            case "POST /enrollment-requests/:id/:id": {
              const reviewer = reviewerFrom(req);
              if (parts[2] === "approve") return send(res, 200, store.approveRequest(parts[1], { actor: reviewer.actor }));
              if (parts[2] === "backend-link") {
                const body = await readJson(req);
                return send(res, 200, store.linkBackendStudent(parts[1], { actor: reviewer.actor, liveStudentId: body.liveStudentId }));
              }
              if (parts[2] === "live-approval") {
                const body = await readJson(req);
                return send(res, 200, store.recordLiveApproval(parts[1], { actor: reviewer.actor, liveStudentId: body.liveStudentId }));
              }
              if (parts[2] === "reject") {
                const body = await readJson(req);
                return send(res, 200, store.rejectRequest(parts[1], { actor: reviewer.actor, reason: body.reason }));
              }
              break;
            }
            case "GET /activation/:id":
              return send(res, 200, store.inspectActivation(parts[1]));
            case "POST /activation": {
              const body = await readJson(req);
              return send(res, 200, store.activateAccount(body.token, body.password));
            }
            // Development-only stand-in for email delivery: lists every message
            // the demo backend "sent", including activation links.
            case "GET /dev/outbox":
              return send(res, 200, store.listOutbox());
            default:
              break;
          }
          throw new DemoPaymentError(404, "Unknown demo payment endpoint", "not_found");
        } catch (error) {
          if (error instanceof DemoPaymentError) return send(res, error.status, { success: false, code: error.code, message: error.message });
          server.config.logger.error(`[demo-payments] ${error?.stack ?? error}`);
          return send(res, 500, { success: false, code: "server_error", message: "Demo payment server error" });
        }
      });
    },
  };
}
