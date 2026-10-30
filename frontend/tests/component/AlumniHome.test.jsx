import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

// jsdom has no IntersectionObserver; Framer Motion's whileInView needs one.
globalThis.IntersectionObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
};

vi.mock("@shared/components/Navbar", () => ({ default: () => <nav aria-label="Main" /> }));
vi.mock("@shared/components/Footer", () => ({ default: () => <footer /> }));

const { default: AlumniHome } = await import("@features/alumni/pages/AlumniHome");

describe("Alumni page", () => {
  it("links each alumni area to its existing route", async () => {
    render(<MemoryRouter><AlumniHome /></MemoryRouter>);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/after the certificate/i);
    expect(screen.getByRole("link", { name: /open the directory/i })).toHaveAttribute("href", "/alumni/directory");
    expect(screen.getByRole("link", { name: /see events/i })).toHaveAttribute("href", "/alumni/events");
    expect(screen.getByRole("link", { name: /explore mentorship/i })).toHaveAttribute("href", "/alumni/mentorship");
    expect(screen.getByRole("link", { name: /browse jobs/i })).toHaveAttribute("href", "/alumni/jobs");
    expect(screen.getByRole("link", { name: /offer to mentor/i })).toHaveAttribute("href", "/contact");
    expect(await screen.findByRole("heading", { name: /career tools/i }, { timeout: 8000 })).toBeInTheDocument();
  });

  it("shows no unverified member counts", () => {
    const { container } = render(<MemoryRouter><AlumniHome /></MemoryRouter>);
    expect(container.textContent).not.toMatch(/\d[\d,]*\+/);
  });
});
