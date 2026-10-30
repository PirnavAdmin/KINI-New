import apiClient from "./apiClient";

export async function submitGetInTouch(payload) {
  const { data } = await apiClient.post("/api/GetInTouch", payload);
  return data;
}
