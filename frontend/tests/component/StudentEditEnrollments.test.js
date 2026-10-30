import { beforeEach, describe, expect, it, vi } from "vitest";
import { existingStudentEnrollments, saveStudentEdit } from "../../src/pages/students/studentEditEnrollments";

let profile, enrollments, api, onSave, onRefresh, initialEnrollments;
const person = { firstName: "Lahari", lastName: "Gandikota", email: "lahari@example.test", phone: "9951886175" };
const values = (additions = [], details = {}) => ({ ...person, ...details, enrollments: [...initialEnrollments, ...additions] });
const python = { courseId: "3", batchId: "30" };
const save = (data) => saveStudentEdit({ studentId: 7, initialEnrollments, values: data, api, onSave, onRefresh });
beforeEach(() => {
  profile = { studentId: 7, ...person, courseId: 2, batchId: 20 };
  enrollments = [{ courseId: "2", batchId: 20, courseName: " reACT " }];
  initialEnrollments = existingStudentEnrollments(profile, enrollments);
  api = {
    getById: vi.fn(async () => ({ data: { ...profile } })),
    getEnrollments: vi.fn(async () => ({ data: enrollments.map(row => ({ ...row })) })),
    enrollInBatch: vi.fn(async (studentId, batchId) => { enrollments.push({ courseId: Number(batchId) / 10, batchId: Number(batchId) }); }),
  };
  onSave = vi.fn(async (details) => { profile = { ...profile, ...details }; return profile; });
  onRefresh = vi.fn();
});

describe("edit student enrollment safety", () => {
  it("merges primary and additional API assignments and deduplicates their IDs", () => {
    expect(existingStudentEnrollments(profile, [...enrollments, { courseId: 3, batchId: 30 }]).map(row => [row.courseId, row.batchId])).toEqual([["2", "20"], ["3", "30"]]);
  });
  it("rejects adding an existing course regardless of its caption or ID formatting", async () => {
    await expect(save(values([{ courseId: "02", batchId: "21", courseName: "REACT" }]))).rejects.toThrow(/already enrolled/);
    expect(onSave).not.toHaveBeenCalled(); expect(api.enrollInBatch).not.toHaveBeenCalled();
  });
  it("updates personal details with the original primary IDs and never reposts enrollments", async () => {
    enrollments.push({ courseId: 3, batchId: 30 });
    initialEnrollments = existingStudentEnrollments(profile, enrollments);
    await save(values([], { firstName: "Updated" }));
    expect(onSave).toHaveBeenCalledWith({ ...person, firstName: "Updated", courseId: 2, batchId: 20 }, 7);
    expect(api.enrollInBatch).not.toHaveBeenCalled();
    expect(enrollments).toHaveLength(2);
  });
  it("adds an eligible different course without rewriting the profile", async () => {
    await save(values([python]));
    expect(api.enrollInBatch).toHaveBeenCalledExactlyOnceWith(7, "30");
    expect(onSave).not.toHaveBeenCalled(); expect(onRefresh).toHaveBeenCalledOnce();
  });
  it("does nothing on unchanged saves and never reposts a previously saved additional assignment", async () => {
    await save(values());
    expect(onSave).not.toHaveBeenCalled(); expect(api.enrollInBatch).not.toHaveBeenCalled();
    await save(values([python])); await save(values([python]));
    expect(api.enrollInBatch).toHaveBeenCalledTimes(1);
  });
  it("checks the current backend before saving and rejects a conflicting concurrent batch", async () => {
    enrollments.push({ courseId: 3, batchId: 31 });
    await expect(save(values([python], { firstName: "Changed" }))).rejects.toThrow(/another batch/);
    expect(onSave).not.toHaveBeenCalled(); expect(api.enrollInBatch).not.toHaveBeenCalled();
  });
  it("fails closed when current enrollments cannot be read", async () => {
    api.getEnrollments.mockRejectedValue(new Error("Offline"));
    await expect(save(values([python], { firstName: "Changed" }))).rejects.toThrow(/No changes were submitted/);
    expect(onSave).not.toHaveBeenCalled(); expect(api.enrollInBatch).not.toHaveBeenCalled();
  });
  it("does not silently remove or replace existing assignments", async () => {
    await expect(save({ ...person, enrollments: [python] })).rejects.toThrow(/remain unchanged/);
    expect(api.enrollInBatch).not.toHaveBeenCalled();
  });
  it("confirms a committed POST even when its HTTP response was lost", async () => {
    api.enrollInBatch.mockImplementation(async () => { enrollments.push({ courseId: 3, batchId: 30 }); throw new Error("Connection lost"); });
    await save(values([python])); await save(values([python]));
    expect(api.enrollInBatch).toHaveBeenCalledOnce();
  });
  it("does not turn an unverified 409 into a successful enrollment", async () => {
    api.enrollInBatch.mockRejectedValue({ response: { status: 409, data: { message: "Duplicate course" } } });
    await expect(save(values([python]))).rejects.toThrow(/Duplicate/);
  });
  it("rechecks before retrying a POST whose verification request failed", async () => {
    api.enrollInBatch.mockImplementation(async () => {
      enrollments.push({ courseId: 3, batchId: 30 });
      api.getEnrollments.mockRejectedValueOnce(new Error("Offline"));
    });
    await expect(save(values([python]))).rejects.toThrow(/Couldn't confirm/);
    await save(values([python]));
    expect(api.enrollInBatch).toHaveBeenCalledOnce();
  });
  it("retries only unsaved courses after a partial failure", async () => {
    api.enrollInBatch.mockImplementation(async (studentId, batchId) => {
      if (String(batchId) === "40") throw { response: { status: 500, data: {} } };
      enrollments.push({ courseId: 3, batchId: 30 });
    });
    const data = values([python, { courseId: "4", batchId: "40" }]);
    await expect(save(data)).rejects.toThrow(/Backend error/);
    api.enrollInBatch.mockImplementation(async () => { enrollments.push({ courseId: 4, batchId: 40 }); });
    await save(data);
    expect(api.enrollInBatch.mock.calls.filter(([, batchId]) => batchId === "30")).toHaveLength(1);
    expect(enrollments).toHaveLength(3);
  });
});
