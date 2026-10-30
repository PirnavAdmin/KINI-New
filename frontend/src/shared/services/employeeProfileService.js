import { API_ENDPOINTS } from "@/api/endpoints";
import apiClient from "./apiClient";
import { cleanPayload, getListPayload, getPayload } from "./apiServices";

const body = (payload) => cleanPayload(payload);

const get = (endpoint, config) => apiClient.get(endpoint, config).then(getPayload);
const getBinary = (endpoint) => apiClient.get(endpoint, { responseType: "blob" });
const list = (endpoint, config) => apiClient.get(endpoint, config).then(getListPayload);
const put = (endpoint, payload) => apiClient.put(endpoint, body(payload)).then(getPayload);

const toFormData = (payload = {}) => {
  if (payload instanceof FormData) return payload;
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(`${key}[]`, item));
      return;
    }
    formData.append(key, value);
  });
  return formData;
};

export const employeeProfileService = {
  getProfile: () => get(API_ENDPOINTS.employeeProfile.base),
  updatePersonal: (payload) => put(API_ENDPOINTS.employeeProfile.personal, payload),
  updateBank: (payload) => put(API_ENDPOINTS.employeeProfile.bank, payload),
  updateEducation: (payload) => put(API_ENDPOINTS.employeeProfile.education, payload),
  updateExperience: (payload) => put(API_ENDPOINTS.employeeProfile.experience, payload),
  getDepartments: () => list(API_ENDPOINTS.employeeProfile.departments),
  getDocumentTypes: () => list(API_ENDPOINTS.employeeProfile.documentTypes),
  uploadDocument: (payload) => apiClient.post(
    API_ENDPOINTS.employeeProfile.documents,
    toFormData(payload),
    { headers: { "Content-Type": "multipart/form-data" } },
  ).then(getPayload),
  deleteDocument: (documentId) => apiClient.delete(API_ENDPOINTS.employeeProfile.documentById(documentId)).then(getPayload),
  downloadDocument: (documentId) => getBinary(API_ENDPOINTS.employeeProfile.documentDownload(documentId)),
  downloadPdf: () => getBinary(API_ENDPOINTS.employeeProfile.pdf),
};

export default employeeProfileService;
