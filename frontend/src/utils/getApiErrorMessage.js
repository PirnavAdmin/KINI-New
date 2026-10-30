const flattenErrors = (errors) => {
  if (!errors || typeof errors !== "object") return "";

  return Object.entries(errors)
    .flatMap(([field, messages]) => {
      const values = Array.isArray(messages) ? messages : [messages];
      return values
        .filter((message) => typeof message === "string")
        .map((message) => `${field}: ${message}`);
    })
    .join(" ");
};

const STATUS_MESSAGES = {
  400: "The request is invalid. Please check the entered information.",
  401: "Your credentials are invalid or your session has expired.",
  403: "You do not have permission to perform this action.",
  404: "The requested account or record was not found.",
  409: "An account with these details already exists.",
  422: "Please correct the validation errors and try again.",
  429: "Too many attempts. Please wait before trying again.",
  500: "The server could not complete the request. Please try again later.",
  502: "The backend service is offline or the API tunnel cannot reach it.",
  503: "The backend service is temporarily unavailable.",
  504: "The backend service took too long to respond.",
};

const sanitizeBackendMessage = (message, fallback) => {
  if (typeof message !== "string" || !message.trim()) return "";
  const value = message.trim();
  if (/system\.[\w.]*exception|\.cs:line|\bat\s+\w[\w.]+\(/i.test(value)) {
    return value.split(/\r?\n/).find((line) => line.trim())?.trim() || fallback;
  }
  return value;
};

export const getApiErrorMessage = (error, fallback = "Request failed. Please try again.") => {
  if (!error?.response) {
    return error?.message === "Network Error"
      ? "The server is unavailable. Check your connection and try again."
      : error?.message || fallback;
  }

  const data = error.response.data;
  if (typeof data === "string" && data.trim() && !/<(?:!doctype|html|body)\b/i.test(data)) {
    return sanitizeBackendMessage(data, fallback);
  }

  const validationMessage = flattenErrors(data?.errors);
  if (validationMessage) return validationMessage;

  for (const value of [data?.message, data?.error?.message, data?.error, data?.title]) {
    if (typeof value === "string" && value.trim()) return sanitizeBackendMessage(value, fallback);
  }

  return STATUS_MESSAGES[error.response.status] || fallback;
};

export default getApiErrorMessage;
