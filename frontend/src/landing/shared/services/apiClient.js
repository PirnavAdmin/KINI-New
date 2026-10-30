import axios from "axios";

// Same backend as the app's own client (src/shared/services/apiClient.js).
// In development, requests stay same-origin and go through the Vite /api
// proxy (vite.config.js), since the backend's CORS does not allow localhost.
const apiClient = axios.create({
  baseURL: import.meta.env.DEV ? "" : import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
