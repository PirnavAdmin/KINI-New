import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CoursePdfAttachment from "@/pages/courses/CoursePdfAttachment";
import { courseService } from "@/shared/services/courseService";
vi.mock("@/shared/services/courseService", () => ({ courseService: { getPdf: vi.fn() } }));
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("URL", { createObjectURL: vi.fn(() => "blob:syllabus"), revokeObjectURL: vi.fn() });
  courseService.getPdf.mockResolvedValue(new Blob(["%PDF-1.4"], { type: "application/pdf" }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
describe("Stored course PDF", () => {
  it("retrieves the correct course PDF and exposes view/download links after remount", async () => {
    const view = render(<CoursePdfAttachment courseId="42" />);
    fireEvent.click(screen.getByRole("button", { name: "View / Download PDF" }));
    expect(await screen.findByRole("link", { name: "View PDF" })).toHaveAttribute("href", "blob:syllabus");
    expect(screen.getByRole("link", { name: "Download PDF" })).toHaveAttribute("download", "course-syllabus.pdf");
    expect(courseService.getPdf).toHaveBeenCalledWith("42");
    view.unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:syllabus");
    render(<CoursePdfAttachment courseId="42" />);
    fireEvent.click(screen.getByRole("button", { name: "View / Download PDF" }));
    await screen.findByRole("link", { name: "View PDF" });
    expect(courseService.getPdf).toHaveBeenCalledTimes(2);
  });
  it.each([404, 403, 500])("handles API error %s without a download link", async (status) => {
    courseService.getPdf.mockRejectedValueOnce({ response: { status } });
    render(<CoursePdfAttachment courseId="42" />);
    fireEvent.click(screen.getByRole("button", { name: "View / Download PDF" }));
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
