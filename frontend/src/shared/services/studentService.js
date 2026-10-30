import apiClient from "./apiClient";

export const getStudents = () => apiClient.get("/api/Student");

export const getStudentById = (id) =>
  apiClient.get(`/api/Student/${id}`);

export const createStudent = (data) =>
  apiClient.post("/api/Student", data);

export const updateStudent = (id, data) =>
  apiClient.put(`/api/Student/${id}`, data);

export const deleteStudent = (id) =>
  apiClient.delete(`/api/Student/${id}`);

export default {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
