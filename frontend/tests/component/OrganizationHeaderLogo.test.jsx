import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@shared/services/apiClient", () => ({ default: { get: mocks.get }, getStoredAuthToken: () => "" }));

const { default: useOrganizationLogo, announceOrganizationLogo } = await import("../../src/shared/hooks/useOrganizationLogo");
const { AvatarPhoto } = await import("../../src/components/common/ProfileImage");

function HeaderAvatar({ enabled = true }) {
  const logo = useOrganizationLogo({ enabled });
  return <div><AvatarPhoto src={logo} fit="contain" alt="KINI logo" fallback={<span>K</span>} /></div>;
}

beforeEach(() => mocks.get.mockReset());
afterEach(cleanup);

it("shows the saved organization logo instead of the initial", async () => {
  mocks.get.mockResolvedValue({ data: { success: true, data: { organizationId: 1, logoUrl: "/uploads/organization-logos/1_abc.png" } } });
  render(<HeaderAvatar />);

  const img = await screen.findByRole("img", { name: "KINI logo" });
  expect(mocks.get).toHaveBeenCalledWith("/api/v1/organization/logo", expect.anything());
  expect(img.getAttribute("src")).toMatch(/\/uploads\/organization-logos\/1_abc\.png$/);
  expect(img).toHaveClass("object-contain");
  expect(screen.queryByText("K")).not.toBeInTheDocument();
});

it("keeps the initial when there is no logo, then updates live after upload and removal", async () => {
  mocks.get.mockResolvedValue({ data: { success: true, data: { organizationId: 1, logoUrl: null } } });
  render(<HeaderAvatar />);
  await waitFor(() => expect(mocks.get).toHaveBeenCalled());
  expect(screen.getByText("K")).toBeInTheDocument();

  act(() => announceOrganizationLogo("/uploads/organization-logos/1_new.png"));
  expect((await screen.findByRole("img", { name: "KINI logo" })).getAttribute("src")).toMatch(/1_new\.png$/);

  act(() => announceOrganizationLogo(""));
  expect(await screen.findByText("K")).toBeInTheDocument();
});

it("does not call the logo API for other roles", () => {
  render(<HeaderAvatar enabled={false} />);
  expect(mocks.get).not.toHaveBeenCalled();
  expect(screen.getByText("K")).toBeInTheDocument();
});
