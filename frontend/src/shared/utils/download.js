export const triggerFileDownload = (payload, filename = "download") => {
  const blob = payload instanceof Blob ? payload : new Blob([payload ?? ""]);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Keep the URL alive until the browser has started consuming the download.
  setTimeout(() => URL.revokeObjectURL(url), 60000);
};

export const filenameFromDisposition = (response) => {
  const disposition = response?.headers?.["content-disposition"]
    || response?.headers?.get?.("content-disposition")
    || "";
  const encoded = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (encoded) {
    try { return decodeURIComponent(encoded.replace(/["']/g, "")); } catch { /* Use the plain filename below. */ }
  }
  return disposition.match(/filename=["']?([^;"']+)/i)?.[1]?.trim() || "";
};
