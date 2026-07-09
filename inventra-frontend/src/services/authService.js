import apiClient from "@/api/axios";

export const authService = {
  login: (email, password) =>
    apiClient.post("/auth/login", { email, password }).then((r) => r.data),

  register: (payload) =>
    apiClient.post("/auth/register", payload).then((r) => r.data),

  me: () =>
    apiClient.get("/auth/me").then((r) => r.data),

  logout: () => {
    localStorage.removeItem("token");
  },
};