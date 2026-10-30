// Preliminary check; the authenticated API validates the complete document.
export async function validateCoursePdf(file) {
  if (!file || !/\.pdf$/i.test(file.name) || (file.type && file.type !== "application/pdf")) return "Choose a PDF file.";
  if (!file.size) return "The PDF file is empty.";
  const header = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to read this PDF."));
    reader.readAsText(file.slice(0, 5));
  });
  return header === "%PDF-" ? "" : "This file does not contain a valid PDF header.";
}
