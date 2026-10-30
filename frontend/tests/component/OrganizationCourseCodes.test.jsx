import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CoursesPage from "@/pages/courses/CoursesPage";
import toast from "react-hot-toast";
import { courseService } from "@/shared/services/courseService";

vi.mock("@/shared/services/courseService", () => ({ courseService: { getCourses: vi.fn(), getCourse: vi.fn(), updateCourse: vi.fn(), deleteCourse: vi.fn() } }));
vi.mock("react-hot-toast", () => ({ default: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/shared/services/batchService", () => ({ batchService: { getOrganizationBatches: vi.fn().mockResolvedValue({ data: [] }) } }));
vi.mock("@/api/students", () => ({ studentsApi: { list: vi.fn().mockResolvedValue({ data: [] }) } }));
vi.mock("@shared/hooks/useRouteAos", () => ({ default: () => ({ rootRef: null, aos: () => ({}), refresh: vi.fn() }) }));

const records = [
  { courseId: 1, courseName: "React", courseCode: "WEB-101", level: "Beginner", status: true },
  { courseId: 2, courseName: "Python", course_code: "PY-202", level: "Advanced", status: "Draft", totalModules: 3 },
  { courseId: 3, courseName: "No code", level: "Beginner", status: true },
  ...Array.from({ length: 9 }, (_, index) => ({ courseId: index + 4, courseName: `Course ${index + 4}`, CourseCode: `EXT-${index + 4}`, level: "Beginner", status: true })),
];
const openPage = () => render(<MemoryRouter><CoursesPage /></MemoryRouter>);
const rowFor = (name) => screen.getByRole("button", { name: `View ${name} course` }).closest("tr");
const search = (value) => fireEvent.change(screen.getByRole("textbox", { name: "Search courses" }), { target: { value } });

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  courseService.updateCourse.mockResolvedValue({});
  courseService.getCourse.mockImplementation(async (id) => ({ ...records.find((course) => course.courseId === id), duration: "3 months", price: 1500 }));
  courseService.deleteCourse.mockResolvedValue({});
  courseService.getCourses.mockResolvedValue({ data: records });
});
afterEach(cleanup);

describe("Organization course codes", () => {
  it("maps API codes into a dedicated column, handles missing codes and reloads", async () => {
    const view = openPage();
    await screen.findByRole("columnheader", { name: "Course Code" });
    expect(within(rowFor("React")).getAllByRole("cell")[3]).toHaveTextContent("WEB-101");
    expect(within(rowFor("Python")).getAllByRole("cell")[3]).toHaveTextContent("PY-202");
    expect(within(rowFor("No code")).getAllByRole("cell")[3]).toHaveTextContent("—");
    const table = screen.getByRole("table", { name: "Courses" });
    expect(table.querySelectorAll("col")).toHaveLength(within(table).getAllByRole("columnheader").length);
    view.unmount();
    openPage();
    await screen.findByText("WEB-101");
  });

  it("supports exact, partial and case-insensitive code search while retaining name/category search", async () => {
    openPage();
    await screen.findByText("WEB-101");
    for (const query of ["WEB-101", "web-", "React"]) {
      search(query);
      expect(screen.getByText("WEB-101")).toBeInTheDocument();
      expect(screen.queryByText("PY-202")).not.toBeInTheDocument();
    }
    search("Advanced");
    expect(screen.getByText("PY-202")).toBeInTheDocument();
    search("nonexistent");
    expect(screen.getByText("No courses match your current filters.")).toBeInTheDocument();
  });

  it("preserves row mapping across pagination, category/status filters and module-free tables", async () => {
    openPage();
    await screen.findByText("WEB-101");
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(within(rowFor("Course 11")).getAllByRole("cell")[3]).toHaveTextContent("EXT-11");
    search("py-202");
    expect(screen.getByText("PY-202")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear", exact: true }));
    fireEvent.change(screen.getByLabelText("Category"), { target: { value: "Advanced" } });
    expect(screen.getByText("PY-202")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "Active" } });
    expect(screen.queryByText("PY-202")).not.toBeInTheDocument();
    cleanup();
    courseService.getCourses.mockResolvedValue({ data: [records[0]] });
    openPage();
    await screen.findByText("WEB-101");
    expect(screen.queryByRole("columnheader", { name: "Modules" })).not.toBeInTheDocument();
    expect(within(rowFor("React")).getAllByRole("cell")).toHaveLength(screen.getAllByRole("columnheader").length);
  });
});


describe("Course bulk actions", () => {
  it("shows actions for selected rows, supports select/deselect all and clearing", async () => {
    openPage();
    await screen.findByText("WEB-101");
    expect(screen.queryByRole("toolbar", { name: "Course bulk actions" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Select React"));
    expect(screen.getByRole("toolbar", { name: "Course bulk actions" })).toHaveTextContent("1 selected");
    fireEvent.click(screen.getByLabelText("Select all courses on this page"));
    expect(screen.getByRole("toolbar")).toHaveTextContent("10 selected");
    fireEvent.click(screen.getByLabelText("Select all courses on this page"));
    expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Select React"));
    fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
  });
  it("sends complete course data for status updates and reloads after success", async () => {
    openPage();
    await screen.findByText("WEB-101");
    fireEvent.click(screen.getByLabelText("Select React"));
    fireEvent.click(screen.getByLabelText("Select Python"));
    fireEvent.click(screen.getByRole("button", { name: "Set Draft" }));
    await screen.findByText("WEB-101");
    expect(courseService.updateCourse).toHaveBeenCalledWith(1, expect.objectContaining({ courseName: "React", duration: "3 months", level: "Beginner", price: 1500, status: "Draft" }));
    expect(courseService.updateCourse).toHaveBeenCalledWith(2, expect.objectContaining({ courseName: "Python", status: "Draft" }));
    expect(toast.success).toHaveBeenCalledWith("2 courses updated.");
    expect(courseService.getCourses).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
  });
  it("reports partial failures accurately and retains failed courses for retry", async () => {
    courseService.updateCourse.mockResolvedValueOnce({}).mockRejectedValueOnce({ response: { status: 403 } });
    openPage();
    await screen.findByText("WEB-101");
    fireEvent.click(screen.getByLabelText("Select React"));
    fireEvent.click(screen.getByLabelText("Select Python"));
    fireEvent.click(screen.getByRole("button", { name: "Set Active" }));
    await screen.findByText("WEB-101");
    expect(toast.success).toHaveBeenCalledWith("1 course updated.");
    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("1 course could not be updated"));
    expect(screen.getByLabelText("Select React")).not.toBeChecked();
    expect(screen.getByLabelText("Select Python")).toBeChecked();
  });
  it("clears selection when changing search, filters or pages", async () => {
    openPage();
    await screen.findByText("WEB-101");
    fireEvent.click(screen.getByLabelText("Select React"));
    search("web");
    expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
    search("");
    fireEvent.click(screen.getByLabelText("Select React"));
    fireEvent.change(screen.getByLabelText("Category"), { target: { value: "Beginner" } });
    expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Select React"));
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
  });
  it("does not update a course when its detail request is unauthorized", async () => {
    courseService.getCourse.mockRejectedValueOnce({ response: { status: 403 } });
    openPage();
    await screen.findByText("WEB-101");
    fireEvent.click(screen.getByLabelText("Select React"));
    fireEvent.click(screen.getByRole("button", { name: "Set Draft" }));
    await screen.findByText("WEB-101");
    expect(courseService.updateCourse).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
    expect(screen.getByLabelText("Select React")).toBeChecked();
  });
  it("confirms existing bulk deletion and reports partial failures", async () => {
    vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValueOnce(true);
    courseService.deleteCourse.mockResolvedValueOnce({}).mockRejectedValueOnce({ response: { status: 409 } });
    openPage();
    await screen.findByText("WEB-101");
    fireEvent.click(screen.getByLabelText("Select React"));
    fireEvent.click(screen.getByLabelText("Select Python"));
    fireEvent.click(within(screen.getByRole("toolbar")).getByRole("button", { name: "Delete selected" }));
    expect(courseService.deleteCourse).not.toHaveBeenCalled();
    fireEvent.click(within(screen.getByRole("toolbar")).getByRole("button", { name: "Delete selected" }));
    await screen.findByText("PY-202");
    await vi.waitFor(() => expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("1 course could not be deleted")));
    expect(toast.success).toHaveBeenCalledWith("1 course deleted.");
    expect(screen.queryByText("WEB-101")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Select Python")).toBeChecked();
    vi.restoreAllMocks();
  });
});


