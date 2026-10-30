import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import BatchForm from "@/pages/batches/BatchForm";
import { batchService } from "@shared/services/batchService";

vi.mock("@shared/services/batchService", () => ({ batchService: {
  getAvailableStudents: vi.fn(), assignStudents: vi.fn(),
} }));
afterEach(cleanup);
const batch = { id: "3", name: "Full Stack Evening", code: "FS-3", course: "Full Stack Web Development", trainer: "Test Mentor", startDate: "2026-10-01", endDate: "2026-12-01", capacity: 10 };
it("centers Edit Batch through a portal and preserves existing values", () => {
  const close = vi.fn();
  render(<div data-testid="transformed-parent" style={{ transform: "translateX(20px)" }}><BatchForm open batch={batch} onClose={close} onSave={vi.fn()} /></div>);
  const dialog = screen.getByRole("dialog", { name: "Edit batch" });
  expect(dialog.closest('[data-testid="transformed-parent"]')).toBeNull();
  expect(screen.getByDisplayValue(batch.name)).toBeInTheDocument();
  expect(screen.getByLabelText(/Course/)).toHaveValue(batch.course);
  fireEvent.keyDown(document, { key: "Escape" });
  expect(close).toHaveBeenCalledOnce();
});
it("keeps the footer usable, waits for saving and sends the correct batch ID", async () => {
  const close = vi.fn(); let finish;
  const save = vi.fn(() => new Promise((resolve) => { finish = resolve; }));
  render(<BatchForm open batch={batch} onClose={close} onSave={save} />);
  fireEvent.change(screen.getByLabelText(/Batch name/), { target: { value: "Updated batch" } });
  fireEvent.click(screen.getByRole("button", { name: "Save batch" }));
  expect(save).toHaveBeenCalledWith(expect.objectContaining({ name: "Updated batch" }), "3");
  expect(close).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();
  finish();
  await waitFor(() => expect(close).toHaveBeenCalledOnce());
});
it("keeps the edit form open with an error when saving fails", async () => {
  const close = vi.fn();
  render(<BatchForm open batch={batch} onClose={close} onSave={vi.fn().mockRejectedValue(new Error("Save unavailable"))} />);
  fireEvent.click(screen.getByRole("button", { name: "Save batch" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Save unavailable");
  expect(close).not.toHaveBeenCalled();
});

it("rejects course changes on an existing batch and saves only after restoring its course", async () => {
  const save = vi.fn();
  const close = vi.fn();
  render(<BatchForm open batch={batch} onClose={close} onSave={save} />);
  fireEvent.change(screen.getByLabelText(/Course/), { target: { value: "Data Science" } });
  expect(screen.getByText(/The course cannot be changed/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Save batch" }));
  expect(save).not.toHaveBeenCalled();
  expect(close).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText(/Course/), { target: { value: batch.course } });
  expect(screen.queryByText(/The course cannot be changed/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Save batch" }));
  await waitFor(() => expect(close).toHaveBeenCalledOnce());
  expect(save).toHaveBeenCalledWith(expect.objectContaining({ course: batch.course }), batch.id);
});

it("enrolls selected students in the batch being edited and refreshes the roster", async () => {
  batchService.getAvailableStudents.mockResolvedValue([{ studentId: 42, name: "Test Student", email: "student@example.com" }]);
  batchService.assignStudents.mockResolvedValue({ success: true });
  const refresh = vi.fn();
  render(<BatchForm open batch={{ ...batch, students: 2 }} onClose={vi.fn()} onSave={vi.fn()} onEnrollmentChanged={refresh} />);
  fireEvent.click(screen.getByRole("button", { name: "5. Enrollment" }));
  fireEvent.click(screen.getByRole("button", { name: "Add Students" }));
  fireEvent.click(await screen.findByRole("checkbox", { name: /Test Student/ }));
  fireEvent.click(screen.getByRole("button", { name: "Add selected (1)" }));
  await waitFor(() => expect(refresh).toHaveBeenCalledOnce());
  expect(batchService.getAvailableStudents).toHaveBeenCalledWith("3");
  expect(batchService.assignStudents).toHaveBeenCalledWith({ batchId: "3", studentId: "42" });
  expect(screen.getByText(/3\/10 enrolled/)).toBeInTheDocument();
});

it("shows enrollment failures without increasing the student count", async () => {
  batchService.getAvailableStudents.mockResolvedValue([{ studentId: 43, name: "Another Student" }]);
  batchService.assignStudents.mockRejectedValue(new Error("Enrollment denied"));
  render(<BatchForm open batch={{ ...batch, students: 2 }} onClose={vi.fn()} onSave={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: "5. Enrollment" }));
  fireEvent.click(screen.getByRole("button", { name: "Add Students" }));
  fireEvent.click(await screen.findByRole("checkbox", { name: /Another Student/ }));
  fireEvent.click(screen.getByRole("button", { name: "Add selected (1)" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Enrollment denied");
  expect(screen.getByText(/2\/10 enrolled/)).toBeInTheDocument();
});
