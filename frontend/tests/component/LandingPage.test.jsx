import { configure, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

// The full suite runs many files in parallel; give async queries more room.
configure({ asyncUtilTimeout: 8000 });

// jsdom has no IntersectionObserver; Framer Motion's whileInView needs one.
globalThis.IntersectionObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
};

const getPublicCourses = vi.fn();
const addToCart = vi.fn();

vi.mock("@shared/services/courseService", () => ({
  courseService: { getPublicCourses: (...args) => getPublicCourses(...args) },
}));
vi.mock("@/context/CartContext", () => ({
  useCart: () => ({ addToCart, isInCart: () => false }),
}));

const { default: FeaturedCourses } = await import("@features/home/components/FeaturedCourses");
const { default: LandingFAQ } = await import("@features/home/components/landing/LandingFAQ");
const { default: PortalShowcase } = await import("@features/home/components/landing/PortalShowcase");

function CurrentPath() {
  return <p data-testid="path">{useLocation().pathname}</p>;
}

const renderCourses = () => render(
  <MemoryRouter initialEntries={["/"]}>
    <Routes>
      <Route path="/" element={<FeaturedCourses />} />
      <Route path="*" element={<CurrentPath />} />
    </Routes>
  </MemoryRouter>,
);

describe("Landing page — popular courses", () => {
  beforeEach(() => {
    getPublicCourses.mockReset();
    addToCart.mockReset();
    window.localStorage.clear();
  });

  it("renders live courses and hides inactive ones", async () => {
    getPublicCourses.mockResolvedValue({ data: [
      { courseId: 7, courseName: "Full Stack Java", description: "Spring and React", duration: "6 months", price: 25000 },
      { courseId: 8, courseName: "Draft course", status: "draft", price: 1000 },
    ] });
    renderCourses();

    const card = (await screen.findByRole("heading", { name: "Full Stack Java" })).closest("article");
    expect(within(card).getByText("6 months")).toBeInTheDocument();
    expect(within(card).getByText("₹25,000")).toBeInTheDocument();
    expect(screen.queryByText("Draft course")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view all courses/i })).toHaveAttribute("href", "/courses");
  });

  it("adds a course to the cart and opens its curriculum", async () => {
    getPublicCourses.mockResolvedValue({ data: [{ courseId: 7, courseName: "Full Stack Java", price: 25000 }] });
    const user = userEvent.setup();
    renderCourses();

    await user.click(await screen.findByRole("button", { name: "Add Full Stack Java to cart" }));
    expect(addToCart).toHaveBeenCalledWith(expect.objectContaining({ id: 7, name: "Full Stack Java", price: 25000 }));

    await user.click(screen.getByRole("button", { name: /view curriculum for full stack java/i }));
    expect(screen.getByTestId("path")).toHaveTextContent("/course-curriculum/full-stack-java");
    expect(JSON.parse(window.localStorage.getItem("kini:enrollment:draft")).course.id).toBe(7);
  });

  it("shows an error with a working retry", async () => {
    getPublicCourses.mockRejectedValueOnce(new Error("Network Error"))
      .mockResolvedValueOnce({ data: [{ courseId: 1, courseName: "Python Basics", price: 0 }] });
    const user = userEvent.setup();
    renderCourses();

    expect(await screen.findByText("Courses are unavailable right now")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /try again/i }));
    expect(await screen.findByRole("heading", { name: "Python Basics" })).toBeInTheDocument();
    expect(screen.getByText("Contact for fee")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /add python basics to cart/i })).not.toBeInTheDocument();
  });

  it("shows an empty state when no course is open", async () => {
    getPublicCourses.mockResolvedValue({ data: [] });
    renderCourses();
    expect(await screen.findByText("New courses are on the way")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact us" })).toHaveAttribute("href", "/contact");
  });

  it("filters by the categories the API returns", async () => {
    getPublicCourses.mockResolvedValue({ data: [
      { courseId: 1, courseName: "React Basics", category: "Frontend", price: 1000 },
      { courseId: 2, courseName: "Django APIs", category: "Backend", price: 1000 },
    ] });
    const user = userEvent.setup();
    renderCourses();

    await user.click(await screen.findByRole("button", { name: "Backend" }));
    expect(screen.getByRole("button", { name: "Backend" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByRole("heading", { name: "React Basics" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Django APIs" })).toBeInTheDocument();
  });
});

describe("Landing page — student portal tabs", () => {
  it("switches panels with arrow keys", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><PortalShowcase /></MemoryRouter>);

    const first = screen.getByRole("tab", { name: /live classes/i });
    expect(first).toHaveAttribute("aria-selected", "true");
    first.focus();
    await user.keyboard("{ArrowRight}");
    const second = screen.getByRole("tab", { name: /course materials/i });
    expect(second).toHaveAttribute("aria-selected", "true");
    expect(second).toHaveFocus();
    expect(screen.getByRole("tabpanel")).toHaveAccessibleName(/course materials/i);
  });
});

describe("Landing page — FAQ", () => {
  it("toggles answers with the keyboard and exposes state", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><LandingFAQ /></MemoryRouter>);

    const first = screen.getByRole("button", { name: "How do I enrol in a course?" });
    const second = screen.getByRole("button", { name: "Where can I see the course fee?" });
    expect(first).toHaveAttribute("aria-expanded", "true");
    expect(second).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById(second.getAttribute("aria-controls"))).not.toBeVisible();

    second.focus();
    await user.keyboard("{Enter}");
    expect(second).toHaveAttribute("aria-expanded", "true");
    expect(first).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("region", { name: "Where can I see the course fee?" })).toBeVisible();
  });

  it("shows questions for the selected topic", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><LandingFAQ /></MemoryRouter>);

    await user.click(screen.getByRole("tab", { name: "Classes & learning" }));
    expect(screen.getByRole("button", { name: "Are the classes live or recorded?" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.queryByRole("button", { name: "How do I enrol in a course?" })).not.toBeInTheDocument();
  });
});
