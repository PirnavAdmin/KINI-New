import apiClient from "./apiClient";
import { getListPayload, getPayload } from "./apiServices";
import { API_ENDPOINTS } from "@/api/endpoints";

const endpoints = API_ENDPOINTS.leaveRequests;

const requireSuccess = (response) => {
  if (response.data?.success === false) {
    throw Object.assign(new Error(response.data.message || "Leave request could not be completed."), { response });
  }
  return response;
};

export const leaveRequestService = {
  create: (payload) => apiClient.post(endpoints.base, payload).then(requireSuccess).then(getPayload),
  list: (params = undefined) => apiClient.get(endpoints.base, params ? { params } : undefined).then(getListPayload),
  mine: (params = undefined, signal = undefined) => apiClient.get(endpoints.mine, { params, signal }).then(requireSuccess).then(getListPayload),
  approve: (id) => apiClient.put(endpoints.approve(id), {}).then(getPayload),
  reject: (id, payload = {}) => apiClient.put(endpoints.reject(id), payload).then(getPayload),
};

export default leaveRequestService;
