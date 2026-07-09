/**
 * Sales / Transactions Service
 * API contract: /api/sales
 *
 * Backend routes to implement (Express + MongoDB):
 *   GET    /api/sales              → list all sales transactions
 *   POST   /api/sales              → create sale  { customer, items[{productId,qty,unitPrice}], total, status }
 *   GET    /api/sales/stats        → { today, week, month, trend[] }
 */

import apiClient from "@/api/axios";
import store from "@/store/dataStore";

const ONLINE = () => !!import.meta.env.VITE_API_URL && navigator.onLine;

export const salesService = {
  list: async () => {
    if (ONLINE()) {
      try { return (await apiClient.get("/sales")).data; } catch { /* offline */ }
    }
    return store.getTransactions();
  },

  create: async (payload) => {
    if (ONLINE()) {
      try { return (await apiClient.post("/sales", payload)).data; } catch { /* offline */ }
    }
    return store.addTransaction(payload);
  },

  stats: async () => {
    if (ONLINE()) {
      try { return (await apiClient.get("/sales/stats")).data; } catch { /* offline */ }
    }
    // Compute from local data
    const txns = store.getTransactions();
    const total = txns.reduce((s, t) => s + t.total, 0);
    return { today: total * 0.04, week: total * 0.25, month: total };
  },
};
