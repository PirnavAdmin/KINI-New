import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getPublicCourses: vi.fn() }));
vi.mock("@landing-shared/services/courseCatalogService", () => ({
  getPublicCourses: mocks.getPublicCourses,
  courseCatalogErrorMessage: () => "Catalogue unavailable",
}));
vi.mock("@landing-shared/context/ThemeContext", () => ({ useThemeContext: () => ({ isDark: false }) }));

globalThis.IntersectionObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
};

const { default: FeaturedCourses } = await import("../../src/landing/components/home/components/FeaturedCourses");

const NAMES = ["Cybersecurity", "Devops", "Java Full Stack", "ML", "MVC", "Python", "React.js", "RPA", "typescript"];
const course = (name, index) => ({ courseId: index + 1, courseName: name, duration: "3 Months", level: "Beginner", price: 1000 * (index + 1), organizationId: 1, organizationName: "KINI" });

beforeEach(() => mocks.getPublicCourses.mockClear()); // every test sets its own implementation
afterEach(cleanup);

const titles = () => screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent).filter((t, i, all) => all.indexOf(t) === i);

it("home page asks for 6 courses, shows at most 6 and a View All Courses link to /programs", async () => {
  mocks.getPublicCourses.mockImplementation(async ({ pageSize } = {}) => ({ courses: NAMES.slice(0, pageSize).map(course), totalRecords: 9, totalPages: 2 }));
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<FeaturedCourses limit={6} />} />
        <Route path="/programs" element={<p>Programs page</p>} />
      </Routes>
    </MemoryRouter>,
  );

  await screen.findAllByText("Python");
  expect(mocks.getPublicCourses).toHaveBeenCalledWith(expect.objectContaining({ page: 1, pageSize: 6 }));
  expect(titles()).toEqual(NAMES.slice(0, 6));
  expect(screen.queryByText("React.js")).not.toBeInTheDocument();

  const viewAll = screen.getByRole("link", { name: /View All Courses/ });
  expect(viewAll).toHaveAttribute("href", "/programs");
  fireEvent.click(viewAll);
  expect(await screen.findByText("Programs page")).toBeInTheDocument();
});

it("never shows more than 6 even if the server returns more", async () => {
  mocks.getPublicCourses.mockResolvedValue({ courses: NAMES.map(course), totalRecords: 9, totalPages: 1 });
  render(<MemoryRouter><FeaturedCourses limit={6} /></MemoryRouter>);
  await screen.findAllByText("Python");
  expect(titles()).toHaveLength(6);
});

it("the programs list (no limit) loads every page of public courses and has no View All link", async () => {
  mocks.getPublicCourses.mockImplementation(async ({ page } = {}) => ({
    courses: (page === 1 ? NAMES.slice(0, 5) : NAMES.slice(5)).map((name) => course(name, NAMES.indexOf(name))),
    totalRecords: 9, totalPages: 2,
  }));
  render(<MemoryRouter><FeaturedCourses eyebrow="All Programs" /></MemoryRouter>);

  await screen.findAllByText("typescript");
  expect(titles()).toEqual(NAMES);
  expect(mocks.getPublicCourses).toHaveBeenCalledTimes(2);
  expect(screen.getByText("All Programs")).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: /View All Courses/ })).not.toBeInTheDocument();
});

it("keeps search working on the programs list", async () => {
  mocks.getPublicCourses.mockImplementation(async ({ search } = {}) => {
    const rows = NAMES.filter((name) => !search || name.toLowerCase().includes(search.toLowerCase())).map(course);
    return { courses: rows, totalRecords: rows.length, totalPages: 1 };
  });
  render(<MemoryRouter><FeaturedCourses /></MemoryRouter>);
  await screen.findAllByText("typescript");
  fireEvent.change(screen.getByLabelText("Search programs"), { target: { value: "java" } });
  await waitFor(() => expect(titles()).toEqual(["Java Full Stack"]));
});
