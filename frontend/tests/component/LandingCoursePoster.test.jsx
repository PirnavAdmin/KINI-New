import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getPublicCourses: vi.fn() }));
vi.mock("@landing-shared/services/courseCatalogService", () => ({
  getPublicCourses: mocks.getPublicCourses,
  courseCatalogErrorMessage: () => "error",
}));
vi.mock("@landing-shared/context/ThemeContext", () => ({ useThemeContext: () => ({ isDark: false }) }));

globalThis.IntersectionObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
};

const { default: FeaturedCourses } = await import("../../src/landing/components/home/components/FeaturedCourses");

beforeEach(() => mocks.getPublicCourses.mockReset());
afterEach(cleanup);

const course = (overrides) => ({
  courseId: 2, courseName: "Python", duration: "3 Months", level: "Advanced", price: 30000,
  organizationId: 1, organizationName: "KINI", totalAssessments: 0, ...overrides,
});

it("shows the uploaded poster on the course card and keeps name, level, duration and fee", async () => {
  mocks.getPublicCourses.mockResolvedValue({ courses: [course({ posterUrl: "/uploads/course-posters/2_abc.jpg" })], totalRecords: 1, totalPages: 1 });
  render(<MemoryRouter><FeaturedCourses /></MemoryRouter>);

  const img = await screen.findByRole("img", { name: "Python course poster" });
  expect(img.getAttribute("src")).toMatch(/\/uploads\/course-posters\/2_abc\.jpg$/);
  expect(img).toHaveClass("object-cover");
  expect(screen.getAllByText("Python").length).toBeGreaterThan(0);
  expect(screen.getByText("Advanced")).toBeInTheDocument();
  expect(screen.getByText("3 Months")).toBeInTheDocument();
  expect(screen.getByText("₹30,000")).toBeInTheDocument();
  expect(screen.getByText(/See details/)).toBeInTheDocument();
});

it("falls back to the letter tile without a poster or when the image fails", async () => {
  mocks.getPublicCourses.mockResolvedValue({
    courses: [course({ courseId: 3, courseName: "React.js", posterUrl: null }), course({ courseId: 4, courseName: "Java", posterUrl: "/uploads/course-posters/missing.jpg" })],
    totalRecords: 2, totalPages: 1,
  });
  render(<MemoryRouter><FeaturedCourses /></MemoryRouter>);

  expect(await screen.findByText("R")).toBeInTheDocument();
  fireEvent.error(screen.getByRole("img", { name: "Java course poster" }));
  expect(screen.queryByRole("img", { name: "Java course poster" })).not.toBeInTheDocument();
  expect(screen.getByText("J")).toBeInTheDocument();
});
