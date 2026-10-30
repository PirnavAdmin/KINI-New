// Shared error-to-message mapping for the Chat attachment endpoints (upload,
// view, download, delete) so Mentor Chat and Student Chat show the same
// wording instead of duplicating this switch in both pages. Plain
// conversation/message send errors keep their existing, simpler messages —
// this is only used for the new attachment actions.
//
// 401 is intentionally not special-cased beyond a friendly fallback message:
// apiClient's own response interceptor already clears the session and
// redirects to login on a real 401 for a non-public route (which every chat
// route is), so this never needs to duplicate that flow — it only covers the
// rare case where this catch runs before that redirect does.
export const chatErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  const status = error?.response?.status;
  const backendMessage = error?.response?.data?.message || error?.response?.data?.Message;

  if (!status) {
    if (!error?.request && error?.message) return error.message;
    return "Network error. Please check your connection and try again.";
  }
  switch (status) {
    case 400:
      return backendMessage || "That request wasn't valid. Please check and try again.";
    case 401:
      return "Your session has expired. Please sign in again.";
    case 403:
      return backendMessage || "You don't have permission to do that.";
    case 404:
      return backendMessage || "That conversation or attachment could not be found.";
    case 409:
      return backendMessage || "This couldn't be completed due to a conflict. Please refresh and try again.";
    case 413:
      return "That file is too large to upload.";
    case 415:
      return "That file type isn't supported.";
    default:
      if (status >= 500) return "The server ran into a problem. Please try again shortly.";
      return backendMessage || fallback;
  }
};

export default chatErrorMessage;
