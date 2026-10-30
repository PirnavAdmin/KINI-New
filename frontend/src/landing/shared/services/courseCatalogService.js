import apiClient from "./apiClient";

// GET /api/v1/courses/public is anonymous: published courses from every
// organization. This client never attaches a bearer token, so the catalogue
// looks the same whether or not someone is signed in.
// Answers { data: [...], totalRecords, pageNumber, pageSize, totalPages }.
export async function getPublicCourses({ search, page = 1, pageSize = 10, signal } = {}) {
  const { data } = await apiClient.get("/api/v1/courses/public", {
    params: {
      search: search?.trim() || undefined,
      sortBy: "courseName",
      sortOrder: "asc",
      page,
      pageSize,
    },
    // ngrok's free tunnel answers browser requests with an HTML warning
    // page unless this header is present. Requests stay same-origin (Vite
    // proxy in dev, nginx in production), so it adds no CORS preflight.
    headers: { "ngrok-skip-browser-warning": "true" },
    signal,
  });
  // An HTML page or other non-catalogue body is a failure, not "no courses".
  if (!data || typeof data !== "object" || !Array.isArray(data.data)) {
    throw new Error("The course catalogue returned an unexpected response.");
  }
  return {
    courses: data.data,
    totalRecords: Number(data?.totalRecords) || 0,
    totalPages: Number(data?.totalPages) || 0,
  };
}

export function courseCatalogErrorMessage(error) {
  const response = error?.response;
  if (!response) {
    if (error?.code === "ECONNABORTED") return "The course catalogue took too long to respond.";
    return "We couldn't reach the course catalogue. Check your connection and try again.";
  }
  // ngrok answers for an offline tunnel itself (ERR_NGROK_3200 → 404),
  // so the backend never saw the request.
  if (response.headers?.["ngrok-error-code"]) return "The course server is offline right now. Please try again shortly.";
  if (response.status === 404) return "The course catalogue wasn't found on the server (404).";
  if (response.status >= 500) return "The course catalogue hit a server error. Please try again shortly.";
  return "We couldn't load programs right now. Please try again.";
}
