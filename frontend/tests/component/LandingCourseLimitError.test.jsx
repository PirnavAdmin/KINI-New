import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getPublicCourses: vi.fn() }));
vi.mock("@landing-shared/services/courseCatalogService", () => ({
  getPublicCourses: mocks.getPublicCourses,
  courseCatalogErrorMessage: () => "Catalogue unavailable",
}));
vi.mock("@landing-shared/context/ThemeContext", () => ({ useThemeContext: () => ({ isDark: false }) }));
globalThis.IntersectionObserver ??= class { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } };

const { default: FeaturedCourses } = await import("../../src/landing/components/home/components/FeaturedCourses");

it("keeps the error state and hides View All when the catalogue fails to load", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {}); // the component logs the failure
  mocks.getPublicCourses.mockImplementation(async () => { throw { response: { status: 503 } }; });
  render(<MemoryRouter><FeaturedCourses limit={6} /></MemoryRouter>);
  expect(await screen.findByText("Catalogue unavailable")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: /View All Courses/ })).not.toBeInTheDocument();
});
