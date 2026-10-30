import { API_ENDPOINTS } from "@/api/endpoints";
import apiClient from "./apiClient";
import { cleanPayload, getListPayload, getPayload } from "./apiServices";

const resourceApi = ({ base, byId }) => ({
  create: (payload) => apiClient.post(base, cleanPayload(payload)).then(getPayload),
  list: (params = {}) => apiClient.get(base, { params }).then(getListPayload),
  getById: (id) => {
    if (id === undefined || id === null || String(id).trim() === "") {
      throw new Error("Record ID is required.");
    }
    return apiClient.get(byId(id)).then(getPayload);
  },
});

export const getInTouchApi = resourceApi(API_ENDPOINTS.getInTouch);
export const registerRecordsApi = resourceApi(API_ENDPOINTS.register);

export default { getInTouchApi, registerRecordsApi };
