import apiClient from "./apiClient";

// POST /api/Register expects exactly these five properties.
export async function submitRegister({ name, email, mobileNumber, qualification, program }) {
  const payload = {
    name: name.trim(),
    email: email.trim(),
    mobileNumber: mobileNumber.trim(),
    qualification: qualification.trim(),
    program,
  };
  const { data } = await apiClient.post("/api/Register", payload);
  return data;
}

// ASP.NET validation errors arrive as { errors: { Name: ["..."], ... } }.
const FIELD_MAP = {
  name: "name",
  email: "email",
  mobilenumber: "mobileNumber",
  qualification: "qualification",
  program: "program",
};

export function getRegisterFieldErrors(error) {
  const errors = error?.response?.data?.errors;
  if (!errors || typeof errors !== "object") return {};
  return Object.entries(errors).reduce((acc, [key, messages]) => {
    const field = FIELD_MAP[key.toLowerCase()];
    const message = Array.isArray(messages) ? messages[0] : messages;
    if (field && message) acc[field] = String(message);
    return acc;
  }, {});
}

export function registerErrorMessage(error) {
  const response = error?.response;
  if (!response) {
    if (error?.code === "ECONNABORTED") {
      return "The registration server took too long to respond. Please try again.";
    }
    // Axios cannot tell a CORS block from an offline server; both have no response.
    return "We couldn't reach the registration server. Check your connection, or the server may be unavailable or blocking this site (CORS).";
  }
  const { status, data } = response;
  const serverMessage =
    (typeof data === "string" && data.length < 200 && data) ||
    data?.message ||
    data?.title ||
    data?.error;
  if (status === 400 || status === 422) {
    return serverMessage || "Some details are invalid. Please review the form.";
  }
  if (status === 409) return serverMessage || "This email or mobile number is already registered.";
  if (status === 401 || status === 403) return "Registration isn't open to visitors right now.";
  if (status === 404) return "The registration service wasn't found (404).";
  if (status >= 500) return "The registration server hit an error. Please try again later.";
  return serverMessage || `Registration failed (HTTP ${status}).`;
}
