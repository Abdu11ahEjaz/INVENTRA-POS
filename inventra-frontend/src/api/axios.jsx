import axios from "axios";
import { getUserFriendlyError } from "@/utils/errorHandler";

/**
 * Central Axios instance.
 * Set VITE_API_URL in .env to point at your Express/MongoDB backend.
 * Falls back to /api for local proxy or Electron IPC bridge.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
  timeout: 30000,  // Increased from 15s to 30s to handle slow backend responses
});

// Attach JWT token on every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("inventra_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  
  return config;
});

// Handle responses with logging
apiClient.interceptors.response.use(
  (res) => {
    return res;
  },
  (err) => {
    // Sanitize error message for frontend display
    // Replace the original message with user-friendly version
    if (err.response?.data) {
      const userFriendlyMsg = getUserFriendlyError(err);
      err.response.data.message = userFriendlyMsg;
    }

    // Handle 401 globally
    if (err.response?.status === 401) {
      localStorage.removeItem("inventra_token");
      localStorage.removeItem("inventra_user");
      window.location.href = "/signin";
    }
    
    return Promise.reject(err);
  }
);

export default apiClient;
// Named export for legacy imports
export { apiClient };
