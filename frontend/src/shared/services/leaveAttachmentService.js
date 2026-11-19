import apiClient from "./apiClient";
import { getListPayload, getPayload } from "./apiServices";
import { API_ENDPOINTS } from "@/api/endpoints";

const endpoints = API_ENDPOINTS.leaveAttachments;

const requireSuccess = (response) => {
  if (response.data?.success === false) {
    throw Object.assign(new Error(response.data.message || "The document request failed."), { response });
  }
  return response;
};

// Supporting (medical) documents on a leave request. Files are private: view and
// download go through the authenticated API client, never a bare link.
export const leaveAttachmentService = {
  list: (leaveId, signal = undefined) =>
    apiClient.get(endpoints.list(leaveId), { signal }).then(requireSuccess).then(getListPayload),

  // Resolves only after the server confirms the stored attachment (with its id).
  upload: async (leaveId, file) => {
    const form = new FormData();
    form.append("file", file);
    const response = await apiClient.post(endpoints.upload(leaveId), form).then(requireSuccess);
    const attachment = getPayload(response);
    if (!attachment || attachment.attachmentId == null) {
      throw new Error("The server did not confirm the document upload.");
    }
    return attachment;
  },

  // Returns the file as a Blob (mode: "view" for preview, "download" to save).
  fetchFile: async (attachment, mode = "view") => {
    const url = mode === "download"
      ? attachment.downloadUrl || endpoints.download(attachment.attachmentId)
      : attachment.viewUrl || endpoints.view(attachment.attachmentId);
    const response = await apiClient.get(url, { responseType: "blob" });
    const type = attachment.contentType || response.data?.type || "application/octet-stream";
    return response.data instanceof Blob && response.data.type === type ? response.data : new Blob([response.data], { type });
  },
};

export default leaveAttachmentService;
