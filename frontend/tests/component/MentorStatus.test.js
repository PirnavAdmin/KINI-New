import { beforeEach, describe, expect, it, vi } from "vitest";
import apiClient from "@shared/services/apiClient";
import { mentorService } from "@shared/services/mentorService";
vi.mock("@shared/services/apiClient", () => ({ default: { get: vi.fn(), put: vi.fn() } }));
const current = { mentorId: 27, firstName: "Test", lastName: "Mentor", email: "mentor@example.com", phone: "9876543210", courseIds: [5, 8], status: true };
beforeEach(() => {
  vi.resetAllMocks();
  apiClient.get.mockResolvedValue({ data: { data: current } });
  apiClient.put.mockResolvedValue({ data: { success: true } });
});
describe("Mentor status UpdateMentorDto", () => {
  it.each([false, true])("sends all required fields when setting active to %s", async (active) => {
    await mentorService.updateMentorStatus(27, active);
    expect(apiClient.get).toHaveBeenCalledWith("/api/v1/organization/mentors/27");
    expect(apiClient.put).toHaveBeenCalledWith("/api/v1/organization/mentors/27", {
      firstName: "Test", lastName: "Mentor", email: current.email, phone: current.phone, courseIds: [5, 8], status: active,
    });
  });
  it("keeps an unassigned mentor's empty courseIds", async () => {
    apiClient.get.mockResolvedValue({ data: { ...current, courseIds: [] } });
    await mentorService.updateMentorStatus(27, false);
    expect(apiClient.put).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ courseIds: [], status: false }));
  });
  it("maps course records and full-name aliases without dropping assignments", async () => {
    apiClient.get.mockResolvedValue({ data: { mentorName: "Test Mentor", email: current.email, mobile: current.phone, courses: [{ courseId: 5 }, { id: 8 }] } });
    await mentorService.updateMentorStatus(27, false);
    expect(apiClient.put).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ firstName: "Test", lastName: "Mentor", courseIds: [5, 8], phone: current.phone }));
  });
  it.each([
    { ...current, email: "" },
    { ...current, courseIds: undefined },
    { ...current, courseIds: [5, "unknown"] },
  ])("does not send destructive default values when details are incomplete", async (record) => {
    apiClient.get.mockResolvedValue({ data: record });
    await expect(mentorService.updateMentorStatus(27, false)).rejects.toThrow("incomplete");
    expect(apiClient.put).not.toHaveBeenCalled();
  });
  it("does not update after a failed detail request", async () => {
    apiClient.get.mockRejectedValue({ response: { status: 403 } });
    await expect(mentorService.updateMentorStatus(27, false)).rejects.toMatchObject({ response: { status: 403 } });
    expect(apiClient.put).not.toHaveBeenCalled();
  });
  it("propagates actual reassignment restrictions instead of treating them as success", async () => {
    apiClient.put.mockResolvedValue({ data: { success: false, message: "Reassign active batches first." } });
    await expect(mentorService.updateMentorStatus(27, false)).rejects.toThrow("Reassign active batches first.");
  });
});
