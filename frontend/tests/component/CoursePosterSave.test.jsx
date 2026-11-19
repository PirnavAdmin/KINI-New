import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import toast from "react-hot-toast";
import CourseForm from "../../src/pages/courses/CourseForm";
import { courseService } from "../../src/shared/services/courseService";

vi.mock("../../src/shared/services/courseService", () => ({
  courseService: {
    getCourse: vi.fn(),
    getCourses: vi.fn().mockResolvedValue({ data: [] }),
    updateCourse: vi.fn(),
    createCourse: vi.fn(),
    deleteCourse: vi.fn(),
    uploadPdf: vi.fn(),
    uploadPoster: vi.fn(),
    removePoster: vi.fn(),
    getSyllabus: vi.fn(),
    createSyllabus: vi.fn(),
    importSyllabusPdf: vi.fn(),
  },
}));
vi.mock("../../src/pages/courses/CoursesPage", () => ({ default: () => null }));
vi.mock("react-hot-toast", () => ({ default: { success: vi.fn(), error: vi.fn() } }));

const renderAt = (path) => render(
  <MemoryRouter initialEntries={[path]}>
    <Routes>
      <Route path="/organization/courses/:courseId/edit" element={<CourseForm />} />
      <Route path="/organization/courses/new" element={<CourseForm />} />
      <Route path="*" element={<p>left</p>} />
    </Routes>
  </MemoryRouter>,
);

const poster = () => new File(["png"], "python.png", { type: "image/png" });
const choosePoster = (file = poster()) => fireEvent.change(screen.getByLabelText(/Course Poster/), { target: { files: [file] } });
const fill = async () => {
  await screen.findByRole("button", { name: "Upload PDF" });
  fireEvent.change(screen.getByLabelText(/Course Name/), { target: { value: "Python" } });
  fireEvent.change(screen.getByLabelText(/Duration/), { target: { value: "3 Months" } });
  fireEvent.change(screen.getByLabelText(/^Level/), { target: { value: "Advanced" } });
  fireEvent.change(screen.getByLabelText(/Price/), { target: { value: "30000" } });
};

beforeEach(() => {
  vi.clearAllMocks();
  globalThis.URL.createObjectURL ??= () => "blob:preview";
  globalThis.URL.revokeObjectURL ??= () => {};
  courseService.getCourse.mockResolvedValue({ courseName: "Python", duration: "3 Months", level: "Advanced", price: 30000, status: true, posterUrl: "/uploads/course-posters/2_old.png" });
  courseService.updateCourse.mockResolvedValue({});
  courseService.getSyllabus.mockResolvedValue({ courseId: 2, description: "", modules: [] });
});
afterEach(cleanup);

it("creates the course first, then uploads the poster to the returned course id", async () => {
  courseService.createCourse.mockResolvedValue({ courseId: 12 });
  courseService.uploadPoster.mockResolvedValue("/uploads/course-posters/12_new.png");
  renderAt("/organization/courses/new");
  await fill();
  const file = poster();
  choosePoster(file);
  fireEvent.click(screen.getByRole("button", { name: "Create Course", exact: true }));

  await waitFor(() => expect(courseService.uploadPoster).toHaveBeenCalledWith(12, file));
  expect(courseService.createCourse.mock.invocationCallOrder[0]).toBeLessThan(courseService.uploadPoster.mock.invocationCallOrder[0]);
  await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Course created successfully."));
});

it("creates a course without a poster without calling the poster API", async () => {
  courseService.createCourse.mockResolvedValue({ courseId: 13 });
  renderAt("/organization/courses/new");
  await fill();
  fireEvent.click(screen.getByRole("button", { name: "Create Course", exact: true }));
  await waitFor(() => expect(toast.success).toHaveBeenCalled());
  expect(courseService.uploadPoster).not.toHaveBeenCalled();
  expect(courseService.removePoster).not.toHaveBeenCalled();
});

it("does not claim success when the poster upload fails, and retries without creating the course twice", async () => {
  courseService.createCourse.mockResolvedValue({ courseId: 14 });
  courseService.uploadPoster
    .mockRejectedValueOnce({ response: { status: 400, data: { message: "Only JPG, JPEG, PNG or WebP images are allowed." } } })
    .mockResolvedValueOnce("/uploads/course-posters/14_ok.png");
  renderAt("/organization/courses/new");
  await fill();
  choosePoster();
  fireEvent.click(screen.getByRole("button", { name: "Create Course", exact: true }));

  expect(await screen.findByText(/Course created, but the poster was not saved: Only JPG/)).toBeInTheDocument();
  expect(toast.success).not.toHaveBeenCalled();

  fireEvent.click(screen.getByRole("button", { name: "Create Course", exact: true }));
  await waitFor(() => expect(toast.success).toHaveBeenCalled());
  expect(courseService.createCourse).toHaveBeenCalledTimes(1);
  expect(courseService.uploadPoster).toHaveBeenCalledTimes(2);
});

it("replaces the saved poster of an existing course", async () => {
  courseService.uploadPoster.mockResolvedValue("/uploads/course-posters/2_new.png");
  renderAt("/organization/courses/2/edit");
  expect(await screen.findByText("Current course poster")).toBeInTheDocument();
  const file = poster();
  choosePoster(file);
  fireEvent.click(screen.getByRole("button", { name: "Update Course" }));
  await waitFor(() => expect(courseService.uploadPoster).toHaveBeenCalledWith("2", file));
  expect(courseService.updateCourse).toHaveBeenCalled();
  await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Course updated successfully."));
});

it("removes the saved poster through the API", async () => {
  courseService.removePoster.mockResolvedValue(true);
  renderAt("/organization/courses/2/edit");
  await screen.findByText("Current course poster");
  fireEvent.click(screen.getByRole("button", { name: "Remove" }));
  fireEvent.click(screen.getByRole("button", { name: "Update Course" }));
  await waitFor(() => expect(courseService.removePoster).toHaveBeenCalledWith("2"));
  expect(courseService.uploadPoster).not.toHaveBeenCalled();
});
